<?php

// Bindet das Rezept "i18n_extras" (pb_localizer, yoast_seo_i18n, default_content_locale)
// fest in die Site-Template-Auswahl des Installers ein, damit es bei jeder Installation
// automatisch zusammen mit dem gewählten Site-Template angewendet wird - unabhängig davon,
// welches Template der Nutzer auswählt.

$root = getcwd();
$targetPath = 'web/profiles/contrib/drupal_cms_installer/drupal_cms_installer.profile';

// Falls wir lokal im Theme-Ordner testen:
if (str_contains($root, 'drupal_cms_installer_de')) {
    $file = dirname($root, 1) . '/drupal_cms_installer/drupal_cms_installer.profile';
} else {
    $file = $root . '/' . $targetPath;
}

if (!file_exists($file)) {
    echo "\033[31m❌ Datei nicht gefunden: $file\033[0m\n";
    exit;
}

$content = file_get_contents($file);

$marker = "->enqueue('core/recipes/administrator_role')";
$ourEnqueueCall = "\\Composer\\InstalledVersions::getInstallPath('drupal/drupal_cms_installer_de') . '/recipes/i18n_extras'";

if (str_contains($content, $ourEnqueueCall)) {
    echo "\033[34mℹ️ i18n_extras-Rezept ist bereits in den Installer eingebunden.\033[0m\n";
} elseif (str_contains($content, $marker)) {
    $injection = $marker . "\n    // DE: i18n_extras (pb_localizer, yoast_seo_i18n, default_content_locale) immer mit anwenden.\n    ->enqueue($ourEnqueueCall)";
    $newContent = str_replace($marker, $injection, $content);
    file_put_contents($file, $newContent);
    echo "\033[32m✅ i18n_extras-Rezept erfolgreich in den Installer eingebunden.\033[0m\n";
} else {
    echo "\033[33m⚠️ Erwartete Codezeile für den Rezept-Hook nicht gefunden (Installer-Version evtl. geändert?). i18n_extras wird NICHT automatisch angewendet.\033[0m\n";
}
