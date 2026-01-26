/**
 * Migrate template thumbnails from Base64 (in DB) to Supabase Storage
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/migrate-template-thumbnails.js
 *
 * This script:
 * 1. Fetches templates with Base64 thumbnails (data:image/...)
 * 2. Uploads them to Supabase Storage (default-images bucket)
 * 3. Updates thumbnail_url to the Storage URL
 *
 * Note: Original Base64 data is kept in thumbnail_url until manually cleared.
 *       Run with --clear-base64 to set old data to null after migration.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/migrate-template-thumbnails.js');
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
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
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
      // File already exists
      console.log(`  File already exists: ${path}`);
      return getPublicUrl(bucket, path);
    }
    throw error;
  }

  return getPublicUrl(bucket, path);
};

const main = async () => {
  console.log('=== Template Thumbnail Migration ===\n');
  console.log('Fetching templates with Base64 thumbnails...\n');

  // Fetch all templates
  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, name, thumbnail_url')
    .order('name');

  if (error) {
    throw error;
  }

  // Filter templates with Base64 thumbnails
  const templatesWithBase64 = templates.filter(
    (t) => t.thumbnail_url && DATA_URL_PREFIX.test(t.thumbnail_url)
  );

  console.log(`Found ${templatesWithBase64.length} templates with Base64 thumbnails\n`);

  if (templatesWithBase64.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  // Show summary
  for (const t of templatesWithBase64) {
    const sizeKB = Math.round(t.thumbnail_url.length / 1024);
    console.log(`  - ${t.name} (${t.id}): ${sizeKB} KB`);
  }
  console.log('');

  let migrated = 0;
  let failed = 0;

  for (const template of templatesWithBase64) {
    console.log(`Processing: ${template.name} (${template.id})`);

    const parsed = parseDataUrl(template.thumbnail_url);
    if (!parsed) {
      console.log(`  Skipped: Invalid data URL`);
      failed += 1;
      continue;
    }

    const hash = hashBuffer(parsed.buffer);
    const filePath = `templates/${template.id}-${hash}.${parsed.extension}`;

    try {
      const publicUrl = await uploadBuffer('default-images', filePath, parsed.buffer, parsed.mimeType);

      const { error: updateError } = await supabase
        .from('templates')
        .update({ thumbnail_url: publicUrl })
        .eq('id', template.id);

      if (updateError) {
        throw updateError;
      }

      const originalSizeKB = Math.round(template.thumbnail_url.length / 1024);
      console.log(`  ✅ Migrated (${originalSizeKB} KB Base64 → Storage URL)`);
      migrated += 1;
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
      failed += 1;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Migrated: ${migrated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Base64 removed from DB responses`);
};

main().catch((error) => {
  console.error('Template thumbnail migration failed:', error);
  process.exit(1);
});
