# MASCP Website Crawler

Extracts content from the MASCP Wix website for migration to a new host.

## Setup

```bash
cd crawler
npm install
```

## Usage

### Full crawl (all pages + images)
```bash
npm run crawl
```

### Test with single page
```bash
npm run crawl:single
```

### With screenshots
```bash
node src/index.js --screenshots
```

### Skip image downloads (faster)
```bash
node src/index.js --skip-images
```

## Output Structure

```
output/
├── summary.json          # Crawl summary and stats
├── data/                 # Extracted content (JSON per page)
│   ├── home.json
│   ├── about.json
│   └── ...
├── pages/                # Raw HTML snapshots
│   ├── home.html
│   └── ...
├── assets/               # Downloaded images (by page)
│   ├── home/
│   ├── about/
│   └── ...
└── screenshots/          # Full-page screenshots (optional)
```

## JSON Output Format

Each page JSON file contains:

```json
{
  "url": "https://www.mascp.org/about-1",
  "slug": "about",
  "title": "Page Title",
  "metaDescription": "...",
  "headings": [
    { "level": "h1", "text": "..." }
  ],
  "textBlocks": [
    { "text": "...", "html": "..." }
  ],
  "images": [
    { "src": "...", "alt": "..." }
  ],
  "youtubeEmbeds": [
    { "src": "...", "width": "...", "height": "..." }
  ],
  "links": [
    { "href": "...", "text": "..." }
  ]
}
```

## Notes

- Product/shop pages are excluded (obsolete)
- YouTube embeds are preserved as-is (no download needed)
- Images are downloaded from wixstatic.com CDN
- Wix sites render via JavaScript, so this uses Puppeteer (headless Chrome)
