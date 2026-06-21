import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS } from '../services/firebase';
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
  Megaphone
} from 'lucide-react';

export const FacultyPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <FacultyDashboard faculty={user} />;
  if (subPage === 'attendance') return <FacultyAttendance faculty={user} />;
  if (subPage === 'notes') return <FacultyNotes faculty={user} />;
  if (subPage === 'marks') return <FacultyMarks faculty={user} />;
  if (subPage === 'assignments') return <FacultyAssignments faculty={user} />;
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-650 to-teal-600 text-white shadow-xl">
        <h2 className="text-2xl font-extrabold font-display">Welcome back, {faculty.fullName}!</h2>
        <p className="text-sm text-emerald-100 mt-1">
          Department of {faculty.department} • Active Academic Member
        </p>
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
  const availableBranches = faculty.assignedBranches && faculty.assignedBranches.length > 0 
    ? faculty.assignedBranches 
    : [faculty.department || 'CSE'];
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useAuth();

  const handleFetchStudents = async () => {
    try {
      setLoading(true);
      const studentUsers = await mockDB.getStudentsByBranchAndSemester(branch, semester);
      const existingAttendance = await mockDB.getAttendanceByFilter(branch, semester, date);
      
      const sheet = {};
      studentUsers.forEach(s => {
        const exist = existingAttendance.find(a => a.studentId === s.uid);
        sheet[s.uid] = exist ? exist.status : 'present';
      });

      setStudents(studentUsers);
      setAttendanceSheet(sheet);
    } catch (_) {
      showToast('Failed to retrieve students list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchStudents();
  }, [branch, semester, date]);

  const toggleStatus = (id) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present'
    }));
  };

  const markAll = (status) => {
    const sheet = {};
    students.forEach(s => {
      sheet[s.uid] = status;
    });
    setAttendanceSheet(sheet);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const records = students.map(s => ({
        studentId: s.uid,
        studentName: s.fullName,
        rollNumber: s.rollNumber,
        date,
        status: attendanceSheet[s.uid],
        branch,
        semester
      }));

      await mockDB.saveAttendanceBatch(records);
      showToast('Attendance records saved successfully!', 'success');
    } catch (_) {
      showToast('Could not save attendance data.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Daily Attendance Manager</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Select class parameters to fill current lecture logs</p>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-455">Retrieving class profiles...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-slate-455 dark:text-slate-500 text-xs font-semibold">No students registered in {branch} {semester}.</div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 justify-end text-xs">
            <button 
              onClick={() => markAll('present')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-605 font-bold border border-emerald-200/50 hover:bg-emerald-100 transition-colors"
            >
              Mark All Present
            </button>
            <button 
              onClick={() => markAll('absent')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-bold border border-rose-200/50 hover:bg-rose-100 transition-colors"
            >
              Mark All Absent
            </button>
          </div>

          <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                  <th className="px-5 py-3">Roll Number</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                {students.map(s => {
                  const isPresent = attendanceSheet[s.uid] === 'present';
                  return (
                    <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-5 py-4">{s.rollNumber}</td>
                      <td className="px-5 py-4">{s.fullName}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(s.uid)}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold border ${
                            isPresent 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}
                        >
                          {isPresent ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          <span>{isPresent ? 'Present' : 'Absent'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15"
            >
              {saving ? 'Saving...' : 'Submit Attendance Roll'}
            </button>
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
  const availableBranches = faculty.assignedBranches && faculty.assignedBranches.length > 0 
    ? faculty.assignedBranches 
    : [faculty.department || 'CSE'];
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [subject, setSubject] = useState(faculty.subjects?.[0] || '');
  const [students, setStudents] = useState([]);
  const [marksSheet, setMarksSheet] = useState({}); // studentId -> {mid1, mid2, assignments}
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();

  const handleFetchStudents = async () => {
    try {
      setLoading(true);
      const studentUsers = await mockDB.getStudentsByBranchAndSemester(branch, semester);
      const existingMarks = await mockDB.getBranchMarks(branch, semester, subject);

      const sheet = {};
      studentUsers.forEach(s => {
        const exist = existingMarks.find(m => m.studentId === s.uid) || { mid1: '', mid2: '', assignments: '' };
        sheet[s.uid] = {
          mid1: exist.mid1,
          mid2: exist.mid2,
          assignments: exist.assignments
        };
      });

      setStudents(studentUsers);
      setMarksSheet(sheet);
    } catch (_) {
      showToast('Could not fetch student profiles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchStudents();
  }, [branch, semester, subject]);

  const handleScoreChange = (sid, field, val) => {
    let numVal = val === '' ? '' : Math.min(field === 'assignments' ? 10 : 20, Math.max(0, Number(val)));
    setMarksSheet(prev => ({
      ...prev,
      [sid]: {
        ...prev[sid],
        [field]: numVal
      }
    }));
  };

  const handleSaveMarks = async (studentId, studentName, rollNumber) => {
    const scores = marksSheet[studentId];
    if (scores.mid1 === '' || scores.mid2 === '' || scores.assignments === '') {
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
        subject,
        scores.mid1,
        scores.mid2,
        scores.assignments
      );
      showToast(`Marks saved for ${studentName}!`, 'success');
    } catch (_) {
      showToast('Could not record internal marks.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Enter Student Internal Marks</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Settle midterm assessments, assignments and total marks (max 50)</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
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
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            {faculty.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-450">Loading class register...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-slate-450">No students found matching filters.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Mid-Term 1 (20)</th>
                <th className="px-4 py-3 text-center">Mid-Term 2 (20)</th>
                <th className="px-4 py-3 text-center">Assignments (10)</th>
                <th className="px-4 py-3 text-center">Total (50)</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
              {students.map(s => {
                const vals = marksSheet[s.uid] || { mid1: '', mid2: '', assignments: '' };
                const total = Number(vals.mid1 || 0) + Number(vals.mid2 || 0) + Number(vals.assignments || 0);
                return (
                  <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-4 py-4">{s.rollNumber}</td>
                    <td className="px-4 py-4">{s.fullName}</td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="20"
                        min="0"
                        value={vals.mid1}
                        onChange={(e) => handleScoreChange(s.uid, 'mid1', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="20"
                        min="0"
                        value={vals.mid2}
                        onChange={(e) => handleScoreChange(s.uid, 'mid2', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        max="10"
                        min="0"
                        value={vals.assignments}
                        onChange={(e) => handleScoreChange(s.uid, 'assignments', e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold"
                      />
                    </td>
                    <td className="px-4 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{total}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleSaveMarks(s.uid, s.fullName, s.rollNumber)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black transition-colors"
                      >
                        Save Marks
                      </button>
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
  const availableBranches = faculty.assignedBranches && faculty.assignedBranches.length > 0 
    ? faculty.assignedBranches 
    : [faculty.department || 'CSE'];
  const [assignments, setAssignments] = useState([]);
  const [branch, setBranch] = useState(availableBranches[0]);
  const [semester, setSemester] = useState('Semester 6');
  const [subject, setSubject] = useState(faculty.subjects?.[0] || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Selection states
  const [activeAssign, setActiveAssign] = useState(null);
  const [gradeSheet, setGradeSheet] = useState({}); // studentId -> grade
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getAssignments();
      // Filter assignments created for subjects taught by this faculty
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
      await mockDB.createAssignment(title, description, branch, semester, subject, dueDate);
      showToast(`Assignment published for ${subject} ${semester}!`, 'success');
      setTitle('');
      setDescription('');
      setDueDate('');
      loadAssignments();
    } catch (_) {
      showToast('Could not publish assignment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmit = async (aid, sid, grade) => {
    if (!grade) return;
    try {
      await mockDB.gradeSubmission(aid, sid, grade);
      showToast('Graded successfully!', 'success');
      loadAssignments();
      
      // Update selected assignment state
      const updated = await mockDB.getAssignments();
      const match = updated.find(a => a.assignmentId === aid);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Create Assignment Form */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Create Assignment</h3>
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
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
                {faculty.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
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
                  key={a.assignmentId}
                  onClick={() => setActiveAssign(a)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    activeAssign?.assignmentId === a.assignmentId
                      ? 'bg-blue-500/5 border-blue-500 dark:bg-blue-950/20'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{a.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">{a.subject} • {a.branch} • {a.semester}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-rose-500 block">Due: {a.dueDate}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">Submissions: {a.submissions.length}</span>
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

            {activeAssign.submissions.length === 0 ? (
              <div className="py-10 text-center text-slate-455">No student has uploaded answers yet.</div>
            ) : (
              <div className="space-y-3">
                {activeAssign.submissions.map(sub => (
                  <div key={sub.studentId} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{sub.studentName}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Roll: {sub.rollNumber} • Submitted: {sub.submittedAt.split('T')[0]}</p>
                      <a href="#mock-download" className="text-[10.5px] text-blue-600 hover:underline font-bold block mt-1">Download: {sub.fileUrl}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={gradeSheet[sub.studentId] || sub.grade}
                        onChange={(e) => handleGradeFieldChange(sub.studentId, e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-bold text-xs"
                      >
                        <option value="Pending">Pending</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="F">F</option>
                      </select>
                      <button
                        onClick={() => handleGradeSubmit(activeAssign.assignmentId, sub.studentId, gradeSheet[sub.studentId] || sub.grade)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black"
                      >
                        Submit Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
