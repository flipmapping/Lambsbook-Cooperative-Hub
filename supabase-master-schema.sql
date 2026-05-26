-- ============================================================
-- LAMBSBOOK AGENTIC HUB: MASTER UNIFIED SCHEMA
-- ============================================================
-- Comprehensive schema based on Grok design document
-- Covers: SBUs, Members (multi-role), Programs, Commissions, Revenue Sharing
-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- This extends existing tables - safe to run multiple times
-- ============================================================

-- ============================================================
-- PART 1: STRATEGIC BUSINESS UNITS (SBUs)
-- ============================================================

CREATE TABLE IF NOT EXISTS sbus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sbu_number INTEGER UNIQUE NOT NULL, -- 1, 2, 3, 4, 5
    sbu_code TEXT UNIQUE NOT NULL, -- 'COFFEE', 'EDUCATION', 'MIGRATION', 'AGRICULTURE', 'FARMSTAY'
    name TEXT NOT NULL,
    description TEXT,
    lead_name TEXT,
    lead_email TEXT,
    entity_name TEXT, -- e.g., 'Other Path Travel'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'planning', 'inactive', 'future')),
    financial_status TEXT, -- 'pending_budget', 'operational', 'profitable'
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 5 SBUs from Grok design
INSERT INTO sbus (sbu_number, sbu_code, name, description, lead_name, entity_name, status) VALUES
    (1, 'COFFEE', 'Coffee Shop and Community House', 'Coffee shop operations, community gathering space', 'Lady Jane', NULL, 'planning'),
    (2, 'EDUCATION', 'Education Project (Language & Business Training)', 'Tropicana Academy, CTBC, online classes on Lambsbook.net', 'Bill and Khai', 'Other Path Travel', 'active'),
    (3, 'MIGRATION', 'Migration Consultancy, HR, and Recruitment', 'Immigration consultancy (EB3), HR services, Glory International partnership', 'Lawyer Hai, Prince, Khai, Terrance, Pastor Kevin, Bill', 'Glory International Law Firm', 'active'),
    (4, 'AGRICULTURE', 'Rocket Stove & Agricultural Products', 'Rocket stove production, Gac puree, honey, fruit products', 'Carl', NULL, 'active'),
    (5, 'FARMSTAY', 'Farmstay Community & JSC Formation', 'Long-term land lease, ecotourism, Joint Stock Company', 'Future', NULL, 'future')
ON CONFLICT (sbu_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    lead_name = EXCLUDED.lead_name,
    updated_at = NOW();

-- ============================================================
-- PART 2: UNIFIED MEMBERS TABLE (replaces separate user tables)
-- ============================================================

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity (linked to Supabase Auth)
    auth_user_id UUID UNIQUE, -- Links to auth.users
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    
    -- Multi-role system (a member can have multiple roles)
    roles TEXT[] DEFAULT ARRAY['user']::TEXT[], -- ['user', 'ambassador', 'collaborator', 'partner', 'tutor', 'admin']
    primary_role TEXT DEFAULT 'user',
    
    -- Invitation chain (for referral tracking)
    invited_by_email TEXT,
    invited_by_id UUID REFERENCES members(id),
    referral_code TEXT UNIQUE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    verified_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate referral code on insert
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.email || NOW()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_referral_code ON members;
CREATE TRIGGER tr_generate_referral_code
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- ============================================================
-- PART 3: MEMBER ROLE DETAILS (extended info per role)
-- ============================================================

-- Tutor-specific details
CREATE TABLE IF NOT EXISTS member_tutor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    subjects TEXT[], -- ['English', 'Business', 'IELTS']
    hourly_rate DECIMAL(10,2),
    rate_currency TEXT DEFAULT 'USD',
    bio TEXT,
    qualifications TEXT,
    availability_json JSONB, -- schedule
    total_hours_taught DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id)
);

-- Partner-specific details (links to existing partners table)
CREATE TABLE IF NOT EXISTS member_partner_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    role_at_partner TEXT, -- 'owner', 'manager', 'representative'
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, partner_id)
);

-- ============================================================
-- PART 4: PROGRAMS/PRODUCTS/SERVICES (linked to SBUs)
-- ============================================================

-- Programs table - create if not exists, then add missing columns
CREATE TABLE IF NOT EXISTS programs (
    program_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing programs table (safe - won't fail if column exists)
DO $$ 
BEGIN
    -- Add parent_program_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'parent_program_id') THEN
        ALTER TABLE programs ADD COLUMN parent_program_id TEXT REFERENCES programs(program_id);
    END IF;
    
    -- Add sbu_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'sbu_id') THEN
        ALTER TABLE programs ADD COLUMN sbu_id UUID REFERENCES sbus(id);
    END IF;
    
    -- Add program_type if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'program_type') THEN
        ALTER TABLE programs ADD COLUMN program_type TEXT;
    END IF;
    
    -- Add name_translations if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'name_translations') THEN
        ALTER TABLE programs ADD COLUMN name_translations JSONB;
    END IF;
    
    -- Add description_translations if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'description_translations') THEN
        ALTER TABLE programs ADD COLUMN description_translations JSONB;
    END IF;
    
    -- Add base_price if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'base_price') THEN
        ALTER TABLE programs ADD COLUMN base_price DECIMAL(12,2);
    END IF;
    
    -- Add price_currency if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'price_currency') THEN
        ALTER TABLE programs ADD COLUMN price_currency TEXT DEFAULT 'USD';
    END IF;
    
    -- Add duration_value if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'duration_value') THEN
        ALTER TABLE programs ADD COLUMN duration_value INTEGER;
    END IF;
    
    -- Add duration_unit if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'duration_unit') THEN
        ALTER TABLE programs ADD COLUMN duration_unit TEXT;
    END IF;
    
    -- Add remainder_recipient if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'remainder_recipient') THEN
        ALTER TABLE programs ADD COLUMN remainder_recipient TEXT DEFAULT 'platform';
    END IF;
    
    -- Add metadata if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'metadata') THEN
        ALTER TABLE programs ADD COLUMN metadata JSONB;
    END IF;
    
    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'updated_at') THEN
        ALTER TABLE programs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================
-- PART 5: PROGRAM-SPECIFIC COMMISSION RULES
-- ============================================================

-- Commission rule sets (one set per program or program group)
CREATE TABLE IF NOT EXISTS commission_rule_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_name TEXT NOT NULL,
    program_id TEXT REFERENCES programs(program_id),
    apply_to_subprograms BOOLEAN DEFAULT TRUE,
    remainder_recipient TEXT DEFAULT 'platform',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual commission rules - NEW TABLE (different from old commission_rules)
-- Drop old table if it exists and doesn't have rule_set_id (incompatible schema)
DO $$
BEGIN
    -- Check if old commission_rules exists without rule_set_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_rules') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commission_rules' AND column_name = 'rule_set_id') THEN
        -- Rename old table to preserve data
        ALTER TABLE commission_rules RENAME TO commission_rules_legacy;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Which rule set this belongs to
    rule_set_id UUID NOT NULL REFERENCES commission_rule_sets(id) ON DELETE CASCADE,
    
    -- Rule details
    rule_name TEXT NOT NULL,
    
    -- Who receives this commission
    recipient_role TEXT NOT NULL,
    
    -- Commission calculation
    commission_type TEXT NOT NULL,
    commission_value DECIMAL(10,4) NOT NULL,
    commission_currency TEXT DEFAULT 'USD',
    
    -- Calculation base
    calculation_base TEXT DEFAULT 'gross',
    
    -- Priority for stacking rules
    priority INTEGER DEFAULT 100,
    
    -- Conditions for tiered commissions
    min_volume INTEGER,
    max_volume INTEGER,
    valid_from DATE,
    valid_until DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add rule_set_id to commission_rules if table exists but column doesn't
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_rules') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commission_rules' AND column_name = 'rule_set_id') THEN
        ALTER TABLE commission_rules ADD COLUMN rule_set_id UUID REFERENCES commission_rule_sets(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PART 5B: MULTI-PARTNER PRODUCT ARRANGEMENTS
-- ============================================================

-- Links multiple partners to a program/product with different roles
CREATE TABLE IF NOT EXISTS program_partner_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Which program/product
    program_id TEXT NOT NULL REFERENCES programs(program_id),
    
    -- Which partner
    partner_id UUID NOT NULL REFERENCES partners(id),
    
    -- Partner role in this product
    partner_role TEXT NOT NULL CHECK (partner_role IN (
        'supplier',           -- Raw material/produce supplier (e.g., farm)
        'processor',          -- Processing partner (e.g., puree processing)
        'packager',           -- Packaging partner
        'distributor',        -- Distribution/logistics
        'marketer',           -- Marketing/sales partner
        'platform',           -- Lambsbook platform share
        'other'
    )),
    
    -- Share calculation
    share_type TEXT NOT NULL CHECK (share_type IN ('percentage', 'fixed_per_unit', 'fixed_total')),
    share_value DECIMAL(10,4) NOT NULL, -- e.g., 25.00 for 25%, or fixed amount
    share_currency TEXT DEFAULT 'USD',
    
    -- What the share is calculated from
    calculation_base TEXT DEFAULT 'agp' CHECK (calculation_base IN (
        'gross',      -- Gross revenue
        'net',        -- Net after platform fees
        'agp',        -- Additional Gross Profit (after costs)
        'profit'      -- Net profit
    )),
    
    -- Priority for calculation order
    priority INTEGER DEFAULT 100,
    
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(program_id, partner_id, partner_role)
);

-- ============================================================
-- PART 5C: PRODUCT DELIVERY CONTRACTS & PAYMENT STAGES
-- ============================================================

-- Contracts for product delivery (e.g., Gac puree batches)
CREATE TABLE IF NOT EXISTS product_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE,
    
    -- What product
    program_id TEXT NOT NULL REFERENCES programs(program_id),
    
    -- Contract details
    contract_name TEXT NOT NULL,
    description TEXT,
    
    -- Quantities
    total_quantity INTEGER,
    quantity_unit TEXT, -- 'bottles', 'kg', 'cartons', 'containers'
    
    -- Financial
    total_value DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Cost breakdown (for AGP calculation)
    cost_of_goods DECIMAL(14,2),
    processing_costs DECIMAL(14,2),
    packaging_costs DECIMAL(14,2),
    logistics_costs DECIMAL(14,2),
    other_costs DECIMAL(14,2),
    
    -- Calculated AGP (Additional Gross Profit)
    agp_amount DECIMAL(14,2), -- total_value - all costs
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled')),
    
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment stages for contracts
CREATE TABLE IF NOT EXISTS contract_payment_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID NOT NULL REFERENCES product_contracts(id) ON DELETE CASCADE,
    
    -- Stage details
    stage_number INTEGER NOT NULL,
    stage_name TEXT NOT NULL, -- 'Advance', 'On Delivery', 'Final Settlement'
    
    -- Payment terms
    payment_type TEXT NOT NULL CHECK (payment_type IN ('percentage', 'fixed')),
    payment_value DECIMAL(10,4) NOT NULL, -- 30.00 for 30%, or fixed amount
    payment_amount DECIMAL(14,2), -- Calculated amount
    currency TEXT DEFAULT 'USD',
    
    -- Trigger conditions
    trigger_type TEXT CHECK (trigger_type IN (
        'on_signing',         -- Upon contract signing
        'on_production',      -- When production starts
        'on_delivery',        -- Upon delivery
        'on_inspection',      -- After quality inspection
        'on_invoice',         -- Upon invoicing
        'milestone',          -- Custom milestone
        'date'                -- Specific date
    )),
    trigger_date DATE,
    trigger_description TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'due', 'paid', 'partial', 'cancelled')),
    due_date DATE,
    paid_date DATE,
    paid_amount DECIMAL(14,2),
    payment_reference TEXT,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(contract_id, stage_number)
);

-- Partner payments from contracts (distributes AGP to partners)
CREATE TABLE IF NOT EXISTS contract_partner_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID NOT NULL REFERENCES product_contracts(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id),
    share_rule_id UUID REFERENCES program_partner_shares(id),
    
    -- What role is being paid
    partner_role TEXT,
    
    -- Payment details
    share_amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status TEXT DEFAULT 'accrued' CHECK (status IN ('accrued', 'approved', 'pending_payout', 'paid', 'cancelled')),
    
    paid_date DATE,
    payment_reference TEXT,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_program_partner_shares_program ON program_partner_shares(program_id);
CREATE INDEX IF NOT EXISTS idx_program_partner_shares_partner ON program_partner_shares(partner_id);
CREATE INDEX IF NOT EXISTS idx_product_contracts_program ON product_contracts(program_id);
CREATE INDEX IF NOT EXISTS idx_product_contracts_status ON product_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_payment_stages_contract ON contract_payment_stages(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_partner_payments_contract ON contract_partner_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_partner_payments_partner ON contract_partner_payments(partner_id);

-- RLS for new tables
ALTER TABLE program_partner_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_partner_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to program_partner_shares" ON program_partner_shares FOR ALL USING (true);
CREATE POLICY "Admins full access to product_contracts" ON product_contracts FOR ALL USING (true);
CREATE POLICY "Admins full access to contract_payment_stages" ON contract_payment_stages FOR ALL USING (true);
CREATE POLICY "Admins full access to contract_partner_payments" ON contract_partner_payments FOR ALL USING (true);

-- ============================================================
-- EXAMPLE: How to set up commission rules for different programs
-- ============================================================
-- 
-- EXAMPLE 1: SBU2 Online Tutoring Class (remainder → tutor)
-- INSERT INTO commission_rule_sets (set_name, program_id, remainder_recipient) 
-- VALUES ('Online English Class Rules', 'LAMBSBOOK-ENGLISH-101', 'tutor');
-- 
-- Then add rules:
-- INSERT INTO commission_rules (rule_set_id, rule_name, recipient_role, commission_type, commission_value, priority) VALUES
--   (rule_set_id, 'Charity Reserve', 'charity', 'percentage', 10.00, 10),
--   (rule_set_id, 'Collaborator Tier 1', 'collaborator_tier1', 'percentage', 15.00, 20),
--   (rule_set_id, 'Collaborator Tier 2', 'collaborator_tier2', 'percentage', 15.00, 30),
--   (rule_set_id, 'Partner Fee', 'partner', 'percentage', 10.00, 40);
-- Remainder (50%) automatically goes to tutor based on remainder_recipient
--
-- EXAMPLE 2: SBU4 Gac Product (remainder → platform)
-- INSERT INTO commission_rule_sets (set_name, program_id, remainder_recipient) 
-- VALUES ('Gac Puree Sales Rules', 'GAC-PUREE-500ML', 'platform');
-- 
-- Then add rules:
-- INSERT INTO commission_rules (rule_set_id, rule_name, recipient_role, commission_type, commission_value, priority) VALUES
--   (rule_set_id, 'Collaborator Tier 1', 'collaborator_tier1', 'percentage', 15.00, 10),
--   (rule_set_id, 'Collaborator Tier 2', 'collaborator_tier2', 'percentage', 15.00, 20);
-- Remainder (70%) goes to platform as net revenue
-- ============================================================

-- ============================================================
-- PART 6: TRANSACTIONS (unified for all payment types)
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction type
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'enrollment', 'tuition', 'product_sale', 'service_fee', 
        'consultation', 'renewal', 'refund', 'adjustment'
    )),
    
    -- What was sold
    program_id TEXT REFERENCES programs(program_id),
    sbu_id UUID REFERENCES sbus(id),
    
    -- Who bought
    customer_email TEXT,
    customer_name TEXT,
    customer_member_id UUID REFERENCES members(id),
    
    -- Who referred (for commission tracking)
    referrer_member_id UUID REFERENCES members(id),
    referrer_tier2_member_id UUID REFERENCES members(id),
    
    -- Who provided service (for tutor payments)
    provider_member_id UUID REFERENCES members(id),
    
    -- Partner involved
    partner_id UUID REFERENCES partners(id),
    
    -- Financial details
    gross_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    
    -- Payment info
    payment_method TEXT,
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'failed')),
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    source_system TEXT DEFAULT 'manual',
    external_reference TEXT,
    metadata JSONB,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 7: EARNINGS/ACCRUALS (what's owed to each member)
-- ============================================================

CREATE TABLE IF NOT EXISTS earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who earned this
    member_id UUID NOT NULL REFERENCES members(id),
    
    -- From which transaction
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    
    -- Which rule was applied
    commission_rule_id UUID REFERENCES commission_rules(id),
    
    -- Earning details
    earning_type TEXT NOT NULL CHECK (earning_type IN (
        'collaborator_tier1', 'collaborator_tier2', 'partner_share', 
        'tutor_fee', 'charity_reserve', 'platform_fee'
    )),
    
    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status TEXT DEFAULT 'accrued' CHECK (status IN ('accrued', 'approved', 'pending_payout', 'paid', 'cancelled')),
    
    -- Payout tracking
    payout_batch_id UUID,
    paid_at TIMESTAMPTZ,
    payout_reference TEXT,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 8: PAYOUT BATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS payout_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT UNIQUE,
    member_id UUID NOT NULL REFERENCES members(id),
    
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    earning_ids UUID[] NOT NULL,
    
    payment_method TEXT, -- 'bank_transfer', 'paypal', 'wise', 'crypto'
    payment_details JSONB, -- bank info, wallet address, etc.
    payment_reference TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    processed_by TEXT,
    notes TEXT
);

-- ============================================================
-- PART 9: AUDIT LOG (for compliance)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who did it
    actor_member_id UUID REFERENCES members(id),
    actor_email TEXT,
    
    -- What was done
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'payout'
    entity_type TEXT NOT NULL, -- 'member', 'transaction', 'earning', 'payout', etc.
    entity_id UUID,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 10: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_referral_code ON members(referral_code);
CREATE INDEX IF NOT EXISTS idx_members_invited_by ON members(invited_by_id);
CREATE INDEX IF NOT EXISTS idx_members_roles ON members USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

CREATE INDEX IF NOT EXISTS idx_programs_sbu ON programs(sbu_id);
CREATE INDEX IF NOT EXISTS idx_programs_type ON programs(program_type);

CREATE INDEX IF NOT EXISTS idx_commission_rule_sets_program ON commission_rule_sets(program_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_set ON commission_rules(rule_set_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_role ON commission_rules(recipient_role);

CREATE INDEX IF NOT EXISTS idx_transactions_program ON transactions(program_id);
CREATE INDEX IF NOT EXISTS idx_transactions_referrer ON transactions(referrer_member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider_member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(payment_status);

CREATE INDEX IF NOT EXISTS idx_earnings_member ON earnings(member_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transaction ON earnings(transaction_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_type ON earnings(earning_type);

CREATE INDEX IF NOT EXISTS idx_payout_batches_member ON payout_batches(member_id);
CREATE INDEX IF NOT EXISTS idx_payout_batches_status ON payout_batches(status);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_member_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- PART 11: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE sbus ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_partner_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins full access to sbus" ON sbus FOR ALL USING (true);
CREATE POLICY "Admins full access to members" ON members FOR ALL USING (true);
CREATE POLICY "Admins full access to programs" ON programs FOR ALL USING (true);
CREATE POLICY "Admins full access to commission_rule_sets" ON commission_rule_sets FOR ALL USING (true);
CREATE POLICY "Admins full access to commission_rules" ON commission_rules FOR ALL USING (true);
CREATE POLICY "Admins full access to transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Admins full access to earnings" ON earnings FOR ALL USING (true);
CREATE POLICY "Admins full access to payout_batches" ON payout_batches FOR ALL USING (true);
CREATE POLICY "Admins full access to audit_log" ON audit_log FOR ALL USING (true);

-- ============================================================
-- PART 12: SUMMARY VIEWS FOR DASHBOARD
-- ============================================================

-- Member earnings summary
CREATE OR REPLACE VIEW member_earnings_summary AS
SELECT 
    m.id as member_id,
    m.email,
    m.full_name,
    m.roles,
    m.status,
    COUNT(DISTINCT e.transaction_id) as total_transactions,
    COALESCE(SUM(CASE WHEN e.status = 'accrued' THEN e.amount ELSE 0 END), 0) as accrued_amount,
    COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_amount,
    COALESCE(SUM(CASE WHEN e.status = 'pending_payout' THEN e.amount ELSE 0 END), 0) as pending_payout,
    COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(e.amount), 0) as total_earned
FROM members m
LEFT JOIN earnings e ON m.id = e.member_id
GROUP BY m.id, m.email, m.full_name, m.roles, m.status;

-- SBU performance summary
CREATE OR REPLACE VIEW sbu_performance_summary AS
SELECT 
    s.id as sbu_id,
    s.sbu_number,
    s.sbu_code,
    s.name as sbu_name,
    s.status,
    COUNT(DISTINCT p.program_id) as total_programs,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(t.gross_amount), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN t.created_at >= DATE_TRUNC('month', NOW()) THEN t.gross_amount ELSE 0 END), 0) as mtd_revenue
FROM sbus s
LEFT JOIN programs p ON s.id = p.sbu_id
LEFT JOIN transactions t ON p.program_id = t.program_id
GROUP BY s.id, s.sbu_number, s.sbu_code, s.name, s.status;

-- Referral tree view (for downline tracking)
CREATE OR REPLACE VIEW referral_tree AS
WITH RECURSIVE tree AS (
    -- Base: top-level members (no inviter)
    SELECT 
        id, email, full_name, invited_by_id, 
        1 as level,
        ARRAY[id] as path
    FROM members
    WHERE invited_by_id IS NULL
    
    UNION ALL
    
    -- Recursive: members invited by someone
    SELECT 
        m.id, m.email, m.full_name, m.invited_by_id,
        t.level + 1,
        t.path || m.id
    FROM members m
    JOIN tree t ON m.invited_by_id = t.id
    WHERE NOT m.id = ANY(t.path) -- Prevent cycles
)
SELECT * FROM tree;

-- ============================================================
-- PART 13: HELPER FUNCTIONS
-- ============================================================

-- Function to calculate commissions for a transaction
CREATE OR REPLACE FUNCTION calculate_transaction_commissions(p_transaction_id UUID)
RETURNS TABLE (
    member_id UUID,
    earning_type TEXT,
    amount DECIMAL(12,2),
    rule_id UUID
) AS $$
DECLARE
    v_transaction RECORD;
    v_rule_set RECORD;
    v_rule RECORD;
    v_program RECORD;
    v_remaining DECIMAL(12,2);
    v_amount DECIMAL(12,2);
BEGIN
    -- Get transaction details
    SELECT * INTO v_transaction FROM transactions WHERE id = p_transaction_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get program details
    SELECT * INTO v_program FROM programs WHERE program_id = v_transaction.program_id;
    
    -- Find applicable rule set (check program or parent program)
    SELECT crs.* INTO v_rule_set 
    FROM commission_rule_sets crs
    WHERE crs.is_active = TRUE
    AND (
        crs.program_id = v_transaction.program_id
        OR (crs.apply_to_subprograms = TRUE AND crs.program_id = v_program.parent_program_id)
    )
    ORDER BY 
        CASE WHEN crs.program_id = v_transaction.program_id THEN 0 ELSE 1 END
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- No rule set found, no commissions to calculate
        RETURN;
    END IF;
    
    v_remaining := v_transaction.gross_amount;
    
    -- Apply rules in priority order
    FOR v_rule IN 
        SELECT * FROM commission_rules 
        WHERE rule_set_id = v_rule_set.id
        AND is_active = TRUE
        ORDER BY priority ASC
    LOOP
        IF v_rule.commission_type = 'percentage' THEN
            v_amount := v_transaction.gross_amount * (v_rule.commission_value / 100);
        ELSIF v_rule.commission_type = 'fixed' THEN
            v_amount := v_rule.commission_value;
        END IF;
        
        v_remaining := v_remaining - v_amount;
        
        -- Determine member_id based on recipient_role
        IF v_rule.recipient_role = 'collaborator_tier1' AND v_transaction.referrer_member_id IS NOT NULL THEN
            member_id := v_transaction.referrer_member_id;
            earning_type := 'collaborator_tier1';
            amount := v_amount;
            rule_id := v_rule.id;
            RETURN NEXT;
        ELSIF v_rule.recipient_role = 'collaborator_tier2' AND v_transaction.referrer_tier2_member_id IS NOT NULL THEN
            member_id := v_transaction.referrer_tier2_member_id;
            earning_type := 'collaborator_tier2';
            amount := v_amount;
            rule_id := v_rule.id;
            RETURN NEXT;
        ELSIF v_rule.recipient_role = 'charity' THEN
            -- Charity is tracked but not paid to a member
            earning_type := 'charity_reserve';
            amount := v_amount;
            rule_id := v_rule.id;
            -- Don't return this as member earning, tracked separately
        ELSIF v_rule.recipient_role = 'partner' AND v_transaction.partner_id IS NOT NULL THEN
            -- Find member linked to this partner
            SELECT mpl.member_id INTO member_id 
            FROM member_partner_links mpl 
            WHERE mpl.partner_id = v_transaction.partner_id 
            AND mpl.is_primary_contact = TRUE
            LIMIT 1;
            
            IF member_id IS NOT NULL THEN
                earning_type := 'partner_share';
                amount := v_amount;
                rule_id := v_rule.id;
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;
    
    -- Handle remainder based on rule_set.remainder_recipient
    IF v_remaining > 0 THEN
        IF v_rule_set.remainder_recipient = 'tutor' AND v_transaction.provider_member_id IS NOT NULL THEN
            member_id := v_transaction.provider_member_id;
            earning_type := 'tutor_fee';
            amount := v_remaining;
            rule_id := NULL;
            RETURN NEXT;
        ELSIF v_rule_set.remainder_recipient = 'platform' THEN
            -- Platform remainder tracked as platform revenue (no member payout)
            earning_type := 'platform_revenue';
            amount := v_remaining;
            rule_id := NULL;
            -- Platform earnings tracked separately, not returned here
        END IF;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ONBOARDING PLAN (Fresh Start)
-- ============================================================
-- 
-- PHASE 1: Fresh Member Onboarding
-- - Send email invitations to all members to join the new system
-- - Members register via magic link → creates record in `members` table
-- - Existing data NOT migrated - clean slate approach
--
-- PHASE 2: Legacy Lambsbook.net Integration (Later)
-- - Enable Supabase members to access legacy website
-- - Link auth via member email matching
-- - Read-only access to historical data on lambsbook.net
--
-- NO DATA MIGRATION REQUIRED - onboarding via fresh email invites
-- ============================================================
