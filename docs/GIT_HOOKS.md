# Git Hooks

## What it does

A pre-commit hook runs `npm run preflight` automatically before each commit — but only when drift-relevant files are staged. This catches documentation drift (dead links, wrong version numbers, stale repo-facts) before it enters the repo.

Drift-relevant files:
- Any `.md` file
- `package.json`
- Anything in `scripts/`
- `.env.example`
- `data/repo-facts.json`

If none of these are staged, the hook does nothing and the commit proceeds instantly.

## Install (one-time)

```bash
bash scripts/install-git-hooks.sh
```

This tells git to use the `.githooks/` directory. The hook itself is tracked in the repo so every contributor gets the same check.

## Bypass (emergency only)

```bash
git commit --no-verify
```

This skips the hook entirely. Use only when you understand why the check is failing and need to commit anyway (e.g., fixing the audit script itself).
