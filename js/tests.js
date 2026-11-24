/* Дарья Агеенко: тест на дошу (test.html), мини-тест RASA CHECK-IN (rasa-check-in.html и блок
   #check-in на rasa-reset.html). Без библиотек.

   ГДЕ ЧТО МЕНЯТЬ
   - вопросы теста на дошу:      DOSHA_QUESTIONS
   - таблицы питания по дошам:   TABLES
   - 9 результатов теста:        RESULTS  (поле text: абзацы рекомендаций Дарьи)
   - вопросы и итоги мини-теста: CHECKIN_QUESTIONS, CHECKIN_RESULTS
   Отзывы RASA RESET лежат прямо в rasa-reset.html (раздел #otzyvy).

   ИЗ РЕДАКТОРА САЙТА (admin/, читает js/cms-site.js) приходят: 9 текстов «Рекомендации по результатам»
   (если поле пустое, остаётся RESULTS[..].text), описания трёх дош (те же, что на главной) и адрес Telegram. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var TG = 'https://t.me/OhhDarya';
  var STORE_KEY = 'dasha_dosha';

  /* содержимое из редактора сайта; пока его нет, работают тексты из этого файла */
  function cms() { return window.DASHA_CMS || null; }
  function tgUrl() { var c = cms(); return (c && c.vars && c.vars.tgurl) || TG; }
  var DOSHA_KEY = { A: 'vata', B: 'pitta', C: 'kapha' };
  function aboutText(letter) {
    var c = cms(), v = c && c.flat ? c.flat('dosha.' + DOSHA_KEY[letter] + '.card') : '';
    return v || DOSHAS[letter].about;
  }
  /* абзацы рекомендаций для результата: [[строка, строка], …] */
  function recParas(key) {
    var c = cms(), p = c && c.paras ? c.paras('test.rec.' + key) : [];
    return p.length ? p : RESULTS[key].text.map(function (t) { return [t]; });
  }
  /* блок перерисовывается, только если его содержимое изменилось */
  function setHtml(el, html) { if (el && el._html !== html) { el.innerHTML = html; el._html = html; } }

  /* ================= ТЕСТ НА ДОШУ ================= */

  /* Буквы ответов: A = Vata, B = Pitta, C = Kapha */
  var DOSHAS = {
    A: { name: 'Vata Dosha', short: 'Vata', img: 'img/n_vata.svg', w: 265, h: 62,
         about: 'Если вы часто чувствуете тревогу, усталость, сухость, нехватку опоры' },
    B: { name: 'Pitta Dosha', short: 'Pitta', img: 'img/n_pitta.svg', w: 274, h: 59,
         about: 'Если вам свойственны напряжение, высокая чувствительность, стремление всё контролировать' },
    C: { name: 'Kapha Dosha', short: 'Kapha', img: 'img/n_kapha.svg', w: 316, h: 63,
         about: 'Если вы сталкиваетесь с тяжестью, замедлением, ощущением, что энергии стало меньше' }
  };

  /* 11 вопросов со слайдов Дарьи. Порядок: от общего к частному, сверху вниз. */
  var DOSHA_QUESTIONS = [
    { q: 'Рост и телосложение', a: {
      A: 'Низкий или очень высокий рост, худощавое',
      B: 'Средний рост и телосложение',
      C: 'Невысокий рост и склонность к полноте и отёкам' } },
    { q: 'Цвет лица, кожа', a: {
      A: 'Тёмная, тонкая',
      B: 'Румяная',
      C: 'Бледная, влажная, прохладная' } },
    { q: 'Волосы', a: {
      A: 'Редкие, жёсткие, сухие',
      B: 'Тонкие, мягкие, облысение',
      C: 'Толстые, густые, их много' } },
    { q: 'Брови и ресницы', a: {
      A: 'Маленькие, редкие, сухие',
      B: 'Умеренные, тонкие',
      C: 'Большие, густые и плотные' } },
    { q: 'Лоб, глаза', a: {
      A: 'Маленький лоб и тёмные маленькие глаза, подвижные',
      B: 'Морщинистый лоб, средние зелёные пронизывающие глаза',
      C: 'Большие лоб и глаза, светлые, влажные' } },
    { q: 'Нос и губы', a: {
      A: 'Тонкий/е, сухой/ие',
      B: 'Средние',
      C: 'Толстый/е, крупный/ые' } },
    { q: 'Зубы', a: {
      A: 'Редкие, западают',
      B: 'Кровоточат дёсны, средние',
      C: 'Крупные, плотно посажены' } },
    { q: 'Плечи, руки', a: {
      A: 'Узкие, тонкие',
      B: 'Средние',
      C: 'Широкие, крупные' } },
    { q: 'Грудь', a: {
      A: 'Небольшая',
      B: 'Средняя',
      C: 'Широкая, большая' } },
    { q: 'Икры ног, ступни', a: {
      A: 'Маленькие, твёрдые, сухие ступни, дрожь',
      B: 'Средние, мягкие, вялые',
      C: 'Большие, округлые, крепкие' } },
    { q: 'Суставы и ногти', a: {
      A: 'Маленькие, тонкие, сухие и хрустят',
      B: 'Средние, мягкие',
      C: 'Большие, крепкие, толстые' } }
  ];

  /* Таблицы питания Дарьи: три основные (A, B, C).
     B_MENU: её второй лист «Меню для Питта доша»; на сайте не показан, ждёт ответа Дарьи. */
  var ROWS = ['Овощи', 'Фрукты', 'Специи и травы', 'Крупы и бобовые', 'Орехи', 'Нерастительные продукты'];
  var TABLES = {
    A: {
      title: 'Вата доша',
      principle: 'Основной принцип: употреблять тёплую пищу со сладким, солёным и кислым вкусом. Избегайте горького. Пейте травяные чаи, ягодные и тёплую воду.',
      rows: [
        'Корнеплоды, тыква, лук-порей, цукини, сладкий редис, баклажан, зелёный горошек, шпинат, водоросли, кейл, огурец, немного грибов и кукурузы',
        'Бананы, манго, папайя, ананас, дыня, цитрусовые, абрикосы, сливы, сладкая хурма, виноград, авокадо, финики, инжир, ягоды',
        'Почти все, особенно в сезон ваты, но не увлекайтесь, может привести к иссушению тканей',
        'Коричневый рис, амарант, киноа, пшеница, овёс, красная чечевица, маш, ячмень',
        'Миндаль и кокос. Немного кешью, кунжут, семена тыквы, фисташки, пекан, кедровые',
        'Сметана, йогурт, кефир, яйца, масло гхи, рыба и морепродукты, птица, мягкий сыр и творог'
      ],
      after: 'Согревайтесь, носите тёплые вещи из натуральных тканей, принимайте ванну, промасливайте тело и особенно стопы по вечерам, не пропускайте приёмы пищи, выделяйте время на медитацию и шавасану, радуйте себя ароматами в доме и на теле, обнимайтесь.'
    },
    B: {
      title: 'Питта доша',
      principle: 'Основной принцип: меньше употреблять согревающих специй, кислых и ферментированных продуктов, кисломолочных, яйца. В йоге использовать больше скруток, засыпать без гаджетов, читать бумажные книги.',
      rows: [
        'Увеличить долю сырых овощей, крестоцветные, сладкий перец, сельдерей, спаржа, артишоки, листовые',
        'Яблоки, нектарины, персики, инжир, виноград, ягоды, авокадо, сухофрукты, клюква',
        'Фенхель, барбарис, куркума, кардамон, орегано, ромашка, мята, зира, укроп',
        'Рис басмати, гречка, маш, колотый горох, соя, фасоль',
        'Семена тыквы, подсолнечника, кедровые, кокос',
        'Гхи, мягкие несолёные сыры и творог, молоко, индейка, форель, курица, яичный белок'
      ],
      after: 'Ешьте регулярно, чаще бывайте на свежем воздухе, защищайте кожу, практикуйте приветствия солнцу и луне в йоге, пранаямы.'
    },
    C: {
      title: 'Капха доша',
      principle: 'Основной принцип: делайте побольше согревающих ритуалов, массаж сухой щёткой, согревающие еда и напитки, увеличьте физическую нагрузку, ограничьте животную пищу. Овощи подвергайте тепловой обработке, запекайте, тушите.',
      rows: [
        'Артишоки, спаржа, бобовые, сельдерей, морковь, капусты, крестоцветные, горчица, лук, чеснок, листовые, острый перец, репа, редис, кукуруза',
        'Сухофрукты, яблоки, ягоды, цитрусовые, папайя',
        'Базилик, лавровый лист, куркума, перцы, хрен, чеснок, кардамон, тмин, розмарин, тимьян, имбирь свежий и сухой, укроп, фенхель',
        'Рис, амарант, ячмень, маш, чечевица, колотый горох',
        'Тыква, кунжут, миндаль, макадамия, грецкий, пекан, фундук',
        'Гхи, мягкий козий сыр, речная рыба, креветки, курица, индейка'
      ],
      after: 'Чаще готовьте дома, используйте каждый раз специи, пробуйте новые рецепты супов. Пейте травяные имбирные чаи. Раньше ложитесь спать. Больше тренировок, утром и вечером. Ходите на интенсивные массажи, посещайте сауну и баню.'
    },
    B_MENU: {
      title: 'Меню для Питта доша',
      principle: 'Основной принцип: избегайте однообразного питания и следуйте принципу «радуга на тарелке», избегайте пищи с яркими кислыми и острыми вкусами. Будьте осторожны со специями и ограничьте томаты.',
      rows: [
        'Артишоки, спаржа, бобовые, морковь, капусты, крестоцветные, паслёновые, листовые, сладкий перец, репа, кукуруза, огурцы, стручковая фасоль, салаты, латук, кабачок и цукини',
        'Сливы, груши, ягоды тёмные, цитрусовые, виноград, папайя, черешня, дыня, арбуз, абрикосы, айва, клубника, бананы, авокадо',
        'Базилик, лавровый лист, куркума, сухой имбирь, кардамон, тмин, розмарин, тимьян, барбарис, укроп, фенхель',
        'Рис бурый и длиннозёрный, амарант, ячмень, маш, чечевица, гречка, полба, пшеница, овсянка',
        'Тыква, кунжут, миндаль, грецкий, пекан, фундук, семечки подсолнечника, арахис, фисташки, кедровые орехи',
        'Гхи, мягкий домашний некислый сыр, рыба несолёная, курица без кожи, индейка, тунец, яичные белки'
      ],
      after: 'Исключите ферментированные продукты, рассолы и маринады, копчёности и яичные желтки. А также томаты и яркие разогревающие специи, такие как перец чили, лук, чеснок. Не употребляйте много кислого вкуса, кисломолочных продуктов и соков, особенно во второй половине дня и на ночь.'
    }
  };

  /* 9 результатов. lead = ведущая доша, second = вторая (в комбинациях).
     text: сюда вставить абзацы рекомендаций Дарьи для этого результата (массив строк),
     tables: какие таблицы питания показать (ключи TABLES), первая раскрыта. */
  var RESULTS = {
    A:  { lead: 'A', second: null, text: [], tables: ['A'] },
    B:  { lead: 'B', second: null, text: [], tables: ['B'] },
    C:  { lead: 'C', second: null, text: [], tables: ['C'] },
    AB: { lead: 'A', second: 'B',  text: [], tables: ['A', 'B'] },
    BA: { lead: 'B', second: 'A',  text: [], tables: ['B', 'A'] },
    AC: { lead: 'A', second: 'C',  text: [], tables: ['A', 'C'] },
    CA: { lead: 'C', second: 'A',  text: [], tables: ['C', 'A'] },
    BC: { lead: 'B', second: 'C',  text: [], tables: ['B', 'C'] },
    CB: { lead: 'C', second: 'B',  text: [], tables: ['C', 'B'] }
  };

  /* Правило подсчёта. Ведущая доша = буква с наибольшим числом ответов.
     Если вторая буква отстаёт не больше чем на COMBO_GAP ответа, результат = комбинация
     (ведущая + вторая), иначе чистая доша. При равном счёте первой идёт буква из ответа
     на вопрос «Рост и телосложение», затем по порядку A, B, C. */
  var COMBO_GAP = 2;
  function doshaResult(ans) {
    var c = { A: 0, B: 0, C: 0 };
    ans.forEach(function (k) { if (c[k] !== undefined) c[k]++; });
    var first = ans[0];
    var order = ['A', 'B', 'C'].sort(function (x, y) {
      if (c[x] !== c[y]) return c[y] - c[x];
      if (x === first) return -1;
      if (y === first) return 1;
      return x < y ? -1 : 1;
    });
    var lead = order[0], second = order[1];
    return { key: (c[lead] - c[second] <= COMBO_GAP) ? lead + second : lead, counts: c };
  }

  /* ================= RASA CHECK-IN ================= */

  var CHECKIN_QUESTIONS = [
    { q: 'Как вы чувствуете себя утром?', a: {
      A: 'Просыпаюсь уставшей, трудно войти в день.',
      B: 'Просыпаюсь уже с ощущением напряжения или внутренней спешки.',
      C: 'Просыпаюсь тяжело, хочется ещё полежать и медленно включиться.',
      D: 'Просыпаюсь по-разному: иногда легко, иногда совершенно без ресурса.' } },
    { q: 'Что сейчас происходит с вашей энергией?', a: {
      A: 'Энергия нестабильная: то много сил, то резко наступает усталость.',
      B: 'Энергии достаточно, но я быстро «перегораю».',
      C: 'Энергия скорее низкая, чувствую тяжесть и замедление.',
      D: 'Главная проблема — не количество энергии, а отсутствие ощущения внутреннего ресурса.' } },
    { q: 'Как вы чувствуете своё тело?', a: {
      A: 'Сухость, напряжение, хочется тепла и прикосновения.',
      B: 'Ощущаю жар, напряжение, иногда чувствительность или раздражение.',
      C: 'Тяжесть, отёчность, скованность, хочется движения.',
      D: 'Мне сложно вообще понять, что сейчас происходит с телом.' } },
    { q: 'Как вы реагируете на стресс?', a: {
      A: 'Начинаю много думать, тревожиться, сложно остановить поток мыслей.',
      B: 'Становлюсь раздражительной, нетерпеливой, хочется всё контролировать.',
      C: 'Закрываюсь, замедляюсь, хочется спрятаться от всего.',
      D: 'Просто продолжаю делать дела, пока тело само не начинает требовать остановки.' } },
    { q: 'Как сейчас выглядит ваше питание?', a: {
      A: 'Ем нерегулярно, могу забыть поесть, потом сильно проголодаться.',
      B: 'Аппетит хороший, но часто хочется ярких вкусов, сладкого или кофе.',
      C: 'Ем больше из привычки или за компанию, чем из настоящего голода.',
      D: 'Питание хаотичное, и я не очень понимаю, что сейчас действительно подходит моему телу.' } },
    { q: 'Что происходит с кожей?', a: {
      A: 'Сухость, чувствительность, ощущение недостатка увлажнения.',
      B: 'Покраснение, реактивность, воспаления, повышенная чувствительность.',
      C: 'Отёчность, тяжесть, тусклость, ощущение замедления.',
      D: 'Кожа просто выглядит уставшей и отражает моё общее состояние.' } },
    { q: 'Чего вам хочется больше всего прямо сейчас?', a: {
      A: 'Тепла, тишины, сна, замедления.',
      B: 'Охладиться, расслабиться, перестать всё контролировать.',
      C: 'Лёгкости, движения, свежести, ощущения пространства.',
      D: 'Паузы. Я хочу наконец почувствовать, что со мной происходит.' } },
    { q: 'Что вы чаще всего делаете, когда чувствуете усталость?', a: {
      A: 'Продолжаю двигаться и надеюсь, что само пройдёт.',
      B: 'Стараюсь взять себя в руки и сделать ещё больше.',
      C: 'Откладываю дела и ухожу в пассивный отдых.',
      D: 'Не понимаю, что именно мне поможет, поэтому просто терплю.' } },
    { q: 'Если представить идеальный осенний день, что вам ближе?', a: {
      A: 'Плед, тёплый чай, спокойный дом, ранний вечер.',
      B: 'Тихое утро, красивый завтрак, прогулка, уход за собой.',
      C: 'Движение, сауна, массаж, активность и ощущение лёгкости.',
      D: 'День без расписания, телефона и необходимости быть продуктивной.' } }
  ];

  /* I если больше ответов A, II если B, III если C, IV если D.
     today: строка «Сегодня ваш RASA Ritual …»; Дарья пока написала её только для III. */
  var CHECKIN_RESULTS = {
    A: { num: 'I', name: 'SLOW DOWN',
         need: 'Вам нужно замедление.',
         text: 'Ваше состояние сейчас может быть связано с перегрузкой, нестабильным ритмом и недостатком восстановления.',
         steps: ['тепло', 'регулярность', 'сон', 'тишина', 'мягкое движение'],
         ritual: 'утро без телефона + тёплый завтрак + 10 минут спокойного движения + ранний вечер.',
         today: '' },
    B: { num: 'II', name: 'RELEASE',
         need: 'Вам нужно отпустить лишнее.',
         text: 'Сейчас особенно важны пространство, движение и снижение перегрузки.',
         steps: ['простота', 'движение', 'дыхание', 'лёгкая еда', 'паузы'],
         ritual: '10 минут движения + простая тёплая еда + прогулка + вечер без информационного шума.',
         today: '' },
    C: { num: 'III', name: 'RESTORE',
         need: 'Вам нужно восстановление.',
         text: 'Ваш организм может просить не новых стимулов, а поддержки и стабильности.',
         steps: ['питание', 'отдых', 'тепло', 'телесный контакт', 'сон'],
         ritual: 'тёплый ужин + самомассаж + дыхание + ранний сон.',
         today: 'Сегодня ваш RASA Ritual — 10 минут тёплого самомассажа, спокойный ужин и 30 минут без экрана перед сном.' },
    D: { num: 'IV', name: 'RECONNECT',
         need: 'Вам нужно снова услышать тело.',
         text: 'Вы можете быть настолько заняты мыслями и делами, что перестали замечать собственные сигналы.',
         steps: ['пауза', 'дыхание', 'прикосновение', 'движение', 'внимание к ощущениям'],
         ritual: '10 минут без телефона, медленное движение и практика embodiment.',
         today: '' }
  };

  /* Больше всего ответов одной буквы. При равенстве: буква из ответа на вопрос 07
     «Чего вам хочется больше всего прямо сейчас?», если она среди лидеров, иначе по порядку A, B, C, D. */
  var CHECKIN_TIE_Q = 6;
  function checkinResult(ans) {
    var c = { A: 0, B: 0, C: 0, D: 0 };
    ans.forEach(function (k) { if (c[k] !== undefined) c[k]++; });
    var max = Math.max(c.A, c.B, c.C, c.D);
    var top = ['A', 'B', 'C', 'D'].filter(function (k) { return c[k] === max; });
    var key = top.indexOf(ans[CHECKIN_TIE_Q]) !== -1 ? ans[CHECKIN_TIE_Q] : top[0];
    return { key: key, counts: c };
  }

  /* ================= ОТРИСОВКА ================= */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function doshaLabel(key) {
    var r = RESULTS[key];
    return DOSHAS[r.lead].name + (r.second ? ' × ' + DOSHAS[r.second].name : '');
  }

  function tableHtml(id, open) {
    var t = TABLES[id];
    var rows = t.rows.map(function (v, i) {
      return '<div class="rec__row"><dt>' + esc(ROWS[i]) + '</dt><dd>' + esc(v) + '</dd></div>';
    }).join('');
    var body = '<p class="rec__p">' + esc(t.principle) + '</p><dl class="rec__t">' + rows + '</dl>' +
               '<p class="rec__after">' + esc(t.after) + '</p>';
    var head = '<span class="rec__k">Рекомендации для</span> <span class="rec__h">' + esc(t.title) + '</span>';
    if (open) return '<article class="rec"><h3 class="rec__head">' + head + '</h3>' + body + '</article>';
    return '<details class="rec rec--more"><summary class="rec__head">' + head +
           '<span class="rec__tog" aria-hidden="true"></span></summary>' + body + '</details>';
  }

  function renderDosha(slots, key, counts) {
    var r = RESULTS[key];
    var lead = DOSHAS[r.lead], sec = r.second ? DOSHAS[r.second] : null;
    function nameImg(d, role) {
      return '<span class="res__name">' + (role ? '<span class="res__role">' + role + '</span>' : '') +
             '<img src="' + d.img + '" width="' + d.w + '" height="' + d.h + '" alt="' + esc(d.name) + '"></span>';
    }
    var h = '<p class="res__k">( ваш результат )</p>' +
            '<h2 class="res__names' + (sec ? ' res__names--two' : '') + '" tabindex="-1">' +
            nameImg(lead, sec ? 'ведущая' : '') +
            (sec ? '<span class="res__x" aria-hidden="true">×</span>' + nameImg(sec, 'вторая') : '') + '</h2>';
    h += '<div class="res__about">';
    [r.lead, r.second].forEach(function (k) {
      if (!k) return;
      h += '<p>' + (sec ? '<b>' + esc(DOSHAS[k].name) + '</b> ' : '') + esc(aboutText(k)) + '</p>';
    });
    h += '</div>';
    if (counts) {
      h += '<p class="res__count">Ваши ответы: Vata&nbsp;(A)&nbsp;— ' + counts.A + ' · Pitta&nbsp;(B)&nbsp;— ' + counts.B +
           ' · Kapha&nbsp;(C)&nbsp;— ' + counts.C + '</p>';
    }
    h += '<a class="pill pill--cta" href="' + esc(tgUrl()) + '" target="_blank" rel="noopener">Записаться на консультацию</a>';
    setHtml(slots.card, h);

    var rec = '', own = recParas(key);
    if (own.length) {
      rec += '<div class="rec__own">' + own.map(function (p) { return '<p>' + p.map(esc).join('<br>') + '</p>'; }).join('') + '</div>';
    }
    r.tables.forEach(function (id, i) { rec += tableHtml(id, i === 0); });
    setHtml(slots.rec, rec);
  }

  function renderCheckin(slots, key) {
    var r = CHECKIN_RESULTS[key];
    setHtml(slots.card,
      '<p class="cres__k">Your RASA State:</p>' +
      '<h2 class="cres__h" tabindex="-1"><span class="cres__num">' + r.num + '</span> ' +
      '<span class="cres__name">' + esc(r.name) + '</span></h2>');
    setHtml(slots.rec,
      '<p class="cres__need">' + esc(r.need) + '</p>' +
      '<p class="cres__t">' + esc(r.text) + '</p>' +
      '<h3 class="cres__sub">Ваш первый шаг:</h3>' +
      '<ol class="steps">' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<h3 class="cres__sub">Ваш RASA Ritual:</h3>' +
      '<p class="cres__rit">' + esc(r.ritual) + '</p>' +
      (r.today ? '<p class="cres__today">' + esc(r.today) + '</p>' : ''));
    if (slots.ask) slots.ask.textContent = r.name;
  }

  /* ================= ДВИЖОК ТЕСТА ================= */

  var TESTS = {
    dosha: {
      questions: DOSHA_QUESTIONS, letters: ['A', 'B', 'C'], result: doshaResult, valid: RESULTS,
      render: renderDosha,
      onDone: function (key) { try { window.localStorage.setItem(STORE_KEY, key); } catch (e) { /* без памяти тоже работает */ } }
    },
    checkin: {
      questions: CHECKIN_QUESTIONS, letters: ['A', 'B', 'C', 'D'], result: checkinResult, valid: CHECKIN_RESULTS,
      render: renderCheckin, onDone: function () {}
    }
  };

  function initQuiz(box) {
    var id = box.getAttribute('data-quiz');
    var cfg = TESTS[id];
    if (!cfg) return;
    var total = cfg.questions.length;
    var scr = {
      intro: box.querySelector('[data-screen="intro"]'),
      quiz: box.querySelector('[data-screen="quiz"]'),
      result: box.querySelector('[data-screen="result"]')
    };
    var el = {
      cur: box.querySelector('[data-cur]'), total: box.querySelector('[data-total]'),
      bar: box.querySelector('[data-bar]'), qh: box.querySelector('[data-qh]'),
      list: box.querySelector('[data-list]'), back: box.querySelector('[data-back]')
    };
    var slots = {
      card: box.querySelector('[data-slot="card"]'), rec: box.querySelector('[data-slot="rec"]'),
      ask: box.querySelector('[data-slot="ask"]')
    };
    var embed = box.hasAttribute('data-embed');
    var answers = [], idx = 0, lock = false, shown = null;
    if (el.total) el.total.textContent = pad(total);

    function show(name) {
      Object.keys(scr).forEach(function (k) { if (scr[k]) scr[k].hidden = (k !== name); });
      box.setAttribute('data-on', name);
      root.setAttribute('data-quiz-screen', name);
    }
    function boxTop() { return Math.max(0, box.getBoundingClientRect().top + window.pageYOffset - 12); }
    function toTop() {
      var y = boxTop();
      if (window.pageYOffset > y) window.scrollTo(0, y);
    }
    function toStart() { window.scrollTo(0, embed ? boxTop() : 0); }
    function focus(node) { if (node && node.focus) { try { node.focus({ preventScroll: true }); } catch (e) { node.focus(); } } }

    function drawQuestion() {
      var q = cfg.questions[idx];
      el.cur.textContent = pad(idx + 1);
      el.bar.style.width = ((idx + 1) / total * 100).toFixed(2) + '%';
      el.qh.textContent = q.q;
      el.list.innerHTML = cfg.letters.map(function (k) {
        return '<button class="ans' + (answers[idx] === k ? ' is-on' : '') + '" type="button" data-k="' + k + '"' +
               ' aria-pressed="' + (answers[idx] === k ? 'true' : 'false') + '">' +
               '<span class="ans__k" aria-hidden="true">' + k + '</span>' +
               '<span class="ans__t"><span class="vh">' + k + '. </span><span class="ans__m">' + esc(q.a[k]) + '</span></span></button>';
      }).join('');
      el.list.classList.remove('is-in');
      void el.list.offsetWidth;            /* перезапуск анимации появления */
      el.list.classList.add('is-in');
      lock = false;
    }

    function goQuestion(i, push) {
      idx = i;
      show('quiz');
      drawQuestion();
      if (push) history.pushState({ t: id, s: 'quiz', i: i }, '');
      toTop();
      focus(el.qh);
    }
    function goResult(key, counts, push) {
      shown = { key: key, counts: counts };
      cfg.render(slots, key, counts);
      show('result');
      if (push) history.pushState({ t: id, s: 'result', key: key, counts: counts || null }, '');
      toStart();
      focus(scr.result.querySelector('h2'));
    }
    function goIntro() {
      show('intro');
      drawSaved();
      toStart();
    }

    /* «Ваша доша: …» при повторном заходе */
    function drawSaved() {
      var note = box.querySelector('[data-saved]');
      if (!note || id !== 'dosha') return;
      var key = null;
      try { key = window.localStorage.getItem(STORE_KEY); } catch (e) { key = null; }
      if (key && RESULTS[key]) {
        note.querySelector('[data-saved-name]').textContent = doshaLabel(key);
        note.querySelector('[data-saved-open]').setAttribute('data-key', key);
        note.hidden = false;
      } else {
        note.hidden = true;
      }
    }

    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-start],[data-back],[data-restart],[data-saved-open],.ans');
      if (!t || !box.contains(t)) return;
      if (t.hasAttribute('data-start') || t.hasAttribute('data-restart')) {
        answers = [];
        goQuestion(0, true);
      } else if (t.hasAttribute('data-back')) {
        if (history.state && history.state.t === id) history.back();
        else goIntro();
      } else if (t.hasAttribute('data-saved-open')) {
        var k = t.getAttribute('data-key');
        if (k && cfg.valid[k]) goResult(k, null, true);
      } else if (t.classList.contains('ans')) {
        if (lock) return;
        lock = true;
        answers[idx] = t.getAttribute('data-k');
        Array.prototype.forEach.call(el.list.querySelectorAll('.ans'), function (b) {
          var on = b === t;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        setTimeout(function () {
          if (idx + 1 < total) { goQuestion(idx + 1, true); return; }
          var r = cfg.result(answers.slice(0, total));
          cfg.onDone(r.key);
          goResult(r.key, r.counts, true);
        }, 280);
      }
    });

    window.addEventListener('popstate', function (e) {
      var st = e.state;
      if (st && st.t === id && st.s === 'result' && cfg.valid[st.key]) { goResult(st.key, st.counts, false); return; }
      if (st && st.t === id && st.s === 'quiz' && st.i <= answers.length && st.i < total) { goQuestion(st.i, false); return; }
      goIntro();
    });

    /* первый показ: ссылка вида test.html?r=AB открывает готовый результат */
    var forced = null;
    try { forced = new URLSearchParams(window.location.search).get('r'); } catch (e) { forced = null; }
    var st0 = history.state;
    if (forced && cfg.valid[forced.toUpperCase()]) {
      goResult(forced.toUpperCase(), null, false);
    } else if (st0 && st0.t === id && st0.s === 'result' && cfg.valid[st0.key]) {
      goResult(st0.key, st0.counts, false);
    } else {
      if (st0) history.replaceState(null, '');
      show('intro');
      drawSaved();
    }
    box.classList.add('is-ready');
    /* тексты из редактора пришли, когда результат уже на экране: он дополняется ими */
    doc.addEventListener('cms:site', function () {
      if (shown && box.getAttribute('data-on') === 'result') cfg.render(slots, shown.key, shown.counts);
    });
  }

  Array.prototype.forEach.call(doc.querySelectorAll('[data-quiz]'), initQuiz);

  /* для проверки подсчёта из консоли и автотестов */
  window.DASHA_TESTS = {
    doshaResult: doshaResult, checkinResult: checkinResult,
    RESULTS: RESULTS, TABLES: TABLES, CHECKIN_RESULTS: CHECKIN_RESULTS,
    DOSHA_QUESTIONS: DOSHA_QUESTIONS, CHECKIN_QUESTIONS: CHECKIN_QUESTIONS
  };
})();
