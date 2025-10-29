-- Add indexes to speed up RTM Media Table queries
-- Run this SQL in your PostgreSQL database to improve query performance

-- Index on insertdate for faster date filtering
CREATE INDEX IF NOT EXISTS idx_mentions_classify_insertdate 
ON mentions_classify(insertdate);

-- Index on groupname for faster unit grouping
CREATE INDEX IF NOT EXISTS idx_mentions_classify_groupname 
ON mentions_classify(groupname);

-- Index on channel for faster channel grouping
CREATE INDEX IF NOT EXISTS idx_mentions_classify_channel 
ON mentions_classify(channel);

-- Composite index for common query patterns (date + groupname)
CREATE INDEX IF NOT EXISTS idx_mentions_classify_date_groupname 
ON mentions_classify(insertdate, groupname);

-- Composite index for common query patterns (date + channel)
CREATE INDEX IF NOT EXISTS idx_mentions_classify_date_channel 
ON mentions_classify(insertdate, channel);

-- Analyze the table to update statistics
ANALYZE mentions_classify;

-- Check the created indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'mentions_classify'
ORDER BY indexname;
