/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, ClassSchedule, RegistrationRequest } from '../types';
import { UserPlus, Search, User, Filter, Trash2, Mail, Phone, Calendar, ArrowRight, BookOpen, Check, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EnrollmentManagerProps {
  currentUser: UserAccount;
  students: UserAccount[];
  instructors: UserAccount[];
  schedules: ClassSchedule[];
  onAddStudent: (student: Omit<UserAccount, 'id' | 'joinedDate'>) => void;
  onRemoveStudent: (id: string) => void;
  onEnrollStudentInClass: (studentId: string, classId: string) => void;
  registrationRequests: RegistrationRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}

export default function EnrollmentManager({
  currentUser,
  students,
  instructors,
  schedules,
  onAddStudent,
  onRemoveStudent,
  onEnrollStudentInClass,
  registrationRequests,
  onApproveRequest,
  onRejectRequest
}: EnrollmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<'all' | string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Student state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInstructorId, setNewInstructorId] = useState('');

  // Class enrollment state
  const [enrollmentStudentId, setEnrollmentStudentId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    onAddStudent({
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: 'student',
      assignedInstructorId: newInstructorId || undefined
    });

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewInstructorId('');
    setShowAddForm(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstructor = selectedInstructorId === 'all' || student.assignedInstructorId === selectedInstructorId;
    return matchesSearch && matchesInstructor;
  });

  const getInstructorName = (instructorId?: string) => {
    if (!instructorId) return 'Not Assigned';
    const found = instructors.find(i => i.id === instructorId);
    return found ? found.name : 'Unknown Instructor';
  };

  const getEnrolledClasses = (studentId: string) => {
    return schedules.filter(cl => cl.enrolledStudentIds.includes(studentId));
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-150/80 dark:border-white/5 p-5 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400">Total Enrolled</p>
          <p className="text-3xl font-serif text-slate-800 dark:text-white mt-1.5">{students.length}</p>
          <div className="mt-2 text-xs text-amber-500 font-semibold flex items-center gap-1">
            <span>All records permanently stored</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-150/80 dark:border-white/5 p-5 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400">No Primary Mentor Assigned</p>
          <p className="text-3xl font-serif text-slate-800 dark:text-white mt-1.5">
            {students.filter(s => !s.assignedInstructorId).length}
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-gray-500">Requires review by administrator</p>
        </div>

        <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-150/80 dark:border-white/5 p-5 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400">Average Courses / Student</p>
          <p className="text-3xl font-serif text-slate-800 dark:text-white mt-1.5">
            {students.length > 0
              ? (students.reduce((acc, s) => acc + getEnrolledClasses(s.id).length, 0) / students.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-gray-500">Diverse curricula across the center</p>
        </div>
      </div>

      {currentUser.role === 'admin' && (
        <div className="p-6 rounded-3xl border border-amber-500/25 bg-amber-500/[0.02] dark:bg-[#161618] dark:border-white/5 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
            <div>
              <h3 className="text-base font-serif italic text-amber-500 font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                Pending Fast Student Registration Requests ({registrationRequests.filter(r => r.status === 'pending').length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Review submitted applications from the public fast-registration portal. Accepting generates their profile and sends their username/password via simulated mail.
              </p>
            </div>
          </div>

          {registrationRequests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-gray-500 font-mono bg-slate-50/50 dark:bg-[#0F0F11]/50 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl select-none">
              No pending student registration tickets in queue. Use "Fast Student Registration" on the login screen to submit requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrationRequests.filter(r => r.status === 'pending').map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0F0F11] border border-slate-150/80 dark:border-white/5 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-gray-100 font-serif">{req.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">Submitted: {req.submittedDate}</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
                      <p className="flex items-center gap-2 bg-slate-50 dark:bg-[#161618] p-1.5 px-2 rounded-lg border dark:border-white/5">
                        <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{req.email}</span>
                      </p>
                      {req.phone && (
                        <p className="flex items-center gap-2 bg-slate-50 dark:bg-[#161618] p-1.5 px-2 rounded-lg border dark:border-white/5">
                          <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{req.phone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2 bg-slate-50 dark:bg-[#161618] p-1.5 px-2 rounded-lg border dark:border-white/5">
                        <User className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>Pre-assigned Mentor: <strong className="text-amber-500 font-semibold">{getInstructorName(req.assignedInstructorId)}</strong></span>
                      </p>

                      <div className="p-2.5 rounded-xl bg-orange-500/[0.02] border border-amber-500/10 mt-2 font-mono text-[10px] space-y-1 select-none">
                        <p className="font-bold text-amber-500 text-[9px] uppercase tracking-wider">Security Credentials Drafted:</p>
                        <div className="flex justify-between text-slate-500 dark:text-gray-400 border-t dark:border-white/5 pt-1">
                          <span>User: <strong className="text-slate-800 dark:text-gray-200">{req.username}</strong></span>
                          <span>Pass: <strong className="text-slate-800 dark:text-gray-200">{req.password}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-white/5 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 text-slate-500 transition rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Decline Request
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveRequest(req.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept & Enroll Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-150/80 dark:border-white/5 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif italic text-amber-500 font-bold tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Student Enrollment & Profiles
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5 font-sans">
              Archive records, modify primary instructors, or view courses specific to each student.
            </p>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl shadow-md font-bold text-xs flex items-center gap-2 transition active:scale-95 scroll-smooth"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddForm ? 'Hide Registration Form' : 'Register New Student'}
            </button>
          )}
        </div>

        {/* Dynamic Add Student Form */}
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
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Smith"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 1234"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Assign Advisor Mentor</label>
                  <select
                    value={newInstructorId}
                    onChange={e => setNewInstructorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">Unassigned</option>
                    {instructors.map(ins => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-amber-950 rounded-xl text-xs font-bold shadow transition"
                  >
                    Register Student Profile
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3.5 mb-5 max-w-4xl font-sans">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search students by name or email ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-white/5 dark:bg-[#0F0F11] rounded-xl text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedInstructorId}
              onChange={e => setSelectedInstructorId(e.target.value)}
              className="border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs bg-white dark:bg-[#0F0F11] text-slate-705 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Mentor Filter: All</option>
              {instructors.map(ins => (
                <option key={ins.id} value={ins.id}>
                  Mentor: {ins.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table/Grid */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Student Profile</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Contact Info</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Assigned Advisor</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Active Enrollment Courses</th>
                {currentUser.role === 'admin' && (
                  <th className="p-4 text-xs font-bold text-slate-550 dark:text-slate-400 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.role === 'admin' ? 5 : 4} className="p-10 text-center text-slate-400 font-mono">
                    No student registrations found matching filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const enrolled = getEnrolledClasses(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/5 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: {student.id}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 text-slate-650 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {student.email}
                          </p>
                          {student.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {student.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-1.5 font-mono text-[10px]">
                            <Calendar className="w-3 h-3 text-slate-401" /> Registered: {student.joinedDate}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 bg-amber-550/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full font-bold">
                          <User className="w-3 h-3" />
                          {getInstructorName(student.assignedInstructorId)}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {enrolled.map(cl => (
                            <span
                              key={cl.id}
                              className="inline-flex items-center gap-1 border border-slate-150 bg-white dark:bg-[#161618] dark:border-white/5 text-slate-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] h-fit"
                            >
                              <BookOpen className="w-2.5 h-2.5 text-amber-500" />
                              {cl.subject}
                            </span>
                          ))}
                          <button
                            onClick={() => setEnrollmentStudentId(student.id)}
                            className="text-[10px] font-bold text-amber-500 hover:underline px-1.5 py-0.5"
                          >
                            + Add class
                          </button>
                        </div>

                        {/* Interactive Assign Classes Dropdown popover */}
                        {enrollmentStudentId === student.id && (
                          <div className="absolute z-10 mt-2 bg-white dark:bg-[#0F0F11] border border-slate-200 dark:border-white/5 p-3 rounded-xl shadow-lg w-52 max-h-48 overflow-y-auto">
                            <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-mono border-b dark:border-white/5 pb-1">
                              <span>Choose Course:</span>
                              <button onClick={() => setEnrollmentStudentId(null)} className="text-rose-500 hover:underline">Close</button>
                            </div>
                            {schedules
                              .filter(cl => !cl.enrolledStudentIds.includes(student.id))
                              .map(cl => (
                                <button
                                  key={cl.id}
                                  onClick={() => {
                                    onEnrollStudentInClass(student.id, cl.id);
                                    setEnrollmentStudentId(null);
                                  }}
                                  className="w-full text-left py-1 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10.5px] text-slate-755 dark:text-slate-350 truncate block"
                                >
                                  {cl.subject}: {cl.title}
                                </button>
                              ))}
                            {schedules.filter(cl => !cl.enrolledStudentIds.includes(student.id)).length === 0 && (
                              <p className="p-1 pt-2 text-[10px] text-slate-400 text-center font-mono">Enrolled in everything</p>
                            )}
                          </div>
                        )}
                      </td>

                      {currentUser.role === 'admin' && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onRemoveStudent(student.id)}
                            className="p-1.5 hover:bg-rose-50/10 dark:hover:bg-rose-950/20 text-slate-444 hover:text-rose-500 rounded-lg transition"
                            title="Remove Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
