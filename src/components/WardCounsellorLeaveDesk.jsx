import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, isDepartmentMatch, normalizeSemester, normalizeSection } from '../services/firebase';
import {
  Lock,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Building2,
  BookOpen,
  Users,
  User,
  Phone,
  Mail,
  X,
  Eye,
  AlertCircle,
  Activity,
  Award,
  CheckSquare
} from 'lucide-react';

export const WardCounsellorLeaveDesk = ({ counsellor }) => {
  const { showToast } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Resolved Scope State (Fetched from Firestore user profile)
  const [scope, setScope] = useState({
    assignedDepartment: 'CSE',
    assignedSemester: 'Semester 6',
    assignedSection: 'Section A'
  });

  // Modals
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Student Profile Drawer / Modal State
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentProfileData, setStudentProfileData] = useState(null);

  // 1. FETCH ASSIGNED SCOPE & LEAVES ON MOUNT
  const loadCounsellorScopeAndLeaves = async () => {
    try {
      setLoading(true);
      
      // Fetch active assignment for Ward Counsellor
      const activeAssign = await mockDB.getFacultyWardAssignment(counsellor?.uid || counsellor?.id || counsellor?.email);

      let targetProfile = counsellor || {};
      if (counsellor?.uid || counsellor?.id) {
        try {
          const fresh = await mockDB.getAllUsers();
          const found = fresh.find(u => u.uid === counsellor.uid || u.id === counsellor.id || u.email === counsellor.email);
          if (found) targetProfile = found;
        } catch (e) {
          console.warn("Could not fetch fresh user profile, using context user:", e);
        }
      }

      const assignedDepartment = activeAssign?.department || targetProfile.assignedDepartment || targetProfile.department || targetProfile.branch || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
      const assignedSemester = activeAssign?.semester || targetProfile.assignedSemester || targetProfile.semester || 'Semester 6';
      const rawSec = activeAssign?.section || targetProfile.assignedSection || targetProfile.section || 'A';
      const assignedSection = rawSec.toLowerCase().startsWith('section') ? rawSec : `Section ${rawSec}`;

      const currentScope = { assignedDepartment, assignedSemester, assignedSection };
      setScope(currentScope);

      // Query leaves strictly scoped to assignedDepartment + assignedSemester + assignedSection
      const rawLeaves = await mockDB.getLeaves('counsellor', counsellor.uid, currentScope);
      setLeaves(rawLeaves);
    } catch (err) {
      console.error("Error loading leave desk:", err);
      showToast('Could not load leave requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (counsellor) {
      loadCounsellorScopeAndLeaves();
    }
  }, [counsellor]);

  // 2. ACTION SECURITY VALIDATION BEFORE APPROVE / REJECT
  const validateActionAuthorization = (leave) => {
    const deptMatch = isDepartmentMatch(leave.department || leave.branch, scope.assignedDepartment);
    const semMatch = !leave.semester || normalizeSemester(leave.semester) === normalizeSemester(scope.assignedSemester);
    const secMatch = !leave.section || normalizeSection(leave.section) === normalizeSection(scope.assignedSection);

    if (!deptMatch || !semMatch || !secMatch) {
      showToast("You are not authorized to manage this student's leave.", "error");
      return false;
    }
    return true;
  };

  // APPROVE HANDLER
  const handleApprove = async (leave) => {
    if (!validateActionAuthorization(leave)) return;

    try {
      await mockDB.reviewLeave(leave.leaveId || leave.id, 'Approved', 'Approved by Ward Counsellor', counsellor);
      showToast(`Leave application for ${leave.studentName || 'Student'} approved successfully.`, 'success');
      loadCounsellorScopeAndLeaves();
    } catch (err) {
      console.error(err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  // REJECT HANDLER
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionModalLeave) return;

    if (!validateActionAuthorization(rejectionModalLeave)) {
      setRejectionModalLeave(null);
      return;
    }

    if (!rejectionReason.trim()) {
      showToast('Rejection reason is required before rejecting leave.', 'warning');
      return;
    }

    try {
      await mockDB.reviewLeave(
        rejectionModalLeave.leaveId || rejectionModalLeave.id,
        'Rejected',
        rejectionReason.trim(),
        counsellor
      );
      showToast('Student leave application rejected.', 'success');
      setRejectionModalLeave(null);
      setRejectionReason('');
      loadCounsellorScopeAndLeaves();
    } catch (err) {
      console.error(err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  // 3. OPEN STUDENT PROFILE MODAL
  const handleOpenStudentProfile = async (leave) => {
    const studentIdOrRoll = leave.studentId || leave.applicantId || leave.rollNumber || leave.uid;
    setSelectedStudentModal(leave);
    setStudentDetailsLoading(true);

    try {
      const details = await mockDB.getStudentFullDetails(studentIdOrRoll);
      setStudentProfileData(details);
    } catch (err) {
      console.error("Error fetching student profile details:", err);
      showToast("Could not fetch full student profile.", "error");
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // FILTERED LEAVES (Strictly within Scope)
  const filteredLeaves = leaves.filter(l => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (l.studentName || l.applicantName || '').toLowerCase();
      const roll = (l.rollNumber || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      if (!name.includes(q) && !roll.includes(q) && !reason.includes(q)) return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      const st = (l.status || '').toLowerCase();
      if (st !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // SCOPED DASHBOARD COUNTS
  const pendingCount = leaves.filter(l => (l.status || '').toLowerCase() === 'pending').length;
  const approvedCount = leaves.filter(l => (l.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = leaves.filter(l => (l.status || '').toLowerCase() === 'rejected').length;
  const totalCount = leaves.length;

  return (
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. LOCKED SCOPE HEADER SECTION */}
      <div className="card-3d p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-black font-display text-[var(--text-primary)] flex items-center gap-2">
              <span>Ward Counsellor Leave Management Desk</span>
              <span className="badge-3d badge-3d-info">
                RBAC Enforced
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              Assigned Academic Scope (Locked by HOD Administration)
            </p>
          </div>

          <button
            onClick={loadCounsellorScopeAndLeaves}
            className="btn-3d btn-3d-primary py-2 px-3.5 text-xs font-bold"
          >
            <RefreshCw size={14} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* LOCKED SCOPE BADGES (No Dropdowns Allowed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-3.5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Building2 size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Assigned Branch</span>
                <span className="font-extrabold text-[var(--text-primary)] text-xs">{scope.assignedDepartment}</span>
              </div>
            </div>
            <Lock size={14} className="text-[var(--text-muted)] shrink-0" title="Scope Locked by Admin" />
          </div>

          <div className="p-3.5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Assigned Semester</span>
                <span className="font-extrabold text-[var(--text-primary)] text-xs">{scope.assignedSemester}</span>
              </div>
            </div>
            <Lock size={14} className="text-[var(--text-muted)] shrink-0" title="Scope Locked by Admin" />
          </div>

          <div className="p-3.5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Users size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Assigned Section</span>
                <span className="font-extrabold text-[var(--text-primary)] text-xs">{scope.assignedSection}</span>
              </div>
            </div>
            <Lock size={14} className="text-[var(--text-muted)] shrink-0" title="Scope Locked by Admin" />
          </div>

        </div>
      </div>

      {/* 2. 3D SCOPED DASHBOARD COUNTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card-3d flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase block tracking-wider text-[var(--text-muted)]">Pending Review</span>
            <span className="text-2xl font-black text-[var(--text-primary)]">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="stat-card-3d flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase block tracking-wider text-[var(--text-muted)]">Approved</span>
            <span className="text-2xl font-black text-[var(--text-primary)]">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="stat-card-3d flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase block tracking-wider text-[var(--text-muted)]">Rejected</span>
            <span className="text-2xl font-black text-[var(--text-primary)]">{rejectedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>

        <div className="stat-card-3d flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase block tracking-wider text-[var(--text-muted)]">Total Wards Scope</span>
            <span className="text-2xl font-black text-[var(--text-primary)]">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER BAR */}
      <div className="card-3d p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Student Name, Roll Number, or Reason..."
              className="input-3d pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[var(--text-muted)] shrink-0">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select-3d w-full sm:w-44"
            >
              <option value="ALL">All Statuses ({leaves.length})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="Approved">Approved ({approvedCount})</option>
              <option value="Rejected">Rejected ({rejectedCount})</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        {/* LEAVE APPLICATIONS LIST */}
        {loading ? (
          <div className="py-16 text-center text-[var(--text-muted)] animate-pulse font-bold">
            Querying Firestore for student leave applications matching assigned scope...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-muted)] font-bold space-y-2">
            <p>No student leave applications match your search query or assigned scope.</p>
            <p className="text-[11px] font-normal text-[var(--text-muted)]">
              Scope: {scope.assignedDepartment} • {scope.assignedSemester} • {scope.assignedSection}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {filteredLeaves.map((l) => {
              const numDays = calculateDays(l.startDate || l.fromDate, l.endDate || l.toDate);
              const isPending = (l.status || '').toLowerCase() === 'pending';
              const isApproved = (l.status || '').toLowerCase() === 'approved';
              const isRejected = (l.status || '').toLowerCase() === 'rejected';

              return (
                <div
                  key={l.leaveId || l.id}
                  className="p-5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] space-y-3 hover:border-[var(--accent)] transition-all shadow-sm"
                >
                  
                  {/* Top Bar: Student Name (Clickable) & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenStudentProfile(l)}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm uppercase shadow hover:scale-105 transition-transform"
                        title="Click to view full student profile modal"
                      >
                        {l.studentName ? l.studentName.charAt(0) : 'S'}
                      </button>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentProfile(l)}
                            className="text-sm font-black text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-1.5 group text-left"
                          >
                            <span>{l.studentName || l.applicantName || 'Student'}</span>
                            <Eye size={13} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--text-muted)] font-semibold mt-0.5">
                          <span>Roll: <strong className="text-[var(--text-primary)]">{l.rollNumber || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Dept: <strong className="text-[var(--text-primary)]">{l.department || l.branch || 'CSE'}</strong></span>
                          <span>•</span>
                          <span>Sem: <strong className="text-[var(--text-primary)]">{l.semester || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Sec: <strong className="text-[var(--text-primary)]">{l.section || 'A'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <span className={
                      isApproved ? 'badge-3d badge-3d-success' :
                      isRejected ? 'badge-3d badge-3d-danger' :
                      'badge-3d badge-3d-warning'
                    }>
                      {l.status || 'Pending'}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border-subtle)] text-[11px]">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Leave Type</span>
                      <span className="font-extrabold text-[var(--text-primary)]">{l.leaveType || 'Casual Leave'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Duration</span>
                      <span className="font-bold text-[var(--text-secondary)]">{l.startDate || l.fromDate} to {l.endDate || l.toDate}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Number of Days</span>
                      <span className="font-black text-purple-600 dark:text-purple-400">{numDays} {numDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Applied Date</span>
                      <span className="font-semibold text-[var(--text-muted)]">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-0.5">Reason for Leave</span>
                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--surface)] p-3 rounded-xl border border-[var(--border-subtle)]">
                      {l.reason}
                    </p>
                  </div>

                  {/* Approved Banner */}
                  {isApproved && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                      <span>Approved by: <strong>{l.approvedByName || counsellor.fullName || 'Ward Counsellor'}</strong></span>
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">{l.approvedAt ? new Date(l.approvedAt).toLocaleString() : ''}</span>
                    </div>
                  )}

                  {/* Rejected Banner */}
                  {isRejected && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Rejected by: <strong>{l.rejectedByName || counsellor.fullName || 'Ward Counsellor'}</strong></span>
                        <span className="text-[10px] text-[var(--text-muted)] font-normal">{l.rejectedAt ? new Date(l.rejectedAt).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-[var(--text-secondary)] font-medium bg-[var(--surface)] p-2 rounded-lg border border-rose-500/30">
                        <span className="text-rose-600 dark:text-rose-400 font-black mr-1">Rejection Reason:</span>
                        {l.rejectionReason || l.remarks || 'No reason provided.'}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Pending Applications */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleOpenStudentProfile(l)}
                        className="btn-3d btn-3d-secondary py-2 px-3.5 text-xs"
                      >
                        <Eye size={13} />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectionModalLeave(l);
                          setRejectionReason('');
                        }}
                        className="btn-3d btn-3d-danger py-2 px-4 text-xs font-bold"
                      >
                        Reject
                      </button>
                      
                      <button
                        onClick={() => handleApprove(l)}
                        className="btn-3d btn-3d-success py-2 px-4 text-xs font-bold"
                      >
                        Approve
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. REJECTION REASON 3D MODAL */}
      {rejectionModalLeave && (
        <div className="modal-3d-backdrop">
          <div className="modal-3d-content max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase">Reject Student Leave Application</h3>
              <button onClick={() => setRejectionModalLeave(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] font-normal">
              Rejecting application for: <strong className="text-[var(--text-primary)]">{rejectionModalLeave.studentName || rejectionModalLeave.applicantName}</strong> ({rejectionModalLeave.rollNumber})
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">
                  Rejection Reason *
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explicit reason for rejection (required)..."
                  required
                  className="textarea-3d"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setRejectionModalLeave(null)}
                  className="btn-3d btn-3d-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d btn-3d-danger py-2 px-5 text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. STUDENT PROFILE 3D MODAL */}
      {selectedStudentModal && (
        <div className="modal-3d-backdrop">
          <div className="modal-3d-content max-w-2xl p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base uppercase shadow">
                  {selectedStudentModal.studentName ? selectedStudentModal.studentName.charAt(0) : 'S'}
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {selectedStudentModal.studentName || selectedStudentModal.applicantName || 'Student Profile'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Roll Number: <strong className="text-[var(--accent)]">{selectedStudentModal.rollNumber || 'N/A'}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentModal(null)}
                className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {studentDetailsLoading ? (
              <div className="py-16 text-center text-[var(--text-muted)] animate-pulse font-bold">
                Fetching student academic stats and leave history from Firestore...
              </div>
            ) : studentProfileData ? (
              <div className="space-y-5">
                
                {/* Personal & Parent Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black text-[var(--text-muted)] block">Personal Contact Info</span>
                    <div className="text-xs space-y-1">
                      <p className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                        <Mail size={13} className="text-[var(--text-muted)]" />
                        <span>{studentProfileData.student?.email || `${selectedStudentModal.rollNumber}@kbn.edu`}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                        <Phone size={13} className="text-[var(--text-muted)]" />
                        <span>{studentProfileData.student?.phoneNumber || studentProfileData.student?.mobile || '9876543210'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black text-[var(--text-muted)] block">Parent / Guardian Details</span>
                    <div className="text-xs space-y-1">
                      <p className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                        <User size={13} className="text-purple-500" />
                        <span>{studentProfileData.student?.parentName || 'Richard Doe (Father)'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                        <Phone size={13} className="text-purple-500" />
                        <span>{studentProfileData.student?.parentPhone || '9876500000'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Attendance Stat */}
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Current Attendance</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-black ${
                        (studentProfileData.student?.attendancePercentage || 84) >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
                        (studentProfileData.student?.attendancePercentage || 84) >= 65 ? 'text-amber-600 dark:text-amber-400' :
                        'text-rose-600 dark:text-rose-400'
                      }`}>
                        {studentProfileData.student?.attendancePercentage || 84.5}%
                      </span>
                      <Activity size={18} className="text-[var(--text-muted)]" />
                    </div>
                  </div>

                  {/* Internal Marks Summary */}
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Internal Test Marks</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-[var(--accent)]">
                        {studentProfileData.student?.internalMarks || '42 / 50'}
                      </span>
                      <Award size={18} className="text-[var(--text-muted)]" />
                    </div>
                  </div>

                  {/* Class Scope */}
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block">Academic Class</span>
                    <span className="font-extrabold text-[var(--text-primary)] block text-xs truncate">
                      {selectedStudentModal.semester || 'Sem 6'} • {selectedStudentModal.section || 'Sec A'}
                    </span>
                  </div>

                </div>

                {/* Past Leave History Ledger */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <h4 className="text-xs font-black text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-blue-500" />
                      <span>Student Past Leave History ({studentProfileData.leaves?.length || 0})</span>
                    </h4>
                  </div>

                  {studentProfileData.leaves?.length === 0 ? (
                    <div className="py-6 text-center text-[var(--text-muted)] font-normal">No prior leave applications logged for this student.</div>
                  ) : (
                    <div className="table-3d-container">
                      <table className="table-3d">
                        <thead>
                          <tr>
                            <th>Leave Type</th>
                            <th className="text-center">Dates</th>
                            <th className="text-center">Status</th>
                            <th>Reason / Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentProfileData.leaves.map((pl, idx) => (
                            <tr key={pl.leaveId || pl.id || idx}>
                              <td className="font-bold text-[var(--text-primary)]">{pl.leaveType || 'Casual'}</td>
                              <td className="text-center text-[var(--text-muted)]">{pl.startDate || pl.fromDate} to {pl.endDate || pl.toDate}</td>
                              <td className="text-center">
                                <span className={`badge-3d ${
                                  pl.status === 'Approved' ? 'badge-3d-success' :
                                  pl.status === 'Rejected' ? 'badge-3d-danger' : 'badge-3d-warning'
                                }`}>
                                  {pl.status}
                                </span>
                              </td>
                              <td className="text-[var(--text-muted)] font-normal">
                                {pl.status === 'Rejected' ? `Reason: ${pl.rejectionReason || pl.remarks}` : pl.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
};

