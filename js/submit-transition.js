(function (Drupal, once) {
  'use strict';

  /**
   * Plays a brief fade-out (see css/animations.css) before a step form
   * actually submits, so clicking "Weiter"/"Save and continue" feels like a
   * transition instead of an instant, jarring page swap.
   */
  Drupal.behaviors.installerSubmitTransition = {
    attach(context) {
      once('installer-submit-transition', '.button--next', context).forEach((button) => {
        button.addEventListener('click', (event) => {
          const form = button.closest('form');
          const main = document.querySelector('.cms-installer__main');
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          if (!form || !main || reduceMotion) {
            return;
          }

          event.preventDefault();
          main.classList.add('is-navigating');
          window.setTimeout(() => {
            form.requestSubmit(button);
          }, 200);
        });
      });
    },
  };

})(Drupal, once);
