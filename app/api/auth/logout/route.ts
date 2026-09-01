import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
  }
}
