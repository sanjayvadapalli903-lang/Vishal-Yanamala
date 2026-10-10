import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  CalendarCheck,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  X,
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage: React.FC<{ onLoginSuccess?: (role: UserRole) => void }> = ({ onLoginSuccess }) => {
  const { login, resetPassword, error, clearError } = useAuth();

  // Selected role
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [identifier, setIdentifier] = useState('STD2024101');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Quick switch role and preset credentials for smooth demo
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    setLoginFeedback(null);
    if (role === 'STUDENT') {
      setIdentifier('STD2024101');
      setPassword('student123');
    } else if (role === 'TEACHER') {
      setIdentifier('TCH150');
      setPassword('teacher123');
    } else if (role === 'PRINCIPAL') {
      setIdentifier('PRN001');
      setPassword('principal123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setLoginFeedback({ type: 'error', message: 'Please enter both your College ID / Email and password.' });
      return;
    }

    setIsSubmitting(true);
    setLoginFeedback(null);
    clearError();

    const result = await login(identifier.trim(), password.trim(), selectedRole, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      setLoginFeedback({ type: 'success', message: 'Authentication successful! Redirecting to dashboard...' });
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }
    } else {
      setLoginFeedback({
        type: 'error',
        message: result.message || 'Login failed. Please verify your credentials.',
      });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotMsg({ text: 'Please enter your registered Email or College ID.', isError: true });
      return;
    }
    setIsResetting(true);
    setForgotMsg(null);
    const res = await resetPassword(forgotIdentifier.trim(), newPasswordInput || undefined);
    setIsResetting(false);
    setForgotMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotMsg(null);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {/* Container Card */}
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row min-h-[720px]">
        
        {/* LEFT COLUMN: Campus Hero Visual & Feature Highlights */}
        <div className="relative w-full lg:w-5/12 bg-linear-to-br from-blue-700 via-indigo-800 to-slate-950 p-6 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>

          {/* Campus photo preview overlay with soft blend */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80')" }}></div>

          <div className="relative z-10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
                <GraduationCap className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Smart Campus AI
                </h1>
                <p className="text-blue-200/90 text-xs sm:text-sm font-medium mt-0.5">
                  Empowering Student Success Through AI and Analytics.
                </p>
              </div>
            </div>

            {/* Feature Highlights List */}
            <div className="mt-8 sm:mt-12 space-y-3.5">
              <div className="group flex items-center gap-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center text-blue-200 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Academic Performance</h4>
                  <p className="text-xs text-blue-200/80">Track progress & improve results</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-200 shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Attendance Management</h4>
                  <p className="text-xs text-blue-200/80">Stay on track, always with threshold alerts</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-200 shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">AI-Powered Insights</h4>
                  <p className="text-xs text-blue-200/80">Personalized study plans & intelligent guidance</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/30 flex items-center justify-center text-cyan-200 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Placement Support</h4>
                  <p className="text-xs text-blue-200/80">Build your career with curated job matches</p>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-200 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Engagement & Feedback</h4>
                  <p className="text-xs text-blue-200/80">A stronger, transparent campus community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Cursive Quote */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
            <span className="font-handwriting text-2xl sm:text-3xl text-blue-200 tracking-wide">
              Better Learning, Brighter Future
            </span>
            <div className="flex items-center gap-1.5 text-xs text-blue-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online v2.4</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Role Selection & Login Form */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors">
          <div>
            {/* Top Bar: Mobile branding & Theme Toggle */}
            <div className="flex items-center justify-between mb-6 pb-2">
              <div className="lg:hidden flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">Smart Campus AI</span>
              </div>
              <div className="hidden lg:block">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Institutional Portal Login
                </span>
              </div>
              <ThemeToggle />
            </div>

            {/* SECTION 1: ROLE SELECTION */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Select Your Role
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Choose your role to continue</span>
              </div>

              {/* 3 Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Student Card */}
                <div
                  onClick={() => handleRoleSelect('STUDENT')}
                  className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                    selectedRole === 'STUDENT'
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedRole === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      {selectedRole === 'STUDENT' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/60"></span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Student</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Access grades, attendance, study plans, and learning resources.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect('STUDENT');
                    }}
                    className={`mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-150 text-center ${
                      selectedRole === 'STUDENT'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Continue as Student
                  </button>
                </div>

                {/* 2. Teacher Card */}
                <div
                  onClick={() => handleRoleSelect('TEACHER')}
                  className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                    selectedRole === 'TEACHER'
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedRole === 'TEACHER' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      {selectedRole === 'TEACHER' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/60"></span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Teacher</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Manage classes, attendance, assignments, and student progress.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect('TEACHER');
                    }}
                    className={`mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-150 text-center ${
                      selectedRole === 'TEACHER'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Continue as Teacher
                  </button>
                </div>

                {/* 3. Principal Card */}
                <div
                  onClick={() => handleRoleSelect('PRINCIPAL')}
                  className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                    selectedRole === 'PRINCIPAL'
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedRole === 'PRINCIPAL' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      {selectedRole === 'PRINCIPAL' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/60"></span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Principal</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Monitor institutional analytics, departments, and academic outcomes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect('PRINCIPAL');
                    }}
                    className={`mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-150 text-center ${
                      selectedRole === 'PRINCIPAL'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Continue as Principal
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOGIN FORM */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Login to Your Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedRole === 'STUDENT' ? 'Student' : selectedRole === 'TEACHER' ? 'Teacher' : 'Principal'}
                  </span>{' '}
                  dashboard
                </p>
              </div>

              {/* Error or Success notification */}
              {(loginFeedback || error) && (
                <div
                  className={`mb-4 p-3.5 rounded-2xl flex items-start gap-3 text-xs font-medium border ${
                    loginFeedback?.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {loginFeedback?.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span>{loginFeedback?.message || error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email or College ID Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'STUDENT'
                          ? 'Email or College ID (e.g. STD2024101)'
                          : selectedRole === 'TEACHER'
                          ? 'Email or Teacher ID (e.g. TCH150)'
                          : 'Institutional Email or ID (e.g. PRN001)'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(identifier);
                      setShowForgotModal(true);
                    }}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button with Gradient & Loading */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.99] transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials & Role...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </form>

              {/* DEMO ACCOUNTS QUICK-FILL HELPER */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2.5">
                  <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                  <span>Demo Credentials Quick Fill</span>
                  <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('STUDENT')}
                    className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition text-[11px]"
                  >
                    <div className="font-semibold text-blue-600 dark:text-blue-400">Student</div>
                    <div className="text-slate-500 truncate">STD2024101</div>
                    <div className="text-slate-400 truncate">student123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('TEACHER')}
                    className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition text-[11px]"
                  >
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">Teacher</div>
                    <div className="text-slate-500 truncate">TCH150</div>
                    <div className="text-slate-400 truncate">teacher123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('PRINCIPAL')}
                    className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition text-[11px]"
                  >
                    <div className="font-semibold text-purple-600 dark:text-purple-400">Principal</div>
                    <div className="text-slate-500 truncate">PRN001</div>
                    <div className="text-slate-400 truncate">principal123</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer security badge */}
          <div className="mt-6 pt-4 text-center border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            Secure Login • Role Based Access (RBAC) • Your Data, Your Privacy
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span>Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMsg(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Enter your college email or student/faculty ID. In demo mode, you can immediately reset your password.
            </p>

            {forgotMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  forgotMsg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email or College ID
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. STD2024101 or vishnu.vardhan@qiscet.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password (Optional, instant reset)
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Set new password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
