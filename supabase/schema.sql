-- ============================================================
-- WallDash — Esquema de Base de Datos (Supabase)
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLAS

CREATE TABLE allowed_emails (
  email TEXT PRIMARY KEY
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  color TEXT DEFAULT 'morado',
  is_familiar BOOLEAN DEFAULT false,
  is_menstruation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO profiles (id, username, color, is_familiar)
VALUES ('00000000-0000-0000-0000-000000000000', 'familiar', 'morado', true);

INSERT INTO profiles (id, username, color, is_familiar, is_menstruation)
VALUES ('11111111-1111-1111-1111-111111111111', 'menstruación', 'rojo', false, true);

CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES profiles(id),
  period_phase TEXT CHECK (period_phase IN ('start', 'end', NULL)),
  recurring_group_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_start_at ON events (start_at);
CREATE INDEX idx_events_recurring_group ON events (recurring_group_id);

CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- PIN por defecto (cámbialo por tu PIN en la app):
INSERT INTO config (key, value) VALUES ('tablet_pin', '1234');

CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  done_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE shopping_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  is_bought BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  bought_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- 2. RLS (todo público — app doméstica)

ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_access_allowed_emails" ON allowed_emails FOR ALL USING (true);
CREATE POLICY "all_access_profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "all_access_events" ON events FOR ALL USING (true);
CREATE POLICY "all_access_tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "all_access_shopping_items" ON shopping_items FOR ALL USING (true);
CREATE POLICY "all_access_config" ON config FOR ALL USING (true);

-- 3. TRIGGER — crear perfil al registrarse en Supabase Auth

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = 'public'
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM allowed_emails WHERE email = NEW.email) THEN
    INSERT INTO profiles (id, email, username, color)
    VALUES (
      NEW.id,
      NEW.email,
      split_part(NEW.email, '@', 1),
      'morado'
    );
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Email no autorizado. Contacta con el administrador.';
  END IF;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. RPC — resolver email por username (para login con username)

CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY definer
SET search_path = 'public'
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM profiles WHERE username = p_username;
  RETURN v_email;
END;
$$;

-- 5. SEED — emails whitelist

-- Añade aquí los emails autorizados para usar /mobile:
INSERT INTO allowed_emails (email) VALUES
  ('tu@email.com')
ON CONFLICT DO NOTHING;

-- 6. REALTIME — habilitar suscripciones en tiempo real

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;

-- 7. TELEGRAM BOT — usuarios autorizados

CREATE TABLE telegram_allowed_users (
  telegram_user_id BIGINT PRIMARY KEY
);

-- Añade aquí los IDs de Telegram autorizados para el bot:
-- INSERT INTO telegram_allowed_users (telegram_user_id) VALUES (123456789);

-- 8. CLEANUP — borrar items completados tras 24 horas

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION cleanup_completed_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM tasks
  WHERE is_done = true
    AND done_at < now() - interval '24 hours';

  DELETE FROM shopping_items
  WHERE is_bought = true
    AND bought_at < now() - interval '24 hours';
END;
$$;

SELECT cron.schedule(
  'cleanup-completed-items',
  '0 * * * *',
  'SELECT cleanup_completed_items()'
);
