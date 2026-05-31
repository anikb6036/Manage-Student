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
    username: 'anik_admin',
    password: 'Password123'
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
