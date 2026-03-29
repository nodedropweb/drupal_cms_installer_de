#!/bin/bash
set -e # Stoppt das Script bei Fehlern

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starte Installation von Drupal CMS (Deutsche Version)...${NC}"

# 1. Drupal CMS via Composer Projekt-Template laden
# Wir nutzen das offizielle drupal/cms-project
composer create-project drupal/cms-project cms --no-install --stability dev --no-interaction

cd cms

# 2. Konfiguration anpassen, damit dev-Pakete erlaubt sind
echo -e "${BLUE}⚙️ Konfiguriere Stabilität und Repositories...${NC}"
composer config minimum-stability dev
composer config prefer-stable true

# 3. Dein GitHub-Repository hinzufügen (achte auf den korrekten Usernamen nodedropweb)
composer config repositories.installer-de vcs https://github.com/nodedropweb/drupal_cms_installer_de

# 4. Dein Theme anfordern
# Da dein Branch 'master' heißt, müssen wir dev-master anfordern
echo -e "${BLUE}📦 Fordere deutsches Installer-Theme an...${NC}"
composer require drupal/drupal_cms_installer_de:dev-master --no-interaction

# 5. Den Fix ausführen
echo -e "${BLUE}🔧 Passe Installer-Konfiguration an...${NC}"
composer run-script replace-installer-theme

echo -e "${GREEN}✅ Fertig! Das Verzeichnis 'cms' ist bereit.${NC}"
