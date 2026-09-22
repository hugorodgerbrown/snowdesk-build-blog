// Site-wide metadata: the one place the blog's URL, name and the app it
// describes are written down. Every layout, the feed and the JSON-LD read
// from here.

export default {
  url: "https://build.snowdesk.info/",
  title: "Building Snowdesk",
  description:
    "How Snowdesk works and how we built it: avalanche bulletins, the map, weather, routes and trips, with the decisions behind them.",
  language: "en-GB",
  author: {
    name: "Hugo Rodger-Brown",
  },
  // Posts are written by Claude and edited by the site author. Both the
  // visible byline on a post and its Article JSON-LD read from here, so the
  // page and its structured data cannot drift apart.
  //
  // schema.org only permits Person or Organization as an `author`, and Claude
  // is neither in the strict sense. Organization is the closest valid type and
  // keeps the Article eligible for rich results; the url names the product.
  writer: {
    name: "Claude",
    url: "https://www.anthropic.com/claude",
  },
  app: {
    name: "Snowdesk",
    url: "https://snowdesk.info/",
  },
};
