-- 013_fix_column_types.sql
-- Change text columns to integer for proper calculations

BEGIN;

-- Fix curriculum_progress table
ALTER TABLE curriculum_progress 
ALTER COLUMN mastery_level TYPE INTEGER USING mastery_level::integer,
ALTER COLUMN attempts TYPE INTEGER USING COALESCE(attempts::integer, 0),
ALTER COLUMN correct_attempts TYPE INTEGER USING COALESCE(correct_attempts::integer, 0);

-- Fix topic_progress table
ALTER TABLE topic_progress 
ALTER COLUMN mastery_level TYPE INTEGER USING COALESCE(mastery_level::integer, 0);

-- Fix subtopic_progress table
ALTER TABLE subtopic_progress 
ALTER COLUMN mastery_level TYPE INTEGER USING COALESCE(mastery_level::integer, 0),
ALTER COLUMN exercises_completed TYPE INTEGER USING COALESCE(exercises_completed::integer, 0);

COMMIT;
