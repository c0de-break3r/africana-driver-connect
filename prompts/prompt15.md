Read AGENTS.md fully and strictly follow it before starting.

Ask permission before adding a payment SDK (Mobile Money API, Paystack, or Stripe) and explain why, per AGENTS.md.

Once approved, implement:

- Wallet balance display (placeholder balance backed by backend)
- Payment method selection at booking confirmation (reuse client's preferred method from onboarding)
- Escrow-style hold on booking confirmation, release on completion (simple state machine, not a full financial engine)
- Refund request UI (ties into Dispute Management, built next)

All payment provider secrets and calls must go through backend/serverless functions only.
