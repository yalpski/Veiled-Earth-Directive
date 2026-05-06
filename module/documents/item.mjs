/**
 * Custom Item document for The Veiled Earth Directive.
 *
 * Skills handle the exploding-dice mechanic; other item types are mostly
 * passive containers for game content.
 */

import { VED } from "../config.mjs";
import { ExplodingRoll } from "../dice/exploding-roll.mjs";

const ItemBase = foundry.documents?.Item ?? globalThis.Item;

export class VEDItem extends ItemBase {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "skill") this._prepareSkillDerived();
  }

  _prepareSkillDerived() {
    const die = this.system.die;
    if (!die) return;
    // Keep count/faces in sync with the chain index so older imports auto-heal.
    const entry = VED.dieChain[Math.max(0, Math.min(die.chainIndex, VED.dieChain.length - 1))];
    if (entry) {
      die.count = entry.count;
      die.faces = entry.faces;
    }
  }

  /**
   * Roll this skill. Currently produces a basic exploding chain roll and posts
   * to chat. Advancement-on-max-roll bookkeeping is stubbed for follow-up work.
   *
   * @param {object} [options]
   * @param {boolean} [options.advance=true]   Apply advancement updates on max rolls.
   * @returns {Promise<ExplodingRoll|null>}
   */
  async roll({ advance = true } = {}) {
    if (this.type !== "skill") return null;

    const actor = this.actor;
    const sys = this.system;
    const formula = `${sys.die.count}d${sys.die.faces}`;

    const roll = new ExplodingRoll(formula, {}, {
      chainIndex: sys.die.chainIndex,
      magnitude: actor?.system?.magnitude ?? sys.magnitude ?? 1,
      skillId: this.id,
      actorId: actor?.id
    });

    await roll.evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `<strong>${this.name}</strong>`
    });

    if (advance && actor) await this._maybeAdvance(roll);
    return roll;
  }

  /**
   * Apply chain-index advancement based on the roll's recorded max-roll count.
   * @param {ExplodingRoll} roll
   */
  async _maybeAdvance(roll) {
    const advancements = roll.options?.advancementsTriggered ?? 0;
    if (!advancements) return;

    const newIndex = Math.min(
      this.system.die.chainIndex + advancements,
      VED.dieChain.length - 1
    );
    if (newIndex === this.system.die.chainIndex) return;

    await this.update({ "system.die.chainIndex": newIndex, "system.die.advancementTally": 0 });
    ui.notifications?.info(
      game.i18n.format("VED.Notify.SkillAdvanced", {
        skill: this.name,
        die: `${VED.dieChain[newIndex].count}d${VED.dieChain[newIndex].faces}`
      })
    );
  }
}
