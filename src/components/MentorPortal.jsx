import React, { useState } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Check
} from 'lucide-react';
import Timeline from './Timeline';

export default function MentorPortal({ 
  leaves, 
  onApprove, 
  onReject, 
  activeMentor 
}) {
  const [commentModalLeave, setCommentModalLeave] = useState(null);
  const [actionType, setActionType] = useState('approve');
  const [commentText, setCommentText] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const norm = (s) => (s || '').toUpperCase().replace(/_/g, ' ');

  const mentorLeaves = leaves;
  const pendingLeaves = mentorLeaves.filter(l => {
    const s = norm(l.status);
    return s === 'PENDING MENTOR' || s === 'PENDING_MENTOR' || s === 'PENDING' || s === 'SUBMITTED' || s.includes('MENTOR');
  });
  const displayedLeaves = filterStatus === 'pending' ? pendingLeaves : mentorLeaves;

  const handleActionClick = (leave, type) => {
    setCommentModalLeave(leave);
    setActionType(type);
    setCommentText(type === 'approve' ? 'Verified student details & parent consent. Approved.' : 'Reason insufficient during test week.');
  };

  const handleConfirmAction = () => {
    if (!commentModalLeave) return;

    if (actionType === 'approve') {
      onApprove(commentModalLeave.leaveId, 'Mentor', activeMentor?.name || 'Assigned Mentor', commentText);
    } else {
      onReject(commentModalLeave.leaveId, 'Mentor', activeMentor?.name || 'Assigned Mentor', commentText);
    }

    setCommentModalLeave(null);
    setCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending Review</span>
          <p className="text-2xl font-bold text-amber-400">{pendingLeaves.length}</p>
          <p className="text-[10px] text-amber-500/80">Awaiting your approval</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Approved Requests</span>
          <p className="text-2xl font-bold text-emerald-400">
            {mentorLeaves.filter(l => norm(l.status) !== 'PENDING MENTOR' && norm(l.status) !== 'REJECTED').length}
          </p>
          <p className="text-[10px] text-emerald-500/80">Forwarded to HOD</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Rejected Requests</span>
          <p className="text-2xl font-bold text-rose-400">
            {mentorLeaves.filter(l => norm(l.status) === 'REJECTED').length}
          </p>
          <p className="text-[10px] text-rose-500/80">Declined by mentor</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            👨‍🏫 Mentor Approval Portal
          </h2>
          <p className="text-xs text-slate-400">
            Assigned Mentor: <strong className="text-indigo-300">{activeMentor?.name || 'Mentor'}</strong> ({activeMentor?.department || 'CSE'})
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review ({pendingLeaves.length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Batch Requests ({mentorLeaves.length})
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {displayedLeaves.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-white">No Pending Mentor Approvals</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All leave requests for your assigned batch have been reviewed. New submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedLeaves.map((leave) => {
            const isPending = norm(leave.status) === 'PENDING MENTOR';

            return (
              <div
                key={leave.leaveId}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'border-amber-500/40 bg-slate-900/80'
                    : 'border-slate-800 opacity-90'
                }`}
              >
                {/* Student Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-sm">
                      {leave.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{leave.studentName}</h3>
                      <p className="text-[11px] font-mono text-indigo-400">
                        {leave.registerNo} • {leave.department} ({leave.year})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 block">{leave.leaveId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isPending ? 'status-badge-yellow' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                </div>

                {/* Leave Info */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Dates: <strong>{leave.fromDate} → {leave.toDate}</strong></span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{leave.outTime} - {leave.returnTime}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] font-semibold">Subject & Reason:</span>
                    <p className="font-semibold text-white">{leave.subject}</p>
                    <p className="text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] italic">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> Parent: {leave.parentPhone}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Parent Call Confirmed
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <Timeline leave={leave} />
                </div>

                {isPending ? (
                  <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => handleActionClick(leave, 'approve')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Forward to HOD</span>
                    </button>

                    <button
                      onClick={() => handleActionClick(leave, 'reject')}
                      className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Reviewed by {activeMentor?.name || 'Mentor'}</span>
                    <span className="font-semibold text-emerald-400">Step 1 Complete</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action / Comment Modal */}
      {commentModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button onClick={() => setCommentModalLeave(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Student: <strong className="text-white">{commentModalLeave.studentName}</strong> ({commentModalLeave.leaveId})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mentor Comment / Approval Remarks
              </label>
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="Enter remarks for student & HOD..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCommentModalLeave(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-lg ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
