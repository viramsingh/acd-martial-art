import { NextResponse } from 'next/server';
import { getAttendanceRecords, markAttendance } from '@/lib/sheets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;
  const records = getAttendanceRecords(date);
  return NextResponse.json({ success: true, data: records });
}

export async function POST(request: Request) {
  try {
    const { date, updates } = await request.json();
    if (!date || !Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: 'Date and updates array required' }, { status: 400 });
    }
    const updated = markAttendance(date, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to process attendance' }, { status: 500 });
  }
}
