-- ============================================================
-- Lambsbook Agentic Hub: Collaborator & Referral System Tables
-- ============================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================

-- 1. COLLABORATORS TABLE
-- Stores all collaborator accounts with invitation chain tracking
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
    invited_by_email TEXT,
    invited_by_id UUID REFERENCES collaborators(id),
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COLLABORATOR_PROGRAMS TABLE
-- Links collaborators to specific programs they can promote
CREATE TABLE IF NOT EXISTS collaborator_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    program_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collaborator_id, program_id)
);

-- 3. PROGRAM_COMMISSIONS TABLE
-- Defines commission structure per program (editable in dashboard)
CREATE TABLE IF NOT EXISTS program_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id TEXT NOT NULL UNIQUE,
    commission_type TEXT DEFAULT 'percentage_profit' CHECK (commission_type IN ('fixed', 'percentage_sales', 'percentage_profit')),
    tier1_rate DECIMAL(5,4) DEFAULT 0.15,
    tier2_rate DECIMAL(5,4) DEFAULT 0.15,
    min_payout DECIMAL(10,2) DEFAULT 50.00,
    payment_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMER_REFERRALS TABLE
-- Tracks which collaborator referred which customer for which program
CREATE TABLE IF NOT EXISTS customer_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    referrer_email TEXT NOT NULL,
    referrer_id UUID REFERENCES collaborators(id),
    program_id TEXT NOT NULL,
    referral_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'cancelled')),
    converted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMISSION_TRANSACTIONS TABLE
-- Records all commission earnings
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborator_id UUID NOT NULL REFERENCES collaborators(id),
    referral_id UUID REFERENCES customer_referrals(id),
    program_id TEXT NOT NULL,
    tier INTEGER CHECK (tier IN (1, 2)),
    gross_amount DECIMAL(12,2),
    commission_rate DECIMAL(5,4),
    commission_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    payment_terms_met BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMISSION_PAYOUTS TABLE
-- Batch payout records
CREATE TABLE IF NOT EXISTS commission_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborator_id UUID NOT NULL REFERENCES collaborators(id),
    total_amount DECIMAL(12,2) NOT NULL,
    transaction_ids UUID[] NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_collaborators_email ON collaborators(email);
CREATE INDEX IF NOT EXISTS idx_collaborators_invited_by ON collaborators(invited_by_email);
CREATE INDEX IF NOT EXISTS idx_collaborators_status ON collaborators(status);
CREATE INDEX IF NOT EXISTS idx_customer_referrals_referrer ON customer_referrals(referrer_email);
CREATE INDEX IF NOT EXISTS idx_customer_referrals_program ON customer_referrals(program_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_collaborator ON commission_transactions(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);

-- ============================================================
-- ROW LEVEL SECURITY (for production)
-- ============================================================

ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INSERT DEFAULT COMMISSION RATES FOR EXISTING PROGRAMS
-- ============================================================

INSERT INTO program_commissions (program_id, commission_type, tier1_rate, tier2_rate, payment_terms)
SELECT program_id, 'percentage_profit', 0.15, 0.15, 'Commission released upon customer payment completion'
FROM programs
WHERE NOT EXISTS (
  SELECT 1 FROM program_commissions pc WHERE pc.program_id = programs.program_id
);
