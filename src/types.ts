/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'sub-admin' | 'instructor' | 'student';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  joinedDate: string;
  specialization?: string; // For instructors
  assignedInstructorId?: string; // For students
  username?: string; // Optional username for credentials login
  password?: string; // Optional password for credentials login
  fatherName?: string;
  fatherPhone?: string;
  address?: string;
  lastQualification?: string;
  gender?: string;
  dob?: string;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedInstructorId?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  username: string; // Auto-generated username
  password: string; // Auto-generated password
  fatherName?: string;
  fatherPhone?: string;
  address?: string;
  lastQualification?: string;
  gender?: string;
  dob?: string;
  avatarUrl?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
}


export interface ClassSchedule {
  id: string;
  title: string;
  subject: string;
  instructorId: string;
  instructorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  maxStudents: number;
  enrolledStudentIds: string[];
  location: string; // e.g. "Room 101", "Online - Zoom"
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  instructorId: string;
  instructorName: string;
  evaluationDate: string; // YYYY-MM-DD
  subject: string;
  score: number; // Percentage e.g. 85
  attendanceStatus: 'present' | 'absent' | 'excused';
  feedback: string;
  academicPerformance: 'excellent' | 'good' | 'average' | 'needs-improvement';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO String
  read: boolean;
  type: 'general' | 'reminder' | 'grade' | 'enrollment';
  channel: 'push' | 'email' | 'system';
}

export interface BackupHistory {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  recordCount: {
    students: number;
    instructors: number;
    classes: number;
    progress: number;
  };
  status: 'success' | 'failed';
}
