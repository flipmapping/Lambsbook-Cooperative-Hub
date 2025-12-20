-- ============================================================
-- Lambsbook Agentic Hub: Partner Programs & Commission Schema
-- ============================================================
-- This extends the base schema to handle complex partner agreements
-- like the Tropicana Academy example
-- ============================================================

-- 1. PARTNERS TABLE
-- Stores partner organization details
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    country TEXT,
    address TEXT,
    website TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PARTNER_AGREEMENTS TABLE
-- Stores agreement metadata and terms
CREATE TABLE IF NOT EXISTS partner_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    agreement_code TEXT UNIQUE NOT NULL,
    agreement_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PARTNER_PROGRAM_OFFERINGS TABLE
-- Specific programs/courses offered under an agreement
CREATE TABLE IF NOT EXISTS partner_program_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES partner_agreements(id),
    program_id TEXT REFERENCES programs(program_id),
    offering_name TEXT NOT NULL,
    offering_type TEXT CHECK (offering_type IN ('course', 'workshop', 'certificate', 'diploma', 'package', 'apprenticeship')),
    duration_months INTEGER,
    base_fee DECIMAL(12,2),
    base_fee_currency TEXT DEFAULT 'USD',
    description TEXT,
    eligibility_criteria TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENT_COMMISSION_TIERS TABLE
-- Commission rates that can vary by duration, volume, etc.
CREATE TABLE IF NOT EXISTS agent_commission_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES partner_program_offerings(id),
    tier_name TEXT NOT NULL,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('fixed', 'percentage_sales', 'percentage_profit')),
    commission_amount DECIMAL(12,4) NOT NULL,
    commission_currency TEXT DEFAULT 'USD',
    min_students INTEGER DEFAULT 1,
    max_students INTEGER,
    duration_months INTEGER,
    valid_from DATE,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VOLUME_INCENTIVES TABLE
-- Bonus commissions based on student volume per intake
CREATE TABLE IF NOT EXISTS volume_incentives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID REFERENCES partner_program_offerings(id),
    agreement_id UUID REFERENCES partner_agreements(id),
    min_students INTEGER NOT NULL,
    max_students INTEGER,
    bonus_type TEXT NOT NULL CHECK (bonus_type IN ('percentage', 'fixed')),
    bonus_amount DECIMAL(8,4) NOT NULL,
    applies_from TEXT DEFAULT 'first' CHECK (applies_from IN ('first', 'threshold')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AGREEMENT_EXTRACTED_DATA TABLE
-- Stores AI-extracted data from uploaded agreements for review
CREATE TABLE IF NOT EXISTS agreement_extracted_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_url TEXT,
    document_name TEXT,
    extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed', 'reviewed', 'applied')),
    extracted_json JSONB,
    confidence_score DECIMAL(5,4),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    applied_to_agreement_id UUID REFERENCES partner_agreements(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partner_agreements_partner ON partner_agreements(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_agreements_status ON partner_agreements(status);
CREATE INDEX IF NOT EXISTS idx_partner_offerings_agreement ON partner_program_offerings(agreement_id);
CREATE INDEX IF NOT EXISTS idx_commission_tiers_offering ON agent_commission_tiers(offering_id);
CREATE INDEX IF NOT EXISTS idx_volume_incentives_offering ON volume_incentives(offering_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_program_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commission_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_extracted_data ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SAMPLE DATA: Tropicana Academy Agreement
-- ============================================================

-- Insert partner
INSERT INTO partners (partner_code, company_name, contact_email, contact_phone, country, address, website, status)
VALUES (
    'TASB',
    'Tropicana Academy Sdn Bhd',
    'sdeviy@tropicanaacademy.edu.my',
    '+603-7885 0408',
    'Malaysia',
    'Unit A3-01, Block A, Tropicana Merchant Square, No. 1, Jalan Tropicana Selatan 1, PJU 3, 47410 Petaling Jaya, Selangor',
    'tropicanaacademy.edu.my',
    'active'
)
ON CONFLICT (partner_code) DO NOTHING;

-- Note: After running this, you'll need to get the partner ID to insert the agreement
-- This is just the schema - the dashboard will handle the full workflow
