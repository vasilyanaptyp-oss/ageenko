/* Journal: страница одной статьи (article.html?id=…). Статьи приходят из редактора сайта (admin/, раздел «Journal»)
   через js/cms-site.js. Текст статьи: пустая строка = новый абзац, строка с # в начале = подзаголовок,
   строки с тире в начале = список. Без библиотек. */
(function () {
  'use strict';
  var doc = document, cms = window.DASHA_CMS || null;
  var box = doc.querySelector('[data-article]'), none = doc.querySelector('[data-a-none]');
  if (!box || !none) return;
  var RUBRICS = {
    doshi: 'Ayurveda: доши',
    interview: 'Wellness-интервью',
    trends: 'Тренды',
    author: 'Авторские статьи',
    recipes: 'Рецепты',
    adaptation: 'Современная адаптация'
  };
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var el = {
    rubric: box.querySelector('[data-a-rubric]'), title: box.querySelector('[data-a-title]'), date: box.querySelector('[data-a-date]'),
    cover: box.querySelector('[data-a-cover]'), text: box.querySelector('[data-a-text]')
  };
  var id = '';
  try { id = new URLSearchParams(window.location.search).get('id') || ''; } catch (e) { id = ''; }

  function dateText(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || '');
    return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : '';
  }
  function show() {
    var list = cms && cms.articles ? cms.articles() : [];
    var a = list.filter(function (x) { return x.id === id; })[0];
    if (!a || !a.text) {
      box.hidden = true;
      none.hidden = !!(cms && cms.pending);            /* пока редактор не ответил, «статьи нет» не показывается */
      return;
    }
    el.rubric.textContent = RUBRICS[a.rubric] || '';
    if (el.title.textContent !== a.title) el.title.textContent = a.title;
    el.date.textContent = dateText(a.date);
    el.date.hidden = !el.date.textContent;
    var img = el.cover.querySelector('img');
    if (a.img) { if (img.getAttribute('src') !== a.img) img.setAttribute('src', a.img); el.cover.hidden = false; }
    else { el.cover.hidden = true; img.removeAttribute('src'); }
    if (el.text._src !== a.text) { cms.blocks(el.text, a.text, { li: 'strip', h: true }); el.text._src = a.text; }
    doc.title = a.title + '. Journal: Дарья Агеенко';
    none.hidden = true;
    box.hidden = false;
  }
  show();
  doc.addEventListener('cms:site', show);
  doc.addEventListener('cms:ready', show);
})();
