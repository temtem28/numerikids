-- Update children table with new columns for enhanced profile management
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS grade_level TEXT DEFAULT 'CE2',
ADD COLUMN IF NOT EXISTS daily_time_limit INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS learning_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allowed_content_types TEXT[] DEFAULT ARRAY['video', 'quiz', 'exercise', 'game'];

-- Add comment to document the columns
COMMENT ON COLUMN children.grade_level IS 'School grade level (CP, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème)';
COMMENT ON COLUMN children.daily_time_limit IS 'Daily screen time limit in minutes';
COMMENT ON COLUMN children.learning_preferences IS 'Array of learning style preferences (visual, auditory, kinesthetic, reading)';
COMMENT ON COLUMN children.allowed_content_types IS 'Array of allowed content types (video, quiz, exercise, game)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_children_grade_level ON children(grade_level);
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
