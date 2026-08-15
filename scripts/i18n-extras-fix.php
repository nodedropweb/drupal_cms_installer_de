<?php

// Bindet das Rezept "i18n_extras" (pb_localizer, yoast_seo_i18n, default_content_locale)
// fest in die Site-Template-Auswahl des Installers ein, damit es bei jeder Installation
// automatisch zusammen mit dem gewählten Site-Template angewendet wird - unabhängig davon,
// welches Template der Nutzer auswählt.
//
// WICHTIG: Wird absichtlich in SiteTemplateForm::submitForm() eingereiht, NACH dem
// gewählten Site-Template - nicht in drupal_cms_installer_choose_template() (vor dem
// Template, wie in einer früheren Version dieses Skripts). Grund: pb_localizer.info.yml
// deklariert project_browser als Modul-Abhängigkeit. Würde i18n_extras vor dem
// Site-Template angewendet, installiert Drupal project_browser (mit dessen rohen
// Default-Werten, u. a. max_selections: null) bereits an dieser Stelle - noch bevor
// z. B. haven seine eigene, vollständige config/project_browser.admin_settings.yml
// importieren kann. Drupals strikte Recipe-Prüfung (ConfigConfigurator) wirft dann eine
// RecipePreExistingConfigException für genau diese eine Config, der Import wird
// übersprungen, der Rest des Site-Templates wendet sich aber unauffällig normal an.
// Sichtbare Folge: die Checkbox-Auswahlleiste im Project Browser erscheint statt des
// direkten Install-Buttons, obwohl ein Site-Template gewählt wurde.

$root = getcwd();
$targetPath = 'web/profiles/contrib/drupal_cms_installer/src/Form/SiteTemplateForm.php';

// Falls wir lokal im Theme-Ordner testen:
if (str_contains($root, 'drupal_cms_installer_de')) {
    $file = dirname($root, 1) . '/drupal_cms_installer/src/Form/SiteTemplateForm.php';
} else {
    $file = $root . '/' . $targetPath;
}

if (!file_exists($file)) {
    echo "\033[31m❌ Datei nicht gefunden: $file\033[0m\n";
    exit;
}

$content = file_get_contents($file);

$marker = '$this->recipeHandler->enqueue($locator);';
$ourEnqueueCall = "\\Composer\\InstalledVersions::getInstallPath('drupal/drupal_cms_installer_de') . '/recipes/i18n_extras'";

if (str_contains($content, $ourEnqueueCall)) {
    echo "\033[34mℹ️ i18n_extras-Rezept ist bereits in den Installer eingebunden.\033[0m\n";
} elseif (str_contains($content, $marker)) {
    $injection = $marker . "\n    // DE: i18n_extras (pb_localizer, yoast_seo_i18n, default_content_locale) immer\n    // NACH dem gewählten Site-Template anwenden - siehe Kommentar oben in diesem Skript.\n    \$this->recipeHandler->enqueue($ourEnqueueCall);";
    $newContent = str_replace($marker, $injection, $content);
    file_put_contents($file, $newContent);
    echo "\033[32m✅ i18n_extras-Rezept erfolgreich in den Installer eingebunden.\033[0m\n";
} else {
    echo "\033[33m⚠️ Erwartete Codezeile für den Rezept-Hook nicht gefunden (Installer-Version evtl. geändert?). i18n_extras wird NICHT automatisch angewendet.\033[0m\n";
}
