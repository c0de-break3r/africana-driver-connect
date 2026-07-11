Read AGENTS.md fully and strictly follow it before starting.

Ask permission before adding a payment SDK (Mobile Money API, Paystack, or Stripe) and explain why, per AGENTS.md.

Once approved, implement:

- Wallet balance display (placeholder balance backed by backend)
- Payment method selection at booking confirmation (reuse client's preferred method from onboarding)
- Escrow-style hold on booking confirmation, release on completion (simple state machine, not a full financial engine)
- Real billing for the subscription tier chosen in Prompt 22 (Premium Listing, Corporate contract), including the pre-expiry trial reminder notification
- Refund request UI (ties into Dispute Management, built next)

All payment provider secrets and calls must go through backend/serverless functions only.

CRITICAL: All backend payment handlers (escrow holds, releases, refunds, subscription billing) must be idempotent and authoritative. Use request identifiers/tokens to prevent duplicate charges, holds, releases, or refunds from retries or duplicate submissions. State transitions must be managed server-side — the client cannot create, release, or refund a transaction without backend validation and execution.
