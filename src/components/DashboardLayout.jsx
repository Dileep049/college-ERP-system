import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
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
  Award,
  Lock,
  Ticket,
  Home,
  MessageSquare,
  ClipboardList,
  FileCheck,
  Clock,
  Upload,
  TrendingUp,
  Activity,
  ShieldCheck
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout, theme, toggleTheme, updateProfilePhoto } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when mobile sidebar is open (Sidebar Scroll Bleed Fix)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return alert('Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.');
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('File size exceeds maximum limit of 5 MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) return;
    try {
      setIsUploading(true);
      await updateProfilePhoto(photoPreview);
      setShowPhotoModal(false);
      setPhotoPreview(null);
    } catch (_) {
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreDefaultAvatar = async () => {
    if (confirm('Are you sure you want to restore the default initial avatar?')) {
      try {
        setIsUploading(true);
        await updateProfilePhoto(null);
        setShowPhotoModal(false);
        setPhotoPreview(null);
      } catch (_) {
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!user) return null;

  // Define sidebar menu options by role
  const menuConfig = {
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/student/profile', icon: UserCheck },
      { label: 'Academic Overview', path: '/student/academic-overview', icon: TrendingUp },
      { label: 'Course Registration', path: '/student/course-registration', icon: BookOpen },
      { label: 'Attendance', path: '/student/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/student/marks', icon: FileText },
      { label: 'Semester Results', path: '/student/results', icon: Award },
      { label: 'Assignments', path: '/student/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/student/notes', icon: ClipboardList },
      { label: 'Leave', path: '/student/leaves', icon: Calendar },
      { label: 'My Ward Counsellor', path: '/student/counsellor', icon: UserCheck },
      { label: 'Faculty', path: '/student/faculty', icon: Users },
      { label: 'Placements', path: '/student/placements', icon: Briefcase },
      { label: 'Counselling', path: '/student/counselling', icon: Activity },
      { label: 'Notifications', path: '/student/notifications', icon: Bell }
    ],
    faculty: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { label: 'My Classes', path: '/faculty/classes', icon: BookOpen },
      { label: 'My Students', path: '/faculty/students', icon: Users },
      { label: 'Attendance', path: '/faculty/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/faculty/marks', icon: FileText },
      { label: 'Assignments', path: '/faculty/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/faculty/notes', icon: ClipboardList },
      { label: 'Academic Performance', path: '/faculty/academic-performance', icon: TrendingUp },
      { label: 'Student Progress', path: '/faculty/student-progress', icon: Activity },
      { label: 'Leave', path: '/faculty/leaves', icon: Calendar },
      { label: 'Reports', path: '/faculty/reports', icon: FileText },
      { label: 'Profile', path: '/faculty/profile', icon: UserCheck }
    ],
    hod: [
      { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
      { label: 'Department Overview', path: '/hod/overview', icon: Building2 },
      { label: 'Faculty Directory', path: '/hod/faculty-directory', icon: Users },
      { label: 'Ward Counsellors', path: '/hod/ward-counsellors', icon: UserCheck },
      { label: 'Faculty Workload', path: '/hod/workload', icon: Briefcase },
      { label: 'Attendance Monitoring', path: '/hod/attendance-monitoring', icon: CheckSquare },
      { label: 'Attendance Unlocks', path: '/hod/attendance-unlocks', icon: Lock },
      { label: 'Faculty Leaves', path: '/hod/faculty-leaves', icon: Calendar },
      { label: 'Academic Performance', path: '/hod/academic-performance', icon: Award },
      { label: 'Curriculum Progress', path: '/hod/curriculum', icon: ClipboardList },
      { label: 'Department Announcements', path: '/hod/announcements', icon: Bell },
      { label: 'Reports', path: '/hod/reports', icon: FileText },
      { label: 'Audit Logs', path: '/hod/audit-logs', icon: Clock },
      { label: 'Settings', path: '/hod/settings', icon: Settings }
    ],
    principal: [
      { label: 'Executive Console', path: '/principal/dashboard', icon: LayoutDashboard },
      { label: 'Branch Analytics', path: '/principal/branches', icon: Building2 },
      { label: 'Semester Results', path: '/principal/results', icon: Award },
      { label: 'Academic Performance', path: '/principal/performance', icon: TrendingUp },
      { label: 'Faculty Overview', path: '/principal/faculty', icon: Users },
      { label: 'Attendance Analytics', path: '/principal/attendance', icon: CheckSquare },
      { label: 'Academic Calendar', path: '/principal/calendar', icon: Clock },
      { label: 'Compile Reports', path: '/principal/reports', icon: FileText },
      { label: 'Leaves Review', path: '/principal/leaves', icon: Calendar },
      { label: 'Document Dispatch', path: '/principal/documents', icon: FileCheck },
      { label: 'Placement Analytics', path: '/principal/placements', icon: Briefcase },
      { label: 'Settings', path: '/principal/settings', icon: Settings }
    ],
    placement: [
      { label: 'Command Board', path: '/placement/dashboard', icon: LayoutDashboard },
      { label: 'Placement Drives', path: '/placement/drives', icon: Briefcase },
      { label: 'Upcoming Drives', path: '/placement/upcoming-drives', icon: Calendar },
      { label: 'Applications', path: '/placement/applications', icon: ClipboardList },
      { label: 'Eligible Candidates', path: '/placement/students', icon: Users },
      { label: 'Shortlisted Students', path: '/placement/shortlisted', icon: UserCheck },
      { label: 'Interview Schedule', path: '/placement/interviews', icon: Clock },
      { label: 'Selected Students', path: '/placement/selected', icon: ShieldCheck },
      { label: 'Companies', path: '/placement/partners', icon: Building2 },
      { label: 'Training & Mock Tests', path: '/placement/training', icon: BookOpen },
      { label: 'Placement Analytics', path: '/placement/analytics', icon: TrendingUp },
      { label: 'Placement Reports', path: '/placement/reports', icon: FileText },
      { label: 'Notifications', path: '/placement/notifications', icon: Bell },
      { label: 'Settings', path: '/placement/settings', icon: Settings }
    ],
    counsellor: [
      { label: 'Counsellor Panel', path: '/counsellor/dashboard', icon: LayoutDashboard },
      { label: 'Parent Meetings', path: '/counsellor/parent-meetings', icon: Users },
      { label: 'Counselling Wards', path: '/counsellor/wards', icon: UserCheck },
      { label: 'Student Leaves', path: '/counsellor/student-leaves', icon: Calendar },
      { label: 'Analytics Reports', path: '/counsellor/reports', icon: FileText },
      { label: 'Profile Settings', path: '/ward-counsellor/profile', icon: User }
    ],
    ward_counsellor: [
      { label: 'Counsellor Panel', path: '/counsellor/dashboard', icon: LayoutDashboard },
      { label: 'Parent Meetings', path: '/counsellor/parent-meetings', icon: Users },
      { label: 'Counselling Wards', path: '/counsellor/wards', icon: UserCheck },
      { label: 'Student Leaves', path: '/counsellor/student-leaves', icon: Calendar },
      { label: 'Analytics Reports', path: '/counsellor/reports', icon: FileText },
      { label: 'Profile Settings', path: '/ward-counsellor/profile', icon: User }
    ],
    librarian: [
      { label: 'Library Analytics', path: '/librarian/analytics', icon: LayoutDashboard },
      { label: 'Books Inventory', path: '/librarian/dashboard', icon: Library },
      { label: 'Circulation Board', path: '/librarian/circulation', icon: CheckSquare },
      { label: 'Digital E-Resources', path: '/librarian/eresources', icon: BookOpen },
      { label: 'Fines & Clearance', path: '/librarian/fines', icon: CreditCard }
    ],
    superadmin: [
      { label: 'System Control Board', path: '/admin/dashboard', icon: Settings },
      { label: 'Bulk Student Import', path: '/admin/bulk-import', icon: Upload },
      { label: 'Institutional Analytics', path: '/admin/reports', icon: FileText }
    ],
    admin: [
      { label: 'Admin Panel', path: '/admin/dashboard', icon: Settings },
      { label: 'Bulk Student Import', path: '/admin/bulk-import', icon: Upload },
      { label: 'Analytics Reports', path: '/admin/reports', icon: FileText }
    ],
    vice_principal: [
      { label: 'Vice Principal Board', path: '/principal/dashboard', icon: LayoutDashboard },
      { label: 'Branch Analytics', path: '/principal/branches', icon: Building2 },
      { label: 'Compile Reports', path: '/principal/reports', icon: FileText }
    ],
    lab_faculty: [
      { label: 'Lab Attendance', path: '/faculty/attendance', icon: CheckSquare },
      { label: 'Lab Workload', path: '/faculty/dashboard', icon: LayoutDashboard }
    ],
    accounts: [
      { label: 'Fee Management', path: '/admin/dashboard', icon: CreditCard },
      { label: 'Collection Reports', path: '/admin/reports', icon: FileText }
    ],
    exam_cell: [
      { label: 'Internal Marks Entry', path: '/faculty/marks', icon: FileText },
      { label: 'Semester Results', path: '/admin/dashboard', icon: Award }
    ],
    transport: [
      { label: 'Transport & Fleet', path: '/admin/dashboard', icon: Home }
    ],
    parent: [
      { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { label: 'My Ward', path: '/parent/my-ward', icon: UserCheck },
      { label: 'Academic Overview', path: '/parent/academic-overview', icon: TrendingUp },
      { label: 'Attendance', path: '/parent/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/parent/marks', icon: FileText },
      { label: 'Semester Results', path: '/parent/results', icon: Award },
      { label: 'Assignments', path: '/parent/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/parent/notes', icon: ClipboardList },
      { label: 'Leave', path: '/parent/leaves', icon: Calendar },
      { label: 'Ward Counsellor', path: '/parent/counsellor', icon: UserCheck },
      { label: 'Faculty', path: '/parent/faculty', icon: Users },
      { label: 'Counselling', path: '/parent/counselling', icon: Activity },
      { label: 'Parent Meetings', path: '/parent/meetings', icon: MessageSquare },
      { label: 'Placements', path: '/parent/placements', icon: Briefcase },
      { label: 'Monthly Report', path: '/parent/monthly-report', icon: FileText },
      { label: 'Notifications', path: '/parent/notifications', icon: Bell },
      { label: 'Profile', path: '/parent/profile', icon: UserCheck }
    ]
  };

  const currentMenu = menuConfig[user.role] || [];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/', { replace: true });
  };

  // Get active role tag styling
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'parent': return 'bg-pink-500/10 text-pink-500 border border-pink-500/20';
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
      
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for desktop & mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-screen h-[100dvh] overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:h-screen lg:flex lg:flex-col`}>
        
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
        {(() => {
          const userName = user.fullName || user.name || user.displayName || 'User';
          const userInitials = userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
          const userEmail = user.email || '';
          return (
            <div className="p-4 mx-4 my-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {user.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt={userName} className="w-10 h-10 rounded-xl object-cover border border-blue-500/30 shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{userEmail}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${getRoleBadgeStyle(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                  {user.department && user.department !== 'N/A' ? user.department : ''}
                </span>
              </div>
            </div>
          );
        })()}

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
        <header className="h-16 flex items-center justify-between px-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm sm:text-lg font-bold font-display text-slate-800 dark:text-white capitalize truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
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
            <ThemeToggle />

            {/* Notifications panel */}
            <div className="relative">
              <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Quick Profile Dropdown */}
            {(() => {
              const userName = user.fullName || user.name || user.displayName || 'User';
              const userInitials = userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
              const firstName = userName.split(' ')[0] || 'User';
              return (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:bg-slate-500/10 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all"
                  >
                    {user.profilePhotoUrl ? (
                      <img src={user.profilePhotoUrl} alt="User Avatar" className="w-8 h-8 rounded-lg object-cover border border-purple-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {userInitials}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-white hidden md:block select-none">{firstName}</span>
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-fade-in text-xs font-semibold">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                          {user.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-xl object-cover border border-purple-500 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              {userInitials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase truncate">{user.role === 'hod' ? `HOD • ${user.department || 'CSE'}` : user.role}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="py-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              setShowPhotoModal(true);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-xl transition-colors font-bold"
                          >
                            <Upload size={14} />
                            <span>Change Photo</span>
                          </button>

                          {user.role === 'hod' && (
                            <>
                              <Link
                                to="/hod/settings"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 rounded-xl transition-colors font-bold"
                              >
                                <UserCheck size={14} />
                                <span>My Profile</span>
                              </Link>
                              <Link
                                to="/hod/settings"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 rounded-xl transition-colors font-bold"
                              >
                                <Building2 size={14} />
                                <span>Department Settings</span>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="p-1 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 dark:bg-slate-950/40 min-w-0 w-full">
          <div className="max-w-7xl mx-auto animate-fade-in min-w-0 w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Change Profile Photo Self-Service Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Change Your Profile Photo</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            {/* Photo Display / Preview */}
            <div className="relative w-28 h-28 mx-auto group">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-28 h-28 rounded-3xl object-cover border-4 border-purple-600 shadow-xl" />
              ) : user.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="Current Profile" className="w-28 h-28 rounded-3xl object-cover border-4 border-purple-600 shadow-xl" />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-purple-600 shadow-xl">
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Supported formats: JPG, JPEG, PNG, WEBP (Max 5 MB)
            </p>

            <div className="space-y-2 pt-1">
              <label className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2">
                <Upload size={14} />
                <span>Select New Photo</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>

              {photoPreview && (
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  {isUploading ? 'Uploading Photo...' : 'Confirm & Save Photo'}
                </button>
              )}

              {user.profilePhotoUrl && (
                <button
                  onClick={handleRestoreDefaultAvatar}
                  disabled={isUploading}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Restore Default Avatar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
