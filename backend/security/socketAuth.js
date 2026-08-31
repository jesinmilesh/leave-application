import { verifyAccessToken } from './jwt.js';

export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    socket.user = { id: 'GUEST', role: 'GUEST' };
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return next(new Error('Authentication failed: Invalid or expired JWT token'));
  }

  socket.user = decoded;
  next();
}

export function isAuthorizedRoom(socketUser, roomName) {
  if (!socketUser || !roomName) return false;

  const role = (socketUser.role || '').toUpperCase();
  const userId = socketUser.id;
  const dept = socketUser.department;

  if (roomName.startsWith('student-')) {
    const targetStudentId = roomName.replace('student-', '');
    return role === 'ADMIN' || role === 'PRINCIPAL' || userId === targetStudentId;
  }

  if (roomName.startsWith('mentor-')) {
    const targetMentorId = roomName.replace('mentor-', '');
    return role === 'ADMIN' || role === 'PRINCIPAL' || userId === targetMentorId;
  }

  if (roomName.startsWith('hod-')) {
    const targetDept = roomName.replace('hod-', '');
    return role === 'ADMIN' || role === 'PRINCIPAL' || dept === targetDept;
  }

  if (roomName.startsWith('warden-')) {
    return role === 'ADMIN' || role === 'PRINCIPAL' || role === 'WARDEN';
  }

  if (roomName.startsWith('security-')) {
    return role === 'ADMIN' || role === 'PRINCIPAL' || role === 'SECURITY';
  }

  if (roomName.startsWith('principal-') || roomName.startsWith('admin-')) {
    return role === 'ADMIN' || role === 'PRINCIPAL';
  }

  return false;
}
