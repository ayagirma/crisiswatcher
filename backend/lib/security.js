// Multi-author authentication, PBKDF2 password hashing, sessions and rate limiting.

import { HttpError } from "./http.js";

const SESSION_DAYS = 14;
const COOKIE = "ecw_admin";
const enc = new TextEncoder();

export function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

// Compares two strings in constant time by comparing their HMACs.
export async function safeEqual(a, b, secret) {
  const keySecret = secret || "ecw_safe_compare";
  const [x, y] = await Promise.all([hmac(keySecret, "cmp:" + a), hmac(keySecret, "cmp:" + b)]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

// PBKDF2-SHA256 password hashing with 100,000 iterations.
export async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return {
    hash: bytesToHex(new Uint8Array(derivedBits)),
    salt: bytesToHex(salt)
  };
}

export async function verifyPassword(password, saltHex, expectedHashHex, secret) {
  const { hash } = await hashPassword(password, saltHex);
  return safeEqual(hash, expectedHashHex, secret || "ecw_verify");
}

function signingSecret(env) {
  return env.ADMIN_PASSWORD || "ecw_secure_session_key";
}

export async function sessionCookie(env, request, userId) {
  const secret = signingSecret(env);
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const sig = await hmac(secret, `session:${userId}:${expires}`);
  const value = `${userId}.${expires}.${sig}`;
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${secureFlag(request)}`;
}

export function clearCookie(request) {
  return `${COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag(request)}`;
}

function secureFlag(request) {
  return new URL(request.url).protocol === "https:" ? "; Secure" : "";
}

// Ensures an initial administrator account exists in the database.
export async function ensureInitialAdmin(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first();
  if (row && row.count > 0) {
    await env.DB.prepare(
      "UPDATE users SET email = 'sshiferaw500@gmail.com' WHERE id = 'admin-primary' AND email != 'sshiferaw500@gmail.com'"
    ).run().catch(() => {});
    return;
  }

  const password = env.ADMIN_PASSWORD || "password123";
  const { hash, salt } = await hashPassword(password);
  const id = "admin-primary";

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, salt, name, role) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, "sshiferaw500@gmail.com", hash, salt, "Soleyana Shiferaw", "admin").run();
}

// Retrieves the authenticated user object from the session cookie.
export async function getUserFromSession(env, request) {
  await ensureInitialAdmin(env);
  const raw = (request.headers.get("Cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const parts = raw.slice(COOKIE.length + 1).split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  if (!userId || !expires || !sig || Number(expires) < Date.now() / 1000) return null;

  const secret = signingSecret(env);
  const expectedSig = await hmac(secret, `session:${userId}:${expires}`);
  if (!(await safeEqual(sig, expectedSig, secret))) return null;

  const user = await env.DB.prepare(
    "SELECT id, email, name, role, created_at FROM users WHERE id = ?"
  ).bind(userId).first();

  return user || null;
}

export async function isLoggedIn(env, request) {
  const user = await getUserFromSession(env, request);
  return Boolean(user);
}

// One-way hash of visitor IP for privacy-first rate limiting.
async function visitorKey(env, request, bucket) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  return bucket + ":" + (await hmac(signingSecret(env), "ip:" + ip)).slice(0, 32);
}

export async function rateLimit(env, request, bucket, max, windowSec) {
  const key = await visitorKey(env, request, bucket);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM rate_limits WHERE at < ?").bind(now - 3600).run();
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key = ? AND at > ?").bind(key, now - windowSec).first();
  if (n >= max) throw new HttpError(429, "Too many tries. Wait a few minutes and try again.");
  await env.DB.prepare("INSERT INTO rate_limits (key, at) VALUES (?, ?)").bind(key, now).run();
}

export async function clearRateLimit(env, request, bucket) {
  await env.DB.prepare("DELETE FROM rate_limits WHERE key = ?").bind(await visitorKey(env, request, bucket)).run();
}
