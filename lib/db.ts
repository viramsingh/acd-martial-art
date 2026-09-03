import fs from 'fs';
import path from 'path';
import { Student, AttendanceRecord, Achievement, ContactMessage, StudentRegistration, UpcomingEvent } from '@/types';

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
async function syncToGoogleSheets(action: string, payload: any) {
  const db = getDatabase();
  const webUrl = db.sheetsConfig?.webAppUrl || process.env.GOOGLE_SHEETS_WEB_APP_URL;
  if (!webUrl || !db.sheetsConfig?.enabled) return;

  try {
    await fetch(webUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, timestamp: new Date().toISOString() })
    });
  } catch (err) {
    console.warn('Google Sheets sync notice:', err);
  }
}

let lastSyncTimestamp = 0;
const SYNC_CACHE_TTL = 60 * 1000; // 60 seconds cache TTL for super-fast API response

// Async sync FROM Google Sheets to pull all rows live into server DB
export async function syncFromGoogleSheets(force: boolean = false, request?: Request): Promise<boolean> {
  const db = getDatabase();

  let headerUrl = request?.headers?.get('x-sheets-url') || '';
  if (!headerUrl && typeof request !== 'undefined' && request?.headers?.get('cookie')) {
    const cookies = request.headers.get('cookie') || '';
    const match = cookies.match(/acd_sheets_url=([^;]+)/);
    if (match) headerUrl = decodeURIComponent(match[1]);
  }

  if (headerUrl && headerUrl.trim()) {
    db.sheetsConfig = { webAppUrl: headerUrl.trim(), enabled: true };
  }

  const webUrl = db.sheetsConfig?.webAppUrl || process.env.GOOGLE_SHEETS_WEB_APP_URL;
  if (!webUrl) return false;

  const now = Date.now();
  if (!force && (now - lastSyncTimestamp < SYNC_CACHE_TTL) && (db.students && db.students.length > 0)) {
    return true; // Return immediately from in-memory DB if available
  }

  lastSyncTimestamp = now;

  try {
    const res = await fetch(webUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GET_ALL_DATA' })
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return false; // Not a valid JSON response from Google Sheets URL
    }
    if (json && json.status === 'success' && json.data) {
      const data = json.data;

      const deletedSet = new Set(db.deletedIds || []);

      // 1. Clean 1-to-1 mapping of Students from Google Sheets (no duplication)
      if (Array.isArray(data.students) && data.students.length > 0) {
        const studentMap = new Map<string, Student>();

        data.students.forEach((s: any) => {
          if (!s) return;
          const sName = (s.fullName || s['Full Name'] || s.name || '').trim();
          if (!sName) return;

          let id = s.id ? String(s.id).trim() : '';

          // If deleted locally, skip
          if (id && deletedSet.has(id)) return;

          if (!id || studentMap.has(id)) {
            let currentMax = getMaxIdNumber(Array.from(studentMap.values()));
            id = `ACD-2026-${String(currentMax + 1).padStart(3, '0')}`;
          }

          studentMap.set(id, {
            id,
            fullName: sName,
            dob: s.dob || s.DOB || '',
            gender: s.gender || s.Gender || 'Male',
            phone: s.phone || s.Phone || '',
            email: s.email || s.Email || '',
            address: s.address || s.Address || '',
            guardianName: s.guardianName || s['Guardian Name'] || '',
            emergencyPhone: s.emergencyPhone || s['Emergency Phone'] || '',
            schoolName: s.schoolName || s['School Name'] || '',
            batch: s.batch || s.Batch || 'Evening 5:00 To 6:00',
            beltLevel: s.beltLevel || s['Belt Level'] || 'White Belt',
            status: s.status || s.Status || 'ACTIVE',
            joiningDate: s.joiningDate || s['Joining Date'] || new Date().toISOString().split('T')[0]
          });
        });

        db.students = Array.from(studentMap.values());
      }

      if (Array.isArray(data.attendance) && data.attendance.length > 0) {
        db.attendance = data.attendance;
      }
      if (Array.isArray(data.achievements) && data.achievements.length > 0) {
        db.achievements = data.achievements.filter((a: any) => !deletedSet.has(a.id));
      }
      if (Array.isArray(data.events) && data.events.length > 0) {
        db.events = data.events.filter((e: any) => !deletedSet.has(e.id));
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        db.messages = data.messages.filter((m: any) => !deletedSet.has(m.id));
      }// 2. Merge Registrations (preserve APPROVED and REJECTED status)
      if (Array.isArray(data.registrations) && data.registrations.length > 0) {
        const activeStudentPhones = new Set((db.students || []).map((s) => s.phone ? s.phone.replace(/\D/g, '').trim() : '').filter(Boolean));
        const activeStudentEmails = new Set((db.students || []).map((s) => s.email ? s.email.toLowerCase().trim() : '').filter(Boolean));
        const localRegMap = new Map<string, string>();
        (db.registrations || []).forEach((r) => {
          if (r.id) localRegMap.set(r.id, r.status);
        });

        db.registrations = data.registrations.map((r: any) => {
          const id = r.id || `REG-2026-${Math.floor(Math.random() * 1000)}`;
          const phoneClean = r.phone ? r.phone.replace(/\D/g, '').trim() : '';
          const emailClean = r.email ? r.email.toLowerCase().trim() : '';
          const localStatus = localRegMap.get(id);

          let finalStatus = r.status;
          // If already in active students or local status is APPROVED / REJECTED, enforce it!
          if (
            (phoneClean && activeStudentPhones.has(phoneClean)) ||
            (emailClean && activeStudentEmails.has(emailClean)) ||
            localStatus === 'APPROVED'
          ) {
            finalStatus = 'APPROVED';
          } else if (localStatus === 'REJECTED') {
            finalStatus = 'REJECTED';
          } else if (!finalStatus) {
            finalStatus = 'PENDING';
          }

          return {
            id,
            fullName: r.fullName || r['Full Name'] || '',
            dob: r.dob || '',
            gender: r.gender || 'Male',
            phone: r.phone || '',
            email: r.email || '',
            address: r.address || '',
            guardianName: r.guardianName || '',
            emergencyPhone: r.emergencyPhone || '',
            schoolName: r.schoolName || '',
            batch: r.batch || 'Evening 5:00 To 6:00',
            beltLevel: r.beltLevel || 'White Belt',
            experience: r.experience || 'Beginner',
            status: finalStatus as any,
            submittedAt: r.submittedAt || new Date().toLocaleString()
          };
        });
      }

      if (Array.isArray(data.attendance) && data.attendance.length > 0) {
        db.attendance = data.attendance;
      }
      if (Array.isArray(data.achievements) && data.achievements.length > 0) {
        db.achievements = data.achievements;
      }
      if (Array.isArray(data.events) && data.events.length > 0) {
        db.events = data.events;
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        db.messages = data.messages;
      }
      saveDatabase(db);
      return true;
    }
  } catch (err) {
    console.warn('Google Sheets pull sync notice:', err);
  }
  return false;
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
  return newReg;
}

export function approveRegistrationDB(id: string): Student | null {
  const db = getDatabase();
  const reg = db.registrations.find((r) => r.id === id);
  if (!reg) return null;

  reg.status = 'APPROVED';
  saveDatabase(db);
  syncToGoogleSheets('UPDATE_REGISTRATION', reg);

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
}
