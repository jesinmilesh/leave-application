import React from 'react';
import { AlertCircle, UserPlus, XCircle, ShieldAlert } from 'lucide-react';

export default function AuthMessage({ type = 'error', message, notFound = false, onRegisterClick, onClose }) {
  if (!message) return null;

  const isNotFound = notFound || message.toLowerCase().includes('account not found') || message.toLowerCase().includes('register');

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
      isNotFound 
        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
    }`}>
      <div className="flex items-start gap-3">
        {isNotFound ? (
          <UserPlus className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 space-y-2">
          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
            {message}
          </p>

          {/* Account Not Found -> Immediate Create Account Button */}
          {isNotFound && onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="mt-2.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-amber-500/20 active:scale-95 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          )}
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Dismiss message"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
