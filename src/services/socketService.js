import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:5000');

let socket = null;

export function initSocketClient(onEventReceived, onReconnect) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:'
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Real-Time Socket.IO Server:', socket.id);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to Socket.IO Server (Attempt #${attemptNumber}). Syncing server state...`);
      if (onReconnect) {
        onReconnect();
      }
    });

    const events = [
      'leave_created',
      'mentor_approved',
      'mentor_rejected',
      'hod_approved',
      'hod_rejected',
      'warden_approved',
      'warden_rejected',
      'pass_generated',
      'student_exited',
      'student_returned',
      'leave_rejected',
      'notification_created'
    ];

    events.forEach(eventName => {
      socket.on(eventName, (data) => {
        console.log(`🔔 Real-Time Event Received [${eventName}]:`, data);
        if (onEventReceived) {
          onEventReceived(eventName, data);
        }
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO Server:', reason);
    });
  }

  return socket;
}

export function joinSocketRoom(roomName) {
  if (socket) {
    socket.emit('join_room', { room: roomName });
  }
}

export function getSocket() {
  return socket;
}
