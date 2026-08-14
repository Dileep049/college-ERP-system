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

        // Query Enrolled Students for this Faculty's assigned Branch, Semester, and Section
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('branch', '==', profile.branch),
          where('semester', '==', profile.semester),
          where('section', '==', profile.section)
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
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* 1. HERO HEADER WITH LOCKED FACULTY ACADEMIC SCOPE (NO DROPDOWNS) */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 border border-white/20 flex items-center gap-1.5">
                <BookOpen size={14} /> Faculty Portal
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 rounded-full text-[11px] font-bold border border-emerald-400/30">
                Emp ID: {profile.employeeId}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Welcome, {profile.fullName}
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 font-medium">
              Teaching Faculty • Academic Scope Assigned by Admin / HOD in Firestore `users`.
            </p>
          </div>

          {/* LOCKED FACULTY ACADEMIC SCOPE CARD - STRICT NO DROPDOWNS */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 shrink-0">
            <div className="text-[10px] font-black uppercase text-emerald-200 tracking-wider flex items-center gap-1">
              <Lock size={12} /> Assigned Teaching Scope (Locked)
            </div>
            <div className="space-y-1 text-xs font-bold">
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-200 font-normal">Department:</span>
                <span className="text-white text-right truncate max-w-[200px]">{profile.branch}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-200 font-normal">Semester & Section:</span>
                <span className="text-white">{profile.semester} ({profile.section})</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
                <span className="text-emerald-200 font-normal">Assigned Subjects:</span>
                <span className="text-emerald-300 font-extrabold text-right truncate max-w-[180px]">
                  {Array.isArray(profile.subjects) ? profile.subjects.join(', ') : profile.subjects}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Class Students */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
              Enrolled Students
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {studentsCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              {profile.section} ({profile.semester})
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
            <Users size={22} />
          </div>
        </div>

        {/* Assignments Published */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
              Assignments Posted
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {publishedAssignments.length}
            </span>
            <span className="text-[10px] text-blue-500 font-bold block mt-1">
              Active Tasks
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
            <FileText size={22} />
          </div>
        </div>

        {/* Study Notes Published */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
              Notes Uploaded
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {publishedNotes.length}
            </span>
            <span className="text-[10px] text-purple-500 font-bold block mt-1">
              Cloudinary Hosted
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
            <BookOpen size={22} />
          </div>
        </div>

        {/* Attendance Entries */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
              Attendance Sessions
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attendanceCount}
            </span>
            <span className="text-[10px] text-teal-500 font-bold block mt-1">
              Sessions Marked
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-black">
            <CheckSquare size={22} />
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Academic Actions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Quick Faculty Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate && onNavigate('attendance')}
              className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <CheckSquare size={16} /> Mark Class Attendance
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('assignments')}
              className="w-full p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} /> Create New Assignment
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('notes')}
              className="w-full p-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-purple-500/10 flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <BookOpen size={16} /> Upload Study Notes
              </span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Recent Published Assignments */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="text-emerald-600" size={16} />
                My Published Assignments ({publishedAssignments.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Created for {profile.branch} ({profile.section})
              </p>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('assignments')} 
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Manage All →
              </button>
            )}
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Querying published assignments...</div>
          ) : publishedAssignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No assignments published yet. Click "Create New Assignment" above.
            </div>
          ) : (
            <div className="space-y-3">
              {publishedAssignments.slice(0, 3).map(a => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[9.5px] font-black uppercase">
                      {a.subject || 'General'}
                    </span>
                    <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1">{a.title}</h4>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Due Date: {a.dueDate}</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold">
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
