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
}

const DEFAULT_DB: DatabaseSchema = {
  students: [],
  attendance: [],
  achievements: [],
  events: [],
  messages: [],
  registrations: [],
  sheetsConfig: {
    webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL || "https://script.google.com/macros/s/AKfycbwhME94Ico9R-W4GvHpfGG81yn-ZLOMa7Y8ltV3rg_P_domCTBbBzkOdOMJ9GKHWTZE/exec",
    enabled: true
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
  if (memoryDb) {
    return memoryDb;
  }

  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  memoryDb = { ...DEFAULT_DB };
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(db: DatabaseSchema): void {
  memoryDb = db;
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

// -------------------------------------------------------------
// STUDENTS DB METHODS
// -------------------------------------------------------------
export function getStudentsDB(): Student[] {
  return getDatabase().students || [];
}

export function saveStudentDB(studentData: Partial<Omit<Student, 'id'>> & { fullName: string; phone: string; guardianName: string; batch: Student['batch']; beltLevel: Student['beltLevel']; id?: string }): Student {
  const db = getDatabase();
  const students = [...db.students];

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

  const count = students.length + 1;
  const newId = `ACD-2026-${String(count).padStart(3, '0')}`;
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
  if (db.students.length < initialLen) {
    saveDatabase(db);
    syncToGoogleSheets('DELETE_STUDENT', { studentId });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// ATTENDANCE DB METHODS
// -------------------------------------------------------------
export function getAttendanceRecordsDB(date?: string): AttendanceRecord[] {
  const records = getDatabase().attendance || [];
  if (date) {
    return records.filter((r) => r.date === date);
  }
  return records;
}

export function markAttendanceDB(
  date: string,
  updates: Array<{ studentId: string; studentName: string; batch: string; status: AttendanceRecord['status']; remarks?: string }>
): AttendanceRecord[] {
  const db = getDatabase();
  const updatedRecords = [...db.attendance];
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  for (const item of updates) {
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

  db.attendance = updatedRecords;
  saveDatabase(db);
  syncToGoogleSheets('MARK_ATTENDANCE', { date, updates });
  return updatedRecords;
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
  const newId = `ACH-${String(list.length + 1).padStart(3, '0')}`;
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
  if (db.achievements.length < initLen) {
    saveDatabase(db);
    syncToGoogleSheets('DELETE_ACHIEVEMENT', { id });
    return true;
  }
  return false;
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
  const newId = `EVT-${String(list.length + 1).padStart(3, '0')}`;
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
  if (db.events.length < initLen) {
    saveDatabase(db);
    syncToGoogleSheets('DELETE_EVENT', { id });
    return true;
  }
  return false;
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
  const newMsg: ContactMessage = {
    ...message,
    id: `MSG-${String(list.length + 1).padStart(3, '0')}`,
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
  if (db.messages.length < initLen) {
    saveDatabase(db);
    syncToGoogleSheets('DELETE_MESSAGE', { id });
    return true;
  }
  return false;
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
  const newReg: StudentRegistration = {
    ...regData,
    id: `REG-2026-${String(list.length + 1).padStart(3, '0')}`,
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
