---
name: create-pr
description: Creates a regular GitHub pull request, defaulting to main except feature and fix PRs, which target the active release branch.
---

# Create Pull Request

When this skill is invoked:

1. **Inspect the worktree and branch**:
   - Run `git status`, `git diff`, and `git branch --show-current`.
   - Do not stage, commit, or discard changes unless the user explicitly asks.
   - A PR requires committed changes on a branch; if there are uncommitted changes, explain that they need to be committed first.
2. **Choose the PR base**:
   - Use an explicitly requested base branch when provided.
   - For a `feat/` or `fix/` source branch, target the active `release/vMAJOR.MINOR.PATCH` branch.
   - Identify the active release branch from the repository's existing branches or PR context. If there are multiple plausible active release branches or none, ask the user which base to use; do not guess or create a release branch.
   - For other source branches, default to `main`.
   - Before creating a PR to `main`, check `.github/workflows/main-pr-policy.yml`. This repository currently permits only `release/vMAJOR.MINOR.PATCH` and `release-please--*` source branches into `main`. If the source branch is not allowed, do not create a PR that will fail policy; explain the conflict and ask whether to change the base or policy.
3. **Run quality checks**: Run `npm run check`. Do not create the PR if checks fail.
4. **Push the source branch**: Run `git push -u origin <source-branch>`.
5. **Create the PR**:
   - Take the prefix before the first `/` in the source branch (for example, `feat` from `feat/add-cache`). If a GitHub label with that exact name exists, add `--label <prefix>` to the `gh pr create` command; otherwise, create the PR without a label.
   - Use `gh pr create --base <base-branch> --head <source-branch>` with a concise title and summary body describing the changes.
   - Do not enable auto-merge or merge the PR.
   - If GitHub CLI is unavailable or unauthenticated, provide the GitHub compare URL for `<base-branch>...<source-branch>`.
