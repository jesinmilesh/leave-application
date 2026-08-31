import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { PEC_LOGO_URL } from '../mockData';

export default function Navbar({
  activeUser,
  currentRole,
  onLogout,
  notifications = [],
  unreadCount = 0,
  onClearNotifications,
  onMarkRead,
  onDeleteNotification,
  onOpenNotification
}) {
  const [showNotifs, setShowNotifs] = useState(false);


  return (
    <header className="no-print sticky top-0 z-40 glass-panel border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: PEC Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white p-1 shadow-md border border-indigo-500/30 flex items-center justify-center overflow-hidden">
            <img
              src={PEC_LOGO_URL}
              alt="Prathyusha Engineering College Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                PEC LEAVE PORTAL
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono font-bold">
                  {currentRole.toUpperCase()}
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Prathyusha Engineering College • Paperless Multi-Level Approval System
            </p>
          </div>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {/* Active User Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            {activeUser?.photoUrl ? (
              <img src={activeUser.photoUrl} alt={activeUser.name} className="w-7 h-7 rounded-full object-cover border border-indigo-500/40" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                {activeUser?.name?.[0] || 'U'}
              </div>
            )}

            <div className="text-left">
              <p className="text-xs font-bold text-slate-100 truncate max-w-[140px]">{activeUser?.name || 'Logged User'}</p>
              <p className="text-[10px] text-indigo-400 font-mono font-medium">
                {activeUser?.registerNo ? activeUser.registerNo : activeUser?.department || 'PEC'}
              </p>
            </div>
          </div>


          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl border border-slate-700 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Notifications ({unreadCount > 0 ? `${unreadCount} new` : notifications.length})</h3>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-rose-400 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No notifications right now.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id || n._id}
                        className={`p-2.5 rounded-lg border text-left text-xs space-y-1.5 transition ${n.isRead ? 'bg-slate-900/60 border-slate-800/80 opacity-80' : 'bg-slate-900 border-indigo-500/40 glow-blue'
                          }`}
                      >
                        <div className="flex gap-2 items-start justify-between">
                          <div className="flex gap-2 items-start">
                            <div className={`p-1 rounded mt-0.5 ${n.isRead ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{n.title}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.time || 'Just now')}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteNotification && onDeleteNotification(n.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition"
                            title="Delete Notification"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Actions bar: Mark as Read & Open */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
                          {!n.isRead && (
                            <button
                              onClick={() => onMarkRead && onMarkRead(n.id)}
                              className="text-indigo-400 hover:underline font-semibold"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (onMarkRead && !n.isRead) onMarkRead(n.id);
                              setShowNotifs(false);
                              if (onOpenNotification) onOpenNotification(n);
                            }}
                            className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
            title="Logout of session"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
