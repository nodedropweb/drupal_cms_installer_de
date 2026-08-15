(function (Drupal, once) {
  'use strict';

  /**
   * "Created by @creator" / "Erstellt von @creator" is rendered as a single
   * text node (see form-element--site-template.html.twig), so plain CSS
   * can't color just the vendor name. This wraps it in a span after the
   * fact, once per element, in whichever language is currently on screen.
   */
  const PREFIX_PATTERN = /^(Created by|Erstellt von)\s+(.+)$/;

  Drupal.behaviors.installerVendorHighlight = {
    attach(context) {
      once('installer-vendor-highlight', '.creator', context).forEach((el) => {
        const match = el.textContent.trim().match(PREFIX_PATTERN);
        if (!match) {
          return;
        }
        el.textContent = '';
        el.append(match[1] + ' ');
        const span = document.createElement('span');
        span.className = 'creator__vendor';
        span.textContent = match[2];
        el.append(span);
      });
    },
  };

})(Drupal, once);
