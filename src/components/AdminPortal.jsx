import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil,
  FileSpreadsheet,
  Upload,
  Search,
  UserCheck,
  X,
  Check,
  Shield,
  Calendar,
  UserPlus
} from 'lucide-react';
import { DEPARTMENTS, USERS as MOCK_USERS } from '../mockData';
import { 
  fetchAllUsersApi, 
  fetchMentorAssignments, 
  saveMentorAssignmentApi,
  bulkImportUsersApi,
  updateUserApi,
  deleteUserApi
} from '../services/apiService';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'mentors' | 'depts' | 'bulk'
  const [userList, setUserList] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [bulkStatus, setBulkStatus] = useState(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: 'CSE (CYBER SECURITY)',
    registerNumber: ''
  });

  // Delete User Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: 'CSE (CYBER SECURITY)',
    registerNumber: ''
  });

  // Mentor Assignment Form
  const [mentorForm, setMentorForm] = useState({
    department: 'CSE (CYBER SECURITY)',
    year: '3rd Year',
    section: 'A',
    mentorId: ''
  });

  const getCleanUserRegNo = (u) => {
    if (!u) return 'PEC-101';
    const reg = u.registerNo || u.registerNumber;
    if (reg && (!reg.includes('-') || reg.length < 20)) {
      return reg;
    }
    const r = (u.role || '').toUpperCase();
    if (r.includes('STUDENT')) return '111424149024';
    if (r.includes('MENTOR')) return 'MEN-101';
    if (r.includes('HOD')) return 'HOD-201';
    if (r.includes('WARDEN')) return 'WAR-301';
    if (r.includes('GATE') || r.includes('SECURITY')) return 'SEC-401';
    if (r.includes('PRINCIPAL')) return 'PRI-501';
    if (r.includes('ADMIN')) return 'ADM-901';
    return 'PEC-101';
  };

  const loadData = async () => {
    const apiUsers = await fetchAllUsersApi();
    if (Array.isArray(apiUsers) && apiUsers.length > 0) {
      // Map API user format
      const formatted = apiUsers.map(u => ({
        id: u.id,
        name: u.name || u.fullName || 'System User',
        email: u.email,
        role: u.role || 'Student',
        department: u.department || 'CSE (CYBER SECURITY)',
        registerNo: getCleanUserRegNo(u),
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : '2026-08-20 10:30 AM'
      }));
      setUserList(formatted);
    } else {
      // Fallback mock users with createdAt timestamps
      const fallbackUsers = MOCK_USERS.map((u, idx) => ({
        ...u,
        registerNo: getCleanUserRegNo(u),
        createdAt: u.createdAt || `2026-08-${15 + idx} 09:30 AM`
      }));
      setUserList(fallbackUsers);
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

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Student',
      department: user.department || 'CSE (CYBER SECURITY)',
      registerNumber: getCleanUserRegNo(user)
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    // Call API
    await updateUserApi({
      userId: editingUser.id,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      department: editForm.department
    });

    // Update Local State
    setUserList(prev => prev.map(u => u.id === editingUser.id ? {
      ...u,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      department: editForm.department,
      registerNo: editForm.registerNumber || u.registerNo
    } : u));

    setEditingUser(null);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Call API
    await deleteUserApi(deletingUser.id);

    // Update Local State
    setUserList(prev => prev.filter(u => u.id !== deletingUser.id));
    setDeletingUser(null);
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) {
      alert("Name and Email are required.");
      return;
    }

    const newUser = {
      id: addForm.registerNumber || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: addForm.name,
      email: addForm.email,
      role: addForm.role,
      department: addForm.department,
      registerNo: addForm.registerNumber || `REG-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    setUserList(prev => [newUser, ...prev]);
    setShowAddModal(false);
    setAddForm({ name: '', email: '', role: 'Student', department: 'CSE (CYBER SECURITY)', registerNumber: '' });
  };

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
    u.department?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.registerNo && u.registerNo.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.id && u.id.toLowerCase().includes(searchUser.toLowerCase()))
  );

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('STUDENT')) return 'bg-blue-950/80 text-blue-300 border-blue-700/50';
    if (r.includes('MENTOR')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
    if (r.includes('HOD')) return 'bg-purple-950/80 text-purple-300 border-purple-700/50';
    if (r.includes('WARDEN')) return 'bg-amber-950/80 text-amber-300 border-amber-700/50';
    if (r.includes('GATE') || r.includes('SECURITY')) return 'bg-orange-950/80 text-orange-300 border-orange-700/50';
    if (r.includes('PRINCIPAL')) return 'bg-teal-950/80 text-teal-300 border-teal-700/50';
    return 'bg-slate-800 text-indigo-300 border-slate-700';
  };

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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'mentors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Mentor Mappings
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'depts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'bulk' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Active System Users ({filteredUsers.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage user profiles, registration timestamps, roles, and system credentials.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search by ID, name, dept..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User ID / Reg No</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Registered Time & Date</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-mono text-xs">
                        No system users found matching "{searchUser}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/60 transition">
                        {/* User ID */}
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded text-[11px] block w-fit">
                            {getCleanUserRegNo(u)}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="p-3.5 font-bold text-white">
                          {u.name}
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="p-3.5 text-slate-200 font-medium">
                          {u.department}
                        </td>

                        {/* Email */}
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {u.email}
                        </td>

                        {/* Registered Time and Date */}
                        <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{u.createdAt}</span>
                        </td>

                        {/* Action Options (Edit & Delete) */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit User Details"
                              className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 hover:bg-blue-900/80 hover:text-blue-200 border border-blue-800/40 transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingUser(u)}
                              title="Delete User Record"
                              className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/80 hover:text-red-200 border border-red-800/40 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Academic Year</label>
                <select
                  value={mentorForm.year}
                  onChange={(e) => setMentorForm({ ...mentorForm, year: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
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
          <h3 className="text-base font-bold text-white">Configured PEC Departments ({DEPARTMENTS.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEPARTMENTS.map((d) => (
              <div key={d.code} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-300 text-sm block">{d.code}</span>
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">ACTIVE</span>
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
                await bulkImportUsersApi(sampleImportBatch);
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

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-400" />
                Edit System User Record
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">User ID / Register Number</label>
                <input
                  type="text"
                  disabled
                  value={editForm.registerNumber}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono opacity-80"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Mentor">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="Warden">Warden</option>
                    <option value="Main Gate">Main Gate</option>
                    <option value="Principal">Principal</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-red-900/50 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-700/50 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete User Record?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently remove <strong className="text-white">{deletingUser.name}</strong> (<span className="font-mono text-indigo-300">{getCleanUserRegNo(deletingUser)}</span>)?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Add New System User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">User ID / Register Number</label>
                <input
                  type="text"
                  placeholder="e.g. 111424149024 or STU-102"
                  value={addForm.registerNumber}
                  onChange={(e) => setAddForm({ ...addForm, registerNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@prathyusha.edu.in"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Mentor">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="Warden">Warden</option>
                    <option value="Main Gate">Main Gate</option>
                    <option value="Principal">Principal</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
