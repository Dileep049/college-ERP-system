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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-[10px] uppercase font-black tracking-wider border border-white/20 block w-fit mb-2">
            Central Reporting Center
          </span>
          <h2 className="text-2xl font-extrabold font-display">Academic & Attendance Analytics Reports</h2>
          <p className="text-xs text-blue-100 mt-1">Generate, audit, print, and export official daily, weekly, monthly, and departmental compliance reports</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shrink-0">
          <FileText size={32} />
        </div>
      </div>

      {/* Control Panel / Filters */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'daily', label: 'Daily Report' },
              { id: 'weekly', label: 'Weekly Report' },
              { id: 'monthly', label: 'Monthly Report' },
              { id: 'semester', label: 'Semester Report' },
              { id: 'department', label: 'Department Report' },
              { id: 'student', label: 'Student Report' },
              { id: 'faculty', label: 'Faculty Report' },
              { id: 'ward', label: 'Ward Counsellor Report' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  reportType === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-extrabold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReport}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl"
              title="Refresh Report Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Download size={14} />
              Export Excel / CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div>
            <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            >
              {KBN_BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            >
              {KBN_SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="EM">English Medium (EM)</option>
              <option value="TM">Telugu Medium (TM)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {reportType === 'student' && (
          <div className="pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search report by Roll Number (e.g. 245901) or Student Name..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Classes Conducted</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{summaryStats.totalClasses}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Present Marks</span>
          <span className="text-xl font-black text-emerald-500 mt-1 block">{summaryStats.presentCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Absents Recorded</span>
          <span className="text-xl font-black text-rose-500 mt-1 block">{summaryStats.absentCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Average Attendance %</span>
          <span className={`text-xl font-black mt-1 block ${summaryStats.avgPercentage >= 75 ? 'text-blue-600' : 'text-amber-500'}`}>
            {summaryStats.avgPercentage}%
          </span>
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h3 className="font-extrabold text-slate-855 dark:text-white text-sm uppercase tracking-wider">
            {reportType.toUpperCase()} ATTENDANCE REPORT PREVIEW ({reportData.length} RECORDS)
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">
            Department: {department} • {semester} ({section})
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Generating report dataset...</div>
        ) : reportData.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No attendance data matched the selected filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  {reportType === 'student' ? (
                    <>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Dept & Sem</th>
                      <th className="px-4 py-3 text-center">Total Lecs</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                      <th className="px-4 py-3 text-center">Leave</th>
                      <th className="px-4 py-3 text-center">Attendance %</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3 text-center">Period</th>
                      <th className="px-4 py-3">Faculty</th>
                      <th className="px-4 py-3 text-center">Students</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                      <th className="px-4 py-3 text-center">Leave</th>
                      <th className="px-4 py-3 text-center">Attendance %</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
                {reportData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    {reportType === 'student' ? (
                      <>
                        <td className="px-4 py-3 font-mono">{row.rollNumber}</td>
                        <td className="px-4 py-3 font-extrabold">{row.studentName}</td>
                        <td className="px-4 py-3 text-slate-400 font-normal">{row.department} • {row.semester}</td>
                        <td className="px-4 py-3 text-center">{row.totalClasses}</td>
                        <td className="px-4 py-3 text-center text-emerald-500">{row.presentCount}</td>
                        <td className="px-4 py-3 text-center text-rose-500">{row.absentCount}</td>
                        <td className="px-4 py-3 text-center text-amber-500">{row.leaveCount}</td>
                        <td className="px-4 py-3 text-center font-extrabold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            row.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] uppercase rounded font-black ${
                            row.status === 'Defaulter' ? 'bg-rose-500 text-white' : 'bg-emerald-500/15 text-emerald-500'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-mono">{row.date}</td>
                        <td className="px-4 py-3 font-extrabold">{row.subject}</td>
                        <td className="px-4 py-3 text-center font-mono">P{row.period}</td>
                        <td className="px-4 py-3 text-slate-400">{row.facultyName}</td>
                        <td className="px-4 py-3 text-center">{row.totalStudents}</td>
                        <td className="px-4 py-3 text-center text-emerald-500">{row.presentCount}</td>
                        <td className="px-4 py-3 text-center text-rose-500">{row.absentCount}</td>
                        <td className="px-4 py-3 text-center text-amber-500">{row.leaveCount}</td>
                        <td className="px-4 py-3 text-center font-extrabold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            row.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
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
