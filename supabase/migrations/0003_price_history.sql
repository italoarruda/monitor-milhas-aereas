CREATE TABLE IF NOT EXISTS price_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       UUID REFERENCES monitored_routes(id) ON DELETE CASCADE NOT NULL,
  miles_price    INTEGER,
  cash_fee       DECIMAL(10,2),
  miles_per_brl  DECIMAL(10,4),
  available      BOOLEAN,
  checked_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_route ON price_history (route_id, checked_at DESC);

-- RLS: leitura apenas pelo dono da rota (via join)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view price history of own routes"
  ON price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM monitored_routes
      WHERE monitored_routes.id = price_history.route_id
        AND monitored_routes.user_id = auth.uid()
    )
  );

-- Inserção apenas via service role (cron)
CREATE POLICY "Service role can insert price history"
  ON price_history FOR INSERT
  WITH CHECK (TRUE);
