import bcrypt from 'bcryptjs';

// In-Memory Live Production Store
const usersDb = [];
const leavesDb = [];
const notificationsDb = [
  {
    id: "notif-001",
    userId: null,
    targetRole: "ALL",
    title: "PEC System Active",
    message: "Real-time production backend active for Prathyusha Engineering College.",
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

// Helper: Seed Default Accounts if empty
async function seedInitialAccountsIfEmpty() {
  if (usersDb.length === 0) {
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    usersDb.push(
      { id: "USR-ADM-001", name: "System Administrator", email: "admin@prathyusha.edu.in", password: defaultPasswordHash, role: "Admin", department: "IT Services" },
      { id: "USR-PRI-001", name: "Dr. E. Natarajan", email: "principal@prathyusha.edu.in", password: defaultPasswordHash, role: "Principal", department: "Executive Administration" },
      { id: "USR-HOD-001", name: "Dr. Anthilakshmi", email: "hod.cse@prathyusha.edu.in", password: defaultPasswordHash, role: "HOD", department: "CSE" },
      { id: "USR-MEN-001", name: "Prof. Kalaimani", email: "kalaimani.mentor@prathyusha.edu.in", password: defaultPasswordHash, role: "Mentor", department: "CSE" },
      { id: "USR-WAR-001", name: "Mr. Ravi", email: "warden.boys@prathyusha.edu.in", password: defaultPasswordHash, role: "Warden", department: "Hostel Administration" },
      { id: "USR-SEC-001", name: "Officer S. Ramu", email: "security.maingate@prathyusha.edu.in", password: defaultPasswordHash, role: "Security", department: "Main Gate Security" }
    );
  }
}

seedInitialAccountsIfEmpty();

// Helper: Generate Unique Leave ID (PEC-{Dept}-{Random6Digits})
function generateUniqueLeaveId(deptCode) {
  const cleanCode = (deptCode || 'CSE').replace(/[^A-Za-z0-9]/g, '');
  let id = '';
  let isUnique = false;
  while (!isUnique) {
    const random = Math.floor(100000 + Math.random() * 900000);
    id = `PEC-${cleanCode}-${random}`;
    if (!leavesDb.some(l => l.leaveId === id)) {
      isUnique = true;
    }
  }
  return id;
}

// User CRUD
export async function findUserByEmail(email) {
  return usersDb.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
}

export async function findUserById(id) {
  return usersDb.find(u => u.id === id);
}

export async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password || 'password123', 10);
  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'Student',
    department: userData.department || 'CSE',
    registerNo: userData.registerNo || null,
    year: userData.year || '3rd Year',
    section: userData.section || 'A',
    createdAt: new Date().toISOString()
  };
  usersDb.push(newUser);
  return newUser;
}

// Leave Requests CRUD
export async function createLeaveRequest(leaveData) {
  const leaveId = generateUniqueLeaveId(leaveData.department);
  const newLeave = {
    leaveId,
    studentId: leaveData.studentId,
    studentName: leaveData.studentName,
    registerNo: leaveData.registerNo,
    department: leaveData.department || 'CSE',
    year: leaveData.year || '3rd Year',
    section: leaveData.section || 'A',
    mentorName: leaveData.mentorName || 'Prof. Kalaimani',
    hodName: leaveData.hodName || 'Dr. Anthilakshmi',
    wardenName: leaveData.wardenName || 'Mr. Ravi',
    leaveType: leaveData.leaveType || 'Medical Leave',
    subject: leaveData.subject,
    reason: leaveData.reason,
    letterBody: leaveData.letterBody,
    fromDate: leaveData.fromDate,
    toDate: leaveData.toDate,
    outDate: leaveData.outDate || leaveData.fromDate,
    outTime: leaveData.outTime || '09:00 AM',
    returnDate: leaveData.returnDate || leaveData.toDate,
    returnTime: leaveData.returnTime || '06:00 PM',
    parentPhone: leaveData.parentPhone || '+91 98765 43210',
    parentConsent: leaveData.parentConsent !== undefined ? leaveData.parentConsent : true,
    status: 'Pending Mentor',
    qrToken: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalHistory: [
      {
        role: 'Student',
        approver: leaveData.studentName,
        action: 'Submitted Request',
        comment: 'Application submitted via student portal.',
        timestamp: new Date().toLocaleString()
      }
    ],
    gateLogs: { exitTime: null, returnTime: null, securityName: null }
  };

  leavesDb.unshift(newLeave);
  return newLeave;
}

export async function getAllLeaves() {
  return leavesDb;
}

export async function getLeavesByStudent(studentIdentifier) {
  return leavesDb.filter(l =>
    l.studentId === studentIdentifier ||
    l.registerNo === studentIdentifier ||
    l.studentName.toLowerCase().trim() === (studentIdentifier || '').toLowerCase().trim()
  );
}

export async function updateLeaveStatus(leaveId, role, status, approverName, comment, extraData = {}) {
  const leave = leavesDb.find(l => l.leaveId === leaveId);
  if (!leave) return null;

  leave.status = status;
  leave.updatedAt = new Date().toISOString();
  if (extraData.qrToken) leave.qrToken = extraData.qrToken;

  const historyItem = {
    role,
    approver: approverName,
    action: extraData.action || (status === 'Rejected' ? 'Rejected' : 'Approved'),
    comment: comment || `${role} updated leave status.`,
    timestamp: new Date().toLocaleString()
  };
  leave.approvalHistory.push(historyItem);

  if (extraData.gateLog) {
    leave.gateLogs = { ...leave.gateLogs, ...extraData.gateLog };
  }

  return leave;
}

// Notifications
export async function addNotification(userId, targetRole, title, message) {
  const notif = {
    id: `notif-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId || null,
    targetRole: targetRole || 'ALL',
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notificationsDb.unshift(notif);
  return notif;
}

export async function getNotificationsForUser(user) {
  return notificationsDb.filter(n =>
    n.userId === user.id ||
    n.targetRole === 'ALL' ||
    n.targetRole === user.role
  );
}
