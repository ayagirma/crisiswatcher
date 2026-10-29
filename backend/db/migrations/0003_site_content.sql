-- Migration 0003: Dynamic site content storage for the Learn page (timeline, regions, articles, resources, sources).

CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
