// Trade accounts: free signup with ABN unlocks prices instantly. Sessions live in D1.
export type Buyer = { id: string; email: string; business: string; abn: string; name: string; phone: string; state: string; business_type: string };

const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map((h) => parseInt(h, 16)));

/** ABN checksum (Australian Business Register algorithm). */
export function validAbn(input: string) {
  const d = input.replace(/\s/g, "");
  if (!/^\d{11}$/.test(d)) return false;
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const sum = [...d].reduce((s, c, i) => s + (Number(c) - (i === 0 ? 1 : 0)) * w[i]!, 0);
  return sum % 89 === 0;
}
export const formatAbn = (s: string) => s.replace(/\s/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");

export async function hashPassword(pw: string, saltHex?: string) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return `${hex(salt)}:${hex(bits)}`;
}
export async function checkPassword(pw: string, stored: string) {
  const [salt, want] = stored.split(":");
  if (!salt || !want) return false;
  const got = (await hashPassword(pw, salt)).split(":")[1]!;
  let diff = got.length ^ want.length;
  for (let i = 0; i < Math.min(got.length, want.length); i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

export const SESSION_COOKIE = "sdw_s";
const SESSION_DAYS = 90;
const sha = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

export async function createSession(db: D1Database, buyerId: string) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await db.prepare("INSERT INTO sessions (token_hash, buyer_id, expires_at) VALUES (?,?,?)").bind(await sha(token), buyerId, expires).run();
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}
export const clearCookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export async function currentBuyer(req: Request, db: D1Database): Promise<Buyer | null> {
  const token = req.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([a-f0-9]{64})`))?.[1];
  if (!token) return null;
  try {
    return await db.prepare(`SELECT b.id, b.email, b.business, b.abn, b.name, b.phone, b.state, b.business_type FROM sessions s JOIN buyers b ON b.id = s.buyer_id
      WHERE s.token_hash = ? AND s.expires_at > ?`).bind(await sha(token), new Date().toISOString()).first<Buyer>();
  } catch (e) { console.error(e); return null; }
}
export async function endSession(req: Request, db: D1Database) {
  const token = req.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([a-f0-9]{64})`))?.[1];
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha(token)).run();
}
