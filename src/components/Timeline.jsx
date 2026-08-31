import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserCheck, 
  Building2, 
  Home, 
  LogOut, 
  LogIn 
} from 'lucide-react';

export default function Timeline({ leave }) {
  if (!leave) return null;

  const stages = [
    { key: 'Submitted', label: 'Submitted', role: 'Student', icon: UserCheck },
    { key: 'Mentor', label: 'Mentor Approval', role: 'Mentor', icon: UserCheck },
    { key: 'HOD', label: 'HOD Approval', role: 'HOD', icon: Building2 },
    { key: 'Warden', label: 'Warden Approval', role: 'Warden', icon: Home },
    { key: 'Gate', label: 'Gate Exit', role: 'Security', icon: LogOut },
    { key: 'Returned', label: 'Campus Return', role: 'Security', icon: LogIn }
  ];

  const normStatus = (leave.status || '').toUpperCase().replace(/_/g, ' ');

  // Helper to determine stage status: 'completed' | 'current' | 'upcoming' | 'rejected'
  const getStageStatus = (stageKey) => {
    if (normStatus === 'REJECTED') {
      const history = leave.history || leave.approvalHistory || [];
      const rejectItem = history.find(h => (h.action || '').toUpperCase() === 'REJECTED');
      if (rejectItem && (rejectItem.role || '').toUpperCase() === stageKey.toUpperCase()) return 'rejected';
    }

    const order = ['Submitted', 'Mentor', 'HOD', 'Warden', 'Gate', 'Returned'];
    
    let currentLevelIndex = 0;
    if (normStatus === 'PENDING MENTOR') currentLevelIndex = 1;
    else if (normStatus === 'PENDING HOD') currentLevelIndex = 2;
    else if (normStatus === 'PENDING WARDEN') currentLevelIndex = 3;
    else if (normStatus === 'READY FOR GATE') currentLevelIndex = 4;
    else if (normStatus === 'STUDENT OUT') currentLevelIndex = 4;
    else if (normStatus === 'RETURNED' || normStatus === 'STUDENT RETURNED') currentLevelIndex = 5;

    const targetIndex = order.indexOf(stageKey);

    if (targetIndex < currentLevelIndex) return 'completed';
    if (targetIndex === currentLevelIndex) return 'current';
    return 'upcoming';
  };

  const getStageTimeAndApprover = (stageKey) => {
    const history = leave.history || leave.approvalHistory || [];
    if (stageKey === 'Submitted') {
      const item = history.find(h => (h.role || '').toUpperCase() === 'STUDENT');
      return { 
        time: item?.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : 'Just now'), 
        approver: leave.studentName 
      };
    }
    if (stageKey === 'Mentor') {
      const item = history.find(h => (h.role || '').toUpperCase() === 'MENTOR');
      return { 
        time: item?.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null, 
        approver: item?.approverName || item?.approver || leave.mentorName || 'Assigned Mentor'
      };
    }
    if (stageKey === 'HOD') {
      const item = history.find(h => (h.role || '').toUpperCase() === 'HOD');
      return { 
        time: item?.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null, 
        approver: item?.approverName || item?.approver || leave.hodName || 'Department HOD'
      };
    }
    if (stageKey === 'Warden') {
      const item = history.find(h => (h.role || '').toUpperCase() === 'WARDEN');
      return { 
        time: item?.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null, 
        approver: item?.approverName || item?.approver || leave.wardenName || 'Hostel Warden'
      };
    }
    const parseSafeTime = (val) => {
      if (!val) return null;
      const str = String(val).trim();
      if (!str) return null;
      if (str.includes('/') && !str.includes('T')) return str;
      try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
      return str;
    };

    if (stageKey === 'Gate') {
      const exitTime = leave.gateLog?.exitTime || leave.gateLogs?.exitTime;
      return { 
        time: parseSafeTime(exitTime), 
        approver: leave.gateLog?.securityName || leave.gateLogs?.securityName || 'Gate Officer'
      };
    }
    if (stageKey === 'Returned') {
      const returnTime = leave.gateLog?.returnTime || leave.gateLogs?.returnTime;
      return { 
        time: parseSafeTime(returnTime), 
        approver: leave.gateLog?.securityName || leave.gateLogs?.securityName || 'Gate Officer'
      };
    }
    return { time: null, approver: null };
  };

  return (
    <div className="py-3 px-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
        Live Approval Timeline ({leave.leaveId})
      </h4>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <div className="hidden md:block absolute left-[5%] right-[5%] top-5 h-0.5 bg-slate-800 -z-0" />

        {stages.map((st) => {
          const status = getStageStatus(st.key);
          const { time, approver } = getStageTimeAndApprover(st.key);
          const IconComp = st.icon;

          return (
            <div key={st.key} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-1/6">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-md ${
                  status === 'completed'
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                    : status === 'current'
                    ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-500/30'
                    : status === 'rejected'
                    ? 'bg-rose-600 text-white ring-4 ring-rose-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : status === 'rejected' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <IconComp className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 md:w-full">
                <p className={`text-xs font-bold ${
                  status === 'completed' ? 'text-emerald-400' :
                  status === 'current' ? 'text-indigo-300 font-semibold' :
                  status === 'rejected' ? 'text-rose-400' : 'text-slate-500'
                }`}>
                  {st.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px] md:mx-auto">
                  {approver ? approver : status === 'current' ? 'Awaiting Action' : 'Pending'}
                </p>
                {time && (
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
