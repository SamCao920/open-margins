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

  // Coverflow: covers on a scroll-snap track, tilted and scaled by distance
  // from the centre so the row reads as a turning drum.
  function renderFlow(root) {
    const ids = Object.keys(BOOKS);
    const track = root.querySelector('.flow-track');
    const cap = root.querySelector('.flow-caption');
    track.innerHTML = ids.map(id => '<li class="flow-item" data-id="' + id + '"><a class="cover flow-cover" href="book.html?book=' + id + '" style="--cloth:' + BOOKS[id].cloth + '" aria-label="' + esc(BOOKS[id].title) + '">' + coverHTML(BOOKS[id]) + '</a></li>').join('');
    const items = Array.from(track.children);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = -1, raf = 0;

    function update() {
      raf = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((it, i) => {
        const w = it.offsetWidth || 1;
        const d = (it.offsetLeft + w / 2 - mid) / w;
        const c = Math.max(-3, Math.min(3, d));
        it.style.setProperty('--d', c.toFixed(3));
        it.style.setProperty('--a', Math.abs(c).toFixed(3));
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      });
      if (best !== current) {
        current = best;
        const id = items[best].dataset.id, b = BOOKS[id];
        items.forEach((it, i) => it.classList.toggle('is-center', i === best));
        cap.innerHTML = '<a class="flow-title" href="book.html?book=' + id + '">' + esc(b.title) + '</a>' +
          '<span class="flow-by">' + esc(b.author) + ', ' + b.year + '</span>' +
          '<span class="flow-blurb">' + esc(b.blurb) + '</span>';
      }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);

    function goTo(i) {
      i = Math.max(0, Math.min(items.length - 1, i));
      const it = items[i];
      track.scrollTo({ left: it.offsetLeft + it.offsetWidth / 2 - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
    // A tilted side cover scrolls to the centre first; the centred one opens.
    track.addEventListener('click', e => {
      const it = e.target.closest('.flow-item');
      if (it && !it.classList.contains('is-center')) { e.preventDefault(); goTo(items.indexOf(it)); }
    });
    root.querySelector('.flow-prev').addEventListener('click', () => goTo(current - 1));
    root.querySelector('.flow-next').addEventListener('click', () => goTo(current + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    });
    // Start on the book last read, else the first.
    const l = lastRead();
    const start = l ? Math.max(0, ids.indexOf(l.book)) : 0;
    track.scrollLeft = items[start].offsetLeft + items[start].offsetWidth / 2 - track.clientWidth / 2;
    update();
    requestAnimationFrame(() => { track.scrollLeft = items[start].offsetLeft + items[start].offsetWidth / 2 - track.clientWidth / 2; update(); });
  }

  window.OMLIB = { coverHTML, lastRead, renderGrid, renderShelf, renderFlow };
})();
