/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, ClassSchedule } from '../types';
import { Calendar, Clock, MapPin, Users, Plus, CheckCircle, Ban, Filter, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleManagerProps {
  currentUser: UserAccount;
  schedules: ClassSchedule[];
  instructors: UserAccount[];
  students: UserAccount[];
  onAddClass: (newClass: Omit<ClassSchedule, 'id' | 'enrolledStudentIds'>) => void;
  onUpdateStatus: (classId: string, status: 'scheduled' | 'completed' | 'cancelled') => void;
  onSelfEnroll: (classId: string) => void;
}

export default function ScheduleManager({
  currentUser,
  schedules,
  instructors,
  students,
  onAddClass,
  onUpdateStatus,
  onSelfEnroll
}: ScheduleManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | string>('all');
  const [instructorFilter, setInstructorFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Class Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [instructorId, setInstructorId] = useState('');
  const [date, setDate] = useState('2026-06-01');
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState('90');
  const [maxStudents, setMaxStudents] = useState('10');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructorId || !location) return;

    const chosenInstructor = instructors.find(i => i.id === instructorId);
    if (!chosenInstructor) return;

    onAddClass({
      title,
      subject,
      instructorId,
      instructorName: chosenInstructor.name,
      date,
      time,
      duration: parseInt(duration) || 60,
      maxStudents: parseInt(maxStudents) || 10,
      location,
      status: 'scheduled'
    });

    // Reset Form
    setTitle('');
    setInstructorId('');
    setLocation('');
    setShowAddForm(false);
  };

  const filteredSchedules = schedules.filter(cl => {
    const matchesSearch = cl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cl.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || cl.subject === subjectFilter;
    const matchesInstructor = instructorFilter === 'all' || cl.instructorId === instructorFilter;
    const matchesStatus = statusFilter === 'all' || cl.status === statusFilter;

    // Role specific display constraints (Students see only classes they enroll in IF we want to, OR let them see all upcoming to sign up!)
    // Let's show all scheduled upcoming classes so students can find and register for other open classes, but highlight enrolled ones.
    return matchesSearch && matchesSubject && matchesInstructor && matchesStatus;
  });

  const isEnrolled = (cl: ClassSchedule) => {
    return cl.enrolledStudentIds.includes(currentUser.id);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif italic text-amber-500 font-bold tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Class Scheduling & Timekeeping
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              Set schedules, coordinate instructor workloads, or reserve online/offline study spaces.
            </p>
          </div>

          {['admin', 'sub-admin', 'instructor'].includes(currentUser.role) && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (currentUser.role === 'instructor') {
                  setInstructorId(currentUser.id);
                }
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl shadow-md font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'Close Scheduler Creator' : 'Schedule New Live Class'}
            </button>
          )}
        </div>

        {/* Dynamic Class Creator Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <form
                onSubmit={handleSubmit}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F0F11] border border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
              >
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Einstein Theory of Relativity"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Course Domain / Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Coding">Coding</option>
                    <option value="Logic">Logic</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Lecturer / Instructor</label>
                  <select
                    value={instructorId}
                    onChange={e => setInstructorId(e.target.value)}
                    required
                    disabled={currentUser.role === 'instructor'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map(ins => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name} ({ins.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Duration (min)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Max Students Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxStudents}
                    onChange={e => setMaxStudents(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Location (Room or Online link)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 3B, Room 202 or Zoom ID"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-2 flex justify-end gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl text-xs font-bold shadow transition cursor-pointer"
                  >
                    Publish to Classroom Calendar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtering Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search schedule subjects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/5 dark:bg-[#0A0A0B] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-white/5 rounded-xl px-2.5 bg-white dark:bg-[#0A0A0B]">
            <Filter className="w-3 h-3 text-zinc-500" />
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="w-full py-2 text-xs bg-transparent text-slate-705 dark:text-zinc-300 focus:outline-none border-0"
            >
              <option value="all">Subject: All</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Coding">Coding</option>
              <option value="Logic">Logic</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-white/5 rounded-xl px-2.5 bg-white dark:bg-[#0A0A0B]">
            <User className="w-3 h-3 text-zinc-500" />
            <select
              value={instructorFilter}
              onChange={e => setInstructorFilter(e.target.value)}
              className="w-full py-2 text-xs bg-transparent text-slate-705 dark:text-zinc-300 focus:outline-none border-0"
            >
              <option value="all">Lecturer: All</option>
              {instructors.map(ins => (
                <option key={ins.id} value={ins.id}>
                  {ins.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-white/5 rounded-xl px-2.5 bg-white dark:bg-[#0A0A0B]">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 text-xs bg-transparent text-slate-705 dark:text-zinc-300 focus:outline-none border-0"
            >
              <option value="all">Any Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center">
              <p className="text-xs text-slate-400 font-mono">No active classes found match parameters.</p>
            </div>
          ) : (
            filteredSchedules.map(cl => {
              const fullCapacity = cl.enrolledStudentIds.length >= cl.maxStudents;
              const isUserEnrolledVal = isEnrolled(cl);
              return (
                <div
                  key={cl.id}
                  className={`rounded-2xl border transition relative flex flex-col justify-between overflow-hidden shadow-sm ${
                    isUserEnrolledVal
                      ? 'border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.03] bg-white dark:bg-[#161618]'
                      : 'border-slate-150/85 dark:border-white/5 bg-white dark:bg-[#161618]'
                  }`}
                >
                  <div className="p-5 flex-1 select-none">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-3 text-xs font-mono">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-zinc-300">
                        {cl.subject}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          cl.status === 'scheduled'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            : cl.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450'
                        }`}
                      >
                        {cl.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight hover:text-amber-550 dark:hover:text-amber-500 cursor-pointer transition">
                      {cl.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-401 mt-1 font-semibold">
                      by {cl.instructorName}
                    </p>

                    {/* Timeline information */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-zinc-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{cl.date}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{cl.time} ({cl.duration} min duration)</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{cl.location}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>
                          Enrolled: {cl.enrolledStudentIds.length}/{cl.maxStudents} students{' '}
                          {fullCapacity && <span className="text-amber-500 font-bold ml-1 font-mono">MAXED</span>}
                        </span>
                      </p>
                    </div>

                    {isUserEnrolledVal && (
                      <div className="absolute top-0 right-0 p-1.5 bg-amber-500 text-amber-950 rounded-bl-xl shadow-sm">
                        <span className="text-[9px] font-mono font-extrabold px-1 select-none">ENROLLED</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar of the individual Class card */}
                  <div className="p-4 bg-slate-50/50 dark:bg-[#0F0F11]/30 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2 justify-between">
                    {cl.status === 'scheduled' && (
                      <>
                        {/* Administrator or Assigned Instructor controls */}
                        {((['admin', 'sub-admin'].includes(currentUser.role)) || (currentUser.role === 'instructor' && currentUser.id === cl.instructorId)) ? (
                          <div className="flex gap-2 w-full justify-end font-sans">
                            <button
                              onClick={() => onUpdateStatus(cl.id, 'completed')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-lg transition cursor-pointer"
                            >
                              ✓ Complete Session
                            </button>
                            <button
                              onClick={() => onUpdateStatus(cl.id, 'cancelled')}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-55 hover:bg-rose-50/10 text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-white/5 dark:bg-[#0A0A0B] rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        ) : currentUser.role === 'student' ? (
                          <button
                            onClick={() => onSelfEnroll(cl.id)}
                            disabled={isUserEnrolledVal || fullCapacity}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer ${
                              isUserEnrolledVal
                                ? 'bg-slate-100 dark:bg-white/5 text-zinc-500 cursor-default shadow-none border border-slate-200 dark:border-white/5'
                                : fullCapacity
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-[#09090B] dark:border dark:border-white/5'
                                  : 'bg-amber-500 hover:bg-amber-600 text-amber-950 active:scale-95'
                            }`}
                          >
                            {isUserEnrolledVal ? 'Registered & Prepared' : fullCapacity ? 'Class Full' : 'Self-Enroll / Join Class'}
                          </button>
                        ) : null}
                      </>
                    )}

                    {cl.status !== 'scheduled' && (
                      <p className="text-[10px] text-slate-400 italic text-center w-full">
                        This session is {cl.status}. Action disabled.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
