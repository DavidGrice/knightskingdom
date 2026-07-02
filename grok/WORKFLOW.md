# Grok Git Workflow

**Last updated:** 2026-06-30

## Rule for Grok sessions

After completing work on `grok-dev`, **always push to GitHub** so the VS Code repo can pull the same commits.

```powershell
git add <changed files>
git commit -m "..."
git push origin grok-dev
```

Do **not** leave commits only in the Grok sandbox worktree. The user works from VS Code on another machine/path and relies on `git pull` to sync.

## Repos and paths

| Location | Path | Role |
|----------|------|------|
| Grok sandbox (worktree) | `C:\Users\david\.grok\worktrees\knightskingdom-knightskingdom\knightskingdom` | Where Grok edits and commits |
| VS Code (user) | `D:\CODING\THREEJS\knightskingdom\knightskingdom` | Where user runs dev / merges |
| Remote | `https://github.com/DavidGrice/knightskingdom.git` | Sync bridge between both |

## Branches

| Branch | Purpose |
|--------|---------|
| `grok-dev` | All Grok modernization work — **push here** |
| `main` | Stable; user merges manually when ready |

## User sync (VS Code)

```powershell
cd D:\CODING\THREEJS\knightskingdom\knightskingdom
git checkout grok-dev
git pull origin grok-dev
```

If `git pull` says "already up to date" but changes are missing, Grok likely forgot to push — run `git fetch origin` and compare `git log -1` with the latest commit in `grok/CHANGELOG.md`.

## Grok session checklist

1. Read `grok/README.md`, `grok/WORKSHOP_3D.md` (if Phase 11), and `grok/ROADMAP.md`
2. Work on branch `grok-dev`
3. `npm run build` before committing
4. Commit with a clear message
5. **`git push origin grok-dev`** ← required
6. Update `grok/CHANGELOG.md` (and backlog docs if applicable)

## History

- **2026-06-28:** User asked to push by default. Previously commits were local-only; that caused `git pull` to report up to date while VS Code had no new commits.