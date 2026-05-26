CREATE TABLE IF NOT EXISTS monitored_routes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  origin_iata      VARCHAR(3) NOT NULL,
  destination_iata VARCHAR(3) NOT NULL,
  airline          TEXT NOT NULL CHECK (airline IN ('smiles', 'latam', 'azul')),
  cabin_class      TEXT NOT NULL DEFAULT 'economy' CHECK (cabin_class IN ('economy', 'business', 'first')),
  is_azul_diamond  BOOLEAN NOT NULL DEFAULT FALSE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitored_routes_user ON monitored_routes (user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_routes_active ON monitored_routes (active);

-- Row Level Security
ALTER TABLE monitored_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routes"
  ON monitored_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes"
  ON monitored_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes"
  ON monitored_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON monitored_routes FOR DELETE
  USING (auth.uid() = user_id);
