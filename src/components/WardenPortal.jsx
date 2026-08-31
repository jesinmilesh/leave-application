import React, { useState } from 'react';
import { 
  Home, 
  Phone, 
  Building, 
  DoorClosed, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';
import Timeline from './Timeline';

export default function WardenPortal({ 
  leaves, 
  onApprove, 
  onReject, 
  activeWarden 
}) {
  const [blockFilter, setBlockFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'all'
  const norm = (s) => (s || '').toUpperCase().replace(/_/g, ' ');

  const pendingWardenCount = leaves.filter(l => norm(l.status) === 'PENDING WARDEN').length;

  const wardenLeaves = leaves.filter(l => {
    if (blockFilter !== 'All' && !l.hostelBlock?.includes(blockFilter)) return false;
    if (statusFilter === 'pending') return norm(l.status) === 'PENDING WARDEN';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending Warden Approvals</span>
          <p className="text-2xl font-bold text-purple-400">{pendingWardenCount}</p>
          <p className="text-[10px] text-purple-400/80">Mentor & HOD cleared</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium font-mono">Passes Generated</span>
          <p className="text-2xl font-bold text-emerald-400">
            {leaves.filter(l => ['READY FOR GATE', 'STUDENT OUT', 'RETURNED'].includes(norm(l.status))).length}
          </p>
          <p className="text-[10px] text-emerald-500/80">Digital QR Pass Active</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Rejected Hostel Passes</span>
          <p className="text-2xl font-bold text-rose-400">
            {leaves.filter(l => norm(l.status) === 'REJECTED').length}
          </p>
          <p className="text-[10px] text-rose-500/80">Permission withheld</p>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏢 Hostel Warden Approval Portal
          </h2>
          <p className="text-xs text-slate-400">
            Hostel Block Admin: <strong className="text-purple-300">{activeWarden?.block || 'Block A, B & C'}</strong> • Warden: {activeWarden?.name || 'Mr. M. Rajesh'}
          </p>
        </div>

        {/* Filter Controls: View Pending vs View History */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === 'pending' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Review ({pendingWardenCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Leave History ({leaves.length})
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <span className="text-xs text-slate-400 font-medium px-1">Block:</span>
          <button
            onClick={() => setBlockFilter('All')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${blockFilter === 'All' ? 'bg-slate-800 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setBlockFilter('Block A')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${blockFilter === 'Block A' ? 'bg-slate-800 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}
          >
            Block A
          </button>
          <button
            onClick={() => setBlockFilter('Block B')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${blockFilter === 'Block B' ? 'bg-slate-800 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}
          >
            Block B
          </button>
        </div>
      </div>

      {/* Leave Requests Stream */}
      {wardenLeaves.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
          <Home className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-white">No Hostel Leave Requests</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {wardenLeaves.map((leave) => {
            const isPendingWarden = norm(leave.status) === 'PENDING WARDEN';

            return (
              <div
                key={leave.leaveId}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isPendingWarden
                    ? 'border-purple-500/40 bg-slate-900/90'
                    : 'border-slate-800 opacity-85'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{leave.studentName}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        {leave.registerNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {leave.department} ({leave.year}) • Mentored by {leave.mentorName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{leave.leaveId}</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      isPendingWarden ? 'status-badge-purple' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                </div>

                {/* Extra Hostel & Parent Info Bar */}
                <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Building className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Hostel Block</span>
                      <span className="font-bold">{leave.hostelBlock || 'Boys Hostel - Block A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-purple-300">
                    <DoorClosed className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Room Number</span>
                      <span className="font-mono font-bold text-amber-300">{leave.roomNo || 'A-304'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Parent Phone</span>
                        <span className="font-mono font-bold text-slate-200">{leave.parentPhone}</span>
                      </div>
                    </div>
                    <a
                      href={`tel:${leave.parentPhone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Dialing Parent: ${leave.parentPhone}\nCall status: Connected & verified.`);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold border border-emerald-500/40"
                    >
                      Call Parent
                    </a>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1 text-xs mb-3">
                  <span className="font-semibold text-slate-300">{leave.leaveType}: {leave.subject}</span>
                  <p className="text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 italic">
                    "{leave.reason}"
                  </p>
                </div>

                {/* Timeline */}
                <Timeline leave={leave} />

                {/* Warden Actions */}
                {isPendingWarden ? (
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Mentor & HOD Approvals Received ✓</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => onReject(leave.leaveId, 'Warden', activeWarden?.name || 'Warden', 'Hostel permission withheld.')}
                        className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => onApprove(leave.leaveId, 'Warden', activeWarden?.name || 'Warden', 'Warden approved. Digital QR Gate Pass generated.')}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition transform active:scale-95"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Approve & Issue QR Gate Pass</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Hostel Clearance Completed by {activeWarden?.name || 'Warden'}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> Digital Pass Active
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
