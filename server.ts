import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// IN-MEMORY DATABASE & DATA MODELS
// ==========================================

export type UserRole = 'STUDENT' | 'TEACHER' | 'PRINCIPAL';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
  passwordHash: string; // SHA-256 for secure verification
  salt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Demo password salt
const DEMO_SALT = 'campus_security_salt_2025';

// Pre-seeded User Database
const users: UserProfile[] = [
  {
    id: 'user_std_01',
    name: 'Vishnu Vardhan',
    email: 'vishnu.vardhan@qiscet.edu.in',
    collegeId: 'STD2024101',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2022-08-01',
    salt: DEMO_SALT,
    passwordHash: hashPassword('student123', DEMO_SALT),
  },
  {
    id: 'user_std_02',
    name: 'Rohit Kumar',
    email: 'rohit.kumar@qiscet.edu.in',
    collegeId: 'STD2024102',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2022-08-01',
    salt: DEMO_SALT,
    passwordHash: hashPassword('student123', DEMO_SALT),
  },
  {
    id: 'user_std_03',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@qiscet.edu.in',
    collegeId: 'STD2024103',
    role: 'STUDENT',
    department: 'Electronics & Communication',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2022-08-01',
    salt: DEMO_SALT,
    passwordHash: hashPassword('student123', DEMO_SALT),
  },
  {
    id: 'user_tch_01',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@qiscet.edu.in',
    collegeId: 'TCH150',
    role: 'TEACHER',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2018-06-15',
    salt: DEMO_SALT,
    passwordHash: hashPassword('teacher123', DEMO_SALT),
  },
  {
    id: 'user_tch_02',
    name: 'Prof. Rajesh Menon',
    email: 'rajesh.menon@qiscet.edu.in',
    collegeId: 'TCH151',
    role: 'TEACHER',
    department: 'Electronics & Communication',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2019-07-20',
    salt: DEMO_SALT,
    passwordHash: hashPassword('teacher123', DEMO_SALT),
  },
  {
    id: 'user_prn_01',
    name: 'Dr. R. Krishnan',
    email: 'principal@qiscet.edu.in',
    collegeId: 'PRN001',
    role: 'PRINCIPAL',
    department: 'Institutional Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    joinedDate: '2012-01-10',
    salt: DEMO_SALT,
    passwordHash: hashPassword('principal123', DEMO_SALT),
  },
];

// Active sessions: token -> userId
const sessions = new Map<string, { userId: string; role: UserRole; createdAt: number }>();

// Initial State Data for Dashboards
const dbData = {
  attendanceRecords: [
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', subject: 'Data Structures', totalClasses: 45, attended: 42, percentage: 93.3, periodsHeld: 48, periodsAttended: 45 },
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', subject: 'Database Management', totalClasses: 40, attended: 37, percentage: 92.5, periodsHeld: 42, periodsAttended: 39 },
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', subject: 'Computer Networks', totalClasses: 38, attended: 34, percentage: 89.4, periodsHeld: 40, periodsAttended: 35 },
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', subject: 'Software Engineering', totalClasses: 36, attended: 35, percentage: 97.2, periodsHeld: 38, periodsAttended: 37 },
    { studentId: 'STD2024101', name: 'Vishnu Vardhan', subject: 'Applied Mathematics', totalClasses: 42, attended: 37, percentage: 88.0, periodsHeld: 44, periodsAttended: 38 },
    // Other students
    { studentId: 'STD2024102', name: 'Rohit Kumar', subject: 'Data Structures', totalClasses: 45, attended: 28, percentage: 62.2, periodsHeld: 48, periodsAttended: 30 },
    { studentId: 'STD2024103', name: 'Sneha Reddy', subject: 'Data Structures', totalClasses: 45, attended: 31, percentage: 68.8, periodsHeld: 48, periodsAttended: 33 },
    { studentId: 'STD2024104', name: 'Akhil Singh', subject: 'Data Structures', totalClasses: 45, attended: 32, percentage: 71.1, periodsHeld: 48, periodsAttended: 34 },
    { studentId: 'STD2024105', name: 'Pooja Nair', subject: 'Data Structures', totalClasses: 45, attended: 34, percentage: 75.5, periodsHeld: 48, periodsAttended: 36 },
  ],
  subjectPeriods: [
    { code: 'CS501', subject: 'Data Structures & Algorithms', faculty: 'Dr. Priya Sharma', periodsHeld: 48, periodsAttended: 45, percentage: 93.8, shortageAlert: false },
    { code: 'CS502', subject: 'Database Management Systems', faculty: 'Prof. Rajesh Menon', periodsHeld: 42, periodsAttended: 39, percentage: 92.9, shortageAlert: false },
    { code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', periodsHeld: 40, periodsAttended: 35, percentage: 87.5, shortageAlert: false },
    { code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', periodsHeld: 38, periodsAttended: 37, percentage: 97.4, shortageAlert: false },
    { code: 'CS505', subject: 'Cloud & DevOps Lab', faculty: 'Prof. K. Suresh', periodsHeld: 36, periodsAttended: 34, percentage: 94.4, shortageAlert: false },
    { code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', periodsHeld: 44, periodsAttended: 38, percentage: 86.4, shortageAlert: false },
  ],
  dailyAttendanceLog: [
    {
      date: '2025-10-10',
      dayName: 'Friday',
      periodsHeld: 7,
      periodsAttended: 7,
      percentage: 100,
      status: 'FULL_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS505', subject: 'DevOps Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS505', subject: 'DevOps Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-10-09',
      dayName: 'Thursday',
      periodsHeld: 7,
      periodsAttended: 6,
      percentage: 85.7,
      status: 'HALF_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'ABSENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS501', subject: 'Data Structures Lab', faculty: 'Dr. Priya Sharma', room: 'Lab-2', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS501', subject: 'Data Structures Lab', faculty: 'Dr. Priya Sharma', room: 'Lab-2', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-10-08',
      dayName: 'Wednesday',
      periodsHeld: 7,
      periodsAttended: 7,
      percentage: 100,
      status: 'FULL_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'ENG101', subject: 'Communication Skills', faculty: 'Prof. Sarah Vance', room: 'LH-101', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'ENG101', subject: 'Aptitude & Reasoning', faculty: 'Prof. T. Reddy', room: 'LH-101', status: 'ON_DUTY' },
      ],
    },
    {
      date: '2025-10-07',
      dayName: 'Tuesday',
      periodsHeld: 7,
      periodsAttended: 6,
      percentage: 85.7,
      status: 'HALF_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'ABSENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-10-06',
      dayName: 'Monday',
      periodsHeld: 7,
      periodsAttended: 7,
      percentage: 100,
      status: 'FULL_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS505', subject: 'Web Technologies Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS505', subject: 'Web Technologies Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-10-03',
      dayName: 'Friday',
      periodsHeld: 7,
      periodsAttended: 7,
      percentage: 100,
      status: 'FULL_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS505', subject: 'Cloud & DevOps Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS505', subject: 'Cloud & DevOps Lab', faculty: 'Prof. K. Suresh', room: 'Lab-4', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-10-02',
      dayName: 'Thursday',
      periodsHeld: 0,
      periodsAttended: 0,
      percentage: 100,
      status: 'HOLIDAY',
      periods: [],
    },
    {
      date: '2025-10-01',
      dayName: 'Wednesday',
      periodsHeld: 7,
      periodsAttended: 6,
      percentage: 85.7,
      status: 'HALF_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'CS502', subject: 'DBMS', faculty: 'Prof. Rajesh Menon', room: 'LH-304', status: 'ABSENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'ENG101', subject: 'Soft Skills Workshop', faculty: 'Prof. Sarah Vance', room: 'LH-101', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'ENG101', subject: 'Aptitude Training', faculty: 'Prof. T. Reddy', room: 'LH-101', status: 'PRESENT' },
      ],
    },
    {
      date: '2025-09-30',
      dayName: 'Tuesday',
      periodsHeld: 7,
      periodsAttended: 7,
      percentage: 100,
      status: 'FULL_DAY',
      periods: [
        { periodNumber: 1, timeSlot: '09:00 - 10:00', code: 'CS501', subject: 'Data Structures', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 2, timeSlot: '10:00 - 11:00', code: 'CS503', subject: 'Computer Networks', faculty: 'Dr. Anjali Gupta', room: 'LH-205', status: 'PRESENT' },
        { periodNumber: 3, timeSlot: '11:15 - 12:15', code: 'CS504', subject: 'Software Engineering', faculty: 'Dr. Priya Sharma', room: 'LH-302', status: 'PRESENT' },
        { periodNumber: 4, timeSlot: '12:15 - 01:15', code: 'MA501', subject: 'Applied Mathematics', faculty: 'Dr. M. Ramanathan', room: 'LH-108', status: 'PRESENT' },
        { periodNumber: 5, timeSlot: '02:00 - 03:00', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
        { periodNumber: 6, timeSlot: '03:00 - 04:00', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
        { periodNumber: 7, timeSlot: '04:00 - 04:50', code: 'CS502', subject: 'DBMS Lab', faculty: 'Prof. Rajesh Menon', room: 'Lab-1', status: 'PRESENT' },
      ],
    },
  ],
  studentResults: [
    { code: 'CS501', subject: 'Data Structures', marks: 88, maxMarks: 100, grade: 'A', credits: 4, sem: 'Sem 5' },
    { code: 'CS502', subject: 'DBMS', marks: 82, maxMarks: 100, grade: 'B+', credits: 4, sem: 'Sem 5' },
    { code: 'CS503', subject: 'Computer Networks', marks: 78, maxMarks: 100, grade: 'B+', credits: 3, sem: 'Sem 5' },
    { code: 'CS504', subject: 'Software Engineering', marks: 91, maxMarks: 100, grade: 'A+', credits: 4, sem: 'Sem 5' },
    { code: 'MA501', subject: 'Mathematics', marks: 85, maxMarks: 100, grade: 'A', credits: 3, sem: 'Sem 5' },
  ],
  semestersTrend: [
    { sem: 'Sem 1', sgpa: 8.1, overallAvg: 7.4, topScore: 9.6, credits: 22 },
    { sem: 'Sem 2', sgpa: 8.25, overallAvg: 7.5, topScore: 9.7, credits: 24 },
    { sem: 'Sem 3', sgpa: 8.4, overallAvg: 7.6, topScore: 9.8, credits: 24 },
    { sem: 'Sem 4', sgpa: 8.54, overallAvg: 7.8, topScore: 9.85, credits: 22 },
  ],
  assignments: [
    {
      id: 'asg_01',
      title: 'Data Structures - Assignment 2 (Red-Black Trees & Graphs)',
      subject: 'Data Structures',
      dueDate: '2025-10-20',
      status: 'PENDING',
      points: 50,
      description: 'Implement AVL balancing and Red-Black tree insertion with test cases.',
      submissionsCount: 94,
      totalStudents: 120,
    },
    {
      id: 'asg_02',
      title: 'DBMS - Quiz 1 (SQL Joins & Normalization)',
      subject: 'DBMS',
      dueDate: '2025-10-18',
      status: 'SUBMITTED',
      score: 46,
      points: 50,
      description: 'Online timed quiz on 3NF, BCNF and transaction isolation levels.',
      submissionsCount: 118,
      totalStudents: 120,
    },
    {
      id: 'asg_03',
      title: 'Computer Networks - Packet Tracing Lab',
      subject: 'Computer Networks',
      dueDate: '2025-10-25',
      status: 'PENDING',
      points: 100,
      description: 'Capture Wireshark traces for TCP handshake and HTTP/2 multiplexing.',
      submissionsCount: 42,
      totalStudents: 120,
    },
  ],
  learningMaterials: [
    { id: 'mat_01', title: 'Unit 4: Advanced Graph Algorithms & Dijkstra Notes', subject: 'Data Structures', type: 'PDF', size: '4.2 MB', date: 'Oct 8, 2025', downloads: 142 },
    { id: 'mat_02', title: 'SQL Cheatsheet & Query Optimization Guide', subject: 'DBMS', type: 'PDF', size: '2.8 MB', date: 'Oct 5, 2025', downloads: 188 },
    { id: 'mat_03', title: 'OSI vs TCP/IP Architecture Slides', subject: 'Computer Networks', type: 'PPTX', size: '12.1 MB', date: 'Sep 28, 2025', downloads: 112 },
    { id: 'mat_04', title: 'Agile & Scrum Sprint Planning Handbook', subject: 'Software Engineering', type: 'PDF', size: '3.1 MB', date: 'Sep 22, 2025', downloads: 96 },
  ],
  studyGoals: [
    { id: 'g_01', text: 'Complete DBMS assignment and submit SQL scripts', completed: false, priority: 'HIGH', category: 'Assignment' },
    { id: 'g_02', text: 'Revise Data Structures (Chapter 4: AVL & B-Trees)', completed: false, priority: 'MEDIUM', category: 'Revision' },
    { id: 'g_03', text: 'Solve 10 practice questions on LeetCode / HackerRank', completed: true, priority: 'HIGH', category: 'Practice' },
    { id: 'g_04', text: 'Review Software Engineering Design Patterns', completed: false, priority: 'LOW', category: 'Study' },
  ],
  skillsList: [
    { name: 'Programming (C++, Python, JS)', score: 80, level: 'Advanced', gap: 'Low' },
    { name: 'Data Structures & Algorithms', score: 85, level: 'Advanced', gap: 'Low' },
    { name: 'Database & SQL', score: 75, level: 'Intermediate', gap: 'Medium' },
    { name: 'Communication & Soft Skills', score: 65, level: 'Intermediate', gap: 'High' },
    { name: 'Problem Solving & Aptitude', score: 70, level: 'Intermediate', gap: 'Medium' },
    { name: 'Teamwork & Collaboration', score: 75, level: 'Intermediate', gap: 'Low' },
  ],
  placementJobs: [
    { id: 'job_01', company: 'Google', role: 'Associate Software Engineer', package: '₹28 - 34 LPA', matchScore: 88, deadline: 'Nov 15, 2025', eligible: true, status: 'Applied' },
    { id: 'job_02', company: 'Microsoft', role: 'Software Development Engineer I', package: '₹24 - 30 LPA', matchScore: 85, deadline: 'Nov 20, 2025', eligible: true, status: 'Shortlisted' },
    { id: 'job_03', company: 'TCS Digital', role: 'Systems Engineer - AI/Cloud', package: '₹9 - 11 LPA', matchScore: 94, deadline: 'Oct 30, 2025', eligible: true, status: 'Eligible' },
    { id: 'job_04', company: 'Amazon Web Services', role: 'Cloud Solutions Associate', package: '₹18 - 22 LPA', matchScore: 82, deadline: 'Dec 05, 2025', eligible: true, status: 'Eligible' },
  ],
  announcements: [
    { id: 'ann_01', title: 'College Fest 2025 - Registration Open', date: '01 Oct 2025', author: 'Principal Office', category: 'Campus Event', important: false },
    { id: 'ann_02', title: 'Internal Exam Schedule Released for Semesters 3, 5, 7', date: '10 Oct 2025', author: 'Academic Dean', category: 'Examinations', important: true },
    { id: 'ann_03', title: 'New Placement Drive - TCS Digital & Innovator Hiring', date: '08 Oct 2025', author: 'Training & Placement Cell', category: 'Placements', important: true },
    { id: 'ann_04', title: 'Smart India Hackathon 2025 Mentorship Sessions', date: '05 Oct 2025', author: 'CSE Department', category: 'Competitions', important: false },
  ],
  studentsNeedingAttention: [
    { id: 'att_01', studentId: 'STD2024102', name: 'Rohit Kumar', department: 'CSE', attendance: 62, avgMarks: 58, riskLevel: 'HIGH', reason: 'Declining attendance (62%) and missed 2 lab assignments', mentorAssigned: 'Dr. Priya Sharma', status: 'Pending Review' },
    { id: 'att_02', studentId: 'STD2024103', name: 'Sneha Reddy', department: 'ECE', attendance: 68, avgMarks: 64, riskLevel: 'MEDIUM', reason: 'Attendance dropped below 70% in Electronics Circuitry', mentorAssigned: 'Prof. Rajesh Menon', status: 'Counseled' },
    { id: 'att_03', studentId: 'STD2024104', name: 'Akhil Singh', department: 'CSE', attendance: 71, avgMarks: 66, riskLevel: 'MEDIUM', reason: 'Low test score in Algorithms mid-term (42/100)', mentorAssigned: 'Dr. Priya Sharma', status: 'Parent Contacted' },
    { id: 'att_04', studentId: 'STD2024105', name: 'Pooja Nair', department: 'IT', attendance: 75, avgMarks: 72, riskLevel: 'LOW', reason: 'Marginal attendance risk, recovering trend', mentorAssigned: 'Dr. Priya Sharma', status: 'Resolved' },
  ],
  mentorFollowUps: [
    { id: 'mf_01', studentName: 'Rohit Kumar', studentId: 'STD2024102', date: '2025-10-06', notes: 'Discussed health issue causing absence. Advised medical certificate submission and peer study buddy.', actionTaken: 'Remedial class arranged', followUpDate: '2025-10-18' },
    { id: 'mf_02', studentName: 'Sneha Reddy', studentId: 'STD2024103', date: '2025-09-28', notes: 'Student struggling with circuit lab simulations. Scheduled lab assistant hours on Tuesdays.', actionTaken: 'Extra lab session assigned', followUpDate: '2025-10-15' },
  ],
  feedbacks: [
    { id: 'fb_01', studentId: 'ANONYMOUS', department: 'CSE', subject: 'Data Structures', rating: 5, category: 'Curriculum & Teaching', comment: 'Dr. Priya explains graph algorithms with vivid code animations. Very clear!', sentiment: 'POSITIVE', resolved: true, date: '2025-10-04' },
    { id: 'fb_02', studentId: 'ANONYMOUS', department: 'CSE', subject: 'Lab Infrastructure', rating: 3, category: 'Infrastructure', comment: 'Lab 3 systems need Linux kernel upgrade for Docker containers.', sentiment: 'NEUTRAL', resolved: false, date: '2025-10-07' },
    { id: 'fb_03', studentId: 'ANONYMOUS', department: 'ECE', subject: 'Digital Circuits', rating: 2, category: 'Evaluation', comment: 'Mid-term paper was very lengthy compared to time allotted.', sentiment: 'NEGATIVE', resolved: false, date: '2025-10-09' },
  ],
  activityLogs: [
    { id: 'log_01', user: 'Dr. Priya Sharma', action: 'Uploaded Lecture Note', details: 'Unit 4 Advanced Graphs (PDF)', timestamp: '2025-10-10 08:30:15', ip: '10.0.12.44' },
    { id: 'log_02', user: 'Vishnu Vardhan', action: 'Assignment Submitted', details: 'DBMS - Quiz 1', timestamp: '2025-10-09 21:14:02', ip: '10.0.8.109' },
    { id: 'log_03', user: 'Dr. R. Krishnan', action: 'Published Circular', details: 'Internal Exam Schedule', timestamp: '2025-10-09 11:00:45', ip: '10.0.2.1' },
    { id: 'log_04', user: 'Prof. Rajesh Menon', action: 'Updated Attendance', details: 'ECE Section B (44 students)', timestamp: '2025-10-08 16:45:10', ip: '10.0.12.87' },
  ],
};

// ==========================================
// AUTHENTICATION MIDDLEWARE & ENDPOINTS
// ==========================================

function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No session token provided.' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please sign in again.' });
  }

  const user = users.find((u) => u.id === session.userId);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: 'User account inactive or not found.' });
  }

  (req as any).user = user;
  (req as any).role = user.role;
  next();
}

// 1. LOGIN API with strict Role Mismatch verification
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, selectedRole, rememberMe } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide Email/College ID and Password.' });
  }

  const cleanIdentifier = (identifier as string).trim().toLowerCase();

  // Find user by email or collegeId
  const user = users.find(
    (u) => u.email.toLowerCase() === cleanIdentifier || u.collegeId.toLowerCase() === cleanIdentifier
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. No registered account matches the provided identifier.',
    });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated or suspended. Please contact the college administrator.',
    });
  }

  // Verify password hash
  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    return res.status(401).json({
      success: false,
      message: 'Invalid password. Please check your credentials and try again.',
    });
  }

  // Strict Role Verification: Enforce RBAC and prevent privilege escalation!
  if (selectedRole && user.role !== selectedRole) {
    return res.status(403).json({
      success: false,
      roleMismatch: true,
      userActualRole: user.role,
      message: `Role mismatch: The authenticated account "${user.collegeId}" is assigned to the "${user.role}" role, not "${selectedRole}". Please switch to the ${user.role} role to login.`,
    });
  }

  // Generate secure token
  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    createdAt: Date.now(),
  });

  // Log activity
  dbData.activityLogs.unshift({
    id: `log_${Date.now()}`,
    user: user.name,
    action: 'Successful Login',
    details: `Role: ${user.role} via ${rememberMe ? 'Remembered' : 'Standard'} Session`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip: req.ip || '127.0.0.1',
  });

  // Return user info (excluding password hash)
  const { passwordHash, salt, ...safeUser } = user;
  return res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: safeUser,
  });
});

// 2. GET CURRENT USER
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { passwordHash, salt, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser,
  });
});

// 3. LOGOUT
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. FORGOT / RESET PASSWORD WORKFLOW
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, newPassword } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Please enter your registered Email or College ID.' });
  }

  const cleanIdentifier = (identifier as string).trim().toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === cleanIdentifier || u.collegeId.toLowerCase() === cleanIdentifier
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered account found with that email or ID.' });
  }

  if (newPassword && newPassword.length >= 6) {
    user.passwordHash = hashPassword(newPassword, user.salt);
    return res.json({
      success: true,
      message: `Password reset successfully for ${user.name}. You can now sign in with your new password.`,
    });
  }

  // Simulated OTP/Recovery link sent
  return res.json({
    success: true,
    message: `Password reset verification token sent to institutional email: ${user.email}.`,
    userEmail: user.email,
  });
});

// 5. CHANGE PASSWORD (Authenticated)
app.post('/api/auth/change-password', authenticateToken, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user as UserProfile;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const currentHashed = hashPassword(currentPassword, user.salt);
  if (currentHashed !== user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Current password does not match. Please verify and try again.' });
  }

  // Update password
  user.passwordHash = hashPassword(newPassword, user.salt);

  dbData.activityLogs.unshift({
    id: `log_${Date.now()}`,
    user: user.name,
    action: 'Changed Password',
    details: 'User successfully updated security credentials',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, message: 'Your password has been changed successfully.' });
});

// 6. UPDATE PROFILE (Authenticated)
app.post('/api/auth/update-profile', authenticateToken, (req: Request, res: Response) => {
  const { name, department, avatarUrl } = req.body;
  const user = (req as any).user as UserProfile;

  if (name) user.name = name.trim();
  if (department) user.department = department.trim();
  if (avatarUrl) user.avatarUrl = avatarUrl.trim();

  const { passwordHash, salt, ...safeUser } = user;
  return res.json({ success: true, message: 'Profile updated successfully.', user: safeUser });
});

// ==========================================
// ROLE-BASED DASHBOARD DATA APIS
// ==========================================

// STUDENT DASHBOARD DATA
app.get('/api/student/data', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (user.role !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Access denied. Student authorization required.' });
  }

  // Filter attendance for student
  const studentAttendance = dbData.attendanceRecords.filter(
    (a) => a.studentId === user.collegeId || a.studentId === 'STD2024101'
  );
  const totalClasses = studentAttendance.reduce((acc, curr) => acc + (curr.periodsHeld || curr.totalClasses), 0);
  const totalAttended = studentAttendance.reduce((acc, curr) => acc + (curr.periodsAttended || curr.attended), 0);
  const overallAttendancePercent = totalClasses > 0 ? Number(((totalAttended / totalClasses) * 100).toFixed(1)) : 92.0;

  res.json({
    success: true,
    data: {
      profile: {
        name: user.name,
        collegeId: user.collegeId,
        department: user.department,
        semester: 'Semester 5 (B.Tech CSE)',
        cgpa: 8.54,
        cgpaChange: '+0.3 this semester',
        attendancePercentage: overallAttendancePercent,
        attendanceChange: '+2% this month',
        pendingAssignments: dbData.assignments.filter((a) => a.status === 'PENDING').length,
        upcomingExams: 2,
        nextExamDate: '25 Oct 2025',
      },
      results: dbData.studentResults,
      semestersTrend: dbData.semestersTrend,
      attendance: studentAttendance,
      subjectPeriods: dbData.subjectPeriods,
      dailyAttendance: dbData.dailyAttendanceLog,
      periodStats: {
        totalPeriodsHeld: dbData.subjectPeriods.reduce((acc, curr) => acc + curr.periodsHeld, 0),
        totalPeriodsAttended: dbData.subjectPeriods.reduce((acc, curr) => acc + curr.periodsAttended, 0),
        periodsAbsent: dbData.subjectPeriods.reduce((acc, curr) => acc + (curr.periodsHeld - curr.periodsAttended), 0),
        percentage: Number(
          (
            (dbData.subjectPeriods.reduce((acc, curr) => acc + curr.periodsAttended, 0) /
              dbData.subjectPeriods.reduce((acc, curr) => acc + curr.periodsHeld, 0)) *
            100
          ).toFixed(1)
        ),
      },
      assignments: dbData.assignments,
      materials: dbData.learningMaterials,
      goals: dbData.studyGoals,
      skills: dbData.skillsList,
      jobs: dbData.placementJobs,
      announcements: dbData.announcements,
    },
  });
});

// SUBMIT ASSIGNMENT (Student)
app.post('/api/student/submit-assignment', authenticateToken, (req: Request, res: Response) => {
  const { assignmentId, solutionText, fileName } = req.body;
  const user = (req as any).user as UserProfile;

  const assignment = dbData.assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  assignment.status = 'SUBMITTED';
  assignment.submissionsCount += 1;

  dbData.activityLogs.unshift({
    id: `log_${Date.now()}`,
    user: user.name,
    action: 'Assignment Submitted',
    details: `${assignment.title} (File: ${fileName || 'Code Submission'})`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: 'Assignment submitted successfully!' });
});

// SUBMIT FEEDBACK (Student)
app.post('/api/student/submit-feedback', authenticateToken, (req: Request, res: Response) => {
  const { department, subject, rating, category, comment, isAnonymous } = req.body;
  const user = (req as any).user as UserProfile;

  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'POSITIVE';
  if (rating <= 2) sentiment = 'NEGATIVE';
  else if (rating === 3) sentiment = 'NEUTRAL';

  const newFeedback = {
    id: `fb_${Date.now()}`,
    studentId: isAnonymous ? 'ANONYMOUS' : user.collegeId,
    department: department || user.department,
    subject: subject || 'General',
    rating: Number(rating) || 4,
    category: category || 'Academics',
    comment: comment || 'Good teaching experience.',
    sentiment,
    resolved: false,
    date: new Date().toISOString().split('T')[0],
  };

  dbData.feedbacks.unshift(newFeedback);

  res.json({ success: true, message: 'Feedback submitted successfully. Thank you for your review!' });
});

// UPDATE STUDY GOAL
app.post('/api/student/goals', authenticateToken, (req: Request, res: Response) => {
  const { action, goalId, text, priority, category } = req.body;

  if (action === 'TOGGLE') {
    const goal = dbData.studyGoals.find((g) => g.id === goalId);
    if (goal) goal.completed = !goal.completed;
  } else if (action === 'ADD') {
    dbData.studyGoals.unshift({
      id: `g_${Date.now()}`,
      text,
      completed: false,
      priority: priority || 'MEDIUM',
      category: category || 'Study',
    });
  }

  res.json({ success: true, goals: dbData.studyGoals });
});

// TEACHER DASHBOARD DATA
app.get('/api/teacher/data', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (user.role !== 'TEACHER' && user.role !== 'PRINCIPAL') {
    return res.status(403).json({ success: false, message: 'Access denied. Teacher authorization required.' });
  }

  res.json({
    success: true,
    data: {
      profile: {
        name: user.name,
        teacherId: user.collegeId,
        department: user.department,
        classesCount: 4,
        totalStudents: 120,
        pendingAssignments: 8,
        urgentAssignments: 2,
        avgPerformance: '82%',
        performanceChange: '+5% this month',
      },
      classPerformance: [
        { dept: 'CSE', avgMarks: 85, attendance: 92, students: 40 },
        { dept: 'ECE', avgMarks: 78, attendance: 86, students: 30 },
        { dept: 'EEE', avgMarks: 74, attendance: 82, students: 25 },
        { dept: 'MECH', avgMarks: 80, attendance: 88, students: 25 },
      ],
      attendanceSummary: {
        percentage: 88,
        present: 106,
        absent: 12,
        leave: 2,
        total: 120,
      },
      studentsNeedingAttention: dbData.studentsNeedingAttention,
      recentAssignments: dbData.assignments,
      materials: dbData.learningMaterials,
      mentorFollowUps: dbData.mentorFollowUps,
      feedbacks: dbData.feedbacks,
      subjectPeriods: dbData.subjectPeriods,
      dailyAttendance: dbData.dailyAttendanceLog,
    },
  });
});

// MARK ATTENDANCE (Teacher with Period Support)
app.post('/api/teacher/mark-attendance', authenticateToken, (req: Request, res: Response) => {
  const { subject, date, periodNumber, timeSlot, attendanceList } = req.body;
  const user = (req as any).user as UserProfile;

  const targetDate = date || new Date().toISOString().split('T')[0];
  const pNum = Number(periodNumber) || 1;
  const pSlot = timeSlot || '09:00 - 10:00';
  const pSub = subject || 'Data Structures';

  if (Array.isArray(attendanceList)) {
    attendanceList.forEach((item: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LEAVE' }) => {
      const record = dbData.attendanceRecords.find((r) => r.studentId === item.studentId);
      if (record) {
        record.totalClasses = (record.totalClasses || 40) + 1;
        record.periodsHeld = (record.periodsHeld || record.totalClasses) + 1;
        if (item.status === 'PRESENT') {
          record.attended = (record.attended || 35) + 1;
          record.periodsAttended = (record.periodsAttended || record.attended) + 1;
        }
        record.percentage = Number(((record.attended / record.totalClasses) * 100).toFixed(1));
      }
    });

    // Also update corresponding subject period held
    const subMetric = dbData.subjectPeriods.find((sp) => sp.subject.toLowerCase().includes(pSub.toLowerCase()) || pSub.toLowerCase().includes(sp.subject.toLowerCase()));
    if (subMetric) {
      subMetric.periodsHeld += 1;
      const anyPresent = attendanceList.some((a) => a.studentId === 'STD2024101' && a.status === 'PRESENT');
      if (anyPresent) subMetric.periodsAttended += 1;
      subMetric.percentage = Number(((subMetric.periodsAttended / subMetric.periodsHeld) * 100).toFixed(1));
    }

    // Add or update daily log period
    let dayLog = dbData.dailyAttendanceLog.find((d) => d.date === targetDate);
    if (!dayLog) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dObj = new Date(targetDate);
      dayLog = {
        date: targetDate,
        dayName: dayNames[dObj.getDay()] || 'Weekday',
        periodsHeld: 0,
        periodsAttended: 0,
        percentage: 100,
        status: 'FULL_DAY',
        periods: [],
      };
      dbData.dailyAttendanceLog.unshift(dayLog);
    }

    const myStudentStatus = attendanceList.find((a) => a.studentId === 'STD2024101')?.status || 'PRESENT';
    const existingP = dayLog.periods.find((p) => p.periodNumber === pNum);
    if (existingP) {
      existingP.status = myStudentStatus;
      existingP.subject = pSub;
    } else {
      dayLog.periods.push({
        periodNumber: pNum,
        timeSlot: pSlot,
        code: 'CS501',
        subject: pSub,
        faculty: user.name,
        room: 'LH-302',
        status: myStudentStatus,
      });
      dayLog.periodsHeld += 1;
      if (myStudentStatus === 'PRESENT') dayLog.periodsAttended += 1;
      dayLog.percentage = Number(((dayLog.periodsAttended / dayLog.periodsHeld) * 100).toFixed(1));
    }
  }

  dbData.activityLogs.unshift({
    id: `log_${Date.now()}`,
    user: user.name,
    action: 'Marked Period Attendance',
    details: `Subject: ${pSub} • Period ${pNum} (${pSlot}) • Date: ${targetDate}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: `Period ${pNum} attendance recorded and recalculated successfully!` });
});

// CREATE ASSIGNMENT (Teacher)
app.post('/api/teacher/create-assignment', authenticateToken, (req: Request, res: Response) => {
  const { title, subject, dueDate, points, description } = req.body;
  const newAsg = {
    id: `asg_${Date.now()}`,
    title,
    subject: subject || 'Data Structures',
    dueDate,
    status: 'PENDING',
    points: Number(points) || 100,
    description,
    submissionsCount: 0,
    totalStudents: 120,
  };
  dbData.assignments.unshift(newAsg);
  res.json({ success: true, message: 'Assignment created and notified to enrolled students!', assignment: newAsg });
});

// UPLOAD LEARNING MATERIAL (Teacher)
app.post('/api/teacher/upload-material', authenticateToken, (req: Request, res: Response) => {
  const { title, subject, type, size } = req.body;
  const newMat = {
    id: `mat_${Date.now()}`,
    title,
    subject: subject || 'Computer Science',
    type: type || 'PDF',
    size: size || '3.5 MB',
    date: 'Just now',
    downloads: 0,
  };
  dbData.learningMaterials.unshift(newMat);
  res.json({ success: true, message: 'Learning material published successfully!', material: newMat });
});

// MENTOR FOLLOW-UP (Teacher)
app.post('/api/teacher/mentor-followup', authenticateToken, (req: Request, res: Response) => {
  const { studentName, studentId, notes, actionTaken, followUpDate } = req.body;
  const newFollowup = {
    id: `mf_${Date.now()}`,
    studentName,
    studentId,
    date: new Date().toISOString().split('T')[0],
    notes,
    actionTaken,
    followUpDate,
  };
  dbData.mentorFollowUps.unshift(newFollowup);

  // Update status in attention list
  const student = dbData.studentsNeedingAttention.find((s) => s.studentId === studentId);
  if (student) {
    student.status = 'Counseled & Follow-up Logged';
  }

  res.json({ success: true, message: 'Mentorship intervention recorded successfully!' });
});

// PRINCIPAL DASHBOARD DATA
app.get('/api/principal/data', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (user.role !== 'PRINCIPAL') {
    return res.status(403).json({ success: false, message: 'Access denied. Principal authorization required.' });
  }

  res.json({
    success: true,
    data: {
      profile: {
        name: user.name,
        title: 'Principal & Head of Institution',
        totalStudents: 2450,
        studentGrowth: '↑ 5%',
        totalFaculty: 182,
        facultyGrowth: '↑ 2%',
        placementRate: '78%',
        placementGrowth: '↑ 12%',
        departmentsCount: 8,
      },
      academicTrend: [
        { sem: 'Sem 1', overallAvg: 74, topPerformers: 94 },
        { sem: 'Sem 2', overallAvg: 76, topPerformers: 95 },
        { sem: 'Sem 3', overallAvg: 78, topPerformers: 97 },
        { sem: 'Sem 4', overallAvg: 81, topPerformers: 98 },
      ],
      departmentPerformance: [
        { dept: 'CSE', score: 88, students: 540, attendance: 92 },
        { dept: 'ECE', score: 84, students: 480, attendance: 88 },
        { dept: 'EEE', score: 80, students: 320, attendance: 85 },
        { dept: 'MECH', score: 78, students: 380, attendance: 84 },
        { dept: 'IT', score: 82, students: 420, attendance: 89 },
        { dept: 'CIVIL', score: 76, students: 310, attendance: 83 },
      ],
      riskAlertsSummary: {
        lowAttendance: 28,
        lowPerformance: 15,
        academicProbation: 8,
      },
      placementStats: {
        placedPercentage: 78,
        placedCount: 654,
        inProcess: 120,
        notPlaced: 86,
        topRecruiters: ['Google', 'Microsoft', 'TCS', 'Infosys', 'Amazon', 'Cognizant'],
        highestPackage: '₹44.0 LPA',
        averagePackage: '₹8.6 LPA',
      },
      facultyMetrics: [
        { name: 'Dr. Priya Sharma', dept: 'CSE', feedbackRating: 4.8, passRate: 98, researchPapers: 6 },
        { name: 'Prof. Rajesh Menon', dept: 'ECE', feedbackRating: 4.6, passRate: 94, researchPapers: 4 },
        { name: 'Dr. Anjali Gupta', dept: 'IT', feedbackRating: 4.7, passRate: 96, researchPapers: 5 },
        { name: 'Dr. K. Srinivas', dept: 'MECH', feedbackRating: 4.5, passRate: 91, researchPapers: 3 },
      ],
      feedbackAnalytics: {
        positiveCount: 142,
        neutralCount: 38,
        negativeCount: 16,
        categories: [
          { name: 'Faculty & Academics', score: 92 },
          { name: 'Lab Facilities & Tech', score: 79 },
          { name: 'Hostel & Canteen', score: 74 },
          { name: 'Library & E-Resources', score: 88 },
        ],
      },
      recentAnnouncements: dbData.announcements,
      activityLogs: dbData.activityLogs,
      usersList: users.map(({ passwordHash, salt, ...u }) => u),
    },
  });
});

// PUBLISH ANNOUNCEMENT (Principal)
app.post('/api/principal/announcement', authenticateToken, (req: Request, res: Response) => {
  const { title, category, important } = req.body;
  const newAnn = {
    id: `ann_${Date.now()}`,
    title,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    author: 'Principal Office',
    category: category || 'Institutional Circular',
    important: Boolean(important),
  };
  dbData.announcements.unshift(newAnn);
  res.json({ success: true, message: 'Campus announcement published to all portals!', announcement: newAnn });
});

// UPDATE USER STATUS (Principal)
app.post('/api/principal/user-status', authenticateToken, (req: Request, res: Response) => {
  const { userId, newStatus } = req.body;
  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  targetUser.status = newStatus;
  res.json({ success: true, message: `Account status updated to ${newStatus}.` });
});

// ==========================================
// GEMINI AI ENDPOINTS (Server-Side)
// ==========================================

// 1. AI Study Planner Generator
app.post('/api/ai/study-planner', authenticateToken, async (req: Request, res: Response) => {
  const { subjects, availableHoursPerDay, examDate, targetCGPA } = req.body;

  const defaultPlan = {
    summary: `Tailored 7-Day Intensive Plan for target CGPA of ${targetCGPA || '9.0'}. Focusing on weak areas with prioritized pomodoro intervals.`,
    schedule: [
      { day: 'Day 1 (Monday)', focus: 'Data Structures: AVL Trees & Graph Traversals', duration: '2.5 hrs', tasks: ['Review DFS/BFS time complexity', 'Implement AVL node rotation code', 'Solve 3 practice questions'] },
      { day: 'Day 2 (Tuesday)', focus: 'DBMS: SQL Normalization (BCNF & 3NF)', duration: '2.0 hrs', tasks: ['Understand lossless join decomposition', 'Execute 5 nested SQL queries', 'Quiz yourself on ACID properties'] },
      { day: 'Day 3 (Wednesday)', focus: 'Computer Networks: TCP/IP & Congestion Control', duration: '2.0 hrs', tasks: ['Trace TCP 3-way handshake in Wireshark', 'Study Sliding Window protocol math'] },
      { day: 'Day 4 (Thursday)', focus: 'Software Engineering: Architecture & Design Patterns', duration: '1.5 hrs', tasks: ['Singleton vs Factory pattern diagram', 'Review Agile sprint retrospectives'] },
      { day: 'Day 5 (Friday)', focus: 'Applied Mathematics: Linear Algebra & Probability', duration: '2.5 hrs', tasks: ['Eigenvalues & Eigenvectors computation', 'Solve Bayes Theorem conditional problems'] },
      { day: 'Weekend (Sat-Sun)', focus: 'Full Mock Test & Weak Area Revision', duration: '3.5 hrs', tasks: ['Solve previous year university questions', 'Flashcard revision for definitions'] },
    ],
    revisionPoints: [
      'Data Structures: Remember that AVL tree balances with height factor (-1, 0, 1), whereas Red-Black uses node recoloring.',
      'DBMS: Boyce-Codd Normal Form (BCNF) strictly requires every determinant to be a super key.',
      'Networking: SYN -> SYN-ACK -> ACK completes transmission initiation.',
    ],
  };

  if (!ai) {
    return res.json({ success: true, plan: defaultPlan, provider: 'Local Rule Engine' });
  }

  try {
    const prompt = `Generate a realistic, student-friendly daily study schedule and revision points for a Computer Science college student.
Available hours per day: ${availableHoursPerDay || 3} hours.
Upcoming exam date: ${examDate || 'in 2 weeks'}.
Target CGPA: ${targetCGPA || '9.0'}.
Subjects: ${JSON.stringify(subjects || ['Data Structures', 'DBMS', 'Computer Networks'])}.

Format the response as a JSON object with:
"summary": string,
"schedule": array of { "day": string, "focus": string, "duration": string, "tasks": string[] },
"revisionPoints": string[] (3-4 crisp high-yield revision facts).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, plan: parsed, provider: 'Gemini 3.8 Flash' });
  } catch (error) {
    console.error('Gemini Study Planner error:', error);
    return res.json({ success: true, plan: defaultPlan, provider: 'Local Fallback' });
  }
});

// 2. AI Campus Assistant Chat
app.post('/api/ai/chat', authenticateToken, async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const user = (req as any).user as UserProfile;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const cleanMsg = message.toLowerCase();

  // Smart immediate responses for campus FAQs
  let fallbackReply = `Hello ${user.name}! I am your Smart Campus AI Assistant. I can help you with notes explanations, exam schedules, attendance policies (minimum 75% required for university exam eligibility), assignment queries, and placement preparation tips. Feel free to ask me any academic question!`;

  if (cleanMsg.includes('attendance')) {
    fallbackReply = `According to Smart Campus AI institutional guidelines, students must maintain a minimum of 75% overall attendance to be eligible for end-semester examinations. Your current overall attendance is tracked at 92%, which is in the Excellent range! Keep up the regular participation.`;
  } else if (cleanMsg.includes('exam') || cleanMsg.includes('schedule')) {
    fallbackReply = `The upcoming Mid-Term & Internal Examinations commence on 25th October 2025. The detailed timetable is available in your Notifications & Announcements tab. Make sure to review your AI Study Planner for high-priority subjects!`;
  } else if (cleanMsg.includes('placement') || cleanMsg.includes('job') || cleanMsg.includes('interview')) {
    fallbackReply = `The Campus Training & Placement cell currently lists openings from Google, Microsoft, TCS Digital, and AWS. With your current 8.54 CGPA, you meet the eligibility criteria for all Tier-1 drives. We recommend practicing DSA on trees and dynamic programming!`;
  } else if (cleanMsg.includes('avl') || cleanMsg.includes('data structure') || cleanMsg.includes('tree')) {
    fallbackReply = `An AVL tree is a self-balancing Binary Search Tree where the difference between heights of left and right subtrees (the balance factor) cannot exceed 1 for any node. If insertion causes an imbalance, rotations (LL, RR, LR, RL) are executed in O(log n) time.`;
  }

  if (!ai) {
    return res.json({ success: true, reply: fallbackReply, provider: 'Campus Knowledge Engine' });
  }

  try {
    const systemPrompt = `You are the official Smart Campus AI Assistant for QIS College of Engineering and Technology.
User details: Name: ${user.name}, Role: ${user.role}, Department: ${user.department}.
Help the user with academic guidance, formula explanations, study techniques, college regulations, and career mentorship.
Be encouraging, precise, and professional. Distinguish verified institutional policies from academic study suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      success: true,
      reply: response.text || fallbackReply,
      provider: 'Gemini 3.8 Flash',
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    return res.json({ success: true, reply: fallbackReply, provider: 'Campus Knowledge Engine' });
  }
});

// 3. AI Risk Analysis & Intervention Explainer
app.post('/api/ai/risk-analysis', authenticateToken, async (req: Request, res: Response) => {
  const { studentName, attendance, avgMarks, reason } = req.body;

  const defaultExplanation = {
    riskAssessment: `Student ${studentName || 'Student'} shows early warning indicators with ${attendance}% attendance and ${avgMarks}% average marks.`,
    rootCauseAnalysis: [
      'Attendance shortage limits exposure to foundational lab sessions and continuous assessment.',
      'Correlated drop in internal test marks indicates struggling with core subject concepts.',
    ],
    recommendedInterventions: [
      'Schedule a 1-on-1 mentor consultation to assess personal or health obstacles.',
      'Assign a peer study partner for Data Structures code debugging.',
      'Provide compensatory remedial lab access on Saturdays.',
    ],
  };

  if (!ai) {
    return res.json({ success: true, analysis: defaultExplanation });
  }

  try {
    const prompt = `Analyze this academic risk alert for a college student:
Student: ${studentName}
Attendance: ${attendance}%
Average Marks: ${avgMarks}%
Observed Note: ${reason}

Provide a structured JSON output with:
"riskAssessment": string,
"rootCauseAnalysis": string[],
"recommendedInterventions": string[] (3 actionable teacher/mentor interventions).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (err) {
    return res.json({ success: true, analysis: defaultExplanation });
  }
});

// EXPORT REPORTS (CSV Format)
app.get('/api/reports/export', authenticateToken, (req: Request, res: Response) => {
  const { type } = req.query;

  if (type === 'attendance') {
    const headers = 'StudentID,Name,Subject,TotalClasses,Attended,Percentage\n';
    const rows = dbData.attendanceRecords
      .map((r) => `"${r.studentId}","${r.name}","${r.subject}",${r.totalClasses},${r.attended},${r.percentage}%`)
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smart_campus_attendance_report.csv"');
    return res.send(headers + rows);
  }

  // Default Academic Report
  const headers = 'Department,AverageScore,TotalStudents,AttendanceRate\n';
  const rows = [
    '"Computer Science",88,540,92%',
    '"Electronics & Comm",84,480,88%',
    '"Electrical Eng",80,320,85%',
    '"Mechanical Eng",78,380,84%',
    '"Information Tech",82,420,89%',
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="smart_campus_institutional_report.csv"');
  return res.send(headers + rows);
});

// ==========================================
// VITE INTEGRATION / CLIENT SERVING
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Smart Campus AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
