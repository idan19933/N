-- database/schema.sql - COMPLETE SCHEMA
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS problem_hints;
DROP TABLE IF EXISTS problem_steps;
DROP TABLE IF EXISTS math_problems;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
                                     id TEXT PRIMARY KEY,
                                     email TEXT UNIQUE NOT NULL,
                                     display_name TEXT,
                                     math_level TEXT DEFAULT 'intermediate',
                                     grade INTEGER,
                                     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                     last_login TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS math_problems (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             topic TEXT NOT NULL,
                                             level TEXT NOT NULL,
                                             question TEXT NOT NULL,
                                             answer TEXT NOT NULL,
                                             explanation TEXT,
                                             requires_steps INTEGER DEFAULT 1,
                                             newton_operation TEXT,
                                             newton_expression TEXT,
                                             difficulty_rating REAL DEFAULT 3.0,
                                             created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_steps (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             problem_id INTEGER NOT NULL,
                                             step_number INTEGER NOT NULL,
                                             step_text TEXT NOT NULL,
                                             explanation TEXT,
                                             FOREIGN KEY (problem_id) REFERENCES math_problems(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS problem_hints (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             problem_id INTEGER NOT NULL,
                                             hint_level INTEGER NOT NULL,
                                             hint_text TEXT NOT NULL,
                                             FOREIGN KEY (problem_id) REFERENCES math_problems(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS attempts (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        user_id TEXT NOT NULL,
                                        problem_id TEXT NOT NULL,
                                        is_correct INTEGER NOT NULL,
                                        time_spent INTEGER DEFAULT 0,
                                        hints_used INTEGER DEFAULT 0,
                                        steps TEXT,
                                        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        user_id TEXT NOT NULL,
                                        problem_id INTEGER NOT NULL,
                                        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES math_problems(id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_problems_topic ON math_problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_level ON math_problems(level);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);

INSERT OR IGNORE INTO users (id, email, display_name, math_level, grade)
VALUES ('test-user-1', 'test@example.com', 'Test Student', 'intermediate', 10);