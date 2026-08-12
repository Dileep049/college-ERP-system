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

// Main App Container Routing
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Landing Select Page */}
        <Route path="/" element={<LandingPage />} />

        {/* --- STUDENT PORTAL ROUTES --- */}
        <Route path="/student/login" element={<StudentLogin />} />
        {['dashboard', 'profile', 'academic-overview', 'course-registration', 'attendance', 'marks', 'results', 'assignments', 'notes', 'leaves', 'counsellor', 'faculty', 'placements', 'counselling', 'notifications', 'document-requests', 'support-desk', 'performance'].map((subPage) => (
          <Route key={subPage} path={`/student/${subPage}`} element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <StudentPortal subPage={subPage} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        ))}

        {/* --- PARENT PORTAL ROUTES --- */}
        <Route path="/parent/login" element={<ParentLogin />} />
        {['dashboard', 'my-ward', 'academic-overview', 'attendance', 'marks', 'results', 'assignments', 'notes', 'leaves', 'counsellor', 'faculty', 'counselling', 'meetings', 'placements', 'monthly-report', 'notifications', 'profile', 'fees', 'grievances'].map((subPage) => (
          <Route key={subPage} path={`/parent/${subPage}`} element={
            <ProtectedRoute allowedRole="parent">
              <DashboardLayout>
                <ParentPortal subPage={subPage} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        ))}

        {/* --- FACULTY PORTAL ROUTES --- */}
        <Route path="/faculty/login" element={<FacultyLogin />} />
        {['dashboard', 'classes', 'students', 'attendance', 'marks', 'assignments', 'notes', 'academic-performance', 'student-progress', 'leaves', 'reports', 'profile', 'ward-counselling', 'wards'].map((subPage) => (
          <Route key={subPage} path={`/faculty/${subPage}`} element={
            <ProtectedRoute allowedRole="faculty">
              <DashboardLayout>
                <FacultyPortal subPage={subPage} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        ))}

        {/* --- HOD PORTAL ROUTES --- */}
        <Route path="/hod/login" element={<HODLogin />} />
        <Route path="/hod/dashboard" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/overview" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="overview" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/faculty-directory" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="faculty-directory" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/faculty" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="faculty-directory" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/ward-counsellors" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="ward-counsellors" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/workload" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="workload" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/attendance-monitoring" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="attendance-monitoring" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/attendance-unlocks" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="attendance-unlocks" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/faculty-leaves" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="faculty-leaves" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/leaves" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="faculty-leaves" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/academic-performance" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="academic-performance" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/curriculum" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="curriculum" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/announcements" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="announcements" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/reports" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="reports" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/audit-logs" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="audit-logs" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/settings" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="settings" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- PRINCIPAL PORTAL ROUTES --- */}
        <Route path="/principal/login" element={<PrincipalLogin />} />
        <Route path="/principal/dashboard" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/branches" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="branches" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/results" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="results" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/performance" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="performance" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/faculty" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="faculty" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/attendance" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="attendance" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/placements" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="placements" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/settings" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="settings" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/reports" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="reports" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/documents" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="documents" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/leaves" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="leaves" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/principal/calendar" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="calendar" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- PLACEMENT PORTAL ROUTES --- */}
        <Route path="/placement/login" element={<PlacementLogin />} />
        {['dashboard', 'drives', 'upcoming-drives', 'applications', 'students', 'candidates', 'shortlisted', 'interviews', 'selected', 'partners', 'training', 'analytics', 'reports', 'notifications', 'settings'].map((subPage) => (
          <Route key={subPage} path={`/placement/${subPage}`} element={
            <ProtectedRoute allowedRole="placement">
              <DashboardLayout>
                <PlacementPortal subPage={subPage} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        ))}

        {/* --- WARD COUNSELLOR PORTAL ROUTES --- */}
        <Route path="/counsellor/login" element={<CounsellorLogin />} />
        <Route path="/counsellor/dashboard" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <WardCounsellorPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/counsellor/parent-meetings" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <WardCounsellorPortal subPage="parent-meetings" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/counsellor/wards" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <WardCounsellorPortal subPage="wards" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/counsellor/leaves" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <WardCounsellorPortal subPage="leaves" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/counsellor/reports" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <WardCounsellorPortal subPage="reports" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- CENTRAL LIBRARY PORTAL ROUTES --- */}
        <Route path="/librarian/login" element={<LibrarianLogin />} />
        <Route path="/librarian/dashboard" element={
          <ProtectedRoute allowedRole="librarian">
            <DashboardLayout>
              <LibrarianPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/librarian/circulation" element={
          <ProtectedRoute allowedRole="librarian">
            <DashboardLayout>
              <LibrarianPortal subPage="circulation" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/librarian/analytics" element={
          <ProtectedRoute allowedRole="librarian">
            <DashboardLayout>
              <LibrarianPortal subPage="analytics" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/librarian/eresources" element={
          <ProtectedRoute allowedRole="librarian">
            <DashboardLayout>
              <LibrarianPortal subPage="eresources" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/librarian/fines" element={
          <ProtectedRoute allowedRole="librarian">
            <DashboardLayout>
              <LibrarianPortal subPage="fines" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- ADMIN PORTAL ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout>
              <AdminPortal />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout>
              <ReportsModule userRole="admin" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/bulk-import" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout>
              <StudentBulkImport />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/faculty/reports" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <ReportsModule userRole="faculty" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/counsellor/reports" element={
          <ProtectedRoute allowedRole="counsellor">
            <DashboardLayout>
              <ReportsModule userRole="counsellor" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback redirect */}
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
