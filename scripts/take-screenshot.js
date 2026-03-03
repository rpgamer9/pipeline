const puppeteer = require("puppeteer");
const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const fs = require("fs");

async function takeScreenshot() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, "../screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log("✅ Created screenshots directory");
  }

  // Start a local server to serve the built app
  const app = express();
  const buildPath = path.join(__dirname, "../build");

  // Check if build directory exists
  if (!fs.existsSync(buildPath)) {
    console.log("🏗️ Build directory not found. Running build...");

    // Automatically run build
    const { execSync } = require("child_process");
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Build completed");
  }

  app.use(serveStatic(buildPath));

  const server = app.listen(3000);
  console.log("🌐 Local server started on http://localhost:3000");

  try {
    // Launch Puppeteer
    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new", // Use new headless mode
    });
    const page = await browser.newPage();

    // Set viewport to a typical laptop size
    await page.setViewport({ width: 1280, height: 800 });
    console.log("📱 Viewport set to 1280x800");

    // Navigate to the local server
    console.log("🌍 Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    console.log("✅ Page loaded");

    // Wait for any animations/rendering (using setTimeout instead of waitForTimeout)
    console.log("⏳ Waiting for page to stabilize...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take a screenshot
    const screenshotPath = path.join(screenshotsDir, "homepage.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    console.log(`✅ Screenshot saved to ${screenshotPath}`);

    // For extra challenge: Create laptop mockup
    await createLaptopMockup(browser, screenshotPath, screenshotsDir);

    await browser.close();
    console.log("✅ Screenshot process completed successfully!");
  } catch (error) {
    console.error("❌ Error taking screenshot:", error);
    process.exit(1);
  } finally {
    server.close();
    console.log("🛑 Local server stopped");
  }
}

// Extra challenge: Create laptop mockup
async function createLaptopMockup(browser, screenshotPath, screenshotsDir) {
  try {
    console.log("💻 Creating laptop mockup...");

    // Read the screenshot as base64
    const screenshotBuffer = fs.readFileSync(screenshotPath);
    const base64Image = screenshotBuffer.toString("base64");

    // Create a simple HTML frame with embedded image
    const mockupHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
          }
          .laptop {
            background: #1a1a1a;
            border-radius: 30px 30px 20px 20px;
            padding: 20px 20px 30px 20px;
            box-shadow: 0 50px 80px -20px rgba(0,0,0,0.6);
            position: relative;
            transform: perspective(1000px) rotateX(2deg);
            transition: transform 0.3s ease;
          }
          .laptop:hover {
            transform: perspective(1000px) rotateX(0deg);
          }
          .screen {
            border: 3px solid #333;
            border-radius: 15px;
            overflow: hidden;
            width: 1200px;
            height: 700px;
            background: #000;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
          }
          .screen img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .base {
            background: linear-gradient(to bottom, #222, #111);
            height: 25px;
            width: 450px;
            margin: 15px auto 0;
            border-radius: 0 0 20px 20px;
            position: relative;
            box-shadow: 0 10px 15px -5px rgba(0,0,0,0.5);
          }
          .base:after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 8px;
            background: #444;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          }
          .brand {
            color: #666;
            text-align: center;
            margin-top: 10px;
            font-size: 12px;
            letter-spacing: 3px;
            text-transform: uppercase;
          }
          .glow {
            position: absolute;
            top: -5px;
            left: 10%;
            right: 10%;
            height: 10px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(5px);
          }
        </style>
      </head>
      <body>
        <div class="laptop">
          <div class="glow"></div>
          <div class="screen">
            <img src="data:image/png;base64,${base64Image}" alt="Website Screenshot">
          </div>
          <div class="base"></div>
          <div class="brand">MACBOOK PRO</div>
        </div>
      </body>
      </html>
    `;

    // Create a new page for the mockup
    const mockupPage = await browser.newPage();
    await mockupPage.setViewport({ width: 1400, height: 900 });

    // Set the HTML content directly
    await mockupPage.setContent(mockupHtml, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for image to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Take screenshot of the mockup
    const mockupScreenshotPath = path.join(
      screenshotsDir,
      "homepage-mockup.png",
    );
    await mockupPage.screenshot({
      path: mockupScreenshotPath,
      fullPage: false,
      quality: 100,
    });

    console.log(`✅ Laptop mockup screenshot saved to ${mockupScreenshotPath}`);
  } catch (error) {
    console.error("⚠️ Warning: Error creating laptop mockup:", error.message);
    console.log("Continuing without mockup...");
    // Don't exit - mockup is optional
  }
}

// Run if called directly
if (require.main === module) {
  console.log("📸 Starting screenshot process...");
  console.log("=".repeat(50));
  takeScreenshot().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = takeScreenshot;
