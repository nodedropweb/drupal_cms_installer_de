#!/bin/bash
set -e 

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starte Installation von Drupal CMS (Deutsche Version)...${NC}"

# 1. Drupal CMS via offiziellem Befehl laden
# Wir lassen Composer den Ordner 'cms' erstellen
if [ -d "cms" ]; then
    echo -e "${RED}⚠️ Der Ordner 'cms' existiert bereits. Bitte lösche ihn mit 'rm -rf cms' und starte erneut.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Lade Drupal CMS Core...${NC}"
composer create-project drupal/cms cms --no-install --no-interaction

cd cms

# 2. Stabilität anpassen, damit dein GitHub-Repo (Master-Branch) akzeptiert wird
echo -e "${BLUE}⚙️ Erlaube Entwicklungs-Versionen (dev)...${NC}"
composer config minimum-stability dev
composer config prefer-stable true

# 3. Dein GitHub-Repository hinzufügen
echo -e "${BLUE}🔗 Verknüpfe deutsches Installer-Theme...${NC}"
composer config repositories.installer-de vcs https://github.com/nodedropweb/drupal_cms_installer_de

# 4. Installation der Basis-Abhängigkeiten
echo -e "${BLUE}📥 Installiere Abhängigkeiten...${NC}"
composer install

# 5. Dein Theme anfordern (dev-master, da dein Branch 'master' heißt)
echo -e "${BLUE}🎨 Füge deutsches Theme hinzu...${NC}"
composer require drupal/drupal_cms_installer_de:dev-master --no-interaction

# 6. Den PHP-Fix ausführen
echo -e "${BLUE}🔧 Patche Installer-Konfiguration...${NC}"
# Wir rufen es direkt über PHP auf, falls die Composer-Verknüpfung im Vendor noch nicht sitzt
php web/profiles/contrib/drupal_cms_installer_de/scripts/theme-fix.php

echo -e "${GREEN}✅ Fertig! Drupal CMS wurde in den Ordner 'cms' installiert.${NC}"
echo -e "${GREEN}Du kannst jetzt deinen Webserver auf /var/www/cms/web zeigen lassen.${NC}"
