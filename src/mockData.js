export const PEC_LOGO_URL = "/logo.jpg";

export const CAMPUS_IMAGE_URL = "/bg.jpg";

export const DEPARTMENTS = [
  { code: "CSE (CYBER SECURITY)", name: "CSE - Cyber Security" },
  { code: "CSE (AIML)", name: "CSE - Artificial Intelligence & Machine Learning" },
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "AIDS", name: "Artificial Intelligence & Data Science" },
  { code: "IT", name: "Information Technology" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "EEE", name: "Electrical & Electronics Engineering" },
  { code: "CSBS", name: "Computer Science & Business Systems" },
  { code: "MECHANICAL", name: "Mechanical Engineering" }
];

export const INITIAL_LEAVES = [
  {
    leaveId: "PEC-CSE-CYBER-482915",
    studentId: "STU-001",
    studentName: "Jesin Milesh",
    registerNo: "111424149024",
    department: "CSE (CYBER SECURITY)",
    year: "3rd Year",
    section: "A",
    mentorName: "Kalaimani",
    mentorId: "MEN-101",
    hodName: "Anithalakshmi",
    wardenName: "Ravi",
    hostelBlock: "Block A - Boys Hostel",
    roomNo: "AG2",
    parentPhone: "+91 98765 43210",
    parentConsent: true,
    leaveType: "Medical Leave",
    subject: "Permission for Doctor Consultation & Medical Rest",
    reason: "Diagnosed with severe viral fever. Doctor advised 2 days complete rest at home.",
    letterBody: "Respected Sir/Madam,\n\nI am writing to formally request permission to leave campus for medical treatment.\n\nReason: Diagnosed with severe viral fever. Doctor advised 2 days complete rest at home.\n\nThanking you,\nYours obediently,\nJesin Milesh",
    fromDate: "2026-08-18",
    toDate: "2026-08-20",
    outDate: "2026-08-18",
    outTime: "09:00 AM",
    returnDate: "2026-08-20",
    returnTime: "06:00 PM",
    status: "Pending Mentor",
    createdAt: "2026-08-18 08:30 AM",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    approvalHistory: [
      { role: "Student", approver: "Jesin Milesh", action: "Submitted Request", comment: "Submitted with parent consent.", timestamp: "2026-08-18 08:30 AM" }
    ],
    gateLogs: { exitTime: null, returnTime: null, securityName: null }
  }
];

export const USERS = [
  { id: "STU-001", name: "Jesin Milesh", role: "Student", department: "CSE (CYBER SECURITY)", email: "jesinmilesh@gmail.com", registerNo: "111424149024", year: "3rd Year", section: "A", roomNo: "AG2", photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
  { id: "MEN-101", name: "Kalaimani", role: "Mentor", department: "CSE (CYBER SECURITY)", email: "mentor.cybersec@prathyusha.edu.in" },
  { id: "HOD-201", name: "Anithalakshmi", role: "HOD", department: "CSE (CYBER SECURITY)", email: "hod.cybersec@prathyusha.edu.in" },
  { id: "WAR-301", name: "Ravi", role: "Warden", department: "Hostel Administration", email: "warden@prathyusha.edu.in", block: "Block A & C (Boys)" },
  { id: "SEC-401", name: "Main Gate Security", role: "Main Gate", department: "Main Gate Security", email: "gate@prathyusha.edu.in" },
  { id: "PRI-501", name: "Principal", role: "Principal", department: "Executive Administration", email: "principal@prathyusha.edu.in" },
  { id: "ADM-901", name: "System Administrator", role: "Admin", department: "IT Services", email: "admin@prathyusha.edu.in" }
];

export function autoDetectUser(identifier) {
  if (!identifier) return USERS[0];
  const query = identifier.toLowerCase().trim();

  // Try exact email match
  const byEmail = USERS.find(u => u.email.toLowerCase() === query);
  if (byEmail) return byEmail;

  // Try register number match
  const byReg = USERS.find(u => u.registerNo && u.registerNo === query);
  if (byReg) return byReg;

  // Role keyword detection in input
  if (query.includes('mentor') || query.includes('kalai')) return USERS.find(u => u.role === 'Mentor');
  if (query.includes('hod') || query.includes('anitha')) return USERS.find(u => u.role === 'HOD');
  if (query.includes('warden') || query.includes('ravi')) return USERS.find(u => u.role === 'Warden');
  if (query.includes('security') || query.includes('gate') || query.includes('main_gate')) return USERS.find(u => u.role === 'Main Gate');
  if (query.includes('principal')) return USERS.find(u => u.role === 'Principal');
  if (query.includes('admin') || query.includes('sys')) return USERS.find(u => u.role === 'Admin');

  // Default clean student profile
  return {
    id: `STU-${Math.floor(100 + Math.random() * 900)}`,
    name: query.split('@')[0] || "Student User",
    role: "Student",
    department: "CSE (CYBER SECURITY)",
    email: query.includes('@') ? query : `${query}@gmail.com`,
    registerNo: query.match(/^\d+$/) ? query : "111424149024",
    year: "3rd Year",
    section: "A"
  };
}

export function generateLeaveId(departmentName, existingLeaves = []) {
  let deptCode = 'CSE';
  const upperDept = (departmentName || '').toUpperCase();

  if (upperDept.includes('CYBER')) deptCode = 'CSE-CYBER';
  else if (upperDept.includes('AIML') || upperDept.includes('MACHINE')) deptCode = 'CSE-AIML';
  else if (upperDept.includes('BUSINESS') || upperDept.includes('CSBS')) deptCode = 'CSBS';
  else if (upperDept.includes('DATA SCIENCE') || upperDept.includes('AIDS')) deptCode = 'AIDS';
  else if (upperDept.includes('INFORMATION') || upperDept.includes('IT')) deptCode = 'IT';
  else if (upperDept.includes('COMMUNICATION') || upperDept.includes('ECE')) deptCode = 'ECE';
  else if (upperDept.includes('ELECTRICAL') || upperDept.includes('EEE')) deptCode = 'EEE';
  else if (upperDept.includes('MECHANICAL')) deptCode = 'MECHANICAL';
  else if (upperDept.includes('COMPUTER') || upperDept.includes('CSE')) deptCode = 'CSE';

  const existingIds = new Set(existingLeaves.map(l => l?.leaveId));
  let uniqueId = '';
  let attempts = 0;

  do {
    const random6Digits = Math.floor(100000 + Math.random() * 900000);
    uniqueId = `PEC-${deptCode}-${random6Digits}`;
    attempts++;
  } while (existingIds.has(uniqueId) && attempts < 50);

  return uniqueId;
}
