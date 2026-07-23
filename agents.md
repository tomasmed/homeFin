# HomeFin Agent Guidelines

This document provides context and guidelines for AI agents working on the **HomeFin** repository.

## Contribution Guidelines & Branching Strategy

To ensure code quality and a clean git history, all contributors (including AI agents) must follow this branching strategy:

1. **Do not commit directly to the `main` branch.**
2. **Create a feature branch** for any new feature, bug fix, or modification.
   - Branch naming convention: `feature/<feature-name>` or `bugfix/<issue-name>`.
   - Base the feature branch off the latest `main` branch (or `develop` if `main` is not yet present/active, but target `main` for releases/PRs).
3. **Git Identity & Co-Authorship Attribution**: Commits retain the primary developer identity (`git config user.name "Tomas Medina"`, `git config user.email "tomasmed@umich.edu"`). Any commit created or modified by an AI Agent must append the Git trailer:
   ```git
   Co-authored-by: Antigravity Agent <antigravity-bot@users.noreply.github.com>
   ```
   This guarantees verified profile linking on GitHub while maintaining transparent side-by-side AI agent attribution on GitHub commit logs.
4. **Commit changes incrementally** with clear, descriptive commit messages.
5. **Run verification steps** (e.g., tests, type-checking, linting) locally before proposing merge.
6. **Propose a Pull Request (PR)** to merge the feature branch into `main`.
7. **Pull Request Attribution**: Because the agent uses the developer's credentials/token to create PRs, it will appear as if the developer created the PR. To make it clear that the agent is proposing the changes for review, the agent must:
   - Prefix the PR title with `🤖 [Agent]`.
   - Add a banner at the top of the PR description:
     ```markdown
     ### 🤖 Proposed by Antigravity Agent (AI Agent)

     This Pull Request was generated and proposed by **Antigravity Agent** using the developer's credentials.
     ```
8. **Wait for review and approval** from the repository owner before merging.

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
