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
import { LibrarianPortal } from './pages/LibrarianPortal';
import { AdminPortal } from './pages/AdminPortal';

import { 
  GraduationCap, 
  BookOpen, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  Lock, 
  Building,
  UserCheck,
  Library
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
                className="group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 hover:border-blue-500 dark:hover:border-blue-500 shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-56"
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
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/marks" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="marks" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="results" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/assignments" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="assignments" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/leaves" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="leaves" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/notes" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="notes" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/placements" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="placements" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/fees" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="fees" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/library" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="library" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/counselling" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentPortal subPage="counselling" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- FACULTY PORTAL ROUTES --- */}
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/faculty/dashboard" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <FacultyPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/faculty/attendance" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <FacultyPortal subPage="attendance" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/faculty/notes" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <FacultyPortal subPage="notes" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/faculty/marks" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <FacultyPortal subPage="marks" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/faculty/assignments" element={
          <ProtectedRoute allowedRole="faculty">
            <DashboardLayout>
              <FacultyPortal subPage="assignments" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- HOD PORTAL ROUTES --- */}
        <Route path="/hod/login" element={<HODLogin />} />
        <Route path="/hod/dashboard" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hod/faculty" element={
          <ProtectedRoute allowedRole="hod">
            <DashboardLayout>
              <HODPortal subPage="faculty" />
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

        <Route path="/principal/reports" element={
          <ProtectedRoute allowedRole="principal">
            <DashboardLayout>
              <PrincipalPortal subPage="reports" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- PLACEMENT PORTAL ROUTES --- */}
        <Route path="/placement/login" element={<PlacementLogin />} />
        <Route path="/placement/dashboard" element={
          <ProtectedRoute allowedRole="placement">
            <DashboardLayout>
              <PlacementPortal subPage="dashboard" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/placement/drives" element={
          <ProtectedRoute allowedRole="placement">
            <DashboardLayout>
              <PlacementPortal subPage="drives" />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/placement/students" element={
          <ProtectedRoute allowedRole="placement">
            <DashboardLayout>
              <PlacementPortal subPage="students" />
            </DashboardLayout>
          </ProtectedRoute>
        } />

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

        {/* --- ADMIN PORTAL ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout>
              <AdminPortal />
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
