#!/bin/bash
set -e

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Bindet das deutsche Installer-Theme in das Drupal-CMS-Projekt im aktuellen
# Arbeitsverzeichnis ein (composer.json + web/ liegen dort direkt) und
# patcht die Installer-Konfiguration.
apply_installer_de() {
    echo -e "${BLUE}⚙️ Erlaube Entwicklungs-Versionen (dev)...${NC}"
    composer config minimum-stability dev
    composer config prefer-stable true

    echo -e "${BLUE}🔗 Verknüpfe deutsches Installer-Theme...${NC}"
    composer config repositories.installer-de vcs https://github.com/nodedropweb/drupal_cms_installer_de

    echo -e "${BLUE}🎨 Füge deutsches Theme hinzu...${NC}"
    composer require drupal/drupal_cms_installer_de:dev-master --no-interaction

    echo -e "${BLUE}🔧 Patche Installer-Konfiguration...${NC}"
    # Wir rufen es direkt über PHP auf, falls die Composer-Verknüpfung im Vendor noch nicht sitzt
    php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php
}

echo -e "${BLUE}🚀 Drupal CMS Installer – deutsches Theme${NC}"

# Fall A: Im aktuellen Verzeichnis steht bereits ein via Composer
# installiertes Drupal-CMS-Projekt (composer.json + web/profiles/contrib/
# drupal_cms_installer liegen direkt hier). Dann NICHT erneut
# "composer create-project" ausführen (das würde ein zweites, ungenutztes
# Projekt in einem Unterordner "cms" anlegen), sondern direkt nachpatchen.
if [ -f "composer.json" ] && [ -d "web/profiles/contrib/drupal_cms_installer" ]; then
    echo -e "${YELLOW}📂 Bestehende Drupal-CMS-Installation im aktuellen Verzeichnis erkannt.${NC}"
    echo -e "${BLUE}🔧 Wende das deutsche Installer-Theme nachträglich an...${NC}"

    apply_installer_de

    echo -e "${GREEN}✅ Fertig! Das deutsche Installer-Theme ist jetzt eingebunden.${NC}"
    echo -e "${YELLOW}ℹ️ Hinweis: Ist diese Seite bereits fertig installiert (settings.php existiert${NC}"
    echo -e "${YELLOW}   bereits), hat das keinen sichtbaren Effekt auf die laufende Seite. Der Patch${NC}"
    echo -e "${YELLOW}   greift erst beim nächsten Aufruf von core/install.php, z.B. bei einer${NC}"
    echo -e "${YELLOW}   Neuinstallation oder auf einer frischen Kopie dieses Projekts.${NC}"
    exit 0
fi

# Fall B: Kein bestehendes Projekt gefunden - frisches Drupal CMS in einen
# neuen Unterordner "cms" installieren (bisheriges Verhalten).
if [ -d "cms" ]; then
    echo -e "${RED}⚠️ Der Ordner 'cms' existiert bereits. Bitte lösche ihn mit 'rm -rf cms' und starte erneut.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Lade Drupal CMS Core...${NC}"
composer create-project drupal/cms cms --no-install --no-interaction

cd cms

echo -e "${BLUE}📥 Installiere Abhängigkeiten...${NC}"
composer install

apply_installer_de

echo -e "${GREEN}✅ Fertig! Drupal CMS wurde in den Ordner 'cms' installiert.${NC}"
echo -e "${GREEN}Du kannst jetzt deinen Webserver auf $(pwd)/web zeigen lassen.${NC}"
