# Unattended browser checks

These checks run against a temporary local copy of the repository. They never publish the website or submit orders. External browser requests (including analytics and advertising) are blocked.

They verify calculator answers through actual buttons, keyboard input, clearing, mobile button placement, and homeschool-page internal links. A failed assertion makes the run fail; known bugs are not silently skipped.

## Run locally

Use Node.js 22 or later:

    npm ci --prefix tools/smoke
    tools/smoke/node_modules/.bin/playwright install chromium
    node tools/smoke/run.cjs

Reports and failure screenshots are saved to `test-results/smoke/`. For an installed Chrome or Edge browser, set `SMOKE_BROWSER_CHANNEL` to `chrome` or `msedge`. `SMOKE_REPORT_DIR` optionally selects a report folder.

## Unattended run

The GitHub Actions workflow runs on pull requests and supports manual runs once present on the default branch. No paid model/API account is needed. Actions usage remains subject to the repository's GitHub plan and limits.

This first trial has no recurring schedule. Verify its results before adding a daily schedule. It does not connect to Claude, send voice recordings, fix production files, or deploy anything.

The browser checks are a small baseline, not a full security, accessibility, visual-layout, or live-site audit.
