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
        '<div class="ticket-price-notice__message">' +
          '<p class="ticket-price-notice__title" id="ticketPriceHeading">Ticket prices increase ' +
            '<time datetime="2026-09-14T00:00:00-04:00">September 14</time></p>' +
          '<p class="ticket-price-notice__detail">Monday at 12:00 a.m. ET</p>' +
        '</div>' +
        '<div class="ticket-price-notice__clock" role="timer" aria-live="off" aria-label="Time until ticket prices increase">' +
          '<span class="ticket-price-notice__unit"><span class="ticket-price-notice__value" data-countdown="days"></span><span class="ticket-price-notice__unit-label">Days</span></span>' +
          '<span class="ticket-price-notice__unit"><span class="ticket-price-notice__value" data-countdown="hours"></span><span class="ticket-price-notice__unit-label" aria-label="Hours">Hrs</span></span>' +
          '<span class="ticket-price-notice__unit"><span class="ticket-price-notice__value" data-countdown="minutes"></span><span class="ticket-price-notice__unit-label" aria-label="Minutes">Min</span></span>' +
          '<span class="ticket-price-notice__unit"><span class="ticket-price-notice__value" data-countdown="seconds"></span><span class="ticket-price-notice__unit-label" aria-label="Seconds">Sec</span></span>' +
        '</div>' +
        '<a class="ticket-price-notice__cta" href="/tickets">Lock in today\'s price <span aria-hidden="true">&rarr;</span></a>' +
      '</div>';

    // On the tickets page, keep visitors in the existing embedded checkout.
    if (document.getElementById('zaprite_checkout')) {
      notice.querySelector('.ticket-price-notice__cta').setAttribute('href', '#zaprite_checkout');
    }

    var fields = ['days', 'hours', 'minutes', 'seconds'].map(function (unit) {
      return notice.querySelector('[data-countdown="' + unit + '"]');
    });
    var intervalId;
    var resizeObserver;

    function syncHeaderHeight() {
      document.documentElement.style.setProperty('--header-h', Math.ceil(header.getBoundingClientRect().height) + 'px');
    }

    function update() {
      // Recalculate from the absolute deadline after background tabs or sleep.
      var seconds = Math.ceil((deadline - Date.now()) / 1000);
      if (seconds <= 0) {
        window.clearInterval(intervalId);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('resize', syncHeaderHeight);
        if (resizeObserver) resizeObserver.disconnect();
        notice.remove();
        syncHeaderHeight();
        return false;
      }

      var values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
      fields.forEach(function (field, index) {
        field.textContent = String(values[index]).padStart(2, '0');
      });
      return true;
    }

    function onVisibilityChange() {
      if (!document.hidden) update();
    }

    if (update()) {
      header.appendChild(notice);
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
