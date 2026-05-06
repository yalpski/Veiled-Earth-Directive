/**
 * Custom Actor document for The Veiled Earth Directive.
 *
 * Derived data:
 *  - Each attribute's die mirrors the highest-tiered owned skill bound to it.
 *  - Resource maximums are calculated as
 *        sum(maxFace × dieCount of attribute's skills) × magnitude.
 *  - The actor's overall magnitude is clamped against attribute magnitudes.
 */

import { VED } from "../config.mjs";
import { ExplodingRoll } from "../dice/exploding-roll.mjs";

const ActorBase = foundry.documents?.Actor ?? globalThis.Actor;

const STACK_DAMAGE_POOLS = {
  bleeding: ["health"],
  poisoned: ["health", "stamina"],
  cursed:   ["health", "mana"]
};

const STACK_LABELS = {
  bleeding: "VED.Condition.Bleeding",
  poisoned: "VED.Condition.Poisoned",
  cursed:   "VED.Condition.Cursed"
};

export class VEDActor extends ActorBase {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const sys = this.system;
    if (!sys?.attributes || !sys?.resources) return;

    const skillsByAttribute = this._collectSkillsByAttribute();

    for (const attr of Object.keys(VED.attributes)) {
      const skills = skillsByAttribute[attr] ?? [];
      const attrData = sys.attributes[attr];
      if (!attrData) continue;

      // Attribute die = highest die in the chain among bound skills.
      const top = skills.reduce((best, s) => {
        const d = s.system.die;
        if (!best || d.chainIndex > best.chainIndex) return d;
        return best;
      }, null);

      if (top) {
        attrData.die.count = top.count;
        attrData.die.faces = top.faces;
        attrData.die.chainIndex = top.chainIndex;
        attrData.magnitude = chainIndexMagnitude(top.chainIndex);
      } else {
        attrData.die.count = 1;
        attrData.die.faces = 4;
        attrData.die.chainIndex = 0;
        attrData.magnitude = 1;
      }

      // Resource max = sum(faces × count) over all attribute skills × magnitude.
      const sumMax = skills.reduce((acc, s) => {
        return acc + (s.system.die.faces * s.system.die.count);
      }, 0);
      const resKey = VED.attributes[attr].resource;
      const res = sys.resources[resKey];
      if (res) {
        res.max = sumMax * (sys.magnitude || 1);
        if (res.value > res.max) res.value = res.max;
      }
    }
  }

  /**
   * Group owned skill items by their bound attribute.
   * @returns {Record<string, Item[]>}
   */
  _collectSkillsByAttribute() {
    const out = { power: [], finesse: [], soul: [], wit: [] };
    for (const item of this.items) {
      if (item.type !== "skill") continue;
      const attr = item.system.attribute;
      if (out[attr]) out[attr].push(item);
    }
    return out;
  }

  /**
   * Roll a skill by id. Stub for the upcoming exploding-dice mechanic.
   * @param {string} skillId  The owned skill item id.
   * @param {object} [options]
   */
  async rollSkill(skillId, options = {}) {
    const skill = this.items.get(skillId);
    if (!skill || skill.type !== "skill") {
      ui.notifications?.warn("VED.Notify.SkillNotFound", { localize: true });
      return null;
    }
    return skill.roll(options);
  }

  /**
   * Roll an attribute directly (no chain advancement — attribute dice mirror
   * their highest associated skill and aren't advanced by attribute rolls).
   * @param {string} key  Attribute key (power | finesse | soul | wit).
   */
  async rollAttribute(key) {
    const attr = this.system?.attributes?.[key];
    if (!attr) return null;
    const formula = `${attr.die.count}d${attr.die.faces}`;
    const roll = new ExplodingRoll(formula, {}, {
      chainIndex: attr.die.chainIndex,
      magnitude: this.system.magnitude || 1
    });
    await roll.evaluate();
    const label = game.i18n.localize(VED.attributes[key]?.label ?? key);
    const essence = this.system.essenceBindings?.[key];
    const flavor = essence
      ? `<strong class="ved-color-${key}">${label}</strong> <em>(${essence})</em>`
      : `<strong class="ved-color-${key}">${label}</strong>`;
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor
    });
    return roll;
  }

  /**
   * Apply per-stack damage for one of the stacking conditions.
   * Per the rules: each tick deals magnitude × stacks to the affected pool(s).
   * @param {"bleeding"|"poisoned"|"cursed"} condition
   */
  async triggerConditionDamage(condition) {
    const pools = STACK_DAMAGE_POOLS[condition];
    if (!pools) return;
    const stacks = this.system.conditions?.[condition] ?? 0;
    if (stacks <= 0) return;
    const magnitude = this.system.magnitude || 1;
    const damage = stacks * magnitude;

    const updates = {};
    for (const pool of pools) {
      const cur = this.system.resources?.[pool]?.value ?? 0;
      updates[`system.resources.${pool}.value`] = Math.max(0, cur - damage);
    }
    await this.update(updates);

    const label = game.i18n.localize(STACK_LABELS[condition] ?? condition);
    const poolNames = pools.map(p => game.i18n.localize(VED.resources[p]?.label ?? p)).join(" + ");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<p><strong>${this.name}</strong> takes <strong>${damage}</strong> ${label} damage to ${poolNames}.</p>`
    });
  }
}

/**
 * Map a die chain index back to its source magnitude (per VED.dieChain).
 */
function chainIndexMagnitude(idx) {
  const clamped = Math.max(0, Math.min(idx, VED.dieChain.length - 1));
  return VED.dieChain[clamped]?.magnitude ?? 1;
}
