const MAX_SIZE = 1080;
const QUALITY = 0.85;

/**
 * Compress an image file to a JPEG data URL.
 * Uses createImageBitmap (modern, handles HEIC and large iPhone photos better)
 * and falls back to Image() for older browsers.
 */
export async function compressImage(file: File): Promise<string> {
  // Path 1: createImageBitmap (iOS 14.5+, modern Chrome/Firefox)
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const dataUrl = bitmapToDataUrl(bitmap);
      bitmap.close?.();
      return dataUrl;
    } catch (e) {
      // Fall through to Image() path if bitmap decoding fails (e.g. HEIC on some iOS)
      console.warn('createImageBitmap failed, falling back to Image()', e);
    }
  }

  // Path 2: Image() element fallback
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const dataUrl = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Image load failed: ${file.name} (${file.type || 'unknown type'})`));
    };

    img.src = objectUrl;
  });
}

function bitmapToDataUrl(bitmap: ImageBitmap): string {
  return drawToCanvas(bitmap, bitmap.width, bitmap.height);
}

function drawToCanvas(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): string {
  let w = srcW;
  let h = srcH;

  if (w > MAX_SIZE || h > MAX_SIZE) {
    if (w > h) {
      h = Math.round((h * MAX_SIZE) / w);
      w = MAX_SIZE;
    } else {
      w = Math.round((w * MAX_SIZE) / h);
      h = MAX_SIZE;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // iOS Safari: white background prevents transparent->black artifacts when JPEG-encoding PNG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);

  const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
  if (!dataUrl || dataUrl === 'data:,') {
    throw new Error('Canvas encoding produced empty result');
  }
  return dataUrl;
}

export function estimateStorageSize(posts: { imageDataUrl: string }[]): number {
  return posts.reduce((acc, p) => acc + p.imageDataUrl.length * 0.75, 0);
}

/**
 * Extract the first frame of a video file as a compressed JPEG data URL.
 * Used to generate thumbnails for Instagram Reels.
 */
export async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    const url = URL.createObjectURL(file);
    let settled = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error('Video thumbnail extraction timed out'));
      }
    }, 15000);

    video.onloadedmetadata = () => {
      // Seek to 0.3s to skip potential black intro frame
      try {
        video.currentTime = Math.min(0.3, (video.duration || 1) / 2);
      } catch {
        // Some videos seek immediately
      }
    };

    video.onseeked = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) throw new Error('Video has no dimensions');
        const dataUrl = drawToCanvas(video, w, h);
        cleanup();
        resolve(dataUrl);
      } catch (e) {
        cleanup();
        reject(e);
      }
    };

    video.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error(`Video load failed: ${file.name}`));
    };

    video.src = url;
  });
}
