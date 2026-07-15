Read AGENTS.md fully — payment provider calls belong on the server side.

Integrate payment processing for mobile money and card payments.

## Dependencies

- Prompt 19 (bookings) — bookings must exist before payments
- Prompt 22 (wallet) — wallet system for holding/releasing funds

## Tasks

1. **Create `convex/payments.ts`** (Convex Action — server-side):
   - `processPayment({ bookingId, amount, currency, method })` — charge client via payment provider
   - `refundPayment({ bookingId, amount, reason })` — refund to client
   - `verifyPayment({ transactionId })` — verify payment status with provider
   - Support payment methods:
     - **Mobile money** — MTN Mobile Money, Airtel Money (African market focus)
     - **Card** — Visa, Mastercard
2. **Create `convex/http.ts`** (HTTP endpoints):
   - `paymentWebhook` — receive payment status callbacks from provider
   - Update booking status and wallet on payment confirmation/failure
3. **Create `src/lib/payments.ts`** — client-side payment helper:
   - `getPaymentMethods()` — list available methods
   - `initiatePayment(bookingId, amount, method)` — call Convex action
4. **Create payment UI**:
   - `(client)/checkout.tsx` — payment method selection, amount summary, confirm
   - `components/payment-method-card.tsx` — card/mobile money selection
   - `components/payment-summary.tsx` — breakdown: base price, platform fee, total
   - `components/payment-status.tsx` — processing/success/failed states
5. **Payment flow**:
   1. Client selects driver and confirms booking
   2. Client goes to checkout → selects payment method
   3. Payment processed → funds held in escrow
   4. Driver completes booking → escrow released to driver (minus commission)
   5. Client cancels → refund processed

## Rules

- NEVER store card details or payment tokens on the client
- Payment provider API keys live in Convex environment variables only
- All payment processing happens in Convex Actions (server-side)
- Handle payment failures gracefully — retry, then show error
- Run `bun run typecheck` and `bun run lint` — fix all errors
