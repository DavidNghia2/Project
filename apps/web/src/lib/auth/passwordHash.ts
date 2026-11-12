/**
 * One-way salted mock digest helper.
 * Ensures plaintext passwords are never stored in browser storage even during
 * local prototype mode. This is a deterministic frontend hash for demo UX only
 * and is NOT cryptographic backend authentication.
 */

const HASH_PREFIX = 'mock_digest_v1';

function mix32(state: number, value: number): number {
  let h = (state ^ value) >>> 0;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function generateSalt(seedHint?: string): string {
  const bytes = new Uint8Array(8);
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    const seed = `${seedHint ?? 'salt'}:${Date.now()}:${Math.random()}`;
    let acc = 0x811c9dc5;
    for (let i = 0; i < seed.length; i += 1) {
      acc = mix32(acc, seed.charCodeAt(i) + i);
    }
    for (let i = 0; i < bytes.length; i += 1) {
      acc = mix32(acc, i * 31 + 17);
      bytes[i] = acc & 0xff;
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function computeDigestHex(password: string, salt: string): string {
  const input = `${salt}::${password}::smart-inventory-mock-pepper`;
  // Four independent 32-bit lanes mixed across 12 rounds to form a 128-bit hex digest
  const lanes = [0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344];

  for (let round = 0; round < 12; round += 1) {
    for (let i = 0; i < input.length; i += 1) {
      const ch = input.charCodeAt(i);
      const laneIdx = (i + round) & 3;
      lanes[laneIdx] = mix32(lanes[laneIdx], ch + round * 131 + i * 17);
      lanes[(laneIdx + 1) & 3] = (lanes[(laneIdx + 1) & 3] ^ ((lanes[laneIdx] << 7) | (lanes[laneIdx] >>> 25))) >>> 0;
    }
  }

  return lanes.map((n) => n.toString(16).padStart(8, '0')).join('');
}

export function hashMockPassword(password: string, salt?: string): string {
  const effectiveSalt = salt ?? generateSalt(password);
  const digest = computeDigestHex(password, effectiveSalt);
  return `${HASH_PREFIX}$${effectiveSalt}$${digest}`;
}

export function verifyMockPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }
  const [, salt, expectedDigest] = parts;
  if (!salt || !expectedDigest) {
    return false;
  }
  const actualDigest = computeDigestHex(password, salt);
  if (actualDigest.length !== expectedDigest.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < actualDigest.length; i += 1) {
    diff |= actualDigest.charCodeAt(i) ^ expectedDigest.charCodeAt(i);
  }
  return diff === 0;
}
