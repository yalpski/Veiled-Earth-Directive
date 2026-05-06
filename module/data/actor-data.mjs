/**
 * Data models for Veiled Earth Directive actors.
 *
 * Foundry v13+ TypeDataModel — the schema becomes the canonical structure for
 * `actor.system`. Derived values are computed in prepareDerivedData on the
 * Actor document (see documents/actor.mjs).
 */

const fields = foundry.data.fields;

/* ----------------------------------------- */
/*  Reusable Field Factories                 */
/* ----------------------------------------- */

function dieField() {
  return new fields.SchemaField({
    count: new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
    faces: new fields.NumberField({ initial: 4, min: 2, integer: true, nullable: false }),
    chainIndex: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false })
  });
}

function attributeField() {
  // Attributes mirror their highest-ranked associated skill. They are not
  // edited directly; prepareDerivedData fills them in from owned skills.
  return new fields.SchemaField({
    die: dieField(),
    magnitude: new fields.NumberField({ initial: 1, min: 0, max: 5, integer: true })
  });
}

function resourceField() {
  return new fields.SchemaField({
    value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    max:   new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false })
  });
}

/* ----------------------------------------- */
/*  Shared Base                              */
/* ----------------------------------------- */

class BaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      magnitude: new fields.NumberField({
        initial: 1, min: 0, max: 5, integer: true, nullable: false
      }),
      attributes: new fields.SchemaField({
        power:   attributeField(),
        finesse: attributeField(),
        soul:    attributeField(),
        wit:     attributeField()
      }),
      resources: new fields.SchemaField({
        health:   resourceField(),
        stamina:  resourceField(),
        mana:     resourceField(),
        recovery: resourceField()
      }),
      conditions: new fields.SchemaField({
        surprised: new fields.BooleanField({ initial: false }),
        stunned:   new fields.BooleanField({ initial: false }),
        prone:     new fields.BooleanField({ initial: false }),
        grappled:  new fields.BooleanField({ initial: false }),
        bleeding:  new fields.NumberField({ initial: 0, min: 0, integer: true }),
        poisoned:  new fields.NumberField({ initial: 0, min: 0, integer: true }),
        cursed:    new fields.NumberField({ initial: 0, min: 0, integer: true })
      }),
      biography: new fields.HTMLField({ initial: "" }),
      notes:     new fields.HTMLField({ initial: "" }),
      // Free-form per-attribute essence labels surfaced in the sheet header.
      essenceBindings: new fields.SchemaField({
        power:   new fields.StringField({ initial: "" }),
        finesse: new fields.StringField({ initial: "" }),
        soul:    new fields.StringField({ initial: "" }),
        wit:     new fields.StringField({ initial: "" })
      })
    };
  }
}

/* ----------------------------------------- */
/*  Character                                */
/* ----------------------------------------- */

export class CharacterData extends BaseActorData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      raceName: new fields.StringField({ initial: "" }),
      racialGift: new fields.StringField({ initial: "" }),
      archetype: new fields.StringField({ initial: "" }),
      society: new fields.StringField({ initial: "" }),
      origin: new fields.StringField({ initial: "" }),
      backstory: new fields.HTMLField({ initial: "" }),
      soulScars: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: "" }),
          description: new fields.StringField({ initial: "" })
        }),
        { initial: [] }
      )
    });
  }
}

/* ----------------------------------------- */
/*  NPC / Monster                            */
/* ----------------------------------------- */

export class NPCData extends BaseActorData {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      kind: new fields.StringField({
        initial: "monster",
        choices: ["monster", "vortex", "human", "agent", "other"]
      }),
      threatTier: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      // Whether this NPC dissolves on death (magical manifestations do).
      evaporatesOnDeath: new fields.BooleanField({ initial: true })
    });
  }
}
