/**
 * Data models for Veiled Earth Directive items.
 *
 * Item subtypes:
 *   - skill:     A skill / ability / spell. The core mechanical item.
 *   - essence:   A magical essence bound to an attribute.
 *   - race:      Character race + racial gift container.
 *   - archetype: Combat archetype container.
 *   - gear:      Mundane or magical equipment.
 *   - condition: An applied condition / status effect.
 */

const fields = foundry.data.fields;

const TAGS = ["no", "vl", "l", "m", "h", "vh", "e"];
const ATTRIBUTES = ["power", "finesse", "soul", "wit"];
const RESOURCES = ["health", "stamina", "mana", "recovery"];

/* ----------------------------------------- */
/*  Shared Base                              */
/* ----------------------------------------- */

class BaseItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "" })
    };
  }
}

/* ----------------------------------------- */
/*  Skill                                    */
/* ----------------------------------------- */

export class SkillData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      attribute: new fields.StringField({
        initial: "power", choices: ATTRIBUTES, blank: false
      }),
      essence: new fields.StringField({ initial: "" }),
      generic: new fields.BooleanField({ initial: false }),
      reactive: new fields.BooleanField({ initial: false }),
      magnitude: new fields.NumberField({
        initial: 1, min: 0, max: 5, integer: true, nullable: false
      }),
      die: new fields.SchemaField({
        count: new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
        faces: new fields.NumberField({ initial: 4, min: 2, integer: true, nullable: false }),
        chainIndex: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        // Tally of max-die results accumulated *toward* the next advancement
        // during an in-flight check. Reset to 0 once the threshold is reached.
        advancementTally: new fields.NumberField({
          initial: 0, min: 0, integer: true, nullable: false
        })
      }),
      cost: new fields.SchemaField({
        tag:      new fields.StringField({ initial: "vl", choices: TAGS, blank: false }),
        resource: new fields.StringField({ initial: "stamina", choices: RESOURCES, blank: false })
      }),
      effect: new fields.SchemaField({
        tag:  new fields.StringField({ initial: "l", choices: TAGS, blank: false }),
        kind: new fields.StringField({ initial: "" })   // damage / healing / utility / etc.
      }),
      range: new fields.StringField({ initial: "" }),
      duration: new fields.StringField({ initial: "" }),
      tags: new fields.ArrayField(new fields.StringField(), { initial: [] })
    });
  }
}

/* ----------------------------------------- */
/*  Essence                                  */
/* ----------------------------------------- */

export class EssenceData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      rarity: new fields.StringField({
        initial: "common",
        choices: ["common", "uncommon", "rare", "epic", "legendary", "confluence"]
      }),
      boundAttribute: new fields.StringField({
        initial: "power", choices: ATTRIBUTES, blank: false
      }),
      isConfluence: new fields.BooleanField({ initial: false }),
      // For confluence essences, the three component essences that produced it.
      components: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      flavorNotes: new fields.HTMLField({ initial: "" })
    });
  }
}

/* ----------------------------------------- */
/*  Race                                     */
/* ----------------------------------------- */

export class RaceData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      mandatoryEssences: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      essenceCount: new fields.NumberField({
        initial: 3, min: 1, max: 5, integer: true, nullable: false
      }),
      racialGift: new fields.SchemaField({
        name: new fields.StringField({ initial: "" }),
        description: new fields.HTMLField({ initial: "" })
      })
    });
  }
}

/* ----------------------------------------- */
/*  Archetype                                */
/* ----------------------------------------- */

export class ArchetypeData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      preset: new fields.StringField({
        initial: "custom",
        choices: ["tank", "ambusher", "ranged", "melee", "healer", "support", "custom"]
      }),
      focusNotes: new fields.HTMLField({ initial: "" })
    });
  }
}

/* ----------------------------------------- */
/*  Gear                                     */
/* ----------------------------------------- */

export class GearData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      quantity: new fields.NumberField({ initial: 1, min: 0, integer: true }),
      weight:   new fields.NumberField({ initial: 0, min: 0 }),
      equipped: new fields.BooleanField({ initial: false }),
      magical:  new fields.BooleanField({ initial: false })
    });
  }
}

/* ----------------------------------------- */
/*  Condition                                */
/* ----------------------------------------- */

export class ConditionData extends BaseItemData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      stackable: new fields.BooleanField({ initial: false }),
      stacks:    new fields.NumberField({ initial: 1, min: 0, integer: true }),
      // Damage applied per stack per "tick" — interpreted by Combat hooks.
      perTick: new fields.SchemaField({
        amount: new fields.StringField({ initial: "" }),  // e.g. "magnitude", "1d4"
        resource: new fields.StringField({
          initial: "health", choices: [...RESOURCES, "none"]
        })
      })
    });
  }
}
