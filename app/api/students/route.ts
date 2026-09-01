import { NextResponse } from 'next/server';
import { getStudents, saveStudent } from '@/lib/sheets';

export async function GET() {
  const students = getStudents();
  return NextResponse.json({ success: true, data: students });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStudent = saveStudent(body);
    return NextResponse.json({ success: true, data: newStudent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}
