# HomeFin - Personal Finance Management & Statement Parser

HomeFin is a modern personal finance application built with FastAPI (Python) and React (TypeScript + Vite). It features automatic bank PDF statement parsing, transaction tracking, category management, and account filtering.

---

## Features

- **Bank Statement Upload & PDF Parsing**: Upload PDF account statements; automatically extracts transactions and links them to `Statement` entities for account and statement-level filtering.
- **Financial Analytics & Dashboard**: Visual category summaries, account breakdown, and transaction logs.
- **Category Management**: Custom categories with icons and color pill badges.
- **REST API**: Built with FastAPI and SQLModel.

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Local Application UI: [http://localhost:5173](http://localhost:5173)

---

## Verification & Testing Workflow

To ensure high quality, zero runtime import errors, and full render validation before proposing changes:

### Frontend Validation Suite
Run the full frontend test suite:
```bash
cd frontend
npm run test
```
This single command executes three validation layers:
1. `npm run typecheck`: Strict TypeScript type checks (`tsc --noEmit`).
2. `npm run lint:check`: ESLint check enforcing React rules, hooks, and no-explicit-any policies.
3. `npm run build`: Production Vite build validating that all imports, assets, and component trees resolve correctly without runtime bundling failures.

### Backend Validation Suite
Run the backend pytest suite:
```bash
cd backend
uv run pytest tests
```
Validates SQLModel schema definitions, database queries, PDF extraction, statement text parsing algorithms, and FastAPI API routes.
