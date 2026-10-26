// Routes anyone can call: reading posts, liking, the contact form, the newsletter.

import { json, error, readJson, text, isEmail, HttpError } from "../lib/http.js";
import { rateLimit } from "../lib/security.js";

const COUNTS = `
  (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.vote = 'like')    AS likes,
  (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.vote = 'dislike') AS dislikes`;

// GET /api/posts: published posts, newest first.
export async function listPosts(env) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.title, p.summary, p.date, p.author_name, ${COUNTS}
       FROM posts p WHERE p.status = 'published' ORDER BY p.date DESC, p.created_at DESC`
  ).all();
  return json({ posts: results });
}

// GET /api/posts/:id: one published post.
export async function getPost(env, id) {
  const post = await env.DB.prepare(
    `SELECT p.id, p.title, p.summary, p.body, p.date, p.author_name, ${COUNTS}
       FROM posts p WHERE p.id = ? AND p.status = 'published'`
  ).bind(id).first();
  return post ? json({ post }) : error(404, "Post not found");
}

function voterOf(value) {
  const v = typeof value === "string" ? value : "";
  if (!/^[\w-]{8,64}$/.test(v)) throw new HttpError(400, "Missing voter id");
  return v;
}

async function reactionState(env, id, voter) {
  const row = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM reactions WHERE post_id = ?1 AND vote = 'like')    AS likes,
       (SELECT COUNT(*) FROM reactions WHERE post_id = ?1 AND vote = 'dislike') AS dislikes,
       (SELECT vote FROM reactions WHERE post_id = ?1 AND voter = ?2)           AS mine`
  ).bind(id, voter).first();
  return { likes: row.likes, dislikes: row.dislikes, mine: row.mine || null };
}

async function requirePublished(env, id) {
  const p = await env.DB.prepare("SELECT 1 FROM posts WHERE id = ? AND status = 'published'").bind(id).first();
  if (!p) throw new HttpError(404, "Post not found");
}

// GET /api/reactions/:id?voter=...: totals plus this reader's own choice.
export async function getReactions(env, id, url) {
  await requirePublished(env, id);
  return json(await reactionState(env, id, voterOf(url.searchParams.get("voter"))));
}

// POST /api/reactions/:id  { voter, vote: "like" | "dislike" | null }
export async function setReaction(env, request, id) {
  const body = await readJson(request, 1000);
  const voter = voterOf(body.voter);
  const vote = body.vote;
  if (vote !== null && vote !== "like" && vote !== "dislike") return error(400, "vote must be like, dislike, or null");
  await requirePublished(env, id);
  await rateLimit(env, request, "react", 60, 600);
  if (vote === null) {
    await env.DB.prepare("DELETE FROM reactions WHERE post_id = ? AND voter = ?").bind(id, voter).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO reactions (post_id, voter, vote) VALUES (?, ?, ?)
       ON CONFLICT (post_id, voter) DO UPDATE SET vote = excluded.vote`
    ).bind(id, voter, vote).run();
  }
  return json(await reactionState(env, id, voter));
}

// POST /api/contact  { topic, name, email, message, website }
export async function contact(env, request) {
  const body = await readJson(request, 20_000);
  if (body.website) return json({ ok: true });   // hidden field only bots fill in
  const email = text(body.email, 254, "Email");
  const message = text(body.message, 8000, "Message");
  if (!isEmail(email)) return error(400, "Add an email address so we can reply.");
  if (!message) return error(400, "Write a message before sending.");
  await rateLimit(env, request, "contact", 5, 3600);
  await env.DB.prepare("INSERT INTO messages (topic, name, email, message) VALUES (?, ?, ?, ?)")
    .bind(text(body.topic, 100, "Topic"), text(body.name, 100, "Name"), email, message).run();
  return json({ ok: true });
}

// POST /api/subscribe  { email }
export async function subscribe(env, request) {
  const body = await readJson(request, 1000);
  const email = text(body.email, 254, "Email").toLowerCase();
  if (!isEmail(email)) return error(400, "Enter an email address like name@email.com.");
  await rateLimit(env, request, "subscribe", 5, 3600);
  await env.DB.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").bind(email).run();
  return json({ ok: true });
}

// GET /api/images/:id
export async function getImage(env, id) {
  const img = await env.DB.prepare("SELECT type, data FROM images WHERE id = ?").bind(id).first();
  if (!img) return error(404, "Image not found");
  return new Response(new Uint8Array(img.data), {
    headers: { "Content-Type": img.type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}

// GET /api/feed.xml or /rss.xml
export async function feed(env, url) {
  const origin = url.origin;
  const { results } = await env.DB.prepare(
    `SELECT id, title, summary, date, created_at FROM posts WHERE status = 'published' ORDER BY date DESC, created_at DESC LIMIT 30`
  ).all();

  const itemsXml = (results || []).map((p) => {
    const postUrl = `${origin}/#blog-${p.id}`;
    const pubDate = new Date(p.date || p.created_at).toUTCString();
    return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${p.summary || p.title}]]></description>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ethiopia Crisis Watch</title>
    <link>${origin}/</link>
    <description>Verified updates, situation reports, and civil advocacy for communities affected by conflict in Ethiopia.</description>
    <language>en-us</language>
    <atom:link href="${origin}/api/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

