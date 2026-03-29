# Drupal CMS Installer - Deutsche Anpassung / German Localization

Dieses Repository bietet eine spezialisierte Theme-Erweiterung für den **Drupal CMS Installer** (Starshot), um die Installationsroutine vollständig auf Deutsch zu lokalisieren.

This repository provides a specialized theme extension for the **Drupal CMS Installer** (Starshot) to fully localize the installation routine into German.

---

## 🇩🇪 Deutsch

### Was macht dieses Paket?
Der Standard-Installer von Drupal CMS ist aktuell auf Englisch festgeschrieben. 
Dieses Paket greift in die Erstinsalltion im Webbrowser ein, sobald "Deutsch" als Installationssprache gewählt wird:

* **Automatisches Theme-Patching**: Ein PHP-Script (`scripts/theme-fix.php`) passt die Konfiguration des Original-Installers (`drupal_cms_installer.info.yml`) automatisch an, um dieses Theme als Standard zu setzen.
* **UI-Übersetzungen**: Über `js/installer-translations.js` werden englische Texte wie "Choose a site template" direkt im Browser durch deutsche Entsprechungen ersetzt.
* **Fortschrittsanzeige**: Die Fortschrittsbalken werden via `js/progress-override.js` angepasst, um deutsche Statusmeldungen anzuzeigen.
* **Nahtlose Integration**: Das Paket nutzt Composer-Scripts (`post-install-cmd`), um die Änderungen bei jeder Installation oder Aktualisierung sicherzustellen.

### Schnelle Installation
Nutze das mitgelieferte Bash-Script, um ein Drupal CMS direkt von Drupal org herunterzuladen und den Patch aus dieser Repo anzuwenden, damit der Installer im Webbrowser komplett lokaliasiert wird.

```bash
curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash
```
---

## 🇺🇸 English

### What does this package do?
The default Drupal CMS installer is currently hardcoded for English. This package intervenes as soon as "German" is selected as the installation language:

* **Automatic Theme Patching**: A PHP script (`scripts/theme-fix.php`) automatically modifies the original installer's configuration (`drupal_cms_installer.info.yml`) to set this theme as the default.
* **UI Translations**: Using `js/installer-translations.js`, English strings like "Choose a site template" are replaced with German equivalents directly in the browser.
* **Progress Bar Override**: Customizes the progress bar via `js/progress-override.js` to display German status messages.
* **Seamless Integration**: The package utilizes Composer scripts (`post-install-cmd`) to ensure changes are applied during every install or update.

### Quick Installation
Verwenden Sie das mitgelieferte Bash-Skript, um ein Drupal-CMS direkt von Drupal.org herunterzuladen und den Patch aus diesem Repository anzuwenden, damit der Installationsvorgang vollständig im Webbrowser durchgeführt werden kann.

```bash
curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash
```

## 🛠 Technische Details / Technical Details

* **Package Name**: `drupal/drupal_cms_installer_de`
* **Type**: `drupal-profile`
* **Base Theme**: `drupal_cms_installer_theme`
* **License**: `GPL-2.0-or-later`
