import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Filter, Calendar, Users, 
  BookOpen, Building, CheckCircle, AlertTriangle, Search, RefreshCw, BarChart2
} from 'lucide-react';
import { mockDB, KBN_SEMESTERS } from '../services/firebase';
import { COLLEGE_DEPARTMENTS } from '../utils/departments';

export const ReportsModule = ({ userRole = 'admin', currentUser = null }) => {
  const [reportType, setReportType] = useState('daily'); // daily | weekly | monthly | semester | department | student | faculty | ward
  const [department, setDepartment] = useState(COLLEGE_DEPARTMENTS[0]);
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
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* 1. Header Banner (Purple Tinted Glass) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50 backdrop-blur-xl border border-purple-500/30 text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-xl text-[10px] uppercase font-extrabold tracking-wider border border-purple-400/30 block w-fit mb-2">
            Central Reporting Center
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight text-white drop-shadow-sm">Academic & Attendance Analytics Reports</h2>
          <p className="text-xs text-gray-200 mt-1">Generate, audit, print, and export official daily, weekly, monthly, and departmental compliance reports</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 shrink-0 hidden sm:flex shadow-sm">
          <FileText size={28} />
        </div>
      </div>

      {/* 2. Top Filter and Controls Glass Panel */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-lg p-6 space-y-5 text-white w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black font-display text-white drop-shadow-sm">Institutional Reports Center</h2>
              <p className="text-xs text-gray-300">Generate, preview and export official college academic attendance logs</p>
            </div>
          </div>

          {/* Report Type Filter Buttons */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportType === tab.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40 shadow-sm'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadReport}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer shadow-sm"
              title="Refresh Report Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Printer size={14} />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap gap-4 pt-1">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-300 uppercase font-extrabold mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {COLLEGE_DEPARTMENTS.map(b => (
                <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-300 uppercase font-extrabold mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {KBN_SEMESTERS.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] text-gray-300 uppercase font-extrabold mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="EM" className="bg-slate-900 text-white">English Medium (EM)</option>
              <option value="TM" className="bg-slate-900 text-white">Telugu Medium (TM)</option>
              <option value="A" className="bg-slate-900 text-white">Section A</option>
              <option value="B" className="bg-slate-900 text-white">Section B</option>
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-300 uppercase font-extrabold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-300 uppercase font-extrabold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {reportType === 'student' && (
          <div className="pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search report by Roll Number (e.g. 245901) or Student Name..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Classes Conducted</span>
          <span className="text-2xl font-black text-white mt-1 block">{summaryStats.totalClasses}</span>
        </div>
        <div className="bg-black/30 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-emerald-400 uppercase font-bold block">Present Marks</span>
          <span className="text-2xl font-black text-emerald-300 mt-1 block">{summaryStats.presentCount}</span>
        </div>
        <div className="bg-black/30 backdrop-blur-md border border-rose-500/20 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-rose-400 uppercase font-bold block">Absents Recorded</span>
          <span className="text-2xl font-black text-rose-300 mt-1 block">{summaryStats.absentCount}</span>
        </div>
        <div className="bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-purple-400 uppercase font-bold block">Average Attendance</span>
          <span className={`text-2xl font-black mt-1 block ${summaryStats.avgPercentage >= 75 ? 'text-cyan-300' : 'text-amber-300'}`}>
            {summaryStats.avgPercentage}%
          </span>
        </div>
      </div>

      {/* 4. Report Data Table Preview */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
            {reportType.toUpperCase()} ATTENDANCE REPORT PREVIEW ({reportData.length} RECORDS)
          </h3>
          <span className="text-[10px] text-gray-300 font-bold">
            Department: {department} • {semester} ({section})
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Generating report dataset...</div>
        ) : reportData.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">No attendance data matched the selected filter criteria.</div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden">
            <table className="w-full table-fixed text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  {reportType === 'student' ? (
                    <>
                      <th className="w-[14%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                      <th className="w-[24%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                      <th className="w-[16%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Dept & Sem</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Present</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Absent</th>
                      <th className="w-[6%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Leave</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Att %</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="w-[12%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="w-[22%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Period</th>
                      <th className="w-[18%] px-2 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Faculty</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Present</th>
                      <th className="w-[8%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Absent</th>
                      <th className="w-[6%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Leave</th>
                      <th className="w-[10%] px-1 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Att %</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-white font-medium">
                {reportData.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                    {reportType === 'student' ? (
                      <>
                        <td className="px-2 py-3 whitespace-normal break-words font-mono text-xs sm:text-sm font-medium text-cyan-300 align-middle">{row.rollNumber}</td>
                        <td className="px-2 py-3 whitespace-normal break-words text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-sm align-middle">{row.studentName}</td>
                        <td className="px-2 py-3 whitespace-normal break-words text-xs sm:text-sm font-medium text-gray-300 align-middle">{row.department} • {row.semester}</td>
                        <td className="px-1 py-3 whitespace-normal text-center font-mono text-xs sm:text-sm font-medium text-gray-200 align-middle">{row.totalClasses}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-emerald-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.presentCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-rose-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.absentCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-amber-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.leaveCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center align-middle">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border inline-block break-words ${
                            row.percentage >= 75 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="px-1 py-3 whitespace-normal text-center align-middle">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase border inline-block break-words ${
                            row.status === 'Defaulter' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-3 whitespace-normal break-words font-mono text-xs sm:text-sm font-medium text-cyan-300 align-middle">{row.date}</td>
                        <td className="px-2 py-3 whitespace-normal break-words text-xs sm:text-sm font-semibold text-white align-middle">{row.subject}</td>
                        <td className="px-1 py-3 whitespace-normal text-center font-mono text-xs text-gray-300 align-middle">P{row.period}</td>
                        <td className="px-2 py-3 whitespace-normal break-words text-xs sm:text-sm text-gray-300 align-middle">{row.facultyName}</td>
                        <td className="px-1 py-3 whitespace-normal text-center font-mono text-xs sm:text-sm text-gray-200 align-middle">{row.totalStudents}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-emerald-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.presentCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-rose-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.absentCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center text-amber-300 font-mono text-xs sm:text-sm font-semibold align-middle">{row.leaveCount}</td>
                        <td className="px-1 py-3 whitespace-normal text-center align-middle">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border inline-block break-words ${
                            row.percentage >= 75 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
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
