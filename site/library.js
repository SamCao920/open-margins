// Shared by the home shelf and the library page. Reads window.OMBOOKS.
(function () {
  'use strict';
  const BOOKS = window.OMBOOKS;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function coverHTML(b) {
    const cls = b.coverClass ? ' ' + b.coverClass : b.title.length > 20 ? ' xlong' : b.title.length > 10 ? ' long' : '';
    return '<span class="cover-frame"><span class="cover-title' + cls + '">' + (b.coverTitle || esc(b.title).replace(/ of /, ' of<br>')) +
      '</span><span class="cover-rule"></span><span class="cover-sub">' + esc(b.sub) + '</span><span class="cover-author">' + esc(b.author) +
      '</span><span class="logo"></span></span>';
  }

  // Last place read, written by reader.js.
  function lastRead() {
    try {
      const l = JSON.parse(localStorage.getItem('scholia.last'));
      if (l && BOOKS[l.book] && l.ch >= 1 && l.ch <= BOOKS[l.book].chapters) return l;
    } catch (e) { /* ignore */ }
    return null;
  }

  function renderGrid(el, filter) {
    const ids = Object.keys(BOOKS).filter(id => !filter || filter === 'all' || BOOKS[id].form === filter || (filter === 'Prose' && BOOKS[id].form !== 'Poetry'));
    el.innerHTML = ids.map(id => {
      const b = BOOKS[id];
      return '<li class="lib-item"><a class="lib-link" href="book.html?book=' + id + '">' +
        '<span class="cover" style="--cloth:' + b.cloth + '" aria-hidden="true">' + coverHTML(b) + '</span>' +
        '<span class="lib-name">' + esc(b.title) + '</span>' +
        '<span class="lib-by">' + esc(b.author) + ', ' + b.year + '</span>' +
        '<span class="lib-meta">' + esc(b.form) + ' · ' + b.chapters + ' ' + b.unit.toLowerCase() + 's · ' + b.notes.toLocaleString('en-US') + ' notes</span>' +
        '</a></li>';
    }).join('');
  }

  // Spines: height and width vary a little with the book, deterministically.
  function renderShelf(el) {
    const ids = Object.keys(BOOKS);
    el.innerHTML = ids.map((id, i) => {
      const b = BOOKS[id];
      const h = 19 + ((b.title.length * 7 + i * 3) % 5) * .6;
      const w = 3.3 + Math.min(b.chapters, 45) / 45 * 1.2;
      return '<li class="spine-item"><a class="spine" href="book.html?book=' + id + '" style="--cloth:' + b.cloth + ';--h:' + h.toFixed(2) + 'em;--w:' + w.toFixed(2) + 'em" aria-label="' + esc(b.title) + ', ' + esc(b.author) + '">' +
        '<span class="spine-band"></span><span class="spine-title">' + esc(b.title.split(',')[0]) + '</span><span class="spine-band"></span><span class="spine-author">' + esc(b.author.replace(', ed.', '')) + '</span></a></li>';
    }).join('');
  }

  window.OMLIB = { coverHTML, lastRead, renderGrid, renderShelf };
})();
