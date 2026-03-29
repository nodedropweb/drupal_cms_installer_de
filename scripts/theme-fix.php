<?php

// Pfad-Logik: Prüfen, ob wir im Theme-Ordner oder im Drupal-Root sind
$root = getcwd();
$targetPath = 'web/profiles/contrib/drupal_cms_installer/drupal_cms_installer.info.yml';

// Falls wir lokal im Theme-Ordner testen:
if (str_contains($root, 'drupal_cms_installer_de')) {
    $file = dirname($root, 1) . '/drupal_cms_installer/drupal_cms_installer.info.yml';
} else {
    $file = $root . '/' . $targetPath;
}

if (file_exists($file)) {
    $content = file_get_contents($file);
    
    // Suche nach der Theme-Zeile (berücksichtigt Einrückungen)
    if (preg_match('/theme:\s+drupal_cms_installer_theme/', $content)) {
        $newContent = preg_replace('/theme:\s+drupal_cms_installer_theme/', 'theme: drupal_cms_installer_de', $content);
        file_put_contents($file, $newContent);
        echo "\033[32m✅ Installer-Theme erfolgreich auf DE umgestellt.\033[0m\n";
    } elseif (str_contains($content, 'theme: drupal_cms_installer_de')) {
        echo "\033[34mℹ️ Installer-Theme ist bereits auf DE konfiguriert.\033[0m\n";
    } else {
        echo "\033[33m⚠️ String 'theme: drupal_cms_installer_theme' nicht in der Datei gefunden.\033[0m\n";
    }
} else {
    echo "\033[31m❌ Datei nicht gefunden: $file\033[0m\n";
}
