import { Student, AttendanceRecord, Achievement, ContactMessage, StudentRegistration, UpcomingEvent } from '@/types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_ACHIEVEMENTS, INITIAL_MESSAGES, INITIAL_REGISTRATIONS, INITIAL_EVENTS } from './data';

const KEYS = {
  STUDENTS: 'acd_students_v1',
  ATTENDANCE: 'acd_attendance_v1',
  ACHIEVEMENTS: 'acd_achievements_v1',
  EVENTS: 'acd_events_v1',
  MESSAGES: 'acd_messages_v1',
  REGISTRATIONS: 'acd_registrations_v1',
  CONFIG: 'acd_google_sheets_config'
};

export interface GoogleSheetsConfig {
  webAppUrl: string;
  enabled: boolean;
}

export async function fetchGoogleSheetsConfig(): Promise<GoogleSheetsConfig> {
  try {
    const res = await fetch('/api/sheets-config', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && json.data) {
      setItem(KEYS.CONFIG, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('fetchGoogleSheetsConfig error:', e);
  }
  return getGoogleSheetsConfig();
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  if (typeof window === 'undefined') {
    return { webAppUrl: '', enabled: false };
  }
  const saved = localStorage.getItem(KEYS.CONFIG);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return { webAppUrl: '', enabled: false };
}

export function getApiHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const config = getGoogleSheetsConfig();
  const headers: Record<string, string> = { ...customHeaders };
  if (config && config.webAppUrl) {
    headers['x-sheets-url'] = config.webAppUrl.trim();
  }
  return headers;
}

export async function saveGoogleSheetsConfigApi(config: GoogleSheetsConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/sheets-config', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(config),
    });
    const json = await res.json();
    if (json.success) {
      setItem(KEYS.CONFIG, config);
      return true;
    }
  } catch (e) {
    console.error('saveGoogleSheetsConfigApi error:', e);
  }
  return false;
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  saveGoogleSheetsConfigApi(config);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }
}

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

export function formatDateYMD(d: string | Date): string {
  if (!d) return new Date().toISOString().split('T')[0];
  const str = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}
  return str.substring(0, 10);
}

export function getMaxIdNumber(list: Array<{ id?: string }>): number {
  let maxNum = 0;
  (list || []).forEach((item) => {
    if (item && item.id) {
      const parts = item.id.split('-');
      const lastPart = parts[parts.length - 1];
      const num = parseInt(lastPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return maxNum;
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try { return JSON.parse(data); } catch { return defaultValue; }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// -------------------------------------------------------------
// STUDENTS API CLIENT
// -------------------------------------------------------------
export async function fetchStudents(): Promise<Student[]> {
  try {
    const res = await fetch('/api/students', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.STUDENTS, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API fetch failed, falling back to cached local storage:', e);
  }
  return getStudents();
}

export function getStudents(): Student[] {
  const raw = getItem<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  const map = new Map<string, Student>();
  raw.forEach((s) => {
    if (s && s.id) {
      map.set(s.id, s);
    }
  });
  return Array.from(map.values());
}

export async function saveStudentApi(studentData: any): Promise<Student | null> {
  const method = studentData.id ? 'PUT' : 'POST';
  const res = await fetch('/api/students', {
    method,
    headers: getApiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(studentData),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to save student record');
  }
  await fetchStudents();
  return json.data;
}

export function saveStudent(student: any): Student {
  saveStudentApi(student);
  const students = getStudents();
  if (student.id) {
    const idx = students.findIndex(s => s.id === student.id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...student };
      setItem(KEYS.STUDENTS, students);
      return students[idx];
    }
  }
  const newStudent = { ...student, id: student.id || `ACD-2026-${String(students.length + 1).padStart(3, '0')}` };
  students.unshift(newStudent);
  setItem(KEYS.STUDENTS, students);
  return newStudent;
}

export async function updateStudentBeltApi(studentId: string, newBelt: Student['beltLevel']): Promise<Student | null> {
  try {
    const res = await fetch('/api/students', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'UPDATE_BELT', studentId, newBelt }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchStudents();
      return json.data;
    }
  } catch (e) {
    console.error('updateStudentBeltApi error:', e);
  }
  return null;
}

export function updateStudentBelt(studentId: string, newBelt: Student['beltLevel']): Student | null {
  updateStudentBeltApi(studentId, newBelt);
  const students = getStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;
  student.beltLevel = newBelt;
  setItem(KEYS.STUDENTS, students);
  return student;
}

export async function deleteStudentApi(studentId: string): Promise<boolean> {
  try {
    let students = getStudents().filter((s) => s.id !== studentId);
    setItem(KEYS.STUDENTS, students);
    const res = await fetch(`/api/students?id=${encodeURIComponent(studentId)}`, { method: 'DELETE', headers: getApiHeaders() });
    const json = await res.json();
    if (json.success) {
      await fetchStudents();
      return true;
    }
  } catch (e) {
    console.error('deleteStudentApi error:', e);
  }
  return false;
}

export function deleteStudent(studentId: string): boolean {
  deleteStudentApi(studentId);
  let students = getStudents();
  const initLen = students.length;
  students = students.filter((s) => s.id !== studentId);
  setItem(KEYS.STUDENTS, students);
  return students.length < initLen;
}

// -------------------------------------------------------------
// ATTENDANCE API CLIENT
// -------------------------------------------------------------
export async function fetchAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
  try {
    const url = date ? `/api/attendance?date=${encodeURIComponent(date)}` : '/api/attendance';
    const res = await fetch(url, { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.ATTENDANCE, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API attendance fetch error:', e);
  }
  return getAttendanceRecords(date);
}

export function getAttendanceRecords(date?: string): AttendanceRecord[] {
  const records = getItem<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  if (date) return records.filter((r) => r.date === date);
  return records;
}

export async function markAttendanceApi(date: string, updates: any[]): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ date, updates }),
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.ATTENDANCE, json.data);
      return json.data;
    }
  } catch (e) {
    console.error('markAttendanceApi error:', e);
  }
  return markAttendance(date, updates);
}

export function markAttendance(date: string, updates: any[]): AttendanceRecord[] {
  markAttendanceApi(date, updates);
  return getAttendanceRecords(date);
}

// -------------------------------------------------------------
// ACHIEVEMENTS API CLIENT
// -------------------------------------------------------------
export async function fetchAchievements(): Promise<Achievement[]> {
  try {
    const res = await fetch('/api/achievements', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.ACHIEVEMENTS, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API achievements fetch error:', e);
  }
  return getAchievements();
}

export function getAchievements(): Achievement[] {
  return getItem<Achievement[]>(KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
}

export async function addAchievementApi(achievement: any): Promise<Achievement | null> {
  try {
    const res = await fetch('/api/achievements', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(achievement),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchAchievements();
      return json.data;
    }
  } catch (e) {
    console.error('addAchievementApi error:', e);
  }
  return null;
}

export function addAchievement(achievement: any): Achievement {
  addAchievementApi(achievement);
  const list = getAchievements();
  const newObj = { ...achievement, id: `ACH-${String(list.length + 1).padStart(3, '0')}` };
  list.unshift(newObj);
  setItem(KEYS.ACHIEVEMENTS, list);
  return newObj;
}

export async function updateAchievementApi(achievement: Achievement): Promise<Achievement | null> {
  try {
    const res = await fetch('/api/achievements', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(achievement),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchAchievements();
      return json.data;
    }
  } catch (e) {
    console.error('updateAchievementApi error:', e);
  }
  return null;
}

export function updateAchievement(achievement: Achievement): Achievement | null {
  updateAchievementApi(achievement);
  const list = getAchievements();
  const idx = list.findIndex(a => a.id === achievement.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...achievement };
    setItem(KEYS.ACHIEVEMENTS, list);
    return list[idx];
  }
  return null;
}

export async function deleteAchievementApi(id: string): Promise<boolean> {
  try {
    let list = getAchievements().filter((a) => a.id !== id);
    setItem(KEYS.ACHIEVEMENTS, list);
    const res = await fetch(`/api/achievements?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: getApiHeaders() });
    const json = await res.json();
    if (json.success) {
      await fetchAchievements();
      return true;
    }
  } catch (e) {
    console.error('deleteAchievementApi error:', e);
  }
  return false;
}

export function deleteAchievement(id: string): boolean {
  deleteAchievementApi(id);
  let list = getAchievements();
  const initLen = list.length;
  list = list.filter((a) => a.id !== id);
  setItem(KEYS.ACHIEVEMENTS, list);
  return list.length < initLen;
}

// -------------------------------------------------------------
// UPCOMING EVENTS API CLIENT
// -------------------------------------------------------------
export async function fetchEvents(): Promise<UpcomingEvent[]> {
  try {
    const res = await fetch('/api/events', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.EVENTS, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API events fetch error:', e);
  }
  return getEvents();
}

export function getEvents(): UpcomingEvent[] {
  return getItem<UpcomingEvent[]>(KEYS.EVENTS, INITIAL_EVENTS);
}

export async function addEventApi(event: any): Promise<UpcomingEvent | null> {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(event),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchEvents();
      return json.data;
    }
  } catch (e) {
    console.error('addEventApi error:', e);
  }
  return null;
}

export function addEvent(event: any): UpcomingEvent {
  addEventApi(event);
  const list = getEvents();
  const newObj = { ...event, id: `EVT-${String(list.length + 1).padStart(3, '0')}` };
  list.unshift(newObj);
  setItem(KEYS.EVENTS, list);
  return newObj;
}

export async function updateEventApi(event: UpcomingEvent): Promise<UpcomingEvent | null> {
  try {
    const res = await fetch('/api/events', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(event),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchEvents();
      return json.data;
    }
  } catch (e) {
    console.error('updateEventApi error:', e);
  }
  return null;
}

export function updateEvent(event: UpcomingEvent): UpcomingEvent | null {
  updateEventApi(event);
  const list = getEvents();
  const idx = list.findIndex(e => e.id === event.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...event };
    setItem(KEYS.EVENTS, list);
    return list[idx];
  }
  return null;
}

export async function deleteEventApi(id: string): Promise<boolean> {
  try {
    let list = getEvents().filter((e) => e.id !== id);
    setItem(KEYS.EVENTS, list);
    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: getApiHeaders() });
    const json = await res.json();
    if (json.success) {
      await fetchEvents();
      return true;
    }
  } catch (e) {
    console.error('deleteEventApi error:', e);
  }
  return false;
}

export function deleteEvent(id: string): boolean {
  deleteEventApi(id);
  let list = getEvents();
  const initLen = list.length;
  list = list.filter((e) => e.id !== id);
  setItem(KEYS.EVENTS, list);
  return list.length < initLen;
}

// -------------------------------------------------------------
// CONTACT MESSAGES API CLIENT
// -------------------------------------------------------------
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const res = await fetch('/api/contact', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.MESSAGES, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API contact fetch error:', e);
  }
  return getContactMessages();
}

export function getContactMessages(): ContactMessage[] {
  return getItem<ContactMessage[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
}

export async function addContactMessageApi(message: any): Promise<ContactMessage | null> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(message),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchContactMessages();
      return json.data;
    }
  } catch (e) {
    console.error('addContactMessageApi error:', e);
  }
  return null;
}

export function addContactMessage(message: any): ContactMessage {
  addContactMessageApi(message);
  const list = getContactMessages();
  const newObj = { ...message, id: `MSG-${String(list.length + 1).padStart(3, '0')}`, status: 'NEW', createdAt: new Date().toLocaleString() };
  list.unshift(newObj);
  setItem(KEYS.MESSAGES, list);
  return newObj;
}

export async function markMessageReadApi(id: string): Promise<void> {
  try {
    await fetch('/api/contact', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    await fetchContactMessages();
  } catch (e) {
    console.error('markMessageReadApi error:', e);
  }
}

export function markMessageRead(id: string): void {
  markMessageReadApi(id);
  const list = getContactMessages();
  const msg = list.find((m) => m.id === id);
  if (msg) {
    msg.status = 'READ';
    setItem(KEYS.MESSAGES, list);
  }
}

export async function deleteContactMessageApi(id: string): Promise<boolean> {
  try {
    let list = getContactMessages().filter((m) => m.id !== id);
    setItem(KEYS.MESSAGES, list);
    const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: getApiHeaders() });
    const json = await res.json();
    if (json.success) {
      await fetchContactMessages();
      return true;
    }
  } catch (e) {
    console.error('deleteContactMessageApi error:', e);
  }
  return false;
}

export function deleteContactMessage(id: string): boolean {
  deleteContactMessageApi(id);
  let list = getContactMessages();
  const initLen = list.length;
  list = list.filter((m) => m.id !== id);
  setItem(KEYS.MESSAGES, list);
  return list.length < initLen;
}

// -------------------------------------------------------------
// REGISTRATIONS API CLIENT
// -------------------------------------------------------------
export async function fetchRegistrations(): Promise<StudentRegistration[]> {
  try {
    const res = await fetch('/api/registrations', { headers: getApiHeaders() });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setItem(KEYS.REGISTRATIONS, json.data);
      return json.data;
    }
  } catch (e) {
    console.warn('API registrations fetch error:', e);
  }
  return getRegistrations();
}

export function getRegistrations(): StudentRegistration[] {
  return getItem<StudentRegistration[]>(KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
}

export async function submitRegistrationApi(regData: any): Promise<StudentRegistration> {
  const res = await fetch('/api/registrations', {
    method: 'POST',
    headers: getApiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(regData),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to submit student registration');
  }
  await fetchRegistrations();
  return json.data;
}

export function submitRegistration(regData: any): StudentRegistration {
  submitRegistrationApi(regData);
  const list = getRegistrations();
  const newObj = {
    ...regData,
    id: `REG-2026-${String(list.length + 1).padStart(3, '0')}`,
    status: 'PENDING',
    submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };
  list.unshift(newObj);
  setItem(KEYS.REGISTRATIONS, list);
  return newObj;
}

export async function approveRegistrationApi(id: string): Promise<Student | null> {
  try {
    const res = await fetch('/api/registrations', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, action: 'APPROVE' }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      await fetchRegistrations();
      await fetchStudents();
      return json.data;
    }
  } catch (e) {
    console.error('approveRegistrationApi error:', e);
  }
  return null;
}

export function approveRegistration(id: string): Student | null {
  approveRegistrationApi(id);
  const list = getRegistrations();
  const reg = list.find((r) => r.id === id);
  if (!reg) return null;
  reg.status = 'APPROVED';
  setItem(KEYS.REGISTRATIONS, list);
  return saveStudent({
    fullName: reg.fullName,
    dob: reg.dob,
    gender: reg.gender,
    phone: reg.phone,
    email: reg.email,
    address: reg.address,
    guardianName: reg.guardianName,
    emergencyPhone: reg.emergencyPhone,
    schoolName: reg.schoolName,
    batch: reg.batch,
    beltLevel: reg.beltLevel,
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });
}

export async function rejectRegistrationApi(id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/registrations', {
      method: 'PUT',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, action: 'REJECT' }),
    });
    const json = await res.json();
    if (json.success) {
      await fetchRegistrations();
      return true;
    }
  } catch (e) {
    console.error('rejectRegistrationApi error:', e);
  }
  return false;
}

export function rejectRegistration(id: string): void {
  rejectRegistrationApi(id);
  const list = getRegistrations();
  const reg = list.find((r) => r.id === id);
  if (reg) {
    reg.status = 'REJECTED';
    setItem(KEYS.REGISTRATIONS, list);
  }
}

// -------------------------------------------------------------
// CLEAR ALL LOCAL DATA
// -------------------------------------------------------------
export function clearAllLocalStorage(): void {
  if (typeof window !== 'undefined') {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.clear();
  }
}

export async function clearAllLocalDataApi(): Promise<boolean> {
  try {
    clearAllLocalStorage();
    const res = await fetch('/api/reset-data', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      clearAllLocalStorage();
      return true;
    }
  } catch (e) {
    console.error('clearAllLocalDataApi error:', e);
  }
  return false;
}

