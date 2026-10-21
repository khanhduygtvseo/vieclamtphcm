/* Tương tác chung. Trang vẫn đọc được khi tắt JavaScript. */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // header đổ bóng khi cuộn, nút lên đầu trang
  var hd = $('.hd'), top = $('.to-top');
  function onScroll() {
    var y = window.pageYOffset || d.documentElement.scrollTop;
    if (hd) hd.classList.toggle('scrolled', y > 8);
    if (top) top.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // menu di động
  var burger = $('.burger'), nav = $('#nav');
  function closeNav() {
    if (!burger) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Mở menu');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  }
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  // bộ chọn dạng tab: dùng cho khu vực và hỏi đáp
  function tabset(root, btnSel, panelSel, onCls) {
    var btns = $$(btnSel, root), panels = $$(panelSel, root);
    function pick(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle(onCls, on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        var on = p.id === btn.getAttribute('aria-controls');
        p.hidden = !on;
        p.classList.toggle('on', on);
      });
      if (focus) btn.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = btns[(i + 1) % btns.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = btns[(i - 1 + btns.length) % btns.length];
        if (n) { e.preventDefault(); pick(n, true); }
      });
    });
    return { pick: pick, btns: btns };
  }
  var xpRoot = $('[data-xp]');
  var xp = xpRoot && tabset(xpRoot, '.xp-i', '.xp-p', 'on');
  var fxRoot = $('[data-fx]');
  if (fxRoot) tabset(fxRoot, '.fx-b', '.fx-p', 'on');

  // lối tắt ở hero chọn sẵn khu vực
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!xp) return;
      var b = $('#xpb-' + a.getAttribute('data-pick'));
      if (b) xp.pick(b);
    });
  });

  // băng chuyền ngành nghề
  $$('[data-car]').forEach(function (car) {
    var track = $('.car-track', car), prev = $('.prev', car), next = $('.next', car);
    function step() { var c = $('.ic', track); return c ? c.getBoundingClientRect().width + 24 : 320; }
    function sync() {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  // lọc bài theo chủ đề (Cẩm nang)
  var ftabs = $$('.tab[data-f]'), tdesc = $('#tab-desc');
  var allText = tdesc ? tdesc.textContent : '';
  function filter(f) {
    ftabs.forEach(function (x) {
      var on = x.getAttribute('data-f') === f;
      x.classList.toggle('on', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && tdesc) tdesc.textContent = f === 'all' ? allText : x.getAttribute('data-desc');
    });
    $$('#post-list .pc').forEach(function (c) {
      var show = f === 'all' || c.getAttribute('data-tab') === f;
      c.hidden = !show;
      if (show) c.classList.add('is-in');
    });
  }
  if (ftabs.length) {
    ftabs.forEach(function (t) { t.addEventListener('click', function () { filter(t.getAttribute('data-f')); }); });
    var applyHash = function () {
      var h = (location.hash || '').replace('#', '');
      if (h && ftabs.some(function (t) { return t.getAttribute('data-f') === h; })) filter(h);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
  }

  // hiệu ứng xuất hiện khi cuộn tới
  var els = $$('[data-r]');
  function show(el) { el.classList.add('is-in'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show(el);
      });
    }, 2500);
  } else { els.forEach(show); }
})();
