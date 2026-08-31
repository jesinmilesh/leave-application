// Express API + Socket.IO Real-Time Production Server for PEC Leave Portal (OWASP Secured)
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { initSocketIO } from '../socket/socketHandler.js';
import * as authController from '../controllers/authController.js';
import * as leaveController from '../controllers/leaveController.js';
import * as securityController from '../controllers/securityController.js';
import * as principalController from '../controllers/principalController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as adminController from '../controllers/adminController.js';

import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleGuard.js';
import { loginRateLimiter, apiRateLimiter, qrScanRateLimiter } from '../middleware/rateLimiter.js';
import { configureHelmet } from '../middleware/helmetConfig.js';
import { csrfProtection } from '../middleware/csrf.js';
import { sanitizeRequestBody, validateLeaveSubmission } from '../middleware/validateInput.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO Real-Time Engine with JWT Socket Auth
initSocketIO(server);

// 1. Production Security Headers (Helmet)
app.use(configureHelmet());

// 2. CORS & Cookie Parser
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Input Sanitization (XSS & SQL Injection Protection)
app.use(sanitizeRequestBody);

// 4. Rate Limiting for all General API Endpoints
app.use('/api/', apiRateLimiter);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health Check Endpoints (For Render & Load Balancers)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    institution: 'Prathyusha Engineering College',
    portal: 'PEC Digital Leave Permission Portal',
    realtime: 'Socket.IO Active',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// CSRF Token Provider Endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ csrfToken: token });
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/login', loginRateLimiter, authController.login);
app.post('/api/auth/register', loginRateLimiter, authController.register);
app.post('/api/auth/change-password', authController.changePassword);
app.post('/api/auth/forgot-password', loginRateLimiter, authController.requestPasswordReset);
app.post('/api/auth/reset-password', loginRateLimiter, authController.resetPassword);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', authenticateToken, authController.getMe);


// --- LEAVE PERMISSION ROUTES (RBAC Protected) ---
app.post(
  '/api/leave/create',
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  validateLeaveSubmission,
  csrfProtection,
  auditLogMiddleware('LEAVE_SUBMITTED'),
  leaveController.createLeaveRequest
);

app.get(
  '/api/leave/all',
  authenticateToken,
  leaveController.getLeaves
);

app.post(
  '/api/mentor/approve',
  authenticateToken,
  authorizeRoles('MENTOR', 'ADMIN'),
  csrfProtection,
  auditLogMiddleware('MENTOR_APPROVAL'),
  leaveController.mentorApprove
);

app.post(
  '/api/hod/approve',
  authenticateToken,
  authorizeRoles('HOD', 'ADMIN'),
  csrfProtection,
  auditLogMiddleware('HOD_APPROVAL'),
  leaveController.hodApprove
);

app.post(
  '/api/warden/approve',
  authenticateToken,
  authorizeRoles('WARDEN', 'ADMIN'),
  csrfProtection,
  auditLogMiddleware('WARDEN_APPROVAL'),
  leaveController.wardenApprove
);

app.post(
  '/api/leave/reject',
  authenticateToken,
  authorizeRoles('MENTOR', 'HOD', 'WARDEN', 'ADMIN'),
  csrfProtection,
  auditLogMiddleware('LEAVE_REJECTED'),
  leaveController.rejectLeave
);

// --- SECURITY CHECKPOINT ROUTES (Gate Officer RBAC & Rate Limited) ---
app.post(
  '/api/security/exit',
  authenticateToken,
  authorizeRoles('SECURITY', 'MAIN_GATE', 'ADMIN'),
  qrScanRateLimiter,
  csrfProtection,
  auditLogMiddleware('GATE_EXIT_VERIFIED'),
  securityController.markExit
);

app.post(
  '/api/security/return',
  authenticateToken,
  authorizeRoles('SECURITY', 'MAIN_GATE', 'ADMIN'),
  qrScanRateLimiter,
  csrfProtection,
  auditLogMiddleware('GATE_RETURN_VERIFIED'),
  securityController.markReturn
);

// --- PRINCIPAL DASHBOARD ROUTE (Executive RBAC) ---
app.get(
  '/api/principal/dashboard',
  authenticateToken,
  authorizeRoles('PRINCIPAL', 'ADMIN'),
  principalController.getLiveDashboard
);

// --- NOTIFICATION ROUTES ---
app.get(
  '/api/notifications',
  authenticateToken,
  notificationController.getNotifications
);

app.put(
  '/api/notifications/:id/read',
  authenticateToken,
  notificationController.markAsRead
);

app.delete(
  '/api/notifications/clear',
  authenticateToken,
  notificationController.clearAllNotifications
);

app.delete(
  '/api/notifications/:id',
  authenticateToken,
  notificationController.deleteNotification
);

// --- ADMIN SECURITY & SYSTEM MANAGEMENT ROUTES (Strict Admin Only RBAC) ---
app.get(
  '/api/admin/mentors',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.getMentorAssignments
);

app.post(
  '/api/admin/mentors',
  authenticateToken,
  authorizeRoles('ADMIN'),
  csrfProtection,
  auditLogMiddleware('MENTOR_MAPPING_UPDATED'),
  adminController.createMentorAssignment
);

app.get(
  '/api/admin/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.getAllUsers
);

app.put(
  '/api/admin/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.updateUser
);

app.delete(
  '/api/admin/users/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.deleteUser
);

app.post(
  '/api/admin/bulk-users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  csrfProtection,
  auditLogMiddleware('BULK_USERS_IMPORTED'),
  adminController.bulkImportUsers
);

app.get(
  '/api/admin/audit-logs',
  authenticateToken,
  authorizeRoles('ADMIN', 'PRINCIPAL'),
  adminController.getAuditLogs
);

app.get(
  '/api/admin/security-status',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.getSecurityStatus
);

app.post(
  '/api/admin/unlock-account',
  authenticateToken,
  authorizeRoles('ADMIN'),
  csrfProtection,
  auditLogMiddleware('ACCOUNT_UNLOCKED'),
  adminController.unlockUserAccount
);

app.post(
  '/api/admin/force-logout',
  authenticateToken,
  authorizeRoles('ADMIN'),
  csrfProtection,
  auditLogMiddleware('FORCE_LOGOUT'),
  adminController.forceLogoutUser
);

// Production Static Client File Serving & API Fallback
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      return res.json({
        status: 'online',
        institution: 'Prathyusha Engineering College',
        system: 'PEC Digital Leave Permission Portal API & Socket.IO Engine',
        healthCheck: '/health',
        version: '3.0.0'
      });
    }
  }
  next();
});

// Generic Error Handler (Hide internal backend stack traces from client)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Error',
    message: 'An unexpected server error occurred. Please try again later.'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 PEC Leave Portal OWASP Secured Production API & Socket.IO Server running on ${PORT}`);
});
