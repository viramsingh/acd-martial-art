import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getDatabase, syncFromSupabase, formatDateYMD } from '@/lib/db';
import * as XLSX from 'xlsx-js-style';

export async function GET(request: Request) {
  try {
    const session = await checkAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { origin, searchParams } = new URL(request.url);

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

    // 2. Attendance Monthly Register Matrix Sheets (Calendar Grid Format)
    const attRecords = db.attendance || [];
    const studentsList = db.students || [];

    // Define batches to group by
    const knownBatches = [
      'Meghdoot Nagar - 1st Batch 5:00 - 6:00 PM',
      'Meghdoot Nagar - 2nd Batch 6:30 - 7:30 PM',
      'Abhinadan - 3rd Batch 6:30 - 7:30 PM',
      'Abhinadan - 4th Batch 8:00 - 9:00 PM',
      'Evening 5:00 To 6:00',
      'Evening 6:30 To 7:30',
      'Evening 8:00 To 9:00',
    ];
    const existingBatches = Array.from(new Set(studentsList.map(s => s.batch || 'Unassigned')));
    const orderedBatches = [
      ...knownBatches.filter(b => existingBatches.includes(b)),
      ...existingBatches.filter(b => !knownBatches.includes(b)),
    ];

    // Helper to generate a styled monthly calendar matrix sheet
    const createMonthlyAttendanceSheet = (targetYear: number, targetMonth: number) => {
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

      // Fast lookup map for attendance status (keyed by both ID and normalized Name)
      const recordMap = new Map<string, string>();
      attRecords.forEach(rec => {
        if (rec.date) {
          const cleanDate = formatDateYMD(rec.date);
          if (rec.studentId) {
            recordMap.set(`${rec.studentId.trim()}_${cleanDate}`, rec.status);
          }
          if (rec.studentName) {
            const normName = rec.studentName.trim().toLowerCase().replace(/\s+/g, ' ');
            recordMap.set(`${normName}_${cleanDate}`, rec.status);
          }
        }
      });

      const dayHeaders: string[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        dayHeaders.push(String(day));
      }
      const attendanceHeaders = [
        'S.No.',
        'Student Name',
        ...dayHeaders,
        'P',
        'A',
        'PL',
        '%',
      ];

      const attendanceMatrixData: any[] = [];
      const batchHeaderRowIndices: number[] = [];

      orderedBatches.forEach(batchName => {
        const batchStudents = studentsList.filter(s => (s.batch || 'Unassigned') === batchName);
        if (batchStudents.length === 0) return;

        // 1. Batch Section Divider Banner
        const batchRowIndex = attendanceMatrixData.length + 1; // +1 because row 0 is table header
        batchHeaderRowIndices.push(batchRowIndex);

        const sectionBanner: Record<string, any> = {
          'S.No.': `BATCH: ${batchName.toUpperCase()}`,
          'Student Name': '',
        };
        dayHeaders.forEach(d => { sectionBanner[d] = ''; });
        sectionBanner['P'] = '';
        sectionBanner['A'] = '';
        sectionBanner['PL'] = '';
        sectionBanner['%'] = '';
        attendanceMatrixData.push(sectionBanner);

        // 2. Batch Students
        batchStudents.forEach((s, idx) => {
          const row: Record<string, any> = {
            'S.No.': idx + 1,
            'Student Name': sanitize(s.fullName),
          };

          let pCount = 0;
          let aCount = 0;
          let plCount = 0;

          const sId = (s.id || '').trim();
          const sNormName = (s.fullName || '').trim().toLowerCase().replace(/\s+/g, ' ');

          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = new Date(targetYear, targetMonth, day).getDay(); // 0 = Sunday

            const status = recordMap.get(`${sId}_${dateStr}`) || recordMap.get(`${sNormName}_${dateStr}`);

            if (status === 'PRESENT') {
              row[String(day)] = 'P';
              pCount++;
            } else if (status === 'ABSENT') {
              row[String(day)] = 'A';
              aCount++;
            } else if (status === 'LATE') {
              row[String(day)] = 'PL';
              plCount++;
            } else if (dayOfWeek === 0) {
              row[String(day)] = 'SUN';
            } else {
              row[String(day)] = '-';
            }
          }

          row['P'] = pCount;
          row['A'] = aCount;
          row['PL'] = plCount * 2; // Penalty leave multiplied by 2
          const effectiveAbsent = aCount + (plCount * 2);
          const totalMarkedDays = pCount + effectiveAbsent;
          row['%'] = totalMarkedDays > 0 ? `${((pCount / totalMarkedDays) * 100).toFixed(1)}%` : '0%';

          attendanceMatrixData.push(row);
        });
      });

      const wsAttendance = XLSX.utils.json_to_sheet(
        attendanceMatrixData.length ? attendanceMatrixData : [{ 'Info': 'No attendance records' }],
        { header: attendanceHeaders }
      );

      // Set column widths
      const colWidths = [
        { wch: 8 },  // S.No.
        { wch: 26 }, // Student Name
        ...dayHeaders.map(() => ({ wch: 4 })), // Day columns 1..31
        { wch: 6 },  // P
        { wch: 6 },  // A
        { wch: 6 },  // PL
        { wch: 8 },  // %
      ];
      wsAttendance['!cols'] = colWidths;

      // Merge batch section header rows across all columns
      wsAttendance['!merges'] = batchHeaderRowIndices.map(rIdx => ({
        s: { r: rIdx, c: 0 },
        e: { r: rIdx, c: attendanceHeaders.length - 1 }
      }));

      // Apply cell styling
      const range = XLSX.utils.decode_range(wsAttendance['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const isBatchHeader = batchHeaderRowIndices.includes(R);

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = wsAttendance[cellAddress];
          if (!cell) continue;

          // Table Header Row Styling
          if (R === 0) {
            cell.s = {
              fill: { fgColor: { rgb: '1E293B' } }, // Dark Slate
              font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 10 },
              alignment: { horizontal: 'center', vertical: 'center' },
            };
            continue;
          }

          // Batch Section Divider Row Styling
          if (isBatchHeader) {
            cell.s = {
              fill: { fgColor: { rgb: '0F172A' } }, // Very dark navy
              font: { color: { rgb: 'F59E0B' }, bold: true, sz: 11 }, // Amber gold bold text
              alignment: { horizontal: 'left', vertical: 'center' },
            };
            continue;
          }

          // Student Name left aligned
          if (C === 1) {
            cell.s = {
              font: { bold: true, sz: 10 },
              alignment: { horizontal: 'left', vertical: 'center' },
            };
            continue;
          }

          // Color coding for Present, Absent, Late, Sunday
          if (cell.v === 'P') {
            cell.s = {
              fill: { fgColor: { rgb: 'C6EFCE' } }, // Soft Green fill
              font: { color: { rgb: '006100' }, bold: true, sz: 10 }, // Dark Green text
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          } else if (cell.v === 'A') {
            cell.s = {
              fill: { fgColor: { rgb: 'FFC7CE' } }, // Soft Red fill
              font: { color: { rgb: '9C0006' }, bold: true, sz: 10 }, // Dark Red text
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          } else if (cell.v === 'PL') {
            cell.s = {
              fill: { fgColor: { rgb: 'FFEB9C' } }, // Soft Yellow/Orange fill
              font: { color: { rgb: '9C6500' }, bold: true, sz: 10 }, // Dark Orange text
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          } else if (cell.v === 'SUN') {
            cell.s = {
              fill: { fgColor: { rgb: 'F1F5F9' } },
              font: { color: { rgb: '94A3B8' }, sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          } else {
            cell.s = {
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          }
        }
      }

      return wsAttendance;
    };

    // Determine all distinct months available in attendance records (e.g. ['2026-10', '2026-09'])
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const distinctMonths = Array.from(new Set(
      attRecords.map(a => a.date ? formatDateYMD(a.date).slice(0, 7) : '').filter(Boolean)
    )).sort().reverse();

    // Determine target month from query parameter ?month=YYYY-MM, or use newest month
    const requestedMonth = searchParams.get('month'); // e.g. "2026-09"
    let primaryYear = now.getFullYear();
    let primaryMonth = now.getMonth();

    if (requestedMonth && requestedMonth.includes('-')) {
      const parts = requestedMonth.split('-');
      primaryYear = parseInt(parts[0], 10);
      primaryMonth = parseInt(parts[1], 10) - 1;
    } else if (distinctMonths.length > 0) {
      const parts = distinctMonths[0].split('-');
      primaryYear = parseInt(parts[0], 10);
      primaryMonth = parseInt(parts[1], 10) - 1;
    }

    // 1. Primary Attendance Sheet (named 'Attendance')
    const primaryWs = createMonthlyAttendanceSheet(primaryYear, primaryMonth);
    const primaryMonthLabel = `${monthNames[primaryMonth]} ${primaryYear}`;
    XLSX.utils.book_append_sheet(workbook, primaryWs, `Attendance (${primaryMonthLabel})`);

    // 2. Additional monthly sheets for any other months with data so past records are never lost
    for (const mStr of distinctMonths) {
      const [y, m] = mStr.split('-').map(Number);
      if (y === primaryYear && (m - 1) === primaryMonth) continue; // Skip primary, already appended
      const otherWs = createMonthlyAttendanceSheet(y, m - 1);
      const label = `${monthNames[m - 1]} ${y}`;
      XLSX.utils.book_append_sheet(workbook, otherWs, `Attendance (${label})`);
    }

    // 3. Complete raw chronological Attendance Log sheet
    const attendanceRawData = attRecords.map(a => ({
      'Attendance ID': sanitize(a.id),
      'Date': sanitize(formatDateYMD(a.date)),
      'Student ID': sanitize(a.studentId),
      'Student Name': sanitize(a.studentName),
      'Batch': sanitize(a.batch),
      'Status': sanitize(a.status),
      'Check-in Time': sanitize(a.checkInTime),
      'Remarks': sanitize(a.remarks),
    }));
    const wsAttendanceLog = XLSX.utils.json_to_sheet(
      attendanceRawData.length ? attendanceRawData : [{ 'Info': 'No attendance records' }]
    );
    XLSX.utils.book_append_sheet(workbook, wsAttendanceLog, 'Attendance Log');

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
