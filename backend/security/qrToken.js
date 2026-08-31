import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET || 'pec-qr-gate-pass-signature-key-2026';

export function generateQRPassToken(leaveId, studentId, toDate, returnTime) {
  const payload = {
    leaveId,
    studentId,
    purpose: 'PEC_GATE_EXIT_PASS',
    issuedAt: Date.now()
  };

  const signedToken = jwt.sign(payload, QR_SECRET, { expiresIn: '48h' });

  return JSON.stringify({
    leaveId,
    token: signedToken,
    signature: crypto.createHmac('sha256', QR_SECRET).update(leaveId).digest('hex').substring(0, 16)
  });
}

export function verifyQRPassToken(qrDataString) {
  try {
    let parsed = typeof qrDataString === 'string' ? JSON.parse(qrDataString) : qrDataString;
    const { leaveId, token } = parsed;

    if (!leaveId || !token) {
      return { valid: false, message: 'Invalid QR pass format' };
    }

    const decoded = jwt.verify(token, QR_SECRET);
    if (decoded.leaveId !== leaveId) {
      return { valid: false, message: 'QR Token mismatch for Leave ID' };
    }

    return { valid: true, leaveId: decoded.leaveId, decoded };
  } catch (error) {
    return { valid: false, message: 'Expired or tampered QR Pass Token' };
  }
}
