/**
 * ApplicationV2-based item sheet for The Veiled Earth Directive.
 *
 * One sheet class handles every item subtype; the template chosen at render
 * time depends on `item.type`.
 */

import { SYSTEM_ID, VED } from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class VEDItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["ved", "sheet", "item"],
    position: { width: 560, height: 540 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    main: {
      // Template is resolved per render based on item type — see _configureRenderParts.
      template: `systems/${SYSTEM_ID}/templates/item/skill-sheet.hbs`,
      scrollable: [".sheet-body"]
    }
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    parts.main = {
      ...parts.main,
      template: `systems/${SYSTEM_ID}/templates/item/${this.item.type}-sheet.hbs`
    };
    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.config = VED;
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "", { async: true, secrets: this.isOwner }
    );
    return context;
  }
}
