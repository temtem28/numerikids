-- Progression des sagas (une ligne par leçon terminée), utilisée par AppContext (completeLesson).
CREATE TABLE IF NOT EXISTS public.child_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  saga_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (child_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_child_progress_child ON public.child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_saga ON public.child_progress(child_id, saga_id);

ALTER TABLE public.child_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents manage child_progress" ON public.child_progress;
DROP POLICY IF EXISTS "Parents select child_progress" ON public.child_progress;

CREATE POLICY "Parents select child_progress"
ON public.child_progress FOR SELECT
USING (is_parent_of_child(child_id));

CREATE POLICY "Parents manage child_progress"
ON public.child_progress FOR ALL
USING (is_parent_of_child(child_id))
WITH CHECK (is_parent_of_child(child_id));

COMMENT ON TABLE public.child_progress IS 'Leçons de sagas terminées par enfant (saga_id + lesson_id)';
