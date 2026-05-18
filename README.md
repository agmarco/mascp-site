# MASCP Website

The Madison Arcatao Sister City Project website, migrated from Wix to a statically-generated Eleventy site.

- **Live URL:** https://mascp.netlify.app/
- **Production domain (pending):** https://www.mascp.org/ — DNS cutover is the only remaining step to go live
- **Netlify account:** Log in at netlify.com via GitHub (agmarco)
- **GitHub repo:** https://github.com/agmarco/mascp-site

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Static site generator | [Eleventy](https://www.11ty.dev/) v2 |
| CSS | Tailwind CSS v3 |
| CMS | Netlify CMS (git-gateway) |
| Forms | Netlify Forms (contact form) |
| Newsletter | MailerLite |
| Hosting | Netlify (auto-deploys on push to `main`) |

---

## Local Development

```bash
cd site
npm install
npm run dev      # builds CSS + starts Eleventy dev server with live reload
```

Build for production:

```bash
npm run build    # outputs to site/_site/
```

---

## Project Structure

```
/site
  /src
    /assets
      /css          # Tailwind input.css → compiled style.css
      /images       # All site images (organized by page)
    /events         # Event markdown files
    /pages          # Page markdown files
    /admin          # Netlify CMS config (config.yml + index.html)
    /_data
      navigation.json   # Main nav structure
      social.json       # Facebook / YouTube links
      site.json         # Site name, URL, MailerLite IDs
    /_includes
      /layouts          # Nunjucks layout templates
        base.njk        # Wraps all pages: header, nav, newsletter footer
        page.njk        # Generic page with hero image + prose content
        home.njk        # Homepage layout
        contact.njk     # Contact form layout
        donate.njk      # Donation page layout
        (others)        # Page-specific layouts for richer pages
  .eleventy.js          # Eleventy config
  package.json
/crawler                # Puppeteer scripts used to extract content from Wix (archival)
```

---

## Creating a New Page

1. Create a new markdown file in `site/src/pages/`:

```markdown
---
title: "Page Title"
layout: layouts/page.njk
permalink: /your-url-slug/
heroImage: "/assets/images/your-page/image.jpg"
description: "Optional meta description"
---

Your page content in Markdown here.
```

2. Add the page to navigation in `site/src/_data/navigation.json` if it should appear in the menu:

```json
{ "label": "Your Page", "url": "/your-url-slug/" }
```

To add it as a dropdown item under an existing menu group, add it to the relevant `children` array in `navigation.json`.

3. Push to `main` — Netlify will build and deploy automatically.

**Available layouts:**
- `layouts/page.njk` — standard page with hero image and prose content (use this for most new pages)
- `layouts/base.njk` — bare layout, only header/footer, full control over content
- Page-specific layouts (about, contact, donate, etc.) exist for pages with custom structure

### Via the CMS (no-code)

Go to https://mascp.netlify.app/admin/ and log in with your GitHub account. Under **Pages**, click **New Page** and fill in the fields. The CMS writes the markdown file to the repo and triggers a deploy.

---

## Creating a New Event

Events live in `site/src/events/` as markdown files.

```markdown
---
title: "Event Name"
layout: layouts/page.njk
date: 2026-06-01T18:00:00.000Z
heroImage: "/assets/images/event-name/banner.jpg"
location: "Location Name"
description: "Short event description"
---

Full event details in Markdown.

## Time & Location
## About the event
## How to register
```

Or use the CMS: go to `/admin/` → **Events** → **New Event**.

---

## Newsletter (MailerLite)

### How subscribers are collected

A signup form (name + email) is embedded in the footer of every page via `base.njk`. On submit it posts directly to MailerLite via their JSONP API — no backend needed.

**MailerLite credentials stored in `site/src/_data/site.json`:**
```json
{
  "mailerlite_account_id": "2055511",
  "mailerlite_form_id": "181934846012032600"
}
```

Log in to MailerLite at mailerlite.com to manage subscribers, view signups, and send campaigns.

### Sending a newsletter

1. Log in to [mailerlite.com](https://mailerlite.com)
2. Go to **Campaigns** → **Create Campaign**
3. Choose your subscriber group and compose the email
4. Send or schedule

Contacts from the original Wix mailing list have already been migrated into MailerLite.

### Updating the form ID

If you ever create a new MailerLite form, update `site/src/_data/site.json` with the new account/form IDs, or update them via the CMS under **Site Settings → Site Settings**.

---

## Contact Form

The contact form at `/contact/` uses **Netlify Forms**. Submissions are collected in the Netlify dashboard under **Forms** — no third-party service needed.

To view submissions: log in to netlify.com → your site → **Forms**.

---

## Navigation

Edit `site/src/_data/navigation.json` to update the main nav. Supports top-level links and one level of dropdowns via `children`:

```json
{
  "label": "Our Work",
  "url": "#",
  "children": [
    { "label": "Fair Trade", "url": "/fair-trade/" },
    { "label": "Scholarships", "url": "/scholarships/" }
  ]
}
```

Or update via CMS: **Site Settings → Navigation**.

---

## Social Links

Edit `site/src/_data/social.json` to update Facebook/YouTube links shown in the header. Or via CMS: **Site Settings → Social Links**.

---

## Going Live (DNS Cutover)

Everything is deployed and working. The only remaining step is pointing mascp.org to Netlify:

1. Log in to your domain registrar (wherever mascp.org DNS is managed)
2. In the Netlify dashboard, go to **Site Configuration → Domain Management → Add custom domain** and enter `mascp.org`
3. Update your DNS records to point to Netlify's servers (Netlify will show you the exact values)
4. Wait for DNS propagation (usually a few minutes to a few hours)
5. Netlify will automatically provision an SSL certificate via Let's Encrypt

---

## Deployment

Every push to `main` triggers an automatic build and deploy on Netlify. Build config is in `netlify.toml`:

- **Build command:** `npm run build` (from the `site/` directory)
- **Publish directory:** `site/_site`
- **Node version:** 18
