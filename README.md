# Setu (MVP)

Cross-border trade + payment workflow demo for the India → Singapore export corridor.
Mock services only — no real bank, no real payment rail, no real money movement.

## Stack

- `/client` — React 18 + TypeScript + Vite + Tailwind CSS, TanStack Query, React Router, `src/api.ts` REST wrapper.
- `/server` — Node.js + Express + TypeScript, in-memory store seeded on boot.
- `/types` — shared domain types (npm workspace, imported by both client and server).

## Setup

```bash
npm install
npm run dev
```

- Server: http://localhost:4000 (health check at `/api/health`)
- Client: http://localhost:5173 (proxies `/api/*` to the server)

Open http://localhost:5173 — it redirects to the exporter dashboard. Switch to
**Admin** via the top bar, or open a buyer's magic link (copy it from an
order's detail page, or from the orders list) to see the buyer portal.

## Verifying

```bash
npm run build          # typechecks + builds types, server, client
npm run test -w server # 29 tests: state machine, escrow lifecycle, FX math, full workflow
```

Click-through of the golden path:
1. **Admin** (`/admin`) → approve KYC if needed, note the seed data (7 active
   orders, 1 open dispute on XO-DISP06, 1 AML case, 1 unmatched VA credit).
2. **Exporter → Orders** → open a `Created` order (e.g. XO-DEMO01) → generate
   the invoice → generate all 4 shipping docs in order → "Mark payment
   awaited".
3. Copy the order's **buyer magic link** → open it (no login) → "Simulate
   payment (demo)" → funds move into escrow.
4. Back in the exporter view, "Mark shipped" (only enabled once all shipping
   docs are confirmed).
5. On the buyer link, "Confirm delivery" → this single action chains escrow
   release → FX settlement → compliance artefacts filed → order Completed,
   entirely from mock services, all visible in **Admin → Audit trail**.
6. Try the dispute path on another `InEscrow`/`Shipped` order from the buyer
   link, then resolve it (back into flow) or refund it from the order's
   detail page.
7. **Admin → Reset demo data** restores the original seed at any time.

## Production build / Render deploy

Single-service deploy: the server serves both the API and the built client.

```bash
npm run build
npm run start   # node server/dist/index.js, serves client/dist + /api/*
```

`render.yaml` configures this as a single Render web service
(`npm install && npm run build` / `npm run start`, health check on
`/api/health`).

## Domain model

`TradeOrder` state machine (the spine):

```
Created → PaymentAwaited → InEscrow → Shipped → DeliveryConfirmed → FxSettled → Completed
                               │
                               └──> Disputed ──> (resolved → back into flow) | Refunded
```

Every transition goes through `server/src/domain/orderStateMachine.ts` (pure,
guarded, throws on illegal jumps) via `orderService.transitionOrder`, which
always appends an immutable `AuditEvent`. Mock services — `PaymentGateway`,
`EscrowService`, `FxService`, `ComplianceService`, `KycService`, `Notifier` —
each live behind a TypeScript interface in `server/src/services/interfaces`,
with mock implementations in `server/src/services/mocks`, composed once in
`server/src/services/container.ts` so a real integration can swap in later
without touching call sites.

## REST endpoints

All endpoints from the spec, plus two small additive ones needed to make the
UI work (`buyerToken` on `TradeOrder` for the magic link, and
`GET /api/exporter/buyers` for the new-order buyer picker):

```
GET  /api/health
GET  /api/orders                              (status filter + search)
GET  /api/orders/:ref
POST /api/orders
POST /api/orders/:ref/transition
GET  /api/exporter/dashboard
GET  /api/exporter/virtual-account
GET  /api/exporter/buyers
POST /api/orders/:ref/invoice
POST /api/orders/:ref/shipping-docs/:type/generate
GET  /api/buyer/:token
POST /api/buyer/:token/pay
POST /api/buyer/:token/confirm
POST /api/buyer/:token/dispute
GET  /api/admin/overview
POST /api/admin/kyc/:id/approve
POST /api/admin/reset
```

## Milestones

- **M0 — Scaffold** (done): monorepo, tooling, health check, shared types, minimal UI shell.
- **M1 — Domain spine** (done): TradeOrder state machine, audit log, seed data driven through real transitions.
- **M2 — Mock services + REST API** (done): PaymentGateway, EscrowService, FxService, ComplianceService, KycService, Notifier; every endpoint wired.
- **M3 — Exporter workspace** (done): dashboard, orders list/detail, new order, shipping-docs flow, invoice generator, onboarding, virtual SGD account.
- **M4 — Buyer portal** (done): no-login magic-link page — pay, see escrow, confirm delivery, raise a dispute.
- **M5 — Admin/ops** (done): KYC queue, escrow SLA monitoring, AML/screening, unmatched VA-credit reconciliation, privileged audit trail, persistent DEMO MODE bar.
- **M6 — Tests, polish, deploy** (done): FSM + escrow + FX + full-workflow tests (29 total), single-service production serving, `render.yaml`.

## Known limitations (MVP scope)

- No visual/browser testing was performed on the UI in this session (built,
  typechecked, and served correctly; click through it yourself before
  relying on it).
- No real auth — role switch is just navigation; the buyer portal's only
  "auth" is the unguessable token in the URL, per spec.
- "Received this month" / "FX saved this month" on the dashboard are computed
  live from FX settlements that happen during the current server session
  (the seed's one pre-completed order predates any live FX quote, so it
  doesn't contribute — this is intentional, not a bug).
