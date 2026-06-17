#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node screenshot.mjs <url> [label] [--output <dir>]');
  console.error('Example: node screenshot.mjs http://localhost:3000 round-1 --output .tmp/');
  process.exit(1);
}

const url = args[0];
let label = '';
let outputDir = '.tmp';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--')) {
    label = args[i];
  }
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Find the next available screenshot number
let screenshotNum = 1;
while (fs.existsSync(
  path.join(outputDir, `screenshot-${screenshotNum}${label ? '-' + label : ''}.png`)
)) {
  screenshotNum++;
}

const screenshotPath = path.join(
  outputDir,
  `screenshot-${screenshotNum}${label ? '-' + label : ''}.png`
);

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    console.log(`Opening ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait a moment for any animations
    await page.waitForTimeout(500);

    // Get full page height
    const bodyHandle = await page.$('body');
    const boundingBox = await bodyHandle.boundingBox();
    const height = Math.ceil(boundingBox.height) + 100;

    // Take full-page screenshot
    console.log(`Taking screenshot (1440x${height})...`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await browser.close();

    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
