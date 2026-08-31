import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(user, onEvent) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pec_jwt_token');

    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setIsConnected(true);

      // Join user specific room
      if (user) {
        const r = (user.role || '').toLowerCase().replace(/_/g, ' ');
        if (r === 'student') {
          socket.emit('join_room', `student-${user.id}`);
        } else if (r === 'mentor') {
          socket.emit('join_room', `mentor-${user.id}`);
        } else if (r === 'hod') {
          socket.emit('join_room', `hod-${user.department || 'CSE'}`);
        } else if (r === 'warden') {
          socket.emit('join_room', 'warden-all');
        } else if (r.includes('security') || r.includes('gate')) {
          socket.emit('join_room', 'security-mainGate');
        } else if (r === 'principal') {
          socket.emit('join_room', 'principal-main');
        } else if (r === 'admin') {
          socket.emit('join_room', 'admin-system');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    const events = [
      'leave_created',
      'mentor_approved',
      'mentor_rejected',
      'hod_approved',
      'hod_rejected',
      'warden_approved',
      'warden_rejected',
      'qr_generated',
      'student_exited',
      'student_returned',
      'notification_created'
    ];

    events.forEach(event => {
      socket.on(event, (data) => {
        console.log(`🔔 Socket Event [${event}]:`, data);
        if (onEvent) {
          onEvent(event, data);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, user?.role]);

  return { socket: socketRef.current, isConnected };
}
