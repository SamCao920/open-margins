// Reader preferences (theme, font, size, width, notes), shared by every page.
// Loaded in <head> so the saved theme and font apply before first paint.
(function () {
  'use strict';

  const KEY = 'scholia.prefs';
  const FONTS = {
    oldstandard: '"Old Standard", "Century Schoolbook", "New Century Schoolbook", Georgia, serif',
    garamond: '"EB Garamond", Garamond, "Iowan Old Style", Georgia, serif',
    georgia: 'Georgia, "Times New Roman", serif',
    palatino: '"Palatino Linotype", Palatino, "Book Antiqua", "URW Palladio L", serif',
    charter: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };
  // Line length is in ems of the text size, so the column grows with the type.
  const DEFAULTS = { theme: 'auto', font: 'oldstandard', size: 100, width: 36, notes: 'approach' };
  const SIZE_MIN = 80, SIZE_MAX = 150;
  const WIDTH_MIN = 26, WIDTH_MAX = 46;
  const ALLOWED = {
    theme: ['auto', 'light', 'dark'],
    font: Object.keys(FONTS),
    notes: ['approach', 'always'],
  };

  function load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { /* ignore */ }
    const p = Object.assign({}, DEFAULTS);
    Object.keys(ALLOWED).forEach(k => { if (ALLOWED[k].includes(saved[k])) p[k] = saved[k]; });
    const size = Number(saved.size);
    if (size >= SIZE_MIN && size <= SIZE_MAX) p.size = size;
    const width = Number(saved.width);
    if (width >= WIDTH_MIN && width <= WIDTH_MAX) p.width = width;
    return p;
  }

  const prefs = load();
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function effectiveTheme() {
    return prefs.theme === 'auto' ? (darkQuery.matches ? 'dark' : 'light') : prefs.theme;
  }

  function apply() {
    const root = document.documentElement;
    if (prefs.theme === 'auto') root.removeAttribute('data-theme');
    else root.dataset.theme = prefs.theme;
    root.style.setProperty('--font', FONTS[prefs.font]);
    root.style.setProperty('--scale', String(prefs.size / 100));
    root.style.setProperty('--measure', prefs.width + 'em');
    root.dataset.notes = prefs.notes;
  }

  function set(key, value) {
    prefs[key] = value;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
    apply();
    syncControls();
    document.dispatchEvent(new CustomEvent('scholia:prefs', { detail: { key } }));
  }

  // ----- Controls: any page can include these and they wire themselves -----
  function syncControls() {
    document.querySelectorAll('input[type=radio][data-pref]').forEach(r => {
      r.checked = prefs[r.dataset.pref] === r.value;
    });
    document.querySelectorAll('select[data-pref]').forEach(s => { s.value = prefs[s.dataset.pref]; });
    document.querySelectorAll('[data-size-out]').forEach(o => { o.textContent = prefs.size + '%'; });
    document.querySelectorAll('input[type=range][data-pref]').forEach(r => { r.value = prefs[r.dataset.pref]; });
    document.querySelectorAll('[data-size-step]').forEach(b => {
      const step = Number(b.dataset.sizeStep);
      b.disabled = step < 0 ? prefs.size <= SIZE_MIN : prefs.size >= SIZE_MAX;
    });
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
      b.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    });
  }

  function wire() {
    document.querySelectorAll('input[type=radio][data-pref]').forEach(r => {
      r.addEventListener('change', () => { if (r.checked) set(r.dataset.pref, r.value); });
    });
    document.querySelectorAll('select[data-pref]').forEach(s => {
      s.addEventListener('change', () => set(s.dataset.pref, s.value));
    });
    document.querySelectorAll('input[type=range][data-pref]').forEach(r => {
      r.min = WIDTH_MIN;
      r.max = WIDTH_MAX;
      r.addEventListener('input', () => set(r.dataset.pref, Number(r.value)));
    });
    document.querySelectorAll('[data-size-step]').forEach(b => {
      b.addEventListener('click', () => {
        const v = prefs.size + Number(b.dataset.sizeStep);
        set('size', Math.min(SIZE_MAX, Math.max(SIZE_MIN, v)));
      });
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.addEventListener('click', () => set('theme', effectiveTheme() === 'dark' ? 'light' : 'dark'));
    });
    document.querySelectorAll('[data-prefs-reset]').forEach(b => {
      b.addEventListener('click', () => {
        Object.assign(prefs, DEFAULTS);
        set('theme', DEFAULTS.theme);
      });
    });
    // Close the settings popover when clicking outside it or pressing Escape.
    document.addEventListener('click', e => {
      document.querySelectorAll('details.settings[open]').forEach(d => {
        if (!d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('details.settings[open]').forEach(d => { d.open = false; });
    });
    darkQuery.addEventListener('change', syncControls);
    syncControls();
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  window.Scholia = { prefs, set };
})();
