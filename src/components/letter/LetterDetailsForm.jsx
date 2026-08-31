import React from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Send,
  HelpCircle,
  Phone
} from 'lucide-react';
import LiveSyncBadge from './LiveSyncBadge';

export default function LetterDetailsForm({ 
  formData, 
  onChange, 
  onSubmit, 
  studentProfile, 
  mentorName,
  loading 
}) {
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-[20px] border border-blue-500/30 glow-blue bg-slate-900/90 shadow-2xl space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Official Leave Application Form
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in your leave details below. The official document on the right updates live.
          </p>
        </div>
        <LiveSyncBadge />
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        {/* Read-Only Auto-Filled Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div>
            <label className="text-slate-500 text-[10px] font-mono block uppercase">From (Student)</label>
            <p className="font-bold text-white truncate">{studentProfile?.name || 'Rahul Sharma'}</p>
            <p className="text-indigo-400 font-mono text-[10px]">{studentProfile?.registerNo || '111424149000'}</p>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] font-mono block uppercase">To (Assigned Mentor)</label>
            <p className="font-bold text-cyan-300 truncate">{mentorName || 'Prof. Kalaimani'}</p>
            <p className="text-slate-400 text-[10px]">{formData?.department || 'CSE'} Mentor</p>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] font-mono block uppercase">Application Date</label>
            <p className="font-mono font-bold text-amber-400">{currentDate}</p>
            <p className="text-slate-500 text-[10px]">Auto-stamped</p>
          </div>
        </div>

        {/* Leave Type & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Leave Type</label>
            <select
              name="leaveType"
              value={formData?.leaveType || 'Medical Leave'}
              onChange={onChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Medical Leave">Medical Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="On-Duty (OD)">On-Duty (OD)</option>
              <option value="Weekend Pass">Weekend Pass</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Salutation</label>
            <select
              name="salutation"
              value={formData?.salutation || 'Respected Sir,'}
              onChange={onChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Respected Sir,">Respected Sir,</option>
              <option value="Respected Madam,">Respected Madam,</option>
              <option value="Respected Sir / Madam,">Respected Sir / Madam,</option>
            </select>
          </div>
        </div>

        {/* Subject Input */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Subject Line</label>
          <input
            type="text"
            name="subject"
            value={formData?.subject || ''}
            onChange={onChange}
            placeholder="Permission for Medical Consultation & Rest"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-medium focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={formData?.fromDate || ''}
              onChange={onChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">To Date</label>
            <input
              type="date"
              name="toDate"
              value={formData?.toDate || ''}
              onChange={onChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Out Time</label>
            <input
              type="text"
              name="outTime"
              value={formData?.outTime || '09:00 AM'}
              onChange={onChange}
              placeholder="09:00 AM"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Return Time</label>
            <input
              type="text"
              name="returnTime"
              value={formData?.returnTime || '06:00 PM'}
              onChange={onChange}
              placeholder="06:00 PM"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Reason Textarea & Helper Text */}
        <div className="space-y-1">
          <label className="block text-slate-300 font-semibold">
            Reason for Leave (Merged into Letter)
          </label>
          <textarea
            name="reason"
            rows="3"
            value={formData?.reason || ''}
            onChange={onChange}
            placeholder="Diagnosed with severe viral fever. Doctor advised 2 days complete rest at home."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-cyan-400 focus:outline-none leading-relaxed"
            required
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Please provide a clear and genuine reason for your leave request.</span>
          </div>
        </div>

        {/* Hostel Block, Room Number & Parent Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Hostel Block</label>
            <input
              type="text"
              name="hostelBlock"
              value={formData?.hostelBlock || studentProfile?.hostelBlock || 'Boys Hostel - Block A'}
              onChange={onChange}
              placeholder="Boys Hostel - Block A"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Room Number</label>
            <input
              type="text"
              name="roomNo"
              value={formData?.roomNo || studentProfile?.roomNo || ''}
              onChange={onChange}
              placeholder="AG0"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Parent Phone Number</label>
            <div className="relative">
              <input
                type="text"
                name="parentPhone"
                value={formData?.parentPhone || '+91 98765 43210'}
                onChange={onChange}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:border-cyan-400"
                required
              />
              <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
          </div>
        </div>

        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800 w-full">
            <input
              type="checkbox"
              name="parentConsent"
              checked={formData?.parentConsent ?? true}
              onChange={onChange}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
            <span className="text-slate-300 text-xs font-semibold">
              Parent Consent Verified
            </span>
          </label>
        </div>

        {/* Submit Request Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group cursor-pointer"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting Leave Request...' : 'Submit Official Leave Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
