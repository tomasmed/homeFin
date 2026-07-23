# HomeFin 💰

HomeFin is an AI-powered financial transaction manager featuring a **FastAPI** backend (Python) and a **React + Vite + TypeScript** frontend. It includes automatic bank PDF statement parsing, statement foreign-key data tracking, transaction management, visual analytics, and category breakdown.

---

## Features

- **Bank Statement Upload & PDF Parsing**: Upload PDF account statements; automatically extracts transactions and links them to `Statement` entities for statement-level filtering.
- **Financial Analytics & Dashboard**: Donut charts, category breakdown, progress bar lists, and account transaction grids.
- **Category Management**: Custom categories with icons and color pill badges.
- **REST API**: Built with FastAPI, SQLModel, and Pydantic.

---

## Prerequisites & System Dependencies

Before setting up the project locally, ensure you have the following installed:

* **Node.js**: Version `^18.0.0 || >=20.0.0` (Node v24 recommended).
* **Docker or Podman**: With `docker compose` or `podman-compose` support (to run containerized backend).
* **Python**: Version `3.12` or higher (for native backend execution & tests).
* **Git**: For version control and branching.

---

## Project Structure

```
HomeFin/
├── backend/            # FastAPI Backend (Python)
├── frontend/           # React + Vite + TypeScript Frontend
├── docker-compose.yml  # Docker Compose config for Backend
├── tests_api.py        # Backend API integration tests
└── CodingPractices.md  # Core development guidelines
```

---

## Local Setup & Launch Instructions

### 1. Launching the Backend (Containerized or Local)

#### Option A: Docker Compose
1. Create data directory:
   ```bash
   mkdir backend/data
   ```
2. Launch container:
   ```bash
   docker compose up -d
   ```
   API will be available at **[http://localhost:8000](http://localhost:8000)**.

#### Option B: Local Python Development
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

### 2. Launching the Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at **[http://localhost:5173](http://localhost:5173)**.

---

## Verification & Quality Standards

Before committing changes or submitting a Pull Request, run the full validation suites:

### Frontend Validation Suite
Navigate to `frontend/`:
```bash
npm run test
```
Executes three validation layers:
1. `npm run typecheck`: Strict TypeScript type checks (`tsc --noEmit`).
2. `npm run lint:check`: ESLint check enforcing React rules, hooks, and no-explicit-any policies.
3. `npm run build`: Production Vite build validating that all imports, assets, and component trees resolve correctly.

Additionally, verify dev server logs and browser console logs for zero runtime `TypeError` issues.

### Backend Validation Suite
Navigate to `backend/`:
```bash
uv run pytest tests
```
Validates SQLModel schema definitions, database queries, PDF extraction, statement text parsing algorithms, and FastAPI API routes.

---

## Contribution & Branching Guidelines

Please follow the rules established in `AGENTS.md` (and summarized in `CodingPractices.md`):
1. **Never commit directly to the `main` or `develop` branches.**
2. **Always create a feature branch** `feature/<name>` from the latest default branch.
3. Maintain developer git identity (`Tomas Medina <tomasmed@umich.edu>`) and append `Co-authored-by: Antigravity Agent <antigravity-bot@users.noreply.github.com>` for AI agent co-authorship.
4. Propose merge requests via Pull Requests starting with `🤖 [Agent]`.
