import prisma from '../services/prisma.js';

export async function logAuditEvent(req, action, details = null) {
  try {
    const userId = req.user ? req.user.id : null;
    const role = req.user ? req.user.role : 'ANONYMOUS';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const device = req.headers['user-agent'] || 'Unknown Device';

    await prisma.auditLog.create({
      data: {
        userId,
        role,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        device
      }
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
}

export function auditLogMiddleware(actionName) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        logAuditEvent(req, actionName, {
          path: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode
        });
      }
    });
    next();
  };
}
