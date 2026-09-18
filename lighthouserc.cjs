// Lighthouse CI: audit every page the sitemap lists (so every published
// post, automatically) against the production build in _site/.
// Only SEO is a gate — performance scores on a CI runner are noise.

const fs = require("node:fs");

const SITE = "https://build.snowdesk.info";
const sitemap = fs.readFileSync("_site/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) =>
  loc.replace(SITE, "http://localhost"),
);

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      url: urls,
      numberOfRuns: 1,
      settings: { onlyCategories: ["seo", "accessibility", "best-practices"] },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 1 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
