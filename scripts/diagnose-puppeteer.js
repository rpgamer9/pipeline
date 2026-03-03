const puppeteer = require('puppeteer');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function diagnose() {
  console.log('=== System Information ===');
  console.log('Platform:', os.platform());
  console.log('Architecture:', os.arch());
  console.log('Node version:', process.version);
  console.log('Puppeteer version:', require('puppeteer/package.json').version);
  
  try {
    const executablePath = puppeteer.executablePath();
    console.log('Chrome executable path:', executablePath);
    
    // Check if executable exists
    if (fs.existsSync(executablePath)) {
      console.log('✅ Chrome executable exists');
      const stats = fs.statSync(executablePath);
      console.log('File permissions:', stats.mode.toString(8));
    } else {
      console.log('❌ Chrome executable not found at:', executablePath);
    }
  } catch (error) {
    console.log('❌ Error getting executable path:', error.message);
  }
  
  console.log('\n=== Testing Browser Launch ===');
  let browser = null;
  try {
    console.log('Attempting to launch browser with minimal args...');
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });
    console.log('✅ Browser launched successfully!');
    
    const page = await browser.newPage();
    console.log('✅ Page created successfully!');
    
    await page.goto('about:blank');
    console.log('✅ Navigated to about:blank');
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    return true;
  } catch (error) {
    console.log('❌ Browser launch failed:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
    return false;
  }
}

diagnose()
  .then(success => {
    if (!success) {
      process.exit(100);
    }
  })
  .catch(error => {
    console.error('Diagnostic error:', error);
    process.exit(100);
  });