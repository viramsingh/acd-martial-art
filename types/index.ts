export type BeltLevel = 
  | 'White Belt' 
  | 'Yellow Belt' 
  | 'Green Belt' 
  | 'Green-1 Belt'
  | 'Blue Belt' 
  | 'Blue-1 Belt'
  | 'Red Belt' 
  | 'Red-1 Belt'
  | 'Black Belt';

export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Student {
  id: string; // e.g. ACD-2026-001
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address: string;
  guardianName: string;
  emergencyPhone: string;
  schoolName?: string;
  batch: string;
  beltLevel: BeltLevel;
  joiningDate: string;
  status: StudentStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  batch: string;
  status: AttendanceStatus;
  checkInTime?: string;
  remarks?: string;
}

export interface Achievement {
  id: string;
  title: string;
  studentId?: string;
  studentName?: string;
  event: string;
  position: string;
  date: string;
  imageUrl?: string;
  description: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  createdAt: string;
}

export interface StudentRegistration {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  guardianName: string;
  emergencyPhone: string;
  schoolName?: string;
  batch: string;
  beltLevel: BeltLevel;
  experience?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  badgeColor?: string;
  image?: string;
}
