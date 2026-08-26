/* Sticky affiliate promo codes.
   Reads ?promo / ?promoCode / ?code (any case) on any page, stores the sanitized
   uppercase code in a first-party cookie (ss_promo, 30 days, first-click wins),
   and appends promoCode=<code> to every pay.zaprite.com/pl_wIAImtY5wz link and
   iframe while preserving existing params (embed=1 etc). Hotel/Passkey links untouched. */
(function () {
  'use strict';
  var COOKIE = 'ss_promo';
  var DAYS = 30;
  var ZAP_HOST = 'pay.zaprite.com';
  var ZAP_PATH = '/pl_wIAImtY5wz';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function setCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + DAYS * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
  }
  function sanitize(v) {
    return String(v || '').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  }

  // 1) Capture code from URL (first-click: never overwrite an existing cookie)
  try {
    var params = new URLSearchParams(window.location.search);
    var raw = '';
    params.forEach(function (value, key) {
      var k = key.toLowerCase();
      if (!raw && (k === 'promo' || k === 'promocode' || k === 'code')) raw = value;
    });
    var code = sanitize(raw);
    if (code && !getCookie(COOKIE)) setCookie(COOKIE, code);
  } catch (e) { /* no-op */ }

  // 2) Rewrite Zaprite checkout links and iframes
  function withPromo(href, code) {
    try {
      var u = new URL(href, window.location.href);
      if (u.hostname !== ZAP_HOST || u.pathname.indexOf(ZAP_PATH) !== 0) return null;
      if (u.searchParams.get('promoCode')) return null; // keep an explicit code
      u.searchParams.set('promoCode', code);
      return u.toString();
    } catch (e) { return null; }
  }
  function apply() {
    var code = sanitize(getCookie(COOKIE));
    if (!code) return;
    document.querySelectorAll('a[href*="' + ZAP_HOST + '"]').forEach(function (a) {
      var next = withPromo(a.getAttribute('href'), code);
      if (next) a.setAttribute('href', next);
    });
    document.querySelectorAll('iframe[src*="' + ZAP_HOST + '"]').forEach(function (f) {
      var next = withPromo(f.getAttribute('src'), code);
      if (next) f.setAttribute('src', next);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
