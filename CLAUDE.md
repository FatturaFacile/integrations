# Claude Code Instructions

@AGENTS.md

- **Claude Override**: Enforce [AGENTS.md](AGENTS.md) as the sole source of truth; run worktree tasks against `dev` only (never `main`, never `gh pr`) and clean up `.claude/worktrees/` and merged branches after pushing `dev`.
