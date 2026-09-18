# CLAUDE.md — snowdesk-build-blog

Static Eleventy site for **build.snowdesk.info**: the "how we built it" blog for
Snowdesk (the app lives in the separate `snowdesk-data-pipeline` repo). Deployed
as a Render Static Site via `render.yaml`. See README.md for commands and how to
add a post.

## Rules

- **Static output only.** No client-side JavaScript except JSON-LD. Nothing here
  may need a server.
- **The blog is deliberately separate from the app.** None of the app repo's CI,
  design-system linters or CLAUDE.md rules apply here, and nothing from the app
  is imported at build time. Colours and fonts were copied once from the app's
  `src/css/main.css` and do not need to track it.
- **Posts are snapshots.** Don't go back and "update" an old post to match the
  current app unless asked; set `updated:` in its front matter when you do.
- **Every post needs `title`, `description` and `date`.** The description feeds
  the meta description, lede, feed and llms.txt.
- **Video is YouTube only, via the `youtube` shortcode.** Never commit video files.
- **SEO/AEO output is generated, not hand-written.** Change `src/_data/site.js`
  or the layouts, never a single page's meta tags.
- British English spelling (colour, behaviour, organise).

## Before pushing

```bash
npm run check        # build with drafts + html-validate + internal link check
npm run lighthouse   # production build + Lighthouse SEO/a11y gate
```

## Gotcha

`@11ty/eleventy-plugin-rss` registers its own `absoluteUrl` filter, which
overrides any project filter of that name and takes a second `base` argument.
Our filter is therefore called `siteUrl`; use it for canonical, sitemap and
llms.txt URLs.
