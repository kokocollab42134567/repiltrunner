const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';
const DEBUG_HTML_FILE = './debug-page.html';

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new', // safer for headless servers
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    },
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    console.log('🌐 Navigating to login page...');
    await page.goto('https://replit.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

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
try {
  await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  console.log('⏳ Waiting for page JavaScript to render...');
  await page.waitForSelector('button.useView_view__C2mnv.css-1qheakp', {
    timeout: 60000,
  });

  console.log('✅ "Run" button found.');

  console.log('⏱ Waiting up to 2 minutes for "Run" button...');
  const startTime = Date.now();
  const maxWaitTime = 120000;
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
      console.error('⚠️ Error while checking/clicking button:', err.message);
    }

    await page.waitForTimeout(5000);
  }

  if (!clicked) {
    console.warn('⏳ Timed out waiting for "Run" button.');
  }

} catch (err) {
  console.error('❌ Login failed or page flow error:', err.message);
  const title = await page.title();
  const url = page.url();
  const html = await page.content();
  console.log(`📄 Page title: ${title}`);
  console.log(`🌍 Page URL: ${url}`);
  console.log(`🧾 Page HTML:\n${html}`);
}

    // Keep browser open for monitoring or interaction
    console.log('📡 Monitoring complete. You can manually close the browser.');

  } catch (err) {
    console.error('❌ Login failed or page flow error:', err.message);
    const title = await page.title();
    console.error(`📄 Current page title: "${title}"`);
    fs.writeFileSync(DEBUG_HTML_FILE, await page.content());
    console.log(`🧾 Saved current page HTML to ${DEBUG_HTML_FILE}`);
  }
})();
