import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type AnyRecord = Record<string, unknown>;

function asText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/^=+/, '').trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractImageUrls(value: unknown): string[] {
  if (typeof value === 'string') {
    const text = asText(value);
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      return extractImageUrls(parsed);
    } catch {
      if (text.includes(',')) {
        return text
          .split(',')
          .map((item) => asText(item))
          .filter((entry): entry is string => Boolean(entry));
      }
      return [text];
    }
  }

  if (!Array.isArray(value)) {
    if (typeof value === 'object' && value !== null) {
      const record = value as Record<string, unknown>;
      const one = asText(record.url) || asText(record.src) || asText(record.image_url);
      return one ? [one] : [];
    }
    return [];
  }

  return value
    .flatMap((entry) => extractImageUrls(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^https?:\/\//i.test(value.trim());
}

function asTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asText(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function toIsoDate(value: unknown): string | null {
  const text = asText(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeStatus(value: unknown): 'active' | 'sold' | 'coming_soon' | 'archived' {
  const status = asText(value)?.toLowerCase();
  if (!status) return 'active';
  if (['sold', 'closed', 'sld'].includes(status)) return 'sold';
  if (['coming_soon', 'coming soon', 'pending'].includes(status)) return 'coming_soon';
  if (['archived', 'deleted', 'inactive'].includes(status)) return 'archived';
  return 'active';
}

async function logSyncEvent(supabase: { from: (table: string) => any }, event: AnyRecord) {
  await supabase.from('sync_events').insert(event);
}

async function parseIncomingPayload(req: Request): Promise<{ payload: AnyRecord; binaryImages: File[] }> {
  const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const payload: AnyRecord = {};
    const binaryImages: File[] = [];

    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        if (key === 'image' || key === 'file' || key === 'cover_image' || key.startsWith('image_')) {
          if (value.size > 0) binaryImages.push(value);
        }
        continue;
      }
      payload[key] = value;
    }

    return { payload, binaryImages };
  }

  const body = (await req.json()) as AnyRecord;
  return { payload: (body.listing as AnyRecord) ?? body, binaryImages: [] };
}

async function uploadBinaryImageToStorage(
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          file: File,
          options: { contentType: string; upsert: boolean },
        ) => Promise<{ error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  },
  file: File,
  externalId: string | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'listing-images';
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const listingKey = externalId || `listing-${Date.now()}`;
  const path = `listings/${listingKey}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });

  if (error) {
    console.error('Storage upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl || null;
}

async function uploadBinaryImagesToStorage(
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          file: File,
          options: { contentType: string; upsert: boolean },
        ) => Promise<{ error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  },
  files: File[],
  externalId: string | null,
): Promise<string[]> {
  const uploaded: string[] = [];
  for (const file of files) {
    const url = await uploadBinaryImageToStorage(supabase, file, externalId);
    if (url) uploaded.push(url);
  }
  return uploaded;
}

function extensionFromContentType(contentType: string | null): string {
  const normalized = (contentType || '').toLowerCase();
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  return 'jpg';
}

function extensionFromUrlPath(url: string): string {
  const match = url.toLowerCase().match(/\.([a-z0-9]{2,5})(?:$|[?#])/);
  if (!match) return 'jpg';
  const ext = match[1];
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
}

async function mirrorRemoteImagesToStorage(
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          fileBody: ArrayBuffer,
          options: { contentType: string; upsert: boolean },
        ) => Promise<{ error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  },
  urls: string[],
  externalId: string | null,
): Promise<string[]> {
  if (!urls.length) return [];

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'listing-images';
  const listingKey = externalId || `listing-${Date.now()}`;
  const mirrored: string[] = [];

  for (let index = 0; index < urls.length; index += 1) {
    const rawUrl = asText(urls[index]);
    if (!isHttpUrl(rawUrl)) continue;

    try {
      const response = await fetch(rawUrl, { redirect: 'follow' });
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const extFromType = extensionFromContentType(contentType);
      const extFromPath = extensionFromUrlPath(rawUrl);
      const extension = extFromType || extFromPath;
      const path = `listings/${listingKey}-${Date.now()}-${index}.${extension}`;
      const buffer = await response.arrayBuffer();

      const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType,
        upsert: true,
      });
      if (error) continue;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data.publicUrl) mirrored.push(data.publicUrl);
    } catch {
      // Ignore bad/blocked URLs so one image never breaks listing ingest.
    }
  }

  return mirrored;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    route: '/api/listings',
    message: 'Listings API is reachable. Use POST to ingest listings.',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  const secret = process.env.N8N_INGEST_SECRET;
  if (secret) {
    const fromHeader =
      req.headers.get('x-mgco-secret') ??
      req.headers.get('x-ingest-secret') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      null;

    if (fromHeader !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY',
      },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const parsed = await parseIncomingPayload(req);
  const payload = parsed.payload;

  const title = asText(payload.title) ?? asText(payload.name) ?? 'Untitled Listing';
  const caption =
    asText(payload.listing_caption) ??
    asText(payload.caption) ??
    asText(payload.generated_caption) ??
    asText(payload.ai_caption) ??
    null;
  const slugSource = asText(payload.slug) ?? title;
  const slug = slugify(slugSource) || `listing-${Date.now()}`;
  const externalId = asText(payload.external_id) ?? asText(payload.id) ?? asText(payload.listing_id);
  const status = normalizeStatus(payload.status ?? payload.listing_status);
  const galleryUrls = extractImageUrls(
    payload.gallery_urls ??
      payload.gallery ??
      payload.images ??
      payload.photos ??
      payload.media ??
      payload.image_urls,
  );
  let coverImageUrl: string | null =
    asText(payload.cover_image_url) ??
    asText(payload.image_url) ??
    asText(payload.main_image) ??
    galleryUrls[0] ??
    null;

  const uploadedBinaryUrls = parsed.binaryImages.length
    ? await uploadBinaryImagesToStorage(supabase, parsed.binaryImages, externalId)
    : [];
  if (uploadedBinaryUrls.length) {
    coverImageUrl = uploadedBinaryUrls[0];
    const mergedGallery = [...uploadedBinaryUrls, ...galleryUrls];
    const deduped: string[] = [];
    for (const url of mergedGallery) {
      if (!url || deduped.includes(url)) continue;
      deduped.push(url);
    }
    galleryUrls.splice(0, galleryUrls.length, ...deduped);
  }

  const shouldMirrorRemote = (process.env.INGEST_MIRROR_REMOTE_IMAGES ?? 'true').toLowerCase() !== 'false';
  if (shouldMirrorRemote) {
    const remoteCandidates = [coverImageUrl, ...galleryUrls]
      .map((entry) => asText(entry))
      .filter((entry): entry is string => Boolean(entry))
      .filter((entry, idx, arr) => arr.indexOf(entry) === idx)
      .filter((entry) => isHttpUrl(entry));

    if (remoteCandidates.length) {
      const mirroredUrls = await mirrorRemoteImagesToStorage(supabase, remoteCandidates, externalId);
      if (mirroredUrls.length) {
        coverImageUrl = mirroredUrls[0];
        const mergedGallery = [...mirroredUrls, ...galleryUrls];
        const deduped: string[] = [];
        for (const url of mergedGallery) {
          if (!url || deduped.includes(url)) continue;
          deduped.push(url);
        }
        galleryUrls.splice(0, galleryUrls.length, ...deduped);
      }
    }
  }

  let existingCoverImageUrl: string | null = null;
  let existingGalleryUrls: string[] = [];
  if (externalId) {
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('cover_image_url, gallery_urls')
      .eq('external_id', externalId)
      .maybeSingle();

    if (existingProperty) {
      const existing = existingProperty as AnyRecord;
      existingCoverImageUrl = asText(existing.cover_image_url);
      existingGalleryUrls = extractImageUrls(existing.gallery_urls);
    }
  }

  const mergedAllGallery = [...galleryUrls, ...existingGalleryUrls];
  const dedupedAllGallery: string[] = [];
  for (const url of mergedAllGallery) {
    const cleaned = asText(url);
    if (!cleaned || dedupedAllGallery.includes(cleaned)) continue;
    dedupedAllGallery.push(cleaned);
  }
  galleryUrls.splice(0, galleryUrls.length, ...dedupedAllGallery);
  coverImageUrl = coverImageUrl || existingCoverImageUrl || galleryUrls[0] || null;

  const row = {
    external_source: 'mgcodashboard',
    external_id: externalId,
    slug,
    title,
    description: asText(payload.description) ?? caption,
    status,
    price_amount: asNumber(payload.price_amount ?? payload.price),
    price_currency: (asText(payload.price_currency) ?? 'CAD').toUpperCase(),
    address_line_1: asText(payload.address_line_1) ?? asText(payload.address) ?? 'Address TBD',
    address_line_2: asText(payload.address_line_2),
    city: asText(payload.city) ?? 'City TBD',
    province: asText(payload.province) ?? asText(payload.state),
    postal_code: asText(payload.postal_code) ?? asText(payload.zip),
    country: (asText(payload.country) ?? 'CA').toUpperCase(),
    latitude: asNumber(payload.latitude),
    longitude: asNumber(payload.longitude),
    bedrooms: asNumber(payload.bedrooms),
    bathrooms: asNumber(payload.bathrooms),
    sqft: asNumber(payload.sqft ?? payload.square_feet),
    lot_size_sqft: asNumber(payload.lot_size_sqft),
    property_type: asText(payload.property_type),
    cover_image_url: coverImageUrl,
    gallery_urls: galleryUrls,
    highlights: asTextArray(payload.highlights ?? payload.features),
    is_published: payload.is_published !== false,
    listed_at: asText(payload.listed_at) ?? new Date().toISOString(),
    closed_date: toIsoDate(payload.closed_date),
    sort_order: asNumber(payload.sort_order) ?? 0,
    raw_payload: payload,
  };

  const onConflict = externalId ? 'external_id' : 'slug';
  const { data, error } = await supabase
    .from('properties')
    .upsert(row as AnyRecord, { onConflict, ignoreDuplicates: false })
    .select('id, slug, status, updated_at')
    .single();

  if (error) {
    await logSyncEvent(supabase, {
      source: 'n8n',
      event_type: 'listing.upsert',
      external_id: externalId,
      status: 'failed',
      payload,
      error_message: error.message,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await logSyncEvent(supabase, {
    source: 'n8n',
    event_type: 'listing.upsert',
    external_id: externalId,
    status: 'processed',
    payload,
    processed_at: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: 'Listing received and saved',
    listing: data,
  });
}
