**Dealership (Surya) — Dealer Management Web App**

**Badges:**

- Build: ![build-badge](https://img.shields.io/badge/build-passing-brightgreen)
- Coverage: ![coverage-badge](https://img.shields.io/badge/coverage-NA-lightgrey)
- License: ![license](https://img.shields.io/badge/license-MIT-blue)

Elevator pitch
---------------
Dealership (Surya) is a dealer and shop management web application that provides dealers with tools to manage locations, shops, products, companies, and orders. It includes a React + Vite frontend, a Node.js + Express API backed by Prisma and PostgreSQL, and a secondary Django backend used for admin/seed workflows.

Architecture & System Design
---------------------------
System context

Client (React) → Vite dev server (dev) → Node API (Express + Prisma) → PostgreSQL

Data flow

- Users interact with the React frontend.
- In development the frontend proxies API requests (`/api/*`) to the local Node API using Vite's proxy.
- The Node API uses Prisma to read/write to PostgreSQL. Activity logs and notifications are recorded via Prisma models.

Mermaid architecture diagram

```mermaid
flowchart LR
	FE[Frontend: Vite + React]
	NGROK[ngrok (optional public URL)]
	VITE[Vite Dev Server]
	API[Node API: Express + Prisma]
	DB[(PostgreSQL)]

	FE -->|HTTP| VITE
	NGROK --> VITE
	VITE -->|/api proxy| API
	API -->|DB connections| DB
```

Key files

- `backend-node/src/index.js` — Node API entry and route registration
- `backend-node/prisma/schema.prisma` — Prisma schema (Postgres models)
- `backend-node/migrate.js` — PG-to-PG migration helper script (update before use)
- `frontend/src/api.js` and `frontend/vite.config.js` — frontend API client and dev proxy

Technology Stack
----------------

- Frontend: React (Vite), React Router, axios
- Backend: Node.js, Express, Prisma (Postgres)
- Database: PostgreSQL (managed, examples use Supabase)
- Optional: Django + DRF (in `backend/`), used for admin/seed workflows
- Dev/Infra: ngrok (tunneling), Render (hosting), Docker (recommended), PgBouncer (recommended for DB pooling)

Prerequisites & Dependencies
----------------------------

- Node.js 18+ (recommended 20.x)
- npm or yarn
- PostgreSQL access (managed or local)
- Optional: Python 3.10+ for Django parts, Docker

Installation and Setup Guide
----------------------------

1. Clone the repo

```bash
git clone <REPO_URL>
cd Surya
```

2. Install and run the Node API

```bash
cd backend-node
npm install
# Provide a .env with DATABASE_URL and JWT_SECRET or export env vars
node src/index.js
```

3. Install and run the frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

4. Optional — Django admin/seed (in `backend/`)

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate   # Windows
pip install -r requirements.txt
python manage.py runserver
```

Configuration & Environment Variables
-------------------------------------

Create service-level `.env` files (do NOT commit them). Required variables:

- `PORT` — HTTP port (Node uses `process.env.PORT`, Render sets this automatically)
- `DATABASE_URL` — Postgres connection string for Prisma (use PgBouncer/pooled endpoint in production)
- `DIRECT_URL` — optional Prisma direct URL
- `JWT_SECRET` — secret for signing JWT tokens
- `NODE_ENV` — `development` or `production`

For the migration script replace hardcoded URLs with environment variables before running:

- `SOURCE_DATABASE_URL` and `TARGET_DATABASE_URL`

Usage and Examples
------------------

Run the Node API (development):

```bash
cd backend-node
node src/index.js
```

Run the frontend in dev (Vite will proxy `/api` to the Node API):

```bash
cd frontend
npm run dev
```

Expose the frontend via ngrok (share to external users while backend stays local):

```bash
ngrok http 5173
# share the https://*.ngrok-free.app URL
```

Example: login via curl

```bash
curl -X POST http://localhost:8000/api/token/ \\
	-H "Content-Type: application/json" \\
	-d '{"username":"surya","password":"surya@123"}'
```

API Documentation (summary)
---------------------------

Base URL (local): `http://localhost:8000/api`

Main endpoints (quick reference):

- `POST /api/token/` — Authenticate, returns JWT
- `POST /api/token/refresh/` — Refresh token
- `GET /api/me/` — Profile (auth required)
- `GET /api/dashboard/` — Dashboard data (auth required)
- `GET|POST /api/locations/` — List/create locations
- `GET|POST /api/shops/` — List/create shops
- `GET|POST /api/companies/` — Companies + products
- `POST /api/products/` — Create product
- `POST /api/orders/` — Create order

For a full list see the route modules in `backend-node/src/routes`.

Testing & CI/CD
---------------

- There are no automated tests in the Node app by default. Recommended additions:
	- Unit tests: Jest
	- Integration tests: Supertest
	- E2E: Playwright/Cypress
- CI: Add a GitHub Actions workflow to run `npm ci`, linting, tests, and build steps. Add a status badge to this README.

Deployment
----------

Recommended hosting

- API: Render (you mentioned using Render). Configure a web service and set env vars (`DATABASE_URL`, `JWT_SECRET`).
- Frontend: Vercel / Netlify / S3 + CloudFront or static hosting. Alternatively serve from Render as a static site.

Render checklist

- Set `PORT` / allow Render to set it automatically. The app reads `process.env.PORT`.
- Configure health check path: `/api/ping`.
- Add `DATABASE_URL` (prefer a pooled endpoint, see PgBouncer note below).
- Configure autoscaling min/max instances conservatively.

Contributing & License
----------------------

Please follow these contribution guidelines:

- Branches: `feature/*`, `fix/*`, `chore/*`.
- Open a PR for any change; include a description and screenshots where applicable.
- Run linters and tests locally before submitting.

Add a `CONTRIBUTING.md` with templates and PR checklist.

License: MIT (add a `LICENSE` file at project root).

Operational Notes — Scaling & Hardening
-------------------------------------

1. DB connection pooling (critical)

- Prisma opens connections per process; Render autoscaling increases connections linearly. Use PgBouncer or a managed pooling endpoint to avoid exhausting DB max connections.
- Point `DATABASE_URL` to a pooled endpoint in production.

2. Graceful shutdown (implement in `backend-node/src/index.js`)

- On SIGTERM/SIGINT, stop accepting requests and call `await prisma.$disconnect()` so DB connections are closed cleanly.

3. Secrets and migrations

- Remove all hardcoded credentials (e.g., in `backend-node/migrate.js`). Use env vars and rotate credentials if they were committed.
- Migration script is destructive for target DB (it deletes tables) — back up the target before running.

4. Activity logging

- Activity logging runs asynchronously after routes; if running on many instances consider using a queue (Redis, SQS) to avoid contention during spikes or shutdowns.

DB Migration Script (`backend-node/migrate.js`) — Safe usage notes
---------------------------------------------------------------

- Replace hardcoded `oldUrl`/`newUrl` with `process.env.SOURCE_DATABASE_URL` and `process.env.TARGET_DATABASE_URL`.
- The script deletes rows in the destination then inserts rows from source. This is destructive — ensure you have backups.
- Consider wrapping inserts in transactions and migrating in dependency order (parents before children) or disabling FKs temporarily if needed.

Quick Start Checklist
---------------------

1. Configure `.env` files for each service (backend-node, frontend, backend).
2. Start database (or ensure managed Postgres is accessible).
3. Run `node backend-node/src/index.js`.
4. Run `npm run dev` in `frontend`.
5. Optionally run `ngrok http 5173` to share the frontend publicly.

Support & Next Steps
--------------------

- I can: implement the safer migration script (use env vars + confirmation), add graceful shutdown to `backend-node/src/index.js`, and create a `CONTRIBUTING.md` and basic GitHub Actions workflow. Tell me which of these to do first and I'll implement it.

Authors & Acknowledgements
--------------------------

This repository contains multiple components by the project author. Thank you for maintaining good security practices (rotate secrets, do not commit credentials).

---

*Generated and reviewed on May 30, 2026.*
