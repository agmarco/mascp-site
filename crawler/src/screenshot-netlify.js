import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { wix: 'https://www.mascp.org/', netlify: 'https://mascp.netlify.app/', slug: 'home' },
  { wix: 'https://www.mascp.org/anti-mining', netlify: 'https://mascp.netlify.app/anti-mining/', slug: 'anti-mining' },
  { wix: 'https://www.mascp.org/upcoming-events', netlify: null, slug: 'upcoming-events' },
  { wix: 'https://www.mascp.org/get-involved-1', netlify: 'https://mascp.netlify.app/get-involved/', slug: 'get-involved' },
  { wix: 'https://www.mascp.org/about-1', netlify: 'https://mascp.netlify.app/about/', slug: 'about' },
];

const outDir = path.resolve(__dirname, '../output/compare');

async function screenshot(page, url, outPath) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: outPath, fullPage: false }); // viewport only for speed
  console.log(`  ✓ ${url}`);
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const pg = await browser.newPage();
await pg.setViewport({ width: 1440, height: 900 });
await pg.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

await fs.ensureDir(outDir);

for (const p of PAGES) {
  console.log(`\n📸 ${p.slug}`);
  await screenshot(pg, p.wix, path.join(outDir, `${p.slug}-wix.png`));
  if (p.netlify) {
    await screenshot(pg, p.netlify, path.join(outDir, `${p.slug}-netlify.png`));
  } else {
    console.log(`  ⚠ No Netlify equivalent for ${p.slug}`);
  }
}

await browser.close();
console.log(`\nScreenshots saved to ${outDir}`);
