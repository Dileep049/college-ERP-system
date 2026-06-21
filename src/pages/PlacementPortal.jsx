import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { 
  Briefcase, 
  Building2, 
  Users, 
  Award, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  X, 
  ChevronRight 
} from 'lucide-react';

export const PlacementPortal = ({ subPage }) => {
  const { user } = useAuth();

  if (subPage === 'dashboard') return <PlacementDashboard officer={user} />;
  if (subPage === 'drives') return <PlacementDrives officer={user} />;
  if (subPage === 'students') return <PlacementCandidates officer={user} />;
  return <PlacementDashboard officer={user} />;
};

// 1. PLACEMENT DASHBOARD
const PlacementDashboard = ({ officer }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    upcomingDrives: 0,
    selectedCount: 0,
    placementPercentage: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const drives = await mockDB.getPlacementDrives();
        
        // Count unique companies
        const companies = new Set(drives.map(d => d.companyName));
        const upcoming = drives.filter(d => d.status === 'upcoming').length;
        
        // Count total selected students across drives
        const selectedIds = new Set();
        drives.forEach(d => {
          d.selectedStudents.forEach(id => selectedIds.add(id));
        });

        // Compute mock total student count to find placement rate
        const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        const studentCount = users.filter(u => u.role === 'student').length;
        const rate = studentCount > 0 ? Math.round((selectedIds.size / studentCount) * 100) : 0;

        setStats({
          totalCompanies: companies.size,
          upcomingDrives: upcoming,
          selectedCount: selectedIds.size,
          placementPercentage: rate
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Placement Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl">
        <h2 className="text-2xl font-extrabold font-display">Campus Placement Management</h2>
        <p className="text-sm text-indigo-100 mt-1">
          Placement Officer: {officer.fullName} • Recruitment Dashboard
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Companies */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Partner Companies</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats.totalCompanies}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Building2 size={20} />
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scheduled Drives</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats.upcomingDrives}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Calendar size={20} />
          </div>
        </div>

        {/* Placed Students */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Placed Candidates</span>
            <p className="text-3xl font-black text-emerald-500 mt-1.5">{stats.selectedCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Placement Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Placement Ratio</span>
            <p className="text-3xl font-black text-blue-650 mt-1.5">{stats.placementPercentage}%</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-650 rounded-2xl">
            <Award size={20} />
          </div>
        </div>

      </div>

    </div>
  );
};

// 2. SCHEDULER & DRIVE MANAGER
const PlacementDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form variables
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadDrives = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementDrives();
      setDrives(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = mockDB.subscribePlacementDrives((data) => {
      setDrives(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!companyName || !role || !salaryPackage || !eligibility || !driveDate) return;

    try {
      setSubmitting(true);
      await mockDB.createPlacementDrive(companyName, role, salaryPackage, eligibility, driveDate);
      showToast(`Recruitment session scheduled for ${companyName}!`, 'success');
      
      // Reset form
      setCompanyName('');
      setRole('');
      setSalaryPackage('');
      setEligibility('');
      setDriveDate('');
      loadDrives();
    } catch (_) {
      showToast('Could not register recruitment drive.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Add Company Scheduler */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-base font-extrabold text-slate-850 dark:text-white mb-5">Schedule Campus Recruitment</h3>
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Netflix Inc."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">Job Designation</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineering Associate"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">LPA package</label>
              <input
                type="text"
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                placeholder="e.g., 14 LPA"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">Drive Date</label>
              <input
                type="date"
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase">Eligibility Criteria</label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g., CGPA > 8.0, All Branches"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>{submitting ? 'Registering...' : 'Publish Drive'}</span>
          </button>
        </form>
      </div>

      {/* Drives list */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Scheduled Drives list</span>
        
        {loading ? (
          <div className="space-y-4">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-20 text-slate-450 dark:text-slate-500 text-xs font-semibold">No active drives in list.</div>
        ) : (
          <div className="space-y-4">
            {drives.map(d => (
              <div key={d.driveId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-805 dark:text-slate-200">{d.companyName}</h4>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">{d.role} • <span className="text-blue-600 dark:text-blue-400">{d.salaryPackage}</span></span>
                  </div>
                  <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                    d.status === 'completed' ? 'bg-slate-200 text-slate-650' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                  <span>Eligibility: {d.eligibility}</span>
                  <span>Date: {d.driveDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 3. CANDIDATES PANEL (SCREENING BOARDS)
const PlacementCandidates = () => {
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();

  const loadDrives = async () => {
    const data = await mockDB.getPlacementDrives();
    setDrives(data);
    if (data.length > 0 && !selectedDriveId) {
      setSelectedDriveId(data[0].driveId);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  const loadApplicants = () => {
    if (!selectedDriveId) return;
    setLoading(true);
    
    const activeDrive = drives.find(d => d.driveId === selectedDriveId);
    if (!activeDrive) {
      setApplicants([]);
      setLoading(false);
      return;
    }

    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');

    // Get profiles matching applicants list
    const candidateRows = activeDrive.applicants.map(uid => {
      const u = users.find(x => x.uid === uid);
      const s = studentsList.find(x => x.studentId === uid) || { cgpa: 8.0 };
      
      return {
        uid,
        name: u ? u.fullName : 'Unknown Student',
        rollNumber: u ? u.rollNumber : 'N/A',
        branch: u ? u.department : 'N/A',
        cgpa: s.cgpa,
        isSelected: activeDrive.selectedStudents.includes(uid)
      };
    });

    setApplicants(candidateRows);
    setLoading(false);
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedDriveId, drives]);

  const handleSelectionToggle = async (studentId, currentVal) => {
    try {
      await mockDB.updatePlacementSelection(selectedDriveId, studentId, !currentVal);
      showToast(
        !currentVal 
          ? 'Candidate marked as selected for placement offer!' 
          : 'Candidate selection revoked.', 
        'info'
      );
      loadDrives(); // re-fetch to trigger reactive reload
    } catch (_) {
      showToast('Could not save candidates status.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
      
      {/* Head */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Candidates Screening Board</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Select scheduled drives to see applicants, filter averages and select placements</p>
        </div>

        <div>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            <option value="" disabled>Select Drive Session</option>
            {drives.map(d => (
              <option key={d.driveId} value={d.driveId}>{d.companyName} - {d.role}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 text-slate-450 dark:text-slate-500 text-xs font-semibold">No students have applied for this drive yet.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3 text-center">CGPA Score</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-250">
              {applicants.map(c => (
                <tr key={c.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{c.rollNumber}</td>
                  <td className="px-5 py-4">{c.name}</td>
                  <td className="px-5 py-4">{c.branch}</td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400">{c.cgpa}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleSelectionToggle(c.uid, c.isSelected)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold border transition-colors ${
                        c.isSelected 
                          ? 'bg-emerald-500 text-white border-emerald-600' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-405 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c.isSelected ? 'Selected' : 'Select Student'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PlacementPortal;
