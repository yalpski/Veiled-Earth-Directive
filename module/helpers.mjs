/**
 * Handlebars helpers and template preloading for the Veiled Earth Directive system.
 */

import { SYSTEM_ID, VED } from "./config.mjs";

const TEMPLATES = [
  "systems/" + SYSTEM_ID + "/templates/actor/character-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/actor/npc-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/actor/parts/skills.hbs",
  "systems/" + SYSTEM_ID + "/templates/actor/parts/header-grid.hbs",
  "systems/" + SYSTEM_ID + "/templates/actor/parts/conditions.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/skill-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/essence-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/race-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/archetype-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/gear-sheet.hbs",
  "systems/" + SYSTEM_ID + "/templates/item/condition-sheet.hbs"
];

export async function preloadHandlebarsTemplates() {
  const loader = foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  return loader?.(TEMPLATES);
}

export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("ved-die", (die) => {
    if (!die) return "";
    return `${die.count}d${die.faces}`;
  });

  Handlebars.registerHelper("ved-tag", (tagKey) => {
    const tag = VED.tagScale[tagKey];
    return tag ? tag.abbr : "";
  });

  Handlebars.registerHelper("ved-attribute-label", (key) => {
    return game.i18n.localize(VED.attributes[key]?.label ?? key);
  });

  Handlebars.registerHelper("ved-resource-label", (key) => {
    return game.i18n.localize(VED.resources[key]?.label ?? key);
  });

  Handlebars.registerHelper("ved-magnitude-label", (mag) => {
    const entry = VED.magnitudes[mag];
    return entry ? game.i18n.localize(entry.label) : `Mag-${mag}`;
  });

  Handlebars.registerHelper("ved-eq", (a, b) => a === b);

  Handlebars.registerHelper("ved-color", (key) => {
    if (!key) return "";
    return `ved-color-${key}`;
  });

  Handlebars.registerHelper("ved-tag-label", (tagKey) => {
    const tag = VED.tagScale[tagKey];
    return tag ? game.i18n.localize(tag.label) : "";
  });

  Handlebars.registerHelper("ved-attribute-resource", (attrKey) => {
    return VED.attributes[attrKey]?.resource ?? "";
  });
}
