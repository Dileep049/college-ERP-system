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
  AdminLogin,
  ParentLogin
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
import { ParentPortal } from './pages/ParentPortal';
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
      title: 'Parent Portal',
      description: 'Monitor child\'s attendance, view results, track leave requests, and see fee reports with complete transparency.',
      link: '/parent/login',
      gradient: 'from-pink-600 to-rose-600',
      badge: 'Ward Tracking',
      badgeClass: 'badge-3d badge-3d-purple',
      icon: Users
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
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-between py-8 px-4 sm:px-6 transition-colors duration-200 relative">
      {/* 3D Ambient Background Highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl w-full mx-auto space-y-10 relative z-10">
        
        {/* Top Floating Navbar for Landing */}
        <div className="flex items-center justify-between p-3.5 px-6 rounded-2xl card-3d-glass border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-[var(--text-primary)]">ACADEMIA ERP</span>
              <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider -mt-0.5">Enterprise Cloud Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Academic Session 2026-2027 Active</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-[var(--text-primary)] tracking-tight">
            KBN COLLEGE ERP
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] leading-relaxed">
            Next-Generation Smart Campus Administration & Academic Management Platform. Select your dedicated portal below to proceed.
          </p>
        </div>

        {/* 3D Portal Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {portalRoles.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                to={portal.link}
                className="card-3d-interactive p-5 sm:p-6 flex flex-col justify-between min-h-[13.5rem] group w-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${portal.gradient} text-white flex items-center justify-center shadow-lg shadow-blue-500/10 border border-white/20 group-hover:scale-105 transition-transform duration-200 shrink-0`}>
                      <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <span className={portal.badgeClass}>{portal.badge}</span>
                  </div>
                  <h3 className="card-title text-base sm:text-lg font-black font-display tracking-tight group-hover:text-[var(--accent)] transition-colors">
                    {portal.title}
                  </h3>
                  <p className="card-description text-xs sm:text-sm mt-2 font-medium leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="card-link mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold">
                  <span>Enter {portal.title}</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform text-sm">→</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-semibold text-[var(--text-muted)] mt-12 py-4">
        <p>© 2026 KBN College Smart ERP System • Built with 3D Design Architecture</p>
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
        <Route path="/parent/login" element={<ParentLogin />} />
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
          {['dashboard', 'profile', 'academic-overview', 'course-registration', 'attendance', 'marks', 'results', 'assignments', 'notes', 'leaves', 'counsellor', 'faculty', 'placements', 'counselling', 'notifications', 'document-requests', 'support-desk', 'performance'].map((subPage) => (
            <Route key={subPage} path={`/student/${subPage}`} element={<StudentPortal subPage={subPage} />} />
          ))}

          {/* Faculty Portal Subpages */}
          <Route path="/faculty/apply-leave" element={<FacultyPortal subPage="leaves" />} />
          {['dashboard', 'classes', 'students', 'attendance', 'marks', 'assignments', 'notes', 'academic-performance', 'student-progress', 'leaves', 'reports', 'profile', 'ward-counselling', 'wards'].map((subPage) => (
            <Route key={subPage} path={`/faculty/${subPage}`} element={<FacultyPortal subPage={subPage} />} />
          ))}

          {/* Parent Portal Subpages */}
          {['dashboard', 'my-ward', 'academic-overview', 'attendance', 'marks', 'results', 'assignments', 'notes', 'leaves', 'counsellor', 'faculty', 'counselling', 'meetings', 'placements', 'monthly-report', 'notifications', 'profile', 'fees', 'grievances'].map((subPage) => (
            <Route key={subPage} path={`/parent/${subPage}`} element={<ParentPortal subPage={subPage} />} />
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
          <Route path="/hod/curriculum" element={<HODPortal subPage="curriculum" />} />
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
          <Route path="/counsellor/parent-meetings" element={<WardCounsellorPortal subPage="parent-meetings" />} />
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
