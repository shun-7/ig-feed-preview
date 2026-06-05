/**
 * Generate a UUID-like ID that works in all browser contexts.
 *
 * crypto.randomUUID() is only available in secure contexts (HTTPS or localhost).
 * Accessing the app via a LAN IP (http://192.168.x.x) on iPhone falls back here.
 */
export function generateId(): string {
  // Path 1: native crypto.randomUUID (HTTPS / localhost)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Path 2: crypto.getRandomValues (available even on HTTP)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version (4) and variant bits per RFC 4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Path 3: Math.random fallback (worst case — should never reach here in real browsers)
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
