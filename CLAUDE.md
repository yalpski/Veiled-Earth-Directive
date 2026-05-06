# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Foundry VTT game system** (not a module, and not a normal Node project). There is no build step, no package manager, no test runner, and no lint config. The repository *is* the deliverable — Foundry loads `system.json` and the ES modules it points at directly. Don't add bundlers, transpilers, or `package.json` unless explicitly asked.

## Running it locally

Foundry only loads systems from its data directory, so every dev iteration goes through it:

```bash
ln -s "$(pwd)" "/path/to/FoundryUserData/Data/systems/veiled-earth-directive"
```

Then launch Foundry, create a world, pick **The Veiled Earth Directive**. Code changes require a world reload (F5 / "Return to Setup → relaunch") because Foundry caches modules per session.

There are no automated tests. Verify changes by running them inside Foundry and checking the F12 dev console for errors.

## Cutting a release

The `.github/workflows/release.yml` workflow runs on `v*` tag pushes. It stamps the tag's version into `system.json`, builds `system.zip`, rewrites `manifest`/`download` to release URLs, and uploads both as release assets.

```bash
git tag v0.1.0 && git push origin v0.1.0
```

## Architecture

### Foundry V13/V14 dual compatibility

The system targets Foundry v13 (minimum) through v14 (verified). Several Foundry APIs moved namespaces between these versions, and the codebase consistently uses `foundry.X.Y ?? globalThis.LegacyName` shims. Examples:

- `foundry.documents?.Actor ?? globalThis.Actor` — base document class (`module/documents/actor.mjs`, `module/documents/item.mjs`)
- `foundry.documents?.collections?.Actors ?? globalThis.Actors` — sheet registration (`module/veiled-earth.mjs`)
- `foundry.dice?.terms?.Die ?? globalThis.Die` — dice primitives (`module/dice/exploding-roll.mjs`)
- `foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates` (`module/helpers.mjs`)

When adding new Foundry API calls, prefer the new `foundry.*` namespace and add the legacy fallback. Don't drop the fallbacks unless we drop v13 support.

### The skill → attribute → resource derivation chain

This is the core data flow. Understanding it requires reading three files together (`module/data/{actor,item}-data.mjs` and `module/documents/actor.mjs`):

1. **Skills** are owned items on an actor. Each skill has a `system.die.chainIndex` pointing into `VED.dieChain` (in `module/config.mjs`) — a 15-step progression from 1d4 up through 5d12. `count`/`faces` are kept in sync with the chain entry by `VEDItem._prepareSkillDerived()`; the chain index is the source of truth.
2. **Each skill is bound to one attribute** (`power`/`finesse`/`soul`/`wit`) via `system.attribute`.
3. **`VEDActor.prepareDerivedData()`** rebuilds attribute and resource state from owned skills:
   - Each attribute's die mirrors the highest-`chainIndex` skill bound to it.
   - The attribute's `magnitude` is the magnitude of that chain entry.
   - The attribute's paired resource (per `VED.attributes[attr].resource`) gets `max = sum(faces × count of bound skills) × actor.magnitude`.
   - Current value is clamped to the new max.

This means **attribute and resource fields are derived; never write to them directly**. Mutate skills (or `actor.system.magnitude`) and let `prepareDerivedData` recompute.

### Chain-advancing exploding dice

`ExplodingRoll` (`module/dice/exploding-roll.mjs`) implements the system's signature mechanic. It is registered onto `CONFIG.Dice.rolls` so `/r` and inline rolls use it, but normally it's invoked via `VEDItem.roll()` on a skill item:

- All dice in the current chain entry are rolled. Dice that land on max face explode (single re-roll each).
- A running `maxTally` of max-rolls is kept *within the check*. Each time it reaches the actor's `magnitude`, the chain index advances mid-roll and subsequent re-rolls use the new die. This is why explosions and advancement are interleaved in `_evaluateChain()` rather than computed in two passes.
- `roll.options.advancementsTriggered` records how many advancements happened. `VEDItem._maybeAdvance()` reads it after the roll and persists `system.die.chainIndex += advancements`.

The roll currently substitutes a single `NumericTerm` equal to the computed total before Foundry's render pipeline runs (`_evaluate` overrides the terms). The original formula string is preserved for chat display. If you change the rendering, keep `advancementsTriggered` populated — `_maybeAdvance` depends on it.

### Sheets are ApplicationV2 + Handlebars

All sheets extend `HandlebarsApplicationMixin(ActorSheetV2 | ItemSheetV2)`. Action handlers are static methods registered via `DEFAULT_OPTIONS.actions` (data-action HTML attributes, not jQuery selectors). The actor sheet has a single `main` PART; the item sheet uses one of six type-specific Handlebars templates picked at render time. Templates live under `templates/` and are preloaded in `module/helpers.mjs` — **add new template paths to the `TEMPLATES` array there** when introducing one, or it won't be available for partial includes.

### TypeDataModels are the actor/item schema

Every actor and item subtype is a `foundry.abstract.TypeDataModel` registered in `Hooks.once("init")`. The schema defined there *is* `actor.system` / `item.system`'s shape; Foundry validates writes against it. Add new fields by extending `defineSchema()` (use `foundry.utils.mergeObject(super.defineSchema(), {...})`), not by writing to `system.foo` ad hoc — undeclared fields will be stripped on save.

### Localization

User-facing strings go through `lang/en.json` keys (e.g. `VED.Skill.Attribute`). Schema initial values that are plain strings (e.g. `essence: ""`) don't need keys; labels referenced from `module/config.mjs` (`VED.attributes[k].label` etc.) do. Handlebars helpers in `module/helpers.mjs` (`ved-attribute-label`, `ved-resource-label`, `ved-magnitude-label`) localize on the fly — prefer them in templates over raw `{{localize}}` calls so the lookup stays centralized.

## Foundry installer / `system.json` (lesson learned 2026-05-06)

**Constraint:** Foundry's built-in Game System installer fetches the **Manifest URL** the user pastes, then *immediately* fetches the `download` URL declared *inside* that manifest. **Both URLs must resolve at the moment the user clicks Install.** If either 404s, install fails — and the failure messages don't make it obvious which URL is the problem.

The pre-merge default of pointing both at `https://github.com/<owner>/<repo>/releases/latest/download/system.{json,zip}` is a trap: those URLs only resolve once a GitHub release with those exact assets exists. On a fresh repo with no releases yet, Foundry reports "No system manifest found" (manifest 404) or "An unexpected error occurred when downloading file ... Not Found" (download 404).

**The current setup, which works pre-release:**
- `manifest` → `https://raw.githubusercontent.com/<owner>/<repo>/main/system.json` (always exists once `main` exists)
- `download` → `https://github.com/<owner>/<repo>/archive/refs/heads/main.zip` (GitHub auto-archive; Foundry V13+ strips the single wrapping folder)

The release workflow rewrites both fields to release URLs in the *bundled* `system.json` it attaches to a tagged release. Users who install from a release therefore track release-based updates; users who install from `main` track main-branch updates. **Don't "simplify" by reverting committed `system.json` to `releases/latest/...` URLs unless tagged releases actually exist.**

**Beware multi-commit branches and merges:** if you push a fix in two commits and a reviewer merges the first PR before the second commit lands, `main` will ship a half-fix. When the fix touches `system.json` *and* user-facing docs together, keep them in the same commit (or check `main`'s state via `mcp__github__get_file_contents` after a merge before declaring victory). The error-from-step-2 in the recent install attempts ("download URL 404") was caused exactly by this — README updates landed but the `system.json` URL change didn't.

`raw.githubusercontent.com` is case-sensitive on the repo path; `github.com` redirects canonicalize case but the raw host doesn't. Stick with the lowercase form (`yalpski/veiled-earth-directive`) that's already canonical here, or verify with `mcp__github__get_file_contents` before changing it.
