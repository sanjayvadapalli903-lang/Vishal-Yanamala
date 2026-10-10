import React, { useState, useEffect } from 'react';
import {
  Building2,
  LayoutDashboard,
  BarChart3,
  Users,
  CalendarCheck,
  AlertTriangle,
  Award,
  Briefcase,
  MessageSquare,
  FileText,
  ShieldCheck,
  Activity,
  Bell,
  LogOut,
  Download,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Loader2,
  X,
  Share2,
  Camera,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileModal } from '../components/ProfileModal';
import type { ActivityLog, Announcement, FeedbackItem } from '../types';

export const PrincipalDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'academic'
    | 'departments'
    | 'attendance'
    | 'alerts'
    | 'faculty'
    | 'placements'
    | 'feedback'
    | 'reports'
    | 'users'
    | 'activity'
    | 'announcements'
  >('dashboard');

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'picture' | 'password'>('profile');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // New announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Institutional Circular');
  const [annImportant, setAnnImportant] = useState(false);
  const [isPublishingAnn, setIsPublishingAnn] = useState(false);

  // User management status update
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

  // Fetch Principal data
  useEffect(() => {
    const fetchPrincipalData = async () => {
      try {
        const res = await fetch('/api/principal/data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const resJson = await res.json();
          setData(resJson.data);
        }
      } catch (err) {
        console.error('Failed to load principal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrincipalData();
  }, [token]);

  // Publish Announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    setIsPublishingAnn(true);
    try {
      const res = await fetch('/api/principal/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: annTitle,
          category: annCategory,
          important: annImportant,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setData((prev: any) => ({
          ...prev,
          recentAnnouncements: [resJson.announcement, ...(prev.recentAnnouncements || [])],
        }));
        setShowAnnModal(false);
        setAnnTitle('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishingAnn(false);
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    setIsUpdatingUser(userId);
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/principal/user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newStatus }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          usersList: prev.usersList.map((u: any) => (u.id === userId ? { ...u, status: newStatus } : u)),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  // Download CSV report
  const handleExportCSV = (type: string = 'general') => {
    window.open(`/api/reports/export?type=${type}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Principal Portal...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {
    name: user?.name || 'Dr. R. Krishnan',
    totalStudents: 2450,
    studentGrowth: '↑ 5%',
    totalFaculty: 182,
    facultyGrowth: '↑ 2%',
    placementRate: '78%',
    placementGrowth: '↑ 12%',
    departmentsCount: 8,
  };

  // Academic Trend Line Data
  const academicTrendData = data?.academicTrend || [
    { sem: 'Sem 1', overallAvg: 74, topPerformers: 94 },
    { sem: 'Sem 2', overallAvg: 76, topPerformers: 95 },
    { sem: 'Sem 3', overallAvg: 78, topPerformers: 97 },
    { sem: 'Sem 4', overallAvg: 81, topPerformers: 98 },
  ];

  // Placement Donut Data
  const placementStats = data?.placementStats || { placedPercentage: 78, placedCount: 654, inProcess: 120, notPlaced: 86 };
  const piePlacementData = [
    { name: 'Placed', value: placementStats.placedCount, color: '#3b82f6' },
    { name: 'In Process', value: placementStats.inProcess, color: '#f59e0b' },
    { name: 'Not Placed', value: placementStats.notPlaced, color: '#94a3b8' },
  ];

  const deptPerf = data?.departmentPerformance || [
    { dept: 'CSE', score: 88 },
    { dept: 'ECE', score: 84 },
    { dept: 'EEE', score: 80 },
    { dept: 'MECH', score: 78 },
    { dept: 'IT', score: 82 },
  ];

  const riskAlerts = data?.riskAlertsSummary || { lowAttendance: 28, lowPerformance: 15, academicProbation: 8 };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Smart Campus AI</h2>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Principal Portal</span>
            </div>
          </div>

          {/* Principal Profile Card */}
          <div
            onClick={() => setShowProfileModal(true)}
            className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
            title="Click to view profile & change password"
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">{profile.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Principal & Head</p>
              <span className="inline-block px-1.5 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-medium mt-0.5">
                Profile & Settings
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Academic Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Departments</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Student Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'faculty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Faculty Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('placements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'placements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Placements</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Principal Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Institutional Master Control
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Announcement</span>
            </button>

            <button
              onClick={() => handleExportCSV('academic')}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <ThemeToggle />

            {/* Profile Avatar Button with Change Picture shortcut */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setProfileModalTab('picture');
                  setShowProfileModal(true);
                }}
                className="relative p-0.5 rounded-full ring-2 ring-purple-500/40 hover:ring-purple-600 transition group cursor-pointer"
                title="Change Profile Photo"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileModalTab('profile');
                  setShowProfileModal(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="View Profile & Settings"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">{profile.name}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 space-y-6">
          
          {/* TOP 4 METRIC CARDS (Matching Principal Mockup) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Students */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Total Students</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.totalStudents.toLocaleString()}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.studentGrowth}
                </p>
              </div>
            </div>

            {/* 2. Total Faculty */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Total Faculty</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.totalFaculty}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.facultyGrowth}
                </p>
              </div>
            </div>

            {/* 3. Placements */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Placements</span>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Briefcase className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.placementRate}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.placementGrowth}
                </p>
              </div>
            </div>

            {/* 4. Departments */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Departments</span>
                <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.departmentsCount}
                </div>
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-1 cursor-pointer hover:underline" onClick={() => setActiveTab('departments')}>
                  View all
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: Academic Performance Line Chart & Department-wise Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Academic Performance Multi-Semester Line Chart (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Performance</h3>
                        <p className="text-[11px] text-slate-400">College-wide progression: Overall Avg vs Top Performers</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                          <span>Overall Avg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
                          <span>Top Performers</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={academicTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                          <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderRadius: '12px',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                          <Line type="monotone" dataKey="overallAvg" stroke="#3b82f6" strokeWidth={3} name="Overall Avg" />
                          <Line type="monotone" dataKey="topPerformers" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" name="Top Performers" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Autonomous Board Academic Index: 81.2 / 100</span>
                    <button onClick={() => setActiveTab('academic')} className="text-blue-600 font-semibold hover:underline">
                      In-depth Report
                    </button>
                  </div>
                </div>

                {/* Department-wise Performance Horizontal Bars (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department-wise Performance</h3>
                      <button onClick={() => setActiveTab('departments')} className="text-xs text-blue-600 font-semibold hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {deptPerf.map((dp: any) => (
                        <div key={dp.dept} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{dp.dept}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{dp.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full"
                              style={{ width: `${dp.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    Lead department: Computer Science & Engineering (88% Benchmark)
                  </div>
                </div>
              </div>

              {/* Row 2: Student Risk Alerts, Placement Statistics, and Recent Announcements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Student Risk Alerts Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Student Risk Alerts</h3>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">Low Attendance (&lt;75%)</span>
                        </div>
                        <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{riskAlerts.lowAttendance}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Low Performance (&lt;60%)</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{riskAlerts.lowPerformance}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Academic Probation</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{riskAlerts.academicProbation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-slate-100 transition text-center"
                    >
                      View All Alerts
                    </button>
                  </div>
                </div>

                {/* 2. Placement Statistics Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Placement Statistics</h3>
                      <span className="text-xs font-bold text-emerald-600">78% Placed</span>
                    </div>

                    <div className="relative h-36 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={piePlacementData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {piePlacementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-black text-slate-900 dark:text-white">78%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] pt-1">
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                        <span className="text-slate-400 block">Placed</span>
                        <span className="font-bold text-blue-600">{placementStats.placedCount}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40">
                        <span className="text-slate-400 block">Process</span>
                        <span className="font-bold text-amber-600">{placementStats.inProcess}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <span className="text-slate-400 block">Remaining</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">{placementStats.notPlaced}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('placements')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-slate-100 transition text-center"
                    >
                      View Report
                    </button>
                  </div>
                </div>

                {/* 3. Recent Announcements Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Announcements</h3>
                      <button
                        onClick={() => setShowAnnModal(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Circular
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(data?.recentAnnouncements || []).slice(0, 3).map((ann: Announcement) => (
                        <div key={ann.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                            {ann.title}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {ann.date} • {ann.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-slate-100 transition text-center"
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC ANALYTICS */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Academic Trends</h2>
                    <p className="text-xs text-slate-500">Cross-department GPA distributions, pass rates, and curriculum benchmarks</p>
                  </div>
                  <button onClick={() => handleExportCSV('academic')} className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                    Download CSV
                  </button>
                </div>

                <div className="h-72 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptPerf}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                      <XAxis dataKey="dept" stroke="#94a3b8" />
                      <YAxis domain={[50, 100]} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Dept Index Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">User & Role Management (RBAC)</h2>
                    <p className="text-xs text-slate-500">Institutional account status, role verification, and access controls</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">College ID / Email</th>
                        <th className="py-2.5 px-3 text-center">Role</th>
                        <th className="py-2.5 px-3 text-center">Department</th>
                        <th className="py-2.5 px-3 text-center">Account Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {(data?.usersList || []).map((u: any) => (
                        <tr key={u.id}>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{u.collegeId} ({u.email})</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-700">{u.role}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{u.department}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              disabled={isUpdatingUser === u.id}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOGS */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">System Security & Activity Audit Logs</h2>
                <p className="text-xs text-slate-500 mb-6">Real-time audit trail of logins, circular postings, and evaluation modifications</p>

                <div className="space-y-3">
                  {(data?.activityLogs || []).map((log: ActivityLog) => (
                    <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{log.user}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{log.action}</span>
                        <p className="text-slate-500 mt-0.5">{log.details}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        <span>{log.timestamp}</span>
                        <span className="block font-mono text-[10px]">IP: {log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Circulars & Notices</h2>
                    <p className="text-xs text-slate-500">Official broadcasts visible on Student and Teacher portals</p>
                  </div>
                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Circular</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(data?.recentAnnouncements || []).map((ann: Announcement) => (
                    <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">{ann.title}</span>
                        <span className="text-xs text-slate-400 mt-1 block">
                          Published by: {ann.author} • Category: {ann.category} • Date: {ann.date}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Broadcast Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* POST ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Post College-wide Circular</h3>
            <form onSubmit={handlePublishAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. End Semester Exam Regulations & Hall Tickets Release"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Examinations">Examinations & Academics</option>
                  <option value="Campus Event">Campus Event / Fest</option>
                  <option value="Placements">Placements & Drives</option>
                  <option value="Institutional Circular">General Administration</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingAnn}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-1.5"
                >
                  {isPublishingAnn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Circular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE & CHANGE PASSWORD MODAL */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialTab={profileModalTab}
      />

    </div>
  );
};
