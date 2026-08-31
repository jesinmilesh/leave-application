import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Phone, User } from 'lucide-react';
import { PEC_LOGO_URL } from '../mockData';

export default function QRPassModal({ leave, onClose }) {
  if (!leave) return null;

  // Listen for ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const qrPayload = JSON.stringify({
    leaveId: leave.leaveId,
    studentId: leave.studentId || leave.registerNo,
    registerNo: leave.registerNo,
    department: leave.department,
    outDate: leave.outDate || leave.fromDate,
    returnDate: leave.returnDate || leave.toDate,
    expiryDate: leave.toDate,
    issuedBy: "Prathyusha Engineering College Gate Pass Automation"
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBackdropClick = (e) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="pec-print-modal-container fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-indigo-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[95vh] flex flex-col">

        {/* Top Floating Close Button (Top Right) */}
        <button
          type="button"
          onClick={onClose}
          className="no-print absolute top-3.5 right-3.5 z-50 p-2 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition shadow-lg cursor-pointer"
          title="Close Pass (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Screen-Only Modal Header */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 px-4 sm:px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 pr-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">PEC DIGITAL GATE PASS</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-mono font-semibold">STATUS: {(leave.status || 'APPROVED').toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4">
          {/* 🖨️ PRINTABLE PASS CONTAINER (Targeted by @media print for 1-Page fit) */}
          <div id="printable-pass-wrapper">
            <div id="printable-pass" className="p-3.5 sm:p-5 bg-slate-900 text-slate-100 space-y-3 rounded-xl border border-slate-800">

              {/* 1. College Header with Official Logo */}
              <div className="text-center border-b-2 border-slate-800 pb-2.5 flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-1 shadow-md border border-slate-300 flex items-center justify-center shrink-0">
                    <img
                      src={PEC_LOGO_URL}
                      alt="PEC Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase print-text-dark">PRATHYUSHA ENGINEERING COLLEGE</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-semibold print-text-dark">ESTD 2001 • Autonomous Institution • Approved by AICTE • Affiliated to Anna University</p>
                    <p className="text-[9px] sm:text-[10px] text-blue-400 font-mono font-bold uppercase print-text-primary">Poonamallee–Tiruvallur Road, Aranvayal Kuppam Village, Aranvayal Post, Tiruvallur, Tamil Nadu – 602025</p>
                  </div>
                </div>

                <div className="w-full mt-1.5 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-center print-header-banner">
                  <h3 className="text-xs font-black tracking-widest text-indigo-300 uppercase print-text-bold">OFFICIAL DIGITAL LEAVE PERMISSION GATE PASS</h3>
                </div>
              </div>

              {/* 2. QR Code + Student Details Section */}
              <div className="grid grid-cols-12 gap-3 items-center">

                {/* QR Code Box */}
                <div className="col-span-5 sm:col-span-4 flex flex-col items-center justify-center p-2.5 rounded-xl bg-white text-slate-950 shadow-xl border-2 border-indigo-500/40 print-bg-card">
                  {leave.photoUrl ? (
                    <img src={leave.photoUrl} alt={leave.studentName} className="w-12 h-12 rounded-full object-cover mb-1 border-2 border-indigo-600 shadow" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base mb-1">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="p-1.5 bg-white rounded-lg border border-slate-300 shadow-inner flex items-center justify-center">
                    <QRCodeSVG
                      value={qrPayload}
                      size={95}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <p className="text-[10px] font-mono font-black text-slate-900 mt-1 tracking-wider print-text-dark">
                    {leave.leaveId}
                  </p>
                  <span className="text-[8px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase mt-0.5 print-text-dark">
                    ● SECURITY SCANNABLE
                  </span>
                </div>

                {/* Detailed Student Information Grid */}
                <div className="col-span-7 sm:col-span-8 space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                    <span className="text-slate-400 text-[9px] uppercase font-mono block print-text-dark">Student Name</span>
                    <span className="font-black text-white text-sm sm:text-base print-text-dark">{leave.studentName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                      <span className="text-slate-400 text-[8px] uppercase font-mono block print-text-dark">Register No</span>
                      <span className="font-mono text-indigo-300 font-bold text-[11px] print-text-dark">{leave.registerNo}</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                      <span className="text-slate-400 text-[8px] uppercase font-mono block print-text-dark">Dept & Year</span>
                      <span className="font-bold text-white text-[11px] print-text-dark">{leave.department} ({leave.year})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                      <span className="text-slate-400 text-[8px] uppercase font-mono block print-text-dark">Hostel Block</span>
                      <span className="text-slate-200 font-semibold text-[11px] print-text-dark">{leave.hostelBlock || 'Block A'}</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                      <span className="text-slate-400 text-[8px] uppercase font-mono block print-text-dark">Room No / Sec</span>
                      <span className="text-slate-200 font-mono font-semibold text-[11px] print-text-dark">{leave.roomNo || 'A-304'} (Sec {leave.section || 'A'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Date & Time Authorizations */}
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs print-bg-card">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 print-bg-card">
                  <span className="text-amber-400 text-[8px] font-mono uppercase font-bold block print-text-dark">Authorized Out Date & Time</span>
                  <p className="font-extrabold text-white text-xs print-text-dark">{leave.outDate || leave.fromDate} @ {leave.outTime}</p>
                </div>

                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 print-bg-card">
                  <span className="text-emerald-400 text-[8px] font-mono uppercase font-bold block print-text-dark">Authorized Return Date & Time</span>
                  <p className="font-extrabold text-white text-xs print-text-dark">{leave.returnDate || leave.toDate} @ {leave.returnTime}</p>
                </div>
              </div>

              {/* 4. Subject & Parent Phone */}
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs print-bg-card">
                <div>
                  <span className="text-slate-400 text-[9px] font-semibold print-text-dark">Permission Reason / Subject:</span>
                  <p className="font-semibold text-slate-200 text-xs print-text-dark">{leave.subject}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 print-text-dark">
                    <Phone className="w-3 h-3 text-indigo-400" /> Parent Contact Phone:
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-xs print-text-dark">{leave.parentPhone}</span>
                </div>
              </div>

              {/* 5. Hierarchical Authorization Approval Chain */}
              <div className="pt-2 border-t-2 border-slate-800">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-1 text-center print-text-dark">
                  INSTITUTIONAL AUTHORIZATION STAMPS
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                    <span className="text-emerald-400 font-bold block print-text-dark">✓ VERIFIED</span>
                    <span className="text-slate-300 font-semibold print-text-dark">Mentor: {leave.mentorName || 'Prof. Kalaimani'}</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                    <span className="text-emerald-400 font-bold block print-text-dark">✓ APPROVED</span>
                    <span className="text-slate-300 font-semibold print-text-dark">HOD: {leave.hodName || 'Dr. Anthilakshmi'}</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 print-bg-card">
                    <span className="text-emerald-400 font-bold block print-text-dark">✓ ISSUED</span>
                    <span className="text-slate-300 font-semibold print-text-dark">Warden: {leave.wardenName || 'Mr. Ravi'}</span>
                  </div>
                </div>
              </div>

              {/* 6. Warden Seal & Gate Notice */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                <span className="font-mono font-bold text-slate-400 print-text-dark">
                  🔒 PEC AUTOMATED CLEARANCE SYSTEM • VALID FOR SINGLE USE ONLY
                </span>
                <span className="font-mono text-indigo-400 font-bold print-text-dark">
                  AUTHORIZED DIGITAL SIGNATURE
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Screen-Only Action Footer */}
        <div className="no-print bg-slate-900 px-4 sm:px-5 py-3 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Digital Gate Pass</span>
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

