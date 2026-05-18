import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../output/gaps');
await fs.ensureDir(outDir);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const pg = await browser.newPage();
await pg.setViewport({ width: 1440, height: 900 });
await pg.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

async function go(url) {
  await pg.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
}

// ── 1. Newsletter archive: extract date + image + link triples ──
console.log('\n📧 Newsletter archive...');
await go('https://www.mascp.org/newsletter-archive');
const newsletters = await pg.evaluate(() => {
  const items = [];
  // Wix galleries use anchor > img patterns
  document.querySelectorAll('a[href*="shoutout.wix"], a[href*="madisonarcatao.wix"]').forEach(a => {
    const img = a.querySelector('img') || a.closest('[data-testid]')?.querySelector('img');
    // get nearby text for date label
    const parent = a.closest('li, [data-testid], div[class*="gallery"], div[class*="Grid"]') || a.parentElement?.parentElement;
    const dateText = parent?.innerText?.trim() || '';
    items.push({ href: a.href, img: img?.src || '', alt: img?.alt || '', date: dateText });
  });
  return items;
});
// fallback: grab all gallery images with sibling text
const galleryData = await pg.evaluate(() => {
  const results = [];
  document.querySelectorAll('figure, [data-testid="imageX"], [data-testid="wixui-image"]').forEach(el => {
    const img = el.querySelector('img');
    const link = el.querySelector('a') || el.closest('a');
    const label = el.closest('li, [class*="item"]')?.querySelector('[class*="title"], [class*="label"], p')?.innerText?.trim();
    if (img) results.push({ src: img.src, alt: img.alt, href: link?.href || '', label });
  });
  return results;
});
// get all visible text blocks that look like dates alongside link order
const nlText = await pg.evaluate(() => {
  return Array.from(document.querySelectorAll('[data-testid="richTextElement"] p, .font_8 p'))
    .map(el => el.innerText.trim())
    .filter(t => t.length > 0 && t.length < 50);
});
await fs.writeJson(path.join(outDir, 'newsletter-items.json'), { newsletters, galleryData, nlText }, { spaces: 2 });
console.log(`  ✓ ${newsletters.length} newsletter links, ${galleryData.length} gallery items`);

// ── 2. Events: use broader selectors ──
const events = [
  { slug: 'event-pupusa-dinner', url: 'https://www.mascp.org/event-details/mascps-annual-pupusa-dinner-and-fundraiser' },
  { slug: 'event-community-organizing', url: 'https://www.mascp.org/event-details/community-organizing-that-leads-to-national-change' },
  { slug: 'event-water-is-life', url: 'https://www.mascp.org/event-details/water-is-life-stories-of-grassroots-environmental-activism-in-el-salvador-and-the-united-states' },
  { slug: 'event-8oclock-buzz', url: 'https://www.mascp.org/event-details/8-oclock-buzz-interview-with-cintia-and-zulma' },
  { slug: 'event-social-mobilization', url: 'https://www.mascp.org/event-details/social-mobilization-around-environmental-issues' },
  { slug: 'event-essential-organizing', url: 'https://www.mascp.org/event-details/the-essential-role-of-community-organizing-in-national-change' },
];

for (const ev of events) {
  console.log(`\n📅 ${ev.slug}...`);
  await go(ev.url);
  const data = await pg.evaluate(() => {
    const text = t => t?.innerText?.trim() || '';
    return {
      title: text(document.querySelector('h1')),
      allText: document.body.innerText,
    };
  });
  await fs.writeJson(path.join(outDir, `${ev.slug}.json`), data, { spaces: 2 });
  console.log(`  ✓ captured`);
}

// ── 3. Scholarships: get the recipients section ──
console.log('\n🎓 Scholarships recipients...');
await go('https://www.mascp.org/scholarships');
const scholars = await pg.evaluate(() => ({
  allText: document.body.innerText,
}));
await fs.writeJson(path.join(outDir, 'scholarships.json'), scholars, { spaces: 2 });
console.log('  ✓ captured');

await browser.close();
console.log(`\nAll gap data saved to ${outDir}`);
