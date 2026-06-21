import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS } from '../services/firebase';
import { 
  Settings, 
  Database, 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Building2, 
  Users, 
  Key,
  Edit,
  DollarSign,
  Calendar,
  AlertCircle,
  Search
} from 'lucide-react';

export const AdminPortal = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // directory | academic | reset

  // Data states
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({
    users: 0,
    students: 0,
    faculty: 0,
    counsellors: 0,
    librarians: 0,
    hods: 0,
    principals: 0
  });

  // Search & Filter directory states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form states (Create / Edit)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('Semester 1');
  const [rollNumber, setRollNumber] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fee structure & Academic Year states
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeBranch, setFeeBranch] = useState('CSE');
  const [feeSemester, setFeeSemester] = useState('Semester 1');
  const [semesterFee, setSemesterFee] = useState(45000);
  const [examFee, setExamFee] = useState(2000);
  const [busFee, setBusFee] = useState(15000);
  const [hostelFee, setHostelFee] = useState(30000);
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [employeeId, setEmployeeId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [assignedBranches, setAssignedBranches] = useState([]);

  const loadData = async () => {
    try {
      const data = await mockDB.getAllUsers();
      setUsers(data);

      const setup = mockDB.getAcademicSetup();
      setAcademicYear(setup.academicYear);
      setFeeStructures(setup.feeStructures);

      setCounts({
        users: data.length,
        students: data.filter(u => u.role === 'student').length,
        faculty: data.filter(u => u.role === 'faculty').length,
        counsellors: data.filter(u => u.role === 'counsellor').length,
        librarians: data.filter(u => u.role === 'librarian').length,
        hods: data.filter(u => u.role === 'hod').length,
        principals: data.filter(u => u.role === 'principal').length
      });
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterOrUpdate = async (e) => {
    e.preventDefault();
    if (!fullName || !email) return;

    try {
      setSubmitting(true);
      if (editUserId) {
        // Edit flow
        const updated = {
          fullName,
          email,
          role,
          department: ['admin', 'placement', 'librarian'].includes(role) ? 'N/A' : department,
          semester: role === 'student' ? semester : 'N/A',
          rollNumber: role === 'student' ? rollNumber : 'N/A',
          employeeId: ['student', 'admin'].includes(role) ? 'N/A' : employeeId,
          contactNumber: role === 'counsellor' ? contactNumber : 'N/A',
          assignedBranches: role === 'faculty' ? assignedBranches : []
        };
        await mockDB.updateUser(editUserId, updated);
        showToast('Account details updated successfully!', 'success');
      } else {
        // Create flow
        const newUser = {
          email,
          fullName,
          role,
          department: ['admin', 'placement', 'librarian'].includes(role) ? 'N/A' : department,
          semester: role === 'student' ? semester : 'N/A',
          rollNumber: role === 'student' ? rollNumber : 'N/A',
          employeeId: ['student', 'admin'].includes(role) ? 'N/A' : employeeId,
          contactNumber: role === 'counsellor' ? contactNumber : 'N/A',
          assignedBranches: role === 'faculty' ? assignedBranches : []
        };
        await mockDB.createUser(newUser);
        showToast(`Successfully created ${role} account!`, 'success');
      }

      // Reset Form fields
      setFullName('');
      setEmail('');
      setRollNumber('');
      setEmployeeId('');
      setContactNumber('');
      setAssignedBranches([]);
      setEditUserId(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.uid);
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department === 'N/A' ? 'CSE' : user.department);
    setSemester(user.semester === 'N/A' ? 'Semester 1' : user.semester);
    setRollNumber(user.rollNumber === 'N/A' ? '' : user.rollNumber);
    setEmployeeId(user.employeeId === 'N/A' ? '' : (user.employeeId || ''));
    setContactNumber(user.contactNumber === 'N/A' ? '' : (user.contactNumber || ''));
    setAssignedBranches(user.assignedBranches || []);
    setActiveTab('directory');
  };

  const handleDelete = (uid) => {
    setConfirmModal({
      show: true,
      title: 'Delete User Account',
      message: 'Are you sure you want to delete this user? All their records will be wiped permanently.',
      onConfirm: async () => {
        try {
          await mockDB.deleteUser(uid);
          showToast('User account successfully removed.', 'info');
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  };

  const handleResetPassword = async (uid, name) => {
    try {
      await mockDB.resetPassword(uid);
      showToast(`Password successfully reset to "password123" for ${name}!`, 'success');
    } catch (_) {
      showToast('Could not reset password.', 'error');
    }
  };

  const handleSaveAcademic = async (e) => {
    e.preventDefault();
    try {
      await mockDB.saveAcademicSetup(academicYear, feeStructures);
      showToast('Academic configurations saved successfully!', 'success');
    } catch (_) {
      showToast('Could not save academic settings.', 'error');
    }
  };

  const handleAddFeeStructure = () => {
    const existingIdx = feeStructures.findIndex(f => f.branch === feeBranch && f.semester === feeSemester);
    const newStructure = {
      branch: feeBranch,
      semester: feeSemester,
      semesterFee: Number(semesterFee),
      examFee: Number(examFee),
      busFee: Number(busFee),
      hostelFee: Number(hostelFee)
    };

    let updated = [...feeStructures];
    if (existingIdx !== -1) {
      updated[existingIdx] = newStructure;
    } else {
      updated.push(newStructure);
    }

    setFeeStructures(updated);
    showToast(`Fee structure updated for ${feeBranch} - ${feeSemester}!`, 'success');
  };

  const handleResetDB = () => {
    setConfirmModal({
      show: true,
      title: 'Hard Reset Database',
      message: 'Are you sure you want to perform a hard reset of the KBN database? This wipes all modifications.',
      onConfirm: () => {
        mockDB.resetDatabase();
        showToast('ERP database reset to seeding defaults.', 'success');
      }
    });
  };

  // Filters search list
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-650 to-indigo-755 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">KBN System Administration Portal</h2>
          <p className="text-sm text-rose-100 mt-1">Configure directories, database setups, and global compliance fees</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Settings size={24} />
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center text-xs font-semibold">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Students</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.students}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Faculty</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.faculty}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Counsellors</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.counsellors}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Librarians</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.librarians}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">HODs</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.hods}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Principal</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.principals}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Total Accounts</span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">{counts.users}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-xs font-bold transition-all uppercase tracking-wider relative ${
            activeTab === 'directory' 
              ? 'text-rose-650 dark:text-rose-400 border-b-2 border-rose-500 font-extrabold' 
              : 'text-slate-455 dark:text-slate-400'
          }`}
        >
          Users Directory
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-3 text-xs font-bold transition-all uppercase tracking-wider relative ${
            activeTab === 'academic' 
              ? 'text-rose-650 dark:text-rose-400 border-b-2 border-rose-500 font-extrabold' 
              : 'text-slate-455 dark:text-slate-400'
          }`}
        >
          Academic & Fees Setup
        </button>
        <button
          onClick={() => setActiveTab('reset')}
          className={`pb-3 text-xs font-bold transition-all uppercase tracking-wider relative ${
            activeTab === 'reset' 
              ? 'text-rose-650 dark:text-rose-400 border-b-2 border-rose-500 font-extrabold' 
              : 'text-slate-455 dark:text-slate-400'
          }`}
        >
          Reset Settings
        </button>
      </div>

      {/* Content tabs */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
          
          {/* User Form */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">
              {editUserId ? 'Modify User Profile' : 'Register ERP Account'}
            </h3>
            <form onSubmit={handleRegisterOrUpdate} className="space-y-4">
              
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Diana Prince"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., diana@kbn.edu"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                />
              </div>

              {role !== 'student' && role !== 'admin' && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g., EMP-101"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                  />
                </div>
              )}

              {role === 'counsellor' && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g., 9876543210"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="principal">Principal</option>
                    <option value="placement">Placement Officer</option>
                    <option value="counsellor">Ward Counsellor</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                {role !== 'faculty' ? (
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Assign Branch</label>
                    <select
                      value={department}
                      disabled={['admin', 'placement', 'librarian'].includes(role)}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold disabled:opacity-40"
                    >
                      {KBN_BRANCHES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Assign Branches (Select Multiple)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-40 overflow-y-auto">
                      {KBN_BRANCHES.map(b => {
                        const isChecked = assignedBranches.includes(b);
                        return (
                          <label key={b} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-350">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignedBranches([...assignedBranches, b]);
                                } else {
                                  setAssignedBranches(assignedBranches.filter(x => x !== b));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-650 focus:ring-blue-500"
                            />
                            <span>{b}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                    >
                      {KBN_SEMESTERS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Roll Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g., CSE-2023-010"
                      required={role === 'student'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2"
                >
                  <UserPlus size={14} />
                  <span>{editUserId ? 'Save Modifications' : 'Register User'}</span>
                </button>
                {editUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditUserId(null);
                      setFullName('');
                      setEmail('');
                      setRollNumber('');
                      setRole('student');
                    }}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Directory Listings */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Users Registry</span>
                <button onClick={loadData} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, roll..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="hod">HODs Only</option>
                  <option value="principal">Principals Only</option>
                  <option value="counsellor">Counsellors Only</option>
                  <option value="librarian">Librarians Only</option>
                  <option value="placement">Placements Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              {/* Table */}
              {filteredUsers.length === 0 ? (
                <div className="py-20 text-center text-slate-450 dark:text-slate-500">No users match filters.</div>
              ) : (
                <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">User Profile</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-250 font-bold">
                      {filteredUsers.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-4 py-3">
                            <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{user.fullName}</h4>
                            <div className="text-[9.5px] text-slate-400 mt-0.5 space-y-0.5">
                              <p>{user.email}</p>
                              {user.rollNumber && user.rollNumber !== 'N/A' && <p>Roll: {user.rollNumber}</p>}
                              {user.employeeId && user.employeeId !== 'N/A' && <p>Emp ID: {user.employeeId}</p>}
                              {user.contactNumber && user.contactNumber !== 'N/A' && <p>Contact: {user.contactNumber}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase text-[9.5px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{user.role}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold max-w-[150px] truncate">
                            {user.role === 'faculty' 
                              ? (user.assignedBranches?.join(', ') || user.department)
                              : `${user.department} ${user.semester !== 'N/A' ? `(${user.semester})` : ''}`
                            }
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button onClick={() => handleEdit(user)} className="p-1.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg" title="Edit"><Edit size={12} /></button>
                              <button onClick={() => handleResetPassword(user.uid, user.fullName)} className="p-1.5 bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-lg" title="Reset Password"><Key size={12} /></button>
                              <button onClick={() => handleDelete(user.uid)} className="p-1.5 bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-lg" title="Delete"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
          
          {/* Active year card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Academic setup</h3>
            <form onSubmit={handleSaveAcademic} className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Active Academic Year</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g., 2026-2027"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Fee config builder */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Fee Structure builder</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Branch</label>
                    <select
                      value={feeBranch}
                      onChange={(e) => setFeeBranch(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                    >
                      {KBN_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Semester</label>
                    <select
                      value={feeSemester}
                      onChange={(e) => setFeeSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                    >
                      {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Semester Tuition Fee (₹)</label>
                    <input
                      type="number"
                      value={semesterFee}
                      onChange={(e) => setSemesterFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Exam Fee (₹)</label>
                    <input
                      type="number"
                      value={examFee}
                      onChange={(e) => setExamFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Bus Fee (₹)</label>
                    <input
                      type="number"
                      value={busFee}
                      onChange={(e) => setBusFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Hostel Fee (₹)</label>
                    <input
                      type="number"
                      value={hostelFee}
                      onChange={(e) => setHostelFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddFeeStructure}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <DollarSign size={14} />
                  <span>Update Fee Structure</span>
                </button>
              </div>
            </div>

          </div>

          {/* Fee list */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Configured fee tables</span>
            {feeStructures.length === 0 ? (
              <div className="py-20 text-center text-slate-450 dark:text-slate-500">No custom fee structures registered. Default values will apply.</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {feeStructures.map((fee, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{fee.branch} ({fee.semester})</h4>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-bold mt-2.5 pt-2.5 border-t border-slate-200/40 dark:border-slate-800">
                      <div>
                        <span>Sem Fee</span>
                        <span className="block text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">₹{fee.semesterFee.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Exam Fee</span>
                        <span className="block text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">₹{fee.examFee.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Bus Fee</span>
                        <span className="block text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">₹{fee.busFee.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Hostel Fee</span>
                        <span className="block text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">₹{fee.hostelFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'reset' && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="inline-flex p-3.5 bg-rose-500/10 text-rose-500 rounded-3xl">
            <Database size={32} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-850 dark:text-white">Hard Reset Database Tables</h3>
            <p className="text-xs text-slate-450 mt-1 leading-relaxed">
              Resets all localStorage structures to default seeded data. Wipes student marks, attendance sessions, book checkouts, fee payments, and user directories.
            </p>
          </div>
          <button
            onClick={handleResetDB}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/15"
          >
            Reset Database & Reload Page
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle size={24} />
              <h4 className="text-sm font-black uppercase tracking-wider">{confirmModal.title}</h4>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-bold">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-450 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminPortal;
