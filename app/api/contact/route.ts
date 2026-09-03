import { NextResponse } from 'next/server';
import { getContactMessagesDB, addContactMessageDB, markMessageReadDB, deleteContactMessageDB, syncFromGoogleSheets } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  await syncFromGoogleSheets(true, request);
  const messages = getContactMessagesDB();
  return NextResponse.json({ success: true, data: messages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addContactMessageDB(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
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
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Message ID required' }, { status: 400 });
    }
    markMessageReadDB(id);
    return NextResponse.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update message' }, { status: 500 });
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
      return NextResponse.json({ success: false, message: 'Message ID required' }, { status: 400 });
    }

    const deleted = deleteContactMessageDB(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete message' }, { status: 500 });
  }
}
