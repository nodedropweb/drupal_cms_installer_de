#!/bin/bash
set -e

# Zielverzeichnis für Fall B (Neuinstallation). Per Default "cms", damit
# bestehende Aufrufe ohne Argument unverändert funktionieren. Bei
# "curl | bash" muss das Argument über "-s --" durchgereicht werden:
#   curl -sSL .../installer_de_patch.sh | bash -s -- drupalcms
TARGET_DIR="${1:-cms}"

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
apply_installer_de() {
    echo -e "${BLUE}🎨 Lade deutsches Installer-Theme (ohne Composer, damit composer.json${NC}"
    echo -e "${BLUE}   unangetastet bleibt und der Project Browser nicht bricht)...${NC}"
    rm -rf web/profiles/contrib/drupal_cms_installer_de
    mkdir -p web/profiles/contrib
    git clone --quiet --depth 1 --single-branch --branch master \
        https://github.com/nodedropweb/drupal_cms_installer_de.git \
        web/profiles/contrib/drupal_cms_installer_de
    rm -rf web/profiles/contrib/drupal_cms_installer_de/.git

    echo -e "${BLUE}⚙️ Erlaube Entwicklungs-Versionen (dev)...${NC}"
    composer config minimum-stability dev
    composer config prefer-stable true

    echo -e "${BLUE}🧩 Füge Zusatzmodule hinzu (pb_localizer, yoast_seo_i18n, default_content_locale)...${NC}"
    composer require --no-interaction \
        drupal/pb_localizer:^3.0 \
        drupal/yoast_seo_i18n:^1.0 \
        drupal/default_content_locale:1.x-dev

    echo -e "${BLUE}🔧 Patche Installer-Konfiguration...${NC}"
    php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php

    echo -e "${BLUE}🧬 Bindet i18n_extras-Rezept in die Site-Template-Auswahl ein...${NC}"
    php web/profiles/contrib/drupal_cms_installer_de/scripts/i18n-extras-fix.php
}


# Entfernt das deutsche Installer-Theme wieder, sobald sein einziger Zweck
# (den Installer-Wizard einmalig beschriften) erledigt ist. Da apply_installer_de()
# das Theme nicht mehr ueber Composer eintraegt, reicht dafuer ein einfaches
# Loeschen des Ordners - composer.json ist ohnehin nie betroffen.
cleanup_installer_de() {
    echo -e "${BLUE}🧹 Entferne deutsches Installer-Theme wieder (nicht mehr benötigt)...${NC}"
    rm -rf web/profiles/contrib/drupal_cms_installer_de
}

echo -e "${BLUE}🚀 Drupal CMS Installer – deutsches Theme${NC}"

# Fall A: Im aktuellen Verzeichnis steht bereits ein via Composer
# installiertes Drupal-CMS-Projekt (composer.json + web/profiles/contrib/
# drupal_cms_installer liegen direkt hier). Dann NICHT erneut
# "composer create-project" ausführen (das würde ein zweites, ungenutztes
# Projekt in einem Unterordner "cms" anlegen).
if [ -f "composer.json" ] && [ -d "web/profiles/contrib/drupal_cms_installer" ]; then
    # Fall A2: Die Seite ist bereits fertig installiert (settings.php
    # existiert) - der Patch greift ohnehin nur beim Aufruf von
    # core/install.php, das ist hier längst gelaufen. Erneutes Anwenden
    # wäre wirkungslos; stattdessen aufräumen, siehe cleanup_installer_de().
    if [ -f "web/sites/default/settings.php" ]; then
        echo -e "${YELLOW}📂 Diese Seite ist bereits fertig installiert.${NC}"
        cleanup_installer_de
        echo -e "${GREEN}✅ Fertig! Das deutsche Installer-Theme wurde entfernt.${NC}"
        exit 0
    fi

    # Fall A1: Composer-Projekt existiert, aber der Installer-Wizard wurde
    # noch nicht durchlaufen - Patch wie gewohnt anwenden.
    echo -e "${YELLOW}📂 Bestehende Drupal-CMS-Installation im aktuellen Verzeichnis erkannt.${NC}"
    echo -e "${BLUE}🔧 Wende das deutsche Installer-Theme nachträglich an...${NC}"

    apply_installer_de

    echo -e "${GREEN}✅ Fertig! Das deutsche Installer-Theme ist jetzt eingebunden.${NC}"
    echo -e "${YELLOW}ℹ️ Führe dieses Skript nach Abschluss des Installer-Wizards (sobald${NC}"
    echo -e "${YELLOW}   web/sites/default/settings.php existiert) im selben Verzeichnis erneut${NC}"
    echo -e "${YELLOW}   aus, um das Theme automatisch wieder zu entfernen.${NC}"
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
echo -e "${YELLOW}ℹ️ Führe dieses Skript nach Abschluss des Installer-Wizards (sobald${NC}"
echo -e "${YELLOW}   $TARGET_DIR/web/sites/default/settings.php existiert) im Ordner${NC}"
echo -e "${YELLOW}   '$TARGET_DIR' erneut aus, um das Theme automatisch wieder zu entfernen.${NC}"
