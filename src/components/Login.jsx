import React, { useState } from 'react';
import { Lock, Download, Smartphone } from 'lucide-react';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ForgotPassword from './auth/ForgotPassword';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Login({ onLogin }) {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const { handleInstall, isInstalled } = usePWAInstall();

  const handleLoginSuccess = (role, userData) => {
    onLogin(role, userData);
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative font-sans overflow-hidden">

      {/* Responsive PEC Campus Background Image - Vivid & Clear */}
      <div className="fixed inset-0 z-0 transition-opacity duration-700">
        <picture className="w-full h-full">
          <source media="(max-width: 640px)" srcSet="/bg.jpg" />
          <img
            src="/bg.jpg"
            alt="Prathyusha Engineering College Campus"
            className="w-full h-full object-cover object-center"
          />
        </picture>
        {/* Subtle Dark Vignette Mask so campus building is clear & visible while maintaining card contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-slate-950/50" />
      </div>

      {/* Top Navigation Header Bar */}
      <header className="relative z-10 py-2.5 px-4 sm:px-8 border-b border-white/10 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-lg border border-slate-300 flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="Prathyusha Engineering College Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase">
                PRATHYUSHA ENGINEERING COLLEGE
              </h1>
              <p className="text-[10px] sm:text-[11px] text-blue-400 font-semibold tracking-wide">
                Digital Leave Permission Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold border border-blue-400/30 shadow-lg active:scale-95 transition"
              title="Download & Install PEC Web App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
              <span>{isInstalled ? 'App Installed' : 'Install Web App'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Centered Main Authentication Window - Auto-scrollable for long forms like Register */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-3 sm:p-4 my-auto overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/20 shadow-2xl bg-slate-950/85 backdrop-blur-xl space-y-3.5 max-h-[calc(100vh-100px)] overflow-y-auto">

            {/* College Branding Header inside Card */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-lg border border-slate-200 mx-auto flex items-center justify-center">
                <img src="/logo.jpg" alt="PEC Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Welcome to Prathyusha
                </h1>
                <h2 className="text-[11px] sm:text-xs font-bold text-blue-400 tracking-wider uppercase">
                  PRATHYUSHA ENGINEERING COLLEGE
                </h2>
              </div>
            </div>

            {/* View Selector Tabs [ Sign In ] [ Register ] */}
            {viewMode !== 'forgot' && (
              <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 ${viewMode === 'login'
                      ? 'text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 ${viewMode === 'register'
                      ? 'text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Register Now
                </button>
              </div>
            )}

            {/* Auth Forms */}
            {viewMode === 'login' && (
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onNavigateRegister={() => setViewMode('register')}
                onForgotPasswordClick={() => setViewMode('forgot')}
              />
            )}

            {viewMode === 'register' && (
              <RegisterForm
                onRegisterSuccess={handleLoginSuccess}
                onBackToLogin={() => setViewMode('login')}
              />
            )}

            {viewMode === 'forgot' && (
              <ForgotPassword
                onBackToLogin={() => setViewMode('login')}
              />
            )}

          </div>
        </div>
      </main>

      {/* Compact Page Footer */}
      <footer className="relative z-10 py-2 px-4 border-t border-slate-900/80 bg-slate-950/90 text-center text-[11px] text-slate-400 shrink-0">
        <p className="font-semibold text-slate-300">Prathyusha Engineering College • Digital Leave Permission Portal</p>
      </footer>
    </div>
  );
}
