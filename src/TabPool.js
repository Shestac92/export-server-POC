/* eslint-disable no-await-in-loop */
const { chromium } = require('playwright-chromium');
const { join } = require('path');

module.exports = class TabPool {
  constructor(screenshotsDirPath, tabsCount = 5) {
    this.tabsCount = tabsCount;
    this.screenshotsDirPath = screenshotsDirPath;
    this.isHeadless = false;
    this.pages = [];
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
    if (this.pages.length) return;

    for (let i = 0; i < this.tabsCount; i++) {
      const page = await this.context.newPage();
      this.pages.push({ page, isIdle: true });
    }
  }

  getIdlePage() {
    for (let i = 0; i < this.tabsCount; i++) {
      if (this.pages[i].isIdle) return i;
    }
    return -1;
  }

  async assignExportTask(pageIndex, html) {
    const page = this.pages[pageIndex];
    page.isIdle = false;
    // TODO: найти решение с отрисовкой
    // await page.page.route('**', route => route.continue());
    // await page.page.reload({ waitUntil: 'domcontentloaded' });
    // await page.page.goto('http://localhost:3000');
    await page.page.setContent(html);
    const path = join(this.screenshotsDirPath, `${process.hrtime.bigint()}.jpg`);
    const chart = await page.page.$('#container');
    await chart.screenshot({ path });
    page.isIdle = true;
  }
};
