/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount, ClassSchedule, ProgressRecord, AppNotification, BackupHistory } from './types';

// Initial seed data for the Coaching Center
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin-1',
    name: 'Anik Baidya',
    email: 'baidyaanik18@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150',
    phone: '+1 (555) 0100',
    joinedDate: '2024-05-20',
    username: 'anik',
    password: 'anik'
  },
  {
    id: 'instructor-1',
    name: 'Prof. Sarah Connor',
    email: 'sarah@prismcoaching.com',
    role: 'instructor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    phone: '+1 (555) 0121',
    joinedDate: '2024-05-21',
    specialization: 'Advanced Science & Physics',
    username: 'sarah',
    password: 'sarah'
  },
  {
    id: 'subadmin-1',
    name: 'Marcus Wright',
    email: 'marcus@prismcoaching.com',
    role: 'sub-admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 (555) 0122',
    joinedDate: '2024-05-22',
    username: 'marcus',
    password: 'marcus'
  },
  {
    id: 'student-1',
    name: 'John Connor',
    email: 'john@prismcoaching.com',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '+1 (555) 0123',
    joinedDate: '2024-05-23',
    username: 'john',
    password: 'john',
    assignedInstructorId: 'instructor-1'
  }
];

export const INITIAL_SCHEDULES: ClassSchedule[] = [];

export const INITIAL_PROGRESS: ProgressRecord[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Coaching Center Initialized',
    message: 'Welcome to your clean coaching portal administration space. Clear of simulated dummy records.',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'general',
    channel: 'system'
  }
];

export const INITIAL_BACKUPS: BackupHistory[] = [];

// Local Storage Helper to load/save active states securely and completely
export function getSavedState<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const deduplicated = parsed.filter(item => {
          if (item && typeof item === 'object' && 'id' in item) {
            const itemWithId = item as { id: string };
            if (seen.has(itemWithId.id)) {
              return false;
            }
            seen.add(itemWithId.id);
          }
          return true;
        });
        return deduplicated as unknown as T;
      }
      return parsed as T;
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
