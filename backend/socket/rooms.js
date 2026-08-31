export const SOCKET_ROOMS = {
  STUDENT: (studentId) => `student-${studentId}`,
  MENTOR: (mentorId) => `mentor-${mentorId}`,
  MENTOR_SECTION: (dept, year, section) => `mentor-${dept}-${year}-${section}`,
  HOD: (dept) => `hod-${dept}`,
  WARDEN: (block) => `warden-${block || 'all'}`,
  SECURITY: 'security-mainGate',
  PRINCIPAL: 'principal-main',
  ADMIN: 'admin-system'
};
