import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Crown,
  Activity,
  TrendingUp,
  Building2,
  Search,
  Eye
} from 'lucide-react';
import Timeline from './Timeline';

export default function PrincipalPortal({ leaves, liveDashboardData, activePrincipal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimelineLeave, setSelectedTimelineLeave] = useState(null);

  const norm = (s) => (s || '').toUpperCase().replace(/_/g, ' ');

  // Compute live metrics from props or database API
  const counters = liveDashboardData?.counters;
  const totalRequests = counters?.totalLeaves ?? leaves.length;
  const pendingRequests = counters ? (counters.pendingMentor + counters.pendingHod + counters.pendingWarden) : leaves.filter(l => ['PENDING MENTOR', 'PENDING HOD', 'PENDING WARDEN'].includes(norm(l.status))).length;
  const approvedCount = counters ? (counters.readyAtGate + counters.studentsOutside + counters.returned) : leaves.filter(l => ['READY FOR GATE', 'STUDENT OUT', 'RETURNED'].includes(norm(l.status))).length;
  const studentsOutside = counters?.studentsOutside ?? leaves.filter(l => norm(l.status) === 'STUDENT OUT').length;

  const monthlyTrends = liveDashboardData?.monthlyTrends || [
    { date: 'Today', count: totalRequests }
  ];

  const deptChart = liveDashboardData?.departmentChartData || [
    { name: 'CSE', value: leaves.filter(l => l.department === 'CSE').length || 1 },
    { name: 'AIDS', value: leaves.filter(l => l.department === 'AIDS').length || 1 },
    { name: 'ECE', value: leaves.filter(l => l.department === 'ECE').length || 1 }
  ];

  const pieData = [
    { name: 'Approved & Gate Ready', value: approvedCount > 0 ? approvedCount : 1, color: '#10b981' },
    { name: 'Pending Review', value: pendingRequests > 0 ? pendingRequests : 1, color: '#eab308' },
    { name: 'Rejected', value: counters?.rejected ?? leaves.filter(l => norm(l.status) === 'REJECTED').length, color: '#ef4444' }
  ];

  const filteredLeaves = leaves.filter(l =>
    l.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.leaveId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 glow-purple flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Principal Super Admin Dashboard</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prathyusha Engineering College Real-Time Overseer • {activePrincipal?.name || 'Dr. E. Natarajan (Principal)'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Live System Status Active</span>
        </div>
      </div>

      {/* 4 Analytics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Leaves</span>
          <p className="text-2xl font-extrabold text-white">{totalRequests}</p>
          <p className="text-[10px] text-slate-500">Total requests</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending Requests</span>
          <p className="text-2xl font-extrabold text-amber-400">{pendingRequests}</p>
          <p className="text-[10px] text-amber-500/80">In pipeline</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Approved</span>
          <p className="text-2xl font-extrabold text-emerald-400">{approvedCount}</p>
          <p className="text-[10px] text-emerald-500/80">Gate pass generated</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Students Outside</span>
          <p className="text-2xl font-extrabold text-orange-400">{studentsOutside}</p>
          <p className="text-[10px] text-orange-500/80 font-mono">Currently out of campus</p>
        </div>
      </div>

      {/* Live Tracking Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Live Stage Tracking Feed
            </h3>
            <p className="text-xs text-slate-400">
              Monitoring every leave request across all 9 departments in real time
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Leave ID or Student..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Leave ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Register No & Dept</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLeaves.map((l) => (
                <tr key={l.leaveId} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 font-mono font-extrabold text-indigo-400">{l.leaveId}</td>
                  <td className="p-3 font-bold text-white">{l.studentName}</td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 text-[11px] block">{l.registerNo}</span>
                    <span className="text-slate-400 text-[10px]">{l.department}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-rose-300 border border-rose-900">
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedTimelineLeave(l)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Live Application Trends
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="count" name="Applied Leaves" stroke="#818cf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Approval Breakdown</h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-12 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Department-wise Leave Distribution
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChart}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="value" name="Leave Count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Inspect Timeline Modal */}
      {selectedTimelineLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Super Admin Audit: {selectedTimelineLeave.studentName}</h3>
                <p className="text-xs text-indigo-400 font-mono">{selectedTimelineLeave.leaveId}</p>
              </div>
              <button onClick={() => setSelectedTimelineLeave(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <Timeline leave={selectedTimelineLeave} />
          </div>
        </div>
      )}
    </div>
  );
}
