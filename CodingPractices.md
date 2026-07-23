# HomeFin Coding Practices
## Overview
This document captures the coding patterns and best practices established in the HomeFin project (FastAPI backend + React frontend).
---
## Project Structure
### Directory Layout
```
homeFin/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/        # Configuration and utilities
│   │   ├── models/      # SQLAlchemy/SQLModel ORM models
│   │   └── routers/     # API route handlers
│   ├── main.py          # Application entry point
│   └── Dockerfile
└── frontend/            # React + Vite frontend
    └── src/
        ├── components/   # React components
        ├── hooks/        # Custom React hooks
        ├── lib/          # Utilities and helpers
        ├── types/        # TypeScript type definitions
        └── ...
```
### Frontend Type Definitions

**Separate domain types from API types:**
- Domain: core business entities (Account, Transaction)
- API: response formats (AccountsResponse)
- Hooks: Query hook return types

### Frontend Styling
**Use Tailwind CSS (not CSS v4):**
- Utility-first classes
- Prefer `bg-white`, `border-gray-200`, `rounded-xl`, `shadow-sm`
- Responsive classes when needed

### 1. Code Quality
**Always run after frontend changes to verify types, linting, and rendering build:**
```bash
npm run test
```

### 2. Testing Philosophy
- Frontend: `npm run test` in `frontend/` (verifies `typecheck`, `lint:check`, and Vite production `build`).
- Backend: `uv run pytest tests` in `backend/` (verifies SQLModel schemas, API routes, and PDF parser logic).
- FastAPI auto-generates docs at `/docs`

### Development Workflow
1. **Plan** - Document approaches in `./Planning/` or implementation plans.
2. **Verify** - Run `npm run test` in `frontend/` and `uv run pytest tests` in `backend/`.
3. **Document** - Create markdown for new patterns
4. **Test via curl** - `curl http://localhost:8000/v1/api/...`


**Frontend (local):**
- Vite dev server at `localhost:5173`
- API URL in `api.ts` (default to localhost:8000)

### Type Safety
- Shared types between backend (Pydantic) and frontend (TS)
- Map Pydantic models to TS interfaces
- Use type guards for complex types