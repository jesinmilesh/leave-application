import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL && !import.meta.env.VITE_SOCKET_URL.includes('localhost')) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
};

const getHealthUrl = () => {
  const socketUrl = getSocketUrl();
  return `${socketUrl.replace(/\/$/, '')}/health`;
};

export function useSocket(user, onEvent) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  // Ping backend health endpoint to trigger Render cold-start wake up
  const pingHealth = useCallback(async () => {
    try {
      setIsWaking(true);
      const healthUrl = getHealthUrl();
      const res = await fetch(healthUrl, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        setIsWaking(false);
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
    } catch {
      // Server still waking up
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('pec_jwt_token');
    const SOCKET_URL = getSocketUrl();

    // Initial wake ping
    pingHealth();

    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Never give up reconnecting when Render is waking
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setIsConnected(true);
      setIsWaking(false);

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

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        pingHealth();
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection attempt waiting for server:', err.message);
      setIsConnected(false);
      setIsWaking(true);
      pingHealth();
    });

    socket.on('reconnect_attempt', (attempt) => {
      if (attempt % 3 === 0) {
        pingHealth();
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

    // Reconnect on window focus / network online / tab visibility change
    const handleFocusOrOnline = () => {
      if (socketRef.current && !socketRef.current.connected) {
        console.log('📱 Tab active: waking backend and reconnecting socket...');
        pingHealth();
        socketRef.current.connect();
      }
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocusOrOnline();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      socket.disconnect();
    };
  }, [user?.id, user?.role, pingHealth]);

  const reconnect = useCallback(() => {
    setIsWaking(true);
    pingHealth();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, [pingHealth]);

  return { socket: socketRef.current, isConnected, isWaking, reconnect };
}

