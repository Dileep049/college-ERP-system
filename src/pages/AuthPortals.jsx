import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Award } from 'lucide-react';

// Unified Base Auth Form Layout
const AuthContainer = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-250">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.06),transparent_50%)] pointer-events-none"></div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-8 relative z-10">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <p className="text-sm font-semibold text-slate-450 dark:text-slate-400 mt-2">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

// Quick Demo Login Helper Component
const QuickDemoSection = ({ role, email, onSelect }) => {
  return (
    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quick Access for Testing</p>
      <button
        onClick={() => onSelect(email)}
        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2"
      >
        <Award size={14} />
        <span>One-Click Login as {role}</span>
      </button>
    </div>
  );
};

// Generic Employee/Staff Portal Login Helper
const CommonPortalLogin = ({ roleLabel, prefillEmail, dashboardPath }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(dashboardPath);
    } catch (_) {}
  };

  return (
    <AuthContainer title={`${roleLabel} Portal`} subtitle={`Sign in to access your administrative actions`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={prefillEmail}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-white transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-white transition-all font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all mt-6"
        >
          Sign In
        </button>
      </form>

      <QuickDemoSection role={roleLabel} email={prefillEmail} onSelect={(em) => setEmail(em)} />
    </AuthContainer>
  );
};

// 1. STUDENT LOGIN
export const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/student/dashboard');
    } catch (_) {}
  };

  return (
    <AuthContainer title="Student Portal" subtitle="Access your academic progress & leaves">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-2">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student.cse@kbn.edu"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-white transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-white transition-all font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all mt-6"
        >
          Sign In
        </button>
      </form>

      <QuickDemoSection role="John Doe (CSE Student)" email="student.cse@kbn.edu" onSelect={(em) => setEmail(em)} />
    </AuthContainer>
  );
};

// 2. FACULTY LOGIN
export const FacultyLogin = () => (
  <CommonPortalLogin roleLabel="Faculty" prefillEmail="faculty.cse@kbn.edu" dashboardPath="/faculty/dashboard" />
);

// 3. HOD LOGIN
export const HODLogin = () => (
  <CommonPortalLogin roleLabel="HOD" prefillEmail="hod.cse@kbn.edu" dashboardPath="/hod/dashboard" />
);

// 4. PRINCIPAL LOGIN
export const PrincipalLogin = () => (
  <CommonPortalLogin roleLabel="Principal" prefillEmail="principal@kbn.edu" dashboardPath="/principal/dashboard" />
);

// 5. PLACEMENT LOGIN
export const PlacementLogin = () => (
  <CommonPortalLogin roleLabel="Placement Officer" prefillEmail="placement@kbn.edu" dashboardPath="/placement/dashboard" />
);

// 6. WARD COUNSELLOR LOGIN
export const CounsellorLogin = () => (
  <CommonPortalLogin roleLabel="Ward Counsellor" prefillEmail="counsellor.cse@kbn.edu" dashboardPath="/counsellor/dashboard" />
);

// 7. LIBRARIAN LOGIN
export const LibrarianLogin = () => (
  <CommonPortalLogin roleLabel="Librarian" prefillEmail="librarian@kbn.edu" dashboardPath="/librarian/dashboard" />
);

// 8. ADMIN LOGIN
export const AdminLogin = () => (
  <CommonPortalLogin roleLabel="Administrator" prefillEmail="admin@kbn.edu" dashboardPath="/admin/dashboard" />
);

// 9. PARENT LOGIN
export const ParentLogin = () => (
  <CommonPortalLogin roleLabel="Parent" prefillEmail="parent@kbn.edu" dashboardPath="/parent/dashboard" />
);
