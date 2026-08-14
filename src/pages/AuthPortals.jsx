import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { Building2, Mail, Lock, Award, AlertCircle } from 'lucide-react';

// Unified Base Auth Form Layout
const AuthContainer = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 transition-colors duration-250">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.06),transparent_50%)] pointer-events-none"></div>
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-4">
            <Building2 size={26} />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">{title}</h2>
          <p className="text-sm font-medium text-slate-400 mt-2">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

// Generic Clean Email/Password Portal Login
const CommonPortalLogin = ({ roleLabel, roleFilter, prefillEmail, dashboardPath }) => {
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast(`Welcome back to ${roleLabel} Portal!`, 'success');
      navigate(dashboardPath);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Invalid email or password. Please try again.');
      showToast('Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      const all = await mockDB.getAllUsers();
      const found = all.find(u => u.email === prefillEmail || (roleFilter && u.role === roleFilter)) || all[0];
      await login(found);
      showToast(`Logged in with One-Click Access as ${roleLabel}`, 'success');
      navigate(dashboardPath);
    } catch (err) {
      console.error("Demo Login Error:", err);
      showToast('Could not sign in with demo access.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title={`${roleLabel} Portal`} subtitle={`Sign in with your email credentials to access your portal`}>
      
      {error && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 font-bold text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Direct Email & Password Login Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={prefillEmail}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all mt-6 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Verifying credentials...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Quick One-Click Demo Access */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Quick Demo Access
        </p>
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2"
        >
          <Award size={15} />
          <span>One-Click Access as {roleLabel}</span>
        </button>
      </div>

    </AuthContainer>
  );
};

// 1. STUDENT LOGIN
export const StudentLogin = () => (
  <CommonPortalLogin roleLabel="Student" roleFilter="student" prefillEmail="student.cse@kbn.edu" dashboardPath="/student/dashboard" />
);

// 2. FACULTY LOGIN
export const FacultyLogin = () => (
  <CommonPortalLogin roleLabel="Faculty" roleFilter="faculty" prefillEmail="faculty.cse@kbn.edu" dashboardPath="/faculty/dashboard" />
);

// 3. HOD LOGIN
export const HODLogin = () => (
  <CommonPortalLogin roleLabel="HOD" roleFilter="hod" prefillEmail="hod.cse@kbn.edu" dashboardPath="/hod/dashboard" />
);

// 4. PRINCIPAL LOGIN
export const PrincipalLogin = () => (
  <CommonPortalLogin roleLabel="Principal" roleFilter="principal" prefillEmail="principal@kbn.edu" dashboardPath="/principal/dashboard" />
);

// 5. PLACEMENT LOGIN
export const PlacementLogin = () => (
  <CommonPortalLogin roleLabel="Placement Officer" roleFilter="placement" prefillEmail="placement@kbn.edu" dashboardPath="/placement/dashboard" />
);

// 6. WARD COUNSELLOR LOGIN
export const CounsellorLogin = () => (
  <CommonPortalLogin roleLabel="Ward Counsellor" roleFilter="counsellor" prefillEmail="counsellor.cse@kbn.edu" dashboardPath="/counsellor/dashboard" />
);

// 7. LIBRARIAN LOGIN
export const LibrarianLogin = () => (
  <CommonPortalLogin roleLabel="Librarian" roleFilter="librarian" prefillEmail="librarian@kbn.edu" dashboardPath="/librarian/dashboard" />
);

// 8. ADMIN LOGIN
export const AdminLogin = () => (
  <CommonPortalLogin roleLabel="Administrator" roleFilter="admin" prefillEmail="admin@kbn.edu" dashboardPath="/admin/dashboard" />
);

// 9. PARENT LOGIN
export const ParentLogin = () => (
  <CommonPortalLogin roleLabel="Parent" roleFilter="parent" prefillEmail="parent@kbn.edu" dashboardPath="/parent/dashboard" />
);
