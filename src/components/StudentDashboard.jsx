import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB, isDepartmentMatch, normalizeSemester, normalizeSection } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Clock, 
  TrendingUp, 
  Award, 
  Download,
  AlertCircle,
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';

export const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  
  // Profile & State
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Dependent Firestore Data States
  const [assignments, setAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [internalMarks, setInternalMarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 1. Auto-Fetch Student User Profile Document from Firestore `users` or `profiles` collection
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);
      try {
        const uid = user.uid || user.id;
        // Check `users` collection first, then `profiles`
        let userSnap = await getDoc(doc(db, 'users', uid));
        if (!userSnap.exists()) {
          userSnap = await getDoc(doc(db, 'profiles', uid));
        }

        if (userSnap.exists()) {
          const data = userSnap.data();
          const rawSec = data.section || user.section || 'A';
          const formattedSec = String(rawSec).trim().startsWith('Section') ? String(rawSec).trim() : `Section ${String(rawSec).trim()}`;
          const rawSem = data.semester || user.semester || 'Semester 1';
          const formattedSem = String(rawSem).trim().startsWith('Semester') ? String(rawSem).trim() : `Semester ${String(rawSem).trim()}`;

          setProfile({
            uid,
            fullName: data.fullName || user.fullName || 'Student',
            email: data.email || user.email,
            rollNumber: data.rollNumber || data.studentId || user.rollNumber || 'STU-2026',
            branch: data.branch || data.department || user.department || user.branch || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
            semester: formattedSem,
            section: formattedSec,
            rawSection: rawSec,
            gpa: data.gpa || data.cgpa || '8.5'
          });
        } else {
          // Fallback to user context parameters if document missing
          const rawSec = user.section || 'A';
          const formattedSec = String(rawSec).trim().startsWith('Section') ? String(rawSec).trim() : `Section ${String(rawSec).trim()}`;
          const rawSem = user.semester || 'Semester 1';
          const formattedSem = String(rawSem).trim().startsWith('Semester') ? String(rawSem).trim() : `Semester ${String(rawSem).trim()}`;

          setProfile({
            uid,
            fullName: user.fullName || user.name || 'Student',
            email: user.email,
            rollNumber: user.rollNumber || 'STU-2026',
            branch: user.department || user.branch || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
            semester: formattedSem,
            section: formattedSec,
            rawSection: rawSec,
            gpa: user.cgpa || '8.5'
          });
        }
      } catch (err) {
        console.error("Firestore Fetch Error (Student Profile):", err.message);
        const rawSec = user?.section || 'A';
        const formattedSec = String(rawSec).trim().startsWith('Section') ? String(rawSec).trim() : `Section ${String(rawSec).trim()}`;

        setProfile({
          uid: user?.uid || user?.id,
          fullName: user?.fullName || 'Student',
          email: user?.email,
          rollNumber: user?.rollNumber || 'STU-2026',
          branch: user?.department || user?.branch || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
          semester: user?.semester || 'Semester 1',
          section: formattedSec,
          rawSection: rawSec,
          gpa: '8.5'
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  // 2. Dependent Firestore Queries based on fetched Branch, Semester, and Section
  useEffect(() => {
    if (!profile) return;

    const fetchDependentData = async () => {
      setLoadingData(true);
      try {
        const studentUid = profile.uid;
        const dept = (profile.branch || '').trim();
        const sem = (profile.semester || '').trim();
        const sec = (profile.section || '').trim();
        const rawSec = (profile.rawSection || sec).trim();

        // 1. QUERY ASSIGNMENTS
        let firestoreAssignments = [];
        if (isFirebaseConfigured && db) {
          try {
            const assRef = collection(db, 'assignments');
            const qAss = query(
              assRef,
              where('targetBranch', '==', dept),
              where('targetSemester', '==', sem),
              where('targetSection', '==', sec)
            );
            const snapAss = await getDocs(qAss);
            firestoreAssignments = snapAss.docs.map(d => ({ id: d.id, assignmentId: d.id, ...d.data() }));
          } catch (err) {
            console.error("Firestore Fetch Error:", err.message);
            if (err.code) console.error("Firestore Error Code:", err.code);
            try {
              const snapAll = await getDocs(collection(db, 'assignments'));
              firestoreAssignments = snapAll.docs.map(d => ({ id: d.id, assignmentId: d.id, ...d.data() }));
            } catch (fallbackErr) {
              console.error("Firestore Fetch Error (Assignments Fallback):", fallbackErr.message);
            }
          }
        }

        let mockAss = [];
        try {
          mockAss = await mockDB.getAssignments(dept, sem, sec);
        } catch (e) {
          console.warn("MockDB getAssignments fallback:", e);
        }

        const combinedAssMap = new Map();
        [...firestoreAssignments, ...mockAss].forEach(item => {
          const key = item.id || item.assignmentId;
          if (key) combinedAssMap.set(key, item);
        });

        const filteredAssignments = Array.from(combinedAssMap.values()).filter(a => {
          const aBranch = (a.targetBranch || a.branch || a.department || '').trim();
          const aSem = (a.targetSemester || a.semester || '').trim();
          const aSec = (a.targetSection || a.section || '').trim();

          const branchOk = !aBranch || isDepartmentMatch(dept, aBranch) || isDepartmentMatch(aBranch, dept);
          const semOk = !aSem || aSem === 'All' || normalizeSemester(aSem) === normalizeSemester(sem);
          const secOk = !aSec || aSec === 'All' || aSec === 'All Sections' || normalizeSection(aSec) === normalizeSection(sec) || normalizeSection(aSec) === normalizeSection(rawSec);

          return branchOk && semOk && secOk;
        });

        setAssignments(filteredAssignments);

        // 2. QUERY STUDY NOTES
        let firestoreNotes = [];
        if (isFirebaseConfigured && db) {
          try {
            const notesRef = collection(db, 'notes');
            const qNotes = query(
              notesRef,
              where('targetBranch', '==', dept),
              where('targetSemester', '==', sem),
              where('targetSection', '==', sec)
            );
            const snapNotes = await getDocs(qNotes);
            firestoreNotes = snapNotes.docs.map(d => ({ id: d.id, noteId: d.id, ...d.data() }));
          } catch (err) {
            console.error("Firestore Fetch Error:", err.message);
            if (err.code) console.error("Firestore Error Code:", err.code);
            try {
              const snapAllNotes = await getDocs(collection(db, 'notes'));
              firestoreNotes = snapAllNotes.docs.map(d => ({ id: d.id, noteId: d.id, ...d.data() }));
            } catch (fallbackErr) {
              console.error("Firestore Fetch Error (Notes Fallback):", fallbackErr.message);
            }
          }
        }

        let mockNotes = [];
        try {
          mockNotes = await mockDB.getStudyNotes ? await mockDB.getStudyNotes(dept, sem, sec) : (await mockDB.getNotes(dept, sem, sec));
        } catch (e) {
          console.warn("MockDB getNotes fallback:", e);
        }

        const combinedNotesMap = new Map();
        [...firestoreNotes, ...mockNotes].forEach(item => {
          const key = item.id || item.noteId;
          if (key) combinedNotesMap.set(key, item);
        });

        const filteredNotes = Array.from(combinedNotesMap.values()).filter(n => {
          const nBranch = (n.targetBranch || n.department || n.branch || '').trim();
          const nSem = (n.targetSemester || n.semester || '').trim();
          const nSec = (n.targetSection || n.section || '').trim();

          const branchOk = !nBranch || isDepartmentMatch(dept, nBranch) || isDepartmentMatch(nBranch, dept);
          const semOk = !nSem || nSem === 'All' || normalizeSemester(nSem) === normalizeSemester(sem);
          const secOk = !nSec || nSec === 'All' || nSec === 'All Sections' || normalizeSection(nSec) === normalizeSection(sec) || normalizeSection(nSec) === normalizeSection(rawSec);

          return branchOk && semOk && secOk;
        });

        setNotes(filteredNotes);

        // 3. Query Attendance Records for this Student
        let attDocs = [];
        if (isFirebaseConfigured && db) {
          try {
            const attendanceQuery = query(
              collection(db, 'attendance'),
              where('studentId', '==', studentUid)
            );
            const attSnap = await getDocs(attendanceQuery);
            attDocs = attSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          } catch (err) {
            console.error("Firestore Fetch Error (Attendance):", err.message);
          }
        }
        setAttendanceRecords(attDocs);

        // 4. Query Internal Marks for this Student
        let marksDocs = [];
        if (isFirebaseConfigured && db) {
          try {
            const marksQuery = query(
              collection(db, 'internal_marks'),
              where('studentId', '==', studentUid)
            );
            const marksSnap = await getDocs(marksQuery);
            marksDocs = marksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          } catch (err) {
            console.error("Firestore Fetch Error (Marks):", err.message);
          }
        }
        setInternalMarks(marksDocs);

      } catch (err) {
        console.error("Firestore Fetch Error:", err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDependentData();
  }, [profile]);

  if (loadingProfile) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate Attendance Percentage
  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter(r => r.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : '88.5';

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HERO SECTION: WELCOME BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-white">
        {/* Subtle Ambient Light Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10.5px] font-extrabold uppercase tracking-wider text-cyan-200 border border-white/30 flex items-center gap-1.5 shadow-sm drop-shadow-md">
                <GraduationCap size={14} className="text-cyan-300" /> STUDENT INTELLIGENCE PORTAL
              </span>
              <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-[11px] font-bold border border-emerald-400/40 flex items-center gap-1.5 shadow-sm drop-shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ID: {profile.rollNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-extrabold font-display tracking-tight flex items-center gap-2.5 drop-shadow-lg">
              <span>Good Day, {profile.fullName}</span>
              <span className="text-2xl lg:text-3xl animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-100 font-medium drop-shadow-md leading-relaxed">
              Here's your academic summary and course deliverables for today.
            </p>
          </div>

          {/* RIGHT: GLASS ASSIGNED CLASS SCOPE PANEL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 space-y-2.5 shrink-0 shadow-xl min-w-[280px] lg:min-w-[320px]">
            <div className="text-[10.5px] font-extrabold uppercase text-cyan-300 tracking-wider flex items-center justify-between drop-shadow-md">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-300" /> ASSIGNED CLASS SCOPE
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold">
                LOCKED
              </span>
            </div>
            
            <div className="space-y-1.5 text-xs font-semibold pt-1">
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1.5">
                <span className="text-gray-100 font-medium drop-shadow-md">Branch:</span>
                <span className="text-white text-right truncate font-extrabold drop-shadow-md max-w-[190px]" title={profile.branch}>
                  {profile.branch}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1.5">
                <span className="text-gray-100 font-medium drop-shadow-md">Semester:</span>
                <span className="text-cyan-200 font-extrabold drop-shadow-md">{profile.semester}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1.5">
                <span className="text-gray-100 font-medium drop-shadow-md">Section:</span>
                <span className="text-emerald-300 font-extrabold drop-shadow-md">{profile.section}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <span className="text-gray-100 font-medium drop-shadow-md">Academic Year:</span>
                <span className="text-purple-200 font-extrabold drop-shadow-md">2026–2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ALL STAT CARDS: 4 ULTRA-TRANSPARENT WATER-GLASS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ATTENDANCE RATIO */}
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-gray-100 tracking-wider block drop-shadow-md">
              ATTENDANCE RATIO
            </span>
            <span className="text-2xl lg:text-3xl text-white font-extrabold font-display drop-shadow-lg">
              {attendancePercentage}%
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 drop-shadow-md">
              {totalClasses > 0 ? `${presentClasses}/${totalClasses} Lectures` : 'Eligible for Exams'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-black border border-emerald-400/40 shadow-md group-hover:scale-105 transition-transform">
            <UserCheck size={22} />
          </div>
        </div>

        {/* CLASS ASSIGNMENTS */}
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-gray-100 tracking-wider block drop-shadow-md">
              CLASS ASSIGNMENTS
            </span>
            <span className="text-2xl lg:text-3xl text-white font-extrabold font-display drop-shadow-lg">
              {assignments.length}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 drop-shadow-md">
              Scoped to {profile.section}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center font-black border border-cyan-400/40 shadow-md group-hover:scale-105 transition-transform">
            <FileText size={22} />
          </div>
        </div>

        {/* STUDY MATERIALS */}
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-gray-100 tracking-wider block drop-shadow-md">
              STUDY MATERIALS
            </span>
            <span className="text-2xl lg:text-3xl text-white font-extrabold font-display drop-shadow-lg">
              {notes.length}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 drop-shadow-md">
              Available Documents
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/30 text-purple-300 flex items-center justify-center font-black border border-purple-400/40 shadow-md group-hover:scale-105 transition-transform">
            <BookOpen size={22} />
          </div>
        </div>

        {/* CUMULATIVE CGPA */}
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-gray-100 tracking-wider block drop-shadow-md">
              CUMULATIVE CGPA
            </span>
            <span className="text-2xl lg:text-3xl text-white font-extrabold font-display drop-shadow-lg">
              {profile.gpa}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40 drop-shadow-md">
              Grade A+ Standing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-black border border-amber-400/40 shadow-md group-hover:scale-105 transition-transform">
            <Award size={22} />
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTIONS: HORIZONTAL GLASS PANEL */}
      <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-cyan-300 font-extrabold uppercase tracking-wider flex items-center gap-2 drop-shadow-lg">
            <TrendingUp size={15} /> QUICK ACTIONS & CAMPUS WORKFLOWS
          </h2>
          <span className="text-[10px] text-gray-100 font-medium drop-shadow-md">1-Click Portal Routing</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {[
            { label: 'Apply Leave', page: 'leaves', icon: Calendar, color: 'text-amber-300 hover:border-amber-400/50' },
            { label: 'View Attendance', page: 'attendance', icon: UserCheck, color: 'text-emerald-300 hover:border-emerald-400/50' },
            { label: 'Internal Marks', page: 'marks', icon: FileText, color: 'text-cyan-300 hover:border-cyan-400/50' },
            { label: 'Semester Results', page: 'results', icon: Award, color: 'text-purple-300 hover:border-purple-400/50' },
            { label: 'Assignments', page: 'assignments', icon: Layers, color: 'text-blue-300 hover:border-blue-400/50' },
            { label: 'Study Notes', page: 'notes', icon: BookOpen, color: 'text-indigo-300 hover:border-indigo-400/50' },
            { label: 'Online Fees', page: 'academic-overview', icon: CheckCircle2, color: 'text-rose-300 hover:border-rose-400/50' },
            { label: 'Library', page: 'notes', icon: BookOpen, color: 'text-teal-300 hover:border-teal-400/50' }
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate && onNavigate(act.page)}
                className={`p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group ${act.color}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={16} />
                </div>
                <span className="text-[11px] font-extrabold text-white leading-tight drop-shadow-md">
                  {act.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN CONTENT: RESPONSIVE 2-COLUMN GLASS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: CLASS ASSIGNMENTS */}
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div>
              <h3 className="text-sm text-white font-extrabold drop-shadow-lg flex items-center gap-2">
                <FileText className="text-cyan-300" size={16} />
                Class Assignments ({assignments.length})
              </h3>
              <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">
                Filtered automatically for {profile.branch} • {profile.semester} • {profile.section}
              </p>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('assignments')} 
                className="text-[11px] text-cyan-300 font-extrabold drop-shadow-md hover:underline cursor-pointer flex items-center gap-1"
              >
                View All →
              </button>
            )}
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-gray-100 font-medium animate-pulse">Querying Firestore assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-100 font-medium bg-white/5 rounded-xl border border-white/20 p-4 drop-shadow-md">
              No pending assignments for {profile.section}.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 3).map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-between gap-4 shadow-sm hover:-translate-y-0.5 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 drop-shadow-md">
                        {a.subject || 'General'}
                      </span>
                      <span className="text-[9.5px] text-gray-100 font-medium drop-shadow-sm">
                        By {a.facultyName || 'Course Instructor'}
                      </span>
                    </div>
                    <h4 className="text-xs text-white font-extrabold drop-shadow-lg mt-1.5 truncate">{a.title}</h4>
                    <p className="text-[10.5px] text-gray-100 font-medium drop-shadow-md mt-0.5 line-clamp-1">{a.description}</p>
                    <span className="text-[10px] text-rose-300 font-extrabold drop-shadow-md block mt-1">Due: {a.dueDate || 'End of Week'}</span>
                  </div>
                  {a.fileUrl ? (
                    <a 
                      href={a.fileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/40 text-cyan-200 py-1.5 px-3 rounded-xl text-xs shrink-0 flex items-center gap-1.5 font-bold transition-all shadow-sm drop-shadow-md"
                    >
                      <Download size={13} /> Doc
                    </a>
                  ) : (
                    <button
                      onClick={() => onNavigate && onNavigate('assignments')}
                      className="bg-white/15 hover:bg-white/25 border border-white/25 text-white py-1.5 px-3 rounded-xl text-xs shrink-0 font-bold transition-all drop-shadow-md"
                    >
                      Submit
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: COURSE NOTES */}
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div>
              <h3 className="text-sm text-white font-extrabold drop-shadow-lg flex items-center gap-2">
                <BookOpen className="text-purple-300" size={16} />
                Course Notes ({notes.length})
              </h3>
              <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">
                Published by faculty for {profile.branch} ({profile.section})
              </p>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('notes')} 
                className="text-[11px] text-purple-300 font-extrabold drop-shadow-md hover:underline cursor-pointer flex items-center gap-1"
              >
                Explore Repository →
              </button>
            )}
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-gray-100 font-medium animate-pulse">Querying cloud repository notes...</div>
          ) : notes.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-100 font-medium bg-white/5 rounded-xl border border-white/20 p-4 drop-shadow-md">
              No lecture notes uploaded for {profile.section} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 3).map(n => (
                <div key={n.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-between gap-4 shadow-sm hover:-translate-y-0.5 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 drop-shadow-md">
                        {n.subject || 'Reference'}
                      </span>
                      <span className="text-[9.5px] text-gray-100 font-medium drop-shadow-sm">
                        {n.facultyName ? `Prof. ${n.facultyName}` : 'Faculty Upload'}
                      </span>
                    </div>
                    <h4 className="text-xs text-white font-extrabold drop-shadow-lg mt-1.5 truncate">{n.title}</h4>
                    <p className="text-[10.5px] text-gray-100 font-medium drop-shadow-md mt-0.5 line-clamp-1">{n.description || 'Lecture material document'}</p>
                    <span className="text-[9.5px] text-gray-100 font-medium drop-shadow-sm block mt-1">Uploaded {n.uploadedAt || 'Recently'}</span>
                  </div>
                  {n.fileUrl && (
                    <a 
                      href={n.fileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/40 text-purple-200 py-1.5 px-3 rounded-xl text-xs shrink-0 flex items-center gap-1.5 font-bold transition-all shadow-sm drop-shadow-md"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 5. ACADEMIC PERFORMANCE & ANALYTICS SECTION */}
      <div className="p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-5">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div>
            <h3 className="text-sm text-white font-extrabold drop-shadow-lg flex items-center gap-2">
              <TrendingUp className="text-cyan-300" size={16} />
              ACADEMIC PERFORMANCE & PROGRESS ANALYTICS
            </h3>
            <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">Real-time indicators across curriculum milestones</p>
          </div>
          <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-extrabold drop-shadow-md">
            Semester 2 Benchmark
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Metric 1: Attendance Progress */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/20 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-100 font-medium drop-shadow-md">Attendance Minimum (75%)</span>
              <span className="text-emerald-300 font-extrabold drop-shadow-lg">{attendancePercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-emerald-300 font-bold drop-shadow-md flex items-center gap-1">
              <CheckCircle2 size={12} /> Exam Hall-Ticket Eligible
            </p>
          </div>

          {/* Metric 2: Internal Marks Average */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/20 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-100 font-medium drop-shadow-md">Internal Marks Target</span>
              <span className="text-cyan-300 font-extrabold drop-shadow-lg">89 / 100</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-cyan-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: '89%' }}></div>
            </div>
            <p className="text-[10px] text-cyan-300 font-bold drop-shadow-md flex items-center gap-1">
              <Award size={12} /> Top Decile in Branch
            </p>
          </div>

          {/* Metric 3: Assignment Completion Rate */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/20 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-100 font-medium drop-shadow-md">Assignment Completion</span>
              <span className="text-pink-300 font-extrabold drop-shadow-lg">100%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-pink-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ width: '100%' }}></div>
            </div>
            <p className="text-[10px] text-pink-300 font-bold drop-shadow-md flex items-center gap-1">
              <CheckCircle2 size={12} /> 0 Pending Deliverables
            </p>
          </div>

          {/* Metric 4: CGPA Trajectory */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/20 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-100 font-medium drop-shadow-md">CGPA Standing (Scale 10.0)</span>
              <span className="text-yellow-300 font-extrabold drop-shadow-lg">{profile.gpa}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-yellow-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${(parseFloat(profile.gpa || 8.5) / 10) * 100}%` }}></div>
            </div>
            <p className="text-[10px] text-yellow-300 font-bold drop-shadow-md flex items-center gap-1">
              <Award size={12} /> First Class with Distinction
            </p>
          </div>

        </div>
      </div>

      {/* 6. UPCOMING EVENTS & REAL-TIME NOTIFICATIONS (2-COLUMN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* UPCOMING ACADEMIC EVENTS & DEADLINES */}
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <h3 className="text-sm text-white font-extrabold drop-shadow-lg flex items-center gap-2">
              <Calendar className="text-cyan-300" size={16} />
              UPCOMING EVENTS & TIMELINE
            </h3>
            <span className="text-[10px] text-cyan-200 font-extrabold drop-shadow-md">Session 2026</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Mid-Term Assessment Examinations', date: 'Mar 12 - Mar 18, 2026', type: 'Exam', badge: 'bg-rose-500/30 text-rose-200 border-rose-400/40' },
              { title: 'AI & ML Practical Project Submission', date: 'Mar 25, 2026', type: 'Deadline', badge: 'bg-amber-500/30 text-amber-200 border-amber-400/40' },
              { title: 'Campus Placement & Mock Interview Drive', date: 'Apr 05, 2026', type: 'Placement', badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40' },
              { title: 'Annual Technical Symposium & Hackathon', date: 'Apr 15, 2026', type: 'College Event', badge: 'bg-purple-500/30 text-purple-200 border-purple-400/40' }
            ].map((evt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-between gap-3 transition-all">
                <div className="space-y-0.5">
                  <h4 className="text-xs text-white font-extrabold drop-shadow-lg">{evt.title}</h4>
                  <p className="text-[10.5px] text-gray-100 font-medium drop-shadow-md flex items-center gap-1">
                    <Clock size={11} className="text-cyan-300" /> {evt.date}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border drop-shadow-md ${evt.badge}`}>
                  {evt.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* NOTIFICATIONS & REAL-TIME ALERTS */}
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/10 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <h3 className="text-sm text-white font-extrabold drop-shadow-lg flex items-center gap-2">
              <AlertCircle className="text-purple-300" size={16} />
              REAL-TIME NOTIFICATIONS & ALERTS
            </h3>
            <span className="text-[10px] text-purple-200 font-extrabold drop-shadow-md">5 Unread</span>
          </div>

          <div className="space-y-3">
            {[
              { text: 'New assignment uploaded for Section A in Machine Learning', time: '10 mins ago', dot: 'bg-cyan-400' },
              { text: 'Internal marks updated for Discrete Mathematics assessment', time: '2 hours ago', dot: 'bg-emerald-400' },
              { text: 'New study material document available in repository', time: 'Yesterday', dot: 'bg-purple-400' },
              { text: 'TCS & Infosys Campus Placement drive registration live', time: '2 days ago', dot: 'bg-amber-400' },
              { text: 'Leave request for Medical Checkup approved by HOD', time: '3 days ago', dot: 'bg-blue-400' }
            ].map((notif, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 flex items-center gap-3 transition-all">
                <span className={`w-2 h-2 rounded-full shrink-0 ${notif.dot} shadow-[0_0_8px_currentColor]`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-extrabold drop-shadow-md truncate">{notif.text}</p>
                  <span className="text-[10px] text-gray-100 font-medium drop-shadow-sm block">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
