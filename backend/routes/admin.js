// Routes behind authentication: writing posts, uploading photos, author & user management.

import { json, error, readJson, text, today, isEmail, HttpError } from "../lib/http.js";
import {
  sessionCookie,
  clearCookie,
  hashPassword,
  verifyPassword,
  rateLimit,
  clearRateLimit,
  ensureInitialAdmin
} from "../lib/security.js";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 1_900_000;

function requireAdmin(user) {
  if (!user || user.role !== "admin") {
    throw new HttpError(403, "Administrator access required for this action.");
  }
}

// POST /api/admin/login  { email?, password }
export async function login(env, request) {
  const body = await readJson(request, 2000);
  const password = text(body.password, 200, "Password");
  const emailInput = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!password) return error(400, "Enter your password.");

  await rateLimit(env, request, "login", 10, 900);
  await ensureInitialAdmin(env);

  let targetUser = null;

  if (emailInput) {
    targetUser = await env.DB.prepare(
      "SELECT id, email, password_hash, salt, name, role FROM users WHERE email = ?"
    ).bind(emailInput).first();
  } else {
    // Legacy / single-password fallback: match against primary admin
    targetUser = await env.DB.prepare(
      "SELECT id, email, password_hash, salt, name, role FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1"
    ).first();
  }

  if (!targetUser) {
    return error(401, "Invalid email or password.");
  }

  let valid = await verifyPassword(password, targetUser.salt, targetUser.password_hash);
  if (!valid && targetUser.id === "admin-primary" && env.ADMIN_PASSWORD) {
    if (password === env.ADMIN_PASSWORD) {
      valid = true;
      const { hash: newHash, salt: newSalt } = await hashPassword(password);
      await env.DB.prepare(
        "UPDATE users SET password_hash = ?, salt = ? WHERE id = 'admin-primary'"
      ).bind(newHash, newSalt).run().catch(() => {});
    }
  }

  if (!valid) {
    return error(401, "Invalid email or password.");
  }

  await clearRateLimit(env, request, "login");

  const safeUser = {
    id: targetUser.id,
    email: targetUser.email,
    name: targetUser.name,
    role: targetUser.role
  };

  return json(
    { ok: true, user: safeUser },
    200,
    { "Set-Cookie": await sessionCookie(env, request, targetUser.id) }
  );
}

export function logout(request) {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie(request) });
}

export async function me(user) {
  if (!user) return json({ loggedIn: false });
  return json({
    loggedIn: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}

// ── Posts Management ───────────────────────────────────

export async function listPosts(env, user) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.title, p.summary, p.status, p.date, p.updated_at, p.author_id, p.author_name,
       (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.vote = 'like')    AS likes,
       (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.vote = 'dislike') AS dislikes
     FROM posts p ORDER BY (p.status = 'draft') DESC, p.date DESC, p.created_at DESC`
  ).all();

  const postsWithPerms = (results || []).map((p) => ({
    ...p,
    canEdit: user.role === "admin" || !p.author_id || p.author_id === user.id
  }));

  let unread = 0;
  if (user.role === "admin") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS unread FROM messages WHERE is_read = 0").first();
    unread = (row && row.unread) || 0;
  }

  return json({ posts: postsWithPerms, unreadMessages: unread, user });
}

export async function getPost(env, id, user) {
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
  if (!post) return error(404, "Post not found");

  const canEdit = user.role === "admin" || !post.author_id || post.author_id === user.id;
  return json({ post: { ...post, canEdit } });
}

function postFields(body) {
  const title = text(body.title, 200, "Title");
  if (!title) throw new HttpError(400, "Give the post a title.");
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : today();
  const status = body.status === "published" ? "published" : "draft";
  const authorName = typeof body.author_name === "string" ? body.author_name.trim() : "";
  return {
    title,
    summary: text(body.summary, 400, "Summary"),
    body: text(body.body, 200_000, "Post"),
    date,
    status,
    author_name: authorName
  };
}

async function uniqueId(env, title) {
  let base = title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 60).replace(/-+$/, "");
  if (!base) base = "post-" + crypto.randomUUID().slice(0, 6);
  for (let i = 1; ; i++) {
    const id = i === 1 ? base : `${base}-${i}`;
    if (!(await env.DB.prepare("SELECT 1 FROM posts WHERE id = ?").bind(id).first())) return id;
  }
}

export async function createPost(env, request, user) {
  const f = postFields(await readJson(request));
  const id = await uniqueId(env, f.title);

  // Author attribution: Admins may set a custom author name; authors default to their own name
  let authorId = user.id;
  let authorName = user.name;
  if (user.role === "admin" && f.author_name) {
    authorName = f.author_name;
  }

  await env.DB.prepare(
    "INSERT INTO posts (id, title, summary, body, status, date, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, f.title, f.summary, f.body, f.status, f.date, authorId, authorName).run();

  return getPost(env, id, user);
}

export async function updatePost(env, request, id, user) {
  const existing = await env.DB.prepare("SELECT author_id FROM posts WHERE id = ?").bind(id).first();
  if (!existing) return error(404, "Post not found");

  if (user.role !== "admin" && existing.author_id && existing.author_id !== user.id) {
    throw new HttpError(403, "You can only edit your own posts.");
  }

  const f = postFields(await readJson(request));

  let authorNameQuery = "";
  const params = [f.title, f.summary, f.body, f.status, f.date];

  if (user.role === "admin" && f.author_name) {
    authorNameQuery = ", author_name = ?";
    params.push(f.author_name);
  }
  params.push(id);

  const { meta } = await env.DB.prepare(
    `UPDATE posts SET title = ?, summary = ?, body = ?, status = ?, date = ?${authorNameQuery}, updated_at = datetime('now') WHERE id = ?`
  ).bind(...params).run();

  return meta.changes ? getPost(env, id, user) : error(404, "Post not found");
}

export async function deletePost(env, id, user) {
  const existing = await env.DB.prepare("SELECT author_id FROM posts WHERE id = ?").bind(id).first();
  if (!existing) return error(404, "Post not found");

  if (user.role !== "admin" && existing.author_id && existing.author_id !== user.id) {
    throw new HttpError(403, "You can only delete your own posts.");
  }

  await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ── Image Uploads ──────────────────────────────────────

export async function uploadImage(env, request) {
  const type = (request.headers.get("Content-Type") || "").split(";")[0].trim();
  if (!IMAGE_TYPES.includes(type)) return error(415, "Use a JPG, PNG, WebP, or GIF image.");
  const data = await request.arrayBuffer();
  if (data.byteLength > MAX_IMAGE_BYTES) return error(413, "That image is too large. Try a smaller photo.");
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO images (id, type, data) VALUES (?, ?, ?)").bind(id, type, data).run();
  return json({ url: `/api/images/${id}` });
}

// ── Contact Messages (Admin only) ──────────────────────

export async function listMessages(env, user) {
  requireAdmin(user);
  const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 500").all();
  return json({ messages: results });
}

export async function markMessage(env, request, id, user) {
  requireAdmin(user);
  const { read } = await readJson(request, 200);
  await env.DB.prepare("UPDATE messages SET is_read = ? WHERE id = ?").bind(read ? 1 : 0, id).run();
  return json({ ok: true });
}

export async function deleteMessage(env, id, user) {
  requireAdmin(user);
  await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ── Subscribers (Admin only) ───────────────────────────

export async function listSubscribers(env, user) {
  requireAdmin(user);
  const { results } = await env.DB.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC").all();
  return json({ subscribers: results });
}

export async function deleteSubscriber(env, url, user) {
  requireAdmin(user);
  await env.DB.prepare("DELETE FROM subscribers WHERE email = ?").bind(url.searchParams.get("email") || "").run();
  return json({ ok: true });
}

// ── Author & User Management (Admin only) ──────────────

export async function listUsers(env, user) {
  requireAdmin(user);
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.role, u.created_at,
       (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) AS post_count
     FROM users u ORDER BY (u.role = 'admin') DESC, u.created_at ASC`
  ).all();
  return json({ users: results });
}

export async function createUser(env, request, user) {
  requireAdmin(user);
  const body = await readJson(request, 2000);
  const name = text(body.name, 100, "Author Name");
  const email = text(body.email, 254, "Email").toLowerCase();
  const password = text(body.password, 200, "Password");
  const role = body.role === "admin" ? "admin" : "author";

  if (!name) return error(400, "Author name is required.");
  if (!isEmail(email)) return error(400, "Enter a valid email address.");
  if (!password || password.length < 8) return error(400, "Password must be at least 8 characters.");

  const existing = await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
  if (existing) return error(400, "An author with that email already exists.");

  const { hash, salt } = await hashPassword(password);
  const id = "u-" + crypto.randomUUID().slice(0, 8);

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, salt, name, role) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, email, hash, salt, name, role).run();

  return json({ ok: true, user: { id, email, name, role } });
}

export async function updateUser(env, request, id, user) {
  requireAdmin(user);
  const body = await readJson(request, 2000);
  const name = text(body.name, 100, "Author Name");
  const role = body.role === "admin" ? "admin" : "author";

  const target = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  if (!target) return error(404, "Author not found.");

  if (target.id === user.id && role !== "admin") {
    return error(400, "You cannot remove your own admin privileges.");
  }

  if (body.password) {
    const password = text(body.password, 200, "Password");
    if (password.length < 8) return error(400, "Password must be at least 8 characters.");
    const { hash, salt } = await hashPassword(password);
    await env.DB.prepare(
      "UPDATE users SET name = ?, role = ?, password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(name || target.name, role, hash, salt, id).run();
  } else {
    await env.DB.prepare(
      "UPDATE users SET name = ?, role = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(name || target.name, role, id).run();
  }

  return json({ ok: true });
}

export async function deleteUser(env, id, user) {
  requireAdmin(user);
  if (id === user.id) return error(400, "You cannot delete your own account.");

  const target = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
  if (!target) return error(404, "Author not found.");

  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

// ── Learn Page Content Management (Admin & Authors) ────

async function ensureSiteContentTable(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_content (
      key        TEXT PRIMARY KEY,
      data       TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();
}

export async function getLearn(env) {
  await ensureSiteContentTable(env);
  const row = await env.DB.prepare("SELECT data, updated_at FROM site_content WHERE key = 'learn'").first();
  if (!row || !row.data) return json({ learn: null });
  return json({ learn: JSON.parse(row.data), updated_at: row.updated_at });
}

export async function saveLearn(env, request) {
  await ensureSiteContentTable(env);
  const body = await readJson(request, 500_000);
  if (!body || typeof body !== "object") return error(400, "Invalid Learn page data.");

  const payload = {};
  if (Array.isArray(body.timeline)) payload.timeline = body.timeline;
  if (Array.isArray(body.regionsInfo)) payload.regionsInfo = body.regionsInfo;
  if (Array.isArray(body.articles)) payload.articles = body.articles;
  if (Array.isArray(body.resources)) payload.resources = body.resources;
  if (Array.isArray(body.sources)) payload.sources = body.sources;

  const jsonStr = JSON.stringify(payload);
  await env.DB.prepare(
    `INSERT INTO site_content (key, data, updated_at) VALUES ('learn', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
  ).bind(jsonStr).run();

  return json({ ok: true, learn: payload });
}
