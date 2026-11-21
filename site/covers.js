// Cover plates: a full-bleed printed illustration over a title band, in the
// manner of a Victorian publisher's pictorial wrapper. Flat inks, halftone
// dots, and hatching. Each entry gives the plate (SVG, 100 x 112 units) and
// the paper and ink colours of the title band.
window.OMCOVERS = (function () {
  const f = n => (Math.round(n * 100) / 100).toString();
  const svg = (id, body) => '<svg viewBox="0 0 100 112" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<pattern id="dt-' + id + '" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".62"/></pattern>' +
    '<pattern id="hx-' + id + '" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0H2.2" stroke-width=".55" stroke="currentColor"/></pattern>' +
    '<linearGradient id="fa-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
    '<linearGradient id="fb-' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
    '<mask id="ma-' + id + '"><rect width="100" height="112" fill="url(#fa-' + id + ')"/></mask>' +
    '<mask id="mb-' + id + '"><rect width="100" height="112" fill="url(#fb-' + id + ')"/></mask>' +
    '</defs>' + body + '</svg>';
  const R = (x, y, w, h, fill, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>';
  const C = (x, y, r, fill, extra) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  const P = (d, fill, extra) => '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>';
  const L = (d, stroke, w, extra) => '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  // Halftone shading: dots of one colour over a region, fading with a gradient mask.
  const dots = (id, color, shape, mask) => '<g fill="' + color + '" mask="url(#' + (mask || 'ma') + '-' + id + ')">' + '<g style="fill:' + color + '">' + shape.replace('{fill}', 'url(#dt-' + id + ')') + '</g></g>';
  const star = (x, y, r, fill) => P('M' + x + ' ' + (y - r) + ' L' + f(x + r * .24) + ' ' + f(y - r * .24) + ' L' + (x + r) + ' ' + y + ' L' + f(x + r * .24) + ' ' + f(y + r * .24) + ' L' + x + ' ' + (y + r) + ' L' + f(x - r * .24) + ' ' + f(y + r * .24) + ' L' + (x - r) + ' ' + y + ' L' + f(x - r * .24) + ' ' + f(y - r * .24) + ' Z', fill);
  // A scalloped band of sea from y down to the bottom.
  const sea = (y, amp, len, phase, fill, crest) => {
    let d = 'M-10 ' + y;
    for (let x = -10 + phase; x < 115; x += len) d += ' q' + f(len / 2) + ' ' + (-amp * 2) + ' ' + len + ' 0';
    d += ' V120 H-10 Z';
    return P(d, fill) + (crest ? L(d.split(' V120')[0].replace('M-10 ' + y, 'M-10 ' + y), crest, .7) : '');
  };

  const out = {};

  // LORD JIM: a leap beneath a great moon and the Southern Cross.
  out['lord-jim'] = { paper: '#efe3c3', ink: '#17413f', svg: svg('lj',
    R(0, 0, 100, 112, '#17413f') +
    C(68, 36, 25, '#12302f') + C(68, 36, 21, '#efe3c3') +
    '<g fill="#17413f" fill-opacity=".16"><circle cx="60" cy="30" r="4.5"/><circle cx="76" cy="44" r="3.4"/><circle cx="72" cy="26" r="2.2"/><circle cx="58" cy="46" r="2.6"/></g>' +
    '<g mask="url(#mb-lj)"><rect x="47" y="15" width="42" height="42" fill="url(#dt-lj)" style="fill:#17413f" opacity=".55"/></g>' +
    star(14, 14, 4.6, '#efe3c3') + star(24, 30, 4.2, '#efe3c3') + star(12, 44, 4.6, '#efe3c3') + star(3.5, 28, 3.6, '#efe3c3') + star(30, 52, 2, '#efe3c3') + star(40, 10, 1.6, '#efe3c3') + star(92, 70, 1.6, '#efe3c3') +
    L('M44 6 C32 12 26 28 30 40', '#efe3c3', .9, ' stroke-dasharray="1.2 3.4"') +
    sea(66, 2.2, 14, 3, '#1f5a55', '#efe3c3') + sea(74, 2.4, 16, -2, '#2b6f68', '#efe3c3') + sea(83, 2.6, 18, 6, '#123a38', '#efe3c3') + sea(93, 2.8, 20, -4, '#1f5a55', '#efe3c3') + sea(103, 3, 22, 4, '#0f2f2d', '#efe3c3') +
    '<g stroke="#e0662b" stroke-width="4" stroke-linecap="round" fill="none">' +
    '<path d="M37 52 C38 59 38 65 35 71"/><path d="M37 55 L27 44" stroke-width="3"/><path d="M37 55 L47 47" stroke-width="3"/><path d="M35 71 L28 82" stroke-width="3.4"/><path d="M35 71 L38 82" stroke-width="3.4"/></g>' +
    C(37, 46, 4.6, '#e0662b') +
    '<g stroke="#efe3c3" stroke-width="1" fill="none"><path d="M24 84 q-3 -5 -1 -8 M31 85 q0 -7 2 -9 M40 85 q3 -5 5 -7"/></g>') };

  // HEART OF DARKNESS: a black sun, widening rings, a river, and the palms.
  (function () {
    const frond = (x, y, a, s, fill) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + s + ')">' + P('M0 0 C8 -9 22 -10 34 1 C24 -4 10 -4 0 0 Z', fill) + '</g>';
    const palm = (x, y, top, fills, dir) => {
      let g = L('M' + x + ' ' + y + ' C' + (x + dir * 3) + ' ' + (y - 24) + ' ' + (x - dir * 2) + ' ' + (top + 22) + ' ' + (x + dir * 4) + ' ' + top, fills, 2.6);
      [[-170, 1], [-135, 1.05], [-100, .85], [-60, 1], [-20, 1.05], [15, .95], [160, .9], [125, .8]].forEach(a => { g += frond(x + dir * 4, top, a[0], a[1] * .9, fills); });
      return g;
    };
    let rings = '';
    for (let i = 0; i < 9; i++) rings += C(50, 44, 24 + i * 5 + i * i * .3, 'none', ' stroke="#14100c" stroke-width="' + f(.5 + i * .12) + '" opacity="' + f(.9 - i * .08) + '"');
    out['heart-of-darkness'] = { paper: '#e8d3a1', ink: '#2b1a10', svg: svg('hd',
      R(0, 0, 100, 112, '#d49a37') + R(0, 0, 100, 30, '#c58a2b') +
      '<g mask="url(#ma-hd)"><rect width="100" height="70" fill="url(#dt-hd)" style="fill:#7a4a14" opacity=".5"/></g>' +
      rings + C(50, 44, 21, '#14100c') + C(50, 44, 14, 'none', ' stroke="#d49a37" stroke-width=".8" opacity=".7"') +
      R(0, 66, 100, 46, '#e0b862') +
      P('M0 62 H100 V112 H0 Z', '#2c4a2c') +
      P('M40 112 C48 100 36 92 46 82 C51 77 49 70 50 64 C51 70 52 77 55 82 C64 92 52 100 60 112 Z', '#e9cf8a') +
      P('M0 70 C12 76 24 82 38 112 H0 Z', '#1c3320') + P('M100 70 C88 76 76 82 62 112 H100 Z', '#1c3320') +
      palm(12, 112, 52, '#14100c', 1) + palm(90, 112, 48, '#14100c', -1)) };
  })();

  // THE DEATH OF IVAN ILYICH: a candle and its widening halo of rings.
  (function () {
    let halo = '';
    for (let i = 0; i < 9; i++) halo += C(50, 40, 10 + i * 6, 'none', ' stroke="#3b5287" stroke-width="' + f(.7 + (i % 2) * .5) + '"');
    let st = '';
    [[12, 12], [86, 18], [20, 60], [90, 54], [8, 36], [76, 8], [30, 22]].forEach(p => { st += C(p[0], p[1], .8, '#efe3c3'); });
    out['ivan-ilyich'] = { paper: '#e9dec0', ink: '#1d2a49', svg: svg('ii',
      R(0, 0, 100, 112, '#1d2a49') + halo + st +
      '<g mask="url(#ma-ii)"><rect y="30" width="100" height="82" fill="url(#dt-ii)" style="fill:#3b5287" opacity=".7"/></g>' +
      C(50, 40, 8, '#f2b632', ' opacity=".28"') + C(50, 40, 5, '#f2b632', ' opacity=".4"') +
      P('M50 18 C58 30 60 40 50 47 C40 40 42 30 50 18 Z', '#f2b632') + P('M50 30 C54 36 54 41 50 45 C46 41 46 36 50 30 Z', '#fff4cf') +
      L('M50 47 V56', '#14100c', 1.4) +
      R(41, 56, 18, 38, '#efe3c3') + R(52, 56, 7, 38, '#cdbd8c') + P('M41 56 q9 -3 18 0 q-9 3 -18 0 Z', '#d9c996') +
      P('M41 62 c-3 3 0 8 -2 12 c3 2 4 -4 2 -7 Z M59 66 c3 3 1 7 3 11 c-4 1 -4 -6 -3 -11 Z', '#efe3c3') +
      P('M30 94 H70 Q66 104 50 104 Q34 104 30 94 Z', '#b8862e') + R(28, 92, 44, 3.6, '#d9a640') + R(0, 104, 100, 8, '#12192e') +
      L('M12 104 H88', '#3b5287', .6)) };
  })();

  // BARTLEBY: a wall of brick, one barred window, and a quill.
  (function () {
    let bricks = '';
    const tones = ['#b04a30', '#9c3c27', '#a8432d', '#b85537'];
    for (let r = 0; r < 14; r++) {
      const off = r % 2 ? -7 : 0;
      for (let c = 0; c < 8; c++) bricks += R(f(c * 14 + off), f(r * 8), 13, 7, tones[(r * 3 + c * 5) % 4]);
    }
    out['bartleby'] = { paper: '#ecdfc0', ink: '#5a1d10', svg: svg('bb',
      R(0, 0, 100, 112, '#6e2517') + bricks +
      '<g mask="url(#ma-bb)"><rect width="100" height="112" fill="url(#dt-bb)" style="fill:#3a110a" opacity=".75" transform="scale(1 1)"/></g>' +
      R(38, 20, 24, 40, '#2a0f08') + P('M38 60 V34 a12 12 0 0 1 24 0 V60 Z', '#17100d', ' stroke="#efe3c3" stroke-width="2"') +
      L('M50 22 V60 M38 40 H62 M38 50 H62', '#efe3c3', 1.4) +
      P('M38 60 H62 L66 66 H34 Z', '#d8c9a2') +
      P('M8 106 L12 96 L18 102 Z', '#17100d') +
      L('M12 100 L84 48', '#efe3c3', 2.4) +
      P('M30 88 C40 70 62 52 94 40 C90 56 78 74 56 82 C50 84 38 88 30 88 Z', '#efe3c3') +
      L('M30 88 L94 40', '#5a1d10', 1) +
      L('M40 82 L44 74 M48 78 L54 68 M56 74 L64 62 M64 68 L74 56 M72 62 L84 50 M44 84 L52 82 M54 80 L64 76 M64 74 L76 68 M74 66 L86 56', '#5a1d10', .7)) };
  })();

  // SIDDHARTHA: a sun of many rings over the river, a ferry, a lotus.
  (function () {
    let rings = '';
    for (let i = 0; i < 7; i++) rings += C(50, 46, 27 + i * 5.5, 'none', ' stroke="' + (i % 2 ? '#f2b33c' : '#e9843a') + '" stroke-width="' + f(1.6 - i * .15) + '"');
    let rays = '';
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; rays += '<path d="M' + f(50 + Math.cos(a) * 20) + ' ' + f(46 + Math.sin(a) * 20) + ' L' + f(50 + Math.cos(a) * 26) + ' ' + f(46 + Math.sin(a) * 26) + '" stroke="#c9692a" stroke-width="1.2" stroke-linecap="round"/>'; }
    out['siddhartha'] = { paper: '#f0e0b8', ink: '#6a2f0d', svg: svg('sd',
      R(0, 0, 100, 112, '#c9692a') + rings +
      C(50, 46, 26, '#f2b33c') + C(50, 46, 20, '#f7c75a') + rays + C(50, 46, 12, '#fbe4a0') +
      '<g mask="url(#ma-sd)"><rect width="100" height="70" fill="url(#dt-sd)" style="fill:#a8481b" opacity=".55"/></g>' +
      sea(70, 2.2, 14, 2, '#1e5a5a', '#f0e0b8') + sea(79, 2.4, 16, -3, '#12403f', '#f0e0b8') + sea(89, 2.6, 18, 5, '#1e5a5a', '#f0e0b8') + sea(100, 2.8, 20, -2, '#0f3534', '#f0e0b8') +
      P('M26 70 H72 L66 79 H33 Z', '#1a1410') + L('M64 72 L80 44', '#1a1410', 1.6) + P('M80 44 L86 52 L78 50 Z', '#1a1410') +
      C(44, 56, 2.4, '#1a1410') + L('M44 58 V70', '#1a1410', 3) +
      P('M18 100 C8 96 8 84 18 78 C28 84 28 96 18 100 Z', '#f0dcc4', ' stroke="#6a2f0d" stroke-width=".8"') +
      P('M18 100 C6 100 2 90 6 82 C14 84 18 92 18 100 Z M18 100 C30 100 34 90 30 82 C22 84 18 92 18 100 Z', '#e6c4ae', ' stroke="#6a2f0d" stroke-width=".8"') +
      L('M18 100 V84', '#6a2f0d', .6, ' opacity=".6"')) };
  })();

  // THE ROMANTIC POETS: a nightingale under a crescent moon.
  (function () {
    let hills = '';
    hills += P('M0 82 C20 70 36 84 54 74 C72 64 88 78 100 70 V112 H0 Z', '#1d3a29');
    hills += P('M0 94 C24 84 40 96 60 88 C80 80 90 92 100 86 V112 H0 Z', '#14291c');
    out['romantic-poets'] = { paper: '#ecdfbf', ink: '#1d3a29', svg: svg('rp',
      R(0, 0, 100, 112, '#2a4a35') +
      '<g mask="url(#ma-rp)"><rect width="100" height="90" fill="url(#dt-rp)" style="fill:#3f6b4c" opacity=".8"/></g>' +
      P('M72 8 a28 28 0 1 0 8 52 a22 22 0 1 1 -8 -52 Z', '#efe3c3') +
      '<g mask="url(#mb-rp)"><path d="M72 8 a28 28 0 1 0 8 52 a22 22 0 1 1 -8 -52 Z" fill="url(#dt-rp)" style="fill:#2a4a35" opacity=".45"/></g>' +
      star(14, 14, 3.4, '#efe3c3') + star(34, 8, 2, '#efe3c3') + star(90, 62, 2.2, '#efe3c3') + star(8, 40, 2.2, '#efe3c3') + star(44, 26, 1.6, '#efe3c3') +
      hills +
      L('M-4 72 C20 66 40 78 66 66 S92 60 104 54', '#14100c', 3.2) +
      '<g fill="#5a8a4a">' + P('M14 70 q2 -12 14 -12 q0 11 -14 12 Z', '#5a8a4a') + P('M78 62 q4 -11 16 -9 q-2 10 -16 9 Z', '#5a8a4a') + P('M52 72 q6 8 16 4 q-6 -9 -16 -4 Z', '#4a7a3c') + '</g>' +
      C(88, 58, 2.2, '#e8a0a0') + C(92, 56, 2, '#f0b8b0') + C(84, 55, 2, '#e8a0a0') + C(22, 60, 2, '#e8a0a0') + C(26, 58, 1.8, '#f0b8b0') +
      P('M30 54 C32 40 48 36 58 46 C62 52 60 62 52 66 L38 66 C32 64 30 60 30 54 Z', '#d9b57a') +
      P('M34 56 C36 48 46 46 52 52 C48 58 40 62 34 56 Z', '#8c5b2e') + P('M30 54 C31 58 34 63 38 66 L48 66 C40 64 34 60 31 54 Z', '#f1dfb4') +
      P('M58 56 L86 66 L84 70 L56 64 Z', '#8c5b2e') +
      C(38, 42, 7, '#d9b57a') + C(36, 40.5, 1.5, '#17100d') + P('M32 42 L22 44 L32 46 Z', '#17100d') +
      L('M22 26 a10 10 0 0 0 0 14 M14 20 a18 18 0 0 0 0 26', '#efe3c3', 1, ' stroke-dasharray="1 2.4"') +
      C(10, 10, 2.2, '#efe3c3') + L('M12 10 V1 q5 1 6 5', '#efe3c3', 1.3) +
      C(28, 12, 2.2, '#efe3c3') + L('M30 12 V3 q5 1 6 5', '#efe3c3', 1.3)) };
  })();

  // BILLY BUDD, SAILOR: a seventy-four under all sail.
  (function () {
    let hatch = '';
    for (let y = 8; y < 60; y += 4) hatch += '<path d="M0 ' + y + ' H100" stroke="#41687f" stroke-width="' + f(.35 + (y / 60) * .9) + '"/>';
    const sail = (x, y, w, h) => P('M' + x + ' ' + y + ' H' + (x + w) + ' V' + (y + h) + ' Q' + f(x + w / 2) + ' ' + (y + h + 5) + ' ' + x + ' ' + (y + h) + ' Z', '#efe3c3') +
      '<path d="M' + x + ' ' + y + ' H' + (x + w) + ' V' + (y + h) + ' Q' + f(x + w / 2) + ' ' + (y + h + 5) + ' ' + x + ' ' + (y + h) + ' Z" fill="none" stroke="#17100d" stroke-width=".8"/>' +
      '<path d="M' + f(x + w / 2) + ' ' + y + ' V' + f(y + h + 2.5) + '" stroke="#b9a874" stroke-width=".6"/>';
    let ports = '';
    for (let x = 22; x < 80; x += 6) ports += R(x, 74, 3, 2.2, '#efe3c3') + R(x, 80, 3, 2.2, '#efe3c3');
    out['billy-budd'] = { paper: '#e6dcc0', ink: '#1f3a4b', svg: svg('bd',
      R(0, 0, 100, 112, '#2f4f63') + hatch +
      C(14, 14, 7, '#f0c26a', ' opacity=".9"') +
      L('M33 72 V16 M52 72 V6 M71 72 V20', '#17100d', 1.8) +
      sail(42, 14, 20, 22) + sail(40, 40, 24, 24) + sail(62, 22, 18, 18) + sail(60, 44, 22, 20) + sail(24, 28, 18, 18) + sail(22, 48, 22, 18) +
      P('M52 6 L66 10 L52 14 Z', '#c8362c') +
      P('M14 72 H88 L80 92 H24 Z', '#17100d') + R(16, 72, 70, 3, '#e7b83c') + ports + P('M88 72 L99 66 L97 70 L90 76 Z', '#17100d') +
      sea(88, 2.4, 14, 3, '#1f3a4b', '#efe3c3') + sea(96, 2.6, 16, -2, '#162c3a', '#efe3c3') + sea(105, 2.8, 18, 5, '#0f2230', '#efe3c3')) };
  })();

  return out;
})();
