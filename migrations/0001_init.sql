-- Trade accounts (free signup with ABN unlocks prices), sessions, quote orders and contact messages.
CREATE TABLE buyers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  business TEXT NOT NULL,
  abn TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL,
  business_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_buyer ON sessions(buyer_id);
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id TEXT REFERENCES buyers(id),
  business TEXT NOT NULL,
  abn TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  payment TEXT NOT NULL CHECK (payment IN ('payid','paypal','bank')),
  pay_by TEXT NOT NULL,
  notes TEXT,
  items TEXT NOT NULL,
  total_cases INTEGER NOT NULL CHECK (total_cases >= 250),
  subtotal REAL NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (payment = 'bank' OR (payment = 'payid' AND subtotal <= 10000) OR (payment = 'paypal' AND subtotal <= 3000))
);
CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
