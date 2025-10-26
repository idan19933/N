-- Fix all user ID columns to use VARCHAR instead of INTEGER
ALTER TABLE notebook_entries 
ALTER COLUMN student_id TYPE VARCHAR(255) USING student_id::VARCHAR;

ALTER TABLE chat_sessions 
ALTER COLUMN student_id TYPE VARCHAR(255) USING student_id::VARCHAR;

ALTER TABLE learning_sessions 
ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::VARCHAR;

-- Drop conflicting unique constraints if they exist
ALTER TABLE topic_progress DROP CONSTRAINT IF EXISTS topic_progress_user_id_grade_id_topic_id_key;
ALTER TABLE topic_progress DROP CONSTRAINT IF EXISTS topic_progress_student_id_topic_id_key;

ALTER TABLE subtopic_progress DROP CONSTRAINT IF EXISTS subtopic_progress_user_id_grade_id_topic_id_subtopic_id_key;
ALTER TABLE subtopic_progress DROP CONSTRAINT IF EXISTS subtopic_progress_student_id_subtopic_id_key;

-- No need to alter - these are already VARCHAR in the schema
-- Just ensure they exist
