import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function POST() {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    db.students = [];
    db.attendance = [];
    db.achievements = [];
    db.events = [];
    db.messages = [];
    db.registrations = [];
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'All local database records cleared successfully!' });
  } catch (error) {
    console.error('Reset data error:', error);
    return NextResponse.json({ success: false, message: 'Failed to reset local database' }, { status: 500 });
  }
}
