import React from 'react';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function LoginButton({ isLoading, isSuccess, disabled, onClick, type = "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`w-full py-3.5 px-6 min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg select-none active:scale-[0.98] ${
        isSuccess
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30'
          : isLoading || disabled
          ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-80 shadow-none'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 hover:shadow-blue-500/40 shadow-blue-600/30'
      }`}
    >
      {isSuccess ? (
        <>
          <CheckCircle className="w-5 h-5 text-emerald-300 animate-bounce" />
          <span>Success! Redirecting to Dashboard...</span>
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="w-5 h-5 text-white animate-spin" />
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <span>Sign In to Portal</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
