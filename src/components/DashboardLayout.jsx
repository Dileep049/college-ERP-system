import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Briefcase,
  CheckSquare,
  Users,
  FileText,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Building2,
  Settings,
  User,
  CreditCard,
  Library,
  UserCheck,
  Award
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Define sidebar menu options by role
  const menuConfig = {
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Apply Leave', path: '/student/leaves', icon: Calendar },
      { label: 'Internal Marks', path: '/student/marks', icon: FileText },
      { label: 'Semester Results', path: '/student/results', icon: Award },
      { label: 'Assignments', path: '/student/assignments', icon: CheckSquare },
      { label: 'Study Notes', path: '/student/notes', icon: BookOpen },
      { label: 'Online Fees', path: '/student/fees', icon: CreditCard },
      { label: 'Library Catalog', path: '/student/library', icon: Library },
      { label: 'Counselling', path: '/student/counselling', icon: UserCheck },
      { label: 'Placements', path: '/student/placements', icon: Briefcase }
    ],
    faculty: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { label: 'Mark Attendance', path: '/faculty/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/faculty/marks', icon: FileText },
      { label: 'Upload Assignments', path: '/faculty/assignments', icon: Briefcase },
      { label: 'Study Materials', path: '/faculty/notes', icon: BookOpen }
    ],
    hod: [
      { label: 'Department Overview', path: '/hod/dashboard', icon: LayoutDashboard },
      { label: 'Faculty Management', path: '/hod/faculty', icon: Users },
      { label: 'Academic Reports', path: '/hod/reports', icon: FileText }
    ],
    principal: [
      { label: 'Institutional Panel', path: '/principal/dashboard', icon: LayoutDashboard },
      { label: 'Branch Analytics', path: '/principal/branches', icon: Building2 },
      { label: 'Generate Reports', path: '/principal/reports', icon: FileText }
    ],
    placement: [
      { label: 'Placement Panel', path: '/placement/dashboard', icon: LayoutDashboard },
      { label: 'Manage Drives', path: '/placement/drives', icon: Briefcase },
      { label: 'Eligible Students', path: '/placement/students', icon: Users }
    ],
    counsellor: [
      { label: 'Counsellor Panel', path: '/counsellor/dashboard', icon: LayoutDashboard },
      { label: 'Parent Meetings', path: '/counsellor/parent-meetings', icon: Users },
      { label: 'Counselling Wards', path: '/counsellor/wards', icon: UserCheck },
      { label: 'Leave Approvals', path: '/counsellor/leaves', icon: Calendar }
    ],
    librarian: [
      { label: 'Library Inventory', path: '/librarian/dashboard', icon: Library },
      { label: 'Circulation Board', path: '/librarian/circulation', icon: CheckSquare }
    ],
    admin: [
      { label: 'Admin Panel', path: '/admin/dashboard', icon: Settings }
    ]
  };

  const currentMenu = menuConfig[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate(`/${user.role}/login`);
  };

  // Get active role tag styling
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'principal': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'hod': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'placement': return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'counsellor': return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
      case 'librarian': return 'bg-teal-500/10 text-teal-500 border border-teal-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-250 font-sans">
      
      {/* Sidebar for desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:h-screen lg:flex lg:flex-col`}>
        
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Building2 size={20} className="animate-pulse-slow" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-750 dark:from-white dark:to-slate-200">ACADEMIA</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider -mt-0.5">Portal Hub</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Profile Card in Sidebar */}
        <div className="p-4 mx-4 my-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/60 border border-slate-200/60 dark:border-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-250 truncate">{user.fullName}</p>
              <p className="text-[10.5px] font-medium text-slate-450 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${getRoleBadgeStyle(user.role)}`}>
              {user.role}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {user.department && user.department !== 'N/A' ? user.department : ''}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                    : 'text-slate-650 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'scale-110' : 'opacity-80'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold font-display text-slate-800 dark:text-white capitalize">
              {location.pathname.split('/').pop().replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-2"></span>
              <span>June 7, 2026</span>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            {/* Notifications panel */}
            <div className="relative">
              <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Quick Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-slate-550/10 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-xs font-semibold text-slate-650 dark:text-slate-300 hidden md:block select-none">{user.fullName.split(' ')[0]}</span>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs text-slate-400 dark:text-slate-550 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{user.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
