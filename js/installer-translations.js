(function (Drupal, once) {
  'use strict';

  /**
   * Translations for the Drupal CMS installer UI.
   *
   * Maps English strings (as they appear in the DOM) to their German
   * equivalents. Translations are only applied when German was chosen in the
   * installer's language switcher (see js/langcode.js).
   *
   * Seit Drupal CMS 2.2 lädt der Installer selbst eine offizielle
   * Übersetzungsdatei (drupal_cms_installer-2.2.x.de.po) von
   * localize.drupal.org. Diese Liste deckt deshalb vor allem ab, was dort
   * (noch) fehlt: die Beschreibungen der Site-Templates, neue 2.2-Strings
   * (Sprachumschalter-Dialog, Abschlussseite) und einige Korrekturen an
   * offiziellen Übersetzungen (z. B. "Frei", "Schluss machen").
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
      'License key': 'Lizenzschlüssel',
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
      'Created by Event Organizers Working Group': 'Erstellt von Event Organizers Working Group',
      'Created by drunomics': 'Erstellt von drunomics',
      'Designed for a portfolio site, this template features a sharp and striking black-and-white design, along with articles and a project portfolio.': 'Entwickelt für eine Portfolio-Website, bietet diese Vorlage ein scharfes und auffälliges Schwarz-Weiß-Design sowie Artikel und ein Projektportfolio.',
      'Designed for a portfolio site, this template features a warm and modern earthy design, along with articles and a project portfolio.': 'Entwickelt für eine Portfolio-Website, bietet diese Vorlage ein warmes und modernes, erdiges Design sowie Artikel und ein Projektportfolio.',
      'Built with the Mercury theme, this template showcases Mercury and documents the theme\'s features and components.': 'Erstellt mit dem Mercury-Theme, präsentiert diese Vorlage Mercury und dokumentiert die Funktionen und Komponenten des Themes.',
      'Designed for a conference or similar event that collects, moderates, and schedules user-submitted sessions. Features sections for events, sessions, articles (news), and sponsorships. Supports BOFs, jobs listings, personal schedules, webforms, and pages.': 'Entwickelt für eine Konferenz oder ähnliche Veranstaltung, die von Nutzern eingereichte Sessions sammelt, moderiert und terminiert. Bietet Bereiche für Veranstaltungen, Sessions, Artikel (News) und Sponsoring. Unterstützt BOFs, Stellenanzeigen, persönliche Zeitpläne, Webformulare und Seiten.',
      'A simple Nuxt frontend starter with Tailwind CSS that uses decoupled rendering via Lupus Decoupled.': 'Ein einfacher Nuxt-Frontend-Starter mit Tailwind CSS, der entkoppeltes Rendering über Lupus Decoupled nutzt.',
      'Nuxt repo': 'Nuxt-Repository',
      // Neu in Drupal CMS 2.2: Sprachumschalter-Dialog.
      'Change language': 'Sprache wechseln',
      'Install your site in a different language': 'Website in einer anderen Sprache installieren',
      'Search': 'Suchen',
      'Close dialog': 'Dialog schließen',
      'Downloading selected language': 'Ausgewählte Sprache wird heruntergeladen',
      // Neu in Drupal CMS 2.2: Installationsschritte, Abschlussseite, Links.
      'Name your site': 'Website benennen',
      'Choose site template': 'Website-Vorlage auswählen',
      'Setting up your site': 'Website wird eingerichtet',
      'Finishing up': 'Abschluss',
      'Schluss machen': 'Abschluss',
      'Your site is almost ready': 'Die Website ist fast fertig',
      'This will only take a moment.': 'Das dauert nur einen Moment.',
      'Finishing installation.': 'Installation wird abgeschlossen.',
      'Free': 'Kostenlos',
      'Validating...': 'Wird überprüft …',
      // Halb übersetzte Core-Strings (Datenbankschritt).
      'MySQL, MariaDB, oder equivalent': 'MySQL, MariaDB oder kompatibel',
      'MySQL, MariaDB, oder equivalent über mysqli (experimentell)': 'MySQL, MariaDB oder kompatibel über mysqli (experimentell)',
      'MySQL, MariaDB, or equivalent': 'MySQL, MariaDB oder kompatibel',
      'Initializing.': 'Initialisierung.',
    },
  };

  /**
   * Pattern-based translations for strings with placeholders, which cannot be
   * matched literally (e.g. the per-language aria-labels of the language
   * switcher dialog introduced in Drupal CMS 2.2).
   */
  const patterns = {
    de: [
      [/^Select (.+) and close dialog$/, '$1 auswählen und Dialog schließen'],
    ],
  };

  /**
   * Attributes that carry user-facing text and are translated as well.
   */
  const ATTRIBUTES = ['aria-label', 'placeholder', 'title', 'alt'];

  /**
   * Returns the translation of a string, or NULL if there is none.
   *
   * @param {string} text
   * @param {Object} map
   * @param {Array} patternList
   *
   * @return {string|null}
   */
  function translateString(text, map, patternList) {
    if (map[text]) {
      return map[text];
    }
    for (const [pattern, replacement] of patternList) {
      if (pattern.test(text)) {
        return text.replace(pattern, replacement);
      }
    }
    return null;
  }

  /**
   * Translates a single text node's value if a translation exists.
   *
   * @param {Text} node
   * @param {Object} map - key/value pairs for the current language.
   * @param {Array} patternList - [RegExp, replacement] pairs.
   */
  function translateTextNode(node, map, patternList) {
    const trimmed = node.nodeValue.trim();
    const translated = trimmed && translateString(trimmed, map, patternList);
    if (translated) {
      node.nodeValue = node.nodeValue.replace(trimmed, translated);
    }
  }

  /**
   * Walks all text nodes and text attributes inside `root` and applies
   * translations.
   *
   * @param {Element} root
   * @param {Object} map
   * @param {Array} patternList
   */
  function translateSubtree(root, map, patternList) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      translateTextNode(node, map, patternList);
    }

    const selector = ATTRIBUTES.map((attribute) => `[${attribute}]`).join(',');
    [root, ...root.querySelectorAll(selector)].forEach((el) => {
      ATTRIBUTES.forEach((attribute) => {
        const value = el.getAttribute && el.getAttribute(attribute);
        const translated = value && translateString(value.trim(), map, patternList);
        if (translated) {
          el.setAttribute(attribute, translated);
        }
      });
    });
  }

  /**
   * Drupal behavior: applies installer translations for the detected language.
   */
  Drupal.behaviors.installerTranslations = {
    attach: function (context) {
      // @see js/langcode.js
      const langcode = Drupal.installerDe.getLangcode();
      const map = translations[langcode];
      const patternList = patterns[langcode] ?? [];

      // Nothing to do if no translations are defined for this language.
      if (!map) {
        return;
      }

      // Translate the page title (h1 / form legend / fieldset title).
      once('installer-translations-title', 'h1, legend, .fieldset-legend', context).forEach(
        (el) => translateSubtree(el, map, patternList)
      );

      // Translate any remaining visible text that might contain our strings
      // (e.g., labels, headings rendered outside the above selectors).
      once('installer-translations-body', 'body', context).forEach(
        (el) => translateSubtree(el, map, patternList)
      );

      // Vorgabewert des Website-Namens: Die offizielle Übersetzung "Meine
      // Drupal CMS Seite" passt nicht zur Überschrift, die von "Website"
      // spricht. Nur ersetzen, solange der Nutzer nichts geändert hat.
      if (langcode === 'de') {
        once('installer-translations-site-name', 'input[name="site_name"]', context).forEach((input) => {
          if (['My Drupal CMS site', 'Meine Drupal CMS Seite'].includes(input.value.trim())) {
            input.value = 'Meine Drupal-CMS-Website';
          }
        });
      }

      // Browser tab title.
      const title = translateString(document.title.split(' | ')[0].trim(), map, patternList);
      if (title) {
        document.title = document.title.replace(document.title.split(' | ')[0].trim(), title);
      }
    },
  };

})(Drupal, once);
