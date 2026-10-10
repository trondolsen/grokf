const { test: base, expect } = require('@playwright/test');

const { explorerUrl: explorer, basicBundleUrl: bundle, fixtureUrl, baseURL } = require('../support/paths.cjs');

const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
        errors.push(message.text());
      }
    });

    // Styr animasjonsrammene, slik at grafen ikke flytter seg mellom avlesning og klikk.
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T12:00:01Z'));
    await page.addInitScript(() => {
      // Les faktiske tegnekall uten å eksportere intern tilstand fra produksjonskoden.
      window.graphLabels = Object.create(null);
      const prototype = CanvasRenderingContext2D.prototype;
      const clearRect = prototype.clearRect;
      const arc = prototype.arc;
      const fillText = prototype.fillText;
      let point;
      prototype.clearRect = function (...args) {
        if (this.canvas.id === 'c') window.graphLabels = Object.create(null);
        return clearRect.apply(this, args);
      };
      prototype.arc = function (x, y, ...args) {
        if (this.canvas.id === 'c') point = { x, y };
        return arc.call(this, x, y, ...args);
      };
      prototype.fillText = function (text, ...args) {
        if (this.canvas.id === 'c' && point) {
          window.graphLabels[text] = { ...point, alpha: this.globalAlpha };
        }
        return fillText.call(this, text, ...args);
      };
    });

    await use(page);
    if (errors.length) {
      await testInfo.attach('browser-errors', {
        body: Buffer.from(JSON.stringify(errors, null, 2)),
        contentType: 'application/json',
      });
    }
    expect(errors, 'Nettleseren skal ikke ha JavaScript-feil').toEqual([]);
  },
});

async function loadBundle(page, depth = 'all') {
  await page.goto(`${explorer}?bundle=${encodeURIComponent(bundle)}&depth=${depth}`);
  await expect(page.locator('#overlay')).not.toHaveClass(/\bshow\b/);
  await expect(page.locator('#spinner')).toBeHidden();
  await expect(page.locator('#stats')).toContainText('files');
  // The viewer opens on the About panel and keeps it until the user interacts;
  // dismiss it so each test can drive the graph and panels unobstructed.
  await page.keyboard.press('Escape');
  await expect(page.locator('#aboutPop')).toBeHidden();
}

async function renderedLabels(page) {
  await page.clock.runFor(32);
  return page.evaluate(() => window.graphLabels);
}

async function clickNode(page, label, doubleClick = false) {
  await page.clock.runFor(2000);
  const point = await page.evaluate(label => window.graphLabels[label], label);
  expect(point, `Fant ikke den tegnede noden «${label}»`).toBeTruthy();
  const canvas = await page.locator('#c').boundingBox();
  expect(canvas).not.toBeNull();
  const x = canvas.x + point.x;
  const y = canvas.y + point.y;
  expect(x).toBeGreaterThan(0);
  expect(x).toBeLessThan(page.viewportSize().width);
  expect(y).toBeGreaterThan(0);
  expect(y).toBeLessThan(page.viewportSize().height);
  if (doubleClick) await page.mouse.dblclick(x, y);
  else await page.mouse.click(x, y);
}

test('laster testpakken med tre filer og tre lenker', async ({ page }) => {
  await loadBundle(page);
  await expect(page.locator('#stats')).toHaveText('3 files · 3 links');
  await expect(page.locator('#graphPath')).toHaveText('/');
  await expect(page.locator('#graphBack')).toBeDisabled();
  await expect(page.locator('#graphFwd')).toBeDisabled();
  await expect(page.locator('#legendBody')).toContainText('Guide');
  await expect(page.locator('#legendBody')).toContainText('Reference');
});

test('søker i valgt felt og demper noder som ikke passer', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#searchField').selectOption('title');
  await page.locator('#search').fill('Veiledning');
  let labels = await renderedLabels(page);
  expect(labels.Veiledning.alpha).toBeGreaterThan(0.9);
  expect(labels.Referanse.alpha).toBeLessThanOrEqual(0.2);
  await expect(page.locator('#filterSummary')).toHaveText('search');

  await page.locator('#searchField').selectOption('path');
  await page.locator('#search').fill('nested/');
  labels = await renderedLabels(page);
  expect(labels.Referanse.alpha).toBeGreaterThan(0.9);
  expect(labels.Veiledning.alpha).toBeLessThanOrEqual(0.2);

  await page.locator('#clearFilters').click();
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#searchField')).toHaveValue('');
  await expect(page.locator('#filterSummary')).toHaveText('');
});

test('typefilter veksler mellom inkludering, ekskludering og fjerning', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#typeOpen').click();
  const option = page.locator('#typeList [data-t="Guide"]');
  await option.click();
  await expect(page.locator('#typeChips .chip')).toHaveClass(/\binc\b/);
  await expect(page.locator('#stats')).toHaveText('1 files · 0 links');
  await option.click();
  await expect(page.locator('#typeChips .chip')).toHaveClass(/\bexc\b/);
  await expect(page.locator('#stats')).toHaveText('2 files · 0 links');
  await option.click();
  await expect(page.locator('#typeChips .chip')).toHaveCount(0);
  await expect(page.locator('#stats')).toHaveText('3 files · 3 links');
});

test('filtrerer på nodetype og status, og nullstiller filtrene', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#kindOpen').click();
  await page.locator('#kindList [data-t="Concept"]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#stats')).toHaveText('2 files · 2 links');
  await page.locator('#statusOpen').click();
  await page.locator('#statusList [data-t="draft"]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#stats')).toHaveText('1 files · 0 links');
  await expect(page.locator('#filterSummary')).toHaveText('2 active');
  await page.locator('#clearFilters').click();
  await expect(page.locator('#kindChips .chip')).toHaveCount(0);
  await expect(page.locator('#statusChips .chip')).toHaveCount(0);
  await expect(page.locator('#stats')).toHaveText('3 files · 3 links');
});

test('emneknagger kan inkluderes, ekskluderes og fjernes som brikker', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#tagOpen').click();
  await page.locator('#tagList [data-t="testing/ui"]').click();
  await page.keyboard.press('Escape');
  const chip = page.locator('#tagChips [data-t="testing/ui"]');
  await expect(chip).toHaveClass(/\binc\b/);
  let labels = await renderedLabels(page);
  expect(labels).toHaveProperty('Veiledning');
  expect(labels).not.toHaveProperty('Referanse');
  await chip.locator('.ct').click();
  await expect(chip).toHaveClass(/\bexc\b/);
  labels = await renderedLabels(page);
  expect(labels).not.toHaveProperty('Veiledning');
  expect(labels).toHaveProperty('Referanse');
  await chip.locator('.cx').click();
  await expect(chip).toHaveCount(0);
  await expect(page.locator('#filterSummary')).toHaveText('');
});

test('slår etiketter og emneknaggnoder av og på', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#labels').click();
  await expect(page.locator('#labels')).toHaveAttribute('aria-pressed', 'false');
  expect(await renderedLabels(page)).toEqual({});
  await page.locator('#labels').click();
  await expect(page.locator('#labels')).toHaveAttribute('aria-pressed', 'true');
  expect(await renderedLabels(page)).toHaveProperty('Veiledning');
  await page.locator('#tags').click();
  await expect(page.locator('#tags')).toHaveAttribute('aria-pressed', 'true');
  expect(await renderedLabels(page)).toHaveProperty('#testing/ui');
  await page.locator('#tags').click();
  await expect(page.locator('#tags')).toHaveAttribute('aria-pressed', 'false');
  expect(await renderedLabels(page)).not.toHaveProperty('#testing/ui');
  await expect(page.locator('#stats')).toHaveText('3 files · 3 links');
});

test('forhåndsviser Markdown og navigerer tilbake og frem', async ({ page }) => {
  await loadBundle(page);
  await clickNode(page, 'Veiledning');
  await expect(page.locator('#preview')).toHaveClass(/\bshow\b/);
  await expect(page.locator('#pvTitle')).toHaveText('Veiledning');
  await expect(page.locator('#pvBack')).toBeDisabled();
  await page.locator('#pvBody').getByRole('link', { name: 'Referanse', exact: true }).click();
  await expect(page.locator('#pvTitle')).toHaveText('Referanse');
  await expect(page.locator('#pvBody table')).toContainText('Nettlesertest');
  await page.locator('#pvBack').click();
  await expect(page.locator('#pvTitle')).toHaveText('Veiledning');
  await page.locator('#pvFwd').click();
  await expect(page.locator('#pvTitle')).toHaveText('Referanse');
  await page.locator('#pvClose').click();
  await expect(page.locator('#preview')).not.toHaveClass(/\bshow\b/);
});

test('navigerer inn i en katalog og bruker grafhistorikken', async ({ page }) => {
  await loadBundle(page);
  await clickNode(page, 'nested/', true);
  await expect(page.locator('#graphPath')).toHaveText('nested/');
  await expect(page.locator('#stats')).toHaveText('1 files · 0 links');
  await page.locator('#graphBack').click();
  await expect(page.locator('#graphPath')).toHaveText('/');
  await page.locator('#graphFwd').click();
  await expect(page.locator('#graphPath')).toHaveText('nested/');
  await page.locator('#graphTop').click();
  await expect(page.locator('#graphPath')).toHaveText('/');
});

test('depth=0 laster neste nivå ved klikk, ikke ved oppstart', async ({ page }) => {
  const paths = [];
  page.on('request', request => paths.push(new URL(request.url()).pathname));
  await loadBundle(page, '0');
  await expect(page.locator('#stats')).toHaveText('1 files · 0 links');
  expect(paths).not.toContain(`${bundle}guide.md`);
  await clickNode(page, 'index.md');
  await expect(page.locator('#stats')).toHaveText('2 files · 1 links');
  expect(paths).not.toContain(`${bundle}nested/reference.md`);
  await clickNode(page, 'Veiledning');
  await expect(page.locator('#stats')).toHaveText('3 files · 3 links');
  await expect(page.locator('#spinner')).toBeHidden();
  await clickNode(page, 'Referanse');
  await expect(page.locator('#pvTitle')).toHaveText('Referanse');
});

test('viser en forståelig melding når pakken mangler', async ({ page }) => {
  await page.goto(`${explorer}?bundle=${encodeURIComponent(`${fixtureUrl}/missing/`)}`);
  await expect(page.locator('#overlay')).toHaveClass(/\bshow\b/);
  await expect(page.locator('#overlayMsg')).toContainText('No bundle');
  await expect(page.locator('#spinner')).toBeHidden();
});

test('avviser en ekstern pakke uten å sende forespørsler til den', async ({ page }) => {
  const externalRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== baseURL) {
      externalRequests.push(request.url());
    }
  });
  await page.goto(`${explorer}?bundle=https://example.invalid/private/`);
  await expect(page.locator('#overlayMsg')).toContainText('Bundle must be a same-origin path');
  await expect(page.locator('#overlay')).toHaveClass(/\bshow\b/);
  expect(externalRequests).toEqual([]);
});

test('viser mobilmeny og filtre ved 390 × 844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadBundle(page);
  await expect(page.locator('#navToggle')).toBeVisible();
  await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#navToggle').click();
  await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#labels')).toBeVisible();
  await page.locator('#navToggle').click();
  await page.locator('#sideHandle').click();
  await expect(page.locator('#sideHandle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#search')).toBeInViewport();
  await page.locator('#search').fill('Veiledning');
  await expect(page.locator('#filterSummary')).toHaveText('search');
  await page.locator('#sideHandle').click();
  await expect(page.locator('#sideHandle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#search')).not.toBeInViewport();
});

test('åpner .runtime fra Om-panelet og oppdaterer siden mens den leses', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#titleBtn').click();
  await expect(page.locator('#aboutPop')).toBeVisible();
  await expect(page.locator('#aboutRuntime')).toBeVisible();
  await expect(page.locator('#aboutRuntime')).toHaveCSS('color', 'rgb(201, 162, 77)');
  const sourceBox = await page.locator('#aboutPop .about-links a').first().boundingBox();
  const runtimeBox = await page.locator('#aboutRuntime').boundingBox();
  expect(runtimeBox.x).toBeGreaterThan(sourceBox.x + sourceBox.width - 1);
  await page.locator('#aboutRuntime').click();
  await expect(page.locator('#aboutPop')).toBeHidden();
  await expect(page.locator('#graphPath')).toHaveText('.runtime/');
  await expect(page.locator('#preview')).toHaveClass(/\bshow\b/);
  await expect(page.locator('#pvPath')).toHaveText('.runtime/index.md');
  await expect(page.locator('#pvTitle')).toHaveText('Runtime');
  await expect(page.locator('#pvBody')).toContainText('Loaded');

  // The performance page reports the browser's own measurements.
  await page.locator('#pvBody').getByRole('link', { name: 'Performance', exact: true }).click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/performance.md');
  await expect(page.locator('#pvBody')).toContainText('CPU threads');
  await expect(page.locator('#pvBody')).toContainText('Frame rate');
  // The trends are vector charts, collected one sample per second.
  await expect(page.locator('#pvBody .pv-charts')).toContainText('Collecting samples');
  await page.clock.runFor(3000);
  await expect(page.locator('#pvBody .pv-charts svg').first()).toBeVisible();
  await expect(page.locator('#pvBody .pv-chart-head').first()).toContainText('Frame rate');
  await page.locator('#pvBack').click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/index.md');

  // The bundle page lists statistics for the URL hosts the files reference.
  await page.locator('#pvBody').getByRole('link', { name: 'Bundle files', exact: true }).click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/bundle.md');
  await expect(page.locator('#pvBody')).toContainText('Domains');
  await expect(page.locator('#pvBody')).toContainText('No external links');
  await page.locator('#pvBack').click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/index.md');

  // Follow a generated link, then watch the page update while it is read.
  await page.locator('#pvBody').getByRole('link', { name: 'Status', exact: true }).click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/status.md');
  await expect(page.locator('#pvBody')).toContainText('Search: (none)');
  await page.locator('#search').fill('guide');
  await expect(page.locator('#pvBody')).toContainText('Search: guide');
});

test('oversetter grensesnittet og støtter høyre-til-venstre', async ({ page }) => {
  // Arabic: chosen from the language dialog, which persists it in the browser (there is
  // no ?lang URL parameter any more). Right-to-left orientation and translated controls.
  await page.goto(`${explorer}?bundle=${encodeURIComponent(bundle)}&depth=all`);
  await expect(page.locator('#overlay')).not.toHaveClass(/\bshow\b/);
  await expect(page.locator('#spinner')).toBeHidden();
  await expect(page.locator('#stats')).toHaveText(/\S/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#aboutPop')).toBeHidden();
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  await page.locator('#langSearch').fill('arabic');
  await page.locator('#langList .lang-row[data-tag="ar"]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#resetView')).toHaveText('إعادة ضبط العرض');
  await expect(page.locator('#search')).toHaveAttribute('placeholder', 'مثال: json, guide, nsm…');
  await expect(page.locator('#stats')).toContainText('ملف');

  // The layout mirrors for right-to-left: the filter sidebar and the toolbar dock to
  // the inline-start edge, and the back/forward chevrons flip.
  const vw = page.viewportSize().width;
  const sideAr = await page.locator('#sidebar').boundingBox();
  expect(sideAr.x).toBeLessThan(48);
  const barAr = await page.locator('.bar').boundingBox();
  expect(barAr.x).toBeGreaterThan(300);
  await expect(page.locator('#graphBack')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#graphFwd')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  // The rotated panel tab sits on-screen on the sidebar's inner edge; because its
  // inline axis is vertical it uses a physical offset, mirrored for RTL.
  const handleAr = await page.locator('#sideHandle').boundingBox();
  expect(handleAr.x + handleAr.width).toBeLessThanOrEqual(vw);

  // Spanish: chosen from the dialog too — left-to-right again, with Spanish plural nouns.
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  await page.locator('#langSearch').fill('spanish');
  await page.locator('#langList .lang-row[data-tag="es"]').first().click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#resetView')).toHaveText('Restablecer vista');
  await expect(page.locator('#stats')).toContainText('archivos');
  await expect(page.locator('#stats')).toContainText('enlaces');

  // Left-to-right: the same panels dock to the opposite (inline-end) edge and the
  // chevrons point the other way.
  const sideEs = await page.locator('#sidebar').boundingBox();
  expect(sideEs.x).toBeGreaterThan(vw - 360);
  const barEs = await page.locator('.bar').boundingBox();
  expect(barEs.x).toBeLessThan(48);
  await expect(page.locator('#graphBack')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const handleEs = await page.locator('#sideHandle').boundingBox();
  expect(handleEs.x).toBeGreaterThanOrEqual(0);

  // The language picker now lives in the About panel: its trigger opens a searchable
  // dialog, and choosing a language flips the interface (and the panel's anchor) in place.
  await expect(page.locator('#sidebar #langOpen')).toHaveCount(0);
  await page.locator('#titleBtn').click();
  await expect(page.locator('#langCurrent')).not.toBeEmpty();
  // The picker carries the Directory node colour (#8b93a7), like the runtime link and File colour.
  await expect(page.locator('#aboutPop .about-lang label')).toHaveCSS('color', 'rgb(139, 147, 167)');
  await expect(page.locator('#langOpen')).toHaveCSS('border-top-color', 'rgb(139, 147, 167)');
  await page.locator('#langOpen').click();
  await expect(page.locator('#langPop')).toBeVisible();
  await page.locator('#langList .lang-row[data-tag="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#resetView')).toHaveText('إعادة ضبط العرض');
  await expect(page.locator('#langPop')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#aboutPop')).toBeHidden();

  // Left-to-right values stay isolated in a right-to-left interface.
  await expect(page.locator('#graphPath')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#graphPath')).toHaveCSS('unicode-bidi', 'isolate');
  await expect(page.locator('#pvPath')).toHaveAttribute('dir', 'ltr');

  // Generated content declares its own language and direction, not the interface's.
  await page.locator('#titleBtn').click();
  await page.locator('#aboutRuntime').click();
  await expect(page.locator('#pvPath')).toHaveText('.runtime/index.md');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('#pvBody')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#pvBody')).toHaveAttribute('dir', 'ltr');
  // The preview's own back/forward chevrons mirror with the interface direction.
  await expect(page.locator('#pvBack')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#pvFwd')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
});

test('grupperer språkvalget etter verdensdel', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  // Region headings: the English name, sorted alphabetically, with the languages under them.
  await expect(page.locator('#langList .pop-sec').first()).toHaveText('Africa');
  await expect(page.locator('#langList .pop-sec', { hasText: 'Asia' })).toHaveCount(1);
  await expect(page.locator('#langList .pop-sec', { hasText: 'Africa' })).toHaveCount(1);
  // English is listed under both Europe and the Americas.
  await expect(page.locator('#langList .lang-row[data-tag="en"]')).toHaveCount(2);
  await expect(page.locator('#langList .lang-row[data-tag="zh-Hans"]')).toHaveCount(1);
  await expect(page.locator('#langList .lang-row[data-tag="sw"]')).toHaveCount(1);
  // Serbian ships in both scripts: the default Cyrillic (no script subtag) and Latin.
  await page.locator('#langSearch').fill('serbian');
  await expect(page.locator('#langList .lang-row')).toHaveCount(2);
  await page.locator('#langList .lang-row[data-tag="sr-Latn"]').click();
  // Serbian (Latin) has no dictionary: the interface text stays English and is declared as
  // such, the direction follows the chosen script, and the choice is remembered.
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  expect(await page.evaluate(() => localStorage.getItem('grokf.lang'))).toBe('sr-Latn');
  // A language with its own dictionary switches the interface.
  await page.locator('#langOpen').click();
  await page.locator('#langSearch').fill('dutch');
  await page.locator('#langList .lang-row[data-tag="nl"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await expect(page.locator('#resetView')).toHaveText('Weergave resetten');
  // A newly shipped dictionary switches the interface too (found by its own name, "svenska").
  await page.locator('#langOpen').click();
  // The list stays in English whatever the interface language is (now Dutch); only the
  // region headings gain the interface language's name in parentheses.
  await expect(page.locator('#langList .lang-row[data-tag="es"]').first()).toHaveText('Spanish (español)');
  await expect(page.locator('#langList .pop-sec', { hasText: 'Europe (Europa)' })).toHaveCount(1);
  await page.locator('#langSearch').fill('svenska');
  await page.locator('#langList .lang-row[data-tag="sv"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
  await expect(page.locator('#resetView')).toHaveText('Återställ vy');
});

test('søker i språklista og støtter språk uten ordbok', async ({ page }) => {
  await loadBundle(page);
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  // The dialog offers every language.
  expect(await page.locator('#langList .lang-row').count()).toBeGreaterThan(100);
  // Every entry is the English name, with the language's own name in parentheses.
  await expect(page.locator('#langList .lang-row[data-tag="es"]').first()).toHaveText('Spanish (español)');
  await expect(page.locator('#langList .lang-row[data-tag="ja"]')).toHaveText('Japanese (日本語)');
  // The search narrows the list by name (case- and accent-insensitive).
  await page.locator('#langSearch').fill('arab');
  await expect(page.locator('#langList .lang-row')).toHaveCount(1);
  await expect(page.locator('#langList .lang-row[data-tag="ar"]')).toHaveCount(1);
  // A language without a dictionary is still selectable: the interface text is declared
  // and shown as English, and the choice is remembered.
  await page.locator('#langSearch').fill('maori');
  await page.locator('#langList .lang-row[data-tag="mi"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#resetView')).toHaveText('Reset view');
  expect(await page.evaluate(() => localStorage.getItem('grokf.lang'))).toBe('mi');
});

test('holder språkvalgdialogen innenfor vinduet', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 380 });
  await loadBundle(page);
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  await expect(page.locator('#langPop')).toBeVisible();
  const vp = page.viewportSize();
  const box = await page.locator('#langPop').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 0.5);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 0.5);
});

test('viser hele Om-panelet når det er plass', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1200 });
  await loadBundle(page);
  await page.locator('#titleBtn').click();
  await expect(page.locator('#aboutPop')).toBeVisible();
  const body = page.locator('#aboutPop .about-body');
  // The panel's full height, measured in a tall window.
  const full = await body.evaluate(el => el.scrollHeight);
  // In a window tall enough to hold it, the panel is shown in full with no inner scroll.
  await page.setViewportSize({ width: 900, height: full + 120 });
  const slack = await body.evaluate(el => el.scrollHeight - el.clientHeight);
  expect(slack).toBeLessThanOrEqual(1);
  const vp = page.viewportSize();
  const box = await page.locator('#aboutPop').boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 0.5);
  // In a short window it caps to the remaining height but still stays inside.
  await page.setViewportSize({ width: 900, height: 320 });
  const box2 = await page.locator('#aboutPop').boundingBox();
  expect(box2.y).toBeGreaterThanOrEqual(0);
  expect(box2.y + box2.height).toBeLessThanOrEqual(320 + 0.5);
});

test('isolerer innskutte verdier i meldinger med bdi', async ({ page }) => {
  // The interface language is persisted before the page loads.
  await page.addInitScript(() => { try { localStorage.setItem('grokf.lang', 'ar'); } catch (e) {} });
  await page.goto(`${explorer}?bundle=${encodeURIComponent('https://example.invalid/private/')}`);
  await expect(page.locator('#overlay')).toHaveClass(/\bshow\b/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const bdi = page.locator('#overlayMsg bdi');
  await expect(bdi).toHaveCount(1);
  await expect(bdi).toHaveAttribute('dir', 'auto');
  await expect(bdi).toContainText('example.invalid');
});

test('laster prosjektets kunnskapsindeks som en separat røykprøve', async ({ page }) => {
  await page.goto(`${explorer}?bundle=index.md&depth=all`);
  await expect(page.locator('#overlay')).not.toHaveClass(/\bshow\b/);
  await expect(page.locator('#spinner')).toBeHidden();
  await expect(page.locator('#stats')).toHaveText(/[1-9]\d* files · \d+ links/);
});

test('husker valgt språk til neste besøk', async ({ page }) => {
  await loadBundle(page);
  // Choose Swedish from the dialog.
  await page.locator('#titleBtn').click();
  await page.locator('#langOpen').click();
  await page.locator('#langSearch').fill('swedish');
  await page.locator('#langList .lang-row[data-tag="sv"]').click();
  await expect(page.locator('#resetView')).toHaveText('Återställ vy');
  // The choice is persisted in the browser and restored on the next visit.
  await page.reload();
  await expect(page.locator('#spinner')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
  await expect(page.locator('#resetView')).toHaveText('Återställ vy');
});

test('bruker nettleserens foretrukne språk når intet er lagret', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', { get: () => ['de-DE', 'en'] });
  });
  await page.goto(`${explorer}?bundle=${encodeURIComponent(bundle)}&depth=all`);
  await expect(page.locator('#spinner')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('fjerner et foreldet ?lang fra adressen', async ({ page }) => {
  await page.goto(`${explorer}?bundle=${encodeURIComponent(bundle)}&depth=all&lang=de`);
  await expect(page.locator('#spinner')).toBeHidden();
  // The parameter is gone from the URL and has no effect on the interface.
  expect(page.url()).not.toContain('lang=');
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
