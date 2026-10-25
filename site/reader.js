// Scholia chapter reader. Loads a chapter's text and notes, marks anchors,
// and shows notes in the right margin (wide screens) or under the paragraph
// when an anchor is tapped (narrow screens).
(function () {
  'use strict';

  const BOOK = 'lord-jim';
  const CHAPTERS = 10;
  const LAYERS = ['vocab', 'allusion', 'history', 'place'];
  const LAYER_NAMES = { vocab: 'Vocab', allusion: 'Allusion', history: 'History', place: 'Place' };
  const STORE_KEY = 'scholia.layers';
  const NARROW = window.matchMedia('(max-width: 1150px)');

  const params = new URLSearchParams(location.search);
  const ch = Math.min(CHAPTERS, Math.max(1, parseInt(params.get('ch'), 10) || 1));
  const pad = String(ch).padStart(2, '0');

  const textEl = document.getElementById('text');
  const marginEl = document.getElementById('margin');
  document.getElementById('title').textContent = 'Chapter ' + ch;
  document.title = 'Lord Jim, Chapter ' + ch + ' · Scholia';

  // The deployed site has texts/ and notes/ beside the pages; a local checkout
  // served from the repo root has them one level up.
  async function fetchFirst(paths, parse) {
    for (const p of paths) {
      try {
        const r = await fetch(p);
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
  function saveLayers(on) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(on)); } catch (e) { /* ignore */ }
  }
  const layersOn = loadLayers();
  function applyLayers() {
    LAYERS.forEach(l => document.body.classList.toggle('hide-' + l, !layersOn[l]));
  }
  document.querySelectorAll('#layers input').forEach(box => {
    box.checked = layersOn[box.value];
    box.addEventListener('change', () => {
      layersOn[box.value] = box.checked;
      saveLayers(layersOn);
      applyLayers();
      closeInlineNotes();
      layoutMargin();
    });
  });
  applyLayers();

  // ----- Chapter navigation -----
  const nav = document.getElementById('chapnav');
  nav.innerHTML =
    (ch > 1 ? '<a href="chapter.html?ch=' + (ch - 1) + '">&larr; Chapter ' + (ch - 1) + '</a>' : '<span></span>') +
    '<a href="index.html">Contents</a>' +
    (ch < CHAPTERS ? '<a href="chapter.html?ch=' + (ch + 1) + '">Chapter ' + (ch + 1) + ' &rarr;</a>' : '<span></span>');

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
    marginEl.innerHTML = '';
    paragraphs(raw).forEach(t => {
      const p = document.createElement('p');
      const r = markParagraph(t, notes, used);
      p.innerHTML = r.html;
      textEl.appendChild(p);
      r.placed.forEach(n => marginEl.appendChild(makeNote(n)));
    });
    notes.filter(n => !used.has(n.id)).forEach(n =>
      console.warn('Anchor not found in text:', n.id, JSON.stringify(n.anchor)));
    layoutMargin();
  }

  // Place margin notes as close to their anchors as possible. Notes that would
  // overlap are grouped, and each group is centred on its anchors, so a
  // crowded passage spreads notes both above and below instead of only down.
  const GAP = 6;
  function layoutMargin() {
    if (NARROW.matches) return;
    const base = marginEl.getBoundingClientRect().top;
    const items = [];
    marginEl.querySelectorAll('.note').forEach(el => {
      if (getComputedStyle(el).display === 'none') return;
      const a = textEl.querySelector('.anchor[data-id="' + el.dataset.id + '"]');
      if (!a) return;
      items.push({ el, want: a.getBoundingClientRect().top - base, h: el.offsetHeight });
    });
    const groups = [];
    items.forEach(it => {
      let g = { items: [it], h: it.h, offsetSum: it.want, top: Math.max(0, it.want) };
      while (groups.length) {
        const prev = groups[groups.length - 1];
        if (prev.top + prev.h + GAP <= g.top) break;
        groups.pop();
        // Merge: offsets of g's items shift by prev's height.
        const shift = prev.h + GAP;
        let offsetSum = prev.offsetSum;
        let off = shift;
        g.items.forEach(x => { offsetSum += x.want - off; off += x.h + GAP; });
        const n = prev.items.length + g.items.length;
        g = { items: prev.items.concat(g.items), h: prev.h + GAP + g.h, offsetSum, top: 0 };
        g.top = Math.max(0, offsetSum / n);
      }
      groups.push(g);
    });
    let bottom = 0;
    groups.forEach(g => {
      let y = g.top;
      g.items.forEach(x => { x.el.style.top = y + 'px'; y += x.h + GAP; });
      bottom = y;
    });
    marginEl.style.minHeight = bottom + 'px';
  }

  function closeInlineNotes() {
    textEl.querySelectorAll('.inline-note').forEach(el => el.remove());
    textEl.querySelectorAll('.anchor.active').forEach(el => el.classList.remove('active'));
  }

  function activate(anchor) {
    const id = anchor.dataset.id;
    const n = notesById[id];
    if (!n || !layersOn[n.layer]) return;

    if (NARROW.matches) {
      const p = anchor.closest('p');
      const open = p.nextElementSibling && p.nextElementSibling.classList.contains('inline-note') &&
        p.nextElementSibling.dataset.id === id;
      closeInlineNotes();
      if (open) return;
      anchor.classList.add('active');
      p.after(makeNote(n, 'inline-note'));
      return;
    }

    textEl.querySelectorAll('.anchor.active').forEach(el => el.classList.remove('active'));
    marginEl.querySelectorAll('.note.active').forEach(el => el.classList.remove('active'));
    anchor.classList.add('active');
    const m = marginEl.querySelector('.note[data-id="' + id + '"]');
    if (m) m.classList.add('active');
    layoutMargin();
  }

  textEl.addEventListener('click', e => {
    const a = e.target.closest('.anchor');
    if (a) activate(a);
  });
  marginEl.addEventListener('click', e => {
    const m = e.target.closest('.note');
    if (!m || e.target.closest('a')) return;
    const a = textEl.querySelector('.anchor[data-id="' + m.dataset.id + '"]');
    if (a) activate(a);
  });
  textEl.addEventListener('keydown', e => {
    const a = e.target.closest('.anchor');
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(a); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutMargin, 100);
  });
  NARROW.addEventListener('change', () => { closeInlineNotes(); layoutMargin(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutMargin);

  // ----- Load -----
  (async function () {
    const textPath = 'texts/' + BOOK + '/ch' + pad + '.txt';
    const notesPath = 'notes/' + BOOK + '/ch' + ch + '.json';
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
