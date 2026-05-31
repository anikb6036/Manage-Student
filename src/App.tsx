/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserAccount, ClassSchedule, ProgressRecord, AppNotification, BackupHistory, RegistrationRequest, SimulatedEmail } from './types';
import {
  INITIAL_USERS,
  INITIAL_SCHEDULES,
  INITIAL_PROGRESS,
  INITIAL_NOTIFICATIONS,
  INITIAL_BACKUPS,
  getSavedState,
  saveState
} from './utils';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import NotificationCenter from './components/NotificationCenter';
import EnrollmentManager from './components/EnrollmentManager';
import ScheduleManager from './components/ScheduleManager';
import ProgressTracker from './components/ProgressTracker';
import ReportingDashboard from './components/ReportingDashboard';
import CloudBackup from './components/CloudBackup';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  BarChart3,
  CloudLightning,
  LogOut,
  Bell,
  Sun,
  Moon,
  Clock,
  Briefcase,
  User,
  Activity,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Auto-detect and perform a one-time clean-up migration of old dummy/simulation storage data
if (typeof window !== 'undefined' && !localStorage.getItem('db-migrated-to-real-v2')) {
  localStorage.removeItem('db-users');
  localStorage.removeItem('db-schedules');
  localStorage.removeItem('db-progress');
  localStorage.removeItem('db-notifications');
  localStorage.removeItem('db-backups');
  localStorage.removeItem('db-registration-requests');
  localStorage.removeItem('db-simulated-emails');
  localStorage.removeItem('active-user');
  localStorage.setItem('db-migrated-to-real-v2', 'true');
}

function AppContent() {
  const { isDark, toggleTheme } = useTheme();

  // Root states synchronized with LocalStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getSavedState<UserAccount | null>('active-user', null);
  });
  
  const [users, setUsers] = useState<UserAccount[]>(() => {
    return getSavedState<UserAccount[]>('db-users', INITIAL_USERS);
  });

  const [schedules, setSchedules] = useState<ClassSchedule[]>(() => {
    return getSavedState<ClassSchedule[]>('db-schedules', INITIAL_SCHEDULES);
  });

  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>(() => {
    return getSavedState<ProgressRecord[]>('db-progress', INITIAL_PROGRESS);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return getSavedState<AppNotification[]>('db-notifications', INITIAL_NOTIFICATIONS);
  });

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>(() => {
    return getSavedState<BackupHistory[]>('db-backups', INITIAL_BACKUPS);
  });

  // Pending admission registration requests state
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    return getSavedState<RegistrationRequest[]>('db-registration-requests', []);
  });

  // Simulated student mailbox communications
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>(() => {
    return getSavedState<SimulatedEmail[]>('db-simulated-emails', []);
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'enrollments' | 'schedule' | 'progress' | 'reports' | 'backup'>('dashboard');
  
  // Onboarding screens and fast registration workflow states
  const [onboardingTab, setOnboardingTab] = useState<'fastReg' | 'authLogin' | 'sandboxCreate'>('fastReg');
  const [fastName, setFastName] = useState('');
  const [fastEmail, setFastEmail] = useState('');
  const [fastPhone, setFastPhone] = useState('');
  const [fastInstructorId, setFastInstructorId] = useState('');
  const [fastRegSuccess, setFastRegSuccess] = useState<RegistrationRequest | null>(null);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [mailSearchEmail, setMailSearchEmail] = useState('');
  const [activeMailboxEmail, setActiveMailboxEmail] = useState<string | null>(null);
  const [showMailbox, setShowMailbox] = useState(false);
  const [selectedMail, setSelectedMail] = useState<SimulatedEmail | null>(null);

  // Registration forms state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'instructor' | 'student'>('student');

  // Push notifications toast overlay state
  const [toastAlert, setToastAlert] = useState<AppNotification | null>(null);

  // Synchronizers
  useEffect(() => {
    saveState('active-user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveState('db-users', users);
  }, [users]);

  useEffect(() => {
    saveState('db-schedules', schedules);
  }, [schedules]);

  useEffect(() => {
    saveState('db-progress', progressRecords);
  }, [progressRecords]);

  useEffect(() => {
    saveState('db-notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveState('db-backups', backupHistory);
  }, [backupHistory]);

  useEffect(() => {
    saveState('db-registration-requests', registrationRequests);
  }, [registrationRequests]);

  useEffect(() => {
    saveState('db-simulated-emails', simulatedEmails);
  }, [simulatedEmails]);


  // Push Notice trigger helper
  const triggerToast = (n: AppNotification) => {
    setToastAlert(n);
    setTimeout(() => {
      setToastAlert(null);
    }, 4500);
  };

  // State modification Handlers
  const handleAddStudent = (studentData: Omit<UserAccount, 'id' | 'joinedDate'>) => {
    const newStudent: UserAccount = {
      ...studentData,
      id: `student-${Date.now()}`,
      joinedDate: new Date().toLocaleDateString('en-US')
    };
    setUsers(prev => [...prev, newStudent]);

    // System Notification Action
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Student Account Registered',
      message: `Successful registration folder instantiated for ${newStudent.name}. Profile ready for academic classes scheduling.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'enrollment',
      channel: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleRemoveStudent = (studentId: string) => {
    setUsers(prev => prev.filter(u => u.id !== studentId));
    // Remove student enrollment from other schedules
    setSchedules(prev => prev.map(s => ({
      ...s,
      enrolledStudentIds: s.enrolledStudentIds.filter(id => id !== studentId)
    })));
  };

  const handleEnrollStudentInClass = (studentId: string, classId: string) => {
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    setSchedules(prev => prev.map(cl => {
      if (cl.id === classId) {
        if (cl.enrolledStudentIds.includes(studentId)) return cl;
        return {
          ...cl,
          enrolledStudentIds: [...cl.enrolledStudentIds, studentId]
        };
      }
      return cl;
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Student Added to Class Roll',
      message: `${student.name} is now registered in session. Syllabus curriculum synchronized correctly.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'enrollment',
      channel: 'push'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleAddClass = (classData: Omit<ClassSchedule, 'id' | 'enrolledStudentIds'>) => {
    const newClass: ClassSchedule = {
      ...classData,
      id: `class-${Date.now()}`,
      enrolledStudentIds: []
    };
    setSchedules(prev => [...prev, newClass]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Lesson Schedule Live',
      message: `"${newClass.title}" (${newClass.subject}) added to active syllabus by ${newClass.instructorName}. Reserve slots now.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'general',
      channel: 'push'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleUpdateClassStatus = (classId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    setSchedules(prev => prev.map(cl => {
      if (cl.id === classId) {
        return { ...cl, status };
      }
      return cl;
    }));

    // Raise real notification trigger on completes
    if (status === 'completed' || status === 'cancelled') {
      const cls = schedules.find(c => c.id === classId);
      if (cls) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: `Class Session ${status.toUpperCase()}`,
          message: `The session "${cls.title}" was updated to ${status}. All attendance indices saved.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'general',
          channel: 'system'
        };
        setNotifications(prev => [notif, ...prev]);
        triggerToast(notif);
      }
    }
  };

  const handleSelfEnroll = (classId: string) => {
    if (!currentUser) return;
    setSchedules(prev => prev.map(cl => {
      if (cl.id === classId) {
        if (cl.enrolledStudentIds.includes(currentUser.id)) return cl;
        return {
          ...cl,
          enrolledStudentIds: [...cl.enrolledStudentIds, currentUser.id]
        };
      }
      return cl;
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Self-Enrollment Approved',
      message: `You successfully self-registered into the course session. Timetable logged!`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'enrollment',
      channel: 'email'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleAddProgressRecord = (recordData: Omit<ProgressRecord, 'id' | 'evaluationDate' | 'instructorId' | 'instructorName'>) => {
    const newRecord: ProgressRecord = {
      ...recordData,
      id: `progress-${Date.now()}`,
      evaluationDate: new Date().toISOString().slice(0, 10),
      instructorId: currentUser?.id || 'admin-1',
      instructorName: currentUser?.name || 'Center Administrator'
    };
    setProgressRecords(prev => [newRecord, ...prev]);

    // Send push trigger immediately
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Academic Score Evaluated',
      message: `Evaluated score of ${newRecord.score}% added for ${newRecord.studentName} in "${newRecord.className}".`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'grade',
      channel: 'push'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleTriggerBackup = () => {
    const timestamp = new Date().toISOString();
    const newBackup: BackupHistory = {
      id: `backup-${Date.now()}`,
      timestamp,
      fileName: `coaching_backup_${timestamp.slice(0, 10).replace(/-/g, '')}_manual.json`,
      fileSize: `${(Math.random() * 2 + 3).toFixed(2)} KB`,
      recordCount: {
        students: users.filter(u => u.role === 'student').length,
        instructors: users.filter(u => u.role === 'instructor').length,
        classes: schedules.length,
        progress: progressRecords.length
      },
      status: 'success'
    };
    setBackupHistory(prev => [newBackup, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Durable Cloud Backup Complete',
      message: 'Secure cloud databases backup succeeded. All active academic ledger databases synced safely in external bucket.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'general',
      channel: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleRestoreState = (newState: { students: UserAccount[]; schedules: ClassSchedule[]; progress: ProgressRecord[] }) => {
    setUsers(prev => {
      // Retain current administrators and instructors, pull only students
      return [
        ...prev.filter(u => u.role !== 'student'),
        ...newState.students
      ];
    });
    setSchedules(newState.schedules);
    setProgressRecords(newState.progress);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Cloud State Reinstated',
      message: 'Successfully validated and restored student databases registry. Registers synchronized.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'general',
      channel: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);
  };

  const handleTriggerTestNotification = (type: 'reminder' | 'grade' | 'enrollment') => {
    let title = 'Test Warning';
    let message = 'This is testing simulated events pipeline.';
    if (type === 'reminder') {
      title = 'Automated Reminder Dispatched';
      message = 'Simulated cron system transmitted WhatsApp and email reminder transcripts to students.';
    } else if (type === 'grade') {
      title = 'Dynamic Goal Progress Alert';
      message = 'Jordan achieved high scores. Automated milestone alert and certificate transcript created.';
    } else if (type === 'enrollment') {
      title = 'Student Admitted';
      message = 'Administrative registry updated student enrollments folder in high-perf fileserver.';
    }

    const testNotif: AppNotification = {
      id: `test-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      channel: type === 'reminder' ? 'email' : 'push'
    };
    setNotifications(prev => [testNotif, ...prev]);
    triggerToast(testNotif);
  };

  const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    const newAccount: UserAccount = {
      id: `${regRole}-${Date.now()}`,
      name: regName,
      email: regEmail,
      phone: regPhone || undefined,
      role: regRole,
      joinedDate: new Date().toLocaleDateString('en-US'),
      specialization: regRole === 'instructor' ? 'General Academic Advisor' : undefined
    };

    setUsers(prev => [...prev, newAccount]);
    setCurrentUser(newAccount);

    // Reset inputs
    setRegName('');
    setRegEmail('');
    setRegPhone('');
  };

  const handleCreateRegistrationRequest = (name: string, email: string, phone?: string, instructorId?: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    
    // Auto-generate credentials
    const usernamePrefix = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const username = `${usernamePrefix}_${randomNum}`;
    
    const titleName = cleanName.split(' ')[0] || 'Student';
    const password = `Prism@${titleName}${randomNum}`;

    const newRequest: RegistrationRequest = {
      id: `req-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || undefined,
      status: 'pending',
      submittedDate: new Date().toLocaleDateString('en-US'),
      assignedInstructorId: instructorId || undefined,
      username,
      password
    };

    setRegistrationRequests(prev => [newRequest, ...prev]);

    // Send a system event notice to the logs
    const notif: AppNotification = {
      id: `notif-req-${Date.now()}`,
      title: 'Admission Request Pending',
      message: `${cleanName} registered via fast student registration. Administrator approval required to release credentials.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'enrollment',
      channel: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return newRequest;
  };

  const handleApproveRegistration = (requestId: string) => {
    setRegistrationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        // Find if already approved to prevent key conflicts
        if (r.status === 'approved') return r;
        
        // Add user profile
        const newStudent: UserAccount = {
          id: `student-${Date.now()}`,
          name: r.name,
          email: r.email,
          phone: r.phone,
          role: 'student',
          joinedDate: new Date().toLocaleDateString('en-US'),
          assignedInstructorId: r.assignedInstructorId,
          username: r.username,
          password: r.password,
          avatarUrl: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1506794778202-cad84cf45f1d', '1517841905240-472988babdf9', '1492562080023-ab3db95bfbce'][Math.floor(Math.random() * 4)]}?w=150`
        };

        setUsers(u => [...u, newStudent]);

        // Send simulated email
        const newEmail: SimulatedEmail = {
          id: `mail-${Date.now()}`,
          to: r.email,
          from: 'admissions@prismcoaching.edu',
          subject: 'PrismCoaching Enrollment Accepted! - Your Credentials Enclosed',
          body: `Dear ${r.name},\n\nWe are absolutely delighted to inform you that your Enrollment & Fast Student Registration Request has been reviewed and APPROVED by our Administration panel!\n\nYour profile has been fully instantiated into our student information database. You can now log in using the newly auto-generated security credentials enclosed below:\n\n-----------------------------\nUSERNAME: ${r.username}\nPASSWORD: ${r.password}\n-----------------------------\n\nPlease keep these credentials secure. Once signed in, you will be able to enroll into classes, audit tutor feedback records, and track your ongoing learning achievements.\n\nBest regards,\nAnik Baidya,\nHead Administrator, PrismCoaching Institute`,
          timestamp: new Date().toISOString()
        };

        setSimulatedEmails(m => [newEmail, ...m]);

        // Trigger Notification
        const notif: AppNotification = {
          id: `notif-appr-${Date.now()}`,
          title: 'Admissions Request Accepted',
          message: `Student account created for ${r.name}. Security credentials dispatched via simulated mail.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'enrollment',
          channel: 'push'
        };
        setNotifications(n => [notif, ...n]);
        triggerToast(notif);

        return { ...r, status: 'approved' };
      }
      return r;
    }));
  };

  const handleRejectRegistration = (requestId: string) => {
    setRegistrationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        if (r.status !== 'pending') return r;

        // Send simulated email
        const newEmail: SimulatedEmail = {
          id: `mail-${Date.now()}`,
          to: r.email,
          from: 'admissions@prismcoaching.edu',
          subject: 'PrismCoaching Registration Status Update',
          body: `Dear ${r.name},\n\nThank you for submitting your Fast Student Registration Request with PrismCoaching.\n\nAfter reviewing your application coordinates, we regret to inform you that our classes are currently at maximum capacity, and we cannot approve your enrollment at this time.\n\nWe have retained your interest profile on our priority waiting list. Should seats open up in upcoming sessions, we will reach out immediately.\n\nBest regards,\nCenter Administration,\nPrismCoaching Institute`,
          timestamp: new Date().toISOString()
        };

        setSimulatedEmails(m => [newEmail, ...m]);

        return { ...r, status: 'rejected' };
      }
      return r;
    }));
  };

  const handleFastStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastName || !fastEmail) return;
    const req = handleCreateRegistrationRequest(fastName, fastEmail, fastPhone, fastInstructorId);
    setFastRegSuccess(req);
    setFastName('');
    setFastEmail('');
    setFastPhone('');
    setFastInstructorId('');
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const matched = users.find(u => 
      u.username && u.username.toLowerCase() === loginUsername.trim().toLowerCase() && 
      u.password && u.password === loginPassword.trim()
    );
    if (matched) {
      setCurrentUser(matched);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid Username/Password. Under the simulation flow, make sure the Administrator has already Accepted your application, then fetch credentials from the Simulated Student Mail Inbox.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Switch role profiles instantly (Developer/Guest Sandbox support)
  const handleQuickLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0A0A0B] dark:text-gray-200 transition-colors duration-300 font-sans">
      
      {/* Real-time Toast Popups */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full bg-[#161618] border border-amber-500/30 text-white p-4 rounded-2xl shadow-xl flex gap-3.5"
          >
            <Smartphone className="w-5 h-5 text-amber-500 mt-0.5 animate-bounce flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold font-sans tracking-wide text-amber-500 uppercase">PUSH ALERT: {toastAlert.title}</p>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">{toastAlert.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Email Pop-up Modal */}
      <AnimatePresence>
        {showMailbox && activeMailboxEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#0F0F11]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <LogOut className="w-5 h-5 text-amber-500 rotate-180" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif italic text-slate-900 dark:text-white font-bold">Inbox Simulator</h3>
                    <p className="text-xs text-amber-500 font-semibold font-mono">{activeMailboxEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMailbox(false);
                    setSelectedMail(null);
                  }}
                  className="p-1 px-3 rounded-lg border dark:border-white/5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer font-bold transition"
                >
                  Close Mailbox
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-5 min-h-[350px]">
                {selectedMail ? (
                  /* Single Email Read View */
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setSelectedMail(null)}
                      className="text-xs text-amber-500 hover:underline flex items-center gap-1 mb-2 font-bold cursor-pointer"
                    >
                      &larr; Back to Inbox List
                    </button>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F0F11] border dark:border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs border-b dark:border-white/5 pb-2 font-mono">
                        <p><span className="text-slate-400">From:</span> <b className="text-amber-500">{selectedMail.from}</b></p>
                        <p className="text-slate-400">{new Date(selectedMail.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-xs font-mono"><span className="text-slate-400 font-sans">To:</span> {selectedMail.to}</p>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">{selectedMail.subject}</h4>
                    </div>
                    <div className="p-5 rounded-2xl border dark:border-white/5 bg-slate-50 dark:bg-[#0A0A0B] whitespace-pre-line text-xs leading-relaxed text-slate-800 dark:text-gray-300 font-sans border-l-2 border-l-amber-500">
                      {selectedMail.body}
                    </div>
                  </div>
                ) : (
                  /* Emails List View */
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Simulated Inbound Transmissions ({simulatedEmails.filter(m => m.to.toLowerCase() === activeMailboxEmail.toLowerCase()).length})</p>
                    {simulatedEmails.filter(m => m.to.toLowerCase() === activeMailboxEmail.toLowerCase()).length === 0 ? (
                      <div className="text-center py-12 text-slate-400 dark:text-gray-500 font-mono text-xs">
                        No emails detected in this sandbox ledger yet.<br />
                        <span className="text-[11px] block mt-2.5 text-amber-500 font-bold bg-amber-500/5 p-3 rounded-xl max-w-sm mx-auto border border-amber-500/10">
                          If you submitted an application, switch simulator profile to Admin (Anik Baidya) on the landing page, open Student Profiles, and approve it.
                        </span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {simulatedEmails
                          .filter(m => m.to.toLowerCase() === activeMailboxEmail.toLowerCase())
                          .map(mail => (
                            <button
                              key={mail.id}
                              type="button"
                              onClick={() => setSelectedMail(mail)}
                              className="w-full text-left py-3.5 px-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1 transition block border border-transparent hover:border-slate-150 dark:hover:border-white/5 cursor-pointer"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-[10px] text-amber-500 font-bold">{mail.from}</span>
                                <span className="text-[10px] text-slate-400">{new Date(mail.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-gray-200 truncate">{mail.subject}</p>
                              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate leading-none mt-1">{mail.body.substring(0, 90)}...</p>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!currentUser ? (
        /* Dynamic Role-Based Sandbox Access & Create Account Page */
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-slate-100 dark:bg-[#0A0A0B] dark:text-gray-200">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-white dark:bg-[#0F0F11] border border-slate-150/80 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            
            {/* Ambient branding ornament */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full pointer-events-none" />

            {/* Left section: Sandbox switch, quick profiles accounts, and student mail client */}
            <div className="md:col-span-12 lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif italic text-amber-500 font-bold tracking-tight">
                    PrismCoaching
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 pr-2 leading-relaxed">
                    Interactive educational control center. Experience our multi-role workflows: student registers, administrators review/accept, and credentials dispatch automatically.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-slate-400 dark:text-gray-500 uppercase select-none">Quick Sandbox Logins</p>
                  <div className="space-y-2">
                    {users.filter(u => ['admin-1', 'instructor-1', 'student-1'].includes(u.id)).map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className="w-full text-left p-2.5 border border-slate-100 dark:border-white/5 hover:border-amber-500/50 dark:hover:border-amber-500/30 rounded-2xl bg-slate-50/40 dark:bg-[#161618] flex items-center justify-between transition hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={acc.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-gray-200">{acc.name}</p>
                            <p className="text-[9.5px] text-slate-450 dark:text-gray-400 capitalize">{acc.role} simulator</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-amber-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulated Mail Client Mini-App */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-[#161618] border border-slate-200 dark:border-white/5 space-y-3 mt-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-duration-1000"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                    📧 Student Mailbox Simulator
                  </p>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-gray-400 leading-snug">
                  Inspect secure admissions emails containing login details. Type any registered email (e.g. <b>samantha.wilson@demo.com</b> or your newly registered email) and click Open.
                </p>
                
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="student.email@demo.com"
                    value={mailSearchEmail}
                    onChange={(e) => setMailSearchEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#0F0F11] border border-slate-250 dark:border-white/5 rounded-xl text-slate-900 dark:text-gray-200 focus:outline-none placeholder-slate-400 dark:placeholder-gray-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (mailSearchEmail.trim()) {
                        setActiveMailboxEmail(mailSearchEmail.trim().toLowerCase());
                        setShowMailbox(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Open Mail
                  </button>
                </div>
              </div>
            </div>

            {/* Right section: Signup workspace and authentication */}
            <div className="md:col-span-12 lg:col-span-7 bg-slate-50/50 dark:bg-[#161618] p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-5 flex flex-col justify-start">
              
              {/* Onboarding Mode Selection Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#0A0A0B] rounded-2xl border dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setOnboardingTab('fastReg')}
                  className={`py-2 px-1 rounded-xl text-center font-bold text-[10px] sm:text-[10.5px] transition cursor-pointer leading-tight ${
                    onboardingTab === 'fastReg'
                      ? 'bg-white dark:bg-[#161618] text-amber-500 dark:text-amber-500 shadow-xs border dark:border-white/5'
                      : 'text-slate-550 dark:text-gray-450 hover:text-amber-505'
                  }`}
                >
                  Fast Student Reg
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingTab('authLogin')}
                  className={`py-2 px-1 rounded-xl text-center font-bold text-[10px] sm:text-[10.5px] transition cursor-pointer leading-tight ${
                    onboardingTab === 'authLogin'
                      ? 'bg-white dark:bg-[#161618] text-amber-500 dark:text-amber-500 shadow-xs border dark:border-white/5'
                      : 'text-slate-550 dark:text-gray-450 hover:text-amber-505'
                  }`}
                >
                  Log In (Credentials)
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingTab('sandboxCreate')}
                  className={`py-2 px-1 rounded-xl text-center font-bold text-[10px] sm:text-[10.5px] transition cursor-pointer leading-tight ${
                    onboardingTab === 'sandboxCreate'
                      ? 'bg-white dark:bg-[#161618] text-amber-500 dark:text-amber-500 shadow-xs border dark:border-white/5'
                      : 'text-slate-550 dark:text-gray-450 hover:text-amber-505'
                  }`}
                >
                  Direct Sandbox
                </button>
              </div>

              {/* Form 1: Fast Student Registration */}
              {onboardingTab === 'fastReg' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-serif italic text-amber-500 font-bold">Fast Student Registration</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        Register into teaching classrooms. Administrators audit queue metrics, generate security credentials on acceptance, and dispatch login values to your mailbox.
                      </p>
                    </div>

                    {fastRegSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-3 text-xs text-slate-750 dark:text-emerald-300"
                      >
                        <p className="font-bold flex items-center gap-1.5 text-emerald-500">
                          <Check className="w-4 h-4" /> Application Submitted!
                        </p>
                        <p className="leading-relaxed text-slate-650 dark:text-gray-300">
                          Registration folder for <b>{fastRegSuccess.name}</b> has successfully lodged into the administration system stream.
                        </p>
                        <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/10 space-y-1.5 font-mono text-[10px] text-gray-300 leading-relaxed">
                          <p className="font-bold text-amber-500">SIMULATION ADVANCEMENT GUIDE:</p>
                          <p>1. Switch role to <b>Anik Baidya (Admin)</b> simulator on the left column.</p>
                          <p>2. Go to the <b>Student Profiles Registry</b> tab.</p>
                          <p>3. Click <b>Accept & Enroll</b> on {fastRegSuccess.name}'s ticket.</p>
                          <p>4. Use the <b>Simulated Mail client</b> below with email <b>{fastRegSuccess.email}</b> to retrieve your generated security credentials!</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFastRegSuccess(null)}
                          className="pt-1 text-[11px] font-bold text-emerald-500 underline hover:text-emerald-400 cursor-pointer block"
                        >
                          Submit another fast registration &rarr;
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleFastStudentSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Samuel Wilson"
                            value={fastName}
                            onChange={e => setFastName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Email ID Address</label>
                            <input
                              type="email"
                              required
                              placeholder="sam@example.com"
                              value={fastEmail}
                              onChange={e => setFastEmail(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Phone Number (Optional)</label>
                            <input
                              type="text"
                              placeholder="+1 (555) 0192"
                              value={fastPhone}
                              onChange={e => setFastPhone(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Mentor Advisor Preference</label>
                          <select
                            value={fastInstructorId}
                            onChange={e => setFastInstructorId(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-200 font-sans cursor-pointer"
                          >
                            <option value="">No preference mentor</option>
                            {users.filter(u => u.role === 'instructor').map(ins => (
                              <option key={ins.id} value={ins.id}>mentor: {ins.name} ({ins.specialization})</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs shadow-md transition active:scale-98 cursor-pointer mt-2"
                        >
                          Submit Admission Application
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Form 2: Username/Password authentication login */}
              {onboardingTab === 'authLogin' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-serif italic text-amber-500 font-bold">Approved Account Login</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        Log in using your secure auto-generated credentials (USERNAME & PASSWORD) dispatched to your simulated inbox.
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-500 text-xs leading-relaxed flex gap-2">
                        <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCredentialsLogin} className="space-y-3">
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Approved Username</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. samantha_wilson_822"
                          value={loginUsername}
                          onChange={e => setLoginUsername(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Security Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-955 font-bold rounded-xl text-xs shadow-md transition active:scale-98 cursor-pointer mt-2"
                      >
                        Sign In with Credentials &rarr;
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Form 3: Direct Sandbox creator */}
              {onboardingTab === 'sandboxCreate' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-serif italic text-amber-500 font-bold">Direct Sandbox Creator</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        Instantly instantiate and load a full-scale tester account with any privileges inside this browser sandbox.
                      </p>
                    </div>

                    <form onSubmit={handleRegisterAccount} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">User Role Sandbox</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['student', 'instructor', 'admin'] as const).map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setRegRole(role)}
                              className={`py-2 px-1 rounded-xl text-center font-bold text-xs capitalize border transition cursor-pointer ${
                                regRole === role
                                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-amber-950 dark:border-amber-500 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 dark:bg-[#0F0F11] dark:text-gray-400 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Email ID Address</label>
                          <input
                            type="email"
                            required
                            placeholder="john@prism.edu"
                            value={regEmail}
                            onChange={e => setRegEmail(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500 block font-semibold">Phone (Optional)</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 7744"
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F0F11] rounded-xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-855 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 font-sans"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-amber-950 font-bold rounded-xl text-xs shadow-md transition active:scale-98 cursor-pointer mt-2"
                      >
                        Spawn Account & Enter Center Group
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      ) : (
        /* Core UI Application Shell */
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0B]">
          
          {/* Responsive Navigation Rail */}
          <aside className="w-full md:w-64 bg-white dark:bg-[#0F0F11] border-b md:border-b-0 md:border-r border-slate-150/80 dark:border-white/5 flex flex-col justify-between p-5 mr-0 md:mr-1">
            <div className="space-y-6">
              {/* Header Branding */}
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 px-3 rounded-xl bg-amber-500 text-amber-950 text-sm font-black font-serif italic">P</span>
                  <div className="leading-none">
                    <p className="font-serif italic text-amber-500 font-bold tracking-tight text-lg">PrismCoaching</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 font-sans">Active Scheduler</p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#161618] dark:hover:bg-white/5 transition text-slate-500 dark:text-gray-400 border border-transparent dark:border-white/5"
                  title="Toggle Light/Dark Theme"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Logged profile banner */}
              <div className="p-3 bg-slate-50 dark:bg-[#161618] rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3 select-none">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 dark:border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-gray-200 truncate">{currentUser.name}</p>
                  <span className="inline-flex items-center text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Central Navigation lists */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    activeTab === 'dashboard'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                      : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Center Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('enrollments')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    activeTab === 'enrollments'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                      : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Student Profiles Registry
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    activeTab === 'schedule'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                      : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Class Timetable Scheduling
                </button>

                <button
                  onClick={() => setActiveTab('progress')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    activeTab === 'progress'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                      : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Grading Progress Books
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    activeTab === 'reports'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                      : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics Reports & Exports
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('backup')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                      activeTab === 'backup'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-text-amber-500 text-amber-500 font-bold'
                        : 'text-slate-550 dark:text-gray-400 hover:text-amber-500 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-[#161618] border border-transparent'
                    }`}
                  >
                    <CloudLightning className="w-4 h-4" />
                    Secure Backups
                  </button>
                )}
              </nav>
            </div>

            {/* Logout anchor workspace */}
            <div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-500 font-bold text-xs text-slate-550 dark:text-gray-400 transition"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                Change Simulator Role
              </button>
            </div>
          </aside>

          {/* Main Context Stage */}
          <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            
            {/* Active Render Panels Routing based on Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Welcomes banner custom header */}
                <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 text-slate-900 dark:text-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden select-none">
                  {/* Branding background shape ornament */}
                  <div className="absolute right-0 bottom-0 h-32 w-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                      COACHING OFFICE SERVER CONNECTED
                    </p>
                    <h1 className="text-2xl md:text-3xl font-serif italic text-amber-500 font-bold tracking-tight mt-1">
                      Welcome Back, {currentUser.name}!
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-gray-400 pr-4 mt-0.5 leading-relaxed">
                      Auditing center coordinates. Time check: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}. All automated reminders ready in queue.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0A0A0B] border border-slate-150/80 dark:border-white/5 p-3.5 rounded-2xl text-xs space-y-1 font-mono">
                    <p className="text-amber-500 font-bold">STATUS Dashboard Live</p>
                    <p className="text-slate-500 dark:text-gray-500 text-[10px]">RECORDS: {users.length} registered</p>
                  </div>
                </div>

                {/* Dashboard summary stats based on current user role */}
                {currentUser.role === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Total Students</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">{users.filter(u => u.role === 'student').length}</p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('enrollments')}>
                        View folder registry &rarr;
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Instructors</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">{users.filter(u => u.role === 'instructor').length}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-4">Full instructor workloads configured</p>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Scheduled Classes</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">{schedules.filter(s => s.status === 'scheduled').length}</p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('schedule')}>
                        Organize calendar &rarr;
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Academic average</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">
                          {(progressRecords.reduce((acc, r) => acc + r.score, 0) / progressRecords.length).toFixed(0)}%
                        </p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('reports')}>
                        Explore insights &rarr;
                      </span>
                    </div>
                  </div>
                )}

                {currentUser.role === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Your Enrolled Courses</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">
                          {schedules.filter(s => s.enrolledStudentIds.includes(currentUser.id)).length}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('schedule')}>
                        Check Timetables &rarr;
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">My Evaluative Average Score</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">
                          {progressRecords.filter(r => r.studentId === currentUser.id).length > 0
                            ? (progressRecords.filter(r => r.studentId === currentUser.id).reduce((acc, r) => acc + r.score, 0) / progressRecords.filter(r => r.studentId === currentUser.id).length).toFixed(0)
                            : '0'}%
                        </p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('progress')}>
                        View My Feedbacks &rarr;
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Assigned Mentor Advisor</p>
                        <p className="text-xl font-serif text-amber-500 mt-2 italic font-bold">
                          {users.find(i => i.id === currentUser.assignedInstructorId)?.name || 'No Assigned Advisor'}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-4">Profile synced successfully</p>
                    </div>
                  </div>
                )}

                {currentUser.role === 'instructor' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Your Teaching Live Sessions</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">
                          {schedules.filter(s => s.instructorId === currentUser.id && s.status === 'scheduled').length}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('schedule')}>
                        Mark Timetable completion &rarr;
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-401 dark:text-gray-500 font-mono uppercase tracking-widest font-semibold">Registered Evaluations Logged</p>
                        <p className="text-3xl font-serif text-slate-900 dark:text-white mt-1.5">
                          {progressRecords.filter(r => r.instructorId === currentUser.id).length}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-semibold text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5 mt-4" onClick={() => setActiveTab('progress')}>
                        Grade more schedules progress &rarr;
                      </span>
                    </div>
                  </div>
                )}

                {/* Main alerts panels & Notification workspace inside Dashboard */}
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                  onClearAll={() => setNotifications([])}
                  onTriggerTestNotification={handleTriggerTestNotification}
                />

                {/* Mini Schedule overview feed inside main Dashboard */}
                <div className="bg-white dark:bg-[#161618] border border-slate-150/80 dark:border-white/5 p-6 md:p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">Active Classroom Sessions Timetable</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-sans">Quick lookup of classes registered currently</p>
                    </div>
                    <button onClick={() => setActiveTab('schedule')} className="text-xs font-bold text-amber-500 hover:underline">
                      See full list &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedules.slice(0, 4).map(sch => (
                      <div key={sch.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0F0F11] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161618] text-slate-700 dark:text-gray-400 border dark:border-white/5">{sch.subject}</span>
                          <p className="text-xs font-bold text-slate-800 dark:text-gray-100 leading-snug">{sch.title}</p>
                          <p className="text-[10.5px] text-slate-500 dark:text-gray-500 flex items-center gap-1 font-sans">
                            <Clock className="w-3.5 h-3.5" /> {sch.date} • {sch.time}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-500 capitalize">{sch.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'enrollments' && (
              <EnrollmentManager
                currentUser={currentUser}
                students={users.filter(u => u.role === 'student')}
                instructors={users.filter(u => u.role === 'instructor')}
                schedules={schedules}
                onAddStudent={handleAddStudent}
                onRemoveStudent={handleRemoveStudent}
                onEnrollStudentInClass={handleEnrollStudentInClass}
                registrationRequests={registrationRequests}
                onApproveRequest={handleApproveRegistration}
                onRejectRequest={handleRejectRegistration}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleManager
                currentUser={currentUser}
                schedules={schedules}
                instructors={users.filter(u => u.role === 'instructor')}
                students={users.filter(u => u.role === 'student')}
                onAddClass={handleAddClass}
                onUpdateStatus={handleUpdateClassStatus}
                onSelfEnroll={handleSelfEnroll}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressTracker
                currentUser={currentUser}
                students={users.filter(u => u.role === 'student')}
                schedules={schedules}
                progressRecords={progressRecords}
                onAddProgressRecord={handleAddProgressRecord}
              />
            )}

            {activeTab === 'reports' && (
              <ReportingDashboard
                students={users.filter(u => u.role === 'student')}
                schedules={schedules}
                progressRecords={progressRecords}
              />
            )}

            {activeTab === 'backup' && currentUser.role === 'admin' && (
              <CloudBackup
                students={users.filter(u => u.role === 'student')}
                instructors={users.filter(u => u.role === 'instructor')}
                schedules={schedules}
                progressRecords={progressRecords}
                backupHistory={backupHistory}
                onTriggerBackup={handleTriggerBackup}
                onRestoreState={handleRestoreState}
              />
            )}

          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
