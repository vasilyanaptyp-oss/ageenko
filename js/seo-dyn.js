/* Поиск для страниц, которые собираются из редактора: статья Journal (article.html?id=…) и материал RASA Education
   (material.html?id=…). Когда редактор ответил и запись есть: адрес для поиска (canonical), описание, разметка
   Article / BreadcrumbList. Если записи нет или адрес без id: noindex, чтобы пустая страница не попала в Google.
   Пока редактор не ответил (или сеть недоступна), ничего не меняется. Тексты и вёрстку не трогает. */
(function () {
  'use strict';
  var doc = document, BASE = 'https://ohhwellness.com/', NAME = 'Дарья Агеенко';
  var isArt = !!doc.querySelector('[data-article]'), isMat = !!doc.querySelector('[data-material]');
  if (!isArt && !isMat) return;
  var id = '';
  try { id = new URLSearchParams(window.location.search).get('id') || ''; } catch (e) { id = ''; }

  function headEl(sel, make) {
    var el = doc.head.querySelector(sel);
    if (!el && make) { el = make(); doc.head.appendChild(el); }
    return el;
  }
  function meta(attr, key, val) {
    var el = headEl('meta[' + attr + '="' + key + '"]', function () { var m = doc.createElement('meta'); m.setAttribute(attr, key); return m; });
    el.setAttribute('content', val);
  }
  function robots(v) {
    var el = headEl('meta[name="robots"]', null);
    if (!v) { if (el) el.parentNode.removeChild(el); return; }
    meta('name', 'robots', v);
  }
  function canonical(u) {
    var el = headEl('link[rel="canonical"]', function () { var l = doc.createElement('link'); l.rel = 'canonical'; return l; });
    el.href = u;
  }
  function ld(obj) {
    var el = headEl('script[data-seo-dyn]', function () { var s = doc.createElement('script'); s.type = 'application/ld+json'; s.setAttribute('data-seo-dyn', ''); return s; });
    var txt = JSON.stringify(obj);
    if (el.textContent !== txt) el.textContent = txt;
  }
  function plain(text, max) {
    var s = String(text || '').replace(/^#+\s*/gm, '').replace(/^[—–\-•]\s*/gm, '').replace(/\s+/g, ' ').trim();
    if (s.length <= max) return s;
    s = s.slice(0, max - 1);
    return s.slice(0, Math.max(s.lastIndexOf(' '), max - 30)) + '…';
  }

  function update() {
    var cms = window.DASHA_CMS;
    if (!id) { robots('noindex'); return; }
    if (!cms) return;
    var list = isArt ? (cms.articles ? cms.articles() : []) : (cms.materials ? cms.materials() : []);
    var it = list.filter(function (x) { return x.id === id; })[0];
    if (!it || !it.text) {
      if (!cms.pending && cms.data) robots('noindex');      /* редактор ответил, записи нет */
      return;
    }
    var page = isArt ? 'article.html' : 'material.html';
    var u = BASE + page + '?id=' + encodeURIComponent(id);
    var desc = plain(it.excerpt || it.text, 160);
    robots('index, follow, max-image-preview:large');
    canonical(u);
    if (desc) { meta('name', 'description', desc); meta('property', 'og:description', desc); }
    meta('property', 'og:title', it.title);
    meta('property', 'og:url', u);
    var cover = doc.querySelector(isArt ? '[data-a-cover] img' : '[data-m-cover] img');
    if (cover && it.img && !cover.getAttribute('alt')) cover.setAttribute('alt', it.title);

    var person = { '@type': 'Person', '@id': BASE + '#person', name: NAME, url: BASE };
    var parent = isArt ? { name: 'Journal', item: BASE + 'journal.html' } : { name: 'RASA Education', item: BASE + 'education.html' };
    var crumbs = {
      '@type': 'BreadcrumbList', '@id': u + '#breadcrumb', itemListElement: [
        { '@type': 'ListItem', position: 1, name: NAME, item: BASE },
        { '@type': 'ListItem', position: 2, name: parent.name, item: parent.item },
        { '@type': 'ListItem', position: 3, name: it.title, item: u }
      ]
    };
    var main;
    if (isArt) {
      main = { '@type': 'BlogPosting', '@id': u + '#article', headline: it.title.slice(0, 110), mainEntityOfPage: u, url: u,
        inLanguage: 'ru', author: person, publisher: { '@id': BASE + '#person' }, isPartOf: { '@id': BASE + '#website' } };
      if (desc) main.description = desc;
      if (it.img) main.image = [it.img];
      if (it.date) { main.datePublished = it.date; main.dateModified = it.date; }
    } else {
      main = { '@type': 'WebPage', '@id': u + '#webpage', name: it.title, url: u, inLanguage: 'ru',
        author: person, about: { '@id': BASE + '#person' }, isPartOf: { '@id': BASE + '#website' }, breadcrumb: { '@id': u + '#breadcrumb' } };
      if (desc) main.description = desc;
      if (it.img) main.primaryImageOfPage = { '@type': 'ImageObject', url: it.img };
    }
    ld({ '@context': 'https://schema.org', '@graph': [main, crumbs] });
  }
  update();
  doc.addEventListener('cms:site', update);
  doc.addEventListener('cms:ready', update);
})();
