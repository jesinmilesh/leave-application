import prisma from '../services/prisma.js';
import { getIO } from '../socket/socketHandler.js';
import { SOCKET_ROOMS } from '../socket/rooms.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import { generateQRPassToken } from '../security/qrToken.js';

async function generateLeaveId(deptName) {
  // Extract or normalize department code (e.g., 'CSE (Cyber Security)' -> 'CSE-CYBER')
  let deptCode = 'CSE';
  const upperDept = (deptName || '').toUpperCase();

  if (upperDept.includes('CYBER')) deptCode = 'CSE-CYBER';
  else if (upperDept.includes('AIML') || upperDept.includes('MACHINE')) deptCode = 'CSE-AIML';
  else if (upperDept.includes('BUSINESS') || upperDept.includes('CSBS')) deptCode = 'CSBS';
  else if (upperDept.includes('DATA SCIENCE') || upperDept.includes('AIDS')) deptCode = 'AIDS';
  else if (upperDept.includes('INFORMATION') || upperDept.includes('IT')) deptCode = 'IT';
  else if (upperDept.includes('COMMUNICATION') || upperDept.includes('ECE')) deptCode = 'ECE';
  else if (upperDept.includes('ELECTRICAL') || upperDept.includes('EEE')) deptCode = 'EEE';
  else if (upperDept.includes('MECHANICAL')) deptCode = 'MECHANICAL';
  else if (upperDept.includes('COMPUTER') || upperDept.includes('CSE')) deptCode = 'CSE';

  let uniqueId = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 50) {
    const random = Math.floor(100000 + Math.random() * 900000);
    uniqueId = `PEC-${deptCode}-${random}`;
    const existing = await prisma.leaveRequest.findUnique({
      where: { leaveId: uniqueId },
      select: { leaveId: true }
    });
    if (!existing) {
      exists = false;
    }
    attempts++;
  }

  return uniqueId;
}

export async function createLeaveRequest(req, res) {
  try {
    const { subject, reason, leaveType, fromDate, toDate, outTime, returnTime, parentPhone, hostelBlock, roomNo } = req.body;

    if (!subject || !reason || !fromDate || !toDate) {
      return res.status(400).json({ error: 'Validation Error', message: 'Subject, reason, from date, and to date are required.' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(req.user?.id ? [{ id: req.user.id }] : []),
          ...(req.user?.email ? [{ email: req.user.email }] : [])
        ]
      },
      include: { student: true }
    });

    let studentProfile = user?.student;

    if (!studentProfile) {
      const studentName = req.body.studentName || req.user?.name || 'Jesin Milesh';
      const regNo = req.body.registerNo || '111424149024';
      const dept = req.body.department || req.user?.department || 'CSE (Cyber Security)';

      let targetUserId = user?.id;
      if (!targetUserId) {
        const newUser = await prisma.user.create({
          data: {
            email: req.user?.email || `student_${Date.now()}@pec.edu`,
            passwordHash: 'demo_hash_2026',
            role: 'STUDENT',
            isFirstLogin: false
          }
        });
        targetUserId = newUser.id;
      }

      studentProfile = await prisma.student.create({
        data: {
          userId: targetUserId,
          fullName: studentName,
          registerNumber: regNo,
          department: dept,
          year: req.body.year || '3rd Year',
          section: req.body.section || 'A',
          hostelBlock: hostelBlock || 'Boys Hostel - Block A',
          roomNo: roomNo || 'AG2'
        }
      });
    }

    const dept = studentProfile.department || req.body.department || 'CSE (Cyber Security)';
    const year = studentProfile.year || req.body.year || '3rd Year';
    const section = studentProfile.section || req.body.section || 'A';
    const regNo = studentProfile.registerNumber || req.body.registerNo || '111424149024';
    const studentName = studentProfile.fullName || req.body.studentName || 'Jesin Milesh';

    let mentorId = studentProfile.mentorId;
    let mentorName = req.body.mentorName || 'Prof. Kalaimani';

    if (mentorId) {
      const mObj = await prisma.mentor.findUnique({ where: { id: mentorId } });
      if (mObj) mentorName = mObj.fullName;
    } else {
      const defaultMentor = await prisma.mentor.findFirst({
        where: { department: { contains: 'CSE' } }
      });
      if (defaultMentor) {
        mentorId = defaultMentor.id;
        mentorName = defaultMentor.fullName;
      }
    }

    const hodObj = await prisma.hOD.findFirst({
      where: { department: { contains: 'CSE' } }
    });
    const hodName = hodObj ? hodObj.fullName : 'Dr. Anthilakshmi';

    const newLeaveId = await generateLeaveId(dept);

    const newLeave = await prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.create({
        data: {
          leaveId: newLeaveId,
          studentId: studentProfile.id,
          studentName,
          registerNo: regNo,
          department: dept,
          year,
          section,
          mentorId,
          mentorName,
          hodName,
          wardenName: 'Hostel Warden',
          leaveType: leaveType || 'Medical Leave',
          subject,
          reason,
          fromDate,
          toDate,
          outDate: fromDate,
          outTime: outTime || '09:00 AM',
          returnDate: toDate,
          returnTime: returnTime || '06:00 PM',
          parentPhone: parentPhone || '+91 98765 43210',
          parentConsent: true,
          hostelBlock: hostelBlock || studentProfile.hostelBlock || 'Boys Hostel - Block A',
          roomNo: roomNo || studentProfile.roomNo || 'AG2',
          status: 'PENDING_MENTOR',
          history: {
            create: {
              actedByRole: 'STUDENT',
              actedByName: studentName,
              actedById: req.user?.id || 'demo-user',
              action: 'SUBMITTED',
              remarks: 'Leave request submitted via student portal.'
            }
          }
        },
        include: {
          history: true,
          gateLog: true
        }
      });

      const notification = await tx.notification.create({
        data: {
          targetRole: 'MENTOR',
          title: 'New Leave Request Received',
          message: `${studentName} (${regNo}) submitted leave request ${newLeaveId}.`
        }
      });

      return { leave, notification };
    });

    try {
      const io = getIO();
      const payload = newLeave.leave;

      io.emit(SOCKET_EVENTS.LEAVE_CREATED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, newLeave.notification);
    } catch (sErr) {
      console.warn('Socket Broadcast Warning:', sErr.message);
    }

    return res.status(201).json({
      message: 'Leave request submitted successfully.',
      leave: newLeave.leave
    });

  } catch (error) {
    console.error('Create Leave Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Internal error submitting leave request.' });
  }
}

export async function getLeaves(req, res) {
  try {
    const { role, id } = req.user || {};
    let whereClause = {};

    const normRole = (role || '').toUpperCase();

    if (normRole === 'STUDENT') {
      const studentObj = await prisma.student.findFirst({
        where: {
          OR: [
            { userId: id },
            ...(req.user?.email ? [{ user: { email: req.user.email } }] : [])
          ]
        }
      });
      if (studentObj) {
        whereClause = {
          OR: [
            { studentId: studentObj.id },
            { registerNo: studentObj.registerNumber },
            { studentName: { contains: studentObj.fullName || '' } }
          ]
        };
      }
    } else if (normRole === 'MENTOR') {
      // Mentors see ONLY their assigned leave requests (filtered by mentorId in DB)
      const mentorObj = await prisma.mentor.findFirst({ where: { userId: id } });
      if (mentorObj) {
        whereClause = { mentorId: mentorObj.id };
      }
    } else if (normRole === 'HOD') {
      // HOD sees department leaves from PENDING_HOD onwards
      const hodObj = await prisma.hOD.findFirst({ where: { userId: id } });
      if (hodObj) {
        whereClause = {
          department: { contains: hodObj.department || '' },
          status: { in: ['PENDING_HOD', 'PENDING_WARDEN', 'READY_FOR_GATE', 'STUDENT_OUT', 'RETURNED', 'REJECTED'] }
        };
      }
    }
    // Wardens, Security, Principal & Admin see all leaves (whereClause stays empty = all)

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        history: {
          orderBy: { timestamp: 'asc' }
        },
        gateLog: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    console.error('Get Leaves Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Internal error fetching leave records.' });
  }
}

export async function mentorApprove(req, res) {
  try {
    const { leaveId, comment } = req.body;
    if (!leaveId) return res.status(400).json({ error: 'Validation Error', message: 'Leave ID is required.' });

    const leave = await prisma.leaveRequest.findUnique({ where: { leaveId } });
    if (!leave) return res.status(404).json({ error: 'Not Found', message: 'Leave request not found.' });

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId },
        data: {
          status: 'PENDING_HOD',
          history: {
            create: {
              actedByRole: 'MENTOR',
              actedByName: req.user.name || 'Assigned Mentor',
              actedById: req.user.id,
              action: 'APPROVED',
              remarks: comment || 'Mentor approved leave request.'
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const notif = await tx.notification.create({
        data: {
          targetRole: 'HOD',
          title: 'Leave Approved by Mentor',
          message: `Leave ${leaveId} for ${updated.studentName} approved by Mentor. Pending HOD approval.`
        }
      });

      return { updated, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      io.emit(SOCKET_EVENTS.MENTOR_APPROVED, payload);
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.MENTOR_APPROVED, payload);
      io.to(SOCKET_ROOMS.HOD(leave.department)).emit(SOCKET_EVENTS.MENTOR_APPROVED, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(SOCKET_EVENTS.MENTOR_APPROVED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket error:', e.message);
    }

    res.json({ message: 'Mentor approval recorded successfully.', leave: result.updated });
  } catch (error) {
    console.error('Mentor Approve Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Error processing mentor approval.' });
  }
}

export async function hodApprove(req, res) {
  try {
    const { leaveId, comment } = req.body;
    if (!leaveId) return res.status(400).json({ error: 'Validation Error', message: 'Leave ID is required.' });

    const leave = await prisma.leaveRequest.findUnique({ where: { leaveId } });
    if (!leave) return res.status(404).json({ error: 'Not Found', message: 'Leave request not found.' });

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId },
        data: {
          status: 'PENDING_WARDEN',
          history: {
            create: {
              actedByRole: 'HOD',
              actedByName: req.user.name || 'HOD',
              actedById: req.user.id,
              action: 'APPROVED',
              remarks: comment || 'HOD approved leave request.'
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const notif = await tx.notification.create({
        data: {
          targetRole: 'WARDEN',
          title: 'Leave Approved by HOD',
          message: `Leave ${leaveId} for ${updated.studentName} approved by HOD. Pending Warden approval.`
        }
      });

      return { updated, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      io.emit(SOCKET_EVENTS.HOD_APPROVED, payload);
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.HOD_APPROVED, payload);
      io.to(SOCKET_ROOMS.WARDEN('all')).emit(SOCKET_EVENTS.HOD_APPROVED, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(SOCKET_EVENTS.HOD_APPROVED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket error:', e.message);
    }

    res.json({ message: 'HOD approval recorded successfully.', leave: result.updated });
  } catch (error) {
    console.error('HOD Approve Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Error processing HOD approval.' });
  }
}

export async function wardenApprove(req, res) {
  try {
    const { leaveId, comment } = req.body;
    if (!leaveId) return res.status(400).json({ error: 'Validation Error', message: 'Leave ID is required.' });

    const leave = await prisma.leaveRequest.findUnique({ where: { leaveId } });
    if (!leave) return res.status(404).json({ error: 'Not Found', message: 'Leave request not found.' });

    const qrToken = generateQRPassToken(leaveId, leave.studentId, leave.toDate, leave.returnTime);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId },
        data: {
          status: 'READY_FOR_GATE',
          history: {
            create: {
              actedByRole: 'WARDEN',
              actedByName: req.user.name || 'Hostel Warden',
              actedById: req.user.id,
              action: 'APPROVED',
              remarks: comment || 'Warden approved. Signed Digital Gate Pass Issued.'
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const studentRec = await tx.student.findUnique({
        where: { id: leave.studentId },
        select: { userId: true }
      });

      const notif = await tx.notification.create({
        data: {
          userId: studentRec?.userId || null,
          targetRole: 'STUDENT',
          title: 'Gate Pass Ready (Signed QR Issued)',
          message: `Your leave ${leaveId} has received final Warden approval. Signed QR Pass is ready!`
        }
      });

      return { updated, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      io.emit(SOCKET_EVENTS.WARDEN_APPROVED, payload);
      io.emit(SOCKET_EVENTS.QR_GENERATED, payload);
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.WARDEN_APPROVED, payload);
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(SOCKET_EVENTS.QR_GENERATED, payload);
      io.to(SOCKET_ROOMS.SECURITY).emit(SOCKET_EVENTS.WARDEN_APPROVED, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(SOCKET_EVENTS.WARDEN_APPROVED, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket error:', e.message);
    }

    res.json({ message: 'Warden approval complete. Signed Digital QR pass generated.', leave: result.updated });
  } catch (error) {
    console.error('Warden Approve Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Error processing Warden approval.' });
  }
}

export async function rejectLeave(req, res) {
  try {
    const { leaveId, comment } = req.body;
    if (!leaveId) return res.status(400).json({ error: 'Validation Error', message: 'Leave ID is required.' });

    const leave = await prisma.leaveRequest.findUnique({ where: { leaveId } });
    if (!leave) return res.status(404).json({ error: 'Not Found', message: 'Leave request not found.' });

    const role = (req.user.role || 'Approver').toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { leaveId },
        data: {
          status: 'REJECTED',
          history: {
            create: {
              actedByRole: role,
              actedByName: req.user.name || role,
              actedById: req.user.id,
              action: 'REJECTED',
              remarks: comment || `${role} rejected leave request.`
            }
          }
        },
        include: { history: true, gateLog: true }
      });

      const studentRec = await tx.student.findUnique({
        where: { id: leave.studentId },
        select: { userId: true }
      });

      const notif = await tx.notification.create({
        data: {
          userId: studentRec?.userId || null,
          targetRole: 'STUDENT',
          title: 'Leave Request Rejected',
          message: `Your leave request ${leaveId} was rejected by ${role}. Reason: ${comment || 'Not approved'}.`
        }
      });

      return { updated, notif };
    });

    try {
      const io = getIO();
      const payload = result.updated;
      const eventName = role === 'MENTOR' ? SOCKET_EVENTS.MENTOR_REJECTED :
        role === 'HOD' ? SOCKET_EVENTS.HOD_REJECTED : SOCKET_EVENTS.WARDEN_REJECTED;

      io.emit(eventName, payload);
      io.to(SOCKET_ROOMS.STUDENT(leave.studentId)).emit(eventName, payload);
      io.to(SOCKET_ROOMS.PRINCIPAL).emit(eventName, payload);
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, result.notif);
    } catch (e) {
      console.warn('Socket error:', e.message);
    }

    res.json({ message: 'Leave request rejected.', leave: result.updated });
  } catch (error) {
    console.error('Reject Leave Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Error processing leave rejection.' });
  }
}

