import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';
import { 
  CheckCircle, 
  XCircle, 
  Upload, 
  Users, 
  Calendar, 
  BookOpen, 
  Check, 
  X, 
  AlertCircle, 
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Briefcase,
  Megaphone,
  CheckSquare,
  LayoutDashboard,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  Search
} from 'lucide-react';

export const FacultyPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <FacultyDashboard faculty={user} />;
  if (subPage === 'ward-counselling' || subPage === 'wards') return <FacultyWardCounselling faculty={user} />;
  if (subPage === 'attendance') return <FacultyAttendance faculty={user} />;
  if (subPage === 'notes') return <FacultyNotes faculty={user} />;
  if (subPage === 'marks') return <FacultyMarks faculty={user} />;
  if (subPage === 'assignments') return <FacultyAssignments faculty={user} />;
  if (subPage === 'leaves') return <FacultyLeaves faculty={user} />;
  return <FacultyDashboard faculty={user} />;
};

// 1. FACULTY DASHBOARD (WITH ANNOUNCEMENTS & SUBJECTS)
const FacultyDashboard = ({ faculty }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    uploadedNotesCount: 0,
    attendanceCompliance: 92
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [allocatedSubjects, setAllocatedSubjects] = useState([]);
  
  // Announcement states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSending, setAnnSending] = useState(false);
  const { showToast } = useAuth();

  const [wardAssignment, setWardAssignment] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const assign = await mockDB.getFacultyWardAssignment(faculty.uid);
      setWardAssignment(assign);

      // Fetch uploaded notes
      const notesData = await mockDB.getNotes(faculty.department);
      const myNotes = notesData.filter(n => n.facultyId === faculty.uid);
      setRecentNotes(myNotes.slice(0, 3));

      // Fetch subject allocations
      const allocs = await mockDB.getSubjectAllocations(null, faculty.uid);
      setAllocatedSubjects(allocs);

      // Generate mock stats summary
      setStats({
        uploadedNotesCount: myNotes.length,
        attendanceCompliance: Math.round(80 + Math.random() * 15)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [faculty]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      setAnnSending(true);
      await mockDB.createAnnouncement(annTitle, annContent, `${faculty.fullName} (${faculty.department} Faculty)`);
      showToast('Announcement posted successfully for all students!', 'success');
      setAnnTitle('');
      setAnnContent('');
    } catch (_) {
      showToast('Could not publish notice.', 'error');
    } finally {
      setAnnSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-xs font-semibold">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Welcome Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-650 to-teal-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Welcome back, {faculty.fullName}!</h2>
          <p className="text-sm text-emerald-100 mt-1">
            Department of {faculty.department} • Active Academic Member
          </p>
        </div>
        {wardAssignment && (
          <div className="px-4 py-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-white flex items-center gap-3 shrink-0">
            <div>
              <span className="text-[9px] font-black uppercase text-emerald-200 tracking-wider block">Ward Counsellor Role Active</span>
              <p className="text-xs font-black">{wardAssignment.assignedSection || wardAssignment.section} ({wardAssignment.wardStudentsCount} Wards)</p>
            </div>
            <a href="/faculty/ward-counselling" className="px-3 py-1.5 bg-white text-emerald-800 rounded-xl font-extrabold text-[11px] hover:bg-emerald-50">
              View Wards →
            </a>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Allocated Subjects Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Assigned Subjects</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{allocatedSubjects.length}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Calendar size={20} />
          </div>
        </div>

        {/* Uploaded Notes Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Uploaded Notes</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats.uploadedNotesCount}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lecture Attendance Avg</span>
            <p className="text-3xl font-black text-emerald-500 mt-1.5">{stats.attendanceCompliance}%</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Users size={20} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Allocated subjects list & Announcements */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Allocated Subjects */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Allocated Subject Modules</span>
            {allocatedSubjects.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-455">
                No subjects assigned by HOD currently. Default subjects from registry will be visible.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allocatedSubjects.map(a => (
                  <div key={a.allocationId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{a.subjectName}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">{a.branch} • {a.semester}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post Announcements Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Publish Student Alert</span>
            
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Notice Title</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g., Guest Lecture rescheduling / Midterm reviews"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Announcement Details</label>
                <textarea
                  rows="3"
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Details of instructions, schedules, links..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={annSending}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Megaphone size={14} />
                <span>{annSending ? 'Publishing...' : 'Broadcast Announcement'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Recently Shared notes */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Lecture Slides Shared</span>
          {recentNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">You have not uploaded notes recently.</div>
          ) : (
            <div className="space-y-4">
              {recentNotes.map(n => (
                <div key={n.noteId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{n.topic}</h4>
                    <span className="text-[9.5px] text-slate-450 dark:text-slate-400 font-bold uppercase">{n.subject} • {n.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 2. FACULTY ATTENDANCE MANAGER
const FacultyAttendance = ({ faculty }) => {
  const [activeSubTab, setActiveSubTab] = useState('mark'); // 'mark' | 'dashboard'

  // Mark Attendance States
  const availableBranches = KBN_BRANCHES;
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [section, setSection] = useState('A');
  const [allocatedSubjects, setAllocatedSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [period, setPeriod] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // studentId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Security locks state
  const [isLocked, setIsLocked] = useState(false);
  const [editAllowed, setEditAllowed] = useState(true);
  const [requestingUnlock, setRequestingUnlock] = useState(false);
  const [unlockRequestStatus, setUnlockRequestStatus] = useState('none'); // 'none' | 'pending' | 'approved'

  // Dashboard States
  const [todayRecords, setTodayRecords] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [subjectStats, setSubjectStats] = useState([]);
  const [defaultersList, setDefaultersList] = useState([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [searchStudentResult, setSearchStudentResult] = useState(null);
  // Custom Student Enrollment & Profile Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');

  // Attendance Correction & Audit History Modal States
  const [showEditReasonModal, setShowEditReasonModal] = useState(null); // { student, period, oldStatus, newStatus }
  const [selectedReason, setSelectedReason] = useState('Student attended but was marked absent.');
  const [customReasonText, setCustomReasonText] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(null); // { student, period }
  const [historyLogs, setHistoryLogs] = useState([]);

  const handleInitiateCorrection = (student, pNum, newSt = null) => {
    const sId = student.uid || student.rollNumber;
    const currentRec = allDayAttendance.find(a => 
      (a.studentId === sId || a.rollNumber === student.rollNumber) && 
      Number(a.period || a.lecturePeriod) === Number(pNum)
    );
    const oldSt = currentRec ? currentRec.status : (attendanceSheet[sId] || 'unmarked');
    const targetSt = newSt || (oldSt === 'absent' ? 'present' : 'absent');

    setShowEditReasonModal({
      student,
      period: pNum,
      oldStatus: oldSt,
      newStatus: targetSt,
      record: currentRec
    });
    setSelectedReason('Student attended but was marked absent.');
    setCustomReasonText('');
  };

  const handleConfirmCorrection = async (e) => {
    e.preventDefault();
    if (!showEditReasonModal) return;
    const finalReason = selectedReason === 'Other' ? customReasonText : selectedReason;
    if (!finalReason || !finalReason.trim()) {
      showToast('Please specify a mandatory reason for attendance correction.', 'warning');
      return;
    }

    try {
      setSubmittingCorrection(true);
      const { student, period: pNum, oldStatus, newStatus } = showEditReasonModal;
      const sId = student.uid || student.rollNumber;

      await mockDB.saveAttendanceCorrection({
        studentId: sId,
        rollNumber: student.rollNumber,
        studentName: student.fullName || student.studentName,
        subject,
        date,
        period: pNum,
        oldStatus,
        newStatus,
        editedBy: faculty.fullName || faculty.full_name || 'Faculty',
        facultyId: faculty.uid,
        reason: finalReason
      });

      if (Number(pNum) === Number(period)) {
        setAttendanceSheet(prev => ({ ...prev, [sId]: newStatus }));
      }

      showToast(`Period ${pNum} attendance corrected (${oldStatus} → ${newStatus}) with audit trail saved.`, 'success');
      setShowEditReasonModal(null);
    } catch (err) {
      console.error("handleConfirmCorrection error:", err);
      showToast('Could not save attendance correction.', 'error');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const handleOpenHistoryModal = (student, pNum) => {
    const sId = student.uid || student.rollNumber;
    setShowHistoryModal({ student, period: pNum });

    mockDB.subscribeAttendanceHistory(sId, date, subject, pNum, (logs) => {
      setHistoryLogs(logs || []);
    });
  };

  const handleRestoreOriginalStatus = async (log) => {
    try {
      await mockDB.saveAttendanceCorrection({
        studentId: log.studentId,
        rollNumber: log.rollNumber,
        studentName: log.studentName,
        subject: log.subject,
        date: log.date,
        period: log.period,
        oldStatus: log.newStatus,
        newStatus: log.oldStatus,
        editedBy: `${faculty.fullName || faculty.full_name} (Admin Restore)`,
        facultyId: faculty.uid,
        reason: `Admin restored original status from revision of ${log.editedAt}`
      });
      showToast('Original attendance status restored successfully.', 'success');
    } catch (e) {
      showToast('Failed to restore status.', 'error');
    }
  };

  const { showToast } = useAuth();

  const handleAddCustomStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentRoll) return;
    try {
      const added = await mockDB.addStudentToClass({
        fullName: newStudentName,
        rollNumber: newStudentRoll,
        department: branch,
        semester,
        section
      });
      showToast(`Student ${added.fullName} (${added.rollNumber}) added to class!`, 'success');
      setNewStudentName('');
      setNewStudentRoll('');
      setShowAddStudentModal(false);
      handleFetchStudents();
    } catch (_) {
      showToast('Could not add student.', 'error');
    }
  };

  // Load subject allocations
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const allocs = await mockDB.getSubjectAllocations(null, faculty.uid);
        setAllocatedSubjects(allocs);
        if (allocs.length > 0) {
          setSubject(allocs[0].subjectName);
        } else if (faculty.subjects && faculty.subjects.length > 0) {
          setSubject(faculty.subjects[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllocations();
  }, [faculty]);

  // Check locks and edit permissions
  useEffect(() => {
    const checkLockStatus = async () => {
      if (!subject) return;
      try {
        const allowed = await mockDB.checkAttendanceEditAllowed(faculty.uid, branch, semester, section, subject, period, date);
        setEditAllowed(allowed);
        
        const today = new Date().toISOString().split('T')[0];
        const diffTime = Math.abs(new Date(today) - new Date(date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setIsLocked(diffDays > 1);

        // Fetch unlock request status
        const reqs = await mockDB.getAttendanceEditRequests(faculty.uid);
        const match = reqs.find(r => 
          r.attendanceDate === date && 
          Number(r.period) === Number(period) &&
          r.subject === subject &&
          r.branch === branch &&
          r.semester === semester &&
          r.section === section
        );
        setUnlockRequestStatus(match ? match.status : 'none');
      } catch (err) {
        console.error(err);
      }
    };
    checkLockStatus();
  }, [branch, semester, section, subject, period, date]);

  const [remarksSheet, setRemarksSheet] = useState({}); // studentId -> remarks
  const [allDayAttendance, setAllDayAttendance] = useState([]); // all period records for date

  // Fetch students & attendance sheet with real-time Firestore listener for all periods (1-6)
  useEffect(() => {
    let unsubscribe = () => {};
    const fetchStudentsAndAttendance = async () => {
      if (!branch || !semester || !section) return;
      try {
        setLoading(true);
        const studentUsers = await mockDB.getStudentsByBranchAndSemester(branch, semester, section);
        setStudents(studentUsers);

        // Safely fetch leave applications
        let leavesData = [];
        try {
          const leavesPromises = studentUsers.map(async (s) => {
            const studentLeaves = (await mockDB.getLeaves('student', s.uid)) || [];
            const isApprovedLeave = Array.isArray(studentLeaves) && studentLeaves.some(l => l.status === 'approved' && date >= l.startDate && date <= l.endDate);
            return { uid: s.uid, isApprovedLeave };
          });
          leavesData = await Promise.all(leavesPromises);
        } catch (e) {
          console.warn("Leaves check failed, proceeding with roster:", e);
        }

        // Subscribe to real-time class attendance from Firestore for all periods
        unsubscribe = mockDB.subscribeClassAttendance(branch, semester, section, date, subject, null, (existingAttendance) => {
          setAllDayAttendance(existingAttendance || []);

          // Filter for current active period (1-6)
          const currentPeriodRecords = (existingAttendance || []).filter(a => Number(a.period || a.lecturePeriod) === Number(period));

          const sheet = {};
          const remarksMap = {};
          studentUsers.forEach(s => {
            const exist = currentPeriodRecords.find(a => a.studentId === s.uid || a.rollNumber === s.rollNumber);
            const leaveInfo = leavesData.find(l => l.uid === s.uid);

            if (leaveInfo?.isApprovedLeave) {
              sheet[s.uid] = 'leave_approved';
            } else if (exist) {
              sheet[s.uid] = exist.status || 'present';
              remarksMap[s.uid] = exist.remarks || '';
            } else {
              sheet[s.uid] = 'unmarked';
              remarksMap[s.uid] = '';
            }
          });
          setAttendanceSheet(sheet);
          setRemarksSheet(prev => ({ ...remarksMap, ...prev }));
        });
      } catch (err) {
        console.error("fetchStudentsAndAttendance error:", err);
        showToast('Failed to retrieve class list.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
    return () => unsubscribe();
  }, [branch, semester, section, subject, period, date]);

  // Request Unlock
  const handleRequestUnlock = async () => {
    try {
      setRequestingUnlock(true);
      const reqObj = {
        attendanceDate: date,
        period: Number(period),
        subject,
        branch,
        semester,
        section,
        facultyId: faculty.uid,
        facultyName: faculty.fullName || faculty.full_name
      };
      await mockDB.createAttendanceEditRequest(reqObj);
      showToast('Edit unlock request submitted to HOD successfully.', 'success');
      setUnlockRequestStatus('pending');
    } catch (_) {
      showToast('Failed to submit request.', 'error');
    } finally {
      setRequestingUnlock(false);
    }
  };

  const toggleStatus = (id, newStatus) => {
    if (attendanceSheet[id] === 'leave_approved') {
      showToast('Approved leave attendance status cannot be modified.', 'warning');
      return;
    }
    setAttendanceSheet(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  const handleRemarkChange = (id, text) => {
    setRemarksSheet(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const markAll = (status) => {
    const sheet = { ...attendanceSheet };
    students.forEach(s => {
      if (sheet[s.uid] !== 'leave_approved') {
        sheet[s.uid] = status;
      }
    });
    setAttendanceSheet(sheet);
  };

  const handleSaveAttendance = async () => {
    if (!subject) {
      showToast('Please select an assigned subject first.', 'warning');
      return;
    }
    if (!editAllowed) {
      showToast('Editing is locked for past dates. Requires HOD approval.', 'error');
      return;
    }
    if (!students || students.length === 0) {
      showToast('No student roster found to save attendance.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const records = students.map(s => {
        const sId = s.uid || s.studentId || s.rollNumber;
        return {
          studentId: sId,
          studentName: s.fullName || s.studentName || 'Student',
          rollNumber: s.rollNumber || sId,
          date,
          period: Number(period),
          subject,
          status: attendanceSheet[s.uid] || attendanceSheet[s.rollNumber] || 'present',
          remarks: remarksSheet[s.uid] || remarksSheet[s.rollNumber] || '',
          branch,
          semester,
          section
        };
      });

      await mockDB.saveAttendanceBatch(records, faculty?.uid, faculty?.fullName || faculty?.full_name);
      showToast(`Period ${period} attendance saved to Firestore successfully!`, 'success');
    } catch (err) {
      console.error("handleSaveAttendance error:", err);
      showToast('Could not save attendance data.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Dashboard calculations
  const loadDashboardData = async () => {
    if (!subject) return;
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayAtt = await mockDB.getAttendanceByFilter(branch, semester, todayDate, section, subject);
      setTodayRecords(todayAtt);

      const allAtt = await mockDB.getAttendanceByFilter(branch, semester, null, section, subject);
      const mAtt = allAtt.filter(a => a.date.startsWith(selectedMonth));
      setMonthlyRecords(mAtt);

      const allSubjectAllocs = await mockDB.getSubjectAllocations(null, faculty.uid);
      const stats = await Promise.all(allSubjectAllocs.map(async (alloc) => {
        const attRecords = await mockDB.getAttendanceByFilter(alloc.branch, alloc.semester, null, null, alloc.subjectName);
        const presentCount = attRecords.filter(a => a.status === 'present').length;
        const total = attRecords.length;
        const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 100;
        return {
          subjectName: alloc.subjectName,
          branch: alloc.branch,
          semester: alloc.semester,
          percentage,
          totalLectures: total
        };
      }));
      setSubjectStats(stats);

      const classStudents = await mockDB.getStudentsByBranchAndSemester(branch, semester, section);
      const defaulters = [];
      for (const s of classStudents) {
        const sAtt = allAtt.filter(a => a.studentId === s.uid);
        const present = sAtt.filter(a => a.status === 'present').length;
        const total = sAtt.length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 100;
        if (pct < 75 && total > 0) {
          defaulters.push({
            rollNumber: s.rollNumber,
            fullName: s.fullName,
            percentage: pct,
            attended: present,
            totalLectures: total
          });
        }
      }
      setDefaultersList(defaulters);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'dashboard') {
      loadDashboardData();
    }
  }, [activeSubTab, branch, semester, section, subject, selectedMonth]);

  const handleStudentSearch = async () => {
    if (!studentSearchQuery.trim()) return;
    try {
      const allUsers = await mockDB.getAllUsers();
      const student = allUsers.find(u => 
        u.role === 'student' && 
        (u.rollNumber?.toLowerCase() === studentSearchQuery.toLowerCase() || 
         u.fullName?.toLowerCase().includes(studentSearchQuery.toLowerCase()))
      );
      if (!student) {
        showToast('Student not found.', 'warning');
        setSearchStudentResult(null);
        return;
      }
      const att = await mockDB.getAttendanceForStudent(student.uid);
      const present = att.filter(a => a.status === 'present').length;
      const total = att.length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

      setSearchStudentResult({
        student,
        attendanceRate: pct,
        records: att,
        attended: present,
        total
      });
    } catch (_) {
      showToast('Error searching student.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('mark')}
          className={`px-5 py-3 font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'mark' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'
          }`}
        >
          <CheckSquare size={14} />
          <span>Mark Class Attendance</span>
        </button>
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-5 py-3 font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'dashboard' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Attendance Dashboard & Defaulters</span>
        </button>
      </div>

      {activeSubTab === 'mark' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Daily Attendance Manager</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Select class parameters to fill current lecture logs</p>
            </div>

            {/* Status Indicator Alerts */}
            {isLocked && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-600">
                <AlertCircle size={14} />
                <span>Attendance &gt; 24 hours locked.</span>
                {!editAllowed ? (
                  unlockRequestStatus === 'pending' ? (
                    <span className="font-bold underline text-amber-500">Unlock request is pending...</span>
                  ) : (
                    <button
                      onClick={handleRequestUnlock}
                      disabled={requestingUnlock}
                      className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black transition-colors"
                    >
                      {requestingUnlock ? 'Submitting...' : 'Request Unlock'}
                    </button>
                  )
                ) : (
                  <span className="font-black text-emerald-500">Unlocked by HOD</span>
                )}
              </div>
            )}
          </div>

          {/* Configuration Form Filters */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Department</label>
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setSubject('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="">Select Department...</option>
                {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Assigned Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!branch}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {!branch ? (
                  <option value="">Select Department First</option>
                ) : (
                  <>
                    <option value="">Select Subject...</option>
                    {(BRANCH_SUBJECT_MAP[branch] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Lecture Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                {[1, 2, 3, 4, 5, 6].map(p => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Class Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-slate-450">Retrieving class roster from Firestore...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 font-extrabold text-sm">
                No students are registered for the selected Department, Semester and Section.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Lecture Periods 1 to 6 Navigation & Metadata */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Lecture Period Selector (Periods 1 - 6)</span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-bold mt-0.5 flex items-center gap-2">
                      <span>Marking: <strong className="text-blue-600 dark:text-blue-400">Period {period}</strong></span>
                      {(() => {
                        const curPeriodRecords = allDayAttendance.filter(a => Number(a.period || a.lecturePeriod) === Number(period));
                        if (curPeriodRecords.length > 0) {
                          const sample = curPeriodRecords[0];
                          const subTime = sample.updatedAt || sample.createdAt ? new Date(sample.updatedAt || sample.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved';
                          return (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20">
                              ✓ Period {period} Completed • Submitted by {sample.facultyName || 'Faculty'} at {subTime}
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-black rounded-full border border-amber-500/20">
                            ● Attendance Pending for Period {period}
                          </span>
                        );
                      })()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {allDayAttendance.filter(a => Number(a.period || a.lecturePeriod) === Number(period)).length > 0 && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200/50">
                        Edit Attendance Mode Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((pNum) => {
                    const periodRecords = allDayAttendance.filter(a => Number(a.period || a.lecturePeriod) === pNum);
                    const isCompleted = periodRecords.length > 0;
                    const isSelected = Number(period) === pNum;
                    const sample = isCompleted ? periodRecords[0] : null;

                    return (
                      <button
                        key={pNum}
                        onClick={() => setPeriod(pNum)}
                        className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all border flex flex-col items-start gap-0.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-extrabold text-xs">Period {pNum}</span>
                          {isCompleted ? (
                            <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-black ${
                              isSelected ? 'bg-white text-blue-600' : 'bg-emerald-600 text-white'
                            }`}>
                              ✓
                            </span>
                          ) : (
                            <span className={`text-[8.5px] font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>--</span>
                          )}
                        </div>
                        <span className={`text-[9.5px] font-medium tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {subject || 'Machine Learning'}
                        </span>
                        {sample && (
                          <span className={`text-[8.5px] mt-0.5 font-bold ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {sample.facultyName || 'Faculty'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">
                  Class Roster: {students.length} Registered Students
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => markAll('present')}
                    disabled={!editAllowed}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 font-bold border border-emerald-200/50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button 
                    onClick={() => markAll('absent')}
                    disabled={!editAllowed}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-bold border border-rose-200/50 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Student Profile Popup / Modal */}
              {selectedStudentModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Student Profile Information</h4>
                      <button onClick={() => setSelectedStudentModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                    </div>

                    <div className="space-y-3">
                      <img
                        src={selectedStudentModal.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentModal.rollNumber}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentModal.rollNumber}`;
                        }}
                        alt={selectedStudentModal.fullName || selectedStudentModal.studentName}
                        className="w-28 h-28 rounded-full border-4 border-blue-500/20 mx-auto object-cover shadow-lg"
                      />
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedStudentModal.fullName || selectedStudentModal.studentName}</h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedStudentModal.rollNumber}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-left text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[9.5px] font-black uppercase text-slate-400 block">Student ID</span>
                          <span className="text-slate-700 dark:text-slate-200 font-mono text-[11px] font-bold">{selectedStudentModal.uid || selectedStudentModal.studentId || `stud-${selectedStudentModal.rollNumber}`}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-black uppercase text-slate-400 block">Section</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedStudentModal.section || section}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9.5px] font-black uppercase text-slate-400 block">Department</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold truncate block">{selectedStudentModal.department || branch}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9.5px] font-black uppercase text-slate-400 block">Semester</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedStudentModal.semester || semester}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudentModal(null)}
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Attendance Edit Reason Mandatory Dialog */}
              {showEditReasonModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs font-semibold">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-black text-slate-850 dark:text-white text-sm">Attendance Correction Reason</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Period {showEditReasonModal.period} • {showEditReasonModal.student.fullName || showEditReasonModal.student.studentName} ({showEditReasonModal.student.rollNumber})
                        </p>
                      </div>
                      <button onClick={() => setShowEditReasonModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex flex-col gap-2 text-xs font-bold">
                      <div className="flex items-center justify-between">
                        <span>Original Status:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase font-black text-[10px]">{showEditReasonModal.oldStatus}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span>Correct Status To:</span>
                        <div className="flex items-center gap-1.5">
                          {['present', 'absent', 'leave'].map((stOpt) => (
                            <button
                              key={stOpt}
                              type="button"
                              onClick={() => setShowEditReasonModal(prev => ({ ...prev, newStatus: stOpt }))}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border transition-all ${
                                showEditReasonModal.newStatus === stOpt
                                  ? stOpt === 'present' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                    : stOpt === 'absent' ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                                    : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {stOpt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmCorrection} className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-400 mb-2">Select Mandatory Reason</label>
                        <div className="space-y-2">
                          {[
                            "Student attended but was marked absent.",
                            "Student arrived before attendance was completed.",
                            "Attendance entry mistake.",
                            "Faculty correction.",
                            "Other"
                          ].map((reasonOpt) => (
                            <label key={reasonOpt} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              selectedReason === reasonOpt
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name="correctionReason"
                                value={reasonOpt}
                                checked={selectedReason === reasonOpt}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>{reasonOpt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {selectedReason === 'Other' && (
                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Custom Reason Details *</label>
                          <textarea
                            required
                            rows={2}
                            value={customReasonText}
                            onChange={(e) => setCustomReasonText(e.target.value)}
                            placeholder="Provide specific details for this attendance change..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-medium"
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowEditReasonModal(null)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingCorrection}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow disabled:opacity-50"
                        >
                          {submittingCorrection ? 'Saving Audit...' : 'Save & Log Correction'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Attendance History Audit Modal */}
              {showHistoryModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs font-semibold">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-black text-slate-850 dark:text-white text-sm">Attendance Correction Audit Log</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Period {showHistoryModal.period} • {showHistoryModal.student.fullName || showHistoryModal.student.studentName} ({showHistoryModal.student.rollNumber})
                        </p>
                      </div>
                      <button onClick={() => setShowHistoryModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
                    </div>

                    {historyLogs.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-bold">
                        No correction audit logs recorded for this period yet.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {historyLogs.map((log, lIdx) => (
                          <div key={log.id || lIdx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                  {log.oldStatus || 'unmarked'}
                                </span>
                                <span>→</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  {log.newStatus}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{log.editedAt || log.createdAt}</span>
                            </div>

                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                              <span className="text-slate-400 font-normal">Reason: </span>
                              <span>"{log.reason}"</span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              <span>Edited by: <strong>{log.editedBy || 'Faculty'}</strong> ({log.facultyId})</span>
                              {(faculty?.role === 'admin' || faculty?.role === 'hod') && (
                                <button
                                  onClick={() => handleRestoreOriginalStatus(log)}
                                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                >
                                  Restore Original
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setShowHistoryModal(null)}
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      Close Audit History
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                      <th className="px-4 py-3 text-center">Photo</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Student Name</th>
                      {[1, 2, 3, 4, 5].map(pNum => (
                        <th key={pNum} className="px-2 py-3 text-center min-w-[110px]">
                          <div className="flex flex-col items-center">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">Period {pNum}</span>
                            <span className="text-[9.5px] text-slate-400 font-semibold normal-case truncate max-w-[100px]">
                              {subject || 'Machine Learning'}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                    {students.map((s, idx) => {
                      const sKey = s.uid ? `${s.uid}-${idx}` : (s.rollNumber ? `${s.rollNumber}-${idx}` : `stud-${idx}`);
                      const currentStatus = attendanceSheet[s.uid || s.rollNumber] || 'present';
                      const currentRemarks = remarksSheet[s.uid || s.rollNumber] || '';
                      const isApprovedLeave = currentStatus === 'leave_approved';
                      
                      return (
                        <tr key={sKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          
                          {/* 1. Photo (Circular Avatar 44px x 44px) */}
                          <td className="px-4 py-3.5 text-center">
                            <img
                              src={s.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.rollNumber}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.rollNumber}`;
                              }}
                              alt={s.fullName || s.studentName}
                              loading="lazy"
                              onClick={() => setSelectedStudentModal(s)}
                              className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 mx-auto object-cover cursor-pointer hover:scale-110 hover:border-blue-500 transition-all shadow-sm"
                              title="Click to view full student profile"
                            />
                          </td>

                          {/* 2. Roll Number */}
                          <td className="px-4 py-3.5 font-bold">{s.rollNumber}</td>

                          {/* 3. Student Name */}
                          <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white">{s.fullName || s.studentName}</td>

                          {/* 4 to 8. Periods 1 to 5 Columns */}
                          {[1, 2, 3, 4, 5].map(pNum => {
                            const pRec = allDayAttendance.find(a => 
                              (a.studentId === s.uid || a.rollNumber === s.rollNumber) && 
                              Number(a.period || a.lecturePeriod) === pNum
                            );
                            const isCurrentPeriod = pNum === Number(period);
                            const st = isCurrentPeriod ? currentStatus : (pRec ? pRec.status : 'unmarked');

                            return (
                              <td key={pNum} className="px-2 py-3.5 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {isCurrentPeriod ? (
                                    /* Interactive Attendance Radios for currently active period */
                                    isApprovedLeave ? (
                                      <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg font-bold text-[9px] uppercase">
                                        Leave
                                      </span>
                                    ) : (
                                      <div className="flex justify-center items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={!editAllowed}
                                          onClick={() => toggleStatus(s.uid, 'present')}
                                          className={`px-2 py-1 rounded-lg font-black text-[10px] uppercase border transition-all ${
                                            currentStatus === 'present'
                                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                                          }`}
                                          title="Mark Present"
                                        >
                                          P
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!editAllowed}
                                          onClick={() => toggleStatus(s.uid, 'absent')}
                                          className={`px-2 py-1 rounded-lg font-black text-[10px] uppercase border transition-all ${
                                            currentStatus === 'absent'
                                              ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50'
                                          }`}
                                          title="Mark Absent"
                                        >
                                          A
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!editAllowed}
                                          onClick={() => toggleStatus(s.uid, 'leave')}
                                          className={`px-2 py-1 rounded-lg font-black text-[10px] uppercase border transition-all ${
                                            currentStatus === 'leave'
                                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                                          }`}
                                          title="Mark Leave"
                                        >
                                          L
                                        </button>
                                      </div>
                                    )
                                  ) : (
                                    /* Read-Only Status badge for non-active periods with color indicators, ✏️ Edit icon & 🕒 History icon */
                                    <div className="flex flex-col items-center gap-1">
                                      <span 
                                        onClick={() => handleInitiateCorrection(s, pNum)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border cursor-pointer hover:scale-105 transition-all shadow-sm ${
                                          st === 'present' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25' :
                                          st === 'absent' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/25' :
                                          st === 'leave' || st === 'leave_approved' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/25' :
                                          'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                        }`}
                                        title="Click badge to edit attendance for this period"
                                      >
                                        {st === 'present' ? '🟢 Present' : st === 'absent' ? '🔴 Absent' : st === 'leave' || st === 'leave_approved' ? '🟡 Leave' : '--'}
                                      </span>

                                      {/* Action buttons (✏️ Edit & 🕒 History) */}
                                      <div className="flex items-center gap-1 text-[10px] mt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => handleInitiateCorrection(s, pNum)}
                                          className="p-0.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-all flex items-center gap-0.5 font-bold"
                                          title="Edit attendance for this period"
                                        >
                                          <span>✏️</span>
                                          <span className="text-[9px]">Edit</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleOpenHistoryModal(s, pNum)}
                                          className="p-0.5 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-all flex items-center gap-0.5 font-bold"
                                          title="View audit history for this period"
                                        >
                                          <span>🕒</span>
                                          <span className="text-[9px]">History</span>
                                        </button>

                                        {pRec?.isEdited && (
                                          <span
                                            className="px-1 py-0.2 text-[8px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded cursor-pointer"
                                            title={`Edited by ${pRec.lastEditedBy || 'Faculty'} on ${pRec.lastEditedAt || pRec.updatedAt}: "${pRec.lastReason || 'Correction'}"`}
                                            onClick={() => handleOpenHistoryModal(s, pNum)}
                                          >
                                            Edited
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          {/* 10. Remarks */}
                          <td className="px-4 py-3.5">
                            <input
                              type="text"
                              placeholder="Add remarks..."
                              value={currentRemarks}
                              disabled={!editAllowed}
                              onChange={(e) => handleRemarkChange(s.uid, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none dark:text-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 text-[11px] font-bold">
                  Saving for <strong className="text-slate-700 dark:text-white">Period {period}</strong> ({date})
                </span>
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || !editAllowed}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 disabled:opacity-50"
                >
                  {saving ? 'Saving Period...' : `Save Period ${period} Attendance`}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Attendance Dashboard subTab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stats Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-4">Subject Performance</h4>
              <div className="space-y-4">
                {subjectStats.map((stat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{stat.subjectName}</span>
                      <span className={`${stat.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.percentage}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-normal">{stat.branch} • {stat.semester} • Total lectures marked: {stat.totalLectures}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Defaulters list (<75%) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase">Wards Defaulters List</h4>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[10px] font-black uppercase">Below 75%</span>
              </div>
              
              {defaultersList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No student is below 75% attendance.</div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {defaultersList.map((def, idx) => (
                    <div key={idx} className="p-3 bg-red-500/5 rounded-2xl border border-red-200/20 flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">{def.fullName}</div>
                        <span className="text-[9.5px] text-slate-400 font-mono">{def.rollNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-red-505 block">{def.percentage}%</span>
                        <span className="text-[9px] text-slate-400 font-normal block">{def.attended}/{def.totalLectures} Lecs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-2 space-y-6">
            
            {/* Today Absentees summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-4">Today's Class Absentees</h4>
              
              {todayRecords.filter(a => a.status === 'absent').length === 0 ? (
                <div className="py-10 text-center text-slate-400">All students present today in marked lectures!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayRecords.filter(a => a.status === 'absent').map((a, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">{a.studentName}</div>
                        <span className="text-[10px] text-slate-405 block">Period {a.period} • {a.rollNumber}</span>
                      </div>
                      {a.potentialFullDayAbsent && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[9px] font-black uppercase animate-pulse">
                          Potential Full Day Absent
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Individual Student search lookup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-4">Search Student Logs</h4>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter Student Roll Number or Name..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
                />
                <button
                  onClick={handleStudentSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Search
                </button>
              </div>

              {searchStudentResult && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-105 dark:border-slate-800/80 pb-3">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{searchStudentResult.student.fullName}</h5>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">Roll No: {searchStudentResult.student.rollNumber} • Dept: {searchStudentResult.student.department}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black ${searchStudentResult.attendanceRate >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {searchStudentResult.attendanceRate}%
                      </span>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">{searchStudentResult.attended}/{searchStudentResult.total} Periods Present</p>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-extrabold text-[10px] uppercase text-slate-400 mb-2">Detailed Attendance Logs</h6>
                    {searchStudentResult.records.length === 0 ? (
                      <div className="text-center text-slate-400 py-4">No attendance marked for this student.</div>
                    ) : (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {searchStudentResult.records.map((rec, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] py-1">
                            <span className="text-slate-650 dark:text-slate-350">{rec.date} (Period {rec.period}) - {rec.subject}</span>
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                              rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                              rec.status === 'absent' ? 'bg-rose-500/10 text-rose-505' : 'bg-amber-500/10 text-amber-505'
                            }`}>{rec.status === 'leave_approved' ? 'Leave Approved' : rec.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Monthly GRID overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase">Monthly Lecture Grid</h4>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
                />
              </div>
              
              {monthlyRecords.length === 0 ? (
                <div className="py-10 text-center text-slate-455">No logs recorded for {selectedMonth} in this subject.</div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-855 rounded-2xl">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-855">
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Period</th>
                        <th className="px-3 py-2.5 text-center">Present</th>
                        <th className="px-3 py-2.5 text-center">Absent</th>
                        <th className="px-3 py-2.5 text-center">Exempted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold">
                      {/* Group records by date/period */}
                      {Array.from(new Set(monthlyRecords.map(r => `${r.date}_${r.period}`))).sort().reverse().map((groupKey) => {
                        const [gDate, gPeriod] = groupKey.split('_');
                        const matches = monthlyRecords.filter(r => r.date === gDate && Number(r.period) === Number(gPeriod));
                        const presentCount = matches.filter(r => r.status === 'present').length;
                        const absentCount = matches.filter(r => r.status === 'absent').length;
                        const leaveCount = matches.filter(r => r.status === 'leave_approved').length;
                        
                        return (
                          <tr key={groupKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-3 py-2">{gDate}</td>
                            <td className="px-3 py-2">Period {gPeriod}</td>
                            <td className="px-3 py-2 text-center text-emerald-500">{presentCount}</td>
                            <td className="px-3 py-2 text-center text-rose-500">{absentCount}</td>
                            <td className="px-3 py-2 text-center text-amber-500">{leaveCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

// 3. FACULTY LEAVE REQUESTS REVIEW (Removed)

// 4. FACULTY STUDY MATERIALS UPLOADER
const FacultyNotes = ({ faculty }) => {
  const [subject, setSubject] = useState(faculty.subjects?.[0] || '');
  const [branch, setBranch] = useState(faculty.department);
  const [semester, setSemester] = useState('Semester 6');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target.result);
      setFileName(file.name);
    };
    reader.onerror = () => {
      showToast('Could not read the uploaded file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !branch || !semester || !topic || !description || !fileName) {
      showToast('Please complete all note fields and select a file.', 'warning');
      return;
    }

    try {
      setUploading(true);
      await mockDB.uploadNote(
        faculty.uid,
        faculty.fullName,
        branch,
        semester,
        subject,
        topic,
        description,
        fileName,
        fileBase64
      );

      showToast(`Notes for "${topic}" uploaded and shared with students!`, 'success');
      setTopic('');
      setDescription('');
      setFileName('');
      setFileBase64('');
      const fileInput = document.getElementById('notes-file-field');
      if (fileInput) fileInput.value = '';
    } catch (_) {
      showToast('Failed to upload notes.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Upload Class Notes & Study Materials</h3>
        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Share lecture files and learning summaries directly with students</p>
      </div>

      <form onSubmit={handleUploadSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Subject Name</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              {faculty.subjects?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Target Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Topic Title</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Deadlock bankers avoidance algorithm"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Scope Details</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of lecture slides, assignments, or prerequisites..."
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Lecture File (PDF, PPT)</label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-805 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-900/40 relative">
            <input
              id="notes-file-field"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.ppt,.pptx"
              required
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload size={20} className="text-blue-600" />
              <p className="font-bold text-slate-700 dark:text-slate-200">
                {fileName ? fileName : 'Drag & drop file here or click to browse'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Check size={16} />
          <span>{uploading ? 'Processing Notes...' : 'Upload Notes'}</span>
        </button>
      </form>
    </div>
  );
};

// 5. ENTER INTERNAL MARKS SHEET
const FacultyMarks = ({ faculty }) => {
  const availableBranches = KBN_BRANCHES;
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [subject, setSubject] = useState(faculty.subjects?.[0] || '');
  const [students, setStudents] = useState([]);
  const [marksSheet, setMarksSheet] = useState({}); // studentId -> {mid1, mid2, assignments, status, docId}
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { showToast, user } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};
    const fetchClassData = async () => {
      if (!branch || !semester || !subject) return;
      try {
        setLoading(true);
        const studentUsers = await mockDB.getStudentsByBranchAndSemester(branch, semester);
        setStudents(studentUsers);

        // Real-time listener for branch marks
        unsubscribe = mockDB.subscribeBranchMarks(branch, semester, subject, (marksList) => {
          const sheet = {};
          studentUsers.forEach(s => {
            const exist = marksList.find(m => m.studentId === s.uid || m.rollNumber === s.rollNumber) || {
              mid1: '',
              mid2: '',
              assignments: '',
              status: 'Draft'
            };
            sheet[s.uid] = {
              docId: exist.id || exist.docId,
              mid1: exist.mid1 !== undefined ? exist.mid1 : '',
              mid2: exist.mid2 !== undefined ? exist.mid2 : '',
              assignments: exist.assignments !== undefined ? exist.assignments : '',
              status: exist.status || 'Draft'
            };
          });
          setMarksSheet(sheet);
        });
      } catch (_) {
        showToast('Could not fetch student profiles.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
    return () => unsubscribe();
  }, [branch, semester, subject]);

  const handleScoreChange = (sid, field, val) => {
    let maxLimit = field === 'assignments' ? 10 : 30;
    let numVal = val === '' ? '' : Math.min(maxLimit, Math.max(0, Number(val)));
    setMarksSheet(prev => ({
      ...prev,
      [sid]: {
        ...prev[sid],
        [field]: numVal
      }
    }));
  };

  const handleSaveMarks = async (studentId, studentName, rollNumber, targetStatus = 'Draft') => {
    const scores = marksSheet[studentId];
    if (!scores || scores.mid1 === '' || scores.mid2 === '' || scores.assignments === '') {
      showToast('Please fill all assessment fields (Mid-1, Mid-2, Assignments).', 'warning');
      return;
    }

    try {
      await mockDB.saveStudentMarks(
        studentId,
        studentName,
        rollNumber,
        branch,
        semester,
        'A',
        subject,
        faculty.uid,
        faculty.fullName || faculty.full_name,
        scores.mid1,
        scores.mid2,
        scores.assignments,
        targetStatus
      );
      showToast(`Marks saved for ${studentName}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not record internal marks.', 'error');
    }
  };

  const handlePublishAll = async () => {
    if (!branch || !semester || !subject) {
      showToast('Please select Branch, Semester, and Subject first.', 'warning');
      return;
    }

    try {
      setPublishing(true);
      // Ensure all current state entries are saved
      for (const s of students) {
        const scores = marksSheet[s.uid];
        if (scores && scores.mid1 !== '' && scores.mid2 !== '' && scores.assignments !== '') {
          await mockDB.saveStudentMarks(
            s.uid,
            s.fullName,
            s.rollNumber,
            branch,
            semester,
            'A',
            subject,
            faculty.uid,
            faculty.fullName || faculty.full_name,
            scores.mid1,
            scores.mid2,
            scores.assignments,
            'Published'
          );
        }
      }

      await mockDB.publishStudentMarks(branch, semester, subject, faculty.uid, faculty.fullName || faculty.full_name);
      showToast(`Internal Marks for ${subject} published! Students notified.`, 'success');
    } catch (err) {
      showToast('Could not publish marks.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span>Enter Student Internal Marks</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold border border-emerald-500/20">Firestore Sync</span>
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Mid 1 (0-30), Mid 2 (0-30), Assignments (0-10). Total calculated automatically.</p>
        </div>

        {/* Filters & Publish Action */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setSubject('');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            <option value="">Select Department...</option>
            {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!branch}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {!branch ? (
              <option value="">Select Department First</option>
            ) : (
              <>
                <option value="">Select Subject...</option>
                {(BRANCH_SUBJECT_MAP[branch] || []).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </>
            )}
          </select>

          {branch && subject && (
            <button
              onClick={handlePublishAll}
              disabled={publishing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle size={14} />
              <span>{publishing ? 'Publishing...' : 'Publish Marks'}</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-450">Loading class register from Firestore...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-slate-450">No students found matching selected filters.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Mid-Term 1 (0-30)</th>
                <th className="px-4 py-3 text-center">Mid-Term 2 (0-30)</th>
                <th className="px-4 py-3 text-center">Assignments (0-10)</th>
                <th className="px-4 py-3 text-center">Total (Auto)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
              {students.map(s => {
                const vals = marksSheet[s.uid] || { mid1: '', mid2: '', assignments: '', status: 'Draft' };
                const total = Number(vals.mid1 || 0) + Number(vals.mid2 || 0) + Number(vals.assignments || 0);
                const isPublished = vals.status === 'Published' || vals.status === 'Locked';
                const isAdmin = user?.role === 'admin';
                const canEdit = !isPublished || isAdmin;

                return (
                  <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-4 py-4">{s.rollNumber}</td>
                    <td className="px-4 py-4">{s.fullName}</td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="30"
                        min="0"
                        disabled={!canEdit}
                        value={vals.mid1}
                        onChange={(e) => handleScoreChange(s.uid, 'mid1', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold disabled:opacity-60"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="30"
                        min="0"
                        disabled={!canEdit}
                        value={vals.mid2}
                        onChange={(e) => handleScoreChange(s.uid, 'mid2', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold disabled:opacity-60"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="10"
                        min="0"
                        disabled={!canEdit}
                        value={vals.assignments}
                        onChange={(e) => handleScoreChange(s.uid, 'assignments', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold disabled:opacity-60"
                      />
                    </td>
                    <td className="px-4 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{total}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        vals.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        vals.status === 'Locked' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {vals.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {canEdit ? (
                        <button
                          onClick={() => handleSaveMarks(s.uid, s.fullName, s.rollNumber, 'Draft')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black transition-colors"
                        >
                          Save Draft
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 6. MANAGE ASSIGNMENTS (PUBLISH & GRADE SUBMISSIONS)
const FacultyAssignments = ({ faculty }) => {
  const availableBranches = KBN_BRANCHES;
  const [assignments, setAssignments] = useState([]);
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [subject, setSubject] = useState(faculty.subjects?.[0] || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  
  // Selection states
  const [activeAssign, setActiveAssign] = useState(null);
  const [gradeSheet, setGradeSheet] = useState({}); // studentId -> marks (number)
  const [feedbackSheet, setFeedbackSheet] = useState({}); // studentId -> feedback text
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getAssignments();
      const filtered = data.filter(a => faculty.subjects?.includes(a.subject));
      setAssignments(filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !description || !dueDate) return;

    try {
      setSubmitting(true);
      await mockDB.createAssignment(title, description, branch, semester, subject, dueDate, faculty.uid, faculty.fullName || faculty.full_name, file);
      showToast(`Assignment published for ${subject} ${semester}!`, 'success');
      setTitle('');
      setDescription('');
      setDueDate('');
      setFile(null);
      loadAssignments();
    } catch (_) {
      showToast('Could not publish assignment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmit = async (aid, sid) => {
    const marks = gradeSheet[sid];
    const feedback = feedbackSheet[sid] || '';
    if (marks === undefined) {
      showToast('Please enter grading score/marks.', 'warning');
      return;
    }
    try {
      await mockDB.gradeSubmission(aid, sid, marks, feedback, faculty.uid);
      showToast('Student homework graded successfully.', 'success');
      loadAssignments();
      
      const updated = await mockDB.getAssignments();
      const match = updated.find(a => a.id === aid);
      setActiveAssign(match);
    } catch (_) {
      showToast('Could not save grade.', 'error');
    }
  };

  const handleGradeFieldChange = (sid, val) => {
    setGradeSheet(prev => ({
      ...prev,
      [sid]: val
    }));
  };

  const handleFeedbackFieldChange = (sid, val) => {
    setFeedbackSheet(prev => ({
      ...prev,
      [sid]: val
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Create Assignment Form */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-855 dark:text-white uppercase tracking-wider mb-5">Create Assignment</h3>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lab Program 5 - Bankers Algorithm"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Subject Details & Homework requirements</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write detailed homework requirements..."
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Branch</label>
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setSubject('');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
                <option value="">Select Department...</option>
                {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
                {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!branch}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {!branch ? (
                  <option value="">Select Department First</option>
                ) : (
                  <>
                    <option value="">Select Subject...</option>
                    {(BRANCH_SUBJECT_MAP[branch] || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Submission Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Upload Reference Material (.pdf, .docx, .ppt)</label>
            <input 
              type="file" 
              accept=".pdf,.docx,.ppt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>{submitting ? 'Publishing...' : 'Publish Homework'}</span>
          </button>
        </form>
      </div>

      {/* Published & Submissions Review */}
      <div className="lg:col-span-3 space-y-6">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Published Assignments</span>
          
          {loading ? (
            <div className="py-10 text-center animate-pulse text-slate-455">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-slate-450">No assignments created.</div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <div
                  key={a.id}
                  onClick={() => { setActiveAssign(a); setGradeSheet({}); setFeedbackSheet({}); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    activeAssign?.id === a.id
                      ? 'bg-blue-500/5 border-blue-500 dark:bg-blue-950/20'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-855/50'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{a.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">{a.subject} • {a.branch} • {a.semester}</p>
                    {a.fileName && <span className="text-[9.5px] text-blue-500 block mt-1">Ref: {a.fileName}</span>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-rose-505 block">Due: {a.dueDate}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">Submissions: {a.submissions?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeAssign && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
              Submissions for: {activeAssign.title}
            </span>

            {!activeAssign.submissions || activeAssign.submissions.length === 0 ? (
              <div className="py-10 text-center text-slate-455">No student has uploaded answers yet.</div>
            ) : (
              <div className="space-y-4">
                {activeAssign.submissions.map(sub => {
                  const isLate = sub.status === 'late';
                  return (
                    <div key={sub.studentId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{sub.studentName}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5">Roll: {sub.rollNumber} • Submitted: {sub.submittedAt ? String(sub.submittedAt).split('T')[0] : 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] rounded font-black uppercase ${isLate ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {isLate ? 'Late' : 'On Time'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9.5px] uppercase font-bold text-slate-455">Submitted Files:</span>
                        <div className="flex flex-wrap gap-2">
                          {(sub.fileUrls || [sub.fileUrl]).map((url, idx) => {
                            const name = (sub.fileNames || [sub.fileName])[idx] || `File_${idx+1}`;
                            return (
                              <a 
                                key={idx} 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded hover:underline text-blue-600 font-bold block"
                              >
                                Download: {name}
                              </a>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                        <div className="w-24">
                          <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Marks</label>
                          <input 
                            type="number" 
                            placeholder="e.g., 95"
                            value={gradeSheet[sub.studentId] !== undefined ? gradeSheet[sub.studentId] : (sub.grade === 'Pending' ? '' : sub.grade)}
                            onChange={(e) => handleGradeFieldChange(sub.studentId, e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded font-bold text-xs"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Feedback</label>
                          <input 
                            type="text" 
                            placeholder="Excellent work..."
                            value={feedbackSheet[sub.studentId] !== undefined ? feedbackSheet[sub.studentId] : sub.feedback}
                            onChange={(e) => handleFeedbackFieldChange(sub.studentId, e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs"
                          />
                        </div>

                        <button
                          onClick={() => handleGradeSubmit(activeAssign.id, sub.studentId)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg self-end text-[10px] font-black"
                        >
                          Submit Grade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

// 6. FACULTY LEAVES & STUDENT LEAVE APPROVAL DESK
const FacultyLeaves = ({ faculty }) => {
  const [leaves, setLeaves] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remarksState, setRemarksState] = useState({});
  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getLeaves('faculty', faculty.uid);
      setLeaves(data);

      const stdData = await mockDB.getLeaves('counsellor', faculty.uid);
      setStudentLeaves(stdData);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [faculty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      await mockDB.applyLeave(
        faculty.uid,
        faculty.fullName,
        null,
        faculty.department,
        null,
        null,
        reason,
        startDate,
        endDate,
        'faculty'
      );
      showToast('Faculty leave request submitted to HOD & Principal!', 'success');
      setReason('');
      setStartDate('');
      setEndDate('');
      loadLeaves();
    } catch (_) {
      showToast('Could not submit leave request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewStudentLeave = async (leaveId, action) => {
    try {
      const remarks = remarksState[leaveId] || '';
      await mockDB.reviewLeave(leaveId, action, remarks, 'counsellor');
      showToast(`Student leave request ${action} by Counsellor/Faculty!`, 'success');
      loadLeaves();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Student Wards Leave Approval Desk */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">Student Wards Leave Approval Desk</h3>
          <p className="text-[10px] font-normal text-slate-455 mt-0.5">Review and manually approve student leave applications for your wards/department</p>
        </div>

        {studentLeaves.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No student leave applications pending review.</div>
        ) : (
          <div className="space-y-3">
            {studentLeaves.map(l => (
              <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{l.studentName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Roll: {l.rollNumber} • Semester: {l.semester} • Period: {l.startDate} to {l.endDate}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9.5px] rounded font-black uppercase ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>{l.status}</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">{l.reason}</p>

                {l.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Optional Counsellor remarks..."
                      value={remarksState[l.leaveId] || ''}
                      onChange={(e) => setRemarksState({ ...remarksState, [l.leaveId]: e.target.value })}
                      className="w-full sm:flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleReviewStudentLeave(l.leaveId, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] flex-1 sm:flex-initial"
                      >
                        Approve Leave
                      </button>
                      <button
                        onClick={() => handleReviewStudentLeave(l.leaveId, 'rejected')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] flex-1 sm:flex-initial"
                      >
                        Reject Leave
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Form & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Apply Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Apply Faculty Leave</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Reason of Absence</label>
              <textarea
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide detailed explanation..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              {submitting ? 'Submitting...' : 'Apply Leave Request'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Faculty Leaves History Ledger</span>
          
          {loading ? (
            <div className="py-20 text-center animate-pulse">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="py-20 text-center text-slate-455">No absence applications filed.</div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {leaves.map(l => (
                <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">{l.reason}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Period: {l.startDate} to {l.endDate}</span>
                    <div className="text-[10px] text-slate-450 mt-2 font-semibold">
                      <span>Workflow status: </span>
                      HOD: <span className={l.hodStatus === 'approved' ? 'text-emerald-500' : l.hodStatus === 'rejected' ? 'text-rose-500' : 'text-amber-500'}>{l.hodStatus || 'pending'}</span> • 
                      Principal: <span className={l.principalStatus === 'approved' ? 'text-emerald-500' : l.principalStatus === 'rejected' ? 'text-rose-500' : 'text-amber-500'}>{l.principalStatus || 'pending'}</span>
                    </div>
                    {l.remarks && <p className="text-[10px] mt-1 text-slate-500">Remarks: {l.remarks}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. FACULTY TIMETABLE VIEW
const FacultyTimetable = ({ faculty }) => {
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { num: 1, slot: '09:00 - 10:00' },
    { num: 2, slot: '10:00 - 11:00' },
    { num: 3, slot: '11:00 - 12:00' },
    { num: 4, slot: '01:00 - 02:00' },
    { num: 5, slot: '02:00 - 03:00' }
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getTimetables();
        const mySlots = [];
        data.forEach(t => {
          t.timetable?.forEach(slot => {
            if (slot.facultyId === faculty.uid) {
              mySlots.push({
                ...slot,
                branch: t.branch,
                semester: t.semester,
                section: t.section
              });
            }
          });
        });
        setTimetableSlots(mySlots);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [faculty]);

  const getSlot = (day, num) => {
    return timetableSlots.find(s => s.day === day && s.periodNumber === num);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-5 text-xs font-semibold">
      <span className="text-xs font-black text-slate-400 block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">Your Weekly Lecture Schedule</span>
      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading schedule...</div>
      ) : timetableSlots.length === 0 ? (
        <div className="py-20 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No allocated lectures found in the weekly timetable roster.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-100 dark:border-slate-855 text-[10px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-100 dark:border-slate-800/80 font-bold uppercase">
                <th className="px-4 py-3 border border-slate-100 dark:border-slate-855">Day</th>
                {periods.map(p => (
                  <th key={p.num} className="px-4 py-3 border border-slate-100 dark:border-slate-855 text-center">
                    Period {p.num}<br />
                    <span className="text-[8.5px] font-normal text-slate-400">{p.slot}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/20">
                  <td className="px-4 py-3 border border-slate-100 dark:border-slate-855 font-extrabold bg-slate-50/50 dark:bg-slate-955/20">{day}</td>
                  {periods.map(p => {
                    const slot = getSlot(day, p.num);
                    return (
                      <td key={p.num} className="p-3 border border-slate-100 dark:border-slate-855 text-center">
                        {slot ? (
                          <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                            <div className="font-extrabold text-blue-650 dark:text-blue-400">{slot.subject}</div>
                            <div className="text-slate-455 text-[9px]">{slot.branch} {slot.semester} Sec {slot.section}</div>
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded text-[8.5px]">{slot.classroom}</span>
                          </div>
                        ) : (
                          <span className="text-slate-350 dark:text-slate-700">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
// 7. FACULTY WARD COUNSELLING MODULE
const FacultyWardCounselling = ({ faculty }) => {
  const [assignment, setAssignment] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | low-attendance | at-risk | remarks
  const [selectedStudentForRemark, setSelectedStudentForRemark] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkCategory, setRemarkCategory] = useState('Academic');
  const { showToast } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const activeAssign = await mockDB.getFacultyWardAssignment(faculty.uid);
      setAssignment(activeAssign);

      if (activeAssign) {
        const studentList = await mockDB.getWardsBySection(activeAssign.department, activeAssign.assignedSection || activeAssign.section);
        setWards(studentList);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [faculty]);

  const handleAddRemarkSubmit = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    await mockDB.saveWardStudentRemark(faculty.uid, selectedStudentForRemark.rollNumber, remarkText, remarkCategory, faculty);
    showToast(`Remark saved for ${selectedStudentForRemark.name}`, 'success');
    setSelectedStudentForRemark(null);
    setRemarkText('');
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading Ward Counsellor Roster...</div>;
  }

  if (!assignment) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <UserCheck size={24} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Not Currently Assigned as Ward Counsellor</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your Head of Department (HOD) has not assigned you as a Ward Counsellor for a department section yet. Once assigned, your ward student roster, attendance alerts, and academic risk metrics will appear here automatically.
        </p>
      </div>
    );
  }

  const lowAttendanceWards = wards.filter(w => w.attendance < 75);
  const atRiskWards = wards.filter(w => w.academicRisk === 'High' || w.academicRisk === 'Medium');

  const displayedWards = activeTab === 'low-attendance' ? lowAttendanceWards :
                          activeTab === 'at-risk' ? atRiskWards : wards;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/20">
            Active Ward Counsellorship
          </span>
          <h2 className="text-2xl font-black font-display mt-1">{assignment.department} — {assignment.assignedSection || assignment.section}</h2>
          <p className="text-xs text-purple-200 mt-1">Ward Counsellor: {faculty.fullName} ({faculty.designation || 'Faculty'})</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9px] text-purple-200 block font-bold">Assigned Wards</span>
            <span className="text-lg font-black">{assignment.wardStudentsCount || wards.length}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9px] text-purple-200 block font-bold">Low Attendance</span>
            <span className="text-lg font-black text-amber-300">{lowAttendanceWards.length}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9px] text-purple-200 block font-bold">High Risk</span>
            <span className="text-lg font-black text-rose-300">{atRiskWards.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm w-fit text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl uppercase text-[10px] font-extrabold tracking-wider transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Ward Students ({wards.length})
        </button>
        <button
          onClick={() => setActiveTab('low-attendance')}
          className={`px-3.5 py-1.5 rounded-xl uppercase text-[10px] font-extrabold tracking-wider transition-all ${activeTab === 'low-attendance' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Low Attendance (&lt;75%) ({lowAttendanceWards.length})
        </button>
        <button
          onClick={() => setActiveTab('at-risk')}
          className={`px-3.5 py-1.5 rounded-xl uppercase text-[10px] font-extrabold tracking-wider transition-all ${activeTab === 'at-risk' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          At-Risk Students ({atRiskWards.length})
        </button>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[9.5px] text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4 text-center">Attendance %</th>
              <th className="p-4 text-center">Internal Marks</th>
              <th className="p-4">Fee Status</th>
              <th className="p-4">Academic Risk</th>
              <th className="p-4">Counsellor Remarks</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedWards.map((w) => (
              <tr key={w.rollNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-mono font-bold">{w.rollNumber}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{w.name}</td>
                <td className="p-4 text-center font-black">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    w.attendance < 65 ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                    w.attendance < 75 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {w.attendance}% {w.attendance < 65 ? '(Critical)' : w.attendance < 75 ? '(Warning)' : ''}
                  </span>
                </td>
                <td className="p-4 text-center font-bold">{w.internalMarks} / 100</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${w.feeStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {w.feeStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${
                    w.academicRisk === 'High' ? 'bg-rose-500/10 text-rose-600' :
                    w.academicRisk === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {w.academicRisk} Risk
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-[11px] max-w-xs truncate">{w.remarks}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedStudentForRemark(w)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    + Add Remark
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Remark Modal */}
      {selectedStudentForRemark && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddRemarkSubmit} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 space-y-3 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Counsellor Remark for {selectedStudentForRemark.name}</h3>
              <button type="button" onClick={() => setSelectedStudentForRemark(null)} className="text-slate-400"><X size={16} /></button>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
              <select
                value={remarkCategory}
                onChange={(e) => setRemarkCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="Academic">Academic</option>
                <option value="Attendance">Attendance</option>
                <option value="Behaviour">Behaviour</option>
                <option value="Career">Career</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Counsellor Notes</label>
              <textarea
                rows={3}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Enter detailed counselling notes..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSelectedStudentForRemark(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Save Remark</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FacultyPortal;



