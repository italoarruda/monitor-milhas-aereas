CREATE TABLE IF NOT EXISTS alert_configs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id          UUID REFERENCES monitored_routes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  threshold_percent DECIMAL NOT NULL DEFAULT 5,
  notify_email      BOOLEAN NOT NULL DEFAULT TRUE,
  notify_telegram   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alert configs"
  ON alert_configs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
