---
title: Placeholder post
description: A draft that exercises every piece of the post layout — byline, youtube embed, editor's note and a table — so CI validates them. Never published.
date: 2026-09-18
draft: true
permalink: /placeholder/
---

This post is a **draft**. The production build skips it; `npm run check` and
CI build it (`BUILD_DRAFTS=true`) so the post layout, the `youtube`
shortcode and their JSON-LD are validated on every push.

## A heading

A paragraph with a [link to the app](https://snowdesk.info/) and some `inline code`.

{% youtube "dQw4w9WgXcQ", "Placeholder walkthrough", "2026-09-18", "A stand-in video used to validate the embed markup." %}

- A list item
- Another list item

{% editor %}
An editor's note, in the site author's own voice rather than the post's. It
takes **Markdown**, including [a link](https://snowdesk.info/), and more than
one paragraph.

A post may carry several, each next to the passage it answers.
{% endeditor %}

| A table | Because | Posts use them |
|---|---|---|
| `static` | 7,791 | 96.4% |
| `rising` | 189 | 2.3% |
