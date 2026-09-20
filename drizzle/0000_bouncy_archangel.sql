-- Existing installations already have these application tables.
-- This baseline verifies them and records their schema snapshot for Drizzle.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['Course', 'Category', 'Attachment', 'Chapter', 'MuxData', 'UserProgress', 'Purchase', 'StripeCustomer']
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Drizzle baseline requires existing table %', table_name;
    END IF;
  END LOOP;
END $$;
