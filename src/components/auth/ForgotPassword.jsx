import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { requestForgotPasswordApi, resetPasswordApi } from '../../services/apiService';
import PasswordInput from './PasswordInput';

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'sent' | 'reset'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your college email or register number.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await requestForgotPasswordApi(email);
      setIsLoading(false);
      setMessage(res.message || 'If an account exists, reset instructions have been dispatched.');
      setStep('reset');
    } catch (err) {
      setIsLoading(false);
      setError('Failed to process request. Please try again.');
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await resetPasswordApi(email, newPassword);
      setIsLoading(false);
      if (res.success) {
        setMessage('Your password has been successfully updated! You can now sign in.');
        setStep('done');
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error resetting password. Please try again.');
    }
  };

  return (
    <div className="space-y-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
          Account Recovery
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
        <p className="text-xs text-slate-400">
          Enter your registered college email or register number to receive reset instructions.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              College Email or Register Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Register Number or Email"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Account...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Reset Request</span>
              </>
            )}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleSetNewPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save New Password & Continue</span>
              </>
            )}
          </button>
        </form>
      )}

      {step === 'done' && (
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition"
        >
          <span>Return to Sign In</span>
        </button>
      )}
    </div>
  );
}
