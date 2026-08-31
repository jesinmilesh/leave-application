import React from 'react';

export default function FromSection({ studentProfile, formData }) {
  const name = studentProfile?.name || 'Jesin Milesh';
  const registerNo = studentProfile?.registerNo || '111424149000';
  const dept = formData?.department || studentProfile?.department || 'CSE';
  const year = formData?.year || studentProfile?.year || '3rd Year';
  const section = formData?.section || studentProfile?.section || 'A';
  const hostelBlock = formData?.hostelBlock || studentProfile?.hostelBlock || 'Boys Hostel - Block A';
  const roomNo = formData?.roomNo || studentProfile?.roomNo || 'AG0';

  return (
    <div className="text-slate-800 text-xs sm:text-sm font-sans space-y-0.5 leading-relaxed">
      <p className="font-extrabold uppercase text-slate-900 tracking-wider text-xs mb-1">From</p>
      <p className="font-bold text-slate-900 text-base">{name}</p>
      <p className="font-mono text-slate-700 font-medium">Register No: {registerNo}</p>
      <p className="text-slate-700 font-semibold">{dept} ({year}, Section {section})</p>
      <p className="text-slate-700 font-medium">Hostel: {hostelBlock} • Room No: {roomNo}</p>
      <p className="text-slate-600 font-medium">Prathyusha Engineering College</p>
    </div>
  );
}
