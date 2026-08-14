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

// STUNNING LANDING PAGE / SELECTOR
const LandingPage = () => {
  const portalRoles = [
    {
      title: 'Student Portal',
      description: 'Submit leaves, download notes, check attendance, settle fees, view marks & assignments, check checkouts.',
      link: '/student/login',
      color: 'from-blue-500 to-indigo-500',
      icon: GraduationCap
    },
    {
      title: 'Faculty Portal',
      description: 'Log attendance, enter internal marks, upload notes/assignments, and view student progress.',
      link: '/faculty/login',
      color: 'from-emerald-500 to-teal-500',
      icon: BookOpen
    },
    {
      title: 'HOD Portal',
      description: 'Departmental overview, branch analytics, allocate subjects, monitor attendance/marks, and review counsellor files.',
      link: '/hod/login',
      color: 'from-purple-500 to-indigo-500',
      icon: Building2
    },
    {
      title: 'Principal Panel',
      description: 'Institutional performance oversight, branch comparisons, collections/assets reports, and request overrides.',
      link: '/principal/login',
      color: 'from-amber-500 to-orange-500',
      icon: Building
    },
    {
      title: 'Placement Center',
      description: 'Register partner firms, publish job openings, screen candidate criteria, and publish selection results.',
      link: '/placement/login',
      color: 'from-sky-500 to-blue-500',
      icon: Briefcase
    },
    {
      title: 'Ward Counsellor Portal',
      description: 'Scope branch wards directory, write counseling reviews, log parent-teacher meetings, and review issues.',
      link: '/counsellor/login',
      color: 'from-sky-655 to-blue-650',
      icon: UserCheck
    },
    {
      title: 'Central Library Portal',
      description: 'CRUD Central textbook collections, manage direct textbook checkouts, return calculator, circulation log audits.',
      link: '/librarian/login',
      color: 'from-teal-500 to-indigo-500',
      icon: Library
    },
    {
      title: 'Parent Portal',
      description: 'Monitor child\'s attendance, view results, track leave requests, and see fee reports.',
      link: '/parent/login',
      color: 'from-pink-500 to-rose-500',
      icon: Users
    },
    {
      title: 'System Admin',
      description: 'Manage users directory (create/edit/delete all 8 roles), reset credentials, academic year and fees structures.',
      link: '/admin/login',
      color: 'from-rose-500 to-red-500',
      icon: Lock
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-12 px-4 transition-colors duration-250 relative">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto space-y-12 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-2xl text-white shadow-xl shadow-blue-500/10">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            KBN COLLEGE
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Institutional ERP Systems Administration Portal. Select your dashboard to sign in.
          </p>
        </div>

        {/* Portal selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalRoles.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                to={portal.link}
                className="group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 hover:border-blue-500 dark:hover:border-blue-500 shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[14rem] h-auto"
              >
                <div>
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${portal.color} text-white flex items-center justify-center shadow-lg`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-xs font-black text-slate-850 dark:text-white mt-4">{portal.title}</h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-2 font-bold leading-relaxed">
                    {portal.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-[10px] font-bold text-blue-650 dark:text-blue-400 gap-1 group-hover:gap-2 transition-all">
                  <span>Enter Portal</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-12">
        <p>© 2026 KBN College ERP Hub. Powered by React, Tailwind & Firebase.</p>
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
