import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { ToastContainer } from './components/ToastContainer';

// Import Pages
import {
  StudentLogin,
  FacultyLogin,
  HODLogin,
  PrincipalLogin,
  PlacementLogin,
  CounsellorLogin,
  LibrarianLogin,
  AdminLogin
} from './pages/AuthPortals';

import { StudentPortal } from './pages/StudentPortal';
import { FacultyPortal } from './pages/FacultyPortal';
import { HODPortal } from './pages/HODPortal';
import { PrincipalPortal } from './pages/PrincipalPortal';
import { PlacementPortal } from './pages/PlacementPortal';
import { WardCounsellorPortal } from './pages/WardCounsellorPortal';
import { WardCounsellorProfile } from './pages/WardCounsellorProfile';
import { LibrarianPortal } from './pages/LibrarianPortal';
import { AdminPortal } from './pages/AdminPortal';
import { ReportsModule } from './components/ReportsModule';
import { StudentBulkImport } from './components/StudentBulkImport';

import { 
  GraduationCap, 
  BookOpen, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  Lock, 
  Building,
  UserCheck,
  Library,
  Users
} from 'lucide-react';

import { ThemeToggle } from './components/ThemeToggle';

// STUNNING 3D LANDING PAGE / ERP GATEWAY
const LandingPage = () => {
  const portalRoles = [
    {
      title: 'Student Portal',
      description: 'Submit leaves, download notes, check attendance, settle fees, view marks & assignments, and access results.',
      link: '/student/login',
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'Academics & Leaves',
      badgeClass: 'badge-3d badge-3d-info',
      icon: GraduationCap
    },
    {
      title: 'Faculty Portal',
      description: 'Log attendance, enter internal marks, upload notes/assignments, and view student progress analytics.',
      link: '/faculty/login',
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'Instruction & Marks',
      badgeClass: 'badge-3d badge-3d-success',
      icon: BookOpen
    },
    {
      title: 'HOD Portal',
      description: 'Departmental overview, branch analytics, allocate subjects, monitor attendance/marks, and review counsellor files.',
      link: '/hod/login',
      gradient: 'from-purple-600 to-indigo-600',
      badge: 'Department Control',
      badgeClass: 'badge-3d badge-3d-purple',
      icon: Building2
    },
    {
      title: 'Principal Panel',
      description: 'Institutional performance oversight, branch comparisons, collections/assets reports, and request overrides.',
      link: '/principal/login',
      gradient: 'from-amber-600 to-orange-600',
      badge: 'Executive Oversight',
      badgeClass: 'badge-3d badge-3d-warning',
      icon: Building
    },
    {
      title: 'Placement Center',
      description: 'Register partner firms, publish job openings, screen candidate criteria, and publish selection results.',
      link: '/placement/login',
      gradient: 'from-sky-600 to-blue-600',
      badge: 'Drives & Careers',
      badgeClass: 'badge-3d badge-3d-info',
      icon: Briefcase
    },
    {
      title: 'Ward Counsellor Portal',
      description: 'Scope branch wards directory, write counseling reviews, log parent-teacher meetings, and review student leaves.',
      link: '/counsellor/login',
      gradient: 'from-cyan-600 to-blue-600',
      badge: 'Mentorship & Care',
      badgeClass: 'badge-3d badge-3d-info',
      icon: UserCheck
    },
    {
      title: 'Central Library Portal',
      description: 'Central textbook collections, manage direct textbook checkouts, return calculator, circulation log audits.',
      link: '/librarian/login',
      gradient: 'from-teal-600 to-emerald-600',
      badge: 'Circulation & Books',
      badgeClass: 'badge-3d badge-3d-success',
      icon: Library
    },

    {
      title: 'System Admin',
      description: 'Manage users directory (create/edit/delete all 8 roles), reset credentials, academic year and fees structures.',
      link: '/admin/login',
      gradient: 'from-rose-600 to-red-600',
      badge: 'System Governance',
      badgeClass: 'badge-3d badge-3d-danger',
      icon: Lock
    }
  ];

  return (
    <div className="min-h-screen campus-hero-bg flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Subtle Ambient Glow Highlights */}
      <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 -left-20 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-20 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Top Floating Premium Physical Glass Navbar */}
        <div className="flex items-center justify-between p-3.5 px-6 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/40">
              <ShieldCheck size={22} className="text-white drop-shadow" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ACADEMIA ERP</span>
              <p className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider -mt-0.5 flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span>Next-Gen Campus Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping"></span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* 1. HERO SECTION */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Academic Session 2026-2027 Active</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-wider">
            KBN COLLEGE ERP
          </h1>

          <p className="text-white/95 max-w-2xl mx-auto text-xs sm:text-sm font-semibold leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            Ultra-Advanced Campus Management & Academic Intelligence Platform. Select your institutional portal below to access your dashboard.
          </p>
        </div>

        {/* 2. PORTALS GRID (Micro-Compact 3x3 Layout) - Premium Physical Glass */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[65rem] mx-auto mt-6 px-4">
          {portalRoles.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                to={portal.link}
                className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:bg-white/20 hover:border-white/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] transition-all duration-300 p-4 flex flex-col justify-between group w-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${portal.gradient} text-white flex items-center justify-center shadow-md border border-white/30 group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                      <Icon size={18} className="text-white drop-shadow" />
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-black/25 text-white border border-white/30 backdrop-blur-md shadow-sm">
                      {portal.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-cyan-200 transition-colors">
                    {portal.title}
                  </h3>
                </div>

                <div className="text-xs mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] group-hover:text-cyan-200">
                  <span className="flex items-center gap-1.5">Enter {portal.title}</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform text-xs text-cyan-200 font-black">→</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* 3. FOOTER */}
      <footer className="text-slate-400/60 text-sm mt-16 text-center py-4">
        <p>© 2026 KBN College Smart ERP System • Built with Ultra-Advanced 3D Glassmorphic Architecture</p>
      </footer>
    </div>
  );
};

// Helper to render Leave Application inside DashboardLayout based on user role
const ApplyLeavePage = () => {
  const { user } = useAuth();
  if (user?.role === 'faculty') {
    return <FacultyPortal subPage="leaves" />;
  }
  return <StudentPortal subPage="leaves" />;
};

// Main App Container Routing
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Landing Select Page */}
        <Route path="/" element={<LandingPage />} />

        {/* --- AUTHENTICATION LOGIN ROUTES (PUBLIC) --- */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/hod/login" element={<HODLogin />} />
        <Route path="/principal/login" element={<PrincipalLogin />} />
        <Route path="/placement/login" element={<PlacementLogin />} />
        <Route path="/counsellor/login" element={<CounsellorLogin />} />
        <Route path="/librarian/login" element={<LibrarianLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* --- PROTECTED NESTED DASHBOARD ROUTES (OUTLET WRAPPED) --- */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Universal Leave Application Route */}
          <Route path="/apply-leave" element={<ApplyLeavePage />} />
          <Route path="/dashboard/leave" element={<ApplyLeavePage />} />
          <Route path="/dashboard/attendance" element={<StudentPortal subPage="attendance" />} />
          <Route path="/dashboard/assignments" element={<StudentPortal subPage="assignments" />} />
          <Route path="/dashboard/marks" element={<StudentPortal subPage="marks" />} />
          <Route path="/dashboard" element={<StudentPortal subPage="dashboard" />} />

          {/* Student Portal Subpages */}
          <Route path="/student/apply-leave" element={<StudentPortal subPage="leaves" />} />
          {['dashboard', 'profile', 'academic-overview', 'attendance', 'marks', 'results', 'assignments', 'notes', 'leaves', 'counsellor', 'faculty', 'placements', 'counselling', 'notifications', 'document-requests', 'support-desk', 'performance'].map((subPage) => (
            <Route key={subPage} path={`/student/${subPage}`} element={<StudentPortal subPage={subPage} />} />
          ))}

          {/* Faculty Portal Subpages */}
          <Route path="/faculty/apply-leave" element={<FacultyPortal subPage="leaves" />} />
          {['dashboard', 'classes', 'students', 'attendance', 'marks', 'assignments', 'notes', 'academic-performance', 'student-progress', 'leaves', 'reports', 'profile', 'ward-counselling', 'wards'].map((subPage) => (
            <Route key={subPage} path={`/faculty/${subPage}`} element={<FacultyPortal subPage={subPage} />} />
          ))}



          {/* HOD Portal Subpages */}
          <Route path="/hod/dashboard" element={<HODPortal subPage="dashboard" />} />
          <Route path="/hod/overview" element={<HODPortal subPage="overview" />} />
          <Route path="/hod/faculty-directory" element={<HODPortal subPage="faculty-directory" />} />
          <Route path="/hod/faculty" element={<HODPortal subPage="faculty-directory" />} />
          <Route path="/hod/ward-counsellors" element={<HODPortal subPage="ward-counsellors" />} />
          <Route path="/hod/workload" element={<HODPortal subPage="workload" />} />
          <Route path="/hod/attendance-monitoring" element={<HODPortal subPage="attendance-monitoring" />} />
          <Route path="/hod/attendance-unlocks" element={<HODPortal subPage="attendance-unlocks" />} />
          <Route path="/hod/faculty-leaves" element={<HODPortal subPage="faculty-leaves" />} />
          <Route path="/hod/leaves" element={<HODPortal subPage="faculty-leaves" />} />
          <Route path="/hod/academic-performance" element={<HODPortal subPage="academic-performance" />} />
          <Route path="/hod/announcements" element={<HODPortal subPage="announcements" />} />
          <Route path="/hod/reports" element={<HODPortal subPage="reports" />} />
          <Route path="/hod/audit-logs" element={<HODPortal subPage="audit-logs" />} />
          <Route path="/hod/settings" element={<HODPortal subPage="settings" />} />

          {/* Principal Portal Subpages */}
          <Route path="/principal/dashboard" element={<PrincipalPortal subPage="dashboard" />} />
          <Route path="/principal/branches" element={<PrincipalPortal subPage="branches" />} />
          <Route path="/principal/results" element={<PrincipalPortal subPage="results" />} />
          <Route path="/principal/performance" element={<PrincipalPortal subPage="performance" />} />
          <Route path="/principal/faculty" element={<PrincipalPortal subPage="faculty" />} />
          <Route path="/principal/attendance" element={<PrincipalPortal subPage="attendance" />} />
          <Route path="/principal/placements" element={<PrincipalPortal subPage="placements" />} />
          <Route path="/principal/settings" element={<PrincipalPortal subPage="settings" />} />
          <Route path="/principal/reports" element={<PrincipalPortal subPage="reports" />} />
          <Route path="/principal/documents" element={<PrincipalPortal subPage="documents" />} />
          <Route path="/principal/leaves" element={<PrincipalPortal subPage="leaves" />} />
          <Route path="/principal/calendar" element={<PrincipalPortal subPage="calendar" />} />

          {/* Placement Portal Subpages */}
          {['dashboard', 'drives', 'upcoming-drives', 'applications', 'students', 'candidates', 'shortlisted', 'interviews', 'selected', 'partners', 'training', 'analytics', 'reports', 'notifications', 'settings'].map((subPage) => (
            <Route key={subPage} path={`/placement/${subPage}`} element={<PlacementPortal subPage={subPage} />} />
          ))}

          {/* Ward Counsellor Subpages */}
          <Route path="/counsellor/dashboard" element={<WardCounsellorPortal subPage="dashboard" />} />
          <Route path="/counsellor/wards" element={<WardCounsellorPortal subPage="wards" />} />
          <Route path="/counsellor/leaves" element={<WardCounsellorPortal subPage="leaves" />} />
          <Route path="/counsellor/student-leaves" element={<WardCounsellorPortal subPage="student-leaves" />} />
          <Route path="/counsellor/reports" element={<WardCounsellorPortal subPage="reports" />} />
          <Route path="/counsellor/profile" element={<WardCounsellorProfile />} />
          <Route path="/ward-counsellor/profile" element={<WardCounsellorProfile />} />

          {/* Central Library Subpages */}
          <Route path="/librarian/dashboard" element={<LibrarianPortal subPage="dashboard" />} />
          <Route path="/librarian/circulation" element={<LibrarianPortal subPage="circulation" />} />
          <Route path="/librarian/analytics" element={<LibrarianPortal subPage="analytics" />} />
          <Route path="/librarian/eresources" element={<LibrarianPortal subPage="eresources" />} />
          <Route path="/librarian/fines" element={<LibrarianPortal subPage="fines" />} />

          {/* Admin Subpages */}
          <Route path="/admin/dashboard" element={<AdminPortal />} />
          <Route path="/admin/reports" element={<ReportsModule userRole="admin" />} />
          <Route path="/admin/bulk-import" element={<StudentBulkImport />} />
          <Route path="/faculty/reports" element={<ReportsModule userRole="faculty" />} />
          <Route path="/counsellor/reports" element={<ReportsModule userRole="counsellor" />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Toast Notification Alerts */}
      <ToastContainer />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
