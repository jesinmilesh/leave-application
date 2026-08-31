import React, { useState } from 'react';
import { Mail, UserPlus, KeyRound, ShieldCheck, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import PasswordInput from './PasswordInput';
import RememberMe from './RememberMe';
import LoginButton from './LoginButton';
import AuthMessage from './AuthMessage';
import { loginUser, changePasswordApi } from '../../services/apiService';

export default function LoginForm({ onLoginSuccess, onNavigateRegister, onForgotPasswordClick }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);

  // Force First Login Password Change Modal State
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsNotFound(false);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your Email/Register Number and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(identifier.trim(), password);
      setIsLoading(false);

      if (response && response.user) {
        if (response.user.isFirstLogin) {
          // Force mandatory first-login password update
          setPendingUser(response.user);
          setShowFirstLoginModal(true);
        } else {
          setIsSuccess(true);
          setTimeout(() => {
            onLoginSuccess(response.user.role, response.user);
          }, 600);
        }
      } else if (response && (response.notFound || response.error === 'Account Not Found')) {
        setIsNotFound(true);
        setErrorMessage('Account not found. Please check your credentials or click Register to create a new account.');
      } else if (response && response.message) {
        setErrorMessage(response.message);
      } else if (response && response.error) {
        setErrorMessage(response.error);
      } else {
        setErrorMessage('Incorrect password or account details. Please try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Unable to connect to college server. Please check your network connection.');
    }
  };

  const handleForcePasswordChange = async (e) => {
    e.preventDefault();
    setChangeError('');

    if (!newPassword || newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError('Passwords do not match.');
      return;
    }

    if (newPassword === 'PEC@Leave26!' || newPassword === 'PEC@Leave2026!') {
      setChangeError('Please choose a unique new password different from the initial default password.');
      return;
    }

    setIsChanging(true);
    try {
      const res = await changePasswordApi(pendingUser.id, newPassword);
      setIsChanging(false);

      if (res && res.user) {
        setShowFirstLoginModal(false);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(res.user.role, res.user);
        }, 600);
      } else {
        setChangeError(res.message || res.error || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setIsChanging(false);
      setChangeError('Network error updating password.');
    }
  };

  const handleQuickFill = (emailVal, passVal = 'PEC@Leave26!') => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setErrorMessage('');
    setIsNotFound(false);
  };

  return (
    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-0.5">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-[11px] text-slate-400 font-medium">
          Sign in using your Email or Register Number
        </p>
      </div>

      {/* Auth Error & Info Message */}
      {errorMessage && (
        <AuthMessage
          message={errorMessage}
          notFound={isNotFound}
          onRegisterClick={onNavigateRegister}
          onClose={() => { setErrorMessage(''); setIsNotFound(false); }}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email or Register Number */}
        <div>
          <label htmlFor="identifier-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
            Email or Register Number
          </label>
          <div className="relative">
            <input
              id="identifier-input"
              name="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your Register Number or Email"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition duration-200"
              required
              disabled={isLoading || isSuccess}
              autoComplete="username"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password-input" className="block text-[11px] font-semibold text-slate-300">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              disabled={isLoading || isSuccess}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
            >
              Forgot Password?
            </button>
          </div>
          <PasswordInput
            id="login-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading || isSuccess}
          />
        </div>

        {/* Remember Me */}
        <div className="pt-0.5">
          <RememberMe
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={isLoading || isSuccess}
          />
        </div>

        {/* Login Button */}
        <div className="pt-1">
          <LoginButton
            isLoading={isLoading}
            isSuccess={isSuccess}
            disabled={isLoading || isSuccess}
          />
        </div>
      </form>

      {/* Register Link Navigation */}
      <div className="pt-2 border-t border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-blue-400 hover:text-blue-300 font-extrabold hover:underline transition ml-1 inline-flex items-center gap-1"
          >
            <span>Register Now</span>
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </p>
      </div>

      {/* FIRST LOGIN MANDATORY PASSWORD CHANGE MODAL */}
      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Mandatory Password Update</h3>
                <p className="text-xs text-slate-400">First Login Security Policy Enforced</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Welcome, <span className="font-bold text-white">{pendingUser?.name}</span>! For your security, you are required to change your initial password before accessing the PEC Leave Portal.
            </p>

            {changeError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{changeError}</span>
              </div>
            )}

            <form onSubmit={handleForcePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <PasswordInput
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={isChanging}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-98 disabled:opacity-50"
              >
                {isChanging ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Password & Enter Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

