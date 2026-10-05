import { chromium } from 'playwright';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createStaticServer } from '../support/serve.mjs';
import paths from '../support/paths.cjs';

const { repositoryRoot, explorerUrl, basicBundleUrl, baseURL, artifactsRoot } = paths;
const url = process.argv[2] ?? (
  `${baseURL}${explorerUrl}?bundle=${encodeURIComponent(basicBundleUrl)}&depth=all`
);
const output = process.argv[3] ?? join(artifactsRoot, 'screenshots/screenshot.png');
const server = process.argv[2] ? null : createStaticServer(repositoryRoot);
let browser;

try {
  if (server) {
    server.listen(8080, '127.0.0.1');
    await once(server, 'listening');
  }
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  await page.goto(url, {
    waitUntil: 'load',
    timeout: 30_000,
  });

  if (new URL(url).pathname.endsWith('/okf-graph-explorer.html')) {
    await page.waitForFunction(
      () => !document.querySelector('#overlay').classList.contains('show'),
      undefined,
      { timeout: 30_000 }
    );
    await page.locator('#spinner').waitFor({ state: 'hidden', timeout: 30_000 });
  }

  await mkdir(dirname(output), { recursive: true });
  await page.screenshot({
    path: output,
    fullPage: true,
    animations: 'disabled',
  });

  console.log(`Screenshot saved to ${output}`);
} finally {
  try {
    await browser?.close();
  } finally {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
}
