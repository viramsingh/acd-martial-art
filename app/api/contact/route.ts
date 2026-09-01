import { NextResponse } from 'next/server';
import { getContactMessages, addContactMessage } from '@/lib/sheets';

export async function GET() {
  const messages = getContactMessages();
  return NextResponse.json({ success: true, data: messages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addContactMessage(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}
