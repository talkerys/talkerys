-- Enums
CREATE TYPE english_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_method AS ENUM ('yape', 'plin', 'transfer');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  english_level english_level NOT NULL DEFAULT 'beginner',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  status user_status NOT NULL DEFAULT 'pending',
  role user_role NOT NULL DEFAULT 'user',
  sessions_attended INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-crear profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, english_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'english_level', 'beginner')::english_level
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Plans
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sessions_included INTEGER NOT NULL,
  tag TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true
);

INSERT INTO plans (slug, name, price, sessions_included, tag) VALUES
  ('session', '1 Sesión', 30, 1, 'Pruébalo'),
  ('duo', '2 Sesiones', 50, 2, 'Popular'),
  ('monthly', 'Mensual', 100, 4, 'Mejor valor');

-- Subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL DEFAULT 'pending',
  sessions_remaining INTEGER NOT NULL DEFAULT 0,
  starts_at DATE,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'yape',
  voucher_url TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  status payment_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT DEFAULT '',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cafeterias
CREATE TABLE cafeterias (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT DEFAULT 'Miraflores',
  google_maps_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  max_tables INTEGER DEFAULT 3,
  notes TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cafeterias (name, address, phone, notes) VALUES
  ('Café de Lima', 'Av. Larco 345, Miraflores', '999000001', 'Amplio, buena iluminación'),
  ('The Coffee Road', 'Calle Berlín 210, Miraflores', '999000002', 'Ambiente tranquilo'),
  ('Origin Coffee Lab', 'Av. Diagonal 498, Miraflores', '999000003', 'Café de especialidad');

-- Sessions
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT DEFAULT '',
  session_date DATE NOT NULL,
  time_start TIME DEFAULT '20:00',
  time_end TIME DEFAULT '22:00',
  cafeteria_id INTEGER REFERENCES cafeterias(id),
  status session_status DEFAULT 'scheduled',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Tables (mesas)
CREATE TABLE session_tables (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  table_label TEXT NOT NULL,
  target_level english_level,
  moderator_name TEXT DEFAULT '',
  max_seats INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Assignments
CREATE TABLE table_assignments (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES session_tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, user_id)
);

-- Club Settings
CREATE TABLE club_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO club_settings (key, value) VALUES
  ('yape_number', '999-999-999'),
  ('plin_number', '999-999-999'),
  ('contact_whatsapp', '+51999999999');

-- Indexes
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_table_assignments_user ON table_assignments(user_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users see tablemates" ON profiles FOR SELECT USING (
  id IN (
    SELECT ta2.user_id FROM table_assignments ta1
    JOIN table_assignments ta2 ON ta1.table_id = ta2.table_id
    WHERE ta1.user_id = auth.uid()
  )
);
CREATE POLICY "Users own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own subs" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
