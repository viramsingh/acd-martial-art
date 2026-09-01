'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Users, Calendar, Trophy, Mail, UserCheck, Search, Filter, Plus, Edit, Trash2, Shield, LogOut,
  CheckCircle2, XCircle, Clock, Save, RefreshCw, Award, Check, Settings, FileSpreadsheet, Sparkles, AlertTriangle, Key, Eye, EyeOff
} from 'lucide-react';
import {
  getStudents, saveStudent, updateStudentBelt, deleteStudent,
  getAttendanceRecords, markAttendance,
  getAchievements, addAchievement, updateAchievement, deleteAchievement,
  getEvents, addEvent, updateEvent, deleteEvent,
  getContactMessages, markMessageRead, deleteContactMessage,
  getRegistrations, approveRegistration, rejectRegistration,
  getGoogleSheetsConfig, saveGoogleSheetsConfig, GoogleSheetsConfig
} from '@/lib/sheets';
import { Student, AttendanceRecord, Achievement, ContactMessage, StudentRegistration, BeltLevel, UpcomingEvent } from '@/types';
import { useToast } from '@/context/ToastContext';
import Pagination from '@/components/Pagination';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'attendance' | 'achievements' | 'events' | 'registrations' | 'messages' | 'sheets'>('overview');

  // State Stores
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({ webAppUrl: '', enabled: false });

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [beltFilter, setBeltFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  // Attendance Date Selector State
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceBatch, setAttendanceBatch] = useState<string>('ALL');
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState<string>('');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  // Pagination States
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);

  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePageSize, setAttendancePageSize] = useState(10);

  const [achievementPage, setAchievementPage] = useState(1);
  const [achievementPageSize, setAchievementPageSize] = useState(6);

  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(6);

  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationPageSize, setRegistrationPageSize] = useState(10);

  const [messagePage, setMessagePage] = useState(1);
  const [messagePageSize, setMessagePageSize] = useState(10);

  // Auto Reset Pages when filters change
  useEffect(() => {
    setStudentPage(1);
  }, [searchTerm, beltFilter, batchFilter]);

  useEffect(() => {
    setAttendancePage(1);
  }, [attendanceSearchTerm, attendanceBatch, attendanceDate]);


  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // New Student Form Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    dob: '',
    gender: 'Male' as const,
    phone: '',
    email: '',
    address: '',
    guardianName: '',
    emergencyPhone: '',
    batch: 'Evening 5:00 To 6:00',
    beltLevel: 'White Belt' as BeltLevel,
  });

  // New Achievement Modal State
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [newAchievementForm, setNewAchievementForm] = useState({
    title: '',
    studentName: '',
    event: '',
    position: '',
    date: '',
    imageUrl: '',
    description: '',
  });

  // New Event Modal State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    category: 'Special Workshop',
    date: '',
    time: '',
    location: '',
    desc: '',
    image: '',
    badgeColor: 'bg-red-600 text-white',
  });

  // Edit Record States
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);

  // Load All Data & Auth Verification
  // Master Credentials Change Modal State
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [showPassText, setShowPassText] = useState(false);

  // Edit Handlers
  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    saveStudent(editingStudent);
    refreshData();
    setEditingStudent(null);
    showToast(`Student record for ${editingStudent.fullName} (${editingStudent.id}) updated!`, 'success');
  };

  const handleUpdateAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievement) return;
    updateAchievement(editingAchievement);
    refreshData();
    setEditingAchievement(null);
    showToast('Achievement record updated!', 'success');
  };

  const handleUpdateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent);
    refreshData();
    setEditingEvent(null);
    showToast('Upcoming event record updated!', 'success');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('acd_admin_auth');
      if (auth !== 'true') {
        router.push('/admin/login');
        return;
      }
    }
    refreshData();
  }, [router]);

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminPass.trim()) {
      showToast('Username and password cannot be empty.', 'error');
      return;
    }
    localStorage.setItem('acd_custom_admin_user', newAdminUser.trim());
    localStorage.setItem('acd_custom_admin_pass', newAdminPass.trim());
    showToast('Admin Credentials updated successfully! Next login will require these new credentials.', 'success');
    setShowCredsModal(false);
  };

  const refreshData = () => {
    setStudents(getStudents());
    setAttendance(getAttendanceRecords());
    setAchievements(getAchievements());
    setEvents(getEvents());
    setMessages(getContactMessages());
    setRegistrations(getRegistrations());
    setSheetsConfig(getGoogleSheetsConfig());
  };

  const handleLogout = () => {
    localStorage.removeItem('acd_admin_auth');
    showToast('Logged out of Admin Portal.', 'info');
    router.push('/admin/login');
  };

  // Sync Attendance Form State when Date / Batch Changes
  useEffect(() => {
    const records = getAttendanceRecords(attendanceDate);
    const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    students.forEach((s) => {
      const existing = records.find((r) => r.studentId === s.id);
      if (existing) {
        initialMap[s.id] = existing.status;
      } else {
        initialMap[s.id] = 'PRESENT'; // default
      }
    });
    setAttendanceState(initialMap);
  }, [attendanceDate, attendanceBatch, students]);

  // Handle Attendance Save
  const handleSaveAttendance = () => {
    const updates = students
      .filter((s) => attendanceBatch === 'ALL' || s.batch === attendanceBatch)
      .map((s) => ({
        studentId: s.id,
        studentName: s.fullName,
        batch: s.batch,
        status: attendanceState[s.id] || 'PRESENT',
      }));

    markAttendance(attendanceDate, updates);
    refreshData();
    showToast(`Attendance records saved for ${attendanceDate}!`, 'success');
  };

  // Handle New Student Submit
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudent(newStudentForm);
    refreshData();
    setShowAddStudentModal(false);
    showToast(`New student ${newStudentForm.fullName} created!`, 'success');
    setNewStudentForm({
      fullName: '',
      dob: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      guardianName: '',
      emergencyPhone: '',
      batch: 'Evening 5:00 To 6:00',
      beltLevel: 'White Belt',
    });
  };

  // Handle Belt Promotion
  const handlePromoteBelt = (studentId: string, currentBelt: BeltLevel) => {
    const belts: BeltLevel[] = [
      'White Belt', 'Yellow Belt', 'Green Belt', 'Green-1 Belt', 'Blue Belt', 'Blue-1 Belt', 'Red Belt', 'Red-1 Belt', 'Black Belt'
    ];
    const currentIndex = belts.indexOf(currentBelt);
    if (currentIndex !== -1 && currentIndex < belts.length - 1) {
      const nextBelt = belts[currentIndex + 1];
      updateStudentBelt(studentId, nextBelt);
      refreshData();
      showToast(`Student promoted to ${nextBelt}!`, 'success');
    }
  };

  // Confirm and Process Student Delete
  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      refreshData();
      showToast(`Student ${studentToDelete.fullName} (${studentToDelete.id}) permanently deleted.`, 'error');
      setStudentToDelete(null);
    }
  };

  // Handle Approve Registration
  const handleApproveReg = (id: string, name: string) => {
    const student = approveRegistration(id);
    refreshData();
    if (student) {
      showToast(`Registration approved! ${name} enrolled as Active Student (${student.id}).`, 'success');
    }
  };

  // Handle Reject Registration
  const handleRejectReg = (id: string) => {
    rejectRegistration(id);
    refreshData();
    showToast('Registration application rejected.', 'error');
  };

  // Handle Add Achievement
  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    addAchievement(newAchievementForm);
    refreshData();
    setShowAddAchievementModal(false);
    showToast('New achievement published to Hall of Fame!', 'success');
    setNewAchievementForm({
      title: '',
      studentName: '',
      event: '',
      position: '',
      date: '',
      imageUrl: '',
      description: '',
    });
  };

  // Handle Delete Achievement
  const handleDeleteAchievement = (id: string) => {
    if (confirm('Delete this achievement record?')) {
      deleteAchievement(id);
      refreshData();
      showToast('Achievement record deleted.', 'info');
    }
  };

  // Handle Add Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(newEventForm);
    refreshData();
    setShowAddEventModal(false);
    showToast('New upcoming event published to Home Page!', 'success');
    setNewEventForm({
      title: '',
      category: 'Special Workshop',
      date: '',
      time: '',
      location: '',
      desc: '',
      image: '',
      badgeColor: 'bg-red-600 text-white',
    });
  };

  // Handle Delete Event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Delete this upcoming event record?')) {
      deleteEvent(id);
      refreshData();
      showToast('Upcoming event deleted.', 'info');
    }
  };

  // Handle Delete Contact Message
  const handleDeleteMessage = (id: string) => {
    if (confirm('Delete this contact enquiry message?')) {
      deleteContactMessage(id);
      refreshData();
      showToast('Contact enquiry message deleted.', 'info');
    }
  };

  // Save Google Sheets Config
  const handleSaveSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetsConfig(sheetsConfig);
    showToast('Google Sheets API Integration settings updated!', 'success');
  };

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.phone.includes(searchTerm);
    const matchesBelt = beltFilter === 'ALL' || s.beltLevel === beltFilter;
    const matchesBatch = batchFilter === 'ALL' || s.batch === batchFilter || s.batch.toLowerCase().includes(batchFilter.toLowerCase());
    return matchesSearch && matchesBelt && matchesBatch;
  });

  // Filtered Students for Attendance Marker
  const filteredAttendanceStudents = students.filter((s) => {
    const matchesBatch = attendanceBatch === 'ALL' || s.batch === attendanceBatch || s.batch.toLowerCase().includes(attendanceBatch.toLowerCase());
    const q = attendanceSearchTerm.trim().toLowerCase();
    const matchesSearch = !q || (
      s.fullName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.beltLevel.toLowerCase().includes(q)
    );
    return matchesBatch && matchesSearch;
  });

  // Paginated Slices for Tables & Grids
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * studentPageSize,
    studentPage * studentPageSize
  );

  const paginatedAttendanceStudents = filteredAttendanceStudents.slice(
    (attendancePage - 1) * attendancePageSize,
    attendancePage * attendancePageSize
  );

  const paginatedAchievements = achievements.slice(
    (achievementPage - 1) * achievementPageSize,
    achievementPage * achievementPageSize
  );

  const paginatedEvents = events.slice(
    (eventPage - 1) * eventPageSize,
    eventPage * eventPageSize
  );

  const paginatedRegistrations = registrations.slice(
    (registrationPage - 1) * registrationPageSize,
    registrationPage * registrationPageSize
  );

  const paginatedMessages = messages.slice(
    (messagePage - 1) * messagePageSize,
    messagePage * messagePageSize
  );

  const pendingRegsCount = registrations.filter((r) => r.status === 'PENDING').length;

  const newMsgCount = messages.filter((m) => m.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 pb-20">
      
      {/* TOP DASHBOARD HEADER */}
      <header className="bg-[#0F172A] border-b border-slate-800 py-4 px-4 sm:px-8 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                ACD Staff Admin Hub
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full uppercase font-mono">Live Sync</span>
              </h1>
              <p className="text-xs text-slate-400">Master Control Dashboard & Student Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const curUser = localStorage.getItem('acd_custom_admin_user') || 'admin';
                const curPass = localStorage.getItem('acd_custom_admin_pass') || 'admin123';
                setNewAdminUser(curUser);
                setNewAdminPass(curPass);
                setShowCredsModal(true);
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all"
              title="Update Master Admin Credentials"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Set Credentials</span>
            </button>
            <button
              onClick={() => { refreshData(); showToast('Data refreshed!', 'info'); }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-950 hover:text-red-400 hover:border-red-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'students', label: `Students (${students.length})`, icon: Users },
            { id: 'attendance', label: 'Attendance Marker', icon: Calendar },
            { id: 'registrations', label: `Registrations (${pendingRegsCount})`, icon: UserCheck, badge: pendingRegsCount > 0 ? pendingRegsCount : undefined },
            { id: 'achievements', label: `Achievements (${achievements.length})`, icon: Trophy },
            { id: 'events', label: `Events Manager (${events.length})`, icon: Sparkles },
            { id: 'messages', label: `Messages (${newMsgCount})`, icon: Mail, badge: newMsgCount > 0 ? newMsgCount : undefined },
            { id: 'sheets', label: 'Google Sheets Integration', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW METRICS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Total Active Students</span>
                  <Users className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-4xl font-extrabold font-outfit text-white">{students.length}</p>
                <p className="text-xs text-slate-400">Enrolled across Morning & Evening batches</p>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Pending Registrations</span>
                  <UserCheck className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-4xl font-extrabold font-outfit text-amber-400">{pendingRegsCount}</p>
                <p className="text-xs text-slate-400">Awaiting admin review & approval</p>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Achievements Published</span>
                  <Trophy className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-4xl font-extrabold font-outfit text-emerald-400">{achievements.length}</p>
                <p className="text-xs text-slate-400">Medals & belt promotion stories</p>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>New Messages</span>
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-4xl font-extrabold font-outfit text-purple-400">{newMsgCount}</p>
                <p className="text-xs text-slate-400">Inquiries from website contact form</p>
              </div>

            </div>

            {/* QUICK ACTIONS & PENDING REGISTRATIONS SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-4 border border-slate-700">
                <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" /> Pending Student Applications
                </h3>

                {registrations.filter((r) => r.status === 'PENDING').length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No pending student registration applications.</p>
                ) : (
                  <div className="space-y-3">
                    {registrations.filter((r) => r.status === 'PENDING').map((reg) => (
                      <div key={reg.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{reg.fullName} <span className="text-xs font-normal text-slate-400">({reg.batch} Batch)</span></p>
                          <p className="text-xs text-slate-400">School: <span className="text-slate-200">{reg.schoolName || 'N/A'}</span> • Phone: {reg.phone} • Belt: {reg.beltLevel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveReg(reg.id, reg.fullName)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectReg(reg.id)}
                            className="bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-lg"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 glass-card p-6 rounded-2xl space-y-4 border border-slate-700">
                <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" /> Staff Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => { setActiveTab('students'); setShowAddStudentModal(true); }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold p-3.5 rounded-xl border border-slate-700 flex items-center justify-between"
                  >
                    <span>+ Add New Student Record</span>
                    <Users className="w-4 h-4 text-red-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold p-3.5 rounded-xl border border-slate-700 flex items-center justify-between"
                  >
                    <span>Mark Daily Student Attendance</span>
                    <Calendar className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('achievements'); setShowAddAchievementModal(true); }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold p-3.5 rounded-xl border border-slate-700 flex items-center justify-between"
                  >
                    <span>Post New Championship Award</span>
                    <Trophy className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: STUDENT DIRECTORY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            
            {/* CONTROLS HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-700">
              
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, ID, phone..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={beltFilter}
                  onChange={(e) => setBeltFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Belts</option>
                  <option value="White Belt">White Belt</option>
                  <option value="Yellow Belt">Yellow Belt</option>
                  <option value="Green Belt">Green Belt</option>
                  <option value="Green-1 Belt">Green-1 Belt</option>
                  <option value="Blue Belt">Blue Belt</option>
                  <option value="Blue-1 Belt">Blue-1 Belt</option>
                  <option value="Red Belt">Red Belt</option>
                  <option value="Red-1 Belt">Red-1 Belt</option>
                  <option value="Black Belt">Black Belt</option>
                </select>

                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Batches</option>
                  <option value="Evening 5:00 To 6:00">Evening 5:00 To 6:00</option>
                  <option value="Evening 6:30 To 7:30">Evening 6:30 To 7:30</option>
                  <option value="Evening 8:00 To 9:00">Evening 8:00 To 9:00</option>
                </select>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>

            </div>

            {/* STUDENTS TABLE / MOBILE CARDS */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 p-4 space-y-4">
              
              {/* MOBILE CARDS (sm:hidden) */}
              <div className="block sm:hidden divide-y divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No student records match search criteria.
                  </div>
                ) : (
                  paginatedStudents.map((s) => (
                    <div key={s.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400 text-xs">{s.id}</span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border belt-white">
                          {s.beltLevel}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.fullName}</h4>
                        <p className="text-[11px] text-slate-400">DOB: {s.dob} • Gender: {s.gender}</p>
                        <p className="text-[11px] text-slate-300 mt-1">Batch: <span className="text-amber-400 font-semibold">{s.batch}</span></p>
                        {s.schoolName && <p className="text-[11px] text-slate-400">School: {s.schoolName}</p>}
                        <p className="text-[11px] text-slate-400">Phone: {s.phone} • Guardian: {s.guardianName}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePromoteBelt(s.id, s.beltLevel)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            + Promote Belt
                          </button>
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3 text-amber-400" /> Edit
                          </button>
                        </div>
                        <button
                          onClick={() => setStudentToDelete(s)}
                          className="text-red-400 hover:text-red-300 font-semibold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP TABLE (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Student ID</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Batch</th>
                      <th className="py-3.5 px-4">Current Belt Rank</th>
                      <th className="py-3.5 px-4">Contact Phone</th>
                      <th className="py-3.5 px-4">Guardian</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No student records match search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{s.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {s.fullName}
                            <span className="block text-[10px] text-slate-400 font-normal">DOB: {s.dob} ({s.gender}) {s.schoolName ? `• ${s.schoolName}` : ''}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-200">{s.batch}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide border belt-white">
                              {s.beltLevel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">{s.phone}</td>
                          <td className="py-3.5 px-4 text-slate-300">{s.guardianName}</td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handlePromoteBelt(s.id, s.beltLevel)}
                              className="bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-400 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                              title="Promote to Next Belt Rank"
                            >
                              + Promote Belt
                            </button>
                            <button
                              onClick={() => setEditingStudent(s)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1"
                              title="Edit Student Profile"
                            >
                              <Edit className="w-3 h-3 text-amber-400" /> Edit
                            </button>
                            <button
                              onClick={() => setStudentToDelete(s)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors inline-block"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <Pagination
                currentPage={studentPage}
                totalItems={filteredStudents.length}
                pageSize={studentPageSize}
                onPageChange={setStudentPage}
                onPageSizeChange={setStudentPageSize}
              />
            </div>


          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ATTENDANCE MARKER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* ATTENDANCE CONTROL BAR */}
            <div className="glass-card p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <div className="space-y-1 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-400 block">Attendance Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-400 block">Select Batch Slot</label>
                  <select
                    value={attendanceBatch}
                    onChange={(e) => setAttendanceBatch(e.target.value)}
                    className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="Evening 5:00 To 6:00">Evening 5:00 To 6:00</option>
                    <option value="Evening 6:30 To 7:30">Evening 6:30 To 7:30</option>
                    <option value="Evening 8:00 To 9:00">Evening 8:00 To 9:00</option>
                  </select>
                </div>

                <div className="space-y-1 w-full sm:w-64">
                  <label className="text-xs font-semibold text-slate-400 block">Search Student</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={attendanceSearchTerm}
                      onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                      placeholder="Search name, ID, phone..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAttendance}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider shrink-0"
              >
                <Save className="w-4 h-4" /> Save Attendance Records
              </button>
            </div>

            {/* ATTENDANCE MARKING CONTAINER */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 p-4 space-y-4">
              
              {/* MOBILE CARDS (sm:hidden) */}
              <div className="block sm:hidden divide-y divide-slate-800">
                {filteredAttendanceStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No student records match search criteria or selected batch.
                  </div>
                ) : (
                  paginatedAttendanceStudents.map((s) => {
                    const currentStatus = attendanceState[s.id] || 'PRESENT';
                    return (
                      <div key={s.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-400 text-xs">{s.id}</span>
                          <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{s.beltLevel}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{s.fullName}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Batch: <span className="text-amber-400 font-semibold">{s.batch}</span></p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'PRESENT' })}
                            className={`py-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> PRESENT
                          </button>
                          <button
                            onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'ABSENT' })}
                            className={`py-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                              currentStatus === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> ABSENT
                          </button>
                          <button
                            onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'LATE' })}
                            className={`py-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-slate-950 shadow-md'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> LATE
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* DESKTOP TABLE (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Student ID</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Batch</th>
                      <th className="py-3.5 px-4">Current Belt</th>
                      <th className="py-3.5 px-4 text-center">Attendance Toggle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredAttendanceStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No student records match search criteria or selected batch.
                        </td>
                      </tr>
                    ) : (
                      paginatedAttendanceStudents.map((s) => {
                        const currentStatus = attendanceState[s.id] || 'PRESENT';
                        return (
                          <tr key={s.id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-mono text-amber-400 font-bold">{s.id}</td>
                            <td className="py-3 px-4 font-semibold text-white">{s.fullName}</td>
                            <td className="py-3 px-4 text-slate-300">{s.batch}</td>
                            <td className="py-3 px-4 text-slate-400">{s.beltLevel}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'PRESENT' })}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                    currentStatus === 'PRESENT'
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> PRESENT
                                </button>

                                <button
                                  onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'ABSENT' })}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                    currentStatus === 'ABSENT'
                                      ? 'bg-red-600 text-white shadow-md'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> ABSENT
                                </button>

                                <button
                                  onClick={() => setAttendanceState({ ...attendanceState, [s.id]: 'LATE' })}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                    currentStatus === 'LATE'
                                      ? 'bg-amber-500 text-slate-950 shadow-md'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" /> LATE
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <Pagination
                currentPage={attendancePage}
                totalItems={filteredAttendanceStudents.length}
                pageSize={attendancePageSize}
                onPageChange={setAttendancePage}
                onPageSizeChange={setAttendancePageSize}
              />
            </div>


          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: ACHIEVEMENTS MANAGER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-card p-4 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold font-outfit text-white">Championship & Belt Grading Achievements</h3>
              <button
                onClick={() => setShowAddAchievementModal(true)}
                className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 uppercase shrink-0"
              >
                <Plus className="w-4 h-4" /> Post New Achievement
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paginatedAchievements.map((ach) => (
                  <div key={ach.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-700 relative">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden">
                      <Image src={ach.imageUrl || '/assets/achievement_trophy.jpg'} alt={ach.title} fill className="object-cover" />
                    </div>
                    <h4 className="text-base font-bold font-outfit text-white">{ach.title}</h4>
                    <p className="text-xs text-amber-400 font-semibold">{ach.position} • {ach.event}</p>
                    <p className="text-xs text-slate-400">{ach.description}</p>
                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingAchievement(ach)}
                        className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={achievementPage}
                totalItems={achievements.length}
                pageSize={achievementPageSize}
                onPageChange={setAchievementPage}
                onPageSizeChange={setAchievementPageSize}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB: UPCOMING EVENTS MANAGER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-card p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Upcoming Events & Tournaments Manager</h3>
                <p className="text-xs text-slate-400">Events published here appear live on the Home Page</p>
              </div>
              <button
                onClick={() => setShowAddEventModal(true)}
                className="whitespace-nowrap bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 uppercase shrink-0"
              >
                <Plus className="w-4 h-4" /> Post New Event
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paginatedEvents.map((evt) => (
                  <div key={evt.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-700 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      {evt.image && (
                        <div className="relative h-44 w-full rounded-xl overflow-hidden">
                          <Image src={evt.image} alt={evt.title} fill className="object-cover object-top" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${evt.badgeColor || 'bg-red-600 text-white'}`}>
                          {evt.category}
                        </span>
                        <span className="text-xs text-amber-400 font-mono font-semibold">{evt.date}</span>
                      </div>
                      <h4 className="text-base font-bold font-outfit text-white leading-snug">{evt.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{evt.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <p className="text-slate-400">⏰ {evt.time}</p>
                      <p className="text-slate-400">📍 {evt.location}</p>
                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingEvent(evt)}
                          className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={eventPage}
                totalItems={events.length}
                pageSize={eventPageSize}
                onPageChange={setEventPage}
                onPageSizeChange={setEventPageSize}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: REGISTRATION APPROVALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="glass-card p-4 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold font-outfit text-white">Student Registration Applications</h3>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4">Applicant Name</th>
                      <th className="py-3.5 px-4">School / Institution</th>
                      <th className="py-3.5 px-4">Batch</th>
                      <th className="py-3.5 px-4">Phone / Email</th>
                      <th className="py-3.5 px-4">Guardian / Emergency</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {paginatedRegistrations.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{r.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{r.fullName} ({r.dob})</td>
                        <td className="py-3.5 px-4 text-slate-200 font-medium">{r.schoolName || 'N/A'}</td>
                        <td className="py-3.5 px-4">{r.batch} Batch</td>
                        <td className="py-3.5 px-4 font-mono">{r.phone}</td>
                        <td className="py-3.5 px-4 text-slate-300">{r.guardianName} ({r.emergencyPhone})</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : r.status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveReg(r.id, r.fullName)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1 rounded-lg"
                              >
                                Approve & Enroll
                              </button>
                              <button
                                onClick={() => handleRejectReg(r.id)}
                                className="bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs px-2.5 py-1 rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={registrationPage}
                totalItems={registrations.length}
                pageSize={registrationPageSize}
                onPageChange={setRegistrationPage}
                onPageSizeChange={setRegistrationPageSize}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: CONTACT MESSAGES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="glass-card p-4 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold font-outfit text-white">Contact Enquiries ({messages.length})</h3>
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="glass-card p-8 rounded-2xl text-center text-slate-500 text-xs border border-slate-800">
                  No contact enquiries received yet.
                </div>
              ) : (
                paginatedMessages.map((m) => (
                  <div key={m.id} className="glass-card p-5 rounded-2xl space-y-2 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold font-outfit text-white">{m.name} <span className="text-xs font-normal text-slate-400">({m.phone} • {m.email})</span></h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500">{m.createdAt}</span>
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-red-400">{m.subject}</p>
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">{m.message}</p>
                  </div>
                ))
              )}

              <Pagination
                currentPage={messagePage}
                totalItems={messages.length}
                pageSize={messagePageSize}
                onPageChange={setMessagePage}
                onPageSizeChange={setMessagePageSize}
              />
            </div>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 7: GOOGLE SHEETS INTEGRATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'sheets' && (
          <div className="glass-card p-8 rounded-3xl border border-slate-700 space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Google Sheets API Connector
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Connect your Google Spreadsheet via Google Apps Script Web App URL for real-time cloud data sync.
              </p>
            </div>

            <form onSubmit={handleSaveSheetsConfig} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  value={sheetsConfig.webAppUrl}
                  onChange={(e) => setSheetsConfig({ ...sheetsConfig, webAppUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sheetsEnabled"
                  checked={sheetsConfig.enabled}
                  onChange={(e) => setSheetsConfig({ ...sheetsConfig, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0"
                />
                <label htmlFor="sheetsEnabled" className="text-xs text-slate-300">Enable Google Sheets Sync</label>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Integration Settings
              </button>
            </form>
          </div>
        )}

      </main>

      {/* MODAL 0: CUSTOM DELETE CONFIRMATION POPUP */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/40 w-full max-w-md space-y-6 shadow-2xl relative">
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/40 shrink-0">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold font-outfit text-white">Delete Student Record?</h3>
                <p className="text-xs text-slate-400">This action will remove the student permanently.</p>
              </div>
            </div>

            {/* Student Details Preview Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Student ID:</span>
                <span className="text-amber-400 font-bold">{studentToDelete.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Student Name:</span>
                <span className="text-white font-bold">{studentToDelete.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Batch & Belt:</span>
                <span className="text-slate-300">{studentToDelete.batch} • {studentToDelete.beltLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="text-slate-300">{studentToDelete.phone}</span>
              </div>
            </div>

            <p className="text-xs text-red-400/90 bg-red-950/40 border border-red-900/50 p-3 rounded-xl">
              ⚠️ Are you sure you want to permanently delete <strong>{studentToDelete.fullName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Student
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW STUDENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 w-full max-w-lg space-y-5">
            <h3 className="text-xl font-bold font-outfit text-white">Add New Student</h3>
            
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newStudentForm.fullName}
                onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={newStudentForm.dob}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white [color-scheme:dark]"
                />
                <select
                  value={newStudentForm.gender}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={newStudentForm.phone}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Guardian Name"
                  value={newStudentForm.guardianName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, guardianName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newStudentForm.batch}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, batch: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="Evening 5:00 To 6:00">Evening 5:00 To 6:00</option>
                  <option value="Evening 6:30 To 7:30">Evening 6:30 To 7:30</option>
                  <option value="Evening 8:00 To 9:00">Evening 8:00 To 9:00</option>
                </select>

                <select
                  value={newStudentForm.beltLevel}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, beltLevel: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="White Belt">White Belt</option>
                  <option value="Yellow Belt">Yellow Belt</option>
                  <option value="Green Belt">Green Belt</option>
                  <option value="Green-1 Belt">Green-1 Belt</option>
                  <option value="Blue Belt">Blue Belt</option>
                  <option value="Blue-1 Belt">Blue-1 Belt</option>
                  <option value="Red Belt">Red Belt</option>
                  <option value="Red-1 Belt">Red-1 Belt</option>
                  <option value="Black Belt">Black Belt</option>
                </select>
              </div>

              <input
                type="text"
                required
                placeholder="Address"
                value={newStudentForm.address}
                onChange={(e) => setNewStudentForm({ ...newStudentForm, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ACHIEVEMENT */}
      {showAddAchievementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 w-full max-w-lg space-y-5">
            <h3 className="text-xl font-bold font-outfit text-white">Post New Achievement</h3>
            
            <form onSubmit={handleCreateAchievement} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Achievement Title (e.g. State Championship Gold)"
                value={newAchievementForm.title}
                onChange={(e) => setNewAchievementForm({ ...newAchievementForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />

              <input
                type="text"
                placeholder="Student Name (Optional)"
                value={newAchievementForm.studentName}
                onChange={(e) => setNewAchievementForm({ ...newAchievementForm, studentName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Position (e.g. Gold Medal)"
                  value={newAchievementForm.position}
                  onChange={(e) => setNewAchievementForm({ ...newAchievementForm, position: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <input
                  type="date"
                  required
                  value={newAchievementForm.date}
                  onChange={(e) => setNewAchievementForm({ ...newAchievementForm, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white [color-scheme:dark]"
                />
              </div>

              <input
                type="text"
                placeholder="Photo / Image Web URL (e.g. https://images.com/... or /assets/IMG_7316.PNG)"
                value={newAchievementForm.imageUrl}
                onChange={(e) => setNewAchievementForm({ ...newAchievementForm, imageUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />

              <textarea
                required
                rows={3}
                placeholder="Description of the event & victory..."
                value={newAchievementForm.description}
                onChange={(e) => setNewAchievementForm({ ...newAchievementForm, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
              />

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAchievementModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
                >
                  Publish Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD UPCOMING EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-outfit text-white">Post New Upcoming Event</h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Event Title (e.g. Annual Belt Examination)"
                value={newEventForm.title}
                onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newEventForm.category}
                  onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="Belt Grading Test">Belt Grading Test</option>
                  <option value="State Tournament">State Tournament</option>
                  <option value="Special Workshop">Special Workshop</option>
                  <option value="Self Defense Camp">Self Defense Camp</option>
                  <option value="District Championship">District Championship</option>
                </select>

                <input
                  type="date"
                  required
                  value={newEventForm.date}
                  onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Time (e.g. 08:00 AM - 12:00 PM)"
                  value={newEventForm.time}
                  onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />

                <input
                  type="text"
                  required
                  placeholder="Location (e.g. ACD Dojang Arena)"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <input
                type="text"
                placeholder="Event Poster Web URL (e.g. https://images.com/... or /assets/IMG_4159.PNG)"
                value={newEventForm.image}
                onChange={(e) => setNewEventForm({ ...newEventForm, image: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />

              <textarea
                required
                rows={3}
                placeholder="Event description..."
                value={newEventForm.desc}
                onChange={(e) => setNewEventForm({ ...newEventForm, desc: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
              />

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE MASTER CREDENTIALS */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-outfit text-white">Update Admin Credentials</h3>
                <p className="text-xs text-slate-400">Set custom username & password for Master Admin login</p>
              </div>
            </div>

            <form onSubmit={handleUpdateCreds} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Admin Username *</label>
                <input
                  type="text"
                  required
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  placeholder="Enter new admin username"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Admin Password *</label>
                <div className="relative">
                  <input
                    type={showPassText ? 'text' : 'password'}
                    required
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Enter new admin password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCredsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
                >
                  Save New Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center justify-between">
              <span>Edit Student Profile</span>
              <span className="font-mono text-amber-400 text-xs font-semibold">{editingStudent.id}</span>
            </h3>

            <form onSubmit={handleUpdateStudentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={editingStudent.dob}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Gender *</label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.guardianName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Training Batch *</label>
                  <select
                    value={editingStudent.batch}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Evening 5:00 To 6:00">Evening 5:00 To 6:00</option>
                    <option value="Evening 6:30 To 7:30">Evening 6:30 To 7:30</option>
                    <option value="Evening 8:00 To 9:00">Evening 8:00 To 9:00</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Belt Rank *</label>
                  <select
                    value={editingStudent.beltLevel}
                    onChange={(e) => setEditingStudent({ ...editingStudent, beltLevel: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="White Belt">White Belt</option>
                    <option value="Yellow Belt">Yellow Belt</option>
                    <option value="Green Belt">Green Belt</option>
                    <option value="Green-1 Belt">Green-1 Belt</option>
                    <option value="Blue Belt">Blue Belt</option>
                    <option value="Blue-1 Belt">Blue-1 Belt</option>
                    <option value="Red Belt">Red Belt</option>
                    <option value="Red-1 Belt">Red-1 Belt</option>
                    <option value="Black Belt">Black Belt</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Address / City</label>
                <input
                  type="text"
                  value={editingStudent.address || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACHIEVEMENT */}
      {editingAchievement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center justify-between">
              <span>Edit Achievement Record</span>
              <span className="font-mono text-amber-400 text-xs font-semibold">{editingAchievement.id}</span>
            </h3>

            <form onSubmit={handleUpdateAchievementSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={editingAchievement.title}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Student Athlete Name</label>
                <input
                  type="text"
                  value={editingAchievement.studentName || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, studentName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Position / Medal *</label>
                  <input
                    type="text"
                    required
                    value={editingAchievement.position}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, position: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingAchievement.date}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Photo / Image Web URL</label>
                <input
                  type="text"
                  value={editingAchievement.imageUrl || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, imageUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingAchievement.description}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAchievement(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EVENT */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center justify-between">
              <span>Edit Upcoming Event</span>
              <span className="font-mono text-amber-400 text-xs font-semibold">{editingEvent.id}</span>
            </h3>

            <form onSubmit={handleUpdateEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Category *</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Belt Grading Test">Belt Grading Test</option>
                    <option value="State Tournament">State Tournament</option>
                    <option value="Special Workshop">Special Workshop</option>
                    <option value="Self Defense Camp">Self Defense Camp</option>
                    <option value="District Championship">District Championship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Location *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Event Poster Web URL</label>
                <input
                  type="text"
                  value={editingEvent.image || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Event Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingEvent.desc}
                  onChange={(e) => setEditingEvent({ ...editingEvent, desc: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
                >
                  Save Event Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
