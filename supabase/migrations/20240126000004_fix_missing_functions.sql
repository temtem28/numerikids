-- Fonction manquante dans les politiques RLS
CREATE OR REPLACE FUNCTION public.get_parent_profile()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_parent_profile() TO authenticated, service_role;
