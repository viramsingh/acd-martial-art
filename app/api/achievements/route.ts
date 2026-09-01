import { NextResponse } from 'next/server';
import { getAchievementsDB, addAchievementDB, updateAchievementDB, deleteAchievementDB } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  const achievements = getAchievementsDB();
  return NextResponse.json({ success: true, data: achievements });
}

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const created = addAchievementDB(body);
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
    const updated = updateAchievementDB(body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Achievement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update achievement' }, { status: 400 });
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

    const deleted = deleteAchievementDB(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete achievement' }, { status: 500 });
  }
}
