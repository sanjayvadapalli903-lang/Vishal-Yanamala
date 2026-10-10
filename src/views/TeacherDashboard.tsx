import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Award,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Bell,
  LogOut,
  Plus,
  Search,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Edit3,
  Loader2,
  UserCheck,
  UserX,
  X,
  Download,
  Camera,
  Layers,
  CalendarDays,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileModal } from '../components/ProfileModal';
import type { StudentAttention, MentorFollowUp, Assignment, LearningMaterial, FeedbackItem } from '../types';

export const TeacherDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'classes' | 'attendance' | 'materials' | 'assignments' | 'marks' | 'analytics' | 'support' | 'feedback' | 'announcements' | 'mentor'
  >('dashboard');

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'picture' | 'password'>('profile');

  // Teacher Attendance Sub-tab
  const [teacherAttSubTab, setTeacherAttSubTab] = useState<'roster_periods' | 'day_log' | 'schedule'>('roster_periods');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Mark Attendance Modal
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [attendanceSubject, setAttendanceSubject] = useState('Data Structures');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendancePeriodNum, setAttendancePeriodNum] = useState<number>(1);
  const [attendanceTimeSlot, setAttendanceTimeSlot] = useState<string>('09:00 - 10:00');
  const [attendanceList, setAttendanceList] = useState<Array<{ studentId: string; name: string; status: 'PRESENT' | 'ABSENT' | 'LEAVE'; periodsHeld: number; periodsAttended: number }>>([
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', status: 'PRESENT', periodsHeld: 48, periodsAttended: 45 },
    { studentId: 'STD2024102', name: 'Rohit Kumar', status: 'ABSENT', periodsHeld: 48, periodsAttended: 30 },
    { studentId: 'STD2024103', name: 'Sneha Reddy', status: 'PRESENT', periodsHeld: 48, periodsAttended: 33 },
    { studentId: 'STD2024104', name: 'Akhil Singh', status: 'PRESENT', periodsHeld: 48, periodsAttended: 34 },
    { studentId: 'STD2024105', name: 'Pooja Nair', status: 'PRESENT', periodsHeld: 48, periodsAttended: 36 },
  ]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status })));
  };

  // Create Assignment Modal
  const [showCreateAsgModal, setShowCreateAsgModal] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgSubject, setNewAsgSubject] = useState('Data Structures');
  const [newAsgDueDate, setNewAsgDueDate] = useState('');
  const [newAsgPoints, setNewAsgPoints] = useState(100);
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // Upload Material Modal
  const [showUploadMatModal, setShowUploadMatModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState('Data Structures');
  const [matType, setMatType] = useState('PDF');
  const [isUploadingMat, setIsUploadingMat] = useState(false);

  // AI Risk Explainer Modal
  const [selectedRiskStudent, setSelectedRiskStudent] = useState<StudentAttention | null>(null);
  const [aiRiskAnalysis, setAiRiskAnalysis] = useState<any | null>(null);
  const [loadingAiRisk, setLoadingAiRisk] = useState(false);

  // Mentor Follow-up Modal
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorStudent, setMentorStudent] = useState<StudentAttention | null>(null);
  const [mentorNotes, setMentorNotes] = useState('');
  const [mentorAction, setMentorAction] = useState('Remedial lab arranged');
  const [mentorDate, setMentorDate] = useState('2025-10-25');
  const [isSavingMentor, setIsSavingMentor] = useState(false);

  // Fetch Teacher Data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await fetch('/api/teacher/data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const resJson = await res.json();
          setData(resJson.data);
        }
      } catch (err) {
        console.error('Failed to load teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [token]);

  // Mark Attendance submission
  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      const res = await fetch('/api/teacher/mark-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: attendanceSubject,
          date: attendanceDate,
          periodNumber: attendancePeriodNum,
          timeSlot: attendanceTimeSlot,
          attendanceList,
        }),
      });
      if (res.ok) {
        setShowMarkAttendanceModal(false);
        // Refresh attendance stats locally
        setData((prev: any) => ({
          ...prev,
          attendanceSummary: {
            ...prev.attendanceSummary,
            present: prev.attendanceSummary.present + 1,
          },
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Create Assignment submission
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) return;
    setIsCreatingAsg(true);
    try {
      const res = await fetch('/api/teacher/create-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAsgTitle,
          subject: newAsgSubject,
          dueDate: newAsgDueDate || '2025-10-30',
          points: newAsgPoints,
          description: newAsgDesc,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setData((prev: any) => ({
          ...prev,
          recentAssignments: [resJson.assignment, ...(prev.recentAssignments || [])],
        }));
        setShowCreateAsgModal(false);
        setNewAsgTitle('');
        setNewAsgDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingAsg(false);
    }
  };

  // Upload Material submission
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    setIsUploadingMat(true);
    try {
      const res = await fetch('/api/teacher/upload-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: matTitle,
          subject: matSubject,
          type: matType,
          size: '4.8 MB',
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setData((prev: any) => ({
          ...prev,
          materials: [resJson.material, ...(prev.materials || [])],
        }));
        setShowUploadMatModal(false);
        setMatTitle('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingMat(false);
    }
  };

  // Fetch AI Risk Analysis for student
  const handleOpenAiRisk = async (student: StudentAttention) => {
    setSelectedRiskStudent(student);
    setLoadingAiRisk(true);
    setAiRiskAnalysis(null);
    try {
      const res = await fetch('/api/ai/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentName: student.name,
          attendance: student.attendance,
          avgMarks: student.avgMarks,
          reason: student.reason,
        }),
      });
      const json = await res.json();
      setAiRiskAnalysis(json.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiRisk(false);
    }
  };

  // Log Mentor Follow-up
  const handleSaveMentorFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorStudent) return;
    setIsSavingMentor(true);
    try {
      const res = await fetch('/api/teacher/mentor-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentName: mentorStudent.name,
          studentId: mentorStudent.studentId,
          notes: mentorNotes,
          actionTaken: mentorAction,
          followUpDate: mentorDate,
        }),
      });
      if (res.ok) {
        setShowMentorModal(false);
        setMentorNotes('');
        setData((prev: any) => ({
          ...prev,
          studentsNeedingAttention: prev.studentsNeedingAttention.map((s: StudentAttention) =>
            s.studentId === mentorStudent.studentId ? { ...s, status: 'Counseled & Logged' } : s
          ),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMentor(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Faculty Portal...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {
    name: user?.name || 'Dr. Priya Sharma',
    teacherId: user?.collegeId || 'TCH150',
    department: 'Computer Science & Engineering',
    classesCount: 4,
    totalStudents: 120,
    pendingAssignments: 8,
    urgentAssignments: 2,
    avgPerformance: '82%',
    performanceChange: '+5% this month',
  };

  // Chart Data
  const classPerformanceData = data?.classPerformance || [
    { dept: 'CSE', avgMarks: 85, attendance: 92 },
    { dept: 'ECE', avgMarks: 78, attendance: 86 },
    { dept: 'EEE', avgMarks: 74, attendance: 82 },
    { dept: 'MECH', avgMarks: 80, attendance: 88 },
  ];

  // Attendance donut breakdown
  const attSummary = data?.attendanceSummary || { percentage: 88, present: 106, absent: 12, leave: 2 };
  const pieAttendanceData = [
    { name: 'Present', value: attSummary.present, color: '#3b82f6' },
    { name: 'Absent', value: attSummary.absent, color: '#ef4444' },
    { name: 'Leave', value: attSummary.leave, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Smart Campus AI</h2>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Teacher Portal</span>
            </div>
          </div>

          {/* Teacher Profile Card */}
          <div
            onClick={() => setShowProfileModal(true)}
            className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
            title="Click to view profile & change password"
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{profile.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ID: {profile.teacherId}</p>
              <span className="inline-block px-1.5 py-0.5 rounded-sm bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium mt-0.5">
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
              onClick={() => setActiveTab('classes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My Classes</span>
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
              onClick={() => setActiveTab('materials')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Materials</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => setActiveTab('marks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'marks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Marks Entry</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Class Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Student Support</span>
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
              <span>Feedback</span>
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

            <button
              onClick={() => setActiveTab('mentor')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'mentor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Mentor Follow-up</span>
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
              Teacher Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Authorized Faculty
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMarkAttendanceModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
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
                className="relative p-0.5 rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-600 transition group cursor-pointer"
                title="Change Profile Photo"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
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
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
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
          
          {/* TOP 4 METRIC CARDS (Matching Teacher Mockup) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. My Classes */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">My Classes</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.classesCount}
                </div>
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-1 cursor-pointer hover:underline" onClick={() => setActiveTab('classes')}>
                  View classes
                </p>
              </div>
            </div>

            {/* 2. Total Students */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Total Students</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.totalStudents}
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  In my classes
                </p>
              </div>
            </div>

            {/* 3. Pending Assignments */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Pending Assignments</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.pendingAssignments}
                </div>
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
                  {profile.urgentAssignments} urgent
                </p>
              </div>
            </div>

            {/* 4. Average Performance */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Average Performance</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.avgPerformance}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.performanceChange}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: Class Performance Chart & Attendance Overview Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Class Performance Bar Chart (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Class Performance</h3>
                        <p className="text-[11px] text-slate-400">Average Marks vs Attendance % across departments</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                          <span>Avg Marks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                          <span>Attendance %</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                          <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderRadius: '12px',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="avgMarks" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Avg Marks" />
                          <Bar dataKey="attendance" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Attendance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Highest section performance: CSE (85% Marks, 92% Attendance)</span>
                  </div>
                </div>

                {/* Attendance Overview Donut (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Attendance Overview</h3>
                      <button
                        onClick={() => setShowMarkAttendanceModal(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Today's Roll Call
                      </button>
                    </div>

                    <div className="relative h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieAttendanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieAttendanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{attSummary.percentage}%</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40">
                        <span className="text-[10px] text-slate-400 block">Present</span>
                        <span className="font-bold text-blue-600">{attSummary.present}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                        <span className="text-[10px] text-slate-400 block">Absent</span>
                        <span className="font-bold text-rose-600">{attSummary.absent}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                        <span className="text-[10px] text-slate-400 block">Leave</span>
                        <span className="font-bold text-amber-600">{attSummary.leave}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setShowMarkAttendanceModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Mark Class Attendance</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Students Needing Attention & Recent Assignments */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Students Needing Attention (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Students Needing Attention</h3>
                      </div>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">4 Critical Alerts</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-2">Name</th>
                            <th className="pb-2 text-center">Attendance</th>
                            <th className="pb-2 text-center">Performance</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {(data?.studentsNeedingAttention || []).map((student: StudentAttention) => (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5">
                                <span className="font-bold text-slate-900 dark:text-white block">{student.name}</span>
                                <span className="text-[10px] text-slate-400">{student.studentId} • {student.department}</span>
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`font-bold ${student.attendance < 70 ? 'text-rose-600' : 'text-amber-600'}`}>
                                  {student.attendance}%
                                </span>
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  student.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {student.riskLevel}
                                </span>
                              </td>
                              <td className="py-2.5 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenAiRisk(student)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Insights</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMentorStudent(student);
                                    setShowMentorModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold hover:bg-blue-100 border border-blue-200 dark:border-blue-800"
                                >
                                  Follow-up
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>AI early-warning threshold: Attendance &lt; 75% or Internal Marks &lt; 65%</span>
                  </div>
                </div>

                {/* Recent Assignments Manager (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Assignments</h3>
                      <button
                        onClick={() => setShowCreateAsgModal(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> New Task
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(data?.recentAssignments || []).slice(0, 3).map((asg: Assignment) => (
                        <div key={asg.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[200px]">
                              {asg.title}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Due: {asg.dueDate} • {asg.submissionsCount || 0} / 120 submissions
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            asg.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {asg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => setShowCreateAsgModal(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition text-center"
                    >
                      Create Assignment
                    </button>
                    <button
                      onClick={() => setShowUploadMatModal(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition text-center"
                    >
                      Upload Notes (PDF)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY CLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">My Assigned Classes</h2>
                <p className="text-xs text-slate-500 mb-6">Manage enrolled students, syllabus coverage, and class schedules</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: 'CS501', name: 'Data Structures & Algorithms', sem: 'Semester 5 (Section A)', students: 60, time: 'Mon, Wed, Fri 10:00 AM' },
                    { code: 'CS502', name: 'Advanced Data Structures Lab', sem: 'Semester 5 (Section A & B)', students: 60, time: 'Tue, Thu 02:00 PM' },
                    { code: 'CS301', name: 'Problem Solving in C++', sem: 'Semester 3 (Section C)', students: 60, time: 'Mon, Wed 01:00 PM' },
                    { code: 'CS704', name: 'Graph Theory & Network Flows', sem: 'Semester 7 (Elective)', students: 45, time: 'Fri 03:00 PM' },
                  ].map((cls, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{cls.code}</span>
                          <span className="text-slate-400">{cls.students} Enrolled</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cls.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{cls.sem}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">Schedule: {cls.time}</p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-700 flex gap-2">
                        <button
                          onClick={() => {
                            setAttendanceSubject(cls.name);
                            setShowMarkAttendanceModal(true);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        >
                          Mark Attendance
                        </button>
                        <button
                          onClick={() => setActiveTab('marks')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        >
                          Grade Marks
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE MANAGEMENT (Teacher Class Roster & Periods Held/Attended) */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Total Enrolled Students</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">120</span>
                  <span className="text-[11px] text-blue-600 font-semibold">Across 4 Batches</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Class Average Attendance</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">88.4%</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">+1.8% vs last month</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Total Periods Conducted</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">48</span>
                  <span className="text-[11px] text-slate-400">Course: CS501 Data Structures</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Attendance Shortage Risk</span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block">3 Students</span>
                  <span className="text-[11px] text-rose-500 font-semibold">Below 75% cutoff threshold</span>
                </div>
              </div>

              {/* Main Attendance Hub Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authorized Class Attendance & Period Tracker</h2>
                    <p className="text-xs text-slate-500">Track day-to-day lecture logs, period-by-period roll-calls, and cumulative periods held & attended</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMarkAttendanceModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Take Period Roll Call</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  {[
                    { id: 'roster_periods', label: 'Student Cumulative Periods (Held & Attended)' },
                    { id: 'day_log', label: 'Day-to-Day Class Log' },
                    { id: 'schedule', label: 'Period Timetable Slots' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTeacherAttSubTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        teacherAttSubTab === tab.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* VIEW 1: Cumulative Roster with Periods Held & Attended */}
                {teacherAttSubTab === 'roster_periods' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                          <th className="py-3 px-3.5">Student ID & Name</th>
                          <th className="py-3 px-3 text-center">Periods Held</th>
                          <th className="py-3 px-3 text-center">Periods Attended</th>
                          <th className="py-3 px-3 text-center">Periods Missed</th>
                          <th className="py-3 px-3 text-center">Attendance %</th>
                          <th className="py-3 px-3 text-center">Exam Status</th>
                          <th className="py-3 px-3.5 text-center">Today's Period Status</th>
                          <th className="py-3 px-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {attendanceList.map((st, i) => {
                          const pct = Number(((st.periodsAttended / st.periodsHeld) * 100).toFixed(1));
                          const isEligible = pct >= 75;
                          return (
                            <tr key={st.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3.5 px-3.5">
                                <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{st.studentId}</span>
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                                {st.periodsHeld}
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                {st.periodsAttended}
                              </td>
                              <td className="py-3.5 px-3 text-center font-semibold text-rose-600 dark:text-rose-400">
                                {st.periodsHeld - st.periodsAttended}
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    pct >= 85
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : pct >= 75
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {isEligible ? (
                                  <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                                  </span>
                                ) : (
                                  <span className="text-rose-500 font-bold flex items-center justify-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Shortage
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3.5 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    st.status === 'PRESENT'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : st.status === 'ABSENT'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {st.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...attendanceList];
                                      updated[i].status = updated[i].status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
                                      if (updated[i].status === 'PRESENT') {
                                        updated[i].periodsAttended += 1;
                                      } else {
                                        updated[i].periodsAttended = Math.max(0, updated[i].periodsAttended - 1);
                                      }
                                      setAttendanceList(updated);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  >
                                    Toggle P/A
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VIEW 2: Day-to-Day Log */}
                {teacherAttSubTab === 'day_log' && (
                  <div className="space-y-3">
                    {(data?.dailyAttendance || [
                      { date: '2025-10-10', dayName: 'Friday', periodsHeld: 7, periodsAttended: 7, percentage: 100, status: 'FULL_DAY' },
                      { date: '2025-10-09', dayName: 'Thursday', periodsHeld: 7, periodsAttended: 6, percentage: 85.7, status: 'HALF_DAY' },
                      { date: '2025-10-08', dayName: 'Wednesday', periodsHeld: 7, periodsAttended: 7, percentage: 100, status: 'FULL_DAY' },
                      { date: '2025-10-07', dayName: 'Tuesday', periodsHeld: 7, periodsAttended: 6, percentage: 85.7, status: 'HALF_DAY' },
                      { date: '2025-10-06', dayName: 'Monday', periodsHeld: 7, periodsAttended: 7, percentage: 100, status: 'FULL_DAY' },
                    ]).map((d: any) => (
                      <div
                        key={d.date}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex flex-col items-center justify-center font-bold text-xs">
                            <span>{d.date.split('-')[2]}</span>
                            <span className="text-[9px] uppercase">{d.dayName.substring(0, 3)}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{d.dayName}, {d.date}</span>
                            <span className="text-[11px] text-slate-400">Class Roll-Call Conducted • Period 1 to 7</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {d.periodsHeld} Periods Held
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold">
                              {d.percentage}% Average Attendance
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            d.status === 'FULL_DAY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* VIEW 3: Period Timetable Slots */}
                {teacherAttSubTab === 'schedule' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {[
                      { p: 1, time: '09:00 - 10:00 AM', sub: 'CS501 Data Structures', room: 'LH-302', type: 'Lecture' },
                      { p: 2, time: '10:00 - 11:00 AM', sub: 'CS502 Database Management', room: 'LH-304', type: 'Lecture' },
                      { p: 3, time: '11:15 - 12:15 PM', sub: 'CS503 Computer Networks', room: 'LH-205', type: 'Lecture' },
                      { p: 4, time: '12:15 - 01:15 PM', sub: 'MA501 Applied Mathematics', room: 'LH-108', type: 'Lecture' },
                      { p: 5, time: '02:00 - 03:00 PM', sub: 'CS504 Software Engineering', room: 'LH-302', type: 'Tutorial' },
                      { p: 6, time: '03:00 - 04:00 PM', sub: 'CS505 DevOps & Cloud Lab', room: 'Lab-4', type: 'Practical' },
                      { p: 7, time: '04:00 - 04:50 PM', sub: 'CS505 DevOps & Cloud Lab', room: 'Lab-4', type: 'Practical' },
                    ].map((slot) => (
                      <div
                        key={slot.p}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-blue-600 dark:text-blue-400">Period {slot.p}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300">
                            {slot.type}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{slot.sub}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span>{slot.time}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STUDY MATERIALS */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lecture Notes & Syllabus Materials</h2>
                    <p className="text-xs text-slate-500">Upload PDF notes, problem sheets, and reference slides for student access</p>
                  </div>
                  <button
                    onClick={() => setShowUploadMatModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resource</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.materials || []).map((mat: LearningMaterial) => (
                    <div key={mat.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {mat.type}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{mat.title}</h4>
                          <p className="text-[11px] text-slate-400">{mat.subject} • {mat.size} • {mat.downloads} downloads</p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold">Published</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MARKS ENTRY */}
          {activeTab === 'marks' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Internal Exam Marks Entry</h2>
                <p className="text-xs text-slate-500 mb-6">Subject: Data Structures (CS501) • Max Marks: 100</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3 text-center">Mid-Term (40)</th>
                        <th className="py-2.5 px-3 text-center">Assignments (20)</th>
                        <th className="py-2.5 px-3 text-center">Total (100)</th>
                        <th className="py-2.5 px-3 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {[
                        { id: 'STD2024101', name: 'Vishnu Vardhan', mid: 36, asg: 18, total: 88, grade: 'A' },
                        { id: 'STD2024102', name: 'Rohit Kumar', mid: 22, asg: 12, total: 58, grade: 'C' },
                        { id: 'STD2024103', name: 'Sneha Reddy', mid: 26, asg: 14, total: 64, grade: 'B' },
                        { id: 'STD2024104', name: 'Akhil Singh', mid: 27, asg: 15, total: 66, grade: 'B' },
                        { id: 'STD2024105', name: 'Pooja Nair', mid: 30, asg: 16, total: 75, grade: 'B+' },
                      ].map((st) => (
                        <tr key={st.id}>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{st.id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                          <td className="py-2.5 px-3 text-center">{st.mid}</td>
                          <td className="py-2.5 px-3 text-center">{st.asg}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">{st.total}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-700">{st.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MENTOR FOLLOW-UP */}
          {activeTab === 'mentor' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Mentor Counseling & Follow-up Log</h2>
                <p className="text-xs text-slate-500 mb-6">Track 1-on-1 interventions with students identified with declining performance or low attendance</p>

                <div className="space-y-4">
                  {(data?.mentorFollowUps || []).map((mf: MentorFollowUp) => (
                    <div key={mf.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{mf.studentName} ({mf.studentId})</span>
                        <span className="text-slate-400">Date: {mf.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{mf.notes}</p>
                      <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                        <span className="text-indigo-600 font-semibold">Action: {mf.actionTaken}</span>
                        <span className="text-slate-500 font-medium">Next Review: {mf.followUpDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MARK ATTENDANCE MODAL */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Class Attendance</h3>
              <button onClick={() => setShowMarkAttendanceModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={attendanceSubject}
                    onChange={(e) => setAttendanceSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Period & Slot</label>
                  <select
                    value={attendancePeriodNum}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setAttendancePeriodNum(num);
                      const slots: Record<number, string> = {
                        1: '09:00 - 10:00',
                        2: '10:00 - 11:00',
                        3: '11:15 - 12:15',
                        4: '12:15 - 01:15',
                        5: '02:00 - 03:00',
                        6: '03:00 - 04:00',
                        7: '04:00 - 04:50',
                      };
                      setAttendanceTimeSlot(slots[num] || '09:00 - 10:00');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value={1}>Period 1 (09:00 - 10:00)</option>
                    <option value={2}>Period 2 (10:00 - 11:00)</option>
                    <option value={3}>Period 3 (11:15 - 12:15)</option>
                    <option value={4}>Period 4 (12:15 - 01:15)</option>
                    <option value={5}>Period 5 (02:00 - 03:00)</option>
                    <option value={6}>Period 6 (03:00 - 04:00)</option>
                    <option value={7}>Period 7 (04:00 - 04:50)</option>
                  </select>
                </div>
              </div>

              {/* Fast Roll-Call Action Buttons */}
              <div className="flex items-center justify-between text-xs py-1 border-y border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">
                  Student List ({attendanceList.length}) • Period {attendancePeriodNum} ({attendanceTimeSlot})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAll('PRESENT')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('ABSENT')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[11px] hover:bg-rose-100 cursor-pointer"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {attendanceList.map((st, i) => (
                  <div key={st.studentId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({st.studentId})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Periods: <strong className="text-emerald-600">{st.periodsAttended}</strong> / {st.periodsHeld} (
                        {Number(((st.periodsAttended / st.periodsHeld) * 100).toFixed(1))}%)
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {(['PRESENT', 'ABSENT', 'LEAVE'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            const updated = [...attendanceList];
                            const oldStatus = updated[i].status;
                            updated[i].status = status;
                            if (oldStatus !== 'PRESENT' && status === 'PRESENT') {
                              updated[i].periodsAttended += 1;
                            } else if (oldStatus === 'PRESENT' && status !== 'PRESENT') {
                              updated[i].periodsAttended = Math.max(0, updated[i].periodsAttended - 1);
                            }
                            setAttendanceList(updated);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            st.status === status
                              ? status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Leave'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkAttendanceModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingAttendance}
                  onClick={handleSaveAttendance}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingAttendance && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Recalculate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Create New Assignment / Quiz</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms - Dijkstra & Bellman-Ford"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newAsgSubject}
                    onChange={(e) => setNewAsgSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAsgDueDate}
                    onChange={(e) => setNewAsgDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={newAsgDesc}
                  onChange={(e) => setNewAsgDesc(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAsgModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAsg}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  {isCreatingAsg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MATERIAL MODAL */}
      {showUploadMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Upload Learning Material</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Unit 5 B-Trees & Inverted Indexing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={matSubject}
                  onChange={(e) => setMatSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Format Type</label>
                <select
                  value={matType}
                  onChange={(e) => setMatType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="PPTX">PowerPoint Slides</option>
                  <option value="ZIP">Code Repository / Zip</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadMatModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMat}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  {isUploadingMat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Upload & Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI RISK ANALYSIS MODAL */}
      {selectedRiskStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  AI Risk Assessment: {selectedRiskStudent.name}
                </h3>
              </div>
              <button onClick={() => setSelectedRiskStudent(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAiRisk ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <p className="text-xs text-slate-500">Gemini 3.8 Flash is generating root-cause analysis...</p>
              </div>
            ) : aiRiskAnalysis ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                  <p className="font-bold mb-1">Assessment Summary</p>
                  <p>{aiRiskAnalysis.riskAssessment}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Identified Root Causes</h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {aiRiskAnalysis.rootCauseAnalysis?.map((cause: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Actionable Faculty Recommendations</h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {aiRiskAnalysis.recommendedInterventions?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMentorStudent(selectedRiskStudent);
                      setShowMentorModal(true);
                      setSelectedRiskStudent(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                  >
                    Log Mentorship Counseling Follow-up
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MENTOR COUNSELING MODAL */}
      {showMentorModal && mentorStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Log Mentorship Intervention
            </h3>
            <p className="text-xs text-slate-500 mb-4">Student: {mentorStudent.name} ({mentorStudent.studentId})</p>

            <form onSubmit={handleSaveMentorFollowup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Counseling Discussion Notes</label>
                <textarea
                  rows={3}
                  required
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Record challenges discussed (e.g., health, conceptual confusion, peer pairing)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">Action Assigned</label>
                <select
                  value={mentorAction}
                  onChange={(e) => setMentorAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Remedial lab arranged">Remedial lab arranged</option>
                  <option value="Peer study buddy assigned">Peer study buddy assigned</option>
                  <option value="Parent consultation conducted">Parent consultation conducted</option>
                  <option value="Extra tutoring scheduled">Extra tutoring scheduled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  required
                  value={mentorDate}
                  onChange={(e) => setMentorDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMentor}
                  className="w-1/2 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  {isSavingMentor && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Record</span>
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
