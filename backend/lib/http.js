// Small helpers shared by every route.

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export function error(status, message) {
  return json({ error: message }, status);
}

// Thrown by validators; index.js turns it into a JSON error response.
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function readJson(request, maxBytes = 200_000) {
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) {
    throw new HttpError(415, "Send JSON");
  }
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "That's too long");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "Couldn't read the request"); }
}

// Trim a string field and enforce a maximum length.
export function text(value, max, field) {
  const s = typeof value === "string" ? value.trim() : "";
  if (s.length > max) throw new HttpError(400, `${field} is too long (max ${max} characters)`);
  return s;
}

export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
