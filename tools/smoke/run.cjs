// Read-only browser checks against an isolated local copy, never the live store.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');

const root = path.resolve(__dirname, '../..');
const output = path.resolve(process.env.SMOKE_REPORT_DIR || path.join(root, 'test-results/smoke'));
const results = [];
let browser, server;

async function main() {
  await fs.mkdir(output, { recursive: true });
  server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const data = await fs.readFile(filename);
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
      res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
      res.end(data);
    } catch { res.writeHead(404).end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, ...(process.env.SMOKE_BROWSER_CHANNEL ? { channel: process.env.SMOKE_BROWSER_CHANNEL } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Suppress analytics, ads, counters and any other external requests.
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());

  async function check(name, action) {
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    try {
      await action(page);
      results.push({ name, status: 'PASS' });
    } catch (error) {
      const screenshot = `failure-${results.length + 1}.png`;
      let saved = false;
      try { await page.screenshot({ path: path.join(output, screenshot), fullPage: true }); saved = true; } catch {}
      results.push({ name, status: 'FAIL', error: String(error.message), ...(saved ? { screenshot } : {}) });
    } finally { await page.close(); }
  }

  async function open(page, file) {
    const response = await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, `${file} must load`);
  }
  // Exercise actual user buttons rather than a duplicate calculation implementation.
  async function answer(page, file, keys, expected) {
    await open(page, file);
    const calc = page.locator('.calc');
    for (const key of [...keys, '=']) await calc.locator(`button[data-k="${key}"]`).click();
    const actual = (await calc.locator('.result').innerText()).trim();
    assert.equal(actual, expected, `${keys.join('')} must display ${expected}, got ${actual}`);
  }
  await check('Basic addition: 2 + 3 = 5', p => answer(p, 'basic.html', ['2', '+', '3'], '5'));
  await check('Order of operations: 2 + 3 × 4 = 14', p => answer(p, 'basic.html', ['2', '+', '3', '×', '4'], '14'));
  await check('Scientific parentheses: (2 + 3) × 4 = 20', p => answer(p, 'scientific.html', ['(', '2', '+', '3', ')', '×', '4'], '20'));
  await check('Scientific negative exponent precedence: −2^2 = −4', p => answer(p, 'scientific.html', ['−', '2', '^', '2'], '-4'));
  await check('Basic clear and keyboard input', async p => {
    await open(p, 'basic.html');
    await p.keyboard.type('12+3');
    await p.keyboard.press('Enter');
    assert.equal((await p.locator('#b-res').innerText()).trim(), '15');
    await p.locator('button[data-k="C"]').click();
    assert.equal((await p.locator('#b-res').innerText()).trim(), '0');
    assert.equal((await p.locator('#b-expr').innerText()).trim(), '');
  });
  await check('Homeschool internal page links resolve', async p => {
    await open(p, 'homeschool.html');
    const links = await p.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.href));
    const broken = [];
    for (const href of new Set(links)) {
      const url = new URL(href);
      if (url.origin !== base || !url.pathname.endsWith('.html')) continue;
      const response = await context.request.get(href, { timeout: 10000 });
      if (response.status() !== 200) broken.push(`${url.pathname}: ${response.status()}`);
    }
    assert.deepEqual(broken, [], `Broken local links: ${broken.join(', ')}`);
  });
  await check('Mobile calculator: buttons work at 390px width', async p => {
    await p.setViewportSize({ width: 390, height: 844 });
    await answer(p, 'basic.html', ['8', '÷', '2'], '4');
    for (const key of ['8', '÷', '2', '=']) {
      const box = await p.locator(`button[data-k="${key}"]`).boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= 391, `${key} must fit the mobile viewport`);
    }
  });
}

(async () => {
  try { await main(); }
  catch (error) { results.push({ name: 'Test infrastructure', status: 'FAIL', error: String(error.stack || error) }); }
  finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    await fs.mkdir(output, { recursive: true });
    const failures = results.filter(r => r.status === 'FAIL').length;
    const report = { generatedAt: new Date().toISOString(), revision: process.env.GITHUB_SHA || process.env.SMOKE_REVISION || 'local', scope: 'Local repository copy; external requests blocked; no live-site writes', passed: results.length - failures, failed: failures, results };
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    const markdown = ['# Silly Dragon automated test report', '', `Revision: ${report.revision}`, '', `Passed: ${report.passed}. Failed: ${report.failed}.`, '', report.scope, '', ...results.flatMap(r => [`- **${r.status}**: ${r.name}`, ...(r.error ? ['', '```text', r.error, '```', ''] : []), ...(r.screenshot ? [`[Failure screenshot](${r.screenshot})`, ''] : [])])].join('\n');
    await fs.writeFile(path.join(output, 'report.md'), markdown);
    if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
    console.log(markdown);
    process.exitCode = failures ? 1 : 0;
  }
})();
