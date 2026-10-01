/* Maravela — demo web · JS puro */
(function () {
  'use strict';
  var RESERVA = 'https://reservation-widget.tagme.com.br/reservation/schedule/6a2973a2b06eb2653922dbac/reservationWidget';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- INTRO: porta em arco ---------- */
  var intro = $('#intro');
  function endIntro() {
    document.body.classList.remove('is-intro');
    document.body.classList.add('intro-done');
    intro.classList.add('gone');
  }
  function playIntro() {
    document.body.classList.remove('intro-done');
    document.body.classList.add('is-intro');
    intro.classList.remove('gone');
    var clone = intro.cloneNode(true);
    intro.parentNode.replaceChild(clone, intro);
    intro = clone;
    intro.addEventListener('click', endIntro);
    clearTimeout(playIntro.t);
    playIntro.t = setTimeout(endIntro, 3500);
  }
  if (reduce) { endIntro(); } else {
    intro.addEventListener('click', endIntro);
    playIntro.t = setTimeout(endIntro, 3500);
  }
  document.addEventListener('keydown', function (e) { if (document.body.classList.contains('is-intro') && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) endIntro(); });

  /* ---------- NAV + menu ---------- */
  var nav = $('#nav'), floatCta = $('#floatCta');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('solid', y > 40);
    floatCta.classList.toggle('show', y > window.innerHeight * 0.8 && y < document.body.scrollHeight - window.innerHeight * 1.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('open'); }); document.body.style.overflow = 'hidden'; }
    else { menu.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 600); }
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

  /* ---------- REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- DO MAR AO PRATO: receita passo a passo ---------- */
  var STEPS = [
    ['paso1', 'O peixe do dia chega', 'Tudo começa assim: o peixe fresco, inteiro, nas mãos de quem vai prepará-lo.'],
    ['paso3', 'Abrir com cuidado', 'Na tábua, o peixe é limpo e aberto sem pressa. Nada se perde.'],
    ['paso4', 'Filé a filé', 'A faca segue a espinha. Cada filé sai inteiro, pronto para ser fatiado.'],
    ['paso5', 'Lâminas finas', 'Fatia por fatia, o peixe cru vai desenhando o prato.'],
    ['paso6', 'Coalhada e picles de uva', 'A coalhada da casa faz a base; os picles de uva dão cor e acidez.'],
    ['paso7', 'Gotas de verde', 'Azeite em pontinhos, como quem pinta.'],
    ['paso8', 'O crocante de milho', 'Na pinça, a última camada: um crocante delicado de milho.'],
    ['paso9', 'À mesa, com focaccia', 'Pronto! Crudo de Peixe Branco, com focaccia ao lado. Agora é com você.']
  ];
  var recImgs = $('#recImgs'), recThumbs = $('#recThumbs'), recStep = document.querySelector('.rec-step');
  var recPlayBtn = $('#recPlay'), recPhoto = $('#recPhoto');
  var rImgs = STEPS.map(function (s, i) {
    var im = new Image(); im.alt = s[1]; im.decoding = 'async'; im.src = 'img/' + s[0] + '.webp';
    if (i === 0) im.className = 'on'; recImgs.appendChild(im); return im;
  });
  var rThumbs = STEPS.map(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rec-thumb'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Passo ' + (i + 1) + ': ' + s[1]);
    var im = new Image(); im.alt = ''; im.loading = 'lazy'; im.src = 'img/' + s[0] + '.webp'; b.appendChild(im); b.appendChild(document.createElement('i'));
    b.addEventListener('click', function () { stopAuto(); go(i); });
    recThumbs.appendChild(b); return b;
  });
  var cur = 0, playing = !reduce, recVisible = false, timer = 0;
  function go(i) {
    cur = (i + STEPS.length) % STEPS.length;
    rImgs.forEach(function (im, k) { im.classList.toggle('on', k === cur); });
    rThumbs.forEach(function (b, k) { b.setAttribute('aria-selected', k === cur); b.classList.remove('playing'); });
    if (playing) { void rThumbs[cur].offsetWidth; rThumbs[cur].classList.add('playing'); }
    $('#recNum').textContent = (cur < 9 ? '0' : '') + (cur + 1);
    $('#recTitle').textContent = STEPS[cur][1];
    $('#recDesc').textContent = STEPS[cur][2];
    $('#recCount').textContent = (cur + 1) + ' / ' + STEPS.length;
    recStep.classList.remove('swap'); void recStep.offsetWidth; recStep.classList.add('swap');
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (playing && recVisible) timer = setTimeout(function () { go(cur + 1); }, 4000);
  }
  function setPlaying(p) {
    playing = p;
    recPlayBtn.setAttribute('aria-pressed', p);
    recPlayBtn.textContent = p ? '❚❚ Pausar' : '▶ Ver sozinho';
    rThumbs.forEach(function (b, k) { b.classList.toggle('playing', p && k === cur); });
    schedule();
  }
  function stopAuto() { if (playing) setPlaying(false); }
  recPlayBtn.addEventListener('click', function () { setPlaying(!playing); });
  ['#recNext', '#recNext2'].forEach(function (id) { $(id).addEventListener('click', function () { stopAuto(); go(cur + 1); }); });
  ['#recPrev', '#recPrev2'].forEach(function (id) { $(id).addEventListener('click', function () { stopAuto(); go(cur - 1); }); });
  // deslizar a foto
  var sx = null;
  recPhoto.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  recPhoto.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { stopAuto(); go(cur + (dx < 0 ? 1 : -1)); }
  });
  recPhoto.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { stopAuto(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { stopAuto(); go(cur - 1); }
  });
  recPhoto.tabIndex = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { recVisible = es[0].isIntersecting; schedule(); if (recVisible && playing) rThumbs[cur].classList.add('playing'); }, { threshold: 0.35 }).observe(recPhoto);
  }
  go(0);

  // link do site do clube: ainda não publicado
  document.querySelectorAll('[data-club-site]').forEach(function (a) { a.addEventListener('click', function (e) { if (a.getAttribute('href') === '#') e.preventDefault(); }); });

  /* ---------- LUZ DE ABAJUR ---------- */
  // coordenadas em % da foto (horizontal no desktop, vertical no mobile)
  var DISHES = [
    ['Crudo de Peixe Branco', 'R$ 78', 'ENTRADA FRIA', 'Peixe do dia fresco com coalhada da casa, picles de uva e delicado crocante de milho. Acompanha focaccia.', [38.8, 46.1], [53.8, 38.8]],
    ['Ceviche de Peixe Branco', 'R$ 85', 'ENTRADA FRIA', 'Peixe marinado no leite de tigre de caju, chips de banana crocante, chilli oil e maionese de kimchi.', [75.4, 29.4], [70.5, 75.4]],
    ['Croqueta de Polvo', 'R$ 58', 'ENTRADA QUENTE', 'Croqueta cremosa de polvo com maionese de sriracha, finalizada com presunto de parma.', [77.1, 68.9], [31.0, 77.1]],
    ['Tartar de Atum', 'R$ 92', 'ENTRADA FRIA', 'Atum no molho ponzu, conserva de mostarda e ervas, maionese de sriracha, servido com batata frita e sururu de capote.', [12.5, 79.4], [20.5, 12.5]],
    ['Batata frita e sururu', 'com o tartar', 'ACOMPANHAMENTO', 'Acompanham o Tartar de Atum.', [37.9, 83.3], [16.7, 37.9]],
    ['Focaccia da casa', 'com o crudo', 'ACOMPANHAMENTO', 'Acompanha o Crudo de Peixe Branco.', [49.2, 12.2], [87.7, 49.2]],
    ['Brisa do Farol', 'R$ 36', 'DRINK AUTORAL', 'Purê de abacaxi, limão taiti, xarope de pimenta e de capim santo. Finalizado com limão siciliano e alecrim.', [87.5, 52.8], [47.2, 87.5]]
  ];
  var table = $('#table'), labels = $('#dishLabels');
  var isMob = function () { return window.matchMedia('(max-width: 820px)').matches; };
  var labelEls = DISHES.map(function (d) {
    var el = document.createElement('div'); el.className = 'dish-label';
    el.innerHTML = '<b></b><span></span>'; el.firstChild.textContent = d[0]; el.lastChild.textContent = d[1];
    labels.appendChild(el); return el;
  });
  function placeLabels() {
    var m = isMob();
    DISHES.forEach(function (d, i) { var p = m ? d[5] : d[4]; labelEls[i].style.left = p[0] + '%'; labelEls[i].style.top = p[1] + '%'; labelEls[i].classList.toggle('r', p[0] > 70); labelEls[i].classList.toggle('l', m && p[0] < 28); });
  }
  placeLabels();
  window.addEventListener('resize', placeLabels);

  var lx = 38.8, ly = 46.1, tx = lx, ty = ly, touched = false, lit = -2, tourI = 0, raf = 0;
  function renderLight() {
    lx += (tx - lx) * 0.18; ly += (ty - ly) * 0.18;
    table.style.setProperty('--x', lx.toFixed(2) + '%');
    table.style.setProperty('--y', ly.toFixed(2) + '%');
    var r = table.getBoundingClientRect(), m = isMob();
    var rad = m ? 70 : 170, best = -1, bd = 1e9;
    DISHES.forEach(function (d, i) {
      var p = m ? d[5] : d[4];
      var dx = (p[0] - lx) / 100 * r.width, dy = (p[1] - ly) / 100 * r.height, dd = Math.hypot(dx, dy);
      if (dd < bd) { bd = dd; best = i; }
    });
    var cur = bd < rad ? best : -1;
    if (cur !== lit) {
      lit = cur;
      labelEls.forEach(function (el, i) { el.classList.toggle('on', i === cur); });
      var D = cur >= 0 ? DISHES[cur] : null;
      $('#litCat').textContent = D ? D[2] + ' · ' + D[1] : 'A MESA';
      $('#litName').textContent = D ? D[0] : (m ? 'Toque num prato…' : 'Passe a luz sobre a mesa…');
      $('#litDesc').textContent = D ? D[3] : 'Crudo, ceviche, croquetas, tartar e um drink autoral esperam no escuro.';
    }
    if (Math.abs(tx - lx) > 0.05 || Math.abs(ty - ly) > 0.05) raf = requestAnimationFrame(renderLight); else raf = 0;
  }
  function aim(x, y) { tx = x; ty = y; if (!raf) raf = requestAnimationFrame(renderLight); }
  function lightFromEvent(e) {
    touched = true;
    var r = table.getBoundingClientRect();
    aim((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  }
  table.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') lightFromEvent(e); });
  table.addEventListener('pointerdown', lightFromEvent);
  // passeio automático da luz até a primeira interação
  var tour = [0, 1, 6, 2, 4, 3, 5];
  var tableVisible = false;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { tableVisible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(table);
  setInterval(function () {
    if (touched || reduce || !tableVisible) return;
    var d = DISHES[tour[tourI++ % tour.length]], p = isMob() ? d[5] : d[4];
    aim(p[0], p[1]);
  }, 2600);
  renderLight();

  /* ---------- CARDÁPIO ---------- */
  var MENU = [
    ['Entradas frias', [
      ['Crudo de Peixe Branco', 'Peixe do dia fresco com coalhada da casa, picles de uva e delicado crocante de milho. Acompanha focaccia.', 'R$ 78', true],
      ['Ceviche de Peixe Branco', 'Peixe marinado no leite de tigre de caju, chips de banana crocante, chilli oil e maionese de kimchi.', 'R$ 85'],
      ['Tartar de Atum', 'Atum no molho ponzu, conserva de mostarda e ervas, maionese de sriracha, servido com batata frita e sururu de capote.', 'R$ 92']]],
    ['Entradas quentes', [
      ['Katsu Sando', 'Sanduíche japonês de filé mignon empanado com alface temperado na maionese trufada, sunomono, cogumelo e rúcula.', 'R$ 68'],
      ['Croqueta de Polvo', 'Croqueta cremosa de polvo com maionese de sriracha, finalizada com presunto de parma.', 'R$ 58'],
      ['Mil Folhas de Língua Hygge', 'Língua bovina ao molho yakiniku, farofa crocante e vinagrete verde de feijão de corda.', 'R$ 72'],
      ['Gambas ao Vinho Branco', 'Camarões salteados em redução de vinho branco e ervas, com alho confitado e pães da casa.', 'R$ 82']]],
    ['Pratos principais', [
      ['Arroz Meloso', 'Arroz cremoso com peixe do dia, camarão e polvo, molho bisque, torresmo crocante e azeite de ervas. Serve 2 pessoas.', 'R$ 160'],
      ['Polvo Grelhado ao Molho Romesco', 'Acompanhado de batatas bravas crocantes e toque defumado de páprica.', 'R$ 118'],
      ['Peixe do Dia no Papilote', 'Com cama de legumes frescos, ervas aromáticas, azeite extra virgem e cocção delicada no próprio vapor.', 'R$ 98'],
      ['Espaguete de Camarão ao Molho Limone', 'Envolto em molho cítrico e cremoso de limão siciliano.', 'R$ 108'],
      ['Carré de Cordeiro com Musseline de Queijo', 'Demi-glace clássico, musseline de queijo, cogumelos salteados, crispy de couve e tomate confit.', 'R$ 122'],
      ['Nhoque de Raízes com Chorizo', 'Nhoque artesanal na manteiga noisette, creme de espinafre, bife de chorizo selado, chimichurri e molho espagnole.', 'R$ 112']]],
    ['Kids', [
      ['Pequeno Pirata', 'Cubinhos de filé, arroz branco e batatas fritas crocantes.', 'R$ 67'],
      ['Pequena Sereia', 'Peixe branco do dia grelhado, acompanhado de massa ao molho de tomate.', 'R$ 67']]],
    ['Sobremesas', [
      ['Surpresa de Morango', 'Brigadeiro branco com morango, castanha de caju e demerara, crumble de chocolate, coulis de morango, mousse de chocolate, azeite e flor de sal.', 'R$ 48'],
      ['Bolo Santiago da Compostela', 'Bolo de castanha com sorbet de limão, tuile de melado, raspas de limão e castanha picada.', 'R$ 52']]],
    ['Drinks autorais', [
      ['Caipi Maravela', 'Cachaça, tangerina, limão siciliano e limão taiti com xarope de açúcar. Finalizado com leque de frutas cítricas.', 'R$ 32'],
      ['Flor do Cais', 'Gin, maracujá, tangerina, vodka e manjericão. Finalizado com flor de manjericão e meia-lua de tangerina.', 'R$ 36'],
      ['Brisa do Farol', 'Purê de abacaxi, limão taiti, xarope de pimenta e de capim santo. Finalizado com limão siciliano e alecrim.', 'R$ 36'],
      ['Rosé do Atlântico', 'Espumante brut com coulis de frutas vermelhas e morango. Finalizado com lâminas de morango.', 'R$ 34'],
      ['Aperoni', 'Gin, Aperol e vermute rosso. Finalizado com twist de laranja Bahia.', 'R$ 36']]],
    ['Drinks clássicos', [
      ['Aperol Spritz', 'Aperol, espumante brut e água com gás. Finalizado com laranja Bahia.', 'R$ 36'],
      ['Negroni', 'Gin, Campari e vermute rosso. Finalizado com twist de laranja Bahia.', 'R$ 39'],
      ['Fitzgerald', 'Gin, bitter, xarope de açúcar e suco de limão. Twist de limão siciliano.', 'R$ 39'],
      ['Moscow Mule', 'Vodka, gengibre, suco de limão e água com gás. Espuma de gengibre.', 'R$ 36'],
      ['Mojito', 'Rum, suco de limão, xarope de açúcar, hortelã e água com gás.', 'R$ 32'],
      ['Caipirinha Caraçuípe', 'Cachaça alagoana — escolha entre ouro ou prata.', 'R$ 35']]]
  ];
  var tabs = $('#tabs'), items = $('#items');
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var tabEls = MENU.map(function (c, i) {
    var b = el('button', 'tab'); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab' + i;
    b.appendChild(el('i')); b.appendChild(document.createTextNode(c[0]));
    b.addEventListener('click', function () { showCat(i, true); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); showCat((i + 1) % MENU.length, true); tabEls[(i + 1) % MENU.length].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); var j = (i + MENU.length - 1) % MENU.length; showCat(j, true); tabEls[j].focus(); }
    });
    tabs.appendChild(b); return b;
  });
  function showCat(i, user) {
    tabEls.forEach(function (b, j) { b.setAttribute('aria-selected', i === j); b.tabIndex = i === j ? 0 : -1; });
    items.setAttribute('aria-labelledby', 'tab' + i);
    $('#catName').textContent = MENU[i][0];
    $('#catCount').textContent = MENU[i][1].length + ' OPÇÕES';
    items.innerHTML = '';
    MENU[i][1].forEach(function (it, k) {
      var d = el('div', 'item'); d.style.animationDelay = (k * 0.05) + 's';
      var top = el('div', 'item-top');
      top.appendChild(el('span', 'item-name', it[0])); top.appendChild(el('span', 'item-dots')); top.appendChild(el('span', 'item-price', it[2]));
      d.appendChild(top); d.appendChild(el('span', 'item-desc', it[1]));
      if (it[3]) { var a = el('a', 'item-chip', 'VEJA COMO É FEITO ↑'); a.href = '#prato'; d.appendChild(a); }
      items.appendChild(d);
    });
    if (user && isMob()) tabEls[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  showCat(0);

  /* ---------- HORÁRIOS (hora de Maceió, UTC-3) ---------- */
  // 0=dom … 6=sáb · [abre, fecha] em horas
  var HOURS = { 0: [[12, 16], [18, 23]], 1: [], 2: [[12, 16], [18, 23]], 3: [[12, 16], [18, 23]], 4: [[12, 16], [18, 23]], 5: [[12, 16], [18, 23]], 6: [[12, 16], [18, 23]] };
  var now = new Date(Date.now() - 3 * 3600 * 1000); // Maceió
  var wd = now.getUTCDay(), hh = now.getUTCHours() + now.getUTCMinutes() / 60;
  var openNow = HOURS[wd].some(function (h) { return hh >= h[0] && hh < h[1]; });
  var st = $('#openStatus'); st.textContent = openNow ? '● ABERTO AGORA' : 'FECHADO AGORA'; st.className = 'status ' + (openNow ? 'open' : 'closed');

  /* ---------- AGENDA ---------- */
  var DAYS = [
    [2, 'TER', 'Almoço & jantar', '12h–16h · 18h–23h'],
    [3, 'QUA', 'Almoço & jantar', '12h–16h · 18h–23h'],
    [4, 'QUI', 'Almoço & jantar', '12h–16h · 18h–23h'],
    [5, 'SEX', 'Show ao vivo', '[HORÁRIO]', 'img/show.webp', 'Show ao vivo no salão'],
    [6, 'SÁB', 'DJ no almoço', '[HORÁRIO]', 'img/dj.webp', 'DJ com discotecagem de vinil'],
    [0, 'DOM', 'Almoço & jantar', '12h–16h · 18h–23h'],
    [1, 'SEG', 'Descanso', 'Fechado']
  ];
  var daysEl = $('#days');
  // começa pelo dia de hoje
  var start = DAYS.findIndex(function (d) { return d[0] === wd; });
  DAYS.slice(start).concat(DAYS.slice(0, start)).forEach(function (d) {
    var today = d[0] === wd;
    var c = el('div', 'day reveal' + (d[4] ? ' photo' : '') + (today ? ' today' : '') + (d[0] === 1 ? ' closed' : ''));
    var inner = d[4] ? el('div') : c;
    if (d[4]) { var im = el('img'); im.src = d[4]; im.alt = d[5]; im.loading = 'lazy'; c.appendChild(im); c.appendChild(inner); }
    inner.appendChild(el('span', 'mono', (today ? 'HOJE · ' : '') + d[1]));
    inner.appendChild(el('b', null, d[2]));
    inner.appendChild(el('small', null, d[3]));
    daysEl.appendChild(c);
    if (window.IntersectionObserver && io) io.observe(c); else c.classList.add('in');
  });

  /* ---------- MARÉ (ilustrativo — na versão final: tábua da Marinha, Porto de Maceió) ---------- */
  var W = 1296, H = 200;
  var tide = function (t) { return 100 - 78 * Math.cos(2 * Math.PI * (t - 10.42) / 12.42); };
  var d = '';
  for (var t = 0; t <= 24.001; t += 0.25) d += (t === 0 ? 'M' : ' L') + (t / 24 * W).toFixed(1) + ' ' + tide(t).toFixed(1);
  $('#tidePath').setAttribute('d', d);
  $('#tideArea').setAttribute('d', d + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z');
  var nowT = 15.5;
  $('#tideNow').setAttribute('d', 'M' + (nowT / 24 * W) + ' 0 L ' + (nowT / 24 * W) + ' 200');
  var dot = $('#tideDot'); dot.style.left = (nowT / 24 * 100) + '%'; dot.style.top = (tide(nowT) / H * 100) + '%';
  var nl = $('#tideNowLabel'); nl.textContent = 'AGORA · 15H30 · 0,6 M'; nl.style.left = (nowT / 24 * 100) + '%';
  [[4.21, 'BAIXA', '04h13 · 0,3 m'], [10.42, 'ALTA', '10h25 · 2,1 m'], [16.63, 'BAIXA', '16h38 · 0,3 m'], [22.84, 'ALTA', '22h50 · 2,1 m']].forEach(function (m) {
    var k = el('div', 'tide-mark'); k.style.left = (m[0] / 24 * 100) + '%'; k.style.top = (tide(m[0]) / H * 100) + '%';
    k.appendChild(el('span', 'mono', m[1])); k.appendChild(el('b', null, m[2])); $('#tideMarks').appendChild(k);
  });
})();
