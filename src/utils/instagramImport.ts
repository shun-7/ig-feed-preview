import JSZip from 'jszip';
import type { Post, PostType } from '@/types/post';
import { compressImage, extractVideoThumbnail } from './imageUtils';
import { generateId } from './id';

/** Cap imported posts. IndexedDB can hold much more, but we keep a sane upper bound
 *  to avoid slow JSON serialization and overly long initial loads. */
export const MAX_IMPORTED_POSTS = 100;

interface RawMediaEntry {
  uri: string;
  creation_timestamp?: number;
  title?: string;
  media_metadata?: Record<string, unknown>;
}

interface RawPostEntry {
  media?: RawMediaEntry[];
  title?: string;
  creation_timestamp?: number;
  /** Marked when we want to force a specific type (e.g. reels from reels.json) */
  __forcedType?: PostType;
}

export interface ImportResult {
  posts: Post[];
  totalFound: number;
  skipped: number;
}

const VIDEO_EXT = /\.(mp4|mov|m4v|webm)$/i;
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|heic)$/i;

/**
 * Parse an Instagram data export ZIP. Reads posts + reels + carousels.
 *
 * The export contains:
 *   your_instagram_activity/content/posts_1.json  ← regular posts JSON
 *   your_instagram_activity/content/reels.json    ← reels JSON
 *   media/posts/YYYYMM/<image>.jpg                ← image media
 *   media/reels/YYYYMM/<video>.mp4                ← video media
 */
export async function parseInstagramZip(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);

  // Collect all candidate posts from various JSON files
  const allEntries: RawPostEntry[] = [];

  // 1. Regular posts
  const postsPaths = findAllFiles(zip, [
    /your_instagram_activity\/(media|content)\/posts(_\d+)?\.json$/,
    /content\/posts(_\d+)?\.json$/,
    /media\/posts(_\d+)?\.json$/,
    /^posts(_\d+)?\.json$/,
  ]);
  for (const path of postsPaths) {
    const entries = await parseJsonArray(zip, path);
    allEntries.push(...entries);
  }

  // 2. Reels — force type to 'reel' so they show the reel icon even if mp4 thumbnail is extracted
  const reelsPaths = findAllFiles(zip, [
    /your_instagram_activity\/(media|content)\/reels\.json$/,
    /content\/reels\.json$/,
    /reels\.json$/,
  ]);
  for (const path of reelsPaths) {
    const entries = await parseJsonArray(zip, path);
    for (const entry of entries) entry.__forcedType = 'reel';
    allEntries.push(...entries);
  }

  if (!allEntries.length) {
    throw new Error('posts.json / reels.json が見つかりません。Instagramデータエクスポート(JSON形式)のZIPを選択してください。');
  }

  // Dedupe by primary media URI (in case posts.json also references reels)
  const seen = new Set<string>();
  const unique: RawPostEntry[] = [];
  for (const e of allEntries) {
    const uri = e.media?.[0]?.uri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    unique.push(e);
  }

  // Sort newest first
  unique.sort((a, b) => {
    const ta = a.creation_timestamp ?? a.media?.[0]?.creation_timestamp ?? 0;
    const tb = b.creation_timestamp ?? b.media?.[0]?.creation_timestamp ?? 0;
    return tb - ta;
  });

  const totalFound = unique.length;
  const targetPosts = unique.slice(0, MAX_IMPORTED_POSTS);

  const posts: Post[] = [];
  let skipped = 0;

  for (const raw of targetPosts) {
    const firstMedia = raw.media?.[0];
    if (!firstMedia?.uri) {
      skipped++;
      continue;
    }

    const file = findMediaFile(zip, firstMedia.uri);
    if (!file) {
      skipped++;
      continue;
    }

    const isVideo = VIDEO_EXT.test(firstMedia.uri);
    const isImage = IMAGE_EXT.test(firstMedia.uri);
    if (!isVideo && !isImage) {
      skipped++;
      continue;
    }

    try {
      const blob = await file.async('blob');
      const fileName = firstMedia.uri.split('/').pop() || (isVideo ? 'reel.mp4' : 'imported.jpg');
      const fileObj = new File([blob], fileName, {
        type: guessMimeType(firstMedia.uri),
      });

      const dataUrl = isVideo
        ? await extractVideoThumbnail(fileObj)
        : await compressImage(fileObj);

      // Determine post type
      let type: PostType = 'photo';
      if (raw.__forcedType) {
        type = raw.__forcedType;
      } else if (isVideo) {
        type = 'reel';
      } else if ((raw.media?.length ?? 1) > 1) {
        type = 'carousel';
      }

      const timestamp = raw.creation_timestamp ?? firstMedia.creation_timestamp;
      const postedAt = timestamp ? new Date(timestamp * 1000).toISOString() : undefined;

      posts.push({
        id: generateId(),
        imageDataUrl: dataUrl,
        fileName,
        type,
        order: posts.length,
        createdAt: new Date().toISOString(),
        source: 'imported',
        originalPostedAt: postedAt,
        caption: raw.title || firstMedia.title || undefined,
      });
    } catch (e) {
      console.warn('Skip imported post (decode failed):', firstMedia.uri, e);
      skipped++;
    }
  }

  return { posts, totalFound, skipped };
}

async function parseJsonArray(zip: JSZip, path: string): Promise<RawPostEntry[]> {
  try {
    const raw = await zip.files[path].async('string');
    const parsed = JSON.parse(raw);
    // Support multiple shapes:
    //   - Direct array: [...]
    //   - Object with "posts" or "ig_reels_media" or similar arrays
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const candidates = ['posts', 'ig_reels_media', 'ig_posts', 'ig_archived_posts', 'media'];
      for (const k of candidates) {
        if (Array.isArray(parsed[k])) return parsed[k];
      }
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse JSON file:', path, e);
    return [];
  }
}

function findAllFiles(zip: JSZip, patterns: RegExp[]): string[] {
  const all = Object.keys(zip.files);
  const matches = new Set<string>();
  for (const pattern of patterns) {
    for (const f of all) if (pattern.test(f)) matches.add(f);
  }
  return Array.from(matches);
}

function findMediaFile(zip: JSZip, uri: string): JSZip.JSZipObject | null {
  if (zip.files[uri]) return zip.files[uri];

  const lowerUri = uri.toLowerCase();
  const allKeys = Object.keys(zip.files);
  const insensitive = allKeys.find((k) => k.toLowerCase() === lowerUri);
  if (insensitive) return zip.files[insensitive];

  const basename = uri.split('/').pop()?.toLowerCase();
  if (basename) {
    const byBasename = allKeys.find((k) => k.toLowerCase().endsWith('/' + basename));
    if (byBasename) return zip.files[byBasename];
  }

  return null;
}

function guessMimeType(uri: string): string {
  const ext = uri.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic': return 'image/heic';
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case 'm4v': return 'video/mp4';
    case 'webm': return 'video/webm';
    default: return 'image/jpeg';
  }
}
