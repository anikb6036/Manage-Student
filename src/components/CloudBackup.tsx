/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UserAccount, ClassSchedule, ProgressRecord, BackupHistory } from '../types';
import { Cloud, CheckCircle, AlertCircle, RefreshCw, UploadCloud, FolderUp, Download, Eye, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CloudBackupProps {
  students: UserAccount[];
  instructors: UserAccount[];
  schedules: ClassSchedule[];
  progressRecords: ProgressRecord[];
  backupHistory: BackupHistory[];
  onTriggerBackup: () => void;
  onRestoreState: (state: { students: UserAccount[]; schedules: ClassSchedule[]; progress: ProgressRecord[] }) => void;
}

export default function CloudBackup({
  students,
  instructors,
  schedules,
  progressRecords,
  backupHistory,
  onTriggerBackup,
  onRestoreState
}: CloudBackupProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger simulated secure cloud synchronization
  const handleBackupNow = () => {
    setIsSyncing(true);
    setSyncStatus("Initial handshake with secure vault servers...");
    
    setTimeout(() => {
      setSyncStatus("Serializing database states (AES-256 encryption overhead)...");
    }, 1000);

    setTimeout(() => {
      setSyncStatus("Pushing chunk records to replica buckets (us-east, asia-south)...");
    }, 2200);

    setTimeout(() => {
      onTriggerBackup();
      setIsSyncing(false);
      setSyncStatus(null);
    }, 3400);
  };

  // Drag Handlers for restoration
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Load and parsed state files
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        // Assert schema verification
        if (parsed.students && parsed.schedules && parsed.progress) {
          onRestoreState({
            students: parsed.students,
            schedules: parsed.schedules,
            progress: parsed.progress
          });
          setRestoreFeedback({
            type: 'success',
            message: `Cloud backup restored successfully. Loaded ${parsed.students.length} students, ${parsed.schedules.length} schedules, ${parsed.progress.length} evaluations.`
          });
        } else {
          setRestoreFeedback({
            type: 'error',
            message: 'Schema validation error. Ensure the backup file includes students, schedules, & progress registries.'
          });
        }
      } catch (e) {
        setRestoreFeedback({
          type: 'error',
          message: 'Error decoding selected JSON backup file. File might be corrupted.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Helper trigger downloadable active backup file directly
  const downloadBackupJSON = () => {
    const payload = {
      students,
      schedules,
      progress: progressRecords,
      timestamp: new Date().toISOString(),
      center: 'Coaching Center Primary Node'
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coaching_backup_${new Date().toISOString().slice(0, 10)}_active.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 shadow-sm p-6 md:p-8">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Cloud className="w-5 h-5 text-amber-500" />
            Cloud Database Backups & Redundancy
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Synchronize active lesson databases with secure cloud replica targets, download standalone snapshots, or revert the system past states.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Main Action syncing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0F0F11]/50 dark:bg-[#0F0F11] border border-slate-200 dark:border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2 select-none font-serif">
                  Snapshot synchronization
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Safely backing up compiles exactly {students.length} students, {instructors.length} instructors, {schedules.length} classes, and {progressRecords.length} evaluations.
                </p>
              </div>

              {/* Loader */}
              {isSyncing && (
                <div className="my-5 p-4 bg-black text-amber-500 font-mono text-[10.5px] rounded-xl border border-white/5 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-550 dark:text-amber-500 flex-shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleBackupNow}
                  disabled={isSyncing}
                  className="px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-955 rounded-xl text-xs font-bold shadow hover:shadow-amber-500/10 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                >
                  Create Secure Cloud Backup
                </button>
                <button
                  type="button"
                  onClick={downloadBackupJSON}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-[#0A0A0B] dark:border-white/5 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Standalone Snapshot (.json)
                </button>
              </div>
            </div>

            {/* Past cloud audit logs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-450 dark:text-zinc-400 uppercase tracking-widest font-mono">Simulated Backup Sync History Log</h4>
              <div className="overflow-x-auto border border-slate-100 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-500 dark:text-zinc-400 select-none font-mono">
                    <tr>
                      <th className="p-3">Filename</th>
                      <th className="p-3">Sync Date</th>
                      <th className="p-3">File Size</th>
                      <th className="p-3">Total Records</th>
                      <th className="p-3 text-right">Vault Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {backupHistory.map(bak => (
                      <tr key={bak.id} className="text-slate-650 dark:text-zinc-400 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                        <td className="p-3 font-mono font-medium text-slate-855 dark:text-zinc-300">{bak.fileName}</td>
                        <td className="p-3">{new Date(bak.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-mono">{bak.fileSize}</td>
                        <td className="p-3 text-slate-500 dark:text-zinc-500">
                          {bak.recordCount.students} stu, {bak.recordCount.classes} cls
                        </td>
                        <td className="p-3 text-right text-emerald-500 font-semibold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="w-3.5 h-3.5" /> SECURE
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Standalone Restoration Upload Box - Supporting drag & drop AND click selection */}
          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white select-none mb-3 font-serif">
              Restore System Backup Snapshots
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed pr-2">
              Have database JSON snapshots generated priorly? Drop the snapshot or click selection below to instantly populate student schedules, evaluations, progress checklists, and assignments back to live servers.
            </p>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] select-none ${
                dragActive
                  ? 'border-amber-500 bg-amber-500/[0.05] dark:bg-amber-500/[0.02]'
                  : 'border-slate-200 dark:border-white/5 hover:border-amber-500/50 dark:hover:border-amber-500/30 bg-slate-50/40 dark:bg-[#0A0A0B]/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-amber-500 mb-3 group-hover:scale-110 transition animate-bounce" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-250">
                Drag & Drop database backup here
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                or click manual file system search (.json)
              </p>
            </div>

            {/* Notification Feedback block regarding restorations */}
            {restoreFeedback && (
              <div className={`mt-4 p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                restoreFeedback.type === 'success'
                  ? 'bg-emerald-50/30 border-emerald-150 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400'
                  : 'bg-rose-50/30 border-rose-150 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-450'
              }`}>
                {restoreFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                )}
                <div>
                  <p className="font-bold">{restoreFeedback.type === 'success' ? 'Validation Succeeds' : 'Validation Error'}</p>
                  <p className="mt-0.5">{restoreFeedback.message}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-slate-50 dark:bg-[#0A0A0B] rounded-xl border border-slate-105 dark:border-white/5 text-[10px] text-slate-550 dark:text-zinc-400 leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-amber-500 mb-1 text-[11px] select-none">⚠️ High-Redundancy Notice:</p>
              Applying restorations overwrites current memory registers. To prevent local conflicts, always create a Standalone Snapshot (.json) before attempting a restore.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
