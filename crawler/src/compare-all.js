import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../output/compare-full');

const PAGES = [
  { slug: 'home',                   wix: 'https://www.mascp.org/',                          netlify: 'https://mascp.netlify.app/' },
  { slug: 'about',                  wix: 'https://www.mascp.org/about-1',                   netlify: 'https://mascp.netlify.app/about/' },
  { slug: 'history',                wix: 'https://www.mascp.org/history',                   netlify: 'https://mascp.netlify.app/history/' },
  { slug: 'delegations',            wix: 'https://www.mascp.org/activities',                netlify: 'https://mascp.netlify.app/delegations/' },
  { slug: 'scholarships',           wix: 'https://www.mascp.org/scholarships',              netlify: 'https://mascp.netlify.app/scholarships/' },
  { slug: 'anti-mining',            wix: 'https://www.mascp.org/anti-mining',               netlify: 'https://mascp.netlify.app/anti-mining/' },
  { slug: 'fair-trade',             wix: 'https://www.mascp.org/fair-trade-1',              netlify: 'https://mascp.netlify.app/fair-trade/' },
  { slug: 'historical-memory',      wix: 'https://www.mascp.org/copy-of-fair-trade',        netlify: 'https://mascp.netlify.app/historical-memory/' },
  { slug: 'via-crucis',             wix: 'https://www.mascp.org/copy-of-scholarships',      netlify: 'https://mascp.netlify.app/via-crucis/' },
  { slug: 'sister-city',            wix: 'https://www.mascp.org/copy-of-anti-mining',       netlify: 'https://mascp.netlify.app/sister-city-collaboration/' },
  { slug: 'get-involved',           wix: 'https://www.mascp.org/get-involved-1',            netlify: 'https://mascp.netlify.app/get-involved/' },
  { slug: 'resources',              wix: 'https://www.mascp.org/resources-1',               netlify: 'https://mascp.netlify.app/resources/' },
  { slug: 'contact',                wix: 'https://www.mascp.org/contact-us-1',              netlify: 'https://mascp.netlify.app/contact/' },
  { slug: 'donate',                 wix: 'https://www.mascp.org/donate-1',                  netlify: 'https://mascp.netlify.app/donate/' },
  { slug: 'newsletter-archive',     wix: 'https://www.mascp.org/newsletter-archive',        netlify: 'https://mascp.netlify.app/newsletter-archive/' },
  { slug: 'celebrations',           wix: 'https://www.mascp.org/celebrations',              netlify: 'https://mascp.netlify.app/celebrations/' },
  { slug: 'upcoming-events',        wix: 'https://www.mascp.org/upcoming-events',           netlify: null },
  { slug: 'event-community',        wix: 'https://www.mascp.org/event-details/community-organizing-that-leads-to-national-change', netlify: 'https://mascp.netlify.app/events/event-community-organizing/' },
  { slug: 'event-pupusa',           wix: 'https://www.mascp.org/event-details/mascps-annual-pupusa-dinner-and-fundraiser',         netlify: 'https://mascp.netlify.app/events/event-pupusa-dinner/' },
  { slug: 'event-water',            wix: 'https://www.mascp.org/event-details/water-is-life-stories-of-grassroots-environmental-activism-in-el-salvador-and-the-united-states', netlify: 'https://mascp.netlify.app/events/event-water-is-life/' },
];

await fs.ensureDir(outDir);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const pg = await browser.newPage();
await pg.setViewport({ width: 1440, height: 900 });
await pg.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

for (const p of PAGES) {
  console.log(`📸 ${p.slug}`);
  await pg.goto(p.wix, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  await pg.screenshot({ path: path.join(outDir, `${p.slug}-wix.png`), fullPage: true });
  console.log(`  ✓ wix`);

  if (p.netlify) {
    await pg.goto(p.netlify, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500));
    await pg.screenshot({ path: path.join(outDir, `${p.slug}-netlify.png`), fullPage: true });
    console.log(`  ✓ netlify`);
  } else {
    console.log(`  ⚠  no netlify page`);
  }
}

await browser.close();
console.log(`\nAll screenshots saved to ${outDir}`);
