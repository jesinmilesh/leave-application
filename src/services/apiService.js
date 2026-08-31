const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:5000/api');

function getAuthHeaders() {
  const token = localStorage.getItem('pec_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('pec_jwt_token', data.token);
    }
    return data;
  } catch (error) {
    console.error('API Login Error:', error);
    return { error: 'Network or server connection error.' };
  }
}

export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('pec_jwt_token', data.token);
    }
    return data;
  } catch (error) {
    console.error('API Register Error:', error);
    return { error: 'Network registration error.' };
  }
}

export async function requestForgotPasswordApi(email) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to request password reset link.' };
  }
}

export async function resetPasswordApi(email, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to reset password.' };
  }
}

export async function changePasswordApi(userId, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, newPassword })
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to change password.' };
  }
}


export async function getMeApi() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchAllLeaves() {
  try {
    const res = await fetch(`${API_BASE}/leave/all`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.leaves)) return data.leaves;
    return [];
  } catch (error) {
    console.error('API Fetch Leaves Error:', error);
    return [];
  }
}

export async function submitLeaveApi(leaveData) {
  try {
    const res = await fetch(`${API_BASE}/leave/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveData)
    });
    return await res.json();
  } catch (error) {
    console.error('API Submit Leave Error:', error);
    return { error: 'Failed to submit leave application.' };
  }
}

export async function approveMentorApi(leaveId, comment) {
  try {
    const res = await fetch(`${API_BASE}/mentor/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, comment })
    });
    return await res.json();
  } catch (error) {
    console.error('API Mentor Approve Error:', error);
    return { error: 'Failed to approve leave.' };
  }
}

export async function approveHodApi(leaveId, comment) {
  try {
    const res = await fetch(`${API_BASE}/hod/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, comment })
    });
    return await res.json();
  } catch (error) {
    console.error('API HOD Approve Error:', error);
    return { error: 'Failed to approve leave.' };
  }
}

export async function approveWardenApi(leaveId, comment) {
  try {
    const res = await fetch(`${API_BASE}/warden/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, comment })
    });
    return await res.json();
  } catch (error) {
    console.error('API Warden Approve Error:', error);
    return { error: 'Failed to approve leave.' };
  }
}

export async function rejectLeaveApi(leaveId, role, comment) {
  try {
    const res = await fetch(`${API_BASE}/leave/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, role, comment })
    });
    return await res.json();
  } catch (error) {
    console.error('API Reject Leave Error:', error);
    return { error: 'Failed to reject leave.' };
  }
}

export async function markExitApi(leaveId, qrToken) {
  try {
    const res = await fetch(`${API_BASE}/security/exit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, qrToken })
    });
    return await res.json();
  } catch (error) {
    console.error('API Mark Exit Error:', error);
    return { error: 'Failed to process gate exit.' };
  }
}

export async function markReturnApi(leaveId, qrToken) {
  try {
    const res = await fetch(`${API_BASE}/security/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leaveId, qrToken })
    });
    return await res.json();
  } catch (error) {
    console.error('API Mark Return Error:', error);
    return { error: 'Failed to process gate return.' };
  }
}

export async function fetchPrincipalDashboard() {
  try {
    const res = await fetch(`${API_BASE}/principal/dashboard`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('API Fetch Principal Dashboard Error:', error);
    return null;
  }
}

export async function fetchNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('API Fetch Notifications Error:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationReadApi(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function deleteNotificationApi(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function clearAllNotificationsApi() {
  try {
    const res = await fetch(`${API_BASE}/notifications/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchMentorAssignments() {
  try {
    const res = await fetch(`${API_BASE}/admin/mentors`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return { assignments: [], mentors: [] };
  }
}

export async function saveMentorAssignmentApi(data) {
  try {
    const res = await fetch(`${API_BASE}/admin/mentors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to save mentor assignment.' };
  }
}

export async function fetchAllUsersApi() {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function updateUserApi(userData) {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to update user.' };
  }
}

export async function deleteUserApi(userId) {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to delete user.' };
  }
}

export async function bulkImportUsersApi(users) {
  try {
    const res = await fetch(`${API_BASE}/admin/bulk-users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ users })
    });
    return await res.json();
  } catch (error) {
    return { error: 'Failed to import users.' };
  }
}

