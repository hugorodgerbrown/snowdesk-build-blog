# Finding something to write about

## The backlog

[`../future-posts.html`](../future-posts.html) holds worked-up ideas — one
feature area each, with the angle, what the post should walk through and the
files to read. Open it first. If one fits, take it and skip to the research;
the rest of this file is how to find a topic when the backlog is exhausted or
nothing on it suits.

The backlog is not authoritative and goes stale as the app changes. Verify an
entry's claims against the docs and code before writing, and remove an entry
once its post is published.

## Where to look otherwise

The app repository is the `snowdesk-data-pipeline` checkout beside this one,
resolved as `$APP_REPO` in SKILL.md Step 2. Read only. Every path below is
relative to its root.

## The published explainers come first

The site author has written a series of explainers as published Artifacts —
*From GPX to Line*, *Anatomy of a Route*, *Inside the Snowdesk Map*, *What
Changes in a Bulletin*, and others. They are the best material available and the model for
what a post is: one feature walked end to end, with figures drawn to carry the
argument rather than to decorate it. The backlog links each one.

List them with the Artifact tool (`action: "list"`), and read one before
writing anything modelled on it. Two things to watch when porting:

- **Check the facts still hold.** Some were written months ago and the app has
  moved. The code settles it.
- **Mind the blog's constraint.** Posts allow no client-side JavaScript except
  JSON-LD. Most of these are static HTML and inline SVG and port directly, but
  any interactive piece — a hover tooltip, a drill-down — has to become static.
  An SVG `<title>` or a `title` attribute gives hover text with no script.

Some carry published image files, which have to come across with them. Some are
written as proposals with ticket numbers; a post drops that framing and, where
the work has since shipped, is written in the past tense.

## Then the repo's own explainers

`docs/` holds a write-up for most parts of the app, and these are the proto
posts — a post is one of them rewritten for someone outside the project. They
are internal reference, so they are dense, they assume the codebase, and they
skip the part where the reader is told why any of it matters. Your job is to
supply that and keep the substance.

Each carries a `last-reviewed` date and a `description` line. Skim the
descriptions to survey what is available:

```bash
cd "$APP_REPO/docs"
for f in *.md; do echo "$f :: $(sed -n '3p' "$f")"; done
```

Areas with an explainer worth turning into a post:

| Area | Docs |
|---|---|
| Bulletin ingestion and rendering | `render-model.md`, `meteofrance-mapping.md`, `slf-api-history.md`, `bulletin-guide.md` |
| The day-character callout | `day-summary.md`, `day_character_rules_spec.md` |
| The map | `map-and-api.md`, `map-page-functional-spec.md`, `compressed-views-rating-rule.md`, `calendar.md` |
| Weather | `weather-surfaces.md`, `locations.md` |
| Offline and the PWA | `offline-first.md`, `offline-map.md`, `offline-audit.md`, `mutation-queue.md`, `indexeddb-scaffolding.md` |
| Accounts and notifications | `accounts.md`, `push-notifications.md` |
| The site itself | `site-structure.md`, `user-journeys.md`, `design-system.md`, `telemetry-pipeline.md`, `mcp-server.md` |

Skip the operator and process docs — `management-commands.md`, `deployment.md`,
`feature-flags.md`, `worktrees.md`, `linear-workflow.md`, `coding-standards.md`,
`testing-scenarios.md` and the rest of that family. They are instructions for
running the project, and nobody outside it has the problem they solve.

## What the other sources are for

- **`apps/`** — the code. The doc tells you which files own the area; read them.
  Where a doc and the code disagree, the code is right, and the drift is worth a
  line in the post if it is interesting.
- **`docs/decisions/`** — ~70 records, one per accepted decision, each already
  structured as Decision / Why / Consequences. This is where the *why* comes
  from once the explainer has given you the *what*. Search it for the area you
  are writing about; most areas have two or three. They are supporting material,
  not the subject.
- **`docs/glossary.md`** — domain term to code symbol. Use it to get names right
  and to see which terms a reader will need defining.
- **`git log --oneline -40`** — what shipped recently. Useful for picking an
  area that is fresh in the code, and for a closing line about where a part is
  going. Subjects are written as the change, so the log reads as a list of
  problems solved.

## Check it has not been done

Every post records what it drew on in a `sources:` front-matter list, so the
back catalogue is searchable:

```bash
grep -h -A6 '^sources:' src/posts/*.md | sort -u
grep -h '^title:\|^description:' src/posts/*.md
```

A big area survives being written about more than once — the map is several
posts, not one — but a second post on it has to cover different machinery, not
the same walk with new sentences. Read the earlier post before starting.

## Choosing, in order of preference

1. **An area with a good explainer that a reader would be curious about
   without knowing it exists.** What happens to a tap with no signal; how three
   national avalanche services become one page.
2. **An area that shipped work recently**, where the explainer has just been
   updated and the commits show what changed. Cross-reference `git log` against
   the doc's `last-reviewed` date.
3. **The domain itself** — how to read an avalanche bulletin, what a massif is,
   why morning and afternoon get separate ratings. `bulletin-guide.md` is the
   source. Snowdesk is unusual enough that the domain is interesting on its own,
   and these posts are the way in for a reader who arrives knowing nothing.

If no area is ready — the doc is thin and the code would take a day to read —
say so and ask, rather than writing a shallow post to fill a slot.

## Vary the subject, and the axis

Check the two or three most recent posts and pick a different part of the app.
The offline and download machinery is the most heavily documented area and will
dominate every list you make; it is not three posts in a row. Rotate between the
server-side pipeline, the client, the map, the weather and the domain.

Rotate the `audience` too. The backlog leans technical, because the repo's docs
are written for engineers and that is where most topics come from — so a run of
technical posts is the easy mistake, and it loses half the readership. If the
last two posts were technical, the next one is product: what a screen shows,
what it refuses to show, the design choice behind it. The material is there;
it is just filed under docs written in a different register.

## Scope

One area per post, walked properly, beats three areas sketched. The explainers
are dense and a single one may hold two posts: `mutation-queue.md` covers both
the outbox and how failures surface to the user, and either is enough. If a
second `##` section could stand alone as its own post, it probably should, and
the front-matter `sources:` list will stop the next run repeating it.
