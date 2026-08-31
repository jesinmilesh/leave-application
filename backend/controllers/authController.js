import prisma from '../services/prisma.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../security/bcrypt.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../security/jwt.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

// Helper to get formatted profile data from User relations
async function getFormattedUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      mentor: true,
      hod: true,
      staff: true
    }
  });

  if (!user) return null;

  let fullName = '';
  let department = '';
  let registerNo = null;
  let year = null;
  let section = null;
  let hostelBlock = null;
  let roomNo = null;
  let mentorId = null;

  if (user.student) {
    fullName = user.student.fullName;
    department = user.student.department;
    registerNo = user.student.registerNumber;
    year = user.student.year;
    section = user.student.section;
    hostelBlock = user.student.hostelBlock;
    roomNo = user.student.roomNo;
    mentorId = user.student.mentorId;
  } else if (user.mentor) {
    fullName = user.mentor.fullName;
    department = user.mentor.department;
  } else if (user.hod) {
    fullName = user.hod.fullName;
    department = user.hod.department;
  } else if (user.staff) {
    fullName = user.staff.fullName;
    department = 'Staff Services';
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isFirstLogin: user.isFirstLogin,
    name: fullName,
    fullName,
    department,
    registerNo,
    year,
    section,
    hostelBlock,
    roomNo,
    mentorId
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please enter your Email/Register Number and Password.' });
    }

    const inputClean = email.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: inputClean } },
          { student: { registerNumber: { equals: inputClean } } }
        ]
      },
      include: {
        student: true,
        mentor: true,
        hod: true,
        staff: true
      }
    });

    if (!user) {
      await logAuditEvent(req, 'LOGIN_FAILED_NOT_FOUND', { identifier: inputClean });
      return res.status(404).json({
        error: 'Account Not Found',
        message: 'Account not found. Please register to continue.',
        notFound: true
      });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await logAuditEvent(req, 'LOGIN_FAILED_INVALID_PASSWORD', { userId: user.id });
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Incorrect password. Please try again.'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAuditEvent(req, 'LOGIN_SUCCESS', { userId: user.id, role: user.role });

    const formattedUser = await getFormattedUser(user.id);

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: formattedUser
    });

  } catch (error) {
    console.error('Auth Login Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Something went wrong during authentication.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { userId, newPassword } = req.body;
    const targetId = userId || req.user?.id;

    if (!targetId || !newPassword) {
      return res.status(400).json({ error: 'Validation Error', message: 'User ID and new password are required.' });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return res.status(400).json({ error: 'Weak Password', message: strengthCheck.message });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: targetId },
      data: {
        passwordHash,
        isFirstLogin: false
      }
    });

    await logAuditEvent(req, 'FORCE_CHANGE_PASSWORD_SUCCESS', { userId: targetId });

    const updatedUser = await getFormattedUser(targetId);

    res.json({
      message: 'Password changed successfully. You can now use the portal.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to update password.' });
  }
}

export async function register(req, res) {
  try {
    const { role, fullName, email, password, registerNumber, department, year, section, hostelBlock, roomNo } = req.body;

    if (!role || !fullName || !email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Role, Full Name, Email, and Password are required.' });
    }

    const normRole = role.toUpperCase();
    const allowedRoles = ['STUDENT', 'MENTOR', 'HOD', 'WARDEN', 'MAIN_GATE'];
    if (!allowedRoles.includes(normRole)) {
      return res.status(400).json({ error: 'Role Error', message: 'Selected role is not eligible for self-registration.' });
    }

    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return res.status(400).json({ error: 'Weak Password', message: strengthCheck.message });
    }

    const cleanEmail = email.trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(registerNumber ? [{ student: { registerNumber } }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Conflict Error', message: 'An account with this email or register number already exists.' });
    }

    const passwordHash = await hashPassword(password);

    let createdUserId = null;

    if (normRole === 'STUDENT') {
      if (!registerNumber) {
        return res.status(400).json({ error: 'Validation Error', message: 'Register number is required for student registration.' });
      }

      // Auto-assign mentor in same department
      const mentorObj = await prisma.mentor.findFirst({
        where: { department: department || 'CSE (Cyber Security)' }
      });

      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'STUDENT',
          isFirstLogin: false,
          student: {
            create: {
              fullName,
              registerNumber,
              department: department || 'CSE (Cyber Security)',
              year: year || '3rd Year',
              section: section || 'A',
              hostelBlock: hostelBlock || 'Block A - Boys Hostel',
              roomNo: roomNo || 'AG2',
              mentorId: mentorObj?.id || null
            }
          }
        }
      });
      createdUserId = newUser.id;

    } else if (normRole === 'MENTOR') {
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'MENTOR',
          isFirstLogin: false,
          mentor: {
            create: {
              fullName,
              department: department || 'CSE (Cyber Security)'
            }
          }
        }
      });
      createdUserId = newUser.id;

    } else if (normRole === 'HOD') {
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'HOD',
          isFirstLogin: false,
          hod: {
            create: {
              fullName,
              department: department || 'CSE (Cyber Security)'
            }
          }
        }
      });
      createdUserId = newUser.id;

    } else if (normRole === 'WARDEN' || normRole === 'MAIN_GATE') {
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: normRole,
          isFirstLogin: false,
          staff: {
            create: {
              fullName,
              role: normRole
            }
          }
        }
      });
      createdUserId = newUser.id;
    }

    const createdUserObj = await getFormattedUser(createdUserId);
    const accessToken = generateAccessToken({ id: createdUserId, email: cleanEmail, role: normRole });
    const refreshToken = generateRefreshToken({ id: createdUserId, email: cleanEmail, role: normRole });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: createdUserId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await logAuditEvent(req, 'USER_REGISTERED', { userId: createdUserId, role: normRole });

    res.status(201).json({
      message: 'Registration successful',
      token: accessToken,
      refreshToken,
      user: createdUserObj
    });

  } catch (error) {
    console.error('Auth Register Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Registration failed due to a server error.' });
  }
}

export async function refreshToken(req, res) {
  try {
    const token = req.body.refreshToken || (req.cookies ? req.cookies.refresh_token : null);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired refresh token' });
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Revoked refresh token' });
    }

    const formattedUser = await getFormattedUser(decoded.id);

    if (!formattedUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const newAccessToken = generateAccessToken({ id: decoded.id, email: formattedUser.email, role: formattedUser.role });

    res.json({
      token: newAccessToken,
      user: formattedUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Error', message: 'Could not refresh session' });
  }
}

export async function logout(req, res) {
  try {
    const token = req.body.refreshToken || (req.cookies ? req.cookies.refresh_token : null);
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');

    if (req.user) {
      await logAuditEvent(req, 'USER_LOGOUT', { userId: req.user.id });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.json({ message: 'Logged out' });
  }
}

export async function getMe(req, res) {
  try {
    const formattedUser = await getFormattedUser(req.user.id);
    if (!formattedUser) return res.status(404).json({ error: 'Not Found', message: 'User profile not found.' });

    res.json({ user: formattedUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal Error', message: 'Error fetching user profile.' });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please enter your registered email address.' });
    }

    const cleanEmail = email.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanEmail } },
          { student: { registerNumber: { equals: cleanEmail } } }
        ]
      }
    });

    if (user) {
      await logAuditEvent(req, 'PASSWORD_RESET_REQUESTED', { userId: user.id, email: user.email });
    }

    return res.json({
      success: true,
      message: 'If an account exists with this email/register number, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('Password Reset Request Error:', error);
    return res.status(500).json({ error: 'Internal Error', message: 'Failed to process password reset request.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and new password are required.' });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return res.status(400).json({ error: 'Weak Password', message: strengthCheck.message });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email.trim() } },
          { student: { registerNumber: { equals: email.trim() } } }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'Account not found.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash
      }
    });

    await logAuditEvent(req, 'PASSWORD_RESET_SUCCESS', { userId: user.id });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ error: 'Internal Error', message: 'Failed to reset password.' });
  }
}


