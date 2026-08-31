import React from 'react';

export default function RememberMe({ checked, onChange, disabled = false }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-medium select-none group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 focus:ring-offset-slate-950 accent-blue-600 cursor-pointer transition disabled:opacity-50"
      />
      <span className="group-hover:text-white transition">Remember me on this device</span>
    </label>
  );
}
