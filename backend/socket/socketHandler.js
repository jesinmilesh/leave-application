import { Server } from 'socket.io';
import { socketAuthMiddleware, isAuthorizedRoom } from '../security/socketAuth.js';
import { SOCKET_ROOMS } from './rooms.js';

let ioInstance = null;

export function initSocketIO(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ Socket Connected: ${socket.id} (User: ${socket.user?.id || 'Guest'})`);

    socket.on('join_room', (data) => {
      const room = typeof data === 'string' ? data : data?.room;
      if (!room) return;

      if (socket.user?.role === 'ADMIN' || isAuthorizedRoom(socket.user, room)) {
        socket.join(room);
        console.log(`📌 Socket ${socket.id} joined authorized room: ${room}`);
      } else {
        console.warn(`🚨 Socket ${socket.id} unauthorized room join attempt: ${room}`);
        socket.emit('error', { message: `Unauthorized subscription to room '${room}'` });
      }
    });

    if (socket.user && socket.user.role !== 'GUEST') {
      const { id, role, department } = socket.user;
      const normRole = (role || '').toUpperCase();

      if (normRole === 'STUDENT') {
        socket.join(SOCKET_ROOMS.STUDENT(id));
      } else if (normRole === 'MENTOR') {
        socket.join(SOCKET_ROOMS.MENTOR(id));
      } else if (normRole === 'HOD') {
        socket.join(SOCKET_ROOMS.HOD(department));
      } else if (normRole === 'WARDEN') {
        socket.join(SOCKET_ROOMS.WARDEN('all'));
      } else if (normRole === 'SECURITY') {
        socket.join(SOCKET_ROOMS.SECURITY);
      } else if (normRole === 'PRINCIPAL') {
        socket.join(SOCKET_ROOMS.PRINCIPAL);
      } else if (normRole === 'ADMIN') {
        socket.join(SOCKET_ROOMS.ADMIN);
      }
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized yet!');
  }
  return ioInstance;
}
