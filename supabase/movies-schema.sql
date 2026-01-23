-- Movies table schema for TMDB API data
-- Stores curated movie information with ratings and popularity

DROP TABLE IF EXISTS public.movies CASCADE;

CREATE TABLE public.movies (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id TEXT UNIQUE NOT NULL,  -- TMDB Movie ID (unique identifier)
  title TEXT NOT NULL,
  original_title TEXT,
  release_date DATE,
  rating NUMERIC(3, 1) CHECK (rating >= 0 AND rating <= 10),
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(10, 2) DEFAULT 0,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  genre_ids INTEGER[],
  adult BOOLEAN DEFAULT false,
  original_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX idx_movies_rating ON public.movies(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX idx_movies_popularity ON public.movies(popularity DESC);
CREATE INDEX idx_movies_release_date ON public.movies(release_date DESC);
CREATE INDEX idx_movies_vote_count ON public.movies(vote_count DESC);
CREATE INDEX idx_movies_created_at ON public.movies(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_movies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_movies_updated_at ON public.movies;
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON public.movies
    FOR EACH ROW
    EXECUTE FUNCTION update_movies_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.movies;
CREATE POLICY "Allow public read access" ON public.movies
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert/update/delete (for ETL worker)
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.movies;
CREATE POLICY "Allow authenticated insert" ON public.movies
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON public.movies;
CREATE POLICY "Allow authenticated update" ON public.movies
  FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON public.movies;
CREATE POLICY "Allow authenticated delete" ON public.movies
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert sample data (optional)
INSERT INTO public.movies (tmdb_id, title, original_title, release_date, rating, vote_count, popularity, overview, poster_path, backdrop_path, genre_ids, original_language)
VALUES
  ('823464', 'Godzilla x Kong: The New Empire', 'Godzilla x Kong: The New Empire', '2024-03-27', 7.2, 3452, 847.56, 'The epic battle continues! Legends collide in this explosive new chapter.', '/gmGK04iR0dwMeXlKszcCi8VTKa8.jpg', '/9oYdz5gDoIl8h67e3ccv3OHtmm2.jpg', ARRAY[28, 878, 12], 'en'),
  ('573435', 'Bad Boys: Ride or Die', 'Bad Boys: Ride or Die', '2024-06-05', 7.6, 2891, 624.33, 'After their late former Captain is framed, Mike and Marcus go on the run.', '/oGythE98MYleE6mZlGs5oBGkux1.jpg', '/ga4OLm4qTkZ8XLlF0uVjwXxlHUy.jpg', ARRAY[28, 80, 53], 'en'),
  ('653346', 'Kingdom of the Planet of the Apes', 'Kingdom of the Planet of the Apes', '2024-05-08', 7.1, 2567, 512.89, 'Several generations in the future following Caesar''s reign.', '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', '/fqv8v6AycXKsivp1T5yKtLbGXce.jpg', ARRAY[878, 12, 28], 'en'),
  ('1022789', 'Inside Out 2', 'Inside Out 2', '2024-06-11', 7.7, 4123, 1024.67, 'Teenager Riley''s mind headquarters is undergoing a sudden demolition.', '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', '/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg', ARRAY[16, 10751, 12, 35], 'en'),
  ('748783', 'The Garfield Movie', 'The Garfield Movie', '2024-04-30', 7.1, 1845, 423.12, 'Garfield is about to go on a wild outdoor adventure.', '/p6AbOJvMQhBmffd0PIv0u8ghWeY.jpg', '/4FGvfPJ4pzANxZnVm5x5GZgfhI.jpg', ARRAY[16, 35, 10751], 'en')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Add comments to table
COMMENT ON TABLE public.movies IS 'Movie data from TMDB API with ratings and popularity';
COMMENT ON COLUMN public.movies.tmdb_id IS 'Unique TMDB Movie ID';
COMMENT ON COLUMN public.movies.rating IS 'Average rating (0-10)';
COMMENT ON COLUMN public.movies.vote_count IS 'Number of votes/ratings';
COMMENT ON COLUMN public.movies.popularity IS 'TMDB popularity score';
COMMENT ON COLUMN public.movies.genre_ids IS 'Array of genre IDs';
COMMENT ON COLUMN public.movies.updated_at IS 'Last update timestamp (auto-updated)';
