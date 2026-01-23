-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS public.steam_deals CASCADE;

-- Create steam_deals table for API
CREATE TABLE public.steam_deals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  final_price NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
  steam_deck_compatible BOOLEAN DEFAULT false,
  app_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_steam_deals_discount ON public.steam_deals(discount_percent DESC);
CREATE INDEX IF NOT EXISTS idx_steam_deals_steam_deck ON public.steam_deals(steam_deck_compatible);
CREATE INDEX IF NOT EXISTS idx_steam_deals_created_at ON public.steam_deals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.steam_deals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.steam_deals
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert/update/delete (for admin operations)
CREATE POLICY "Allow authenticated insert" ON public.steam_deals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.steam_deals
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.steam_deals
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert sample data (optional - will replace existing data)
TRUNCATE public.steam_deals RESTART IDENTITY CASCADE;

INSERT INTO public.steam_deals (name, discount_percent, original_price, final_price, steam_deck_compatible, app_id)
VALUES
  ('Cyberpunk 2077', 75, 59.99, 14.99, true, '1091500'),
  ('Red Dead Redemption 2', 67, 59.99, 19.79, true, '1174180'),
  ('The Witcher 3: Wild Hunt', 80, 39.99, 7.99, true, '292030'),
  ('Elden Ring', 30, 59.99, 41.99, true, '1245620'),
  ('God of War', 50, 49.99, 24.99, true, '1593500');
