-- ════════════════════════════════════════
-- SONJI — Row-Level Security Policies
-- Run AFTER Drizzle creates the tables.
-- This ensures tenant data isolation at
-- the database level.
-- ════════════════════════════════════════

-- Helper: List of all tenant-scoped tables
-- Each gets the same RLS policy pattern.

DO $$
DECLARE
  tbl TEXT;
  tenant_tables TEXT[] := ARRAY[
    'users',
    'contacts',
    'pipelines',
    'deals',
    'forms',
    'form_submissions',
    'email_campaigns',
    'email_sequences',
    'appointments',
    'availability_rules',
    'invoices',
    'messages',
    'automations',
    'activity_log'
  ];
BEGIN
  FOREACH tbl IN ARRAY tenant_tables LOOP
    -- Enable RLS on the table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    
    -- Drop existing policy if it exists (idempotent)
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
    
    -- Create the isolation policy
    -- All operations (SELECT, INSERT, UPDATE, DELETE) are scoped to current tenant
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL USING (tenant_id = current_setting(''app.current_tenant'')::uuid)',
      tbl
    );
    
    RAISE NOTICE 'RLS enabled on table: %', tbl;
  END LOOP;
END $$;
