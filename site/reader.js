// Scholia chapter reader. Loads a chapter's text and notes and marks anchors.
// Wide screens: the text keeps a set reading width in the centre. Hovering an
// anchor shows just its note beside it; moving the pointer into a margin
// opens that side's panel with all of its notes.
// Narrow screens: tapping an anchor opens its note under the paragraph.
(function () {
  'use strict';

  const BOOKS = { 'lord-jim': { title: 'Lord Jim', chapters: 10 } };
  const LAYERS = ['vocab', 'allusion', 'history', 'place'];
  const LAYER_NAMES = { vocab: 'Vocab', allusion: 'Allusion', history: 'History', place: 'Place' };
  // Vocabulary goes on the right; references to the wider world on the left.
  const SIDE = { vocab: 'right', allusion: 'left', history: 'left', place: 'left' };
  // Each layer has a printer's reference mark, shown in the margin and notes.
  const REF = { vocab: '*', allusion: '\u2020', history: '\u00a7', place: '\u00b6' };
  const STORE_KEY = 'scholia.layers';

  const GAP = 20;          // space between the text and a panel
  const EDGE = 16;         // space between a panel and the window edge
  const MIN_FOCUS = 170;   // narrowest a single note may be set in the margin
  const MIN_PANEL = 300;
  const MAX_PANEL = 440;
  // Below this gutter width a single note can't sit in the margin without
  // covering the text, so notes open under the paragraph instead.
  const MIN_GUTTER = MIN_FOCUS + GAP + EDGE;
  const NOTE_GAP = 3;

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
  document.getElementById('title').textContent = chName(ch) + '.';
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
    '<span class="prev">' + (ch > 1 ? '<a href="' + chapterHref(ch - 1) + '" rel="prev"><span class="dir">Previous</span> ' + chName(ch - 1) + '</a>' : '') + '</span>' +
    '<span class="toc-link"><a href="book.html?book=' + bookId + '">Contents</a></span>' +
    '<span class="next">' + (ch < book.chapters ? '<a href="' + chapterHref(ch + 1) + '" rel="next"><span class="dir">Next</span> ' + chName(ch + 1) + '</a>' : '') + '</span>';

  // ----- Rendering -----
  function noteHtml(n) {
    return '<span class="ref" aria-hidden="true">' + REF[n.layer] + '</span>' +
      '<span class="layer-name">' + LAYER_NAMES[n.layer] + '</span>' +
      '<span class="term">' + escapeHtml(n.anchor) + '</span>' +
      (n.status === 'draft' ? '<span class="draft-tag">unverified</span>' : '') +
      '<span class="gloss">' + escapeHtml(n.note) + '</span><span class="gloss-short"></span>' +
      (n.status === 'draft' ? ' <span class="draft-label">(unverified)</span>' : '') +
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
      });
    });
    notes.filter(n => !used.has(n.id)).forEach(n =>
      console.warn('Anchor not found in text:', n.id, JSON.stringify(n.anchor)));
    layout();
  }

  // ----- Layout -----
  // fits: both panels fit beside the text. Otherwise an open panel slides
  // the text toward the other side by `shift`, so the text is never covered.
  const geo = { inline: true, fits: false, textLeft: 0, textRight: 0, shift: 0, room: 0, panelWidth: 0, panelLeft: {} };
  // An anchor's own line: the first line box it sits on (it may wrap).
  const lineOf = a => a.getClientRects()[0] || a.getBoundingClientRect();
  const anchorFor = id => textEl.querySelector('.anchor[data-id="' + id + '"]');

  function layout() {
    const rr = readerEl.getBoundingClientRect();
    geo.textLeft = columnEl.offsetLeft;
    geo.textRight = columnEl.offsetLeft + columnEl.offsetWidth;
    const gutter = Math.min(geo.textLeft, rr.width - geo.textRight);
    const inline = gutter < MIN_GUTTER;
    if (inline !== geo.inline) { clearActive(); state.hover = state.peekId = null; }
    geo.inline = inline;
    document.body.classList.toggle('inline-mode', inline);
    if (inline) { applyOpen(); return; }

    const room = gutter - GAP - EDGE;
    geo.room = Math.min(MAX_PANEL, room);
    geo.fits = room >= MIN_PANEL;
    document.body.dataset.fits = geo.fits ? 'yes' : 'no';
    const width = Math.max(MIN_PANEL, Math.min(MAX_PANEL, room));
    panels.left.style.width = panels.right.style.width = width + 'px';
    geo.panelWidth = width;
    geo.panelLeft = {
      left: Math.max(EDGE, geo.textLeft - GAP - width),
      right: Math.min(geo.textRight + GAP, rr.width - width - EDGE),
    };
    panels.left.style.left = geo.panelLeft.left + 'px';
    panels.right.style.left = geo.panelLeft.right + 'px';
    geo.shift = Math.max(0, width + GAP + EDGE - geo.textLeft);
    ticks.left.style.left = (geo.textLeft - 10 - ticks.left.offsetWidth) + 'px';
    ticks.right.style.left = (geo.textRight + 10) + 'px';

    ['left', 'right'].forEach(side => {
      placeNotes(side, rr.top);
      placeTicks(side, rr.top);
    });
    panels.left.style.height = panels.right.style.height = readerEl.offsetHeight + 'px';
    applyOpen();
  }

  // Place one side's notes level with their anchors' lines. A note never
  // rises above its own line; it only moves down to clear the one before.
  // Only notes for lines on screen are set, so a dense chapter's margin
  // never drifts far from the text being read; scrolling re-sets them.
  //
  // Each note is cut to the lines that fit before the next note's line
  // (at least one), so a crowded passage gets shorter notes rather than
  // notes that slide away from their text. Hover or pin shows a note whole.
  function placeNotes(side, top) {
    const viewTop = -40, viewBottom = window.innerHeight;
    const items = [];
    panels[side].querySelectorAll('.note').forEach(el => {
      if (getComputedStyle(el).display === 'none') return;
      const a = anchorFor(el.dataset.id);
      if (!a) return;
      const lineTop = lineOf(a).top;
      const onScreen = lineTop >= viewTop && lineTop <= viewBottom;
      el.classList.toggle('offscreen', !onScreen);
      if (onScreen) items.push({ el, want: lineTop - top });
    });
    let floor = 0;
    items.forEach((it, i) => {
      const y = Math.max(it.want, floor);
      const next = items[i + 1] ? items[i + 1].want : Infinity;
      const lh = parseFloat(getComputedStyle(it.el).lineHeight) || 18;
      const lines = Math.max(1, Math.min(6, Math.floor((next - y - NOTE_GAP) / lh)));
      fitNote(it.el, lines, lh);
      it.el.style.top = y + 'px';
      it.el.style.paddingBottom = '';
      floor = y + it.el.offsetHeight + NOTE_GAP;
    });
    return floor;
  }

  // Trim a margin note's gloss to whole words so the note fits in `lines`
  // lines. The lemma is never cut, and at least the gloss's first words
  // always show. An ellipsis marks the cut unless the kept text ends a
  // sentence. Results are cached per note, width, and lines.
  function fitNote(el, lines, lh) {
    const key = lines + '|' + el.clientWidth;
    if (el.dataset.fitKey === key) return;
    el.dataset.fitKey = key;
    const full = el.querySelector('.gloss').textContent;
    const shortEl = el.querySelector('.gloss-short');
    const words = full.split(' ');
    const tooTall = () => el.offsetHeight > lines * lh + 4;
    el.classList.remove('clamped');
    if (!tooTall()) return;
    el.classList.add('clamped');
    const show = k => {
      const text = words.slice(0, k).join(' ');
      // A full sentence ending needs no ellipsis; a comma or bracket does.
      shortEl.textContent = /[.!?]["\u201d]?$/.test(text) ? text : text.replace(/[\s,;:]+$/, '') + '\u2026';
    };
    // Never fewer than three words of gloss, even if that costs a line.
    let lo = Math.min(3, words.length), hi = words.length - 1;
    show(lo);
    if (tooTall()) return;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      show(mid);
      if (tooTall()) hi = mid - 1; else lo = mid;
    }
    show(lo);
  }
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (geo.inline || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const top = readerEl.getBoundingClientRect().top;
      ['left', 'right'].forEach(side => placeNotes(side, top));
    });
  }, { passive: true });

  // One reference mark per annotated line in each gutter, on that line.
  // When several notes share a line their marks sit side by side.
  function placeTicks(side, top) {
    const lines = new Map();
    panels[side].querySelectorAll('.note').forEach(el => {
      const n = notesById[el.dataset.id];
      const a = anchorFor(el.dataset.id);
      if (!n || !a || !layersOn[n.layer]) return;
      const r = lineOf(a);
      const key = Math.round(r.top);
      if (!lines.has(key)) lines.set(key, { top: r.top - top, height: r.height, ids: [], marks: [] });
      const line = lines.get(key);
      line.ids.push(n.id);
      if (!line.marks.includes(REF[n.layer])) line.marks.push(REF[n.layer]);
    });
    ticks[side].innerHTML = '';
    lines.forEach(line => {
      const t = document.createElement('span');
      t.className = 'tick';
      t.dataset.ids = line.ids.join(' ');
      t.textContent = line.marks.join('');
      t.style.top = line.top + 'px';
      t.style.height = t.style.lineHeight = line.height + 'px';
      if (state.pinId && line.ids.includes(state.pinId)) t.classList.add('active');
      ticks[side].appendChild(t);
    });
  }
  const ticksFor = id => document.querySelectorAll('.tick[data-ids~="' + id + '"]');

  // ----- Opening panels and single notes -----
  // hover: the pointer is in that side's gutter or inside its open panel;
  //   the whole panel opens.
  // peekId: the pointer is on an anchor; only that note shows, beside it.
  // pinId: an anchor was clicked; its note stays (with its source) until
  //   dismissed.
  const state = { hover: null, peekId: null, pinId: null, overFocus: false };

  const focusEl = document.createElement('div');
  focusEl.className = 'note focus-note';
  focusEl.setAttribute('role', 'note');
  readerEl.appendChild(focusEl);

  function applyOpen() {
    const open = { left: false, right: false };
    if (!geo.inline && geo.fits) {
      const always = document.documentElement.dataset.notes === 'always';
      ['left', 'right'].forEach(side => { open[side] = always || state.hover === side; });
    } else if (!geo.inline && state.hover) {
      // Only one panel at a time when the text has to slide aside for it.
      open[state.hover] = true;
    }
    ['left', 'right'].forEach(side => {
      panels[side].classList.toggle('open', open[side]);
      panels[side].setAttribute('aria-hidden', open[side] ? 'false' : 'true');
    });
    const shift = geo.fits || geo.inline ? 0 : open.left ? geo.shift : open.right ? -geo.shift : 0;
    readerEl.style.setProperty('--shift', shift + 'px');
    showFocus(open);
  }

  // Show one note on its own beside its anchor, unless its side's panel is
  // already open (then the panel highlights it instead).
  function showFocus(open) {
    const id = state.peekId || (state.overFocus && focusEl.dataset.id) || state.pinId;
    const n = id && notesById[id];
    const a = n && anchorFor(id);
    if (geo.inline || !n || !a || !layersOn[n.layer] || open[SIDE[n.layer]]) {
      focusEl.classList.remove('shown');
      return;
    }
    const pinned = id === state.pinId;
    if (focusEl.dataset.id !== id || focusEl.classList.contains('pinned') !== pinned) {
      focusEl.dataset.id = id;
      focusEl.dataset.layer = n.layer;
      focusEl.innerHTML = noteHtml(n);
      focusEl.classList.toggle('pinned', pinned);
    }
    const side = SIDE[n.layer];
    const rr = readerEl.getBoundingClientRect();
    // It always sits in the free margin beside the anchor's line, narrowed
    // to the margin when the margin is narrower than a panel: it never
    // covers the text.
    const width = geo.fits ? geo.panelWidth : geo.room;
    focusEl.style.width = width + 'px';
    focusEl.style.left = (side === 'left' ? geo.textLeft - GAP - width : geo.textRight + GAP) + 'px';
    focusEl.style.top = (lineOf(a).top - rr.top) + 'px';
    focusEl.classList.add('shown');
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
    } else if (ev.target.closest && ev.target.closest('.bar')) {
      state.hover = null; // the top bar and settings menu aren't the margin
    } else if (ev.target.closest && ev.target.closest('.focus-note')) {
      state.hover = null; // reading a single note shouldn't open the whole side
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
    state.pinId = null;
  }

  function setHover(id, on) {
    const a = anchorFor(id);
    if (a) a.classList.toggle('hover', on);
    document.querySelectorAll('.panel .note[data-id="' + id + '"]').forEach(el => {
      el.classList.toggle('hover', on);
      el.style.paddingBottom = '';
      if (!on) return;
      // A whole note shown over its neighbours: let its wash cover the next
      // note's whole first line instead of slicing through its letters.
      let next = el.nextElementSibling;
      while (next && (next.classList.contains('offscreen') || getComputedStyle(next).display === 'none')) next = next.nextElementSibling;
      if (!next) return;
      const bottom = el.offsetTop + el.offsetHeight;
      if (bottom <= next.offsetTop) return;
      const lh = parseFloat(getComputedStyle(next).lineHeight) || 18;
      const target = next.offsetTop + lh + 4;
      if (bottom < target) el.style.paddingBottom = (target - bottom + parseFloat(getComputedStyle(el).paddingBottom)) + 'px';
    });
    ticksFor(id).forEach(el => el.classList.toggle('hover', on));
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

    const wasPinned = state.pinId === id;
    clearActive();
    if (wasPinned) { applyOpen(); return; }
    anchor.classList.add('active');
    document.querySelectorAll('.panel .note[data-id="' + id + '"]').forEach(el => el.classList.add('active'));
    ticksFor(id).forEach(el => el.classList.add('active'));
    state.pinId = id;
    layout(); // the active panel note shows its source, so heights change
  }

  textEl.addEventListener('click', e => {
    const a = e.target.closest('.anchor');
    if (a) activate(a);
    else if (state.pinId || textEl.querySelector('.inline-note')) { clearActive(); applyOpen(); }
  });
  textEl.addEventListener('keydown', e => {
    const a = e.target.closest('.anchor');
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(a); }
  });
  textEl.addEventListener('mouseover', e => {
    const a = e.target.closest('.anchor');
    if (!a || geo.inline || !layersOn[a.dataset.layer]) return;
    state.peekId = a.dataset.id;
    setHover(a.dataset.id, true);
    applyOpen();
  });
  textEl.addEventListener('mouseout', e => {
    const a = e.target.closest('.anchor');
    if (!a) return;
    state.peekId = null;
    setHover(a.dataset.id, false);
    applyOpen();
  });
  focusEl.addEventListener('mouseenter', () => { state.overFocus = true; });
  focusEl.addEventListener('mouseleave', () => { state.overFocus = false; applyOpen(); });
  focusEl.addEventListener('click', e => {
    if (e.target.closest('a') || state.pinId === focusEl.dataset.id) return;
    const a = anchorFor(focusEl.dataset.id);
    if (a) activate(a);
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
    if (e.key === 'Escape' && (state.pinId || textEl.querySelector('.inline-note'))) { clearActive(); applyOpen(); }
  });

  // Report the real line length (average characters per line) next to the
  // line-length slider.
  const measureOut = document.querySelector('[data-measure-out]');
  function updateMeasure() {
    if (!measureOut) return;
    const ctx = document.createElement('canvas').getContext('2d');
    const cs = getComputedStyle(columnEl);
    ctx.font = cs.fontSize + ' ' + cs.fontFamily;
    const sample = textEl.textContent.slice(0, 2000) || 'the quick brown fox jumps over the lazy dog';
    const avg = ctx.measureText(sample).width / sample.length;
    measureOut.textContent = '· about ' + Math.round(columnEl.clientWidth / avg) + ' characters';
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 100);
  });
  document.addEventListener('scholia:prefs', () => {
    layout();
    updateMeasure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); updateMeasure(); });

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
    updateMeasure();
  })();
})();
