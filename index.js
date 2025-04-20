const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const fs = require('fs');

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';

(async () => {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 180000,
    timeout: 180000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
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

  try {
    console.log('🌐 Navigating to login page...');
    await page.goto('https://replit.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

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
    console.log(`📁 Cookies saved to: ${COOKIE_FILE}`);

    console.log('🔄 Navigating to REPL project...');
    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    console.log('⏳ Waiting for the exact "Run" button to appear...');
await page.waitForSelector('button.useView_view__C2mnv.css-1qheakp > svg.css-492dz9 + span.css-1xdyip3', {
  timeout: 60000,
});

const runButton = await page.$('button.useView_view__C2mnv.css-1qheakp');
if (runButton) {
  console.log('▶️ Exact "Run" button detected, clicking...');
  await runButton.click();
} else {
  console.warn('⚠️ Exact "Run" button not found.');
}


    // Optional: Keep the browser open for observation
    // await page.waitForTimeout(10000);
    // await browser.close();

  } catch (err) {
    console.error(`❌ Login failed or page flow error: ${err.message}`);
    try {
      const title = await page.title();
      const url = page.url();
      const html = await page.content();
      console.log(`📄 Page title: ${title}`);
      console.log(`🌍 Page URL: ${url}`);
      console.log(`🧾 Page HTML:\n${html}`);
    } catch (e) {
      console.error('⚠️ Failed to fetch page info for debug.');
    }
  }
})();
