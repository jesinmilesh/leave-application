import { hashPassword, comparePassword, validatePasswordStrength } from '../security/bcrypt.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../security/jwt.js';
import { generateQRPassToken, verifyQRPassToken } from '../security/qrToken.js';
import { sanitizeInput, containsSqlInjection } from '../security/sanitizer.js';
import { isAuthorizedRoom } from '../security/socketAuth.js';

async function runSecuritySuite() {
  console.log('============== 🛡️ PEC DLPMS PRODUCTION SECURITY TEST SUITE ==============\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
    }
  }

  // 1. Password Security & Bcrypt 12 Rounds
  console.log('1. Password Hashing & Strength Validation:');
  const weakCheck = validatePasswordStrength('weak');
  assert(!weakCheck.valid, 'Rejects weak password ("weak")');

  const strongCheck = validatePasswordStrength('Pec@2026Leave!');
  assert(strongCheck.valid, 'Validates strong OWASP password ("Pec@2026Leave!")');

  const hashed = await hashPassword('Pec@2026Leave!');
  assert(hashed.startsWith('$2b$12$') || hashed.startsWith('$2a$12$'), 'Hashes with 12 bcrypt salt rounds');
  
  const match = await comparePassword('Pec@2026Leave!', hashed);
  assert(match, 'Verifies valid bcrypt hashed password');

  const wrongMatch = await comparePassword('WrongPassword123!', hashed);
  assert(!wrongMatch, 'Rejects incorrect password');

  // 2. JWT Access (15m) & Refresh (7d) Tokens
  console.log('\n2. JWT Authentication & Short-Lived Tokens:');
  const mockUser = { id: 'STU-101', role: 'Student', department: 'CSE', email: 'rahul@prathyusha.edu.in' };
  const accessToken = generateAccessToken(mockUser);
  const refreshToken = generateRefreshToken(mockUser);

  const decodedAccess = verifyAccessToken(accessToken);
  assert(decodedAccess && decodedAccess.id === 'STU-101', 'Decodes valid 15-minute Access Token');
  assert(!decodedAccess.password, 'Ensures no sensitive passwords exist inside JWT payload');

  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert(decodedRefresh && decodedRefresh.id === 'STU-101', 'Decodes valid 7-day Refresh Token');

  // 3. XSS & SQL Injection Protection
  console.log('\n3. Input Sanitization & XSS / SQLi Defense:');
  const xssPayload = '<script>alert("xss")</script>';
  const sanitizedXss = sanitizeInput(xssPayload);
  assert(sanitizedXss === '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;', 'Escapes XSS script tags into safe HTML entities');

  const sqliPayload = "1' OR '1'='1";
  assert(containsSqlInjection(sqliPayload), 'Detects SQL Injection vector ("1\' OR \'1\'=\'1")');

  // 4. Signed Gate Pass QR Token Security
  console.log('\n4. Tamper-Proof QR Gate Pass Token:');
  const qrPass = generateQRPassToken('PEC-CSE-998811', 'STU-101', '2026-08-16', '06:00 PM');
  const qrVerify = verifyQRPassToken(qrPass);
  assert(qrVerify.valid && qrVerify.leaveId === 'PEC-CSE-998811', 'Verifies authentic signed QR pass token');

  const tamperedQr = qrPass.replace('PEC-CSE-998811', 'PEC-CSE-000000');
  const tamperedVerify = verifyQRPassToken(tamperedQr);
  assert(!tamperedVerify.valid, 'Rejects tampered QR pass payload');

  // 5. WebSocket Room Authorization
  console.log('\n5. WebSocket Authorized Room Isolation:');
  const studentSocketUser = { id: 'STU-101', role: 'Student', department: 'CSE' };
  const allowedStudentRoom = isAuthorizedRoom(studentSocketUser, 'student-STU-101');
  const blockedMentorRoom = isAuthorizedRoom(studentSocketUser, 'mentor-MEN-202');
  assert(allowedStudentRoom, 'Allows student to subscribe to own room ("student-STU-101")');
  assert(!blockedMentorRoom, 'Blocks unauthorized room subscription ("mentor-MEN-202") for student');

  console.log(`\n================ SUMMARY: ${passed}/${total} Security Checks Passed ================`);
  process.exit(passed === total ? 0 : 1);
}

runSecuritySuite();
