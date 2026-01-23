-- Update steam_deals table to support ETL pipeline requirements
-- This adds additional columns for enriched data

-- Drop and recreate table with updated schema
DROP TABLE IF EXISTS public.steam_deals CASCADE;

CREATE TABLE public.steam_deals (
  id BIGSERIAL PRIMARY KEY,
  app_id TEXT UNIQUE NOT NULL,  -- Steam App ID (unique identifier)
  name TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  final_price NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
  steam_deck_compatible BOOLEAN DEFAULT false,
  metacritic_score INTEGER CHECK (metacritic_score >= 0 AND metacritic_score <= 100),
  header_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_steam_deals_app_id ON public.steam_deals(app_id);
CREATE INDEX idx_steam_deals_discount ON public.steam_deals(discount_percent DESC);
CREATE INDEX idx_steam_deals_steam_deck ON public.steam_deals(steam_deck_compatible);
CREATE INDEX idx_steam_deals_created_at ON public.steam_deals(created_at DESC);
CREATE INDEX idx_steam_deals_metacritic ON public.steam_deals(metacritic_score DESC) WHERE metacritic_score IS NOT NULL;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_steam_deals_updated_at ON public.steam_deals;
CREATE TRIGGER update_steam_deals_updated_at
    BEFORE UPDATE ON public.steam_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.steam_deals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.steam_deals;
CREATE POLICY "Allow public read access" ON public.steam_deals
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert/update/delete (for ETL worker)
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.steam_deals;
CREATE POLICY "Allow authenticated insert" ON public.steam_deals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON public.steam_deals;
CREATE POLICY "Allow authenticated update" ON public.steam_deals
  FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON public.steam_deals;
CREATE POLICY "Allow authenticated delete" ON public.steam_deals
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert sample data (optional)
INSERT INTO public.steam_deals (app_id, name, discount_percent, original_price, final_price, steam_deck_compatible, metacritic_score, header_image)
VALUES
  ('1091500', 'Cyberpunk 2077', 75, 59.99, 14.99, true, 86, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'),
  ('1174180', 'Red Dead Redemption 2', 67, 59.99, 19.79, true, 97, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg'),
  ('292030', 'The Witcher 3: Wild Hunt', 80, 39.99, 7.99, true, 92, 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg'),
  ('1245620', 'Elden Ring', 30, 59.99, 41.99, true, 96, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'),
  ('1593500', 'God of War', 50, 49.99, 24.99, true, 94, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg')
ON CONFLICT (app_id) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE public.steam_deals IS 'Steam game deals with enriched metadata from ETL pipeline';
COMMENT ON COLUMN public.steam_deals.app_id IS 'Unique Steam Application ID';
COMMENT ON COLUMN public.steam_deals.metacritic_score IS 'Metacritic score (0-100), null if not available';
COMMENT ON COLUMN public.steam_deals.header_image IS 'URL to game header image';
COMMENT ON COLUMN public.steam_deals.updated_at IS 'Last update timestamp (auto-updated)';
