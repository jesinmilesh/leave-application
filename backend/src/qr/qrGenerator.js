// QR Code Generator Service for Gate Passes
const QRCode = require('qrcode');

async function generateGatePassQR(leaveData) {
  try {
    const payload = JSON.stringify({
      leaveId: leaveData.leaveId,
      studentName: leaveData.studentName,
      registerNo: leaveData.registerNo,
      department: leaveData.department,
      validFrom: leaveData.fromDate,
      validTo: leaveData.toDate,
      issuedAt: new Date().toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(payload);
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

module.exports = { generateGatePassQR };
