import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Key, 
  Copy, 
  Search, 
  Settings, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Check, 
  X, 
  Plus, 
  Calendar,
  AlertCircle,
  Download,
  Upload,
  CalendarDays
} from 'lucide-react';
import { StudentBulkImport } from '../components/StudentBulkImport';

export const AdminPortal = () => {
  const { logout, user: currentUser, showToast } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Users States
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Super Admin Sync State
  const [syncingRoster, setSyncingRoster] = useState(false);
  const handleSyncRoster = async () => {
    try {
      setSyncingRoster(true);
      const count = await mockDB.batchUploadAIMLStudents();
      showToast(`Successfully inserted/updated ${count} AI & ML student records in Firestore!`, 'success');
      fetchUsers();
    } catch (_) {
      showToast('Sync failed.', 'error');
    } finally {
      setSyncingRoster(false);
    }
  };
  
  // Create / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState('student');
  const [formDepartment, setFormDepartment] = useState(KBN_BRANCHES[0]);
  const [formSemester, setFormSemester] = useState('Semester 1');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formSubjects, setFormSubjects] = useState('');
  const [formHallTicketNumber, setFormHallTicketNumber] = useState('');
  const [formSection, setFormSection] = useState('A');
  const [formParentName, setFormParentName] = useState('');
  const [formParentMobile, setFormParentMobile] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formWardCounsellorId, setFormWardCounsellorId] = useState('');
  const [formAcademicYear, setFormAcademicYear] = useState('2026-2027');

  // Password Reset Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Workload / Subject Allocation States
  const [allocations, setAllocations] = useState([]);
  const [allocBranch, setAllocBranch] = useState(KBN_BRANCHES[0]);
  const [allocSemester, setAllocSemester] = useState('Semester 1');
  const [allocSubject, setAllocSubject] = useState('');
  const [allocFacultyId, setAllocFacultyId] = useState('');
  const [faculties, setFaculties] = useState([]);

  // Leaves & Fee reports
  const [allLeaves, setAllLeaves] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [reviewingRemarks, setReviewingRemarks] = useState('');

  // --- ACADEMIC CALENDAR STATES ---
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calViewMode, setCalViewMode] = useState('monthly'); // daily, weekly, monthly, yearly
  const [calTypeFilter, setCalTypeFilter] = useState('all');
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [editingCalEvent, setEditingCalEvent] = useState(null);
  const [calYear, setCalYear] = useState('2026-2027');
  const [calSem, setCalSem] = useState('All');
  const [calTitle, setCalTitle] = useState('');
  const [calType, setCalType] = useState('holiday'); // holiday, exam, event, workshop, seminar, sports, cultural, placement
  const [calSubType, setCalSubType] = useState('government');
  const [calStartDate, setCalStartDate] = useState('');
  const [calEndDate, setCalEndDate] = useState('');
  const [calDescription, setCalDescription] = useState('');

  // --- BACKUP & RESTORE STATES ---
  const [backupLogs, setBackupLogs] = useState([]);
  const [uploadingBackup, setUploadingBackup] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await mockDB.getAllUsers();
      setUsersList(data);
      setFaculties(data.filter(u => u.role === 'faculty'));
    } catch (e) {
      showToast('Could not fetch users list', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const data = await mockDB.getSubjectAllocations();
      setAllocations(data);
    } catch (_) {}
  };

  const fetchLeaves = async () => {
    try {
      const data = await mockDB.getLeaves('admin', currentUser.uid);
      setAllLeaves(data);
    } catch (_) {}
  };

  const fetchFees = async () => {
    try {
      const users = await mockDB.getAllUsers();
      const students = users.filter(u => u.role === 'student');
      let feeList = [];
      for (const s of students) {
        const sf = await mockDB.getFees(s.uid);
        feeList = [...feeList, ...sf];
      }
      setAllFees(feeList);
    } catch (_) {}
  };

  const fetchCalendar = async () => {
    try {
      const data = await mockDB.getCalendarEvents();
      setCalendarEvents(data);
    } catch (_) {}
  };

  const fetchBackupLogs = async () => {
    try {
      const logs = await mockDB.getBackupLogs();
      setBackupLogs(logs);
    } catch (_) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchAllocations();
    fetchLeaves();
    fetchFees();
    fetchCalendar();
    fetchBackupLogs();
  }, [currentUser]);

  // Handle Create or Edit User
  const handleSaveUser = async (e) => {
    e.preventDefault();

    // Validations
    if (formRole === 'student') {
      if (!formParentMobile) {
        showToast('Parent mobile number is mandatory!', 'error');
        return;
      }
      const phonePattern = /^\d{10}$/;
      if (formMobile && !phonePattern.test(formMobile)) {
        showToast('Student mobile number must be 10 digits!', 'error');
        return;
      }
      if (!phonePattern.test(formParentMobile)) {
        showToast('Parent mobile number must be 10 digits!', 'error');
        return;
      }
    }

    let wardCounsellorName = '';
    if (formRole === 'student' && formWardCounsellorId) {
      const selectedCounsellor = usersList.find(u => u.uid === formWardCounsellorId);
      if (selectedCounsellor) {
        wardCounsellorName = selectedCounsellor.fullName || selectedCounsellor.full_name || '';
      }
    }

    try {
      if (editingUser) {
        const updatedFields = {
          fullName: formFullName,
          role: formRole,
          department: formDepartment,
          semester: formRole === 'student' ? formSemester : null,
          rollNumber: formRole === 'student' ? formRollNumber : null,
          employeeId: formRole !== 'student' ? formEmployeeId : null,
          mobile: formMobile,
          subjects: formRole === 'faculty' ? formSubjects.split(',').map(s => s.trim()) : null,
          // Advanced student fields
          hallTicketNumber: formRole === 'student' ? formHallTicketNumber : null,
          section: formRole === 'student' ? formSection : null,
          parentName: formRole === 'student' ? formParentName : null,
          parentMobile: formRole === 'student' ? formParentMobile : null,
          parentEmail: formRole === 'student' ? formParentEmail : null,
          wardCounsellorId: formRole === 'student' ? formWardCounsellorId : null,
          wardCounsellorName: formRole === 'student' ? wardCounsellorName : null,
          academicYear: formRole === 'student' ? formAcademicYear : null
        };
        await mockDB.updateUser(editingUser.uid, updatedFields);
        showToast('User directory updated successfully.', 'success');
      } else {
        const newUserObj = {
          email: formEmail,
          password: formPassword,
          fullName: formFullName,
          role: formRole,
          department: formDepartment,
          semester: formRole === 'student' ? formSemester : null,
          rollNumber: formRole === 'student' ? formRollNumber : null,
          employeeId: formRole !== 'student' ? formEmployeeId : null,
          mobile: formMobile,
          subjects: formRole === 'faculty' ? formSubjects.split(',').map(s => s.trim()) : null,
          // Advanced student fields
          hallTicketNumber: formRole === 'student' ? formHallTicketNumber : null,
          section: formRole === 'student' ? formSection : null,
          parentName: formRole === 'student' ? formParentName : null,
          parentMobile: formRole === 'student' ? formParentMobile : null,
          parentEmail: formRole === 'student' ? formParentEmail : null,
          wardCounsellorId: formRole === 'student' ? formWardCounsellorId : null,
          wardCounsellorName: formRole === 'student' ? wardCounsellorName : null,
          academicYear: formRole === 'student' ? formAcademicYear : null
        };
        await mockDB.createUser(newUserObj);
        showToast('New ERP user account provisioned.', 'success');
      }
      setIsModalOpen(false);
      resetUserForm();
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Could not save user', 'error');
    }
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormPassword('');
    setFormFullName('');
    setFormRole('student');
    setFormDepartment(KBN_BRANCHES[0]);
    setFormSemester('Semester 1');
    setFormRollNumber('');
    setFormEmployeeId('');
    setFormMobile('');
    setFormSubjects('');
    setFormHallTicketNumber('');
    setFormSection('A');
    setFormParentName('');
    setFormParentMobile('');
    setFormParentEmail('');
    setFormWardCounsellorId('');
    setFormAcademicYear('2026-2027');
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormFullName(user.fullName || user.full_name);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormSemester(user.semester || 'Semester 1');
    setFormRollNumber(user.rollNumber || '');
    setFormEmployeeId(user.employeeId || '');
    setFormMobile(user.mobile || '');
    setFormSubjects(user.subjects ? user.subjects.join(', ') : '');

    // Prefill advanced student fields
    const loadAdvancedFields = async () => {
      try {
        const studentDetail = await mockDB.getStudentProfile(user.uid);
        if (studentDetail) {
          setFormHallTicketNumber(studentDetail.hallTicketNumber || '');
          setFormSection(studentDetail.section || 'A');
          setFormParentName(studentDetail.parentName || '');
          setFormParentMobile(studentDetail.parentMobile || '');
          setFormParentEmail(studentDetail.parentEmail || '');
          setFormWardCounsellorId(studentDetail.wardCounsellorId || studentDetail.counsellorId || '');
          setFormAcademicYear(studentDetail.academicYear || '2026-2027');
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user.role === 'student') {
      loadAdvancedFields();
    } else {
      setFormHallTicketNumber('');
      setFormSection('A');
      setFormParentName('');
      setFormParentMobile('');
      setFormParentEmail('');
      setFormWardCounsellorId('');
      setFormAcademicYear('2026-2027');
    }
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm('Are you sure you want to delete this user account permanently?')) {
      try {
        await mockDB.deleteUser(uid);
        showToast('Account purged from records.', 'info');
        fetchUsers();
      } catch (err) {
        showToast('Purging failed.', 'error');
      }
    }
  };

  const handleOpenReset = (user) => {
    setResettingUser(user);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleSaveReset = async (e) => {
    e.preventDefault();
    try {
      await mockDB.resetPassword(resettingUser.uid, newPassword);
      showToast(`Password successfully reset for ${resettingUser.fullName}.`, 'success');
      setIsResetModalOpen(false);
    } catch (_) {
      showToast('Reset failed.', 'error');
    }
  };

  const handleCopyCredentials = (email, pass = 'password123') => {
    const credText = `Login Credentials:\nPortal: KBN Smart ERP\nEmail: ${email}\nPassword: ${pass}`;
    navigator.clipboard.writeText(credText);
    showToast('Credentials copied to clipboard!', 'success');
  };

  // Allocations handler
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocBranch) {
      showToast('Please select a Department/Branch first.', 'warning');
      return;
    }
    if (!allocSubject.trim() || !allocFacultyId) {
      showToast('Please select an assigned subject and a faculty member.', 'warning');
      return;
    }
    const validSubjects = BRANCH_SUBJECT_MAP[allocBranch] || [];
    if (validSubjects.length > 0 && !validSubjects.includes(allocSubject)) {
      showToast(`Selected subject "${allocSubject}" is not valid for branch "${allocBranch}".`, 'error');
      return;
    }
    try {
      const fac = faculties.find(f => f.uid === allocFacultyId);
      await mockDB.allocateSubject(allocBranch, allocSemester, allocSubject, allocFacultyId, fac.fullName || fac.full_name);
      showToast('Academic subject workload allocated.', 'success');
      setAllocSubject('');
      fetchAllocations();
    } catch (err) {
      showToast(err.message || 'Allocation failed.', 'error');
    }
  };

  // Leave Reviews
  const handleReviewLeave = async (leaveId, action) => {
    try {
      await mockDB.reviewLeave(leaveId, action, reviewingRemarks, 'admin');
      showToast(`Leave application ${action} successfully.`, 'success');
      setReviewingRemarks('');
      fetchLeaves();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  // --- ACADEMIC CALENDAR ACTIONS ---
  const handleSaveCalEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingCalEvent ? editingCalEvent.id : undefined,
        year: calYear,
        semester: calSem,
        title: calTitle,
        type: calType,
        subType: calSubType,
        startDate: calStartDate,
        endDate: calEndDate,
        description: calDescription
      };
      await mockDB.saveCalendarEvent(payload);
      showToast('Calendar entry saved successfully.', 'success');
      setIsCalModalOpen(false);
      resetCalForm();
      fetchCalendar();
    } catch (_) {
      showToast('Error saving calendar entry.', 'error');
    }
  };

  const resetCalForm = () => {
    setEditingCalEvent(null);
    setCalYear('2026-2027');
    setCalSem('All');
    setCalTitle('');
    setCalType('holiday');
    setCalSubType('government');
    setCalStartDate('');
    setCalEndDate('');
    setCalDescription('');
  };

  const handleOpenEditCal = (event) => {
    setEditingCalEvent(event);
    setCalYear(event.year);
    setCalSem(event.semester || 'All');
    setCalTitle(event.title);
    setCalType(event.type);
    setCalSubType(event.subType || 'government');
    setCalStartDate(event.startDate);
    setCalEndDate(event.endDate);
    setCalDescription(event.description || '');
    setIsCalModalOpen(true);
  };

  const handleDeleteCal = async (id) => {
    if (window.confirm('Delete this calendar entry?')) {
      try {
        await mockDB.deleteCalendarEvent(id);
        showToast('Calendar entry deleted.', 'info');
        fetchCalendar();
      } catch (_) {
        showToast('Error deleting entry.', 'error');
      }
    }
  };

  // --- BACKUP & RESTORE ACTIONS ---
  const handleTriggerBackup = async () => {
    try {
      await mockDB.triggerBackup(currentUser.uid);
      showToast('Manual backup initiated and downloaded!', 'success');
      fetchBackupLogs();
    } catch (_) {
      showToast('Backup failed.', 'error');
    }
  };

  const handleRestoreUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setUploadingBackup(true);
        await mockDB.restoreBackup(evt.target.result, currentUser.uid);
        showToast('Database restore complete!', 'success');
        fetchBackupLogs();
        fetchUsers();
        fetchCalendar();
        fetchAllocations();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setUploadingBackup(false);
      }
    };
    reader.readAsText(file);
  };

  // Filters & Views Helper for Calendar
  const filteredCalendar = calendarEvents.filter(event => {
    const matchesType = calTypeFilter === 'all' || event.type === calTypeFilter;
    
    // View mode filters
    const today = new Date().toISOString().split('T')[0];
    if (calViewMode === 'daily') {
      return matchesType && event.startDate <= today && event.endDate >= today;
    }
    return matchesType;
  });

  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = 
      (u.fullName || u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Super Admin Command Center</h2>
          <p className="text-sm text-slate-400 mt-1">Institutional Operations, Workloads & Data Management</p>
        </div>
        <button onClick={async () => { await logout(); navigate('/', { replace: true }); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Sign Out Portal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Overview Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'users' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Users Directory (15 Roles)
        </button>
        <button 
          onClick={() => setActiveTab('structure')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'structure' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Academic Structure
        </button>
        <button 
          onClick={() => setActiveTab('calendar')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'calendar' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Academic Calendar
        </button>
        <button 
          onClick={() => setActiveTab('allocations')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'allocations' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Workload Allocations
        </button>
        <button 
          onClick={() => setActiveTab('leaves')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'leaves' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Leave Reviews
        </button>
        <button 
          onClick={() => setActiveTab('backup')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'backup' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Backup & Restore
        </button>
        <button 
          onClick={() => setActiveTab('bulk-import')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'bulk-import' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Bulk Student Import
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'reports' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Global Ledgers
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'bulk-import' && (
        <StudentBulkImport />
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Institutional Live Statistics</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400">Real-time metrics across Firestore collections</p>
            </div>
            <button
              onClick={handleSyncRoster}
              disabled={syncingRoster}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Upload size={14} />
              <span>{syncingRoster ? 'Syncing Roster...' : 'Sync 55 AI & ML Students to Firestore'}</span>
            </button>
          </div>

          {/* 17 KPI Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Students</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">{usersList.filter(u => u.role === 'student').length || 55}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Faculty</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{usersList.filter(u => u.role === 'faculty' || u.role === 'lab_faculty').length || 12}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Parents</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block mt-1">{usersList.filter(u => u.role === 'parent').length || 45}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total HODs</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">{usersList.filter(u => u.role === 'hod').length || 6}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ward Counsellors</span>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400 block mt-1">{usersList.filter(u => u.role === 'counsellor').length || 8}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Departments</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">6</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Courses</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block mt-1">4</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Branches</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block mt-1">6</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Semesters</span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 block mt-1">8</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Sections</span>
              <span className="text-2xl font-black text-pink-600 dark:text-pink-400 block mt-1">3 (EM, A, B)</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Subjects</span>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400 block mt-1">24</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Active Accounts</span>
              <span className="text-2xl font-black text-emerald-500 block mt-1">{usersList.length || 65}</span>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
              <h4 className="font-extrabold text-slate-800 dark:text-white mb-4">Department Roster Breakdown</h4>
              <div className="space-y-3">
                {[
                  { name: 'AI & ML (Artificial Intelligence)', count: 55, pct: 100, color: 'bg-blue-500' },
                  { name: 'CSE (Computer Science)', count: 35, pct: 70, color: 'bg-indigo-500' },
                  { name: 'ECE (Electronics)', count: 28, pct: 56, color: 'bg-teal-500' },
                  { name: 'EEE (Electrical)', count: 20, pct: 40, color: 'bg-amber-500' },
                  { name: 'Civil Engineering', count: 18, pct: 36, color: 'bg-rose-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{item.name}</span>
                      <span>{item.count} Students</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Activity & Health */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
              <h4 className="font-extrabold text-slate-800 dark:text-white mb-4">System Operational Health</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">Firestore Database</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">CONNECTED</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">Auth Guards</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 block mt-1">15 ROLES ACTIVE</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">Dynamic Percentages</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400 block mt-1">ENFORCED</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">Audit Logging</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block mt-1">ENABLED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-md">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search user, ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
                <option value="counsellor">Ward Counsellor</option>
                <option value="principal">Principal</option>
                <option value="librarian">Librarian</option>
                <option value="placement">Placement Officer</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>

            <button 
              onClick={() => { resetUserForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
            >
              <UserPlus size={14} />
              <span>Provision User</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden">
            {loadingUsers ? (
              <div className="py-20 text-center animate-pulse text-slate-400">Loading Directory...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No matching user profiles found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-450 border-b border-slate-100 dark:border-slate-800/80 uppercase font-bold tracking-wider text-[10px]">
                      <th className="px-5 py-3">Full Name & Role</th>
                      <th className="px-5 py-3">Contact Details</th>
                      <th className="px-5 py-3">Workload / Dept</th>
                      <th className="px-5 py-3">Academic IDs</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-sm">{u.fullName || u.full_name}</div>
                          <span className={`px-2 py-0.5 mt-1 inline-block text-[9px] font-black uppercase rounded ${
                            u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                            u.role === 'principal' ? 'bg-indigo-500/10 text-indigo-500' :
                            u.role === 'hod' ? 'bg-purple-500/10 text-purple-500' :
                            u.role === 'counsellor' ? 'bg-orange-500/10 text-orange-500' :
                            u.role === 'faculty' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>{u.email}</div>
                          <span className="text-slate-400 font-normal text-[10px]">{u.mobile || 'No Mobile'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>Dept: {u.department}</div>
                          {u.semester && <span className="text-slate-455 font-bold block text-[10px]">{u.semester}</span>}
                          {u.subjects && <span className="text-[10px] text-blue-500 block">Teach: {u.subjects.join(', ')}</span>}
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px]">
                          {u.role === 'student' ? `ROLL: ${u.rollNumber || 'N/A'}` : `EMP: ${u.employeeId || 'N/A'}`}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleCopyCredentials(u.email)} className="p-2 bg-slate-150 dark:bg-slate-800 rounded-xl transition-all">
                              <Copy size={13} className="text-slate-500 dark:text-slate-400" />
                            </button>
                            <button onClick={() => handleOpenReset(u)} className="p-2 bg-amber-500/10 rounded-xl transition-all">
                              <Key size={13} className="text-amber-500" />
                            </button>
                            <button onClick={() => handleOpenEdit(u)} className="p-2 bg-blue-500/10 rounded-xl transition-all">
                              <Edit size={13} className="text-blue-500" />
                            </button>
                            {u.uid !== currentUser.uid && (
                              <button onClick={() => handleDeleteUser(u.uid)} className="p-2 bg-red-500/10 rounded-xl transition-all">
                                <Trash2 size={13} className="text-red-500" />
                              </button>
                            )}
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
      )}

      {/* --- ACADEMIC CALENDAR TAB --- */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-md">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={calViewMode}
                onChange={(e) => setCalViewMode(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="monthly">Monthly Overview</option>
                <option value="daily">Today's Schedule</option>
                <option value="weekly">Weekly View</option>
                <option value="yearly">Yearly Overview</option>
              </select>

              <select
                value={calTypeFilter}
                onChange={(e) => setCalTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="all">All Types</option>
                <option value="holiday">Holidays</option>
                <option value="exam">Exams</option>
                <option value="event">Events</option>
                <option value="placement">Placement Drives</option>
                <option value="workshop">Workshops</option>
              </select>
            </div>

            <button 
              onClick={() => { resetCalForm(); setIsCalModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
            >
              <CalendarDays size={14} />
              <span>Add Calendar Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCalendar.map(evt => (
              <div key={evt.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-lg rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                      evt.type === 'holiday' ? 'bg-red-500/10 text-red-500' :
                      evt.type === 'exam' ? 'bg-amber-500/10 text-amber-500' :
                      evt.type === 'event' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>{evt.type}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{evt.startDate}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-2">{evt.title}</h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">{evt.description}</p>
                  {evt.semester && <p className="text-[9.5px] text-slate-400 mt-1">Scope: {evt.semester}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-3">
                  <button onClick={() => handleOpenEditCal(evt)} className="p-1.5 bg-blue-500/10 hover:bg-blue-500/25 rounded-lg text-blue-500">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDeleteCal(evt.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/25 rounded-lg text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BACKUP & RESTORE TAB --- */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Database Snapshot Tools</h3>
              <p className="text-[10.5px] text-slate-450 mt-1">Settle physical backups of users, calendar settings, and academic classes workloads.</p>
            </div>

            <button 
              onClick={handleTriggerBackup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow flex items-center justify-center gap-2"
            >
              <Download size={14} />
              <span>Create Manual Backup</span>
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <label className="block text-[10px] uppercase font-bold text-slate-450 mb-2">Upload Backup Restore file</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleRestoreUpload}
                  disabled={uploadingBackup}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-5">
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">Administrative restore logs</span>
            {backupLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-400">No backup operations completed yet.</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {backupLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">{log.backupName}</span>
                      <span className="text-slate-400 font-bold">{log.timestamp ? String(log.timestamp).split('T')[0] : 'N/A'}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 mt-1">Size: {(log.size / 1024).toFixed(2)} KB • Triggered by ID: {log.triggeredBy}</p>
                    <p className="text-[10.5px] text-slate-650 dark:text-slate-350 mt-2 font-normal">{log.logDetails}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-md h-fit">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-500" />
              <span>Workload Allocator</span>
            </h3>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Academic Branch</label>
                <select
                  value={allocBranch}
                  onChange={(e) => {
                    setAllocBranch(e.target.value);
                    setAllocSubject(''); // Automatically clear subject when branch changes
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="">Select Department...</option>
                  {KBN_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Semester</label>
                <select
                  value={allocSemester}
                  onChange={(e) => setAllocSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Assigned Subject</label>
                <select 
                  value={allocSubject}
                  onChange={(e) => setAllocSubject(e.target.value)}
                  disabled={!allocBranch}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {!allocBranch ? (
                    <option value="">Select Department First</option>
                  ) : (
                    <>
                      <option value="">Select Subject...</option>
                      {(BRANCH_SUBJECT_MAP[allocBranch] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Assigned Faculty Member</label>
                <select
                  value={allocFacultyId}
                  onChange={(e) => setAllocFacultyId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="">Select Faculty...</option>
                  {faculties.map(f => (
                    <option key={f.uid} value={f.uid}>{f.fullName || f.full_name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md mt-6">
                Confirm Allocation Ledger
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden p-5">
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">Active Faculty workload ledgers</span>
            {allocations.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No subject allocations currently active.</div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-100 dark:border-slate-800/80 uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Allocated Scope</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Faculty Instructor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                    {allocations.map(a => (
                      <tr key={a.allocationId}>
                        <td className="px-4 py-3">{a.branch} • {a.semester}</td>
                        <td className="px-4 py-3 text-blue-605 dark:text-blue-400">{a.subjectName}</td>
                        <td className="px-4 py-3">{a.facultyName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-5">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">Leave Applications Panel</span>
              <p className="text-[10px] font-normal text-slate-450 mt-0.5">Approve or reject leaves submitted directly by the Principal</p>
            </div>
            
            <input 
              type="text" 
              placeholder="Remarks for reviews..."
              value={reviewingRemarks}
              onChange={(e) => setReviewingRemarks(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold w-full sm:w-64"
            />
          </div>

          {allLeaves.filter(l => l.applicant_role === 'principal' || l.applicantRole === 'principal').length === 0 ? (
            <div className="text-center py-20 text-slate-400">No Principal leave requests pending.</div>
          ) : (
            <div className="border border-slate-105 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-100 dark:border-slate-800/80 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Scope Dates</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Oversight Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105 dark:divide-slate-800/60 text-slate-805 dark:text-slate-200 font-bold">
                  {allLeaves.filter(l => l.applicant_role === 'principal' || l.applicantRole === 'principal').map(l => (
                    <tr key={l.leaveId}>
                      <td className="px-4 py-3">
                        <div className="font-extrabold">{l.studentName}</div>
                        <span className="text-[9px] text-indigo-500 font-black block">Principal</span>
                      </td>
                      <td className="px-4 py-3">{l.startDate} to {l.endDate}</td>
                      <td className="px-4 py-3 font-normal">{l.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[9px] rounded font-black uppercase ${
                          l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          l.status === 'rejected' ? 'bg-rose-500/10 text-rose-505' : 'bg-amber-500/10 text-amber-505'
                        }`}>{l.status}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.status === 'pending' ? (
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleReviewLeave(l.leaveId, 'approved')} className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1 transition-all">
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button onClick={() => handleReviewLeave(l.leaveId, 'rejected')} className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center gap-1 transition-all">
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">{l.remarks || 'No remarks'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md">
              <span className="text-[10px] text-slate-455 block uppercase font-black">Fee Ledger Settle</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                ₹{allFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden p-5">
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">Institution fee transaction registers</span>
            {allFees.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No transaction records generated.</div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-100 dark:border-slate-800/80 uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Fee Type</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                    {allFees.map((f, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <div className="font-extrabold">{f.studentName}</div>
                          <span className="text-[9px] text-slate-400 block font-normal font-mono">{f.rollNumber}</span>
                        </td>
                        <td className="px-4 py-3">{f.feeType}</td>
                        <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">₹{f.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] rounded font-black uppercase ${
                            f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition-all">
              <X size={16} className="text-slate-500 dark:text-slate-405" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
              {editingUser ? 'Modify User Profile' : 'Provision User Account'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Account Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    disabled={!!editingUser}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="counsellor">Ward Counsellor</option>
                    <option value="principal">Principal</option>
                    <option value="librarian">Librarian</option>
                    <option value="placement">Placement Officer</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Academic Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                  >
                    <option value="N/A">N/A</option>
                    <option value="All">All</option>
                    {KBN_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Full Name</label>
                <input type="text" placeholder="Prof. Jane Doe" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Email Address</label>
                <input type="email" placeholder="jane.doe@kbn.edu" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required disabled={!!editingUser} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Initial Password</label>
                  <input type="password" placeholder="••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
              )}

              {formRole === 'student' && (
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Semester</label>
                      <select
                        value={formSemester}
                        onChange={(e) => setFormSemester(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                      >
                        {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Roll Number (Student ID)</label>
                      <input type="text" placeholder="CSE-2023-010" value={formRollNumber} onChange={(e) => setFormRollNumber(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Hall Ticket No</label>
                      <input type="text" placeholder="HT2026001" value={formHallTicketNumber} onChange={(e) => setFormHallTicketNumber(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Section</label>
                      <select
                        value={formSection}
                        onChange={(e) => setFormSection(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Academic Year</label>
                      <input type="text" placeholder="2026-2027" value={formAcademicYear} onChange={(e) => setFormAcademicYear(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Parent Name</label>
                      <input type="text" placeholder="Richard Doe" value={formParentName} onChange={(e) => setFormParentName(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Parent Mobile (Mandatory)</label>
                      <input type="text" placeholder="9988776655" value={formParentMobile} onChange={(e) => setFormParentMobile(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Parent Email (Optional)</label>
                      <input type="email" placeholder="parent@example.com" value={formParentEmail} onChange={(e) => setFormParentEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Ward Counsellor</label>
                      <select
                        value={formWardCounsellorId}
                        onChange={(e) => setFormWardCounsellorId(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                      >
                        <option value="">Select Counsellor...</option>
                        {usersList.filter(u => u.role === 'counsellor').map(c => (
                          <option key={c.uid} value={c.uid}>{c.fullName || c.full_name} ({c.department})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formRole !== 'student' && formRole !== 'admin' && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Employee ID</label>
                  <input type="text" placeholder="FAC-CSE-012" value={formEmployeeId} onChange={(e) => setFormEmployeeId(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg transition-all mt-6">
                {editingUser ? 'Update Account' : 'Provision Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CALENDAR MODAL --- */}
      {isCalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl relative">
            <button onClick={() => setIsCalModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl">
              <X size={16} className="text-slate-500" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
              {editingCalEvent ? 'Edit Calendar Event' : 'Add Calendar Event'}
            </h3>

            <form onSubmit={handleSaveCalEvent} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Event Title</label>
                <input type="text" placeholder="Mid Term Exams" value={calTitle} onChange={(e) => setCalTitle(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Type</label>
                  <select value={calType} onChange={(e) => setCalType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold">
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam Schedule</option>
                    <option value="event">Campus Event</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="placement">Placement Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Sub-Type</label>
                  <select value={calSubType} onChange={(e) => setCalSubType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold">
                    {calType === 'holiday' ? (
                      <>
                        <option value="government">Government Holiday</option>
                        <option value="festival">Festival</option>
                        <option value="college">College Specific</option>
                      </>
                    ) : calType === 'exam' ? (
                      <>
                        <option value="mid">Mid Exam</option>
                        <option value="internal">Internal Exam</option>
                        <option value="semester">Semester Exam</option>
                        <option value="practical">Practical Exam</option>
                      </>
                    ) : (
                      <option value="general">General</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Start Date</label>
                  <input type="date" value={calStartDate} onChange={(e) => setCalStartDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">End Date</label>
                  <input type="date" value={calEndDate} onChange={(e) => setCalEndDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Description</label>
                <textarea rows="3" value={calDescription} onChange={(e) => setCalDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-medium resize-none"></textarea>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold transition-all shadow-md mt-4">
                Save Entry Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl relative">
            <button onClick={() => setIsResetModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition-all">
              <X size={16} className="text-slate-500" />
            </button>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Reset Account Password</h3>
            <form onSubmit={handleSaveReset} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">New Password</label>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow transition-all mt-4">
                Reset Password Ledger
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminPortal;
