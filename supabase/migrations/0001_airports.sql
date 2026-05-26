CREATE TABLE IF NOT EXISTS airports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code   VARCHAR(3) UNIQUE,
  icao_code   VARCHAR(4),
  name        TEXT NOT NULL,
  city        TEXT,
  country     TEXT,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  is_brazil   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports (iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports USING gin (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_airports_brazil ON airports (is_brazil);

-- Extensão de busca textual
CREATE EXTENSION IF NOT EXISTS pg_trgm;
