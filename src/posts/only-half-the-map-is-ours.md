---
title: Only half the map is ours
description: The Snowdesk map looks like one picture. It is four stacks of layers owned by three different parties, painted in a fixed order, and most of what you see we did not make. Here is how they are stacked, and what the ordering has to protect.
date: 2026-09-22
audience: [technical, product]
draft: true
sources:
  - snowdesk-data-pipeline static/js/map.js
  - snowdesk-data-pipeline static/js/choropleth_core.js
  - snowdesk-data-pipeline config/settings/base.py
  - snowdesk-data-pipeline docs/map-and-api.md
---

Open Snowdesk and you get one image: terrain, place names, a wash of colour over
the avalanche regions, some pins. It reads as a single map.

It is four stacks of layers, owned by three different parties, composited in a
fixed order. Only the middle of it is ours. Almost every awkward decision in the
map's code comes from that split, and the ordering is doing more work than it
looks.

## The four bands, bottom to top

**The basemap.** Terrain, contours, roads, place names — everything that makes
the picture look like a map. We did not draw any of it. There are five to choose
from: a global style from OpenFreeMap, two from swisstopo, France's Plan IGN, and
basemap.at for Austria. The national ones are the better maps inside their own
borders and go blank outside them, so they are offered as a comparison aid rather
than a replacement for the global one.

**The slope raster.** swisstopo's *slope classes over 30°*, served straight from
their tile server. Again not ours, and deliberately unprocessed — it is the same
shading printed on the Swiss ski touring maps, so it is the one someone has
already learned to read.

**Our data.** The danger choropleth, the region outlines and labels, the
grouping boundaries a forecaster drew, and any routes or trips you are looking
at. This is the product. It is also the thinnest band in the stack.

**The pins, always last.** Weather symbols, community reports, saved places.
These are ours too, but they are separated from the band below for one reason:
they must never end up underneath anything.

## The ordering is a promise

A map library paints layers in the order you add them, which means "on top"
is not a property of a pin — it is a consequence of when the pin happened to be
installed. Overlays get switched on and off at unpredictable times, and the whole
scene is rebuilt whenever you change the basemap, so pins can and did end up
buried.

So the pin layers are listed explicitly, lowest to highest, and lifted back to
the top after every install. The list itself carries a decision worth reading
twice: weather symbols sit above the region fills and boundaries, but *below* the
personal pins. If a saved place and a weather icon land on the same point, the
weather icon gives way. Your star is a thing you put there. The weather symbol
is something we added.

## The colour is the message

The danger choropleth used to be painted as a translucent wash over whatever was
underneath. That is the obvious way to do it, and it was wrong.

There are five basemaps and they differ enormously — OpenFreeMap's warm
near-white land, swisstopo winter's blue-white hillshade, IGN's grey. Blending a
rating colour with each of those gives five different results for the same
rating. The same region could read as yellow *moderate* on one basemap and a
washed-out pink on another, while the legend pill beside it never moved.

On a map whose whole job is to tell you how dangerous somewhere is, that is not a
cosmetic bug. The colour **is** the message.

The fix is to blend against a fixed colour instead of against the basemap, then
paint the result fully opaque. The constant chosen is the app's own warm
off-white background, which is within a couple of points of OpenFreeMap's land
colour — so the default basemap looks the way it always did, and the other four
now agree with it instead of each going their own way.

That is the pattern for most of what follows: the rented half of the map is
allowed to vary, and our half is not allowed to vary with it.

## How it is actually put together

Everything above is visible from the outside. The rest of this is the mechanism,
and you can stop here with the whole picture.

The library doing the drawing is MapLibre, and nothing in our code draws
anything. You hand it **sources** — a URL plus a format, "fetch this GeoJSON",
"fetch these image tiles" — and **layers**, which name a source, pick a shape and
give paint rules. It resolves that description into WebGL itself.

So every piece of map code is one of four verbs: add a source, add a layer,
change a property on a layer, or attach state to a feature. There is no render
loop of ours anywhere. And paint rules are *data*, not callbacks — a colour is a
small JSON expression evaluated per feature, so colouring every region at once
costs nothing, because we are not running our code once per region. We are
handing the GPU a lookup table.

That framing explains the band structure. Those four stacks are not four
components; they are one flat list of layer definitions whose order happens to
group them that way.

### Why switching basemap is expensive

Here is the part that surprises people. A basemap is not a background image. It
is an entire style document — its own sources, its own layers, its own sprites
and fonts. Switching from OpenFreeMap to swisstopo does not swap a picture
underneath our work. It replaces the whole scene, ours included.

Everything we added has to be added again. Everything we coloured has to be
coloured again. There is a function whose only job is that rebuild, the layer
installers are written to be safely re-runnable, and each one ends by lifting the
pins back to the top.

The lifting has a small, pleasing detail. Moving a layer without naming what it
should sit before moves it to the very top — so the pin list is ordered lowest to
highest and applied in order, and the last id in the array ends up topmost.
The array literally reads bottom to top, which is the same order the bands are
described in above.

## What it costs, and what it buys

Renting most of your map means re-establishing your own half every time the user
changes their mind about the base. That is a real coupling between two features
that otherwise have nothing to do with each other, and it is why the basemap
picker is a much larger piece of code than picking from a list of five should be.

What it buys is that the picker exists at all. Five basemaps, including three
national mapping agencies, none of which we maintain, all of which are better at
their own terrain than anything we would draw. For a small project that is a
straightforwardly good trade — as long as your own layers are disciplined about
not depending on what is underneath them.
