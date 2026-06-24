DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;
  
  -- Add new constraint with ON DELETE CASCADE
  ALTER TABLE transactions
  ADD CONSTRAINT transactions_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id) 
  ON DELETE CASCADE;
END $$;
