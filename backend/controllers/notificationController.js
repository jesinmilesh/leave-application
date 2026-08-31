import prisma from '../services/prisma.js';

export async function getNotifications(req, res) {
  try {
    const { id, role } = req.user;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: id },
          { targetRole: role },
          { targetRole: 'ALL' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: req.user.id },
            { targetRole: req.user.role },
            { targetRole: 'ALL' }
          ]
        },
        data: { isRead: true }
      });
      return res.json({ message: 'All notifications marked as read.' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to update notification.' });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to delete notification.' });
  }
}

export async function clearAllNotifications(req, res) {
  try {
    const { id, role } = req.user;

    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: id },
          { targetRole: role },
          { targetRole: 'ALL' }
        ]
      }
    });

    res.json({ message: 'All notifications cleared successfully.' });
  } catch (error) {
    console.error('Clear All Notifications Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Failed to clear notifications.' });
  }
}

