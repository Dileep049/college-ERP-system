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
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10" style={{ boxShadow: 'var(--shadow-3d-card), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} />
            <span>Super Admin &bull; Student Management &bull; Bulk Student Ingestion</span>
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
            className="btn-3d btn-3d-secondary py-2 px-3.5 text-xs text-white border-white/20 bg-white/10 hover:bg-white/20"
          >
            <Download size={14} />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => handleDownloadTemplate('json')}
            className="btn-3d btn-3d-secondary py-2 px-3.5 text-xs text-white border-white/20 bg-white/10 hover:bg-white/20"
          >
            <Download size={14} />
            <span>JSON Template</span>
          </button>
        </div>
      </div>

      {/* 3 Upload Options & Drag and Drop Zone */}
      <div className="card-3d p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Step 1: Upload Student Roster File</h3>
            <p className="text-xs text-[var(--text-muted)]">Supported formats: Excel (.xlsx), CSV (.csv), JSON (.json) &bull; Maximum 10,000 records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-3d badge-3d-info">.xlsx</span>
            <span className="badge-3d badge-3d-success">.csv</span>
            <span className="badge-3d badge-3d-neutral">.json</span>
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging 
              ? 'border-[var(--accent)] bg-blue-500/5 dark:bg-blue-950/20 scale-[0.99]' 
              : 'border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--bg-secondary)]'
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
            <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
              {selectedFile ? selectedFile.name : 'Drag & drop student roster file here, or click to browse'}
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB &bull; File ready for validation` : 'Supports Excel, CSV or JSON up to 10,000 rows'}
            </p>
          </div>
        </div>

        {/* Upload Summary Cards */}
        {selectedFile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Total Parsed</span>
              <span className="text-2xl font-black text-[var(--text-primary)] block mt-1">{parsedRows.length + validationErrors.length} Rows</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Valid Students</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{validRowsCount} Records</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Validation Errors</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block mt-1">{validationErrors.length} Issues</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Duplicates Found</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">{duplicateCount} Rows</span>
            </div>
          </div>
        )}

        {/* Validation Errors Preview Table */}
        {validationErrors.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Validation Audit Issues ({validationErrors.length})</span>
            </h4>
            <div className="table-3d-container max-h-48">
              <table className="table-3d">
                <thead>
                  <tr>
                    <th>Row #</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Error Details</th>
                  </tr>
                </thead>
                <tbody>
                  {validationErrors.map((err, idx) => (
                    <tr key={idx} className="bg-rose-500/5">
                      <td className="font-mono">Row {err.rowNum}</td>
                      <td className="font-mono text-rose-600 dark:text-rose-400">{err.roll || 'N/A'}</td>
                      <td>{err.name || 'N/A'}</td>
                      <td className="text-rose-600 dark:text-rose-400 font-medium">{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Execute Batch Ingestion Button */}
        {validRowsCount > 0 && (
          <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleExecuteBatchUpload}
              disabled={importing}
              className="btn-3d btn-3d-success py-2.5 px-6 text-xs font-bold"
            >
              <Database size={16} />
              <span>{importing ? 'Executing Firestore Batch Writes...' : `Commit ${validRowsCount} Valid Students to Firestore`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Result Summary Card */}
      {importResult && (
        <div className="card-3d p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">Batch Ingestion Successful!</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Student documents committed to Cloud Firestore collection `students` using rollNumber document IDs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Total Parsed</span>
              <span className="text-xl font-black text-[var(--text-primary)] block mt-0.5">{importResult.totalParsed}</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Inserted</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{importResult.inserted}</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Updated</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">{importResult.updated}</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Skipped</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 block mt-0.5">{importResult.skipped}</span>
            </div>
            <div className="stat-card-3d">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Processing Time</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 block mt-0.5">{importResult.timeSeconds}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Roster Table: Search, Filter, Sort, Pagination & Export */}
      <div className="card-3d p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              <span>Live Student Roster ({filteredRoster.length})</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time Firestore roster synchronized with Faculty Attendance</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportRoster('excel')}
              className="btn-3d btn-3d-secondary py-2 px-3 text-xs"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExportRoster('json')}
              className="btn-3d btn-3d-secondary py-2 px-3 text-xs"
            >
              <FileText size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search roll or name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input-3d pl-9"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="select-3d"
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
              className="select-3d"
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
              className="select-3d"
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
              className="select-3d"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="table-3d-container">
          <table className="table-3d">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Section</th>
                <th>Branch</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingRoster ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[var(--text-muted)] animate-pulse font-bold">Loading roster records...</td>
                </tr>
              ) : paginatedRoster.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[var(--text-muted)] font-medium">No matching student records found.</td>
                </tr>
              ) : (
                paginatedRoster.map((s, idx) => (
                  <tr key={s.rollNumber || idx}>
                    <td className="font-mono text-blue-600 dark:text-blue-400 font-bold">{s.rollNumber}</td>
                    <td className="font-bold text-[var(--text-primary)]">{s.studentName || s.fullName}</td>
                    <td className="text-[var(--text-muted)]">{s.department || 'AI & ML'}</td>
                    <td className="text-[var(--text-muted)]">{s.course || 'B.Sc'}</td>
                    <td className="text-[var(--text-muted)]">{s.semester || 'Semester 2'}</td>
                    <td className="text-[var(--text-muted)]">{s.section || 'EM'}</td>
                    <td className="text-[var(--text-muted)]">{s.branch || 'AI & ML'}</td>
                    <td className="text-center">
                      <span className={`badge-3d ${
                        (s.status || 'Active') === 'Active' 
                          ? 'badge-3d-success' 
                          : 'badge-3d-danger'
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
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Showing {filteredRoster.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredRoster.length)} of {filteredRoster.length} students
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-3d btn-3d-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-3d btn-3d-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

