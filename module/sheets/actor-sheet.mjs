/**
 * ApplicationV2-based actor sheets for The Veiled Earth Directive.
 *
 * The character and NPC sheets share a base class. Each subtype provides its
 * own template path and a flag for the bits the other doesn't render.
 */

import { SYSTEM_ID, VED } from "../config.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

const STACK_CONDITIONS = [
  {
    key: "bleeding",
    icon: "fa-regular fa-droplet",
    tooltip: "VED.Stack.BleedingTooltip"
  },
  {
    key: "poisoned",
    icon: "fa-regular fa-skull-crossbones",
    tooltip: "VED.Stack.PoisonedTooltip"
  },
  {
    key: "cursed",
    icon: "fa-regular fa-staff-snake",
    tooltip: "VED.Stack.CursedTooltip"
  }
];

class VEDActorSheetBase extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["ved", "sheet", "actor"],
    position: { width: 720, height: 720 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      rollSkill: VEDActorSheetBase.#onRollSkill,
      rollAttribute: VEDActorSheetBase.#onRollAttribute,
      createSkill: VEDActorSheetBase.#onCreateSkill,
      editItem: VEDActorSheetBase.#onEditItem,
      deleteItem: VEDActorSheetBase.#onDeleteItem,
      adjustStack: VEDActorSheetBase.#onAdjustStack,
      triggerStackDamage: VEDActorSheetBase.#onTriggerStackDamage
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.config = VED;
    context.skillsByAttribute = this.#groupSkills();
    context.itemsByType = this.#groupItems();
    context.stackConditions = STACK_CONDITIONS.map(sc => ({
      ...sc,
      value: this.actor.system.conditions?.[sc.key] ?? 0
    }));
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography ?? "", { async: true, secrets: this.isOwner }
    );
    return context;
  }

  #groupSkills() {
    const out = { power: [], finesse: [], soul: [], wit: [] };
    for (const item of this.actor.items) {
      if (item.type !== "skill") continue;
      const a = item.system.attribute;
      if (out[a]) out[a].push(item);
    }
    return out;
  }

  #groupItems() {
    const out = { essence: [], race: [], archetype: [], gear: [], condition: [] };
    for (const item of this.actor.items) {
      if (out[item.type]) out[item.type].push(item);
    }
    return out;
  }

  /* ------------- Action Handlers ------------- */

  static async #onRollSkill(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    if (!id) return;
    return this.actor.rollSkill(id);
  }

  static async #onRollAttribute(event, target) {
    const attr = target.dataset.attribute;
    if (!attr) return;
    return this.actor.rollAttribute(attr);
  }

  static async #onCreateSkill(event, target) {
    const attribute = target.dataset.attribute ?? "power";
    await foundry.documents.Item.implementation.create({
      name: game.i18n.localize("VED.NewSkill"),
      type: "skill",
      system: { attribute }
    }, { parent: this.actor });
  }

  static async #onEditItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    item?.sheet?.render(true);
  }

  static async #onDeleteItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "VED.Confirm.DeleteTitle" },
      content: `<p>${game.i18n.format("VED.Confirm.DeleteContent", { name: item.name })}</p>`
    });
    if (confirmed) await item.delete();
  }

  static async #onAdjustStack(event, target) {
    const condition = target.dataset.condition;
    if (!condition) return;
    const current = this.actor.system.conditions?.[condition] ?? 0;
    const next = event.shiftKey ? Math.max(0, current - 1) : current + 1;
    await this.actor.update({ [`system.conditions.${condition}`]: next });
  }

  static async #onTriggerStackDamage(event, target) {
    const condition = target.dataset.condition;
    if (!condition) return;
    return this.actor.triggerConditionDamage(condition);
  }
}

/* ------------------------------------------- */
/*  Character Sheet                            */
/* ------------------------------------------- */

export class VEDCharacterSheet extends VEDActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["ved", "sheet", "actor", "character"]
  };

  static PARTS = {
    main: {
      template: `systems/${SYSTEM_ID}/templates/actor/character-sheet.hbs`,
      scrollable: [".sheet-body"]
    }
  };
}

/* ------------------------------------------- */
/*  NPC Sheet                                  */
/* ------------------------------------------- */

export class VEDNPCSheet extends VEDActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["ved", "sheet", "actor", "npc"],
    position: { width: 600, height: 600 }
  };

  static PARTS = {
    main: {
      template: `systems/${SYSTEM_ID}/templates/actor/npc-sheet.hbs`,
      scrollable: [".sheet-body"]
    }
  };
}
