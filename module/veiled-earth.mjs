/**
 * The Veiled Earth Directive — Foundry VTT system entry point.
 * Compatible with Foundry VTT v13+ (verified for v14).
 */

import { SYSTEM_ID, VED } from "./config.mjs";
import * as dataModels from "./data/_module.mjs";
import { VEDActor } from "./documents/actor.mjs";
import { VEDItem } from "./documents/item.mjs";
import { VEDCharacterSheet, VEDNPCSheet } from "./sheets/actor-sheet.mjs";
import { VEDItemSheet } from "./sheets/item-sheet.mjs";
import { ExplodingRoll } from "./dice/exploding-roll.mjs";
import { registerHandlebarsHelpers, preloadHandlebarsTemplates } from "./helpers.mjs";

/* ----------------------------------------- */
/*  Init Hook                                */
/* ----------------------------------------- */

Hooks.once("init", async function () {
  console.log(`${SYSTEM_ID} | Initializing The Veiled Earth Directive system.`);

  // Expose system constants and helpers on the global game object once ready.
  CONFIG.VED = VED;

  // Register custom document classes.
  CONFIG.Actor.documentClass = VEDActor;
  CONFIG.Item.documentClass = VEDItem;

  // Register data models for each actor and item subtype.
  CONFIG.Actor.dataModels = {
    character: dataModels.CharacterData,
    npc: dataModels.NPCData
  };
  CONFIG.Item.dataModels = {
    skill: dataModels.SkillData,
    essence: dataModels.EssenceData,
    race: dataModels.RaceData,
    archetype: dataModels.ArchetypeData,
    gear: dataModels.GearData,
    condition: dataModels.ConditionData
  };

  // Make the custom roll the default roll class so /r and inline rolls use it.
  CONFIG.Dice.rolls.unshift(ExplodingRoll);

  // Register sheets (V2-aware with legacy fallback so this works on v13 and v14).
  registerSheets();

  // Localization-aware Handlebars helpers and template preloading.
  registerHandlebarsHelpers();
  await preloadHandlebarsTemplates();
});

/* ----------------------------------------- */
/*  Ready Hook                               */
/* ----------------------------------------- */

Hooks.once("ready", function () {
  console.log(`${SYSTEM_ID} | System ready.`);
  // Expose a tiny API surface for macros and modules.
  game.ved = {
    config: VED,
    rollSkill: (actor, skillId, options = {}) => actor?.rollSkill?.(skillId, options),
    ExplodingRoll
  };
});

/* ----------------------------------------- */
/*  Sheet Registration                       */
/* ----------------------------------------- */

function registerSheets() {
  // V13+ exposes the new collection API; legacy globals remain via shims.
  const Actors = foundry.documents?.collections?.Actors ?? globalThis.Actors;
  const Items = foundry.documents?.collections?.Items ?? globalThis.Items;

  // We register with makeDefault: true rather than unregistering core sheets,
  // which keeps this stable across v13/v14 where the legacy V1 default sheet
  // class lives in different namespaces (or has been removed).
  Actors.registerSheet(SYSTEM_ID, VEDCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "VED.SheetLabel.Character"
  });
  Actors.registerSheet(SYSTEM_ID, VEDNPCSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "VED.SheetLabel.NPC"
  });

  Items.registerSheet(SYSTEM_ID, VEDItemSheet, {
    makeDefault: true,
    label: "VED.SheetLabel.Item"
  });
}
