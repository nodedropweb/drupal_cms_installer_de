#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starte Installation von Drupal CMS (Deutsche Version)...${NC}"

# 1. Drupal CMS via Composer Projekt-Template laden
# Wir installieren es in den Ordner 'my-drupal-cms'
composer create-project drupal/cms
cd cms

# 2. Dein lokales/externes Theme-Repository hinzufügen
echo -e "${BLUE}📦 Füge deutsches Installer-Theme hinzu...${NC}"
composer config repositories.installer-de vcs https://github.com/DEIN-GITHUB-NAME/drupal_cms_installer_de

# 3. Installation ausführen
composer install

# 4. Dein Theme anfordern (dadurch wird es nach web/profiles/contrib geladen)
composer require drupal/drupal_cms_installer_de:dev-main

# 5. Den Fix ausführen, um die info.yml des Originals zu patchen
echo -e "${BLUE}🔧 Passe Installer-Konfiguration an...${NC}"
composer run-script replace-installer-theme

echo -e "${GREEN}✅ Fertig! Du kannst Drupal jetzt im Browser installieren.${NC}"
echo -e "${GREEN}Wähle 'Deutsch' im Installer, um dein Theme zu sehen.${NC}"
