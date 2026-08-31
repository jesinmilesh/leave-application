import React from 'react';

export default function SubjectSection({ subject, salutation }) {
  const displaySubject = subject?.trim() || 'Permission for Medical Consultation & Rest';
  const displaySalutation = salutation || 'Respected Sir,';

  return (
    <div className="space-y-3 my-4">
      <div className="p-3 bg-slate-100/90 rounded-lg border-l-4 border-indigo-600">
        <p className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-wide">
          Subject: <span className="underline decoration-indigo-500/50 underline-offset-4">{displaySubject}</span>
        </p>
      </div>

      <p className="font-bold text-slate-900 text-xs sm:text-sm pt-2">
        {displaySalutation}
      </p>
    </div>
  );
}
