---
name: release-pr
description: Runs checks, updates CHANGELOG.md, creates a feature/fix branch, commits changes using Conventional Commits, pushes to origin, and opens a GitHub PR.
---

# Branch, Changelog, Commit & PR Workflow

When this skill is invoked:

1. **Verify quality first**: Run `npm run check` (`npm run lint && npm test`). Do not proceed if linting, build, or tests fail.
2. **Inspect git state**: Run `git status` and `git diff` to review all modified and untracked files.
3. **Create a branch (if on `main`)**:
   - Check the current branch via `git branch --show-current`.
   - If on `main`, create and switch to a descriptive branch using `<type>/<short-kebab-description>` (e.g., `feat/add-eur-rate`, `fix/cache-ttl`, `docs/update-readme`).
4. **Update `CHANGELOG.md`**:
   - If `CHANGELOG.md` does not exist, create it using [Keep a Changelog](https://keepachangelog.com) format with an `## [Unreleased]` section.
   - Add a concise bullet under `### Added`, `### Changed`, `### Fixed`, or `### Documentation` summarizing the changes.
5. **Update the agent skill version**:
   - Release Please updates `skills/dgt-x-rate/SKILL.md` as an extra file.
   - When preparing changes manually or between releases, keep the `version` in that file synchronized with `package.json`.
   - Keep the `get_usd_crc_rate` instructions and examples synchronized with the tool signature.
6. **Stage and commit**:
   - Stage changes (`git add -A`) and verify no build artifacts (`build/`, `node_modules/`, `.env`) are staged.
   - Commit using **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
7. **Push and create PR**:
   - Push the branch with `git push -u origin <branch-name>`.
   - If GitHub CLI (`gh`) is installed and authenticated, open a PR with `gh pr create --fill` (or a clear title and summary body). Otherwise, output the direct GitHub compare URL so the user can open the PR in one click.
