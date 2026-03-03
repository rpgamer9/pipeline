const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const express = require("express");

(async () => {
  let browser = null;
  let server = null;

  try {
    console.log("🚀 Memulai proses screenshot...");

    // Cek folder build
    const buildPath = path.join(process.cwd(), "build");
    if (!fs.existsSync(buildPath)) {
      throw new Error(
        `Folder build tidak ditemukan di ${buildPath}. Jalankan 'npm run build' dulu.`,
      );
    }
    console.log("✅ Folder build ditemukan");

    // Jalankan server lokal untuk serve file build
    console.log("🌐 Menjalankan server lokal...");
    const app = express();
    app.use(express.static("build"));

    server = app.listen(3000, () => {
      console.log("✅ Server berjalan di http://localhost:3000");
    });

    // Tunggu server siap
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Launch browser dengan konfigurasi untuk GitHub Actions
    console.log("🌍 Meluncurkan browser...");
    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigasi ke localhost
    console.log("📸 Mengakses halaman...");
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Tunggu konten render
    console.log("⏳ Menunggu halaman stabil...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Ambil screenshot
    const screenshotPath = path.join(
      process.cwd(),
      "screenshots",
      "homepage.png",
    );
    console.log(`💾 Menyimpan screenshot ke ${screenshotPath}`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: "png",
    });

    // Verifikasi
    if (fs.existsSync(screenshotPath)) {
      const stats = fs.statSync(screenshotPath);
      console.log(`✅ Screenshot berhasil! Ukuran: ${stats.size} bytes`);
    } else {
      throw new Error("File screenshot tidak ditemukan");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(100);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
      console.log("🔄 Browser ditutup");
    }
    if (server) {
      server.close();
      console.log("🔄 Server ditutup");
    }
  }
})();
