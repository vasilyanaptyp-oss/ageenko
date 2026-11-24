/* Дарья Агеенко: меню, окна, появление при прокрутке, параллакс рваных полос. Без библиотек. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = window.matchMedia('(max-width: 699px)');

  /* ---------- меню на телефоне ---------- */
  var burger = doc.querySelector('.burger');
  var menu = doc.getElementById('menu');
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.classList.toggle('menu-open', open);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
    var onMq = function () { if (!mobile.matches) setMenu(false); };
    if (mobile.addEventListener) mobile.addEventListener('change', onMq); else mobile.addListener(onMq);
  }

  /* ---------- окна «изучить» и «подробнее» ---------- */
  var lastTrigger = null;
  function openModal(id, trigger) {
    var d = doc.getElementById(id);
    if (!d) return;
    lastTrigger = trigger || null;
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
    root.classList.add('modal-open');
  }
  function closeModal(d) {
    if (typeof d.close === 'function' && d.open) d.close();
    else d.removeAttribute('open');
  }
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.getAttribute('data-modal'), t); return; }
    var x = e.target.closest('[data-close]');
    if (x) { closeModal(x.closest('dialog')); return; }
    /* щелчок по затемнению вокруг окна */
    if (e.target.tagName === 'DIALOG' && e.target.open) closeModal(e.target);
  });
  Array.prototype.forEach.call(doc.querySelectorAll('dialog'), function (d) {
    d.addEventListener('close', function () {
      root.classList.remove('modal-open');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
      lastTrigger = null;
    });
  });

  /* ---------- появление элементов ---------- */
  var items = doc.querySelectorAll('.rv, .rv-settle');
  function showAll() { Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); }); }
  if (reduce.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
    /* страховка: если вкладка была в фоне или наблюдатель не сработал */
    window.addEventListener('load', function () {
      setTimeout(function () {
        Array.prototype.forEach.call(items, function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
        });
      }, 1200);
    });
  }

  /* ---------- параллакс рваных полос ---------- */
  var strips = doc.querySelectorAll('[data-parallax]');
  var ticking = false;
  function parallax() {
    ticking = false;
    if (reduce.matches) return;
    var vh = window.innerHeight, sy = window.pageYOffset;
    var range = (mobile.matches ? 18 : 34);
    Array.prototype.forEach.call(strips, function (el) {
      var sec = el.parentElement;
      var r = sec.getBoundingClientRect();
      var top = r.top + sy, h = r.height;
      var start = Math.max(0, top - vh);          /* полоса показалась снизу */
      var end = top + h;                          /* полоса ушла вверх */
      var p = (sy - start) / Math.max(1, end - start);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      el.style.translate = '0 ' + (-range * p).toFixed(1) + 'px';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }
  if (strips.length && !reduce.matches) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    parallax();
  }
  var onReduce = function () {
    if (reduce.matches) {
      showAll();
      Array.prototype.forEach.call(strips, function (el) { el.style.translate = ''; });
    }
  };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce); else reduce.addListener(onReduce);
})();
