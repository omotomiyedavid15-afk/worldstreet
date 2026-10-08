# Phase 5 Seller Payment Requests Implementation Plan

**Goal:** Complete the device-local Phase 5 payment-request contract with fixed agreed totals, inventory-lock metadata, retryable failures, and tested duplicate/competing-payment protection.

**Architecture:** Keep negotiation state behind the existing local repository boundary and make the payment request an immutable snapshot of the accepted deal. A small pure payment-request state machine owns legal payment transitions; the UI renders the snapshot and the repository rechecks stock and deadlines before every attempt.

**Approach:** Harden the existing adapter-backed prototype. A real provider integration is deferred until authentication, a durable server repository, and provider credentials exist; the interfaces and acceptance tests will make that replacement explicit.

## Alternatives considered

1. **Integrate a hosted payment provider now.** Highest production fidelity, but unsafe and incomplete without provider selection, secrets, real accounts, KYC, webhooks, and durable storage. Risk: high.
2. **Change only the payment-request UI.** Smallest diff, but leaves fixed-total, retry, and concurrency behavior implicit. Risk: medium because the presentation would overstate the model.
3. **Harden the local domain contract (chosen).** Matches the repository's current architecture, adds no dependency, is fully testable, and preserves an honest demo boundary. Risk: low.

### Task 1: Payment-request state machine

**Files:**
- Create: `lib/machines/payment-request.ts`
- Create: `lib/machines/payment-request.test.ts`

**Steps:**
1. Write failing transition tests for unpaid, declined, timed out, paid, and expired requests.
2. Add typed `nextPaymentRequest` and reject illegal retry/payment transitions.
3. Run the focused unit test.

**Verification:** `npx vitest run --project unit lib/machines/payment-request.test.ts`

### Task 2: Immutable request and payment-attempt contract

**Files:**
- Modify: `features/negotiation/model.ts`
- Modify: `features/negotiation/model.test.ts`

**Steps:**
1. Add failing tests for immutable item/quantity/total snapshots, role checks, attempt tracking, the configured inventory-lock deadline, duplicate commands, late payment, and two accepted deals competing for the final unit.
2. Extend `PaymentRequest` with its own id, accepted unit price, quantity, item subtotal, status, attempt count, lock deadline, and paid timestamp.
3. Recheck availability and expiry before every payment attempt; keep declined and timed-out requests retryable; make paid and expired requests terminal.
4. Keep command totals server-derived from the accepted offer and agreed delivery.

**Verification:** `npx vitest run --project unit features/negotiation/model.test.ts lib/machines/payment-request.test.ts`

### Task 3: Buyer review UI and stories

**Files:**
- Modify: `features/negotiation/OfferCard.tsx`
- Modify: `features/negotiation/Negotiation.stories.tsx`
- Modify: `styles/marketplace/negotiation.css` if the existing layout needs a state treatment

**Steps:**
1. Render the snapshotted item price, quantity, subtotal, delivery, and final total before the pay button.
2. Explain the inventory recheck/hold and show retry-safe status after decline or timeout.
3. Update stories for unpaid, declined, timeout, paid, and expired requests.

**Verification:** `npx eslint features/negotiation/OfferCard.tsx features/negotiation/Negotiation.stories.tsx`

### Task 4: Browser acceptance and handoff documentation

**Files:**
- Modify: `e2e/negotiation.spec.ts`
- Modify: `docs/marketplace/PROGRESS.md`

**Steps:**
1. Extend the P2P flow to assert every cost is visible before payment and a declined attempt can be retried successfully without changing the total.
2. Record the Phase 5 local acceptance result and the remaining production boundary.
3. Run mobile and desktop acceptance coverage.

**Verification:** `npx playwright test e2e/negotiation.spec.ts --project=mobile --project=desktop --workers=2`

### Task 5: Full phase verification

**Files:** No implementation files.

**Steps:**
1. Run `git diff --check`.
2. Run the repository's required full check.
3. Review the final diff for accidental cart/checkout restoration or production-payment claims.

**Verification:** `npm run check`
