// The backend. Cloudflare runs this for every request to /api/...; every other
// path (the website and the admin page) is served straight from frontend/.

import { error, HttpError } from "./lib/http.js";
import { getUserFromSession } from "./lib/security.js";
import * as pub from "./routes/public.js";
import * as admin from "./routes/admin.js";

// [method, path pattern, handler]. ":id" matches one path segment.
const ROUTES = [
  ["GET",    "/api/posts",                  (c) => pub.listPosts(c.env)],
  ["GET",    "/api/posts/:id",              (c) => pub.getPost(c.env, c.id)],
  ["GET",    "/api/reactions/:id",          (c) => pub.getReactions(c.env, c.id, c.url)],
  ["POST",   "/api/reactions/:id",          (c) => pub.setReaction(c.env, c.request, c.id)],
  ["POST",   "/api/contact",                (c) => pub.contact(c.env, c.request)],
  ["POST",   "/api/subscribe",              (c) => pub.subscribe(c.env, c.request)],
  ["GET",    "/api/images/:id",             (c) => pub.getImage(c.env, c.id)],
  ["GET",    "/api/learn",                  (c) => pub.getLearnContent(c.env)],
  ["GET",    "/api/feed.xml",               (c) => pub.feed(c.env, c.url)],

  ["POST",   "/api/admin/login",            (c) => admin.login(c.env, c.request)],
  ["POST",   "/api/admin/logout",           (c) => admin.logout(c.request)],
  ["GET",    "/api/admin/me",               async (c) => admin.me(await getUserFromSession(c.env, c.request))],
];

// Only reachable after logging in (c.user is passed to every handler)
const ADMIN_ROUTES = [
  ["GET",    "/api/admin/posts",            (c) => admin.listPosts(c.env, c.user)],
  ["POST",   "/api/admin/posts",            (c) => admin.createPost(c.env, c.request, c.user)],
  ["GET",    "/api/admin/posts/:id",        (c) => admin.getPost(c.env, c.id, c.user)],
  ["PUT",    "/api/admin/posts/:id",        (c) => admin.updatePost(c.env, c.request, c.id, c.user)],
  ["DELETE", "/api/admin/posts/:id",        (c) => admin.deletePost(c.env, c.id, c.user)],
  ["POST",   "/api/admin/images",           (c) => admin.uploadImage(c.env, c.request)],
  ["GET",    "/api/admin/messages",         (c) => admin.listMessages(c.env, c.user)],
  ["PUT",    "/api/admin/messages/:id",     (c) => admin.markMessage(c.env, c.request, c.id, c.user)],
  ["DELETE", "/api/admin/messages/:id",     (c) => admin.deleteMessage(c.env, c.id, c.user)],
  ["GET",    "/api/admin/subscribers",      (c) => admin.listSubscribers(c.env, c.user)],
  ["DELETE", "/api/admin/subscribers",      (c) => admin.deleteSubscriber(c.env, c.url, c.user)],
  ["GET",    "/api/admin/users",            (c) => admin.listUsers(c.env, c.user)],
  ["POST",   "/api/admin/users",            (c) => admin.createUser(c.env, c.request, c.user)],
  ["PUT",    "/api/admin/users/:id",        (c) => admin.updateUser(c.env, c.request, c.id, c.user)],
  ["DELETE", "/api/admin/users/:id",        (c) => admin.deleteUser(c.env, c.id, c.user)],
  ["GET",    "/api/admin/learn",            (c) => admin.getLearn(c.env)],
  ["PUT",    "/api/admin/learn",            (c) => admin.saveLearn(c.env, c.request)],
];

function match(routes, method, path) {
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const want = pattern.split("/"), got = path.split("/");
    if (want.length !== got.length) continue;
    let id = null, ok = true;
    for (let i = 0; i < want.length && ok; i++) {
      if (want[i] === ":id") { try { id = decodeURIComponent(got[i]); } catch { ok = false; } }
      else ok = want[i] === got[i];
    }
    if (ok && (id === null || id)) return { handler, id };
  }
  return null;
}

async function handleApi(request, env, url) {
  const path = url.pathname.replace(/\/+$/, "");
  const pub = match(ROUTES, request.method, path);
  if (pub) return pub.handler({ request, env, url, id: pub.id });

  const priv = match(ADMIN_ROUTES, request.method, path);
  if (priv) {
    const user = await getUserFromSession(env, request);
    if (!user) return error(401, "Log in first.");
    return priv.handler({ request, env, url, id: priv.id, user });
  }

  return error(404, "Not found");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/feed.xml" || url.pathname === "/rss.xml") return pub.feed(env, url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      return await handleApi(request, env, url);
    } catch (e) {
      if (e instanceof HttpError) return error(e.status, e.message);
      console.error(e);
      return error(500, "Something went wrong on the server. Try again.");
    }
  },
};
