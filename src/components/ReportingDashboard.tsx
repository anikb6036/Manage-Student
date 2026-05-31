/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, ClassSchedule, ProgressRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Download, FileSpreadsheet, BarChart2, TrendingUp, Star, Users } from 'lucide-react';
import { exportToCSV } from '../utils';

interface ReportingDashboardProps {
  students: UserAccount[];
  schedules: ClassSchedule[];
  progressRecords: ProgressRecord[];
}

export default function ReportingDashboard({
  students,
  schedules,
  progressRecords
}: ReportingDashboardProps) {
  const [exportTarget, setExportTarget] = useState<'students' | 'schedules' | 'progress'>('students');

  // 1. Chart Data: Subject Average Scores
  const subjectGroups = progressRecords.reduce((acc: { [key: string]: number[] }, rec) => {
    if (!acc[rec.subject]) acc[rec.subject] = [];
    acc[rec.subject].push(rec.score);
    return acc;
  }, {});

  const subjectChartData = Object.keys(subjectGroups).map(sub => {
    const scores = subjectGroups[sub];
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return {
      name: sub,
      "Average Score": Math.round(avg),
      "Assessments Count": scores.length
    };
  });

  // 2. Chart Data: Enrollment Counts by Subject
  const enrollmentSubjectCounts = schedules.reduce((acc: { [key: string]: number }, cl) => {
    cl.enrolledStudentIds.forEach(() => {
      acc[cl.subject] = (acc[cl.subject] || 0) + 1;
    });
    return acc;
  }, {});

  const enrollmentChartData = Object.keys(enrollmentSubjectCounts).map(sub => ({
    name: sub,
    "Enrolled Count": enrollmentSubjectCounts[sub]
  }));

  // 3. Chart Data: Student Progress Timeline
  const timelineData = [...progressRecords]
    .sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime())
    .map(rec => ({
      date: rec.evaluationDate,
      score: rec.score,
      student: rec.studentName,
      subject: rec.subject
    }));

  const handleExport = () => {
    if (exportTarget === 'students') {
      const exportData = students.map(({ id, name, email, phone, joinedDate, assignedInstructorId }) => ({
        id, name, email, phone, joinedDate, assignedInstructorId
      }));
      exportToCSV(exportData, 'coaching_center_students_export');
    } else if (exportTarget === 'schedules') {
      const exportData = schedules.map(({ id, title, subject, instructorName, date, time, duration, location, status }) => ({
        id, title, subject, instructorName, date, time, duration, location, status
      }));
      exportToCSV(exportData, 'coaching_center_schedules_export');
    } else if (exportTarget === 'progress') {
      const exportData = progressRecords.map(({ id, studentName, className, subject, score, attendanceStatus, academicPerformance, feedback, evaluationDate }) => ({
        id, studentName, className, subject, score, attendanceStatus, academicPerformance, feedback, evaluationDate
      }));
      exportToCSV(exportData, 'coaching_center_academic_records_export');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Analytics Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject KPI Scoring */}
        <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-serif italic text-amber-500 font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-500" />
                Instructional Domains Academic Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Average grades scored across distinct student sectors</p>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#0F0F11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="Average Score" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Distribution */}
        <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-serif italic text-white dark:text-gray-200 font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Student Enrollment Concentration
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Ratio distribution of seats registered by courses</p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0F0F11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="Enrolled Count" fill="#9ca3af" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Progress Chart */}
        <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-serif italic text-amber-500 font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Academic Progression Index (Timeline)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Continuous tracking of lesson evaluations, showing grade trends over dates</p>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#0F0F11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV Export Desk */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#161618] to-black text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden border border-white/5 relative shadow-md">
        <div className="absolute right-0 bottom-0 opacity-5 rotate-12 pointer-events-none">
          <FileSpreadsheet className="w-60 h-60 text-amber-500" />
        </div>
        
        <div className="space-y-1.5 z-10">
          <h3 className="text-lg font-serif italic text-amber-500 font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            Performance & Census Analytics Transcripts Export
          </h3>
          <p className="text-xs text-slate-300 dark:text-gray-400 pr-4 leading-relaxed max-w-2xl">
            Audit coaching performance externally. Pick the target module sector from the list below to instantaneously save structured Spreadsheet layouts with fully compiled student, class timings, and feedback logs.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-10 font-sans">
          <select
            value={exportTarget}
            onChange={e => setExportTarget(e.target.value as any)}
            className="bg-slate-800 dark:bg-[#0F0F11] text-white dark:text-gray-300 border border-slate-700 dark:border-white/5 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="students">Student Registry Directory</option>
            <option value="schedules">Live Classes Timetable</option>
            <option value="progress">Academic Evaluative Records</option>
          </select>
          <button
            onClick={handleExport}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 whitespace-nowrap text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
