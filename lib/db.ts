import fs from 'fs';
import path from 'path';
import { Student, AttendanceRecord, Achievement, ContactMessage, StudentRegistration, UpcomingEvent } from '@/types';
import { getSupabaseClient, isSupabaseConfigured, syncMutationToSupabase } from './supabase';

export interface GoogleSheetsConfig {
  webAppUrl: string;
  enabled: boolean;
}

export interface DatabaseSchema {
  students: Student[];
  attendance: AttendanceRecord[];
  achievements: Achievement[];
  events: UpcomingEvent[];
  messages: ContactMessage[];
  registrations: StudentRegistration[];
  sheetsConfig: GoogleSheetsConfig;
  deletedIds?: string[];
}

const DEFAULT_DB: DatabaseSchema = {
  students: [],
  attendance: [],
  achievements: [],
  events: [],
  messages: [],
  registrations: [],
  deletedIds: [],
  sheetsConfig: {
    webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL || "",
    enabled: !!process.env.GOOGLE_SHEETS_WEB_APP_URL
  }
};

// Helper to determine writable db path
function getDbFilePath(): string {
  if (process.env.DB_FILE_PATH) {
    return process.env.DB_FILE_PATH;
  }

  const primaryPath = path.join(process.cwd(), 'data', 'db.json');
  const dir = path.dirname(primaryPath);

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.accessSync(/*turbopackIgnore: true*/ dir, fs.constants.W_OK);
    return primaryPath;
  } catch {
    return path.join('/tmp', 'acd_db.json');
  }
}

// In-memory cache for ultra-fast response & thread safety
let memoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
      memoryDb = JSON.parse(content);
      if (memoryDb) {
        memoryDb.deletedIds = memoryDb.deletedIds || [];
      }
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  if (memoryDb) {
    memoryDb.deletedIds = memoryDb.deletedIds || [];
    return memoryDb;
  }

  memoryDb = { ...DEFAULT_DB, deletedIds: [] };
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(db: DatabaseSchema): void {
  memoryDb = db;
  lastSyncTimestamp = 0;
  const filePath = getDbFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Async sync to Google Sheets if configured
async function syncToGoogleSheets(_action: string, _payload: any) {
  // No-op: Supabase handles 100% of persistent data storage
}

let lastSyncTimestamp = 0;
const SYNC_CACHE_TTL = 60 * 1000; // 60 seconds cache TTL for super-fast API response

// Async sync FROM Supabase Cloud PostgreSQL
export async function syncFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const [studentsRes, attendanceRes, achievementsRes, eventsRes, messagesRes, registrationsRes, sheetsConfigRes] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('achievements').select('*'),
      supabase.from('events').select('*'),
      supabase.from('messages').select('*'),
      supabase.from('registrations').select('*'),
      supabase.from('sheets_config').select('*').eq('id', 'config_primary').maybeSingle(),
    ]);

    const db = getDatabase();

    if (studentsRes.data) {
      db.students = studentsRes.data.map((s: any) => ({
        id: s.id,
        fullName: s.full_name,
        dob: s.dob || '',
        gender: s.gender || 'Male',
        phone: s.phone || '',
        email: s.email || '',
        address: s.address || '',
        guardianName: s.guardian_name || '',
        emergencyPhone: s.emergency_phone || '',
        schoolName: s.school_name || '',
        batch: s.batch || 'Evening 5:00 To 6:00',
        beltLevel: s.belt_level || 'White Belt',
        status: s.status || 'ACTIVE',
        joiningDate: s.joining_date || ''
      }));
    }

    if (attendanceRes.data) {
      db.attendance = attendanceRes.data.map((a: any) => ({
        id: a.id,
        date: a.date,
        studentId: a.student_id,
        studentName: a.student_name,
        batch: a.batch || '',
        status: a.status || 'PRESENT',
        checkInTime: a.check_in_time || '',
        remarks: a.remarks || ''
      }));
    }

    if (achievementsRes.data) {
      db.achievements = achievementsRes.data.map((a: any) => ({
        id: a.id,
        title: a.title,
        studentName: a.student_name,
        event: a.event || '',
        position: a.position || '',
        date: a.date || '',
        description: a.description || '',
        imageUrl: a.image_url || ''
      }));
    }

    if (eventsRes.data) {
      db.events = eventsRes.data.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category || 'EVENT',
        date: e.date || '',
        time: e.time || '',
        location: e.location || '',
        desc: e.description || '',
        badgeColor: e.badge_color || 'gold'
      }));
    }

    if (messagesRes.data) {
      db.messages = messagesRes.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email || '',
        phone: m.phone || '',
        subject: m.subject || '',
        message: m.message || '',
        status: m.status || 'NEW',
        createdAt: m.created_at || ''
      }));
    }

    if (registrationsRes.data) {
      db.registrations = registrationsRes.data.map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        dob: r.dob || '',
        gender: r.gender || 'Male',
        phone: r.phone || '',
        email: r.email || '',
        address: r.address || '',
        guardianName: r.guardian_name || '',
        emergencyPhone: r.emergency_phone || '',
        schoolName: r.school_name || '',
        batch: r.batch || 'Evening 5:00 To 6:00',
        beltLevel: r.belt_level || 'White Belt',
        experience: r.experience || 'Beginner',
        status: r.status || 'PENDING',
        submittedAt: r.submitted_at || ''
      }));
    }

    if (sheetsConfigRes.data) {
      db.sheetsConfig = {
        webAppUrl: sheetsConfigRes.data.web_app_url || '',
        enabled: sheetsConfigRes.data.enabled !== false
      };
    }

    saveDatabase(db);
    return true;
  } catch (err) {
    console.error('Supabase sync error:', err);
    return false;
  }
}

// High-performance Database Sync directly using Supabase Cloud PostgreSQL
export async function syncFromGoogleSheets(_force: boolean = false, _request?: Request): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await syncFromSupabase();
  }
  return true;
}

// -------------------------------------------------------------
// DUPLICATE CHECK HELPER
// -------------------------------------------------------------
export function isDuplicateStudentOrRegistration(data: { phone?: string; email?: string; fullName?: string }): { isDuplicate: boolean; reason?: string } {
  const db = getDatabase();
  const phone = data.phone ? data.phone.replace(/\D/g, '').trim() : '';
  const email = data.email ? data.email.toLowerCase().trim() : '';
  const fullName = data.fullName ? data.fullName.toLowerCase().trim() : '';

  if (!phone && !email && !fullName) return { isDuplicate: false };

  const phoneMap = new Map<string, string>();
  const emailMap = new Map<string, string>();

  // 1. Index active students
  for (const s of db.students || []) {
    const p = s.phone ? s.phone.replace(/\D/g, '').trim() : '';
    const e = s.email ? s.email.toLowerCase().trim() : '';
    if (p && p.length >= 7) phoneMap.set(p, s.fullName);
    if (e) emailMap.set(e, s.fullName);
  }

  // 2. Index pending/approved registrations
  for (const r of db.registrations || []) {
    if (r.status === 'REJECTED') continue;
    const p = r.phone ? r.phone.replace(/\D/g, '').trim() : '';
    const e = r.email ? r.email.toLowerCase().trim() : '';
    if (p && p.length >= 7 && !phoneMap.has(p)) phoneMap.set(p, `${r.fullName} (Application Submitted)`);
    if (e && !emailMap.has(e)) emailMap.set(e, `${r.fullName} (Application Submitted)`);
  }

  if (phone && phone.length >= 7 && phoneMap.has(phone)) {
    return { isDuplicate: true, reason: `Already registered! A record for (${phoneMap.get(phone)}) is already registered with phone number ${data.phone}.` };
  }
  if (email && emailMap.has(email)) {
    return { isDuplicate: true, reason: `Already registered! A record for (${emailMap.get(email)}) is already registered with email address ${data.email}.` };
  }

  return { isDuplicate: false };
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

// -------------------------------------------------------------
// STUDENTS DB METHODS
// -------------------------------------------------------------
export function getStudentsDB(): Student[] {
  const raw = getDatabase().students || [];
  const map = new Map<string, Student>();
  raw.forEach((s) => {
    if (s && s.id) {
      map.set(s.id, s);
    }
  });
  return Array.from(map.values());
}

export function saveStudentDB(studentData: Partial<Omit<Student, 'id'>> & { fullName: string; phone: string; guardianName: string; batch: Student['batch']; beltLevel: Student['beltLevel']; id?: string }): Student {
  const db = getDatabase();
  const students = getStudentsDB();

  if (studentData.id) {
    const index = students.findIndex((s) => s.id === studentData.id);
    if (index !== -1) {
      students[index] = { ...students[index], ...studentData } as Student;
      db.students = students;
      saveDatabase(db);
      syncToGoogleSheets('UPDATE_STUDENT', students[index]);
      syncMutationToSupabase('UPSERT_STUDENT', students[index]);
      return students[index];
    }
  }

  const maxNum = getMaxIdNumber(students);
  const newId = `ACD-2026-${String(maxNum + 1).padStart(3, '0')}`;
  const newStudent: Student = {
    ...studentData,
    id: newId,
    status: studentData.status || 'ACTIVE',
    joiningDate: studentData.joiningDate || new Date().toISOString().split('T')[0],
  } as Student;

  students.unshift(newStudent);
  db.students = students;
  saveDatabase(db);
  syncToGoogleSheets('ADD_STUDENT', newStudent);
  syncMutationToSupabase('UPSERT_STUDENT', newStudent);
  return newStudent;
}

export function updateStudentBeltDB(studentId: string, newBelt: Student['beltLevel']): Student | null {
  const db = getDatabase();
  const students = [...db.students];
  const index = students.findIndex((s) => s.id === studentId);
  if (index === -1) return null;

  students[index] = { ...students[index], beltLevel: newBelt };
  db.students = students;
  saveDatabase(db);
  syncToGoogleSheets('UPDATE_BELT', { studentId, newBelt });
  syncMutationToSupabase('UPSERT_STUDENT', students[index]);
  return students[index];
}

export function deleteStudentDB(studentId: string): boolean {
  const db = getDatabase();
  const initialLen = db.students.length;
  db.students = db.students.filter((s) => s.id !== studentId);
  if (!db.deletedIds) db.deletedIds = [];
  if (!db.deletedIds.includes(studentId)) db.deletedIds.push(studentId);
  saveDatabase(db);
  syncToGoogleSheets('DELETE_STUDENT', { id: studentId, studentId });
  syncMutationToSupabase('DELETE_STUDENT', { id: studentId });
  return true;
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

// -------------------------------------------------------------
// ATTENDANCE DB METHODS
// -------------------------------------------------------------
export function getAttendanceRecordsDB(date?: string): AttendanceRecord[] {
  const records = getDatabase().attendance || [];
  if (date) {
    const targetDate = formatDateYMD(date);
    return records.filter((r) => formatDateYMD(r.date) === targetDate);
  }
  return records;
}

export function markAttendanceDB(
  date: string,
  updates: Array<{ studentId: string; studentName: string; batch: string; status: AttendanceRecord['status']; remarks?: string }>
): AttendanceRecord[] {
  const db = getDatabase();
  const targetDate = formatDateYMD(date);

  const updatedRecords = [...(db.attendance || [])];

  for (const item of updates) {
    // Match by same Date + same Student + same Batch
    const existingIndex = updatedRecords.findIndex(
      (r) => formatDateYMD(r.date) === targetDate && r.studentId === item.studentId && r.batch === item.batch
    );

    if (existingIndex !== -1) {
      // Directly update existing record status
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        date: targetDate,
        status: item.status,
      };
    } else {
      // Create new entry for different batch or new date
      const newRec: AttendanceRecord = {
        id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: targetDate,
        studentId: item.studentId,
        studentName: item.studentName,
        batch: item.batch,
        status: item.status,
      };
      updatedRecords.unshift(newRec);
    }
  }

  db.attendance = updatedRecords;
  saveDatabase(db);
  syncToGoogleSheets('MARK_ATTENDANCE', { date: targetDate, updates });
  syncMutationToSupabase('MARK_ATTENDANCE', updatedRecords);
  return db.attendance;
}

// -------------------------------------------------------------
// ACHIEVEMENTS DB METHODS
// -------------------------------------------------------------
export function getAchievementsDB(): Achievement[] {
  return getDatabase().achievements || [];
}

export function addAchievementDB(achievement: Omit<Achievement, 'id'>): Achievement {
  const db = getDatabase();
  const list = [...db.achievements];
  const maxNum = getMaxIdNumber(list);
  const newId = `ACH-${String(maxNum + 1).padStart(3, '0')}`;
  const newAchievement: Achievement = {
    ...achievement,
    id: newId,
    imageUrl: achievement.imageUrl || '/assets/achievement_trophy.jpg',
  };
  list.unshift(newAchievement);
  db.achievements = list;
  saveDatabase(db);
  syncToGoogleSheets('ADD_ACHIEVEMENT', newAchievement);
  syncMutationToSupabase('UPSERT_ACHIEVEMENT', newAchievement);
  return newAchievement;
}

export function updateAchievementDB(achievement: Achievement): Achievement | null {
  const db = getDatabase();
  const list = [...db.achievements];
  const index = list.findIndex((a) => a.id === achievement.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...achievement };
    db.achievements = list;
    saveDatabase(db);
    syncToGoogleSheets('UPDATE_ACHIEVEMENT', list[index]);
    syncMutationToSupabase('UPSERT_ACHIEVEMENT', list[index]);
    return list[index];
  }
  return null;
}

export function deleteAchievementDB(id: string): boolean {
  const db = getDatabase();
  const initLen = db.achievements.length;
  db.achievements = db.achievements.filter((a) => a.id !== id);
  if (!db.deletedIds) db.deletedIds = [];
  if (!db.deletedIds.includes(id)) db.deletedIds.push(id);
  saveDatabase(db);
  syncToGoogleSheets('DELETE_ACHIEVEMENT', { id });
  syncMutationToSupabase('DELETE_ACHIEVEMENT', { id });
  return true;
}

// -------------------------------------------------------------
// EVENTS DB METHODS
// -------------------------------------------------------------
export function getEventsDB(): UpcomingEvent[] {
  return getDatabase().events || [];
}

export function addEventDB(event: Omit<UpcomingEvent, 'id'>): UpcomingEvent {
  const db = getDatabase();
  const list = [...db.events];
  const maxNum = getMaxIdNumber(list);
  const newId = `EVT-${String(maxNum + 1).padStart(3, '0')}`;
  const newEvent: UpcomingEvent = {
    ...event,
    id: newId,
    badgeColor: event.badgeColor || 'bg-red-600 text-white',
    image: event.image || '/assets/IMG_4159.PNG',
  };
  list.unshift(newEvent);
  db.events = list;
  saveDatabase(db);
  syncToGoogleSheets('ADD_EVENT', newEvent);
  syncMutationToSupabase('UPSERT_EVENT', newEvent);
  return newEvent;
}

export function updateEventDB(event: UpcomingEvent): UpcomingEvent | null {
  const db = getDatabase();
  const list = [...db.events];
  const index = list.findIndex((e) => e.id === event.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...event };
    db.events = list;
    saveDatabase(db);
    syncToGoogleSheets('UPDATE_EVENT', list[index]);
    syncMutationToSupabase('UPSERT_EVENT', list[index]);
    return list[index];
  }
  return null;
}

export function deleteEventDB(id: string): boolean {
  const db = getDatabase();
  const initLen = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  if (!db.deletedIds) db.deletedIds = [];
  if (!db.deletedIds.includes(id)) db.deletedIds.push(id);
  saveDatabase(db);
  syncToGoogleSheets('DELETE_EVENT', { id });
  syncMutationToSupabase('DELETE_EVENT', { id });
  return true;
}

// -------------------------------------------------------------
// MESSAGES DB METHODS
// -------------------------------------------------------------
export function getContactMessagesDB(): ContactMessage[] {
  return getDatabase().messages || [];
}

export function addContactMessageDB(message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): ContactMessage {
  const db = getDatabase();
  const list = [...db.messages];
  const maxNum = getMaxIdNumber(list);
  const newMsg: ContactMessage = {
    ...message,
    id: `MSG-${String(maxNum + 1).padStart(3, '0')}`,
    status: 'NEW',
    createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };
  list.unshift(newMsg);
  db.messages = list;
  saveDatabase(db);
  syncToGoogleSheets('ADD_MESSAGE', newMsg);
  syncMutationToSupabase('UPSERT_MESSAGE', newMsg);
  return newMsg;
}

export function markMessageReadDB(id: string): void {
  const db = getDatabase();
  const msg = db.messages.find((m) => m.id === id);
  if (msg) {
    msg.status = 'READ';
    saveDatabase(db);
  }
}

export function deleteContactMessageDB(id: string): boolean {
  const db = getDatabase();
  const initLen = db.messages.length;
  db.messages = db.messages.filter((m) => m.id !== id);
  if (!db.deletedIds) db.deletedIds = [];
  if (!db.deletedIds.includes(id)) db.deletedIds.push(id);
  saveDatabase(db);
  syncToGoogleSheets('DELETE_MESSAGE', { id });
  syncMutationToSupabase('DELETE_MESSAGE', { id });
  return true;
}

// -------------------------------------------------------------
// REGISTRATIONS DB METHODS
// -------------------------------------------------------------
export function getRegistrationsDB(): StudentRegistration[] {
  return getDatabase().registrations || [];
}

export function submitRegistrationDB(regData: Omit<StudentRegistration, 'id' | 'status' | 'submittedAt'>): StudentRegistration {
  const db = getDatabase();
  const list = [...db.registrations];
  const maxNum = getMaxIdNumber(list);
  const newReg: StudentRegistration = {
    ...regData,
    id: `REG-2026-${String(maxNum + 1).padStart(3, '0')}`,
    status: 'PENDING',
    submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };
  list.unshift(newReg);
  db.registrations = list;
  saveDatabase(db);
  syncToGoogleSheets('SUBMIT_REGISTRATION', newReg);
  syncMutationToSupabase('UPSERT_REGISTRATION', newReg);
  return newReg;
}

export function approveRegistrationDB(id: string): Student | null {
  const db = getDatabase();
  const reg = db.registrations.find((r) => r.id === id);
  if (!reg) return null;

  reg.status = 'APPROVED';
  saveDatabase(db);
  syncToGoogleSheets('UPDATE_REGISTRATION', reg);
  syncMutationToSupabase('UPSERT_REGISTRATION', reg);

  const student = saveStudentDB({
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

export function rejectRegistrationDB(id: string): void {
  const db = getDatabase();
  const reg = db.registrations.find((r) => r.id === id);
  if (reg) {
    reg.status = 'REJECTED';
    saveDatabase(db);
    syncToGoogleSheets('UPDATE_REGISTRATION', reg);
    syncMutationToSupabase('UPSERT_REGISTRATION', reg);
  }
}

// -------------------------------------------------------------
// SHEETS CONFIG DB METHODS
// -------------------------------------------------------------
export function getGoogleSheetsConfigDB(): GoogleSheetsConfig {
  return getDatabase().sheetsConfig || { webAppUrl: '', enabled: false };
}

export function saveGoogleSheetsConfigDB(config: GoogleSheetsConfig): void {
  const db = getDatabase();
  db.sheetsConfig = config;
  saveDatabase(db);
  syncMutationToSupabase('SAVE_SHEETS_CONFIG', config);
}
