const express = require('express');
const bodyParser = require('body-parser');
const monitor = require('express-status-monitor');
const { mkdirSync, existsSync } = require('fs');
const { resolve } = require('path');
const TabPool = require('./TabPool');

const PORT = 3000;
const screenshotsDirPath = resolve(__dirname, '..', 'screenshots');
const app = express();
const jsonParser = bodyParser.json();
const tabPool = new TabPool(screenshotsDirPath, 5);

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

const queue = [];
const handleQueue = async () => {
  // if queue is empty
  if (!queue.length) return;

  // if no idle pages
  const pageIndex = tabPool.getIdlePage();
  if (pageIndex === -1) return;

  const { req, res, start } = queue.shift();
  const json = JSON.stringify(req.body);
  const html = getHtmlContent(json);
  await tabPool.assignExportTask(pageIndex, html);
  res.end();
  const end = process.hrtime.bigint();
  console.log(`Handler execution time ${Number(end - start) / 1000000} ms`);
  handleQueue();
};

// crete screenshot dir if not exists
if (!existsSync(screenshotsDirPath)) {
  mkdirSync(screenshotsDirPath);
}

app.use(express.static('public'));
app.use(monitor());

app.post('/', jsonParser, async (req, res) => {
  const start = process.hrtime.bigint();

  queue.push({ req, res, start });
  handleQueue();
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
  await tabPool.initiateBrowser();
  await tabPool.populatePages();
});
