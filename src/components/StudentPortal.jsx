import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Inbox
} from 'lucide-react';
import Timeline from './Timeline';
import QRPassModal from './QRPassModal';
import LetterDetailsForm from './letter/LetterDetailsForm';
import LetterPreview from './letter/LetterPreview';
import { generateLeaveId } from '../mockData';

export default function StudentPortal({
  leaves,
  onSubmitLeave,
  activeStudent
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'apply' | 'history'
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [passLeave, setPassLeave] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state matching active student info
  const [formData, setFormData] = useState({
    department: activeStudent?.department || 'CSE',
    year: activeStudent?.year || '3rd Year',
    section: activeStudent?.section || 'A',
    mentorName: 'Prof. Kalaimani',
    leaveType: 'Medical Leave',
    salutation: 'Respected Sir,',
    subject: 'Permission for Medical Consultation & Rest',
    reason: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    outDate: new Date().toISOString().split('T')[0],
    outTime: '09:00 AM',
    returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    returnTime: '06:00 PM',
    parentPhone: activeStudent?.parentPhone || '+91 98765 43210',
    parentConsent: true
  });

  // Keep form data synced if activeStudent updates
  useEffect(() => {
    if (activeStudent) {
      setFormData(prev => ({
        ...prev,
        department: activeStudent.department || 'CSE',
        year: activeStudent.year || '3rd Year',
        section: activeStudent.section || 'A'
      }));
    }
  }, [activeStudent]);

  // Filter leaves STRICTLY for the active logged in student
  const studentLeaves = leaves.filter(l => {
    if (!activeStudent) return false;
    const matchReg = activeStudent.registerNo && l.registerNo === activeStudent.registerNo;
    const matchName = activeStudent.name && l.studentName.toLowerCase().trim() === activeStudent.name.toLowerCase().trim();
    const matchId = activeStudent.id && l.studentId === activeStudent.id;
    return matchReg || matchName || matchId;
  });

  const totalLeaves = studentLeaves.length;
  const approvedLeaves = studentLeaves.filter(l => ['Ready for Gate', 'READY FOR GATE', 'Student Out', 'STUDENT OUT', 'Returned', 'RETURNED'].includes(l.status)).length;
  const pendingLeaves = studentLeaves.filter(l => ['Pending Mentor', 'PENDING MENTOR', 'Pending HOD', 'PENDING HOD', 'Pending Warden', 'PENDING WARDEN'].includes(l.status)).length;
  const rejectedLeaves = studentLeaves.filter(l => ['Rejected', 'REJECTED'].includes(l.status)).length;

  const currentLeave = studentLeaves.find(l => !['Returned', 'RETURNED', 'Rejected', 'REJECTED'].includes(l.status)) || studentLeaves[0];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert("Please provide a valid reason for your leave request.");
      return;
    }

    setLoading(true);
    const autoLeaveId = generateLeaveId(formData.department);

    const newLeave = {
      leaveId: autoLeaveId,
      studentId: activeStudent?.id || `STU-${Math.floor(100 + Math.random() * 900)}`,
      studentName: activeStudent?.name || 'Jesin Milesh',
      registerNo: activeStudent?.registerNo || '111424149000',
      department: formData.department,
      year: formData.year,
      section: formData.section,
      mentorName: formData.mentorName,
      hodName: 'Dr. Anthilakshmi',
      wardenName: 'Mr. Ravi',
      leaveType: formData.leaveType,
      subject: formData.subject,
      reason: formData.reason,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      outDate: formData.fromDate,
      outTime: formData.outTime,
      returnDate: formData.toDate,
      returnTime: formData.returnTime,
      parentPhone: formData.parentPhone,
      parentConsent: formData.parentConsent,
      hostelBlock: formData.hostelBlock || activeStudent?.hostelBlock || 'Boys Hostel - Block A',
      roomNo: formData.roomNo || activeStudent?.roomNo || 'AG0',
      photoUrl: activeStudent?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    };

    await onSubmitLeave(newLeave);
    setLoading(false);
    setActiveTab('history');
    setFormData(prev => ({ ...prev, reason: '' }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('MENTOR')) return 'status-badge-yellow';
    if (s.includes('HOD')) return 'status-badge-blue';
    if (s.includes('WARDEN')) return 'status-badge-purple';
    if (s.includes('GATE') || s === 'READY FOR GATE') return 'status-badge-green';
    if (s.includes('OUT')) return 'status-badge-orange';
    if (s.includes('RETURN')) return 'status-badge-emerald';
    if (s.includes('REJECT')) return 'status-badge-red';
    return 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 glow-blue flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {activeStudent?.photoUrl ? (
            <img
              src={activeStudent.photoUrl}
              alt={activeStudent.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-300 border-2 border-indigo-500/40 flex items-center justify-center font-bold text-xl">
              {activeStudent?.name?.[0] || 'S'}
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              PRATHYUSHA STUDENT PORTAL
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Welcome, {activeStudent?.name || 'Rahul Sharma'}</h2>
            <p className="text-xs text-slate-300 font-mono">
              Reg No: <strong className="text-white">{activeStudent?.registerNo || '111424149000'}</strong> • Dept: <strong className="text-indigo-300">{activeStudent?.department || 'CSE'} ({activeStudent?.year || '3rd Year'}, Sec {activeStudent?.section || 'A'})</strong>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'apply' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Official Leave Application</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
          >
            Leave History ({totalLeaves})
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 5 Live Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Total Leaves</span>
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-xl font-bold text-white">{totalLeaves}</p>
              <p className="text-[10px] text-slate-500">Submitted</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Approved</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400">{approvedLeaves}</p>
              <p className="text-[10px] text-emerald-500/80">Gate pass ready</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Pending</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400">{pendingLeaves}</p>
              <p className="text-[10px] text-amber-500/80">In review</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Rejected</span>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xl font-bold text-rose-400">{rejectedLeaves}</p>
              <p className="text-[10px] text-rose-500/80">Declined</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Outside</span>
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-xl font-bold text-orange-400">
                {studentLeaves.filter(l => ['Student Out', 'STUDENT OUT', 'STUDENT_OUT'].includes(l.status)).length}
              </p>
              <p className="text-[10px] text-orange-500/80">Currently out</p>
            </div>
          </div>

          {/* New Section: My Digital Pass (Visible after Warden approval / READY_FOR_GATE / STUDENT_OUT) */}
          {currentLeave && ['READY FOR GATE', 'READY_FOR_GATE', 'READY FOR GATE', 'STUDENT OUT', 'STUDENT_OUT', 'RETURNED'].includes(currentLeave.status?.toUpperCase().replace(/_/g, ' ')) && (
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 glow-emerald bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <QrCode className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    ⚡ MY OFFICIAL DIGITAL GATE PASS ACTIVE
                  </span>
                  <h3 className="text-base font-bold text-white">Digital Pass Issued: {currentLeave.leaveId}</h3>
                  <p className="text-xs text-slate-300">
                    Approved by Warden • Valid for Campus Main Gate Exit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPassLeave(currentLeave)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition transform active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>OPEN MY DIGITAL PASS & QR CODE</span>
              </button>
            </div>
          )}

          {/* Active Leave Permission */}
          {currentLeave ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{currentLeave.leaveId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(currentLeave.status)}`}>
                      ● {currentLeave.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{currentLeave.subject}</h3>
                </div>

                {['READY FOR GATE', 'READY_FOR_GATE', 'STUDENT OUT', 'STUDENT_OUT', 'RETURNED'].includes(currentLeave.status?.toUpperCase().replace(/_/g, ' ')) && (
                  <button
                    onClick={() => setPassLeave(currentLeave)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital QR Pass</span>
                  </button>
                )}
              </div>

              <Timeline leave={currentLeave} />
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Leave Applications Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You currently have no leave requests. Click <strong className="text-indigo-400">"Official Leave Application"</strong> to apply for permission.
              </p>
              <button
                onClick={() => setActiveTab('apply')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Official Leave Application</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REDESIGNED REDESIGNED OFFICIAL LEAVE LETTER SYSTEM (2-COLUMN RESPONSIVE) */}
      {activeTab === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Input Form */}
          <div className="lg:col-span-5">
            <LetterDetailsForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              studentProfile={activeStudent}
              mentorName={formData.mentorName}
              loading={loading}
            />
          </div>

          {/* Right Panel: Official Live Letter Preview */}
          <div className="lg:col-span-7">
            <LetterPreview
              formData={formData}
              studentProfile={activeStudent}
              mentorName={formData.mentorName}
              onPrint={handlePrint}
            />
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">My Leave Permission Applications</h3>
            <span className="text-xs text-slate-400 font-mono">Total: {studentLeaves.length} Records</span>
          </div>

          {studentLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Leave ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Mentor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Pass / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {studentLeaves.map((leave) => (
                    <tr key={leave.leaveId} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 font-mono font-extrabold text-indigo-400">{leave.leaveId}</td>
                      <td className="p-3 font-semibold text-slate-200">{leave.studentName}</td>
                      <td className="p-3 font-semibold text-white">{leave.subject}</td>
                      <td className="p-3 text-slate-300">{leave.fromDate} → {leave.toDate}</td>
                      <td className="p-3 text-slate-400">{leave.mentorName}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                        >
                          Timeline
                        </button>
                        {['Ready for Gate', 'READY FOR GATE', 'Student Out', 'STUDENT OUT', 'Returned', 'RETURNED'].includes(leave.status) && (
                          <button
                            onClick={() => setPassLeave(leave)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px]"
                          >
                            QR Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Personal History Found</h4>
              <p className="text-xs text-slate-400">
                You have not submitted any leave applications yet. Only your own submitted leaves will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timeline Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedLeave.subject}</h3>
                <p className="text-xs text-indigo-400 font-mono">{selectedLeave.leaveId}</p>
              </div>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <Timeline leave={selectedLeave} />
          </div>
        </div>
      )}

      {/* QR Pass Modal */}
      {passLeave && (
        <QRPassModal leave={passLeave} onClose={() => setPassLeave(null)} />
      )}
    </div>
  );
}
