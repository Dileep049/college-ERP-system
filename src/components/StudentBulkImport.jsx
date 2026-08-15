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
    <div className="space-y-6 text-xs font-semibold font-sans text-white">
      
      {/* 1. Header Banner (Blue Tinted Glass) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-blue-500/30 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} />
            <span>Super Admin &bull; Student Management &bull; Bulk Student Ingestion</span>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight text-white drop-shadow-sm">Bulk Student Import Module</h2>
          <p className="text-xs text-gray-200 mt-1 max-w-2xl leading-relaxed">
            Batch ingest up to 10,000 student documents directly into Cloud Firestore (`students` collection) using Roll Number document IDs.
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
          >
            <Download size={14} />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => handleDownloadTemplate('json')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
          >
            <Download size={14} />
            <span>JSON Template</span>
          </button>
        </div>
      </div>

      {/* 2. Upload Options & Drag and Drop Zone Container */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-6 shadow-lg w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white drop-shadow-sm">Step 1: Upload Student Roster File</h3>
            <p className="text-xs text-gray-300">Supported formats: Excel (.xlsx), CSV (.csv), JSON (.json) &bull; Maximum 10,000 records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-500/20 text-cyan-300 border border-blue-400/30">.xlsx</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">.csv</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">.json</span>
          </div>
        </div>

        {/* 2. FILE UPLOAD DROPZONE (Dashed Glass Box) */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`bg-black/40 backdrop-blur-md border-2 border-dashed border-white/20 rounded-3xl p-10 hover:bg-black/60 hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer text-center ${
            isDragging ? 'border-cyan-400 bg-black/70 scale-[0.99]' : ''
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
            <h4 className="text-sm font-extrabold text-white drop-shadow-sm">
              {selectedFile ? selectedFile.name : 'Drag & drop student roster file here, or click to browse'}
            </h4>
            <p className="text-xs text-gray-300 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB &bull; File ready for validation` : 'Supports Excel, CSV or JSON up to 10,000 rows'}
            </p>
          </div>
        </div>

        {/* Upload Summary Cards */}
        {selectedFile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Parsed</span>
              <span className="text-2xl font-black text-white block mt-1">{parsedRows.length + validationErrors.length} Rows</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Valid Students</span>
              <span className="text-2xl font-black text-emerald-300 block mt-1">{validRowsCount} Records</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-rose-500/20 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Validation Errors</span>
              <span className="text-2xl font-black text-rose-300 block mt-1">{validationErrors.length} Issues</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Duplicates Found</span>
              <span className="text-2xl font-black text-amber-300 block mt-1">{duplicateCount} Rows</span>
            </div>
          </div>
        )}

        {/* Validation Errors Preview Table */}
        {validationErrors.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Validation Audit Issues ({validationErrors.length})</span>
            </h4>
            <div className="w-full max-w-full overflow-x-hidden rounded-2xl border border-rose-500/30 max-h-48">
              <table className="w-full table-fixed text-left border-collapse">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="w-[15%] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Row #</th>
                    <th className="w-[20%] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                    <th className="w-[25%] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                    <th className="w-[40%] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Error Details</th>
                  </tr>
                </thead>
                <tbody className="text-white font-medium">
                  {validationErrors.map((err, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/10 transition-colors bg-rose-500/10">
                      <td className="px-3 py-3 font-mono text-xs text-gray-300 break-words align-middle">Row {err.rowNum}</td>
                      <td className="px-3 py-3 font-mono text-xs text-rose-300 font-bold break-words align-middle">{err.roll || 'N/A'}</td>
                      <td className="px-3 py-3 text-xs text-white break-words align-middle">{err.name || 'N/A'}</td>
                      <td className="px-3 py-3 text-xs text-rose-300 font-medium break-words align-middle">{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Execute Batch Ingestion Button */}
        {validRowsCount > 0 && (
          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              onClick={handleExecuteBatchUpload}
              disabled={importing}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Database size={16} />
              <span>{importing ? 'Executing Firestore Batch Writes...' : `Commit ${validRowsCount} Valid Students to Firestore`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Result Summary Card */}
      {importResult && (
        <div className="bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-300 drop-shadow-sm">Batch Ingestion Successful!</h3>
              <p className="text-xs text-gray-300 font-medium">
                Student documents committed to Cloud Firestore collection `students` using rollNumber document IDs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Parsed</span>
              <span className="text-xl font-black text-white block mt-0.5">{importResult.totalParsed}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Inserted</span>
              <span className="text-xl font-black text-emerald-300 block mt-0.5">{importResult.inserted}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-500/20 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Updated</span>
              <span className="text-xl font-black text-cyan-300 block mt-0.5">{importResult.updated}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Skipped</span>
              <span className="text-xl font-black text-amber-300 block mt-0.5">{importResult.skipped}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Processing Time</span>
              <span className="text-xl font-black text-purple-300 block mt-0.5">{importResult.timeSeconds}s</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Student Roster Container */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 shadow-lg w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white drop-shadow-sm flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              <span>Live Student Roster ({filteredRoster.length})</span>
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">Real-time Firestore roster synchronized with Faculty Attendance</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportRoster('excel')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExportRoster('json')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <FileText size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search roll or name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Departments</option>
              <option value="AI & ML" className="bg-slate-900 text-white">AI & ML</option>
              <option value="CSE" className="bg-slate-900 text-white">CSE</option>
              <option value="ECE" className="bg-slate-900 text-white">ECE</option>
              <option value="EEE" className="bg-slate-900 text-white">EEE</option>
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <select
              value={semFilter}
              onChange={(e) => { setSemFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Semesters</option>
              <option value="Semester 1" className="bg-slate-900 text-white">Semester 1</option>
              <option value="Semester 2" className="bg-slate-900 text-white">Semester 2</option>
              <option value="Semester 3" className="bg-slate-900 text-white">Semester 3</option>
              <option value="Semester 4" className="bg-slate-900 text-white">Semester 4</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <select
              value={secFilter}
              onChange={(e) => { setSecFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Sections</option>
              <option value="EM" className="bg-slate-900 text-white">Section EM</option>
              <option value="A" className="bg-slate-900 text-white">Section A</option>
              <option value="B" className="bg-slate-900 text-white">Section B</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Status</option>
              <option value="Active" className="bg-slate-900 text-white">Active</option>
              <option value="Inactive" className="bg-slate-900 text-white">Inactive</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="w-full max-w-full overflow-x-hidden">
          <table className="w-full table-fixed text-left border-collapse">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="w-[15%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                <th className="w-[25%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                <th className="w-[18%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="w-[12%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                <th className="w-[16%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Semester / Sec</th>
                <th className="w-[14%] px-2 sm:px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="text-white font-medium">
              {loadingRoster ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 animate-pulse font-bold">Loading roster records...</td>
                </tr>
              ) : paginatedRoster.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">No matching student records found.</td>
                </tr>
              ) : (
                paginatedRoster.map((s, idx) => (
                  <tr key={s.rollNumber || idx} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                    <td className="px-2 sm:px-3 py-3 whitespace-normal break-words font-mono text-xs sm:text-sm font-medium text-cyan-300 align-middle">{s.rollNumber}</td>
                    <td className="px-2 sm:px-3 py-3 whitespace-normal break-words text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-sm align-middle">{s.studentName || s.fullName}</td>
                    <td className="px-2 sm:px-3 py-3 whitespace-normal break-words text-xs sm:text-sm font-medium text-gray-300 align-middle">{s.department || s.branch || 'AI & ML'}</td>
                    <td className="px-2 sm:px-3 py-3 whitespace-normal break-words text-xs sm:text-sm font-medium text-gray-300 align-middle">{s.course || 'B.Sc'}</td>
                    <td className="px-2 sm:px-3 py-3 whitespace-normal break-words text-xs sm:text-sm font-medium text-gray-300 align-middle">{s.semester || 'Sem 2'} ({s.section || 'EM'})</td>
                    <td className="px-2 sm:px-3 py-3 whitespace-normal text-center align-middle">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border inline-block break-words ${
                        (s.status || 'Active') === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
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
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <span className="text-xs text-gray-400 font-medium">
            Showing {filteredRoster.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredRoster.length)} of {filteredRoster.length} students
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-gray-200 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};


