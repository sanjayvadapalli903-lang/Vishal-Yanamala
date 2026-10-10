export type UserRole = 'STUDENT' | 'TEACHER' | 'PRINCIPAL';

export interface User {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

export interface AcademicResult {
  code: string;
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  credits: number;
  sem: string;
}

export interface SemesterTrend {
  sem: string;
  sgpa?: number;
  overallAvg: number;
  topScore?: number;
  topPerformers?: number;
  credits?: number;
}

export interface AttendanceRecord {
  studentId: string;
  name: string;
  subject: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  periodsHeld?: number;
  periodsAttended?: number;
}

export interface PeriodRecord {
  periodNumber: number;
  timeSlot: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'LEAVE' | 'FREE';
}

export interface DailyAttendance {
  date: string;
  dayName: string;
  periodsHeld: number;
  periodsAttended: number;
  percentage: number;
  status: 'FULL_DAY' | 'HALF_DAY' | 'ABSENT' | 'HOLIDAY';
  periods: PeriodRecord[];
}

export interface SubjectAttendanceMetric {
  code: string;
  subject: string;
  faculty: string;
  periodsHeld: number;
  periodsAttended: number;
  percentage: number;
  shortageAlert: boolean;
}

export interface PeriodStats {
  totalPeriodsHeld: number;
  totalPeriodsAttended: number;
  periodsAbsent: number;
  percentage: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  score?: number;
  points: number;
  description: string;
  submissionsCount?: number;
  totalStudents?: number;
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  type: string;
  size: string;
  date: string;
  downloads: number;
}

export interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

export interface SkillItem {
  name: string;
  score: number;
  level: string;
  gap: string;
}

export interface PlacementJob {
  id: string;
  company: string;
  role: string;
  package: string;
  matchScore: number;
  deadline: string;
  eligible: boolean;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  important: boolean;
}

export interface StudentAttention {
  id: string;
  studentId: string;
  name: string;
  department: string;
  attendance: number;
  avgMarks: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  mentorAssigned: string;
  status: string;
}

export interface MentorFollowUp {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  notes: string;
  actionTaken: string;
  followUpDate: string;
}

export interface FeedbackItem {
  id: string;
  studentId: string;
  department: string;
  subject: string;
  rating: number;
  category: string;
  comment: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  resolved: boolean;
  date: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
}
