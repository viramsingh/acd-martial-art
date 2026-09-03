import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionToken, COOKIE_NAME, MAX_AGE } from '@/lib/auth';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    let expectedUser = '';
    let expectedPass = '';

    // 1. Fetch dynamic credentials strictly from Supabase Cloud Database
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('admin_credentials')
            .select('username, password')
            .eq('id', 'primary')
            .maybeSingle();

          if (data && data.username && data.password) {
            expectedUser = data.username.trim();
            expectedPass = data.password.trim();
          }
        } catch (e) {
          console.error('Error querying dynamic credentials from Supabase:', e);
        }
      }
    }

    // 2. Fallback to local memory DB if Supabase not configured
    if (!expectedUser || !expectedPass) {
      const db = getDatabase();
      const customCreds = (db as any).adminCredentials;
      if (customCreds && customCreds.username && customCreds.password) {
        expectedUser = customCreds.username.trim();
        expectedPass = customCreds.password.trim();
      }
    }

    // 3. Fallback to server environment variables if set
    if (!expectedUser || !expectedPass) {
      expectedUser = (process.env.ADMIN_USERNAME || '').trim();
      expectedPass = (process.env.ADMIN_PASSWORD || '').trim();
    }

    if (!expectedUser || !expectedPass) {
      return NextResponse.json(
        { success: false, message: 'Admin credentials not configured in database' },
        { status: 500 }
      );
    }

    const inputUser = String(username).trim();
    const inputPass = String(password).trim();

    if (inputUser !== expectedUser || inputPass !== expectedPass) {
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
