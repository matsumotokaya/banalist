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

const normalizeElements = (elements) => {
  if (!elements) return null;
  if (Array.isArray(elements)) return elements;
  if (typeof elements === 'string') {
    try {
      return JSON.parse(elements);
    } catch {
      return null;
    }
  }
  return null;
};

const migrateTable = async ({
  table,
  select,
  bucket,
  pathBuilder,
}) => {
  const pageSize = 20;
  let offset = 0;
  let updatedRows = 0;
  let updatedImages = 0;
  const cache = new Map();

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const elements = normalizeElements(row.elements);
      if (!elements) continue;

      let changed = false;
      const nextElements = [];

      for (const element of elements) {
        if (element?.type === 'image' && typeof element.src === 'string' && DATA_URL_PREFIX.test(element.src)) {
          const parsed = parseDataUrl(element.src);
          if (!parsed) {
            nextElements.push(element);
            continue;
          }

          const hash = hashBuffer(parsed.buffer);
          const cachedUrl = cache.get(hash);
          const filePathBase = pathBuilder(row, hash);
          const filePath = `${filePathBase}.${parsed.extension}`;

          const publicUrl = cachedUrl || await uploadBuffer(bucket, filePath, parsed.buffer, parsed.mimeType);
          cache.set(hash, publicUrl);
          nextElements.push({ ...element, src: publicUrl });
          updatedImages += 1;
          changed = true;
        } else {
          nextElements.push(element);
        }
      }

      if (changed) {
        const { error: updateError } = await supabase
          .from(table)
          .update({ elements: nextElements })
          .eq('id', row.id);

        if (updateError) {
          throw updateError;
        }

        updatedRows += 1;
        console.log(`[${table}] Updated ${row.id}`);
      }
    }

    offset += pageSize;
  }

  return { updatedRows, updatedImages };
};

const main = async () => {
  console.log('Starting Base64 image migration...');

  const templateResult = await migrateTable({
    table: 'templates',
    select: 'id, elements',
    bucket: 'default-images',
    pathBuilder: (row, hash) => `templates/${row.id}/${hash}`,
  });
  console.log('Templates updated:', templateResult);

  const bannerResult = await migrateTable({
    table: 'banners',
    select: 'id, user_id, elements',
    bucket: 'user-images',
    pathBuilder: (row, hash) => `${row.user_id}/migrated/${hash}`,
  });
  console.log('Banners updated:', bannerResult);
};

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
