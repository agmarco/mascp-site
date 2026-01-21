import * as cheerio from 'cheerio';

/**
 * Extract content from a rendered page
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} url - URL being scraped
 * @returns {Promise<Object>} Extracted page data
 */
export async function extractPageContent(page, url) {
  // Wait for Wix to fully render
  await page.waitForSelector('body', { timeout: 30000 });

  // Give extra time for dynamic content
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get the rendered HTML
  const html = await page.content();
  const $ = cheerio.load(html);

  // Extract page metadata
  const title = $('title').text().trim() || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Extract all text sections
  const sections = [];

  // Find main content areas (Wix uses various container patterns)
  const contentSelectors = [
    '[data-testid="richTextElement"]',
    '[data-testid="mesh-container-content"]',
    '.font_8', '.font_7', '.font_5', '.font_2', // Wix font classes
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
  ];

  // Extract headings
  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 0) {
      headings.push({
        level: el.tagName.toLowerCase(),
        text: text
      });
    }
  });

  // Extract paragraphs and text blocks
  const textBlocks = [];
  $('[data-testid="richTextElement"], .font_8, .font_7').each((i, el) => {
    const text = $(el).text().trim();
    const html = $(el).html();
    if (text && text.length > 10) {
      textBlocks.push({
        text: text,
        html: html
      });
    }
  });

  // Extract images (from wixstatic.com)
  const images = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    if (src && (src.includes('wixstatic.com') || src.includes('wix.com'))) {
      // Clean up Wix image URLs (remove resize parameters to get full size)
      let cleanSrc = src.split('/v1/fill/')[0] || src;
      if (cleanSrc.includes('/v1/crop/')) {
        cleanSrc = cleanSrc.split('/v1/crop/')[0];
      }
      images.push({
        src: src,
        cleanSrc: cleanSrc,
        alt: alt
      });
    }
  });

  // Extract YouTube embeds
  const youtubeEmbeds = [];
  $('iframe').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      youtubeEmbeds.push({
        src: src,
        width: $(el).attr('width') || '100%',
        height: $(el).attr('height') || '400'
      });
    }
  });

  // Extract links
  const links = [];
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      links.push({ href, text });
    }
  });

  // Try to identify page sections/structure
  const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    url,
    title,
    metaDescription,
    ogImage,
    headings,
    textBlocks,
    images,
    youtubeEmbeds,
    links,
    rawBodyText: rawBodyText.substring(0, 5000), // First 5000 chars for reference
    extractedAt: new Date().toISOString()
  };
}

/**
 * Take a screenshot of the page for reference
 * @param {import('puppeteer').Page} page
 * @param {string} outputPath
 */
export async function takeScreenshot(page, outputPath) {
  await page.screenshot({
    path: outputPath,
    fullPage: true
  });
}
