Product

Setu is an MVP demo of a cross-border trade + payment workflow platform for the India → Singapore export corridor, aimed at Indian MSME exporters. It reproduces the Xinto reference demo end to end. It uses mock services only — no real money, no real bank, no external APIs. It must run locally and deploy to Render.

The product solves three exporter pains: opaque 3-day payment black holes, 3–4% bank FX spread, and the buyer↔seller trust gap — via a virtual SGD account + escrow + automated compliance, replicating a Letter of Credit at a fraction of the cost.

Tech stack (MVP)
Frontend: React 18 + TypeScript + Vite + Tailwind CSS. TanStack Query for server state. A single client/src/api.ts wraps all REST calls.
Backend: Node.js + Express + TypeScript. In-memory data store, seeded on boot (designed to swap to SQLite/Postgres later).
Monorepo: /client, /server, /types (shared domain types), npm workspaces, one npm run dev starting both.
Auth (MVP): demo role switch (exporter / buyer / admin); buyer portal reached by an unguessable magic-link token. No real password auth yet.
Deploy: Render (single service or static-site + web-service).

(If you prefer the PRD's committed enterprise stack for the MVP: backend = Spring Boot 3 + Java 21, in-memory repositories behind interfaces, Maven, package-by-feature. Domain model, states, endpoints, and screens below are unchanged.)

Architecture principles
Modular monolith. Keep each mock service (payment, escrow, fx, compliance/kyc, notifier) behind a TypeScript interface so it can later be swapped for a real integration. Business logic lives in service modules, never in controllers or components.
Every state change is audited to an append-only log. The audit trail is immutable.
Types are shared from /types. No any. Small, typed components.
Three workspaces (role-based, switched via a demo top-bar picker)
Exporter (persona: Rajesh, company Mehta Knitwear Exports Pvt Ltd, Tirupur, Textile): dashboard, orders list, order detail, new order, invoice generator, shipping-documents flow, onboarding wizard, virtual SGD account view.
Buyer (persona: Harbour Fashion SG and others): a no-login magic-link portal — pay into the virtual account, see funds in escrow, confirm delivery, or raise a dispute.
Admin / Ops: KYC review queue, escrow SLA monitoring, AML/screening, unmatched VA-credit reconciliation, an immutable privileged audit trail, and a persistent "DEMO MODE — Reset demo data — Refresh" bar.
Core domain object: TradeOrder — state machine (the spine)
Created → PaymentAwaited → InEscrow → Shipped → DeliveryConfirmed → FxSettled → Completed
                               │
                               └──> Disputed ──> (resolved → back into flow) | Refunded

Enforce valid transitions with guards; reject illegal jumps. Every successful transition appends an AuditEvent.

Domain entities
Exporter: companyName, gstin, iec, msmeUdyam, city, industry, kycStatus, linkedBankAccount, virtualAccount.
Buyer: name, country, email, contactId.
TradeOrder: reference (e.g. XO-DEMO01), buyerId, product, quantity, amountSgd, incoterm (FOB/CIF/EXW), hsCode, paymentTerms (TT/LC/DP/DA), status, createdAt, updatedAt, shippingDocs[], disputeId?.
VirtualAccount: accountNo (SGD7788123456), bankName (MAS Partner Bank (Demo)), swift (XINT0SGSXXX), escrowBalanceSgd.
EscrowPosition: orderId, amountSgd, status (Held/Released/Refunded/Disputed), events[].
Invoice: invoiceNo, orderId, from, billTo, lineItems[], subtotal, totalDue, paymentInstructions, status (Draft/Sent).
ShippingDoc: type (packing_list | bill_of_lading | certificate_of_origin | shipping_bill_leo), status (pending|generated|confirmed); completed strictly in that order.
Dispute: orderId, reason (goods_not_received|damaged|quantity_mismatch|quality_issue), status (Open/Resolved), openedBy.
ComplianceArtefact: orderId, type (EDPMS|FIRC|eBRC), status (Pending Ad Bank Ack | Filed | Issued).
ScreeningCase: entityName, list, status (Needs_review|Cleared|Blocked), note.
AuditEvent: when, event (e.g. status.in_escrow), actor (exporter|buyer|system|mock_bank|seed|ops), entity (e.g. TradeOrder:xxxx), privileged (bool).
FxQuote: rateSgdInr, spreadPct (0.5), feeInr, netInr, savedVsBankInr.
Mock services (each behind an interface)
PaymentGateway — simulates the bank webhook when a buyer "pays"; moves funds into escrow.
EscrowService — state machine: hold → condition check → release / refund / dispute; immutable event log.
FxService — SGD/INR base rate ~63 with small per-quote jitter; applies Setu's transparent 0.5% spread; computes fee, net INR, and "saved vs bank" assuming a 3.5% bank spread.
ComplianceService + KycService — auto-approve KYC in demo; produce mock EDPMS filing, e-FIRC, eBRC, and AML/watchlist screening.
Notifier — console/no-op in MVP (Twilio/WATI/email later).
Seed dataset (loaded on boot; POST /api/admin/reset restores it)
Exporter: Mehta Knitwear Exports Pvt Ltd — GSTIN 33AABCM1234A1Z5, IEC AABCM1234A, MSME UDYAM-TN-03-0012345, Tirupur, Textile; KYC approved; virtual account SGD7788123456; escrow balance SGD 152,900.
Buyers: Harbour Fashion SG, Lion City Retail Pte Ltd, Orchid Home Living, Pacific Softgoods Pte Ltd.
8 trade orders:
Ref	Buyer	Product	Amount	Status
XO-DRAFT08	Orchid Home Living	Sample pack — mixed knits	SGD 9,800	Created
XO-DONE07	Pacific Softgoods	Jersey dresses — 3,200 pcs	SGD 41,800	Completed
XO-DISP06	Harbour Fashion SG	Fleece hoodies — 2,400 pcs	SGD 22,100	Disputed
XO-SHIP05	Lion City Retail	Ribbed tank tops — 9,600 pcs	SGD 33,400	Shipped
XO-DOCS04	Orchid Home Living	Home textile cushion covers — 6,000 pcs	SGD 15,600	InEscrow
XO-ESCROW03	Pacific Softgoods	Polyester blend polos — 18,000 pcs	SGD 72,000	InEscrow
XO-AWAIT02	Harbour Fashion SG	Organic cotton kidswear	SGD 28,500	PaymentAwaited
XO-DEMO01	Lion City Retail	Cotton knit T-shirts — 12,000 pcs	SGD 50,000	Created
Matching escrow positions; one open dispute on XO-DISP06; compliance artefact EDPMS on XO-DONE07 (Pending Ad Bank Ack); one AML case (Shah Pharma Exports, watchlist, Needs_review); one unmatched VA credit (SGD 2,500, "Unknown SG Remitter"); a privileged audit trail.
Dashboard headline figures: In Escrow SGD 152,900, Received this month ₹ 2,610,410, Active orders 7, FX saved this month ₹ 52,250.
Design language (match the reference)
Calm SaaS look: white cards on light-grey bg, generous padding, rounded corners, subtle borders. Teal/cyan primary accent (~
#0e7c86); dark navy for the primary CTA on the shipping-docs screen.
Status pills: Created = teal, Payment Awaited = amber, In Escrow = amber, Shipped = teal, Completed = green, Disputed = red.
Left "MODULES" sidebar (Dashboard, Orders, New order, Onboarding; Virtual SGD for exporter). Top bar with search + account chip.
Money: SGD as SGD 50,000; INR as ₹ 2,610,410; FX-saved in INR. Mobile-friendly (exporter portal must work on a phone).
REST endpoints

GET /api/health · GET /api/orders (status filter + search) · GET /api/orders/:ref · POST /api/orders · POST /api/orders/:ref/transition · GET /api/exporter/dashboard · GET /api/exporter/virtual-account · POST /api/orders/:ref/invoice · POST /api/orders/:ref/shipping-docs/:type/generate · GET /api/buyer/:token · POST /api/buyer/:token/pay · POST /api/buyer/:token/confirm · POST /api/buyer/:token/dispute · GET /api/admin/overview · POST /api/admin/kyc/:id/approve · POST /api/admin/reset.

Coding standards & guardrails
TypeScript strict; no any; shared types from /types.
Controllers thin; logic in services; services behind interfaces.
Every state transition goes through the state-machine module and writes an audit event. No direct status mutation.
Never create a real bank integration, real payment rail, or move real money in the MVP. All money movement is simulated.
Write tests for: the TradeOrder state machine (valid path + rejected illegal transitions), escrow lifecycle, and FX math (spread, fee, saved-vs-bank).
After each milestone, output: the commands to run, and a short "click this to verify" script. Then stop.
Commit after each green milestone with a clear message.
Definition of done (MVP)

All three workspaces work; a buyer can pay → funds show in escrow → exporter completes shipping docs → marks shipped → buyer confirms → escrow releases → FX settles → INR credited → compliance artefacts generated → order Completed, with every step visible in the audit trail; dispute path works; admin reset restores the seed; app deploys to Render.