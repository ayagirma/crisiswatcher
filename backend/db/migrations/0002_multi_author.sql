-- Migration 0002: Multi-author and role-based user authentication.
-- Supports Admin and Author roles. Authors can write and edit their own posts.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'author')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS users_email ON users (email);

ALTER TABLE posts ADD COLUMN author_id TEXT;
ALTER TABLE posts ADD COLUMN author_name TEXT NOT NULL DEFAULT '';
