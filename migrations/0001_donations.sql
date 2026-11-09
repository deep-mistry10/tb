CREATE TABLE IF NOT EXISTS donations (
  payment_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL,
  donor_name TEXT NOT NULL DEFAULT '',
  donor_email TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT 'General support',
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
