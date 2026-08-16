-- Application / indexing schema (blockchain remains source of truth)

CREATE TABLE IF NOT EXISTS wallets (
  address TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions_cache (
  address TEXT PRIMARY KEY,
  collateral_usd NUMERIC NOT NULL DEFAULT 0,
  debt_usd NUMERIC NOT NULL DEFAULT 0,
  health_factor NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS protocol_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
