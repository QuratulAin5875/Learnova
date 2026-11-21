import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Code2,
  Compass,
  Eye,
  EyeOff,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  History,
  LayoutGrid,
  LogOut,
  Menu,
  Network,
  RotateCcw,
  Settings,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandUI';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export const PublicFooter: React.FC = () => (
  <footer className="border-t border-slate-200 bg-white/80 py-6 px-6 mt-auto">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-3">
        <BrandLogo />
        <span>© 2026 Learnova. All rights reserved.</span>
      </div>
      <div className="flex flex-wrap items-center gap-5 font-medium">
        <Link to="/verify" className="hover:text-[#0052CC] transition-colors">
          Verify a certificate
        </Link>
        <Link to="/help" className="hover:text-[#0052CC] transition-colors">
          Privacy Policy
        </Link>
        <Link to="/help" className="hover:text-[#0052CC] transition-colors">
          Terms of Service
        </Link>
        <Link to="/help" className="hover:text-[#0052CC] transition-colors">
          Help Center
        </Link>
      </div>
    </div>
  </footer>
);

export const PublicLayout: React.FC<{
  children: React.ReactNode;
  rightMode?: 'landing' | 'auth' | 'verify';
}> = ({ children, rightMode = 'landing' }) => {
  const { showFigmaPresets, setShowFigmaPresets } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        <Link to="/">
          {rightMode === 'verify' ? (
            <BrandLogo variant="letter" subtitle="Certificate Verification" />
          ) : (
            <BrandLogo />
          )}
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFigmaPresets(!showFigmaPresets)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Show or hide Figma state preset bars"
          >
            {showFigmaPresets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFigmaPresets ? 'Hide Figma Presets' : 'Show Figma Presets'}</span>
          </button>

          {rightMode === 'verify' ? (
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-[#0052CC] px-3 py-1.5"
            >
              Sign In
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-[#0052CC] px-3 py-1.5 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold bg-[#0052CC] hover:bg-[#0043A8] text-white px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <PublicFooter />
    </div>
  );
};

const LEARNER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/roadmap', label: 'My Roadmap', icon: Compass },
  { to: '/practice', label: 'Practice', icon: Code2 },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/history', label: 'Assessment History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export const LearnerShell: React.FC<{
  children: React.ReactNode;
  breadcrumb?: string;
}> = ({ children, breadcrumb = 'Dashboard' }) => {
  const {
    user,
    courses,
    activeCourse,
    setActiveCourseId,
    loginAsAdmin,
    logout,
    showFigmaPresets,
    setShowFigmaPresets,
    resetDemoState,
  } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between px-2 py-1.5 mb-5">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <BrandLogo variant="icon" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {LEARNER_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <NavLink
          to="/help"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-50 text-[#0052CC]' : 'text-slate-600 hover:bg-slate-100'
            )
          }
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </NavLink>
        <NavLink
          to="/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-50 text-[#0052CC]' : 'text-slate-600 hover:bg-slate-100'
            )
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col justify-between shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar (<1024px, NFR08 Responsive) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-white h-full flex flex-col justify-between shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-500 truncate">
              Home <span className="mx-1">&gt;</span>{' '}
              <span className="text-slate-900 font-semibold">{breadcrumb}</span>
            </div>
            {/* Course Switcher Pill (from p24 / p68) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#0052CC]" />
              <span className="text-slate-500">Active Course:</span>
              <select
                aria-label="Select active course"
                value={activeCourse.id}
                onChange={(e) => setActiveCourseId(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clean Demo Controls */}
            <button
              type="button"
              onClick={() => setShowFigmaPresets(!showFigmaPresets)}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Toggle Figma state preset bars"
            >
              {showFigmaPresets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>Presets</span>
            </button>

            {showFigmaPresets && (
            <button
              type="button"
              onClick={resetDemoState}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Reset localStorage demo data to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            )}

            {showFigmaPresets && (
            <button
              type="button"
              onClick={() => {
                loginAsAdmin();
                navigate('/admin/subjects');
              }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Demo only: switch to Admin Console"
            >
              Admin View
            </button>
            )}

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Log out</span>
            </button>

            <button
              aria-label="Notifications"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <Link to="/profile" className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block leading-tight">
                <div className="text-xs font-bold text-slate-900">{user?.name || 'Alex'}</div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {user?.role || 'Learner'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">
                {user?.avatarInitials || 'AM'}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

const ADMIN_NAV = [
  { to: '/admin/subjects', label: 'Subjects & Knowledge Graph', icon: Network },
  { to: '/admin/questions', label: 'Question Bank', icon: FileQuestion },
  { to: '/admin/resources', label: 'Curated Resources', icon: BookOpen },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loginAsLearner, logout, showFigmaPresets, setShowFigmaPresets } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Admin Bar (matches Figma p61, p62) */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/admin/subjects">
            <BrandLogo badge="ADMIN CONSOLE" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Faculty of Computer Science &amp; Engineering</span>
          </div>
          <button
            type="button"
            onClick={() => setShowFigmaPresets(!showFigmaPresets)}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {showFigmaPresets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>Presets</span>
          </button>
          {showFigmaPresets && (
          <button
            onClick={() => {
              loginAsLearner();
              navigate('/dashboard');
            }}
            className="text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-[#0052CC] hover:bg-blue-100 cursor-pointer"
            title="Demo only: switch to Learner view"
          >
            Learner View
          </button>
          )}
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-xs font-bold text-slate-900">
                {user?.role === 'admin' ? user.name : 'Dr. Robert Vance'}
              </div>
              <div className="text-[10px] text-slate-500">Academic Director / Admin</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">
              RV
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col justify-between p-4 shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              CURRICULUM
            </div>
            <nav className="space-y-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors',
                      active
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative z-10 w-64 bg-white h-full p-4 flex flex-col justify-between">
              <div className="space-y-1">
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

