DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gallery') THEN
        ALTER TABLE products ADD COLUMN gallery text[];
    END IF;
END
$$;
