-- Renommer user_id → child_id dans user_inventory pour cohérence
ALTER TABLE public.user_inventory RENAME COLUMN user_id TO child_id;
