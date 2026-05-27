-- Migration: Add RLS policies for children to manage their own goals
-- Date: 2024-02-02
-- Description: Allow children to view and update their own learning goals

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Children can update their own goals" ON learning_goals;
DROP POLICY IF EXISTS "Children can view their own goals" ON learning_goals;

-- Children can view their own goals
-- Also allows parents to view goals for their children
CREATE POLICY "Children can view their own goals"
ON learning_goals FOR SELECT
USING (
  -- Child can view their own goals
  child_id IN (
    SELECT id FROM children WHERE id = auth.uid()
  )
  OR
  -- Parent can view goals for their children
  parent_id = auth.uid()
  OR
  -- Parent can view goals via children relationship
  EXISTS (
    SELECT 1 FROM children 
    WHERE children.id = learning_goals.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- Children can update their own goals (for progress tracking)
CREATE POLICY "Children can update their own goals"
ON learning_goals FOR UPDATE
USING (
  child_id IN (
    SELECT id FROM children WHERE id = auth.uid()
  )
)
WITH CHECK (
  child_id IN (
    SELECT id FROM children WHERE id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON learning_goals TO authenticated;

-- Add index for faster child goal lookups
CREATE INDEX IF NOT EXISTS idx_learning_goals_child_id ON learning_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON learning_goals(status);
CREATE INDEX IF NOT EXISTS idx_learning_goals_child_status ON learning_goals(child_id, status);

-- Comment on policies
COMMENT ON POLICY "Children can view their own goals" ON learning_goals IS 
  'Allows children to view their own learning goals and parents to view goals for their children';

COMMENT ON POLICY "Children can update their own goals" ON learning_goals IS 
  'Allows children to update progress on their own learning goals';
