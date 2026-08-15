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

  // 1. AUTOMATIC STUDENT FETCHING (Dynamic Scope Query from Firestore)
  const fetchScopeStudents = async () => {
    try {
      let fetched = [];
      const assignedDept = counsellor?.assignedDepartment || counsellor?.assignedBranch || counsellor?.wardCounsellorDepartment || counsellor?.department || counsellor?.branch || '';

      if (isFirebaseConfigured && db) {
        try {
          const usersRef = collection(db, 'users');
          let q;

          // Query Firestore `users` collection matching role === "student" and branch === assignedDepartment
          if (assignedDept && assignedDept !== 'All' && assignedDept !== 'N/A') {
            try {
              q = query(usersRef, where('role', '==', 'student'), where('branch', '==', assignedDept));
              const snap = await getDocs(q);
              snap.forEach(docSnap => {
                fetched.push({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() });
              });
            } catch (errBranch) {
              // Fallback to role == student if compound index isn't created yet
              q = query(usersRef, where('role', '==', 'student'));
              const snap = await getDocs(q);
              snap.forEach(docSnap => {
                fetched.push({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() });
              });
            }
          } else {
            q = query(usersRef, where('role', '==', 'student'));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
              fetched.push({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() });
            });
          }
        } catch (fsErr) {
          console.error('[Firestore] Error fetching students:', fsErr);
        }
      }

      // Merge mockDB users as fallback for offline/demo environments
      try {
        if (mockDB?.getAllUsers) {
          const mockUsers = await mockDB.getAllUsers();
          const mockStuds = mockUsers.filter(u => u.role === 'student');
          const seen = new Set(fetched.map(s => s.uid || s.id || s.email));
          mockStuds.forEach(s => {
            const key = s.uid || s.id || s.email;
            if (key && !seen.has(key)) {
              seen.add(key);
              fetched.push(s);
            }
          });
        }
      } catch (e) {
        console.warn('Mock users merge warning:', e);
      }

      // Filter by Counsellor Branch/Department Scope if defined
      if (assignedDept && assignedDept !== 'All' && assignedDept !== 'N/A') {
        const normDept = assignedDept.toUpperCase().trim();
        const filtered = fetched.filter(s => {
          const sDept = (s.department || s.branch || s.assignedBranch || s.assignedDepartment || '').toUpperCase().trim();
          if (!sDept) return true;
          return (
            sDept === normDept ||
            sDept.includes(normDept) ||
            normDept.includes(sDept) ||
            (normDept.includes('AI') && sDept.includes('AI')) ||
            (normDept.includes('CS') && (sDept.includes('CS') || sDept.includes('COMPUTER')))
          );
        });
        if (filtered.length > 0) {
          fetched = filtered;
        }
      }

      setStudents(fetched);

      // Default select first student if available
      if (fetched.length > 0 && !selectedStudentId) {
        setSelectedStudentId(fetched[0].uid || fetched[0].id || '');
      }
    } catch (err) {
      console.error('Error in fetchScopeStudents:', err);
    }
  };

  // 2. FETCH PARENT MEETINGS FROM FIRESTORE `parentMeetings` COLLECTION
  const fetchParentMeetings = async () => {
    setLoading(true);
    try {
      let list = [];
      const seenIds = new Set();
      const counsellorId = counsellor?.uid || counsellor?.id;

      if (isFirebaseConfigured && db) {
        try {
          const colRef = collection(db, 'parentMeetings');
          let q;
          if (counsellorId) {
            q = query(colRef, where('counsellorId', '==', counsellorId));
          } else {
            q = colRef;
          }
          const snap = await getDocs(q);
          snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            if (!seenIds.has(id)) {
              seenIds.add(id);
              list.push({ id, meetingId: id, ...d });
            }
          });
        } catch (fsErr) {
          console.warn('[Firestore] Querying parentMeetings without filter fallback:', fsErr);
          // Fallback fetch all parentMeetings if index or counsellorId filter fails
          try {
            const snap = await getDocs(collection(db, 'parentMeetings'));
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
          } catch (err2) {
            console.error('Error fetching parentMeetings fallback:', err2);
          }
        }
      }

      // Local storage fallback for seamless local persistence
      try {
        const localData = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
        localData.forEach(m => {
          const id = m.id || m.meetingId;
          if (id && !seenIds.has(id)) {
            if (!counsellorId || !m.counsellorId || m.counsellorId === counsellorId) {
              seenIds.add(id);
              list.push(m);
            }
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
    fetchScopeStudents();
    fetchParentMeetings();
  }, [counsellor]);

  // Set default meeting date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMeetingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // 3. SUBMIT SCHEDULED MEETING FORM TO FIRESTORE
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
      // Required schema: counsellorId, studentId, studentName, date, time, mode, reason, notes, status: "Scheduled"
      const payload = {
        counsellorId: counsellor?.uid || counsellor?.id || '',
        counsellorName: counsellor?.fullName || counsellor?.name || 'Ward Counsellor',
        studentId: selectedStudentId,
        studentName: studentName,
        studentRoll: studentRoll,
        department: selectedStudent?.department || selectedStudent?.branch || counsellor?.assignedDepartment || counsellor?.assignedBranch || '',
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

      // Save to Firestore `parentMeetings` collection
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
          showToast?.(`Firestore notice: ${fsErr.message}`, 'warning');
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
      if (students.length > 0) {
        setSelectedStudentId(students[0].uid || students[0].id || '');
      }

      fetchParentMeetings();
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      showToast?.('Could not schedule parent meeting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. UPDATE MEETING STATUS (Completed / No-Show)
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

      // Update Local Storage fallback
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

  // Filter & Dashboard Table Data Logic
  const filteredMeetings = meetings.filter(m => {
    const sName = (m.studentName || '').toLowerCase();
    const reason = (m.reason || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(q) || reason.includes(q);
    const matchesMode = modeFilter === 'ALL' || m.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  // Upcoming Meetings: Filtered where status === "Scheduled", sorted by date (ascending)
  const upcomingMeetings = filteredMeetings
    .filter(m => (m.status || 'Scheduled') === 'Scheduled')
    .sort((a, b) => new Date(`${a.date} ${a.time || '00:00'}`) - new Date(`${b.date} ${b.time || '00:00'}`));

  // Meeting History / Completed Meetings: Filtered where status !== "Scheduled", sorted by date (descending)
  const pastMeetings = filteredMeetings
    .filter(m => (m.status || '') !== 'Scheduled')
    .sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`) - new Date(`${a.date} ${a.time || '00:00'}`));

  const completedCount = meetings.filter(m => m.status === 'Completed').length;
  const noShowCount = meetings.filter(m => m.status === 'No-Show').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border border-white/10 text-white shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
            <Users size={14} className="text-amber-300" />
            <span>Parent-Teacher Counselling Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Parent Meetings Desk</h1>
          <p className="text-xs sm:text-sm font-medium text-purple-200/90 max-w-xl">
            Schedule, track, and manage official parent-teacher counselling sessions for your assigned ward students.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            if (students.length > 0 && !selectedStudentId) {
              setSelectedStudentId(students[0].uid || students[0].id || '');
            }
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg border border-purple-400/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} className="text-white" />
          <span>Schedule New Meeting</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Scheduled</span>
            <Calendar size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{meetings.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            <Clock size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{upcomingMeetings.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">No-Shows</span>
            <XCircle size={18} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{noShowCount}</p>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white placeholder-gray-400 outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Filter size={14} /> Mode:
          </span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Modes</option>
            <option value="Campus Visit" className="bg-slate-900 text-white">Campus Visit</option>
            <option value="Phone Call" className="bg-slate-900 text-white">Phone Call</option>
            <option value="Virtual" className="bg-slate-900 text-white">Virtual</option>
          </select>
        </div>
      </div>

      {/* DASHBOARD TABLE 1: UPCOMING MEETINGS (status === "Scheduled") */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              <span>Upcoming Meetings</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Scheduled parent meetings requiring completion or status update
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold rounded-xl border border-purple-500/30 text-xs">
            {upcomingMeetings.length} Scheduled
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-purple-400" />
            <span className="text-xs font-bold">Loading meetings...</span>
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center mx-auto text-xl font-bold">
              📅
            </div>
            <p className="text-xs font-bold text-gray-400">No meetings currently scheduled.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg border border-purple-400/30 transition-all"
            >
              Schedule New Meeting
            </button>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden border border-white/10 rounded-2xl">
            <table className="w-full text-left text-xs font-medium border-collapse table-fixed">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="w-[26%] py-3 px-4">Student</th>
                  <th className="w-[18%] py-3 px-4">Date & Time</th>
                  <th className="w-[16%] py-3 px-4">Meeting Mode</th>
                  <th className="w-[18%] py-3 px-4">Primary Reason</th>
                  <th className="w-[12%] py-3 px-4">Notes</th>
                  <th className="w-[10%] py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {upcomingMeetings.map((m, idx) => (
                  <tr key={`${m.id || m.meetingId || 'up'}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {m.studentName ? m.studentName[0].toUpperCase() : 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white whitespace-normal break-words">{m.studentName}</p>
                          <p className="text-[10px] text-cyan-300 font-mono whitespace-normal break-words">{m.studentRoll || m.department || 'Student'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-gray-200">{m.date}</div>
                      <div className="text-[10px] text-purple-300 font-bold">{m.time}</div>
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-gray-200 border border-white/10 inline-flex items-center">
                        {m.mode === 'Campus Visit' && <Building2 size={12} className="inline mr-1 text-purple-300" />}
                        {m.mode === 'Phone Call' && <Phone size={12} className="inline mr-1 text-blue-300" />}
                        {m.mode === 'Virtual' && <Video size={12} className="inline mr-1 text-emerald-300" />}
                        {m.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {m.reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 whitespace-normal break-words align-middle">
                      {m.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'Completed')}
                          disabled={submitting}
                          title="Mark as Completed"
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-all flex items-center gap-1 border border-emerald-500/30"
                        >
                          <CheckCircle2 size={13} />
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(m.id, 'No-Show')}
                          disabled={submitting}
                          title="Mark as No-Show"
                          className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] transition-all flex items-center gap-1 border border-amber-500/30"
                        >
                          <XCircle size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteMeeting(m.id)}
                          title="Delete Meeting"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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

      {/* DASHBOARD TABLE 2: MEETING HISTORY / COMPLETED MEETINGS */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              <span>Meeting History & Logged Records</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Completed, No-Show, or archived parent counselling logs
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-xl border border-emerald-500/30 text-xs">
            {pastMeetings.length} Records
          </span>
        </div>

        {pastMeetings.length === 0 ? (
          <p className="py-8 text-center text-xs font-semibold text-gray-400">
            No past meeting history logged yet.
          </p>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden border border-white/10 rounded-2xl">
            <table className="w-full text-left text-xs font-medium border-collapse table-fixed">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="w-[25%] py-3 px-4">Student</th>
                  <th className="w-[18%] py-3 px-4">Date & Time</th>
                  <th className="w-[15%] py-3 px-4">Mode</th>
                  <th className="w-[20%] py-3 px-4">Primary Reason</th>
                  <th className="w-[12%] py-3 px-4">Status</th>
                  <th className="w-[10%] py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastMeetings.map((m, idx) => (
                  <tr key={`${m.id || m.meetingId || 'past'}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-normal break-words align-middle">
                      {m.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-semibold align-middle">
                      {m.date} <span className="text-gray-400 text-[11px]">({m.time})</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 align-middle">
                      {m.mode}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 whitespace-normal break-words align-middle">
                      {m.reason}
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                        m.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : m.status === 'No-Show'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 whitespace-normal break-words align-middle">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE MEETING MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight text-white">Schedule Parent Meeting</h3>
                <p className="text-xs text-purple-200/90 mt-0.5">Fill in session details to schedule</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4 text-xs font-semibold">
              
              {/* 1. Dynamic Student Selector Dropdown */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">
                  Select Student (From Assigned Scope) *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
                >
                  {students.length === 0 ? (
                    <option value="" className="bg-slate-900 text-white">No students found in assigned scope</option>
                  ) : (
                    students.map((s, idx) => {
                      const uidKey = s.uid || s.id || s.email;
                      const sName = s.fullName || s.name || s.studentName || 'Student';
                      const sRoll = s.rollNumber || s.roll || s.studentId ? ` (${s.rollNumber || s.roll || s.studentId})` : '';
                      const sBranch = s.department || s.branch ? ` - ${s.department || s.branch}` : '';
                      return (
                        <option key={`${uidKey}-${idx}`} value={uidKey} className="bg-slate-900 text-white">
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
                  <label className="block text-gray-300 font-bold mb-1.5">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">
                    Meeting Time *
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* 3. Meeting Mode Dropdown */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">
                  Meeting Mode *
                </label>
                <select
                  value={meetingMode}
                  onChange={(e) => setMeetingMode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
                >
                  <option value="Campus Visit" className="bg-slate-900 text-white">Campus Visit</option>
                  <option value="Phone Call" className="bg-slate-900 text-white">Phone Call</option>
                  <option value="Virtual" className="bg-slate-900 text-white">Virtual</option>
                </select>
              </div>

              {/* 4. Primary Reason Dropdown */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">
                  Primary Reason *
                </label>
                <select
                  value={primaryReason}
                  onChange={(e) => setPrimaryReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all"
                >
                  <option value="Low Attendance" className="bg-slate-900 text-white">Low Attendance</option>
                  <option value="Poor Academic Performance" className="bg-slate-900 text-white">Poor Academic Performance</option>
                  <option value="Disciplinary Issue" className="bg-slate-900 text-white">Disciplinary Issue</option>
                  <option value="Routine Update" className="bg-slate-900 text-white">Routine Update</option>
                </select>
              </div>

              {/* 5. Additional Notes Textarea */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter agenda points or notes for parent discussion..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none resize-none leading-relaxed focus:bg-white/10 focus:ring-1 focus:ring-blue-400 transition-all placeholder-gray-400"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg border border-purple-400/30 flex items-center gap-2 disabled:opacity-50 transition-all"
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
