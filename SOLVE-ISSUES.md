# solve-issues.sh Design

## Overview
Bash script that pulls all open GitHub issues, implements them using Claude, and allows local testing before creating PRs.

## Workflow

### Prerequisites Check (startup)
- `gh` CLI installed and authenticated — prompts `gh auth login` if needed
- `node_modules` exists — runs `npm install` if missing
- `claude` CLI available

### Per Issue (oldest first)
1. Create branch `issue-N` off `main`
2. Run `claude -p` with structured prompt:
   - Implement the issue
   - Run tests
   - Run `npm run build`
   - Commit referencing the issue number
   - Keep changes minimal — no unrelated refactoring
3. Script verifies `npm run build` independently — auto-retries on failure
4. Start dev server (kept running across issues), open browser via `xdg-open`
5. Prompt user: **accept / reject / skip / abort**

### On Accept
- Create PR (title from issue title, Claude-generated body with `Fixes #N`)
- Merge branch into `main`
- Close the issue
- Move to next issue

### On Reject
- Prompt for feedback
- Send Claude back to retry with feedback
- After each rejection, user chooses: retry / skip / abort

### On Skip
- Leave branch as-is, move to next issue

### On Abort
- Exit the script entirely

## Dev Server
- Started once, kept running across issues (HMR picks up changes)
- Killed on script exit

## Ctrl+C Handling
- Kill dev server
- Switch back to `main`
- Leave in-progress branch as-is

## Script Details
- **Name:** `solve-issues.sh`
- **Location:** repo root
- **Issue ordering:** oldest first (lowest issue number)
- **Branch strategy:** one branch per issue off `main`
- **Browser:** opened via `xdg-open http://localhost:3000`
