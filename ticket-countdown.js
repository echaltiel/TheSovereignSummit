/* Ticket-price increase notice shared across the site.
   Midnight at the start of Monday, September 14, 2026 in Miami is 04:00 UTC.
   Keep the deadline and customer-facing date below in sync for future changes. */
(function () {
  'use strict';

  var deadline = Date.parse('2026-09-14T00:00:00-04:00');

  function init() {
    var header = document.getElementById('siteHeader');
    if (!header || Date.now() >= deadline || document.getElementById('ticketPriceNotice')) return;

    var notice = document.createElement('aside');
    notice.id = 'ticketPriceNotice';
    notice.className = 'ticket-price-notice';
    notice.setAttribute('aria-labelledby', 'ticketPriceHeading');
    notice.innerHTML =
      '<div class="ticket-price-notice__inner">' +
        '<p class="ticket-price-notice__title" id="ticketPriceHeading">Ticket prices increase ' +
          '<time datetime="2026-09-14T00:00:00-04:00">September 14</time></p>' +
        '<span class="ticket-price-notice__separator" aria-hidden="true">&middot;</span>' +
        '<div class="ticket-price-notice__clock" role="timer" aria-live="off" aria-label="Time until ticket prices increase">' +
          '<span class="ticket-price-notice__unit" aria-hidden="true"><span class="ticket-price-notice__value" data-countdown="days"></span><span class="ticket-price-notice__unit-label">d</span></span>' +
          '<span class="ticket-price-notice__unit" aria-hidden="true"><span class="ticket-price-notice__value" data-countdown="hours"></span><span class="ticket-price-notice__unit-label">h</span></span>' +
          '<span class="ticket-price-notice__unit" aria-hidden="true"><span class="ticket-price-notice__value" data-countdown="minutes"></span><span class="ticket-price-notice__unit-label">m</span></span>' +
        '</div>' +
      '</div>';

    var cutoffNote = document.querySelector('[data-ticket-price-cutoff]');
    var clock = notice.querySelector('.ticket-price-notice__clock');
    var fields = ['days', 'hours', 'minutes'].map(function (unit) {
      return notice.querySelector('[data-countdown="' + unit + '"]');
    });
    var intervalId;
    var resizeObserver;
    var lastMinutes;

    function syncHeaderHeight() {
      document.documentElement.style.setProperty('--header-h', Math.ceil(header.getBoundingClientRect().height) + 'px');
    }

    function update() {
      // Recalculate from the absolute deadline after background tabs or sleep.
      var remaining = deadline - Date.now();
      if (remaining <= 0) {
        window.clearInterval(intervalId);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('resize', syncHeaderHeight);
        if (resizeObserver) resizeObserver.disconnect();
        notice.remove();
        if (cutoffNote) cutoffNote.hidden = true;
        syncHeaderHeight();
        return false;
      }

      // Round up to whole minutes so zero is never shown before the deadline.
      // Only change the displayed text once per minute; seconds stay hidden.
      var minutes = Math.ceil(remaining / 60000);
      if (minutes !== lastMinutes) {
        var values = [Math.floor(minutes / 1440), Math.floor(minutes % 1440 / 60), minutes % 60];
        fields.forEach(function (field, index) {
          field.textContent = String(values[index]).padStart(2, '0');
        });
        clock.setAttribute('aria-label', values[0] + ' days, ' + values[1] + ' hours and ' + values[2] + ' minutes until ticket prices increase.');
        lastMinutes = minutes;
      }
      return true;
    }

    function onVisibilityChange() {
      if (!document.hidden) update();
    }

    if (update()) {
      header.appendChild(notice);
      if (cutoffNote) cutoffNote.hidden = false;
      syncHeaderHeight();
      intervalId = window.setInterval(update, 1000);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('resize', syncHeaderHeight);
      // Keep content and anchors clear when the banner wraps or fonts load.
      if (window.ResizeObserver) {
        resizeObserver = new window.ResizeObserver(syncHeaderHeight);
        resizeObserver.observe(header);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
