import React from 'react';

export default function ClosingSection({ studentProfile, formData }) {
  const name = studentProfile?.name || formData?.studentName || 'Jesin Milesh';
  const registerNo = studentProfile?.registerNo || formData?.registerNo || '111424149024';
  const dept = formData?.department || studentProfile?.department || 'CSE (Cyber Security)';
  const year = formData?.year || studentProfile?.year || '3rd Year';

  return (
    <div className="pt-6 mt-6 text-left font-sans text-slate-900 leading-relaxed">
      {/* 1. Thanking You */}
      <div className="mb-4">
        <p className="text-[18px] font-medium text-slate-800">Thanking You,</p>
      </div>

      {/* 2. Yours Respectfully */}
      <div className="mb-2">
        <p className="text-[18px] font-medium text-slate-800">Yours Respectfully,</p>
      </div>

      {/* 3. Student Name (Standard Font, No Cursive Signature) */}
      <div className="mb-1">
        <p className="text-[18px] font-bold text-slate-900">
          {name}
        </p>
      </div>

      {/* 4. Register Number in Brackets */}
      <div className="mb-1">
        <p className="text-[16px] text-slate-800 font-normal">
          ({registerNo})
        </p>
      </div>

      {/* 5. Department & Year */}
      <div>
        <p className="text-[16px] font-normal text-[#4B5563]">
          {dept} – {year}
        </p>
      </div>
    </div>
  );
}
