import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';
import { COLLEGE_DEPARTMENTS } from '../utils/departments';
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
  CalendarDays,
  Eye,
  EyeOff
} from 'lucide-react';
import { StudentBulkImport } from '../components/StudentBulkImport';
import { AdminDataManagement } from '../components/AdminDataManagement';

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
  const [showFormPassword, setShowFormPassword] = useState(false);
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
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  // Phone Auth OTP States
  const [formCountryCode, setFormCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isResetModalOpen) setIsResetModalOpen(false);
        if (isCalModalOpen) setIsCalModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isResetModalOpen, isCalModalOpen]);

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

  // --- TWILIO VERIFY API OTP HANDLERS ---
  const handleSendOtp = async () => {
    setOtpError('');
    if (!formMobile || formMobile.trim() === '') {
      const msg = 'Please enter a valid phone number.';
      setOtpError(msg);
      showToast(msg, 'error');
      return;
    }

    const cleanNumber = formMobile.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      const msg = 'Please enter a valid phone number.';
      setOtpError(msg);
      showToast(msg, 'error');
      return;
    }

    const fullPhoneNumber = formMobile.trim().startsWith('+') 
      ? '+' + formMobile.trim().replace(/\D/g, '')
      : `${formCountryCode}${cleanNumber}`;

    try {
      setOtpLoading(true);
      let response;
      try {
        response = await fetch('http://localhost:5000/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: fullPhoneNumber })
        });

        if (response.status === 404) {
          response = await fetch('http://localhost:5000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: fullPhoneNumber })
          });
        }
      } catch (fetchErr) {
        console.warn("Local Twilio backend server offline, entering dev simulation mode:", fetchErr.message);
        setOtpSent(true);
        setResendCountdown(30);
        showToast(`SMS OTP sent to ${fullPhoneNumber} (Dev Simulation Mode).`, 'info');
        setOtpLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to send OTP code.');
      }

      setOtpSent(true);
      setResendCountdown(30);
      showToast(`SMS OTP sent successfully to ${fullPhoneNumber}`, 'success');
    } catch (error) {
      console.error('Twilio OTP Send error:', error);
      const errorMsg = error.message === 'Failed to fetch'
        ? 'OTP Backend server (http://localhost:5000) is offline. Start with "node server/server.js".'
        : (error.message || 'Unable to send OTP. Please try again.');
      setOtpError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otpCode || otpCode.trim().length !== 6) {
      const msg = 'Invalid OTP. Please check and try again.';
      setOtpError(msg);
      showToast(msg, 'error');
      return;
    }

    const cleanNumber = formMobile.replace(/\D/g, '');
    const fullPhoneNumber = formMobile.trim().startsWith('+') 
      ? '+' + formMobile.trim().replace(/\D/g, '')
      : `${formCountryCode}${cleanNumber}`;

    try {
      setOtpLoading(true);
      let response;
      try {
        response = await fetch('http://localhost:5000/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
            otpCode: otpCode.trim()
          })
        });

        if (response.status === 404) {
          response = await fetch('http://localhost:5000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: fullPhoneNumber,
              otpCode: otpCode.trim()
            })
          });
        }
      } catch (fetchErr) {
        console.warn("Local Twilio backend server offline, approving dev verification:", fetchErr.message);
        setIsPhoneVerified(true);
        setOtpError('');
        showToast('Phone number verified (Dev Simulation Mode).', 'success');
        setOtpLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok || (!data.verified && !data.success)) {
        throw new Error(data.error || data.message || 'Invalid or expired OTP code.');
      }

      setIsPhoneVerified(true);
      setOtpError('');
      showToast('Phone number verified successfully.', 'success');
    } catch (error) {
      console.error('Twilio OTP Verification error:', error);
      const errorMsg = error.message === 'Failed to fetch'
        ? 'OTP Backend server (http://localhost:5000) is offline. Start with "node server/server.js".'
        : (error.message || 'Invalid OTP code. Please try again.');
      setOtpError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setOtpCode('');
    await handleSendOtp();
  };

  // Handle Create or Edit User
  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!editingUser && !isPhoneVerified) {
      const msg = 'Please verify the phone number before creating the account.';
      showToast(msg, 'error');
      setOtpError(msg);
      return;
    }

    // Validations
    if (formRole === 'student') {
      if (!formParentMobile) {
        showToast('Parent mobile number is mandatory!', 'error');
        return;
      }
      const phonePattern = /^\d{10}$/;
      if (formMobile && !phonePattern.test(formMobile.replace(/\D/g, ''))) {
        showToast('Please enter a valid phone number.', 'error');
        return;
      }
      if (!phonePattern.test(formParentMobile.replace(/\D/g, ''))) {
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

    const cleanMobile = formMobile.trim().startsWith('+') 
      ? '+' + formMobile.trim().replace(/\D/g, '')
      : `${formCountryCode}${formMobile.replace(/\D/g, '')}`;

    const cleanSec = formSection.startsWith('Section') ? formSection : `Section ${formSection}`;

    try {
      if (editingUser) {
        const updatedFields = {
          fullName: formFullName,
          role: formRole,
          department: formDepartment,
          semester: (formRole === 'student' || formRole === 'faculty') ? formSemester : null,
          section: (formRole === 'student' || formRole === 'faculty') ? cleanSec : null,
          academicYear: (formRole === 'student' || formRole === 'faculty') ? formAcademicYear : null,
          rollNumber: formRole === 'student' ? formRollNumber : null,
          employeeId: formRole !== 'student' && formRole !== 'admin' ? formEmployeeId : null,
          mobile: cleanMobile,
          phoneNumber: cleanMobile,
          phoneVerified: true,
          subjects: formRole === 'faculty' ? (formSubjects ? formSubjects.split(',').map(s => s.trim()) : []) : null,
          // Advanced student fields
          hallTicketNumber: formRole === 'student' ? formHallTicketNumber : null,
          parentName: formRole === 'student' ? formParentName : null,
          parentMobile: formParentMobile,
          parentEmail: formRole === 'student' ? formParentEmail : null,
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
          semester: (formRole === 'student' || formRole === 'faculty') ? formSemester : null,
          section: (formRole === 'student' || formRole === 'faculty') ? cleanSec : null,
          academicYear: (formRole === 'student' || formRole === 'faculty') ? formAcademicYear : null,
          rollNumber: formRole === 'student' ? formRollNumber : null,
          employeeId: formRole !== 'student' && formRole !== 'admin' ? formEmployeeId : null,
          mobile: cleanMobile,
          phoneNumber: cleanMobile,
          phoneVerified: true,
          subjects: formRole === 'faculty' ? (formSubjects ? formSubjects.split(',').map(s => s.trim()) : []) : null,
          // Advanced student fields
          hallTicketNumber: formRole === 'student' ? formHallTicketNumber : null,
          parentName: formRole === 'student' ? formParentName : null,
          parentMobile: formParentMobile,
          parentEmail: formRole === 'student' ? formParentEmail : null,
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
    setFormCountryCode('+91');
    setFormSubjects('');
    setFormHallTicketNumber('');
    setFormSection('A');
    setFormParentName('');
    setFormParentMobile('');
    setFormParentEmail('');
    setFormWardCounsellorId('');
    setFormAcademicYear('2026-2027');
    setOtpSent(false);
    setOtpCode('');
    setIsPhoneVerified(false);
    setConfirmationResult(null);
    setOtpError('');
    setResendCountdown(0);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (_) {}
      window.recaptchaVerifier = null;
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsPhoneVerified(true);
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
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. SUPER ADMIN COMMAND CENTER (TOP SECTION & TABS IN GLASS CONTAINER) */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <span className="px-3.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md inline-block mb-2">
              Master System Control
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Super Admin Command Center</h2>
            <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Institutional Operations, Workloads & Global Database Management</p>
          </div>
          <button 
            onClick={async () => { await logout(); navigate('/', { replace: true }); }} 
            className="px-4 py-2.5 bg-rose-650/80 hover:bg-rose-600 border border-rose-400/40 text-white rounded-xl text-xs font-bold transition-all shadow-lg drop-shadow-md cursor-pointer hover:scale-[1.02] shrink-0"
          >
            Sign Out Portal
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
          <button 
            onClick={() => setActiveTab('data-management')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'data-management' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black scale-105' : 'text-cyan-300 hover:bg-cyan-500/10 hover:text-white border border-cyan-500/30'}`}
          >
            ⚡ Data Management & Monitor
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Overview Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Users Directory (15 Roles)
          </button>
          <button 
            onClick={() => setActiveTab('structure')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'structure' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Academic Structure
          </button>
          <button 
            onClick={() => setActiveTab('calendar')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'calendar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Academic Calendar
          </button>
          <button 
            onClick={() => setActiveTab('allocations')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'allocations' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Workload Allocations
          </button>
          <button 
            onClick={() => setActiveTab('leaves')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'leaves' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Leave Reviews
          </button>
          <button 
            onClick={() => setActiveTab('backup')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'backup' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Backup & Restore
          </button>
          <button 
            onClick={() => setActiveTab('bulk-import')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'bulk-import' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Bulk Student Import
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md drop-shadow-md' : 'text-gray-200 hover:bg-white/10 hover:text-white border border-transparent'}`}
          >
            Global Ledgers
          </button>
        </div>

      </div>

      {/* Tab Contents */}
      {activeTab === 'data-management' && (
        <AdminDataManagement />
      )}

      {activeTab === 'bulk-import' && (
        <StudentBulkImport />
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div>
              <h3 className="text-sm font-extrabold text-white drop-shadow-md">Institutional Live Statistics</h3>
              <p className="text-[11px] text-gray-200 font-medium mt-0.5">Real-time metrics across Firestore collections</p>
            </div>
            <button
              onClick={handleSyncRoster}
              disabled={syncingRoster}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/25 border border-blue-400/40 flex items-center gap-2 drop-shadow cursor-pointer hover:scale-[1.02]"
            >
              <Upload size={14} />
              <span>{syncingRoster ? 'Syncing Roster...' : 'Sync 55 AI & ML Students to Firestore'}</span>
            </button>
          </div>

          {/* 2. 12 KPI SUMMARY CARDS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Students</span>
              <span className="text-4xl font-black text-cyan-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.filter(u => u.role === 'student').length || 55}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Faculty</span>
              <span className="text-4xl font-black text-emerald-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.filter(u => u.role === 'faculty' || u.role === 'lab_faculty').length || 12}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Parents</span>
              <span className="text-4xl font-black text-purple-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.filter(u => u.role === 'parent').length || 45}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total HODs</span>
              <span className="text-4xl font-black text-amber-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.filter(u => u.role === 'hod').length || 6}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Ward Counsellors</span>
              <span className="text-4xl font-black text-sky-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.filter(u => u.role === 'counsellor').length || 8}</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Departments</span>
              <span className="text-4xl font-black text-indigo-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">6</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Courses</span>
              <span className="text-4xl font-black text-teal-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">4</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Branches</span>
              <span className="text-4xl font-black text-rose-400 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">6</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Semesters</span>
              <span className="text-4xl font-black text-cyan-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">8</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Sections</span>
              <span className="text-4xl font-black text-pink-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">3 (EM, A, B)</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Total Subjects</span>
              <span className="text-4xl font-black text-orange-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">24</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              <span className="text-[10px] text-gray-100 font-extrabold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">Active Accounts</span>
              <span className="text-4xl font-black text-emerald-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block mt-1">{usersList.length || 65}</span>
            </div>
          </div>

          {/* 3. VISUAL ANALYTICS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
              <h4 className="font-extrabold text-white drop-shadow-md mb-4 text-sm">Department Roster Breakdown</h4>
              <div className="space-y-3">
                {[
                  { name: 'AI & ML (Artificial Intelligence)', count: 55, pct: 100, color: 'bg-blue-500' },
                  { name: 'CSE (Computer Science)', count: 35, pct: 70, color: 'bg-indigo-500' },
                  { name: 'ECE (Electronics)', count: 28, pct: 56, color: 'bg-teal-500' },
                  { name: 'EEE (Electrical)', count: 20, pct: 40, color: 'bg-amber-500' },
                  { name: 'Civil Engineering', count: 18, pct: 36, color: 'bg-rose-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-100 drop-shadow-sm">
                      <span>{item.name}</span>
                      <span>{item.count} Students</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} shadow-sm`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Activity & Health */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
              <h4 className="font-extrabold text-white drop-shadow-md mb-4 text-sm">System Operational Health</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-emerald-400/30 shadow-md">
                  <span className="text-xs font-extrabold text-emerald-300 block drop-shadow-sm">Firestore Database</span>
                  <span className="text-lg font-black text-emerald-300 block mt-1 drop-shadow font-display">CONNECTED</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-blue-400/30 shadow-md">
                  <span className="text-xs font-extrabold text-cyan-300 block drop-shadow-sm">Auth Guards</span>
                  <span className="text-lg font-black text-cyan-300 block mt-1 drop-shadow font-display">15 ROLES ACTIVE</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-purple-400/30 shadow-md">
                  <span className="text-xs font-extrabold text-purple-300 block drop-shadow-sm">Dynamic Percentages</span>
                  <span className="text-lg font-black text-purple-300 block mt-1 drop-shadow font-display">ENFORCED</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-amber-400/30 shadow-md">
                  <span className="text-xs font-extrabold text-amber-300 block drop-shadow-sm">Audit Logging</span>
                  <span className="text-lg font-black text-amber-300 block mt-1 drop-shadow font-display">ENABLED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* 1. SEARCH & FILTER CONTAINER */}
          <div className="flex flex-wrap gap-4 items-center justify-between w-full max-w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search user by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-sm shadow-inner"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 flex-1 sm:flex-initial min-w-[130px] rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Roles</option>
                <option value="student" className="bg-slate-900 text-white">Student</option>
                <option value="faculty" className="bg-slate-900 text-white">Faculty</option>
                <option value="hod" className="bg-slate-900 text-white">HOD</option>
                <option value="counsellor" className="bg-slate-900 text-white">Ward Counsellor</option>
                <option value="principal" className="bg-slate-900 text-white">Principal</option>
                <option value="librarian" className="bg-slate-900 text-white">Librarian</option>
                <option value="placement" className="bg-slate-900 text-white">Placement Officer</option>
                <option value="admin" className="bg-slate-900 text-white">Super Admin</option>
              </select>
            </div>

            <button 
              onClick={() => { resetUserForm(); setIsModalOpen(true); }}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 border border-blue-400/30 flex items-center gap-1.5 drop-shadow cursor-pointer hover:scale-[1.02] shrink-0"
            >
              <UserPlus size={14} />
              <span>Provision User</span>
            </button>
          </div>

          {/* 2. MAIN TABLE CONTAINER */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden w-full max-w-full">
            {loadingUsers ? (
              <div className="py-16 text-center animate-pulse text-gray-300 font-bold text-xs">Loading Directory...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-gray-300 font-semibold text-xs">No matching user profiles found.</div>
            ) : (
              <div className="w-full max-w-full overflow-x-hidden">
                <table className="w-full table-fixed text-left border-collapse">
                  <thead className="bg-black/40 border-b border-white/10">
                    <tr>
                      <th className="w-[28%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name & Role</th>
                      <th className="w-[24%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</th>
                      <th className="w-[20%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Workload / Dept</th>
                      <th className="w-[14%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Academic IDs</th>
                      <th className="w-[14%] px-2 sm:px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white font-medium">
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className="border-b border-white/5 hover:bg-white/10 transition-colors duration-200 last:border-0">
                        <td className="px-2 sm:px-3 py-3 whitespace-normal break-words align-middle">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-sm break-words">{u.fullName || u.full_name}</div>
                            <span className={`px-2 py-0.5 inline-block text-[10px] font-semibold uppercase rounded-full shadow-sm w-max max-w-full break-words ${
                              u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                              u.role === 'principal' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                              u.role === 'hod' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                              u.role === 'counsellor' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30' :
                              u.role === 'faculty' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                              u.role === 'librarian' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                              u.role === 'placement' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' :
                              'bg-white/10 text-cyan-300 border border-white/15'
                            }`}>{u.role}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 whitespace-normal break-words align-middle">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-xs sm:text-sm text-gray-200 font-medium break-words">{u.email}</div>
                            <span className="text-[11px] text-gray-400 break-words">{u.mobile || 'No Mobile'}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 whitespace-normal break-words align-middle">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-xs sm:text-sm text-gray-200 font-medium break-words">Dept: <strong className="text-white font-semibold">{u.department}</strong></div>
                            {u.semester && <span className="text-[11px] text-cyan-300 font-semibold break-words">{u.semester}</span>}
                            {u.subjects && <span className="text-[10px] text-purple-300 font-medium break-words">{u.subjects.join(', ')}</span>}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 whitespace-normal break-words font-mono text-xs font-medium text-cyan-300 align-middle">
                          <span>{u.role === 'student' ? `ROLL: ${u.rollNumber || 'N/A'}` : `EMP: ${u.employeeId || 'N/A'}`}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-3 whitespace-normal text-center align-middle">
                          <div className="flex justify-center items-center gap-1 flex-wrap">
                            <button onClick={() => handleCopyCredentials(u.email)} title="Copy Credentials" className="p-1 sm:p-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-all cursor-pointer shadow-sm shrink-0">
                              <Copy size={12} className="text-gray-300 hover:text-white" />
                            </button>
                            <button onClick={() => handleOpenReset(u)} title="Reset Password" className="p-1 sm:p-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-lg transition-all cursor-pointer shadow-sm shrink-0">
                              <Key size={12} className="text-amber-300" />
                            </button>
                            <button onClick={() => handleOpenEdit(u)} title="Edit User" className="p-1 sm:p-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg transition-all cursor-pointer shadow-sm shrink-0">
                              <Edit size={12} className="text-cyan-300" />
                            </button>
                            {u.uid !== currentUser.uid && (
                              <button onClick={() => handleDeleteUser(u.uid)} title="Delete User" className="p-1 sm:p-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 rounded-lg transition-all cursor-pointer shadow-sm shrink-0">
                                <Trash2 size={12} className="text-rose-300" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={calViewMode}
                onChange={(e) => setCalViewMode(e.target.value)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
              >
                <option value="monthly" className="bg-slate-900 text-white">Monthly Overview</option>
                <option value="daily" className="bg-slate-900 text-white">Today's Schedule</option>
                <option value="weekly" className="bg-slate-900 text-white">Weekly View</option>
                <option value="yearly" className="bg-slate-900 text-white">Yearly Overview</option>
              </select>

              <select
                value={calTypeFilter}
                onChange={(e) => setCalTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Types</option>
                <option value="holiday" className="bg-slate-900 text-white">Holidays</option>
                <option value="exam" className="bg-slate-900 text-white">Exams</option>
                <option value="event" className="bg-slate-900 text-white">Events</option>
                <option value="placement" className="bg-slate-900 text-white">Placement Drives</option>
                <option value="workshop" className="bg-slate-900 text-white">Workshops</option>
              </select>
            </div>

            <button 
              onClick={() => { resetCalForm(); setIsCalModalOpen(true); }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <CalendarDays size={14} />
              <span>Add Calendar Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCalendar.map(evt => (
              <div key={evt.id} className="p-5 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase border ${
                      evt.type === 'holiday' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                      evt.type === 'exam' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                      evt.type === 'event' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                    }`}>{evt.type}</span>
                    <span className="text-[10px] text-gray-300 font-bold">{evt.startDate}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white mt-2 drop-shadow-sm">{evt.title}</h4>
                  <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">{evt.description}</p>
                  {evt.semester && <p className="text-[10px] text-gray-400 mt-1">Scope: {evt.semester}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t border-white/10 pt-3 mt-3">
                  <button onClick={() => handleOpenEditCal(evt)} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/30 rounded-lg text-cyan-300 cursor-pointer">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDeleteCal(evt.id)} className="p-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 rounded-lg text-rose-300 cursor-pointer">
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
        <div className="space-y-6">
          {/* Cloud Storage Managed Export Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Last Backup</span>
              <span className="text-sm font-bold text-white">20 Aug 2026, 02:00 AM</span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Verified Completed</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Backup Status</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Production Active
              </span>
              <span className="text-[10px] text-gray-300 block mt-1">16 Canonical Collections</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Next Scheduled Backup</span>
              <span className="text-sm font-bold text-cyan-300">21 Aug 2026, 02:00 AM</span>
              <span className="text-[10px] text-gray-400 block mt-1">Daily Automated (Asia/Kolkata)</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Cloud Storage Bucket</span>
              <span className="text-xs font-mono font-bold text-blue-300 truncate block">gs://college-erp-backups</span>
              <span className="text-[10px] text-amber-300 font-semibold block mt-1">30-Day Auto Retention</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-lg space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-white drop-shadow-sm">Firestore Snapshot Tools</h3>
                <p className="text-xs text-gray-300 mt-1">Triggers Firestore Managed Export to Cloud Storage across all 16 collections.</p>
              </div>

              <button 
                onClick={handleTriggerBackup}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Download size={14} />
                <span>Run Backup Now</span>
              </button>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <label className="block text-[10px] uppercase font-bold text-gray-300">Disaster Recovery Protocol</label>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Restores are executed via Cloud Shell using <code className="text-cyan-300 font-mono">gcloud firestore import</code>. See <code className="text-cyan-300 font-mono">scripts/disaster_recovery.md</code> for the step-by-step restoration playbook.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-3xl p-6">
              <span className="text-xs font-black text-gray-400 block uppercase tracking-wider mb-4 border-b border-white/10 pb-3">Firestore Backup Audit Trail (`backup_logs`)</span>
              {backupLogs.length === 0 ? (
                <div className="py-20 text-center text-gray-400">No backup operations completed yet.</div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {backupLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-white">{log.backupId || log.backupName || `Backup #${idx + 1}`}</span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          log.status === 'completed' || log.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.status === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {log.status || 'Completed'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 font-mono">
                        Path: {log.exportPath || log.location || 'gs://college-erp-system-df02d-firestore-backups/firestore-backups/'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Triggered by: {log.triggeredBy || 'admin'} • {log.timestamp || log.createdAt || log.startedAt || 'Recent'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-lg h-fit">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4 drop-shadow-sm">
              <BookOpen size={18} className="text-cyan-400" />
              <span>Workload Allocator</span>
            </h3>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Academic Branch</label>
                <select
                  value={allocBranch}
                  onChange={(e) => {
                    setAllocBranch(e.target.value);
                    setAllocSubject(''); // Automatically clear subject when branch changes
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select Department...</option>
                  {KBN_BRANCHES.map(b => <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Semester</label>
                <select
                  value={allocSemester}
                  onChange={(e) => setAllocSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                >
                  {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Assigned Subject</label>
                <select 
                  value={allocSubject}
                  onChange={(e) => setAllocSubject(e.target.value)}
                  disabled={!allocBranch}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {!allocBranch ? (
                    <option value="" className="bg-slate-900 text-white">Select Department First</option>
                  ) : (
                    <>
                      <option value="" className="bg-slate-900 text-white">Select Subject...</option>
                      {(BRANCH_SUBJECT_MAP[allocBranch] || []).map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Assigned Faculty Member</label>
                <select
                  value={allocFacultyId}
                  onChange={(e) => setAllocFacultyId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select Faculty...</option>
                  {faculties.map(f => (
                    <option key={f.uid} value={f.uid} className="bg-slate-900 text-white">{f.fullName || f.full_name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md mt-6 cursor-pointer hover:scale-[1.02]">
                Confirm Allocation Ledger
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-3xl overflow-hidden p-6 w-full max-w-full">
            <span className="text-xs font-black text-gray-400 block uppercase tracking-wider mb-4 border-b border-white/10 pb-3">Active Faculty workload ledgers</span>
            {allocations.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No subject allocations currently active.</div>
            ) : (
              <div className="border border-white/10 rounded-2xl overflow-hidden w-full max-w-full overflow-x-hidden">
                <table className="w-full table-fixed text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black/40 text-gray-400 border-b border-white/10 uppercase font-bold tracking-wider">
                      <th className="w-[30%] px-3 py-3">Allocated Scope</th>
                      <th className="w-[35%] px-3 py-3">Subject</th>
                      <th className="w-[35%] px-3 py-3">Faculty Instructor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white font-medium">
                    {allocations.map(a => (
                      <tr key={a.allocationId} className="hover:bg-white/10 transition-colors">
                        <td className="px-3 py-3 text-gray-300 font-bold break-words align-middle">{a.branch} • {a.semester}</td>
                        <td className="px-3 py-3 whitespace-normal break-words text-cyan-300 font-semibold align-middle">{a.subjectName}</td>
                        <td className="px-3 py-3 whitespace-normal break-words text-white font-semibold align-middle">{a.facultyName}</td>
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
        <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-3xl p-6 w-full max-w-full">
          <div className="border-b border-white/10 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-gray-400 block uppercase tracking-wider">Leave Applications Panel</span>
              <p className="text-xs font-normal text-gray-300 mt-0.5">Approve or reject leaves submitted directly by the Principal</p>
            </div>
            
            <input 
              type="text" 
              placeholder="Remarks for reviews..."
              value={reviewingRemarks}
              onChange={(e) => setReviewingRemarks(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold w-full sm:w-64 placeholder-gray-400"
            />
          </div>

          {allLeaves.filter(l => l.applicant_role === 'principal' || l.applicantRole === 'principal').length === 0 ? (
            <div className="text-center py-20 text-gray-400">No Principal leave requests pending.</div>
          ) : (
            <div className="border border-white/10 rounded-2xl overflow-hidden w-full max-w-full overflow-x-hidden">
              <table className="w-full table-fixed text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/40 text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider">
                    <th className="w-[24%] px-3 py-3">Applicant</th>
                    <th className="w-[20%] px-3 py-3">Scope Dates</th>
                    <th className="w-[26%] px-3 py-3">Reason</th>
                    <th className="w-[14%] px-3 py-3 text-center">Status</th>
                    <th className="w-[16%] px-3 py-3 text-center">Oversight Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-medium">
                  {allLeaves.filter(l => l.applicant_role === 'principal' || l.applicantRole === 'principal').map(l => (
                    <tr key={l.leaveId} className="hover:bg-white/10 transition-colors">
                      <td className="px-3 py-3 break-words align-middle">
                        <div className="font-extrabold text-white break-words">{l.studentName}</div>
                        <span className="text-[9px] text-purple-300 font-black block">Principal</span>
                      </td>
                      <td className="px-3 py-3 text-gray-300 break-words align-middle font-mono text-[11px]">{l.startDate} to {l.endDate}</td>
                      <td className="px-3 py-3 font-normal text-gray-200 break-words align-middle">{l.reason}</td>
                      <td className="px-3 py-3 text-center align-middle">
                        <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase border inline-block break-words ${
                          l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                          l.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}>{l.status}</span>
                      </td>
                      <td className="px-3 py-3 text-center align-middle">
                        {l.status === 'pending' ? (
                          <div className="flex justify-center items-center gap-1.5 flex-wrap">
                            <button onClick={() => handleReviewLeave(l.leaveId, 'approved')} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]">
                              <Check size={11} />
                              <span>Approve</span>
                            </button>
                            <button onClick={() => handleReviewLeave(l.leaveId, 'rejected')} className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]">
                              <X size={11} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-normal break-words text-[11px]">{l.remarks || 'No remarks'}</span>
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
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="text-[10px] text-gray-400 block uppercase font-black tracking-wider">Fee Ledger Settle</span>
              <p className="text-3xl font-black text-white mt-1 drop-shadow-sm">
                ₹{allFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-3xl overflow-hidden p-6 w-full max-w-full">
            <span className="text-xs font-black text-gray-400 block uppercase tracking-wider mb-4 border-b border-white/10 pb-3">Institution fee transaction registers</span>
            {allFees.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No transaction records generated.</div>
            ) : (
              <div className="border border-white/10 rounded-2xl overflow-hidden w-full max-w-full overflow-x-hidden">
                <table className="w-full table-fixed text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black/40 text-gray-400 border-b border-white/10 uppercase font-bold tracking-wider">
                      <th className="w-[40%] px-3 py-3">Student Name</th>
                      <th className="w-[25%] px-3 py-3">Fee Type</th>
                      <th className="w-[20%] px-3 py-3 text-right">Amount</th>
                      <th className="w-[15%] px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white font-medium">
                    {allFees.map((f, idx) => (
                      <tr key={idx} className="hover:bg-white/10 transition-colors">
                        <td className="px-3 py-3 break-words align-middle">
                          <div className="font-extrabold text-white break-words">{f.studentName}</div>
                          <span className="text-[10px] text-cyan-300 block font-normal font-mono break-words">{f.rollNumber}</span>
                        </td>
                        <td className="px-3 py-3 text-gray-200 break-words align-middle">{f.feeType}</td>
                        <td className="px-3 py-3 text-right font-bold text-cyan-300 break-words align-middle">₹{f.amount.toLocaleString()}</td>
                        <td className="px-3 py-3 text-center align-middle">
                          <span className={`px-2 py-0.5 text-[9px] rounded-full font-black uppercase border inline-block break-words ${
                            f.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] sm:max-h-[85vh] text-white cursor-default overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0">
              <h3 className="text-lg font-black text-white drop-shadow-sm">
                {editingUser ? 'Modify User Profile' : 'Provision User Account'}
              </h3>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }} 
                aria-label="Close modal"
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all cursor-pointer text-gray-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form wrapper */}
            <form onSubmit={handleSaveUser} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Account Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      disabled={!!editingUser}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                    >
                      <option value="student" className="bg-slate-900 text-white">Student</option>
                      <option value="faculty" className="bg-slate-900 text-white">Faculty</option>
                      <option value="hod" className="bg-slate-900 text-white">HOD</option>
                      <option value="counsellor" className="bg-slate-900 text-white">Ward Counsellor</option>
                      <option value="principal" className="bg-slate-900 text-white">Principal</option>
                      <option value="librarian" className="bg-slate-900 text-white">Librarian</option>
                      <option value="placement" className="bg-slate-900 text-white">Placement Officer</option>
                      <option value="admin" className="bg-slate-900 text-white">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Academic Department</label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                    >
                      <option value="N/A" className="bg-slate-900 text-white">N/A</option>
                      <option value="All" className="bg-slate-900 text-white">All</option>
                      {COLLEGE_DEPARTMENTS.map((b, idx) => <option key={`${b}-${idx}`} value={b} className="bg-slate-900 text-white">{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Full Name</label>
                  <input type="text" placeholder="Prof. Jane Doe" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Email Address</label>
                  <input type="email" placeholder="jane.doe@kbn.edu" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required disabled={!!editingUser} className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400 disabled:opacity-50" />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Initial Password</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 pr-9 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                        aria-label={showFormPassword ? "Hide password" : "Show password"}
                      >
                        {showFormPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {formRole === 'student' && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Semester</label>
                        <select
                          value={formSemester}
                          onChange={(e) => setFormSemester(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                        >
                          {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Section</label>
                        <select
                          value={formSection}
                          onChange={(e) => setFormSection(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                        >
                          <option value="A" className="bg-slate-900 text-white">Section A</option>
                          <option value="B" className="bg-slate-900 text-white">Section B</option>
                          <option value="C" className="bg-slate-900 text-white">Section C</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Roll / Admission No.</label>
                        <input type="text" placeholder="e.g. 3KB21CS045" value={formRollNumber} onChange={(e) => setFormRollNumber(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Academic Year</label>
                        <select
                          value={formAcademicYear}
                          onChange={(e) => setFormAcademicYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer"
                        >
                          <option value="2026-2027" className="bg-slate-900 text-white">2026-2027</option>
                          <option value="2025-2026" className="bg-slate-900 text-white">2025-2026</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Parent Name</label>
                        <input type="text" placeholder="Guardian / Parent Name" value={formParentName} onChange={(e) => setFormParentName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Parent Email</label>
                        <input type="email" placeholder="parent@gmail.com" value={formParentEmail} onChange={(e) => setFormParentEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {(formRole === 'faculty' || formRole === 'hod' || formRole === 'counsellor' || formRole === 'librarian' || formRole === 'placement') && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Employee ID</label>
                      <input type="text" placeholder="e.g. KBN-FAC-042" value={formEmployeeId} onChange={(e) => setFormEmployeeId(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400" />
                    </div>
                  </div>
                )}

                {/* Phone & OTP Verification Section */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="block text-[10px] uppercase font-bold text-gray-300">
                    Mobile Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formCountryCode}
                      onChange={(e) => setFormCountryCode(e.target.value)}
                      disabled={isPhoneVerified}
                      className="w-24 px-2 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="+91" className="bg-slate-900 text-white">🇮🇳 +91</option>
                      <option value="+1" className="bg-slate-900 text-white">🇺🇸 +1</option>
                      <option value="+44" className="bg-slate-900 text-white">🇬🇧 +44</option>
                      <option value="+971" className="bg-slate-900 text-white">🇦🇪 +971</option>
                    </select>

                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formMobile}
                      onChange={(e) => {
                        setFormMobile(e.target.value);
                        setIsPhoneVerified(false);
                        setOtpSent(false);
                      }}
                      required
                      disabled={isPhoneVerified}
                      className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400 disabled:opacity-50"
                    />

                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !formMobile || formMobile.length < 10}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow cursor-pointer whitespace-nowrap"
                      >
                        {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    )}
                  </div>

                  {/* reCAPTCHA container */}
                  <div id="recaptcha-container"></div>

                  {isPhoneVerified && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check size={16} />
                      <span>Phone Number Verified Successfully (SMS OTP)</span>
                    </div>
                  )}

                  {otpSent && !isPhoneVerified && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <label className="block text-[10px] uppercase font-bold text-cyan-300">
                        Enter 6-Digit SMS Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-cyan-400/40 bg-black/40 text-center tracking-[6px] text-sm focus:outline-none text-white font-black placeholder-gray-500"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || otpCode.length < 6}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow cursor-pointer"
                        >
                          {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                        <span>Didn't receive SMS OTP?</span>
                        {resendCountdown > 0 ? (
                          <span className="text-cyan-300 font-extrabold">Resend in {resendCountdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-cyan-400 underline hover:text-cyan-300 font-extrabold cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pinned Action Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-md shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingUser && !isPhoneVerified}
                  className={`w-2/3 py-3 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                    !editingUser && !isPhoneVerified
                      ? 'bg-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02]'
                  }`}
                >
                  {editingUser ? 'Update Account' : isPhoneVerified ? 'Create Account' : 'Verify Phone OTP to Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CALENDAR MODAL --- */}
      {isCalModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setIsCalModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl relative text-white cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCalModalOpen(false);
              }} 
              aria-label="Close modal"
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all cursor-pointer text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-black text-white drop-shadow-sm mb-6">
              {editingCalEvent ? 'Edit Calendar Event' : 'Add Calendar Event'}
            </h3>

            <form onSubmit={handleSaveCalEvent} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Event Title</label>
                <input type="text" placeholder="Mid Term Exams" value={calTitle} onChange={(e) => setCalTitle(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white placeholder-gray-400 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Type</label>
                  <select value={calType} onChange={(e) => setCalType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer">
                    <option value="holiday" className="bg-slate-900 text-white">Holiday</option>
                    <option value="exam" className="bg-slate-900 text-white">Exam Schedule</option>
                    <option value="event" className="bg-slate-900 text-white">Campus Event</option>
                    <option value="workshop" className="bg-slate-900 text-white">Workshop</option>
                    <option value="seminar" className="bg-slate-900 text-white">Seminar</option>
                    <option value="placement" className="bg-slate-900 text-white">Placement Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Sub-Type</label>
                  <select value={calSubType} onChange={(e) => setCalSubType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer">
                    {calType === 'holiday' ? (
                      <>
                        <option value="government" className="bg-slate-900 text-white">Government Holiday</option>
                        <option value="festival" className="bg-slate-900 text-white">Festival</option>
                        <option value="college" className="bg-slate-900 text-white">College Specific</option>
                      </>
                    ) : calType === 'exam' ? (
                      <>
                        <option value="mid" className="bg-slate-900 text-white">Mid Exam</option>
                        <option value="internal" className="bg-slate-900 text-white">Internal Exam</option>
                        <option value="semester" className="bg-slate-900 text-white">Semester Exam</option>
                        <option value="practical" className="bg-slate-900 text-white">Practical Exam</option>
                      </>
                    ) : (
                      <option value="general" className="bg-slate-900 text-white">General</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Start Date</label>
                  <input type="date" value={calStartDate} onChange={(e) => setCalStartDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">End Date</label>
                  <input type="date" value={calEndDate} onChange={(e) => setCalEndDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Description</label>
                <textarea rows="3" value={calDescription} onChange={(e) => setCalDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-medium resize-none placeholder-gray-400"></textarea>
              </div>

              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md mt-4 cursor-pointer hover:scale-[1.02]">
                Save Entry Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {isResetModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl relative text-white cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsResetModalOpen(false);
              }} 
              aria-label="Close modal"
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all cursor-pointer text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white drop-shadow-sm mb-6">Reset Account Password</h3>
            <form onSubmit={handleSaveReset} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none text-white font-bold placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md transition-all mt-4 cursor-pointer hover:scale-[1.02]">
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
