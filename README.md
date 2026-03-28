# Timezone Slider

A progressive web app (PWA) for visualizing multiple timezones simultaneously. Add the cities you care about and instantly see what time it is everywhere at a glance—slide to compare times across zones.

Built with React, TypeScript, and Vite. Deployed to GitHub Pages.

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## solve-issues

The repo includes a `solve-issues.sh` script that automates issue resolution using Claude Code. It pulls all open GitHub issues, creates a branch for each one, and uses `claude -p` to implement, test, build, and commit the changes. After each issue you can review the result in the browser and choose to accept, reject (with feedback), skip, or abort.

Prerequisites: `gh` CLI (authenticated), `node` / `npm`, and `claude` CLI.

```bash
./solve-issues.sh
```

See [SOLVE-ISSUES.md](SOLVE-ISSUES.md) for the full design.
