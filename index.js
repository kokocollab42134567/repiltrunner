const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';
const DEBUG_HTML_FILE = './debug-page.html';

(async () => {
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
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
      console.log('✏️ Typing email...');
      await page.waitForSelector('input[name="username"]', { timeout: 20000 });
      await page.type('input[name="username"]', EMAIL, { delay: 50 });

      console.log('✏️ Typing password...');
      await page.type('input[name="password"]', PASSWORD, { delay: 50 });

      console.log('🔓 Clicking login...');
      await page.click('[data-cy="log-in-btn"]');

      console.log('⏳ Waiting for login to complete...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

      console.log('✅ Logged in successfully');

      const cookies = await page.cookies();
      fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));

      console.log('📁 Cookies saved to:', COOKIE_FILE);

      console.log('🔄 Navigating to REPL project...');
      await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', { waitUntil: 'networkidle2' });

      fs.writeFileSync(DEBUG_HTML_FILE, await page.content());
      console.log('🧾 Saved debug HTML after navigating to project.');

      console.log('⏱ Waiting up to 2 minutes for "Run" button...');
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
            console.log('🔍 "Run" button not found, retrying...');
          }
        } catch (err) {
          console.error('⚠️ Error checking for Run button:', err.message);
        }

        await page.waitForTimeout(5000);
      }

      if (!clicked) {
        console.warn('⏳ Timed out waiting for "Run" button after 2 minutes.');
      }

    } catch (loginErr) {
      console.error('❌ Login failed or page flow error:', loginErr.message);
      const html = await page.content();
      fs.writeFileSync(DEBUG_HTML_FILE, html);
      console.log('📄 Saved debug HTML to:', DEBUG_HTML_FILE);
    }

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  } finally {
    // Optional: Close browser after everything
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed.');
    }
  }
})();
