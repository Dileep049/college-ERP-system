import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { COLLEGE_DEPARTMENTS } from '../utils/departments';
import { 
  Briefcase, 
  Building2, 
  Users, 
  Award, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  X, 
  ChevronRight, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  FileText, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ClipboardList, 
  BookOpen, 
  Lock, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Send, 
  Printer, 
  Download, 
  Check, 
  AlertCircle, 
  Settings, 
  Layers, 
  BarChart2,
  Eye,
  CheckSquare,
  RefreshCw
} from 'lucide-react';

export const PlacementPortal = ({ subPage }) => {
  const { user } = useAuth();

  if (subPage === 'dashboard') return <PlacementDashboard officer={user} />;
  if (subPage === 'drives' || subPage === 'upcoming-drives') return <PlacementDrives officer={user} subType={subPage} />;
  if (subPage === 'applications' || subPage === 'shortlisted') return <PlacementApplications officer={user} filterType={subPage} />;
  if (subPage === 'students' || subPage === 'candidates') return <PlacementCandidates officer={user} />;
  if (subPage === 'selected') return <PlacementSelectedStudents officer={user} />;
  if (subPage === 'interviews') return <PlacementInterviews officer={user} />;
  if (subPage === 'partners') return <PlacementPartners officer={user} />;
  if (subPage === 'training') return <PlacementTraining officer={user} />;
  if (subPage === 'analytics') return <PlacementAnalytics officer={user} />;
  if (subPage === 'reports') return <PlacementReports officer={user} />;
  if (subPage === 'notifications') return <PlacementNotifications officer={user} />;
  if (subPage === 'settings') return <PlacementSettings officer={user} />;
  return <PlacementDashboard officer={user} />;
};

// 1. PLACEMENT DASHBOARD (COMMAND CENTER)
const PlacementDashboard = ({ officer }) => {
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drivesData, appsData, compData, usersData] = await Promise.all([
        mockDB.getPlacementDrives(),
        mockDB.getPlacementApplications(),
        mockDB.getPlacementCompanies(),
        mockDB.getAllUsers()
      ]);

      setDrives(drivesData);
      setApplications(appsData);
      setCompanies(compData);
      setStudents(usersData.filter(u => u.role === 'student'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-28 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-24 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>)}
        </div>
      </div>
    );
  }

  // Real Database Metrics Calculation
  const totalCompanies = companies.length || new Set(drives.map(d => d.companyName)).size;
  const upcomingDrives = drives.filter(d => (d.status || '').toLowerCase() === 'published' || (d.status || '').toLowerCase() === 'upcoming' || (d.status || '').toLowerCase() === 'open').length;
  const activeDrives = drives.filter(d => (d.status || '').toLowerCase() === 'open' || (d.status || '').toLowerCase() === 'published' || (d.status || '').toLowerCase() === 'registration open').length;
  const completedDrives = drives.filter(d => (d.status || '').toLowerCase() === 'closed' || (d.status || '').toLowerCase() === 'completed').length;
  const totalApplications = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length;
  const selectedCount = applications.filter(a => a.status === 'Selected').length;
  const pendingCount = applications.filter(a => a.status === 'Applied' || a.status === 'Under Review').length;
  const drivesThisMonth = drives.length;

  const totalFinalYearStudents = students.length || 1;
  const placementRate = Math.min(100, Math.round((selectedCount / totalFinalYearStudents) * 100));

  // Dynamic Branch breakdown
  const branches = COLLEGE_DEPARTMENTS;
  const branchData = branches.map(b => {
    const totalBranchStuds = students.filter(s => (s.department || s.branch || '').toUpperCase().includes(b.toUpperCase()) || b.toUpperCase().includes((s.department || s.branch || '').toUpperCase())).length || 1;
    const placedBranchStuds = applications.filter(a => a.status === 'Selected' && ((a.department || a.branch || '').toUpperCase().includes(b.toUpperCase()) || b.toUpperCase().includes((a.department || a.branch || '').toUpperCase()))).length;
    return {
      name: b,
      total: totalBranchStuds,
      placed: placedBranchStuds,
      rate: Math.min(100, Math.round((placedBranchStuds / totalBranchStuds) * 100))
    };
  });

  return (
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. PLACEMENT COMMAND CENTER BANNER (BLUE TINTED GLASS) */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-200 bg-blue-500/20 px-3.5 py-1 rounded-full border border-blue-400/30 drop-shadow-md">
            Placement Command Center
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mt-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Campus Recruitment Console</h2>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">
            Officer: <strong className="text-blue-300 font-bold drop-shadow">{officer?.fullName || officer?.name || 'Placement Cell'}</strong> • Live Firestore Recruitment Intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 text-white drop-shadow-md shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <RefreshCw size={15} /> Refresh Live Data
          </button>
        </div>
      </div>

      {/* 2. 10 DARK TINTED STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Partner Companies</span>
            <div className="p-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl shadow-md"><Building2 size={16} /></div>
          </div>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{totalCompanies}</p>
          <span className="text-[10px] text-gray-200 font-bold block mt-1 drop-shadow-md">Active Alliances</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Upcoming Drives</span>
            <div className="p-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl shadow-md"><Calendar size={16} /></div>
          </div>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{upcomingDrives}</p>
          <span className="text-[10px] text-indigo-300 font-bold block mt-1 drop-shadow-md">Scheduled</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Active Drives</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl shadow-md"><Briefcase size={16} /></div>
          </div>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{activeDrives}</p>
          <span className="text-[10px] text-emerald-300 font-bold block mt-1 drop-shadow-md">Registration Open</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Completed Drives</span>
            <div className="p-2 bg-white/10 text-gray-200 border border-white/20 rounded-xl shadow-md"><CheckSquare size={16} /></div>
          </div>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{completedDrives}</p>
          <span className="text-[10px] text-gray-200 font-bold block mt-1 drop-shadow-md">Finished Sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Total Applications</span>
            <div className="p-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-xl shadow-md"><ClipboardList size={16} /></div>
          </div>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{totalApplications}</p>
          <span className="text-[10px] text-purple-300 font-bold block mt-1 drop-shadow-md">Submissions</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Shortlisted</span>
            <div className="p-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl shadow-md"><UserCheck size={16} /></div>
          </div>
          <p className="text-amber-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{shortlistedCount}</p>
          <span className="text-[10px] text-amber-200 font-bold block mt-1 drop-shadow-md">Interview Round</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Students Placed</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl shadow-md"><Award size={16} /></div>
          </div>
          <p className="text-emerald-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{selectedCount}</p>
          <span className="text-[10px] text-emerald-300 font-bold block mt-1 drop-shadow-md">Offers Issued</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Placement Ratio</span>
            <div className="p-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl shadow-md"><TrendingUp size={16} /></div>
          </div>
          <p className="text-blue-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{placementRate}%</p>
          <span className="text-[10px] text-gray-200 font-bold block mt-1 drop-shadow-md">Batch Ratio</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Pending Review</span>
            <div className="p-2 bg-orange-500/20 text-orange-300 border border-orange-400/30 rounded-xl shadow-md"><Clock size={16} /></div>
          </div>
          <p className="text-orange-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{pendingCount}</p>
          <span className="text-[10px] text-orange-200 font-bold block mt-1 drop-shadow-md">Awaiting Action</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Drives This Month</span>
            <div className="p-2 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl shadow-md"><Layers size={16} /></div>
          </div>
          <p className="text-teal-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display mt-2">{drivesThisMonth}</p>
          <span className="text-[10px] text-teal-200 font-bold block mt-1 drop-shadow-md">Current Month</span>
        </div>

      </div>

      {/* 3. ANALYTICS SECTION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Branch-wise Placements */}
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white drop-shadow-lg">Branch-wise Placement Statistics</h3>
              <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">Real-time breakdown of selections per department</p>
            </div>
            <BarChart2 className="text-blue-400" size={18} />
          </div>

          <div className="space-y-3 pt-2">
            {branchData.map(b => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white drop-shadow-sm">{b.name}</span>
                  <span className="text-gray-200 font-medium">{b.placed} Placed ({b.rate}%)</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ width: `${Math.max(5, b.rate)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company-wise Selections & Recent Activity */}
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white drop-shadow-lg">Recent Published Drives & Offers</h3>
              <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">Live recruitment drive feed from Firestore</p>
            </div>
            <Award className="text-emerald-400" size={18} />
          </div>

          <div className="space-y-3">
            {drives.length === 0 ? (
              <div className="py-8 text-center text-gray-200 font-bold">No placement drives published yet.</div>
            ) : (
              drives.slice(0, 4).map(d => (
                <div key={d.id || d.driveId} className="p-3.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={d.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80'} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/20 bg-white" />
                    <div>
                      <h4 className="font-extrabold text-white text-xs drop-shadow-md">{d.companyName}</h4>
                      <p className="text-[10px] text-gray-200 font-bold mt-0.5">{d.jobRole} • <span className="text-blue-300">{d.package}</span></p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase drop-shadow ${
                    (d.status || '').toLowerCase() === 'published' || (d.status || '').toLowerCase() === 'open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-gray-200 border border-white/20'
                  }`}>
                    {d.status || 'Published'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// 2. MANAGE PLACEMENT DRIVES & 4. UPCOMING DRIVES
const PlacementDrives = ({ officer, subType }) => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [location, setLocation] = useState('Bangalore / Hyderabad');
  const [packageVal, setPackageVal] = useState('12.0 LPA');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [eligibleBranches, setEligibleBranches] = useState([COLLEGE_DEPARTMENTS[0], COLLEGE_DEPARTMENTS[1]]);
  const [eligibleSemester, setEligibleSemester] = useState('Semester 8');
  const [passingYear, setPassingYear] = useState('2026');
  const [requiredSkills, setRequiredSkills] = useState('Java, Data Structures, SQL');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [selectionProcess, setSelectionProcess] = useState('Online Test → Tech Round → HR Round');
  const [venue, setVenue] = useState('Campus Placement Auditorium');
  const [registrationLink, setRegistrationLink] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Published');

  const loadDrives = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementDrives();
      setDrives(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  const openCreateModal = () => {
    setEditingDrive(null);
    setCompanyName('');
    setCompanyLogo('');
    setJobRole('');
    setJobType('Full-Time');
    setLocation('Bangalore / Hyderabad');
    setPackageVal('12.0 LPA');
    setMinCgpa('7.0');
    setMaxBacklogs('0');
    setEligibleBranches([COLLEGE_DEPARTMENTS[0], COLLEGE_DEPARTMENTS[1]]);
    setEligibleSemester('Semester 8');
    setPassingYear('2026');
    setRequiredSkills('Java, Data Structures, SQL');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline('2026-09-30');
    setDriveDate('2026-10-05');
    setSelectionProcess('Online Test → Tech Round → HR Round');
    setVenue('Campus Placement Cell Auditorium');
    setRegistrationLink('');
    setDescription('Campus recruitment drive for final year students.');
    setStatus('Published');
    setShowModal(true);
  };

  const openEditModal = (d) => {
    setEditingDrive(d);
    setCompanyName(d.companyName || '');
    setCompanyLogo(d.companyLogo || '');
    setJobRole(d.jobRole || d.role || '');
    setJobType(d.jobType || 'Full-Time');
    setLocation(d.location || '');
    setPackageVal(d.package || d.salaryPackage || '');
    setMinCgpa(d.minCgpa !== undefined ? String(d.minCgpa) : '7.0');
    setMaxBacklogs(d.maxBacklogs !== undefined ? String(d.maxBacklogs) : '0');
    setEligibleBranches(Array.isArray(d.eligibleBranches) ? d.eligibleBranches : [COLLEGE_DEPARTMENTS[0]]);
    setEligibleSemester(d.eligibleSemester || 'Semester 8');
    setPassingYear(d.passingYear || '2026');
    setRequiredSkills(Array.isArray(d.requiredSkills) ? d.requiredSkills.join(', ') : (d.requiredSkills || ''));
    setStartDate(d.startDate || '');
    setDeadline(d.deadline || d.applicationDeadline || '');
    setDriveDate(d.driveDate || '');
    setSelectionProcess(d.selectionProcess || '');
    setVenue(d.venue || '');
    setRegistrationLink(d.registrationLink || '');
    setDescription(d.description || '');
    setStatus(d.status || 'Published');
    setShowModal(true);
  };

  const toggleBranch = (b) => {
    if (eligibleBranches.includes(b)) {
      setEligibleBranches(eligibleBranches.filter(x => x !== b));
    } else {
      setEligibleBranches([...eligibleBranches, b]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !jobRole || !packageVal) {
      showToast('Please complete mandatory company name, job role, and salary package.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        companyName,
        companyLogo: companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
        jobRole,
        jobType,
        location,
        package: packageVal,
        minCgpa: parseFloat(minCgpa) || 6.0,
        maxBacklogs: parseInt(maxBacklogs) || 0,
        eligibleBranches,
        eligibleSemester,
        passingYear,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        startDate,
        deadline,
        applicationDeadline: deadline,
        driveDate,
        selectionProcess,
        venue,
        registrationLink,
        description,
        status
      };

      if (editingDrive) {
        await mockDB.updatePlacementDrive(editingDrive.id || editingDrive.driveId, payload);
        showToast(`Placement Drive for "${companyName}" updated!`, 'success');
      } else {
        await mockDB.createPlacementDrive(payload);
        showToast(`New Placement Drive for "${companyName}" published!`, 'success');
      }

      setShowModal(false);
      loadDrives();
    } catch (err) {
      console.error(err);
      showToast('Failed to save placement drive.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await mockDB.updateDriveStatus(driveId, newStatus);
      showToast(`Drive status updated to ${newStatus}`, 'info');
      loadDrives();
    } catch (_) {
      showToast('Could not update drive status.', 'error');
    }
  };

  const handleDelete = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await mockDB.deletePlacementDrive(driveId);
      showToast('Placement drive deleted.', 'info');
      loadDrives();
    } catch (_) {
      showToast('Could not delete drive.', 'error');
    }
  };

  const allBranches = COLLEGE_DEPARTMENTS;

  // Filter drives if upcoming subType
  const displayedDrives = subType === 'upcoming-drives' 
    ? drives.filter(d => (d.status || '').toLowerCase() === 'published' || (d.status || '').toLowerCase() === 'open' || (d.status || '').toLowerCase() === 'registration open' || (d.status || '').toLowerCase() === 'upcoming')
    : drives;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      {/* Universal Glass Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Placement Cell Operations
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">
            {subType === 'upcoming-drives' ? 'Published & Scheduled Upcoming Drives' : 'Campus Placement Drives Management'}
          </h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">
            Publish, edit, unpublish drafts, and close recruitment drives visible to eligible students
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]"
        >
          <Plus size={16} /> Create & Publish Drive
        </button>
      </div>

      {/* Drives List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>)}
        </div>
      ) : displayedDrives.length === 0 ? (
        <div className="p-12 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-gray-300 font-bold">
          {subType === 'upcoming-drives' ? 'No active upcoming placement drives published.' : 'No placement drives created yet. Click "Create & Publish Drive" to schedule one.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedDrives.map(d => (
            <div key={d.id || d.driveId} className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all space-y-4 relative flex flex-col justify-between text-white">
              
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <img src={d.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80'} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/20 bg-white" />
                    <div>
                      <h4 className="text-sm font-black text-white drop-shadow-md">{d.companyName}</h4>
                      <p className="text-xs text-cyan-300 font-extrabold drop-shadow-sm">{d.jobRole || d.role}</p>
                    </div>
                  </div>
                  <select
                    value={d.status || 'Published'}
                    onChange={(e) => handleStatusChange(d.id || d.driveId, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase border focus:outline-none cursor-pointer ${
                      (d.status || '').toLowerCase() === 'published' || (d.status || '').toLowerCase() === 'open' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                        : (d.status || '').toLowerCase() === 'closed' 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                        : (d.status || '').toLowerCase() === 'draft'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-white/10 text-gray-200 border-white/20'
                    }`}
                  >
                    <option value="Draft" className="bg-slate-900 text-white">Draft</option>
                    <option value="Published" className="bg-slate-900 text-white">Published</option>
                    <option value="Open" className="bg-slate-900 text-white">Open</option>
                    <option value="Closed" className="bg-slate-900 text-white">Closed</option>
                    <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                    <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                  </select>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 text-gray-200">
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Package / CTC</span> <span className="font-extrabold text-cyan-300">{d.package || d.salaryPackage}</span></div>
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Location</span> <span className="font-bold text-white">{d.location || 'Pan-India'}</span></div>
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Min CGPA</span> <span className="font-bold text-white">{d.minCgpa || 6.0} CGPA</span></div>
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Max Backlogs</span> <span className="font-bold text-white">{d.maxBacklogs !== undefined ? d.maxBacklogs : 0} Backlog</span></div>
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Drive Date</span> <span className="font-bold text-white">{d.driveDate || 'TBA'}</span></div>
                  <div><span className="text-gray-400 font-extrabold block text-[9.5px] uppercase">Deadline</span> <span className="font-bold text-rose-300">{d.deadline || d.applicationDeadline || 'TBA'}</span></div>
                </div>

                {/* Eligible Branches */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-gray-400 font-extrabold text-[9.5px] uppercase block mb-1.5">Eligible Branches</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(d.eligibleBranches) ? d.eligibleBranches : ['CSE']).map((b, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-white/10 text-cyan-300 border border-white/15 rounded-lg font-bold text-[10px] drop-shadow-sm">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => openEditModal(d)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={14} /> Edit Drive
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(d.id || d.driveId, (d.status === 'Closed' ? 'Published' : 'Closed'))}
                    className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl font-bold transition-all text-[11px] cursor-pointer"
                  >
                    {d.status === 'Closed' ? 'Re-open' : 'Close'}
                  </button>
                  <button
                    onClick={() => handleDelete(d.id || d.driveId)}
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 space-y-5 my-8 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-black text-white drop-shadow-md">
                {editingDrive ? 'Edit Placement Drive' : 'Publish New Campus Recruitment Drive'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Company Name *</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="e.g., Google Inc." className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Company Logo URL</label>
                  <input type="text" value={companyLogo} onChange={e => setCompanyLogo(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Job Role / Title *</label>
                  <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g., Software Engineer" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Job Type</label>
                  <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none">
                    <option value="Full-Time" className="bg-slate-900 text-white">Full-Time</option>
                    <option value="Internship" className="bg-slate-900 text-white">Internship</option>
                    <option value="Full-Time + Internship" className="bg-slate-900 text-white">Full-Time + Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Salary Package (CTC) *</label>
                  <input type="text" value={packageVal} onChange={e => setPackageVal(e.target.value)} required placeholder="e.g., 14.5 LPA" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Minimum CGPA Required</label>
                  <input type="number" step="0.1" value={minCgpa} onChange={e => setMinCgpa(e.target.value)} required placeholder="7.0" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Max Active Backlogs Allowed</label>
                  <input type="number" value={maxBacklogs} onChange={e => setMaxBacklogs(e.target.value)} required placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Work Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Bangalore / Hybrid" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
              </div>

              {/* Eligible Branches Checkboxes */}
              <div>
                <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1.5">Eligible Branches</label>
                <div className="flex flex-wrap gap-2">
                  {allBranches.map(b => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBranch(b)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        eligibleBranches.includes(b)
                          ? 'bg-blue-600/80 text-white border-blue-400/50 shadow-md'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Application Deadline</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Drive Date</label>
                  <input type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none">
                    <option value="Published" className="bg-slate-900 text-white">Published (Visible to Students)</option>
                    <option value="Draft" className="bg-slate-900 text-white">Draft (Hidden from Students)</option>
                    <option value="Registration Open" className="bg-slate-900 text-white">Registration Open</option>
                    <option value="Closed" className="bg-slate-900 text-white">Closed</option>
                    <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                    <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Venue / Online Link</label>
                  <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Auditorium / Virtual Link" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-extrabold uppercase text-[9.5px] mb-1">Job Description & Requirements</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Overview of role, responsibilities, and key expectations..." className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"></textarea>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 cursor-pointer">
                  {submitting ? 'Saving...' : (editingDrive ? 'Update Drive' : 'Publish Drive')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// 3. APPLICATIONS SCREENING DESK & SHORTLISTING
const PlacementApplications = ({ officer, filterType }) => {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(filterType === 'shortlisted' ? 'Shortlisted' : 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule Interview Modal
  const [interviewApp, setInterviewApp] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [round, setRound] = useState('Technical Interview');
  const [intDate, setIntDate] = useState('');
  const [intTime, setIntTime] = useState('10:00 AM');
  const [intVenue, setIntVenue] = useState('Placement Cell Room 102 / Teams');
  const [intLink, setIntLink] = useState('');
  const [intInstructions, setIntInstructions] = useState('Bring physical resume copy and college ID card.');

  const { showToast } = useAuth();

  const loadAppData = async () => {
    try {
      setLoading(true);
      const [appsData, drivesData] = await Promise.all([
        mockDB.getPlacementApplications(),
        mockDB.getPlacementDrives()
      ]);
      setApplications(appsData);
      setDrives(drivesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await mockDB.updateApplicationStatus(appId, newStatus);
      showToast(`Student application status updated to "${newStatus}"`, 'success');
      loadAppData();
    } catch (_) {
      showToast('Could not update application status.', 'error');
    }
  };

  const handleOpenInterviewModal = (app) => {
    setInterviewApp(app);
    setIntDate(new Date().toISOString().split('T')[0]);
    setShowInterviewModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewApp) return;

    try {
      await mockDB.scheduleInterview({
        applicationId: interviewApp.id || interviewApp.applicationId,
        studentId: interviewApp.studentId,
        studentName: interviewApp.studentName,
        companyName: interviewApp.companyName,
        jobRole: interviewApp.jobRole,
        round,
        date: intDate,
        time: intTime,
        venue: intVenue,
        meetingLink: intLink,
        instructions: intInstructions
      });

      showToast(`Interview scheduled for ${interviewApp.studentName}! Notification sent.`, 'success');
      setShowInterviewModal(false);
      loadAppData();
    } catch (_) {
      showToast('Could not schedule interview.', 'error');
    }
  };

  // Filter applications
  const filteredApps = applications.filter(a => {
    if (selectedDriveId && a.driveId !== selectedDriveId) return false;
    if (selectedBranch !== 'ALL' && !(a.branch || '').toUpperCase().includes(selectedBranch)) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.studentName || '').toLowerCase().includes(q);
      const matchRoll = (a.rollNumber || '').toLowerCase().includes(q);
      const matchComp = (a.companyName || '').toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchComp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      {/* Universal Glass Banner & Filter Bar */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
              Recruitment Evaluation Desk
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">
              Student Placement Applications & Shortlisting
            </h3>
            <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">
              Review student applicants, check eligibility, shortlist, schedule interviews, and mark final selections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-white/10 text-cyan-300 border border-white/20 rounded-xl font-extrabold text-xs drop-shadow-md backdrop-blur-md">
              {filteredApps.length} Applications Found
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Student Name / Roll..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <select
            value={selectedDriveId}
            onChange={e => setSelectedDriveId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-white">All Recruitment Drives</option>
            {drives.map(d => (
              <option key={d.id || d.driveId} value={d.id || d.driveId} className="bg-slate-900 text-white">{d.companyName} - {d.jobRole || d.role}</option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Branches</option>
            <option value="CSE" className="bg-slate-900 text-white">CSE</option>
            <option value="ECE" className="bg-slate-900 text-white">ECE</option>
            <option value="EEE" className="bg-slate-900 text-white">EEE</option>
            <option value="AI & ML" className="bg-slate-900 text-white">AI & ML</option>
            <option value="CIVIL" className="bg-slate-900 text-white">Civil</option>
            <option value="MECHANICAL" className="bg-slate-900 text-white">Mechanical</option>
            <option value="MCA" className="bg-slate-900 text-white">MCA</option>
            <option value="BCA" className="bg-slate-900 text-white">BCA</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
            <option value="Applied" className="bg-slate-900 text-white">Applied</option>
            <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
            <option value="Shortlisted" className="bg-slate-900 text-white">Shortlisted</option>
            <option value="Interview Scheduled" className="bg-slate-900 text-white">Interview Scheduled</option>
            <option value="Selected" className="bg-slate-900 text-white">Selected</option>
            <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
          </select>

        </div>
      </div>

      {/* Applications Table Card */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Loading student applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="py-20 text-center text-gray-300 font-bold">No student applications match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-300 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Drive / Role</th>
                  <th className="px-4 py-3.5 text-center">CGPA / Backlogs</th>
                  <th className="px-4 py-3.5">Skills & Resume</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white font-bold">
                {filteredApps.map(a => (
                  <tr key={a.id || a.applicationId} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-300 font-black flex items-center justify-center text-sm border border-blue-400/30 drop-shadow">
                          {a.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white drop-shadow-sm">{a.studentName}</p>
                          <p className="text-[10px] text-gray-300">{a.rollNumber} • {a.branch} (Sec {a.section || 'A'})</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-white">{a.companyName}</p>
                      <p className="text-[10px] text-cyan-300 font-bold">{a.jobRole} ({a.package})</p>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 font-extrabold rounded-lg">
                        {a.cgpa} CGPA
                      </span>
                      <span className="block text-[9.5px] text-gray-400 mt-0.5">
                        {a.backlogs > 0 ? `${a.backlogs} Backlog` : '0 Backlogs'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-[10px] text-gray-300 max-w-xs truncate">{a.skills || 'N/A'}</p>
                      <a href={a.resumeUrl || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1 mt-0.5">
                        <FileText size={12} /> View Resume
                      </a>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black uppercase border ${
                        a.status === 'Selected' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                        a.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                        a.status === 'Interview Scheduled' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' :
                        a.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      }`}>
                        {a.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== 'Shortlisted' && (
                          <button
                            onClick={() => handleStatusChange(a.id || a.applicationId, 'Shortlisted')}
                            className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            title="Shortlist Student"
                          >
                            Shortlist
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenInterviewModal(a)}
                          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                          title="Schedule Interview Round"
                        >
                          Interview
                        </button>
                        {a.status !== 'Selected' && (
                          <button
                            onClick={() => handleStatusChange(a.id || a.applicationId, 'Selected')}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            title="Mark Selected"
                          >
                            Select
                          </button>
                        )}
                        {a.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(a.id || a.applicationId, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            title="Reject Candidate"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && interviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white drop-shadow-md">Schedule Interview Round</h3>
                <p className="text-xs text-gray-300 mt-0.5">Candidate: {interviewApp.studentName} ({interviewApp.companyName})</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Interview Round</label>
                <select value={round} onChange={e => setRound(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none">
                  <option value="Aptitude Test" className="bg-slate-900 text-white">Aptitude Test</option>
                  <option value="Coding Test" className="bg-slate-900 text-white">Coding Test</option>
                  <option value="Technical Interview" className="bg-slate-900 text-white">Technical Interview</option>
                  <option value="HR Interview" className="bg-slate-900 text-white">HR Interview</option>
                  <option value="Group Discussion" className="bg-slate-900 text-white">Group Discussion</option>
                  <option value="Final Interview" className="bg-slate-900 text-white">Final Interview</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Interview Date</label>
                  <input type="date" value={intDate} onChange={e => setIntDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Time</label>
                  <input type="text" value={intTime} onChange={e => setIntTime(e.target.value)} required placeholder="10:00 AM" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Venue / Room / Link</label>
                <input type="text" value={intVenue} onChange={e => setIntVenue(e.target.value)} required placeholder="Placement Hall Room 102" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              </div>

              <div>
                <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Virtual Meeting Link (Optional)</label>
                <input type="text" value={intLink} onChange={e => setIntLink(e.target.value)} placeholder="https://teams.microsoft.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              </div>

              <div>
                <label className="block text-gray-300 uppercase text-[9.5px] font-bold mb-1">Instructions for Student</label>
                <textarea rows={2} value={intInstructions} onChange={e => setIntInstructions(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none"></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowInterviewModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 cursor-pointer">Schedule Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// 4. ELIGIBLE CANDIDATES DIRECTORY & DRIVE EVALUATION
const PlacementCandidates = () => {
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState('0');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const [usersData, appsData, drivesData] = await Promise.all([
        mockDB.getAllUsers(),
        mockDB.getPlacementApplications(),
        mockDB.getPlacementDrives()
      ]);

      const studs = usersData.filter(u => u.role === 'student').map(s => {
        const studentApps = appsData.filter(a => a.studentId === s.uid || a.studentId === s.id);
        const placedApp = studentApps.find(a => a.status === 'Selected');
        return {
          ...s,
          cgpa: parseFloat(s.cgpa || s.gpa || 7.5),
          backlogs: parseInt(s.backlogs || 0),
          appliedCount: studentApps.length,
          placementStatus: placedApp ? `Placed at ${placedApp.companyName}` : 'Unplaced'
        };
      });

      setStudents(studs);
      setApplications(appsData);
      setDrives(drivesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const selectedDrive = drives.find(d => (d.id || d.driveId) === selectedDriveId);

  const evaluatedStudents = students.map(s => {
    let isEligible = true;
    let reason = 'Eligible';

    if (selectedDrive) {
      const studentBranch = (s.department || s.branch || 'CSE').toUpperCase().trim();
      const minCgpa = selectedDrive.minCgpa !== undefined ? parseFloat(selectedDrive.minCgpa) : 6.0;
      const maxBacklogs = selectedDrive.maxBacklogs !== undefined ? parseInt(selectedDrive.maxBacklogs) : 0;
      const eligibleBranches = Array.isArray(selectedDrive.eligibleBranches) ? selectedDrive.eligibleBranches : [];

      if (s.cgpa < minCgpa) {
        isEligible = false;
        reason = `CGPA < ${minCgpa}`;
      } else if (s.backlogs > maxBacklogs) {
        isEligible = false;
        reason = `Backlogs > ${maxBacklogs}`;
      } else if (eligibleBranches.length > 0) {
        const branchMatch = eligibleBranches.some(b => b.toUpperCase().trim() === 'ALL' || b.toUpperCase().trim() === studentBranch || studentBranch.includes(b.toUpperCase().trim()));
        if (!branchMatch) {
          isEligible = false;
          reason = `Branch Mismatch (${studentBranch})`;
        }
      }
    }

    return { ...s, isEligible, reason };
  });

  const filteredStudents = evaluatedStudents.filter(s => {
    if (branchFilter !== 'ALL' && !(s.department || s.branch || '').toUpperCase().includes(branchFilter)) return false;
    if (s.cgpa < parseFloat(minCgpaFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      {/* Universal Glass Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Candidate Directory
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">
            Eligible Candidates & Batch Directory
          </h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">
            Directory of student profiles, CGPA scores, backlogs, and drive eligibility evaluation
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedDriveId}
            onChange={e => setSelectedDriveId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-white">Evaluate for All Drives</option>
            {drives.map(d => (
              <option key={d.id || d.driveId} value={d.id || d.driveId} className="bg-slate-900 text-white">Drive: {d.companyName} ({d.jobRole})</option>
            ))}
          </select>

          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
            <option value="ALL" className="bg-slate-900 text-white">All Branches</option>
            <option value="CSE" className="bg-slate-900 text-white">CSE</option>
            <option value="ECE" className="bg-slate-900 text-white">ECE</option>
            <option value="EEE" className="bg-slate-900 text-white">EEE</option>
            <option value="AI & ML" className="bg-slate-900 text-white">AI & ML</option>
            <option value="CIVIL" className="bg-slate-900 text-white">Civil</option>
            <option value="MECHANICAL" className="bg-slate-900 text-white">Mechanical</option>
          </select>

          <select value={minCgpaFilter} onChange={e => setMinCgpaFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
            <option value="0" className="bg-slate-900 text-white">All CGPA</option>
            <option value="6.0" className="bg-slate-900 text-white">CGPA 6.0+</option>
            <option value="7.0" className="bg-slate-900 text-white">CGPA 7.0+</option>
            <option value="8.0" className="bg-slate-900 text-white">CGPA 8.0+</option>
          </select>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Loading student roster...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center text-gray-300 font-bold">No students found matching current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-300 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <th className="px-5 py-3.5">Roll Number</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Branch & Semester</th>
                  <th className="px-5 py-3.5 text-center">CGPA Score</th>
                  <th className="px-5 py-3.5 text-center">Active Backlogs</th>
                  {selectedDrive && <th className="px-5 py-3.5 text-center">Drive Eligibility</th>}
                  <th className="px-5 py-3.5 text-right">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-bold text-white">
                {filteredStudents.map(s => (
                  <tr key={s.uid || s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-cyan-300">{s.rollNumber || '245901'}</td>
                    <td className="px-5 py-4 font-black text-white">{s.fullName || s.studentName}</td>
                    <td className="px-5 py-4 text-gray-300">{s.department || s.branch} ({s.semester || 'Sem 8'})</td>
                    <td className="px-5 py-4 text-center text-cyan-300 font-extrabold">{s.cgpa}</td>
                    <td className="px-5 py-4 text-center text-gray-300">{s.backlogs}</td>
                    
                    {selectedDrive && (
                      <td className="px-5 py-4 text-center">
                        {s.isEligible ? (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-[10px] font-black">🟢 Eligible</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-bold">🔴 {s.reason}</span>
                        )}
                      </td>
                    )}

                    <td className="px-5 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        s.placementStatus.startsWith('Placed') 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                          : 'bg-white/10 text-gray-300 border border-white/15'
                      }`}>
                        {s.placementStatus}
                      </span>
                    </td>
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

// 5. SELECTED STUDENTS ROSTER (OFFERS WALL)
const PlacementSelectedStudents = () => {
  const [selectedApps, setSelectedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSelected = async () => {
      try {
        setLoading(true);
        const apps = await mockDB.getPlacementApplications();
        setSelectedApps(apps.filter(a => a.status === 'Selected'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSelected();
  }, []);

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-400/30 drop-shadow-md">
            Placement Hall of Fame
          </span>
          <h3 className="text-xl md:text-2xl font-black font-display text-white drop-shadow-md mt-1.5">Placed Students & Offer Letters Wall</h3>
          <p className="text-xs text-emerald-100/80 font-semibold drop-shadow-sm mt-0.5">Official list of campus recruitment selections and confirmed placement offers</p>
        </div>
        <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
          <Award size={32} className="text-emerald-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-44 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-pulse"></div>)
        ) : selectedApps.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-300 font-bold bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            No candidate selections recorded yet.
          </div>
        ) : (
          selectedApps.map(a => (
            <div key={a.id || a.applicationId} className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all space-y-3 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 font-black text-base flex items-center justify-center border border-emerald-400/30 drop-shadow">
                  {a.studentName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white drop-shadow-sm">{a.studentName}</h4>
                  <p className="text-[10px] text-gray-300">{a.rollNumber} • {a.branch}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1">
                <p className="text-xs font-black text-white">{a.companyName}</p>
                <p className="text-[11px] text-cyan-300 font-extrabold">{a.jobRole}</p>
                <p className="text-sm font-black text-emerald-400 mt-1">{a.package}</p>
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] text-gray-300 border-t border-white/10">
                <span>Selection: {a.appliedDate || new Date().toISOString().split('T')[0]}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg font-bold uppercase">Confirmed Offer</span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 6. INTERVIEW SCHEDULE
const PlacementInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInts = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getPlacementInterviews();
        setInterviews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadInts();
  }, []);

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Assessment Timetable
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Scheduled Interview Rounds & Assessments</h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Calendar of technical interviews, coding assessments, and group discussion sessions</p>
        </div>
        <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl">
          <Clock size={28} className="text-purple-300" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-pulse"></div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-gray-300 font-bold">
            No interviews scheduled currently. Schedule one from the Applications tab.
          </div>
        ) : (
          interviews.map(i => (
            <div key={i.id} className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg text-[9.5px] font-black uppercase">
                  {i.round}
                </span>
                <h4 className="text-sm font-black text-white drop-shadow-sm mt-1">{i.studentName} ({i.companyName})</h4>
                <p className="text-xs text-cyan-300 font-bold">{i.jobRole}</p>
                <p className="text-[10px] text-gray-300">Venue / Room: {i.venue}</p>
                {i.instructions && <p className="text-[10px] text-gray-400 italic">Instructions: {i.instructions}</p>}
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs font-black text-white">{i.date} • {i.time}</p>
                {i.meetingLink && (
                  <a href={i.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:underline flex items-center gap-1 justify-end font-bold">
                    <ExternalLink size={12} /> Virtual Meeting Room
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 7. CORPORATE RECRUITMENT PARTNERS
const PlacementPartners = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  const { showToast } = useAuth();

  const loadComps = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementCompanies();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComps();
  }, []);

  const openAddModal = () => {
    setEditingComp(null);
    setCompanyName('');
    setLogo('');
    setIndustry('Information Technology');
    setWebsite('');
    setLocation('Bangalore');
    setContactPerson('');
    setContactEmail('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingComp(c);
    setCompanyName(c.companyName || '');
    setLogo(c.logo || '');
    setIndustry(c.industry || '');
    setWebsite(c.website || '');
    setLocation(c.location || '');
    setContactPerson(c.contactPerson || '');
    setContactEmail(c.contactEmail || '');
    setDescription(c.description || '');
    setShowModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyName) return;

    try {
      await mockDB.savePlacementCompany({
        id: editingComp ? editingComp.id : undefined,
        companyName,
        logo: logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
        industry: industry || 'Information Technology',
        website,
        location,
        contactPerson,
        contactEmail,
        description,
        totalSelections: editingComp?.totalSelections || 12
      });

      showToast(`Corporate partner "${companyName}" saved!`, 'success');
      setShowModal(false);
      loadComps();
    } catch (_) {
      showToast('Could not save company.', 'error');
    }
  };

  const handleDeleteCompany = async (compId) => {
    if (!window.confirm('Remove this corporate partner?')) return;
    try {
      await mockDB.deletePlacementCompany(compId);
      showToast('Company partner deleted.', 'info');
      loadComps();
    } catch (_) {
      showToast('Could not delete company.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Industry Alliances
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Corporate Recruitment Partners Directory</h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Directory of tier-1 tech giants, MNCs, and industry recruitment alliances</p>
        </div>
        <button onClick={openAddModal} className="px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]">
          <Plus size={16} /> Add Corporate Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-pulse"></div>)
        ) : companies.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-300 font-bold bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">No corporate partners added.</div>
        ) : (
          companies.map(c => (
            <div key={c.id} className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all space-y-3 flex flex-col justify-between text-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={c.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-white" />
                    <div>
                      <h4 className="font-extrabold text-white text-sm drop-shadow-sm">{c.companyName}</h4>
                      <span className="text-[10px] text-gray-300 block">{c.industry}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-lg text-[9.5px] font-black uppercase">{c.location || 'Bangalore'}</span>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-2">{c.description}</p>
                <div className="pt-2 border-t border-white/10 text-[10px] text-gray-300 space-y-1">
                  <p>HR: {c.contactPerson} ({c.contactEmail})</p>
                  <p className="text-emerald-400 font-bold">Total Hired: {c.totalSelections || 12} Students</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button onClick={() => openEditModal(c)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-[10px] font-bold cursor-pointer transition-all">Edit</button>
                <button onClick={() => handleDeleteCompany(c.id)} className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white drop-shadow-md">{editingComp ? 'Edit Corporate Partner' : 'Add Corporate Partner'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCompany} className="space-y-3">
              <input type="text" value={companyName} onChange={e=>setCompanyName(e.target.value)} required placeholder="Company Name *" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={logo} onChange={e=>setLogo(e.target.value)} placeholder="Logo URL" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Industry Sector" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="HQ / Work Location" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="Contact Recruiter Name" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="Contact Recruiter Email" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <textarea rows={2} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Company Overview..." className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none"></textarea>
              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 cursor-pointer">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// 8. TRAINING & MOCK TESTS SCHEDULER
const PlacementTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Coding Test Prep');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('2 Hours');
  const [venue, setVenue] = useState('Computer Lab 4');
  const [trainer, setTrainer] = useState('Dr. Alan Turing');
  const [targetBranches, setTargetBranches] = useState('CSE, ECE, AI & ML');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');

  const { showToast } = useAuth();

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementTrainings();
      setTrainings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const handleSaveTraining = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    try {
      await mockDB.savePlacementTraining({
        title,
        type,
        date,
        duration,
        venue,
        trainer,
        targetBranches,
        link,
        description,
        status: 'Upcoming'
      });

      showToast('Placement Training Session published & broadcasted!', 'success');
      setShowModal(false);
      loadTrainings();
    } catch (_) {
      showToast('Could not schedule training session.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Skill Development Hub
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Placement Training & Mock Tests Hub</h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Schedule aptitude bootcamps, coding tests, mock interviews, and GD workshops</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]">
          <Plus size={16} /> Schedule Workshop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-pulse"></div>)
        ) : trainings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-300 font-bold bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">No training sessions scheduled.</div>
        ) : (
          trainings.map(t => (
            <div key={t.id} className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all space-y-3 text-white">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-lg text-[9.5px] font-black uppercase">{t.type}</span>
              <h4 className="text-sm font-black text-white drop-shadow-sm">{t.title}</h4>
              <p className="text-xs text-gray-300">Trainer: {t.trainer} • Date: {t.date}</p>
              <div className="pt-2 border-t border-white/10 text-[10px] text-gray-300 space-y-1">
                <p>Venue: {t.venue} ({t.duration})</p>
                <p className="text-cyan-300 font-bold">Targets: {t.targetBranches}</p>
                {t.registeredStudents && <p className="text-emerald-400 font-black">Registered Students: {t.registeredStudents.length}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white drop-shadow-md">Schedule Training Session</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveTraining} className="space-y-3">
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Session Title *" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none">
                <option value="Aptitude Test Prep" className="bg-slate-900 text-white">Aptitude Test Prep</option>
                <option value="Coding Test Prep" className="bg-slate-900 text-white">Coding Test Prep</option>
                <option value="Mock Interview" className="bg-slate-900 text-white">Mock Interview</option>
                <option value="Group Discussion Training" className="bg-slate-900 text-white">Group Discussion Training</option>
                <option value="Soft Skills Workshop" className="bg-slate-900 text-white">Soft Skills Workshop</option>
                <option value="Resume Workshop" className="bg-slate-900 text-white">Resume Workshop</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
                <input type="text" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (e.g. 2 Hours)" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              </div>
              <input type="text" value={trainer} onChange={e=>setTrainer(e.target.value)} placeholder="Trainer / Mentor Name" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Venue / Lab / Link" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={targetBranches} onChange={e=>setTargetBranches(e.target.value)} placeholder="Target Branches (e.g. CSE, ECE)" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={link} onChange={e=>setLink(e.target.value)} placeholder="Attachment / Teams Link (Optional)" className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none" />
              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 cursor-pointer">Publish Training</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// 9. PLACEMENT ANALYTICS (REAL FIRESTORE DATA)
const PlacementAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getPlacementAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading || !analytics) {
    return <div className="p-12 text-center animate-pulse text-gray-400 font-bold">Calculating real-time placement analytics...</div>;
  }

  const { overview, branchPlacements, applications, drives } = analytics;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
          Deep Intelligence
        </span>
        <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Placement Intelligence & Batch Comparison</h3>
        <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Deep analytics derived directly from actual student and recruitment records</p>
      </div>

      {/* Salary Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-2 text-white">
          <span className="text-emerald-300 uppercase text-[10px] font-extrabold tracking-wider">Highest Salary Package</span>
          <p className="text-3xl font-black text-emerald-400 font-display drop-shadow">{overview.highestPackage}</p>
          <span className="text-gray-300 text-[10px] block">Peak Campus Placement Offer</span>
        </div>
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-2 text-white">
          <span className="text-cyan-300 uppercase text-[10px] font-extrabold tracking-wider">Average Salary Package</span>
          <p className="text-3xl font-black text-cyan-400 font-display drop-shadow">{overview.avgPackage}</p>
          <span className="text-gray-300 text-[10px] block">Across All Hired Candidates</span>
        </div>
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-indigo-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-2 text-white">
          <span className="text-indigo-300 uppercase text-[10px] font-extrabold tracking-wider">Lowest Salary Package</span>
          <p className="text-3xl font-black text-indigo-400 font-display drop-shadow">{overview.lowestPackage}</p>
          <span className="text-gray-300 text-[10px] block">Base Offer Minimum</span>
        </div>
      </div>

      {/* Branch Breakdown Table Card */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <h4 className="text-sm font-black text-white drop-shadow-sm">Department-wise Selection Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Total Students</th>
                <th className="p-3.5 text-center">Students Placed</th>
                <th className="p-3.5 text-right">Placement Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-bold">
              {branchPlacements.map(bp => (
                <tr key={bp.branch} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-black text-white">{bp.branch}</td>
                  <td className="p-3.5 text-center text-gray-300">{bp.totalStudents}</td>
                  <td className="p-3.5 text-center text-emerald-400 font-black">{bp.placedStudents}</td>
                  <td className="p-3.5 text-right text-cyan-300 font-black">{bp.placementRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 10. PLACEMENT REPORTS (REAL FIRESTORE REPORT GENERATOR)
const PlacementReports = () => {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report Filters
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [drivesData, appsData, usersData] = await Promise.all([
          mockDB.getPlacementDrives(),
          mockDB.getPlacementApplications(),
          mockDB.getAllUsers()
        ]);
        setDrives(drivesData);
        setApplications(appsData);
        setStudents(usersData.filter(u => u.role === 'student'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredApps = applications.filter(a => {
    if (branchFilter !== 'ALL' && !(a.branch || '').toUpperCase().includes(branchFilter)) return false;
    if (companyFilter !== 'ALL' && a.companyName !== companyFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const selectedOffers = filteredApps.filter(a => a.status === 'Selected');
  const uniquePlaced = new Set(selectedOffers.map(a => a.studentId)).size;
  const placementRate = Math.min(100, Math.round((uniquePlaced / (students.length || 1)) * 100));

  const uniqueCompanies = Array.from(new Set(drives.map(d => d.companyName)));

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      
      {/* Header & Print Control */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Accreditation Audit
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Annual Campus Placement Audit & Summary Report</h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Generate official placement reports for NAAC accreditation and executive review</p>
        </div>
        <button onClick={handlePrint} className="px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]">
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* Filter Controls Card */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-wrap gap-4 text-white">
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
          <option value="ALL" className="bg-slate-900 text-white">All Branches</option>
          <option value="CSE" className="bg-slate-900 text-white">CSE</option>
          <option value="ECE" className="bg-slate-900 text-white">ECE</option>
          <option value="EEE" className="bg-slate-900 text-white">EEE</option>
          <option value="AI & ML" className="bg-slate-900 text-white">AI & ML</option>
          <option value="CIVIL" className="bg-slate-900 text-white">Civil</option>
          <option value="MECHANICAL" className="bg-slate-900 text-white">Mechanical</option>
        </select>

        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
          <option value="ALL" className="bg-slate-900 text-white">All Companies</option>
          {uniqueCompanies.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
          <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
          <option value="Applied" className="bg-slate-900 text-white">Applied</option>
          <option value="Shortlisted" className="bg-slate-900 text-white">Shortlisted</option>
          <option value="Interview Scheduled" className="bg-slate-900 text-white">Interview Scheduled</option>
          <option value="Selected" className="bg-slate-900 text-white">Selected</option>
          <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
        </select>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 rounded-3xl bg-black/50 backdrop-blur-xl text-white border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-6 printable-area">
        <div className="text-center border-b border-white/15 pb-6">
          <h2 className="text-xl font-black text-white font-display drop-shadow">KBN UNIVERSITY - CAMPUS PLACEMENT CELL</h2>
          <p className="text-xs text-cyan-300 font-semibold mt-1">Official Campus Recruitment Audit & Performance Report (Batch 2026)</p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center border-b border-white/15 pb-6">
          <div><span className="text-gray-300 block text-[10px] uppercase font-bold">Total Drives</span><strong className="text-lg text-white">{drives.length}</strong></div>
          <div><span className="text-gray-300 block text-[10px] uppercase font-bold">Applications</span><strong className="text-lg text-purple-300">{filteredApps.length}</strong></div>
          <div><span className="text-gray-300 block text-[10px] uppercase font-bold">Confirmed Offers</span><strong className="text-lg text-emerald-400">{selectedOffers.length}</strong></div>
          <div><span className="text-gray-300 block text-[10px] uppercase font-bold">Placement Rate</span><strong className="text-lg text-cyan-300">{placementRate}%</strong></div>
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-sm border-b border-white/15 pb-2 text-white">Student Application & Selection Roster</h4>
          {filteredApps.length === 0 ? (
            <div className="py-8 text-center text-gray-300">No applications found matching the selected report filters.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-300">
                  <th className="p-2.5">Roll No</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Branch</th>
                  <th className="p-2.5">Company</th>
                  <th className="p-2.5">Job Role</th>
                  <th className="p-2.5 text-center">CGPA</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredApps.map(a => (
                  <tr key={a.id || a.applicationId} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-bold text-cyan-300">{a.rollNumber}</td>
                    <td className="p-2.5 font-bold text-white">{a.studentName}</td>
                    <td className="p-2.5 text-gray-300">{a.branch}</td>
                    <td className="p-2.5 font-bold text-white">{a.companyName}</td>
                    <td className="p-2.5 text-gray-300">{a.jobRole}</td>
                    <td className="p-2.5 text-center font-bold text-cyan-300">{a.cgpa}</td>
                    <td className="p-2.5 text-right font-black">
                      <span className={a.status === 'Selected' ? 'text-emerald-400' : 'text-gray-200'}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// 11. NOTIFICATIONS BROADCAST
const PlacementNotifications = () => {
  const [message, setMessage] = useState('');
  const { showToast } = useAuth();

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      const allUsers = await mockDB.getAllUsers();
      const students = allUsers.filter(u => u.role === 'student');
      students.forEach(s => {
        mockDB.addNotification(s.uid || s.id, `[Placement Cell Broadcast]: ${message}`);
      });
      showToast(`Broadcast alert dispatched to ${students.length} students!`, 'success');
      setMessage('');
    } catch (_) {
      showToast('Could not send notification broadcast.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans">
      <div className="p-6 md:p-8 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 max-w-2xl mx-auto text-white">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Broadcast Channel
          </span>
          <h3 className="text-xl font-black text-white drop-shadow-md mt-1.5 font-display">Broadcast Placement Notification Alert</h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Send instant placement cell announcement alerts directly to all eligible students' portals.</p>
        </div>

        <form onSubmit={handleSendAlert} className="space-y-4">
          <textarea
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your official placement announcement message here..."
            className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:outline-none"
            required
          ></textarea>

          <button type="submit" className="w-full py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 border border-blue-400/40 cursor-pointer transition-all hover:scale-[1.01]">
            <Send size={16} /> Broadcast Notification Alert
          </button>
        </form>
      </div>
    </div>
  );
};

// 12. PLACEMENT SETTINGS
const PlacementSettings = ({ officer }) => {
  const { user, showToast, updateProfilePhoto } = useAuth();
  const currentUser = officer || user || {};

  // Officer Profile State
  const [fullName, setFullName] = useState(currentUser.fullName || currentUser.name || 'Dr. Rajesh Verma');
  const [email, setEmail] = useState(currentUser.email || 'placement@kbn.edu');
  const [phone, setPhone] = useState(currentUser.phone || currentUser.phoneNumber || '+91 98765 43210');
  const [photoUrl, setPhotoUrl] = useState(currentUser.profilePhotoUrl || currentUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [designation, setDesignation] = useState(currentUser.designation || 'Head - Training & Placements');
  const [officeLocation, setOfficeLocation] = useState(currentUser.officeLocation || 'Campus Placement Cell, Admin Block - Floor 2');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Policy Settings State
  const [minCgpa, setMinCgpa] = useState('6.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [recruitmentBatch, setRecruitmentBatch] = useState('2025-2026 Batch');
  const [helpdeskEmail, setHelpdeskEmail] = useState('placements.support@kbn.edu');
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updatedData = {
        ...currentUser,
        fullName,
        name: fullName,
        email,
        phone,
        phoneNumber: phone,
        profilePhotoUrl: photoUrl,
        photo: photoUrl,
        designation,
        officeLocation
      };

      if (updateProfilePhoto && photoUrl !== currentUser.profilePhotoUrl) {
        try {
          await updateProfilePhoto(photoUrl);
        } catch (_) {}
      }

      localStorage.setItem('acad_user', JSON.stringify(updatedData));
      localStorage.setItem('acad_current_user', JSON.stringify(updatedData));
      showToast('Placement Officer Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update officer profile.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setTimeout(() => {
      setIsSavingPolicy(false);
      showToast('Placement policy & criteria configuration saved successfully!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans max-w-4xl mx-auto">
      
      {/* Universal Glass Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Administration & Account
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">
            Placement Cell Control & Officer Settings
          </h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">
            Manage your recruitment officer credentials, contact channels, and system-wide drive policies
          </p>
        </div>
        <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl shrink-0 self-start md:self-auto">
          <Settings size={28} className="text-cyan-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. OFFICER PROFILE SETTINGS CARD */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white hover:border-white/20 transition-all space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-md border border-cyan-400/30">
              Account Profile
            </span>
            <h4 className="text-base font-black text-white drop-shadow-md mt-1.5 font-display">
              Officer Profile Settings
            </h4>
            <p className="text-xs text-gray-300 font-medium mt-0.5">
              Personal credentials and contact information displayed to candidates and recruiters
            </p>
          </div>

          {/* Profile Photo Avatar Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="relative">
              <img
                src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Officer Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </div>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-white text-sm drop-shadow-sm">{fullName}</h5>
              <p className="text-[11px] text-cyan-300 font-semibold">{designation}</p>
              <p className="text-[10px] text-gray-400">{officeLocation}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Placement Officer Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Official Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="placement@kbn.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 98765 43210"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Profile Picture URL
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Head of Placements"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Office Location
                </label>
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  placeholder="Admin Block - Room 204"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-3 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <UserCheck size={16} /> {isUpdatingProfile ? 'Updating Profile...' : 'Update Officer Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. PLACEMENT POLICY CONFIGURATION CARD */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white hover:border-white/20 transition-all space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                Institutional Policy
              </span>
              <h4 className="text-base font-black text-white drop-shadow-md mt-1.5 font-display">
                Placement Policy & Criteria
              </h4>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                Configure default academic eligibility constraints enforced during drive registrations
              </p>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Default Minimum CGPA Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Candidates below this CGPA will require manual eligibility waiver</span>
              </div>

              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Default Maximum Active Backlogs Allowed
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Set 0 for strict no-active-backlog policy drives</span>
              </div>

              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Active Recruitment Season
                </label>
                <input
                  type="text"
                  value={recruitmentBatch}
                  onChange={(e) => setRecruitmentBatch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                  Placement Cell Helpdesk / Support Email
                </label>
                <input
                  type="email"
                  value={helpdeskEmail}
                  onChange={(e) => setHelpdeskEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-semibold text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPolicy}
                  className="w-full py-3 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <ShieldCheck size={16} /> {isSavingPolicy ? 'Saving Configuration...' : 'Save Policy Settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 space-y-1">
            <p className="font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-cyan-400" /> NAAC & NIRF Placement Compliance
            </p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              All settings configured here automatically apply to the Annual Placement Audit and student-facing drive registration gateways.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlacementPortal;
