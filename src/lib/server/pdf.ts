import { existsSync } from 'node:fs';
import puppeteer, { type Browser } from 'puppeteer-core';

const CANDIDATES = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
];

let browser: Promise<Browser> | null = null;

function launch(): Promise<Browser> {
  const executablePath = process.env.CHROME_PATH ?? CANDIDATES.find((p) => existsSync(p));
  if (!executablePath) throw new Error('Chromium not found; set CHROME_PATH');
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
}

async function getBrowser(): Promise<Browser> {
  browser ??= launch();
  const b = await browser;
  if (b.connected) return b;
  browser = launch();
  return browser;
}

export async function htmlToPdf(url: string): Promise<Uint8Array> {
  const page = await (await getBrowser()).newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({ preferCSSPageSize: true, printBackground: true });
  } finally {
    await page.close();
  }
}
