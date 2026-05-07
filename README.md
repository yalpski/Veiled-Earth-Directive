# Veiled Earth Directive — Foundry VTT System

A game system for [Foundry VTT](https://foundryvtt.com/) implementing
**The Veiled Earth Directive**: a modern-occult RPG of Soulforged agents,
exploding dice, and Magnitude-driven progression.

> **Status:** v0.2.0 — initial framework with the first occult-themed
> sheet styling pass. The system loads, sheets render, and skills can be
> created and rolled. Mechanics are still being filled in.

## Compatibility

- **Verified:** Foundry VTT v14
- **Minimum:** Foundry VTT v13

## Installation

### Via Foundry's built-in Game System installer (recommended)

1. Launch Foundry VTT and open the **Game Systems** tab on the setup screen.
2. Click **Install System**.
3. Paste the following into the **Manifest URL** field at the bottom of the
   dialog and click **Install**:

   ```
   https://raw.githubusercontent.com/yalpski/veiled-earth-directive/main/system.json
   ```

4. Once installation finishes, create a world and pick **The Veiled Earth
   Directive** as its game system.

Foundry will use the same URL to check for updates. Note that Foundry's
update checker compares the `version` string in the installed `system.json`
against the one served at the manifest URL — it does **not** diff commits or
files. That means a change pushed to `main` only shows up as an available
update once `system.json`'s `version` field has been bumped to a higher value
than the one you have installed. Once tagged releases start being published
(see [Releases](#releases)), the manifest URL above can be swapped for
`https://github.com/yalpski/veiled-earth-directive/releases/latest/download/system.json`
to track stable versions instead of `main`.

### Manual / development install

Either symlink the repo into your Foundry data directory:

```bash
ln -s "$(pwd)" "/path/to/FoundryUserData/Data/systems/veiled-earth-directive"
```

…or copy the repository there. Restart Foundry, create a world, and select
**The Veiled Earth Directive** as the system.

## Project Layout

```
system.json                       Foundry manifest
module/
  veiled-earth.mjs                Entry point, init/ready hooks, sheet registration
  config.mjs                      System constants (magnitudes, attributes, tags, …)
  helpers.mjs                     Handlebars helpers + template preloading
  data/
    actor-data.mjs                CharacterData, NPCData TypeDataModels
    item-data.mjs                 SkillData, EssenceData, RaceData, ArchetypeData,
                                  GearData, ConditionData
  documents/
    actor.mjs                     VEDActor — derived attribute & resource values
    item.mjs                      VEDItem — skill rolling and chain advancement
  sheets/
    actor-sheet.mjs               ApplicationV2 character + NPC sheets
    item-sheet.mjs                ApplicationV2 item sheet
  dice/
    exploding-roll.mjs            ExplodingRoll — chain-advancing exploding dice
templates/                        Handlebars templates for sheets
styles/veiled-earth.css           Base sheet styles
lang/en.json                      English localization strings
```

## Implemented So Far

- Manifest, ESM entry point, init/ready hooks
- TypeDataModels for every actor and item subtype
- Custom Actor with derived attributes and resource maxima
  (resource max = sum of skill die maxima × magnitude)
- Custom Item with a `roll()` method that posts an exploding roll to chat
- `ExplodingRoll` implementing the chain-advancing exploding mechanic
  (max-roll tally → chain advancement when tally hits magnitude)
- Character sheet, NPC sheet, and per-type item sheets (V2-based)
- Localization scaffold (English)

## Next Steps

- Compendium packs for the Essence list, racial gifts, and pre-built skills
- Persist the in-check advancement tally across rolls
- Custom `Combat` / `Combatant` to model Fast/Slow turn structure
- Active Effects-driven condition application (Bleeding, Poisoned, Cursed)
- Sheet polish, theming, and drag-and-drop ergonomics
- Cost/effect auto-deduction on resource pools

## Design Reference

See `The Veiled Earth Directive Overview.md` for the current ruleset draft.

## Releases

Releases (and the artifacts the Foundry installer downloads) are produced by
the `.github/workflows/release.yml` workflow. To cut a new release, push a tag
of the form `vX.Y.Z`:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow stamps the version into `system.json`, builds `system.zip`, and
attaches both files to a GitHub release at
`https://github.com/yalpski/veiled-earth-directive/releases/latest`, which is
exactly what the Manifest URL above resolves to.

## License

TBD.
