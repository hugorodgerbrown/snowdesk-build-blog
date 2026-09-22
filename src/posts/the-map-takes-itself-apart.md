---
title: The map can take itself apart
description: Add one parameter to the Snowdesk map URL and the map comes apart into a ladder of sheets, then rebuilds itself a layer at a time. Every sheet is a photograph of the real renderer, which turned out to be the hard part.
date: 2026-09-22
audience: [technical, product]
draft: true
sources:
  - snowdesk-data-pipeline static/js/map_exploded.js
  - snowdesk-data-pipeline static/js/map.js
  - snowdesk-data-pipeline static/js/choropleth_core.js
  - snowdesk-data-pipeline config/settings/base.py
  - snowdesk-data-pipeline apps/public/templates/public/home.html
---

The Snowdesk map looks like one image: terrain, contours, a wash of colour over
the avalanche regions, some pins. Add `?layers=exploded` to the URL and it comes
apart — the single picture separates into a ladder of sheets hanging in space,
and then rebuilds itself one layer at a time while a caption names each one as
it lands.

It is the answer to a question we could not answer in a sentence: what are you
actually looking at?

## The ladder

From the bottom up, each rung is a thing someone chose to put there.

**The basemap.** Terrain, contours, roads, place names. We drew none of it —
there are five to pick from, a global style from OpenFreeMap plus national maps
from swisstopo, France's IGN and basemap.at. This is the one rung with no off
switch, because there is no map without it.

**Slope angle.** swisstopo's *slope classes over 30°*, served straight from their
tile server and deliberately unprocessed: it is the shading already printed on
the Swiss touring maps, so it is the one a reader has had years to learn.

**Avalanche danger.** The choropleth over the warning regions, and the boundaries
a forecaster drew around a group of them when they judged the same thing applied
to all of them.

**Three levels of boundary.** Major, minor and micro. European warning regions
nest, and the level you want depends on whether you are choosing a country, a
valley or a slope, so all three are separate rungs you can switch on alone.

**Resorts**, and then **your saved places** — the only rung that is yours rather
than ours.

Two rungs rented, five ours, and the rented ones are most of what you see. For a
small project that is a good trade: three national mapping agencies are better at
their own terrain than anything we would draw.

## The colour is the message

The danger choropleth used to be a translucent wash over whatever sat beneath it,
which is the obvious way to do it and was wrong.

Five basemaps differ enormously — OpenFreeMap's warm near-white land, swisstopo
winter's blue-white hillshade, IGN's grey — so blending a rating colour with each
produced five different results for the same rating. A region could read as
yellow *moderate* on one basemap and a washed-out pink on another, while the
legend pill beside it never moved.

On a map whose job is telling you how dangerous somewhere is, that is not a
cosmetic bug. The colour **is** the message. So the fill is now blended against a
fixed colour and painted opaque: the default basemap looks as it always did, and
the other four agree with it instead of each going their own way.

The ordering carries a similar promise. Pins are lifted back to the top after
every install, and within that group the weather symbols sit *below* the personal
pins — so if a saved place and a weather icon land on the same point, the weather
icon gives way. Your star is a thing you put there.

## How the sheets are made

Everything above is visible from the outside, and you can stop here with the
whole picture. The rest is how the exploded view is built, which is more
interesting than it has any right to be.

Every sheet is a **photograph of the running map**. Nothing is traced,
illustrated or recoloured. To make one, the code hides every layer in the style
except the tier it wants, waits for the renderer to paint a frame, and reads the
canvas out as a PNG. Then it moves up a rung and does it again.

That is four lines of intent and three genuinely hard problems.

### Loading is not showing

The first version photographed the basemap and got region boundaries and resort
pins in the picture.

The map installs a visitor's own enabled layers at boot, and those calls are
fire-and-forget — still in flight when the map reports itself ready. So a layer
would arrive a moment *after* a capture step had hidden everything, and land in
that step's photograph.

The fix is to install every tier the ladder shows before photographing anything,
and to force per-step what each step needs. Loading a layer and showing a layer
are separate things, and the demo cannot wait for the ordinary lazy loads to turn
up as their turn comes round — it has to read the same way regardless of what the
visitor happens to have switched on.

### Putting back what you borrowed

The view hides most of someone's map to take its pictures, so it has to restore
every layer exactly as it found it.

The obvious approach — read the whole style once at the start, put it back at the
end — is quietly broken, and the failure is nasty. Layers that arrive later are
missing from that snapshot, so the restore reads them as hidden and leaves them
hidden for the rest of the session, with the app already believing they are
loaded and nothing left to reinstate them. Closing the explainer would break the
map behind it.

So the state of each layer is recorded the first time the code sees it, not once
up front. What gets restored is what the application configured, captured before
the demo touched it.

### The demo's Switzerland, not yours

The capture flies to a fixed Swiss view, because a sequence that shows a
different place each time explains nothing. But the country filters are the
visitor's own, and someone who follows only the French Alps has Switzerland
filtered out — so every Swiss sheet would photograph blank.

Switzerland is forced on for the duration and the preference put back afterwards.
Nothing is written to storage; the visitor's choice is untouched when the dialog
closes.

### When a rung is missing

The slope raster sits behind an operator kill switch. If it is turned off, the
tier is not shown greyed out or broken — it is left out of the ladder entirely.
Demonstrating a sheet the map will not install fails the build's own
missing-layer check, and would take every later rung down with it. A rung that
cannot be photographed is not a rung.

## What it costs

Nothing, on an ordinary visit. The module is only loaded when the URL asks for
it, so the feature has no JavaScript cost until someone opens it, and closing the
dialog clears the parameter again.

The part worth stealing is the shape rather than the code. An explainer built
from photographs of the real renderer cannot quietly drift from the thing it
explains — and where it could, it fails loudly instead. If a layer it names ever
stops existing, the build stops rather than showing a picture of a map we no
longer draw.
