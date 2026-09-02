import { NextResponse } from 'next/server';
import { getRegistrationsDB, submitRegistrationDB, approveRegistrationDB, rejectRegistrationDB, syncFromGoogleSheets } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  await syncFromGoogleSheets();
  const registrations = getRegistrationsDB();
  return NextResponse.json({ success: true, data: registrations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = submitRegistrationDB(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid registration payload' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, message: 'Registration ID and action required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const student = approveRegistrationDB(id);
      if (!student) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: student, message: 'Registration approved and student created' });
    } else if (action === 'REJECT') {
      rejectRegistrationDB(id);
      return NextResponse.json({ success: true, message: 'Registration rejected' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update registration' }, { status: 500 });
  }
}
