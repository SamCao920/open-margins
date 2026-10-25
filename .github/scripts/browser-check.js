// Renders the home page in WebKit and Firefox and prints layout metrics,
// so layout bugs in browsers other than Chromium can be diagnosed.
const { webkit, firefox, chromium } = require('playwright');
(async () => {
  for (const [name, type] of [['webkit', webkit], ['firefox', firefox], ['chromium', chromium]]) {
    const browser = await type.launch();
    for (const width of [1280, 1440, 2000]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.goto('http://localhost:8000/site/index.html');
      await page.waitForTimeout(800);
      const m = await page.evaluate(() => {
        const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
          return { x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height), sw: e.scrollWidth, ws: cs.whiteSpace, tw: cs.textWrap || cs.textWrapMode, disp: cs.display, flex: cs.flex, maxw: cs.maxWidth }; };
        return { doc: document.documentElement.scrollWidth, ua: navigator.userAgent.slice(-40),
          spread: r('.spread'), plate: r('.plate-front'), title: r('.title-page'), lede: r('.title-page .lede'), cover: r('.cover-title'), folioP: r('.folio p') };
      });
      console.log(name, width, JSON.stringify(m));
      await page.screenshot({ path: `shots/${name}-${width}.png` });
      await page.close();
    }
    await browser.close();
  }
})();
