# Lambsbook Collaborator & Referral System Design

## Overview
A two-tier referral system where collaborators earn commissions from their direct referrals (customers) AND from the referrals made by collaborators they invited.

## Core Entities

### 1. collaborators
Stores all collaborator accounts with their invitation chain.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Unique email (primary identifier for tracking) |
| full_name | text | Collaborator's full name |
| phone | text | Contact phone (optional) |
| country | text | Country of residence |
| status | text | pending, approved, suspended, inactive |
| invited_by_email | text | Email of the collaborator who invited them (null if direct signup) |
| invited_by_id | uuid | FK to collaborators.id (for faster queries) |
| approved_at | timestamp | When admin approved the collaborator |
| approved_by | text | Admin email who approved |
| created_at | timestamp | Registration date |

### 2. collaborator_programs
Links collaborators to specific programs they can promote.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| collaborator_id | uuid | FK to collaborators |
| program_id | text | FK to programs.program_id |
| status | text | pending, approved, rejected |
| approved_at | timestamp | When approved for this program |
| created_at | timestamp | When they applied |

### 3. program_commissions
Defines commission structure per program.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| program_id | text | FK to programs.program_id |
| commission_type | text | fixed, percentage_sales, percentage_profit |
| tier1_rate | decimal | Rate for direct referrer (default 15%) |
| tier2_rate | decimal | Rate for the inviter of referrer (default 15%) |
| min_payout | decimal | Minimum amount before payout |
| payment_terms | text | Description of when commissions are released |
| created_at | timestamp | |

### 4. customer_referrals
Tracks which collaborator referred which customer for which program.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| customer_email | text | Customer's email |
| customer_name | text | Customer's name |
| referrer_email | text | Email of collaborator who referred |
| referrer_id | uuid | FK to collaborators |
| program_id | text | FK to programs.program_id |
| referral_date | timestamp | When referral was made |
| status | text | pending, converted, cancelled |
| converted_at | timestamp | When customer made a purchase |

### 5. commission_transactions
Records all commission earnings and payouts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| collaborator_id | uuid | FK to collaborators (who earns) |
| referral_id | uuid | FK to customer_referrals |
| program_id | text | FK to programs |
| tier | integer | 1 = direct referrer, 2 = inviter of referrer |
| gross_amount | decimal | Total transaction amount |
| commission_rate | decimal | Rate applied |
| commission_amount | decimal | Actual commission earned |
| status | text | pending, approved, paid, cancelled |
| payment_terms_met | boolean | Whether release conditions are met |
| paid_at | timestamp | When paid out |
| created_at | timestamp | |

### 6. commission_payouts
Batch payout records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| collaborator_id | uuid | FK to collaborators |
| total_amount | decimal | Total payout amount |
| transaction_ids | uuid[] | Array of commission_transaction IDs included |
| payment_method | text | bank_transfer, paypal, etc. |
| payment_reference | text | External reference number |
| status | text | pending, processing, completed, failed |
| processed_at | timestamp | |
| created_at | timestamp | |

## Referral Flow

```
1. Collaborator A signs up → status = "pending"
2. Admin approves A → status = "approved"
3. A invites B (via email) → B signs up with invited_by_email = A's email
4. Admin approves B → status = "approved"
5. B refers Customer C for Program X
6. Customer C purchases → creates customer_referral record
7. System calculates commissions:
   - B gets Tier 1 commission (15% default)
   - A gets Tier 2 commission (15% default)
8. Commissions recorded in commission_transactions
9. When payment_terms_met = true, commissions can be paid out
```

## Key Queries

### Get collaborator's earnings
```sql
SELECT 
  c.email,
  SUM(ct.commission_amount) as total_earnings,
  SUM(CASE WHEN ct.tier = 1 THEN ct.commission_amount ELSE 0 END) as tier1_earnings,
  SUM(CASE WHEN ct.tier = 2 THEN ct.commission_amount ELSE 0 END) as tier2_earnings
FROM collaborators c
JOIN commission_transactions ct ON c.id = ct.collaborator_id
WHERE ct.status = 'approved'
GROUP BY c.id;
```

### Get invitation chain
```sql
WITH RECURSIVE invitation_chain AS (
  SELECT id, email, invited_by_email, 1 as level
  FROM collaborators 
  WHERE email = 'target@email.com'
  
  UNION ALL
  
  SELECT c.id, c.email, c.invited_by_email, ic.level + 1
  FROM collaborators c
  JOIN invitation_chain ic ON c.email = ic.invited_by_email
)
SELECT * FROM invitation_chain;
```
