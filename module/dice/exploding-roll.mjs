/**
 * ExplodingRoll — implements Veiled Earth Directive's chain-advancing
 * exploding dice mechanic.
 *
 * Mechanics summary:
 *   - The check rolls (count × dN) for the skill's current chain entry.
 *   - Each die that lands on its maximum face explodes once. The exploded
 *     re-roll uses the *same* die unless this check has already accumulated
 *     the magnitude-many max rolls required for an advancement, at which
 *     point the chain index advances and subsequent re-rolls use the new die.
 *   - The number of advancements triggered during this check is recorded on
 *     `roll.options.advancementsTriggered` so the Item document can persist it.
 *
 * This is a thin first pass: it produces a numeric total via Foundry's roll
 * pipeline by replacing the formula with a flat "Numeric" term equal to the
 * computed total. We can swap in a richer DiceTerm-driven implementation
 * later without changing the public API.
 */

import { VED } from "../config.mjs";

export class ExplodingRoll extends Roll {
  /**
   * @param {string} formula     A standard "NdF" formula (used for display).
   * @param {object} data        Roll data (unused here, passed to super).
   * @param {object} [options]
   * @param {number} [options.chainIndex=0]   Index into VED.dieChain.
   * @param {number} [options.magnitude=1]    Threshold of max-rolls per advancement.
   */
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
    this.options.chainIndex ??= 0;
    this.options.magnitude  ??= 1;
    this.options.advancementsTriggered = 0;
    this.options.rollLog = [];
  }

  /** @override */
  async _evaluate(opts = {}) {
    const result = await this._evaluateChain();
    // Substitute a single numeric term so total tracking and message rendering
    // both work, but leave _formula alone so chat shows the original "NdF".
    const NumericTerm = foundry.dice?.terms?.NumericTerm ?? globalThis.NumericTerm;
    this.terms = [new NumericTerm({ number: result.total })];
    this._total = result.total;
    this._evaluated = true;
    return this;
  }

  async _evaluateChain() {
    let chainIndex = this.options.chainIndex;
    let magnitude = Math.max(1, this.options.magnitude);
    let entry = VED.dieChain[Math.min(chainIndex, VED.dieChain.length - 1)];

    let total = 0;
    let maxTally = 0;

    // Initial roll of all dice in the entry.
    const initialResults = await rollDice(entry.count, entry.faces);
    this.options.rollLog.push({
      kind: "initial",
      die: `${entry.count}d${entry.faces}`,
      values: initialResults
    });
    for (const v of initialResults) total += v;

    // Each die that hit max queues an explosion using the (possibly advancing) current die.
    let pendingExplosions = initialResults.filter(v => v === entry.faces).length;
    maxTally += pendingExplosions;

    // Advance up front if the initial roll already hit threshold(s).
    while (maxTally >= magnitude && chainIndex < VED.dieChain.length - 1) {
      maxTally -= magnitude;
      chainIndex += 1;
      this.options.advancementsTriggered += 1;
      entry = VED.dieChain[chainIndex];
      this.options.rollLog.push({ kind: "advance", to: `${entry.count}d${entry.faces}` });
    }

    // Resolve explosions one die at a time on the *current* chain entry.
    while (pendingExplosions > 0) {
      pendingExplosions -= 1;
      const [v] = await rollDice(1, entry.faces);
      this.options.rollLog.push({
        kind: "explosion",
        die: `1d${entry.faces}`,
        value: v
      });
      total += v;

      if (v === entry.faces) {
        maxTally += 1;
        // Advance and re-anchor the die mid-chain if threshold met.
        if (maxTally >= magnitude && chainIndex < VED.dieChain.length - 1) {
          maxTally -= magnitude;
          chainIndex += 1;
          this.options.advancementsTriggered += 1;
          entry = VED.dieChain[chainIndex];
          this.options.rollLog.push({ kind: "advance", to: `${entry.count}d${entry.faces}` });
        }
        pendingExplosions += 1;
      }
    }

    return { total };
  }
}

/**
 * Roll N dice of size F using Foundry's dice classes when available, falling
 * back to Math.random for headless tests.
 */
async function rollDice(count, faces) {
  const Die = foundry.dice?.terms?.Die ?? globalThis.Die;
  if (Die) {
    const die = new Die({ number: count, faces });
    await die.evaluate();
    return die.results.map(r => r.result);
  }
  const out = [];
  for (let i = 0; i < count; i++) out.push(1 + Math.floor(Math.random() * faces));
  return out;
}
