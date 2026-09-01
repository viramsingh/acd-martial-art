import { NextResponse } from 'next/server';
import { getEventsDB, addEventDB, updateEventDB, deleteEventDB } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  const events = getEventsDB();
  return NextResponse.json({ success: true, data: events });
}

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const created = addEventDB(body);
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
    const body = await request.json();
    const updated = updateEventDB(body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update event' }, { status: 400 });
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
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    const deleted = deleteEventDB(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 });
  }
}
