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
   * Returns the currently selected langcode from the URL, defaulting to 'en'.
   *
   * @return {string}
   */
  function getCurrentLangcode() {
    return new URL(window.location.href).searchParams.get('langcode') ?? 'en';
  }

  /**
   * Override Drupal.theme.progressBar to inject a translated subhead.
   *
   * The original implementation is preserved for all non-translated languages.
   * We store the original theme function so it can still be called if needed.
   */
  const _originalProgressBar = Drupal.theme.progressBar;

  Drupal.theme.progressBar = function (id) {
    const langcode = getCurrentLangcode();
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

})(Drupal);
