<?php

// Bindet das Rezept "i18n_extras" (pb_localizer, yoast_seo_i18n, default_content_locale)
// fest in die Site-Template-Auswahl des Installers ein, damit es bei jeder Installation
// automatisch zusammen mit dem gewählten Site-Template angewendet wird - unabhängig davon,
// welches Template der Nutzer auswählt.
//
// Wird weiterhin absichtlich in SiteTemplateForm::submitForm() eingereiht, NACH dem
// gewählten Site-Template (nicht in drupal_cms_installer_choose_template(), vor dem
// Template). Das allein reicht aber NICHT aus, um zu garantieren, dass i18n_extras
// nach der eigentlichen Anwendung des Site-Templates läuft: drupal_cms_installer_
// apply_recipes() (im drupal_cms_installer-Profil) führt bereits lokal vorhandene
// Rezepte SOFORT im selben Batch-Set aus, während Rezepte, die erst per Composer
// nachgeladen werden müssen (z. B. "convene", das anders als starter/haven/byte nicht
// vorab in composer.json requiret ist), ihre eigentliche Anwendung über einen
// verschachtelten batch_set()-Aufruf in ein SPÄTERES Batch-Set verschieben. Da dieses
// Paket i18n_extras direkt bündelt, ist es immer schon lokal vorhanden und läuft daher
// oft VOR der tatsächlichen Anwendung eines nachzuladenden Site-Templates - trotz
// korrekter Warteschlangen-Reihenfolge hier.
//
// Der eigentliche Fix gegen die dadurch verlorene project_browser.admin_settings-
// Config (allow_ui_install, max_selections) sitzt deshalb nicht hier, sondern als
// robuste, reihenfolge-unabhängige Config-Action in recipes/i18n_extras/recipe.yml -
// siehe die Kommentare dort für die volle Herleitung.

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
// Bewusst kein Composer\InstalledVersions::getInstallPath() - drupal_cms_installer_de
// wird seit installer_de_patch.sh nicht mehr per Composer eingebunden (siehe dort),
// Composer weiss also gar nichts von diesem Paket. Der Installationsort ist aber
// deterministisch (immer web/profiles/contrib/drupal_cms_installer_de), daher genuegt
// ein fester, von Drupal::root() abgeleiteter Pfad.
$ourEnqueueCall = "\\Drupal::root() . '/profiles/contrib/drupal_cms_installer_de/recipes/i18n_extras'";
// Fruehere Skriptversion nutzte Composer\InstalledVersions::getInstallPath(), das seit dem
// Composer-losen Einbinden des Themes ins Leere laeuft. Projekte, die mit jener Version schon
// gepatcht wurden, muessen auf den neuen Aufruf migriert werden statt ein zweites Mal injiziert
// zu werden (sonst wuerde das Rezept doppelt in die Warteschlange eingereiht).
$legacyEnqueueCall = "\\Composer\\InstalledVersions::getInstallPath('drupal/drupal_cms_installer_de') . '/recipes/i18n_extras'";

if (str_contains($content, $ourEnqueueCall)) {
    echo "\033[34mℹ️ i18n_extras-Rezept ist bereits in den Installer eingebunden.\033[0m\n";
} elseif (str_contains($content, $legacyEnqueueCall)) {
    $newContent = str_replace($legacyEnqueueCall, $ourEnqueueCall, $content);
    file_put_contents($file, $newContent);
    echo "\033[32m✅ i18n_extras-Rezept-Hook auf Composer-losen Pfad migriert.\033[0m\n";
} elseif (str_contains($content, $marker)) {
    $injection = $marker . "\n    // DE: i18n_extras (pb_localizer, yoast_seo_i18n, default_content_locale) immer\n    // NACH dem gewählten Site-Template anwenden - siehe Kommentar oben in diesem Skript.\n    \$this->recipeHandler->enqueue($ourEnqueueCall);";
    $newContent = str_replace($marker, $injection, $content);
    file_put_contents($file, $newContent);
    echo "\033[32m✅ i18n_extras-Rezept erfolgreich in den Installer eingebunden.\033[0m\n";
} else {
    echo "\033[33m⚠️ Erwartete Codezeile für den Rezept-Hook nicht gefunden (Installer-Version evtl. geändert?). i18n_extras wird NICHT automatisch angewendet.\033[0m\n";
}
