-- Create RPC function for atomic store item purchases
-- This function deducts coins and adds item to inventory in a single transaction

CREATE OR REPLACE FUNCTION purchase_store_item(
  p_user_id UUID,
  p_item_id TEXT,
  p_item_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_already_owned BOOLEAN;
BEGIN
  -- Lock the child_coins row for this user to prevent race conditions
  SELECT coin_balance INTO v_current_balance
  FROM child_coins
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists in child_coins
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User coin balance not found'
    );
  END IF;

  -- Check if user already owns this item
  SELECT EXISTS(
    SELECT 1 FROM user_inventory 
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) INTO v_already_owned;

  IF v_already_owned THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item already owned'
    );
  END IF;

  -- Check if user has enough coins
  IF v_current_balance < p_item_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient funds',
      'current_balance', v_current_balance,
      'required', p_item_cost
    );
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_item_cost;

  -- Deduct coins
  UPDATE child_coins
  SET coin_balance = v_new_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Add item to inventory
  INSERT INTO user_inventory (user_id, item_id, acquired_at)
  VALUES (p_user_id, p_item_id, NOW());

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'item_id', p_item_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION purchase_store_item(UUID, TEXT, INTEGER) TO authenticated;
