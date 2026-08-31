import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder = "Enter your password", 
  id = "password-input", 
  name = "password", 
  disabled = false,
  autoComplete = "current-password",
  className = "" 
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 pl-10 pr-11 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition duration-200 disabled:opacity-60 ${className}`}
        required
      />
      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        tabIndex={-1}
        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 focus:outline-none transition p-0.5 rounded"
        title={showPassword ? "Hide Password" : "Show Password"}
        aria-label={showPassword ? "Hide Password" : "Show Password"}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
