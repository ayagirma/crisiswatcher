-- First version of the database. Applied with: npm run db:setup (local) or npm run db:setup:online
-- Later changes go in new numbered files (0002_..., 0003_...). Never edit an applied migration.

-- Blog posts written on the admin page.
CREATE TABLE posts (
  id           TEXT PRIMARY KEY,                    -- used in the link: #blog-<id>; never changes after creation
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',            -- one or two sentences shown on the blog list
  body         TEXT NOT NULL DEFAULT '',            -- HTML from the editor; cleaned again when shown
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  date         TEXT NOT NULL,                       -- YYYY-MM-DD shown on the post
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX posts_published ON posts (status, date DESC);

-- One like or dislike per reader (voter = random id kept in their browser) per post.
CREATE TABLE reactions (
  post_id     TEXT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  voter       TEXT NOT NULL,
  vote        TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (post_id, voter)
);
CREATE INDEX reactions_post ON reactions (post_id, vote);

-- Photos added to posts. Resized in the browser before upload, so each is small.
CREATE TABLE images (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  data        BLOB NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Contact form messages. Deliberately no IP address or device details are kept:
-- people may be sharing firsthand accounts and must not be identifiable.
CREATE TABLE messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  topic       TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Newsletter sign-ups.
CREATE TABLE subscribers (
  email       TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Short-lived counters that slow down spam and password guessing.
-- key is a one-way hash, never a raw IP address. Rows older than an hour are deleted.
CREATE TABLE rate_limits (
  key  TEXT NOT NULL,
  at   INTEGER NOT NULL                             -- unix time in seconds
);
CREATE INDEX rate_limits_key ON rate_limits (key, at);
