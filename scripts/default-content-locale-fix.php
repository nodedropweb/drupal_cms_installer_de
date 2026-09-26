<?php

// Korrigiert einen Fehler in drupal/default_content_locale (1.x-dev), der die
// Installation von Vorlagen mit übersetzbaren Standardinhalten (z. B. Haven)
// auf Deutsch abbrechen lässt:
//
//   SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'status'
//   cannot be null: INSERT INTO "taxonomy_term_field_data" ...
//
// Ursache: DefaultContentLocaleSubscriber::onPreEntityImport() legt für die
// Zielsprache eine Übersetzung an, die NUR die übersetzten Textfelder enthält.
// Während der Drupal-CMS-Installation ist Englisch noch als zweite Sprache
// vorhanden (Core entfernt es erst am Ende), daher wird tatsächlich eine
// Übersetzung angelegt - und Core speichert sie mit NULL in übersetzbaren
// Pflichtfeldern wie "status".
//
// Korrektur: Die übrigen Felder der englischen Quelle (außer "path", damit
// keine doppelten URL-Aliase entstehen) werden in die Übersetzung übernommen.
// Sobald das Modul den Fehler selbst behebt, findet dieses Skript die
// Codezeile nicht mehr und tut nichts.
//
// Wie beim Installer-Patch gilt: "composer update" kann die Datei
// überschreiben - dann installer_de_patch.sh erneut ausführen.

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
$old = "        \$event->data['translations'][\$langcode] = \$translated_fields;";
$new = "        // DE (drupal_cms_installer_de): Nicht-Text-Felder (z. B. status) aus der\n"
    . "        // Quelle übernehmen, sonst speichert Core die Übersetzung mit NULL in\n"
    . "        // Pflichtfeldern. \"path\" bleibt aussen vor (doppelte URL-Aliase).\n"
    . "        \$event->data['translations'][\$langcode] = \$translated_fields + array_diff_key(\$english_data, ['path' => TRUE]);";
$patched = "\$translated_fields + array_diff_key(\$english_data, ['path' => TRUE])";

if (str_contains($content, $patched)) {
    echo "\033[34mℹ️ default_content_locale ist bereits korrigiert.\033[0m\n";
} elseif (str_contains($content, $old)) {
    file_put_contents($file, str_replace($old, $new, $content));
    echo "\033[32m✅ default_content_locale korrigiert (Übersetzungen übernehmen Pflichtfelder wie status).\033[0m\n";
} else {
    echo "\033[33m⚠️ Erwartete Codezeile in default_content_locale nicht gefunden (Modul evtl. schon upstream korrigiert?) - keine Änderung.\033[0m\n";
}
