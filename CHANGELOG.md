# Changelog

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

## English summary

Adapts the German installer package to **Drupal CMS 2.2**:
- Restores the i18n_extras recipe hook, since the 2.2 installer removed `RecipeHandler`.
- Syncs icons with 2.2; without `check.svg` the new language dialog crashes the installer.
- Works around Twig 3.30, which breaks Drupal core 11.4.
- Fixes cleanup and reinstall after `drush sql:drop`.
- Translates the new 2.2 UI strings, including ARIA attributes, the batch progress messages and a
  few poor official strings.
- Adds dark-mode styles for the new dialogs.
- Makes site template content (e.g. Haven) install in German right away. `default_content_locale` is
  now enabled before content import, two module bugs are patched (NOT NULL `status`, duplicate
  orphaned English versions), and English-only URL aliases such as `/home` are moved to the site
  language, so the front page no longer returns 404.
