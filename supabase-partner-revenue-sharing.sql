-- Partner Revenue Sharing Schema for Lambsbook Agentic Hub
-- This tracks fees/commissions for partners who bring programs, products, or services to the platform
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- TABLE 1: partner_revenue_items
-- Catalog of revenue-share eligible items (programs, products, services)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_revenue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What type of item generates revenue
  item_type TEXT NOT NULL CHECK (item_type IN ('partner_program_offering', 'service', 'product', 'custom')),
  
  -- The partner who brought this item to the platform
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Optional links to existing tables
  program_offering_id UUID REFERENCES partner_program_offerings(id) ON DELETE SET NULL,
  
  -- For custom items not in other tables
  custom_code TEXT,
  
  -- Item details
  item_name TEXT NOT NULL,
  description TEXT,
  default_currency TEXT DEFAULT 'USD',
  default_gross_amount DECIMAL(12,2),
  
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicates
  UNIQUE (item_type, partner_id, program_offering_id, custom_code)
);

-- ============================================
-- TABLE 2: partner_revenue_share_rules
-- Define what percentage/amount each partner receives
-- ============================================
CREATE TABLE IF NOT EXISTS partner_revenue_share_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which item this rule applies to
  revenue_item_id UUID NOT NULL REFERENCES partner_revenue_items(id) ON DELETE CASCADE,
  
  -- Which partner receives the share (can be different from item owner for multi-partner deals)
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Share calculation
  share_type TEXT NOT NULL CHECK (share_type IN ('percentage', 'fixed')),
  share_value DECIMAL(7,4) NOT NULL, -- e.g., 15.00 for 15% or 100.00 for $100 fixed
  share_currency TEXT DEFAULT 'USD',
  
  -- Date range when this rule applies
  applies_from DATE,
  applies_until DATE,
  
  -- Optional cap on total earnings
  cap_amount DECIMAL(12,2),
  
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate rules for same partner/item/period
  UNIQUE (revenue_item_id, partner_id, applies_from)
);

-- ============================================
-- TABLE 3: partner_revenue_events
-- Records each sale/enrollment that generates revenue
-- ============================================
CREATE TABLE IF NOT EXISTS partner_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which item was sold/enrolled
  revenue_item_id UUID NOT NULL REFERENCES partner_revenue_items(id) ON DELETE CASCADE,
  
  -- Where this event came from (manual entry, API, etc.)
  source_system TEXT NOT NULL DEFAULT 'manual',
  source_reference TEXT, -- External invoice/order ID
  
  -- Customer info (optional)
  customer_identifier TEXT,
  customer_email TEXT,
  customer_name TEXT,
  
  -- What type of revenue event
  event_type TEXT NOT NULL CHECK (event_type IN ('enrollment', 'renewal', 'upsell', 'service_fee', 'product_sale', 'other')),
  
  -- Financial details
  gross_amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- When it happened
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB
);

-- ============================================
-- TABLE 4: partner_revenue_accruals
-- Tracks what's owed to each partner (their calculated share)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_revenue_accruals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links to the event and partner
  revenue_event_id UUID NOT NULL REFERENCES partner_revenue_events(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  share_rule_id UUID REFERENCES partner_revenue_share_rules(id) ON DELETE SET NULL,
  
  -- Calculated share amount
  share_amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Payout status
  status TEXT NOT NULL DEFAULT 'accrued' CHECK (status IN ('accrued', 'pending_payout', 'paid', 'cancelled')),
  
  accrual_date TIMESTAMPTZ DEFAULT NOW(),
  payout_date TIMESTAMPTZ,
  payout_reference TEXT,
  payout_batch_id UUID,
  
  notes TEXT
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_partner_revenue_items_partner ON partner_revenue_items(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_items_type ON partner_revenue_items(item_type);
CREATE INDEX IF NOT EXISTS idx_partner_share_rules_item ON partner_revenue_share_rules(revenue_item_id);
CREATE INDEX IF NOT EXISTS idx_partner_share_rules_partner ON partner_revenue_share_rules(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_events_item ON partner_revenue_events(revenue_item_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_events_date ON partner_revenue_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_accruals_partner ON partner_revenue_accruals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_accruals_status ON partner_revenue_accruals(status);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_accruals_event ON partner_revenue_accruals(revenue_event_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE partner_revenue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_share_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_accruals ENABLE ROW LEVEL SECURITY;

-- Admin policies (admins can do everything)
CREATE POLICY "Admins can manage revenue items" ON partner_revenue_items
  FOR ALL USING (true);

CREATE POLICY "Admins can manage share rules" ON partner_revenue_share_rules
  FOR ALL USING (true);

CREATE POLICY "Admins can manage revenue events" ON partner_revenue_events
  FOR ALL USING (true);

CREATE POLICY "Admins can manage accruals" ON partner_revenue_accruals
  FOR ALL USING (true);

-- ============================================
-- SUMMARY VIEW: Partner earnings dashboard
-- ============================================
CREATE OR REPLACE VIEW partner_earnings_summary AS
SELECT 
  p.id as partner_id,
  p.company_name as partner_name,
  COUNT(DISTINCT pri.id) as total_items,
  COUNT(DISTINCT pre.id) as total_events,
  COALESCE(SUM(CASE WHEN pra.status = 'accrued' THEN pra.share_amount ELSE 0 END), 0) as accrued_amount,
  COALESCE(SUM(CASE WHEN pra.status = 'pending_payout' THEN pra.share_amount ELSE 0 END), 0) as pending_payout,
  COALESCE(SUM(CASE WHEN pra.status = 'paid' THEN pra.share_amount ELSE 0 END), 0) as paid_amount,
  COALESCE(SUM(pra.share_amount), 0) as total_earned
FROM partners p
LEFT JOIN partner_revenue_items pri ON p.id = pri.partner_id
LEFT JOIN partner_revenue_events pre ON pri.id = pre.revenue_item_id
LEFT JOIN partner_revenue_accruals pra ON pre.id = pra.revenue_event_id AND p.id = pra.partner_id
GROUP BY p.id, p.company_name;
