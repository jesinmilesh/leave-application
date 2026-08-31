import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import MentorPortal from './components/MentorPortal';
import HODPortal from './components/HODPortal';
import WardenPortal from './components/WardenPortal';
import SecurityPortal from './components/SecurityPortal';
import PrincipalPortal from './components/PrincipalPortal';
import AdminPortal from './components/AdminPortal';
import { USERS } from './mockData';
import { useSocket } from './hooks/useSocket';
import { useNotifications } from './hooks/useNotifications';
import { useRealtime } from './hooks/useRealtime';
import {
  getMeApi,
  submitLeaveApi,
  approveMentorApi,
  approveHodApi,
  approveWardenApi,
  rejectLeaveApi,
  markExitApi,
  markReturnApi
} from './services/apiService';

const getNormalizedRole = (r) => {
  if (!r) return 'Student';
  const str = String(r).trim().toLowerCase().replace(/_/g, ' ');
  if (str === 'student') return 'Student';
  if (str === 'mentor') return 'Mentor';
  if (str === 'hod') return 'HOD';
  if (str === 'warden') return 'Warden';
  if (str.includes('security') || str.includes('gate') || str === 'main gate' || str === 'maingate') return 'Security';
  if (str === 'principal') return 'Principal';
  if (str === 'admin') return 'Admin';
  return 'Student';
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const hasToken = !!localStorage.getItem('pec_jwt_token');
      const isLogged = localStorage.getItem('pec_isLoggedIn') === 'true';
      return hasToken && isLogged;
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return getNormalizedRole(localStorage.getItem('pec_currentRole'));
    } catch {
      return 'Student';
    }
  });

  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pec_activeUser');
      if (saved && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Invalid saved user in localStorage:', e);
    }
    return USERS[0];
  });

  const [socketEvent, setSocketEvent] = useState(null);

  // Handle incoming socket event
  const handleSocketEvent = useCallback((event, data) => {
    setSocketEvent({ event, data, timestamp: Date.now() });
  }, []);

  // Connect Socket.IO with auto-reconnection and room joining
  const { isConnected, isWaking, reconnect } = useSocket(isLoggedIn ? activeUser : null, handleSocketEvent);

  // Live real-time leaves and principal dashboard hook
  const { leaves, setLeaves, dashboardData, refreshData } = useRealtime(
    isLoggedIn ? activeUser : null,
    socketEvent
  );

  // Live notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotif,
    clearAll,
    refreshNotifications
  } = useNotifications(
    isLoggedIn ? activeUser : null,
    socketEvent
  );

  // Automatically refresh data when socket connects / reconnects after server wake-up
  useEffect(() => {
    if (isConnected) {
      refreshData();
      refreshNotifications();
    }
  }, [isConnected]);

  // Sync session state to LocalStorage
  useEffect(() => {
    localStorage.setItem('pec_isLoggedIn', isLoggedIn);
    localStorage.setItem('pec_currentRole', currentRole);
    if (activeUser) {
      localStorage.setItem('pec_activeUser', JSON.stringify(activeUser));
    }
  }, [isLoggedIn, currentRole, activeUser]);

  // On mount, validate token with backend getMeApi
  useEffect(() => {
    async function checkExistingAuth() {
      const token = localStorage.getItem('pec_jwt_token');
      if (token) {
        try {
          const res = await getMeApi();
          if (res && res.user) {
            setActiveUser(res.user);
            setCurrentRole(getNormalizedRole(res.user.role));
            setIsLoggedIn(true);
          } else if (res && (res.error || res.message)) {
            // Explicit auth rejection from backend (e.g. invalid token)
            handleLogout();
          } else {
            // Server offline or Render cold-starting: keep saved user session intact
            console.warn('Backend server cold-starting; preserving active user session.');
          }
        } catch (e) {
          console.warn('Network timeout during auth check; preserving local session:', e);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
    checkExistingAuth();
  }, []);

  const handleLogin = (role, userData) => {
    const rawRole = userData?.role || role || 'Student';
    const finalRole = getNormalizedRole(rawRole);
    setCurrentRole(finalRole);
    setActiveUser(userData || USERS[0]);
    setIsLoggedIn(true);

    refreshData();
    refreshNotifications();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('pec_isLoggedIn');
    localStorage.removeItem('pec_jwt_token');
    localStorage.removeItem('pec_activeUser');
    localStorage.removeItem('pec_currentRole');
  };

  // Workflow Handlers using Backend APIs with instant real-time state updates
  const handleSubmitLeave = async (newLeaveData) => {
    const autoLeaveId = newLeaveData.leaveId || `PEC-${(newLeaveData.department || 'CSE').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const optimisticLeave = {
      ...newLeaveData,
      leaveId: autoLeaveId,
      status: 'PENDING_MENTOR',
      createdAt: new Date().toISOString(),
      history: [
        {
          actedByRole: 'STUDENT',
          actedByName: newLeaveData.studentName || activeUser?.name || 'Jesin Milesh',
          action: 'SUBMITTED',
          remarks: 'Leave request submitted via student portal.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    // 1. Instant 0ms local state update for real-time responsiveness across all portals
    setLeaves(prev => {
      const exists = prev.some(l => l.leaveId === autoLeaveId);
      return exists ? prev : [optimisticLeave, ...prev];
    });

    // 2. Async backend API call & global database sync
    try {
      const res = await submitLeaveApi(newLeaveData);
      const createdLeave = (res && res.leave) ? res.leave : (res && res.leaveId ? res : null);
      if (createdLeave) {
        // Replace optimistic entry with real DB entry
        setLeaves(prev => prev.map(l => (l.leaveId === autoLeaveId || l.leaveId === createdLeave.leaveId) ? createdLeave : l));
      } else {
        console.warn('Leave submission response:', res);
      }
      // Refresh all data from DB to sync student history and trigger mentor dashboard
      await refreshData();
    } catch (e) {
      console.warn('Backend submission persistence notice:', e);
      await refreshData();
    }
  };

  const handleApprove = async (leaveId, role, comment) => {
    // Optimistic update
    setLeaves(prev => prev.map(l => {
      if (l.leaveId !== leaveId) return l;
      let nextStatus = l.status;
      if (role === 'Mentor') nextStatus = 'PENDING_HOD';
      if (role === 'HOD') nextStatus = 'PENDING_WARDEN';
      if (role === 'Warden') nextStatus = 'READY_FOR_GATE';
      return { ...l, status: nextStatus };
    }));

    try {
      if (role === 'Mentor') await approveMentorApi(leaveId, comment);
      if (role === 'HOD') await approveHodApi(leaveId, comment);
      if (role === 'Warden') await approveWardenApi(leaveId, comment);
    } catch (e) {
      console.warn('Approval API error:', e);
    }
    // Always re-fetch real DB state after approval
    await refreshData();
  };

  const handleBulkApprove = async (leaveIds, role, comment) => {
    for (const leaveId of leaveIds) {
      await handleApprove(leaveId, role, comment);
    }
  };

  const handleReject = async (leaveId, role, comment) => {
    setLeaves(prev => prev.map(l => {
      if (l.leaveId !== leaveId) return l;
      return { ...l, status: `REJECTED_${role.toUpperCase()}` };
    }));

    await rejectLeaveApi(leaveId, comment);
    refreshData();
  };

  const handleMarkExit = async (leaveId, securityName) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString('en-GB');
    const timeStamp = `${formattedDate} ${formattedTime}`;

    setLeaves(prev => prev.map(l => {
      if (l.leaveId !== leaveId) return l;
      return {
        ...l,
        status: 'STUDENT OUT',
        outDate: formattedDate,
        outTime: formattedTime,
        gateLog: {
          ...(l.gateLog || {}),
          exitTime: timeStamp,
          securityName: securityName || 'Gate Officer'
        }
      };
    }));

    await markExitApi(leaveId, null);
    refreshData();
  };

  const handleMarkEntry = async (leaveId, securityName) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString('en-GB');
    const timeStamp = `${formattedDate} ${formattedTime}`;

    setLeaves(prev => prev.map(l => {
      if (l.leaveId !== leaveId) return l;
      return {
        ...l,
        status: 'RETURNED',
        returnDate: formattedDate,
        returnTime: formattedTime,
        gateLog: {
          ...(l.gateLog || {}),
          returnTime: timeStamp,
          securityName: securityName || 'Gate Officer'
        }
      };
    }));

    await markReturnApi(leaveId, null);
    refreshData();
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const activeRole = getNormalizedRole(currentRole || activeUser?.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeUser={activeUser}
        currentRole={activeRole}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onClearNotifications={clearAll}
        onMarkRead={markAsRead}
        onDeleteNotification={deleteNotif}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeRole === 'Student' && (
          <StudentPortal
            leaves={leaves}
            onSubmitLeave={handleSubmitLeave}
            activeStudent={activeUser}
          />
        )}

        {activeRole === 'Mentor' && (
          <MentorPortal
            leaves={leaves}
            onApprove={handleApprove}
            onReject={handleReject}
            activeMentor={activeUser}
          />
        )}

        {activeRole === 'HOD' && (
          <HODPortal
            leaves={leaves}
            onApprove={handleApprove}
            onReject={handleReject}
            onBulkApprove={handleBulkApprove}
            activeHOD={activeUser}
          />
        )}

        {activeRole === 'Warden' && (
          <WardenPortal
            leaves={leaves}
            onApprove={handleApprove}
            onReject={handleReject}
            activeWarden={activeUser}
          />
        )}

        {activeRole === 'Security' && (
          <SecurityPortal
            leaves={leaves}
            onMarkExit={handleMarkExit}
            onMarkEntry={handleMarkEntry}
            activeSecurity={activeUser}
          />
        )}

        {activeRole === 'Principal' && (
          <PrincipalPortal
            leaves={leaves}
            liveDashboardData={dashboardData}
            activePrincipal={activeUser}
          />
        )}

        {activeRole === 'Admin' && (
          <AdminPortal />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Prathyusha Engineering College • Digital Leave Permission Management System</p>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : isWaking ? 'bg-amber-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isConnected
                ? 'System Status: Operational'
                : isWaking
                  ? 'Waking Server & Connecting...'
                  : 'Connecting to System...'}
            </span>
            {!isConnected && (
              <button
                onClick={reconnect}
                title="Tap to force wake server and reconnect"
                className="ml-1 px-2 py-0.5 text-[10px] bg-indigo-950/80 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded font-sans transition-all active:scale-95"
              >
                ⚡ Wake & Retry
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
