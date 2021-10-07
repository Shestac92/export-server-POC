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

// <script src="localhost:3000/anychart-bundle.min.js"></script>

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
  const json = JSON.stringify(req.body);
  const browser = await chromium.launch({ headless: IS_HEADLESS });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  const page = await context.newPage();
  await page.setViewportSize({
    width: BROWSER_WIDTH,
    height: BROWSER_HEIGHT
  });

  await page.setContent(getHtmlContent(json));
  const path = join(screenshotsDirPath, `${process.hrtime.bigint()}.jpg`);
  await page.screenshot({ path });
  // await page.waitForTimeout(5000);
  res.end();
  await browser.close();
  process.exit(0);
});

app.listen(PORT, () => { });
