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

> ⚠️ Composer führt `post-install-cmd`/`post-update-cmd`-Scripts **nur aus dem Root-Package**
> aus, nicht aus Abhängigkeiten. Der `theme-fix.php`-Patch wird also **nicht** automatisch bei
> jedem `composer update` neu angewendet — ein Update von `drupal/drupal_cms_installer` kann
> die Datei `drupal_cms_installer.info.yml` überschreiben und den Patch damit zurücksetzen.
> Führe in diesem Fall `installer_de_patch.sh` (siehe unten) erneut in deinem Projektverzeichnis
> aus, oder rufe `php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php` manuell auf.

### Schnelle Installation

Das Script erkennt automatisch, ob es ein **frisches** Drupal CMS installieren soll oder ob es
ein **bereits per Composer installiertes** Drupal-CMS-Projekt nachträglich patchen soll:

* **Frische Installation**: Führe das Script in einem leeren Verzeichnis aus. Es lädt Drupal
  CMS per `composer create-project` in einen neuen Unterordner `cms/` und wendet den Patch dort an.
* **Bestehendes Projekt**: Führe das Script direkt im Wurzelverzeichnis deines bestehenden
  Drupal-CMS-Composer-Projekts aus (dort, wo `composer.json` und `web/` liegen — z.B. dein
  Projekt-Root, nicht der `web/`-Ordner selbst). Das Script erkennt die vorhandene Installation
  an `web/profiles/contrib/drupal_cms_installer` und bindet das deutsche Theme direkt dort ein,
  statt ein neues, ungenutztes Projekt anzulegen.

  Wichtig: Ist die Seite bereits fertig installiert (es existiert schon eine
  `web/sites/default/settings.php`), hat der Patch keinen sichtbaren Effekt auf die laufende
  Seite — der Installer-Theme-Fix greift nur bei einem (erneuten) Aufruf von `core/install.php`.

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

> ⚠️ Composer only runs `post-install-cmd`/`post-update-cmd` scripts from the **root package**,
> never from dependencies. The `theme-fix.php` patch is therefore **not** re-applied
> automatically on every `composer update` — updating `drupal/drupal_cms_installer` can
> overwrite `drupal_cms_installer.info.yml` and reset the patch. Re-run `installer_de_patch.sh`
> (see below) in your project directory, or call
> `php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php` manually.

### Quick Installation

The script automatically detects whether to install a **fresh** Drupal CMS or patch an
**already Composer-installed** Drupal CMS project:

* **Fresh install**: Run the script in an empty directory. It downloads Drupal CMS via
  `composer create-project` into a new `cms/` subfolder and applies the patch there.
* **Existing project**: Run the script directly in the root of your existing Drupal CMS
  Composer project (where `composer.json` and `web/` live — your project root, not the
  `web/` folder itself). The script detects the existing installation via
  `web/profiles/contrib/drupal_cms_installer` and wires the German theme in directly, instead
  of creating a new, unused project.

  Note: if the site is already fully installed (a `web/sites/default/settings.php` already
  exists), the patch has no visible effect on the running site — the installer theme fix only
  applies the next time `core/install.php` runs.

```bash
curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash
```

## 🛠 Technische Details / Technical Details

* **Package Name**: `drupal/drupal_cms_installer_de`
* **Type**: `drupal-profile`
* **Base Theme**: `drupal_cms_installer_theme`
* **License**: `GPL-2.0-or-later`
