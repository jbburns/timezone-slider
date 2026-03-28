import { execSync, spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';

// --- Types ---

export interface Issue {
  number: number;
  title: string;
  body: string;
}

export type Verdict = 'accept' | 'reject' | 'skip' | 'abort';
export type RetryAction = 'retry' | 'skip' | 'abort';

// --- Shell execution ---

export function exec(cmd: string, opts?: { silent?: boolean }): string {
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: opts?.silent ? 'pipe' : 'inherit',
    });
    return result?.trim() ?? '';
  } catch (e: unknown) {
    if (opts?.silent) {
      const err = e as { stdout?: string };
      return err.stdout?.trim() ?? '';
    }
    throw e;
  }
}

export function execCapture(cmd: string): string {
  return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
}

// --- Colors ---

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN = '\x1b[0;36m';
const NC = '\x1b[0m';

export function info(msg: string): void { console.log(`${CYAN}[INFO]${NC} ${msg}`); }
export function ok(msg: string): void { console.log(`${GREEN}[OK]${NC} ${msg}`); }
export function warn(msg: string): void { console.log(`${YELLOW}[WARN]${NC} ${msg}`); }
export function err(msg: string): void { console.log(`${RED}[ERROR]${NC} ${msg}`); }

// --- Readline prompt ---

function createRL(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// --- Prerequisites ---

export function checkCommand(cmd: string): boolean {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function checkGhAuth(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function nodeModulesExist(): boolean {
  try {
    execSync('test -d node_modules', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function checkPrerequisites(): void {
  info('Checking prerequisites...');

  if (!checkCommand('gh')) {
    err("'gh' CLI not found. Please install it: https://cli.github.com/");
    process.exit(1);
  }
  if (!checkGhAuth()) {
    warn("'gh' is not authenticated. Running 'gh auth login'...");
    exec('gh auth login');
  }

  if (!checkCommand('node')) {
    err("'node' not found. Please install Node.js.");
    process.exit(1);
  }

  if (!nodeModulesExist()) {
    warn("node_modules not found. Running 'npm install'...");
    exec('npm install');
  }

  if (!checkCommand('claude')) {
    err("'claude' CLI not found. Please install it.");
    process.exit(1);
  }

  ok('All prerequisites met.');
}

// --- GitHub ---

const REPO = 'jbburns/timezone-slider';

export function fetchIssues(): Issue[] {
  const raw = execCapture(
    `gh issue list --repo ${REPO} --state open --json number,title,body --limit 100`
  );
  const issues: Issue[] = JSON.parse(raw);
  issues.sort((a, b) => a.number - b.number);
  return issues;
}

export function buildClaudePrompt(issue: Issue, feedback?: string): string {
  let prompt = `You are working on issue #${issue.number} in the repo ${REPO}.

## Issue: ${issue.title}

${issue.body ?? ''}

## Instructions

1. Implement the changes described in the issue above.
2. Keep changes minimal — do NOT refactor unrelated code or add unrelated features.
3. Run the existing tests and make sure they pass.
4. Run 'npm run build' to verify the project compiles.
5. Commit your changes with a message that references issue #${issue.number}.`;

  if (feedback) {
    prompt += `

## Additional Feedback from Review

The previous implementation was rejected. Here is the feedback:

${feedback}

Please address this feedback in your implementation.`;
  }

  return prompt;
}

export function buildPrBodyPrompt(issue: Issue): string {
  return `Generate a concise pull request description for the following issue that was just implemented.

Issue #${issue.number}: ${issue.title}

${issue.body ?? ''}

Write a short summary of the changes made, then include 'Fixes #${issue.number}' at the end.
Output ONLY the PR body text, nothing else. No markdown code fences.`;
}

export function runClaude(issue: Issue, feedback?: string): void {
  const prompt = buildClaudePrompt(issue, feedback);
  info(`Running Claude on issue #${issue.number}: ${issue.title}...`);
  exec(`claude -p ${JSON.stringify(prompt)} --allowedTools "Edit,Write,Read,Bash,Glob,Grep"`);
}

export function generatePrBody(issue: Issue): string {
  const prompt = buildPrBodyPrompt(issue);
  return execCapture(`claude -p ${JSON.stringify(prompt)} --allowedTools "Read,Glob,Grep,Bash"`);
}

export function verifyBuild(): boolean {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function gitCheckout(branch: string): void {
  exec(`git checkout ${branch}`, { silent: true });
}

export function gitCreateBranch(branch: string): void {
  exec(`git checkout -b ${branch}`, { silent: true });
}

export function gitPullMain(): void {
  try {
    execSync('git pull --ff-only origin main', { stdio: 'pipe' });
  } catch {
    // Ignore if remote not available
  }
}

export function gitResetChanges(): void {
  try { execSync('git checkout -- .', { stdio: 'pipe' }); } catch { /* empty */ }
  try { execSync('git clean -fd', { stdio: 'pipe' }); } catch { /* empty */ }
}

export function pushAndCreatePr(issue: Issue, branch: string): string {
  exec(`git push -u origin ${branch}`);

  const prBody = generatePrBody(issue);
  const prUrl = execCapture(
    `gh pr create --repo ${REPO} --title ${JSON.stringify(issue.title)} --body ${JSON.stringify(prBody)} --base main --head ${branch}`
  );
  return prUrl;
}

export function mergePr(prUrl: string): void {
  exec(`gh pr merge ${JSON.stringify(prUrl)} --repo ${REPO} --merge --delete-branch`);
}

// --- Dev server ---

let devServerProcess: ChildProcess | null = null;

export function startDevServer(): void {
  if (devServerProcess && !devServerProcess.killed) return;
  info('Starting dev server...');
  devServerProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    detached: false,
  });
  ok(`Dev server running (PID ${devServerProcess.pid})`);
}

export function stopDevServer(): void {
  if (devServerProcess && !devServerProcess.killed) {
    info(`Stopping dev server (PID ${devServerProcess.pid})...`);
    devServerProcess.kill();
    devServerProcess = null;
  }
}

export function openBrowser(): void {
  info('Opening browser...');
  try {
    execSync('xdg-open https://localhost:3000', { stdio: 'ignore' });
  } catch {
    // Ignore if browser can't open
  }
}

// --- Interactive prompts ---

export async function promptVerdict(rl: readline.Interface): Promise<Verdict> {
  while (true) {
    console.log();
    console.log(`${CYAN}What would you like to do?${NC}`);
    console.log('  [a] Accept - create PR and merge');
    console.log('  [r] Reject - give feedback and retry');
    console.log('  [s] Skip   - leave branch, move to next issue');
    console.log('  [q] Abort  - exit script');
    const choice = await ask(rl, '> ');
    switch (choice.toLowerCase()) {
      case 'a': return 'accept';
      case 'r': return 'reject';
      case 's': return 'skip';
      case 'q': return 'abort';
      default: warn('Invalid choice. Enter a, r, s, or q.');
    }
  }
}

export async function promptFeedback(rl: readline.Interface): Promise<string> {
  console.log();
  console.log(`${YELLOW}What should Claude fix? (type your feedback, then press Enter)${NC}`);
  return ask(rl, '> ');
}

export async function promptRetryAction(rl: readline.Interface): Promise<RetryAction> {
  while (true) {
    console.log();
    console.log(`${CYAN}Retry, skip, or abort?${NC}`);
    console.log('  [r] Retry with feedback');
    console.log('  [s] Skip this issue');
    console.log('  [q] Abort script');
    const choice = await ask(rl, '> ');
    switch (choice.toLowerCase()) {
      case 'r': return 'retry';
      case 's': return 'skip';
      case 'q': return 'abort';
      default: warn('Invalid choice. Enter r, s, or q.');
    }
  }
}

// --- Main ---

async function main(): Promise<void> {
  const originalBranch = execCapture('git branch --show-current');

  const cleanup = () => {
    console.log();
    info('Cleaning up...');
    stopDevServer();
    info(`Switching back to ${originalBranch}...`);
    try { execSync(`git checkout ${originalBranch}`, { stdio: 'pipe' }); } catch { /* empty */ }
    ok('Done.');
  };

  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });

  const rl = createRL();

  try {
    checkPrerequisites();

    info('Fetching open issues...');
    const issues = fetchIssues();

    if (issues.length === 0) {
      ok('No open issues found. Nothing to do!');
      return;
    }

    info(`Found ${issues.length} open issue(s).`);

    let devServerStarted = false;

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const branch = `issue-${issue.number}`;

      console.log();
      console.log('==============================================');
      info(`Issue ${i + 1}/${issues.length}: #${issue.number} — ${issue.title}`);
      console.log('==============================================');

      gitCheckout('main');
      gitPullMain();
      gitCreateBranch(branch);

      let feedback = '';
      let continueLoop = true;

      while (continueLoop) {
        runClaude(issue, feedback || undefined);

        info('Verifying build...');
        if (verifyBuild()) {
          ok('Build passed.');
        } else {
          err('Build failed after Claude\'s implementation.');
          warn('Auto-retrying due to build failure...');
          feedback = 'The build (npm run build) failed. Please fix the build errors.';
          gitResetChanges();
          continue;
        }

        if (!devServerStarted) {
          startDevServer();
          // Give it time to start
          await new Promise(resolve => setTimeout(resolve, 3000));
          openBrowser();
          devServerStarted = true;
        }

        const verdict = await promptVerdict(rl);

        switch (verdict) {
          case 'accept': {
            info(`Creating PR for issue #${issue.number}...`);
            const prUrl = pushAndCreatePr(issue, branch);
            ok(`PR created: ${prUrl}`);

            gitCheckout('main');
            continueLoop = false;
            break;
          }
          case 'reject': {
            feedback = await promptFeedback(rl);
            const action = await promptRetryAction(rl);
            switch (action) {
              case 'retry':
                warn('Retrying with feedback...');
                gitResetChanges();
                break;
              case 'skip':
                warn(`Skipping issue #${issue.number}.`);
                gitCheckout('main');
                continueLoop = false;
                break;
              case 'abort':
                warn('Aborting.');
                cleanup();
                rl.close();
                return;
            }
            break;
          }
          case 'skip':
            warn(`Skipping issue #${issue.number}.`);
            gitCheckout('main');
            continueLoop = false;
            break;
          case 'abort':
            warn('Aborting.');
            cleanup();
            rl.close();
            return;
        }
      }
    }

    console.log();
    ok('All issues processed!');
  } finally {
    rl.close();
    cleanup();
  }
}

// Only run when executed directly, not when imported for testing
const isDirectRun = process.argv[1]?.endsWith('solve-issues.ts');
if (isDirectRun) {
  main().catch((e) => {
    err(String(e));
    process.exit(1);
  });
}
