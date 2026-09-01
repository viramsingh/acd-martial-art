import { NextResponse } from 'next/server';
import { getGoogleSheetsConfigDB, saveGoogleSheetsConfigDB } from '@/lib/db';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  const config = getGoogleSheetsConfigDB();
  return NextResponse.json({ success: true, data: config });
}

export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { webAppUrl, enabled } = await request.json();
    const config = {
      webAppUrl: (webAppUrl || '').trim(),
      enabled: Boolean(enabled),
    };

    saveGoogleSheetsConfigDB(config);
    return NextResponse.json({ success: true, data: config, message: 'Google Sheets configuration saved to server!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save configuration' }, { status: 500 });
  }
}
