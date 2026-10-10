import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './views/LoginPage';
import { StudentDashboard } from './views/StudentDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';
import { PrincipalDashboard } from './views/PrincipalDashboard';
import { ShieldCheck, GraduationCap, BookOpen, Building2, LogOut, Sparkles } from 'lucide-react';
import type { UserRole } from './types';

const MainApp: React.FC = () => {
  const { user, role, isAuthenticated, isLoading, login, logout } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Quick switch between demo roles for review / evaluation
  const handleQuickDemoSwitch = async (targetRole: UserRole) => {
    if (targetRole === 'STUDENT') {
      await login('STD2024101', 'student123', 'STUDENT', true);
    } else if (targetRole === 'TEACHER') {
      await login('TCH150', 'teacher123', 'TEACHER', true);
    } else if (targetRole === 'PRINCIPAL') {
      await login('PRN001', 'principal123', 'PRINCIPAL', true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Initializing Smart Campus AI...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> show Login Page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Authenticated -> Route to specific Role Dashboard with strict RBAC
  return (
    <div className="relative">
      {/* Role specific dashboard */}
      {role === 'STUDENT' && <StudentDashboard />}
      {role === 'TEACHER' && <TeacherDashboard />}
      {role === 'PRINCIPAL' && <PrincipalDashboard />}

      {/* Floating Demo Role Switcher Badge (Bottom-Right for evaluation convenience) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          {showRoleSwitcher && (
            <div className="absolute bottom-12 right-0 mb-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <ShieldCheck className="w-4 h-4" /> Role Switcher (Demo Review)
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSwitch('STUDENT')}
                  className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition text-left ${
                    role === 'STUDENT'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="block font-semibold">Student View</span>
                    <span className="text-[10px] text-slate-400">Vishnu Vardhan (STD2024101)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSwitch('TEACHER')}
                  className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition text-left ${
                    role === 'TEACHER'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="block font-semibold">Teacher View</span>
                    <span className="text-[10px] text-slate-400">Dr. Priya Sharma (TCH150)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSwitch('PRINCIPAL')}
                  className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition text-left ${
                    role === 'PRINCIPAL'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="block font-semibold">Principal View</span>
                    <span className="text-[10px] text-slate-400">Dr. R. Krishnan (PRN001)</span>
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout to Login Screen</span>
                </button>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="px-3 py-2 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold shadow-xl backdrop-blur-md border border-slate-700 dark:border-slate-200 hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
            <span>Role: {role}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
