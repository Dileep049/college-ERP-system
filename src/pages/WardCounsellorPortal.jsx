import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import {
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const WardCounsellorPortal = ({ subPage }) => {
  const { user } = useAuth();

  if (subPage === 'parent-meetings') return <ParentMeetingsManager counsellor={user} />;
  if (subPage === 'wards') return <WardsDirectory counsellor={user} />;
  if (subPage === 'leaves') return <CounsellorLeaves counsellor={user} />;
  return <CounsellorDashboard counsellor={user} />;
};

// 1. COUNSELLOR DASHBOARD & LOGS
const CounsellorDashboard = ({ counsellor }) => {
  const [wards, setWards] = useState([]);
  const [logs, setLogs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // Log Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCounsellorData = async () => {
    try {
      setLoading(true);
      // Fetch users to filter students of this counsellor's department
      const users = await mockDB.getAllUsers();
      const branchStudents = users.filter(u => u.role === 'student' && u.department === counsellor.department);
      setWards(branchStudents);

      // Fetch counselling meetings
      const allMeetings = await mockDB.getCounsellingMeetings('counsellor', counsellor.uid);
      setMeetings(allMeetings);

      // Fetch counselling logs for the first student or all students of branch
      const logsList = [];
      for (let student of branchStudents) {
        const studentLogs = await mockDB.getCounsellingLogs(student.uid);
        logsList.push(...studentLogs);
      }
      setLogs(logsList.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounsellorData();
  }, [counsellor]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !topic || !notes) return;

    try {
      setSubmitting(true);
      const student = wards.find(w => w.uid === selectedStudentId);
      await mockDB.addCounsellingLog(
        selectedStudentId,
        student ? student.fullName : 'Student',
        counsellor.uid,
        counsellor.fullName,
        topic,
        notes,
        actionItems
      );
      showToast('Counselling session logged successfully!', 'success');
      
      // Reset form
      setTopic('');
      setNotes('');
      setActionItems('');
      setSelectedStudentId('');
      loadCounsellorData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMeetingRespond = async (meetId, action) => {
    try {
      await mockDB.respondToMeetingRequest(meetId, action);
      showToast(`Meeting invitation marked as ${action}!`, 'info');
      loadCounsellorData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">{counsellor.department} Branch Ward Counselling</h2>
          <p className="text-sm text-sky-100 mt-1">Counsellor: {counsellor.fullName} • Academic Guidance Portal</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <UserCheck size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Counselling Session Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Log Counselling Session</h3>
          <form onSubmit={handleAddLog} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Branch Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
                <option value="" disabled>Choose ward</option>
                {wards.map(w => (
                  <option key={w.uid} value={w.uid}>{w.fullName} ({w.rollNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Session Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Performance Review / Stress Check"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Counselling notes</label>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe discussions, observations..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Action items</label>
              <textarea
                rows="2"
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="Next steps for the student..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-650 hover:bg-sky-755 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>{submitting ? 'Submitting...' : 'Register Session Log'}</span>
            </button>
          </form>
        </div>

        {/* Meeting requests and Session logs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Meeting Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Student Meeting Requests</span>
              <button onClick={loadCounsellorData} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
            </div>

            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading requests...</div>
            ) : meetings.filter(m => m.status === 'pending').length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-450">No pending meeting requests from student wards.</div>
            ) : (
              <div className="space-y-3">
                {meetings.filter(m => m.status === 'pending').map(meet => (
                  <div key={meet.meetingId} className="p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{meet.title}</h4>
                      <p className="text-[10px] text-slate-450 font-bold mt-1">From: {meet.studentName} ({meet.date} @ {meet.time})</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMeetingRespond(meet.meetingId, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9.5px] font-black"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleMeetingRespond(meet.meetingId, 'rejected')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9.5px] font-black"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session history */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Counselling Session Logs History</span>
            
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-slate-450">No sessions recorded yet in this academic cycle.</div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.logId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">{log.studentName}</h4>
                        <p className="text-[10px] text-sky-600 dark:text-sky-400 font-bold mt-0.5">{log.topic}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{log.date}</span>
                    </div>
                    <p className="text-slate-650 dark:text-slate-350 text-[11px] font-medium leading-relaxed">{log.notes}</p>
                    {log.actionItems && (
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-200/50 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Action Items</span>
                        <p className="text-slate-550 dark:text-slate-400 text-[10.5px] mt-1 whitespace-pre-line">{log.actionItems}</p>
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

// 2. PARENT MEETING LOGS
const ParentMeetingsManager = ({ counsellor }) => {
  const [wards, setWards] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // Form states
  const [studentId, setStudentId] = useState('');
  const [parentName, setParentName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const users = await mockDB.getAllUsers();
      const branchStudents = users.filter(u => u.role === 'student' && u.department === counsellor.department);
      setWards(branchStudents);

      const records = await mockDB.getParentMeetings(counsellor.uid);
      setMeetings(records.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [counsellor]);

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    if (!studentId || !parentName || !notes) return;

    try {
      setSubmitting(true);
      const student = wards.find(w => w.uid === studentId);
      await mockDB.addParentMeeting(
        counsellor.uid,
        studentId,
        student ? student.fullName : 'Student',
        parentName,
        notes
      );
      showToast('Parent-Teacher conference log recorded!', 'success');
      
      setParentName('');
      setNotes('');
      setStudentId('');
      loadMeetings();
    } catch (_) {
      showToast('Could not register meeting log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Parent-Teacher Conference Ledger</h2>
          <p className="text-sm text-indigo-100 mt-1">Audit parent interaction logs, branch grievances and home feedbacks</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Calendar size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Log Meeting Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Log Parent Interaction</h3>
          <form onSubmit={handleAddMeeting} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              >
                <option value="" disabled>Choose student</option>
                {wards.map(w => (
                  <option key={w.uid} value={w.uid}>{w.fullName} ({w.rollNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Parent/Guardian Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g., Richard Parker"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Conference Discussion notes</label>
              <textarea
                rows="5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Outline discussion points, complaints, resolutions..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>{submitting ? 'Submitting...' : 'Register Meeting'}</span>
            </button>
          </form>
        </div>

        {/* Meeting ledger */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PTA Conference History</span>
            <button onClick={loadMeetings} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse">Loading PTA history...</div>
          ) : meetings.length === 0 ? (
            <div className="py-20 text-center text-slate-450">No parent interaction logs found.</div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {meetings.map(item => (
                <div key={item.meetingId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">Ward: {item.studentName}</h4>
                      <p className="text-[10px] text-purple-650 dark:text-purple-400 font-bold mt-0.5">Parent: {item.parentName}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-350 text-[11px] font-medium leading-relaxed whitespace-pre-line">{item.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 3. WARDS DIRECTORY (ACADEMIC AUDITS)
const WardsDirectory = ({ counsellor }) => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [wardLogs, setWardLogs] = useState([]);
  const [wardMarks, setWardMarks] = useState([]);
  const [wardAttendance, setWardAttendance] = useState([]);

  const loadWards = async () => {
    try {
      setLoading(true);
      const users = await mockDB.getAllUsers();
      const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
      
      const filtered = users.filter(u => u.role === 'student' && u.department === counsellor.department).map(stud => {
        const stats = studentsList.find(s => s.studentId === stud.uid) || { cgpa: 8.0, attendancePercentage: 100 };
        return {
          ...stud,
          cgpa: stats.cgpa,
          attendance: stats.attendancePercentage
        };
      });

      setWards(filtered);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  const handleSelectWard = async (student) => {
    setSelectedWardId(student.uid);
    try {
      const logs = await mockDB.getCounsellingLogs(student.uid);
      setWardLogs(logs);

      const marks = await mockDB.getStudentMarks(student.uid);
      setWardMarks(marks);

      const att = await mockDB.getAttendanceForStudent(student.uid);
      setWardAttendance(att.slice(0, 10)); // check latest 10 attendance events
    } catch (_) {}
  };

  useEffect(() => {
    loadWards();
  }, [counsellor]);

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500 to-emerald-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Branch Students (Wards) Academic Ledger</h2>
          <p className="text-sm text-indigo-100 mt-1">Audit attendance logs, midterm percentages, and counselling reports</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Users size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Wards list */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Assigned Students</span>
          {loading ? (
            <div className="py-10 text-center animate-pulse">Loading wards list...</div>
          ) : wards.length === 0 ? (
            <div className="py-10 text-center text-slate-450">No students registered in this branch.</div>
          ) : (
            <div className="space-y-2">
              {wards.map(student => (
                <div
                  key={student.uid}
                  onClick={() => handleSelectWard(student)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWardId === student.uid
                      ? 'bg-blue-650/5 border-blue-500 dark:bg-blue-950/20'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{student.fullName}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Roll: {student.rollNumber} • Sem: {student.semester}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">{student.cgpa} CGPA</span>
                    <span className={`text-[10px] font-bold ${student.attendance >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{student.attendance}% Att.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected ward details */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start min-h-[400px]">
          {!selectedWardId ? (
            <div className="flex flex-col items-center justify-center py-32 text-center text-slate-450 dark:text-slate-500 gap-3">
              <Activity size={40} className="stroke-1 text-slate-300 animate-pulse" />
              <p>Select a student ward from the directory to review their detailed performance file.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header profile details */}
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h3 className="text-sm font-black text-slate-850 dark:text-white">Ward Academic Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1">Detailed midterm progress and notes logs</p>
              </div>

              {/* Attendance and internal marks card summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Midterm Marks */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Subject Performance (Internal Marks)</span>
                  {wardMarks.length === 0 ? (
                    <p className="text-[10.5px] text-slate-450 py-2">No midterm assessment marks logged.</p>
                  ) : (
                    <div className="space-y-2">
                      {wardMarks.map(mark => (
                        <div key={mark.markId} className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[120px]">{mark.subject}</span>
                          <span className="text-blue-600 font-black">{mark.total} / 50</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Latest Attendance Roll */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Latest Lectures Attendance</span>
                  {wardAttendance.length === 0 ? (
                    <p className="text-[10.5px] text-slate-450 py-2">No class roll marked for student.</p>
                  ) : (
                    <div className="grid grid-cols-5 gap-1.5">
                      {wardAttendance.map(att => (
                        <div
                          key={att.attendanceId}
                          title={`${att.date}: ${att.status}`}
                          className={`h-6 rounded flex items-center justify-center text-[9px] font-black text-white ${
                            att.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        >
                          {att.status === 'present' ? 'P' : 'A'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Counselling notes specific to ward */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Counselling Session Notes ({wardLogs.length})</span>
                {wardLogs.length === 0 ? (
                  <p className="text-[10.5px] text-slate-450">No previous counseling reviews logged for this student.</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {wardLogs.map(wl => (
                      <div key={wl.logId} className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 mb-1">
                          <span className="text-sky-600">{wl.topic}</span>
                          <span>{wl.date}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">{wl.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 4. LEAVE REQUESTS APPROVALS
const CounsellorLeaves = ({ counsellor }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksState, setRemarksState] = useState({}); // Mapping of leaveId -> remarks string
  const [actioningId, setActioningId] = useState(null);
  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getLeaves('counsellor', counsellor.uid);
      setLeaves(data);
    } catch (_) {
      showToast('Could not load leave requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [counsellor]);

  const handleAction = async (leaveId, action) => {
    try {
      setActioningId(leaveId);
      const remarks = remarksState[leaveId] || '';
      await mockDB.reviewLeave(leaveId, action, remarks);
      showToast(`Leave application marked as ${action}!`, 'success');
      loadLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActioningId(null);
    }
  };

  const pending = leaves.filter(l => l.status === 'pending');
  const history = leaves.filter(l => l.status !== 'pending');

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Student Absence Approvals Portal</h2>
          <p className="text-sm text-teal-100 mt-1">Review leave applications from student wards in department: {counsellor.department}</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Calendar size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Pending Requests */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Leave Applications ({pending.length})</span>
            <button onClick={loadLeaves} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse">Loading leave requests...</div>
          ) : pending.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-450">
              No pending leave requests from student wards.
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(l => (
                <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{l.studentName}</h4>
                      <p className="text-[10px] text-slate-455 mt-0.5">Roll: {l.rollNumber} • Semester: {l.semester}</p>
                    </div>
                    <span className="text-[9.5px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-black uppercase">Pending</span>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Absence Reason</span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{l.reason}</p>
                    <span className="text-[9.5px] text-rose-500 block mt-2 font-bold">Duration: {l.startDate} to {l.endDate}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-450 uppercase mb-1">Counsellor Remarks</label>
                      <input
                        type="text"
                        placeholder="Add feedback/remarks here..."
                        value={remarksState[l.leaveId] || ''}
                        onChange={(e) => setRemarksState({ ...remarksState, [l.leaveId]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(l.leaveId, 'approved')}
                        disabled={actioningId === l.leaveId}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                      >
                        Approve Leave
                      </button>
                      <button
                        onClick={() => handleAction(l.leaveId, 'rejected')}
                        disabled={actioningId === l.leaveId}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow"
                      >
                        Reject Leave
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Log */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Leave Ledger History</span>
          
          {loading ? (
            <div className="py-20 text-center animate-pulse">Loading list...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-455">No absence logs in history ledger.</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {history.map(l => (
                <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-205 text-xs">{l.studentName}</h4>
                      <span className="text-[9px] text-slate-450">{l.startDate} to {l.endDate}</span>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-505'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal"><span className="font-bold text-slate-700 dark:text-slate-350">Reason:</span> {l.reason}</p>
                  {l.remarks && (
                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
                      <span className="font-extrabold text-slate-750 dark:text-slate-300">Remarks:</span> {l.remarks}
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
