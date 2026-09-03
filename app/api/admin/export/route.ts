import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getDatabase, syncFromSupabase } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const session = await checkAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { origin } = new URL(request.url);

    // Ensure latest sync from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await syncFromSupabase();
      } catch (e) {
        console.error('Export sync error:', e);
      }
    }

    const db = getDatabase();

    // Create new workbook
    const workbook = XLSX.utils.book_new();

    // Helper to keep cell values under Excel's 32,767 character limit
    const sanitize = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).trim();
      if (str.startsWith('data:image/')) {
        return '[Attached Image Data]';
      }
      if (str.length > 30000) {
        return str.slice(0, 30000) + '...';
      }
      return str;
    };

    // Helper to format accessible, clickable image URLs
    const formatImageUrl = (rawUrl: any, type: 'achievement' | 'event', id: string): string => {
      if (!rawUrl) return '';
      const str = String(rawUrl).trim();
      if (!str) return '';
      if (str.startsWith('http://') || str.startsWith('https://')) {
        return str;
      }
      if (str.startsWith('/')) {
        return `${origin}${str}`;
      }
      if (str.startsWith('data:image/')) {
        return `${origin}/api/media?type=${type}&id=${encodeURIComponent(id)}`;
      }
      return str;
    };

    // 1. Students Sheet
    const studentsData = (db.students || []).map(s => ({
      'Student ID': sanitize(s.id),
      'Full Name': sanitize(s.fullName),
      'Belt Level': sanitize(s.beltLevel),
      'Batch': sanitize(s.batch),
      'Status': sanitize(s.status),
      'Phone': sanitize(s.phone),
      'Emergency Phone': sanitize(s.emergencyPhone),
      'Guardian Name': sanitize(s.guardianName),
      'Date of Birth': sanitize(s.dob),
      'Gender': sanitize(s.gender),
      'School Name': sanitize(s.schoolName),
      'Joining Date': sanitize(s.joiningDate),
      'Address': sanitize(s.address),
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsData.length ? studentsData : [{ 'Info': 'No student records' }]);
    XLSX.utils.book_append_sheet(workbook, wsStudents, 'Students');

    // 2. Attendance Sheet
    const attendanceData = (db.attendance || []).map(a => ({
      'Record ID': sanitize(a.id),
      'Date': sanitize(a.date),
      'Student ID': sanitize(a.studentId),
      'Student Name': sanitize(a.studentName),
      'Batch': sanitize(a.batch),
      'Status': sanitize(a.status),
      'Check-in Time': sanitize(a.checkInTime),
      'Remarks': sanitize(a.remarks),
    }));
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData.length ? attendanceData : [{ 'Info': 'No attendance records' }]);
    XLSX.utils.book_append_sheet(workbook, wsAttendance, 'Attendance');

    // 3. Achievements Sheet
    const achievementsData = (db.achievements || []).map(ach => ({
      'Achievement ID': sanitize(ach.id),
      'Title': sanitize(ach.title),
      'Student Name': sanitize(ach.studentName),
      'Event': sanitize(ach.event),
      'Position': sanitize(ach.position),
      'Date': sanitize(ach.date),
      'Description': sanitize(ach.description),
      'Image URL': formatImageUrl(ach.imageUrl, 'achievement', ach.id),
    }));
    const wsAchievements = XLSX.utils.json_to_sheet(achievementsData.length ? achievementsData : [{ 'Info': 'No achievements' }]);
    XLSX.utils.book_append_sheet(workbook, wsAchievements, 'Achievements');

    // 4. Events Sheet
    const eventsData = (db.events || []).map(ev => ({
      'Event ID': sanitize(ev.id),
      'Title': sanitize(ev.title),
      'Category': sanitize(ev.category),
      'Date': sanitize(ev.date),
      'Time': sanitize(ev.time),
      'Location': sanitize(ev.location),
      'Description': sanitize(ev.desc || (ev as any).description),
      'Badge Color': sanitize(ev.badgeColor),
      'Image URL': formatImageUrl(ev.image, 'event', ev.id),
    }));
    const wsEvents = XLSX.utils.json_to_sheet(eventsData.length ? eventsData : [{ 'Info': 'No events' }]);
    XLSX.utils.book_append_sheet(workbook, wsEvents, 'Events');

    // 5. Registrations Sheet
    const registrationsData = (db.registrations || []).map(r => ({
      'Registration ID': sanitize(r.id),
      'Full Name': sanitize(r.fullName),
      'Status': sanitize(r.status),
      'Phone': sanitize(r.phone),
      'Email': sanitize(r.email),
      'Guardian Name': sanitize(r.guardianName),
      'Emergency Phone': sanitize(r.emergencyPhone),
      'Batch': sanitize(r.batch),
      'Belt Level': sanitize(r.beltLevel),
      'Experience': sanitize(r.experience),
      'Date of Birth': sanitize(r.dob),
      'Gender': sanitize(r.gender),
      'School': sanitize(r.schoolName),
      'Address': sanitize(r.address),
      'Submitted At': sanitize(r.submittedAt),
    }));
    const wsRegistrations = XLSX.utils.json_to_sheet(registrationsData.length ? registrationsData : [{ 'Info': 'No registrations' }]);
    XLSX.utils.book_append_sheet(workbook, wsRegistrations, 'Registrations');

    // 6. Messages Sheet
    const messagesData = (db.messages || []).map(m => ({
      'Message ID': sanitize(m.id),
      'Name': sanitize(m.name),
      'Email': sanitize(m.email),
      'Phone': sanitize(m.phone),
      'Subject': sanitize(m.subject),
      'Message': sanitize(m.message),
      'Status': sanitize(m.status),
      'Date': sanitize((m as any).createdAt || (m as any).created_at),
    }));
    const wsMessages = XLSX.utils.json_to_sheet(messagesData.length ? messagesData : [{ 'Info': 'No messages' }]);
    XLSX.utils.book_append_sheet(workbook, wsMessages, 'Messages');

    // Generate binary XLSX buffer
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const dateStr = new Date().toISOString().split('T')[0];

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ACD_Martial_Arts_Data_${dateStr}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export GET error:', error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
