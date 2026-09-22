// Eleventy configuration for build.snowdesk.info.
//
// Sources live in src/, output goes to _site/ (what Render publishes).
// Posts are the `posts` collection (tagged by src/posts/posts.json); the
// index, sitemap, llms.txt and Atom feed are all generated from it, so a
// new post never means hand-editing another file.
//
// Drafts: a post with `draft: true` is skipped unless BUILD_DRAFTS=true.
// CI builds with drafts so the placeholder post (which exercises the
// youtube shortcode) is validated; the production build on Render omits them.

import { feedPlugin } from "@11ty/eleventy-plugin-rss";

import site from "./src/_data/site.js";

/**
 * Escape a string for safe interpolation into an HTML attribute.
 * @param {string} value
 * @returns {string}
 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Render a privacy-enhanced YouTube embed plus its VideoObject JSON-LD.
 *
 * Usage in a post: {% youtube "VIDEO_ID", "Title", "2026-09-18", "Description" %}
 *
 * @param {string} id YouTube video ID.
 * @param {string} title Video title (used for the iframe title and JSON-LD name).
 * @param {string} uploadDate ISO date the video was published.
 * @param {string} [description] One-sentence description for JSON-LD.
 * @returns {string}
 */
function youtube(id, title, uploadDate, description = "") {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    throw new Error(`youtube shortcode: "${id}" is not a YouTube video ID`);
  }
  if (!title || !uploadDate) {
    throw new Error(`youtube shortcode: video ${id} needs a title and an uploadDate`);
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description || title,
    uploadDate,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
  };
  return `<figure class="video">
<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${escapeAttr(title)}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<figcaption>${escapeAttr(title)}</figcaption>
</figure>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`;
}

// The two axes a post can lean on. Technical readers build software and want
// the mechanism; product readers use apps of this kind and want to know how a
// feature was designed. Almost nobody is both, so a post declares which it
// serves and the writing follows from that.
const AUDIENCES = {
  technical: "Technical",
  product: "Product",
};

/**
 * Validate a post's `audience` front matter and return its display labels.
 *
 * Throws rather than falling back, so a post that forgets to declare an
 * audience — or invents a third one — fails the build instead of shipping
 * uncategorised.
 *
 * @param {string[]|string} value The `audience` front-matter value.
 * @param {string} [title] The post's title, for the error message.
 * @returns {{name: string, label: string}[]}
 */
function audienceLabels(value, title = "a post") {
  const names = Array.isArray(value) ? value : value ? [value] : [];
  if (names.length === 0) {
    throw new Error(
      `audience: "${title}" declares none. Use [technical], [product], or both.`,
    );
  }
  return names.map((name) => {
    if (!AUDIENCES[name]) {
      throw new Error(
        `audience: "${name}" on "${title}" is not one of ${Object.keys(AUDIENCES).join(", ")}`,
      );
    }
    return { name, label: AUDIENCES[name] };
  });
}

/**
 * Render an editor's note — the site author's own commentary on a post,
 * set apart from the post's voice.
 *
 * Usage in a post:
 *
 *   {% editor %}
 *   The comment, written as Markdown.
 *   {% endeditor %}
 *
 * The blank lines around `content` are load-bearing. A block-level HTML tag
 * opens a CommonMark HTML block that ends at the first blank line, so the
 * content after it is parsed as Markdown and the closing tag opens a block of
 * its own. Without them the note renders as literal text, links and all.
 *
 * @param {string} content Inner Markdown.
 * @param {string} [label] Heading shown above the note.
 * @returns {string}
 */
function editor(content, label = "Editor's note") {
  if (!content || !content.trim()) {
    throw new Error("editor shortcode: the note is empty");
  }
  return `<aside class="editor-note">
<p class="editor-note-label">${escapeAttr(label)}</p>

${content.trim()}

</aside>`;
}

/**
 * Eleventy entry point.
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 */
export default function (eleventyConfig) {
  const buildDrafts = process.env.BUILD_DRAFTS === "true";

  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && !buildDrafts) {
      return false;
    }
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  eleventyConfig.addShortcode("youtube", youtube);
  eleventyConfig.addPairedShortcode("editor", editor);

  eleventyConfig.addFilter("audienceLabels", audienceLabels);
  eleventyConfig.addFilter("audienceSchema", (audiences) =>
    audiences.map(({ label }) => ({ "@type": "Audience", audienceType: label })),
  );
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));
  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  );
  eleventyConfig.addFilter("siteUrl", (path) => new URL(path, site.url).href);
  eleventyConfig.addFilter("jsonLd", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: site.language,
      title: site.title,
      subtitle: site.description,
      base: site.url,
      author: { name: site.author.name },
    },
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
