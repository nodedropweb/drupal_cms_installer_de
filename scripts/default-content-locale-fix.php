<?php

// Korrigiert zwei Fehler in drupal/default_content_locale (1.x-dev), die bei
// der Installation von Vorlagen mit übersetzbaren Standardinhalten (z. B.
// Haven) auf Deutsch auftreten:
//
// 1. Abbruch der Installation:
//      SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'status'
//      cannot be null: INSERT INTO "taxonomy_term_field_data" ...
//    DefaultContentLocaleSubscriber::onPreEntityImport() legt für die
//    Zielsprache eine Übersetzung an, die NUR die übersetzten Textfelder
//    enthält; Core speichert sie mit NULL in übersetzbaren Pflichtfeldern.
//
// 2. Doppelte Inhalte: Während des Inhaltsimports ist Englisch im Installer
//    noch Standardsprache. Die Entität wird englisch angelegt, Deutsch kommt
//    als Übersetzung dazu, danach stellt config_language_lock auf Deutsch um
//    - die englische Fassung bleibt als verwaiste Übersetzung zurück, obwohl
//    Englisch am Ende der Installation entfernt wird. Inhaltslisten zeigen
//    dann jeden Eintrag doppelt.
//
// Korrektur: Ist die Zielsprache die gesperrte Installationssprache
// (config_language_lock.settings:locked_langcode, vom Drupal-CMS-Installer
// früh gesetzt), werden die englischen Standardwerte direkt durch die
// übersetzten ersetzt - wie bei einer einsprachigen Seite, genau eine Fassung.
// Andernfalls (echte zusätzliche Sprache) wird wie bisher eine Übersetzung
// angelegt, aber mit allen übrigen Feldern der Quelle (außer "path", damit
// keine doppelten URL-Aliase entstehen).
//
// Sobald das Modul das selbst behebt, findet dieses Skript die Codezeile nicht
// mehr und tut nichts. Wie beim Installer-Patch gilt: "composer update" kann
// die Datei überschreiben - dann installer_de_patch.sh erneut ausführen.

$root = getcwd();
if (str_contains($root, 'drupal_cms_installer_de')) {
    $moduleDir = dirname($root, 2) . '/modules/contrib/default_content_locale';
} else {
    $moduleDir = $root . '/web/modules/contrib/default_content_locale';
}
$file = $moduleDir . '/src/EventSubscriber/DefaultContentLocaleSubscriber.php';

if (!file_exists($file)) {
    echo "\033[33m⚠️ default_content_locale nicht gefunden ($file) - übersprungen.\033[0m\n";
    exit;
}

$content = file_get_contents($file);
$marker = 'DE (drupal_cms_installer_de) v2';

// Originalzeile des Moduls ...
$original = "        \$event->data['translations'][\$langcode] = \$translated_fields;";
// ... oder die erste Fassung dieses Patches (Projekte, die schon damit
// gepatcht wurden, werden auf die neue Fassung migriert).
$previous = "        // DE (drupal_cms_installer_de): Nicht-Text-Felder (z. B. status) aus der\n"
    . "        // Quelle übernehmen, sonst speichert Core die Übersetzung mit NULL in\n"
    . "        // Pflichtfeldern. \"path\" bleibt aussen vor (doppelte URL-Aliase).\n"
    . "        \$event->data['translations'][\$langcode] = \$translated_fields + array_diff_key(\$english_data, ['path' => TRUE]);";

$replacement = <<<'PHP'
        // DE (drupal_cms_installer_de) v2: Ist die Zielsprache die gesperrte
        // Installationssprache, die englischen Standardwerte direkt ersetzen
        // (genau eine Fassung, keine verwaiste englische Übersetzung).
        // Sonst eine Übersetzung mit allen übrigen Feldern der Quelle anlegen
        // (ohne "path"), damit Pflichtfelder wie status nicht NULL sind.
        $locked_langcode = \Drupal::config('config_language_lock.settings')->get('locked_langcode');
        if ($default_langcode === 'en' && $langcode === $locked_langcode) {
          $event->data['default'] = $translated_fields + $event->data['default'];
          continue;
        }
        $event->data['translations'][$langcode] = $translated_fields + array_diff_key($english_data, ['path' => TRUE]);
PHP;

if (str_contains($content, $marker)) {
    echo "\033[34mℹ️ default_content_locale ist bereits korrigiert.\033[0m\n";
} elseif (str_contains($content, $previous)) {
    file_put_contents($file, str_replace($previous, $replacement, $content));
    echo "\033[32m✅ default_content_locale-Korrektur auf neue Fassung aktualisiert.\033[0m\n";
} elseif (str_contains($content, $original)) {
    file_put_contents($file, str_replace($original, $replacement, $content));
    echo "\033[32m✅ default_content_locale korrigiert (Vorlagen-Inhalte direkt auf Deutsch, ohne doppelte Fassungen).\033[0m\n";
} else {
    echo "\033[33m⚠️ Erwartete Codezeile in default_content_locale nicht gefunden (Modul evtl. schon upstream korrigiert?) - keine Änderung.\033[0m\n";
}
