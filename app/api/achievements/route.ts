import { NextResponse } from 'next/server';
import { getAchievements, addAchievement } from '@/lib/sheets';

export async function GET() {
  const achievements = getAchievements();
  return NextResponse.json({ success: true, data: achievements });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addAchievement(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}
