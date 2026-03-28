#!/usr/bin/env bash
set -euo pipefail

REPO="jbburns/timezone-slider"
DEV_SERVER_PID=""
ORIGINAL_BRANCH=""

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# --- Cleanup on exit ---
cleanup() {
    echo
    info "Cleaning up..."
    if [[ -n "$DEV_SERVER_PID" ]] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        info "Stopping dev server (PID $DEV_SERVER_PID)..."
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        wait "$DEV_SERVER_PID" 2>/dev/null || true
    fi
    if [[ -n "$ORIGINAL_BRANCH" ]]; then
        info "Switching back to $ORIGINAL_BRANCH..."
        git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
    fi
    ok "Done."
}
trap cleanup EXIT

# --- Prerequisites ---
check_prerequisites() {
    info "Checking prerequisites..."

    # gh CLI
    if ! command -v gh &>/dev/null; then
        err "'gh' CLI not found. Please install it: https://cli.github.com/"
        exit 1
    fi
    if ! gh auth status &>/dev/null; then
        warn "'gh' is not authenticated. Running 'gh auth login'..."
        gh auth login
    fi

    # Node.js
    if ! command -v node &>/dev/null; then
        err "'node' not found. Please install Node.js."
        exit 1
    fi

    # node_modules
    if [[ ! -d "node_modules" ]]; then
        warn "node_modules not found. Running 'npm install'..."
        npm install
    fi

    # claude CLI
    if ! command -v claude &>/dev/null; then
        err "'claude' CLI not found. Please install it."
        exit 1
    fi

    ok "All prerequisites met."
}

# --- Start dev server ---
start_dev_server() {
    if [[ -n "$DEV_SERVER_PID" ]] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        return  # already running
    fi
    info "Starting dev server..."
    npm run dev &>/dev/null &
    DEV_SERVER_PID=$!
    sleep 3  # give it time to start
    ok "Dev server running (PID $DEV_SERVER_PID)"
}

# --- Open browser ---
open_browser() {
    info "Opening browser..."
    xdg-open "https://localhost:3000" 2>/dev/null || true
}

# --- Prompt for user action ---
# Returns: "accept", "reject", "skip", "abort"
prompt_verdict() {
    while true; do
        echo
        echo -e "${CYAN}What would you like to do?${NC}"
        echo "  [a] Accept - create PR and merge"
        echo "  [r] Reject - give feedback and retry"
        echo "  [s] Skip   - leave branch, move to next issue"
        echo "  [q] Abort  - exit script"
        read -rp "> " choice
        case "$choice" in
            a|A) echo "accept"; return ;;
            r|R) echo "reject"; return ;;
            s|S) echo "skip"; return ;;
            q|Q) echo "abort"; return ;;
            *) warn "Invalid choice. Enter a, r, s, or q." ;;
        esac
    done
}

# --- Prompt for rejection feedback ---
prompt_feedback() {
    echo
    echo -e "${YELLOW}What should Claude fix? (type your feedback, then press Enter)${NC}"
    read -rp "> " feedback
    echo "$feedback"
}

# --- Prompt after rejection: retry, skip, or abort ---
prompt_retry_action() {
    while true; do
        echo
        echo -e "${CYAN}Retry, skip, or abort?${NC}"
        echo "  [r] Retry with feedback"
        echo "  [s] Skip this issue"
        echo "  [q] Abort script"
        read -rp "> " choice
        case "$choice" in
            r|R) echo "retry"; return ;;
            s|S) echo "skip"; return ;;
            q|Q) echo "abort"; return ;;
            *) warn "Invalid choice. Enter r, s, or q." ;;
        esac
    done
}

# --- Run Claude on an issue ---
run_claude() {
    local issue_number="$1"
    local issue_title="$2"
    local issue_body="$3"
    local extra_feedback="${4:-}"

    local prompt="You are working on issue #${issue_number} in the repo ${REPO}.

## Issue: ${issue_title}

${issue_body}

## Instructions

1. Implement the changes described in the issue above.
2. Keep changes minimal — do NOT refactor unrelated code or add unrelated features.
3. Run the existing tests and make sure they pass.
4. Run 'npm run build' to verify the project compiles.
5. Commit your changes with a message that references issue #${issue_number}."

    if [[ -n "$extra_feedback" ]]; then
        prompt="${prompt}

## Additional Feedback from Review

The previous implementation was rejected. Here is the feedback:

${extra_feedback}

Please address this feedback in your implementation."
    fi

    info "Running Claude on issue #${issue_number}: ${issue_title}..."
    claude -p "$prompt" --allowedTools "Edit,Write,Read,Bash,Glob,Grep"
}

# --- Generate PR body with Claude ---
generate_pr_body() {
    local issue_number="$1"
    local issue_title="$2"
    local issue_body="$3"

    local prompt="Generate a concise pull request description for the following issue that was just implemented.

Issue #${issue_number}: ${issue_title}

${issue_body}

Write a short summary of the changes made, then include 'Fixes #${issue_number}' at the end.
Output ONLY the PR body text, nothing else. No markdown code fences."

    claude -p "$prompt" --allowedTools "Read,Glob,Grep,Bash"
}

# --- Main ---
main() {
    ORIGINAL_BRANCH=$(git branch --show-current)

    check_prerequisites

    # Fetch all open issues, oldest first
    info "Fetching open issues..."
    local issues
    issues=$(gh issue list --repo "$REPO" --state open --sort created --json number,title,body --limit 100 | \
        jq -c 'sort_by(.number) | .[]')

    if [[ -z "$issues" ]]; then
        ok "No open issues found. Nothing to do!"
        exit 0
    fi

    local issue_count
    issue_count=$(echo "$issues" | wc -l)
    info "Found ${issue_count} open issue(s)."

    local dev_server_started=false
    local current_issue=0

    while IFS= read -r issue_json; do
        current_issue=$((current_issue + 1))
        local number title body
        number=$(echo "$issue_json" | jq -r '.number')
        title=$(echo "$issue_json" | jq -r '.title')
        body=$(echo "$issue_json" | jq -r '.body // ""')
        local branch="issue-${number}"

        echo
        echo "=============================================="
        info "Issue ${current_issue}/${issue_count}: #${number} — ${title}"
        echo "=============================================="

        # Create branch off main
        git checkout main
        git pull --ff-only origin main 2>/dev/null || true
        git checkout -b "$branch"

        # Run Claude
        local feedback=""
        while true; do
            run_claude "$number" "$title" "$body" "$feedback"

            # Verify build independently
            info "Verifying build..."
            if npm run build &>/dev/null; then
                ok "Build passed."
            else
                err "Build failed after Claude's implementation."
                # Auto-retry: reset and let Claude try again
                warn "Auto-retrying due to build failure..."
                feedback="The build (npm run build) failed. Please fix the build errors."
                git checkout -- . 2>/dev/null || true
                git clean -fd 2>/dev/null || true
                continue
            fi

            # Start dev server if not already running
            if [[ "$dev_server_started" == false ]]; then
                start_dev_server
                open_browser
                dev_server_started=true
            fi

            # Get user verdict
            verdict=$(prompt_verdict)

            case "$verdict" in
                accept)
                    info "Creating PR for issue #${number}..."
                    git push -u origin "$branch"

                    pr_body=$(generate_pr_body "$number" "$title" "$body")
                    pr_url=$(gh pr create \
                        --repo "$REPO" \
                        --title "$title" \
                        --body "$pr_body" \
                        --base main \
                        --head "$branch")

                    ok "PR created: $pr_url"

                    info "Merging PR..."
                    gh pr merge "$pr_url" --repo "$REPO" --merge --delete-branch
                    ok "Merged and branch deleted."

                    git checkout main
                    git pull --ff-only origin main
                    break
                    ;;
                reject)
                    feedback=$(prompt_feedback)
                    action=$(prompt_retry_action)
                    case "$action" in
                        retry)
                            warn "Retrying with feedback..."
                            # Reset changes so Claude starts fresh
                            git checkout -- . 2>/dev/null || true
                            git clean -fd 2>/dev/null || true
                            continue
                            ;;
                        skip)
                            warn "Skipping issue #${number}."
                            git checkout main
                            break
                            ;;
                        abort)
                            warn "Aborting."
                            exit 0
                            ;;
                    esac
                    ;;
                skip)
                    warn "Skipping issue #${number}."
                    git checkout main
                    break
                    ;;
                abort)
                    warn "Aborting."
                    exit 0
                    ;;
            esac
        done
    done <<< "$issues"

    echo
    ok "All issues processed!"
}

main "$@"
