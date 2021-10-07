const express = require('express');
const bodyParser = require('body-parser');
const { chromium } = require('playwright-chromium');
const { mkdirSync, existsSync } = require('fs');
const { resolve, join } = require('path');

const PORT = 3000;
const IS_HEADLESS = false;
const BROWSER_WIDTH = 600;
const BROWSER_HEIGHT = 600;
const screenshotsDirPath = resolve(__dirname, '..', 'screenshots');
const app = express();
const jsonParser = bodyParser.json();
let browser;
let context;

const getHtmlContent = json => `
  <html>
      <head>
          <title>Example</title>
          <style>html, body, #container {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }</style>
      </head>
      <body>
        <div id="container"></div>
        <script src="https://cdn.anychart.com/releases/8.10.0/js/anychart-bundle.min.js"></script>
        <script type="text/javascript">anychart.onDocumentReady(function () {
          var json = ${json};
          var chart = anychart.fromJson(json);
          chart.container('container').draw();
        });</script>
      </body>
  </html>`;

// crete screenshot dir if not exists
if (!existsSync(screenshotsDirPath)) {
  mkdirSync(screenshotsDirPath);
}

app.use(express.static('public'));

app.post('/', jsonParser, async (req, res) => {
  const start = process.hrtime.bigint();
  const json = JSON.stringify(req.body);
  const page = await context.newPage();
  await page.setViewportSize({
    width: BROWSER_WIDTH,
    height: BROWSER_HEIGHT
  });
  await page.setContent(getHtmlContent(json));
  const path = join(screenshotsDirPath, `${process.hrtime.bigint()}.jpg`);
  await page.screenshot({ path });
  await page.close();
  res.end();
  const end = process.hrtime.bigint();
  console.log(`Handler execution time ${Number(end - start) / 1000000} ms`);
});

app.get('/stop', async (req, res) => {
  await browser.close();
  res.send();
  process.exit(0);
});

// dummy route for loading tests
app.get('/dummy', (req, res) => {
  res.send();
});

app.listen(PORT, async () => {
  browser = await chromium.launch({ headless: IS_HEADLESS });
  context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
});
