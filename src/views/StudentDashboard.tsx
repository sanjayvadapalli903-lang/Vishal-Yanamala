import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Calendar,
  FileText,
  Briefcase,
  Award,
  Users,
  MessageSquare,
  Bell,
  Bot,
  LogOut,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Send,
  Plus,
  Sparkles,
  Search,
  ExternalLink,
  Target,
  BarChart3,
  Star,
  Check,
  RefreshCw,
  Loader2,
  Camera,
  CalendarDays,
  Layers,
  Eye,
  CheckCheck,
  User as UserIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileModal } from '../components/ProfileModal';
import type {
  AcademicResult,
  AttendanceRecord,
  Assignment,
  LearningMaterial,
  StudyGoal,
  SkillItem,
  PlacementJob,
  Announcement,
  DailyAttendance,
  PeriodRecord,
  SubjectAttendanceMetric,
  PeriodStats,
} from '../types';

export const StudentDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'academic' | 'attendance' | 'study_planner' | 'lms' | 'assignments' | 'skills_placement' | 'engagement' | 'feedback' | 'notifications' | 'ai_assistant'
  >('dashboard');

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'picture' | 'password'>('profile');

  // Attendance Sub-tab & Day-to-Day/Period-to-Period States
  const [attendanceSubTab, setAttendanceSubTab] = useState<'day_to_day' | 'period_to_period' | 'subject_summary'>('day_to_day');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('2025-10-10');
  const [expandedDay, setExpandedDay] = useState<string | null>('2025-10-10');
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState<string>('ALL');

  // Period Simulator state (Periods Held & Attended projection)
  const [simSubjectCode, setSimSubjectCode] = useState<string>('OVERALL');
  const [simAction, setSimAction] = useState<'ATTEND' | 'MISS'>('ATTEND');
  const [simPeriodsCount, setSimPeriodsCount] = useState<number>(5);
  const [simResult, setSimResult] = useState<string | null>(null);

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile: any;
    results: AcademicResult[];
    semestersTrend: any[];
    attendance: AttendanceRecord[];
    subjectPeriods?: SubjectAttendanceMetric[];
    dailyAttendance?: DailyAttendance[];
    periodStats?: PeriodStats;
    assignments: Assignment[];
    materials: LearningMaterial[];
    goals: StudyGoal[];
    skills: SkillItem[];
    jobs: PlacementJob[];
    announcements: Announcement[];
  } | null>(null);

  // AI Assistant Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hi Vishnu! Need help with your studies or campus updates? Ask me anything about your courses, exam schedule, attendance requirements, or assignment questions.',
      time: '10:00 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // AI Study Planner Generator state
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [generatedSchedule, setGeneratedSchedule] = useState<any[] | null>(null);
  const [revisionPoints, setRevisionPoints] = useState<string[] | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Attendance Calculator state
  const [targetAttendancePercent, setTargetAttendancePercent] = useState<number>(85);
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Assignment submission modal
  const [submittingAsg, setSubmittingAsg] = useState<Assignment | null>(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Feedback form state
  const [fbDept, setFbDept] = useState('Computer Science & Engineering');
  const [fbSubject, setFbSubject] = useState('Data Structures');
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState('Curriculum & Teaching');
  const [fbComment, setFbComment] = useState('');
  const [fbAnonymous, setFbAnonymous] = useState(true);
  const [fbSuccessMsg, setFbSuccessMsg] = useState<string | null>(null);

  // New Goal modal
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Fetch student dashboard data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch('/api/student/data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const resJson = await res.json();
          setData(resJson.data);
        }
      } catch (err) {
        console.error('Failed to load student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [token]);

  // Send AI Chat Message
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || "I'm reviewing your student record to help you.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Exam schedule for Sem 5 starts on 25 Oct 2025. Please review unit 4 in Data Structures.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Generate AI Study Planner
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/study-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjects: ['Data Structures', 'DBMS', 'Computer Networks', 'Software Engineering'],
          availableHoursPerDay: 3.5,
          targetCGPA: 9.0,
        }),
      });
      const json = await res.json();
      if (json.plan) {
        setPlanSummary(json.plan.summary);
        setGeneratedSchedule(json.plan.schedule);
        setRevisionPoints(json.plan.revisionPoints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Calculate Attendance required
  const handleCalculateAttendance = () => {
    if (!data?.attendance) return;
    const totalClasses = data.attendance.reduce((sum, item) => sum + item.totalClasses, 0);
    const attendedClasses = data.attendance.reduce((sum, item) => sum + item.attended, 0);

    const currentPercent = (attendedClasses / totalClasses) * 100;
    const target = targetAttendancePercent;

    if (currentPercent >= target) {
      // How many classes can be safely skipped
      const skippable = Math.floor((attendedClasses - (target / 100) * totalClasses) / (target / 100));
      setCalcResult(
        `Great job! Your current attendance is ${currentPercent.toFixed(1)}%. You can miss up to ${Math.max(
          0,
          skippable
        )} classes while maintaining at least ${target}%.`
      );
    } else {
      // Classes needed: (attended + x) / (total + x) >= target/100
      // x * (1 - target/100) >= (target/100)*total - attended
      const needed = Math.ceil(((target / 100) * totalClasses - attendedClasses) / (1 - target / 100));
      setCalcResult(
        `Your current attendance is ${currentPercent.toFixed(1)}%. You need to attend the next ${needed} consecutive classes without absence to achieve ${target}%.`
      );
    }
  };

  // Period Simulation Calculation (Periods Held & Attended)
  const handleSimulatePeriods = () => {
    const totalHeld = data?.periodStats?.totalPeriodsHeld || 248;
    const totalAttended = data?.periodStats?.totalPeriodsAttended || 228;
    const pCount = Math.max(1, Number(simPeriodsCount) || 1);

    if (simSubjectCode === 'OVERALL') {
      const newHeld = totalHeld + pCount;
      const newAttended = simAction === 'ATTEND' ? totalAttended + pCount : totalAttended;
      const newPct = Number(((newAttended / newHeld) * 100).toFixed(1));
      const currentPct = Number(((totalAttended / totalHeld) * 100).toFixed(1));
      const diff = Number((newPct - currentPct).toFixed(1));
      const sign = diff >= 0 ? `+${diff}%` : `${diff}%`;

      if (simAction === 'ATTEND') {
        setSimResult(
          `Projection: Attending the next ${pCount} consecutive periods will boost your overall attendance from ${currentPct}% to ${newPct}% (${sign}). Total periods will be ${newAttended}/${newHeld}. Examination hall ticket remains fully secured!`
        );
      } else {
        const minRequired = Math.ceil(0.75 * newHeld);
        const safeMargin = newAttended - minRequired;
        if (newPct >= 75) {
          setSimResult(
            `Projection: Missing the next ${pCount} periods will decrease your attendance from ${currentPct}% to ${newPct}% (${sign}). You will still have a safe cushion of ${Math.max(0, safeMargin)} periods before reaching the 75% cutoff.`
          );
        } else {
          setSimResult(
            `⚠️ Alert: Missing ${pCount} periods will cause your attendance to fall to ${newPct}%, which drops below the mandatory 75% cutoff by ${minRequired - newAttended} periods!`
          );
        }
      }
    } else {
      const sub = (data?.subjectPeriods || []).find((s) => s.code === simSubjectCode);
      if (sub) {
        const newHeld = sub.periodsHeld + pCount;
        const newAttended = simAction === 'ATTEND' ? sub.periodsAttended + pCount : sub.periodsAttended;
        const newPct = Number(((newAttended / newHeld) * 100).toFixed(1));
        const diff = Number((newPct - sub.percentage).toFixed(1));
        const sign = diff >= 0 ? `+${diff}%` : `${diff}%`;
        setSimResult(
          `${sub.subject} (${sub.code}): If you ${simAction.toLowerCase()} ${pCount} periods, your attendance in this subject will change from ${sub.percentage}% to ${newPct}% (${sign}). New tally: ${newAttended}/${newHeld} periods.`
        );
      }
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async () => {
    if (!submittingAsg) return;
    setIsSubmittingTask(true);
    try {
      const res = await fetch('/api/student/submit-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: submittingAsg.id,
          solutionText: submissionCode,
          fileName: submissionFileName || 'student_solution.cpp',
        }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          assignments: prev.assignments.map((a: Assignment) =>
            a.id === submittingAsg.id ? { ...a, status: 'SUBMITTED' } : a
          ),
          profile: {
            ...prev.profile,
            pendingAssignments: Math.max(0, prev.profile.pendingAssignments - 1),
          },
        }));
        setSubmittingAsg(null);
        setSubmissionCode('');
        setSubmissionFileName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Toggle Goal
  const handleToggleGoal = async (goalId: string) => {
    try {
      const res = await fetch('/api/student/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'TOGGLE', goalId }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          goals: prev.goals.map((g: StudyGoal) => (g.id === goalId ? { ...g, completed: !g.completed } : g)),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    try {
      const res = await fetch('/api/student/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'ADD', text: newGoalText.trim(), priority: 'HIGH' }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setData((prev: any) => ({ ...prev, goals: resJson.goals }));
        setNewGoalText('');
        setShowAddGoal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          department: fbDept,
          subject: fbSubject,
          rating: fbRating,
          category: fbCategory,
          comment: fbComment,
          isAnonymous: fbAnonymous,
        }),
      });
      if (res.ok) {
        setFbSuccessMsg('Your feedback has been recorded anonymously and shared with the department.');
        setFbComment('');
        setTimeout(() => setFbSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  // Fallbacks if data loading
  const profile = data?.profile || {
    name: user?.name || 'Vishnu Vardhan',
    collegeId: user?.collegeId || 'STD2024101',
    cgpa: 8.54,
    cgpaChange: '+0.3 this semester',
    attendancePercentage: 92,
    attendanceChange: '+2% this month',
    pendingAssignments: 3,
    upcomingExams: 2,
    nextExamDate: '25 Oct 2025',
  };

  // Multi-semester chart data
  const academicChartData = [
    { sem: 'Sem 1', marks: 82, grade: 8.1 },
    { sem: 'Sem 2', marks: 84, grade: 8.25 },
    { sem: 'Sem 3', marks: 86, grade: 8.4 },
    { sem: 'Sem 4', marks: 88, grade: 8.54 },
  ];

  // Radar skills data
  const radarSkillsData = (data?.skills || [
    { name: 'Programming', score: 80 },
    { name: 'Data Structures', score: 85 },
    { name: 'Databases', score: 75 },
    { name: 'Communication', score: 65 },
    { name: 'Problem Solving', score: 70 },
    { name: 'Teamwork', score: 75 },
  ]).map((s) => ({ subject: s.name.split(' ')[0], score: s.score, fullMark: 100 }));

  // Donut chart colors
  const DONUT_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Smart Campus AI</h2>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Student Portal</span>
            </div>
          </div>

          {/* Student Profile Card in Sidebar with Direct Change Photo Action */}
          <div
            className="p-3.5 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 transition-all group"
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition cursor-pointer"
                onClick={() => {
                  setProfileModalTab('picture');
                  setShowProfileModal(true);
                }}
                title="Click to change profile picture"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileModalTab('picture');
                  setShowProfileModal(true);
                }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs transition cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="overflow-hidden flex-1">
              <h4
                className="font-bold text-xs text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                onClick={() => {
                  setProfileModalTab('profile');
                  setShowProfileModal(true);
                }}
                title="View Profile Details"
              >
                {profile.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ID: {profile.collegeId}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalTab('picture');
                    setShowProfileModal(true);
                  }}
                  className="px-1.5 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Change Profile Photo"
                >
                  <Camera className="w-2.5 h-2.5" />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalTab('password');
                    setShowProfileModal(true);
                  }}
                  className="px-1.5 py-0.5 rounded-md bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Change Password"
                >
                  <span>Password</span>
                </button>
              </div>
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
              <span>Academic Performance</span>
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
              onClick={() => setActiveTab('study_planner')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'study_planner'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI Study Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('lms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'lms'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>LMS & Notes</span>
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
              onClick={() => setActiveTab('skills_placement')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'skills_placement'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Skills & Placement</span>
            </button>

            <button
              onClick={() => setActiveTab('engagement')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'engagement'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Engagement</span>
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
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications & Exams</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'ai_assistant'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-blue-500" />
              <span>AI Campus Assistant</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
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
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">
              Student Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Active Status
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {/* Profile Avatar Button with Change Picture shortcut */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setProfileModalTab('picture');
                  setShowProfileModal(true);
                }}
                className="relative p-0.5 rounded-full ring-2 ring-blue-500/40 hover:ring-blue-600 transition group cursor-pointer"
                title="Change Profile Photo"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
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
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
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
          
          {/* TOP 4 METRIC CARDS (Matching Mockup) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. CGPA Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">CGPA</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.cgpa}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.cgpaChange}
                </p>
              </div>
            </div>

            {/* 2. Attendance Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Attendance</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <CalendarCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.attendancePercentage}%
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span>↑</span> {profile.attendanceChange}
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
                  2 due soon
                </p>
              </div>
            </div>

            {/* 4. Upcoming Exams */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Upcoming Exams</span>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.upcomingExams}
                </div>
                <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-1">
                  Next: {profile.nextExamDate}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: Academic Performance Chart & Subject-wise Marks Table & Skills Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Academic Performance Multi-Semester Chart (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Performance</h3>
                    <span className="text-xs text-slate-400">Sem 1 - Sem 4</span>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={academicChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                        <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="marks" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Marks %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                      <span>Marks %</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                      <span>Grade CGPA</span>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Marks Table (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Subject-wise Marks</h3>
                      <button
                        onClick={() => setActiveTab('academic')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-2">Subject</th>
                            <th className="pb-2 text-center">Marks</th>
                            <th className="pb-2 text-right">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {(data?.results || []).slice(0, 5).map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 text-slate-800 dark:text-slate-200">{sub.subject}</td>
                              <td className="py-2.5 text-center font-bold text-slate-900 dark:text-white">{sub.marks}</td>
                              <td className="py-2.5 text-right">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  {sub.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
                    Highest score in Software Engineering (91%)
                  </div>
                </div>

                {/* Skills Analysis Donut / Radar (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Skills Analysis</h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Intermediate+</span>
                  </div>
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarSkillsData}>
                        <PolarGrid stroke="#94a3b830" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b820" />
                        <Radar name="Vishnu" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-500">Programming</span>
                      <span className="font-bold text-blue-600">80%</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-500">Communication</span>
                      <span className="font-bold text-indigo-600">65%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: AI Study Planner Widget + Quick Access + AI Assistant Mini Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AI Study Planner: Today's Goals (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Study Planner</h3>
                      </div>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Today's Goals</span>
                    </div>

                    <div className="space-y-2.5">
                      {(data?.goals || []).map((goal) => (
                        <div
                          key={goal.id}
                          onClick={() => handleToggleGoal(goal.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                            goal.completed
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              goal.completed
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {goal.completed && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{goal.text}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">{goal.category}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-sm font-semibold ${
                                goal.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                              }`}>{goal.priority}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => setActiveTab('study_planner')}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Full AI Study Plan</span>
                    </button>
                  </div>
                </div>

                {/* Quick Access Shortcuts (3 cols) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('lms')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-center flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">LMS Notes</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('assignments')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-center flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Assignments</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('lms')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-center flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Downloads</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('academic')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-center flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Quizzes</span>
                      </button>
                    </div>
                  </div>

                  {/* Shortage Alert Callout */}
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Attendance Safe</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                      You are well above the 75% college exam threshold (current: 92%).
                    </p>
                  </div>
                </div>

                {/* AI Assistant Mini Chatbox on Dashboard (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Assistant</h3>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    {/* Chat Bubble snippet */}
                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                      <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Hi Vishnu!
                      </p>
                      Need help with your studies or exam preparation? Ask me anything about graph algorithms, SQL queries, or college schedules.
                    </div>
                  </div>

                  {/* Inline Ask Input */}
                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      {chatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC PERFORMANCE */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Performance & Results</h2>
                    <p className="text-xs text-slate-500">Comprehensive semester results, subject grades, and CGPA trajectory</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800">
                      Current CGPA: 8.54 / 10.0
                    </span>
                  </div>
                </div>

                {/* Subject-Wise Marks & Grades Detailed Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Subject Name</th>
                        <th className="py-3 px-4 text-center">Credits</th>
                        <th className="py-3 px-4 text-center">Marks (out of 100)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 text-right">Performance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {(data?.results || []).map((res, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono text-slate-500">{res.code}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{res.subject}</td>
                          <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{res.credits}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">{res.marks}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-md font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {res.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {res.marks >= 85 ? (
                              <span className="text-emerald-600 font-semibold">Strong Mastery</span>
                            ) : res.marks >= 75 ? (
                              <span className="text-blue-600 font-semibold">Good (Scope to Improve)</span>
                            ) : (
                              <span className="text-amber-600 font-semibold">Focus Needed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Multi-Semester Trend Chart */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Multi-Semester Progression (SGPA vs Department Avg)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.semestersTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" />
                        <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[6.0, 10.0]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Line type="monotone" dataKey="sgpa" stroke="#3b82f6" strokeWidth={3} name="My SGPA" />
                        <Line type="monotone" dataKey="overallAvg" stroke="#94a3b8" strokeDasharray="4 4" name="Dept Average" />
                        <Line type="monotone" dataKey="topScore" stroke="#10b981" strokeWidth={2} name="Top Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE MANAGEMENT (Day-to-Day, Period-to-Period, Periods Held & Attended) */}
          {activeTab === 'attendance' && (() => {
            const periodStats = data?.periodStats || {
              totalPeriodsHeld: 248,
              totalPeriodsAttended: 228,
              periodsAbsent: 20,
              percentage: 91.9,
            };

            const dailyLogs = data?.dailyAttendance || [];
            const subjectMetrics = data?.subjectPeriods || [];

            // Filter daily logs
            const filteredDaily = dailyLogs.filter((d) => {
              if (filterAttendanceStatus === 'ALL') return true;
              return d.status === filterAttendanceStatus;
            });

            // Active day for period-to-period view
            const activePeriodDay =
              dailyLogs.find((d) => d.date === selectedAttendanceDate) || dailyLogs[0] || {
                date: '2025-10-10',
                dayName: 'Friday',
                periodsHeld: 7,
                periodsAttended: 7,
                percentage: 100,
                status: 'FULL_DAY',
                periods: [],
              };

            const minPeriodsRequired = Math.ceil(0.75 * periodStats.totalPeriodsHeld);
            const safePeriodsBuffer = Math.max(0, periodStats.totalPeriodsAttended - minPeriodsRequired);

            return (
              <div className="space-y-6">
                
                {/* 1. TOP OVERVIEW KPI CARDS (Periods Held, Attended, Absent & Hall Ticket Status) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Periods Held */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Periods Held</span>
                      <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                        <Layers className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {periodStats.totalPeriodsHeld}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Total conducted to date
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Periods Attended */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Periods Attended</span>
                      <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                        <CheckCheck className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {periodStats.totalPeriodsAttended}
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        Present in class
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Periods Absent */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Periods Absent</span>
                      <span className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                        <Clock className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                        {periodStats.periodsAbsent}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Missed sessions
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Overall Percentage & Eligibility */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Attendance</span>
                      <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{periodStats.percentage}%</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Eligible
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Safe margin: {safePeriodsBuffer} skippable periods
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. SUB-NAVIGATION TABS FOR ATTENDANCE */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setAttendanceSubTab('day_to_day')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        attendanceSubTab === 'day_to_day'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Day-to-Day Attendance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceSubTab('period_to_period')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        attendanceSubTab === 'period_to_period'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Period-to-Period Attendance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceSubTab('subject_summary')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        attendanceSubTab === 'subject_summary'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Periods Held & Attended Summary</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Regulation: Minimum 75% required for End-Semester Exam Hall Ticket
                  </div>
                </div>

                {/* 3. SUB-VIEW A: DAY-TO-DAY ATTENDANCE LOG */}
                {attendanceSubTab === 'day_to_day' && (
                  <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Day-to-Day Academic Attendance</h3>
                        <p className="text-[11px] text-slate-500">Chronological daily log with periods held, attended, and period breakdown</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Filter by Day Status:</span>
                        {[
                          { id: 'ALL', label: 'All Days' },
                          { id: 'FULL_DAY', label: 'Full Day' },
                          { id: 'HALF_DAY', label: 'Half Day' },
                          { id: 'ABSENT', label: 'Absent' },
                          { id: 'HOLIDAY', label: 'Holiday' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setFilterAttendanceStatus(btn.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              filterAttendanceStatus === btn.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Day Cards List */}
                    <div className="space-y-3">
                      {filteredDaily.map((day) => {
                        const isExpanded = expandedDay === day.date;
                        const statusColor =
                          day.status === 'FULL_DAY'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : day.status === 'HALF_DAY'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : day.status === 'ABSENT'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                        return (
                          <div
                            key={day.date}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
                          >
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-bold shrink-0">
                                  <span className="text-xs uppercase leading-none">{day.dayName.substring(0, 3)}</span>
                                  <span className="text-sm leading-tight">{day.date.split('-')[2]}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                      {day.dayName}, {day.date}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                                      {day.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                    <span>
                                      Periods Held: <strong className="text-slate-800 dark:text-slate-200">{day.periodsHeld}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Periods Attended: <strong className="text-emerald-600">{day.periodsAttended}</strong>
                                    </span>
                                    {day.periodsHeld > day.periodsAttended && (
                                      <>
                                        <span>•</span>
                                        <span className="text-rose-500 font-semibold">
                                          Missed: {day.periodsHeld - day.periodsAttended}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Period Chip Badges & Expand Actions */}
                              <div className="flex items-center gap-3 justify-between sm:justify-end">
                                {day.periods.length > 0 ? (
                                  <div className="flex items-center gap-1.5">
                                    {day.periods.map((p) => (
                                      <div
                                        key={p.periodNumber}
                                        title={`Period ${p.periodNumber} (${p.subject}): ${p.status}`}
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                                          p.status === 'PRESENT'
                                            ? 'bg-emerald-500 text-white'
                                            : p.status === 'ABSENT'
                                            ? 'bg-rose-500 text-white'
                                            : p.status === 'ON_DUTY'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-amber-500 text-white'
                                        }`}
                                      >
                                        P{p.periodNumber}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No periods scheduled</span>
                                )}

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAttendanceDate(day.date);
                                      setAttendanceSubTab('period_to_period');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Open full period schedule for this day"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Inspect Day</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* In-place Accordion of Period-to-Period breakdown for this day */}
                            {isExpanded && day.periods.length > 0 && (
                              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                                  <span>Period-to-Period Breakdown for {day.date}</span>
                                  <span className="text-[11px] font-normal text-slate-400">
                                    Day Attendance: {day.percentage}% ({day.periodsAttended}/{day.periodsHeld} periods attended)
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {day.periods.map((p) => (
                                    <div
                                      key={p.periodNumber}
                                      className={`p-3 rounded-xl border bg-white dark:bg-slate-900 text-xs flex items-center justify-between ${
                                        p.status === 'PRESENT'
                                          ? 'border-emerald-200 dark:border-emerald-900/60'
                                          : p.status === 'ABSENT'
                                          ? 'border-rose-200 dark:border-rose-900/60'
                                          : 'border-blue-200 dark:border-blue-900/60'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="font-bold text-slate-900 dark:text-white">Period {p.periodNumber}</span>
                                          <span className="text-[10px] text-slate-400">({p.timeSlot})</span>
                                        </div>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">{p.subject}</p>
                                        <p className="text-[11px] text-slate-500">{p.faculty} • {p.room}</p>
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                          p.status === 'PRESENT'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : p.status === 'ABSENT'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                        }`}
                                      >
                                        {p.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. SUB-VIEW B: PERIOD-TO-PERIOD DETAILED TIMETABLE */}
                {attendanceSubTab === 'period_to_period' && (
                  <div className="space-y-6">
                    {/* Date Navigation & Selector Header */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            Period-to-Period Attendance: {activePeriodDay.dayName}, {activePeriodDay.date}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Daily 7-period schedule: Lectures, Laboratory slots, and live roll-call status
                        </p>
                      </div>

                      {/* Date Picker Controls */}
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedAttendanceDate}
                          onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          {dailyLogs.map((d) => (
                            <option key={d.date} value={d.date}>
                              {d.date} ({d.dayName}) — {d.periodsAttended}/{d.periodsHeld} Attended
                            </option>
                          ))}
                        </select>

                        <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300">
                          {activePeriodDay.percentage}% Today
                        </div>
                      </div>
                    </div>

                    {/* Periods Timetable Timeline for Selected Day */}
                    {activePeriodDay.periods.length > 0 ? (
                      <div className="space-y-3">
                        {activePeriodDay.periods.map((p, idx) => (
                          <React.Fragment key={p.periodNumber}>
                            {/* Insert Break Indicators */}
                            {idx === 2 && (
                              <div className="py-1 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Short Recess (11:00 AM - 11:15 AM)</span>
                              </div>
                            )}
                            {idx === 4 && (
                              <div className="py-1 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-center text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 flex items-center justify-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Lunch Break & Campus Activities (01:15 PM - 02:00 PM)</span>
                              </div>
                            )}

                            <div
                              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                p.status === 'PRESENT'
                                  ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
                                  : p.status === 'ABSENT'
                                  ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                                  : 'border-blue-200 dark:border-blue-900/60 hover:border-blue-400'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                                    p.status === 'PRESENT'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : p.status === 'ABSENT'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  }`}
                                >
                                  <span className="text-[10px] uppercase font-bold">Period</span>
                                  <span className="text-base leading-none">{p.periodNumber}</span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                      {p.code}
                                    </span>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                      {p.subject}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                                      {p.timeSlot}
                                    </span>
                                    <span>•</span>
                                    <span>Faculty: <strong>{p.faculty}</strong></span>
                                    <span>•</span>
                                    <span>Room: <strong>{p.room}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                                    p.status === 'PRESENT'
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : p.status === 'ABSENT'
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-blue-600 text-white shadow-xs'
                                  }`}
                                >
                                  {p.status === 'PRESENT' && <Check className="w-3.5 h-3.5" />}
                                  {p.status === 'ABSENT' && <AlertTriangle className="w-3.5 h-3.5" />}
                                  <span>{p.status}</span>
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">No Periods Scheduled</h4>
                        <p className="text-xs text-slate-400 mt-1">This day is recorded as an institutional holiday or non-instructional day.</p>
                      </div>
                    )}

                    {/* Weekly Period Matrix (Timetable Attendance Grid) */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="mb-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weekly Period Matrix (Current Week)</h3>
                        <p className="text-xs text-slate-500">Period 1 through 7 roll-call status across all instructional weekdays</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500">
                              <th className="py-2.5 px-3">Day & Date</th>
                              <th className="py-2.5 px-2 text-center">P1 (09:00)</th>
                              <th className="py-2.5 px-2 text-center">P2 (10:00)</th>
                              <th className="py-2.5 px-2 text-center">P3 (11:15)</th>
                              <th className="py-2.5 px-2 text-center">P4 (12:15)</th>
                              <th className="py-2.5 px-2 text-center">P5 (02:00)</th>
                              <th className="py-2.5 px-2 text-center">P6 (03:00)</th>
                              <th className="py-2.5 px-2 text-center">P7 (04:00)</th>
                              <th className="py-2.5 px-3 text-right">Day %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {dailyLogs.slice(0, 5).map((d) => (
                              <tr key={d.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                  {d.dayName.substring(0, 3)}, {d.date.split('-').slice(1).join('/')}
                                </td>
                                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                                  const p = d.periods.find((x) => x.periodNumber === pNum);
                                  if (!p) {
                                    return (
                                      <td key={pNum} className="py-2.5 px-2 text-center text-slate-300 dark:text-slate-600">
                                        -
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={pNum} className="py-2.5 px-2 text-center">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                          p.status === 'PRESENT'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : p.status === 'ABSENT'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                        }`}
                                      >
                                        {p.status === 'PRESENT' ? 'P' : p.status === 'ABSENT' ? 'A' : 'OD'}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                                  {d.percentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SUB-VIEW C: SUBJECT-WISE PERIODS HELD & ATTENDED BREAKDOWN */}
                {attendanceSubTab === 'subject_summary' && (
                  <div className="space-y-6">
                    {/* Subject Summary Table */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            Subject-wise Periods Held and Attended
                          </h3>
                          <p className="text-xs text-slate-500">
                            Detailed tally of periods conducted, sessions attended, and safe margin thresholds
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold self-start sm:self-auto">
                          Semester 5 Total: {periodStats.totalPeriodsAttended} / {periodStats.totalPeriodsHeld} Periods ({periodStats.percentage}%)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                              <th className="py-3 px-3.5">Code</th>
                              <th className="py-3 px-3.5">Subject & Faculty</th>
                              <th className="py-3 px-3 text-center">Periods Held</th>
                              <th className="py-3 px-3 text-center">Periods Attended</th>
                              <th className="py-3 px-3 text-center">Periods Missed</th>
                              <th className="py-3 px-3 text-center">Attendance %</th>
                              <th className="py-3 px-3 text-center">Eligibility</th>
                              <th className="py-3 px-3.5 text-right">Margin / Buffer</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {subjectMetrics.map((sub) => {
                              const missed = sub.periodsHeld - sub.periodsAttended;
                              const minReq = Math.ceil(0.75 * sub.periodsHeld);
                              const buffer = sub.periodsAttended - minReq;
                              const isEligible = sub.percentage >= 75;

                              return (
                                <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="py-3.5 px-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {sub.code}
                                  </td>
                                  <td className="py-3.5 px-3.5">
                                    <span className="font-bold text-slate-900 dark:text-white block">{sub.subject}</span>
                                    <span className="text-[11px] text-slate-400">{sub.faculty}</span>
                                  </td>
                                  <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                                    {sub.periodsHeld}
                                  </td>
                                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                    {sub.periodsAttended}
                                  </td>
                                  <td className="py-3.5 px-3 text-center font-semibold text-rose-600 dark:text-rose-400">
                                    {missed}
                                  </td>
                                  <td className="py-3.5 px-3 text-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                                        sub.percentage >= 85
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : sub.percentage >= 75
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      }`}
                                    >
                                      {sub.percentage}%
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
                                  <td className="py-3.5 px-3.5 text-right font-semibold">
                                    {buffer >= 0 ? (
                                      <span className="text-emerald-600">Can miss {buffer} periods safely</span>
                                    ) : (
                                      <span className="text-rose-600 font-bold">Must attend {Math.abs(buffer)} periods</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Interactive Periods Projection Simulator */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            Periods Attendance Projection Simulator
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Test attendance scenarios to see how attending or missing future periods impacts your final percentage and hall ticket eligibility.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Target Course
                          </label>
                          <select
                            value={simSubjectCode}
                            onChange={(e) => setSimSubjectCode(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                          >
                            <option value="OVERALL">Overall All Subjects ({periodStats.percentage}%)</option>
                            {subjectMetrics.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.code} — {s.subject} ({s.percentage}%)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Action
                          </label>
                          <select
                            value={simAction}
                            onChange={(e) => setSimAction(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                          >
                            <option value="ATTEND">Attend Next Periods (+)</option>
                            <option value="MISS">Miss Next Periods (-)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Number of Periods
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={simPeriodsCount}
                            onChange={(e) => setSimPeriodsCount(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={handleSimulatePeriods}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Simulate Period Impact</span>
                          </button>
                        </div>
                      </div>

                      {simResult && (
                        <div className="mt-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                          <p className="font-bold mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            <span>Simulation Outcome</span>
                          </p>
                          {simResult}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* TAB 4: AI STUDY PLANNER */}
          {activeTab === 'study_planner' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI-Powered Personalized Study Planner</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Analyzes your subject scores, upcoming exam schedule (25 Oct 2025), and time budget to create an adaptive revision schedule.
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
                  >
                    {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>{generatedSchedule ? 'Regenerate Plan' : 'Generate Adaptive Schedule'}</span>
                  </button>
                </div>

                {/* Plan Summary */}
                {planSummary && (
                  <div className="mb-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                    <p className="font-bold text-sm mb-1">AI Recommendation Summary</p>
                    {planSummary}
                  </div>
                )}

                {/* Schedule Days */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {(generatedSchedule || [
                    { day: 'Day 1 (Monday)', focus: 'Data Structures: AVL & Graph Traversals', duration: '2.5 hrs', tasks: ['Review DFS/BFS time complexity', 'Implement AVL node rotation code', 'Solve 3 practice questions'] },
                    { day: 'Day 2 (Tuesday)', focus: 'DBMS: SQL Normalization (BCNF & 3NF)', duration: '2.0 hrs', tasks: ['Lossless join decomposition analysis', 'Execute 5 nested SQL queries', 'Quiz yourself on ACID properties'] },
                    { day: 'Day 3 (Wednesday)', focus: 'Computer Networks: TCP/IP & Congestion Control', duration: '2.0 hrs', tasks: ['Trace TCP 3-way handshake in Wireshark', 'Study Sliding Window protocol math'] },
                    { day: 'Day 4 (Thursday)', focus: 'Software Engineering: Architecture Patterns', duration: '1.5 hrs', tasks: ['Singleton vs Factory pattern diagram', 'Review Agile sprint retrospectives'] },
                    { day: 'Day 5 (Friday)', focus: 'Mathematics: Linear Algebra & Probability', duration: '2.5 hrs', tasks: ['Eigenvalues & Eigenvectors computation', 'Solve Bayes Theorem conditional problems'] },
                    { day: 'Weekend (Sat-Sun)', focus: 'Full Mock Test & Weak Area Revision', duration: '3.5 hrs', tasks: ['Solve previous year university questions', 'Flashcard revision for definitions'] },
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{item.day}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                            {item.duration}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">{item.focus}</h4>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {item.tasks.map((t: string, ti: number) => (
                            <li key={ti} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* High-Yield Revision Points */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>High-Yield Revision Points for Mid-Term</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {(revisionPoints || [
                      'Data Structures: AVL tree balance factor is strictly in {-1, 0, 1}. Red-Black uses node coloring.',
                      'DBMS: Boyce-Codd Normal Form (BCNF) strictly requires every determinant to be a super key.',
                      'Computer Networks: Transport layer handles process-to-process delivery using port numbers.',
                    ]).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LMS & NOTES */}
          {activeTab === 'lms' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Learning Management System (LMS)</h2>
                    <p className="text-xs text-slate-500">Access verified lecture notes, presentations, PDFs, and syllabus guides</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search study material..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.materials || []).map((mat) => (
                    <div key={mat.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {mat.type}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{mat.title}</h4>
                          <p className="text-[11px] text-slate-500">Subject: {mat.subject} • {mat.size} • {mat.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading verified campus resource: ${mat.title}`)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 text-blue-600 transition shrink-0"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assignments & Submissions</h2>
                    <p className="text-xs text-slate-500">Track pending deadlines and upload solutions for teacher evaluation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(data?.assignments || []).map((asg) => (
                    <div key={asg.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            asg.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {asg.status}
                          </span>
                          <span className="text-xs text-slate-400">Due: {asg.dueDate}</span>
                          <span className="text-xs text-slate-400">Points: {asg.points}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{asg.title}</h4>
                        <p className="text-xs text-slate-500">{asg.description}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {asg.status === 'SUBMITTED' ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Submitted
                          </span>
                        ) : (
                          <button
                            onClick={() => setSubmittingAsg(asg)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Solution</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SKILLS & PLACEMENT */}
          {activeTab === 'skills_placement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Placement Job Opportunities (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campus Placement Drives</h2>
                      <p className="text-xs text-slate-500">Matched to your current CGPA of 8.54 and technical skills</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {(data?.jobs || []).map((job) => (
                      <div key={job.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{job.company}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {job.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{job.role}</p>
                          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{job.package} • Deadline: {job.deadline}</p>
                        </div>

                        <div className="shrink-0">
                          {job.status === 'Applied' || job.status === 'Shortlisted' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {job.status}
                            </span>
                          ) : (
                            <button
                              onClick={() => alert(`Application submitted for ${job.company} ${job.role}!`)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gap Analysis (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Technical & Soft Skills Portfolio</h3>
                  <p className="text-xs text-slate-500 mb-4">Targeting Tier-1 Software Engineer roles</p>

                  <div className="space-y-3">
                    {(data?.skills || []).map((sk, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{sk.name}</span>
                          <span className="text-blue-600 font-bold">{sk.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sk.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
                    <p className="font-bold mb-0.5">AI Skill Gap Recommendation:</p>
                    Strengthen Communication & Group Discussion practice to boost placement interview readiness from 82% to 95%.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ENGAGEMENT */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Campus Engagement & Activities</h2>
                <p className="text-xs text-slate-500 mb-6">Track extracurricular participation, workshops, hackathons, and clubs</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Smart India Hackathon 2025</h4>
                    <p className="text-xs text-slate-500 mt-1">Status: Team Lead (Campus Round Selected)</p>
                    <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified Activity</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Coding Club Mentor</h4>
                    <p className="text-xs text-slate-500 mt-1">Conducted C++ STL workshop for 60 juniors</p>
                    <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Student Leadership</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">IEEE Student Chapter</h4>
                    <p className="text-xs text-slate-500 mt-1">Active Member & Technical Paper Co-Author</p>
                    <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Academic Society</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FEEDBACK SUBMISSION */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Student Feedback System</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Provide honest feedback on courses, faculty, or campus infrastructure. By default, your feedback is completely anonymous.
                </p>

                {fbSuccessMsg && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{fbSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject / Course
                    </label>
                    <select
                      value={fbSubject}
                      onChange={(e) => setFbSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Data Structures">Data Structures & Algorithms</option>
                      <option value="Database Management Systems">Database Management Systems</option>
                      <option value="Computer Networks">Computer Networks</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Campus Infrastructure & Labs">Campus Infrastructure & Labs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbRating(star)}
                          className={`p-2 rounded-xl border transition ${
                            fbRating >= star
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-500'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Feedback Comments
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={fbComment}
                      onChange={(e) => setFbComment(e.target.value)}
                      placeholder="Write your feedback, teaching suggestions, or facility concerns..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anon"
                      checked={fbAnonymous}
                      onChange={(e) => setFbAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="anon" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      Submit anonymously (Student ID will not be shared with instructors)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 10: NOTIFICATIONS & EXAMS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">College Announcements & Exam Timetable</h2>
                <p className="text-xs text-slate-500 mb-6">Official circulars published by Dean's Office and Examination Cell</p>

                <div className="space-y-3.5">
                  {(data?.announcements || []).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{ann.title}</h4>
                          <span className="text-[11px] text-slate-400">{ann.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Published by: {ann.author} • Category: {ann.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: FULL AI CAMPUS ASSISTANT */}
          {activeTab === 'ai_assistant' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Campus AI Assistant</h3>
                    <p className="text-[11px] text-slate-400">Powered by Gemini 3.8 Flash • Academic Guidance & Rules</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-[10px] font-bold">
                  Online
                </span>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Smart Campus AI is generating an explanation...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask any academic or campus question (e.g., 'Explain AVL tree rotations' or 'Exam regulations')..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ASSIGNMENT SUBMISSION MODAL */}
      {submittingAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Submit Assignment
            </h3>
            <p className="text-xs text-slate-500 mb-4">{submittingAsg.title}</p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Solution File
                </label>
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  placeholder="e.g. data_structures_avl_tree_assignment.cpp"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code / Description Notes
                </label>
                <textarea
                  rows={4}
                  value={submissionCode}
                  onChange={(e) => setSubmissionCode(e.target.value)}
                  placeholder="Paste your source code or write implementation summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAsg(null)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssignment}
                  disabled={isSubmittingTask}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Submission</span>
                </button>
              </div>
            </div>
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
