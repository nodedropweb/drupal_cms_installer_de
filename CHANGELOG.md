# Changelog

🇩🇪 [Deutsch](#220--anpassung-an-drupal-cms-22) · 🇺🇸 [English](#220--adaptation-to-drupal-cms-22)

## 2.2.0 – Anpassung an Drupal CMS 2.2

Getestet mit Drupal CMS **2.2.0** (`drupal/drupal_cms_installer` 2.2.0, Drupal Core 11.4.7, PHP 8.5).
Drupal CMS 2.1.x wird weiterhin unterstützt.

Getestet wurde der vollständige Ablauf: frisches Projekt per `installer_de_patch.sh`, danach jeder
Schritt des Web-Installers live im Browser auf Deutsch – Sprachwahl, Datenbank, Website-Name,
Vorlagenauswahl inkl. Lizenzdialog, Benutzerkonto, Installation – mit den Vorlagen **Haven** und
**Byte**, die per Composer nachgeladen werden. Zusätzlich getestet: das Patchen eines bestehenden
Projekts, das Aufräumen nach der Installation und die Neuinstallation nach `drush sql:drop`.

Die Änderungen sind nach ihrem **Zweck** gruppiert: Was ging kaputt oder fehlte, warum, und was tut
die Änderung dagegen.

---

### 1. Der Installer muss mit Drupal CMS 2.2 überhaupt funktionieren

#### 1.1 i18n_extras-Rezept wird wieder angewendet
**Problem:** Drupal CMS 2.2 hat die Klasse `RecipeHandler` entfernt. Bisher hat sich
`scripts/i18n-extras-fix.php` an dessen `enqueue()`-Aufruf in `SiteTemplateForm` gehängt. Diese
Stelle gibt es nicht mehr. Das Skript meldete nur eine Warnung, und die Zusatzmodule (pb_localizer,
yoast_seo_i18n, default_content_locale, Gin-Darkmode) wurden **stillschweigend nicht mehr
installiert**.

**Lösung:** Rezepte werden in 2.2 nur noch im `drupal_cms_installer.profile` in Batch-Operationen
übersetzt. Dabei gibt es zwei Wege: Lokal vorhandene Vorlagen laufen im selben Batch, per Composer
nachgeladene Vorlagen in einem späteren Batch. Das Skript hängt i18n_extras an **beiden** Stellen
direkt hinter die Vorlage.

**Nebeneffekt:** In 2.1 lief i18n_extras bei nachgeladenen Vorlagen wie „convene“ oft *vor* der
Vorlage. Jetzt ist die Reihenfolge in beiden Fällen garantiert. Für 2.1.x bleibt der alte Weg als
Fallback erhalten.

#### 1.2 Installer startet wieder (fehlende Icons)
**Problem:** Der neue Sprachumschalter in 2.2 ist ein Dialog. Er bindet seine Icons über
`active_theme_path()` ein, also aus dem **gerade aktiven Theme** – das ist unser DE-Theme. Dort
fehlte `check.svg`, und der Installer wäre mit einem Twig-Fehler abgebrochen.

**Lösung:** Die Icons in `images/` sind jetzt auf dem Stand von 2.2. Neu sind `check.svg` und
`search.svg`, aktualisiert wurden `chevron-down`, `spinner`, `translate` und `x-circle`. Mit dem alten
`x-circle.svg` wäre der Schließen-Button außerdem weiß auf weiß gewesen.

#### 1.3 Twig 3.30 bricht jede Neuinstallation (`installer_de_patch.sh`)
**Problem:** Twig **3.30.0** (erschienen am 25.09.2026) ruft den Escaper jetzt direkt auf. Drupal Core
11.4 biegt den `escape`-Filter aber auf eine Funktion mit anderer Signatur um. Schon die erste
Installer-Seite bricht deshalb ab:
`EscaperRuntime::escape(): Argument #4 ($autoescape) must be of type bool, null given`.
Weil `composer install` ohne Lock-Datei immer die neueste Version zieht, betrifft das **jede**
Neuinstallation – auch ohne dieses Paket.

**Lösung:** Nur wenn Twig 3.30.x installiert ist, begrenzt das Skript Twig per
`composer require "twig/twig:>=3.28 <3.30"`. Sobald Drupal Core das behoben hat, lässt sich die
Begrenzung mit `composer remove twig/twig` wieder entfernen.

---

### 2. Aufräumen und Neuinstallation dürfen nichts kaputt machen

#### 2.1 Neuinstallation nach dem Aufräumen
**Problem:** Der zweite Skriptlauf nach der Installation löscht das DE-Theme. Der Patch in
`drupal_cms_installer.info.yml` (`theme: drupal_cms_installer_de`) blieb aber stehen. Jede spätere
Neuinstallation, etwa nach `drush sql:drop`, brach deshalb ab mit
`Call to a member function getPathname() on null in InstallerKernel->getBaseThemes()`.

**Lösung:** Das Aufräumen setzt die Zeile wieder auf `drupal_cms_installer_theme` zurück.

#### 2.2 Zuverlässige Erkennung „schon installiert?“
**Problem:** Das Skript hielt eine Seite für installiert, sobald `settings.php` existierte. Nach
`drush sql:drop` existiert die Datei aber noch, obwohl die Datenbank leer ist. Ein erneuter Lauf
hätte dann nur aufgeräumt, statt das Theme einzuspielen.

**Lösung:** Die Prüfung läuft jetzt über `drush status` (Bootstrap erfolgreich?). Nur wenn Drush fehlt,
zählt weiter die Datei `settings.php`.

---

### 3. Alles, was man im Installer sieht, ist deutsch

#### 3.1 Neue Oberflächentexte von 2.2
**Hintergrund:** Seit 2.2 lädt der Installer selbst eine offizielle deutsche Übersetzung von
localize.drupal.org. Die ist aber unvollständig. Unsere JS-Übersetzungen (`js/installer-translations.js`)
decken deshalb nur noch ab, was dort fehlt oder falsch ist:
- der neue **Sprachdialog** („Install your site in a different language“, Suchfeld, Schließen-Button,
  „Select … and close dialog“). Dafür übersetzt das Skript jetzt auch Attribute wie `aria-label`,
  `placeholder` und `title`, damit Screenreader ebenfalls Deutsch vorlesen;
- die **Beschreibungen der Vorlagen**, „Learn more“ und „License key“. Diese Texte kommen aus der
  Vorlagenliste und sind offiziell gar nicht übersetzbar;
- die neue **Abschlussseite** („Your site is almost ready“);
- **Korrekturen** an offiziellen oder Core-Übersetzungen: „Frei“ → „Kostenlos“,
  „Schluss machen“ → „Abschluss“, „MySQL, MariaDB, oder equivalent“ → „MySQL, MariaDB oder kompatibel“;
- der Vorgabewert **„Meine Drupal CMS Seite“ → „Meine Drupal-CMS-Website“**, passend zur Überschrift,
  die von „Website“ spricht. Er wird nur ersetzt, solange der Nutzer nichts geändert hat;
- Tippfehler „Lizenztschlüssel“ behoben.

#### 3.2 Statusmeldungen während der Installation (`js/progress-override.js`)
**Problem:** Die Fortschrittsanzeige zeigte in der ersten Hälfte englische Meldungen wie
„Installed 20 modules: …“, „Completed 3 of 22.“ und „Installed Haven theme.“. Die deutschen
Core-Übersetzungen werden erst ganz am Ende importiert. Für manche Meldungen gibt es gar keine.

**Lösung:** Die Meldungen werden im Browser übersetzt, bevor sie angezeigt werden. Das geschieht über
Muster, die Platzhalter wie Modul- und Rezeptnamen unverändert lassen.

#### 3.3 Richtige Sprache erkennen (`js/langcode.js`, neu)
**Problem:** In 2.2 kann der Installer den `langcode`-Parameter nach der Vorlagenwahl auf die
Standardsprache der Vorlage umstellen, spricht aber weiter in der gewählten Sprache mit dem Nutzer.
Die Übersetzungen dürfen dann nicht abbrechen. Umgekehrt darf eine Sprache aus einer früheren
Installation im selben Browser-Tab nicht „hängen bleiben“.

**Lösung:** Im frühen Installer wird die aktive Sprache direkt aus dem Sprachumschalter gelesen (der
Eintrag mit `is-selected`) und gemerkt. Danach wird die gemerkte Sprache verwendet. Beide
JS-Dateien nutzen diese gemeinsame Funktion.

---

### 4. Dark Mode passt zu den neuen Elementen (`css/dark-mode.css`)
**Problem:** Die bisherigen Styles galten dem alten `<select>` im Header, das es nicht mehr gibt. Die
neuen Elemente nutzen helle Farbtöne und wären auf Navy kaum lesbar gewesen.

**Lösung:** Neue Dark-Mode-Styles für
- den Sprachwechsel-Button, den Dialog, die Sprachliste (Hover und Auswahl) und das Lade-Overlay;
- das Lupen-Icon im Suchfeld: ein Hintergrundbild mit fest eingebautem Dunkelgrau, daher eine helle
  Variante als Data-URI;
- den **Lizenzschlüssel-Dialog** der Premium-Vorlagen: vorher schwarzer Hintergrund und hellblaue
  Abdunkelung, jetzt Navy;
- den Spinner der neuen Abschlussseite.

---

### 5. Vorlagen-Inhalte sind direkt deutsch (Default Content Locale)

**Ziel:** Nach der Installation einer Vorlage wie Haven sollen auch die **Inhalte** deutsch sein, nicht
nur die Oberfläche. Das Modul `drupal/default_content_locale` bringt dafür Übersetzungen mit
(`translations/haven.de.po`) und setzt sie beim Import der Inhalte ein.

Damit das wirklich funktioniert, waren vier Schritte nötig:

#### 5.1 Richtige Composer-Einbindung (`installer_de_patch.sh`)
Das Modul gibt es nur als Dev-Version. Bisher hat das Skript dafür die `minimum-stability` des
**ganzen Projekts** auf `dev` gesenkt. Dadurch hätte Composer bei späteren Updates auch andere Pakete
als Dev-Versionen ziehen können. Jetzt gilt die Dev-Freigabe nur für dieses eine Paket:
`drupal/default_content_locale:1.x-dev@dev`. Getestet, auch mit `minimum-stability: stable`.

#### 5.2 Richtiger Zeitpunkt (`scripts/i18n-extras-fix.php`)
**Problem:** Das Modul wirkt nur, wenn es installiert ist, **bevor** die Inhalte importiert werden. Es
hängt sich an `PreEntityImportEvent`, und seine `.po`-Dateien importiert es in `hook_install()`. Bisher
wurde es über das i18n_extras-Rezept installiert, und das läuft absichtlich *nach* der Vorlage. Es kam
also zu spät, und Haven blieb englisch.

**Lösung:** Direkt vor jedem Inhaltsimport der Vorlage wird ein Schritt eingefügt, der
`default_content_locale` installiert. Sobald Canvas durch die Vorlage aktiv ist, folgt auch
`default_content_locale_canvas`, denn Havens Seiten sind Canvas-Seiten. Das funktioniert für lokale
und für per Composer nachgeladene Vorlagen.

#### 5.3 Fehler im Modul (`scripts/default-content-locale-fix.php`, neu)
**Problem A:** Die Installation brach ab mit `Column 'status' cannot be null`. Das Modul legt die
deutsche Übersetzung nur mit den übersetzten Textfeldern an, und Pflichtfelder wie `status` fehlen.

**Problem B:** Während der Installation ist Englisch noch Standardsprache; Core entfernt es erst am
Ende. Die Inhalte wurden daher englisch angelegt und bekamen Deutsch als Übersetzung. Nach der
Umstellung blieb eine **verwaiste englische Fassung** zurück, und Inhaltslisten zeigten jeden Eintrag
doppelt.

**Lösung:** Ist die Zielsprache die Installationssprache (`config_language_lock`), werden die englischen
Texte **direkt ersetzt**. Jeder Inhalt hat dann genau eine deutsche Fassung. Nur für zusätzliche
Sprachen wird weiterhin eine Übersetzung angelegt, dann aber mit allen Pflichtfeldern.

Das ist ein Patch an fremdem Code. Er sucht eine bestimmte Codezeile und tut nichts, wenn es sie nicht
mehr gibt, etwa weil das Modul selbst korrigiert wurde. **Er sollte beim Modul gemeldet werden.**

#### 5.4 Startseite liefert kein 404 mehr (URL-Aliase)
**Problem:** Haven und Byte liefern ihre URL-Aliase (z. B. `/home` für die Startseite) mit fest
eingetragenem `langcode: en`. Auf einer rein deutschen Seite greifen sie nicht, und die **Startseite
lieferte 404**. Das passiert auch ganz ohne dieses Paket.

**Lösung:** Nach jedem Inhaltsimport und noch einmal am Ende werden englische Aliase auf die
Installationssprache umgestellt. Das geschieht nur, wenn Englisch nicht behalten wird.

#### Technisches Detail: eindeutige Batch-Schritte
Der Drupal-CMS-Installer verwirft identische Batch-Operationen („Only do each recipe's batch
operations once“). Die eingefügten Schritte tragen deshalb ein eindeutiges Argument. Ohne dieses
Argument liefen sie nur ein einziges Mal, und Korrekturen am Ende wären stillschweigend ausgefallen.

**Ergebnis mit Haven:** Seiten („Startseite“, „Über uns“, „Führung“), Beiträge („Was uns die Riffe
erzählen“) und Begriffe („Klimawandel“) sind deutsch, jeweils genau eine Fassung. Die Startseite
funktioniert.

---

### 6. Sonstiges
- `installer_de_patch.sh`: Die Quelle des Themes lässt sich zum Testen überschreiben:
  `INSTALLER_DE_REPO=… INSTALLER_DE_BRANCH=…`. Standard bleibt der `master`-Branch auf GitHub.
- `composer.json`: Version 2.1.0 → 2.2.0.
- README: Kompatibilitätsabschnitt für 2.2, Twig-Hinweis, Default Content Locale.

---

### Bekannte offene Punkte (nicht in diesem Paket lösbar)
- **Haven-Inhalte:** Zwei Sätze auf der Startseite bleiben englisch („The connection between
  disappearing glaciers…“, „Every small action counts…“). Sie fehlen in der `haven.de.po` des Moduls.
- **Offizielle Installer-Übersetzung:** Die Texte des Sprachdialogs fehlen auf localize.drupal.org.
  Bis dahin übernimmt das unser JS.
- **Dashboard nach der Installation:** „Recent pages“, „Recent content“, „See all pages/content“,
  „Help“ sind englisch, außerdem steht dort der Tippfehler „Weiter Veranstaltungen anzeigen“.
- **Upstream-Fehler ohne Übersetzungsbezug:**
  - Die Hilfetexte unter „Erweiterte Optionen“ der Datenbankseite laufen unter die Grafik.
  - Steht ein ungültiger Wert im versteckten Lizenzfeld, passiert beim Klick auf „Weiter“ ohne jede
    Rückmeldung nichts.
  - Den Batch-Seiten fehlt der Tab-Titel, dort steht nur „| Drupal CMS“.
- **Patches an fremdem Code:** Den Installer und `default_content_locale` kann `composer update`
  überschreiben. Dann `installer_de_patch.sh` erneut ausführen; alle Patches erkennen, ob sie schon
  angewendet sind.

---

## 2.2.0 – Adaptation to Drupal CMS 2.2

Tested with Drupal CMS **2.2.0** (`drupal/drupal_cms_installer` 2.2.0, Drupal core 11.4.7, PHP 8.5).
Drupal CMS 2.1.x is still supported.

The whole flow was tested: a fresh project via `installer_de_patch.sh`, then every step of the web
installer live in the browser in German – language selection, database, site name, template selection
including the license dialog, user account, installation – with the **Haven** and **Byte** templates,
both downloaded via Composer. Also tested: patching an existing project, cleaning up after the
installation, and reinstalling after `drush sql:drop`.

The changes are grouped by **purpose**: what broke or was missing, why, and what the change does
about it.

---

### 1. The installer has to work with Drupal CMS 2.2 at all

#### 1.1 The i18n_extras recipe is applied again
**Problem:** Drupal CMS 2.2 removed the `RecipeHandler` class. So far, `scripts/i18n-extras-fix.php`
hooked into its `enqueue()` call in `SiteTemplateForm`. That spot no longer exists. The script only
printed a warning, and the add-on modules (pb_localizer, yoast_seo_i18n, default_content_locale, Gin
dark mode) were **silently no longer installed**.

**Solution:** In 2.2, recipes are only turned into batch operations inside
`drupal_cms_installer.profile`. There are two paths: templates that already exist locally run in the
same batch, templates downloaded via Composer run in a later batch. The script now appends
i18n_extras right after the template on **both** paths.

**Side effect:** In 2.1, i18n_extras often ran *before* the template for downloaded templates such as
"convene". Now the order is guaranteed in both cases. The old approach remains as a fallback for 2.1.x.

#### 1.2 The installer starts again (missing icons)
**Problem:** The new language switcher in 2.2 is a dialog. It includes its icons via
`active_theme_path()`, i.e. from the **currently active theme** – which is our DE theme. `check.svg`
was missing there, and the installer would have failed with a Twig error.

**Solution:** The icons in `images/` now match 2.2. `check.svg` and `search.svg` were added;
`chevron-down`, `spinner`, `translate` and `x-circle` were updated. With the old `x-circle.svg`, the
close button would also have been white on white.

#### 1.3 Twig 3.30 breaks every fresh installation (`installer_de_patch.sh`)
**Problem:** Twig **3.30.0** (released 2026-09-25) now calls the escaper directly. Drupal core 11.4,
however, redirects the `escape` filter to a function with a different signature. The very first
installer page fails with:
`EscaperRuntime::escape(): Argument #4 ($autoescape) must be of type bool, null given`.
Because `composer install` without a lock file always pulls the latest version, this affects **every**
fresh installation – even without this package.

**Solution:** Only if Twig 3.30.x is installed does the script restrict Twig via
`composer require "twig/twig:>=3.28 <3.30"`. Once Drupal core fixes this, remove the restriction with
`composer remove twig/twig`.

---

### 2. Cleanup and reinstallation must not break anything

#### 2.1 Reinstalling after cleanup
**Problem:** The second script run after installation deletes the DE theme. The patch in
`drupal_cms_installer.info.yml` (`theme: drupal_cms_installer_de`), however, was left in place. Every
later reinstallation, for example after `drush sql:drop`, then failed with
`Call to a member function getPathname() on null in InstallerKernel->getBaseThemes()`.

**Solution:** Cleanup now resets that line to `drupal_cms_installer_theme`.

#### 2.2 Reliable "already installed?" detection
**Problem:** The script treated a site as installed as soon as `settings.php` existed. After
`drush sql:drop` the file is still there, although the database is empty. Running the script again
would then only have cleaned up instead of wiring in the theme.

**Solution:** The check now uses `drush status` (did the bootstrap succeed?). Only if Drush is
missing does the presence of `settings.php` still count.

---

### 3. Everything you see in the installer is German

#### 3.1 New UI strings in 2.2
**Background:** Since 2.2, the installer itself downloads an official German translation from
localize.drupal.org. It is incomplete, though. Our JS translations (`js/installer-translations.js`) now
only cover what is missing or wrong there:
- the new **language dialog** ("Install your site in a different language", search field, close
  button, "Select … and close dialog"). The script now also translates attributes such as
  `aria-label`, `placeholder` and `title`, so screen readers read German as well;
- the **template descriptions**, "Learn more" and "License key". These strings come from the template
  list and cannot be translated officially at all;
- the new **finishing page** ("Your site is almost ready");
- **corrections** to official or core translations: "Frei" → "Kostenlos",
  "Schluss machen" → "Abschluss", "MySQL, MariaDB, oder equivalent" → "MySQL, MariaDB oder kompatibel";
- the default value **"Meine Drupal CMS Seite" → "Meine Drupal-CMS-Website"**, matching the heading,
  which says "Website". It is only replaced as long as the user has not changed it;
- fixed the typo "Lizenztschlüssel".

#### 3.2 Status messages during installation (`js/progress-override.js`)
**Problem:** In the first half of the installation, the progress bar showed English messages such as
"Installed 20 modules: …", "Completed 3 of 22." and "Installed Haven theme.". The German core
translations are only imported at the very end, and some messages have no translation at all.

**Solution:** The messages are translated in the browser before they are displayed. This uses
patterns that leave placeholders such as module and recipe names untouched.

#### 3.3 Detecting the right language (`js/langcode.js`, new)
**Problem:** In 2.2, the installer can switch the `langcode` parameter to the template's default
language after the template is chosen, while it keeps talking to the user in the chosen language. The
translations must not stop working then. Conversely, a language from an earlier installation in the
same browser tab must not "stick".

**Solution:** In the early installer, the active language is read directly from the language switcher
(the entry marked `is-selected`) and remembered. After that, the remembered language is used. Both JS
files use this shared function.

---

### 4. Dark mode matches the new elements (`css/dark-mode.css`)
**Problem:** The previous styles targeted the old `<select>` in the header, which no longer exists. The
new elements use light colour tones and would have been hard to read on navy.

**Solution:** New dark-mode styles for
- the "change language" button, the dialog, the language list (hover and selection) and the loading
  overlay;
- the magnifier icon in the search field: a background image with a hard-coded dark grey, so a light
  variant is used as a data URI;
- the **license key dialog** of premium templates: previously a black background with a light blue
  backdrop, now navy;
- the spinner on the new finishing page.

---

### 5. Template content is German right away (Default Content Locale)

**Goal:** After installing a template such as Haven, the **content** should be German too, not just the
interface. The `drupal/default_content_locale` module ships translations for this
(`translations/haven.de.po`) and applies them while the content is imported.

Four steps were needed to make this actually work:

#### 5.1 Correct Composer integration (`installer_de_patch.sh`)
The module only exists as a dev version. So far, the script lowered the `minimum-stability` of the
**whole project** to `dev` for it. That could have let Composer pull dev versions of other packages
during later updates as well. Now the dev allowance applies to this one package only:
`drupal/default_content_locale:1.x-dev@dev`. Tested, including with `minimum-stability: stable`.

#### 5.2 The right moment (`scripts/i18n-extras-fix.php`)
**Problem:** The module only works if it is installed **before** the content is imported. It hooks into
`PreEntityImportEvent`, and it imports its `.po` files in `hook_install()`. So far it was installed via
the i18n_extras recipe, which deliberately runs *after* the template. It came too late, and Haven
stayed English.

**Solution:** Right before each content import of the template, a step is inserted that installs
`default_content_locale`. As soon as Canvas has been enabled by the template,
`default_content_locale_canvas` follows too, because Haven's pages are Canvas pages. This works for
local templates and for templates downloaded via Composer.

#### 5.3 Bugs in the module (`scripts/default-content-locale-fix.php`, new)
**Problem A:** Installation failed with `Column 'status' cannot be null`. The module creates the German
translation with the translated text fields only, and required fields such as `status` are missing.

**Problem B:** During installation, English is still the default language; core only removes it at the
end. The content was therefore created in English and got German as a translation. After the switch,
an **orphaned English version** remained, and content lists showed every entry twice.

**Solution:** If the target language is the installation language (`config_language_lock`), the
English texts are **replaced directly**. Every piece of content then has exactly one German version.
Only for additional languages is a translation still created, now with all required fields.

This is a patch to third-party code. It looks for one specific line of code and does nothing if that
line no longer exists, for example because the module has been fixed. **It should be reported to the
module.**

#### 5.4 The front page no longer returns 404 (URL aliases)
**Problem:** Haven and Byte ship their URL aliases (e.g. `/home` for the front page) with a hard-coded
`langcode: en`. On a German-only site they never match, and the **front page returned 404**. This
happens even without this package.

**Solution:** After each content import, and once more at the end, English aliases are moved to the
installation language. This only happens if English is not kept.

#### Technical detail: unique batch steps
The Drupal CMS installer discards identical batch operations ("Only do each recipe's batch operations
once"). The inserted steps therefore carry a unique argument. Without it they would run only once,
and corrections at the end would silently be skipped.

**Result with Haven:** Pages ("Startseite", "Über uns", "Führung"), posts ("Was uns die Riffe
erzählen") and terms ("Klimawandel") are German, each with exactly one version. The front page works.

---

### 6. Other changes
- `installer_de_patch.sh`: the theme source can be overridden for testing:
  `INSTALLER_DE_REPO=… INSTALLER_DE_BRANCH=…`. The default remains the `master` branch on GitHub.
- `composer.json`: version 2.1.0 → 2.2.0.
- README: compatibility section for 2.2, Twig note, Default Content Locale.

---

### Known open issues (cannot be solved in this package)
- **Haven content:** Two sentences on the front page remain English ("The connection between
  disappearing glaciers…", "Every small action counts…"). They are missing from the module's
  `haven.de.po`.
- **Official installer translation:** The language dialog strings are missing on
  localize.drupal.org. Until then, our JS covers them.
- **Dashboard after installation:** "Recent pages", "Recent content", "See all pages/content" and
  "Help" are English, and there is the typo "Weiter Veranstaltungen anzeigen" (should be "Weitere").
- **Upstream bugs unrelated to translation:**
  - The help texts under "Advanced options" on the database page run underneath the artwork.
  - If the hidden license field holds an invalid value, clicking "Next" does nothing, without any
    feedback.
  - The batch pages have no tab title; it only says "| Drupal CMS".
- **Patches to third-party code:** `composer update` can overwrite the installer and
  `default_content_locale`. Run `installer_de_patch.sh` again in that case; every patch detects
  whether it has already been applied.
