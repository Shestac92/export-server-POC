import express from 'express';
import monitor from 'express-status-monitor';
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import TabPool from './TabPool';

const PORT = 3000;
const screenshotsDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const app = express();
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
        <script src="http://localhost:3000/anychart-bundle.min.js"></script>
        <script type="text/javascript">
          var json = ${json};
          var chart = anychart.fromJson(json);
          chart.animation(false);
          chart.container('container').draw();</script>
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
  const config = req.body;
  const json = JSON.stringify(config);
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

app.use(cors());
app.use(express.static('public'));
app.use(monitor());
app.use(express.json());

app.post('/', async (req, res) => {
  const start = process.hrtime.bigint();
  queue.push({ req, res, start });
  handleQueue();
});

app.get('/stop', async (req, res) => {
  await browser.close();
  res.send();
  process.exit(0);
});

app.listen(PORT, async () => {
  await tabPool.initiateBrowser();
  await tabPool.populatePages();
});
