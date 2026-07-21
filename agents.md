# HomeFin Agent Guidelines

This document provides context and guidelines for AI agents working on the **HomeFin** repository.

## Contribution Guidelines & Branching Strategy

To ensure code quality and a clean git history, all contributors (including AI agents) must follow this branching strategy:

1. **Do not commit directly to the `main` branch.**
2. **Create a feature branch** for any new feature, bug fix, or modification.
   - Branch naming convention: `feature/<feature-name>` or `bugfix/<issue-name>`.
   - Base the feature branch off the latest `main` branch (or `develop` if `main` is not yet present/active, but target `main` for releases/PRs).
3. **Git Identity Attribution**: Any agent or harness contributing changes must attribute commits to itself. Configure `git config user.name` and `git config user.email` to identify the agent before committing, and restore the original user configuration afterwards.
4. **Commit changes incrementally** with clear, descriptive commit messages.
5. **Run verification steps** (e.g., tests, type-checking, linting) locally before proposing merge.
6. **Propose a Pull Request (PR)** to merge the feature branch into `main`.
7. **Wait for review and approval** from the repository owner before merging.

## Project Stack & Structure

- **Backend**: FastAPI (Python 3) using SQLModel and SQLAlchemy.
  - Located in: [/backend](file:///c:/projects/HomeFin/backend)
  - Key entry point: [backend/main.py](file:///c:/projects/HomeFin/backend/main.py)
- **Frontend**: React + Vite + TypeScript.
  - Located in: [/frontend](file:///c:/projects/HomeFin/frontend)
  - Styling: Tailwind CSS (utility-first).
- **Core Coding Practices**: Refer to [CodingPractices.md](file:///c:/projects/HomeFin/CodingPractices.md) for detailed frontend types, styling, quality checks, and testing requirements.

## Verification Checklist

Before proposing a merge PR into `main`:
- [ ] For backend: Ensure syntax is clean, import errors are resolved, and the FastAPI server starts without operational issues.
- [ ] For frontend: Run type checks and lint checks in the `frontend` directory:
  ```bash
  npm run typecheck && npm run lint:check
  ```
- [ ] Manual check: Run backend & frontend locally to verify UI changes/interactions.
