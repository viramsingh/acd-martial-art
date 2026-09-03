import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'achievement' | 'event'
  const id = searchParams.get('id');

  if (!type || !id) {
    return new Response('Missing type or id', { status: 400 });
  }

  let imageData = '';

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (type === 'achievement') {
          const { data } = await supabase.from('achievements').select('image_url').eq('id', id).maybeSingle();
          if (data?.image_url) imageData = data.image_url;
        } else if (type === 'event') {
          const { data } = await supabase.from('events').select('image').eq('id', id).maybeSingle();
          if (data?.image) imageData = data.image;
        }
      } catch (e) {
        console.error('Error fetching image from Supabase:', e);
      }
    }
  }

  // 2. Fallback to local DB
  if (!imageData) {
    const db = getDatabase();
    if (type === 'achievement') {
      const item = db.achievements?.find(a => a.id === id);
      imageData = item?.imageUrl || '';
    } else if (type === 'event') {
      const item = db.events?.find(e => e.id === id);
      imageData = item?.image || '';
    }
  }

  if (!imageData) {
    return new Response('Image not found', { status: 404 });
  }

  // If it's a base64 Data URL (e.g. data:image/png;base64,...)
  if (imageData.startsWith('data:')) {
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    }
  }

  // If it's a regular external URL or relative path
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return NextResponse.redirect(imageData);
  }

  if (imageData.startsWith('/')) {
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(`${baseUrl}${imageData}`);
  }

  return new Response('Invalid image format', { status: 400 });
}
