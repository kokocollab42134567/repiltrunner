const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';
const DEBUG_HTML_FILE = './debug-page.html';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 180000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-http2',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-accelerated-2d-canvas',
      '--disable-ipc-flooding-protection',
      '--enable-features=NetworkService,NetworkServiceInProcess',
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('🌐 Navigating to login page...');
  await page.goto('https://replit.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

  try {
    await page.waitForSelector('input[name="username"]', { timeout: 20000 });
    await page.type('input[name="username"]', EMAIL, { delay: 50 });
    await page.type('input[name="password"]', PASSWORD, { delay: 50 });
    await page.click('[data-cy="log-in-btn"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('✅ Logged in');

    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));

    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', { waitUntil: 'networkidle2' });
    fs.writeFileSync(DEBUG_HTML_FILE, await page.content());

    // Wait up to 2 minutes for the "Run" button
    const startTime = Date.now();
    const maxWaitTime = 120000; // 2 minutes
    let clicked = false;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const runButton = await page.$('button.useView_view__C2mnv.css-1qheakp');
        if (runButton) {
          console.log('▶️ "Run" button detected, clicking...');
          await runButton.click();
          clicked = true;
          break;
        } else {
          console.log('🔍 "Run" button not found, will retry...');
        }
      } catch (err) {
        console.error('⚠️ Error in button check:', err.message);
      }

      await page.waitForTimeout(5000); // Retry every 5 seconds
    }

    if (!clicked) {
      console.warn('⏳ Timed out waiting for "Run" button after 2 minutes.');
    }

    // You can close browser here if you want
    // await browser.close();

  } catch (e) {
    console.error('❌ Login failed or blocked. Saving HTML for debug.');
    const html = await page.content();
    fs.writeFileSync(DEBUG_HTML_FILE, html);
    // Optionally close browser on error
    // await browser.close();
  }
})();
