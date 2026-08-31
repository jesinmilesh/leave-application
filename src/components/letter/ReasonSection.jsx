import React from 'react';

export default function ReasonSection({ 
  fromDate, 
  toDate, 
  outTime, 
  returnTime, 
  reason 
}) {
  // Format date helper: e.g. "2026-08-15" -> "15 August 2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '15 August 2026';
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formattedFromDate = formatDateDisplay(fromDate);
  const formattedToDate = formatDateDisplay(toDate);
  const formattedOutTime = outTime || '09:00 AM';
  const formattedReturnTime = returnTime || '06:00 PM';

  const cleanReason = reason?.trim() || '';

  // Transform raw reason into a smooth, natural sentence
  const buildDynamicParagraph = () => {
    let reasonClause = 'due to personal and unavoidable circumstances.';
    
    if (cleanReason) {
      const lower = cleanReason.toLowerCase();
      if (lower.startsWith('i am') || lower.startsWith('i need') || lower.startsWith('i have') || lower.startsWith('as i')) {
        reasonClause = `as ${cleanReason.replace(/^[iI]\s+/, 'I ')}`;
      } else if (lower.startsWith('due to') || lower.startsWith('because of') || lower.startsWith('for')) {
        reasonClause = cleanReason;
      } else {
        reasonClause = `due to ${cleanReason.charAt(0).toLowerCase() + cleanReason.slice(1)}`;
      }
      if (!reasonClause.endsWith('.')) reasonClause += '.';
    }

    return `I respectfully request permission to avail leave from ${formattedFromDate} (${formattedOutTime}) to ${formattedToDate} (${formattedReturnTime}) ${reasonClause} I assure you that this request is made for a genuine and unavoidable reason.`;
  };

  return (
    <div className="space-y-3.5 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed text-justify">
      {/* Dynamic Reason Paragraph */}
      <p className="indent-6 font-normal text-slate-800">
        {buildDynamicParagraph()}
      </p>

      {/* Academic Commitment Paragraph */}
      <p className="indent-6 text-slate-800 font-normal">
        I assure you that I will responsibly complete all missed academic lectures, laboratory sessions, assignments, and other academic activities immediately upon my return to the college. I will coordinate with my faculty members and classmates to ensure that my studies remain uninterrupted.
      </p>

      {/* Parent Consent & Final Appeal */}
      <p className="indent-6 text-slate-800 font-normal">
        My parents are fully aware of this leave request and have provided their consent for this permission. I sincerely request you to consider my application and grant me permission for the above-mentioned period.
      </p>
    </div>
  );
}
