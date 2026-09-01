import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionToken, COOKIE_NAME, MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.trim() !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username.trim());
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    });

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      user: { username: username.trim() },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server authentication error' },
      { status: 500 }
    );
  }
}
