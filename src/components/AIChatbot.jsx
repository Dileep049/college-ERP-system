import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, CheckCircle2, AlertTriangle, Briefcase, Calendar, Award, UserX, Clock, ClipboardList } from 'lucide-react';
import { mockDB } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const AIChatbot = ({ user }) => {
  const { showToast } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Initialize welcome messages and quick suggestions on load/user change
  useEffect(() => {
    if (!user) return;
    setMessages([
      { 
        id: 'welcome', 
        sender: 'bot', 
        text: `Hello ${user.fullName}! I am your Academia Advanced AI Copilot. How can I help you manage your college dashboard today?`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!user) return null;

  // Define dynamic suggestions by user role
  const getSuggestions = () => {
    switch (user.role) {
      case 'student':
        return [
          { label: '📊 Attendance Rate', query: 'what is my attendance?' },
          { label: '💼 Job Opportunities', query: 'are there any placement drives?' },
          { label: '📅 Today\'s Timetable', query: 'show today\'s timetable' },
          { label: '📝 Final Exam Grades', query: 'show my results' }
        ];
      case 'faculty':
        return [
          { label: '📅 Class Timetable', query: 'show my timetable' },
          { label: '🏖️ My Leaves Status', query: 'what is my leave status?' },
          { label: '📂 Shared notes', query: 'show uploaded notes' }
        ];
      case 'hod':
        return [
          { label: '🚨 Absent Staff Today', query: 'who is absent today?' },
          { label: '📊 Department Stats', query: 'show department status' },
          { label: '🏖️ Staff Leave Requests', query: 'faculty leave applications' }
        ];
      case 'principal':
        return [
          { label: '🏫 Global Campus Stats', query: 'global statistics summary' },
          { label: '📊 Attendance Comparison', query: 'branch comparison' },
          { label: '💼 Placement Ratio', query: 'placement stats' }
        ];
      default:
        return [
          { label: '📁 Database Stats', query: 'show database summary' },
          { label: '❓ How to reset DB', query: 'how to reset database' }
        ];
    }
  };

  const handleSuggestionClick = (query) => {
    handleProcessMessage(query);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleProcessMessage(input.trim());
    setInput('');
  };

  const handleProcessMessage = (userText) => {
    const userMsg = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const response = generateAdvancedReply(userText, user);
      const botMsg = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: response.text,
        widget: response.widget || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  // Click handler inside the Chatbot rich widgets
  const handleApplyJobFromChat = async (driveId, companyName) => {
    try {
      await mockDB.applyForDrive(driveId, user.uid);
      showToast(`Successfully registered for ${companyName} via AI Chatbot!`, 'success');
      
      // Update chat message thread showing success
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: `Application submitted successfully for ${companyName}! You can view registration status under "Placements" tab.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const generateAdvancedReply = (text, user) => {
    const query = text.toLowerCase();
    const role = user.role;

    // --- STUDENT INTENTS ---
    if (role === 'student') {
      // 1. Attendance Query
      if (query.includes('attendance') || query.includes('present') || query.includes('absent')) {
        const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
        const profile = studentsList.find(s => s.studentId === user.uid) || {
          attendancePercentage: 90, totalClasses: 20, attendedClasses: 18
        };
        const attendancePercent = profile.attendancePercentage;
        const eligible = attendancePercent >= 75;

        return {
          text: `Here is your real-time attendance breakdown. ${
            eligible 
              ? 'Keep it up, you are safely above the 75% examination eligibility mark!' 
              : 'Warning: Your attendance is below 75%. You need to attend upcoming classes to avoid being debarred.'
          }`,
          widget: {
            type: 'attendance',
            data: {
              percentage: attendancePercent,
              attended: profile.attendedClasses,
              total: profile.totalClasses,
              eligible
            }
          }
        };
      }

      // 2. Placements Query
      if (query.includes('placement') || query.includes('job') || query.includes('drive') || query.includes('opportunity')) {
        const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');
        const upcoming = drives.filter(d => d.status === 'upcoming');
        if (upcoming.length === 0) {
          return { text: 'There are no active upcoming placement drives scheduled right now.' };
        }
        return {
          text: `I found ${upcoming.length} upcoming recruitment campaigns. You can apply directly using the buttons below:`,
          widget: {
            type: 'placements',
            data: upcoming.map(d => ({
              driveId: d.driveId,
              companyName: d.companyName,
              role: d.role,
              salaryPackage: d.salaryPackage,
              eligibility: d.eligibility,
              driveDate: d.driveDate,
              applied: d.applicants.includes(user.uid)
            }))
          }
        };
      }

      // 3. Timetable Query
      if (query.includes('timetable') || query.includes('schedule') || query.includes('class')) {
        const timetables = JSON.parse(localStorage.getItem('acad_timetables') || '[]');
        const myTimetable = timetables.find(t => t.branch === user.department && t.semester === user.semester && t.day === 'Monday');
        if (!myTimetable) {
          return { text: `No timetable slots are configured for ${user.department} Semester ${user.semester} today.` };
        }
        return {
          text: `Here is your timetable schedule for Monday in ${user.department} Semester ${user.semester}:`,
          widget: {
            type: 'timetable',
            data: myTimetable.schedule
          }
        };
      }

      // 4. Results / Grades Query
      if (query.includes('result') || query.includes('grade') || query.includes('gpa') || query.includes('mark')) {
        const results = JSON.parse(localStorage.getItem('acad_results') || '[]');
        const myResults = results.find(r => r.studentId === user.uid);
        if (!myResults) {
          return { text: 'Your final semester exam results have not been published yet.' };
        }
        return {
          text: `Your current Semester ${myResults.semester} GPA is **${myResults.gpa}**. Here is your grade card:`,
          widget: {
            type: 'results',
            data: {
              gpa: myResults.gpa,
              semester: myResults.semester,
              marks: myResults.marks
            }
          }
        };
      }
    }

    // --- FACULTY INTENTS ---
    if (role === 'faculty') {
      if (query.includes('leave')) {
        const fLeaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
        const myLeaves = fLeaves.filter(l => l.facultyId === user.uid);
        if (myLeaves.length === 0) {
          return { text: 'You have not submitted any leave applications.' };
        }
        const recent = myLeaves[0];
        return {
          text: `You have submitted ${myLeaves.length} leave application(s). Your last application detail:\n\n` +
                `• **Reason**: "${recent.reason}"\n` +
                `• **Dates**: ${recent.startDate} to ${recent.endDate}\n` +
                `• **Current Status**: **${recent.status.toUpperCase().replace('_', ' ')}** (HOD: ${recent.hodStatus}, Principal: ${recent.principalStatus})`
        };
      }

      if (query.includes('timetable') || query.includes('schedule') || query.includes('class')) {
        const timetables = JSON.parse(localStorage.getItem('acad_timetables') || '[]');
        const mySchedule = [];
        timetables.forEach(t => {
          t.schedule.forEach(slot => {
            if (slot.faculty === user.fullName) {
              mySchedule.push({ day: t.day, branch: t.branch, semester: t.semester, ...slot });
            }
          });
        });
        if (mySchedule.length === 0) {
          return { text: 'No teaching lecture hours are registered under your name.' };
        }
        return {
          text: `I compiled your lecture teaching slots for this week:`,
          widget: {
            type: 'timetable_faculty',
            data: mySchedule
          }
        };
      }

      if (query.includes('note') || query.includes('upload')) {
        const notes = JSON.parse(localStorage.getItem('acad_notes') || '[]');
        const myNotes = notes.filter(n => n.facultyId === user.uid);
        return { text: `You have uploaded **${myNotes.length}** lecture notes files/links for your department.` };
      }
    }

    // --- HOD INTENTS ---
    if (role === 'hod') {
      if (query.includes('absent') || query.includes('leave') || query.includes('staff')) {
        const todayDate = '2026-06-07';
        const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
        const absentStuds = attendance.filter(a => a.branch === user.department && a.date === todayDate && a.status === 'absent');
        const fLeaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
        const absentFaculty = fLeaves.filter(l => l.department === user.department && l.status === 'approved' && todayDate >= l.startDate && todayDate <= l.endDate);

        return {
          text: `Here is the absenteeism standing for **today (${todayDate})** in the **${user.department}** department:`,
          widget: {
            type: 'hod_absentees',
            data: {
              students: absentStuds.map(s => ({ name: s.studentName, rollNumber: s.rollNumber })),
              faculty: absentFaculty.map(f => ({ name: f.facultyName, reason: f.reason }))
            }
          }
        };
      }

      if (query.includes('stat') || query.includes('department') || query.includes('summary')) {
        const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        const students = users.filter(u => u.role === 'student' && u.department === user.department);
        const faculty = users.filter(u => u.role === 'faculty' && u.department === user.department);
        return {
          text: `**${user.department} Department Summary**:\n` +
                `• **Registered Students**: ${students.length}\n` +
                `• **Assigned Faculty**: ${faculty.length}\n` +
                `• **HOD**: ${user.fullName}\n\nYou can review full compliance reports in the "Academic Reports" tab.`
        };
      }
    }

    // --- PRINCIPAL INTENTS ---
    if (role === 'principal') {
      if (query.includes('global') || query.includes('summary') || query.includes('campus')) {
        const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        const studentsCount = users.filter(u => u.role === 'student').length;
        const facultyCount = users.filter(u => u.role === 'faculty').length;
        const hodCount = users.filter(u => u.role === 'hod').length;
        return {
          text: `**Academia Global Roster Summary**:\n` +
                `• Total Students: **${studentsCount}**\n` +
                `• Total Faculty: **${facultyCount}**\n` +
                `• Total HODs: **${hodCount}**\n` +
                `• Active campuses: 1 (Main campus)\n\nYou can access detailed charts in the "Branch Analytics" tab.`
        };
      }
      if (query.includes('comparison') || query.includes('branch')) {
        return {
          text: 'To audit branch standing, please select **"1. Branch Wise Student Attendance"** or **"6. Department Comparison"** from the selector dropdown inside the **Branch Analytics** tab.'
        };
      }
      if (query.includes('placement')) {
        const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');
        return {
          text: `There are **${drives.length}** recruitment drives listed. Google and Microsoft have completed drives, and Meta is upcoming. Select **"9. Placement Performance Stats"** in Branch Analytics for comparative charts.`
        };
      }
    }

    // --- FAQ FALLBACKS ---
    if (query.includes('principal')) {
      return { text: 'The Principal of Academia is Dr. Arthur Pendelton. His office can be reached at principal@academia.edu.' };
    }
    if (query.includes('reset') && role === 'admin') {
      return { text: 'You can perform a full database reset to restore pre-seeded accounts by clicking the "Hard Reset Database" button in the Admin Panel.' };
    }

    return {
      text: `Thanks for asking about "${text}". I can fetch real-time stats directly from the database for you. Try clicking one of the quick options below:`
    };
  };

  return (
    <>
      {/* Floating 3D Action button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center border border-white/20"
        style={{
          boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.45), 0 6px 12px -3px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
        title="Ask Academia AI Assistant"
      >
        {isOpen ? <X size={22} /> : <Bot size={22} className="animate-pulse" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {/* 3D Chat window */}
      {isOpen && (
        <div 
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[480px] sm:h-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-3xl z-50 flex flex-col overflow-hidden animate-slide-up"
          style={{
            boxShadow: 'var(--shadow-3d-card), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between border-b border-white/10" style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight flex items-center gap-1 font-display">
                  <span>Academia Assistant</span>
                  <Sparkles size={12} className="text-amber-300 fill-amber-300" />
                </h4>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Advanced AI Copilot</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl hover:bg-white/15 text-white/90 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--bg-primary)]">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${!isBot ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-xl shrink-0 ${isBot ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'}`}>
                    {isBot ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="max-w-[80%] space-y-1.5">
                    <div className={`rounded-2xl p-3 text-xs font-semibold leading-relaxed whitespace-pre-line ${
                      isBot 
                        ? 'bg-[var(--surface)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border)] shadow-sm' 
                        : 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    }`}>
                      <p>{msg.text}</p>
                      
                      {/* --- WIDGETS RENDER --- */}
                      {isBot && msg.widget && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
                          
                          {/* 1. Attendance widget */}
                          {msg.widget.type === 'attendance' && (
                            <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-primary)]">
                              <div className="flex justify-between items-center mb-2">
                                <span>Attendance Rate</span>
                                <span className={msg.widget.data.eligible ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'}>
                                  {msg.widget.data.percentage}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                                <div className={`h-full rounded-full ${msg.widget.data.eligible ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${msg.widget.data.percentage}%` }}></div>
                              </div>
                              <p className="text-[9.5px] text-[var(--text-muted)] font-medium">
                                Attended: {msg.widget.data.attended} / {msg.widget.data.total} lectures.
                              </p>
                            </div>
                          )}

                          {/* 2. Placements widget */}
                          {msg.widget.type === 'placements' && (
                            <div className="space-y-2">
                              {msg.widget.data.map(d => (
                                <div key={d.driveId} className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[10px]">
                                  <div className="flex justify-between font-black text-[var(--text-primary)]">
                                    <span>{d.companyName}</span>
                                    <span className="text-[var(--accent)]">{d.salaryPackage}</span>
                                  </div>
                                  <p className="text-[var(--text-secondary)] font-bold mt-1">{d.role}</p>
                                  <p className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Eligibility: {d.eligibility}</p>
                                  
                                  <div className="mt-2.5 flex items-center justify-between">
                                    <span className="text-[9px] text-[var(--text-muted)]">{d.driveDate}</span>
                                    {d.applied ? (
                                      <span className="badge-3d badge-3d-success text-[9px]">✓ Registered</span>
                                    ) : (
                                      <button
                                        onClick={() => handleApplyJobFromChat(d.driveId, d.companyName)}
                                        className="btn-3d btn-3d-primary py-1 px-2.5 text-[9px]"
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Timetable widget */}
                          {msg.widget.type === 'timetable' && (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {msg.widget.data.map((slot, idx) => (
                                <div key={idx} className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px] flex justify-between items-center">
                                  <div>
                                    <p className="font-extrabold text-[var(--text-primary)]">{slot.subject}</p>
                                    <span className="text-[9px] text-[var(--text-muted)]">{slot.room} • {slot.faculty}</span>
                                  </div>
                                  <span className="text-[9.5px] text-[var(--accent)] font-bold shrink-0">{slot.time}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 4. Results widget */}
                          {msg.widget.type === 'results' && (
                            <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px] space-y-2">
                              <p className="font-black text-[var(--text-primary)] text-center border-b pb-1 border-[var(--border-subtle)]">Semester {msg.widget.data.semester} Results (GPA: {msg.widget.data.gpa})</p>
                              {msg.widget.data.marks.map((m, idx) => (
                                <div key={idx} className="flex justify-between font-bold text-[var(--text-secondary)]">
                                  <span>{m.subject}</span>
                                  <span className="text-[var(--text-primary)] font-extrabold">Grade {m.grade}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 5. Faculty Timetable */}
                          {msg.widget.type === 'timetable_faculty' && (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {msg.widget.data.map((slot, idx) => (
                                <div key={idx} className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px] flex justify-between items-center">
                                  <div>
                                    <p className="font-extrabold text-[var(--text-primary)]">{slot.subject}</p>
                                    <span className="text-[9px] text-[var(--text-muted)]">{slot.day} • {slot.branch} (Sem {slot.semester})</span>
                                  </div>
                                  <span className="text-[9px] text-[var(--accent)] font-bold">{slot.time}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 6. HOD Absentees widget */}
                          {msg.widget.type === 'hod_absentees' && (
                            <div className="space-y-3 text-[10px]">
                              {/* Students */}
                              <div>
                                <span className="font-black text-rose-500 block uppercase text-[8px] mb-1">Absent Students ({msg.widget.data.students.length})</span>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {msg.widget.data.students.length === 0 ? (
                                    <p className="text-[var(--text-muted)]">All students present today.</p>
                                  ) : (
                                    msg.widget.data.students.map((s, idx) => (
                                      <div key={idx} className="flex justify-between font-bold text-[var(--text-secondary)] bg-[var(--surface-elevated)] p-1 rounded">
                                        <span>{s.name}</span>
                                        <span className="text-[var(--text-muted)] font-mono">{s.rollNumber}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              {/* Faculty */}
                              <div>
                                <span className="font-black text-amber-500 block uppercase text-[8px] mb-1">Absent Faculty ({msg.widget.data.faculty.length})</span>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {msg.widget.data.faculty.length === 0 ? (
                                    <p className="text-[var(--text-muted)]">All faculty members active today.</p>
                                  ) : (
                                    msg.widget.data.faculty.map((f, idx) => (
                                      <div key={idx} className="flex justify-between font-bold text-[var(--text-secondary)] bg-[var(--surface-elevated)] p-1 rounded">
                                        <span>{f.name}</span>
                                        <span className="text-[var(--text-muted)] italic truncate max-w-[50%]">{f.reason}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-[var(--text-muted)] font-bold block">
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef}></div>
          </div>

          {/* Quick Suggestions Roster */}
          <div className="px-3 py-2 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-wrap gap-1.5 shrink-0">
            {getSuggestions().map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s.query)}
                className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] text-[9.5px] font-bold text-[var(--text-secondary)] rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-xs"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Message Form input */}
          <form onSubmit={handleSubmitMessage} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface)] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Academia AI Copilot...`}
              className="input-3d flex-1 py-2 text-xs"
            />
            <button
              type="submit"
              className="btn-3d btn-3d-primary p-2.5"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
export default AIChatbot;
