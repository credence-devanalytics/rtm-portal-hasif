-- Seed data for astro_rate_n_reach table
-- This script contains sample data based on the structure you provided

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE astro_rate_n_reach RESTART IDENTITY;

-- Insert sample data
INSERT INTO astro_rate_n_reach (tx_date, tx_year, tx_month, channel, metric_type, value)
VALUES 
  -- October 2024 data
  ('2024-10-01', 2024, 10, 'TV1', 'rating', 51),
  ('2024-10-01', 2024, 10, 'TV1', 'reach', 5856),
  ('2024-10-01', 2024, 10, 'TV2', 'rating', 12),
  ('2024-10-01', 2024, 10, 'TV2', 'reach', 5452),
  
  -- November 2024 data
  ('2024-11-01', 2024, 11, 'TV1', 'rating', 44),
  ('2024-11-01', 2024, 11, 'TV2', 'rating', 12),
  
  -- December 2024 data
  ('2024-12-01', 2024, 12, 'AiFM', 'reach', 30),
  ('2024-12-01', 2024, 12, 'TraxxFM', 'reach', 31),
  ('2024-12-01', 2024, 12, 'MinnalFM', 'rating', 0),
  
  -- January 2024 data
  ('2024-01-01', 2024, 1, 'TV1', 'rating', 65),
  
  -- April 2024 data
  ('2024-04-01', 2024, 4, 'TV1', 'rating', 59),
  ('2024-04-01', 2024, 4, 'TV2', 'reach', 5452),
  
  -- July 2024 data
  ('2024-07-01', 2024, 7, 'TV2', 'reach', 5186),
  
  -- 2025 data
  ('2025-02-01', 2025, 2, 'TV OKEY', 'rating', 6),
  ('2025-03-01', 2025, 3, 'TV1', 'rating', 75),
  ('2025-03-01', 2025, 3, 'AiFM', 'rating', 0),
  ('2025-04-01', 2025, 4, 'TV1', 'rating', 61),
  ('2025-04-01', 2025, 4, 'TV2', 'rating', 10),
  ('2025-04-01', 2025, 4, 'TraxxFM', 'rating', 0),
  ('2025-05-01', 2025, 5, 'TV1', 'rating', 49),
  ('2025-05-01', 2025, 5, 'AiFM', 'rating', 0),
  ('2025-05-01', 2025, 5, 'TraxxFM', 'rating', 0)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT channel) as total_channels,
  COUNT(CASE WHEN metric_type = 'rating' THEN 1 END) as rating_records,
  COUNT(CASE WHEN metric_type = 'reach' THEN 1 END) as reach_records
FROM astro_rate_n_reach;

-- Show sample of inserted data
SELECT * FROM astro_rate_n_reach ORDER BY tx_date DESC, channel LIMIT 10;
