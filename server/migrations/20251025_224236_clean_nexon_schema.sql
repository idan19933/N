-- Clean Nexon Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grade_level INTEGER,
    learning_style VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curriculum progress
CREATE TABLE IF NOT EXISTS curriculum_progress (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    grade_id VARCHAR(100),
    topic_id VARCHAR(100),
    subtopic_id VARCHAR(100),
    mastery_level NUMERIC(3,2) DEFAULT 0.00,
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student progress
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(100),
    mastery_level NUMERIC(3,2) DEFAULT 0.00,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topic progress
CREATE TABLE IF NOT EXISTS topic_progress (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(100),
    subtopic_id VARCHAR(100),
    mastery_level NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtopic progress
CREATE TABLE IF NOT EXISTS subtopic_progress (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    subtopic_id VARCHAR(100),
    mastery_level NUMERIC(3,2) DEFAULT 0.00,
    exercises_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notebook entries
CREATE TABLE IF NOT EXISTS notebook_entries (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    type VARCHAR(50),
    topic VARCHAR(255),
    subtopic VARCHAR(255),
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    topic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    grade_id VARCHAR(20),
    topic_id VARCHAR(50),
    subtopic_id VARCHAR(50),
    session_type VARCHAR(30),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    exercises_done INTEGER DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 0,
    mood_before VARCHAR(20),
    mood_after VARCHAR(20)
);

-- Student goals
CREATE TABLE IF NOT EXISTS student_goals (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    goal_type VARCHAR(100),
    target_value NUMERIC(10,2),
    current_value NUMERIC(10,2) DEFAULT 0,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timeline events
CREATE TABLE IF NOT EXISTS timeline_events (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    event_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_progress_student ON curriculum_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_student ON notebook_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);