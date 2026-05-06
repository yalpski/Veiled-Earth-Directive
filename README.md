# Veiled Earth Directive — Foundry VTT System

A game system for [Foundry VTT](https://foundryvtt.com/) implementing
**The Veiled Earth Directive**: a modern-occult RPG of Soulforged agents,
exploding dice, and Magnitude-driven progression.

> **Status:** v0.1.0 — initial framework. The system loads, sheets render,
> and skills can be created and rolled. Mechanics are still being filled in.

## Compatibility

- **Verified:** Foundry VTT v14
- **Minimum:** Foundry VTT v13

## Installation (Development)

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

## License

TBD.
