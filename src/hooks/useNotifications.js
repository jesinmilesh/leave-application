import { useState, useEffect } from 'react';
import { 
  fetchNotifications, 
  markNotificationReadApi, 
  deleteNotificationApi, 
  clearAllNotificationsApi 
} from '../services/apiService.js';

export function useNotifications(user, socketEvent) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;
    const res = await fetchNotifications();
    if (res && res.notifications) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount || 0);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (socketEvent && socketEvent.event === 'notification_created') {
      const notif = socketEvent.data;
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [socketEvent]);

  const markAsRead = async (id) => {
    await markNotificationReadApi(id);
    if (id === 'all') {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteNotif = async (id) => {
    await deleteNotificationApi(id);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const clearAll = async () => {
    await clearAllNotificationsApi();
    setNotifications([]);
    setUnreadCount(0);
  };

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotif, 
    clearAll, 
    refreshNotifications: loadNotifications 
  };
}

