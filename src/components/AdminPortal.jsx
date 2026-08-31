import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  FileSpreadsheet,
  Upload,
  Search,
  UserCheck
} from 'lucide-react';
import { DEPARTMENTS } from '../mockData';
import { 
  fetchAllUsersApi, 
  fetchMentorAssignments, 
  saveMentorAssignmentApi,
  bulkImportUsersApi 
} from '../services/apiService';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'mentors' | 'depts' | 'holidays' | 'bulk'
  const [userList, setUserList] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [bulkStatus, setBulkStatus] = useState(null);

  // Mentor Assignment Form
  const [mentorForm, setMentorForm] = useState({
    department: 'CSE',
    year: '3rd Year',
    section: 'A',
    mentorId: ''
  });

  const loadData = async () => {
    const users = await fetchAllUsersApi();
    if (Array.isArray(users) && users.length > 0) {
      setUserList(users);
    }
    const ment = await fetchMentorAssignments();
    if (ment && ment.assignments) {
      setAssignments(ment.assignments);
      setMentorsList(ment.mentors || []);
      if (ment.mentors?.length > 0 && !mentorForm.mentorId) {
        setMentorForm(prev => ({ ...prev, mentorId: ment.mentors[0].id }));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMentorMapping = async (e) => {
    e.preventDefault();
    if (!mentorForm.mentorId) {
      alert("Please select a mentor.");
      return;
    }
    await saveMentorAssignmentApi(mentorForm);
    alert("Automatic Mentor Assignment saved successfully!");
    loadData();
  };

  const filteredUsers = userList.filter(u => 
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⚙️ System Administration & User Management
          </h2>
          <p className="text-xs text-slate-400">
            Manage institutional users, automated mentor mapping, wardens, departments & bulk imports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'mentors' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Mentor Mappings
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'depts' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Bulk Import
          </button>
        </div>
      </div>

      {/* TAB 1: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User List Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Active System Users ({userList.length})</h3>
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search user..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-bold text-indigo-400">{u.id}</td>
                      <td className="p-3 font-bold text-white">{u.name}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{u.department}</td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATIC MENTOR MAPPINGS */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Automatic Mentor Assignment (Dept + Year + Section)
            </h3>

            <form onSubmit={handleSaveMentorMapping} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Department</label>
                <select
                  value={mentorForm.department}
                  onChange={(e) => setMentorForm({ ...mentorForm, department: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Academic Year</label>
                <select
                  value={mentorForm.year}
                  onChange={(e) => setMentorForm({ ...mentorForm, year: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Section</label>
                <select
                  value={mentorForm.section}
                  onChange={(e) => setMentorForm({ ...mentorForm, section: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assigned Mentor</label>
                <select
                  value={mentorForm.mentorId}
                  onChange={(e) => setMentorForm({ ...mentorForm, mentorId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  {mentorsList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg py-2 transition shadow-md shadow-emerald-600/30"
                >
                  Assign Mentor
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Current Mentor Mappings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Department</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Assigned Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white">{a.department}</td>
                      <td className="p-3 text-slate-300">{a.year}</td>
                      <td className="p-3 font-mono text-cyan-300">Sec {a.section}</td>
                      <td className="p-3 font-semibold text-emerald-400">{a.mentor?.name || 'Mentor'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'depts' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Configured Departments ({DEPARTMENTS.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {DEPARTMENTS.map((d) => (
              <div key={d.code} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-300 text-base block">{d.code}</span>
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BULK EXCEL UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Bulk Excel / CSV Student & Staff Upload</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload an Excel sheet (.xlsx, .csv) with columns: <code>Name, RegisterNo, Department, Year, Section, Role, Email</code>.
          </p>

          <div className="pt-2">
            <button
              onClick={async () => {
                setBulkStatus('processing');
                const sampleImportBatch = [
                  { name: 'Kavitha S', registerNo: '718122CSE088', department: 'CSE', year: '3rd Year', section: 'A', role: 'Student', parentPhone: '+91 94441 12345' },
                  { name: 'Dinesh Kumar', registerNo: '718122AIDS012', department: 'AIDS', year: '2nd Year', section: 'B', role: 'Student', parentPhone: '+91 94442 67890' },
                  { name: 'Priya Dharshini', registerNo: '718122ECE045', department: 'ECE', year: '4th Year', section: 'A', role: 'Student', parentPhone: '+91 94443 11223' }
                ];
                const res = await bulkImportUsersApi(sampleImportBatch);
                setBulkStatus('success');
                loadData();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-xl shadow-emerald-600/30"
            >
              <Upload className="w-4 h-4" />
              <span>Process & Import Excel File (.xlsx)</span>
            </button>
          </div>

          {bulkStatus === 'processing' && (
            <p className="text-xs text-amber-400 font-mono animate-pulse">
              Processing Excel sheet records... registering student profiles...
            </p>
          )}

          {bulkStatus === 'success' && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold max-w-md mx-auto">
              ✓ Successfully processed and added student records.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
