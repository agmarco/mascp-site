import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PAGES, EVENT_PAGES, OUTPUT_DIR } from './config.js';
import { extractPageContent, takeScreenshot } from './scraper.js';
import { downloadAllImages } from './downloader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputBase = path.resolve(__dirname, '..', OUTPUT_DIR);

async function crawlPage(browser, pageConfig, options = {}) {
  const { url, slug } = pageConfig;
  console.log(`\n📄 Crawling: ${slug} (${url})`);

  const page = await browser.newPage();

  // Set a reasonable viewport
  await page.setViewport({ width: 1440, height: 900 });

  // Set user agent to avoid bot detection
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Extract content
    const content = await extractPageContent(page, url);
    content.slug = slug;

    // Save JSON data
    const dataDir = path.join(outputBase, 'data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, `${slug}.json`), content, { spaces: 2 });
    console.log(`  ✓ Saved data: ${slug}.json`);

    // Take screenshot for reference
    if (options.screenshots) {
      const screenshotDir = path.join(outputBase, 'screenshots');
      await fs.ensureDir(screenshotDir);
      await takeScreenshot(page, path.join(screenshotDir, `${slug}.png`));
      console.log(`  ✓ Saved screenshot: ${slug}.png`);
    }

    // Download images
    if (content.images.length > 0 && options.downloadImages) {
      const assetsDir = path.join(outputBase, 'assets', slug);
      const imageResults = await downloadAllImages(content.images, assetsDir);
      content.downloadedImages = imageResults;
      // Update JSON with download info
      await fs.writeJson(path.join(dataDir, `${slug}.json`), content, { spaces: 2 });
      console.log(`  ✓ Downloaded ${imageResults.filter(r => r.success).length}/${content.images.length} images`);
    }

    // Save raw HTML for reference
    const pagesDir = path.join(outputBase, 'pages');
    await fs.ensureDir(pagesDir);
    const rawHtml = await page.content();
    await fs.writeFile(path.join(pagesDir, `${slug}.html`), rawHtml);
    console.log(`  ✓ Saved HTML: ${slug}.html`);

    return content;

  } catch (error) {
    console.error(`  ✗ Error crawling ${slug}: ${error.message}`);
    return { url, slug, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const singleMode = args.includes('--single');
  const withScreenshots = args.includes('--screenshots');
  const skipImages = args.includes('--skip-images');

  console.log('🕷️  MASCP Website Crawler');
  console.log('========================\n');
  console.log(`Output directory: ${outputBase}`);
  console.log(`Screenshots: ${withScreenshots ? 'Yes' : 'No (use --screenshots to enable)'}`);
  console.log(`Download images: ${skipImages ? 'No' : 'Yes (use --skip-images to skip)'}`);

  // Ensure output directories exist
  await fs.ensureDir(outputBase);

  // Launch browser
  console.log('\n🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allPages = [...PAGES, ...EVENT_PAGES];
  const results = [];

  const options = {
    screenshots: withScreenshots,
    downloadImages: !skipImages
  };

  if (singleMode) {
    // Just crawl the first page for testing
    console.log('\n🧪 Single page mode (testing)');
    const result = await crawlPage(browser, allPages[0], options);
    results.push(result);
  } else {
    // Crawl all pages
    console.log(`\n📋 Crawling ${allPages.length} pages...`);

    for (const pageConfig of allPages) {
      const result = await crawlPage(browser, pageConfig, options);
      results.push(result);

      // Small delay between pages
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Close browser
  await browser.close();

  // Generate summary
  const summary = {
    crawledAt: new Date().toISOString(),
    totalPages: results.length,
    successful: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    pages: results.map(r => ({
      slug: r.slug,
      url: r.url,
      title: r.title,
      images: r.images?.length || 0,
      youtubeEmbeds: r.youtubeEmbeds?.length || 0,
      error: r.error
    }))
  };

  await fs.writeJson(path.join(outputBase, 'summary.json'), summary, { spaces: 2 });

  console.log('\n\n📊 Crawl Summary');
  console.log('================');
  console.log(`Total pages: ${summary.totalPages}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`\nResults saved to: ${outputBase}`);

  if (summary.failed > 0) {
    console.log('\n❌ Failed pages:');
    results.filter(r => r.error).forEach(r => {
      console.log(`  - ${r.slug}: ${r.error}`);
    });
  }
}

main().catch(console.error);
