-- =====================================================
-- MIGRATION DÉFINITIVE - Fix RLS table children
-- Problème : get_parent_profile() retourne NULL car
-- la fonction cherche parent_profiles.user_id mais
-- la table utilise parent_profiles.id = auth.uid().
-- Conséquence : INSERT children bloqué silencieusement.
-- =====================================================

-- 1. Corriger get_parent_profile() pour retourner auth.uid() directement
CREATE OR REPLACE FUNCTION public.get_parent_profile()
RETURNS UUID AS $$
BEGIN
  -- parent_profiles.id = auth.uid() par convention du trigger
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Supprimer TOUTES les policies existantes sur children
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'children' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.children', pol.policyname);
  END LOOP;
END $$;

-- 3. Recréer les policies en utilisant auth.uid() directement (safe, pas de NULL possible)
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Parents voient leurs enfants
CREATE POLICY "children_select_parent"
ON public.children FOR SELECT
USING (
  parent_id = auth.uid()
  OR id = NULLIF(current_setting('app.current_child_id', true), '')::UUID
);

-- Parents insèrent leurs enfants (auth.uid() directement, jamais NULL)
CREATE POLICY "children_insert_parent"
ON public.children FOR INSERT
WITH CHECK (parent_id = auth.uid());

-- Service role peut insérer (triggers)
CREATE POLICY "children_insert_service"
ON public.children FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Parents mettent à jour leurs enfants
CREATE POLICY "children_update_parent"
ON public.children FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Parents suppriment leurs enfants
CREATE POLICY "children_delete_parent"
ON public.children FOR DELETE
USING (parent_id = auth.uid());

-- 4. Corriger aussi households (même problème possible)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'households' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.households', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "households_select_parent"
ON public.households FOR SELECT
USING (parent_id = auth.uid());

CREATE POLICY "households_insert_parent"
ON public.households FOR INSERT
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "households_insert_service"
ON public.households FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "households_update_parent"
ON public.households FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "households_delete_parent"
ON public.households FOR DELETE
USING (parent_id = auth.uid());

-- 5. S'assurer que parent_profiles est accessible
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'parent_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.parent_profiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_profiles_select"
ON public.parent_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "parent_profiles_insert"
ON public.parent_profiles FOR INSERT
WITH CHECK (id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "parent_profiles_update"
ON public.parent_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
