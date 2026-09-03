import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getCleanUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

function getSupabaseKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return key.trim();
}

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = getCleanUrl();
  const key = getSupabaseKey();
  return Boolean(url && url.startsWith('http') && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance) {
    const url = getCleanUrl();
    const key = getSupabaseKey();

    let wsTransport: any = undefined;
    if (typeof window === 'undefined') {
      try {
        wsTransport = require('ws');
      } catch {}
    }

    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
      ...(wsTransport ? { realtime: { transport: wsTransport } } : {})
    });
  }
  return supabaseInstance;
}

export async function syncMutationToSupabase(action: string, payload: any): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    switch (action) {
      case 'UPSERT_STUDENT':
        await supabase.from('students').upsert({
          id: payload.id,
          full_name: payload.fullName,
          dob: payload.dob || '',
          gender: payload.gender || 'Male',
          phone: payload.phone || '',
          email: payload.email || '',
          address: payload.address || '',
          guardian_name: payload.guardianName || '',
          emergency_phone: payload.emergencyPhone || '',
          school_name: payload.schoolName || '',
          batch: payload.batch || 'Evening 5:00 To 6:00',
          belt_level: payload.beltLevel || 'White Belt',
          status: payload.status || 'ACTIVE',
          joining_date: payload.joiningDate || ''
        });
        break;

      case 'DELETE_STUDENT':
        await supabase.from('students').delete().eq('id', payload.id);
        break;

      case 'MARK_ATTENDANCE':
        if (Array.isArray(payload)) {
          const records = payload.map((r: any) => ({
            id: r.id,
            date: r.date,
            student_id: r.studentId,
            student_name: r.studentName,
            batch: r.batch || '',
            status: r.status || 'PRESENT',
            check_in_time: r.checkInTime || '',
            remarks: r.remarks || ''
          }));
          await supabase.from('attendance').upsert(records);
        }
        break;

      case 'UPSERT_ACHIEVEMENT':
        await supabase.from('achievements').upsert({
          id: payload.id,
          title: payload.title,
          student_name: payload.studentName,
          event: payload.event || '',
          position: payload.position || '',
          date: payload.date || '',
          description: payload.description || '',
          image_url: payload.imageUrl || ''
        });
        break;

      case 'DELETE_ACHIEVEMENT':
        await supabase.from('achievements').delete().eq('id', payload.id);
        break;

      case 'UPSERT_EVENT':
        await supabase.from('events').upsert({
          id: payload.id,
          title: payload.title,
          category: payload.category || 'EVENT',
          date: payload.date || '',
          time: payload.time || '',
          location: payload.location || '',
          description: payload.desc || payload.description || '',
          badge_color: payload.badgeColor || 'gold',
          image: payload.image || ''
        });
        break;

      case 'DELETE_EVENT':
        await supabase.from('events').delete().eq('id', payload.id);
        break;

      case 'UPSERT_MESSAGE':
        await supabase.from('messages').upsert({
          id: payload.id,
          name: payload.name,
          email: payload.email || '',
          phone: payload.phone || '',
          subject: payload.subject || '',
          message: payload.message || '',
          status: payload.status || 'NEW',
          created_at: payload.createdAt || new Date().toISOString()
        });
        break;

      case 'DELETE_MESSAGE':
        await supabase.from('messages').delete().eq('id', payload.id);
        break;

      case 'UPSERT_REGISTRATION':
        await supabase.from('registrations').upsert({
          id: payload.id,
          full_name: payload.fullName,
          dob: payload.dob || '',
          gender: payload.gender || 'Male',
          phone: payload.phone || '',
          email: payload.email || '',
          address: payload.address || '',
          guardian_name: payload.guardianName || '',
          emergency_phone: payload.emergencyPhone || '',
          school_name: payload.schoolName || '',
          batch: payload.batch || 'Evening 5:00 To 6:00',
          belt_level: payload.beltLevel || 'White Belt',
          experience: payload.experience || 'Beginner',
          status: payload.status || 'PENDING',
          submitted_at: payload.submittedAt || new Date().toISOString()
        });
        break;

      case 'SAVE_SHEETS_CONFIG':
        await supabase.from('sheets_config').upsert({
          id: 'config_primary',
          web_app_url: payload.webAppUrl || '',
          enabled: payload.enabled !== false,
          updated_at: new Date().toISOString()
        });
        break;
    }
  } catch (err) {
    console.error('syncMutationToSupabase error:', err);
  }
}
