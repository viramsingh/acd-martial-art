import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/auth';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getDatabase, saveDatabase } from '@/lib/db';

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized action' }, { status: 401 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !username.trim() || !password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: 'Username and password cannot be empty' },
        { status: 400 }
      );
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Update in Supabase Cloud PostgreSQL
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('admin_credentials').upsert({
          id: 'primary',
          username: cleanUser,
          password: cleanPass,
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.error('Supabase update credentials error:', error);
        }
      }
    }

    // 2. Update local fallback memory
    const db = getDatabase();
    (db as any).adminCredentials = {
      username: cleanUser,
      password: cleanPass,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully! Use new credentials for next login.',
      username: cleanUser
    });
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error updating credentials' },
      { status: 500 }
    );
  }
}
