---
name: blog-post
description: Write a post for build.snowdesk.info, the "how we built it" blog for Snowdesk. Use this whenever a post is wanted for this blog — "write this week's post", "write a post about the weather model", "pick something and write it up", a scheduled weekly run, or any request to add something to src/posts/. It chooses a topic, gets the facts from the Snowdesk app repo rather than guessing, writes in the blog's voice, and leaves a validated draft for review.
---

# Writing a post for build.snowdesk.info

This blog explains how Snowdesk is built: the avalanche-bulletin pipeline, the
map, weather, routes, trips, and the decisions behind them. The app itself lives
in a separate repository, so every post is an act of reporting — you go and read
the code, then explain it.

## Who reads this

Two audiences, and they arrive from different directions.

**Technical.** People who build software and want to know how this one works.
They will read a data model, a classifier, a caching rule or a thinning
algorithm, and they do not know or care about avalanche forecasting until you
give them a reason to.

**Product.** People who use apps of this kind — mountain trip planning, weather,
conditions — and want to know how a feature was designed. They will read about
what a screen shows, what it refuses to show and why, and they have opinions
about it. They are not reading pseudocode.

The ideal reader sits in the intersection and there are almost none of them. So
a post leans one way or the other, deliberately, and says which. An algorithm
post is technical. A post about drawing terrain along a track is product. A few
are genuinely both, and those are the best ones — but "both" has to be earned by
serving each side properly, not by writing something halfway that lands with
neither.

Declare it in the front matter, as one or both values:

```yaml
audience: [technical]
audience: [product]
audience: [technical, product]
```

The build fails on a missing or unknown value, so the choice cannot be skipped.
Decide it before writing, not after: it governs what you open on, how much code
you show, and where the detail goes. [references/voice.md](references/voice.md)
says how each one reads.

**The default is a draft.** Write `draft: true` in the front matter and leave it
there. The editor reads the post and removes the flag when it is ready to
publish. A post deploys the moment that flag goes, so publishing is their call,
not yours.

## What a post is

A post lifts the lid on one feature, or one area of the app: what it does for
someone using Snowdesk, and how it was built.

The model is the series of explainers the editor has already published as
Artifacts — *From GPX to Line*, *Anatomy of a Route*, *Inside the Snowdesk
Map*. Read one
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

The audience decides the weighting. A **technical** post spends most of its
length on 2, and 1 exists to make the reader care. A **product** post spends
most of its length on 1 and 3 — what the screen says, what it refuses to say —
and treats 2 as the evidence that the claim is real rather than as the subject.
A post marked **both** owes each side a full share: a product reader must be
able to stop before the mechanism and still have read something complete.

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

The app repository is a checkout of `snowdesk-data-pipeline` sitting beside this
one. Resolve it once rather than hardcoding a path, so the skill works from a
worktree and on anyone's machine:

```bash
APP_REPO="${SNOWDESK_APP_REPO:-$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/../.." && pwd)/snowdesk-data-pipeline}"
```

Set `SNOWDESK_APP_REPO` if it lives somewhere else. Treat it as read-only:
never edit it, never commit to it.

Docs in that repo carry `last-reviewed` dates and can lag the code. Read the
source files a doc points at and let the code settle any disagreement. Specifics
are what make a post credible — a model name, a management command, a constant
and the reasoning behind its value — so collect more than you will use.

Three things never leave that repo:

- **`.env`, `.vapid-private.pem`, and any key, token or API credential.** Do not
  read them, do not quote them, do not name their values. That Météo-France
  needs an API key is public and fine; the key is not.
- **`db.sqlite3`.** It holds real user rows. Nothing from it appears in a post.
- **Anything identifying a person** — a name, an email address, or a home
  directory inside a file path. A post is about the code and needs none of
  them; write paths relative to a repository root.

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
audience: [technical]
draft: true
sources:
  - snowdesk-data-pipeline docs/decisions/weather-is-one-immutable-location-row.md
  - snowdesk-data-pipeline apps/weather/services/upsert.py
---
```

`title`, `description`, `date` and `audience` are required. `sources` is for
the next person writing a post: it records what this one drew on, and is how
Step 1 checks a topic has not already been used. The layouts ignore it.

**The `editor` shortcode is not yours to use.** Every post carries a byline
saying Claude wrote it and the site author edited it, and the editor's note is
the one place on the page that speaks in their voice — a correction, a
disagreement, the context only they have. Writing one yourself puts words in
their mouth, so leave it out entirely and let them add it during review. It
exists in
`eleventy.config.js` and is exercised by the placeholder post:

```njk
{% editor %}
His comment, as Markdown.
{% endeditor %}
```

Video only ever goes in through the `youtube` shortcode, and only when you have
been given a real video ID — never invent one, and never commit a video file:

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

Commit on a branch with `--author` set to Claude, which records who wrote the
change and leaves the committer as whoever is running the session:

```bash
git commit --author="Claude <noreply@anthropic.com>" -m "subject"
```

Then report back, in a few lines: what the post argues, which claims you would
most like a second pair of eyes on, and anything you could not verify. Name the
weak spots rather than presenting the draft as finished — you read the code
quickly and the editor has lived in it.
