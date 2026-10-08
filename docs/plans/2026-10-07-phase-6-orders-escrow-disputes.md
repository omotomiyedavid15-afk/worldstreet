# Phase 6 Orders, Escrow, Reviews and Disputes Plan

**Goal:** Replace the Orders placeholder with a complete device-local order lifecycle whose escrow, ledger, review and dispute behavior satisfies the eight L14 acceptance tests.

**Architecture:** Pure typed state machines and an append-only per-order ledger own financial transitions. A strict local repository persists demo orders and exposes buyer actions; route components render lists, timelines, escrow status, confirmation, reviews and problem reporting from that shared model.

**Approach:** Implement the approved Phase 6 roadmap against mock orders and simulated provider/courier outcomes. Keep production boundaries explicit because authentication, licensed escrow, provider webhooks, delivery partners and moderation services are not configured.

### Task 1: Order, escrow and dispute state machines

**Files:** Create `lib/machines/order.ts`, `lib/machines/escrow.ts`, `lib/machines/dispute.ts` and matching tests.

**Steps:** Write every legal arrow as a failing table test, reject every illegal transition, then implement the typed transition tables.

**Verification:** `npx vitest run --project unit lib/machines/order.test.ts lib/machines/escrow.test.ts lib/machines/dispute.test.ts`

### Task 2: Immutable double-entry ledger

**Files:** Create `lib/ledger/index.ts`, `lib/ledger/index.test.ts`.

**Steps:** Test append-only postings, integer kobo, idempotency, non-negative balances, release/refund splits and the invariant across 10,000 deterministic randomized orders; then implement the smallest ledger API.

**Verification:** `npx vitest run --project unit lib/ledger/index.test.ts`

### Task 3: Order domain and persisted demo repository

**Files:** Create `features/orders/model.ts`, `features/orders/model.test.ts`, `features/orders/store.ts`, `features/orders/data.ts`.

**Steps:** Test release guards, seller isolation, refund failure recovery, countdown clock skew, review eligibility and dispute windows; implement demo fixtures and idempotent commands over strict browser persistence.

**Verification:** `npx vitest run --project unit features/orders/model.test.ts`

### Task 4: Orders list and detail experience

**Files:** Replace `app/(shop)/orders/page.tsx`; create `app/(shop)/orders/[id]/page.tsx`; create `features/orders/OrdersPage.tsx`, `OrderDetail.tsx`, `OrderTimeline.tsx`, `EscrowStatusCard.tsx`, `InspectionCountdown.tsx`; add `styles/marketplace/orders.css`; update `app/globals.css`.

**Steps:** Build Active/Completed/Cancelled/Returns views, order and money timelines, delivery proof/PIN, shared escrow copy, server-synced countdown and deliberate release confirmation with the R-212/R-243 sentence.

**Verification:** `npm run typecheck && npx eslint app/'(shop)'/orders features/orders`

### Task 5: Review and problem flows

**Files:** Create `app/(shop)/orders/[id]/review/page.tsx`, `problem/page.tsx`, `return/page.tsx`; create `features/orders/ReviewForm.tsx`, `ReportProblemWizard.tsx`, `DisputeTimeline.tsx`, `RefundTracker.tsx`.

**Steps:** Enforce completed-order review eligibility and one review per order; implement four problem steps, evidence requirements, frozen escrow, seller-response deadline, retryable refund failure and wallet recovery.

**Verification:** Focused unit tests and route type generation.

### Task 6: Accessibility, stories and browser acceptance

**Files:** Create `features/orders/Orders.stories.tsx`; create `e2e/orders.spec.ts`; update `lib/copy/escrow.test.ts`.

**Steps:** Test screen-reader status announcements, keyboard actions, copy parity, confirm/release, dispute freeze, refund recovery and review submission on mobile and desktop.

**Verification:** `npx playwright test e2e/orders.spec.ts --project=mobile --project=desktop --workers=1`

### Task 7: Documentation and full verification

**Files:** Modify `docs/marketplace/PROGRESS.md` and `features/placeholder/routes.ts`.

**Steps:** Record local acceptance and production boundaries; run `git diff --check` and `npm run check`.

**Verification:** `npm run check`
