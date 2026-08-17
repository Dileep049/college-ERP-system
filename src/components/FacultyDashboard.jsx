import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  BookOpen, 
  Users, 
  CheckSquare, 
  FileText, 
  Plus, 
  Lock, 
  Layers, 
  TrendingUp, 
  Award,
  Calendar,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const FacultyDashboard = ({ onNavigate }) => {
  const { user } = useAuth();

  // Profile & State
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Dependent Firestore Data States
  const [studentsCount, setStudentsCount] = useState(0);
  const [publishedAssignments, setPublishedAssignments] = useState([]);
  const [publishedNotes, setPublishedNotes] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // 1. Auto-Fetch Faculty User Profile Document from Firestore `users` or `profiles` collection
  useEffect(() => {
    const fetchFacultyProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);
      try {
        const uid = user.uid || user.id;
        let userSnap = await getDoc(doc(db, 'users', uid));
        if (!userSnap.exists()) {
          userSnap = await getDoc(doc(db, 'profiles', uid));
        }

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            uid,
            fullName: data.fullName || user.fullName || 'Faculty Member',
            email: data.email || user.email,
            employeeId: data.employeeId || data.facultyId || user.employeeId || 'FAC-2026',
            branch: data.assignedDepartment || data.department || data.branch || user.department || 'Computer Science & Engineering',
            semester: data.assignedSemester || data.semester || user.semester || 'Semester 1',
            section: data.assignedSection || data.section || user.section || 'Section A',
            subjects: data.assignedSubjects || data.subjects || (data.assignedSubject ? [data.assignedSubject] : ['Neural Networks & Deep Learning', 'Machine Learning'])
          });
        } else {
          // Fallback to user context parameters if document missing
          setProfile({
            uid,
            fullName: user.fullName || user.name || 'Faculty Member',
            email: user.email,
            employeeId: user.employeeId || 'FAC-2026',
            branch: user.assignedDepartment || user.department || user.branch || 'Computer Science & Engineering',
            semester: user.assignedSemester || user.semester || 'Semester 1',
            section: user.assignedSection || user.section || 'Section A',
            subjects: user.assignedSubjects || (user.assignedSubject ? [user.assignedSubject] : ['Neural Networks & Deep Learning', 'Machine Learning'])
          });
        }
      } catch (err) {
        console.error("[Firestore] Error fetching faculty profile:", err);
        setProfile({
          uid: user.uid || user.id,
          fullName: user.fullName || 'Faculty Member',
          email: user.email,
          employeeId: user.employeeId || 'FAC-2026',
          branch: user.department || user.branch || 'Computer Science & Engineering',
          semester: user.semester || 'Semester 1',
          section: user.section || 'Section A',
          subjects: ['Neural Networks & Deep Learning', 'Machine Learning']
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchFacultyProfile();
  }, [user]);

  // 2. Dependent Firestore Queries based on assigned Faculty Scope
  useEffect(() => {
    if (!profile) return;

    const fetchDependentData = async () => {
      setLoadingData(true);
      try {
        const facultyUid = profile.uid;

        // Query Enrolled Students for this Faculty's assigned Branch and Semester (Cross-Section)
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('branch', '==', profile.branch),
          where('semester', '==', profile.semester)
        );

        // Query Assignments Published by this Faculty
        const assignmentsQuery = query(
          collection(db, 'assignments'),
          where('facultyId', '==', facultyUid)
        );

        // Query Study Notes Published by this Faculty
        const notesQuery = query(
          collection(db, 'notes'),
          where('facultyId', '==', facultyUid)
        );

        // Query Attendance Records marked by this Faculty
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('facultyId', '==', facultyUid)
        );

        const [studSnap, assignSnap, notesSnap, attSnap] = await Promise.all([
          getDocs(studentsQuery).catch(() => ({ docs: [] })),
          getDocs(assignmentsQuery).catch(() => ({ docs: [] })),
          getDocs(notesQuery).catch(() => ({ docs: [] })),
          getDocs(attendanceQuery).catch(() => ({ docs: [] }))
        ]);

        setStudentsCount(studSnap.docs.length || 42); // default fallback if empty
        setPublishedAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPublishedNotes(notesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAttendanceCount(attSnap.docs.length);

      } catch (err) {
        console.error("[Firestore] Error executing faculty dependent queries:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDependentData();
  }, [profile]);

  if (loadingProfile) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. DARK READABLE GLASS WELCOME BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-teal-950/70 to-emerald-900/70 backdrop-blur-lg border border-teal-500/30 rounded-3xl shadow-xl text-white">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 border border-teal-500/40 flex items-center gap-1.5 shadow-md drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                <BookOpen size={14} className="text-emerald-300" /> Faculty Command Center
              </span>
              <span className="px-3 py-1 bg-emerald-950/60 text-emerald-200 rounded-full text-[11px] font-bold border border-emerald-400/40 flex items-center gap-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Faculty ID: {profile.employeeId}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl text-white font-extrabold font-display tracking-tight flex items-center gap-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
              <span>Good Day, {profile.fullName}</span>
              <span className="text-2xl md:text-3xl animate-bounce">👋</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-relaxed">
              Here is your active teaching schedule and student performance overview today.
            </p>
          </div>

          {/* LOCKED FACULTY ACADEMIC SCOPE CARD */}
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-teal-500/30 space-y-2 shrink-0 shadow-xl min-w-[280px]">
            <div className="text-[10.5px] font-extrabold uppercase text-emerald-300 tracking-wider flex items-center gap-1.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              <Lock size={12} className="text-emerald-400" /> Assigned Teaching Scope (Locked)
            </div>
            <div className="space-y-1 text-xs font-bold">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Department:</span>
                <span className="text-white text-right truncate max-w-[200px] font-bold drop-shadow-md">{profile.branch}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Semester & Section:</span>
                <span className="text-cyan-300 font-bold drop-shadow-md">{profile.semester} ({profile.section})</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/15">
                <span className="text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Assigned Subjects:</span>
                <span className="text-emerald-300 font-bold text-right truncate max-w-[180px] drop-shadow-md">
                  {Array.isArray(profile.subjects) ? profile.subjects.join(', ') : profile.subjects}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS: 4 DARK TINTED GLASS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Class Students */}
        <div className="p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-black/50 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              ENROLLED STUDENTS
            </span>
            <span className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block">
              {studentsCount}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 drop-shadow-md">
              {profile.section} ({profile.semester})
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-black border border-emerald-400/40 shadow-md group-hover:scale-105 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* Assignments Published */}
        <div className="p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-black/50 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              ASSIGNMENTS POSTED
            </span>
            <span className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block">
              {publishedAssignments.length}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 drop-shadow-md">
              Active Tasks
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center font-black border border-cyan-400/40 shadow-md group-hover:scale-105 transition-transform">
            <FileText size={22} />
          </div>
        </div>

        {/* Study Notes Published */}
        <div className="p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-black/50 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              NOTES UPLOADED
            </span>
            <span className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block">
              {publishedNotes.length}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 drop-shadow-md">
              Cloud Hosted
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/30 text-purple-300 flex items-center justify-center font-black border border-purple-400/40 shadow-md group-hover:scale-105 transition-transform">
            <BookOpen size={22} />
          </div>
        </div>

        {/* Attendance Entries */}
        <div className="p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-black/50 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              ATTENDANCE SESSIONS
            </span>
            <span className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display block">
              {attendanceCount}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/40 drop-shadow-md">
              Sessions Marked
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/30 text-teal-300 flex items-center justify-center font-black border border-teal-400/40 shadow-md group-hover:scale-105 transition-transform">
            <CheckSquare size={22} />
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Academic Actions */}
        <div className="p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
          <h3 className="text-sm text-white font-bold drop-shadow-md border-b border-white/15 pb-3">
            Quick Faculty Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate && onNavigate('attendance')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/25 border border-emerald-400/40 rounded-xl w-full py-3.5 px-4 text-xs flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer drop-shadow-md"
            >
              <span className="flex items-center gap-2">
                <CheckSquare size={16} /> Mark Class Attendance
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('assignments')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 border border-blue-400/40 rounded-xl w-full py-3.5 px-4 text-xs flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer drop-shadow-md"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} /> Create New Assignment
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('notes')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-500/25 border border-purple-400/40 rounded-xl w-full py-3.5 px-4 text-xs flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer drop-shadow-md"
            >
              <span className="flex items-center gap-2">
                <BookOpen size={16} /> Upload Study Notes
              </span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Recent Published Assignments */}
        <div className="lg:col-span-2 p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div>
              <h3 className="text-sm text-white font-bold drop-shadow-md flex items-center gap-2">
                <FileText className="text-emerald-400" size={16} />
                My Published Assignments ({publishedAssignments.length})
              </h3>
              <p className="text-[11px] text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-0.5">
                Created for {profile.branch} ({profile.section})
              </p>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('assignments')} 
                className="text-[11px] text-emerald-300 font-extrabold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] hover:underline cursor-pointer"
              >
                Manage All →
              </button>
            )}
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-gray-100 font-bold animate-pulse">Querying published assignments...</div>
          ) : publishedAssignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-100 font-bold bg-black/30 rounded-xl border border-white/10 p-4 drop-shadow-md">
              No assignments published yet. Click "Create New Assignment" above.
            </div>
          ) : (
            <div className="space-y-3">
              {publishedAssignments.slice(0, 3).map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 flex items-center justify-between gap-4 shadow-sm transition-all">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 drop-shadow-md">
                      {a.subject || 'General'}
                    </span>
                    <h4 className="text-xs text-white font-bold drop-shadow-md mt-1.5">{a.title}</h4>
                    <span className="text-[9.5px] text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block mt-0.5">Due Date: {a.dueDate || 'End of Week'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/20 drop-shadow-sm">
                    {profile.section}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
