import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  CheckCheck, 
  Search
} from 'lucide-react';
import Timeline from './Timeline';
import { DEPARTMENTS } from '../mockData';

export default function HODPortal({ 
  leaves, 
  onApprove, 
  onReject, 
  onBulkApprove, 
  activeHOD 
}) {
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'history' | 'all'

  const hodDepartment = activeHOD?.department || 'CSE';
  const norm = (s) => (s || '').toUpperCase().replace(/_/g, ' ');

  const pendingHODLeaves = leaves.filter(l => norm(l.status) === 'PENDING HOD');

  const displayedLeaves = leaves.filter(l => {
    if (deptFilter !== 'All' && l.department !== deptFilter) return false;
    if (yearFilter !== 'All' && l.year !== yearFilter) return false;
    if (searchStudent.trim() && !l.studentName?.toLowerCase().includes(searchStudent.toLowerCase()) && !l.registerNo?.includes(searchStudent)) return false;
    if (statusFilter === 'pending') return norm(l.status) === 'PENDING HOD';
    if (statusFilter === 'history') return norm(l.status) !== 'PENDING HOD';
    return true;
  });

  const toggleSelect = (leaveId) => {
    if (selectedIds.includes(leaveId)) {
      setSelectedIds(selectedIds.filter(id => id !== leaveId));
    } else {
      setSelectedIds([...selectedIds, leaveId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingHODLeaves.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingHODLeaves.map(l => l.leaveId));
    }
  };

  const handleExecuteBulkApprove = () => {
    if (selectedIds.length === 0) return;
    onBulkApprove(selectedIds, 'HOD', activeHOD?.name || 'HOD', 'Bulk approved by HOD Office.');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending HOD Review</span>
          <p className="text-2xl font-bold text-amber-400">{pendingHODLeaves.length}</p>
          <p className="text-[10px] text-amber-500/80">Mentor approved, awaiting HOD</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium font-mono">Approved by HOD</span>
          <p className="text-2xl font-bold text-emerald-400">
            {leaves.filter(l => norm(l.status) === 'PENDING WARDEN' || norm(l.status) === 'READY FOR GATE' || norm(l.status) === 'STUDENT OUT' || norm(l.status) === 'RETURNED').length}
          </p>
          <p className="text-[10px] text-emerald-500/80">Forwarded to Warden</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Rejected</span>
          <p className="text-2xl font-bold text-rose-400">
            {leaves.filter(l => norm(l.status) === 'REJECTED').length}
          </p>
          <p className="text-[10px] text-rose-500/80">Declined requests</p>
        </div>
      </div>
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🏛️ HOD Department Approval Portal
            </h2>
            <p className="text-xs text-slate-400">
              Department: <strong className="text-cyan-400">{hodDepartment} Department</strong> • HOD: {activeHOD?.name || 'Dr. S. Vimalan'}
            </p>
          </div>

          {/* History & Status Toggle Bar */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'pending'
                  ? 'bg-cyan-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Review ({pendingHODLeaves.length})
            </button>
            <button
              onClick={() => setStatusFilter('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'history'
                  ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Approval History
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-cyan-300 shadow-md border border-cyan-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Requests ({leaves.length})
            </button>
          </div>

          {/* Bulk Action Button */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-cyan-950 border border-cyan-500/40 p-2 px-4 rounded-xl">
              <span className="text-xs font-bold text-cyan-300">{selectedIds.length} Selected</span>
              <button
                onClick={handleExecuteBulkApprove}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Bulk Approve Requests</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Filter Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Filter Academic Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="All">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Search Student</label>
            <div className="relative">
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search Name or Reg No..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2" />
            </div>
          </div>

          <div className="flex items-end justify-end">
            {pendingHODLeaves.length > 0 && statusFilter === 'pending' && (
              <button
                onClick={toggleSelectAll}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                {selectedIds.length === pendingHODLeaves.length ? 'Deselect All' : 'Select All Pending'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requests Stream */}
      <div className="space-y-4">
        {displayedLeaves.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white">No HOD Requests Found</h3>
            <p className="text-xs text-slate-400">No leave requests match the selected HOD department or history filters.</p>
          </div>
        ) : (
          displayedLeaves.map((leave) => {
            const isSelected = selectedIds.includes(leave.leaveId);
            const isPending = norm(leave.status) === 'PENDING HOD';

            return (
              <div
                key={leave.leaveId}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isSelected ? 'border-cyan-400 bg-cyan-950/20' : isPending ? 'border-blue-500/30 bg-slate-900/90 glow-blue' : 'border-slate-800 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {isPending && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(leave.leaveId)}
                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                      />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{leave.studentName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {leave.registerNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dept: <strong className="text-indigo-300">{leave.department}</strong> ({leave.year}) • Mentor: {leave.mentorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{leave.leaveId}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold status-badge-blue">
                      {leave.status}
                    </span>
                  </div>
                </div>

                {/* Info & Reason */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-8 space-y-1">
                    <span className="font-semibold text-cyan-300">{leave.leaveType}: {leave.subject}</span>
                    <p className="text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="md:col-span-4 bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] block uppercase font-mono">Dates & Contact</span>
                    <p className="font-bold text-slate-200">{leave.fromDate} → {leave.toDate}</p>
                    <p className="text-slate-400 font-mono text-[11px]">Parent: {leave.parentPhone}</p>
                  </div>
                </div>

                <Timeline leave={leave} />

                {/* Action Buttons */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs text-emerald-400 font-medium">Mentor Approved ✓</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReject(leave.leaveId, 'HOD', activeHOD?.name || 'HOD', 'Rejected by HOD office.')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-semibold hover:bg-rose-900"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApprove(leave.leaveId, 'HOD', activeHOD?.name || 'HOD', 'Approved by HOD. Forwarded to Warden.')}
                        className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Forward to Warden</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
