---
name: blog-post
description: Write a post for build.snowdesk.info, the "how we built it" blog for Snowdesk. Use this whenever a post is wanted for this blog — "write this week's post", "write a post about the weather model", "pick something and write it up", a scheduled weekly run, or any request to add something to src/posts/. It chooses a topic, gets the facts from the Snowdesk app repo rather than guessing, writes in the blog's voice, and leaves a validated draft for review.
---

# Writing a post for build.snowdesk.info

This blog explains how Snowdesk is built: the avalanche-bulletin pipeline, the
map, weather, routes, trips, and the decisions behind them. The app itself lives
in a separate repository, so every post is an act of reporting — you go and read
the code, then explain it.

The reader is technically literate and knows nothing about avalanche forecasting.
They should finish a post able to explain the decision to someone else.

**The default is a draft.** Write `draft: true` in the front matter and leave it
there. Hugo reads the post and removes the flag when it is ready to publish. A
post deploys the moment that flag goes, so publishing is his call, not yours.

## What a post is

A post lifts the lid on one feature, or one area of the app: what it does for
someone using Snowdesk, and how it was built.

The model is the series of explainers Hugo has already published as Artifacts —
*From GPX to Line*, *Anatomy of a Route*, *Inside the Snowdesk Map*. Read one
before writing, and match it: one feature followed end to end, real screenshots
or figures drawn to carry the argument, and the honest limits stated rather than
left for the reader to discover. Several are finished and need porting rather
than writing; the backlog says which. The app repo's `docs/` explainers —
`render-model.md`, `mutation-queue.md`, `day-summary.md` — are the raw material
for the ones not yet written.

**The explanation is the content.** Decisions belong inside it, as the reasons a
part works the way it does, not as the subject. A reader wants to know how the
day-character callout on a bulletin page is built; that eighty sentences were
hand-authored rather than generated is part of that answer, and it lands because
the reader now knows what the sentences are for.

So each post owes the reader three things:

1. **What this part does**, in terms of someone on a mountain holding a phone.
2. **How it works** — the pieces, named in real code, in the order the data
   moves through them.
3. **Why it is built that way** where the answer is not obvious, including what
   the choice cost.

A post that stops after 1 is marketing. One that starts at 3 is a decision
record with a different file extension.

## Step 1 — choose the topic

Read [references/topics.md](references/topics.md). It lists where the material is
in the app repo, how to check a topic has not already been covered, and how to
rotate between kinds of post so the blog does not become seventy variations on
one shape.

Before writing, say in one line what the post will argue — "why weather is one
immutable row per location per day" — and check that it holds up once you have
read the code. If the code contradicts the doc you picked, the contradiction is
a better post than the one you planned.

## Step 2 — get the facts

The app repository is a sibling checkout at
`/Users/hugo/Projects/snowdesk-data-pipeline`. Treat it as read-only: never edit
it, never commit to it.

Docs in that repo carry `last-reviewed` dates and can lag the code. Read the
source files a doc points at and let the code settle any disagreement. Specifics
are what make a post credible — a model name, a management command, a constant
and the reasoning behind its value — so collect more than you will use.

Three things never leave that repo:

- **`.env`, `.vapid-private.pem`, and any key, token or API credential.** Do not
  read them, do not quote them, do not name their values. That Météo-France
  needs an API key is public and fine; the key is not.
- **`db.sqlite3`.** It holds real user rows. Nothing from it appears in a post.
- **Anything about a named person** other than Hugo, who writes the blog.

If a claim cannot be traced to code, a doc or a commit, either leave it out or
mark it plainly as an opinion ("we think", "the bet is that").

## Step 3 — write it

Read [references/voice.md](references/voice.md) for the house style, then write
the post. Aim for 800–1,400 words: long enough to carry one argument with real
detail, short enough to read in a sitting.

Use British English — colour, behaviour, organise, modelled.

## Step 4 — file it

Create `src/posts/<slug>.md`. The file name becomes the URL, so the slug is the
title reduced to words that will still make sense in a link a year from now.

```yaml
---
title: Weather is one row, and it never changes
description: One or two sentences. This is the meta description, the lede on the page, the feed summary and the llms.txt entry, so it has to stand alone.
date: 2026-09-21
draft: true
sources:
  - snowdesk-data-pipeline docs/decisions/weather-is-one-immutable-location-row.md
  - snowdesk-data-pipeline apps/weather/services/upsert.py
---
```

`title`, `description` and `date` are required by the layouts. `sources` is for
the next person writing a post: it records what this one drew on, and is how
Step 1 checks a topic has not already been used. The layouts ignore it.

**The `editor` shortcode is not yours to use.** Every post carries a byline
saying Claude wrote it and Hugo edited it, and the editor's note is the one
place on the page that speaks in Hugo's voice — a correction, a disagreement,
the context only he has. Writing one yourself puts words in his mouth, so leave
it out entirely and let him add it during review. It exists in
`eleventy.config.js` and is exercised by the placeholder post:

```njk
{% editor %}
His comment, as Markdown.
{% endeditor %}
```

Video only ever goes in through the `youtube` shortcode, and only when Hugo has
given you a real video ID — never invent one, and never commit a video file:

```njk
{% youtube "VIDEO_ID", "Title", "2026-09-21", "One-sentence description." %}
```

## Step 5 — check it

```bash
npm install     # only if node_modules is absent — a fresh worktree has none
npm run check
```

This builds with drafts, validates the HTML and checks internal links. It has to
pass before you hand the post over: internal links break silently otherwise, and
a post with a dead link is worse than a post that shipped a week later.

## Step 6 — hand it over

Commit on a branch, with Claude as author and Hugo as committer:

```bash
git commit --author="Claude <noreply@anthropic.com>" -m "subject"
```

Then tell Hugo, in a few lines: what the post argues, which claims you would most
like a second pair of eyes on, and anything you could not verify. Name the weak
spots rather than presenting the draft as finished — you read the code quickly
and he has lived in it.
