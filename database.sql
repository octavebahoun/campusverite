-- CampusVérité Database Schema Setup
-- Execute this SQL code in your Supabase SQL Editor to initialize the database tables.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Table `avis`
CREATE TABLE IF NOT EXISTS avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie TEXT NOT NULL, -- Pédagogie | Infrastructure | Administration | Équipements
  type TEXT NOT NULL,      -- coup_de_gueule | suggestion
  contenu TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  signale BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Table `votes`
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avis_id UUID REFERENCES avis(id) ON DELETE CASCADE,
  pseudo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (avis_id, pseudo)
);

-- Create index on categories and types to optimize filters
CREATE INDEX IF NOT EXISTS idx_avis_categorie ON avis(categorie);
CREATE INDEX IF NOT EXISTS idx_avis_type ON avis(type);
CREATE INDEX IF NOT EXISTS idx_votes_pseudo ON votes(pseudo);

-- Set Row Level Security (RLS) policies if needed (optional)
-- For development simplicity, you can disable RLS or add public read/write access policies:
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy to read avis (public access)
CREATE POLICY "Allow public read avis" ON avis FOR SELECT USING (true);

-- Policy to insert avis (public access)
CREATE POLICY "Allow public insert avis" ON avis FOR INSERT WITH CHECK (true);

-- Policy to update votes (public access)
CREATE POLICY "Allow public update avis" ON avis FOR UPDATE USING (true);

-- Policy to read votes (public access)
CREATE POLICY "Allow public read votes" ON votes FOR SELECT USING (true);

-- Policy to insert votes (public access)
CREATE POLICY "Allow public insert votes" ON votes FOR INSERT WITH CHECK (true);
