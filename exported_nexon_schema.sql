--
-- PostgreSQL database dump
--

\restrict CsKzhBHx3OwCrEIX8h3DtJBSzUi40OCik791OZ7rn7gjCFcLnhIbAEv5QRtWT60

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id integer NOT NULL,
    student_id integer NOT NULL,
    topic character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_sessions_id_seq OWNED BY public.chat_sessions.id;


--
-- Name: curriculum_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curriculum_progress (
    id integer NOT NULL,
    student_id character varying(255) NOT NULL,
    grade_id character varying(100),
    topic_id character varying(100),
    subtopic_id character varying(100),
    mastery_level numeric(3,2) DEFAULT 0.00,
    attempts integer DEFAULT 0,
    correct_attempts integer DEFAULT 0,
    last_practiced timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: curriculum_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.curriculum_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: curriculum_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.curriculum_progress_id_seq OWNED BY public.curriculum_progress.id;


--
-- Name: learning_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    grade_id character varying(20),
    topic_id character varying(50),
    subtopic_id character varying(50),
    session_type character varying(30),
    start_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_time timestamp without time zone,
    duration_minutes integer,
    exercises_done integer DEFAULT 0,
    success_rate numeric(5,2) DEFAULT 0,
    mood_before character varying(20),
    mood_after character varying(20)
);


--
-- Name: learning_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.learning_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.learning_sessions_id_seq OWNED BY public.learning_sessions.id;


--
-- Name: notebook_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notebook_entries (
    id integer NOT NULL,
    student_id character varying(255) NOT NULL,
    type character varying(50) DEFAULT 'exercise'::character varying,
    topic character varying(255),
    subtopic character varying(255),
    title text,
    summary text,
    content jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notebook_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notebook_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notebook_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notebook_entries_id_seq OWNED BY public.notebook_entries.id;


--
-- Name: topic_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_progress (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    grade_id character varying(20) NOT NULL,
    topic_id character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'not_started'::character varying,
    progress_percent integer DEFAULT 0,
    exercises_completed integer DEFAULT 0,
    exercises_correct integer DEFAULT 0,
    total_time_minutes integer DEFAULT 0,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT topic_progress_progress_percent_check CHECK (((progress_percent >= 0) AND (progress_percent <= 100)))
);


--
-- Name: recent_student_activity; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.recent_student_activity AS
 SELECT user_id,
    topic_id,
    grade_id,
    last_activity,
    status,
    progress_percent
   FROM public.topic_progress
  ORDER BY last_activity DESC
 LIMIT 10;


--
-- Name: student_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    goal_type character varying(30),
    title character varying(255) NOT NULL,
    description text,
    target_date date,
    progress_percent integer DEFAULT 0,
    status character varying(30) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    CONSTRAINT student_goals_progress_percent_check CHECK (((progress_percent >= 0) AND (progress_percent <= 100)))
);


--
-- Name: student_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_goals_id_seq OWNED BY public.student_goals.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    grade character varying(10) NOT NULL,
    track character varying(50),
    cluster character varying(100),
    school_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
    math_attitude character varying(50),
    confidence_level integer,
    goals text[],
    weak_topics text[],
    learning_style character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_profiles_confidence_level_check CHECK (((confidence_level >= 1) AND (confidence_level <= 5)))
);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: student_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_progress (
    id integer NOT NULL,
    student_id character varying(255) NOT NULL,
    topic character varying(255) NOT NULL,
    subtopic character varying(255),
    exercises_completed integer DEFAULT 0,
    correct_answers integer DEFAULT 0,
    last_practiced timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: student_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_progress_id_seq OWNED BY public.student_progress.id;


--
-- Name: student_progress_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.student_progress_summary AS
 SELECT user_id,
    count(DISTINCT topic_id) AS total_topics,
    count(DISTINCT
        CASE
            WHEN ((status)::text = 'completed'::text) THEN topic_id
            ELSE NULL::character varying
        END) AS completed_topics,
    sum(exercises_completed) AS total_exercises,
    sum(exercises_correct) AS total_correct,
        CASE
            WHEN (sum(exercises_completed) > 0) THEN round((((sum(exercises_correct))::numeric / (sum(exercises_completed))::numeric) * (100)::numeric), 1)
            ELSE (0)::numeric
        END AS success_rate
   FROM public.topic_progress
  GROUP BY user_id;


--
-- Name: subtopic_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_progress (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    grade_id character varying(20) NOT NULL,
    topic_id character varying(50) NOT NULL,
    subtopic_id character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'not_started'::character varying,
    mastery_level integer DEFAULT 0,
    exercises_attempted integer DEFAULT 0,
    exercises_correct integer DEFAULT 0,
    hints_used integer DEFAULT 0,
    average_time_seconds integer DEFAULT 0,
    theory_viewed boolean DEFAULT false,
    theory_view_count integer DEFAULT 0,
    last_theory_view timestamp without time zone,
    first_attempt timestamp without time zone,
    last_practice timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subtopic_progress_mastery_level_check CHECK (((mastery_level >= 0) AND (mastery_level <= 100)))
);


--
-- Name: subtopic_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_progress_id_seq OWNED BY public.subtopic_progress.id;


--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeline_events (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_type character varying(30) NOT NULL,
    grade_id character varying(20),
    topic_id character varying(50),
    title character varying(255) NOT NULL,
    description text,
    icon character varying(10),
    color character varying(20),
    scheduled_date date,
    completed_date date,
    is_milestone boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: timeline_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timeline_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timeline_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timeline_events_id_seq OWNED BY public.timeline_events.id;


--
-- Name: topic_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topic_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topic_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topic_progress_id_seq OWNED BY public.topic_progress.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(255) NOT NULL,
    name character varying(255),
    email character varying(255),
    password character varying(255),
    grade integer,
    learning_style character varying(50),
    interests text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    firebase_uid character varying(255)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chat_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions ALTER COLUMN id SET DEFAULT nextval('public.chat_sessions_id_seq'::regclass);


--
-- Name: curriculum_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_progress ALTER COLUMN id SET DEFAULT nextval('public.curriculum_progress_id_seq'::regclass);


--
-- Name: learning_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions ALTER COLUMN id SET DEFAULT nextval('public.learning_sessions_id_seq'::regclass);


--
-- Name: notebook_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notebook_entries ALTER COLUMN id SET DEFAULT nextval('public.notebook_entries_id_seq'::regclass);


--
-- Name: student_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_goals ALTER COLUMN id SET DEFAULT nextval('public.student_goals_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: student_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress ALTER COLUMN id SET DEFAULT nextval('public.student_progress_id_seq'::regclass);


--
-- Name: subtopic_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress ALTER COLUMN id SET DEFAULT nextval('public.subtopic_progress_id_seq'::regclass);


--
-- Name: timeline_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events ALTER COLUMN id SET DEFAULT nextval('public.timeline_events_id_seq'::regclass);


--
-- Name: topic_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress ALTER COLUMN id SET DEFAULT nextval('public.topic_progress_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: curriculum_progress curriculum_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_progress
    ADD CONSTRAINT curriculum_progress_pkey PRIMARY KEY (id);


--
-- Name: curriculum_progress curriculum_progress_student_id_subtopic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_progress
    ADD CONSTRAINT curriculum_progress_student_id_subtopic_id_key UNIQUE (student_id, subtopic_id);


--
-- Name: learning_sessions learning_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT learning_sessions_pkey PRIMARY KEY (id);


--
-- Name: notebook_entries notebook_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notebook_entries
    ADD CONSTRAINT notebook_entries_pkey PRIMARY KEY (id);


--
-- Name: student_goals student_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_progress student_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT student_progress_pkey PRIMARY KEY (id);


--
-- Name: subtopic_progress subtopic_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_pkey PRIMARY KEY (id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: topic_progress topic_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress
    ADD CONSTRAINT topic_progress_pkey PRIMARY KEY (id);


--
-- Name: subtopic_progress unique_user_subtopic; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT unique_user_subtopic UNIQUE (user_id, grade_id, topic_id, subtopic_id);


--
-- Name: topic_progress unique_user_topic; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress
    ADD CONSTRAINT unique_user_topic UNIQUE (user_id, grade_id, topic_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_sessions_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_student_id ON public.chat_sessions USING btree (student_id);


--
-- Name: idx_goals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_status ON public.student_goals USING btree (status);


--
-- Name: idx_goals_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_user ON public.student_goals USING btree (user_id);


--
-- Name: idx_goals_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_user_status ON public.student_goals USING btree (user_id, status);


--
-- Name: idx_notebook_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notebook_student ON public.notebook_entries USING btree (student_id);


--
-- Name: idx_notebook_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notebook_topic ON public.notebook_entries USING btree (topic);


--
-- Name: idx_progress_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_student ON public.curriculum_progress USING btree (student_id);


--
-- Name: idx_progress_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_student_id ON public.student_progress USING btree (student_id);


--
-- Name: idx_progress_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_topic ON public.curriculum_progress USING btree (topic_id);


--
-- Name: idx_sessions_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_start_time ON public.learning_sessions USING btree (start_time);


--
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user ON public.learning_sessions USING btree (user_id);


--
-- Name: idx_sessions_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user_date ON public.learning_sessions USING btree (user_id, start_time);


--
-- Name: idx_student_profiles_grade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_grade ON public.student_profiles USING btree (grade);


--
-- Name: idx_student_profiles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_user ON public.student_profiles USING btree (user_id);


--
-- Name: idx_subtopic_progress_subtopic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_subtopic ON public.subtopic_progress USING btree (subtopic_id);


--
-- Name: idx_subtopic_progress_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_topic ON public.subtopic_progress USING btree (topic_id);


--
-- Name: idx_subtopic_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_user ON public.subtopic_progress USING btree (user_id);


--
-- Name: idx_subtopic_progress_user_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_user_topic ON public.subtopic_progress USING btree (user_id, topic_id);


--
-- Name: idx_timeline_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_scheduled ON public.timeline_events USING btree (scheduled_date);


--
-- Name: idx_timeline_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_user ON public.timeline_events USING btree (user_id);


--
-- Name: idx_timeline_user_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_user_scheduled ON public.timeline_events USING btree (user_id, scheduled_date);


--
-- Name: idx_topic_progress_grade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_progress_grade ON public.topic_progress USING btree (grade_id);


--
-- Name: idx_topic_progress_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_progress_status ON public.topic_progress USING btree (status);


--
-- Name: idx_topic_progress_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_progress_topic ON public.topic_progress USING btree (topic_id);


--
-- Name: idx_topic_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_progress_user ON public.topic_progress USING btree (user_id);


--
-- Name: idx_topic_progress_user_grade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_progress_user_grade ON public.topic_progress USING btree (user_id, grade_id);


--
-- Name: idx_users_firebase_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_firebase_uid ON public.users USING btree (firebase_uid);


--
-- Name: student_profiles update_student_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: student_profiles fk_student_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CsKzhBHx3OwCrEIX8h3DtJBSzUi40OCik791OZ7rn7gjCFcLnhIbAEv5QRtWT60

