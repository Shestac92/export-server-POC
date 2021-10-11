/* eslint-disable no-await-in-loop */
import { chromium } from 'playwright-chromium';
import { join } from 'path';

export default class TabPool {
  constructor(screenshotsDirPath, tabsCount = 5) {
    this.tabsCount = tabsCount;
    this.screenshotsDirPath = screenshotsDirPath;
    this.isHeadless = true;
    this.workers = [];
    this.browser = null;
    this.context = null;
  }

  async initiateBrowser() {
    if (this.browser) return;

    this.browser = await chromium.launch(
      { headless: this.isHeadless, viewport: { width: 1280, height: 1280 } }
    );
    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  }

  async populatePages() {
    if (this.workers.length) return;

    for (let i = 0; i < this.tabsCount; i++) {
      const page = await this.context.newPage();
      this.workers.push({ page, isIdle: true });
    }
  }

  getIdlePage() {
    for (let i = 0; i < this.tabsCount; i++) {
      if (this.workers[i].isIdle) return i;
    }
    return -1;
  }

  async assignExportTask(pageIndex, html, width, height) {
    const worker = this.workers[pageIndex];
    const { page } = worker;
    worker.isIdle = false;
    // TODO: найти решение с отрисовкой
    // await page.page.route('**', route => route.continue());
    // await page.page.reload({ waitUntil: 'domcontentloaded' });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const path = join(this.screenshotsDirPath, `${process.hrtime.bigint()}.jpg`);
    // TODO: quality, jpg/png
    await page.screenshot({
      path,
      clip: {
        x: 0,
        y: 0,
        width,
        height
      }
    });
    worker.isIdle = true;
  }
}
