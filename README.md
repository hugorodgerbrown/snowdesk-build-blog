# Building Snowdesk

The "how we built it" blog for [Snowdesk](https://snowdesk.info/), served at
**https://build.snowdesk.info/**. It is a static [Eleventy](https://www.11ty.dev/)
site, deployed as a Render Static Site, with long-form posts on how the app works,
the decisions behind it, and video walkthroughs.

Posts are snapshots. They describe the app as it was when they were written and
don't need to track it afterwards.

## Running locally

```bash
nvm use            # Node 22 (see .nvmrc); anything >= 20.19 works
npm install
npm start          # http://localhost:8080, live reload, drafts included
```

| Command              | What it does                                                     |
|----------------------|------------------------------------------------------------------|
| `npm start`          | Dev server with live reload; drafts included                     |
| `npm run build`      | Production build into `_site/` (drafts excluded) — what Render runs |
| `npm run check`      | Build with drafts, validate HTML, check internal links (CI job 1) |
| `npm run lighthouse` | Production build + Lighthouse on every sitemap URL (CI job 2)    |

## Adding a post

1. Create `src/posts/<slug>.md` (or `.html`). The file name becomes the URL:
   `src/posts/the-map.md` → `https://build.snowdesk.info/the-map/`.
2. Give it front matter:

   ```yaml
   ---
   title: The map
   description: One or two sentences. Used as the meta description, the lede, the feed summary and in llms.txt.
   date: 2026-10-01
   # updated: 2026-11-15   # optional; shown on the post and used as dateModified / lastmod
   # draft: true           # optional; built by `npm start` and CI, never published
   ---
   ```

3. Write the post in Markdown. Raw HTML is fine inline, so an existing HTML
   document can be pasted into a `.html` post (drop its `<html>`, `<head>` and
   `<body>`; keep only the content).
4. Embed a video with the `youtube` shortcode:

   ```njk
   {% youtube "VIDEO_ID", "Title of the video", "2026-10-01", "One-sentence description." %}
   ```

   This renders a lazy-loaded `youtube-nocookie.com` embed **and** the
   `VideoObject` JSON-LD search engines need to index the video from the post.

5. Add an editorial note with the `editor` shortcode. It takes Markdown, and a
   post may carry several — put each next to the passage it answers:

   ```njk
   {% editor %}
   A correction, a disagreement, or the context only the editor has.
   {% endeditor %}
   ```

   Posts are written by Claude and edited by the site author: every post carries
   that byline, and the `Article` JSON-LD names Claude as `author` and the site
   author as `editor`. Both read from `src/_data/site.js`, so the page and its
   structured data cannot drift apart. The note is the one part of a post that
   speaks in the editor's voice.

The post layout, index, Atom feed, `sitemap.xml` and `llms.txt` all pick the post
up automatically. There is nothing else to edit.

## What is generated for SEO / AEO

- A canonical URL, meta description, Open Graph and Twitter tags on every page.
- `WebSite` + `Organization` JSON-LD on every page, and `Article` JSON-LD on every post.
- `VideoObject` JSON-LD for every `youtube` embed.
- `/sitemap.xml` (drafts and `noindex` pages excluded), `/feed.xml` (Atom),
  `/llms.txt`, and a `/robots.txt` that allows everything, naming the major
  AI crawlers explicitly.

Site-wide metadata (URL, title, description, author, the app's URL) lives in
`src/_data/site.js`.

## Deploying

`render.yaml` is a Render Blueprint for the Static Site. First-time setup:

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick this repo. This creates the `snowdesk-build-blog`
   static site (build `npm ci && npm run build`, publish `_site`, Node 22).
3. Add a DNS `CNAME` record: `build` → the site's `*.onrender.com` hostname. Render
   issues the TLS certificate once the record resolves.
4. In Google Search Console, add `https://build.snowdesk.info/` as a property and
   submit `https://build.snowdesk.info/sitemap.xml`.

Every push to `main` then redeploys. Pull requests get a Render preview.

## Layout

```
src/
  _data/site.js           site-wide metadata
  _includes/layouts/      base.njk (every page), post.njk (every post)
  posts/                  one file per post; posts.json tags them and sets the layout
  assets/                 CSS and self-hosted DM Sans (copied as-is)
  index.njk               post index
  sitemap.njk robots.njk llms.njk 404.njk
eleventy.config.js        drafts, youtube shortcode, filters, Atom feed
```

DM Sans is licensed under the SIL Open Font License 1.1.
