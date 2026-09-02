import { NextResponse } from 'next/server';
import { getStudentsDB, saveStudentDB, updateStudentBeltDB, deleteStudentDB, syncFromGoogleSheets } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  await syncFromGoogleSheets();
  const students = getStudentsDB();
  return NextResponse.json({ success: true, data: students });
}

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newStudent = saveStudentDB(body);
    return NextResponse.json({ success: true, data: newStudent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.action === 'UPDATE_BELT') {
      const updated = updateStudentBeltDB(body.studentId, body.newBelt);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = saveStudentDB(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update student' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID required' }, { status: 400 });
    }

    const deleted = deleteStudentDB(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete student' }, { status: 500 });
  }
}
