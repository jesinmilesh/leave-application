import React from 'react';

export default function ToSection({ hodName, department }) {
  const hod = hodName || 'Dr. Anithalakshmi';
  const dept = department || 'CSE';

  return (
    <div className="text-slate-800 text-xs sm:text-sm font-sans space-y-0.5 leading-relaxed">
      <p className="font-extrabold uppercase text-slate-900 tracking-wider text-xs mb-1">To</p>
      <p className="font-bold text-slate-900 text-base">The Head of the Department ({hod})</p>
      <p className="text-slate-700 font-semibold">{dept} Department</p>
      <p className="text-slate-600 font-medium">Prathyusha Engineering College</p>
    </div>
  );
}
