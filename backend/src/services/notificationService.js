// Notification Service (Email + In-App + Push Notifications)
class NotificationService {
  static async sendEmailNotification(toEmail, subject, body) {
    console.log(`[EMAIL SIMULATOR] To: ${toEmail} | Subject: ${subject}`);
    return { success: true, timestamp: new Date().toISOString() };
  }

  static async sendPushNotification(userId, message) {
    console.log(`[PUSH NOTIFICATION] User: ${userId} | Message: ${message}`);
    return { success: true };
  }
}

module.exports = NotificationService;
