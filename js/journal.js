/* Journal: рубрики и карточки статей. Статьи приходят из редактора сайта (admin/, раздел «Journal»; их отдаёт
   js/cms-site.js) и открываются на article.html?id=…; пока в редакторе статей нет, берётся js/journal-data.js
   (массив ARTICLES). Без библиотек. */
(function () {
  'use strict';
  var doc = document;
  var RUBRICS = {
    all: 'Все',
    doshi: 'Ayurveda: доши',
    interview: 'Wellness-интервью',
    trends: 'Тренды',
    author: 'Авторские статьи',
    recipes: 'Рецепты',
    adaptation: 'Современная адаптация'
  };
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  var tabs = doc.querySelectorAll('.jr-tab');
  var body = doc.getElementById('jr-body');
  if (!tabs.length || !body) return;
  var el = {
    dosha: body.querySelector('[data-dosha]'),
    title: body.querySelector('[data-rub-title]'),
    list: body.querySelector('[data-list]'),
    empty: body.querySelector('[data-empty]')
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }
  /* адрес статьи: только страницы сайта и https-ссылки */
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^https:\/\//i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf('//') === 0) return '';
    return u;
  }
  function dateText(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
    if (!m || +m[2] < 1 || +m[2] > 12) return '';
    return (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1];
  }

  var cms = window.DASHA_CMS || null;
  var articles = [], current = 'all';
  function load() {
    var fromCms = cms && cms.articles ? cms.articles() : [];
    if (fromCms.length) {
      /* статьи из редактора: карточка ведёт на страницу статьи, если у статьи есть текст */
      articles = fromCms.map(function (a) {
        return { rubric: a.rubric, title: a.title, excerpt: a.excerpt, date: a.date, cmsImg: a.img, url: a.text ? 'article.html?id=' + encodeURIComponent(a.id) : '' };
      });
      return;
    }
    var source = (typeof window.ARTICLES !== 'undefined' && Array.isArray(window.ARTICLES)) ? window.ARTICLES : [];
    articles = source.filter(function (a) {
      return a && a.title && RUBRICS[a.rubric] && a.rubric !== 'all';
    }).slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }
  load();

  function card(a) {
    var url = safeUrl(a.url), img = a.cmsImg || safeUrl(a.img), ext = /^https:/i.test(url);
    var label = RUBRICS[a.rubric] + (a.rubric === 'doshi' && a.dosha ? ' · ' + a.dosha : '');
    var inner =
      (img ? '<img class="jcard__img" src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '') +
      '<p class="jcard__r">' + esc(label) + '</p>' +
      '<h3 class="jcard__h">' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p class="jcard__t">' + esc(a.excerpt) + '</p>' : '') +
      (dateText(a.date) ? '<p class="jcard__d">' + dateText(a.date) + '</p>' : '');
    if (url) return '<a class="jcard" href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>';
    return '<article class="jcard">' + inner + '</article>';
  }

  function select(id, push) {
    if (!RUBRICS[id]) id = 'all';
    current = id;
    Array.prototype.forEach.call(tabs, function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-rubric') === id ? 'true' : 'false');
    });
    var items = articles.filter(function (a) { return id === 'all' || a.rubric === id; });
    el.dosha.hidden = !(id === 'all' || id === 'doshi');
    /* заголовок рубрики: у дош он уже есть в блоке про доши */
    if (id === 'all' || id === 'doshi') {
      el.title.hidden = true;
    } else {
      el.title.textContent = RUBRICS[id];
      el.title.hidden = false;
    }
    if (items.length) {
      el.list.innerHTML = items.map(card).join('');
      el.list.hidden = false;
      el.empty.hidden = true;
    } else {
      el.list.innerHTML = '';
      el.list.hidden = true;
      /* пока редактор не ответил, строка «статьи готовлю» не показывается: статьи могут прийти через мгновение */
      el.empty.hidden = !!(cms && cms.pending);
    }
    if (push) {
      try { history.replaceState(null, '', id === 'all' ? window.location.pathname + window.location.search : '#' + id); } catch (e) { /* без адреса тоже работает */ }
    }
  }

  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () { select(t.getAttribute('data-rubric'), true); });
  });
  /* стрелки влево и вправо переключают рубрики */
  doc.querySelector('.jr-tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = Array.prototype.slice.call(tabs), i = list.indexOf(doc.activeElement);
    if (i < 0) return;
    var n = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    n.focus();
    select(n.getAttribute('data-rubric'), true);
    e.preventDefault();
  });
  window.addEventListener('hashchange', function () { select(window.location.hash.replace('#', ''), false); });
  select(window.location.hash.replace('#', '') || 'all', false);
  /* содержимое из редактора пришло (или редактор не ответил): список рисуется заново */
  function again() { load(); select(current, false); }
  doc.addEventListener('cms:site', again);
  doc.addEventListener('cms:ready', again);
})();
