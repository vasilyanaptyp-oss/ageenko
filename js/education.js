/* RASA Education: список материалов (education.html) и страница одного материала (material.html?id=…).
   Материалы приходят из редактора сайта (admin/, раздел «RASA Education: материалы») через js/cms-site.js.
   Текст материала: пустая строка = новый абзац, строка с # в начале = подзаголовок, строки с тире в начале = список.
   Пока материалов нет, на education.html стоит строка «Скоро здесь появятся материалы». Без библиотек. */
(function () {
  'use strict';
  var doc = document, cms = window.DASHA_CMS || null;
  function items() { return cms && cms.materials ? cms.materials() : []; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  /* ---------- список ---------- */
  var list = doc.querySelector('[data-ed-list]'), empty = doc.querySelector('[data-ed-empty]');
  function card(m) {
    var inner =
      (m.img ? '<img class="jcard__img" src="' + esc(m.img) + '" alt="" loading="lazy" decoding="async">' : '') +
      (m.kind ? '<p class="jcard__r">' + esc(m.kind) + '</p>' : '') +
      '<h2 class="jcard__h">' + esc(m.title) + '</h2>' +
      (m.excerpt ? '<p class="jcard__t">' + esc(m.excerpt) + '</p>' : '') +
      (m.price ? '<p class="jcard__d">' + esc(m.price) + '</p>' : '');
    /* карточка открывает страницу материала, если у него есть текст */
    if (m.text) return '<a class="jcard" href="material.html?id=' + encodeURIComponent(m.id) + '">' + inner + '</a>';
    return '<article class="jcard">' + inner + '</article>';
  }
  function showList() {
    var all = items();
    if (all.length) {
      var html = all.map(card).join('');
      if (list._html !== html) { list.innerHTML = html; list._html = html; }
      list.hidden = false;
      empty.hidden = true;
    } else {
      list.innerHTML = ''; list._html = '';
      list.hidden = true;
      empty.hidden = !!(cms && cms.pending);          /* пока редактор не ответил, строка «скоро» не показывается */
    }
  }

  /* ---------- один материал ---------- */
  var box = doc.querySelector('[data-material]'), none = doc.querySelector('[data-m-none]');
  var id = '';
  try { id = new URLSearchParams(window.location.search).get('id') || ''; } catch (e) { id = ''; }
  function q(sel) { return box.querySelector(sel); }
  function showOne() {
    var m = items().filter(function (x) { return x.id === id; })[0];
    if (!m || !m.text) {
      box.hidden = true;
      none.hidden = !!(cms && cms.pending);
      return;
    }
    var kind = q('[data-m-kind]'), title = q('[data-m-title]'), cover = q('[data-m-cover]'), text = q('[data-m-text]');
    var pbox = q('[data-m-pricebox]'), price = q('[data-m-price]'), btn = q('[data-m-btn]');
    kind.textContent = m.kind;
    kind.hidden = !m.kind;
    if (title.textContent !== m.title) title.textContent = m.title;
    var img = cover.querySelector('img');
    if (m.img) { if (img.getAttribute('src') !== m.img) img.setAttribute('src', m.img); cover.hidden = false; }
    else { cover.hidden = true; img.removeAttribute('src'); }
    if (text._src !== m.text) { cms.blocks(text, m.text, { li: 'strip', h: true }); text._src = m.text; }
    price.textContent = m.price;
    pbox.hidden = !m.price;
    /* кнопка: своя надпись и ссылка материала, иначе «Записаться» и Telegram из раздела «Контакты» */
    if (btn._t0 === undefined) { btn._t0 = btn.textContent; btn._h0 = btn.getAttribute('href'); }
    btn.textContent = m.btn || btn._t0;
    btn.setAttribute('href', m.url || (cms.vars && cms.vars.tgurl) || btn._h0);
    doc.title = m.title + '. RASA Education: Дарья Агеенко';
    none.hidden = true;
    box.hidden = false;
  }

  var show = list && empty ? showList : (box && none ? showOne : null);
  if (!show) return;
  show();
  doc.addEventListener('cms:site', show);
  doc.addEventListener('cms:ready', show);
})();
