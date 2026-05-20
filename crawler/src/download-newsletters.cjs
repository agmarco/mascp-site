const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../site/src/assets/newsletters');
const PAGES_DIR = path.join(__dirname, '../../site/src/pages');

// Parse newsletters — use mapping.json if available (original URLs), otherwise parse md
function parseNewsletters() {
  const mappingPath = path.join(OUTPUT_DIR, 'mapping.json');
  if (fs.existsSync(mappingPath)) {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    return mapping.map(m => ({ date: m.date, href: m.oldHref, img: m.oldImg, slug: m.slug }));
  }
  const md = fs.readFileSync(path.join(PAGES_DIR, 'newsletter-archive.md'), 'utf8');
  const newsletters = [];
  const regex = /- \{ date: "([^"]+)", href: "([^"]+)", img: "([^"]+)" \}/g;
  let match;
  while ((match = regex.exec(md)) !== null) {
    newsletters.push({ date: match[1], href: match[2], img: match[3] });
  }
  return newsletters;
}

// Slugify a date string like "February 2026" → "february-2026"
function slugify(date) {
  return date.toLowerCase().replace(/\s+/g, '-');
}

// Make slugs unique by appending -2, -3 etc for duplicates
function makeUniqueSlugs(newsletters) {
  const seen = {};
  return newsletters.map(n => {
    const base = slugify(n.date);
    seen[base] = (seen[base] || 0) + 1;
    const slug = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    return { ...n, slug };
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const raw = parseNewsletters();
  const newsletters = raw[0].slug ? raw : makeUniqueSlugs(raw);
  console.log(`Found ${newsletters.length} newsletters to download\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const results = [];

  for (let i = 0; i < newsletters.length; i++) {
    const { date, href, img, slug } = newsletters[i];
    console.log(`[${i + 1}/${newsletters.length}] ${date} — ${slug}`);

    const pdfPath = path.join(OUTPUT_DIR, `${slug}.pdf`);
    const imgExtMatch = img.match(/\.(\w+)$/);
    const imgExt = imgExtMatch ? imgExtMatch[1] : 'jpg';
    const imgPath = path.join(OUTPUT_DIR, `${slug}.${imgExt}`);

    // Download PDF
    if (fs.existsSync(pdfPath)) {
      console.log(`  PDF already exists, skipping`);
    } else {
      try {
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1080 });
        await page.goto(href, { waitUntil: 'networkidle2', timeout: 30000 });
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.pdf({
          path: pdfPath,
          width: '800px',
          height: `${bodyHeight + 40}px`,
          printBackground: true,
          pageRanges: '1'
        });
        await page.close();
        console.log(`  PDF saved`);
      } catch (err) {
        console.log(`  PDF FAILED: ${err.message}`);
      }
    }

    // Download thumbnail
    if (fs.existsSync(imgPath)) {
      console.log(`  Thumbnail already exists, skipping`);
    } else {
      try {
        await downloadFile(img, imgPath);
        console.log(`  Thumbnail saved`);
      } catch (err) {
        console.log(`  Thumbnail FAILED: ${err.message}`);
      }
    }

    results.push({
      date,
      oldHref: href,
      oldImg: img,
      newHref: `/assets/newsletters/${slug}.pdf`,
      newImg: `/assets/newsletters/${slug}.${imgExt}`,
      slug
    });
  }

  await browser.close();

  // Write results mapping
  const mappingPath = path.join(OUTPUT_DIR, 'mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! Mapping saved to ${mappingPath}`);
  console.log(`\nNext step: run update-newsletter-links.js to update newsletter-archive.md`);
}

main().catch(console.error);
