import prisma from '../services/prisma.js';
import { hashPassword } from '../security/bcrypt.js';

export async function getMentorAssignments(req, res) {
  try {
    const assignments = await prisma.mentorAssignment.findMany({
      include: {
        mentor: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    });

    const mentors = await prisma.user.findMany({
      where: { role: 'Mentor' },
      select: { id: true, name: true, email: true, department: true }
    });

    res.json({ assignments, mentors });
  } catch (error) {
    console.error('Get Mentor Mappings Error:', error);
    res.status(500).json({ error: 'Failed to fetch mentor assignments.' });
  }
}

export async function createMentorAssignment(req, res) {
  try {
    const { department, year, section, mentorId } = req.body;

    if (!department || !year || !section || !mentorId) {
      return res.status(400).json({ error: 'Department, year, section, and mentor are required.' });
    }

    const existing = await prisma.mentorAssignment.findFirst({
      where: { department, year, section }
    });

    if (existing) {
      const updated = await prisma.mentorAssignment.update({
        where: { id: existing.id },
        data: { mentorId },
        include: { mentor: true }
      });
      return res.json({ message: 'Mentor assignment updated.', assignment: updated });
    }

    const created = await prisma.mentorAssignment.create({
      data: { department, year, section, mentorId },
      include: { mentor: true }
    });

    res.status(201).json({ message: 'Mentor assignment created.', assignment: created });
  } catch (error) {
    console.error('Create Mentor Mapping Error:', error);
    res.status(500).json({ error: 'Failed to save mentor assignment.' });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        mentor: true,
        hod: true,
        staff: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const getCleanRegNo = (user) => {
      if (user.student?.registerNumber) {
        return user.student.registerNumber;
      }
      const r = (user.role || '').toUpperCase();
      if (r === 'STUDENT') return '111424149024';
      if (r === 'MENTOR') return 'MEN-101';
      if (r === 'HOD') return 'HOD-201';
      if (r === 'WARDEN') return 'WAR-301';
      if (r === 'MAIN_GATE' || r === 'MAIN GATE') return 'SEC-401';
      if (r === 'PRINCIPAL') return 'PRI-501';
      if (r === 'ADMIN') return 'ADM-901';
      return `PEC-${r.substring(0, 3)}-101`;
    };

    const formattedUsers = users.map(u => {
      const regNo = getCleanRegNo(u);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        name: u.student?.fullName || u.mentor?.fullName || u.hod?.fullName || u.staff?.fullName || u.name || 'User',
        department: u.student?.department || u.mentor?.department || u.hod?.department || u.department || 'N/A',
        registerNumber: regNo,
        registerNo: regNo
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { userId, name, email, role, department } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, mentor: true, hod: true, staff: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email || user.email,
        role: role || user.role
      }
    });

    if (user.student) {
      await prisma.student.update({
        where: { userId },
        data: { fullName: name || user.student.fullName, department: department || user.student.department }
      });
    } else if (user.mentor) {
      await prisma.mentor.update({
        where: { userId },
        data: { fullName: name || user.mentor.fullName, department: department || user.mentor.department }
      });
    } else if (user.hod) {
      await prisma.hOD.update({
        where: { userId },
        data: { fullName: name || user.hod.fullName, department: department || user.hod.department }
      });
    } else if (user.staff) {
      await prisma.staff.update({
        where: { userId },
        data: { fullName: name || user.staff.fullName, role: role || user.staff.role }
      });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'User ID is required' });

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}

export async function getSecurityStatus(req, res) {
  try {
    const lockedAccounts = await prisma.user.count({
      where: {
        lockUntil: { gt: new Date() }
      }
    });

    const activeSessions = await prisma.refreshToken.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    });

    const recentFailedLogins = await prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      lockedAccounts,
      activeSessions,
      recentFailedLogins,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security status.' });
  }
}

export async function unlockUserAccount(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLogins: 0,
        lockUntil: null
      }
    });

    res.json({ message: 'User account unlocked successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock user account.' });
  }
}

export async function forceLogoutUser(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    res.json({ message: 'User active sessions revoked successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke user sessions.' });
  }
}

export async function bulkImportUsers(req, res) {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'A non-empty list of users is required.' });
    }

    const defaultPassword = await hashPassword('PEC@Leave2026!');
    let importedCount = 0;

    for (const u of users) {
      if (!u.name || (!u.registerNo && !u.email)) continue;

      const cleanEmail = u.email || `${u.registerNo}@prathyusha.edu.in`;
      const role = u.role || 'Student';
      const department = u.department || 'CSE';

      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            ...(u.registerNo ? [{ student: { registerNo: u.registerNo } }] : [])
          ]
        }
      });

      if (!existing) {
        if (role.toUpperCase() === 'STUDENT') {
          await prisma.user.create({
            data: {
              name: u.name,
              email: cleanEmail,
              password: defaultPassword,
              role: 'Student',
              department,
              student: {
                create: {
                  registerNo: u.registerNo || `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  year: u.year || '3rd Year',
                  section: u.section || 'A',
                  roomNo: u.roomNo || 'A-301',
                  hostelBlock: u.hostelBlock || 'Hostel Block A',
                  parentPhone: u.parentPhone || '+91 98765 00000'
                }
              }
            }
          });
        } else {
          await prisma.user.create({
            data: {
              name: u.name,
              email: cleanEmail,
              password: defaultPassword,
              role,
              department
            }
          });
        }
        importedCount++;
      }
    }

    res.json({ message: `Successfully imported ${importedCount} users into system database.`, importedCount });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to process bulk import.' });
  }
}

