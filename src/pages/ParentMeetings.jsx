import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Users, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Phone, 
  Video, 
  Building2, 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  X, 
  RefreshCw, 
  Sparkles, 
  UserCheck,
  Check,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const ParentMeetings = ({ counsellor: propCounsellor }) => {
  const { user, showToast } = useAuth();
  const counsellor = propCounsellor || user;

  // Data States
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [meetingMode, setMeetingMode] = useState('Campus Visit');
  const [primaryReason, setPrimaryReason] = useState('Low Attendance');
  const [notes, setNotes] = useState('');

  // UI Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');

  // 1. AUTOMATIC STUDENT FETCHING FROM FIRESTORE & SCOPE
  const fetchScopeStudents = async () => {
    try {
      let fetched = [];
      const counsellorDept = counsellor?.assignedBranch || counsellor?.assignedDepartment || counsellor?.department || '';

      if (isFirebaseConfigured && db) {
        try {
          const usersRef = collection(db, 'users');
          // Query users collection for role === 'student'
          const q = query(usersRef, where('role', '==', 'student'));
          const snap = await getDocs(q);
          snap.forEach(docSnap => {
            const data = docSnap.data();
            fetched.push({ id: docSnap.id, uid: docSnap.id, ...data });
          });
        } catch (fsErr) {
          console.error('[Firestore] Error fetching students:', fsErr);
        }
      }

      // Fallback / Merge mockDB users
      try {
        const mockUsers = (await mockDB.getAllUsers?.()) || [];
        const mockStuds = mockUsers.filter(u => u.role === 'student');
        const seen = new Set(fetched.map(s => s.uid || s.id || s.email));
        mockStuds.forEach(s => {
          const key = s.uid || s.id || s.email;
          if (key && !seen.has(key)) {
            seen.add(key);
            fetched.push(s);
          }
        });
      } catch (e) {
        console.warn('Mock users merge warning:', e);
      }

      // Filter by Counsellor Branch/Department Scope if defined
      if (counsellorDept && counsellorDept !== 'All' && counsellorDept !== 'N/A') {
        const normDept = counsellorDept.toUpperCase().trim();
        fetched = fetched.filter(s => {
          const sDept = (s.department || s.branch || s.assignedBranch || '').toUpperCase().trim();
          if (!sDept) return true;
          return (
            sDept === normDept ||
            sDept.includes(normDept) ||
            normDept.includes(sDept) ||
            (normDept.includes('AI') && sDept.includes('AI'))
          );
        });
      }

      setStudents(fetched);
    } catch (err) {
      console.error('Error in fetchScopeStudents:', err);
    }
  };

  // 2. FETCH PARENT MEETINGS FROM FIRESTORE & LOCAL STORAGE
  const fetchParentMeetings = async () => {
    setLoading(true);
    try {
      let list = [];
      const seenIds = new Set();
      const counsellorId = counsellor?.uid || counsellor?.id;

      if (isFirebaseConfigured && db) {
        try {
          const colRef = collection(db, 'parentMeetings');
          const snap = await getDocs(colRef);
          snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            if (!seenIds.has(id)) {
              if (!counsellorId || !d.counsellorId || d.counsellorId === counsellorId) {
                seenIds.add(id);
                list.push({ id, meetingId: id, ...d });
              }
            }
          });
        } catch (fsErr) {
          console.error('[Firestore] Error querying parentMeetings:', fsErr);
          showToast?.(`Firebase Query Error: ${fsErr.message}`, 'error');
        }
      }

      // Local storage fallback
      try {
        const localData = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
        localData.forEach(m => {
          const id = m.id || m.meetingId;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            list.push(m);
          }
        });
      } catch (_) {}

      setMeetings(list);
    } catch (err) {
      console.error('Error fetching parent meetings:', err);
      showToast?.('Could not load parent meetings schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (counsellor) {
      fetchScopeStudents();
      fetchParentMeetings();
    }
  }, [counsellor]);

  // Set default meeting date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMeetingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // 3. SUBMIT SCHEDULED MEETING FORM
  const handleScheduleMeeting = async (e) => {
    e.preventDefault();

    if (!selectedStudentId) {
      showToast?.('Please select a student for the meeting.', 'warning');
      return;
    }
    if (!meetingDate) {
      showToast?.('Please specify the meeting date.', 'warning');
      return;
    }

    const selectedStudent = students.find(s => (s.uid || s.id || s.email) === selectedStudentId);
    const studentName = selectedStudent?.fullName || selectedStudent?.name || selectedStudent?.studentName || 'Selected Student';
    const studentRoll = selectedStudent?.rollNumber || selectedStudent?.roll || selectedStudent?.studentId || '';

    setSubmitting(true);

    try {
      const payload = {
        counsellorId: counsellor?.uid || counsellor?.id || '',
        counsellorName: counsellor?.fullName || counsellor?.name || 'Ward Counsellor',
        studentId: selectedStudentId,
        studentName: studentName,
        studentRoll: studentRoll,
        department: selectedStudent?.department || counsellor?.assignedBranch || counsellor?.department || '',
        date: meetingDate,
        time: meetingTime,
        mode: meetingMode,
        reason: primaryReason,
        notes: notes.trim(),
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      let newId = `meeting-${Date.now()}`;

      // Save to Firestore 'parentMeetings' collection
      if (isFirebaseConfigured && db) {
        try {
          const docRef = await addDoc(collection(db, 'parentMeetings'), {
            ...payload,
            updatedAt: serverTimestamp()
          });
          newId = docRef.id;
          payload.id = newId;
          payload.meetingId = newId;
        } catch (fsErr) {
          console.error('[Firestore] addDoc on parentMeetings failed:', fsErr);
          showToast?.(`Firestore error: ${fsErr.message}`, 'error');
        }
      }

      // Save to Local Storage fallback
      const localData = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
      localData.unshift({ id: newId, meetingId: newId, ...payload });
      localStorage.setItem('acad_parent_meetings', JSON.stringify(localData));

      showToast?.(`Parent meeting scheduled with ${studentName}!`, 'success');

      // Reset form & close modal
      setIsModalOpen(false);
      setNotes('');
      if (students.length > 0) setSelectedStudentId(students[0].uid || students[0].id || '');
      
      fetchParentMeetings();
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      showToast?.('Could not schedule parent meeting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. UPDATE MEETING STATUS (Completed / No-Show / Cancelled)
  const handleUpdateStatus = async (meetingId, newStatus) => {
    try {
      setSubmitting(true);

      // Update Firestore
      if (isFirebaseConfigured && db && meetingId) {
        try {
          const meetingRef = doc(db, 'parentMeetings', meetingId);
          await updateDoc(meetingRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
          });
        } catch (fsErr) {
          console.warn('[Firestore] updateDoc parentMeetings warning:', fsErr);
        }
      }

      // Update Local Storage
      const localData = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
      const idx = localData.findIndex(m => m.id === meetingId || m.meetingId === meetingId);
      if (idx !== -1) {
        localData[idx].status = newStatus;
        localStorage.setItem('acad_parent_meetings', JSON.stringify(localData));
      }

      // Update Local State
      setMeetings(prev => prev.map(m => (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: newStatus } : m));

      showToast?.(`Meeting status updated to "${newStatus}".`, 'success');
    } catch (err) {
      console.error('Error updating meeting status:', err);
      showToast?.('Failed to update meeting status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. DELETE MEETING
  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to delete this scheduled meeting?')) return;

    try {
      if (isFirebaseConfigured && db && meetingId) {
        try {
          await deleteDoc(doc(db, 'parentMeetings', meetingId));
        } catch (_) {}
      }

      const localData = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
      const filtered = localData.filter(m => m.id !== meetingId && m.meetingId !== meetingId);
      localStorage.setItem('acad_parent_meetings', JSON.stringify(filtered));

      setMeetings(prev => prev.filter(m => m.id !== meetingId && m.meetingId !== meetingId));
      showToast?.('Meeting deleted.', 'info');
    } catch (err) {
      showToast?.('Could not delete meeting.', 'error');
    }
  };

  // Filter Helper Logic
  const filteredMeetings = meetings.filter(m => {
    const sName = (m.studentName || '').toLowerCase();
    const reason = (m.reason || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(q) || reason.includes(q);
    const matchesMode = modeFilter === 'ALL' || m.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const upcomingMeetings = filteredMeetings
    .filter(m => (m.status || 'Scheduled') === 'Scheduled')
    .sort((a, b) => new Date(`${a.date} ${a.time || '00:00'}`) - new Date(`${b.date} ${b.time || '00:00'}`));

  const pastMeetings = filteredMeetings
    .filter(m => (m.status || '') !== 'Scheduled')
    .sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`) - new Date(`${a.date} ${a.time || '00:00'}`));

  const completedCount = meetings.filter(m => m.status === 'Completed').length;
  const noShowCount = meetings.filter(m => m.status === 'No-Show').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shadow-2xl shadow-purple-500/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
            <Users size={14} className="text-amber-300" />
            <span>Parent-Teacher Counselling Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Parent & Student Meetings</h1>
          <p className="text-xs sm:text-sm font-medium text-purple-100/90 max-w-xl">
            Schedule, track, and record official academic counselling sessions with parents for your ward branch.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            if (students.length > 0 && !selectedStudentId) {
              setSelectedStudentId(students[0].uid || students[0].id || '');
            }
          }}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105"
        >
          <Plus size={18} className="text-purple-700" />
          <span>Schedule New Meeting</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Scheduled</span>
            <Calendar size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{meetings.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{upcomingMeetings.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">No-Shows</span>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{noShowCount}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter size={14} /> Mode:
          </span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-white outline-none"
          >
            <option value="ALL">All Modes</option>
            <option value="Campus Visit">Campus Visit</option>
            <option value="Phone Call">Phone Call</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: UPCOMING MEETINGS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
              <span>Upcoming Scheduled Meetings</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active sessions waiting for completion or verification
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold rounded-xl border border-purple-500/20 text-xs">
            {upcomingMeetings.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-purple-600" />
            <span className="text-xs font-bold">Loading meetings...</span>
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              📅
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No upcoming meetings scheduled.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow"
            >
              Schedule First Meeting
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Meeting Mode</th>
                  <th className="py-3 px-4">Primary Reason</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {upcomingMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {m.studentName ? m.studentName[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.studentName}</p>
                          <p className="text-[10px] text-slate-400">{m.studentRoll || 'Roll N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{m.date}</div>
                      <div className="text-[10px] text-purple-600 font-bold">{m.time}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {m.mode === 'Campus Visit' && <Building2 size={12} className="inline mr-1 text-purple-500" />}
                        {m.mode === 'Phone Call' && <Phone size={12} className="inline mr-1 text-blue-500" />}
                        {m.mode === 'Virtual' && <Video size={12} className="inline mr-1 text-emerald-500" />}
                        {m.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {m.reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {m.notes || 'No notes added'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'Completed')}
                          disabled={submitting}
                          title="Mark as Completed"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] transition-all flex items-center gap-1 border border-emerald-500/20"
                        >
                          <CheckCircle2 size={13} /> Completed
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(m.id, 'No-Show')}
                          disabled={submitting}
                          title="Mark as No-Show"
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] transition-all flex items-center gap-1 border border-amber-500/20"
                        >
                          <XCircle size={13} /> No-Show
                        </button>

                        <button
                          onClick={() => handleDeleteMeeting(m.id)}
                          title="Delete Meeting"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: MEETING HISTORY / COMPLETED SESSIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Meeting History & Logged Records</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Completed, No-Show, or archived counselling meetings
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-500/20 text-xs">
            {pastMeetings.length} Records
          </span>
        </div>

        {pastMeetings.length === 0 ? (
          <p className="py-8 text-center text-xs font-semibold text-slate-400">
            No past meeting history logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {pastMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {m.studentName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                      {m.date} <span className="text-slate-400 text-[11px]">({m.time})</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {m.mode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {m.reason}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        m.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : m.status === 'No-Show'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE MEETING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">Schedule Parent Meeting</h3>
                <p className="text-xs text-purple-100/90 mt-0.5">Select a student and set meeting details</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4 text-xs font-semibold">
              
              {/* 1. Dynamic Student Selector Dropdown */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Select Student (From Assigned Ward Scope) *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  {students.length === 0 ? (
                    <option value="">No students found in scope</option>
                  ) : (
                    students.map(s => {
                      const uidKey = s.uid || s.id || s.email;
                      const sName = s.fullName || s.name || s.studentName || 'Student';
                      const sRoll = s.rollNumber ? ` (${s.rollNumber})` : '';
                      const sBranch = s.department || s.branch ? ` - ${s.department || s.branch}` : '';
                      return (
                        <option key={uidKey} value={uidKey}>
                          {sName}{sRoll}{sBranch}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* 2. Date & Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Meeting Time *
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 3. Meeting Mode Dropdown */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Meeting Mode *
                </label>
                <select
                  value={meetingMode}
                  onChange={(e) => setMeetingMode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="Campus Visit">Campus Visit</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>

              {/* 4. Primary Reason Dropdown */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Primary Reason *
                </label>
                <select
                  value={primaryReason}
                  onChange={(e) => setPrimaryReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="Low Attendance">Low Attendance</option>
                  <option value="Poor Academic Performance">Poor Academic Performance</option>
                  <option value="Disciplinary Issue">Disciplinary Issue</option>
                  <option value="Routine Update">Routine Update</option>
                </select>
              </div>

              {/* 5. Additional Notes Textarea */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter agenda details or notes for parent discussion..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Schedule Meeting</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ParentMeetings;
