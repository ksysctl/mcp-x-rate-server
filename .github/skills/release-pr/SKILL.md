---
name: release-pr
description: Runs checks, prepares a release/vMAJOR.MINOR.PATCH branch from the version on main, updates the release files, pushes it, and opens a release PR that targets main for manual merge.
---

# Branch, Changelog, Commit & PR Workflow

When this skill is invoked:

1. **Verify quality first**: Run `npm run check` (`npm run lint && npm test`). Do not proceed if linting, build, or tests fail.
2. **Inspect git state**: Run `git status` and `git diff` to review all modified and untracked files.
3. **Follow the release PR flow**:
   - Small feature and fix changes must be reviewed and merged into the active `release/vMAJOR.MINOR.PATCH` branch, not directly into `main`.
   - The release PR itself must have `release/vMAJOR.MINOR.PATCH` as its source and `main` as its base.
   - Do not enable or assume auto-merge. The release PR is merged into `main` manually.
4. **Determine the next release version from `main`**:
   - Fetch `origin/main` and read the package version from that exact ref:
     `git fetch origin main`
     `git show origin/main:package.json`
   - Do not derive the next version from the current working branch or from an existing local release branch.
   - Use the version in `origin/main` as the current version. Apply the highest required bump across the accumulated Conventional Commits:
     patch for `fix:`/`perf:`, minor for `feat:`, and major for breaking changes.
   - Create and switch to `release/vMAJOR.MINOR.PATCH` only if the current branch is `main`; from another branch, switch to `main` and update it from `origin/main` before creating the release branch.
   - If a matching `release/vMAJOR.MINOR.PATCH` branch already exists, switch to it and verify it is the intended in-progress release.
5. **Update `CHANGELOG.md`**:
   - If `CHANGELOG.md` does not exist, create it using [Keep a Changelog](https://keepachangelog.com) format with an `## [Unreleased]` section.
   - Add a concise bullet under `### Added`, `### Changed`, `### Fixed`, or `### Documentation` summarizing the changes.
6. **Update the agent skill version**:
   - Release Please updates `skills/dgt-x-rate/SKILL.md` as an extra file.
   - When preparing changes manually or between releases, keep the `version` in that file synchronized with `package.json`.
   - Keep the `get_usd_crc_rate` instructions and examples synchronized with the tool signature.
7. **Stage and commit**:
   - Stage changes (`git add -A`) and verify no build artifacts (`build/`, `node_modules/`, `.env`) are staged.
   - Commit using **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
8. **Push and create PR**:
   - Push the branch with `git push -u origin <branch-name>`.
   - If GitHub CLI (`gh`) is installed and authenticated, open a PR with the `release` label: `gh pr create --base main --head <branch-name> --label release --fill` (or a clear title and summary body).
   - Explicitly disable auto-merge and do not run `gh pr merge`.
   - Otherwise, output the direct GitHub compare URL for `main...<branch-name>` so the user can open the PR in one click.
