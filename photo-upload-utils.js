// Getting progress photos ready to upload: shrink a phone photo before it leaves the phone,
// and give a batch of photos their angles. A phone photo is 3-12 MB; sent as it is, it is slow
// on a mobile connection, hits the size limit, and makes the gallery slow to open. Shrunk to
// 1600 px it is a few hundred KB and still sharp on any screen the page is shown on.

export const MAX_EDGE = 1600;
export const JPEG_QUALITY = 0.82;
/** An original that cannot be shrunk (a format the browser cannot read) is sent only up to this size. */
export const MAX_ORIGINAL_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTOS_AT_ONCE = 12;

const ANGLE_ORDER = Object.freeze(['front', 'side', 'back']);

/** Size after scaling so that the longer side is at most maxEdge. Never enlarges. */
export function fitWithin(width, height, maxEdge = MAX_EDGE) {
  const w = Number(width); const h = Number(height);
  if (!(w > 0) || !(h > 0)) return { width: 0, height: 0 };
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/** "IMG 01.HEIC" → "IMG-01.jpg": safe in a storage path, and named for what is stored. */
export function jpegName(name) {
  const base = String(name || 'photo').replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${base || 'photo'}.jpg`;
}

/** Angles for a batch in the order Front, Side, Back, starting from the chosen one. */
export function anglesForBatch(count, startAngle = 'front') {
  const start = Math.max(0, ANGLE_ORDER.indexOf(startAngle));
  return Array.from({ length: Math.max(0, count) }, (_, index) => ANGLE_ORDER[(start + index) % ANGLE_ORDER.length]);
}

export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

/** Why a chosen file cannot be used at all, or '' when it can be tried. */
export function fileProblem(file) {
  if (!file) return 'Chưa chọn ảnh.';
  if (file.type && !file.type.startsWith('image/')) return `"${file.name}" không phải là ảnh.`;
  return '';
}

/**
 * Shrinks a photo to a JPEG of at most MAX_EDGE on its longer side, upright as it was taken.
 * Resolves with { file, original, shrunk }: when the browser cannot read the format the
 * original is returned as it is (if small enough), and a photo that is already small is left
 * alone rather than re-encoded into something worse. Browser only.
 */
export async function preparePhoto(file) {
  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    if (file.size > MAX_ORIGINAL_BYTES) {
      throw new Error(`Không đọc được định dạng ảnh "${file.name}" để thu nhỏ, và ảnh gốc lớn hơn ${formatBytes(MAX_ORIGINAL_BYTES)}. Hãy chụp lại ở dạng JPEG hoặc chọn ảnh khác.`);
    }
    return { file, original: file.size, shrunk: false };
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) return { file, original: file.size, shrunk: false };
    if (file.type === 'image/jpeg' && blob.size >= file.size) return { file, original: file.size, shrunk: false };
    return { file: new File([blob], jpegName(file.name), { type: 'image/jpeg' }), original: file.size, shrunk: true };
  } finally {
    bitmap.close?.();
  }
}
