import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP, getSubjectsForBranch, isDepartmentMatch, normalizeSemester, normalizeSection } from '../services/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { StudentDashboard } from '../components/StudentDashboard';
import { StudentMarks } from '../components/StudentMarks';
import { 
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  BookOpen,
  CheckSquare,
  FileText,
  Award,
  Briefcase,
  ClipboardList,
  Calendar,
  Users,
  Activity,
  Bell,
  Search,
  Plus,
  Download,
  Printer,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
  Eye,
  MessageSquare,
  ShieldCheck,
  X,
  ExternalLink,
  FileCheck,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentPortal = ({ subPage }) => {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  
  if (subPage === 'dashboard') return <StudentDashboard student={user} isParent={isParent} />;
  if (subPage === 'profile') return <StudentProfile student={user} isParent={isParent} />;
  if (subPage === 'academic-overview') return <StudentAcademicOverview student={user} isParent={isParent} />;
  if (subPage === 'attendance') return <StudentAttendance student={user} isParent={isParent} />;
  if (subPage === 'marks') return <StudentMarks student={user} isParent={isParent} />;
  if (subPage === 'results') return <StudentResults student={user} isParent={isParent} />;
  if (subPage === 'assignments') return <StudentAssignments student={user} isParent={isParent} />;
  if (subPage === 'notes') return <StudentNotes student={user} isParent={isParent} />;
  if (subPage === 'leaves') return <StudentLeaves student={user} isParent={isParent} />;
  if (subPage === 'counsellor' || subPage === 'my-ward-counsellor') return <StudentWardCounsellor student={user} isParent={isParent} />;
  if (subPage === 'faculty') return <StudentFaculty student={user} isParent={isParent} />;
  if (subPage === 'placements') return <StudentPlacements student={user} isParent={isParent} />;
  if (subPage === 'counselling') return <StudentCounselling student={user} isParent={isParent} />;
  if (subPage === 'notifications') return <StudentNotifications student={user} isParent={isParent} />;
  if (subPage === 'performance') return <StudentPerformance student={user} isParent={isParent} />;
  if (subPage === 'document-requests') return <StudentDocumentRequests student={user} isParent={isParent} />;
  if (subPage === 'support-desk') return <StudentSupportDesk student={user} isParent={isParent} />;
  
  return <StudentDashboard student={user} isParent={isParent} />;
};

// Helper for Initials Avatar
const getInitialsAvatar = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ==========================================
// 1. MY PROFILE & PHOTO UPLOAD
// ==========================================
const StudentProfile = ({ student, isParent }) => {
  const { user, updateProfilePhoto, showToast } = useAuth();
  const activeStudent = student || user || {};
  const [photo, setPhoto] = useState(activeStudent?.profilePhotoUrl || activeStudent?.photo || '');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPhoto(activeStudent?.profilePhotoUrl || activeStudent?.photo || '');
  }, [activeStudent?.profilePhotoUrl, activeStudent?.photo]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfilePhoto = async () => {
    if (!preview) return;
    try {
      setUploading(true);
      await updateProfilePhoto(preview);
      setPhoto(preview);
      setPreview(null);
      if (mockDB?.updateUserProfile) {
        await mockDB.updateUserProfile(activeStudent?.uid || activeStudent?.id, { photo: preview, profilePhotoUrl: preview });
      }
      showToast('Profile photo updated successfully across all portals.', 'success');
    } catch (_) {
      showToast('Could not update profile photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      await updateProfilePhoto(null);
      setPhoto('');
      setPreview(null);
      if (mockDB?.updateUserProfile) {
        await mockDB.updateUserProfile(activeStudent?.uid || activeStudent?.id, { photo: null, profilePhotoUrl: null });
      }
      showToast('Profile photo removed. Initial avatar restored.', 'info');
    } catch (_) {
      showToast('Could not remove photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const displayPhoto = preview || photo;

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <UserCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">My Student Profile & Credentials</h2>
            <p className="text-xs text-blue-200 mt-0.5">Manage your institutional identity, verified credentials & profile photo</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Active Enrolled Student
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Manager Card */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-5 flex flex-col items-center text-center">
          <h3 className="text-sm font-black text-white self-start border-b border-white/10 pb-2.5 w-full flex items-center gap-2">
            <Camera size={16} className="text-cyan-400" />
            Profile Picture Manager
          </h3>

          <div className="relative group my-2">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="w-32 h-32 rounded-3xl object-cover border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.35)]"
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-4xl flex items-center justify-center border-2 border-white/20 shadow-xl">
                {getInitialsAvatar(activeStudent?.fullName || activeStudent?.studentName || activeStudent?.name)}
              </div>
            )}
            
            {!isParent && (
              <label className="absolute bottom-1 right-1 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl cursor-pointer shadow-lg border border-white/20 transition-transform group-hover:scale-110">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-white">{activeStudent?.fullName || activeStudent?.studentName || 'Student'}</h4>
            <p className="text-xs text-cyan-300 font-mono font-bold">{activeStudent?.rollNumber || activeStudent?.studentId || '23KBN-CS104'}</p>
            <p className="text-[11px] text-white/60">{activeStudent?.email || 'student@kbn.edu'}</p>
          </div>

          {!isParent && (
            <div className="w-full space-y-2.5 pt-2">
              {preview ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfilePhoto}
                    disabled={uploading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {uploading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    {uploading ? 'Saving...' : 'Confirm Photo'}
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-xs border border-white/10 cursor-pointer"
                    title="Cancel Preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 border border-white/20 transition-all cursor-pointer">
                  <span>Upload New Photo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}

              {photo && !preview && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Remove Photo
                </button>
              )}

              <p className="text-[10px] text-white/50 leading-tight">
                Supports JPG, PNG, WebP (Max 5MB). Photo syncs across Student Portal, Sidebar & Academic Records.
              </p>
            </div>
          )}
        </div>

        {/* Locked Profile Credentials Card */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              Verified Academic Ledger Details
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold uppercase">
              ERP Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Full Legal Name</span>
              <span className="font-extrabold text-sm text-white block">{activeStudent?.fullName || activeStudent?.studentName || 'Student'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Roll Number / Student ID</span>
              <span className="font-mono font-extrabold text-sm text-cyan-300 block">{activeStudent?.rollNumber || activeStudent?.studentId || '23KBN-CS104'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Department / Branch</span>
              <span className="font-bold text-xs text-white block">{activeStudent?.department || activeStudent?.branch || 'Computer Science & Engineering'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Semester & Section</span>
              <span className="font-bold text-xs text-emerald-300 block">{activeStudent?.semester || 'Semester 6'} • Section {activeStudent?.section || 'A'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Institutional Email</span>
              <span className="font-mono text-xs text-white/90 block truncate">{activeStudent?.email || 'student@kbn.edu'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Registered Mobile Number</span>
              <span className="font-mono text-xs text-white/90 block">{activeStudent?.mobile || activeStudent?.phone || '+91 9876543210'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Academic Session</span>
              <span className="font-bold text-xs text-purple-300 block">2026 – 2027 (Regular)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Cumulative CGPA</span>
              <span className="font-extrabold text-sm text-amber-300 block">{activeStudent?.cgpa || activeStudent?.gpa || '8.5'} / 10.0</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-white/80 leading-relaxed">
            <span className="font-bold text-cyan-300 block mb-1">ℹ️ Academic Registry Notice:</span>
            Your primary academic records (Roll Number, Department, Semester, and Course allocations) are locked and authenticated by the Dean of Academics office. To request changes to your registered email or contact number, submit a ticket via the Support Desk.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ACADEMIC OVERVIEW
// ==========================================
const StudentAcademicOverview = ({ student, isParent }) => {
  const dept = student?.department || student?.branch || student?.assignedBranch || 'B.Sc. Computer Science (CS)';
  const subjects = getSubjectsForBranch(dept);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Academic Overview & Curriculum Matrix</h2>
            <p className="text-xs text-blue-200 mt-0.5">{student?.fullName || student?.name || 'Student'} • {dept} ({student?.semester || 'Semester 6'})</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          Performance Status: Outstanding 🟢
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Total Credits Enrolled</span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block">24 Credits</span>
          </div>
          <BookOpen className="text-cyan-400 opacity-80" size={28} />
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Cumulative CGPA</span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">{student?.cgpa || student?.gpa || '8.5'} / 10.0</span>
          </div>
          <Award className="text-emerald-400 opacity-80" size={28} />
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Active Backlogs</span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">0 (All Clear)</span>
          </div>
          <CheckCircle2 className="text-emerald-400 opacity-80" size={28} />
        </div>
      </div>

      {/* Enrolled Subjects Grid */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3 flex items-center justify-between">
          <span>Currently Enrolled Subjects ({subjects.length})</span>
          <span className="text-xs text-cyan-300 font-bold">Academic Session 2026-2027</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {subjects.map((sub, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded text-[10px] font-black uppercase">
                  SUB-60{idx + 1}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">4 Credits</span>
              </div>
              <h4 className="font-extrabold text-white text-xs leading-snug">{sub}</h4>
              <p className="text-[10.5px] text-white/60">Theory + Practical Lab • 4 Contact Hours/Week</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ATTENDANCE RECORD (REAL-TIME SYNC)
// ==========================================
const StudentAttendance = ({ student, isParent }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  const studentDept = student?.department || student?.branch || student?.assignedBranch || 'B.Sc. Computer Science (CS)';
  const curriculumSubjects = getSubjectsForBranch(studentDept);

  const loadOfflineAttendance = async () => {
    try {
      setLoading(true);
      const stUid = student?.uid || student?.id;
      const stRoll = student?.rollNumber || student?.studentId;

      let allRecords = [];
      try {
        const data = await mockDB.getAttendance(studentDept, student?.semester, stUid);
        if (data && Array.isArray(data)) allRecords.push(...data);
      } catch (_) {}

      try {
        const local = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
        local.forEach(item => {
          const match = (stUid && (item.studentId === stUid || item.studentUid === stUid || item.uid === stUid || item.applicantId === stUid)) || 
                        (stRoll && (item.rollNumber === stRoll || item.studentId === stRoll || item.studentRoll === stRoll));
          if (match) {
            allRecords.push(item);
          }
        });
      } catch (_) {}

      // Deduplicate
      const recMap = new Map();
      allRecords.forEach(r => {
        const key = r.id || r.docId || `${r.studentId || r.rollNumber}-${r.date}-${r.subject}-${r.period || r.lecturePeriod}`;
        if (key) recMap.set(key, r);
      });
      const unique = Array.from(recMap.values());
      unique.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setRecords(unique);
    } catch (e) {
      console.error("Error loading offline student attendance:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    const stUid = student?.uid || student?.id;
    const stRoll = student?.rollNumber || student?.studentId;

    const processAttendance = (rawList) => {
      const myRecords = rawList.filter(a => 
        (stUid && (a.studentId === stUid || a.studentUid === stUid || a.uid === stUid || a.applicantId === stUid)) ||
        (stRoll && (a.rollNumber === stRoll || a.studentId === stRoll || a.studentRoll === stRoll))
      );

      // Merge localStorage fallback
      try {
        const local = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
        local.forEach(item => {
          const key = item.id || item.docId || `${item.studentId}-${item.date}-${item.subject}-${item.period || item.lecturePeriod}`;
          const match = (stUid && (item.studentId === stUid || item.studentUid === stUid || item.uid === stUid || item.applicantId === stUid)) || 
                        (stRoll && (item.rollNumber === stRoll || item.studentId === stRoll || item.studentRoll === stRoll));
          if (match && !myRecords.some(r => (r.id && r.id === item.id) || `${r.studentId}-${r.date}-${r.subject}-${r.period || r.lecturePeriod}` === key)) {
            myRecords.push(item);
          }
        });
      } catch (_) {}

      // Sort by date descending
      myRecords.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setRecords(myRecords);
      setLoading(false);
    };

    if (isFirebaseConfigured && db) {
      setLoading(true);
      try {
        const colRef = collection(db, 'attendance');
        unsubscribe = onSnapshot(colRef, (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          processAttendance(list);
        }, (err) => {
          console.warn("[Student Attendance onSnapshot Error]:", err);
          loadOfflineAttendance();
        });
      } catch (e) {
        console.warn("Could not attach attendance listener:", e);
        loadOfflineAttendance();
      }
    } else {
      loadOfflineAttendance();
    }

    const handleAttendanceUpdate = () => {
      loadOfflineAttendance();
    };
    window.addEventListener('storage', handleAttendanceUpdate);
    window.addEventListener('acad_attendance_updated', handleAttendanceUpdate);

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
      window.removeEventListener('storage', handleAttendanceUpdate);
      window.removeEventListener('acad_attendance_updated', handleAttendanceUpdate);
    };
  }, [student, studentDept]);

  // Dynamic Subject Attendance Aggregation
  const subjectMap = {};
  
  // 1. Initialize all curriculum subjects for student's branch
  curriculumSubjects.forEach(sub => {
    subjectMap[sub] = { subject: sub, total: 0, present: 0, absent: 0, leave: 0 };
  });

  // 2. Dynamically aggregate from faculty records
  records.forEach(r => {
    const sub = r.subject || 'General Subject';
    if (!subjectMap[sub]) {
      subjectMap[sub] = { subject: sub, total: 0, present: 0, absent: 0, leave: 0 };
    }
    subjectMap[sub].total += 1;
    const st = (r.status || 'present').toLowerCase();
    if (st === 'present') subjectMap[sub].present += 1;
    else if (st === 'absent') subjectMap[sub].absent += 1;
    else if (st === 'leave' || st === 'leave_approved') subjectMap[sub].leave += 1;
    else subjectMap[sub].present += 1;
  });

  const subjectList = Object.values(subjectMap);
  const totalClasses = subjectList.reduce((acc, s) => acc + s.total, 0);
  const totalPresent = subjectList.reduce((acc, s) => acc + s.present + s.leave, 0);
  const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : (records.length > 0 ? '85.0' : '100.0');

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <CheckSquare size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">My Attendance Record & Lecture Ledger</h2>
            <p className="text-xs text-blue-200 mt-0.5">Live classroom logs recorded by course faculty & authenticated by HOD</p>
          </div>
        </div>
        <div className="text-right self-start sm:self-auto">
          <span className="text-3xl font-black text-emerald-400 drop-shadow">{overallPercentage}%</span>
          <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Overall Average ({totalClasses} Lectures)</span>
        </div>
      </div>

      {/* Attendance Data Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white">Course-Wise Attendance Percentage</h3>
          <span className="text-[11px] text-emerald-300 font-bold">Minimum 75% Required for Exam Eligibility</span>
        </div>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-white/50">Loading attendance data...</div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-3 py-3 text-center">Total Lectures</th>
                  <th className="px-3 py-3 text-center">Present</th>
                  <th className="px-3 py-3 text-center">Absent</th>
                  <th className="px-3 py-3 text-center">Leave</th>
                  <th className="px-4 py-3 text-right">Attendance %</th>
                  <th className="px-4 py-3 text-right">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {subjectList.map((s, idx) => {
                  const pct = s.total > 0 ? (((s.present + s.leave) / s.total) * 100).toFixed(1) : '100.0';
                  const isEligible = parseFloat(pct) >= 75;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">{s.subject}</td>
                      <td className="px-3 py-3.5 text-center text-white/80">{s.total}</td>
                      <td className="px-3 py-3.5 text-center text-emerald-400 font-bold">{s.present}</td>
                      <td className="px-3 py-3.5 text-center text-rose-400 font-bold">{s.absent}</td>
                      <td className="px-3 py-3.5 text-center text-amber-400 font-bold">{s.leave}</td>
                      <td className={`px-4 py-3.5 text-right font-black ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pct}%
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase inline-block ${
                          isEligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isEligible ? 'Eligible 🟢' : 'Shortage 🔴'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. SEMESTER RESULTS
// ==========================================
const StudentResults = ({ student, isParent }) => {
  const results = [
    { code: 'CS601', name: 'Design & Analysis of Algorithms', credits: 4, grade: 'A+', points: 9.0, status: 'PASS' },
    { code: 'CS602', name: 'Artificial Intelligence & Neural Networks', credits: 4, grade: 'O', points: 10.0, status: 'PASS' },
    { code: 'CS603', name: 'Cloud Computing & DevOps', credits: 4, grade: 'A', points: 8.0, status: 'PASS' },
    { code: 'CS604', name: 'Web Frameworks & Full-Stack Development', credits: 4, grade: 'A+', points: 9.0, status: 'PASS' },
    { code: 'CS605', name: 'AI & Data Engineering Laboratory', credits: 2, grade: 'O', points: 10.0, status: 'PASS' }
  ];

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Official Semester Academic Results</h2>
            <p className="text-xs text-blue-200 mt-0.5">Cumulative GPA: <span className="font-bold text-cyan-300">{student?.cgpa || '8.65'} CGPA</span> • SGPA: <span className="font-bold text-emerald-300">9.10</span> • Backlogs: 0</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg border border-white/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer">
          <Printer size={15} /> Print Grade Card
        </button>
      </div>

      {/* Results Table Card */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white">Semester VI Examination Performance Ledger</h3>
          <span className="text-[11px] text-cyan-300 font-bold font-mono">Roll: {student?.rollNumber || '23KBN-CS104'}</span>
        </div>

        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-3 py-3 text-center">Credits</th>
                <th className="px-3 py-3 text-center">Grade</th>
                <th className="px-3 py-3 text-center">Grade Points</th>
                <th className="px-4 py-3 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {results.map((r, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">{r.code}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{r.name}</td>
                  <td className="px-3 py-3.5 text-center text-white/80">{r.credits}</td>
                  <td className="px-3 py-3.5 text-center text-cyan-300 font-black text-sm">{r.grade}</td>
                  <td className="px-3 py-3.5 text-center text-white/80 font-mono">{r.points.toFixed(1)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. ASSIGNMENTS
// ==========================================
const StudentAssignments = ({ student, isParent }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    const rawDept = student?.department || student?.branch || 'B.Sc. Computer Science (CS)';
    const rawSem = student?.semester || 'Semester 1';
    const rawSec = student?.section || 'Section A';

    const dept = String(rawDept).trim();
    const sem = String(rawSem).trim();
    const sec = String(rawSec).trim();

    const loadAssignments = async () => {
      try {
        setLoading(true);
        let firestoreList = [];
        if (isFirebaseConfigured && db) {
          try {
            const snapAll = await getDocs(collection(db, 'assignments'));
            firestoreList = snapAll.docs.map(doc => ({ id: doc.id, assignmentId: doc.id, ...doc.data() }));
          } catch (_) {}
        }

        const mockData = await mockDB.getAssignments(dept, sem, sec);
        const combinedMap = new Map();
        [...firestoreList, ...mockData].forEach(item => {
          const key = item.id || item.assignmentId;
          if (key) combinedMap.set(key, item);
        });

        const filtered = Array.from(combinedMap.values()).filter(a => {
          const aBranch = (a.targetBranch || a.department || a.branch || '').trim();
          const aSem = (a.targetSemester || a.semester || '').trim();
          const aSec = (a.targetSection || a.section || '').trim();

          const branchOk = !aBranch || isDepartmentMatch(dept, aBranch) || isDepartmentMatch(aBranch, dept);
          const semOk = !aSem || aSem === 'All' || normalizeSemester(aSem) === normalizeSemester(sem);
          const secOk = !aSec || aSec === 'All' || normalizeSection(aSec) === normalizeSection(sec);

          return branchOk && semOk && secOk;
        });

        setAssignments(filtered);
      } catch (e) {
        console.error("StudentAssignments error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (isFirebaseConfigured && db) {
      try {
        unsub = onSnapshot(collection(db, 'assignments'), () => {
          loadAssignments();
        }, (err) => console.warn("[Firestore live assignments]:", err));
      } catch (e) {
        console.warn("Could not attach assignments listener:", e);
      }
    }

    loadAssignments();

    const handleLocalUpdate = () => loadAssignments();
    window.addEventListener('acad_assignment_created', handleLocalUpdate);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('acad_assignment_created', handleLocalUpdate);
    };
  }, [student]);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Class Assignments Ledger</h2>
            <p className="text-xs text-blue-200 mt-0.5">Coursework, homework & laboratory tasks allocated for your class</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          {student?.department || 'B.Sc. Computer Science (CS)'} • {student?.semester || 'Semester 6'} • {student?.section || 'Section A'}
        </span>
      </div>

      {/* Content */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Active Deliverables ({assignments.length})</h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-white/50">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-white/50">No active assignments allocated for your class.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(a => (
              <div key={a.id || a.assignmentId} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3 hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded text-[10px] font-black uppercase">
                      {a.subject}
                    </span>
                    <span className="text-[10px] text-rose-300 font-bold">Due: {a.dueDate || 'This Week'}</span>
                  </div>
                  <h4 className="font-extrabold text-white text-xs mt-2">{a.title}</h4>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{a.description}</p>
                </div>

                {a.fileUrl && (
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition-all">
                      <Download size={13} /> Reference Doc
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. STUDY NOTES
// ==========================================
const StudentNotes = ({ student, isParent }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    const rawDept = student?.department || student?.branch || 'B.Sc. Computer Science (CS)';
    const rawSem = student?.semester || 'Semester 1';
    const rawSec = student?.section || 'Section A';

    const dept = String(rawDept).trim();
    const sem = String(rawSem).trim();
    const sec = String(rawSec).trim();

    const loadNotes = async () => {
      try {
        setLoading(true);
        let firestoreList = [];
        if (isFirebaseConfigured && db) {
          try {
            const snapAll = await getDocs(collection(db, 'notes'));
            firestoreList = snapAll.docs.map(doc => ({ noteId: doc.id, id: doc.id, ...doc.data() }));
          } catch (_) {}
        }

        const mockData = await mockDB.getNotes(dept, sem, sec);
        const combinedMap = new Map();
        [...firestoreList, ...mockData].forEach(item => {
          const key = item.noteId || item.id;
          if (key) combinedMap.set(key, item);
        });

        const filtered = Array.from(combinedMap.values()).filter(n => {
          const nBranch = (n.targetBranch || n.department || n.branch || '').trim();
          const nSem = (n.targetSemester || n.semester || '').trim();
          const nSec = (n.targetSection || n.section || '').trim();

          const branchOk = !nBranch || isDepartmentMatch(dept, nBranch) || isDepartmentMatch(nBranch, dept);
          const semOk = !nSem || nSem === 'All' || normalizeSemester(nSem) === normalizeSemester(sem);
          const secOk = !nSec || nSec === 'All' || normalizeSection(nSec) === normalizeSection(sec);

          return branchOk && semOk && secOk;
        });

        setNotes(filtered);
      } catch (e) {
        console.error("StudentNotes error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (isFirebaseConfigured && db) {
      try {
        unsub = onSnapshot(collection(db, 'notes'), () => {
          loadNotes();
        }, (err) => console.warn("[Firestore live notes]:", err));
      } catch (e) {
        console.warn("Could not attach notes listener:", e);
      }
    }

    loadNotes();

    const handleLocalUpdate = () => loadNotes();
    window.addEventListener('acad_notes_updated', handleLocalUpdate);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('acad_notes_updated', handleLocalUpdate);
    };
  }, [student]);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Academic Study Notes & Lecture Materials</h2>
            <p className="text-xs text-blue-200 mt-0.5">Faculty course materials, lecture slides, question banks and notes</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          {student?.department || 'B.Sc. Computer Science (CS)'} • {student?.semester || 'Semester 6'}
        </span>
      </div>

      {/* Content */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Available Documents ({notes.length})</h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-white/50">Loading study notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-white/50">No study notes uploaded for your department/semester yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(n => (
              <div key={n.noteId || n.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-cyan-300 border border-indigo-400/30 rounded text-[10px] font-black uppercase">
                      {n.subject || 'General'}
                    </span>
                    <span className="text-[10px] text-white/50">
                      {n.uploadedAt ? new Date(n.uploadedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-xs mt-2">{n.topic || n.title || 'Lecture Notes'}</h4>
                  {n.description && <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{n.description}</p>}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60 text-[11px]">Faculty: <strong className="text-white font-bold">{n.facultyName || n.uploadedBy || 'Course Faculty'}</strong></span>
                  {n.fileUrl && (
                    <div className="flex items-center gap-2">
                      <a href={n.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                        <Eye size={13} /> View
                      </a>
                      <a href={n.fileUrl} download={n.fileName || 'study_notes'} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow">
                        <Download size={13} /> Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 7. LEAVE APPLICATIONS
// ==========================================
const StudentLeaves = ({ student, isParent }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const { showToast } = useAuth();

  const studentUid = student?.uid || student?.id;
  const studentRoll = student?.rollNumber || student?.studentId;
  const studentEmail = student?.email;

  const loadOfflineLeaves = async () => {
    try {
      let data = [];
      try {
        data = await mockDB.getStudentLeaves(studentUid);
      } catch (_) {}

      const localMap = new Map();
      (data || []).forEach(item => {
        const id = item.id || item.leaveId;
        if (id) localMap.set(id, item);
      });

      ['acad_leave_requests', 'acad_student_leaves'].forEach(key => {
        try {
          const localItems = JSON.parse(localStorage.getItem(key) || '[]');
          localItems.forEach(item => {
            const id = item.id || item.leaveId;
            const matchesStudent = 
              (studentUid && (item.studentId === studentUid || item.applicantId === studentUid || item.uid === studentUid || item.id === studentUid)) ||
              (studentRoll && (item.rollNumber === studentRoll || item.studentRoll === studentRoll)) ||
              (studentEmail && (item.email === studentEmail || item.studentEmail === studentEmail));

            if (matchesStudent && id) {
              const existing = localMap.get(id);
              if (!existing) {
                localMap.set(id, item);
              } else {
                const existingPending = (existing.status || '').toLowerCase() === 'pending';
                const itemProcessed = (item.status || '').toLowerCase() === 'approved' || (item.status || '').toLowerCase() === 'rejected';
                if (existingPending && itemProcessed) {
                  localMap.set(id, { ...existing, ...item });
                } else {
                  localMap.set(id, { ...existing, ...item });
                }
              }
            }
          });
        } catch (_) {}
      });

      const list = Array.from(localMap.values());
      list.sort((a, b) => new Date(b.submittedAt || b.appliedAt || b.createdAt || b.actionAt || 0) - new Date(a.submittedAt || a.appliedAt || a.createdAt || a.actionAt || 0));
      setLeaves(list);
    } catch (e) {
      console.error("Error loading offline student leaves:", e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time synchronization for student's leave status updates
  useEffect(() => {
    if (!studentUid && !studentRoll && !studentEmail) return;

    let unsubscribes = [];

    const processLeavesList = (rawList) => {
      const mergedMap = new Map();

      rawList.forEach(item => {
        const id = item.id || item.leaveId;
        const matchesStudent = 
          (studentUid && (item.studentId === studentUid || item.applicantId === studentUid || item.uid === studentUid || item.id === studentUid)) ||
          (studentRoll && (item.rollNumber === studentRoll || item.studentRoll === studentRoll)) ||
          (studentEmail && (item.email === studentEmail || item.studentEmail === studentEmail));

        if (matchesStudent && id) {
          mergedMap.set(id, item);
        }
      });

      // Merge local storage items as fallback/supplement
      ['acad_leave_requests', 'acad_student_leaves'].forEach(key => {
        try {
          const localItems = JSON.parse(localStorage.getItem(key) || '[]');
          localItems.forEach(item => {
            const id = item.id || item.leaveId;
            const matchesStudent = 
              (studentUid && (item.studentId === studentUid || item.applicantId === studentUid || item.uid === studentUid || item.id === studentUid)) ||
              (studentRoll && (item.rollNumber === studentRoll || item.studentRoll === studentRoll)) ||
              (studentEmail && (item.email === studentEmail || item.studentEmail === studentEmail));

            if (matchesStudent && id) {
              const existing = mergedMap.get(id);
              if (!existing) {
                mergedMap.set(id, item);
              } else {
                mergedMap.set(id, { ...existing, ...item });
              }
            }
          });
        } catch (_) {}
      });

      const unique = Array.from(mergedMap.values());
      unique.sort((a, b) => new Date(b.submittedAt || b.appliedAt || b.createdAt || b.actionAt || 0) - new Date(a.submittedAt || a.appliedAt || a.createdAt || a.actionAt || 0));
      setLeaves(unique);
      setLoading(false);
    };

    if (isFirebaseConfigured && db) {
      setLoading(true);
      const realTimeMap = {};
      const collectionsToListen = ['leave_requests', 'student_leaves', 'leaves'];

      collectionsToListen.forEach(colName => {
        try {
          const colRef = collection(db, colName);
          const unsub = onSnapshot(colRef, (snapshot) => {
            snapshot.forEach(docSnap => {
              const d = docSnap.data();
              const id = docSnap.id;
              realTimeMap[id] = { id, leaveId: id, _col: colName, ...d };
            });
            processLeavesList(Object.values(realTimeMap));
          }, (err) => {
            console.warn(`[Student onSnapshot Error] ${colName}:`, err);
            loadOfflineLeaves();
          });
          unsubscribes.push(unsub);
        } catch (e) {
          console.warn(`Error attaching onSnapshot for ${colName}:`, e);
        }
      });
    }

    loadOfflineLeaves();

    // Listen for local browser update events
    const handleLocalUpdate = () => {
      loadOfflineLeaves();
    };
    window.addEventListener('storage', handleLocalUpdate);
    window.addEventListener('acad_leave_updated', handleLocalUpdate);

    return () => {
      unsubscribes.forEach(unsub => {
        try { unsub(); } catch (_) {}
      });
      window.removeEventListener('storage', handleLocalUpdate);
      window.removeEventListener('acad_leave_updated', handleLocalUpdate);
    };
  }, [studentUid, studentRoll, studentEmail]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (isParent) return;

    try {
      setApplying(true);
      const dept = student?.assignedBranch || student?.department || student?.branch || 'B.Sc. Computer Science (CS)';
      const sem = student?.assignedSemester || student?.semester || 'Semester 6';
      const sec = student?.assignedSection || student?.section || 'Section A';

      await mockDB.applyStudentLeave(student?.uid, {
        leaveType,
        fromDate,
        toDate,
        reason,
        studentName: student?.fullName || student?.name || 'Student',
        rollNumber: student?.rollNumber || student?.studentId || '',
        department: dept,
        branch: dept,
        semester: sem,
        section: sec
      });

      showToast('Leave application submitted directly to your Ward Counsellor for manual review.', 'success');
      setReason('');
      setFromDate('');
      setToDate('');
      loadOfflineLeaves();
    } catch (_) {
      showToast('Could not submit leave.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Leave Application & Approval Desk</h2>
            <p className="text-xs text-blue-200 mt-0.5">Submit leave requests directly to your assigned Ward Counsellor & track review status</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          Counsellor Review Active 🟢
        </span>
      </div>

      {/* Apply Form */}
      {!isParent && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
          <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Apply New Leave Request</h3>

          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Casual Leave" className="bg-slate-900 text-white">Casual Leave</option>
                  <option value="Medical Leave" className="bg-slate-900 text-white">Medical Leave</option>
                  <option value="Duty Leave" className="bg-slate-900 text-white">Duty Leave (Sports / Cultural)</option>
                  <option value="Emergency Leave" className="bg-slate-900 text-white">Emergency Leave</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">To Date</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Reason for Absence</label>
              <textarea
                rows={2}
                required
                placeholder="State the genuine reason for leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/25 border border-white/20 transition-all cursor-pointer"
            >
              {applying ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
      )}

      {/* Status History Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">My Leave Application Status Ledger</h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-white/50">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center text-white/50">No leave requests logged yet.</div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-3 py-3 text-center">Duration</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Counsellor Action & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {leaves.map(l => {
                  const rawStatus = (l.status || 'Pending').toLowerCase();
                  const isApproved = rawStatus === 'approved';
                  const isRejected = rawStatus === 'rejected';
                  const reviewer = l.approvedByName || l.rejectedByName || l.actionByName || l.actionBy || l.approvedBy || 'Ward Counsellor';
                  const remarkText = l.remarks || l.rejectionReason || l.actionRemarks;

                  return (
                    <tr key={l.id || l.leaveId} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">{l.leaveType || 'Casual Leave'}</td>
                      <td className="px-3 py-3.5 text-center font-mono text-cyan-300">{l.startDate || l.fromDate} to {l.endDate || l.toDate}</td>
                      <td className="px-4 py-3.5 text-white/70 max-w-xs truncate">{l.reason}</td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase inline-block ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          isRejected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {isApproved ? (
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-400 font-bold">Approved by {reviewer}</span>
                            {remarkText && remarkText !== 'Approved by Ward Counsellor' && remarkText !== 'Approved' && (
                              <span className="text-[11px] text-emerald-300/80 font-medium italic mt-0.5 max-w-xs break-words">
                                "{remarkText}"
                              </span>
                            )}
                          </div>
                        ) : isRejected ? (
                          <div className="flex flex-col items-end">
                            <span className="text-rose-400 font-bold">Rejected by {reviewer}</span>
                            {remarkText && (
                              <span className="text-[11px] text-rose-300/80 font-medium italic mt-0.5 max-w-xs break-words">
                                Reason: {remarkText}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-400 italic">Under Review by Ward Counsellor</span>
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
    </div>
  );
};

// ==========================================
// 8. WARD COUNSELLOR MODULE
// ==========================================
const StudentWardCounsellor = ({ student, isParent }) => {
  const [counsellor, setCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounsellor = async () => {
      setLoading(true);
      const data = await mockDB.getStudentWardCounsellorDynamic(student);
      setCounsellor(data);
      setLoading(false);
    };
    fetchCounsellor();
  }, [student]);

  const dept = student?.department || student?.branch || 'Computer Science & Engineering';
  const semester = student?.semester || 'Semester 6';
  const section = student?.section || 'A';

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <UserCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">My Ward Counsellor & Academic Mentor</h2>
            <p className="text-xs text-blue-200 mt-0.5">Assigned by Head of Department for {dept} • {semester} • Section {section}</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          🟢 Active Ward Counsellor
        </span>
      </div>

      {counsellor ? (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-5">
              {counsellor.profilePhotoUrl || counsellor.photo ? (
                <img
                  src={counsellor.profilePhotoUrl || counsellor.photo}
                  alt={counsellor.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                  {counsellor.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'WC'}
                </div>
              )}
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-black uppercase">
                  Faculty Mentor
                </span>
                <h3 className="text-xl font-black text-white mt-1">{counsellor.fullName}</h3>
                <p className="text-xs text-cyan-300 font-bold">{counsellor.department}</p>
                <p className="text-xs text-white/60 mt-0.5">{counsellor.semester} • Section {counsellor.section}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`mailto:${counsellor.email || counsellor.facultyEmail || 'counsellor@kbn.edu'}`}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg border border-white/20 flex items-center gap-2"
              >
                <MessageSquare size={15} /> Email Mentor
              </a>
              <a
                href={`tel:${counsellor.phoneNumber || counsellor.mobile || '9876543211'}`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg border border-white/20 flex items-center gap-2"
              >
                📞 Call
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-black block">Official Email</span>
              <strong className="text-white text-xs block truncate">{counsellor.email || counsellor.facultyEmail || 'counsellor@kbn.edu'}</strong>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-black block">Contact Phone</span>
              <strong className="text-cyan-300 text-xs block font-mono">📞 {counsellor.phoneNumber || counsellor.mobile || '9876543211'}</strong>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-black block">Assigned Scope</span>
              <strong className="text-purple-300 text-xs block">{counsellor.semester} • Section {counsellor.section}</strong>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-black block">Academic Year</span>
              <strong className="text-white text-xs block font-mono">2026-2027</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No Ward Counsellor has been assigned to your academic scope yet.</p>
          <p className="text-xs text-white/50">Your Head of Department (HOD) will assign a Ward Counsellor shortly.</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 9. FACULTY DIRECTORY
// ==========================================
const StudentFaculty = ({ student, isParent }) => {
  const dept = student?.department || student?.branch || 'Computer Science & Engineering';
  const facultyMembers = [
    { name: 'Dr. Bruce Banner', role: 'Associate Professor', subject: 'Neural Networks & Deep Learning', email: 'bruce.banner@kbn.edu' },
    { name: 'Prof. Alan Turing', role: 'Professor & HOD', subject: 'Cloud Computing & DevOps', email: 'alan.turing@kbn.edu' },
    { name: 'Dr. Grace Hopper', role: 'Professor', subject: 'Web Frameworks & Architecture', email: 'grace.hopper@kbn.edu' },
    { name: 'Prof. Claude Shannon', role: 'Assistant Professor', subject: 'Data Engineering & Information Theory', email: 'claude.shannon@kbn.edu' }
  ];

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Department Faculty Directory</h2>
            <p className="text-xs text-blue-200 mt-0.5">Teaching faculty and course instructors assigned to {dept}</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          {facultyMembers.length} Instructors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facultyMembers.map((f, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-lg flex items-center justify-center border border-white/20 shadow-md shrink-0">
              {f.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-white text-sm truncate">{f.name}</h4>
              <p className="text-xs text-cyan-300 font-bold mt-0.5">{f.role} • {f.subject}</p>
              <p className="text-[11px] text-white/60 mt-1 font-mono">{f.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 10. PLACEMENTS HUB
// ==========================================
const StudentPlacements = ({ student, isParent }) => {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives');
  
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const studentBranch = student?.department || student?.branch || student?.assignedBranch || 'Computer Science & Engineering';
  const studentCgpa = parseFloat(student?.cgpa || student?.gpa || 8.5);
  const studentBacklogs = parseInt(student?.backlogs || 0);

  const loadPlacements = async () => {
    try {
      setLoading(true);
      const stId = student?.uid || student?.id;
      const stRoll = student?.rollNumber || student?.studentId;
      const [drivesData, appsData, intsData, trData] = await Promise.all([
        mockDB.getPlacementDrives('student'),
        mockDB.getPlacementApplications(null, stId || stRoll),
        mockDB.getPlacementInterviews ? mockDB.getPlacementInterviews(stId) : [],
        mockDB.getPlacementTrainings ? mockDB.getPlacementTrainings() : []
      ]);
      setDrives(drivesData || []);
      setApplications(appsData || []);
      setInterviews(intsData || []);
      setTrainings(trData || []);
    } catch (e) {
      console.error("[loadPlacements Error]:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubs = [];
    const stId = student?.uid || student?.id;
    const stRoll = student?.rollNumber || student?.studentId;

    loadPlacements();

    if (isFirebaseConfigured && db) {
      try {
        const uDrives = onSnapshot(collection(db, 'placement_drives'), (snap) => {
          const list = snap.docs.map(d => ({ id: d.id, driveId: d.id, ...d.data() }));
          if (list.length > 0) setDrives(list);
        }, (err) => console.warn("[placement_drives onSnapshot]:", err));
        unsubs.push(uDrives);
        if (stId || stRoll) {
          const appQuery = query(collection(db, 'placement_applications'), where('studentId', '==', stId || stRoll));
          const uApps = onSnapshot(appQuery, (snap) => {
            const myApps = snap.docs.map(d => ({ id: d.id, applicationId: d.id, ...d.data() }));
            if (myApps.length > 0) setApplications(myApps);
          }, (err) => console.warn("[placement_applications onSnapshot]:", err));
          unsubs.push(uApps);
        }
      } catch (err) {
        console.warn("[Placements Firebase Snapshot Listener Error]:", err);
      }
    }

    const handleLocalPlacementUpdate = () => {
      loadPlacements();
    };
    window.addEventListener('storage', handleLocalPlacementUpdate);
    window.addEventListener('acad_placement_updated', handleLocalPlacementUpdate);

    return () => {
      unsubs.forEach(u => {
        try { u(); } catch (_) {}
      });
      window.removeEventListener('storage', handleLocalPlacementUpdate);
      window.removeEventListener('acad_placement_updated', handleLocalPlacementUpdate);
    };
  }, [student]);

  const isBranchEligible = (drive) => {
    const elig = drive.eligibleBranches;
    if (!elig || !Array.isArray(elig) || elig.length === 0) return true;
    return isDepartmentMatch(studentBranch, elig);
  };

  const eligibleDrives = drives.filter(isBranchEligible);

  const handleOpenApplyModal = (drive) => {
    if (isParent) return;
    setSelectedDrive(drive);
    setDeclaration(false);
    setShowApplyModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!declaration) {
      showToast('Please confirm that the academic credentials provided are accurate.', 'warning');
      return;
    }
    if (!selectedDrive) return;

    try {
      setSubmitting(true);
      console.log(`[Placement Apply] Submitting application for drive ${selectedDrive.companyName}...`, { drive: selectedDrive, student });
      const driveId = selectedDrive.id || selectedDrive.driveId;
      const res = await mockDB.applyForDrive(driveId, {
        ...student,
        cgpa: studentCgpa,
        gpa: studentCgpa,
        backlogs: studentBacklogs,
        companyName: selectedDrive.companyName,
        jobRole: selectedDrive.jobRole || selectedDrive.role,
        package: selectedDrive.package || selectedDrive.salaryPackage
      });
      
      if (res && res.success === false) {
        console.warn("[Placement Apply Rejected]:", res.reason);
        showToast(res.reason || 'Could not submit application.', 'error');
        return;
      }

      showToast(`Application submitted successfully for ${selectedDrive.companyName}!`, 'success');
      setShowApplyModal(false);
      await loadPlacements();
    } catch (err) {
      console.error("[Placement Apply Exception]:", err);
      showToast(err.message || 'Could not submit application due to an unexpected error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Campus Placement & Career Hub</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Live recruitment drives scoped for <span className="text-cyan-300 font-bold">{studentBranch}</span> (Sem {student?.semester || 'VI'})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md">
            CGPA: {studentCgpa.toFixed(1)} 🟢
          </span>
          <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md">
            Backlogs: {studentBacklogs}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'drives', label: `Eligible Drives (${eligibleDrives.length})` },
          { id: 'applications', label: `My Applications (${applications.length})` },
          { id: 'interviews', label: `Interview Rounds (${interviews.length})` },
          { id: 'training', label: `Training & Workshops (${trainings.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
                : 'bg-black/40 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        {activeTab === 'drives' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">
                Active Placement Drives for {studentBranch} ({eligibleDrives.length})
              </h3>
              <span className="text-[11px] text-cyan-300 font-bold">
                🎯 Auto-Filtered by Degree & Branch Eligibility
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-white/50 animate-pulse">Loading placement opportunities...</div>
            ) : eligibleDrives.length === 0 ? (
              <div className="py-12 text-center text-white/50 space-y-2">
                <p className="text-sm font-bold">No placement drives currently active for your branch ({studentBranch}).</p>
                <p className="text-xs text-white/40">New recruitment drives published by the Placement Cell will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eligibleDrives.map(d => {
                  const driveId = d.id || d.driveId;
                  const existingApp = applications.find(a => a.driveId === driveId);
                  const minCgpa = parseFloat(d.minCgpa || 6.0);
                  const maxBacklogs = parseInt(d.maxBacklogs ?? 0);

                  const cgpaPass = studentCgpa >= minCgpa;
                  const backlogsPass = studentBacklogs <= maxBacklogs;
                  const isEligibleToApply = cgpaPass && backlogsPass;

                  return (
                    <div key={driveId} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between hover:bg-white/10 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded text-[10px] font-black uppercase">
                            {d.location || 'Campus / Remote'}
                          </span>
                          <span className="text-xs font-black text-emerald-400">{d.package || d.salaryPackage || '6.5 - 12 LPA'}</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-white text-base">{d.companyName}</h4>
                          <p className="text-xs text-cyan-300 font-bold">{d.jobRole || d.role}</p>
                          <p className="text-[11px] text-white/60 mt-1">Drive Date: {d.driveDate || 'TBA'} • Deadline: {d.applicationDeadline || d.deadline || 'Open'}</p>
                        </div>

                        <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Branch Eligibility:</span>
                            <span className="text-cyan-300 font-bold">✓ Matches ({studentBranch})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Min CGPA Required:</span>
                            <span className={cgpaPass ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                              {minCgpa} ({cgpaPass ? `Your CGPA: ${studentCgpa.toFixed(1)} ✓` : `Your CGPA: ${studentCgpa.toFixed(1)} ✗`})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Max Active Backlogs:</span>
                            <span className={backlogsPass ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                              {maxBacklogs} ({backlogsPass ? `Your Backlogs: ${studentBacklogs} ✓` : `Your Backlogs: ${studentBacklogs} ✗`})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        {existingApp ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                              ✅ {existingApp.status || 'Applied'}
                            </span>
                            <span className="text-[10.5px] text-white/60">Submitted on {existingApp.appliedDate || 'Recent'}</span>
                          </div>
                        ) : isEligibleToApply ? (
                          <button
                            onClick={() => handleOpenApplyModal(d)}
                            disabled={isParent}
                            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg border border-white/20 cursor-pointer"
                          >
                            Apply for Drive
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs cursor-not-allowed"
                          >
                            Ineligible (Cutoff Criteria)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">My Submitted Placement Applications</h3>
            {applications.length === 0 ? (
              <div className="py-12 text-center text-white/50">You have not submitted any placement applications yet.</div>
            ) : (
              <div className="space-y-3">
                {applications.map(a => (
                  <div key={a.id || a.applicationId} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{a.companyName}</h4>
                      <p className="text-xs text-cyan-300 font-bold">{a.jobRole} • Package: {a.package}</p>
                      <p className="text-[10.5px] text-white/60 mt-0.5">Application ID: {a.id || a.applicationId} • Applied: {a.appliedDate || 'Today'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-auto ${
                      a.status === 'Selected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      a.status === 'Shortlisted' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      a.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                    }`}>
                      {a.status || 'Applied • In Review'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Scheduled Interview Rounds</h3>
            {interviews.length === 0 ? (
              <div className="py-12 text-center text-white/50">No interview rounds scheduled currently.</div>
            ) : (
              <div className="space-y-3">
                {interviews.map(i => (
                  <div key={i.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{i.companyName} ({i.round})</h4>
                      <p className="text-xs text-white/60">Venue: {i.venue} • Time: {i.time}</p>
                    </div>
                    <span className="text-xs text-cyan-300 font-bold font-mono">{i.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Placement Training & Mock Workshops</h3>
            {trainings.length === 0 ? (
              <div className="py-12 text-center text-white/50">No training sessions published currently.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainings.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <h4 className="font-extrabold text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-white/60">Trainer: {t.trainer} • Date: {t.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showApplyModal && selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">Apply: {selectedDrive.companyName}</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                <p><span className="text-white/50">Job Role:</span> <strong className="text-cyan-300">{selectedDrive.jobRole || selectedDrive.role}</strong></p>
                <p><span className="text-white/50">Package:</span> <strong className="text-emerald-400">{selectedDrive.package || selectedDrive.salaryPackage}</strong></p>
                <p><span className="text-white/50">Candidate:</span> {student?.fullName || 'Student'} ({student?.rollNumber})</p>
                <p><span className="text-white/50">Branch & Sem:</span> {studentBranch} • Sem {student?.semester || 'VI'}</p>
                <p><span className="text-white/50">CGPA:</span> <strong className="text-cyan-300">{studentCgpa.toFixed(1)}</strong></p>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer text-xs">
                <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} className="mt-0.5" />
                <span className="text-white/80">I confirm that my academic details and credentials are accurate and I agree to participate in the placement process.</span>
              </label>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !declaration} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer">
                  {submitting ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 11. COUNSELLING SESSIONS
// ==========================================
const StudentCounselling = ({ student, isParent }) => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getCounsellingMeetings('student', student?.uid);
      setMeetings(data || []);
    };
    load();
  }, [student]);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Ward Counselling & Mentoring Console</h2>
            <p className="text-xs text-blue-200 mt-0.5">Scheduled one-on-one sessions with your assigned Ward Counsellor</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          Mentorship Active 🟢
        </span>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Session Log</h3>
        {meetings.length === 0 ? (
          <div className="py-12 text-center text-white/50">No scheduled counselling meetings at this time.</div>
        ) : (
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-white text-xs">{m.title || 'Counselling Session'}</h4>
                  <p className="text-[11px] text-white/60">{m.date} at {m.time}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                  {m.status || 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 12. NOTIFICATIONS & BROADCASTS
// ==========================================
const StudentNotifications = ({ student, isParent }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getNotifications(student?.uid);
      setNotifications(data || []);
    };
    load();
  }, [student]);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Campus Official Notifications & Broadcast Feed</h2>
            <p className="text-xs text-blue-200 mt-0.5">Important academic circulars, placement alerts, and examination updates</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          {notifications.length} Broadcasts
        </span>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Latest Broadcast Announcements</h3>
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-white/50">No unread campus notifications.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <Bell size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white leading-relaxed">{n.content || n.message}</p>
                  <span className="text-[10px] text-white/50 block mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 13. PERFORMANCE MATRIX
// ==========================================
const StudentPerformance = ({ student, isParent }) => {
  const att = parseFloat(student?.attendancePercentage || student?.attendance || 88.5);

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">My Academic Performance Matrix</h2>
            <p className="text-xs text-blue-200 mt-0.5">Integrated attendance metrics, internal test score distributions, and learning progress</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          Standing: Grade A+ 🌟
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-2">
          <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block">Academic Strengths</span>
          <p className="text-sm text-emerald-400 font-extrabold">High Attendance ({att}%) • Strong Internal Marks (46/50)</p>
          <p className="text-xs text-white/70 pt-1">Consistently excelling in algorithmic theory and laboratory practicals.</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-2">
          <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block">Overall Performance Standing</span>
          <p className="text-sm text-cyan-300 font-extrabold">Top 5% in {student?.department || 'Department'}</p>
          <p className="text-xs text-white/70 pt-1">Eligible for Dean's Honor Roll and corporate recruitment fast-track.</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 14. DOCUMENT REQUESTS DESK
// ==========================================
const StudentDocumentRequests = ({ student, isParent }) => {
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [requests, setRequests] = useState([
    { id: 'DOC-8821', type: 'Bonafide Certificate', date: '2026-03-12', status: 'Approved', fee: 'Free' },
    { id: 'DOC-7419', type: 'Official Grade Transcript', date: '2026-02-18', status: 'Issued & Dispatched', fee: '₹200' }
  ]);
  const { showToast } = useAuth();

  const handleRequestDoc = (e) => {
    e.preventDefault();
    if (isParent) return;
    const newReq = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: docType,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      fee: 'Free'
    };
    setRequests(prev => [newReq, ...prev]);
    showToast('Document request submitted to College Registrar Office.', 'success');
    setPurpose('');
  };

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <FileCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Official Document & Certificate Requests Desk</h2>
            <p className="text-xs text-blue-200 mt-0.5">Apply for Bonafide Certificates, Study Certificates, Transcripts & NOCs digitally</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          Digital Dispatch Active 📜
        </span>
      </div>

      {/* Form */}
      {!isParent && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
          <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Apply for Institutional Certificate</h3>
          <form onSubmit={handleRequestDoc} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Bonafide Certificate" className="bg-slate-900 text-white">Bonafide Certificate</option>
                  <option value="Official Grade Transcript" className="bg-slate-900 text-white">Official Grade Transcript</option>
                  <option value="No Objection Certificate (NOC)" className="bg-slate-900 text-white">No Objection Certificate (NOC)</option>
                  <option value="Conduct & Character Certificate" className="bg-slate-900 text-white">Conduct & Character Certificate</option>
                  <option value="Fee Structure Certificate" className="bg-slate-900 text-white">Fee Structure Certificate</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Purpose / Recipient</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport verification, Education loan, Internship..."
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/25 border border-white/20 transition-all cursor-pointer"
            >
              Submit Certificate Request
            </button>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Document Request History</h3>
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Document Requested</th>
                <th className="px-3 py-3 text-center">Date</th>
                <th className="px-3 py-3 text-center">Processing Fee</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">{r.id}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{r.type}</td>
                  <td className="px-3 py-3.5 text-center text-white/80 font-mono">{r.date}</td>
                  <td className="px-3 py-3.5 text-center text-emerald-400">{r.fee}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 15. SUPPORT DESK
// ==========================================
const StudentSupportDesk = ({ student, isParent }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Academic Query');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState([
    { id: 'TKT-1049', category: 'Academic Ledger', subject: 'Course Registration / Credit Ledger Check', status: 'Resolved', date: '2026-03-01' }
  ]);
  const { showToast } = useAuth();

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (isParent) return;
    const newTkt = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      subject,
      status: 'In Progress',
      date: new Date().toISOString().split('T')[0]
    };
    setTickets(prev => [newTkt, ...prev]);
    showToast('Support ticket logged. Administrative team will respond within 24 hours.', 'success');
    setSubject('');
    setDescription('');
  };

  return (
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">Student Support & Grievance Desk</h2>
            <p className="text-xs text-blue-200 mt-0.5">Direct institutional assistance for academic, administrative, and technical inquiries</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
          24/7 Response Active 🛡️
        </span>
      </div>

      {!isParent && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
          <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Open New Support Inquiry Ticket</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Academic Query" className="bg-slate-900 text-white">Academic Query</option>
                  <option value="Examination & Results" className="bg-slate-900 text-white">Examination & Results</option>
                  <option value="Attendance & Leave Records" className="bg-slate-900 text-white">Attendance & Leave Records</option>
                  <option value="IT & Portal Access" className="bg-slate-900 text-white">IT & Portal Access</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of inquiry..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/60 uppercase font-black block mb-1.5">Detailed Description</label>
              <textarea
                rows={2}
                required
                placeholder="Explain the problem or requirement with all details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/25 border border-white/20 transition-all cursor-pointer"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">My Support Tickets Ledger</h3>
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-3 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-right">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">{t.id}</td>
                  <td className="px-4 py-3.5 text-white/80">{t.category}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{t.subject}</td>
                  <td className="px-3 py-3.5 text-center text-white/80 font-mono">{t.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                      t.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
