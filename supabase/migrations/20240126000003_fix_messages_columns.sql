-- Ajouter les colonnes manquantes dans messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS sender_type   TEXT DEFAULT 'parent' CHECK (sender_type IN ('parent','child')),
  ADD COLUMN IF NOT EXISTS recipient_id  UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'child' CHECK (recipient_type IN ('parent','child'));

-- Alias receiver_id → recipient_id si la colonne existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='receiver_id') THEN
    UPDATE public.messages SET recipient_id = receiver_id WHERE recipient_id IS NULL;
  END IF;
END $$;
