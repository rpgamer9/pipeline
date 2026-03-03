// Script minimal untuk testing
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('Starting simple screenshot test...');

(async () => {
  let browser = null;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    
    console.log('Browser launched');
    const page = await browser.newPage();
    
    console.log('Navigating to Google...');
    await page.goto('https://www.google.com', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    console.log('Taking screenshot...');
    const screenshotPath = path.join(process.cwd(), 'screenshots', 'test.png');
    await page.screenshot({ path: screenshotPath });
    
    console.log(`Screenshot saved: ${screenshotPath}`);
    
    if (fs.existsSync(screenshotPath)) {
      console.log('✅ Test successful!');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
})();