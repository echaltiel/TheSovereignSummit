/* Ticket-price countdown, rendered into #priceClockMount in the homepage hero.
   Prices increase at midnight at the end of Friday, September 11, 2026 in Miami
   (00:00 Saturday, September 12, ET = 04:00 UTC). Update the deadline below
   for future changes. */
(function () {
  'use strict';

  var deadline = Date.parse('2026-09-12T00:00:00-04:00');

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
        window.removeEventListener('resize', syncSize);
        if (anchorObserver) anchorObserver.disconnect();
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

    // Match the primary hero button's size so the box sits flush in the row.
    var anchor = document.querySelector('.hero__ctas .btn');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.hero__ctas .btn'));
    var anchorObserver;
    function syncSize() {
      if (!anchor) return;
      // Desktop row: match the tallest button. Stacked phones: match the Summit Pass button.
      var stacked = window.innerWidth <= 600;
      var tallest = stacked ? anchor.getBoundingClientRect().height : buttons.reduce(function (max, btn) {
        return Math.max(max, btn.getBoundingClientRect().height);
      }, 0);
      notice.style.minWidth = stacked ? '' : Math.round(anchor.getBoundingClientRect().width) + 'px';
      notice.style.height = Math.round(tallest) + 'px';
    }

    if (update()) {
      mount.appendChild(notice);
      syncSize();
      intervalId = window.setInterval(update, 1000);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('resize', syncSize);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncSize);
      if (window.ResizeObserver && anchor) {
        anchorObserver = new window.ResizeObserver(syncSize);
        buttons.forEach(function (btn) { anchorObserver.observe(btn); });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
