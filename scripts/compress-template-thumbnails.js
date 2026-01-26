/**
 * Compress template thumbnails to JPEG 400px width, 70% quality
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/compress-template-thumbnails.js
 *
 * This script:
 * 1. Fetches templates with Storage URL thumbnails
 * 2. Downloads the image from Storage
 * 3. Compresses to JPEG 400px width, 70% quality
 * 4. Uploads compressed version with new filename
 * 5. Updates thumbnail_url in database
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

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

const THUMBNAIL_WIDTH = 400;
const JPEG_QUALITY = 70;

const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

const main = async () => {
  console.log('=== Template Thumbnail Compression ===\n');
  console.log(`Target: JPEG ${THUMBNAIL_WIDTH}px width, ${JPEG_QUALITY}% quality\n`);

  // Fetch all templates with Storage URLs (not Base64)
  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, name, thumbnail_url')
    .not('thumbnail_url', 'is', null)
    .order('name');

  if (error) {
    throw error;
  }

  // Filter templates with Storage URLs (https://)
  const templatesWithStorageUrl = templates.filter(
    (t) => t.thumbnail_url && t.thumbnail_url.startsWith('https://')
  );

  console.log(`Found ${templatesWithStorageUrl.length} templates with Storage URLs\n`);

  if (templatesWithStorageUrl.length === 0) {
    console.log('Nothing to compress.');
    return;
  }

  let compressed = 0;
  let skipped = 0;
  let failed = 0;
  let totalSavedBytes = 0;

  for (const template of templatesWithStorageUrl) {
    console.log(`Processing: ${template.name} (${template.id})`);

    // Skip if already compressed (filename contains -compressed)
    if (template.thumbnail_url.includes('-compressed')) {
      console.log('  ⏭️  Already compressed, skipping');
      skipped += 1;
      continue;
    }

    try {
      // Download the image
      const response = await fetch(template.thumbnail_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const originalBuffer = Buffer.from(await response.arrayBuffer());
      const originalSize = originalBuffer.length;

      // Compress with sharp
      const compressedBuffer = await sharp(originalBuffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();

      const compressedSize = compressedBuffer.length;
      const savedBytes = originalSize - compressedSize;
      const savedPercent = Math.round((savedBytes / originalSize) * 100);

      // Upload compressed version
      const newPath = `templates/${template.id}-compressed.jpg`;

      // Delete old compressed file if exists
      await supabase.storage.from('default-images').remove([newPath]);

      const { error: uploadError } = await supabase.storage
        .from('default-images')
        .upload(newPath, compressedBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const newUrl = getPublicUrl('default-images', newPath);

      // Update database
      const { error: updateError } = await supabase
        .from('templates')
        .update({ thumbnail_url: newUrl })
        .eq('id', template.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`  ✅ ${Math.round(originalSize/1024)}KB → ${Math.round(compressedSize/1024)}KB (${savedPercent}% saved)`);
      compressed += 1;
      totalSavedBytes += savedBytes;
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
      failed += 1;
    }
  }

  console.log('\n=== Compression Complete ===');
  console.log(`Compressed: ${compressed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total saved: ${Math.round(totalSavedBytes / 1024)} KB`);
};

main().catch((error) => {
  console.error('Template thumbnail compression failed:', error);
  process.exit(1);
});
