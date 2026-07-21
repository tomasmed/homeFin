# HomeFin Agent Rules

This workspace-specific rules file is automatically loaded by the AI agent runtime. It guides agent behavior for code contributions, styles, and workflows in the HomeFin project.

## Contribution Guidelines & Branching Strategy

- **Branching**: Always create a feature branch (`feature/<name>`) from the default branch. Do not make direct changes or commit directly to the `main` or `develop` branches unless instructed.
- **Pull Requests**: Propose merging feature branches into `main` via PRs.
- **Verification**: Run frontend type checks and lint checks (`npm run typecheck && npm run lint:check`) before completing tasks or proposing changes.

## Codebase Preferences

- Refer to [CodingPractices.md](file:///c:/projects/HomeFin/CodingPractices.md) for coding styles and frontend type safety guidelines.
- Refer to [agents.md](file:///c:/projects/HomeFin/agents.md) for general onboarding instructions.
