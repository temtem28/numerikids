-- =====================================================
-- CHILD DATA TABLES RLS POLICIES
-- Applies to: user_progress, child_coins, streaks, 
-- user_achievements, user_challenges, leaderboard_entries,
-- pixel_kingdom_progress, user_inventory, messages
-- =====================================================

-- USER_PROGRESS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children progress" ON user_progress;
DROP POLICY IF EXISTS "Parents insert children progress" ON user_progress;
DROP POLICY IF EXISTS "Parents update children progress" ON user_progress;
DROP POLICY IF EXISTS "Children view own progress" ON user_progress;
DROP POLICY IF EXISTS "Children update own progress" ON user_progress;

CREATE POLICY "Parents view children progress" ON user_progress FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Parents insert children progress" ON user_progress FOR INSERT
WITH CHECK (is_parent_of_child(child_id));
CREATE POLICY "Parents update children progress" ON user_progress FOR UPDATE
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own progress" ON user_progress FOR SELECT
USING (child_id = get_current_child_id());
CREATE POLICY "Children update own progress" ON user_progress FOR UPDATE
USING (child_id = get_current_child_id());

-- CHILD_COINS
ALTER TABLE child_coins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children coins" ON child_coins;
DROP POLICY IF EXISTS "Parents manage children coins" ON child_coins;
DROP POLICY IF EXISTS "Children view own coins" ON child_coins;

CREATE POLICY "Parents view children coins" ON child_coins FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Parents manage children coins" ON child_coins FOR ALL
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own coins" ON child_coins FOR SELECT
USING (child_id = get_current_child_id());

-- STREAKS
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children streaks" ON streaks;
DROP POLICY IF EXISTS "Parents manage children streaks" ON streaks;
DROP POLICY IF EXISTS "Children view own streaks" ON streaks;
DROP POLICY IF EXISTS "Children update own streaks" ON streaks;

CREATE POLICY "Parents view children streaks" ON streaks FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Parents manage children streaks" ON streaks FOR ALL
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own streaks" ON streaks FOR SELECT
USING (child_id = get_current_child_id());
CREATE POLICY "Children update own streaks" ON streaks FOR UPDATE
USING (child_id = get_current_child_id());

-- USER_ACHIEVEMENTS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children achievements" ON user_achievements;
DROP POLICY IF EXISTS "Children view own achievements" ON user_achievements;

CREATE POLICY "Parents view children achievements" ON user_achievements FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own achievements" ON user_achievements FOR SELECT
USING (child_id = get_current_child_id());

-- USER_CHALLENGES
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children challenges" ON user_challenges;
DROP POLICY IF EXISTS "Children view own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Children update own challenges" ON user_challenges;

CREATE POLICY "Parents view children challenges" ON user_challenges FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own challenges" ON user_challenges FOR SELECT
USING (child_id = get_current_child_id());
CREATE POLICY "Children update own challenges" ON user_challenges FOR UPDATE
USING (child_id = get_current_child_id());

-- LEADERBOARD_ENTRIES
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "Parents manage children leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "Children update own leaderboard" ON leaderboard_entries;

CREATE POLICY "Everyone can view leaderboard" ON leaderboard_entries FOR SELECT
USING (true);
CREATE POLICY "Parents manage children leaderboard" ON leaderboard_entries FOR ALL
USING (is_parent_of_child(child_id));
CREATE POLICY "Children update own leaderboard" ON leaderboard_entries FOR UPDATE
USING (child_id = get_current_child_id());

-- PIXEL_KINGDOM_PROGRESS
ALTER TABLE pixel_kingdom_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children kingdom progress" ON pixel_kingdom_progress;
DROP POLICY IF EXISTS "Parents manage children kingdom progress" ON pixel_kingdom_progress;
DROP POLICY IF EXISTS "Children view own kingdom progress" ON pixel_kingdom_progress;
DROP POLICY IF EXISTS "Children update own kingdom progress" ON pixel_kingdom_progress;

CREATE POLICY "Parents view children kingdom progress" ON pixel_kingdom_progress FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Parents manage children kingdom progress" ON pixel_kingdom_progress FOR ALL
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own kingdom progress" ON pixel_kingdom_progress FOR SELECT
USING (child_id = get_current_child_id());
CREATE POLICY "Children update own kingdom progress" ON pixel_kingdom_progress FOR UPDATE
USING (child_id = get_current_child_id());

-- USER_INVENTORY
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children inventory" ON user_inventory;
DROP POLICY IF EXISTS "Parents manage children inventory" ON user_inventory;
DROP POLICY IF EXISTS "Children view own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Children manage own inventory" ON user_inventory;

CREATE POLICY "Parents view children inventory" ON user_inventory FOR SELECT
USING (is_parent_of_child(child_id));
CREATE POLICY "Parents manage children inventory" ON user_inventory FOR ALL
USING (is_parent_of_child(child_id));
CREATE POLICY "Children view own inventory" ON user_inventory FOR SELECT
USING (child_id = get_current_child_id());
CREATE POLICY "Children manage own inventory" ON user_inventory FOR ALL
USING (child_id = get_current_child_id());

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents view children messages" ON messages;
DROP POLICY IF EXISTS "Parents send messages to children" ON messages;
DROP POLICY IF EXISTS "Children view own messages" ON messages;
DROP POLICY IF EXISTS "Children send messages to parent" ON messages;

CREATE POLICY "Parents view children messages" ON messages FOR SELECT
USING (
  sender_type = 'child' AND is_parent_of_child(sender_id)
  OR recipient_type = 'child' AND is_parent_of_child(recipient_id)
);
CREATE POLICY "Parents send messages to children" ON messages FOR INSERT
WITH CHECK (
  sender_type = 'parent' AND sender_id = get_parent_profile()
  AND recipient_type = 'child' AND is_parent_of_child(recipient_id)
);
CREATE POLICY "Children view own messages" ON messages FOR SELECT
USING (
  (sender_type = 'child' AND sender_id = get_current_child_id())
  OR (recipient_type = 'child' AND recipient_id = get_current_child_id())
);
CREATE POLICY "Children send messages to parent" ON messages FOR INSERT
WITH CHECK (
  sender_type = 'child' AND sender_id = get_current_child_id()
);
