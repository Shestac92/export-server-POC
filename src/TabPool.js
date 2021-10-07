/* eslint-disable no-await-in-loop */
const { chromium } = require('playwright-chromium');
const { resolve, join } = require('path');

module.exports = class TabPool {
  constructor(tabsCount = 5, screenshotsDirPath) {
    this.tabsCount = tabsCount;
    this.screenshotsDirPath = screenshotsDirPath;
    this.isHeadless = false;
    this.pages = [];
    this.browser = null;
  }

  async initiateBrowser() {
    if (!this.browser) return;

    this.browser = await chromium.launch({ headless: this.isHeadless });
    this.context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  }

  async populatePages() {
    if (!this.pages.length) return;

    for (let i = 0; i < this.tabsCount; i++) {
      const page = await context.newPage();
      this.pages.push(page);
    }
  }
// TODO: остановился на этом
};
