import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Filter, Calendar, Users, 
  BookOpen, Building, CheckCircle, AlertTriangle, Search, RefreshCw, BarChart2
} from 'lucide-react';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS } from '../services/firebase';

export const ReportsModule = ({ userRole = 'admin', currentUser = null }) => {
  const [reportType, setReportType] = useState('daily'); // daily | weekly | monthly | semester | department | student | faculty | ward
  const [department, setDepartment] = useState('AI & ML');
  const [semester, setSemester] = useState('Semester 2');
  const [section, setSection] = useState('EM');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchRoll, setSearchRoll] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    avgPercentage: 100
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      const allAttendance = await mockDB.getAttendanceByFilter(department, semester, null, section);
      const allStudents = await mockDB.getStudentsByBranchAndSemester(department, semester, section);

      let filteredSessions = allAttendance.filter(a => {
        if (!a.date) return false;
        if (reportType === 'daily') return a.date === startDate;
        if (reportType === 'weekly' || reportType === 'monthly') {
          return a.date >= startDate && a.date <= endDate;
        }
        return true;
      });

      // Map rows for preview table
      let rows = [];
      let totPresent = 0;
      let totAbsent = 0;
      let totLeave = 0;
      let totClasses = filteredSessions.length;

      if (reportType === 'student') {
        // Student-specific breakdown
        const targetStudents = searchRoll 
          ? allStudents.filter(s => s.rollNumber?.toLowerCase().includes(searchRoll.toLowerCase()) || s.studentName?.toLowerCase().includes(searchRoll.toLowerCase()))
          : allStudents;

        rows = targetStudents.map(st => {
          let stPresent = 0;
          let stAbsent = 0;
          let stLeave = 0;
          let stTotal = 0;

          filteredSessions.forEach(sess => {
            const match = sess.students?.find(item => item.rollNumber === st.rollNumber);
            if (match) {
              stTotal += 1;
              const s = (match.status || '').toLowerCase();
              if (s === 'present' || s === 'late') stPresent += 1;
              else if (s === 'absent') stAbsent += 1;
              else if (s.includes('leave')) stLeave += 1;
            }
          });

          totPresent += stPresent;
          totAbsent += stAbsent;
          totLeave += stLeave;

          const pct = stTotal > 0 ? Math.round((stPresent / stTotal) * 100) : 100;
          return {
            id: st.rollNumber,
            rollNumber: st.rollNumber,
            studentName: st.studentName || st.fullName,
            department: st.department || department,
            semester: st.semester || semester,
            section: st.section || section,
            totalClasses: stTotal,
            presentCount: stPresent,
            absentCount: stAbsent,
            leaveCount: stLeave,
            percentage: pct,
            status: pct < 75 ? 'Defaulter' : 'Regular'
          };
        });
      } else {
        // Session / Batch wise rows
        rows = filteredSessions.map((sess, idx) => {
          const stList = sess.students || [];
          const pres = stList.filter(s => (s.status || '').toLowerCase() === 'present' || (s.status || '').toLowerCase() === 'late').length;
          const abs = stList.filter(s => (s.status || '').toLowerCase() === 'absent').length;
          const lea = stList.filter(s => (s.status || '').toLowerCase().includes('leave')).length;
          const tot = stList.length;
          const pct = tot > 0 ? Math.round((pres / tot) * 100) : 100;

          totPresent += pres;
          totAbsent += abs;
          totLeave += lea;

          return {
            id: sess.attendanceId || idx,
            date: sess.date,
            department: sess.department || department,
            semester: sess.semester || semester,
            section: sess.section || section,
            subject: sess.subject || 'N/A',
            period: sess.period || '1',
            facultyName: sess.facultyName || 'Faculty',
            totalStudents: tot,
            presentCount: pres,
            absentCount: abs,
            leaveCount: lea,
            percentage: pct
          };
        });
      }

      setReportData(rows);

      const combinedTotal = totPresent + totAbsent + totLeave;
      const avgPct = combinedTotal > 0 ? Math.round((totPresent / combinedTotal) * 100) : 100;
      setSummaryStats({
        totalClasses: totClasses,
        totalStudents: allStudents.length,
        presentCount: totPresent,
        absentCount: totAbsent,
        leaveCount: totLeave,
        avgPercentage: avgPct
      });

    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, department, semester, section, startDate, endDate]);

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === 'student') {
      csvContent += "Roll Number,Student Name,Department,Semester,Section,Total Classes,Present,Absent,Leave,Attendance %\n";
      reportData.forEach(row => {
        csvContent += `"${row.rollNumber}","${row.studentName}","${row.department}","${row.semester}","${row.section}",${row.totalClasses},${row.presentCount},${row.absentCount},${row.leaveCount},${row.percentage}%\n`;
      });
    } else {
      csvContent += "Date,Department,Semester,Section,Subject,Period,Faculty Name,Total Students,Present,Absent,Leave,Attendance %\n";
      reportData.forEach(row => {
        csvContent += `"${row.date}","${row.department}","${row.semester}","${row.section}","${row.subject}","Period ${row.period}","${row.facultyName}",${row.totalStudents},${row.presentCount},${row.absentCount},${row.leaveCount},${row.percentage}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KBN_College_${reportType.toUpperCase()}_Report_${startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex items-center justify-between border border-white/10" style={{ boxShadow: 'var(--shadow-3d-card), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
        <div>
          <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-[10px] uppercase font-black tracking-wider border border-white/20 block w-fit mb-2">
            Central Reporting Center
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight text-white">Academic & Attendance Analytics Reports</h2>
          <p className="text-xs text-blue-100 mt-1">Generate, audit, print, and export official daily, weekly, monthly, and departmental compliance reports</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 shrink-0 hidden sm:flex">
          <FileText size={28} />
        </div>
      </div>

      {/* Top Filter and Controls 3D Card */}
      <div className="card-3d p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black font-display text-[var(--text-primary)]">Institutional Reports Center</h2>
              <p className="text-xs text-[var(--text-muted)]">Generate, preview and export official college academic attendance logs</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'semester', label: 'Semester' },
              { id: 'department', label: 'Department' },
              { id: 'student', label: 'Student' },
              { id: 'faculty', label: 'Faculty' },
              { id: 'ward', label: 'Ward Counsellor' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`btn-3d py-1.5 px-3 text-xs ${
                  reportType === tab.id
                    ? 'btn-3d-primary'
                    : 'btn-3d-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadReport}
              className="btn-3d btn-3d-secondary p-2.5"
              title="Refresh Report Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-3d btn-3d-success py-2 px-3.5 text-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-3d btn-3d-primary py-2 px-3.5 text-xs"
            >
              <Printer size={14} />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] uppercase font-black mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select-3d"
            >
              {KBN_BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] uppercase font-black mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="select-3d"
            >
              {KBN_SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] uppercase font-black mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="select-3d"
            >
              <option value="EM">English Medium (EM)</option>
              <option value="TM">Telugu Medium (TM)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] uppercase font-black mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-3d"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] uppercase font-black mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-3d"
            />
          </div>
        </div>

        {reportType === 'student' && (
          <div className="pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Search report by Roll Number (e.g. 245901) or Student Name..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="input-3d pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3D Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-3d">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Classes Conducted</span>
          <span className="text-2xl font-black text-[var(--text-primary)] mt-1 block">{summaryStats.totalClasses}</span>
        </div>
        <div className="stat-card-3d">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Present Marks</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{summaryStats.presentCount}</span>
        </div>
        <div className="stat-card-3d">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Absents Recorded</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{summaryStats.absentCount}</span>
        </div>
        <div className="stat-card-3d">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Average Attendance</span>
          <span className={`text-2xl font-black mt-1 block ${summaryStats.avgPercentage >= 75 ? 'text-[var(--accent)]' : 'text-amber-500'}`}>
            {summaryStats.avgPercentage}%
          </span>
        </div>
      </div>

      {/* Report Data 3D Table Preview */}
      <div className="card-3d p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h3 className="font-extrabold text-[var(--text-primary)] text-sm uppercase tracking-wider">
            {reportType.toUpperCase()} ATTENDANCE REPORT PREVIEW ({reportData.length} RECORDS)
          </h3>
          <span className="text-[10px] text-[var(--text-muted)] font-bold">
            Department: {department} • {semester} ({section})
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-[var(--text-muted)] font-bold">Generating report dataset...</div>
        ) : reportData.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-muted)] font-medium">No attendance data matched the selected filter criteria.</div>
        ) : (
          <div className="table-3d-container">
            <table className="table-3d">
              <thead>
                <tr>
                  {reportType === 'student' ? (
                    <>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Dept & Sem</th>
                      <th className="text-center">Total Lecs</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Leave</th>
                      <th className="text-center">Attendance %</th>
                      <th className="text-center">Status</th>
                    </>
                  ) : (
                    <>
                      <th>Date</th>
                      <th>Subject</th>
                      <th className="text-center">Period</th>
                      <th>Faculty</th>
                      <th className="text-center">Students</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Leave</th>
                      <th className="text-center">Attendance %</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={row.id || idx}>
                    {reportType === 'student' ? (
                      <>
                        <td className="font-mono">{row.rollNumber}</td>
                        <td className="font-bold text-[var(--text-primary)]">{row.studentName}</td>
                        <td className="text-[var(--text-muted)] font-normal">{row.department} • {row.semester}</td>
                        <td className="text-center font-mono">{row.totalClasses}</td>
                        <td className="text-center text-emerald-600 dark:text-emerald-400 font-mono">{row.presentCount}</td>
                        <td className="text-center text-rose-600 dark:text-rose-400 font-mono">{row.absentCount}</td>
                        <td className="text-center text-amber-600 dark:text-amber-400 font-mono">{row.leaveCount}</td>
                        <td className="text-center font-bold">
                          <span className={`badge-3d ${
                            row.percentage >= 75 ? 'badge-3d-success' : 'badge-3d-danger'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge-3d ${
                            row.status === 'Defaulter' ? 'badge-3d-danger' : 'badge-3d-success'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-mono">{row.date}</td>
                        <td className="font-bold text-[var(--text-primary)]">{row.subject}</td>
                        <td className="text-center font-mono">P{row.period}</td>
                        <td className="text-[var(--text-muted)]">{row.facultyName}</td>
                        <td className="text-center font-mono">{row.totalStudents}</td>
                        <td className="text-center text-emerald-600 dark:text-emerald-400 font-mono">{row.presentCount}</td>
                        <td className="text-center text-rose-600 dark:text-rose-400 font-mono">{row.absentCount}</td>
                        <td className="text-center text-amber-600 dark:text-amber-400 font-mono">{row.leaveCount}</td>
                        <td className="text-center font-bold">
                          <span className={`badge-3d ${
                            row.percentage >= 75 ? 'badge-3d-success' : 'badge-3d-danger'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                      </>
                    )}
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
export default ReportsModule;
