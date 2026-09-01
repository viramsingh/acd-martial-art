import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await checkAdminSession();
  if (session.authenticated) {
    return NextResponse.json({
      authenticated: true,
      user: { username: session.username },
    });
  }
  return NextResponse.json({ authenticated: false });
}
