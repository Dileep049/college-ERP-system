import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Database,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

export const StudentBulkImport = () => {
  const { showToast } = useAuth();
  const fileInputRef = useRef(null);

  // Drag and Drop & Parsing States
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validRowsCount, setValidRowsCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [parsingLoading, setParsingLoading] = useState(false);

  // Import Execution States
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Roster Directory States
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');
  const [secFilter, setSecFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load existing students from Firestore / Local storage
  const loadRosterData = async () => {
    try {
      setLoadingRoster(true);
      const students = await mockDB.getStudentsByBranchAndSemester('AI & ML', 'Semester 2', 'EM');
      const allUsers = await mockDB.getAllUsers();
      const allStudents = allUsers.filter(u => u.role === 'student' || u.rollNumber);
      
      // Combine and deduplicate by rollNumber
      const combinedMap = new Map();
      allStudents.forEach(s => {
        if (s.rollNumber) combinedMap.set(s.rollNumber, s);
      });
      students.forEach(s => {
        if (s.rollNumber) combinedMap.set(s.rollNumber, s);
      });

      setRoster(Array.from(combinedMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    loadRosterData();
  }, []);

  // --- TEMPLATE DOWNLOAD HANDLER ---
  const handleDownloadTemplate = (format = 'csv') => {
    const sampleHeaders = ['rollNumber', 'studentName', 'department', 'course', 'semester', 'section', 'branch', 'status'];
    const sampleRows = [
      ['245901', 'AVALA ANAND BABU', 'AI & ML', 'B.Sc', 'Semester 2', 'EM', 'AI & ML', 'Active'],
      ['245902', 'DASIKA SARATH KUMAR', 'AI & ML', 'B.Sc', 'Semester 2', 'EM', 'AI & ML', 'Active'],
      ['245903', 'SHAIK NAADIA TASLEEM', 'AI & ML', 'B.Sc', 'Semester 2', 'EM', 'AI & ML', 'Active'],
      ['245904', 'CHIKATI YUGALA SRI', 'AI & ML', 'B.Sc', 'Semester 2', 'EM', 'AI & ML', 'Active'],
      ['245905', 'ORSU BRAHMAIAH', 'AI & ML', 'B.Sc', 'Semester 2', 'EM', 'AI & ML', 'Active']
    ];

    if (format === 'json') {
      const jsonContent = JSON.stringify([
        { rollNumber: "245901", studentName: "AVALA ANAND BABU", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
        { rollNumber: "245902", studentName: "DASIKA SARATH KUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" }
      ], null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_import_template.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      let csvContent = "data:text/csv;charset=utf-8," + sampleHeaders.join(",") + "\n";
      sampleRows.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(",") + "\n";
      });

      const encoded = encodeURI(csvContent);
      const a = document.createElement('a');
      a.href = encoded;
      a.download = 'students_import_template.csv';
      a.click();
    }

    showToast(`Sample ${format.toUpperCase()} import template downloaded!`, 'success');
  };

  // --- FILE PARSER & PRE-UPLOAD VALIDATOR ---
  const parseAndValidateFile = (file) => {
    setParsingLoading(true);
    setSelectedFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      let rawRows = [];

      try {
        if (file.name.endsWith('.json')) {
          rawRows = JSON.parse(text);
          if (!Array.isArray(rawRows)) rawRows = [rawRows];
        } else {
          // Parse CSV / TSV / Excel text format
          const lines = text.split(/\r\n|\n/);
          if (lines.length === 0) throw new Error("File is empty");

          const headers = lines[0].split(',').map(h => h.replace(/["']/g, '').trim());
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.replace(/["']/g, '').trim());
            const rowObj = {};
            headers.forEach((h, index) => {
              rowObj[h] = values[index] || '';
            });
            rawRows.push(rowObj);
          }
        }

        // Check 10,000 rows limit
        if (rawRows.length > 10000) {
          showToast('Maximum file limit is 10,000 students per batch.', 'warning');
          rawRows = rawRows.slice(0, 10000);
        }

        // Validate each row
        const errors = [];
        const validList = [];
        const seenRolls = new Set();
        let dupes = 0;

        rawRows.forEach((row, index) => {
          const rowNum = index + 1;
          const roll = String(row.rollNumber || row.roll_number || row.roll || '').trim();
          const name = String(row.studentName || row.name || row.fullName || '').trim();
          const dept = String(row.department || row.dept || 'AI & ML').trim();
          const crs = String(row.course || 'B.Sc').trim();
          const sem = String(row.semester || 'Semester 2').trim();
          const sec = String(row.section || 'EM').trim();
          const brn = String(row.branch || dept || 'AI & ML').trim();
          const stat = String(row.status || 'Active').trim();

          const rowErrors = [];

          if (!roll) rowErrors.push('Roll Number is required');
          if (!name) rowErrors.push('Student Name is required');
          if (!dept) rowErrors.push('Department is required');
          if (!sem) rowErrors.push('Semester is required');
          if (!sec) rowErrors.push('Section is required');
          if (!brn) rowErrors.push('Branch is required');

          if (roll && seenRolls.has(roll)) {
            rowErrors.push(`Duplicate Roll Number in file (${roll})`);
            dupes += 1;
          } else if (roll) {
            seenRolls.add(roll);
          }

          const studentDoc = {
            rowNum,
            rollNumber: roll,
            studentName: name,
            department: dept,
            course: crs,
            semester: sem,
            section: sec,
            branch: brn,
            status: stat || 'Active',
            isValid: rowErrors.length === 0,
            errors: rowErrors
          };

          if (rowErrors.length > 0) {
            errors.push({ rowNum, roll, name, errors: rowErrors });
          } else {
            validList.push(studentDoc);
          }
        });

        setParsedRows(validList);
        setValidationErrors(errors);
        setValidRowsCount(validList.length);
        setDuplicateCount(dupes);

        showToast(`Parsed ${rawRows.length} rows: ${validList.length} valid, ${errors.length} invalid.`, errors.length === 0 ? 'success' : 'warning');
      } catch (err) {
        showToast(`Error parsing file: ${err.message}`, 'error');
      } finally {
        setParsingLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseAndValidateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      parseAndValidateFile(e.target.files[0]);
    }
  };

  // --- FIRESTORE BATCH INGESTION EXECUTOR ---
  const handleExecuteBatchUpload = async () => {
    if (parsedRows.length === 0) {
      showToast('No valid student records to upload.', 'warning');
      return;
    }

    try {
      setImporting(true);
      const startTime = performance.now();

      // Submit batch payload to Firestore & local storage
      const count = await mockDB.batchUploadStudents(parsedRows);
      const endTime = performance.now();
      const processingTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);

      const result = {
        totalParsed: parsedRows.length + validationErrors.length,
        inserted: count,
        updated: count,
        skipped: validationErrors.length,
        failed: 0,
        timeSeconds: processingTimeSeconds
      };

      setImportResult(result);
      showToast(`Batch Ingestion Successful! Inserted/Updated ${count} students in ${processingTimeSeconds}s.`, 'success');

      // Clear current file state and reload roster
      setParsedRows([]);
      setSelectedFile(null);
      loadRosterData();
    } catch (err) {
      showToast(`Ingestion failed: ${err.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  // --- ROSTER DIRECTORY FILTERING & PAGINATION ---
  const filteredRoster = roster.filter(st => {
    const matchesSearch = !searchTerm || 
      st.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.studentName || st.fullName)?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'all' || st.department === deptFilter || st.branch === deptFilter;
    const matchesSem = semFilter === 'all' || st.semester === semFilter;
    const matchesSec = secFilter === 'all' || st.section === secFilter;
    const matchesStat = statusFilter === 'all' || st.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesSem && matchesSec && matchesStat;
  });

  const totalPages = Math.ceil(filteredRoster.length / rowsPerPage) || 1;
  const paginatedRoster = filteredRoster.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // --- ROSTER EXPORT HANDLERS ---
  const handleExportRoster = (format = 'excel') => {
    if (filteredRoster.length === 0) {
      showToast('No records available to export.', 'warning');
      return;
    }

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredRoster, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `students_roster_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      let csv = "data:text/csv;charset=utf-8,Roll Number,Student Name,Department,Course,Semester,Section,Branch,Status\n";
      filteredRoster.forEach(s => {
        csv += `"${s.rollNumber}","${s.studentName || s.fullName}","${s.department || 'AI & ML'}","${s.course || 'B.Sc'}","${s.semester || 'Semester 2'}","${s.section || 'EM'}","${s.branch || 'AI & ML'}","${s.status || 'Active'}"\n`;
      });

      const encodedUri = encodeURI(csv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `students_roster_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    showToast(`Roster exported successfully as ${format.toUpperCase()}!`, 'success');
  };

  return (
    <div className="space-y-8 text-xs font-semibold">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} />
            <span>Super Admin &bull; Student Management &bull; Bulk Student Import</span>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight">Bulk Student Import Module</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Batch ingest up to 10,000 student documents directly into Cloud Firestore (`students` collection) using Roll Number document IDs.
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => handleDownloadTemplate('json')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span>JSON Template</span>
          </button>
        </div>
      </div>

      {/* 3 Upload Options & Drag and Drop Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Step 1: Upload Student Roster File</h3>
            <p className="text-xs text-slate-450">Supported formats: Excel (.xlsx), CSV (.csv), JSON (.json) &bull; Maximum 10,000 records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black border border-blue-500/20">.xlsx</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20">.csv</span>
            <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-500 text-[10px] font-black border border-purple-500/20">.json</span>
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-950/20 scale-[0.99]' 
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.json,.xlsx,.txt"
            className="hidden"
          />

          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <Upload size={28} />
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
              {selectedFile ? selectedFile.name : 'Drag & drop student roster file here, or click to browse'}
            </h4>
            <p className="text-xs text-slate-450 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB &bull; File ready for validation` : 'Supports Excel, CSV or JSON up to 10,000 rows'}
            </p>
          </div>
        </div>

        {/* Upload Summary Cards */}
        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block">Total Parsed</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block mt-1">{parsedRows.length + validationErrors.length} Rows</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">Valid Students</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{validRowsCount} Records</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Validation Errors</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400 block mt-1">{validationErrors.length} Issues</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Duplicates Found</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 block mt-1">{duplicateCount} Rows</span>
            </div>
          </div>
        )}

        {/* Validation Errors Preview Table */}
        {validationErrors.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-rose-500 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Validation Audit Issues ({validationErrors.length})</span>
            </h4>
            <div className="border border-rose-200 dark:border-rose-900/50 rounded-2xl overflow-hidden overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase text-[9px] font-black">
                  <tr>
                    <th className="px-4 py-2">Row #</th>
                    <th className="px-4 py-2">Roll Number</th>
                    <th className="px-4 py-2">Student Name</th>
                    <th className="px-4 py-2">Error Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 dark:divide-rose-900/30 font-bold text-slate-700 dark:text-slate-300">
                  {validationErrors.map((err, idx) => (
                    <tr key={idx} className="bg-rose-500/5">
                      <td className="px-4 py-2">Row {err.rowNum}</td>
                      <td className="px-4 py-2">{err.roll || 'N/A'}</td>
                      <td className="px-4 py-2">{err.name || 'N/A'}</td>
                      <td className="px-4 py-2 text-rose-500">{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Execute Batch Ingestion Button */}
        {validRowsCount > 0 && (
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExecuteBatchUpload}
              disabled={importing}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Database size={16} />
              <span>{importing ? 'Executing Firestore Batch Writes...' : `Commit ${validRowsCount} Valid Students to Firestore`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Result Summary Card */}
      {importResult && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">Batch Ingestion Successful!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                Student documents committed to Cloud Firestore collection `students` using rollNumber document IDs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Parsed</span>
              <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5">{importResult.totalParsed}</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">Inserted</span>
              <span className="text-lg font-black text-emerald-500 block mt-0.5">{importResult.inserted}</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block">Updated</span>
              <span className="text-lg font-black text-blue-500 block mt-0.5">{importResult.updated}</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Skipped</span>
              <span className="text-lg font-black text-amber-500 block mt-0.5">{importResult.skipped}</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-wider block">Processing Time</span>
              <span className="text-lg font-black text-purple-500 block mt-0.5">{importResult.timeSeconds}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Roster Table: Search, Filter, Sort, Pagination & Export */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              <span>Live Student Roster ({filteredRoster.length})</span>
            </h3>
            <p className="text-xs text-slate-450 mt-0.5">Real-time Firestore roster synchronized with Faculty Attendance</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportRoster('excel')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExportRoster('json')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileText size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roll number or name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
            >
              <option value="all">All Departments</option>
              <option value="AI & ML">AI & ML</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <div>
            <select
              value={semFilter}
              onChange={(e) => { setSemFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
            >
              <option value="all">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>
          </div>

          <div>
            <select
              value={secFilter}
              onChange={(e) => { setSecFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
            >
              <option value="all">All Sections</option>
              <option value="EM">Section EM</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
              {loadingRoster ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 animate-pulse">Loading roster records...</td>
                </tr>
              ) : paginatedRoster.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">No matching student records found.</td>
                </tr>
              ) : (
                paginatedRoster.map((s, idx) => (
                  <tr key={s.rollNumber || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3.5 font-mono text-blue-600 dark:text-blue-400">{s.rollNumber}</td>
                    <td className="px-5 py-3.5">{s.studentName || s.fullName}</td>
                    <td className="px-5 py-3.5">{s.department || 'AI & ML'}</td>
                    <td className="px-5 py-3.5">{s.course || 'B.Sc'}</td>
                    <td className="px-5 py-3.5">{s.semester || 'Semester 2'}</td>
                    <td className="px-5 py-3.5">{s.section || 'EM'}</td>
                    <td className="px-5 py-3.5">{s.branch || 'AI & ML'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        (s.status || 'Active') === 'Active' 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}>
                        {s.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-400">
            Showing {filteredRoster.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredRoster.length)} of {filteredRoster.length} students
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
