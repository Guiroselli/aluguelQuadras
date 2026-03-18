-- Supabase Schema for Condominium Courts Rental System
-- Run this in the Supabase SQL Editor at: https://supabase.com/dashboard/project/_/sql

-- Enable the extension required for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop table if exists for a clean reinstall
DROP TABLE IF EXISTS rentals;

CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court VARCHAR(50) NOT NULL CHECK (court IN ('tennis-blue', 'tennis-red', 'soccer')),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    house_street VARCHAR(255) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure end_time is exactly 1 hour after start_time
ALTER TABLE rentals 
ADD CONSTRAINT check_one_hour_duration 
CHECK (end_time = start_time + interval '1 hour');

-- Ensure start_time is at an exact hour (e.g., 14:00:00, not 14:30:00)
ALTER TABLE rentals
ADD CONSTRAINT check_exact_hour
CHECK (EXTRACT(MINUTE FROM start_time) = 0 AND EXTRACT(SECOND FROM start_time) = 0);

-- Prevent double booking (overlapping rentals for the same court on the same date and time)
ALTER TABLE rentals
ADD CONSTRAINT unique_court_booking UNIQUE (court, date, start_time);

-- Enable Row Level Security (RLS)
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rentals (to check availability)
CREATE POLICY "Allow public read access" ON rentals
    FOR SELECT USING (true);

-- Allow anyone to insert new rentals (public booking form)
CREATE POLICY "Allow public insert access" ON rentals
    FOR INSERT WITH CHECK (true);

-- Allow anyone to delete rentals (for cancellation feature)
CREATE POLICY "Allow public delete access" ON rentals
    FOR DELETE USING (true);
