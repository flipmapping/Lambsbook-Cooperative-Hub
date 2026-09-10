# FAB-FIN-PAY-B-001
## Financial Authority — Payment Verification & Reconciliation Contract Boundary

**Parent:** FAB-PAYMENT-READY-001
**Related:** FAB-FIN-PAY-A-001
**Cycle:** FIN-CYCLE-NEXT
**Owner:** Financial Authority
**Stage:** PROVIDER-NEUTRAL PAYMENT VERIFICATION CONTRACT
**Status:** APPROVED TO EXECUTE

---

# 1. PURPOSE

Define the minimum provider-neutral evidence contract required for Lambsbook
to safely transition from an externally initiated payment to a canonical
Lambsbook Order state and, subsequently, entitlement.

This artifact deliberately does not select or integrate a payment provider.

PAY-A remains ON HOLD pending authoritative ACB information.

Provider-specific facts MUST NOT be inferred from this contract.

---

# 2. CANONICAL PAYMENT CORRIDOR

The required conceptual corridor is:

    Payment Initiation
          ↓
    External Payment Provider
          ↓
    Provider Payment Event
          ↓
    Verified Payment Evidence
          ↓
    Lambsbook Order State
          ↓
    Financial Consequence
          ↓
    Entitlement
          ↓
    Capability Access

The external provider proves the external payment event.

Lambsbook determines the canonical Order state.

Lambsbook determines Entitlement.

No external provider becomes the authority for Lambsbook entitlement.

---

# 3. AUTHORITY BOUNDARIES

## 3.1 External Provider Authority

The provider is authoritative only for facts it actually attests to about
the external payment transaction.

Examples:

- provider identity;
- provider transaction identity;
- provider event identity;
- provider-reported amount;
- provider-reported currency;
- provider event timestamp;
- provider-reported payment status;
- provider-reported settlement state where applicable;
- provider-reported refund/cancellation state.

The provider MUST NOT directly determine:

- Lambsbook Order state;
- Lambsbook entitlement;
- Lambsbook capability access.

## 3.2 Lambsbook Authority

Lambsbook remains authoritative for:

- Order identity;
- Order state;
- Order amount and currency as contracted by Lambsbook;
- whether verified provider evidence matches the Order;
- whether the evidence is acceptable for the Order transition;
- entitlement creation;
- entitlement state;
- capability access.

## 3.3 Financial Authority

Financial Authority owns the economic consequences and verification boundary.

Financial Authority MUST NOT become a duplicate provider ledger.

Financial Authority MUST NOT create provider-specific business authority.

Financial Authority MUST NOT create AI-specific billing logic.

---

# 4. MINIMUM PAYMENT EVIDENCE

A payment event is not sufficient merely because a provider reports
"success."

The verification boundary MUST be capable of evaluating the following
evidence.

| Evidence | Requirement | Purpose |
|---|---|---|
| Lambsbook order reference | REQUIRED | Correlate payment to Order |
| Payment reference | REQUIRED | Stable Lambsbook payment-attempt reference |
| Provider identity | REQUIRED | Identify payment authority |
| Provider transaction identity | REQUIRED | Identify provider-side transaction |
| Provider event identity | REQUIRED where provider supplies one | Identify individual provider event |
| Amount | REQUIRED | Economic matching |
| Currency | REQUIRED | Economic matching |
| Payer/customer reference | OPTIONAL | Correlation where legitimately available |
| Event timestamp | REQUIRED | Temporal evidence |
| Verification status | REQUIRED | Establish whether evidence passed verification |
| Settlement status | CONDITIONAL | Required where provider separates authorization/settlement |
| Refund state | CONDITIONAL | Required where refunds can affect economic state |
| Cancellation state | CONDITIONAL | Required where payment/order can be cancelled |
| Reconciliation evidence | REQUIRED | Establish accounting/reconciliation trail |
| Failure state | REQUIRED | Preserve failed/rejected payment outcome |

---

# 5. PAYMENT REFERENCE

Lambsbook MUST maintain a provider-neutral reference for the payment attempt.

Conceptually:

    payment_reference

This reference belongs to Lambsbook.

It MUST NOT be replaced by a provider transaction ID.

A provider transaction ID is external evidence associated with the
Lambsbook payment reference.

---

# 6. ORDER REFERENCE

Every payment attempt intended to satisfy an Order MUST resolve to exactly
one canonical Lambsbook Order reference.

Required relationship:

    payment_attempt
          ↓
    exactly one Order

A payment event that cannot be safely associated with an Order MUST NOT
automatically create paid entitlement.

---

# 7. AMOUNT AND CURRENCY VERIFICATION

The verification boundary MUST compare provider evidence against the
canonical Lambsbook Order economics.

Required comparison:

    provider.amount
        =
    expected Order amount

and:

    provider.currency
        =
    expected Order currency

Unless an explicitly approved future FX contract exists, currency mismatch
MUST NOT be silently converted into a successful payment.

Amount mismatch MUST NOT automatically produce PAID.

---

# 8. PROVIDER IDENTITY

Every externally verified payment event MUST identify its provider.

Conceptually:

    provider_id

Provider identity is metadata about the payment evidence.

It MUST NOT change the canonical economic model.

Provider-specific adapters, if eventually implemented, MUST normalize their
events into this provider-neutral boundary.

---

# 9. PROVIDER TRANSACTION IDENTITY

Where supplied by the provider, the provider transaction identity MUST be
captured as immutable external evidence.

Conceptually:

    provider_transaction_id

The combination of provider identity and provider transaction identity
MUST be treated as a candidate uniqueness boundary.

The same external transaction MUST NOT create multiple independent successful
payment consequences.

---

# 10. EVENT IDENTITY

Where the provider supplies an event identifier, it MUST be retained.

Conceptually:

    provider_event_id

The verification layer MUST support idempotent handling of repeated delivery
of the same event.

A repeated event MUST produce the same effective Lambsbook outcome rather
than a second economic consequence.

---

# 11. EVENT TIMESTAMP

The provider event timestamp MUST be retained where supplied.

The system SHOULD distinguish:

- provider event time;
- receipt/processing time;
- Lambsbook state-transition time.

Provider event time MUST NOT be fabricated from local receipt time when the
provider supplies its own timestamp.

---

# 12. VERIFICATION STATUS

The provider-neutral verification boundary MUST distinguish at minimum:

    UNVERIFIED
    VERIFIED
    REJECTED

Conceptually:

    UNVERIFIED
        ↓
    verification checks
        ↓
    VERIFIED
        OR
    REJECTED

Only VERIFIED evidence may be considered for a successful Order transition.

Client-side confirmation, redirect success, screenshot, manual claim, or
unverified notification MUST NOT be equivalent to VERIFIED evidence.

---

# 13. SETTLEMENT STATUS

Some providers may distinguish authorization, capture, settlement and other
payment states.

Therefore Lambsbook MUST NOT assume:

    payment success = settlement

when the provider contract distinguishes them.

The normalized boundary MUST preserve provider settlement state where it is
economically relevant.

The exact provider-specific settlement states remain:

    UNVERIFIED / PENDING ACB

until PAY-A resumes.

---

# 14. DUPLICATE-EVENT PROTECTION

The verification boundary MUST be idempotent.

At minimum it must prevent:

    same provider event
        ↓
    multiple Order payment consequences

and:

    same provider transaction
        ↓
    multiple successful payment consequences

A duplicate delivery MUST resolve to the already-established outcome rather
than create another payment consequence.

---

# 15. REPLAY PROTECTION

Provider events MUST NOT be accepted solely because they are structurally
valid.

Where the provider supplies:

- signature;
- MAC;
- timestamp;
- nonce;
- event ID;
- transaction ID;
- other authenticity/replay controls;

the eventual provider adapter MUST use the provider's authoritative
verification mechanism.

The provider-specific mechanism remains UNKNOWN until PAY-A establishes it.

---

# 16. REFUND AND CANCELLATION

Refund and cancellation are economic state changes and MUST NOT be modeled
as successful payment events.

The normalized boundary must distinguish:

    PAYMENT_SUCCESS
    REFUND
    CANCELLATION
    PAYMENT_FAILURE

A refund MUST NOT silently recreate or duplicate an original payment.

The exact downstream entitlement consequence of a refund is a separate
economic policy decision and is NOT authorized by this FAB.

---

# 17. FAILURE STATE

The payment boundary MUST preserve meaningful failure outcomes.

At minimum:

    PAYMENT_FAILED
    PAYMENT_REJECTED
    PAYMENT_EXPIRED
    PAYMENT_CANCELLED

Provider-specific failure codes may be retained as external evidence but
MUST NOT become Lambsbook business-state authority.

---

# 18. ORDER STATE TRANSITION RULE

The conceptual rule is:

    Provider Event
          ↓
    Authenticity Verification
          ↓
    Event/Transaction Idempotency Check
          ↓
    Order Correlation
          ↓
    Amount Verification
          ↓
    Currency Verification
          ↓
    Payment-State Verification
          ↓
    Reconciliation Evidence
          ↓
    VERIFIED PAYMENT
          ↓
    Lambsbook Order = PAID

Failure at any required verification step MUST prevent the successful
payment transition.

No entitlement may be granted from an unverified event.

---

# 19. ENTITLEMENT BOUNDARY

The canonical boundary is:

    Verified Payment
          ↓
    Lambsbook Order = PAID
          ↓
    Entitlement Decision
          ↓
    Entitlement
          ↓
    Capability Access

Payment providers do not create Lambsbook entitlement.

Payment adapters do not create independent entitlement authority.

AI/GE execution does not determine whether a customer has paid.

---

# 20. RECONCILIATION REQUIREMENT

The eventual production payment corridor MUST provide enough evidence to
answer:

1. Which Lambsbook Order was paid?
2. Which payment attempt was involved?
3. Which provider processed it?
4. Which provider transaction was involved?
5. What amount was reported?
6. What currency was reported?
7. When did the provider report the event?
8. Was the event authenticated?
9. Was the event already processed?
10. What canonical Order state resulted?
11. What financial consequence resulted?
12. What entitlement consequence resulted, if any?
13. If the payment was refunded/cancelled, what changed afterward?

Reconciliation MUST be possible without relying solely on client-side state.

---

# 21. PROVIDER-NEUTRAL NORMALIZED EVENT

The eventual normalized provider event should conceptually contain:

    {
      provider_id,
      provider_transaction_id,
      provider_event_id,
      payment_reference,
      order_reference,
      amount,
      currency,
      payer_reference,
      event_timestamp,
      verification_status,
      settlement_status,
      refund_status,
      cancellation_status,
      failure_state
    }

This is a conceptual contract only.

It does NOT authorize a schema implementation.

It does NOT prescribe a particular database table.

It does NOT prescribe a particular API.

It does NOT prescribe a webhook.

---

# 22. PROVIDER ADAPTER BOUNDARY

Future providers MUST terminate at the same normalized verification
boundary.

Conceptually:

    ACB
      ↓
    ACB adapter
      ↓
    normalized verified payment evidence
      ↓
    Lambsbook Order

    PayPal
      ↓
    PayPal adapter
      ↓
    normalized verified payment evidence
      ↓
    Lambsbook Order

Other providers follow the same boundary.

Provider-specific implementation MUST NOT leak provider-specific business
authority into Order or Entitlement.

---

# 23. CURRENT PROVIDER STATUS

PAY-A is ON HOLD.

The following facts are explicitly:

    UNVERIFIED / PENDING ACB

- ACB API availability
- ACB webhook/event availability
- ACB dynamic QR behavior
- ACB payment-query capability
- ACB reconciliation capability
- ACB international acceptance
- ACB settlement behavior
- ACB merchant eligibility
- ACB fees
- ACB refund behavior
- ACB duplicate-payment protection
- ACB account configuration
- ACB2PAY eligibility/configuration
- ACB Cross-Border QR eligibility/configuration

No provider-specific conclusion may be derived from this contract.

---

# 24. EXACT PAY-A RESUME INPUTS

When the Founder returns from ACB, PAY-A must obtain authoritative answers
for:

## Account / eligibility

- approved ACB payment products;
- merchant eligibility;
- account configuration;
- onboarding requirements;
- required contracts.

## Acceptance

- domestic QR capability;
- Cross-Border QR capability;
- supported countries;
- supported payment networks;
- supported customer payment instruments;
- supported currencies;
- card acceptance capability.

## Order correlation

- dynamic QR capability;
- payment-link capability;
- order/reference encoding;
- amount binding;
- duplicate-payment behavior.

## Verification

- API availability;
- webhook/event availability;
- callback authentication;
- signature/MAC mechanism;
- transaction-query mechanism;
- transaction ID;
- event ID;
- timestamps;
- payment-status states.

## Reconciliation

- transaction history;
- reconciliation reports;
- settlement records;
- settlement timing;
- refund representation;
- cancellation representation;
- dispute/chargeback representation.

## Economics

- transaction fees;
- FX/conversion fees;
- settlement fees;
- refund fees;
- other merchant charges.

## Operations

- production support;
- retry behavior;
- downtime behavior;
- notification guarantees;
- operational limitations.

---

# 25. EXPLICIT UNKNOWN RULE

Until authoritative provider evidence is obtained:

    UNKNOWN = UNKNOWN

The following are prohibited:

- inference from marketing material;
- inference from another merchant's configuration;
- inference from a different ACB account;
- inference from another provider;
- assumption that a QR feature implies an API;
- assumption that a payment notification is a verified webhook;
- assumption that a successful client redirect proves payment;
- assumption that settlement equals payment;
- assumption that international QR equals international card acceptance.

---

# 26. NON-GOALS

This FAB does NOT authorize:

- payment-provider integration;
- payment API implementation;
- webhook implementation;
- checkout implementation;
- payment UI implementation;
- payment schema migration;
- Order schema mutation;
- Entitlement schema mutation;
- refund implementation;
- settlement implementation;
- live reconciliation;
- provider credential installation;
- ACB configuration;
- PayPal integration;
- ZaloPay integration;
- VNPAY integration;
- payOS integration;
- Whop integration;
- Main App payment mutation;
- Organization Studio mutation;
- Growth Engine mutation;
- deployment;
- Git mutation.

---

# 27. COMPLETION CRITERIA

PAY-B is COMPLETE when:

1. The provider-neutral payment verification boundary is explicitly defined.
2. Required evidence fields are defined.
3. Order/payment correlation is defined.
4. Amount/currency verification is defined.
5. Provider and transaction identity are defined.
6. Event identity and idempotency are defined.
7. Replay protection requirements are defined.
8. Verification states are defined.
9. Settlement/refund/cancellation boundaries are defined.
10. Reconciliation requirements are defined.
11. Failure handling is defined.
12. Entitlement authority remains exclusively within Lambsbook.
13. Provider-specific facts remain UNKNOWN / PENDING ACB.
14. Exact PAY-A resume inputs are recorded.
15. No provider integration or repository implementation is performed.

---

# 28. STOP CONDITION

After the contract artifact and targeted verification are complete:

    STOP.

Do not proceed to payment implementation.

Do not resume PAY-A from assumptions.

PAY-A resumes only when authoritative ACB information is available.

---

# 29. RETURN FORMAT

CYCLE=FIN-CYCLE-NEXT
FAB=FAB-FIN-PAY-B-001
PAY-A=ON_HOLD
PROVIDER_SELECTION=NOT_PERFORMED
PROVIDER_FACTS_ASSUMED=NO
VERIFICATION_CONTRACT=COMPLETE
RECONCILIATION_REQUIREMENTS=DEFINED
ACB_RESUME_INPUTS=DEFINED
BLOCKERS=ACB_AUTHORITATIVE_PAYMENT_PRODUCT_AND_API_DETAILS
STOP=YES
