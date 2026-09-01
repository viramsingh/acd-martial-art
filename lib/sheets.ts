import { Student, AttendanceRecord, Achievement, ContactMessage, StudentRegistration, UpcomingEvent } from '@/types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_ACHIEVEMENTS, INITIAL_MESSAGES, INITIAL_REGISTRATIONS, INITIAL_EVENTS } from './data';

// Key names for browser / session data store
const KEYS = {
  STUDENTS: 'acd_students_v1',
  ATTENDANCE: 'acd_attendance_v1',
  ACHIEVEMENTS: 'acd_achievements_v1',
  EVENTS: 'acd_events_v1',
  MESSAGES: 'acd_messages_v1',
  REGISTRATIONS: 'acd_registrations_v1',
  CONFIG: 'acd_google_sheets_config'
};

// Interface for optional Google Apps Script Web App URL
export interface GoogleSheetsConfig {
  webAppUrl: string; // e.g. https://script.google.com/macros/s/AKfycbx.../exec
  enabled: boolean;
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  if (typeof window === 'undefined') {
    return { webAppUrl: '', enabled: false };
  }
  const saved = localStorage.getItem(KEYS.CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return { webAppUrl: '', enabled: false };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }
}

/**
 * Connect and test Google Sheets Web App endpoint
 */
export async function connectGoogleSheet(webAppUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'Please enter a valid Google Apps Script Web App URL.' };
  }

  const cleanUrl = webAppUrl.trim();

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CONNECT_TEST',
        payload: { message: 'Google Sheet connection established successfully' },
        timestamp: new Date().toISOString()
      })
    });

    saveGoogleSheetsConfig({ webAppUrl: cleanUrl, enabled: true });

    return {
      success: true,
      message: 'Google Sheet connected successfully! Settings updated.'
    };
  } catch (err: any) {
    console.error('Google Sheet connection error:', err);
    return {
      success: false,
      message: `Failed to connect to Google Sheet: ${err?.message || 'Network error'}`
    };
  }
}


// Global store initialization helper
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Sync to Google Apps Script Endpoint if configured
async function syncToGoogleSheets(action: string, payload: any) {
  const config = getGoogleSheetsConfig();
  if (!config.enabled || !config.webAppUrl) return;

  try {
    await fetch(config.webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, timestamp: new Date().toISOString() })
    });
  } catch (err) {
    console.warn('Google Sheets API sync note:', err);
  }
}

// -------------------------------------------------------------
// STUDENTS API
// -------------------------------------------------------------
export function getStudents(): Student[] {
  return getItem<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function saveStudent(student: Partial<Omit<Student, 'id'>> & { fullName: string; phone: string; guardianName: string; batch: Student['batch']; beltLevel: Student['beltLevel']; id?: string }): Student {
  const students = getStudents();
  if (student.id) {
    const index = students.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      students[index] = { ...students[index], ...student } as Student;
      setItem(KEYS.STUDENTS, students);
      syncToGoogleSheets('UPDATE_STUDENT', students[index]);
      return students[index];
    }
  }

  // New Student ID Generation (ACD-2026-00X)
  const count = students.length + 1;
  const newId = `ACD-2026-${String(count).padStart(3, '0')}`;
  const newStudent: Student = {
    ...student,
    id: newId,
    status: student.status || 'ACTIVE',
    joiningDate: student.joiningDate || new Date().toISOString().split('T')[0],
  } as Student;

  students.unshift(newStudent);
  setItem(KEYS.STUDENTS, students);
  syncToGoogleSheets('ADD_STUDENT', newStudent);
  return newStudent;
}

export function updateStudentBelt(studentId: string, newBelt: Student['beltLevel']): Student | null {
  const students = getStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;
  student.beltLevel = newBelt;
  setItem(KEYS.STUDENTS, students);
  syncToGoogleSheets('UPDATE_BELT', { studentId, newBelt });
  return student;
}

export function deleteStudent(studentId: string): boolean {
  let students = getStudents();
  const initialLen = students.length;
  students = students.filter((s) => s.id !== studentId);
  setItem(KEYS.STUDENTS, students);
  if (students.length < initialLen) {
    syncToGoogleSheets('DELETE_STUDENT', { studentId });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// ATTENDANCE API
// -------------------------------------------------------------
export function getAttendanceRecords(date?: string): AttendanceRecord[] {
  const records = getItem<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  if (date) {
    return records.filter((r) => r.date === date);
  }
  return records;
}

export function markAttendance(
  date: string,
  updates: Array<{ studentId: string; studentName: string; batch: string; status: AttendanceRecord['status']; remarks?: string }>
): AttendanceRecord[] {
  const records = getAttendanceRecords();
  const updatedRecords = [...records];
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  for (const item of updates) {
    // Duplicate check for date + studentId
    const existingIndex = updatedRecords.findIndex((r) => r.date === date && r.studentId === item.studentId);
    if (existingIndex !== -1) {
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        status: item.status,
        remarks: item.remarks || updatedRecords[existingIndex].remarks,
        checkInTime: item.status === 'PRESENT' ? nowStr : undefined,
      };
    } else {
      const newRec: AttendanceRecord = {
        id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date,
        studentId: item.studentId,
        studentName: item.studentName,
        batch: item.batch,
        status: item.status,
        checkInTime: item.status === 'PRESENT' ? nowStr : undefined,
        remarks: item.remarks,
      };
      updatedRecords.unshift(newRec);
    }
  }

  setItem(KEYS.ATTENDANCE, updatedRecords);
  syncToGoogleSheets('MARK_ATTENDANCE', { date, updates });
  return updatedRecords;
}

// -------------------------------------------------------------
// ACHIEVEMENTS API
// -------------------------------------------------------------
export function getAchievements(): Achievement[] {
  return getItem<Achievement[]>(KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
}

export function addAchievement(achievement: Omit<Achievement, 'id'>): Achievement {
  const list = getAchievements();
  const newId = `ACH-${String(list.length + 1).padStart(3, '0')}`;
  const newAchievement: Achievement = {
    ...achievement,
    id: newId,
    imageUrl: achievement.imageUrl || '/assets/achievement_trophy.jpg',
  };
  list.unshift(newAchievement);
  setItem(KEYS.ACHIEVEMENTS, list);
  syncToGoogleSheets('ADD_ACHIEVEMENT', newAchievement);
  return newAchievement;
}

export function updateAchievement(achievement: Achievement): Achievement | null {
  const list = getAchievements();
  const index = list.findIndex((a) => a.id === achievement.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...achievement };
    setItem(KEYS.ACHIEVEMENTS, list);
    syncToGoogleSheets('UPDATE_ACHIEVEMENT', list[index]);
    return list[index];
  }
  return null;
}

export function deleteAchievement(id: string): boolean {
  let list = getAchievements();
  const initLen = list.length;
  list = list.filter((a) => a.id !== id);
  setItem(KEYS.ACHIEVEMENTS, list);
  if (list.length < initLen) {
    syncToGoogleSheets('DELETE_ACHIEVEMENT', { id });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// UPCOMING EVENTS API
// -------------------------------------------------------------
export function getEvents(): UpcomingEvent[] {
  return getItem<UpcomingEvent[]>(KEYS.EVENTS, INITIAL_EVENTS);
}

export function addEvent(event: Omit<UpcomingEvent, 'id'>): UpcomingEvent {
  const list = getEvents();
  const newId = `EVT-${String(list.length + 1).padStart(3, '0')}`;
  const newEvent: UpcomingEvent = {
    ...event,
    id: newId,
    badgeColor: event.badgeColor || 'bg-red-600 text-white',
    image: event.image || '/assets/IMG_4159.PNG',
  };
  list.unshift(newEvent);
  setItem(KEYS.EVENTS, list);
  syncToGoogleSheets('ADD_EVENT', newEvent);
  return newEvent;
}

export function updateEvent(event: UpcomingEvent): UpcomingEvent | null {
  const list = getEvents();
  const index = list.findIndex((e) => e.id === event.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...event };
    setItem(KEYS.EVENTS, list);
    syncToGoogleSheets('UPDATE_EVENT', list[index]);
    return list[index];
  }
  return null;
}

export function deleteEvent(id: string): boolean {
  let list = getEvents();
  const initLen = list.length;
  list = list.filter((e) => e.id !== id);
  setItem(KEYS.EVENTS, list);
  if (list.length < initLen) {
    syncToGoogleSheets('DELETE_EVENT', { id });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// CONTACT MESSAGES API
// -------------------------------------------------------------
export function getContactMessages(): ContactMessage[] {
  return getItem<ContactMessage[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
}

export function addContactMessage(message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): ContactMessage {
  const list = getContactMessages();
  const newMsg: ContactMessage = {
    ...message,
    id: `MSG-${String(list.length + 1).padStart(3, '0')}`,
    status: 'NEW',
    createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };
  list.unshift(newMsg);
  setItem(KEYS.MESSAGES, list);
  syncToGoogleSheets('ADD_MESSAGE', newMsg);
  return newMsg;
}

export function markMessageRead(id: string): void {
  const list = getContactMessages();
  const msg = list.find((m) => m.id === id);
  if (msg) {
    msg.status = 'READ';
    setItem(KEYS.MESSAGES, list);
  }
}

export function deleteContactMessage(id: string): boolean {
  let list = getContactMessages();
  const initLen = list.length;
  list = list.filter((m) => m.id !== id);
  setItem(KEYS.MESSAGES, list);
  if (list.length < initLen) {
    syncToGoogleSheets('DELETE_MESSAGE', { id });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// REGISTRATIONS API
// -------------------------------------------------------------
export function getRegistrations(): StudentRegistration[] {
  return getItem<StudentRegistration[]>(KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
}

export function submitRegistration(regData: Omit<StudentRegistration, 'id' | 'status' | 'submittedAt'>): StudentRegistration {
  const list = getRegistrations();
  const newReg: StudentRegistration = {
    ...regData,
    id: `REG-2026-${String(list.length + 1).padStart(3, '0')}`,
    status: 'PENDING',
    submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };
  list.unshift(newReg);
  setItem(KEYS.REGISTRATIONS, list);
  syncToGoogleSheets('SUBMIT_REGISTRATION', newReg);
  return newReg;
}

export function approveRegistration(id: string): Student | null {
  const list = getRegistrations();
  const reg = list.find((r) => r.id === id);
  if (!reg) return null;

  reg.status = 'APPROVED';
  setItem(KEYS.REGISTRATIONS, list);

  // Convert registration into Active Student record
  const student = saveStudent({
    fullName: reg.fullName,
    dob: reg.dob,
    gender: reg.gender as any,
    phone: reg.phone,
    email: reg.email,
    address: reg.address,
    guardianName: reg.guardianName,
    emergencyPhone: reg.emergencyPhone,
    schoolName: reg.schoolName,
    batch: reg.batch as any,
    beltLevel: reg.beltLevel,
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  return student;
}

export function rejectRegistration(id: string): void {
  const list = getRegistrations();
  const reg = list.find((r) => r.id === id);
  if (reg) {
    reg.status = 'REJECTED';
    setItem(KEYS.REGISTRATIONS, list);
  }
}
