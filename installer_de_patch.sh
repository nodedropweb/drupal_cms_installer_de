#!/bin/bash
set -e

# Zielverzeichnis für Fall B (Neuinstallation). Per Default "cms", damit
# bestehende Aufrufe ohne Argument unverändert funktionieren. Bei
# "curl | bash" muss das Argument über "-s --" durchgereicht werden:
#   curl -sSL .../installer_de_patch.sh | bash -s -- drupalcms
TARGET_DIR="${1:-cms}"

# Quelle des deutschen Installer-Themes. Per Default der master-Branch auf
# GitHub; zum Testen eines Branches oder lokalen Klons überschreibbar:
#   INSTALLER_DE_REPO=/pfad/zum/klon INSTALLER_DE_BRANCH=mein-branch bash installer_de_patch.sh
INSTALLER_DE_REPO="${INSTALLER_DE_REPO:-https://github.com/nodedropweb/drupal_cms_installer_de.git}"
INSTALLER_DE_BRANCH="${INSTALLER_DE_BRANCH:-master}"

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Bindet das deutsche Installer-Theme in das Drupal-CMS-Projekt im aktuellen
# Arbeitsverzeichnis ein (composer.json + web/ liegen dort direkt) und
# patcht die Installer-Konfiguration.
#
# Wichtig: drupal_cms_installer_de ist KEIN echtes drupal.org-Projekt. Ein
# "composer require" dafuer wuerde einen dauerhaften VCS-Repository-Eintrag in
# composer.json erzwingen (Composer kann sonst gar nicht herausfinden, woher
# das Paket kommt) - und genau dieser Eintrag laesst jede spaetere
# Composer-Operation, auch Project Browsers UI-Install ueber Package Manager
# (laeuft als eigener Systembenutzer ohne GitHub-Zugangsdaten), mit einem
# Host-Key- oder Auth-Fehler abbrechen. Deshalb wird das Theme hier bewusst
# NICHT ueber Composer eingebunden, sondern direkt per "git clone" an die
# Stelle gelegt, an der Drupal Erweiterungen ohnehin automatisch findet
# (web/profiles/*) - composer.json bleibt dabei komplett unangetastet.
# Twig 3.30.0 (2026-09-25) holt den Escaper jetzt einmal pro Template und ruft
# ihn beim Auto-Escaping direkt auf ("$this->escaper->escape"). Drupal Core
# (getestet: 11.4.7) biegt den escape-Filter aber per TwigNodeVisitor auf
# seinen eigenen "drupal_escape"-Filter mit anderer Signatur um - das Ergebnis
# ist schon auf der ersten Installer-Seite:
#   TypeError: EscaperRuntime::escape(): Argument #4 ($autoescape) must be of
#   type bool, null given
# Da "composer install" ohne Lock-Datei immer die neueste Twig-Version zieht,
# trifft das jede Neuinstallation. Workaround: Twig auf < 3.30 begrenzen (nur
# wenn 3.30.x tatsaechlich installiert ist). Die Anforderung "twig/twig" in
# composer.json wieder entfernen ("composer remove twig/twig"), sobald Drupal
# Core mit Twig 3.30 kompatibel ist.
fix_twig_escaper() {
    local twig_version
    twig_version=$(composer show twig/twig --format=json 2>/dev/null \
        | php -r '$j = json_decode(stream_get_contents(STDIN), true); echo ltrim($j["versions"][0] ?? "", "v");')
    case "$twig_version" in
        3.30.*)
            echo -e "${YELLOW}🩹 Twig $twig_version ist inkompatibel mit Drupal Core - stufe auf 3.29 zurück...${NC}"
            composer require --no-interaction --with-all-dependencies "twig/twig:>=3.28 <3.30"
            ;;
    esac
}

apply_installer_de() {
    echo -e "${BLUE}🎨 Lade deutsches Installer-Theme (ohne Composer, damit composer.json${NC}"
    echo -e "${BLUE}   unangetastet bleibt und der Project Browser nicht bricht)...${NC}"
    rm -rf web/profiles/contrib/drupal_cms_installer_de
    mkdir -p web/profiles/contrib
    git clone --quiet --depth 1 --single-branch --branch "$INSTALLER_DE_BRANCH" \
        "$INSTALLER_DE_REPO" \
        web/profiles/contrib/drupal_cms_installer_de
    rm -rf web/profiles/contrib/drupal_cms_installer_de/.git

    # default_content_locale gibt es nur als Dev-Version. Das Stability-Flag
    # "@dev" erlaubt das gezielt fuer dieses eine Paket, statt die
    # minimum-stability des ganzen Projekts auf "dev" zu senken.
    # Das Modul uebersetzt die Standardinhalte der Vorlage (z. B. Haven) beim
    # Import; eingebunden wird es von scripts/i18n-extras-fix.php direkt vor
    # dem Inhaltsimport der Vorlage (siehe dort).
    echo -e "${BLUE}🧩 Füge Zusatzmodule hinzu (pb_localizer, yoast_seo_i18n, default_content_locale)...${NC}"
    composer config prefer-stable true
    composer require --no-interaction \
        drupal/pb_localizer:^3.0 \
        drupal/yoast_seo_i18n:^1.0 \
        "drupal/default_content_locale:1.x-dev@dev"

    fix_twig_escaper

    echo -e "${BLUE}🔧 Patche Installer-Konfiguration...${NC}"
    php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php

    echo -e "${BLUE}🧬 Bindet i18n_extras-Rezept und Default Content Locale in den Installer ein...${NC}"
    php web/profiles/contrib/drupal_cms_installer_de/scripts/i18n-extras-fix.php

    echo -e "${BLUE}🌍 Korrigiert default_content_locale (Vorlagen-Inhalte auf Deutsch)...${NC}"
    php web/profiles/contrib/drupal_cms_installer_de/scripts/default-content-locale-fix.php
}


# Entfernt das deutsche Installer-Theme wieder, sobald sein einziger Zweck
# (den Installer-Wizard einmalig beschriften) erledigt ist. Da apply_installer_de()
# das Theme nicht mehr ueber Composer eintraegt, reicht dafuer das Loeschen des
# Ordners - composer.json ist ohnehin nie betroffen.
#
# Wichtig: Der Theme-Patch in drupal_cms_installer.info.yml MUSS dabei
# zurueckgesetzt werden. Sonst verweist der Installer weiter auf das geloeschte
# Theme, und jede spaetere Neuinstallation (z. B. nach "drush sql:drop") bricht
# ab mit "Call to a member function getPathname() on null in
# InstallerKernel->getBaseThemes()". Der i18n_extras-Patch im .profile darf
# bleiben: er prueft selbst, ob das Rezept noch existiert.
cleanup_installer_de() {
    echo -e "${BLUE}🧹 Entferne deutsches Installer-Theme wieder (nicht mehr benötigt)...${NC}"
    rm -rf web/profiles/contrib/drupal_cms_installer_de
    local info=web/profiles/contrib/drupal_cms_installer/drupal_cms_installer.info.yml
    if [ -f "$info" ] && grep -q 'theme: drupal_cms_installer_de' "$info"; then
        sed -i 's/theme: drupal_cms_installer_de$/theme: drupal_cms_installer_theme/' "$info"
        echo -e "${BLUE}↩️  Installer-Theme in drupal_cms_installer.info.yml zurückgesetzt.${NC}"
    fi
}

# Prueft, ob Drupal tatsaechlich installiert ist. Eine vorhandene settings.php
# reicht dafuer nicht: nach "drush sql:drop" existiert sie weiter, die
# Datenbank ist aber leer und core/install.php laeuft erneut.
site_is_installed() {
    if [ -x vendor/bin/drush ]; then
        [ "$(vendor/bin/drush status --field=bootstrap 2>/dev/null)" = "Successful" ]
    else
        [ -f web/sites/default/settings.php ]
    fi
}

echo -e "${BLUE}🚀 Drupal CMS Installer – deutsches Theme${NC}"

# Fall A: Im aktuellen Verzeichnis steht bereits ein via Composer
# installiertes Drupal-CMS-Projekt (composer.json + web/profiles/contrib/
# drupal_cms_installer liegen direkt hier). Dann NICHT erneut
# "composer create-project" ausführen (das würde ein zweites, ungenutztes
# Projekt in einem Unterordner "cms" anlegen).
if [ -f "composer.json" ] && [ -d "web/profiles/contrib/drupal_cms_installer" ]; then
    # Fall A2: Die Seite ist bereits fertig installiert (siehe
    # site_is_installed()) - der Patch greift ohnehin nur beim Aufruf von
    # core/install.php, das ist hier längst gelaufen. Erneutes Anwenden
    # wäre wirkungslos; stattdessen aufräumen, siehe cleanup_installer_de().
    if site_is_installed; then
        echo -e "${YELLOW}📂 Diese Seite ist bereits fertig installiert.${NC}"
        cleanup_installer_de
        echo -e "${GREEN}✅ Fertig! Das deutsche Installer-Theme wurde entfernt.${NC}"
        exit 0
    fi

    # Fall A1: Composer-Projekt existiert, aber der Installer-Wizard wurde
    # noch nicht durchlaufen (oder die Datenbank wurde geleert) - Patch wie
    # gewohnt anwenden.
    echo -e "${YELLOW}📂 Bestehende Drupal-CMS-Installation im aktuellen Verzeichnis erkannt.${NC}"
    echo -e "${BLUE}🔧 Wende das deutsche Installer-Theme nachträglich an...${NC}"

    apply_installer_de

    echo -e "${GREEN}✅ Fertig! Das deutsche Installer-Theme ist jetzt eingebunden.${NC}"
    echo -e "${YELLOW}ℹ️ Führe dieses Skript nach Abschluss des Installer-Wizards im selben${NC}"
    echo -e "${YELLOW}   Verzeichnis erneut aus, um das Theme automatisch wieder zu entfernen.${NC}"
    exit 0
fi

# Fall B: Kein bestehendes Projekt gefunden - frisches Drupal CMS in einen
# neuen Unterordner installieren (Standard: "cms", überschreibbar über
# das erste Skript-Argument, siehe TARGET_DIR oben).
if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}⚠️ Der Ordner '$TARGET_DIR' existiert bereits. Bitte lösche ihn mit 'rm -rf $TARGET_DIR' und starte erneut.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Lade Drupal CMS Core...${NC}"
composer create-project drupal/cms "$TARGET_DIR" --no-install --no-interaction

cd "$TARGET_DIR"

echo -e "${BLUE}📥 Installiere Abhängigkeiten...${NC}"
composer install

apply_installer_de

echo -e "${GREEN}✅ Fertig! Drupal CMS wurde in den Ordner '$TARGET_DIR' installiert.${NC}"
echo -e "${GREEN}Du kannst jetzt deinen Webserver auf $(pwd)/web zeigen lassen.${NC}"
echo -e "${YELLOW}ℹ️ Führe dieses Skript nach Abschluss des Installer-Wizards im Ordner${NC}"
echo -e "${YELLOW}   '$TARGET_DIR' erneut aus, um das Theme automatisch wieder zu entfernen.${NC}"
