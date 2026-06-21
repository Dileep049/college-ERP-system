import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  TrendingUp, 
  User,
  CreditCard,
  Library,
  UserCheck,
  Check,
  Activity,
  AlertCircle,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

// Main Student Portal Router Switch
export const StudentPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <StudentDashboard student={user} />;
  if (subPage === 'leaves') return <StudentLeaves student={user} />;
  if (subPage === 'notes') return <StudentNotes student={user} />;
  if (subPage === 'placements') return <StudentPlacements student={user} />;
  if (subPage === 'fees') return <StudentFees student={user} />;
  if (subPage === 'library') return <StudentLibrary student={user} />;
  if (subPage === 'counselling') return <StudentCounselling student={user} />;
  if (subPage === 'marks') return <StudentMarks student={user} />;
  if (subPage === 'results') return <StudentResults student={user} />;
  if (subPage === 'assignments') return <StudentAssignments student={user} />;
  return <StudentDashboard student={user} />;
};

// Skeleton Loader
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    </div>
  </div>
);

// 1. STUDENT DASHBOARD
const StudentDashboard = ({ student }) => {
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [notes, setNotes] = useState([]);
  const [drives, setDrives] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
        const profile = studentsList.find(s => s.studentId === student.uid) || {
          attendancePercentage: 100,
          totalClasses: 0,
          attendedClasses: 0,
          cgpa: 8.0
        };
        setStudentProfile(profile);

        const leavesData = await mockDB.getLeaves('student', student.uid);
        const notesData = await mockDB.getNotes(student.department, student.semester);
        const drivesData = await mockDB.getPlacementDrives();
        const announcementsData = await mockDB.getAnnouncements();

        setLeaves(leavesData.slice(0, 3));
        setNotes(notesData.slice(0, 3));
        setDrives(drivesData.slice(0, 3));
        setAnnouncements(announcementsData.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [student]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Welcome Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Hello, {student.fullName}!</h2>
          <p className="text-sm text-blue-100 mt-1">
            Department of {student.department} • {student.semester} • Roll No: {student.rollNumber}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
          <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">CGPA Rating</span>
          <span className="text-xl font-black">{studentProfile?.cgpa || '8.0'} Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 text-slate-105 dark:text-slate-800/10 pointer-events-none transform translate-y-4 translate-x-2">
            <TrendingUp size={160} />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{studentProfile?.attendancePercentage || 0}%</span>
              <span className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">
                ({studentProfile?.attendedClasses}/{studentProfile?.totalClasses} lectures)
              </span>
            </div>
            <div className="mt-4 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (studentProfile?.attendancePercentage || 0) >= 75 ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${studentProfile?.attendancePercentage || 0}%` }}
              ></div>
            </div>
            <p className="mt-3 text-[10px] text-slate-450 dark:text-slate-400 font-bold flex items-center gap-1.5">
              {(studentProfile?.attendancePercentage || 0) >= 75 ? (
                <span className="text-emerald-500">● Eligible for Semester Exams</span>
              ) : (
                <span className="text-rose-500">● Attendance Deficit Warning</span>
              )}
            </p>
          </div>
        </div>

        {/* Leaves Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Absence Sign-offs</span>
          <div className="mt-4 space-y-3">
            {leaves.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-550 text-xs font-semibold">No leaves reported.</div>
            ) : (
              leaves.map(l => (
                <div key={l.leaveId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{l.reason}</p>
                    <span className="text-[9px] text-slate-450 mt-0.5">{l.startDate} to {l.endDate}</span>
                  </div>
                  <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drives Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Placement Updates</span>
          <div className="mt-4 space-y-3">
            {drives.filter(d => d.status === 'upcoming').length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">No scheduled job drives.</div>
            ) : (
              drives.filter(d => d.status === 'upcoming').map(d => (
                <div key={d.driveId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-250">{d.companyName}</p>
                    <span className="text-[9.5px] text-slate-450 font-bold mt-0.5">{d.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">{d.salaryPackage}</span>
                    <span className="text-[9px] text-slate-455 font-bold mt-0.5">{d.driveDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Notices */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Academic announcements notice board</span>
        {announcements.length === 0 ? (
          <div className="text-center py-10 text-slate-455">No notices posted.</div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                  <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{ann.title}</h4>
                  <span className="text-[9.5px] text-slate-400 font-bold">{ann.date} • {ann.author}</span>
                </div>
                <p className="text-slate-650 dark:text-slate-350 font-semibold leading-relaxed text-[11px]">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 2. STUDENT LEAVES APPLICATION
const StudentLeaves = ({ student }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getLeaves('student', student.uid);
      setLeaves(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      await mockDB.applyLeave(
        student.uid,
        student.fullName,
        student.rollNumber,
        student.department,
        student.semester,
        student.counsellorId || 'coun-cse',
        reason,
        startDate,
        endDate
      );
      showToast('Leave request submitted to Ward Counsellor!', 'success');
      setReason('');
      setStartDate('');
      setEndDate('');
      loadLeaves();
    } catch (_) {
      showToast('Could not file leaves form.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Apply Form */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Apply Leave Absence</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Reason of Absence</label>
            <textarea
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed explanation..."
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? 'Filing form...' : 'Submit Application'}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* History */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Leaves Ledger History</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse">Loading list...</div>
        ) : leaves.length === 0 ? (
          <div className="py-20 text-center text-slate-455">No absence applications filed.</div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {leaves.map(l => (
              <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs truncate max-w-xs">{l.reason}</h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">Period: {l.startDate} to {l.endDate}</span>
                  <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                    {l.remarks ? (
                      <p className="text-slate-650 dark:text-slate-350">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">Counsellor Remarks:</span> {l.remarks}
                      </p>
                    ) : (
                      <p className="italic text-slate-400">No remarks from Counsellor yet.</p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  l.status === 'rejected' ? 'bg-rose-500/10 text-rose-505' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 3. STUDY NOTES DOWNLOAD SECTION
const StudentNotes = ({ student }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getNotes(student.department, student.semester);
        setNotes(data);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [student]);

  const handleDownloadSim = (filename) => {
    showToast(`Downloading file: ${filename} (simulated)`, 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">Branch Study Materials</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading study files...</div>
      ) : notes.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No notes files uploaded by branch faculty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.noteId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{n.topic}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{n.subject} • Taught by: {n.facultyName}</p>
                <p className="text-[9.5px] text-slate-450 mt-0.5">{n.description}</p>
              </div>
              <button
                onClick={() => handleDownloadSim(n.fileName)}
                className="p-2.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100/50 text-blue-600 dark:text-blue-400 rounded-xl"
                title="Download lecture slides"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. STUDENT INTERNAL MARKS SUBPAGE
const StudentMarks = ({ student }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarks = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getStudentMarks(student.uid);
        setMarks(data);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    loadMarks();
  }, [student]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Internal marks sheet</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading grades...</div>
      ) : marks.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No internal marks logged by faculty for this semester.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Subject Name</th>
                <th className="px-5 py-3 text-center">Mid-Term 1 (20)</th>
                <th className="px-5 py-3 text-center">Mid-Term 2 (20)</th>
                <th className="px-5 py-3 text-center">Assignments (10)</th>
                <th className="px-5 py-3 text-center">Total score (50)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-105 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-bold">
              {marks.map(m => (
                <tr key={m.markId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{m.subject}</td>
                  <td className="px-5 py-4 text-center">{m.mid1}</td>
                  <td className="px-5 py-4 text-center">{m.mid2}</td>
                  <td className="px-5 py-4 text-center">{m.assignments}</td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{m.total} / 50</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 5. STUDENT SEMESTER RESULTS
const StudentResults = () => {
  // Mocking past semester results logs
  const results = [
    { sem: 'Semester 1', gpa: '8.40', status: 'Passed', credits: 22 },
    { sem: 'Semester 2', gpa: '8.65', status: 'Passed', credits: 22 },
    { sem: 'Semester 3', gpa: '8.80', status: 'Passed', credits: 24 },
    { sem: 'Semester 4', gpa: '8.92', status: 'Passed', credits: 24 },
    { sem: 'Semester 5', gpa: '9.05', status: 'Passed', credits: 20 }
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Past Semesters Transcript</span>
      
      <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
              <th className="px-5 py-3">Academic Term</th>
              <th className="px-5 py-3 text-center">Completed Credits</th>
              <th className="px-5 py-3 text-center">Result Status</th>
              <th className="px-5 py-3 text-center">SGPA Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-bold">
            {results.map(r => (
              <tr key={r.sem} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                <td className="px-5 py-4">{r.sem}</td>
                <td className="px-5 py-4 text-center">{r.credits}</td>
                <td className="px-5 py-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-black rounded">{r.status}</span>
                </td>
                <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{r.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. STUDENT ASSIGNMENTS SUBPAGE
const StudentAssignments = ({ student }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getAssignments(student.department, student.semester);
      setAssignments(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [student]);

  const handleSubmitAssignment = async (e, aid) => {
    e.preventDefault();
    if (!fileUrl) return;

    try {
      setUploading(true);
      await mockDB.submitAssignment(
        aid,
        student.uid,
        student.fullName,
        student.rollNumber,
        fileUrl
      );
      showToast('Assignment uploaded successfully!', 'success');
      setFileUrl('');
      setSubmittingId(null);
      loadAssignments();
    } catch (_) {
      showToast('Could not submit answers.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Class Assignments Ledger</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading homework...</div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No pending assignments allocated for your class.</div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const submission = a.submissions.find(s => s.studentId === student.uid);
            return (
              <div key={a.assignmentId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{a.title}</h4>
                  <p className="text-[10px] text-slate-450 mt-1">{a.subject} • Target due date: <span className="text-rose-500 font-extrabold">{a.dueDate}</span></p>
                  <p className="text-[10.5px] text-slate-650 dark:text-slate-400 mt-1.5">{a.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {submission ? (
                    <div className="text-right">
                      <span className="text-[9.5px] px-2 py-0.5 bg-emerald-500/10 text-emerald-505 rounded font-black uppercase">Submitted</span>
                      <span className="block text-[9.5px] text-slate-400 mt-1">Grade: <span className="text-blue-600 dark:text-blue-400 font-black">{submission.grade}</span></span>
                    </div>
                  ) : submittingId === a.assignmentId ? (
                    <form onSubmit={(e) => handleSubmitAssignment(e, a.assignmentId)} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g., Bankers_Algo.pdf"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        required
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmittingId(null)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSubmittingId(a.assignmentId)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow"
                    >
                      Settle Submission
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 7. ONLINE PAYMENT FEE UPGRADE
const StudentFees = ({ student }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState(null);
  
  // Checkout form states
  const [payMethod, setPayMethod] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiAddress, setUpiAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const { showToast } = useAuth();

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getFees(student.uid);
      setFees(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [student]);

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    try {
      setProcessing(true);
      await mockDB.payFee(activeInvoice.invoiceId, payMethod);
      showToast(`Payment of ₹${activeInvoice.amount.toLocaleString()} received successfully!`, 'success');
      
      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Clear checkout states
      setActiveInvoice(null);
      setCardNumber('');
      setCardCVV('');
      setUpiAddress('');
      loadFees();
    } catch (_) {
      showToast('Could not complete payment.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSim = (inv) => {
    let content = `==========================================================\n`;
    content += `KBN COLLEGE ERP - PAYMENT RECEIPT\n`;
    content += `==========================================================\n`;
    content += `Receipt Id   : REC-${inv.invoiceId.toUpperCase()}\n`;
    content += `Date         : ${new Date(inv.paidAt).toLocaleDateString()}\n`;
    content += `Roll Number  : ${inv.rollNumber}\n`;
    content += `Student Name : ${inv.studentName}\n`;
    content += `Branch       : ${inv.department}\n`;
    content += `Semester     : ${inv.semester}\n`;
    content += `==========================================================\n`;
    content += `Fee Category : ${inv.feeType}\n`;
    content += `Method       : ${inv.paymentMethod}\n`;
    content += `Amount Paid  : INR ${inv.amount.toLocaleString()}.00\n`;
    content += `Status       : SUCCESSFUL TRANSACTION\n`;
    content += `==========================================================\n`;
    content += `Generated by KBN Central Accounts Counter.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${inv.feeType.replace(/\s+/g, '_')}_${inv.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Receipt download initialized.', 'success');
  };

  const unpaid = fees.filter(f => f.status === 'unpaid');
  const paid = fees.filter(f => f.status === 'paid');

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Alert Warning */}
      {unpaid.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-bold">
            Attention: You have {unpaid.length} outstanding dues. Settle invoices before the semester exam hall tickets release.
          </p>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Central Fee Payment Board</h2>
          <p className="text-sm text-blue-100 mt-1">Settle Tuition, Exam, Bus, and Hostel fees instantly</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <CreditCard size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Fee Invoices */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Outstanding */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Outstanding Invoices ({unpaid.length})</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading invoices...</div>
            ) : unpaid.length === 0 ? (
              <div className="py-8 text-center text-slate-455">No outstanding invoices. All clear!</div>
            ) : (
              <div className="space-y-3">
                {unpaid.map(inv => (
                  <div key={inv.invoiceId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{inv.feeType}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Semester: {inv.semester} • Due Date: {inv.dueDate}</p>
                      <span className="text-xs font-black text-rose-500 block mt-1">₹{inv.amount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="px-4 py-2 bg-blue-650 hover:bg-blue-755 text-white rounded-xl font-bold shadow"
                    >
                      Settle Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paid History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Receipts Logs history ({paid.length})</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading history...</div>
            ) : paid.length === 0 ? (
              <div className="py-8 text-center text-slate-455">No completed transactions logged.</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {paid.map(inv => (
                  <div key={inv.invoiceId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-805 dark:text-slate-200 text-xs">{inv.feeType}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Paid on: {inv.paidAt.split('T')[0]} via {inv.paymentMethod}</p>
                      <span className="text-xs font-black text-emerald-500 block mt-1">₹{inv.amount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadSim(inv)}
                      className="p-2.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100/50 text-blue-600 dark:text-blue-400 rounded-xl"
                      title="Download payment receipt"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Settle Checkout Box */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">Transactions checkout</span>
          
          {!activeInvoice ? (
            <div className="py-20 text-center text-slate-450 dark:text-slate-500 font-bold">
              Choose an outstanding invoice to open checkout details.
            </div>
          ) : (
            <form onSubmit={handlePayFee} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Settling Category</span>
                <p className="text-sm font-black text-slate-850 dark:text-white mt-1">{activeInvoice.feeType}</p>
                <p className="text-slate-450 text-[10px] font-semibold mt-0.5">{activeInvoice.semester}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Settle Dues</span>
                <p className="text-xl font-black text-blue-650 mt-1">₹{activeInvoice.amount.toLocaleString()}.00</p>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Payment channels</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-350">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'UPI'}
                      onChange={() => setPayMethod('UPI')}
                    />
                    <span>UPI Address</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-350">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'Card'}
                      onChange={() => setPayMethod('Card')}
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                </div>
              </div>

              {payMethod === 'UPI' ? (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">UPI Address (VPA)</label>
                  <input
                    type="text"
                    value={upiAddress}
                    onChange={(e) => setUpiAddress(e.target.value)}
                    placeholder="student@okaxis"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">16-Digit Card Number</label>
                    <input
                      type="text"
                      maxLength="16"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4321 0987 6543 2100"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">CVV Mask</label>
                    <input
                      type="password"
                      maxLength="3"
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                      placeholder="•••"
                      required
                      className="w-20 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white text-center font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                <span>{processing ? 'Authorizing checkout...' : `Complete Settle`}</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

// 8. LIBRARY CATALOG BORROWS
const StudentLibrary = ({ student }) => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const list = await mockDB.getBooks();
      setBooks(list);
      const userIssues = await mockDB.getIssuedBooks(student.uid);
      setIssues(userIssues);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, [student]);

  const handleRequestBook = async (bookId, title) => {
    try {
      await mockDB.requestBook(student.uid, student.fullName, student.rollNumber, bookId);
      showToast(`Borrow request placed for: ${title}! Approval pending at librarian office.`, 'success');
      loadLibrary();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search)
  );

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Central Library Catalogue search</h2>
          <p className="text-sm text-teal-100 mt-1">Audit borrow logs, textbook catalog search and outstanding fines</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Library size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Catalogue search */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Book catalogue search</span>
              <button onClick={loadLibrary} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author name, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse">Loading catalogue...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-20 text-center text-slate-455">No books match search query filters.</div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Book details</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Checkout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-805 dark:text-slate-250 font-bold">
                    {filteredBooks.map(book => (
                      <tr key={book.bookId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3">
                          <h4 className="font-extrabold text-slate-805 dark:text-white text-xs">{book.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{book.author} • ISBN: {book.isbn}</p>
                        </td>
                        <td className="px-4 py-3">{book.category}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRequestBook(book.bookId, book.title)}
                            disabled={book.availableCopies === 0}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                              book.availableCopies === 0 
                                ? 'bg-slate-100 text-slate-450 border border-slate-200' 
                                : 'bg-teal-650 hover:bg-teal-700 text-white shadow'
                            }`}
                          >
                            {book.availableCopies === 0 ? 'Out of Stock' : 'Request Book'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* User borrow logs */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Your circulation ledger</span>
          
          {loading ? (
            <div className="py-10 text-center animate-pulse">Loading transaction records...</div>
          ) : issues.length === 0 ? (
            <div className="py-12 text-center text-slate-455">No borrow transaction history found.</div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {issues.map(item => (
                <div key={item.transactionId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-250 text-xs">{item.bookTitle}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Transaction ID: {item.transactionId.toUpperCase()}</p>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      item.status === 'returned' ? 'bg-slate-200 text-slate-500' :
                      item.status === 'issued' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.status !== 'requested' && (
                    <div className="grid grid-cols-2 gap-4 text-[9.5px] font-bold text-slate-455 mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800">
                      <div>
                        <span>Issue Date</span>
                        <span className="block text-slate-700 dark:text-slate-350 mt-0.5">{item.issueDate}</span>
                      </div>
                      <div>
                        <span>{item.status === 'returned' ? 'Returned Date' : 'Due Date'}</span>
                        <span className="block text-slate-700 dark:text-slate-350 mt-0.5">{item.status === 'returned' ? item.returnDate : item.dueDate}</span>
                      </div>
                    </div>
                  )}

                  {item.fine > 0 && (
                    <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-center font-extrabold">
                      Overdue Fines: ₹{item.fine} (₹10/day delay)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 9. STUDENT COUNSELLING VIEW ASSIGNED MENTOR
const StudentCounselling = ({ student }) => {
  const [logs, setLogs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counsellor, setCounsellor] = useState(null);

  // Slot booking states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [booking, setBooking] = useState(false);
  const { showToast } = useAuth();

  const loadCounselling = async () => {
    try {
      setLoading(true);
      const allUsers = await mockDB.getAllUsers();
      const myCounsellor = allUsers.find(u => u.uid === student.counsellorId || (u.role === 'counsellor' && u.department === student.department));
      setCounsellor(myCounsellor);

      const userLogs = await mockDB.getCounsellingLogs(student.uid);
      setLogs(userLogs);

      const userMeetings = await mockDB.getCounsellingMeetings('student', student.uid);
      setMeetings(userMeetings);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounselling();
  }, [student]);

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    try {
      setBooking(true);
      await mockDB.requestCounsellingMeeting(
        student.uid,
        student.fullName,
        student.counsellorId || 'coun-cse',
        student.counsellorName || 'Dr. Bruce Banner',
        title,
        date,
        time
      );
      showToast('Counselling slot request sent to assigned mentor!', 'success');
      setTitle('');
      setDate('');
      setTime('');
      loadCounselling();
    } catch (_) {
      showToast('Could not schedule slot.', 'error');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner Assigned Counsellor */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[9.5px] font-bold text-sky-200 uppercase tracking-wider block">Assigned Ward Counsellor</span>
          <h2 className="text-2xl font-extrabold font-display mt-1">{counsellor?.fullName || student.counsellorName || 'Dr. Bruce Banner'}</h2>
          <p className="text-sm text-sky-100 mt-1">Department of {student.department} Guidance Advisor</p>
          <div className="text-[11px] text-sky-200 mt-3 space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
            <p>Employee ID: <span className="font-extrabold text-white">{counsellor?.employeeId || 'N/A'}</span></p>
            <p>Email: <span className="font-extrabold text-white">{counsellor?.email || 'N/A'}</span></p>
            <p>Contact Number: <span className="font-extrabold text-white">{counsellor?.contactNumber || 'N/A'}</span></p>
          </div>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0 text-center self-start">
          <span className="text-[10px] text-sky-200 uppercase block font-bold">Office Hours</span>
          <span className="text-xs font-black">Mon - Fri (2PM - 4PM)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Book slot Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Schedule meeting slot</h3>
          
          <form onSubmit={handleBookSlot} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Discussion Focus</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Guidance on Projects / Midterm stress"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Target Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Time (24h format)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={booking}
              className="w-full py-3 bg-sky-655 hover:bg-sky-755 text-white rounded-xl font-bold transition-all shadow flex items-center justify-center gap-1.5"
            >
              <span>{booking ? 'Scheduling...' : 'Send Request'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Requests & logs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Requests statuses */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Slot Requests Status</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading requests...</div>
            ) : meetings.length === 0 ? (
              <div className="py-6 text-center text-slate-455">No requested slots scheduled.</div>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {meetings.map(meet => (
                  <div key={meet.meetingId} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-250 text-xs">{meet.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Date: {meet.date} at {meet.time}</p>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      meet.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      meet.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {meet.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Counselling session logs review */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Counselling Diaries Feed</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading diaries...</div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-slate-455">No counselling diaries recorded.</div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.logId} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{log.topic}</h4>
                      <span className="text-[9.5px] text-slate-450 font-bold">{log.date}</span>
                    </div>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold text-[11px]">{log.notes}</p>
                    {log.actionItems && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200/40 dark:border-slate-800">
                        <span className="text-[9.5px] font-black text-slate-450 uppercase block">Mentors Action goals</span>
                        <p className="text-[10.5px] text-slate-550 dark:text-slate-400 whitespace-pre-line leading-relaxed font-mono mt-1 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-850">{log.actionItems}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

// 10. PLACEMENTS NOTIFICATIONS & UPDATES
const StudentPlacements = ({ student }) => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState({ cgpa: 8.0 });
  const { showToast } = useAuth();

  const loadPlacements = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementDrives();
      setDrives(data);

      const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
      const profile = studentsList.find(s => s.studentId === student.uid) || { cgpa: 8.0 };
      setStudentProfile(profile);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, [student]);

  const handleApply = async (driveId, company) => {
    try {
      await mockDB.applyForDrive(driveId, student.uid);
      showToast(`Successfully registered your candidacy for ${company}!`, 'success');
      loadPlacements();
    } catch (_) {
      showToast('Could not submit application.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">Campus Placements Drive schedule</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading placement events...</div>
      ) : drives.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No active placement drives scheduled.</div>
      ) : (
        <div className="space-y-4">
          {drives.map(drive => {
            const hasApplied = drive.applicants.includes(student.uid);
            const isSelected = drive.selectedStudents.includes(student.uid);
            return (
              <div key={drive.driveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{drive.companyName}</h4>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      drive.status === 'completed' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1">{drive.role} • <span className="text-blue-600 dark:text-blue-400 font-extrabold">{drive.salaryPackage}</span></p>
                  <p className="text-[9.5px] text-slate-455 mt-1 font-semibold">Criteria: {drive.eligibility}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {isSelected ? (
                    <span className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] border border-emerald-600 shadow">Hired / Selected</span>
                  ) : hasApplied ? (
                    <span className="px-3.5 py-1.5 bg-slate-205 dark:bg-slate-800 text-slate-500 rounded-xl font-bold uppercase text-[10px]">Registered</span>
                  ) : (
                    <button
                      onClick={() => handleApply(drive.driveId, drive.companyName)}
                      disabled={drive.status === 'completed'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl font-bold shadow"
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
  );
};
