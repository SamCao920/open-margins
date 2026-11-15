// Open Margins "type through" mode: type a chapter out word for word.
// The current paragraph shows what is typed (ink), the next letter (marked),
// and what is left (faint). A wrong key does not advance; it only counts
// against accuracy. Plain keys stand in for typographic ones: ' for curly
// apostrophes, " for curly quotes, - for an em dash, e for é.
(function () {
  'use strict';

  const BOOKS = window.OMBOOKS;
  const params = new URLSearchParams(location.search);
  const bookId = BOOKS[params.get('book')] ? params.get('book') : 'lord-jim';
  const book = BOOKS[bookId];
  if (book.verse) document.body.classList.add('verse');
  const ch = Math.min(book.chapters, Math.max(1, parseInt(params.get('ch'), 10) || 1));
  const KEY = 'openmargins.type.' + bookId + '.' + ch;
  const IDLE = 5000; // a pause longer than this is not counted as typing time

  const textEl = document.getElementById('type-text');
  const input = document.getElementById('type-input');
  const q = 'book=' + bookId + '&ch=';
  document.getElementById('title').textContent = book.unit + ' ' + ch + (book.titles ? ': ' + book.titles[ch - 1] : '');
  document.querySelectorAll('.unit-lc').forEach(e => { e.textContent = book.unit.toLowerCase(); });
  document.getElementById('crumb-chapter').textContent = book.unit + ' ' + ch;
  document.title = book.title + ', ' + book.unit + ' ' + ch + ' · Type through · Open Margins';
  const bookLink = document.getElementById('book-link');
  bookLink.textContent = book.title;
  bookLink.href = 'book.html?book=' + bookId;
  document.getElementById('read-link').href = 'chapter.html?' + q + ch;
  document.getElementById('chapnav').innerHTML =
    '<span class="prev">' + (ch > 1 ? '<a href="type.html?' + q + (ch - 1) + '" rel="prev"><span class="dir">Previous</span> ' + book.unit + ' ' + (ch - 1) + '</a>' : '') + '</span>' +
    '<span class="up"><a href="book.html?book=' + bookId + '">Contents</a></span>' +
    '<span class="next">' + (ch < book.chapters ? '<a href="type.html?' + q + (ch + 1) + '" rel="next"><span class="dir">Next</span> ' + book.unit + ' ' + (ch + 1) + '</a>' : '') + '</span>';

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Same paragraph and italics rules as the reader.
  function parse(raw) {
    return raw.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter(p => p.trim()).map(p => {
      const lines = p.split('\n').filter(l => l.trim());
      const extract = lines.every(l => /^ {3,}\S/.test(l));
      const joined = lines.map(l => l.trim()).join(extract ? '\n' : ' ');
      const ranges = [], breaks = [];
      let text = '';
      joined.split(/(_[^_]+_)/).forEach(part => {
        const italic = /^_[^_]+_$/.test(part);
        const start = text.length;
        for (const c of (italic ? part.slice(1, -1) : part)) {
          if (c === '\n') { breaks.push(text.length); text += ' '; } else text += c;
        }
        if (italic) ranges.push([start, text.length]);
      });
      return { text, ranges, breaks, extract };
    });
  }

  function slice(p, a, b) {
    let out = '', open = false;
    for (let i = a; i < b; i++) {
      const it = p.ranges.some(([s, e]) => s <= i && i < e);
      if (it !== open) { out += it ? '<em>' : '</em>'; open = it; }
      out += (p.breaks.includes(i) ? '<br>' : '') + esc(p.text[i]);
    }
    return open ? out + '</em>' : out;
  }

  // What a plain keyboard would type for a character in the text.
  function plain(c) {
    if ('‘’ʼ'.includes(c)) return '\'';
    if ('“”'.includes(c)) return '"';
    if ('—–'.includes(c)) return '-';
    if (c === ' ') return ' ';
    return c.normalize('NFD')[0];
  }
  const matches = (want, got) => got === want || plain(got) === plain(want) || (want === ' ' && got === '\n');

  let paras = [];
  let total = 0;
  const state = { para: 0, pos: 0, keys: 0, errors: 0, ms: 0 };
  let lastKey = 0;
  let afterDash = false;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }
  function load() {
    try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* ignore */ }
    if (!(state.para >= 0 && state.para <= paras.length)) { state.para = 0; state.pos = 0; }
    if (state.para < paras.length && !(state.pos >= 0 && state.pos <= paras[state.para].text.length)) state.pos = 0;
  }

  function stats() {
    let done = state.pos;
    for (let i = 0; i < state.para; i++) done += paras[i].text.length;
    const right = state.keys - state.errors;
    document.getElementById('st-progress').textContent = (total ? Math.floor(done / total * 100) : 0) + '%';
    document.getElementById('st-wpm').textContent = state.ms > 2000 ? Math.round(right / 5 / (state.ms / 60000)) : 0;
    document.getElementById('st-acc').textContent = (state.keys ? Math.round(right / state.keys * 100) : 100) + '%';
  }

  function paraHtml(i) {
    const p = paras[i];
    const n = p.text.length;
    if (i < state.para) return '<span class="typed">' + slice(p, 0, n) + '</span>';
    if (i > state.para) return slice(p, 0, n);
    const at = state.pos;
    return '<span class="typed">' + slice(p, 0, at) + '</span>' +
      (at < n ? '<span class="caret" id="caret">' + slice(p, at, at + 1) + '</span>' + slice(p, at + 1, n)
        : '<span class="caret caret-end" id="caret" aria-label="end of paragraph">↵</span>');
  }

  function drawPara(i) {
    const el = textEl.children[i];
    if (!el) return;
    el.className = (paras[i].extract ? 'extract ' : '') + (i < state.para ? 'done' : i === state.para ? 'current' : 'todo');
    el.innerHTML = paraHtml(i);
  }

  function drawAll() {
    textEl.innerHTML = paras.map((p, i) => '<p></p>').join('') +
      '<p class="type-finished" hidden>End of the ' + book.unit.toLowerCase() + '. ' +
      (ch < book.chapters ? '<a href="type.html?' + q + (ch + 1) + '">Type ' + book.unit + ' ' + (ch + 1) + '</a>' : 'That was the whole book.') + '</p>';
    paras.forEach((_, i) => drawPara(i));
    finished();
    stats();
  }

  function finished() {
    const end = state.para >= paras.length;
    textEl.querySelector('.type-finished').hidden = !end;
    return end;
  }

  function follow(smooth) {
    const caret = document.getElementById('caret');
    if (!caret) return;
    const r = caret.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top < vh * 0.25 || r.bottom > vh * 0.6) {
      window.scrollBy({ top: r.top - vh * 0.4, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  function miss() {
    state.errors++;
    const caret = document.getElementById('caret');
    if (!caret) return;
    caret.classList.remove('miss');
    void caret.offsetWidth; // restart the animation
    caret.classList.add('miss');
  }

  function type(c) {
    if (state.para >= paras.length) return;
    const now = Date.now();
    if (lastKey) state.ms += Math.min(now - lastKey, IDLE);
    lastKey = now;
    const p = paras[state.para];
    if (state.pos >= p.text.length) {
      // End of a paragraph: Space or Enter moves on.
      if (c === ' ' || c === '\n') {
        state.para++; state.pos = 0;
        drawPara(state.para - 1); drawPara(state.para);
        finished();
      }
    } else {
      const want = p.text[state.pos];
      // "--" for an em dash: the second hyphen is not a mistake.
      if (afterDash && c === '-' && want !== '-') { afterDash = false; return; }
      state.keys++;
      if (matches(want, c)) {
        afterDash = '—–'.includes(want);
        state.pos++;
        drawPara(state.para);
      } else {
        afterDash = false;
        miss();
      }
    }
    stats();
    follow(true);
    save();
  }

  // A hidden textarea takes the keys, so phone keyboards and IMEs work too.
  input.addEventListener('input', () => {
    const v = input.value;
    input.value = '';
    for (const c of v) type(c);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); type('\n'); }
    if (e.key === 'Tab') return;
    if (e.key === 'Backspace') e.preventDefault(); // nothing wrong is ever kept
  });
  const focus = () => input.focus({ preventScroll: true });
  textEl.addEventListener('click', focus);
  document.addEventListener('keydown', e => {
    if (document.activeElement !== input && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey &&
        !/input|textarea|select|button|a/i.test(document.activeElement.tagName)) focus();
  });
  input.addEventListener('focus', () => document.body.classList.add('type-focus'));
  input.addEventListener('blur', () => document.body.classList.remove('type-focus'));

  document.getElementById('restart').addEventListener('click', () => {
    Object.assign(state, { para: 0, pos: 0, keys: 0, errors: 0, ms: 0 });
    lastKey = 0;
    save();
    drawAll();
    window.scrollTo({ top: 0 });
    focus();
  });

  (async function () {
    const path = 'texts/' + bookId + '/ch' + String(ch).padStart(2, '0') + '.txt';
    let raw = null;
    for (const p of [path, '../' + path]) {
      try { const r = await fetch(p, { cache: 'no-cache' }); if (r.ok) { raw = await r.text(); break; } } catch (e) { /* next */ }
    }
    if (raw === null) { textEl.innerHTML = '<p class="status">Could not load the text for this ' + book.unit.toLowerCase() + '.</p>'; return; }
    paras = parse(raw);
    total = paras.reduce((n, p) => n + p.text.length, 0);
    load();
    drawAll();
    focus();
    if (state.para || state.pos) follow(false);
  })();
})();
