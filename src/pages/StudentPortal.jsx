import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';
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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentPortal = ({ subPage }) => {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  
  if (subPage === 'dashboard') return <StudentDashboard student={user} isParent={isParent} />;
  if (subPage === 'profile') return <StudentProfile student={user} isParent={isParent} />;
  if (subPage === 'academic-overview') return <StudentAcademicOverview student={user} isParent={isParent} />;
  if (subPage === 'course-registration') return <StudentCourseRegistration student={user} isParent={isParent} />;
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
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

// 1. STUDENT ACADEMIC COMMAND CENTER (DASHBOARD)
const StudentDashboard = ({ student, isParent }) => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(84.5);
  const [internalMarks, setInternalMarks] = useState(38);
  const [backlogs, setBacklogs] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [placementDrives, setPlacementDrives] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const dept = student?.department || 'CSE';
        const sem = student?.semester || 'VI';

        const [assData, drivesData, leaveData, meetData, notesData] = await Promise.all([
          mockDB.getAssignments(dept, sem),
          mockDB.getPlacementDrives('student'),
          mockDB.getStudentLeaves(student?.uid),
          mockDB.getCounsellingMeetings('student', student?.uid),
          mockDB.getNotes(dept, sem)
        ]);

        setAssignments(assData);
        setPlacementDrives(drivesData);
        setLeaves(leaveData);
        setMeetings(meetData);
        setNotes(notesData);
        setAttendance(parseFloat(student?.attendancePercentage || student?.attendance || 84.5));
        setInternalMarks(parseFloat(student?.internalMarks || 38));
        setBacklogs(parseInt(student?.backlogs || 0));
      } catch (e) {
        console.error("Student dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [student]);

  const latestLeave = leaves[0];
  const pendingAssignments = assignments.filter(a => !a.submissions?.some(s => s.studentId === student?.uid));
  const eligibleDrives = placementDrives.filter(d => (parseFloat(student?.cgpa || 8.0) >= parseFloat(d.minCgpa || 6.0)));

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Student Identity Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {student?.photo ? (
            <img src={student.photo} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center border-2 border-indigo-400 shadow-lg">
              {getInitialsAvatar(student?.fullName || student?.studentName)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
              <span>ACADEMIA</span> • <span>Portal Hub</span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight">{student?.fullName || student?.studentName || 'Student Name'}</h1>
            <p className="text-xs text-slate-300 font-medium">
              Roll No: <span className="font-mono text-indigo-200 font-bold">{student?.rollNumber || '23KBN-CS104'}</span> • {student?.department || 'CSE'} (Sem {student?.semester || 'VI'} - Sec {student?.section || 'A'})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-[11px] font-extrabold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Active Academic Status
          </span>
        </div>
      </div>

      {/* Real-time System Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {attendance >= 75 ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <div><span className="font-black block text-xs">🟢 Attendance Good ({attendance}%)</span><span className="text-[10px]">Above mandatory 75% threshold.</span></div>
          </div>
        ) : attendance >= 65 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 flex items-center gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-amber-500" />
            <div><span className="font-black block text-xs">🟡 Attendance Warning ({attendance}%)</span><span className="text-[10px]">Attendance between 65%-75%. Boost required.</span></div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            <div><span className="font-black block text-xs">🔴 Attendance Critical ({attendance}%)</span><span className="text-[10px]">Below 65%. High condonation risk.</span></div>
          </div>
        )}

        {pendingAssignments.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 flex items-center gap-2.5">
            <Clock size={18} className="shrink-0 text-amber-500" />
            <div><span className="font-black block text-xs">🟡 {pendingAssignments.length} Assignment(s) Due Soon</span><span className="text-[10px]">Check homework ledger for deadlines.</span></div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-blue-500" />
            <div><span className="font-black block text-xs">🟢 All Assignments Up To Date</span><span className="text-[10px]">No pending submissions required.</span></div>
          </div>
        )}

        {eligibleDrives.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <Briefcase size={18} className="shrink-0 text-emerald-500" />
            <div><span className="font-black block text-xs">🟢 {eligibleDrives.length} Eligible Placement Drive(s)</span><span className="text-[10px]">Apply directly from Placements desk.</span></div>
          </div>
        )}
      </div>

      {/* 8 Main Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Attendance %</span>
            <CheckSquare size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500">{attendance}%</p>
          <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold block">{attendance >= 75 ? 'Satisfactory' : 'Warning'}</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Internal Marks</span>
            <FileText size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{internalMarks} / 50</p>
          <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-bold block">Subject Average</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Semester</span>
            <BookOpen size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">Sem {student?.semester || 'VI'}</p>
          <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block">Section {student?.section || 'A'}</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Active Backlogs</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{backlogs}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">{backlogs === 0 ? 'Clean Record' : 'Requires Re-appear'}</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Pending Assignments</span>
            <Briefcase size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingAssignments.length}</p>
          <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-bold block">Tasks Due</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Placement Drives</span>
            <Award size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{placementDrives.length}</p>
          <span className="text-[9.5px] text-sky-600 dark:text-sky-400 font-bold block">{eligibleDrives.length} Eligible</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Leave Status</span>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-2">{latestLeave ? latestLeave.status : 'None Filed'}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">Ward Counsellor Review</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Counselling</span>
            <UserCheck size={16} className="text-teal-500" />
          </div>
          <p className="text-sm font-black text-teal-600 dark:text-teal-400 mt-2">{meetings.length > 0 ? 'Active Meetings' : 'Assigned'}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">Ward Mentor Connected</span>
        </div>
      </div>

    </div>
  );
};

// 2. MY PROFILE & PHOTO UPLOAD
const StudentProfile = ({ student, isParent }) => {
  const [photo, setPhoto] = useState(student?.photo || '');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfilePhoto = async () => {
    try {
      setUploading(true);
      await mockDB.updateUserProfile(student?.uid, { photo });
      showToast('Profile photo updated successfully across all portals.', 'success');
    } catch (_) {
      showToast('Could not update profile photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold max-w-2xl">
      <h3 className="text-base font-black text-slate-900 dark:text-white border-b pb-4">My Official Student Profile & Photo Manager</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {photo ? (
          <img src={photo} alt="" className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500 shadow-lg" />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center border-2 border-indigo-400 shadow-lg">
            {getInitialsAvatar(student?.fullName || student?.studentName)}
          </div>
        )}

        <div className="space-y-2">
          {!isParent && (
            <>
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handlePhotoSelect} className="text-xs" />
              <p className="text-[10px] text-slate-400">Max file size: 5MB (JPG, PNG, WEBP). Unified profile photo across all portals.</p>
              <button onClick={handleSaveProfilePhoto} disabled={uploading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all">
                {uploading ? 'Uploading...' : 'Save Profile Photo'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4 text-slate-700 dark:text-slate-300">
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Full Name</span> <span className="font-black text-xs text-slate-900 dark:text-white">{student?.fullName || student?.studentName}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Roll Number</span> <span className="font-mono text-xs text-blue-600">{student?.rollNumber || '23KBN-CS104'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Department</span> <span className="font-black text-xs text-blue-600">{student?.department || 'CSE'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Semester / Section</span> <span className="font-bold text-xs">{student?.semester || 'VI'} - Section {student?.section || 'A'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Email Address</span> <span className="font-bold text-xs">{student?.email || 'student@kbn.edu'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Mobile Number</span> <span className="font-bold text-xs">{student?.mobile || '+91 9876543210'}</span></div>
      </div>
    </div>
  );
};

// 3. ACADEMIC OVERVIEW
const StudentAcademicOverview = ({ student, isParent }) => {
  const dept = student?.department || 'CSE';
  const subjects = BRANCH_SUBJECT_MAP[dept] || ['Neural Networks & Deep Learning', 'Cloud Computing', 'AI Lab'];

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black font-display">Academic Overview & Performance Summary</h2>
          <p className="text-xs text-blue-100 mt-1">{student?.fullName} • {dept} (Semester {student?.semester || 'VI'})</p>
        </div>
        <span className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl font-black text-xs border border-white/20">Performance: Stable 🟢</span>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Currently Enrolled Subjects ({subjects.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map((sub, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">CS-60{idx + 1}</span>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{sub}</h4>
              <p className="text-[10.5px] text-slate-400">4 Credits • Theory + Lab</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. COURSE REGISTRATION
const StudentCourseRegistration = ({ student, isParent }) => {
  const { showToast } = useAuth();
  const [registered, setRegistered] = useState(false);

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    setRegistered(true);
    showToast('Elective course registration submitted successfully.', 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Semester Elective Course Registration</h3>
        <p className="text-xs text-slate-400">Select professional & open electives for upcoming term</p>
      </div>

      {registered ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 space-y-2">
          <h4 className="text-sm font-black">🎉 Course Registration Confirmed</h4>
          <p>Your elective selections have been logged and sent to Dean Academics.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitRegistration} className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Professional Elective I</h4>
            <select required className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
              <option value="cs601a">CS-601A: Natural Language Processing (4 Credits)</option>
              <option value="cs601b">CS-601B: Computer Vision & Pattern Recognition (4 Credits)</option>
            </select>
          </div>

          {!isParent && (
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-2xl shadow">
              Submit Course Selection
            </button>
          )}
        </form>
      )}
    </div>
  );
};

// 5. MY ATTENDANCE
const StudentAttendance = ({ student, isParent }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadAtt = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getAttendance(student?.department, student?.semester, student?.uid);
        setRecords(data);
      } catch (e) {
        console.error("Error loading student attendance:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAtt();
  }, [student]);

  const subjectMap = {};
  const defaultSubjects = ['Neural Networks & Deep Learning', 'Cloud Computing & DevOps', 'AI Lab', 'Web Frameworks'];
  defaultSubjects.forEach(sub => {
    subjectMap[sub] = { subject: sub, total: 20, present: 17, absent: 2, leave: 1 };
  });

  records.forEach(r => {
    const sub = r.subject || 'General Subject';
    if (!subjectMap[sub]) {
      subjectMap[sub] = { subject: sub, total: 0, present: 0, absent: 0, leave: 0 };
    }
    subjectMap[sub].total += 1;
    if (r.status === 'Present') subjectMap[sub].present += 1;
    else if (r.status === 'Absent') subjectMap[sub].absent += 1;
    else if (r.status === 'Leave') subjectMap[sub].leave += 1;
  });

  const subjectList = Object.values(subjectMap);
  const totalClasses = subjectList.reduce((acc, s) => acc + s.total, 0);
  const totalPresent = subjectList.reduce((acc, s) => acc + s.present, 0);
  const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 85.0;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">My Attendance Record (Read-Only)</h3>
          <p className="text-xs text-slate-400">Class participation ledger compiled from daily faculty logs</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-600">{overallPercentage}%</span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Overall Average</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center animate-pulse text-slate-400">Loading attendance data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3 text-center">Total Classes</th>
                <th className="px-5 py-3 text-center">Present</th>
                <th className="px-5 py-3 text-center">Absent</th>
                <th className="px-5 py-3 text-center">Leave</th>
                <th className="px-5 py-3 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {subjectList.map((s, idx) => {
                const pct = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white">{s.subject}</td>
                    <td className="px-5 py-4 text-center">{s.total}</td>
                    <td className="px-5 py-4 text-center text-emerald-600">{s.present}</td>
                    <td className="px-5 py-4 text-center text-rose-500">{s.absent}</td>
                    <td className="px-5 py-4 text-center text-amber-500">{s.leave}</td>
                    <td className={`px-5 py-4 text-right font-black ${parseFloat(pct) >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</td>
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

// 6. MY INTERNAL MARKS
const StudentMarks = ({ student, isParent }) => {
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    const loadMarks = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getInternalMarks(student?.department, student?.semester, null);
        const uid = student?.uid || student?.studentId;
        const myMarks = data.filter(m => m.studentId === uid || m.rollNumber === student?.rollNumber);
        setMarks(myMarks);
      } catch (e) {
        console.error("Error loading internal marks:", e);
      } finally {
        setLoading(false);
      }
    };
    loadMarks();
  }, [student]);

  const defaultMarks = [
    { subject: 'Neural Networks & Deep Learning', mid1: 17, mid2: 18, assignments: 9, total: 44 },
    { subject: 'Cloud Computing & DevOps', mid1: 15, mid2: 16, assignments: 8, total: 39 },
    { subject: 'AI & Data Engineering Lab', mid1: 18, mid2: 19, assignments: 10, total: 47 }
  ];

  const displayList = marks.length > 0 ? marks : defaultMarks;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">My Internal Marks Ledger (Read-Only)</h3>
        <p className="text-xs text-slate-400">Mid 1 (20) + Mid 2 (20) + Assignments (10) = Total (50 Marks)</p>
      </div>

      {loading ? (
        <div className="py-12 text-center animate-pulse text-slate-400">Loading internal marks ledger...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3 text-center">Mid 1 (20)</th>
                <th className="px-5 py-3 text-center">Mid 2 (20)</th>
                <th className="px-5 py-3 text-center">Assignments (10)</th>
                <th className="px-5 py-3 text-center">Total (50)</th>
                <th className="px-5 py-3 text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {displayList.map((m, idx) => {
                const total = m.total !== undefined ? m.total : ((m.mid1 || 0) + (m.mid2 || 0) + (m.assignments || 0));
                const pct = (total / 50) * 100;
                let statusLabel = 'Excellent';
                let statusClass = 'bg-emerald-500/10 text-emerald-600';
                if (pct < 50) {
                  statusLabel = 'Needs Improvement';
                  statusClass = 'bg-rose-500/10 text-rose-500';
                } else if (pct < 70) {
                  statusLabel = 'Satisfactory';
                  statusClass = 'bg-amber-500/10 text-amber-500';
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white">{m.subject}</td>
                    <td className="px-5 py-4 text-center">{m.mid1 || 0}</td>
                    <td className="px-5 py-4 text-center">{m.mid2 || 0}</td>
                    <td className="px-5 py-4 text-center">{m.assignments || 0}</td>
                    <td className="px-5 py-4 text-center font-black text-blue-600">{total} / 50</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`px-3 py-1 rounded-xl text-[9.5px] uppercase font-bold ${statusClass}`}>
                        {statusLabel}
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
  );
};

// 7. SEMESTER RESULTS
const StudentResults = ({ student, isParent }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Official Semester Academic Results</h3>
          <p className="text-xs text-slate-400">Cumulative GPA: <span className="font-bold text-blue-600">{student?.cgpa || 8.4} CGPA</span> • Active Backlogs: 0</p>
        </div>
        <Award size={24} className="text-amber-500" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3 text-center">Credits</th>
              <th className="px-5 py-3 text-center">Grade</th>
              <th className="px-5 py-3 text-center">Grade Point</th>
              <th className="px-5 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td className="px-5 py-4 font-black text-slate-900 dark:text-white">Design & Analysis of Algorithms</td>
              <td className="px-5 py-4 text-center">4</td>
              <td className="px-5 py-4 text-center text-blue-600 font-black">A+</td>
              <td className="px-5 py-4 text-center">9.0</td>
              <td className="px-5 py-4 text-right"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9.5px]">PASS</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 8. MY ASSIGNMENTS
const StudentAssignments = ({ student, isParent }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getAssignments(student?.department || 'CSE', student?.semester || 'VI');
        setAssignments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, [student]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Class Assignments Ledger</h3>
        <p className="text-xs text-slate-400">Homework & lab task submissions allocated for your class</p>
      </div>

      {loading ? (
        <div className="py-16 text-center animate-pulse text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No active assignments allocated for your class.</div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a.id || a.assignmentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">{a.subject}</span>
                <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1.5">{a.title}</h4>
                <p className="text-[10.5px] text-slate-500 mt-1">{a.description}</p>
                <span className="text-[9.5px] text-rose-500 font-bold block mt-1">Due Date: {a.dueDate}</span>
              </div>

              {a.fileUrl && (
                <a href={a.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1 shrink-0">
                  <Download size={13} /> Reference Doc
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 9. STUDY NOTES
const StudentNotes = ({ student, isParent }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getNotes(student?.department || 'CSE', student?.semester || 'VI');
        setNotes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [student]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Academic Study Notes & Lecture Materials</h3>
        <p className="text-xs text-slate-400">Course materials published by subject faculty</p>
      </div>

      {loading ? (
        <div className="py-16 text-center animate-pulse text-slate-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No study notes uploaded for your department/semester yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.noteId || n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 rounded text-[9.5px] font-black uppercase">{n.subject}</span>
                <h4 className="font-black text-slate-900 dark:text-white text-xs mt-2">{n.topic || n.title}</h4>
                <p className="text-[10.5px] text-slate-500 mt-1">{n.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">{n.fileName || 'notes.pdf'}</span>
                {n.fileUrl && (
                  <a href={n.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1">
                    <Download size={13} /> Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 10. STUDENT LEAVE
const StudentLeaves = ({ student, isParent }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getStudentLeaves(student?.uid);
      setLeaves(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [student]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (isParent) return;

    try {
      setApplying(true);
      await mockDB.applyStudentLeave(student?.uid, {
        leaveType,
        fromDate,
        toDate,
        reason,
        studentName: student?.fullName || student?.studentName,
        department: student?.department || 'CSE'
      });

      showToast('Leave application submitted to assigned Ward Counsellor.', 'success');
      setReason('');
      loadLeaves();
    } catch (_) {
      showToast('Could not submit leave.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {!isParent && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Apply Leave (Approved by Assigned Ward Counsellor)</h3>

          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Duty Leave">Duty Leave (Sports / Cultural)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">From Date</label>
                <input type="date" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">To Date</label>
                <input type="date" required value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">Reason for Leave</label>
              <textarea rows={2} required placeholder="Detailed reason..." value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" />
            </div>

            <button type="submit" disabled={applying} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow">
              {applying ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
      )}

      {/* Leave Status History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">My Leave Application Status Ledger</h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-slate-400">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No leave requests logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-center">Dates</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {leaves.map(l => (
                  <tr key={l.id || l.leaveId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white">{l.leaveType}</td>
                    <td className="px-5 py-4 text-center">{l.fromDate} to {l.toDate}</td>
                    <td className="px-5 py-4 text-slate-500 font-normal">{l.reason}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase ${
                        l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                        l.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400 font-normal italic">
                      {l.status === 'Approved' ? `Approved by Ward Counsellor ${l.approvedBy || 'Dr. Bruce Banner'}` :
                       l.status === 'Rejected' ? `Rejected by ${l.rejectedBy || 'Counsellor'}: ${l.rejectionReason || 'High attendance shortage'}` : 'Pending Review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// 11. MY WARD COUNSELLOR MODULE (AUTO-ASSIGNED BY HOD)
const StudentWardCounsellor = ({ student, isParent }) => {
  const [counsellor, setCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounsellor = async () => {
      setLoading(true);
      const data = await mockDB.getStudentWardCounsellor(student);
      setCounsellor(data);
      setLoading(false);
    };
    fetchCounsellor();
  }, [student]);

  if (loading) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const dept = student?.department || student?.branch || 'B.Sc. Computer Science (CS)';

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            Assigned Branch: {dept}
          </span>
          <h2 className="text-xl font-black mt-2">My Assigned Ward Counsellor</h2>
          <p className="text-xs text-purple-200 mt-0.5">Automated HOD Assignment • Mentor for Academic & Personal Mentorship</p>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-400 text-slate-950 font-black rounded-2xl text-[10.5px] shadow-lg flex items-center gap-1.5 self-start sm:self-auto">
          🟢 Active Branch Counsellor
        </span>
      </div>

      {counsellor ? (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-5">
              {counsellor.profilePhotoUrl || counsellor.photo ? (
                <img
                  src={counsellor.profilePhotoUrl || counsellor.photo}
                  alt={counsellor.fullName}
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-purple-500/20 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                  {counsellor.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'WC'}
                </div>
              )}
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase">
                  Faculty Ward Mentor
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{counsellor.fullName}</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{counsellor.designation}</p>
                <p className="text-xs text-slate-400 mt-0.5">Department of {counsellor.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${counsellor.email}`}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                <MessageSquare size={16} /> Send Email
              </a>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Official Email</span>
              <strong className="text-slate-900 dark:text-white text-xs block truncate">{counsellor.email}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Contact Phone</span>
              <strong className="text-slate-900 dark:text-white text-xs block font-mono">📞 {counsellor.phoneNumber || counsellor.mobile || '9876543211'}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Employee ID</span>
              <strong className="text-purple-600 dark:text-purple-400 text-xs block font-mono">{counsellor.employeeId || 'WC-CSE-01'}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Office Hours</span>
              <strong className="text-slate-900 dark:text-white text-xs block">{counsellor.officeHours || 'Mon - Fri: 3:00 PM - 5:00 PM'}</strong>
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-slate-700 dark:text-slate-300">
            <span className="font-black text-purple-700 dark:text-purple-300 block mb-0.5">📌 Note for Student:</span>
            Your Ward Counsellor is automatically assigned by the HOD for your branch ({dept}). All your leave applications and academic mentorship requests are processed directly by your assigned Ward Counsellor.
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active Ward Counsellor assigned yet for {dept}.</p>
          <p className="text-xs text-slate-400">Your Head of Department (HOD) will assign a Ward Counsellor shortly.</p>
        </div>
      )}
    </div>
  );
};

// 12. FACULTY DIRECTORY
const StudentFaculty = ({ student, isParent }) => {
  const dept = student?.department || 'CSE';
  const facultyMembers = [
    { name: 'Dr. Bruce Banner', role: 'Associate Professor', subject: 'Neural Networks & Deep Learning', email: 'bruce.banner@kbn.edu' },
    { name: 'Prof. Alan Turing', role: 'Professor & HOD', subject: 'Cloud Computing & DevOps', email: 'alan.turing@kbn.edu' }
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Department Subject Faculty Directory</h3>
        <p className="text-xs text-slate-400">Teaching faculty assigned to {dept} Department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facultyMembers.map((f, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="" className="w-12 h-12 rounded-2xl object-cover border" />
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{f.name}</h4>
              <p className="text-[10.5px] text-blue-600 font-bold">{f.role} • {f.subject}</p>
              <p className="text-[10px] text-slate-400">{f.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 13. PLACEMENTS HUB
// 13. PLACEMENTS HUB (INTERLINKED WITH PLACEMENT OFFICER PORTAL)
const StudentPlacements = ({ student, isParent }) => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives', 'applications', 'interviews', 'offers', 'training'
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadPlacements = async () => {
    try {
      setLoading(true);
      const stId = student?.uid || student?.id || student?.studentId;
      const [drivesData, appsData, intsData, trData] = await Promise.all([
        mockDB.getPlacementDrives('student'),
        mockDB.getPlacementApplications(null, stId),
        mockDB.getPlacementInterviews(stId),
        mockDB.getPlacementTrainings()
      ]);
      setDrives(drivesData);
      setApplications(appsData);
      setInterviews(intsData);
      setTrainings(trData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, [student]);

  const selectedApp = applications.find(a => a.status === 'Selected');

  useEffect(() => {
    if (selectedApp) {
      try { confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } }); } catch (_) {}
    }
  }, [selectedApp]);

  const handleApply = async (drive) => {
    if (isParent) return;
    try {
      const res = await mockDB.applyForDrive(drive.id || drive.driveId, student);
      if (res.success) {
        showToast('Application Submitted Successfully.', 'success');
        loadPlacements();
      } else {
        showToast(res.reason || 'Could not submit application.', 'error');
      }
    } catch (_) {
      showToast('Unable to submit application.', 'error');
    }
  };

  const handleRegisterTraining = async (trId) => {
    if (isParent) return;
    try {
      await mockDB.registerForTraining(trId, student);
      showToast('Registered for placement training session!', 'success');
      loadPlacements();
    } catch (_) {
      showToast('Could not register for training.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Confirmed Selection Banner */}
      {selectedApp && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl space-y-2 flex justify-between items-center">
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">🎉 Placement Offer Confirmed!</span>
            <h2 className="text-xl font-black mt-1">Selected at {selectedApp.companyName}</h2>
            <p className="text-xs">Designation: {selectedApp.jobRole} • Package: {selectedApp.package}</p>
          </div>
          <Award size={36} className="text-emerald-200" />
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'drives' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🚀 Upcoming Drives ({drives.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'applications' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          📋 My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'interviews' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          ⏰ Interview Schedule ({interviews.length})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'offers' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🏆 Selection Offers ({selectedApp ? 1 : 0})
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'training' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          📚 Training & Mock Tests ({trainings.length})
        </button>
      </div>

      {/* TAB 1: UPCOMING DRIVES */}
      {activeTab === 'drives' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Corporate Placement Recruitment Drives</h3>

          {loading ? (
            <div className="py-12 text-center animate-pulse text-slate-400">Loading placement drives...</div>
          ) : drives.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No active placement drives announced by Placement Cell.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.map(d => {
                const hasApplied = applications.some(a => a.driveId === (d.id || d.driveId));
                const studentBranch = (student?.department || student?.branch || 'CSE').toUpperCase().trim();
                const studentCgpa = parseFloat(student?.cgpa || student?.gpa || 7.5);
                const studentBacklogs = parseInt(student?.backlogs || 0);

                const minCgpaReq = d.minCgpa !== undefined ? parseFloat(d.minCgpa) : 6.0;
                const maxBacklogsReq = d.maxBacklogs !== undefined ? parseInt(d.maxBacklogs) : 0;
                const eligibleBranches = Array.isArray(d.eligibleBranches) ? d.eligibleBranches : [];

                let isEligible = true;
                let ineligibilityReason = '';

                if (studentCgpa < minCgpaReq) {
                  isEligible = false;
                  ineligibilityReason = `Requires Min CGPA ${minCgpaReq} (Your CGPA: ${studentCgpa})`;
                } else if (studentBacklogs > maxBacklogsReq) {
                  isEligible = false;
                  ineligibilityReason = `Requires Max Backlogs ${maxBacklogsReq} (Your Backlogs: ${studentBacklogs})`;
                } else if (eligibleBranches.length > 0) {
                  const upperBranches = eligibleBranches.map(b => b.toUpperCase().trim());
                  const match = upperBranches.some(b => b === 'ALL' || b === studentBranch || studentBranch.includes(b) || b.includes(studentBranch));
                  if (!match) {
                    isEligible = false;
                    ineligibilityReason = `Open for ${eligibleBranches.join(', ')} (Your Branch: ${studentBranch})`;
                  }
                }

                const skills = Array.isArray(d.requiredSkills) ? d.requiredSkills : (d.requiredSkills ? d.requiredSkills.split(',') : []);

                return (
                  <div key={d.id || d.driveId} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        {d.companyLogo ? (
                          <img src={d.companyLogo} alt="" className="w-12 h-12 rounded-2xl object-cover border shrink-0 bg-white" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                            {d.companyName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase tracking-wider">{d.location || 'Pan India'}</span>
                          <h4 className="font-black text-slate-900 dark:text-white text-base mt-0.5">{d.companyName}</h4>
                          <p className="text-xs text-blue-600 font-bold">{d.jobRole || d.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Package / CTC</span> <span className="font-black text-emerald-600">{d.package || d.salaryPackage}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Drive Date</span> <span className="font-bold text-slate-700 dark:text-slate-300">{d.driveDate || 'TBA'}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Deadline</span> <span className="font-bold text-rose-500">{d.deadline || d.applicationDeadline || 'Open'}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Eligibility</span> <span className="font-bold text-slate-700 dark:text-slate-300">Min {minCgpaReq} CGPA</span></div>
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {skills.map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[9px] font-medium">
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between gap-2">
                      {isEligible ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                          🟢 Eligible
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 rounded-xl text-[9.5px] font-bold truncate max-w-[170px]" title={ineligibilityReason}>
                          🔴 {ineligibilityReason}
                        </span>
                      )}

                      {hasApplied ? (
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 font-black rounded-xl">Applied</span>
                      ) : (
                        <button 
                          onClick={() => handleApply(d)} 
                          disabled={!isEligible || isParent}
                          className={`px-5 py-2 rounded-xl font-bold text-xs shadow transition ${
                            isEligible && !isParent
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Apply Now
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

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">My Submitted Placement Applications</h3>
          {applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">You have not submitted any placement drive applications yet.</div>
          ) : (
            <div className="space-y-3">
              {applications.map(a => (
                <div key={a.id || a.applicationId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">{a.companyName}</h4>
                    <p className="text-xs text-blue-600 font-bold">{a.jobRole} ({a.package})</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Applied Date: {a.appliedDate || 'Recent'}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                    a.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-600' :
                    a.status === 'Shortlisted' ? 'bg-blue-500/10 text-blue-600' :
                    a.status === 'Interview Scheduled' ? 'bg-purple-500/10 text-purple-600' :
                    a.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERVIEW SCHEDULE */}
      {activeTab === 'interviews' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Scheduled Interview Rounds</h3>
          {interviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No interview rounds scheduled currently.</div>
          ) : (
            <div className="space-y-3">
              {interviews.map(i => (
                <div key={i.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 rounded text-[9.5px] font-black uppercase">{i.round}</span>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm mt-1">{i.companyName} ({i.jobRole})</h4>
                    <p className="text-[10.5px] text-slate-500">Venue: {i.venue}</p>
                    {i.instructions && <p className="text-[10px] text-slate-400 italic">Instructions: {i.instructions}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{i.date} at {i.time}</p>
                    {i.meetingLink && (
                      <a href={i.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-purple-500 hover:underline flex items-center gap-1 justify-end font-bold mt-1">
                        Virtual Meeting Link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SELECTION OFFERS */}
      {activeTab === 'offers' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">My Confirmed Placement Offers</h3>
          {!selectedApp ? (
            <div className="py-12 text-center text-slate-400">No confirmed placement offers yet. Keep applying to active drives!</div>
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl space-y-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">Official Offer Letter Issued</span>
              <h3 className="text-2xl font-black">{selectedApp.companyName}</h3>
              <p className="text-sm font-bold">Designation: {selectedApp.jobRole}</p>
              <p className="text-sm font-black text-emerald-200">Salary Package: {selectedApp.package}</p>
              <p className="text-xs text-emerald-100">Congratulations on your campus recruitment success!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TRAINING & MOCK TESTS */}
      {activeTab === 'training' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Placement Training & Mock Workshops</h3>
          {trainings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No training sessions published currently.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainings.map(t => {
                const stId = student?.uid || student?.id;
                const isRegistered = Array.isArray(t.registeredStudents) && t.registeredStudents.includes(stId);

                return (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">{t.type}</span>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm mt-1">{t.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Trainer: {t.trainer} • Date: {t.date}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Venue: {t.venue} ({t.duration})</p>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-[10px] text-blue-500 font-bold">{t.targetBranches}</span>
                      {isRegistered ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black">Registered</span>
                      ) : (
                        <button
                          onClick={() => handleRegisterTraining(t.id)}
                          disabled={isParent}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] shadow"
                        >
                          Register Now
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

    </div>
  );
};


// 14. COUNSELLING HUB
const StudentCounselling = ({ student, isParent }) => {
  const [meetings, setMeetings] = useState([]);
  const { showToast } = useAuth();

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getCounsellingMeetings('student', student?.uid);
      setMeetings(data);
    };
    load();
  }, [student]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Counselling Meetings & Mentoring Console</h3>
        <p className="text-xs text-slate-400">Scheduled one-on-one sessions with your assigned Ward Counsellor</p>
      </div>

      {meetings.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No scheduled counselling meetings at this time.</div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 rounded text-[9.5px] font-black uppercase">{m.category || 'Mentoring'}</span>
                <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1">{m.title || 'Counselling Session'}</h4>
                <p className="text-[10.5px] text-slate-500">{m.date} at {m.time}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold">{m.status || 'Scheduled'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 15. NOTIFICATIONS
const StudentNotifications = ({ student, isParent }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getNotifications(student?.uid);
      setNotifications(data);
    };
    load();
  }, [student]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Campus Official Notifications & Broadcast Feed</h3>
        <p className="text-xs text-slate-400">Important academic alerts, placement updates, and leave statuses</p>
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No unread campus notifications.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <Bell size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.content || n.message}</p>
                <span className="text-[9.5px] text-slate-400 block mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 16. MY PERFORMANCE
const StudentPerformance = ({ student, isParent }) => {
  const att = parseFloat(student?.attendancePercentage || student?.attendance || 84.5);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">My Academic Performance Matrix</h3>
        <p className="text-xs text-slate-400">Integrated attendance, internal test marks, and assignment evaluation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-black">Academic Strengths</span>
          <p className="text-xs text-emerald-600 font-black">High Attendance ({att}%) • Strong Internal Marks (44/50)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-black">Overall Performance Status</span>
          <p className="text-xs text-blue-600 font-black">Grade A • Consistent Performer</p>
        </div>
      </div>
    </div>
  );
};

// 17. DOCUMENT REQUESTS DESK
const StudentDocumentRequests = ({ student, isParent }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4 text-xs font-semibold">
      <h3 className="text-base font-black text-slate-900 dark:text-white border-b pb-4">Document Requests Desk</h3>
      <p className="text-slate-400">Request bonafide certificates, transcripts, or conduct letters.</p>
    </div>
  );
};

// 18. SUPPORT DESK
const StudentSupportDesk = ({ student, isParent }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4 text-xs font-semibold">
      <h3 className="text-base font-black text-slate-900 dark:text-white border-b pb-4">Grievance & Support Desk</h3>
      <p className="text-slate-400">Submit support tickets to college admin staff.</p>
    </div>
  );
};
