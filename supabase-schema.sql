-- ============================================================
-- EduQuest — Supabase schema
-- Paste this entire file into the Supabase SQL Editor and Run.
-- ============================================================

-- ── Profiles (linked to Supabase auth.users) ─────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  active BOOLEAN DEFAULT true,
  "avatarColor" TEXT DEFAULT '#4dabf7',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, "avatarColor")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    '#4dabf7'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Subjects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- ── Decks (cards stored as JSONB) ─────────────────────────────
CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "subjectId" TEXT REFERENCES subjects(id),
  "createdBy" TEXT,
  language TEXT DEFAULT 'latin',
  cards JSONB DEFAULT '[]',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ── Modules ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "subjectId" TEXT REFERENCES subjects(id),
  "createdBy" TEXT,
  "lessonIds" TEXT[] DEFAULT '{}',
  "assignedTo" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lessons ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  "moduleId" TEXT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  "deckId" TEXT,
  "videoUrl" TEXT,
  "pdfUrl" TEXT,
  "order" INT DEFAULT 1
);

-- ── Homework ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  "moduleId" TEXT,
  "deckId" TEXT,
  "dueDate" TEXT,
  "assignedTo" TEXT[] DEFAULT '{}',
  "createdBy" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ── Submissions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  "homeworkId" TEXT REFERENCES homework(id) ON DELETE CASCADE,
  "studentId" TEXT,
  answer TEXT,
  score INT,
  total INT,
  "teacherScore" INT,
  feedback TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ── Study sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "deckId" TEXT,
  "sessionDate" TEXT,
  score INT,
  total INT,
  "xpEarned" INT,
  mode TEXT
);

-- ── Gamification ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification (
  "userId" TEXT PRIMARY KEY,
  "totalXP" INT DEFAULT 0,
  "weeklyPoints" INT DEFAULT 0,
  "currentStreak" INT DEFAULT 0,
  "longestStreak" INT DEFAULT 0,
  "lastStudyDate" TEXT,
  badges TEXT[] DEFAULT '{}',
  "totalCorrect" INT DEFAULT 0,
  "totalSessions" INT DEFAULT 0
);

-- ── Lesson completions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completions (
  "userId" TEXT,
  "lessonId" TEXT,
  "completedAt" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("userId", "lessonId")
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write all data
CREATE POLICY "auth_all" ON profiles    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON subjects    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON decks       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON modules     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON lessons     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON homework    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON progress    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON gamification FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON completions FOR ALL TO authenticated USING (true) WITH CHECK (true);
