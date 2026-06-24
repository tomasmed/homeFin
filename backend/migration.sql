DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_constraint 
    WHERE constraintname = 'transactions_category_id_fkey'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE CASCADE;
  END IF;
END
$$;
