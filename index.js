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
      headless: "new",  // Use 'new' for improved headless mode
      protocolTimeout: 180000, // Increased protocol timeout for stability
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Use default if not set
      args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-features=IsolateOrigins,site-per-process', // More stable site isolation
          '--disable-web-security',
          '--disable-http2', // Disable HTTP/2 if causing issues
          '--proxy-server="direct://"',
          '--proxy-bypass-list=*',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-accelerated-2d-canvas',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceInProcess',
      ],
      ignoreDefaultArgs: ['--disable-extensions'], // Allow extensions if needed
      defaultViewport: null, // Avoid viewport resizing issues
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

    // Save cookies
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));

    // Navigate to the REPL project
    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', { waitUntil: 'networkidle2' });
    fs.writeFileSync(DEBUG_HTML_FILE, await page.content());

    // Infinite monitor for the "Run" button
    while (true) {
      try {
        const runButton = await page.$('button.useView_view__C2mnv.css-1qheakp');
        if (runButton) {
          console.log('▶️ "Run" button detected, clicking...');
          await runButton.click();
        } else {
          console.log('🔍 "Run" button not found, will retry...');
        }
      } catch (err) {
        console.error('⚠️ Error in button loop:', err.message);
      }

      // Wait 5 seconds before checking again
      await page.waitForTimeout(5000);
    }

    // (Note: browser never closes here)
  } catch (e) {
    console.error('❌ Login failed or blocked. Saving HTML for debug.');
    const html = await page.content();
    fs.writeFileSync(DEBUG_HTML_FILE, html);
  }
})();
