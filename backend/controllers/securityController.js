import prisma from '../services/prisma.js';
import { getIO } from '../socket/socketHandler.js';
import { SOCKET_ROOMS } from '../socket/rooms.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import { verifyQRPassToken } from '../security/qrToken.js';

export async function markExit(req, res) {
  try {
    const { leaveId, qrToken } = req.body;
    if (!leaveId && !qrToken) {
      return res.status(400).json({ error: 'Validation Error', message: 'Leave ID or signed QR Token is required.' });
    }

    let targetLeaveId = leaveId;

    if (targetLeaveId && typeof targetLeaveId === 'string' && targetLeaveId.includes('{')) {
      try {
        const parsed = JSON.parse(targetLeaveId);
        if (parsed.leaveId) targetLeaveId = parsed.leaveId;
      } catch (e) {}
    }

    if (qrToken && typeof qrToken === 'string' && qrToken.includes('{')) {
      try {
        const parsed = JSON.parse(qrToken);
        if (parsed.leaveId) targetLeaveId = parsed.leaveId;
      } catch (e) {
        const qrVerification = verifyQRPassToken(qrToken);
        if (!qrVerification.valid) {
          return res.status(400).json({ error: 'QR Token Error', message: qrVerification.message });
        }
        targetLeaveId = qrVerification.leaveId;
      }
    }

    const leave = await prisma.leaveRequest.findFirst({
      where: {
        OR: [
          ...(targetLeaveId ? [{ leaveId: targetLeaveId }] : []),
          ...(qrToken ? [{ qrToken }] : [])
        ]
      },
      include: { gateLog: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Not Found', message: 'Invalid or unrecognized Gate Pass/QR Code.' });
    }

    if (leave.status !== 'READY_FOR_GATE') {
      if (leave.status === 'STUDENT_OUT') {
        return res.status(400).json({ error: 'Duplicate Exit Prevention', message: 'Exit has ALREADY been marked for this student pass.' });
      }
      if (leave.status === 'RETURNED') {
        return res.status(400).json({ error: 'Expired Pass', message: 'This pass has already been used and returned.' });
      }
      return res.status(400).json({ error: 'Invalid Status', message: `Cannot mark exit. Current leave status is: ${leave.status}` });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId: leave.leaveId },
        data: {
          status: 'STUDENT_OUT',
          history: {
            create: {
              actedByRole: 'MAIN_GATE',
              actedByName: req.user.name || 'Main Gate Security',
              actedById: req.user.id,
              action: 'EXITED',
              remarks: `Exit verified at main gate at ${now.toLocaleTimeString()}.`
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const gateLog = await tx.gateLog.upsert({
        where: { leaveId: leave.leaveId },
        update: {
          actionType: 'EXIT',
          scannedBy: req.user.name || 'Gate Officer',
          exitTime: now
        },
        create: {
          leaveId: leave.leaveId,
          studentName: leave.studentName,
          registerNo: leave.registerNo,
          actionType: 'EXIT',
          scannedBy: req.user.name || 'Gate Officer',
          exitTime: now
        }
      });

      const notif = await tx.notification.create({
        data: {
          targetRole: 'PRINCIPAL',
          title: 'Student Exited Main Gate',
          message: `${leave.studentName} (${leave.registerNo}) scanned out at PEC Main Gate.`
        }
      });

      return { updated: { ...updated, gateLog }, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.STUDENT_EXITED, payload);
      io.to(SOCKET_ROOMS.SECURITY).emit(SOCKET_EVENTS.STUDENT_EXITED, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(SOCKET_EVENTS.STUDENT_EXITED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket emit error:', e.message);
    }

    res.json({
      message: `Exit verified successfully for ${leave.studentName}.`,
      leave: result.updated
    });

  } catch (error) {
    console.error('Mark Exit Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Internal error processing gate exit.' });
  }
}

export async function markReturn(req, res) {
  try {
    const { leaveId, qrToken } = req.body;
    if (!leaveId && !qrToken) {
      return res.status(400).json({ error: 'Validation Error', message: 'Leave ID or QR Token is required.' });
    }

    let targetLeaveId = leaveId;

    if (targetLeaveId && typeof targetLeaveId === 'string' && targetLeaveId.includes('{')) {
      try {
        const parsed = JSON.parse(targetLeaveId);
        if (parsed.leaveId) targetLeaveId = parsed.leaveId;
      } catch (e) {}
    }

    if (qrToken && typeof qrToken === 'string' && qrToken.includes('{')) {
      try {
        const parsed = JSON.parse(qrToken);
        if (parsed.leaveId) targetLeaveId = parsed.leaveId;
      } catch (e) {
        const qrVerification = verifyQRPassToken(qrToken);
        if (qrVerification.valid) {
          targetLeaveId = qrVerification.leaveId;
        }
      }
    }

    const leave = await prisma.leaveRequest.findFirst({
      where: {
        OR: [
          ...(targetLeaveId ? [{ leaveId: targetLeaveId }] : []),
          ...(qrToken ? [{ qrToken }] : [])
        ]
      },
      include: { gateLog: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Not Found', message: 'Invalid or unrecognized Gate Pass/QR Code.' });
    }

    if (leave.status !== 'STUDENT_OUT') {
      if (leave.status === 'RETURNED') {
        return res.status(400).json({ error: 'Duplicate Entry', message: 'Return has ALREADY been marked for this student.' });
      }
      return res.status(400).json({ error: 'Invalid Status', message: 'Student must be marked OUT before marking return.' });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId: leave.leaveId },
        data: {
          status: 'RETURNED',
          history: {
            create: {
              actedByRole: 'MAIN_GATE',
              actedByName: req.user.name || 'Main Gate Security',
              actedById: req.user.id,
              action: 'RETURNED',
              remarks: `Return entry verified at main gate at ${now.toLocaleTimeString()}.`
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const gateLog = await tx.gateLog.update({
        where: { leaveId: leave.leaveId },
        data: {
          actionType: 'ENTRY',
          returnTime: now
        }
      });

      const notif = await tx.notification.create({
        data: {
          targetRole: 'PRINCIPAL',
          title: 'Student Returned to Campus',
          message: `${leave.studentName} (${leave.registerNo}) safely returned to campus main gate.`
        }
      });

      return { updated: { ...updated, gateLog }, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.STUDENT_RETURNED, payload);
      io.to(SOCKET_ROOMS.SECURITY).emit(SOCKET_EVENTS.STUDENT_RETURNED, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(SOCKET_EVENTS.STUDENT_RETURNED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket emit error:', e.message);
    }

    res.json({
      message: `Return verified successfully for ${leave.studentName}.`,
      leave: result.updated
    });

  } catch (error) {
    console.error('Mark Return Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Internal error processing gate return.' });
  }
}

