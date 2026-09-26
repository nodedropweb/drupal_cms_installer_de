<?php

// Bindet das Rezept "i18n_extras" (pb_localizer, yoast_seo_i18n, default_content_locale)
// fest in den Installer ein, damit es bei jeder Installation automatisch NACH dem
// gewählten Site-Template angewendet wird - unabhängig davon, welches Template der
// Nutzer auswählt.
//
// Drupal CMS 2.2 (drupal_cms_installer 2.2.x):
// --------------------------------------------
// Die Klasse RecipeHandler und damit $this->recipeHandler->enqueue() in
// SiteTemplateForm::submitForm() gibt es nicht mehr. Das gewählte Site-Template wird
// jetzt als SiteTemplate-Objekt im State abgelegt und ausschließlich in
// drupal_cms_installer_apply_recipes() (drupal_cms_installer.profile) in Batch-
// Operationen übersetzt:
//   - Liegt das Template schon lokal vor, werden seine Operationen direkt an den
//     laufenden Batch angehängt.
//   - Muss es erst per Composer nachgeladen werden, erzeugt
//     _drupal_cms_installer_require_recipe() per batch_set() einen SPÄTEREN Batch,
//     der das Template anwendet.
// Dieses Skript hängt die i18n_extras-Operationen deshalb an BEIDEN Stellen jeweils
// direkt hinter das Site-Template. Damit läuft i18n_extras jetzt in beiden Fällen
// zuverlässig nach dem Template (in 2.1.x war das bei nachzuladenden Templates wie
// "convene" nicht garantiert). Die Config-Actions in recipes/i18n_extras/recipe.yml
// bleiben trotzdem als reihenfolge-unabhängige Absicherung bestehen.
//
// Drupal CMS 2.1.x (Fallback):
// ----------------------------
// Existiert in SiteTemplateForm.php noch der RecipeHandler-Aufruf, wird wie bisher
// dort ein zusätzlicher enqueue()-Aufruf eingefügt.

$root = getcwd();

// Falls wir lokal im Theme-Ordner testen:
if (str_contains($root, 'drupal_cms_installer_de')) {
    $installerDir = dirname($root, 1) . '/drupal_cms_installer';
} else {
    $installerDir = $root . '/web/profiles/contrib/drupal_cms_installer';
}

$profileFile = $installerDir . '/drupal_cms_installer.profile';
$formFile = $installerDir . '/src/Form/SiteTemplateForm.php';

// Bewusst kein Composer\InstalledVersions::getInstallPath() - drupal_cms_installer_de
// wird seit installer_de_patch.sh nicht mehr per Composer eingebunden (siehe dort),
// Composer weiss also gar nichts von diesem Paket. Der Installationsort ist aber
// deterministisch (immer web/profiles/contrib/drupal_cms_installer_de), daher genuegt
// ein fester, von Drupal::root() abgeleiteter Pfad.
$ourRecipePath = "\\Drupal::root() . '/profiles/contrib/drupal_cms_installer_de/recipes/i18n_extras'";

if (!file_exists($profileFile)) {
    echo "\033[31m❌ Datei nicht gefunden: $profileFile\033[0m\n";
    exit;
}

$legacyMarker = '$this->recipeHandler->enqueue($locator);';
if (file_exists($formFile) && str_contains(file_get_contents($formFile), '$this->recipeHandler->enqueue(')) {
    patch_legacy_site_template_form($formFile, $legacyMarker, $ourRecipePath);
}
else {
    patch_profile($profileFile, $ourRecipePath);
}

/**
 * Drupal CMS 2.2+: hängt i18n_extras in drupal_cms_installer.profile an.
 */
function patch_profile(string $file, string $recipePath): void {
    $content = file_get_contents($file);
    $helper = '_drupal_cms_installer_de_i18n_extras_operations';

    if (str_contains($content, "function $helper(")) {
        echo "\033[34mℹ️ i18n_extras-Rezept ist bereits in den Installer eingebunden.\033[0m\n";
        return;
    }

    // Fall 1: Site-Template liegt lokal vor (drupal_cms_installer_apply_recipes()).
    $localMarker = "\$operations[] = ['_drupal_cms_installer_mark_recipe_applied', [\$locator]];";
    // Fall 2: Site-Template wird per Composer nachgeladen
    // (_drupal_cms_installer_require_recipe()).
    $remoteMarker = "\$batch->addOperation('_drupal_cms_installer_mark_recipe_applied', [\$package_name]);";

    if (substr_count($content, $localMarker) !== 1 || substr_count($content, $remoteMarker) !== 1) {
        echo "\033[33m⚠️ Erwartete Codezeilen für den Rezept-Hook nicht gefunden (Installer-Version evtl. geändert?). i18n_extras wird NICHT automatisch angewendet.\033[0m\n";
        return;
    }

    $content = str_replace(
        $localMarker,
        $localMarker . "\n    // DE: i18n_extras immer direkt NACH dem gewählten Site-Template anwenden.\n    \$operations = array_merge(\$operations, $helper());",
        $content,
    );
    $content = str_replace(
        $remoteMarker,
        $remoteMarker . "\n  // DE: i18n_extras immer direkt NACH dem nachgeladenen Site-Template anwenden.\n  foreach ($helper() as [\$de_callable, \$de_arguments]) {\n    \$batch->addOperation(\$de_callable, \$de_arguments);\n  }",
        $content,
    );

    $content = rtrim($content) . "\n\n" . <<<PHP
/**
 * Returns the batch operations to apply the German i18n_extras recipe.
 *
 * Added by drupal_cms_installer_de (scripts/i18n-extras-fix.php).
 *
 * @return array<mixed>
 *   Batch operations, or an empty array if the recipe is not present.
 */
function $helper(): array {
  \$path = $recipePath;
  if (!is_dir(\$path)) {
    return [];
  }
  \$recipe = Recipe::createFromDirectory(\$path);
  return [
    ...RecipeRunner::toBatchOperations(\$recipe),
    ['_drupal_cms_installer_mark_recipe_applied', [\$path]],
  ];
}

PHP;

    file_put_contents($file, $content);
    echo "\033[32m✅ i18n_extras-Rezept erfolgreich in den Installer (2.2+) eingebunden.\033[0m\n";
}

/**
 * Drupal CMS 2.1.x: hängt i18n_extras in SiteTemplateForm::submitForm() an.
 */
function patch_legacy_site_template_form(string $file, string $marker, string $recipePath): void {
    $content = file_get_contents($file);

    // Fruehere Skriptversion nutzte Composer\InstalledVersions::getInstallPath(), das seit dem
    // Composer-losen Einbinden des Themes ins Leere laeuft. Projekte, die mit jener Version schon
    // gepatcht wurden, muessen auf den neuen Aufruf migriert werden statt ein zweites Mal injiziert
    // zu werden (sonst wuerde das Rezept doppelt in die Warteschlange eingereiht).
    $legacyEnqueueCall = "\\Composer\\InstalledVersions::getInstallPath('drupal/drupal_cms_installer_de') . '/recipes/i18n_extras'";

    if (str_contains($content, $recipePath)) {
        echo "\033[34mℹ️ i18n_extras-Rezept ist bereits in den Installer eingebunden.\033[0m\n";
    } elseif (str_contains($content, $legacyEnqueueCall)) {
        file_put_contents($file, str_replace($legacyEnqueueCall, $recipePath, $content));
        echo "\033[32m✅ i18n_extras-Rezept-Hook auf Composer-losen Pfad migriert.\033[0m\n";
    } elseif (str_contains($content, $marker)) {
        $injection = $marker . "\n    // DE: i18n_extras (pb_localizer, yoast_seo_i18n, default_content_locale) immer\n    // NACH dem gewählten Site-Template anwenden.\n    \$this->recipeHandler->enqueue($recipePath);";
        file_put_contents($file, str_replace($marker, $injection, $content));
        echo "\033[32m✅ i18n_extras-Rezept erfolgreich in den Installer (2.1.x) eingebunden.\033[0m\n";
    } else {
        echo "\033[33m⚠️ Erwartete Codezeile für den Rezept-Hook nicht gefunden (Installer-Version evtl. geändert?). i18n_extras wird NICHT automatisch angewendet.\033[0m\n";
    }
}
