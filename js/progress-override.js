(function (Drupal) {
  'use strict';

  /**
   * Translations for the progress bar subheading.
   *
   * Keyed by langcode → the desired text for the
   * `.cms-installer__subhead` element rendered by progress.js.
   */
  const progressSubheadTranslations = {
    de: 'Das dauert nur einen Moment.',
  };

  /**
   * Override Drupal.theme.progressBar to inject a translated subhead.
   *
   * The original implementation is preserved for all non-translated languages.
   * We store the original theme function so it can still be called if needed.
   */
  const _originalProgressBar = Drupal.theme.progressBar;

  Drupal.theme.progressBar = function (id) {
    // @see js/langcode.js
    const langcode = Drupal.installerDe.getLangcode();
    const subhead = progressSubheadTranslations[langcode]
      ?? 'This will only take a moment.'; // English fallback.

    const escapedId = Drupal.checkPlain(id);
    return `
      <p class="cms-installer__subhead">${subhead}</p>
      <div id="${escapedId}" class="progress" aria-live="polite">
      <div class="progress__label">&nbsp;</div>
      <div class="progress__track"><div class="progress__bar"></div></div>
      <div class="progress__percentage visually-hidden"></div>
      <div class="progress__description visually-hidden">&nbsp;</div>
      </div>
    `;
  };

  /**
   * Übersetzungen für die Statusmeldungen der Installations-Batches.
   *
   * Während der Site-Template-Batch läuft, wird das Locale-Modul installiert,
   * die deutschen Core-Übersetzungen werden aber erst ganz am Ende importiert.
   * Dazwischen kommen die Meldungen von RecipeRunner und Batch-API deshalb auf
   * Englisch an ("Installed 20 modules: …", "Completed 3 of 22."), obwohl es
   * für die meisten eine offizielle Übersetzung gibt. Die Meldungen enthalten
   * HTML (<em class="placeholder">…</em>), die Muster lassen es unangetastet.
   *
   * Reihenfolge ist wichtig: spezifische Muster vor dem allgemeinen
   * "Installed @name" des Drupal-CMS-Installers.
   */
  const progressPatterns = {
    de: [
      [/^Completed (\d+) of (\d+)\.$/, '$1 von $2 abgeschlossen.'],
      [/^Installed (\d+) modules: (.+?)\.?$/, '$1 Module installiert: $2.'],
      [/^Installed (.+) module\.$/, 'Modul $1 installiert.'],
      [/^Installed (.+) modules\.$/, 'Module $1 installiert.'],
      [/^Installed (.+) theme\.$/, 'Theme $1 installiert.'],
      [/^Installed configuration for (.+) recipe\.$/, 'Konfiguration des Rezepts $1 installiert.'],
      [/^Created content for (.+) recipe\.$/, 'Inhalt für das Rezept $1 erstellt.'],
      [/^Applied (.+) recipe\.$/, 'Rezept $1 angewendet.'],
      [/^Installing (.+)\. This may take a few minutes\.$/, '$1 wird installiert. Dies kann einige Minuten dauern.'],
      [/^Installed (.+)$/, '$1 installiert'],
      [/^Initializing\.$/, 'Initialisierung.'],
    ],
  };

  function translateProgress(text) {
    const list = progressPatterns[Drupal.installerDe.getLangcode()];
    if (!list || typeof text !== 'string') {
      return text;
    }
    const trimmed = text.trim();
    for (const [pattern, replacement] of list) {
      if (pattern.test(trimmed)) {
        return trimmed.replace(pattern, replacement);
      }
    }
    return text;
  }

  // progress.js ist über die Bibliotheks-Abhängigkeit bereits geladen.
  if (Drupal.ProgressBar && Drupal.ProgressBar.prototype.setProgress) {
    const _originalSetProgress = Drupal.ProgressBar.prototype.setProgress;
    Drupal.ProgressBar.prototype.setProgress = function (percentage, message, label) {
      return _originalSetProgress.call(
        this,
        percentage,
        translateProgress(message),
        translateProgress(label),
      );
    };
  }

})(Drupal);
