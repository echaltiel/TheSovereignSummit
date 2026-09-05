/* Ticket-price countdown, rendered into #priceClockMount in the homepage hero.
   Midnight at the start of Monday, September 14, 2026 in Miami is 04:00 UTC.
   Update the deadline below for future changes. */
(function () {
  'use strict';

  var deadline = Date.parse('2026-09-14T00:00:00-04:00');

  function init() {
    var mount = document.getElementById('priceClockMount');
    if (!mount || Date.now() >= deadline || document.getElementById('ticketPriceNotice')) return;

    var notice = document.createElement('p');
    notice.id = 'ticketPriceNotice';
    notice.className = 'price-clock';
    notice.innerHTML =
      '<span class="price-clock__title">Ticket prices increase in</span>' +
      '<span class="price-clock__timer" role="timer" aria-live="off" aria-label="Time until ticket prices increase">' +
        '<span class="price-clock__unit" data-unit="days"><span class="price-clock__num" data-countdown="days"></span><span class="price-clock__lbl">days</span></span>' +
        '<span class="price-clock__sep" aria-hidden="true">:</span>' +
        '<span class="price-clock__unit"><span class="price-clock__num" data-countdown="hours"></span><span class="price-clock__lbl">hrs</span></span>' +
        '<span class="price-clock__sep" aria-hidden="true">:</span>' +
        '<span class="price-clock__unit"><span class="price-clock__num" data-countdown="minutes"></span><span class="price-clock__lbl">min</span></span>' +
        '<span class="price-clock__sep" aria-hidden="true">:</span>' +
        '<span class="price-clock__unit"><span class="price-clock__num" data-countdown="seconds"></span><span class="price-clock__lbl">sec</span></span>' +
      '</span>';

    var fields = ['days', 'hours', 'minutes', 'seconds'].map(function (unit) {
      return notice.querySelector('[data-countdown="' + unit + '"]');
    });
    var intervalId;

    function update() {
      // Recalculate from the absolute deadline after background tabs or sleep.
      var seconds = Math.ceil((deadline - Date.now()) / 1000);
      if (seconds <= 0) {
        window.clearInterval(intervalId);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        notice.remove();
        return false;
      }
      var values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
      fields.forEach(function (field, index) {
        field.textContent = String(values[index]).padStart(2, '0');
      });
      // Inside the final day, drop the days unit so the clock reads hh:mm:ss.
      notice.classList.toggle('price-clock--final-day', values[0] === 0);
      return true;
    }

    function onVisibilityChange() {
      if (!document.hidden) update();
    }

    // Match the width of the primary hero button so the box lines up beneath it.
    var anchor = document.querySelector('.hero__ctas .btn');
    function syncWidth() {
      if (!anchor) return;
      notice.style.minWidth = window.innerWidth > 600 ? Math.round(anchor.getBoundingClientRect().width) + 'px' : '';
    }

    if (update()) {
      mount.appendChild(notice);
      syncWidth();
      intervalId = window.setInterval(update, 1000);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('resize', syncWidth);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncWidth);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
