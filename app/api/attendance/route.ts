import { NextResponse } from 'next/server';
import { getAttendanceRecordsDB, markAttendanceDB } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;
  const records = getAttendanceRecordsDB(date);
  return NextResponse.json({ success: true, data: records });
}

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const { date, updates } = await request.json();
    if (!date || !Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: 'Invalid attendance payload' }, { status: 400 });
    }

    const updatedRecords = markAttendanceDB(date, updates);
    return NextResponse.json({ success: true, data: updatedRecords });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to mark attendance' }, { status: 500 });
  }
}
