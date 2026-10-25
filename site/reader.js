// Scholia chapter reader. Loads a chapter's text and notes and marks anchors.
// Wide screens: the text keeps a fixed reading width in the centre, and notes
// sit in panels on either side that open when the pointer nears that side.
// Narrow screens: tapping an anchor opens its note under the paragraph.
(function () {
  'use strict';

  const BOOKS = { 'lord-jim': { title: 'Lord Jim', chapters: 10 } };
  const LAYERS = ['vocab', 'allusion', 'history', 'place'];
  const LAYER_NAMES = { vocab: 'Vocab', allusion: 'Allusion', history: 'History', place: 'Place' };
  // Vocabulary goes on the right; references to the wider world on the left.
  const SIDE = { vocab: 'right', allusion: 'left', history: 'left', place: 'left' };
  const STORE_KEY = 'scholia.layers';

  const GAP = 24;          // space between the text and a panel
  const EDGE = 12;         // space between a panel and the window edge
  const MIN_PANEL = 240;
  const MAX_PANEL = 360;
  // Below this gutter width there is no room for a panel even with the text
  // slid aside, so notes open under the paragraph instead.
  const MIN_GUTTER = (MIN_PANEL + GAP + EDGE) / 2;
  const NOTE_GAP = 6;

  const params = new URLSearchParams(location.search);
  const bookId = BOOKS[params.get('book')] ? params.get('book') : 'lord-jim';
  const book = BOOKS[bookId];
  const ch = Math.min(book.chapters, Math.max(1, parseInt(params.get('ch'), 10) || 1));
  const pad = String(ch).padStart(2, '0');

  const readerEl = document.getElementById('reader');
  const columnEl = document.getElementById('column');
  const textEl = document.getElementById('text');
  const panels = { left: document.getElementById('panel-left'), right: document.getElementById('panel-right') };
  const ticks = { left: document.getElementById('ticks-left'), right: document.getElementById('ticks-right') };

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
    'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
    'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL', 'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV'];
  const chName = n => 'Chapter ' + (ROMAN[n - 1] || n);
  document.getElementById('title').textContent = chName(ch);
  document.getElementById('eyebrow').textContent = book.title;
  document.getElementById('crumb-chapter').textContent = chName(ch);
  document.title = book.title + ', ' + chName(ch) + ' · Scholia';
  const bookLink = document.getElementById('book-link');
  bookLink.textContent = book.title;
  bookLink.href = 'book.html?book=' + bookId;

  async function fetchFirst(paths, parse) {
    // The deployed site has texts/ and notes/ beside the pages; a local
    // checkout served from the repo root has them one level up.
    for (const p of paths) {
      try {
        // no-cache: revalidate, so edited notes show up right after a deploy.
        const r = await fetch(p, { cache: 'no-cache' });
        if (r.ok) return parse(r);
      } catch (e) { /* try next */ }
    }
    return null;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function linkify(s) {
    return escapeHtml(s).replace(/https?:\/\/[^\s)]+/g, u => '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>');
  }

  // ----- Layer toggles -----
  function loadLayers() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { /* ignore */ }
    const on = {};
    LAYERS.forEach(l => { on[l] = !(saved && saved[l] === false); });
    return on;
  }
  const layersOn = loadLayers();
  function applyLayers() {
    LAYERS.forEach(l => document.body.classList.toggle('hide-' + l, !layersOn[l]));
  }
  document.querySelectorAll('#layers input').forEach(box => {
    box.checked = layersOn[box.value];
    box.addEventListener('change', () => {
      layersOn[box.value] = box.checked;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(layersOn)); } catch (e) { /* ignore */ }
      applyLayers();
      clearActive();
      layout();
    });
  });
  applyLayers();

  // ----- Chapter navigation -----
  const chapterHref = n => 'chapter.html?book=' + bookId + '&ch=' + n;
  document.getElementById('chapnav').innerHTML =
    (ch > 1 ? '<a href="' + chapterHref(ch - 1) + '">&larr; ' + chName(ch - 1) + '</a>' : '<span></span>') +
    '<a href="book.html?book=' + bookId + '">Contents</a>' +
    (ch < book.chapters ? '<a href="' + chapterHref(ch + 1) + '">' + chName(ch + 1) + ' &rarr;</a>' : '<span></span>');

  // ----- Rendering -----
  function noteHtml(n) {
    return '<span class="layer-name">' + LAYER_NAMES[n.layer] + '</span>' +
      '<span class="term">' + escapeHtml(n.anchor) + '</span>' +
      (n.status === 'draft' ? '<span class="draft-label">unverified</span>' : '') +
      ' ' + escapeHtml(n.note) +
      (n.source ? '<span class="source">Source: ' + linkify(n.source) + '</span>' : '');
  }

  function makeNote(n, extraClass) {
    const div = document.createElement('div');
    div.className = 'note' + (extraClass ? ' ' + extraClass : '');
    div.dataset.layer = n.layer;
    div.dataset.id = n.id;
    div.innerHTML = noteHtml(n);
    return div;
  }

  // Paragraphs are separated by blank lines; line breaks inside a paragraph
  // are just wrapping, so they become spaces. Anchors are matched against
  // this normalized paragraph text.
  function paragraphs(raw) {
    return raw.replace(/\r\n/g, '\n').split(/\n\s*\n/)
      .map(p => p.replace(/\s*\n\s*/g, ' ').trim())
      .filter(Boolean);
  }

  function markParagraph(text, notes, used) {
    const hits = [];
    notes.forEach(n => {
      if (used.has(n.id)) return;
      const i = text.indexOf(n.anchor);
      if (i < 0) return;
      hits.push({ start: i, end: i + n.anchor.length, note: n });
    });
    hits.sort((a, b) => a.start - b.start || b.end - a.end);
    let out = '';
    let pos = 0;
    const placed = [];
    hits.forEach(h => {
      if (h.start < pos) {
        console.warn('Overlapping anchor skipped:', h.note.id, h.note.anchor);
        return;
      }
      out += escapeHtml(text.slice(pos, h.start));
      out += '<span class="anchor" tabindex="0" role="button" data-id="' + h.note.id +
        '" data-layer="' + h.note.layer + '">' + escapeHtml(text.slice(h.start, h.end)) + '</span>';
      pos = h.end;
      used.add(h.note.id);
      placed.push(h.note);
    });
    out += escapeHtml(text.slice(pos));
    return { html: out, placed };
  }

  let notesById = {};

  function render(raw, notes) {
    notesById = {};
    notes.forEach(n => { notesById[n.id] = n; });
    const used = new Set();
    textEl.innerHTML = '';
    ['left', 'right'].forEach(s => { panels[s].innerHTML = ''; ticks[s].innerHTML = ''; });
    paragraphs(raw).forEach(t => {
      const p = document.createElement('p');
      const r = markParagraph(t, notes, used);
      p.innerHTML = r.html;
      textEl.appendChild(p);
      r.placed.forEach(n => {
        const side = SIDE[n.layer];
        panels[side].appendChild(makeNote(n));
        const tick = document.createElement('span');
        tick.className = 'tick';
        tick.dataset.layer = n.layer;
        tick.dataset.id = n.id;
        ticks[side].appendChild(tick);
      });
    });
    notes.filter(n => !used.has(n.id)).forEach(n =>
      console.warn('Anchor not found in text:', n.id, JSON.stringify(n.anchor)));
    layout();
  }

  // ----- Layout -----
  // fits: both panels fit beside the text. Otherwise an open panel slides
  // the text toward the other side by `shift`, so the text is never covered.
  const geo = { inline: true, fits: false, textLeft: 0, textRight: 0, shift: 0 };
  const anchorFor = id => textEl.querySelector('.anchor[data-id="' + id + '"]');

  function layout() {
    const rr = readerEl.getBoundingClientRect();
    geo.textLeft = columnEl.offsetLeft;
    geo.textRight = columnEl.offsetLeft + columnEl.offsetWidth;
    const gutter = Math.min(geo.textLeft, rr.width - geo.textRight);
    const inline = gutter < MIN_GUTTER;
    if (inline !== geo.inline) { clearActive(); state.hover = state.peek = null; }
    geo.inline = inline;
    document.body.classList.toggle('inline-mode', inline);
    if (inline) { applyOpen(); return; }

    const room = gutter - GAP - EDGE;
    geo.fits = room >= MIN_PANEL;
    document.body.dataset.fits = geo.fits ? 'yes' : 'no';
    const width = Math.max(MIN_PANEL, Math.min(MAX_PANEL, room));
    panels.left.style.width = panels.right.style.width = width + 'px';
    panels.left.style.left = Math.max(EDGE, geo.textLeft - GAP - width) + 'px';
    panels.right.style.left = Math.min(geo.textRight + GAP, rr.width - width - EDGE) + 'px';
    geo.shift = Math.max(0, width + GAP + EDGE - geo.textLeft);
    ticks.left.style.left = (geo.textLeft - 16) + 'px';
    ticks.right.style.left = (geo.textRight + 8) + 'px';

    let bottom = 0;
    ['left', 'right'].forEach(side => {
      bottom = Math.max(bottom, placeNotes(side, rr.top));
    });
    readerEl.style.minHeight = '';
    const height = Math.max(bottom, readerEl.offsetHeight);
    readerEl.style.minHeight = height + 'px';
    panels.left.style.height = panels.right.style.height = height + 'px';
    applyOpen();
  }

  // Place one side's notes as close to their anchors as possible. Notes that
  // would overlap are grouped, and each group is centred on its anchors.
  function placeNotes(side, top) {
    const items = [];
    panels[side].querySelectorAll('.note').forEach(el => {
      if (getComputedStyle(el).display === 'none') return;
      const a = anchorFor(el.dataset.id);
      if (!a) return;
      const r = a.getBoundingClientRect();
      items.push({ el, want: r.top - top, h: el.offsetHeight });
      const tick = ticks[side].querySelector('.tick[data-id="' + el.dataset.id + '"]');
      if (tick) tick.style.top = (r.top - top + r.height / 2) + 'px';
    });
    const groups = [];
    items.forEach(it => {
      let g = { items: [it], h: it.h, offsetSum: it.want, top: Math.max(0, it.want) };
      while (groups.length) {
        const prev = groups[groups.length - 1];
        if (prev.top + prev.h + NOTE_GAP <= g.top) break;
        groups.pop();
        let offsetSum = prev.offsetSum;
        let off = prev.h + NOTE_GAP;
        g.items.forEach(x => { offsetSum += x.want - off; off += x.h + NOTE_GAP; });
        const n = prev.items.length + g.items.length;
        g = { items: prev.items.concat(g.items), h: prev.h + NOTE_GAP + g.h, offsetSum, top: 0 };
        g.top = Math.max(0, offsetSum / n);
      }
      groups.push(g);
    });
    let bottom = 0;
    groups.forEach(g => {
      let y = g.top;
      g.items.forEach(x => { x.el.style.top = y + 'px'; y += x.h + NOTE_GAP; });
      bottom = y;
    });
    return bottom;
  }

  // ----- Opening panels -----
  // hover: the pointer is in that side's gutter or inside its open panel.
  // peek: the pointer is on an anchor whose note lives on that side.
  // pinned: an anchor was clicked; stays open until dismissed.
  const state = { hover: null, peek: null, pinned: null };

  function applyOpen() {
    const open = { left: false, right: false };
    if (!geo.inline && geo.fits) {
      const always = document.documentElement.dataset.notes === 'always';
      ['left', 'right'].forEach(side => {
        open[side] = always || state.hover === side || state.peek === side || state.pinned === side;
      });
    } else if (!geo.inline) {
      // Only one panel at a time when the text has to slide aside for it.
      // Hovering an anchor doesn't open it here: the text would slide out
      // from under the pointer.
      const side = state.hover || state.pinned;
      if (side) open[side] = true;
    }
    ['left', 'right'].forEach(side => {
      panels[side].classList.toggle('open', open[side]);
      panels[side].setAttribute('aria-hidden', open[side] ? 'false' : 'true');
    });
    const shift = geo.fits || geo.inline ? 0 : open.left ? geo.shift : open.right ? -geo.shift : 0;
    readerEl.style.setProperty('--shift', shift + 'px');
  }

  let lastMove = null;
  let frame = 0;
  function onMove() {
    frame = 0;
    const ev = lastMove;
    if (geo.inline) return;
    const inPanel = ev.target.closest && ev.target.closest('.panel.open');
    if (inPanel) {
      state.hover = inPanel === panels.left ? 'left' : 'right';
    } else {
      const x = ev.clientX - readerEl.getBoundingClientRect().left;
      state.hover = x < geo.textLeft - 8 ? 'left' : x > geo.textRight + 8 ? 'right' : null;
    }
    applyOpen();
  }
  document.addEventListener('mousemove', e => {
    lastMove = e;
    if (!frame) frame = requestAnimationFrame(onMove);
  });
  document.documentElement.addEventListener('mouseleave', () => { state.hover = null; applyOpen(); });

  function clearActive() {
    document.querySelectorAll('.anchor.active, .note.active, .tick.active').forEach(el => el.classList.remove('active'));
    textEl.querySelectorAll('.inline-note').forEach(el => el.remove());
    state.pinned = null;
  }

  function setHover(id, on) {
    const a = anchorFor(id);
    if (a) a.classList.toggle('hover', on);
    document.querySelectorAll('.note[data-id="' + id + '"], .tick[data-id="' + id + '"]').forEach(el => el.classList.toggle('hover', on));
  }

  function activate(anchor) {
    const id = anchor.dataset.id;
    const n = notesById[id];
    if (!n || !layersOn[n.layer]) return;

    if (geo.inline) {
      const p = anchor.closest('p');
      const next = p.nextElementSibling;
      const open = next && next.classList.contains('inline-note') && next.dataset.id === id;
      clearActive();
      if (open) return;
      anchor.classList.add('active');
      p.after(makeNote(n, 'inline-note'));
      return;
    }

    clearActive();
    anchor.classList.add('active');
    document.querySelectorAll('.panel .note[data-id="' + id + '"], .tick[data-id="' + id + '"]').forEach(el => el.classList.add('active'));
    state.pinned = SIDE[n.layer];
    layout(); // the active note shows its source, so heights change
  }

  textEl.addEventListener('click', e => {
    const a = e.target.closest('.anchor');
    if (a) activate(a);
    else if (state.pinned || textEl.querySelector('.inline-note')) { clearActive(); applyOpen(); }
  });
  textEl.addEventListener('keydown', e => {
    const a = e.target.closest('.anchor');
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(a); }
  });
  textEl.addEventListener('mouseover', e => {
    const a = e.target.closest('.anchor');
    if (!a || geo.inline || !layersOn[a.dataset.layer]) return;
    state.peek = SIDE[a.dataset.layer];
    setHover(a.dataset.id, true);
    applyOpen();
  });
  textEl.addEventListener('mouseout', e => {
    const a = e.target.closest('.anchor');
    if (!a) return;
    state.peek = null;
    setHover(a.dataset.id, false);
    applyOpen();
  });
  ['left', 'right'].forEach(side => {
    panels[side].addEventListener('click', e => {
      const m = e.target.closest('.note');
      if (!m || e.target.closest('a')) return;
      const a = anchorFor(m.dataset.id);
      if (a) activate(a);
    });
    panels[side].addEventListener('mouseover', e => {
      const m = e.target.closest('.note');
      if (m) setHover(m.dataset.id, true);
    });
    panels[side].addEventListener('mouseout', e => {
      const m = e.target.closest('.note');
      if (m) setHover(m.dataset.id, false);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (state.pinned || textEl.querySelector('.inline-note'))) { clearActive(); applyOpen(); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 100);
  });
  document.addEventListener('scholia:prefs', () => {
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  // ----- Load -----
  (async function () {
    const textPath = 'texts/' + bookId + '/ch' + pad + '.txt';
    const notesPath = 'notes/' + bookId + '/ch' + ch + '.json';
    const raw = await fetchFirst([textPath, '../' + textPath], r => r.text());
    if (raw === null) {
      textEl.innerHTML = '<p class="status">Could not load the text for this chapter.</p>';
      return;
    }
    const all = (await fetchFirst([notesPath, '../' + notesPath], r => r.json())) || [];
    // Only verified and draft notes are shown; cut notes never are.
    const notes = all.filter(n => (n.status === 'verified' || n.status === 'draft') && LAYERS.includes(n.layer));
    render(raw, notes);
  })();
})();
