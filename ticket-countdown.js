/* Shared ticket-button countdown. Midnight at the start of Monday in Miami
   is 04:00 UTC on September 14, 2026 (EDT). Change the deadline and its label
   together when scheduling a future countdown. */
(function () {
  'use strict';

  var deadline = Date.parse('2026-09-14T00:00:00-04:00');
  var deadlineLabel = 'Countdown ends Monday, September 14, 2026 at 12:00 a.m. Miami time.';

  function init() {
    if (Date.now() >= deadline) return;

    var buttons = document.querySelectorAll('.nav__cta[href="/tickets"], .mobile-menu__cta[href="/tickets"]');
    var entries = [];
    var intervalId;

    buttons.forEach(function (button) {
      if (button.classList.contains('ticket-countdown')) return;

      var label = document.createElement('span');
      label.className = 'ticket-countdown__label';
      while (button.firstChild) label.appendChild(button.firstChild);

      var value = document.createElement('span');
      value.className = 'ticket-countdown__value';
      value.setAttribute('aria-hidden', 'true');
      value.title = deadlineLabel;

      // Keep the deadline accessible without announcing every passing second.
      var description = document.createElement('span');
      description.className = 'ticket-countdown__deadline';
      description.textContent = ' ' + deadlineLabel;

      button.appendChild(label);
      button.appendChild(value);
      button.appendChild(description);
      button.classList.add('ticket-countdown');
      entries.push({ button: button, label: label, value: value, description: description });
    });

    if (!entries.length) return;

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function update() {
      // Recalculate from the absolute deadline, including after a sleeping tab.
      var seconds = Math.ceil((deadline - Date.now()) / 1000);
      if (seconds <= 0) {
        window.clearInterval(intervalId);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        entries.forEach(function (entry) {
          entry.value.remove();
          entry.description.remove();
          while (entry.label.firstChild) entry.button.insertBefore(entry.label.firstChild, entry.label);
          entry.label.remove();
          entry.button.classList.remove('ticket-countdown');
        });
        return false;
      }

      var text = pad(Math.floor(seconds / 86400)) + 'd ' +
        pad(Math.floor(seconds % 86400 / 3600)) + 'h ' +
        pad(Math.floor(seconds % 3600 / 60)) + 'm ' + pad(seconds % 60) + 's';
      entries.forEach(function (entry) { entry.value.textContent = text; });
      return true;
    }

    function onVisibilityChange() {
      if (!document.hidden) update();
    }

    if (update()) {
      intervalId = window.setInterval(update, 1000);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
