/* Дарья Агеенко: страницы показывают то, что сохранено в редакторе (сайт/admin/).
   Простые тексты, телефон и фото-поля подставляет assets/js/cms.js (метки data-cms, data-cms-tel). Этот файл делает то,
   что зависит от вёрстки сайта: тексты со строками и абзацами, списки, ссылки, фото в коллажах, отзывы, консультации,
   статьи Journal. Подключается ПЕРЕД assets/js/cms.js. Пока редактор не знает сайт или сеть недоступна, страницы
   остаются как есть: всё, что совпадает с вёрсткой, не перерисовывается.

   Метки в HTML:
     data-c="ключ" data-c-as="…"   текст: ln (абзацы, строка = <span class="ln">), ln1 (один абзац, строка = <span>),
                                   blocks (абзацы и списки), items (строка = пункт списка), flat (одной строкой)
       data-c-mark="em|strong"     чем становится *слово между звёздочками*
       data-c-fit="Ш В Вм"         пределы блока в rem (ширина строки и высота на компьютере, высота на телефоне):
                                   текст длиннее уменьшается, чтобы остаться на своём месте
     data-c-fitw="parent|селектор" одна строка, которая стоит в рисунке (ник под словом TELEGRAM, цена в пятне):
                                   новая строка длиннее места уменьшается до ширины родителя или соседа
     data-c-href="tg|ig|join|box"  ссылка: Telegram, Instagram, кнопка «Вступить», кнопка набора
     data-c-text / data-c-aria     текст или aria-label с {tg} / {ig}
     data-c-ph="ключ"              фото: data-c-phas="mask" (поверх коллажа по маске), "sheet" (лист рваной бумаги),
                                   "cover" (то же место, обрезка по рамке)
     data-c-reviews, data-c-cons, data-c-gallery   списки: отзывы, консультации, фото набора
   Ничего из содержимого не вставляется как HTML: только текст. */
(function () {
  'use strict';
  var doc = document;
  var tag = doc.querySelector('script[data-cms-api][data-cms-site]');
  var API = tag ? (tag.getAttribute('data-cms-api') || '').replace(/\/+$/, '') : '';
  var SITE = tag ? (tag.getAttribute('data-cms-site') || '') : '';
  var desk = window.matchMedia('(min-width: 700px)');
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var kids = function (el, tagName) { return Array.prototype.filter.call(el.children, function (c) { return c.tagName === tagName; }); };
  var CMS = { data: null, vars: {}, pending: !!(API && SITE) };

  /* ---------------------------------------------------------------- текст */
  function squeeze(s) { return String(s).replace(/[ \t\r\n]+/g, ' ').trim(); }
  /* текст узла: перенос <br> = новая строка, выделение (em или strong) = *…* */
  function inline(node, mark) {
    var out = '';
    Array.prototype.forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) out += n.nodeValue.replace(/[ \t\r\n]+/g, ' ');
      else if (n.nodeType === 1) {
        if (n.tagName === 'BR') out += '\n';
        else if (mark && n.tagName === mark) out += '*' + inline(n, null) + '*';
        else out += inline(n, mark);
      }
    });
    return out;
  }
  function lines(s) { return String(s).split('\n').map(squeeze).filter(Boolean); }
  function paras(s) { return String(s).replace(/\r/g, '').split(/\n[ \t]*\n/).map(lines).filter(function (p) { return p.length; }); }
  function oneLine(node, mark) { return squeeze(inline(node, mark).replace(/\n/g, ' ')); }
  function put(el, s, mark) {
    var re = /\*([^*\n]+)\*/g, i = 0, m;
    if (mark && s.indexOf('*') >= 0) {
      while ((m = re.exec(s))) {
        if (m.index > i) el.appendChild(doc.createTextNode(s.slice(i, m.index)));
        var e = doc.createElement(mark.toLowerCase());
        e.textContent = m[1];
        el.appendChild(e);
        i = m.index + m[0].length;
      }
    }
    if (i < s.length) el.appendChild(doc.createTextNode(s.slice(i)));
  }
  var LIST_LINE = /^[—–\-•]\s*\S/;

  var MODES = {
    /* абзацы <p>, внутри строки <span class="ln"> (блокнот «обо мне»); остальные дети блока остаются */
    ln: {
      canon: function (v) { return paras(v).map(function (p) { return p.join('\n'); }).join('\n\n'); },
      read: function (el, o) {
        return kids(el, 'P').map(function (p) {
          var l = $$('.ln', p);
          return (l.length ? l : [p]).map(function (x) { return oneLine(x, o.mark); }).filter(Boolean).join('\n');
        }).filter(Boolean).join('\n\n');
      },
      write: function (el, v, o) {
        var ps = kids(el, 'P'), anchor = ps.length ? ps[ps.length - 1].nextSibling : null;
        ps.forEach(function (p) { el.removeChild(p); });
        paras(v).forEach(function (par) {
          var p = doc.createElement('p');
          par.forEach(function (ln, i) {
            if (i) p.appendChild(doc.createTextNode(' '));
            var s = doc.createElement('span');
            s.className = 'ln';
            put(s, ln, o.mark);
            p.appendChild(s);
          });
          el.insertBefore(p, anchor);
        });
      }
    },
    /* один абзац, строка = <span> (с классом из data-c-lncls) */
    ln1: {
      canon: function (v) { return lines(v).join('\n'); },
      read: function (el, o) {
        var l = kids(el, 'SPAN');
        return (l.length ? l : [el]).map(function (x) { return oneLine(x, o.mark); }).filter(Boolean).join('\n');
      },
      write: function (el, v, o) {
        el.textContent = '';
        lines(v).forEach(function (ln, i) {
          if (i) el.appendChild(doc.createTextNode(' '));
          var s = doc.createElement('span');
          if (o.lncls) s.className = o.lncls;
          put(s, ln, o.mark);
          el.appendChild(s);
        });
      }
    },
    /* абзацы, списки (строки с тире в начале) и подзаголовки (строка с # в начале, если data-c-h) */
    blocks: {
      canon: function (v) { return paras(v).map(function (p) { return p.join('\n'); }).join('\n\n'); },
      read: function (el, o) {
        return Array.prototype.map.call(el.children, function (c) {
          if (c.tagName === 'UL' || c.tagName === 'OL') return kids(c, 'LI').map(function (li) { return (o.li === 'strip' ? '— ' : '') + oneLine(li, o.mark); }).join('\n');
          if (/^H[2-4]$/.test(c.tagName)) return '# ' + oneLine(c, null);
          return lines(inline(c, o.mark)).join('\n');
        }).filter(Boolean).join('\n\n');
      },
      write: function (el, v, o) {
        el.textContent = '';
        paras(v).forEach(function (b) {
          var node;
          if (o.h && b.length === 1 && /^#+\s*\S/.test(b[0])) {
            node = doc.createElement('h2');
            node.textContent = b[0].replace(/^#+\s*/, '');
          } else if (b.every(function (l) { return LIST_LINE.test(l); })) {
            node = doc.createElement('ul');
            b.forEach(function (l) {
              var li = doc.createElement('li');
              put(li, o.li === 'strip' ? l.replace(/^[—–\-•]\s*/, '') : l, o.mark);
              node.appendChild(li);
            });
          } else {
            node = doc.createElement('p');
            if (o.pcls) node.className = o.pcls;
            b.forEach(function (l, i) { if (i) node.appendChild(doc.createElement('br')); put(node, l, o.mark); });
          }
          el.appendChild(node);
        });
      }
    },
    /* список: строка = пункт <li> (data-c-wrap="span": текст пункта в <span>) */
    items: {
      canon: function (v) { return lines(v).join('\n'); },
      read: function (el) { return kids(el, 'LI').map(function (li) { return oneLine(li, null); }).filter(Boolean).join('\n'); },
      write: function (el, v, o) {
        kids(el, 'LI').forEach(function (li) { el.removeChild(li); });
        lines(v).forEach(function (l) {
          var li = doc.createElement('li'), box = li;
          if (o.wrap) { box = doc.createElement(o.wrap); li.appendChild(box); }
          box.textContent = l;
          el.appendChild(li);
        });
      }
    },
    /* тот же текст одной строкой (описания дош в Journal) */
    flat: {
      canon: function (v) { return squeeze(v); },
      read: function (el) { return squeeze(el.textContent); },
      write: function (el, v) { el.textContent = squeeze(v); }
    }
  };
  function opts(el) {
    var m = el.getAttribute('data-c-mark');
    return { mark: m ? m.toUpperCase() : null, lncls: el.getAttribute('data-c-lncls') || '', li: el.getAttribute('data-c-li') || 'keep',
      pcls: el.getAttribute('data-c-pcls') || '', wrap: el.getAttribute('data-c-wrap') || '', h: el.hasAttribute('data-c-h') };
  }
  function applyText(el, d) {
    var mode = MODES[el.getAttribute('data-c-as')];
    if (!mode) return;
    var o = opts(el);
    if (el._c0 === undefined) el._c0 = mode.read(el, o);              /* текст из вёрстки */
    var v = d[el.getAttribute('data-c')];
    var want = typeof v === 'string' ? mode.canon(v) : '';
    if (!want) want = el._c0;                                          /* пустое поле: остаётся исходный текст */
    if (mode.read(el, o) !== want) mode.write(el, want, o);
    if (el.hasAttribute('data-c-fit')) fit(el, want !== el._c0);
  }

  /* текст длиннее исходного остаётся на своём месте: шрифт уменьшается, пока блок не войдёт в пределы */
  function fit(el, changed) {
    if (el._fit) { el.style.fontSize = ''; el.style.lineHeight = ''; el._fit = false; }
    if (!changed) return;
    var lim = (el.getAttribute('data-c-fit') || '').split(/\s+/).map(Number);
    var rem = parseFloat(getComputedStyle(doc.documentElement).fontSize) || 10;
    var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
    var maxW = desk.matches ? lim[0] * rem : 0, maxH = (desk.matches ? lim[1] : lim[2]) * rem;
    var k = 1, n = 0;
    function size() {
      var w = 0;
      $$('.ln', el).forEach(function (s) { w = Math.max(w, s.offsetWidth); });
      return { w: w, h: el.offsetHeight };
    }
    while (n++ < 6) {
      var s = size(), need = 1;
      if (maxW && s.w > maxW + 1) need = Math.min(need, maxW / s.w);
      if (maxH && s.h > maxH + 1) need = Math.min(need, desk.matches ? maxH / s.h : Math.sqrt(maxH / s.h));
      if (need >= 1) break;
      k = Math.max(0.55, k * need * 0.99);
      el._fit = true;
      el.style.fontSize = (fs * k / rem).toFixed(3) + 'rem';
      if (lh) el.style.lineHeight = (lh * k / rem).toFixed(3) + 'rem';
      if (k <= 0.55) break;
    }
  }

  /* строка в рисунке: длиннее исходной не выходит за своё место (ширина родителя или соседнего элемента) */
  function textWidth(el) {
    var r = doc.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect().width;
  }
  function fitWidth(el) {
    var now = squeeze(el.textContent);
    if (el._w0 === undefined) el._w0 = now;                              /* текст из вёрстки: он уже на месте */
    if (el._fitw) { el.style.fontSize = ''; el.style.whiteSpace = ''; el._fitw = false; }
    if (now === el._w0) return;
    el._fitw = true;
    el.style.whiteSpace = 'nowrap';                                      /* одна строка: не переносится, а уменьшается */
    var mode = el.getAttribute('data-c-fitw'), box = el.parentNode, have, need;
    if (mode === 'parent') {
      var pc = getComputedStyle(box), ec = getComputedStyle(el);
      have = box.clientWidth - parseFloat(pc.paddingLeft) - parseFloat(pc.paddingRight) - (parseFloat(ec.marginLeft) || 0) - (parseFloat(ec.marginRight) || 0);
      need = Math.max(el.scrollWidth, el.offsetWidth);
    } else {
      var ref = box.querySelector(mode);
      have = ref ? textWidth(ref) : 0;
      need = textWidth(el);
    }
    have *= parseFloat(el.getAttribute('data-c-fitk')) || 1;              /* часть ширины: пятно под ценой уже своей рамки */
    if (!have || need <= have + 1) return;
    var fs = parseFloat(getComputedStyle(el).fontSize), pfs = parseFloat(getComputedStyle(box).fontSize);
    el.style.fontSize = (fs * have / need / pfs).toFixed(4) + 'em';
  }
  function fitWidths() { $$('[data-c-fitw]').forEach(fitWidth); }
  $$('[data-c-fitw]').forEach(function (el) { el._w0 = squeeze(el.textContent); });   /* до того, как что-либо подставлено */

  /* ---------------------------------------------------------------- ссылки и имена */
  function httpsUrl(v) {
    v = typeof v === 'string' ? v.trim() : '';
    if (!/^https:\/\/[^\s"'<>\\]{3,300}$/.test(v)) return '';
    try { return new URL(v).href; } catch (e) { return ''; }
  }
  function nick(v, re) {
    var m = re.exec(typeof v === 'string' ? v.trim() : '');
    return m ? m[1] : '';
  }
  var TG_RE = /^(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?@?([A-Za-z][A-Za-z0-9_]{3,31})\/?$/;
  var IG_RE = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)?@?([A-Za-z0-9._]{1,30})\/?$/;
  function makeVars(d) {
    var o = {};
    var tg = nick(d['contact.tg'], TG_RE), ig = nick(d['contact.ig'], IG_RE);
    if (tg) { o.tg = tg; o.tgurl = 'https://t.me/' + tg; }
    if (ig) { o.ig = ig; o.igurl = 'https://www.instagram.com/' + ig + '/'; }
    var j = httpsUrl(d['reset.join.url']), b = httpsUrl(d['box.url']);
    if (j) o.joinurl = j;
    if (b) o.boxurl = b;
    return o;
  }
  function tpl(s, v) {
    var ok = true;
    var out = s.replace(/\{(\w+)\}/g, function (m, k) { if (!v[k]) ok = false; return v[k] || ''; });
    return ok ? out : null;
  }
  function applyVars(v) {
    $$('[data-c-href]').forEach(function (a) {
      if (a._h0 === undefined) a._h0 = a.getAttribute('href');
      var u = v[a.getAttribute('data-c-href') + 'url'] || a._h0;
      if (a.getAttribute('href') !== u) a.setAttribute('href', u);
    });
    $$('[data-c-text]').forEach(function (el) {
      if (el._t0 === undefined) el._t0 = el.textContent;
      var t = tpl(el.getAttribute('data-c-text'), v);
      if (t === null) t = el._t0;
      if (el.textContent !== t) el.textContent = t;
    });
    $$('[data-c-aria]').forEach(function (el) {
      if (el._a0 === undefined) el._a0 = el.getAttribute('aria-label');
      var t = tpl(el.getAttribute('data-c-aria'), v);
      if (t === null) t = el._a0;
      if (el.getAttribute('aria-label') !== t) el.setAttribute('aria-label', t);
    });
  }

  /* ---------------------------------------------------------------- фото */
  /* адрес загруженного в редакторе фото; исходные файлы сайта (assets/…) и пустое значение = фото из вёрстки */
  function upUrl(v) {
    return typeof v === 'string' && SITE && v.indexOf('/i/' + SITE + '/') === 0 && /^[A-Za-z0-9_-]{16,64}$/.test(v.slice(SITE.length + 4)) ? API + v : '';
  }
  function abs(rel) { try { return new URL(rel, doc.baseURI).href; } catch (e) { return rel; } }
  function clearPhoto(img) {
    var st = img._ph;
    if (!st) return;
    if (st.layer && st.layer.parentNode) st.layer.parentNode.removeChild(st.layer);
    if (st.wrap && st.wrap.parentNode) {
      img.className = st.cls;
      st.wrap.parentNode.replaceChild(img, st.wrap);
    }
    if (st.cover) {
      img.setAttribute('src', st.src);
      if (st.srcset) img.setAttribute('srcset', st.srcset);
      img.style.aspectRatio = ''; img.style.objectFit = ''; img.style.height = '';
    }
    if (st.alt !== null) img.setAttribute('alt', st.alt);
    img._ph = null;
  }
  function applyPhoto(img, d) {
    var url = upUrl(d[img.getAttribute('data-c-ph')]);
    if (img._ph && img._ph.url === url) return;
    clearPhoto(img);
    if (!url) return;
    var as = img.getAttribute('data-c-phas'), st = { url: url, alt: img.getAttribute('alt') };
    img.setAttribute('alt', '');                    /* описание относилось к фото из макета */
    var ph = doc.createElement('img');
    ph.alt = '';
    ph.decoding = 'async';
    ph.src = url;
    if (as === 'mask') {
      /* слой поверх картинки коллажа: фото видно только там, где было прежнее (маска), наклон и размер как у листа */
      var g = (img.getAttribute('data-c-geo') || '').split(/\s+/).map(Number);
      var layer = doc.createElement('span');
      layer.className = 'cph ' + (img.getAttribute('data-c-phcls') || '');
      layer.setAttribute('aria-hidden', 'true');
      var m = 'url("' + abs(img.getAttribute('data-c-mask')) + '")';
      layer.style.setProperty('-webkit-mask-image', m);
      layer.style.setProperty('mask-image', m);
      ph.style.cssText = 'left:' + g[0] + '%;top:' + g[1] + '%;width:' + g[2] + '%;height:' + g[3] + '%;transform:matrix(' + g.slice(4, 8).join(',') + ',0,0)';
      layer.appendChild(ph);
      var sel = img.getAttribute('data-c-host');
      (sel ? img.closest(sel) : img.parentNode).appendChild(layer);
      st.layer = layer;
    } else if (as === 'sheet') {
      /* лист рваной бумаги со скотчем на месте картинки из макета: центр, ширина, пропорция и наклон из data-c-box */
      var b = (img.getAttribute('data-c-box') || '').split(/\s+/).map(Number);
      var wrap = doc.createElement('span');
      st.cls = img.className;
      wrap.className = img.className + ' cph-sheet';
      img.parentNode.replaceChild(wrap, img);
      img.className = '';
      wrap.appendChild(img);
      var r = doc.createElement('span');
      r.className = 'cph-sheet__r';
      r.style.cssText = 'left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;aspect-ratio:1/' + b[3] + ';rotate:' + b[4] + 'deg';
      var p = doc.createElement('span');
      p.className = 'cph-sheet__p';
      p.appendChild(ph);
      var t = doc.createElement('span');
      t.className = 'cph-sheet__t';
      r.appendChild(p); r.appendChild(t);
      wrap.appendChild(r);
      st.wrap = wrap;
    } else {
      /* то же место и та же рамка: фото обрезается по размеру исходного */
      st.cover = true;
      st.src = img.getAttribute('src');
      st.srcset = img.getAttribute('srcset');
      var w = +img.getAttribute('width'), h = +img.getAttribute('height');
      img.removeAttribute('srcset');
      if (w && h) { img.style.aspectRatio = w + ' / ' + h; img.style.height = 'auto'; }
      img.style.objectFit = 'cover';
      img.setAttribute('src', url);
    }
    img._ph = st;
  }

  /* ---------------------------------------------------------------- отзывы */
  var NO_NAME = 'Участница RASA RESET';
  function readReviews(box) {
    return $$('.rev', box).map(function (f) {
      var n = f.querySelector('.rev__n'), t = f.querySelector('.rev__t');
      return { name: squeeze(n ? n.textContent : '').replace(/:$/, ''), text: t ? MODES.blocks.read(t, { li: 'keep' }) : '' };
    });
  }
  function cleanReviews(list) {
    return list.map(function (r) {
      return { name: squeeze(r && r.name || '').replace(/:$/, '') || NO_NAME, text: MODES.blocks.canon(r && typeof r.text === 'string' ? r.text : '') };
    }).filter(function (r) { return r.text; });
  }
  /* отзывы по порядку в три колонки так, чтобы самая длинная колонка была как можно короче */
  function columns(list, n) {
    var w = list.map(function (r) { return r.text.length + 130; });
    var best = null;
    (function go(i, cols, sums) {
      if (cols.length === n - 1 || i === list.length) {
        var all = cols.concat([list.slice(i)]), s = sums.concat([w.slice(i).reduce(function (a, b) { return a + b; }, 0)]);
        var max = Math.max.apply(null, s);
        if (!best || max < best.max) best = { max: max, cols: all };
        return;
      }
      for (var j = i + 1; j <= list.length; j++) {
        go(j, cols.concat([list.slice(i, j)]), sums.concat([w.slice(i, j).reduce(function (a, b) { return a + b; }, 0)]));
      }
    })(0, [], []);
    return best ? best.cols : [list];
  }
  function applyReviews(box, d) {
    var v = d[box.getAttribute('data-c-reviews')];
    var sec = box.closest('section');
    if (box._r0 === undefined) box._r0 = readReviews(box);
    var want = Array.isArray(v) ? cleanReviews(v) : box._r0;
    if (sec) sec.hidden = Array.isArray(v) && !want.length;                         /* все отзывы удалены: раздел скрыт */
    if (!want.length || JSON.stringify(readReviews(box)) === JSON.stringify(want)) return;
    box.textContent = '';
    columns(want, 3).forEach(function (col) {
      if (!col.length) return;
      var c = doc.createElement('div');
      c.className = 'rs-rev__col';
      col.forEach(function (r) {
        var f = doc.createElement('figure'), cap = doc.createElement('figcaption'), s = doc.createElement('span'), q = doc.createElement('blockquote');
        f.className = 'rev'; cap.className = 'rev__n'; q.className = 'rev__t';
        s.textContent = r.name + ':';
        cap.appendChild(s);
        MODES.blocks.write(q, r.text, { li: 'keep' });
        f.appendChild(cap); f.appendChild(q);
        c.appendChild(f);
      });
      box.appendChild(c);
    });
  }

  /* ---------------------------------------------------------------- консультации */
  function ownText(el) {
    return squeeze(Array.prototype.map.call(el.childNodes, function (n) { return n.nodeType === 3 ? n.nodeValue : ''; }).join(' '));
  }
  function readCons(box) {
    return $$('.cons', box).map(function (a) {
      var h = a.querySelector('.cons__h'), p = a.querySelector('.cons__price'), t = a.querySelector('.cons__t');
      var hs = h && h.querySelector('span'), ps = p && p.querySelector('span');
      return { name: h ? ownText(h) : '', name2: hs ? squeeze(hs.textContent) : '', price: p ? ownText(p) : '', note: ps ? squeeze(ps.textContent) : '',
        text: t ? oneLine(t, 'STRONG') : '' };
    });
  }
  function cleanCons(list) {
    var s = function (x) { return squeeze(typeof x === 'string' ? x : ''); };
    return list.map(function (c) { c = c || {}; return { name: s(c.name), name2: s(c.name2), price: s(c.price), note: s(c.note), text: s(c.text) }; })
      .filter(function (c) { return c.name || c.text; });
  }
  function applyCons(box, d) {
    var v = d[box.getAttribute('data-c-cons')];
    if (box._c0 === undefined) box._c0 = readCons(box);
    var want = Array.isArray(v) ? cleanCons(v) : [];
    if (!want.length) want = box._c0;
    if (JSON.stringify(readCons(box)) === JSON.stringify(want)) return;
    var old = $$('.cons', box), anchor = old.length ? old[old.length - 1].nextSibling : null;
    var btn = old.length ? old[0].querySelector('a.pill') : null;
    old.forEach(function (a) { box.removeChild(a); });
    want.forEach(function (c) {
      var a = doc.createElement('article'), h = doc.createElement('h3'), p = doc.createElement('p'), t = doc.createElement('p');
      a.className = 'cons'; h.className = 'cons__h'; p.className = 'cons__price'; t.className = 'cons__t';
      h.appendChild(doc.createTextNode(c.name + (c.name2 ? ' ' : '')));
      if (c.name2) { var s1 = doc.createElement('span'); s1.textContent = c.name2; h.appendChild(s1); }
      p.appendChild(doc.createTextNode(c.price + (c.note ? ' ' : '')));
      if (c.note) { var s2 = doc.createElement('span'); s2.textContent = c.note; p.appendChild(s2); }
      put(t, c.text, 'STRONG');
      a.appendChild(h);
      if (c.price || c.note) a.appendChild(p);
      if (c.text) a.appendChild(t);
      if (btn) { var b = btn.cloneNode(true); if (btn._h0 !== undefined) b._h0 = btn._h0; a.appendChild(b); }
      box.insertBefore(a, anchor);
    });
  }

  /* ---------------------------------------------------------------- фото набора: первое в конверте, остальные лентой */
  function applyGallery(sec, d) {
    var v = d[sec.getAttribute('data-c-gallery')];
    var urls = (Array.isArray(v) ? v : []).slice(1).map(function (it) { return upUrl(it && it.photo); }).filter(Boolean);
    var box = sec.querySelector('[data-c-gallery-list]') || sec;
    var now = $$('img', box).map(function (i) { return i.getAttribute('src'); });
    if (JSON.stringify(now) !== JSON.stringify(urls)) {
      box.textContent = '';
      urls.forEach(function (u) {
        var f = doc.createElement('figure'), im = doc.createElement('img');
        f.className = 'bx-gal__i';
        im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.src = u;
        f.appendChild(im);
        box.appendChild(f);
      });
    }
    sec.hidden = !urls.length;
  }
  /* фото с data-c-first="ключ списка": первое фото списка */
  function firstPhoto(img, d) {
    var v = d[img.getAttribute('data-c-first')];
    var one = {};
    one[img.getAttribute('data-c-ph')] = Array.isArray(v) && v[0] ? v[0].photo : '';
    applyPhoto(img, one);
  }

  /* ---------------------------------------------------------------- статьи Journal */
  var RUBRICS = { doshi: 1, interview: 1, trends: 1, author: 1, recipes: 1, adaptation: 1 };
  var TR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
  function slug(s) {
    return String(s).toLowerCase().replace(/[а-яё]/g, function (ch) { return TR[ch] !== undefined ? TR[ch] : ch; })
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  }
  /* дата из редактора: 01.12.2026 или 2026-12-01 */
  function isoDate(v) {
    v = squeeze(typeof v === 'string' ? v : '');
    var m = /^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/.exec(v), y, mo, da;
    if (m) { da = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v))) { y = +m[1]; mo = +m[2]; da = +m[3]; }
    else return '';
    if (mo < 1 || mo > 12 || da < 1 || da > 31) return '';
    return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (da < 10 ? '0' : '') + da;
  }
  function articles() {
    var list = CMS.data && CMS.data['journal.articles'];
    if (!Array.isArray(list)) return [];
    var seen = {};
    return list.map(function (a, i) {
      var title = squeeze(a && typeof a.title === 'string' ? a.title : '');
      if (!title) return null;
      var id = slug(title) || 'statya';
      seen[id] = (seen[id] || 0) + 1;
      if (seen[id] > 1) id += '-' + seen[id];
      return { id: id, n: i, title: title, rubric: RUBRICS[a.rubric] ? a.rubric : 'doshi', excerpt: squeeze(typeof a.excerpt === 'string' ? a.excerpt : ''),
        date: isoDate(a.date), img: upUrl(a.cover), text: MODES.blocks.canon(typeof a.text === 'string' ? a.text : '') };
    }).filter(Boolean).sort(function (x, y) {
      if (x.date !== y.date) return x.date < y.date ? 1 : -1;
      return x.n - y.n;
    });
  }

  /* ---------------------------------------------------------------- всё вместе */
  function apply(d) {
    if (!d || typeof d !== 'object') return;
    CMS.data = d;
    $$('[data-c]').forEach(function (el) { applyText(el, d); });
    $$('[data-c-reviews]').forEach(function (el) { applyReviews(el, d); });
    $$('[data-c-cons]').forEach(function (el) { applyCons(el, d); });
    $$('[data-c-ph]').forEach(function (el) { if (el.hasAttribute('data-c-first')) firstPhoto(el, d); else applyPhoto(el, d); });
    $$('[data-c-gallery]').forEach(function (el) { applyGallery(el, d); });
    CMS.vars = makeVars(d);
    applyVars(CMS.vars);
    fitWidths();
  }
  function settle() {
    if (!CMS.pending) return;
    CMS.pending = false;
    try { doc.dispatchEvent(new CustomEvent('cms:ready')); } catch (e) { /* старый браузер: страница остаётся как есть */ }
  }
  doc.addEventListener('cms:applied', function (e) {
    apply(e.detail && e.detail.data);
    try { doc.dispatchEvent(new CustomEvent('cms:site')); } catch (er) { /* см. выше */ }
    settle();
  });
  doc.addEventListener('cms:none', settle);
  if (CMS.pending) setTimeout(settle, 2500);
  /* размеры считаются заново, когда загрузились шрифты и когда вёрстка сменилась с телефонной на компьютерную */
  var refit = function () {
    if (!CMS.data) return;
    $$('[data-c][data-c-fit]').forEach(function (el) { fit(el, el._c0 !== undefined && MODES[el.getAttribute('data-c-as')].read(el, opts(el)) !== el._c0); });
    fitWidths();
  };
  if (desk.addEventListener) desk.addEventListener('change', refit); else if (desk.addListener) desk.addListener(refit);
  window.addEventListener('load', refit);
  if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', refit);

  /* что страница показывает сейчас, в виде значений редактора: из этого собирается стартовое содержимое (tools_admin/build_admin.py) */
  CMS.read = function () {
    var out = {};
    $$('[data-cms]').forEach(function (el) {
      var k = el.getAttribute('data-cms');
      if (!(k in out)) out[k] = el.querySelector('br') ? lines(inline(el, null)).join('\n') : el.textContent;
    });
    $$('[data-c]').forEach(function (el) {
      var k = el.getAttribute('data-c'), mode = MODES[el.getAttribute('data-c-as')];
      if (mode && !(k in out) && el.getAttribute('data-c-as') !== 'flat') out[k] = mode.read(el, opts(el));
    });
    $$('[data-c-reviews]').forEach(function (el) { out[el.getAttribute('data-c-reviews')] = readReviews(el); });
    $$('[data-c-cons]').forEach(function (el) { out[el.getAttribute('data-c-cons')] = readCons(el); });
    $$('[data-c-ph]').forEach(function (el) {
      var o = el.getAttribute('data-c-orig') || '';
      if (el.hasAttribute('data-c-first')) out[el.getAttribute('data-c-first')] = [{ photo: o }];
      else if (!(el.getAttribute('data-c-ph') in out)) out[el.getAttribute('data-c-ph')] = o;
    });
    var a = doc.querySelector('[data-c-href="tg"]'), i = doc.querySelector('[data-c-href="ig"]'), j = doc.querySelector('[data-c-href="join"]'), b = doc.querySelector('[data-c-href="box"]');
    if (a && nick(a.getAttribute('href'), TG_RE)) out['contact.tg'] = '@' + nick(a.getAttribute('href'), TG_RE);
    if (i && nick(i.getAttribute('href'), IG_RE)) out['contact.ig'] = '@' + nick(i.getAttribute('href'), IG_RE);
    if (j) out['reset.join.url'] = j.getAttribute('href');
    if (b) out['box.url'] = b.getAttribute('href');
    return out;
  };
  CMS.articles = articles;
  CMS.blocks = function (el, text, o) { MODES.blocks.write(el, MODES.blocks.canon(text), o || { li: 'strip', h: true }); };
  CMS.flat = function (key) { var v = CMS.data && CMS.data[key]; return typeof v === 'string' && squeeze(v) ? squeeze(v) : ''; };
  CMS.paras = function (key) { var v = CMS.data && CMS.data[key]; return typeof v === 'string' ? paras(v) : []; };
  window.DASHA_CMS = CMS;
})();
