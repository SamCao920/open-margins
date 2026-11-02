// Open Margins search. Searches every chapter of a book, and its notes, in the
// browser; nothing is sent anywhere. "Smart" in four small ways:
//  - forgiving matching: case, accents, curly quotes and dashes are ignored;
//  - word forms: "privation" finds "privations", "jumped" finds "jump";
//  - typos: a word that appears nowhere in the book is swapped for the
//    closest word that does ("Patusn" -> "Patusan"), and the swap is shown;
//  - ranking: passages with the exact phrase, then all words close together,
//    come first. "Quoted words" must appear exactly as typed.
// Used on the book page (inline) and on chapter pages (a menu in the bar).
// The chapter reader calls OMSearch.highlight() to mark hits after a jump.
(function () {
  'use strict';

  const BOOKS = { 'lord-jim': { title: 'Lord Jim', chapters: 45 } };
  const STOP = new Set(('a an and are as at be but by for from had has have he her his i in is it its me my of on or ' +
    'she so that the their them there they this to was we were what when which who will with you').split(' '));

  // One character in, one character out, so positions in the normalized text
  // match positions in the displayed text.
  function normChar(c) {
    const d = c.normalize('NFD')[0].toLowerCase();
    if ('‘’ʼ\''.includes(d)) return '\'';
    if ('“”"'.includes(d)) return '"';
    if ('—–-'.includes(d)) return ' ';
    return d;
  }
  const norm = s => Array.from(s, normChar).join('');

  function stem(w) {
    if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3);
    for (const suf of ['ing', 'edly', 'ed', 'ly', 'es', 's']) {
      if (w.length - suf.length >= 4 && w.endsWith(suf)) return w.slice(0, -suf.length);
    }
    return w;
  }

  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let best = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        best = Math.min(best, cur[j]);
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  const words = s => Array.from(s.matchAll(/[a-z0-9]+(?:'[a-z]+)?/g), m => ({ w: m[0], i: m.index }));

  // Paragraph splitting and underscore italics, as in the reader.
  function paragraphsOf(raw) {
    return raw.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter(p => p.trim())
      .map(p => p.split('\n').map(l => l.trim()).filter(Boolean).join(' ').replace(/_([^_]+)_/g, '$1'));
  }

  async function fetchFirst(paths, parse) {
    for (const p of paths) {
      try { const r = await fetch(p, { cache: 'no-cache' }); if (r.ok) return parse(r); } catch (e) { /* next */ }
    }
    return null;
  }

  const indexes = {};
  function loadIndex(bookId) {
    if (indexes[bookId]) return indexes[bookId];
    const book = BOOKS[bookId];
    indexes[bookId] = (async () => {
      const chs = Array.from({ length: book.chapters }, (_, i) => i + 1);
      const loaded = await Promise.all(chs.map(async ch => {
        const tp = 'texts/' + bookId + '/ch' + String(ch).padStart(2, '0') + '.txt';
        const np = 'notes/' + bookId + '/ch' + ch + '.json';
        const [raw, notes] = await Promise.all([
          fetchFirst([tp, '../' + tp], r => r.text()),
          fetchFirst([np, '../' + np], r => r.json())]);
        return { ch, raw: raw || '', notes: (notes || []).filter(n => n.status !== 'cut') };
      }));
      const docs = [];
      const vocab = new Map();
      for (const { ch, raw, notes } of loaded) {
        paragraphsOf(raw).forEach((text, i) => docs.push({ kind: 'text', ch, para: i + 1, text, n: norm(text) }));
        notes.forEach(note => {
          const text = note.anchor + ' — ' + note.note;
          docs.push({ kind: 'note', ch, note, text, n: norm(text) });
        });
      }
      docs.forEach(d => { d.words = words(d.n); d.words.forEach(({ w }) => vocab.set(w, (vocab.get(w) || 0) + 1)); });
      return { docs, vocab, book };
    })();
    return indexes[bookId];
  }

  // Turn a query into phrases (quoted, exact) and terms (word-start, stemmed),
  // correcting terms that match no word in the book.
  function parse(q, vocab) {
    const phrases = [];
    let rest = norm(q).replace(/"([^"]+)"/g, (_, p) => { if (p.trim()) phrases.push(p.trim().replace(/\s+/g, ' ')); return ' '; });
    let raw = words(rest).map(x => x.w);
    const content = raw.filter(w => !STOP.has(w));
    if (content.length) raw = content;
    const fixes = [];
    const vocabWords = Array.from(vocab.keys());
    const terms = raw.map(w => {
      const s = stem(w);
      if (vocabWords.some(v => v.startsWith(s))) return s;
      const max = w.length <= 4 ? 1 : 2;
      let best = null, bestD = max + 1, bestF = 0;
      for (const v of vocabWords) {
        const d = lev(w, v, max);
        if (d < bestD || (d === bestD && d <= max && vocab.get(v) > bestF)) { best = v; bestD = d; bestF = vocab.get(v); }
      }
      if (best && bestD <= max) { fixes.push([w, best]); return stem(best); }
      return s;
    });
    return { phrases, terms: Array.from(new Set(terms)), fixes };
  }

  function scoreDoc(d, p, whole) {
    const hits = [];
    for (const ph of p.phrases) {
      let i = d.n.indexOf(ph);
      if (i < 0) return null;
      for (; i >= 0; i = d.n.indexOf(ph, i + 1)) hits.push([i, i + ph.length]);
    }
    const found = new Set();
    const pos = [];
    d.words.forEach(({ w, i }, k) => {
      for (const t of p.terms) if (w.startsWith(t)) { found.add(t); hits.push([i, i + w.length]); pos.push(k); }
    });
    if (!hits.length) return null;
    let score = found.size * 4 + Math.min(hits.length, 8) * 0.5 + p.phrases.length * 10;
    if (whole && d.n.includes(whole)) score += 12;
    if (p.terms.length > 1 && found.size === p.terms.length) {
      score += 6;
      const span = Math.max(...pos) - Math.min(...pos);
      if (span <= p.terms.length + 3) score += 6;
    }
    if (d.kind === 'note') score -= 1;
    return { d, score, all: found.size === p.terms.length, hits: hits.sort((a, b) => a[0] - b[0]) };
  }

  async function search(bookId, q) {
    const { docs, vocab } = await loadIndex(bookId);
    const p = parse(q, vocab);
    if (!p.phrases.length && !p.terms.length) return { p, results: [], partial: false };
    const whole = p.terms.length > 1 ? norm(q).replace(/"/g, '').trim().replace(/\s+/g, ' ') : null;
    let results = docs.map(d => scoreDoc(d, p, whole)).filter(Boolean);
    const full = results.filter(r => r.all);
    const partial = !full.length && p.terms.length > 1;
    if (full.length) results = full;
    // One plain word (a name, say): every hit is equally good, so list them in
    // reading order. Several words: best matches first.
    const byPlace = (a, b) => a.d.ch - b.d.ch || (a.d.kind === 'note') - (b.d.kind === 'note') || (a.d.para || 0) - (b.d.para || 0);
    if (p.terms.length + p.phrases.length === 1) results.sort(byPlace);
    else results.sort((a, b) => b.score - a.score || byPlace(a, b));
    return { p, results, partial };
  }

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function snippet(text, hits, len) {
    const first = hits.length ? hits[0][0] : 0;
    const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, first - len / 3)) + 1);
    const end = Math.min(text.length, start + len);
    let out = start > 0 ? '… ' : '';
    let pos = start;
    for (const [a, b] of hits) {
      if (a < pos || a >= end) continue;
      out += esc(text.slice(pos, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>';
      pos = b;
    }
    return out + esc(text.slice(pos, end)) + (end < text.length ? ' …' : '');
  }

  function mount(root, opts) {
    const bookId = opts.book;
    const book = BOOKS[bookId];
    root.classList.add('search');
    root.innerHTML =
      '<form class="search-form" role="search">' +
      '<label class="sr-only" for="' + opts.id + '">Search ' + esc(book.title) + '</label>' +
      '<input id="' + opts.id + '" type="search" autocomplete="off" spellcheck="false" placeholder="Search words or phrases in ' + esc(book.title) + '">' +
      '<button type="submit" class="bar-button">Search</button></form>' +
      '<p class="search-hint">Finds word forms and fixes typos. Put words in “quotes” to match them exactly.</p>' +
      '<div class="search-results" aria-live="polite"></div>';
    const input = root.querySelector('input');
    const out = root.querySelector('.search-results');
    let shown = 25;
    let last = null;

    function chapterHref(ch, para, q) {
      return 'chapter.html?book=' + bookId + '&ch=' + ch + '&q=' + encodeURIComponent(q) + (para ? '#p' + para : '');
    }

    function draw() {
      const { p, results, partial, q } = last;
      if (!results.length) { out.innerHTML = '<p class="search-meta">No passages found.</p>'; return; }
      const chs = new Set(results.map(r => r.d.ch));
      let html = '';
      if (p.fixes.length) html += '<p class="search-meta">Showing results for ' + p.fixes.map(([a, b]) => '<em>' + esc(b) + '</em> (not “' + esc(a) + '”)').join(', ') + '.</p>';
      html += '<p class="search-meta">' + (partial ? 'No passage has every word; closest matches. ' : '') +
        results.length + (results.length === 1 ? ' match' : ' matches') + ' in ' + chs.size + (chs.size === 1 ? ' chapter' : ' chapters') + '.</p><ol class="search-list">';
      results.slice(0, shown).forEach(r => {
        const d = r.d;
        const here = opts.chapter === d.ch ? ' <span class="here">this chapter</span>' : '';
        if (d.kind === 'text') {
          html += '<li><a href="' + chapterHref(d.ch, d.para, q) + '"><span class="where">Chapter ' + d.ch + here + '</span>' +
            '<span class="snip">' + snippet(d.text, r.hits, 220) + '</span></a></li>';
        } else {
          html += '<li class="note-hit"><a href="' + chapterHref(d.ch, null, q) + '"><span class="where">Note · Chapter ' + d.ch + here + '</span>' +
            '<span class="snip">' + snippet(d.text, r.hits, 220) + '</span></a></li>';
        }
      });
      html += '</ol>';
      if (results.length > shown) html += '<button type="button" class="bar-button search-more">Show more</button>';
      out.innerHTML = html;
      const more = out.querySelector('.search-more');
      if (more) more.addEventListener('click', () => { shown += 25; draw(); });
    }

    async function run(q) {
      q = q.trim();
      if (!q) { out.innerHTML = ''; return; }
      out.innerHTML = '<p class="search-meta">Searching…</p>';
      const r = await search(bookId, q);
      last = Object.assign(r, { q });
      shown = 25;
      draw();
    }

    root.querySelector('form').addEventListener('submit', e => { e.preventDefault(); run(input.value); });
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => run(input.value), 250); });
    input.addEventListener('focus', () => loadIndex(bookId), { once: true });
    if (opts.initial) { input.value = opts.initial; run(opts.initial); }
    return { focus: () => input.focus() };
  }

  // Mark every hit for q inside el (text nodes only, so anchors keep working).
  async function highlight(el, bookId, q) {
    const { vocab } = await loadIndex(bookId);
    const p = parse(q, vocab);
    if (!p.terms.length && !p.phrases.length) return 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    nodes.forEach(node => {
      const n = norm(node.nodeValue);
      const ranges = [];
      p.phrases.forEach(ph => { for (let i = n.indexOf(ph); i >= 0; i = n.indexOf(ph, i + 1)) ranges.push([i, i + ph.length]); });
      words(n).forEach(({ w, i }) => { if (p.terms.some(t => w.startsWith(t))) ranges.push([i, i + w.length]); });
      if (!ranges.length) return;
      ranges.sort((a, b) => a[0] - b[0]);
      const frag = document.createDocumentFragment();
      let pos = 0;
      ranges.forEach(([a, b]) => {
        if (a < pos) return;
        frag.appendChild(document.createTextNode(node.nodeValue.slice(pos, a)));
        const m = document.createElement('mark');
        m.className = 'search-hit';
        m.textContent = node.nodeValue.slice(a, b);
        frag.appendChild(m);
        count++;
        pos = b;
      });
      frag.appendChild(document.createTextNode(node.nodeValue.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
    return count;
  }

  window.OMSearch = { mount, highlight, search };
})();
