-- Add firebase_uid to student_profiles
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);

ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS grade VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_student_profiles_firebase_uid 
ON student_profiles(firebase_uid);
