Read AGENTS.md fully — payment keys must be server-side only.

Build the in-app wallet system for drivers, owners, and clients.

## Tasks

1. **Add `wallets` table to Convex schema**:
   - `userId` (ref users, indexed)
   - `balance` (number, in smallest currency unit)
   - `currency` (string, default "USD")
   - `pendingBalance` (number — escrowed funds not yet released)
   - `createdAt`, `updatedAt`
2. **Add `transactions` table to Convex schema**:
   - `walletId` (ref wallets)
   - `type` (union: "deposit", "withdrawal", "payment_in", "payment_out", "escrow_hold", "escrow_release", "commission", "refund", "bonus")
   - `amount` (number)
   - `currency` (string)
   - `referenceId` (optional string — booking/job ID)
   - `description` (string)
   - `status` (union: "pending", "completed", "failed")
   - `createdAt`
   - Indexes: by_wallet, by_type, by_reference
3. **Create `convex/wallet.ts`**:
   - `getBalance(userId)` — current balance + pending
   - `getTransactions(userId, paginationOpts, type?)` — transaction history
   - `addFunds(userId, amount, type, description)` — internal mutation (called by payment action)
   - `deductFunds(userId, amount, type, description)` — internal mutation with insufficient balance check
   - `holdEscrow(clientId, amount, bookingId)` — move funds from balance to pending
   - `releaseEscrow(bookingId)` — release pending funds to driver wallet
   - `refundEscrow(bookingId)` — return pending funds to client
4. **Create wallet screens**:
   - `(driver)/wallet.tsx` — replace placeholder with real balance, transaction history, withdraw button
   - `(client)/wallet.tsx` — balance, add funds, payment history
   - `(driver)/withdraw.tsx` — withdrawal to bank/mobile money
5. **Create `src/hooks/useWallet.ts`** — wallet state and Convex calls

## Rules

- Wallet mutations must be atomic — never allow negative balances
- All monetary values stored as integers (cents) to avoid floating-point issues
- Payment provider keys live in Convex env vars only
- Run `bun run typecheck` and `bun run lint` — fix all errors
