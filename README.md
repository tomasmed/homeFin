# HomeFin 💰

HomeFin is an AI-powered financial transaction manager featuring a **FastAPI** backend and a **React + Vite + TypeScript** frontend.

This project is designed for local development using containers for the backend services and native Node.js for the frontend.

---

## Prerequisites & System Dependencies

Before setting up the project locally, ensure you have the following installed:

* **Node.js**: Version `^18.0.0 || >=20.0.0` (Node v24 is recommended).
* **Docker or Podman**: With `docker compose` or `podman-compose` support (to run the containerized backend).
* **Python**: Version `3.12` or higher (only needed if running tests or backend scripts natively).
* **Git**: For version control and branching.

---

## Project Structure

```
HomeFin/
├── backend/            # FastAPI Backend (Python)
├── frontend/           # React + Vite + TypeScript Frontend
├── docker-compose.yml  # Docker Compose config for the Backend
├── tests_api.py        # Backend API integration tests
└── CodingPractices.md  # Core development guidelines
```

---

## Local Setup & Launch Instructions

### 1. Launching the Backend (Containerized)

The backend is managed in a container to isolate dependencies. It uses a **SQLite** database configured via environment variables for fast and persistent local setup.

1. From the project root, create the local data directory for the SQLite volume mount:
   ```bash
   mkdir backend/data
   ```
2. Build and launch the container in detached mode:
   ```bash
   docker compose up -d
   ```
3. The backend API is now running and available at **[http://localhost:8000](http://localhost:8000)**.
4. The database is persistent and saved locally on the host under `backend/data/homefin.db`.

### Seeding the Database

To seed the database with realistic mock transactions, accounts, and categories:
1. Copy the seed script into the container:
   ```bash
   docker cp backend/seed.py homefin-backend-1:/app/seed.py
   ```
2. Run the seed script inside the container:
   ```bash
   docker exec homefin-backend-1 uv run python seed.py
   ```

To inspect the backend logs:
```bash
docker compose logs -f
```

---

### 2. Launching the Frontend (Native)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the frontend application at **[http://localhost:5173](http://localhost:5173)**.

---

## Verification & Quality Standards

Before committing changes or submitting a Pull Request, run the following verification steps:

### Frontend Checks
Navigate to the `frontend/` directory and run:
* **Type-Checking**: Ensure there are no TypeScript compiler errors:
  ```bash
  npm run typecheck
  ```
* **Linting**: Ensure code conforms to linting and style rules:
  ```bash
  npm run lint:check
  ```

### Backend Checks
From the project root, run the integration test suite:
```bash
python tests_api.py
```

---

## Contribution & Branching Guidelines

Please follow the rules established in `AGENTS.md` (and summarized in `CodingPractices.md`):
1. **Never commit directly to the `main` or `develop` branches.**
2. **Always create a feature branch** `feature/<name>` from the latest default branch.
3. Configure your Git user identity prior to committing if you are an AI agent.
4. Propose merge requests via Pull Requests starting with `🤖 [Agent]`.
