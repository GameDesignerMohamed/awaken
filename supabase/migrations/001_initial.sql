-- profiles: one per user
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  interrupt_schedule JSONB NOT NULL DEFAULT '[
    {"slot": 1, "time": "11:00"},
    {"slot": 2, "time": "13:30"},
    {"slot": 3, "time": "15:15"},
    {"slot": 4, "time": "17:00"},
    {"slot": 5, "time": "19:30"},
    {"slot": 6, "time": "21:00"}
  ]',
  push_subscription JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- responses: one per answered interrupt
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
  prompt_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  responded_at TIMESTAMPTZ DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL
);

-- notifications_sent: idempotency tracking
CREATE TABLE notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
  sent_date DATE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, slot, sent_date)
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own responses"
  ON responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own responses"
  ON responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- notifications_sent: service role only (Edge Function writes)
-- No user-facing RLS policies needed
