import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const DATA_URL_PREFIX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/;

const getExtensionFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/svg+xml') return 'svg';
  return 'bin';
};

const parseDataUrl = (dataUrl) => {
  const match = dataUrl.match(DATA_URL_PREFIX);
  if (!match) return null;
  const mimeType = match[1];
  const base64 = dataUrl.replace(DATA_URL_PREFIX, '');
  const buffer = Buffer.from(base64, 'base64');
  const extension = getExtensionFromMime(mimeType);
  return { mimeType, buffer, extension };
};

const hashBuffer = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

const uploadBuffer = async (bucket, path, buffer, contentType) => {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    const statusCode = Number(error.statusCode || error.status);
    if (statusCode === 409) {
      return getPublicUrl(bucket, path);
    }
    throw error;
  }

  return getPublicUrl(bucket, path);
};

const main = async () => {
  console.log('Starting thumbnail migration...');
  const pageSize = 20;
  let offset = 0;
  let updated = 0;

  while (true) {
    const { data, error } = await supabase
      .from('banners')
      .select('id, user_id, thumbnail_data_url')
      .not('thumbnail_data_url', 'is', null)
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const dataUrl = row.thumbnail_data_url;
      if (!dataUrl || !DATA_URL_PREFIX.test(dataUrl)) continue;

      const parsed = parseDataUrl(dataUrl);
      if (!parsed) continue;

      const hash = hashBuffer(parsed.buffer);
      const filePath = `${row.user_id}/thumbnails/migrated-${row.id}-${hash}.${parsed.extension}`;
      const publicUrl = await uploadBuffer('user-images', filePath, parsed.buffer, parsed.mimeType);

      const { error: updateError } = await supabase
        .from('banners')
        .update({
          thumbnail_url: publicUrl,
          thumbnail_data_url: null,
        })
        .eq('id', row.id);

      if (updateError) {
        throw updateError;
      }

      updated += 1;
      console.log(`[banners] Updated ${row.id}`);
    }

    offset += pageSize;
  }

  console.log('Thumbnails updated:', updated);
};

main().catch((error) => {
  console.error('Thumbnail migration failed:', error);
  process.exit(1);
});
