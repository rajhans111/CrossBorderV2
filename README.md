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

Open http://localhost:5173 — it opens the marketing landing page. Click
**Register** or **Login** (cosmetic demo gate — no real password auth, per
spec; submitting either just drops you into the exporter dashboard) to reach
the app. From there, switch to **Admin** via the top bar, or open a buyer's
magic link (copy it from an order's detail page, or from the orders list) to
see the buyer portal.

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

## Landing page, auth gate, and multi-currency

Beyond the original milestones, this now also has:

- **Marketing landing page** (`/`) modeled on the Xinto reference demo —
  hero, problem statement, how-it-works, features, FX comparison table,
  security, pricing, persona, FAQ, footer.
- **Login/Register** (`/login`, `/register`) — a **cosmetic** demo gate only.
  Per the spec's explicit "no real password auth yet" for this MVP, these
  forms don't validate or store anything; submitting either just navigates
  into the exporter dashboard. There is no session and no route guard —
  `/exporter/*` is still directly reachable.
- **Multi-currency**: SGD, USD, EUR, GBP, AED, AUD are all fully functional.
  `TradeOrder`/`EscrowPosition`/`Invoice`/`FxQuote` all carry a `currency`
  field; the exporter has one `VirtualAccount` per currency (seeded on
  boot); `FxService` has a per-currency base rate + jitter to INR. The 8
  original seed orders stay SGD, preserving the spec's exact literal figures
  (152,900 escrow, 7 active orders) — new orders can pick any of the six.

## Response to the "readiness review" (Aug 2026)

A third-party readiness review claimed Onboarding, Virtual Accounts, and Admin
were stuck permanently on "Loading…" due to wrong API calls. I verified this
directly against the live deployment before touching anything: all three
endpoints returned 200 with correct data, and the deployed bundle matched the
latest commit — the claim didn't reproduce. The review's broader proposal
(real JWT/RBAC auth, a MySQL three-database split, a versioned `/api/v1/*`
rewrite, splitting frontend/backend into two services) would reverse the
in-memory, mock-services-only, cosmetic-auth, single-service design this MVP
is explicitly built around, so it wasn't adopted wholesale. What *was* worth
adopting, and is now in place:

- **Structured API errors**: every error response is
  `{ error, code, meta: { requestId, timestamp } }` — `code` is one of
  `NOT_FOUND` / `VALIDATION_ERROR` / `ILLEGAL_TRANSITION` / `INTERNAL_ERROR`.
- **Visible retry on failure**: `QueryState` now renders a "Retry" button
  (wired to the query's `refetch`) instead of leaving a page stuck if a
  request fails — addresses the review's real underlying concern (undefined
  loading/error states) without restructuring every success response.
- **Richer audit trail**: `AuditEvent` gained optional `beforeState`,
  `afterState`, and `evidence` fields. State transitions, escrow lifecycle
  events, and KYC approval now record what changed and why (e.g. a dispute's
  audit entry captures the reason and who opened it) — the "evidence chain"
  the review asked for, without a schema rewrite.
- **Admin passcode gate**: `/admin` is no longer silently open to anyone with
  the URL. This is a **cosmetic** client-side gate, not real access control —
  the passcode is `11111`, and the field comes prefilled with it for a
  quicker demo click-through. It matches the same "no real auth backend"
  choice already made for Login/Register, just applied to `/admin` too.

## Magic links survive redeploys

Every buyer/order magic-link token (`buyerToken`, `portalToken`) is derived
deterministically from a stable value (the order reference, the buyer name)
via SHA-256, instead of `crypto.randomUUID()`. The in-memory store reseeds
from scratch on every server boot — a random token would silently go stale
on every redeploy or restart, breaking any link you'd bookmarked or shared
(e.g. in a slide deck). A deterministic token stays valid for a *seeded* demo
order forever, since re-seeding always regenerates the same token for the
same reference. This is not meant as real security — it's a stable-but-
guessable-if-you-know-the-scheme identifier, appropriate for a demo link, not
a production secret.

## Compliance artefacts, made visible

The final leg of the "definition of done" — EDPMS filed, e-FIRC and eBRC
issued — was always generated correctly by `ComplianceService.fileArtefacts()`
during `confirmDelivery`, but nothing in the UI ever displayed it: `getOrder`
didn't return the artefacts for that order, and neither the order detail page
nor the admin overview rendered the `complianceArtefacts` the admin API
already returned. Fixed on both ends — `GET /api/orders/:ref` now includes
`complianceArtefacts` (filtered to that order), the order detail page shows a
"Compliance" card once any exist, and admin overview lists every filing
platform-wide with its order reference. Verified live: pushed a fresh order
through the full lifecycle and confirmed EDPMS/FIRC/eBRC all appear correctly
in both places.

Filing order and status: `fileArtefacts()` files **FIRC → eBRC → EDPMS**
(matching the order the exporter reads them off in real life), all marked
**Issued** — it only ever runs after `SETTLE_FX`, i.e. once FX has settled
*and* delivery is confirmed, never earlier. The one exception is the seed's
historical `XO-DONE07`, which keeps its literal spec-given fact — EDPMS
`Pending Ad Bank Ack` — since that's a static snapshot of a pre-existing
order, not something the live filing flow produced.

## Known limitations (MVP scope)

- No visual/browser testing was performed on the UI in this session (built,
  typechecked, and served correctly; click through it yourself before
  relying on it).
- Login/Register are cosmetic only (see above) — this was an explicit choice
  to match the spec's MVP auth constraint rather than build real accounts.
- "Received this month" / "FX saved this month" on the dashboard are computed
  live from FX settlements that happen during the current server session
  (the seed's one pre-completed order predates any live FX quote, so it
  doesn't contribute — this is intentional, not a bug).
