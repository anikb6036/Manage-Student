/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount, ClassSchedule, ProgressRecord, AppNotification, BackupHistory } from './types';

// Initial seed data for the Coaching Center
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'instructor-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@coachingcenter.edu',
    role: 'instructor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 0192',
    joinedDate: '2025-01-15',
    specialization: 'Physics & Advanced Coding'
  },
  {
    id: 'instructor-2',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@coachingcenter.edu',
    role: 'instructor',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    phone: '+1 (555) 0143',
    joinedDate: '2025-03-10',
    specialization: 'Applied Mathematics & Calculus'
  },
  {
    id: 'instructor-3',
    name: 'Marcus Aurelius',
    email: 'marcus.aurelius@coachingcenter.edu',
    role: 'instructor',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+1 (555) 2341',
    joinedDate: '2024-09-01',
    specialization: 'Logic, Debate & Literature'
  },
  {
    id: 'student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    phone: '+1 (555) 0188',
    joinedDate: '2025-02-20',
    assignedInstructorId: 'instructor-1'
  },
  {
    id: 'student-2',
    name: 'Chloe Bennett',
    email: 'chloe.b@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+1 (555) 0177',
    joinedDate: '2025-04-01',
    assignedInstructorId: 'instructor-2'
  },
  {
    id: 'student-3',
    name: 'Lucas Martinez',
    email: 'lucas.m@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 (555) 0166',
    joinedDate: '2025-01-10',
    assignedInstructorId: 'instructor-1'
  },
  {
    id: 'student-4',
    name: 'Priya Nair',
    email: 'priya.nair@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    phone: '+1 (555) 0155',
    joinedDate: '2025-05-12',
    assignedInstructorId: 'instructor-3'
  },
  {
    id: 'admin-1',
    name: 'Anik Baidya (Admin)',
    email: 'baidyaanik18@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150',
    phone: '+1 (555) 0100',
    joinedDate: '2024-05-20'
  }
];

export const INITIAL_SCHEDULES: ClassSchedule[] = [
  {
    id: 'class-1',
    title: 'Kinematics & Dynamics Fundamentals',
    subject: 'Physics',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Sarah Chen',
    date: '2026-06-01',
    time: '14:00',
    duration: 90,
    maxStudents: 10,
    enrolledStudentIds: ['student-1', 'student-3'],
    location: 'Lab Room 3B',
    status: 'scheduled'
  },
  {
    id: 'class-2',
    title: 'Advanced Calculus Theory',
    subject: 'Mathematics',
    instructorId: 'instructor-2',
    instructorName: 'Eleanor Vance',
    date: '2026-06-02',
    time: '10:00',
    duration: 120,
    maxStudents: 8,
    enrolledStudentIds: ['student-2', 'student-1'],
    location: 'Seminar Center A',
    status: 'scheduled'
  },
  {
    id: 'class-3',
    title: 'Introduction to Logic & Socrates Dialogues',
    subject: 'Logic',
    instructorId: 'instructor-3',
    instructorName: 'Marcus Aurelius',
    date: '2026-06-03',
    time: '16:00',
    duration: 60,
    maxStudents: 15,
    enrolledStudentIds: ['student-4', 'student-2'],
    location: 'Amphitheater East',
    status: 'scheduled'
  },
  {
    id: 'class-4',
    title: 'Vite & React Fullstack Deployment',
    subject: 'Coding',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Sarah Chen',
    date: '2026-05-30', // In the past (relative to local time 2026-05-31)
    time: '11:00',
    duration: 180,
    maxStudents: 5,
    enrolledStudentIds: ['student-1', 'student-3'],
    location: 'Online Classroom',
    status: 'completed'
  },
  {
    id: 'class-5',
    title: 'Limits & Continuous Functions',
    subject: 'Mathematics',
    instructorId: 'instructor-2',
    instructorName: 'Eleanor Vance',
    date: '2026-05-29',
    time: '09:00',
    duration: 90,
    maxStudents: 12,
    enrolledStudentIds: ['student-2', 'student-4'],
    location: 'Room 202',
    status: 'completed'
  }
];

export const INITIAL_PROGRESS: ProgressRecord[] = [
  {
    id: 'progress-1',
    studentId: 'student-1',
    studentName: 'Alex Rivera',
    classId: 'class-4',
    className: 'Vite & React Fullstack Deployment',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Sarah Chen',
    evaluationDate: '2026-05-30',
    subject: 'Coding',
    score: 95,
    attendanceStatus: 'present',
    feedback: 'Alex showed stellar understanding of state lifting and TypeScript build constraints. Build succeeds on first try.',
    academicPerformance: 'excellent'
  },
  {
    id: 'progress-2',
    studentId: 'student-3',
    studentName: 'Lucas Martinez',
    classId: 'class-4',
    className: 'Vite & React Fullstack Deployment',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Sarah Chen',
    evaluationDate: '2026-05-30',
    subject: 'Coding',
    score: 82,
    attendanceStatus: 'present',
    feedback: 'Took slightly more time in folder layout configuration, but code is well-structured and functional.',
    academicPerformance: 'good'
  },
  {
    id: 'progress-3',
    studentId: 'student-2',
    studentName: 'Chloe Bennett',
    classId: 'class-5',
    className: 'Limits & Continuous Functions',
    instructorId: 'instructor-2',
    instructorName: 'Eleanor Vance',
    evaluationDate: '2026-05-29',
    subject: 'Mathematics',
    score: 88,
    attendanceStatus: 'present',
    feedback: 'Solved integration problems flawlessly, needs to review squeeze theorem limitations.',
    academicPerformance: 'excellent'
  },
  {
    id: 'progress-4',
    studentId: 'student-4',
    studentName: 'Priya Nair',
    classId: 'class-5',
    className: 'Limits & Continuous Functions',
    instructorId: 'instructor-2',
    instructorName: 'Eleanor Vance',
    evaluationDate: '2026-05-29',
    subject: 'Mathematics',
    score: 62,
    attendanceStatus: 'present',
    feedback: 'Priya had difficulty with limit proofs. Recommended a one-on-one session to clarify basic concepts of continuity.',
    academicPerformance: 'needs-improvement'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Class Enrolled',
    message: 'Welcome! You have been successfully enrolled in Eleanor Vance\'s "Limits & Continuous Functions" mathematics program.',
    timestamp: '2026-05-28T10:00:00Z',
    read: true,
    type: 'enrollment',
    channel: 'system'
  },
  {
    id: 'notif-2',
    title: 'Goal Met Alert!',
    message: 'Alex Rivera achieved >90% in "Vite & React Fullstack Deployment" program. Excellent progress!',
    timestamp: '2026-05-30T15:00:00Z',
    read: false,
    type: 'grade',
    channel: 'push'
  },
  {
    id: 'notif-3',
    title: 'Upcoming Session Reminder',
    message: 'Math Class is scheduled for Tuesday, 2026-06-02 at 10:00. Please prepare your homework on limits.',
    timestamp: '2026-05-31T00:30:00Z',
    read: false,
    type: 'reminder',
    channel: 'email'
  }
];

export const INITIAL_BACKUPS: BackupHistory[] = [
  {
    id: 'backup-1',
    timestamp: '2026-05-28T02:00:00Z',
    fileName: 'coaching_backup_20260528_auto.json',
    fileSize: '4.82 KB',
    recordCount: {
      students: 4,
      instructors: 3,
      classes: 5,
      progress: 4
    },
    status: 'success'
  }
];

// Local Storage Helper to load/save active states securely and completely
export function getSavedState<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (err) {
    console.error(`Error loading state standard local storage for key ${key}`, err);
  }
  return defaultValue;
}

export function saveState<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving standard local storage for key ${key}`, err);
  }
}

// Export tool implementation for external analytics (generates structured CSVs for user download)
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers
      .map(header => {
        let val = item[header];
        if (val === undefined || val === null) return '""';
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        // Escape quotes
        const formatted = String(val).replace(/"/g, '""');
        return `"${formatted}"`;
      })
      .join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
