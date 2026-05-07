---
name: bump
description: Bump the Veiled Earth Directive system version so Foundry's "Perform Update if Available" will detect the change. Use when the user says "bump", "/bump", "ship a new version", "publish an update", or otherwise wants pushed changes to surface as an in-app Foundry update.
---

# bump

Foundry's "Perform Update if Available" compares the `version` string in
the installed `system.json` against the one served at the manifest URL.
It does **not** diff commits or files. Changes only register as an update
once `system.json`'s `version` field has been bumped to a higher value
than the version the user has installed.

This skill performs that bump consistently across the repo.

## Argument

`/bump` accepts one optional arg:

- `patch` *(default)* — `0.1.1` → `0.1.2`. Fixes, content tweaks, sheet polish.
- `minor` — `0.1.1` → `0.2.0`. New features that don't break worlds.
- `major` — `0.1.1` → `1.0.0`. Breaking changes (data model, save format).
- An explicit semver string like `0.3.4` — overrides the bump kind.

If the user invoked `/bump` with no arg, default to `patch` but state
which version you're bumping to so they can correct you.

## Steps

1. **Read the current version** from `system.json` (the `version` field).
2. **Compute the new version**:
   - Parse `MAJOR.MINOR.PATCH`.
   - Apply the bump kind, or use the explicit arg if given.
   - The new version MUST be strictly greater than the current one.
3. **Find every place the old version appears** so nothing drifts:
   ```bash
   grep -rn --exclude-dir=.git --exclude-dir=node_modules "<old-version>" .
   ```
   Expected hits:
   - `system.json` — the `version` field.
   - `README.md` — the status line near the top (`> **Status:** vX.Y.Z`).
   May also appear in CHANGELOG, docs, etc. Update them all.
4. **Sanity-check the manifest URL** in `system.json` and tell the user
   what's needed to actually publish:
   - **`…/main/system.json`** (current default): bumping `system.json` on
     `main` is sufficient. Once the bump is on `main`, Foundry sees it.
   - **`…/releases/latest/download/system.json`**: bumping `system.json`
     is **not** enough on its own. The `.github/workflows/release.yml`
     workflow stamps the version into `system.json` from the pushed git
     tag, so a `vX.Y.Z` tag must also be pushed for the release to exist.
     Do NOT push tags without explicit user permission — tags trigger
     publishing.
5. **Show the diff** (`git diff`) and confirm before committing.
6. **Commit** only when the user has approved. Suggested message:
   `Bump version to X.Y.Z` with a one-line body describing what's in it.
7. **Tell the user the remaining steps**:
   - If on a feature branch: they need to merge to `main`.
   - If on `main`: pushing is enough for `main`-tracking installs.
   - If using release-tag mode: remind them about
     `git tag vX.Y.Z && git push origin vX.Y.Z`, but don't run it.

## Guardrails

- Never set the new version lower than or equal to the current one —
  Foundry won't show an update, and downgrades confuse the installer.
- Never push to `main` directly. Never push tags without explicit
  permission.
- Don't bump unless there are actually changes worth shipping. If
  `git log <last-version-tag>..HEAD` is empty, ask the user to confirm.
- Don't edit `.github/workflows/release.yml`'s version-stamping logic
  as part of a bump — that workflow derives the version from the tag,
  so the local `system.json` value is a development pointer, not the
  published one.
