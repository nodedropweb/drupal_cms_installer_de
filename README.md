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
* **Zusatzmodule**: `scripts/i18n-extras-fix.php` sorgt dafür, dass das Rezept `recipes/i18n_extras` (pb_localizer, yoast_seo_i18n, default_content_locale, Gin-Darkmode „auto") direkt nach dem gewählten Site-Template angewendet wird.

### Kompatibilität: Drupal CMS 2.2

Getestet mit Drupal CMS **2.2.0** (`drupal/drupal_cms_installer` 2.2.0, Drupal Core 11.4); 2.1.x wird weiterhin unterstützt.
Alle Änderungen mit Sinn und Zweck stehen im [CHANGELOG](CHANGELOG.md).
Was sich im Installer 2.2 geändert hat und wie dieses Paket darauf reagiert:

| Änderung in 2.2 | Anpassung hier |
|---|---|
| `RecipeHandler` entfernt; Rezepte werden nur noch in `drupal_cms_installer_apply_recipes()` bzw. `_drupal_cms_installer_require_recipe()` (im `.profile`) angewendet | `i18n-extras-fix.php` patcht jetzt das `.profile` an beiden Stellen; i18n_extras läuft damit auch bei per Composer nachgeladenen Templates garantiert **nach** dem Template. Fallback für 2.1.x bleibt erhalten. |
| Neuer Sprachumschalter (Button + Dialog als SDC-Komponente statt `<select>` im Header), bindet `check.svg`, `x-circle.svg` u. a. über `active_theme_path()` ein | SVGs in `images/` auf 2.2 aktualisiert, `check.svg`/`search.svg` ergänzt (ohne sie bricht der Installer mit einem Twig-Fehler ab). Dark-Mode-Styles für Button, Dialog, Sprachliste und Lade-Overlay. |
| Offizielle Installer-Übersetzung wird jetzt von localize.drupal.org geladen (`drupal_cms_installer-2.2.x.de.po`) | JS-Übersetzungen ergänzen nur noch, was dort fehlt (Template-Beschreibungen, neue Dialog-/Abschluss-Strings inkl. `aria-label`/`placeholder`), und korrigieren einzelne offizielle Übersetzungen. |
| Der `langcode`-Parameter kann nach der Template-Wahl auf die Standardsprache des Templates wechseln | Sprache wird in der frühen Installer-Phase gemerkt (`js/langcode.js`), damit die Übersetzungen danach nicht abbrechen. |
| Neue Zwischenseite „Your site is almost ready" mit Spinner | Übersetzt und im Dark Mode angepasst. |

### Vorlagen-Inhalte auf Deutsch (Default Content Locale)

`installer_de_patch.sh` installiert `drupal/default_content_locale:1.x-dev@dev`. Das Modul bringt
Übersetzungen für die Standardinhalte von Vorlagen mit (z. B. `translations/haven.de.po`), damit
z. B. **Haven** direkt nach der Installation deutsch ist. Damit das funktioniert, passt das Skript
den Installer an drei Stellen an:

* **Zeitpunkt** (`scripts/i18n-extras-fix.php`): Das Modul muss aktiv sein, *bevor* die Inhalte der
  Vorlage importiert werden. Deshalb wird es direkt vor jedem Inhaltsimport installiert, das
  Canvas-Untermodul `default_content_locale_canvas` sobald Canvas aktiv ist. Im i18n_extras-Rezept,
  das erst nach der Vorlage läuft, käme es zu spät.
* **Modulfehler** (`scripts/default-content-locale-fix.php`): Die 1.x-dev-Version legt Übersetzungen
  ohne Pflichtfelder an, und die Installation bricht mit `Column 'status' cannot be null` ab.
  Außerdem bliebe eine verwaiste englische Fassung zurück, sodass jeder Inhalt doppelt erscheint.
  Die Korrektur ersetzt auf einsprachigen Seiten die englischen Werte direkt. Sobald das Modul den
  Fehler selbst behebt, greift der Patch nicht mehr.
* **URL-Aliase**: Vorlagen wie Haven und Byte liefern Aliase wie `/home` fest als Englisch. Auf einer
  deutschen Seite lieferte die Startseite deshalb 404. Die Aliase werden jetzt auf die
  Installationssprache umgestellt.

> ⚠️ **Twig 3.30**: Twig 3.30.0 (25.09.2026) ist mit Drupal Core 11.4 inkompatibel. Schon die erste
> Installer-Seite bricht dann ab mit `EscaperRuntime::escape(): Argument #4 ($autoescape) must be of
> type bool, null given`. Ist Twig 3.30.x installiert, begrenzt `installer_de_patch.sh` Twig deshalb
> automatisch per `composer require "twig/twig:>=3.28 <3.30"`. Sobald Drupal Core das behoben hat,
> lässt sich die Begrenzung mit `composer remove twig/twig` wieder entfernen.

Zum Testen eines Branches oder lokalen Klons kann die Quelle des Themes überschrieben werden:

```bash
INSTALLER_DE_REPO=file:///pfad/zum/klon INSTALLER_DE_BRANCH=mein-branch bash installer_de_patch.sh
```

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
  Über ein optionales erstes Argument lässt sich der Zielordner anpassen (Default bleibt `cms`).
  Da bei `curl | bash` Argumente nicht automatisch durchgereicht werden, ist die `-s --`-Syntax
  nötig:

  ```bash
  curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash -s -- drupalcms
  ```
* **Bestehendes Projekt**: Führe das Script direkt im Wurzelverzeichnis deines bestehenden
  Drupal-CMS-Composer-Projekts aus (dort, wo `composer.json` und `web/` liegen — z.B. dein
  Projekt-Root, nicht der `web/`-Ordner selbst). Das Script erkennt die vorhandene Installation
  an `web/profiles/contrib/drupal_cms_installer` und bindet das deutsche Theme direkt dort ein,
  statt ein neues, ungenutztes Projekt anzulegen.

  Wichtig: Ist die Seite bereits fertig installiert (geprüft per `drush status`, nicht über die
  bloße Existenz von `settings.php`), hat der Patch keinen sichtbaren Effekt auf die laufende
  Seite — der Installer-Theme-Fix greift nur bei einem (erneuten) Aufruf von `core/install.php`.
  In diesem Fall entfernt das Script den Theme-Ordner stattdessen automatisch wieder und setzt
  `drupal_cms_installer.info.yml` auf das Original-Theme zurück. Wurde die Datenbank später
  geleert (z. B. `drush sql:drop`), erkennt das Script das und spielt das Theme erneut ein.

> ℹ️ **Kein Composer-Eintrag**: `drupal_cms_installer_de` ist kein echtes drupal.org-Projekt und
> wird deshalb bewusst **nicht** per `composer require` eingebunden — das Script lädt die Dateien
> stattdessen direkt per `git clone` nach `web/profiles/contrib/drupal_cms_installer_de` (dort
> findet Drupal Erweiterungen ohnehin automatisch). `composer.json` und `composer.lock` bleiben
> dadurch komplett unverändert; es gibt keinen VCS-Repository-Eintrag, der spätere
> `composer`-Operationen (z. B. Project Browsers UI-Install über Package Manager) mit einem
> Host-Key- oder Auth-Fehler zum Absturz bringen könnte. Nur die echten drupal.org-Zusatzmodule
> (`pb_localizer`, `yoast_seo_i18n`, `default_content_locale`) landen regulär in `composer.json`.
> Führe `installer_de_patch.sh` **ein zweites Mal** im selben Verzeichnis aus, sobald die
> Installation abgeschlossen ist — das Script erkennt das automatisch, entfernt den Theme-Ordner
> wieder (nach der Ersteinrichtung ist er ohnehin inaktiv) und setzt den Installer zurück.

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
* **Add-on modules**: `scripts/i18n-extras-fix.php` makes sure the `recipes/i18n_extras` recipe (pb_localizer, yoast_seo_i18n, default_content_locale, Gin dark mode "auto") is applied right after the chosen site template.

### Compatibility: Drupal CMS 2.2

Tested with Drupal CMS **2.2.0** (`drupal/drupal_cms_installer` 2.2.0, Drupal core 11.4); 2.1.x is still supported.
All changes, with their purpose explained, are listed in the [CHANGELOG](CHANGELOG.md#220--adaptation-to-drupal-cms-22).
The 2.2 installer removed `RecipeHandler`, so the i18n_extras hook now patches `drupal_cms_installer.profile`
(both for local and Composer-downloaded site templates). The new dialog-based language switcher includes
SVGs via `active_theme_path()`, so this theme's `images/` were synced with 2.2 (adding `check.svg` and
`search.svg`, without which the installer fails with a Twig error), and dark-mode styles were added for it.
Since 2.2 downloads an official German `.po` file for the installer, the JS translations now only fill the
gaps (site template descriptions, new dialog/finishing strings incl. `aria-label`/`placeholder`).

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
  `composer create-project` into a new `cms/` subfolder and applies the patch there. An optional
  first argument overrides the target folder (default stays `cms`). Since `curl | bash` doesn't
  forward arguments automatically, use the `-s --` syntax:

  ```bash
  curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash -s -- drupalcms
  ```
* **Existing project**: Run the script directly in the root of your existing Drupal CMS
  Composer project (where `composer.json` and `web/` live — your project root, not the
  `web/` folder itself). The script detects the existing installation via
  `web/profiles/contrib/drupal_cms_installer` and wires the German theme in directly, instead
  of creating a new, unused project.

  Note: if the site is already fully installed (checked via `drush status`, not merely by the
  presence of `settings.php`), the patch has no visible effect on the running site — the
  installer theme fix only applies the next time `core/install.php` runs. In that case the
  script instead removes the theme folder and restores the original theme in
  `drupal_cms_installer.info.yml`. If the database is emptied later (e.g. `drush sql:drop`),
  the script detects that and wires the theme in again.

> ℹ️ **No composer entry**: `drupal_cms_installer_de` isn't a real drupal.org project, so it's
> deliberately **not** installed via `composer require` — the script instead downloads it
> directly with `git clone` into `web/profiles/contrib/drupal_cms_installer_de` (where Drupal
> discovers extensions automatically anyway). `composer.json` and `composer.lock` stay completely
> untouched — there's no VCS repository entry that could make later `composer` operations
> (e.g. Project Browser's UI install via Package Manager) fail with a host-key or auth error.
> Only the real drupal.org add-on modules (`pb_localizer`, `yoast_seo_i18n`,
> `default_content_locale`) go into `composer.json` as usual.
> Run `installer_de_patch.sh` a **second time** in the same directory once the installation is
> finished — the script detects that automatically, removes the theme folder again (it's inert
> after the initial setup anyway) and restores the installer.

```bash
curl -sSL https://raw.githubusercontent.com/nodedropweb/drupal_cms_installer_de/master/installer_de_patch.sh | bash
```

## 🛠 Technische Details / Technical Details

* **Package Name**: `drupal/drupal_cms_installer_de`
* **Type**: `drupal-profile`
* **Base Theme**: `drupal_cms_installer_theme`
* **License**: `GPL-2.0-or-later`
