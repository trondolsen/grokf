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

test('laster prosjektets kunnskapsindeks som en separat røykprøve', async ({ page }) => {
  await page.goto(`${explorer}?bundle=index.md&depth=all`);
  await expect(page.locator('#overlay')).not.toHaveClass(/\bshow\b/);
  await expect(page.locator('#spinner')).toBeHidden();
  await expect(page.locator('#stats')).toHaveText(/[1-9]\d* files · \d+ links/);
});
