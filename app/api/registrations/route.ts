import { NextResponse } from 'next/server';
import { getRegistrations, submitRegistration } from '@/lib/sheets';

export async function GET() {
  const registrations = getRegistrations();
  return NextResponse.json({ success: true, data: registrations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = submitRegistration(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid registration payload' }, { status: 400 });
  }
}
