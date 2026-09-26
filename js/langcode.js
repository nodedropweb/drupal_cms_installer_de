(function (Drupal) {
  'use strict';

  /**
   * Ermittelt die Sprache, in der der Installer mit dem Nutzer spricht.
   *
   * Seit Drupal CMS 2.2 wählt der Nutzer die Sprache über den neuen
   * Sprachumschalter (Dialog), der auf core/install.php?langcode=xx verlinkt.
   * Der Umschalter ist nur im frühen Installer sichtbar. Danach kann der
   * Installer den `langcode`-Parameter auf die Standardsprache des gewählten
   * Site-Templates umstellen (z. B. 'en' bei mehrsprachigen Demo-Inhalten),
   * spricht aber weiterhin in der ursprünglich gewählten Sprache mit dem
   * Nutzer. Deshalb merken wir uns die Sprache aus der frühen Phase in der
   * sessionStorage und verwenden sie danach bevorzugt.
   */
  const STORAGE_KEY = 'drupal_cms_installer_de.langcode';

  function read() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    }
    catch (e) {
      return null;
    }
  }

  function write(langcode) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, langcode);
    }
    catch (e) {
      // sessionStorage nicht verfügbar - dann eben nur über die URL.
    }
  }

  Drupal.installerDe = Drupal.installerDe || {};

  /**
   * @return {string}
   *   Der Sprachcode, Standard 'en'.
   */
  Drupal.installerDe.getLangcode = function () {
    const fromUrl = new URL(window.location.href).searchParams.get('langcode');

    // Früher Installer: Der Sprachumschalter markiert die aktive Sprache mit
    // .is-selected - das ist die verlässlichste Quelle (ohne ?langcode= in der
    // URL installiert Drupal CMS auf Englisch). Immer neu merken, damit ein
    // Wert aus einer früheren Installation im selben Tab nicht hängen bleibt.
    if (document.querySelector('.cms-installer__language-switcher')) {
      const selected = document.querySelector('.cms-installer__language-switcher-list a.is-selected');
      const langcode = (selected && new URL(selected.href, window.location.href).searchParams.get('langcode'))
        || fromUrl
        || 'en';
      write(langcode);
      return langcode;
    }
    return read() ?? fromUrl ?? 'en';
  };

})(Drupal);
