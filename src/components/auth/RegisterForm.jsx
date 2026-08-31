import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Hash, Building2, Calendar, Users, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { DEPARTMENTS } from '../../mockData';
import { registerUser } from '../../services/apiService';
import AuthMessage from './AuthMessage';
import PasswordInput from './PasswordInput';

export default function RegisterForm({ onRegisterSuccess, onBackToLogin }) {
  const [role, setRole] = useState('STUDENT');
  const [fullName, setFullName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('CSE (Cyber Security)');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('A');
  const [hostelType, setHostelType] = useState('Boys Hostel');
  const [boysBlock, setBoysBlock] = useState('A Block');
  const [roomNo, setRoomNo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full Name and Email Address are required.');
      return;
    }

    if (role === 'STUDENT' && !registerNumber.trim()) {
      setErrorMsg('Register Number is required for student registration.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const computedHostelBlock = hostelType === 'Boys Hostel' ? `Boys Hostel - ${boysBlock}` : 'Girls Hostel';
      const payload = {
        role,
        fullName: fullName.trim(),
        registerNumber: registerNumber.trim(),
        email: email.trim(),
        password,
        department,
        year,
        section,
        hostelBlock: computedHostelBlock,
        roomNo: roomNo.trim()
      };

      const response = await registerUser(payload);
      setIsLoading(false);

      if (response && response.user) {
        setSuccessMsg(`Registration successful! Logging into ${response.user.role} Dashboard...`);
        setTimeout(() => {
          onRegisterSuccess(response.user.role, response.user);
        }, 800);
      } else if (response && response.message) {
        setErrorMsg(response.message);
      } else {
        setErrorMsg('Registration failed. Please check your information and try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Network error during registration.');
    }
  };

  return (
    <div className="space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Already registered? Sign In</span>
        </button>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          PEC Account Registration
        </span>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white">Create Portal Account</h3>
        <p className="text-xs text-slate-400">
          Select your institutional role and enter your details to create an official account.
        </p>
      </div>

      {/* Role Selection Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Select Role</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {[
            { id: 'STUDENT', label: 'Student' },
            { id: 'MENTOR', label: 'Mentor' },
            { id: 'HOD', label: 'HOD' },
            { id: 'WARDEN', label: 'Warden' },
            { id: 'MAIN_GATE', label: 'Main Gate' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`py-2 rounded-lg text-xs font-bold transition ${role === r.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <AuthMessage message={errorMsg} onClose={() => setErrorMsg('')} />
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Name"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'STUDENT' ? 'user@gmail.com' : 'user@prathyusha.edu.in'}
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {role === 'STUDENT' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Register Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="111424149000"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={role === 'STUDENT'}
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            {/* Hostel Type, Block & Room Number */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hostel Type</label>
                  <select
                    value={hostelType}
                    onChange={(e) => setHostelType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                  </select>
                </div>

                {hostelType === 'Boys Hostel' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Boys Hostel Block</label>
                    <select
                      value={boysBlock}
                      onChange={(e) => setBoysBlock(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="A Block">A Block</option>
                      <option value="B Block">B Block</option>
                      <option value="C Block">C Block</option>
                      <option value="D Block">D Block</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      placeholder="AG0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                      required={role === 'STUDENT'}
                    />
                  </div>
                )}
              </div>

              {hostelType === 'Boys Hostel' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="AG0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                    required={role === 'STUDENT'}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {(role === 'MENTOR' || role === 'HOD') && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>{d.code}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>
        </div>

        {password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Password Strength</span>
              <span className="font-bold text-slate-200">{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-98 mt-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Complete Registration ({role})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

