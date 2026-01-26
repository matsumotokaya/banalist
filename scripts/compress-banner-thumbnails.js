/**
 * Compress banner thumbnails to JPEG 400px width, 70% quality
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/compress-banner-thumbnails.js
 *
 * This script:
 * 1. Fetches banners with Storage URL thumbnails (PNG)
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
  console.log('=== Banner Thumbnail Compression ===\n');
  console.log(`Target: JPEG ${THUMBNAIL_WIDTH}px width, ${JPEG_QUALITY}% quality\n`);

  // Fetch all banners with Storage URLs
  const { data: banners, error } = await supabase
    .from('banners')
    .select('id, name, user_id, thumbnail_url')
    .not('thumbnail_url', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Filter banners with Storage URLs that are PNG (not yet compressed)
  const bannersToCompress = banners.filter(
    (b) => b.thumbnail_url &&
           b.thumbnail_url.startsWith('https://') &&
           (b.thumbnail_url.endsWith('.png') || b.thumbnail_url.includes('/thumbnails/'))
  );

  // Exclude already compressed
  const bannersNotCompressed = bannersToCompress.filter(
    (b) => !b.thumbnail_url.includes('-compressed')
  );

  console.log(`Found ${bannersNotCompressed.length} banners to compress\n`);

  if (bannersNotCompressed.length === 0) {
    console.log('Nothing to compress.');
    return;
  }

  let compressed = 0;
  let skipped = 0;
  let failed = 0;
  let totalSavedBytes = 0;

  for (const banner of bannersNotCompressed) {
    console.log(`Processing: ${banner.name} (${banner.id})`);

    try {
      // Download the image
      const response = await fetch(banner.thumbnail_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const originalBuffer = Buffer.from(await response.arrayBuffer());
      const originalSize = originalBuffer.length;

      // Skip if already small (less than 100KB)
      if (originalSize < 100 * 1024) {
        console.log(`  ⏭️  Already small (${Math.round(originalSize/1024)}KB), skipping`);
        skipped += 1;
        continue;
      }

      // Compress with sharp
      const compressedBuffer = await sharp(originalBuffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();

      const compressedSize = compressedBuffer.length;
      const savedBytes = originalSize - compressedSize;
      const savedPercent = Math.round((savedBytes / originalSize) * 100);

      // Upload compressed version
      const newPath = `${banner.user_id}/thumbnails/${banner.id}-compressed.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(newPath, compressedBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const newUrl = getPublicUrl('user-images', newPath);

      // Update database
      const { error: updateError } = await supabase
        .from('banners')
        .update({ thumbnail_url: newUrl })
        .eq('id', banner.id);

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
  console.error('Banner thumbnail compression failed:', error);
  process.exit(1);
});
