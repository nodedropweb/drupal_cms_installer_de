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
    const stored = read();
    const earlyInstaller = document.querySelector('.cms-installer__language-switcher') !== null;

    if (fromUrl && (earlyInstaller || !stored)) {
      write(fromUrl);
      return fromUrl;
    }
    return stored ?? fromUrl ?? 'en';
  };

})(Drupal);
