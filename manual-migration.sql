-- ═══════════════════════════════════════════════════════
-- SONJI — Manual Migration for Neon Console
-- Run this in Neon SQL Editor → https://console.neon.tech
-- ═══════════════════════════════════════════════════════

-- 1. Fix appointments table (adds 3 missing columns, makes ends_at nullable)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS title varchar(500);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS contact_name varchar(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'call';
ALTER TABLE appointments ALTER COLUMN ends_at DROP NOT NULL;

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "deal_id" uuid REFERENCES "deals"("id"),
  "contact_id" uuid REFERENCES "contacts"("id"),
  "company_id" uuid REFERENCES "companies"("id"),
  "name" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(50) NOT NULL DEFAULT 'planning',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "budget_amount" decimal(12, 2),
  "budget_type" varchar(20) DEFAULT 'fixed',
  "hourly_rate" decimal(8, 2),
  "retainer_hours" integer,
  "cost_rate" decimal(8, 2),
  "start_date" date,
  "due_date" date,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 3. Create time_entries table
CREATE TABLE IF NOT EXISTS "time_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "project_id" uuid NOT NULL REFERENCES "projects"("id"),
  "task_id" uuid REFERENCES "tasks"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "description" text,
  "hours" decimal(6, 2) NOT NULL,
  "date" date NOT NULL,
  "billable" boolean DEFAULT true,
  "hourly_rate" decimal(8, 2),
  "cost_rate" decimal(8, 2),
  "status" varchar(20) DEFAULT 'logged',
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Done! This fixes:
-- ✅ Meetings page 500 error (appointments missing columns)
-- ✅ Projects page (table didn't exist)
-- ✅ Time tracking (table didn't exist)
