/**
 * Configuration constants for the Veiled Earth Directive system.
 * Mounted onto the global CONFIG object as CONFIG.VED during init.
 */

export const SYSTEM_ID = "veiled-earth-directive";

export const VED = {};

/* ----------------------------------------- */
/*  Magnitude Scale                          */
/* ----------------------------------------- */

VED.magnitudes = {
  0: { label: "VED.Magnitude.0", baseDie: "1d2", description: "VED.Magnitude.0Desc" },
  1: { label: "VED.Magnitude.1", baseDie: "1d4", description: "VED.Magnitude.1Desc" },
  2: { label: "VED.Magnitude.2", baseDie: "2d6", description: "VED.Magnitude.2Desc" },
  3: { label: "VED.Magnitude.3", baseDie: "3d8", description: "VED.Magnitude.3Desc" },
  4: { label: "VED.Magnitude.4", baseDie: "4d10", description: "VED.Magnitude.4Desc" },
  5: { label: "VED.Magnitude.5", baseDie: "5d12", description: "VED.Magnitude.5Desc" }
};

/* ----------------------------------------- */
/*  Skill Dice Chain                         */
/* ----------------------------------------- */

/**
 * The skill dice progression.
 * Index increases on each maximum-roll advancement. Each entry describes the
 * number of dice and the die face count.
 */
VED.dieChain = [
  { count: 1, faces: 4,  magnitude: 1 },
  { count: 1, faces: 6,  magnitude: 1 },
  { count: 1, faces: 8,  magnitude: 1 },
  { count: 1, faces: 10, magnitude: 1 },
  { count: 1, faces: 12, magnitude: 1 },
  { count: 2, faces: 6,  magnitude: 2 },
  { count: 2, faces: 8,  magnitude: 2 },
  { count: 2, faces: 10, magnitude: 2 },
  { count: 2, faces: 12, magnitude: 2 },
  { count: 3, faces: 8,  magnitude: 3 },
  { count: 3, faces: 10, magnitude: 3 },
  { count: 3, faces: 12, magnitude: 3 },
  { count: 4, faces: 10, magnitude: 4 },
  { count: 4, faces: 12, magnitude: 4 },
  { count: 5, faces: 12, magnitude: 5 }
];

/* ----------------------------------------- */
/*  Attributes                               */
/* ----------------------------------------- */

VED.attributes = {
  power:   { label: "VED.Attribute.Power",   resource: "health"   },
  finesse: { label: "VED.Attribute.Finesse", resource: "stamina"  },
  soul:    { label: "VED.Attribute.Soul",    resource: "mana"     },
  wit:     { label: "VED.Attribute.Wit",     resource: "recovery" }
};

VED.resources = {
  health:   { label: "VED.Resource.Health",   attribute: "power"   },
  stamina:  { label: "VED.Resource.Stamina",  attribute: "finesse" },
  mana:     { label: "VED.Resource.Mana",     attribute: "soul"    },
  recovery: { label: "VED.Resource.Recovery", attribute: "wit"     }
};

/* ----------------------------------------- */
/*  Cost / Effect Tags                       */
/* ----------------------------------------- */

/**
 * Roll multipliers for cost and effect tags. The "value" represents the
 * multiplier expressed as { mul, div } so we can avoid floating-point math
 * when scaling integer dice totals.
 */
VED.tagScale = {
  no: { label: "VED.Tag.None",     mul: 0, div: 1, abbr: "No" },
  vl: { label: "VED.Tag.VeryLow",  mul: 1, div: 4, abbr: "VL" },
  l:  { label: "VED.Tag.Low",      mul: 1, div: 2, abbr: "L"  },
  m:  { label: "VED.Tag.Moderate", mul: 1, div: 1, abbr: "M"  },
  h:  { label: "VED.Tag.High",     mul: 2, div: 1, abbr: "H"  },
  vh: { label: "VED.Tag.VeryHigh", mul: 3, div: 1, abbr: "VH" },
  e:  { label: "VED.Tag.Extreme",  mul: 4, div: 1, abbr: "E"  }
};

/* ----------------------------------------- */
/*  Item / Actor Types                       */
/* ----------------------------------------- */

VED.actorTypes = {
  character: "VED.ActorType.Character",
  npc:       "VED.ActorType.NPC"
};

VED.itemTypes = {
  skill:     "VED.ItemType.Skill",
  essence:   "VED.ItemType.Essence",
  race:      "VED.ItemType.Race",
  archetype: "VED.ItemType.Archetype",
  gear:      "VED.ItemType.Gear",
  condition: "VED.ItemType.Condition"
};

/* ----------------------------------------- */
/*  Essence Rarity Categories                */
/* ----------------------------------------- */

VED.essenceRarities = {
  common:    "VED.Rarity.Common",
  uncommon:  "VED.Rarity.Uncommon",
  rare:      "VED.Rarity.Rare",
  epic:      "VED.Rarity.Epic",
  legendary: "VED.Rarity.Legendary",
  confluence:"VED.Rarity.Confluence"
};

/* ----------------------------------------- */
/*  Conditions                               */
/* ----------------------------------------- */

VED.conditions = {
  surprised: { label: "VED.Condition.Surprised", stacking: false },
  stunned:   { label: "VED.Condition.Stunned",   stacking: false },
  prone:     { label: "VED.Condition.Prone",     stacking: false },
  grappled:  { label: "VED.Condition.Grappled",  stacking: false },
  bleeding:  { label: "VED.Condition.Bleeding",  stacking: true  },
  poisoned:  { label: "VED.Condition.Poisoned",  stacking: true  },
  cursed:    { label: "VED.Condition.Cursed",    stacking: true  }
};

/* ----------------------------------------- */
/*  Archetypes (suggested presets)           */
/* ----------------------------------------- */

VED.archetypes = {
  tank:      "VED.Archetype.Tank",
  ambusher:  "VED.Archetype.Ambusher",
  ranged:    "VED.Archetype.Ranged",
  melee:     "VED.Archetype.Melee",
  healer:    "VED.Archetype.Healer",
  support:   "VED.Archetype.Support",
  custom:    "VED.Archetype.Custom"
};

/* ----------------------------------------- */
/*  Combat                                   */
/* ----------------------------------------- */

VED.turnTypes = {
  fast: { label: "VED.Turn.Fast", actions: 2, order: 0 },
  slow: { label: "VED.Turn.Slow", actions: 3, order: 1 }
};
