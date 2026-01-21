/**
 * Convert crawled JSON data to Eleventy markdown files
 * Run: node scripts/convert-content.js
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CRAWLER_OUTPUT = path.resolve(__dirname, '../../crawler/output');
const SITE_SRC = path.resolve(__dirname, '../src');

// Map crawler slugs to cleaner URLs/filenames
const SLUG_MAP = {
  'home': { filename: 'index', permalink: '/' },
  'about': { filename: 'about', permalink: '/about/' },
  'history': { filename: 'history', permalink: '/history/' },
  'activities': { filename: 'delegations', permalink: '/delegations/' },
  'scholarships': { filename: 'scholarships', permalink: '/scholarships/' },
  'anti-mining': { filename: 'joint-efforts', permalink: '/joint-efforts/' },
  'fair-trade': { filename: 'fair-trade', permalink: '/fair-trade/' },
  'get-involved': { filename: 'get-involved', permalink: '/get-involved/' },
  'donate': { filename: 'donate', permalink: '/donate/' },
  'contact': { filename: 'contact', permalink: '/contact/' },
  'resources': { filename: 'resources', permalink: '/resources/' },
  'newsletter-archive': { filename: 'newsletter-archive', permalink: '/newsletter-archive/' },
  'celebrations': { filename: 'celebrations', permalink: '/celebrations/' },
  'copy-of-scholarships': { filename: 'via-crucis', permalink: '/via-crucis/' },
  'copy-of-anti-mining': { filename: 'sister-city-collaboration', permalink: '/sister-city-collaboration/' },
  'copy-of-fair-trade': { filename: 'historical-memory', permalink: '/historical-memory/' },
  'copy-of-our-work': null, // Skip - duplicate of fair-trade
  'copy-of-delegations': null, // Skip - duplicate of activities
  'event-list': null, // Skip - dynamic page
  'upcoming-events': null, // Skip - dynamic page
  '2017-holiday-fair-signup': null, // Skip - outdated
};

// Clean up Wix HTML to markdown-ish content
function cleanContent(textBlocks, headings) {
  const seen = new Set();
  const lines = [];

  // Add headings first
  for (const heading of headings) {
    const text = heading.text.trim();
    if (text && !seen.has(text) && text.length > 2) {
      seen.add(text);
      const level = parseInt(heading.level.replace('h', ''));
      lines.push(`${'#'.repeat(Math.min(level, 3))} ${text}\n`);
    }
  }

  // Add text blocks
  for (const block of textBlocks) {
    const text = block.text.trim();
    // Skip if already seen, too short, or looks like boilerplate
    if (
      seen.has(text) ||
      text.length < 20 ||
      text.includes('©') ||
      text.includes('mailing list') ||
      text.includes('Never miss')
    ) {
      continue;
    }
    seen.add(text);
    lines.push(`${text}\n`);
  }

  return lines.join('\n');
}

// Extract a clean title from the page data
function getTitle(data) {
  let title = data.title || '';
  // Remove " | Madison Arcatao Sister City Project" suffix
  title = title.replace(/\s*\|\s*(Madison Arcatao Sister City Project|website)$/i, '');
  return title.trim() || 'Untitled';
}

// Convert Wix URL to local filename
function wixUrlToLocalFilename(url) {
  if (!url) return null;

  // Get extension from URL (look for common image extensions)
  const extMatch = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';

  // Try to extract Wix image ID patterns
  const patterns = [
    /([a-f0-9]+_[a-f0-9]+)~mv2/i,  // e30e9f_32e7cecdf6ea4815aec371ace926548b~mv2
    /([a-f0-9]+_[a-f0-9]+)\./i,     // e30e9f_xxx.png
    /\/media\/([a-f0-9]{20,})\./i,  // /media/ce6ec7c11b174c0581e20f42bb865ce3.png
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1].replace(/~/g, '_');
      return `${id}_mv2.${ext}`.replace(/_mv2_mv2/, '_mv2');
    }
  }

  // Fallback: try to get just the hex ID
  const hexMatch = url.match(/([a-f0-9]{20,})/i);
  if (hexMatch) {
    return `${hexMatch[1]}.${ext}`;
  }

  return null;
}

// Find hero image (prefer meaningful content images over logos/icons)
function getHeroImage(data, slug) {
  if (!data.images || data.images.length === 0) return null;

  const validImages = data.images.filter(img => {
    const alt = (img.alt || '').toLowerCase();
    // Skip social icons
    return !alt.includes('facebook') && !alt.includes('youtube') && !alt.includes('instagram');
  });

  if (validImages.length === 0) return null;

  // Prefer images with meaningful alt text (like "Visit Arcatao", "Bienvenidos", etc.)
  const preferredKeywords = ['visit', 'bienvenid', 'mural', 'community', 'delegation', 'salvador'];
  let heroImg = validImages.find(img => {
    const alt = (img.alt || '').toLowerCase();
    return preferredKeywords.some(kw => alt.includes(kw));
  });

  // If no preferred image found, use the last valid image (often the main content image)
  // since logos/banners tend to come first
  if (!heroImg) {
    heroImg = validImages[validImages.length - 1];
  }

  const url = heroImg.cleanSrc || heroImg.src;
  const localFilename = wixUrlToLocalFilename(url);
  return localFilename ? `/assets/images/${slug}/${localFilename}` : null;
}

// Generate frontmatter + markdown content
function generateMarkdown(data, mapping) {
  const title = getTitle(data);
  const heroImage = getHeroImage(data, data.slug);
  const content = cleanContent(data.textBlocks || [], data.headings || []);

  const isHome = mapping.filename === 'index';
  const layout = isHome ? 'layouts/home.njk' : 'layouts/page.njk';

  let frontmatter = `---
title: "${title}"
layout: ${layout}
permalink: ${mapping.permalink}
`;

  if (heroImage) {
    frontmatter += `heroImage: "${heroImage}"
`;
  }

  if (data.metaDescription) {
    frontmatter += `description: "${data.metaDescription}"
`;
  }

  if (isHome) {
    // Extract welcome text for home page
    const welcomeBlock = data.textBlocks?.find(b =>
      b.text.includes('Welcome to the Madison Arcatao')
    );
    if (welcomeBlock) {
      frontmatter += `welcome: "${welcomeBlock.text.replace(/"/g, '\\"')}"
`;
    }
  }

  frontmatter += `---

`;

  return frontmatter + content;
}

// Process event pages
function processEvent(data) {
  const title = getTitle(data);
  const heroImage = getHeroImage(data, data.slug);
  const content = cleanContent(data.textBlocks || [], data.headings || []);

  let frontmatter = `---
title: "${title}"
layout: layouts/page.njk
heroImage: "${heroImage || ''}"
date: ${new Date().toISOString()}
---

`;

  return frontmatter + content;
}

async function main() {
  console.log('Converting crawled content to Eleventy format...\n');

  // Ensure output directories exist
  await fs.ensureDir(path.join(SITE_SRC, 'pages'));
  await fs.ensureDir(path.join(SITE_SRC, 'events'));

  // Read all JSON files from crawler output
  const dataDir = path.join(CRAWLER_OUTPUT, 'data');
  const files = await fs.readdir(dataDir);

  let converted = 0;
  let skipped = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const slug = file.replace('.json', '');
    const data = await fs.readJson(path.join(dataDir, file));

    // Check if it's an event page
    if (slug.startsWith('event-')) {
      const markdown = processEvent(data);
      const outputPath = path.join(SITE_SRC, 'events', `${slug}.md`);
      await fs.writeFile(outputPath, markdown);
      console.log(`✓ Event: ${slug}.md`);
      converted++;
      continue;
    }

    // Check mapping for regular pages
    const mapping = SLUG_MAP[slug];

    if (mapping === null) {
      console.log(`⊘ Skipped: ${slug} (duplicate or outdated)`);
      skipped++;
      continue;
    }

    if (!mapping) {
      console.log(`? Unknown: ${slug} - skipping`);
      skipped++;
      continue;
    }

    const markdown = generateMarkdown(data, mapping);

    // Home page goes to src/index.md, others to src/pages/
    const outputPath = mapping.filename === 'index'
      ? path.join(SITE_SRC, 'index.md')
      : path.join(SITE_SRC, 'pages', `${mapping.filename}.md`);

    await fs.writeFile(outputPath, markdown);
    console.log(`✓ Page: ${mapping.filename}.md`);
    converted++;
  }

  console.log(`\n✅ Converted: ${converted} files`);
  console.log(`⊘ Skipped: ${skipped} files`);
  console.log(`\nContent saved to: ${SITE_SRC}`);
}

main().catch(console.error);
