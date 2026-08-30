# Setu (MVP)

Cross-border trade + payment workflow demo for the India → Singapore export corridor.
Mock services only — no real bank, no real payment rail, no real money movement.

## Stack

- `/client` — React 18 + TypeScript + Vite + Tailwind CSS, TanStack Query, `src/api.ts` REST wrapper.
- `/server` — Node.js + Express + TypeScript, in-memory store seeded on boot.
- `/types` — shared domain types (npm workspace, imported by both client and server).

## Setup

```bash
npm install
npm run dev
```

- Server: http://localhost:4000 (health check at `/api/health`)
- Client: http://localhost:5173 (proxies `/api/*` to the server)

## Milestones

- **M0 — Scaffold** (done): monorepo, tooling, health check, shared types, minimal UI shell.
- **M1** — TradeOrder state machine, audit log, seed data.
- **M2** — Mock services (payment, escrow, fx, compliance/kyc) + REST endpoints.
- **M3** — Exporter workspace UI.
- **M4** — Buyer magic-link portal.
- **M5** — Admin/ops workspace.
- **M6** — Tests, polish, Render deploy.
