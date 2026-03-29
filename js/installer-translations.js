(function (Drupal, once) {
  'use strict';

  /**
   * Translations for the Drupal CMS installer UI.
   *
   * Maps English strings (as they appear in the DOM) to their German
   * equivalents. Translations are only applied when the URL contains
   * `?langcode=de` (set by the installer's language-switcher.js).
   */
  const translations = {
    de: {
      'Choose a site template': 'Wähle eine Website-Vorlage',
      'Installed ': 'Installiere …',
      'Already purchased? Enter license key': 'Bereits gekauft? Lizenzschlüssel eingeben',
      'Created by Drupal CMS': 'Erstellt von Drupal CMS',
      'Learn more': 'Mehr erfahren',
      'Created by Dripyard': 'Erstellt von Dripyard',
      'Created by Kanopi Studios': 'Erstellt von Kanopi Studios',
      'Created by QED42': 'Erstellt von QED42',
      'License key': 'Lizenztschlüssel',
      'Created by Annertech': 'Erstellt von Annertech',
      'Created by Promet Source': 'Erstellt von Promet Source',
      'Created by OpenSense Labs': 'Erstellt von OpenSense Labs',
      'Created by Zoocha': 'Erstellt von Zoocha',
      'Created by Morpht': 'Erstellt von Morpht',
      'Designed to help organizations quickly create professional websites for conferences, summits, workshops, festivals, and community gatherings.': 'Entwickelt, um Organisationen dabei zu helfen, schnell professionelle Websites für Konferenzen, Tagungen, Workshops, Festivals und Gemeinschaftsveranstaltungen zu erstellen.',
      'Designed for a SaaS product website, this template includes landing pages, a blog, newsletter sign up and other features.': 'Entwickelt für die Website eines SaaS-Produkts, umfasst diese Vorlage Landingpages, einen Blog, eine Newsletter-Anmeldung und weitere Funktionen.',
      'A simple template with just the basics. Bring your own design, and build what you need.': 'Eine einfache Vorlage mit nur den grundlegenden Funktionen. Bringen Sie Ihr eigenes Design mit und erstellen Sie genau das, was Sie brauchen.',
      'Designed for non-profit sites, this template features a bright, warm design that can be adapted for many use cases. It comes pre-configured with blog, projects and people profiles, as well as newsletter signup, donation add-ons and more.': 'Entwickelt für gemeinnützige Websites, bietet diese Vorlage ein helles, warmes Design, das für viele Anwendungsfälle angepasst werden kann. Es ist vorkonfiguriert mit Blog, Projekten und Personenprofilen sowie Newsletter-Anmeldung, Spenden-Add-ons und mehr.',
      'Designed for medical clinics and hospital networks. Features an accessible, patient-centered design with pre-built provider directories, service listings, location finders, health events, and news.': 'Entwickelt für medizinische Kliniken und Krankenhausverbünde. Bietet ein benutzerfreundliches, patientenorientiertes Design mit vorgefertigten Verzeichnissen von Leistungserbringern, Leistungsübersichten, Standortfindern, Gesundheitsveranstaltungen und Nachrichten.',
      'A modern, professional Drupal site template designed for K-12 schools, charter schools, and smaller educational institutions.': 'Ein modernes, professionelles Drupal-Website-Template für K-12-Schulen, Charter-Schulen und kleinere Bildungseinrichtungen.',
      'Designed for a primary/secondary education website. Includes landing pages, a blog, newsletter sign-up and other features.': 'Entwickelt für eine Grund-/Sekundarschul-Website. Enthält Landingpages, einen Blog, Newsletter-Anmeldung und weitere Funktionen.',
      'A starter site providing editor-friendly components for best-practice government sites.': 'Eine Starter-Site, die redaktionsfreundliche Komponenten für bewährte Regierungs-Websites bietet.',
      'A blank template with the foundational features of Drupal CMS, for those who truly want to start from scratch.': 'Eine leere Vorlage mit den grundlegenden Funktionen von Drupal CMS, für diejenigen, die wirklich von Grund auf neu beginnen möchten.',
      'Designed for a modern health and wellness platform. Features sections for health topics, research studies, expert insights, articles, and reviews. Supports FAQs, trending content, and expert consultation forms.': 'Entwickelt für eine moderne Gesundheits- und Wellness-Plattform. Bietet Abschnitte für Gesundheitsthemen, Forschungsstudien, Experteneinblicke, Artikel und Bewertungen. Unterstützt FAQs, aktuelle Inhalte und Beratungsformulare für Experten.',
      'A local council website with services, navigation, and demo content in a classic blue and white palette.': 'Eine lokale Website einer Gemeinde mit Dienstleistungen, Navigation und Demo-Inhalten in einer klassischen Blau-Weiß-Farbpalette.',
      'Built for higher education institutions, including landing pages, course listings, news and events functionality, and a range of tools tailored to the needs of colleges and universities.': 'Entwickelt für Hochschulen und Universitäten, einschließlich Landingpages, Kursangebote, Nachrichten und Veranstaltungsfunktionen sowie einer Reihe von Tools, die auf die Bedürfnisse von Colleges und Universitäten zugeschnitten sind.',
      'Designed for non-profit organizations, community groups, and social initiatives that need a clear and effective online presence.': 'Entwickelt für gemeinnützige Organisationen, Gemeinschaftsgruppen und soziale Initiativen, die eine klare und effektive Online-Präsenz benötigen.',
      'Frei': 'Kostenlos',
      'Buy for $899': 'Für $899 kaufen',
    },
  };

  /**
   * Returns the currently selected langcode from the URL, defaulting to 'en'.
   *
   * @return {string}
   */
  function getCurrentLangcode() {
    return new URL(window.location.href).searchParams.get('langcode') ?? 'en';
  }

  /**
   * Translates a single text node's value if a translation exists.
   *
   * @param {Text} node
   * @param {Object} map - key/value pairs for the current language.
   */
  function translateTextNode(node, map) {
    const trimmed = node.nodeValue.trim();
    if (map[trimmed]) {
      node.nodeValue = node.nodeValue.replace(trimmed, map[trimmed]);
    }
  }

  /**
   * Walks all text nodes inside `root` and applies translations.
   *
   * @param {Element} root
   * @param {Object} map
   */
  function translateSubtree(root, map) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      translateTextNode(node, map);
    }
  }

  /**
   * Drupal behavior: applies installer translations for the detected language.
   */
  Drupal.behaviors.installerTranslations = {
    attach: function (context) {
      const langcode = getCurrentLangcode();
      const map = translations[langcode];

      // Nothing to do if no translations are defined for this language.
      if (!map) {
        return;
      }

      // Translate the page title (h1 / form legend / fieldset title).
      once('installer-translations-title', 'h1, legend, .fieldset-legend', context).forEach(
        (el) => translateSubtree(el, map)
      );

      // Translate any remaining visible text that might contain our strings
      // (e.g., labels, headings rendered outside the above selectors).
      once('installer-translations-body', 'body', context).forEach(
        (el) => translateSubtree(el, map)
      );
    },
  };

})(Drupal, once);
