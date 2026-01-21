# MASCP Website Migration Project

## Overview
Migration of the MASCP website from Wix to an ethical alternative host.

**Current URL:** https://www.mascp.org/
**Current Platform:** Wix (Thunderbolt renderer)
**Reason for Migration:** Move away from Wix to a host that does not support the IDF

---

## About MASCP

**Madison Arcatao Sister City Project** is a not-for-profit volunteer organization established in 1986 when Madison's Common Council named Arcatao its first official sister city.

**Mission:** As part of the U.S.-El Salvador Sister Cities (USESSC) network, MASCP works for social change by building and defending sustainable communities and economies based on solidarity, dignity, and self-determination. The work is driven by mutual community accompaniment, organizing, education, advocacy, and fundraising.

**Structure:**
- Board of 6-8 members providing leadership
- 250+ Friends of MASCP who participate financially and volunteer
- Part of USESSC - a nationwide organization joining all 17 US-El Salvador sister cities

**Purpose:** Through MASCP, people in Madison and Arcatao nurture friendships that energize them to work for social and economic justice at home and beyond the boundaries of their own countries.

---

## Site Analysis

### Technical Details
- **Platform:** Wix Thunderbolt (client-side rendered)
- **Content Type:** Primarily static pages with some dynamic elements
- **Rendering:** JavaScript-based (content not in initial HTML)
- **Media CDN:** static.wixstatic.com

### Site Structure

#### Main Pages (22 pages)
| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/about-1` | About page |
| `/history` | Organization history |
| `/activities` | Activities/programs |
| `/scholarships` | Scholarship information |
| `/copy-of-scholarships` | Scholarships (alternate) |
| `/anti-mining` | Anti-mining advocacy |
| `/copy-of-anti-mining` | Anti-mining (alternate) |
| `/fair-trade-1` | Fair trade initiatives |
| `/copy-of-fair-trade` | Fair trade (alternate) |
| `/get-involved-1` | How to get involved |
| `/donate-1` | Donation page |
| `/contact-us-1` | Contact information |
| `/resources-1` | Resources |
| `/newsletter-archive` | Newsletter archive |
| `/event-list` | Events listing |
| `/upcoming-events` | Upcoming events |
| `/celebrations` | Celebrations |
| `/shop` | Online shop |
| `/copy-of-our-work` | Our work (alternate) |
| `/copy-of-delegations` | Delegations (alternate) |
| `/2017-holiday-fair-signup` | Legacy event signup |

#### Product Pages
**SKIP** - Shop is obsolete and hidden. Do not migrate.

#### Event Pages (6 events)
| URL | Event |
|-----|-------|
| `/event-details/community-organizing-that-leads-to-national-change` | Community organizing workshop |
| `/event-details/8-oclock-buzz-interview-with-cintia-and-zulma` | Interview event |
| `/event-details/mascps-annual-pupusa-dinner-and-fundraiser` | Annual fundraiser |
| `/event-details/social-mobilization-around-environmental-issues` | Environmental activism |
| `/event-details/the-essential-role-of-community-organizing-in-national-change` | Community organizing |
| `/event-details/water-is-life-stories-of-grassroots-environmental-activism-in-el-salvador-and-the-united-states` | Water activism stories |

---

## Migration Challenges

### Wix Limitations
1. **No native export** - Wix does not provide HTML/content export
2. **JavaScript rendering** - Content is client-side rendered, not in raw HTML
3. **Proprietary media hosting** - Images hosted on `static.wixstatic.com`
4. **Dynamic components** - Shop, events, forms use Wix infrastructure
5. **Custom fonts/styles** - Embedded via Wix's system

### Content Types to Extract
- [x] Page URLs identified
- [ ] Text content (requires JS execution)
- [ ] Images and media files
- [ ] Forms structure
- [ ] Navigation structure
- [ ] Styling/branding elements

### Content to Skip
- **Product/Shop pages** - Obsolete, do not migrate
- **YouTube videos** - Keep as embeds, no need to download (reuse existing links)

---

## Migration Strategy

### Phase 1: Content Extraction (Crawler)
Build a headless browser crawler to:
1. Visit each page and wait for JS rendering
2. Extract rendered HTML content
3. Download all images/media from wixstatic.com
4. Capture navigation structure
5. Save page metadata (titles, descriptions)

**Recommended Tools:**
- **Puppeteer** (Node.js) - Best for JS-heavy sites
- **Playwright** (Node.js/Python) - Cross-browser support

### Phase 2: Content Processing
1. Clean extracted HTML (remove Wix-specific code)
2. Rewrite image URLs to local paths
3. Convert to static site generator format (Hugo, Eleventy, or Astro)
4. Preserve SEO metadata

**Decision:** Use Option C - Extract content, apply a clean template. Layout is simple with clear sections per page. Style preservation not needed.

### Phase 3: New Hosting Setup
**Recommended Ethical Hosts:**
- **Netlify** - Free tier, static hosting
- **Vercel** - Free tier, great for static/JAMstack
- **GitHub Pages** - Free, version controlled
- **Cloudflare Pages** - Free tier, fast CDN
- **Greenhost.net** - Ethical hosting (Netherlands)
- **Webarchitects** - UK cooperative hosting

### Phase 4: Feature Migration
| Feature | Migration Approach |
|---------|-------------------|
| Static pages | Direct HTML migration |
| Contact forms | Formspree, Netlify Forms, or custom |
| Shop | Shopify, WooCommerce, or Stripe checkout |
| Events | Eventbrite embed, or custom calendar |
| Newsletter | Mailchimp, Buttondown integration |
| Donations | Stripe, PayPal direct integration |

---

## Crawler Implementation Plan

### Directory Structure
```
/crawler
  /src
    index.js          # Main crawler entry
    scraper.js        # Page content extraction
    downloader.js     # Asset downloading
    cleaner.js        # HTML cleanup
  /output
    /pages            # Extracted HTML
    /assets           # Downloaded images/files
    /data             # JSON metadata
  package.json
```

### Key Dependencies
- puppeteer - Headless browser
- cheerio - HTML parsing
- fs-extra - File operations

---

## Progress Tracking

- [ ] Phase 1: Build/configure crawler
- [ ] Phase 2: Run extraction on all pages
- [ ] Phase 3: Download all media assets
- [ ] Phase 4: Clean and process HTML
- [ ] Phase 5: Choose and setup new host
- [ ] Phase 6: Deploy static site
- [ ] Phase 7: Migrate dynamic features (shop, forms, donations)
- [ ] Phase 8: DNS cutover
- [ ] Phase 9: Verify and test

---

## Notes

- Some "copy-of-*" pages may be Wix duplicates or drafts - verify which to keep
- Shop functionality will need separate e-commerce solution
- Consider using a static site generator (Hugo, Eleventy, Astro) for easier maintenance
- Preserve URL structure for SEO continuity
- Set up 301 redirects for any changed URLs
