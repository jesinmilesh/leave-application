import React from 'react';
import { PEC_LOGO_URL } from '../../mockData';
import FromSection from './FromSection';
import ToSection from './ToSection';
import SubjectSection from './SubjectSection';
import ReasonSection from './ReasonSection';
import ClosingSection from './ClosingSection';
import DownloadPDFButton from './DownloadPDFButton';
import LiveSyncBadge from './LiveSyncBadge';

export default function LetterPreview({
  formData,
  studentProfile,
  mentorName,
  onPrint
}) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <LiveSyncBadge />
          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            Live Official Document Renderer
          </span>
        </div>
        <DownloadPDFButton onPrint={onPrint} />
      </div>

      {/* Official College Document Printable Paper Sheet */}
      <div
        id="printable-letter-preview"
        className="printable-document bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-300 relative overflow-hidden transition-all duration-300 max-w-3xl mx-auto"
        style={{ minHeight: '840px', fontFamily: '"Inter", "Source Sans Pro", sans-serif' }}
      >
        {/* Subtle Watermark Logo in Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <img src={PEC_LOGO_URL} alt="PEC Watermark" className="w-96 h-96 object-contain" />
        </div>

        {/* 1. College Header Branding */}
        <div className="border-b-2 border-indigo-900 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={PEC_LOGO_URL}
              alt="Prathyusha Engineering College Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
            />
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight uppercase leading-tight font-serif">
                PRATHYUSHA ENGINEERING COLLEGE
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider font-sans">
                ESTD 2001 • AN AUTONOMOUS INSTITUTION
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">
                Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai • Accredited by NAAC with 'A' Grade
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                Poonamallee–Tiruvallur Road, Aranvayal Kuppam Village, Aranvayal Post, Tiruvallur, Tamil Nadu – 602025
              </p>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-indigo-900 via-blue-600 to-indigo-950 mt-3 rounded-full" />
        </div>

        {/* 2. Document Title & Date */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 relative z-10 font-sans">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-xs rounded-md uppercase tracking-wider">
            OFFICIAL DIGITAL LEAVE APPLICATION
          </span>
          <p className="font-mono text-xs font-bold text-slate-700">
            Date: <span className="text-slate-900">{currentDate}</span>
          </p>
        </div>

        {/* 3. Address Blocks Grid (From & To) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 relative z-10">
          <FromSection studentProfile={studentProfile} formData={formData} />
          <ToSection hodName={formData?.hodName || studentProfile?.hodName || 'Dr. Anithalakshmi'} department={formData?.department || studentProfile?.department} />
        </div>

        {/* 4. Subject & Salutation */}
        <div className="relative z-10">
          <SubjectSection subject={formData?.subject} salutation={formData?.salutation} />
        </div>

        {/* 5. Dynamically Generated Reason & Academic Commitments */}
        <div className="relative z-10 my-4">
          <ReasonSection
            fromDate={formData?.fromDate}
            toDate={formData?.toDate}
            outTime={formData?.outTime}
            returnTime={formData?.returnTime}
            reason={formData?.reason}
          />
        </div>

        {/* 6. Closing & Digital Signature */}
        <div className="relative z-10">
          <ClosingSection studentProfile={studentProfile} formData={formData} />
        </div>

        {/* Footer Verification Bar */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono relative z-10">
          <span>OFFICIAL SYSTEM DOCUMENT • PRATHYUSHA ENGINEERING COLLEGE</span>
          <span>AUTHENTICATED BY STUDENT CREDENTIALS</span>
        </div>
      </div>
    </div>
  );
}
