---
title: A web map is not a picture
description: The Snowdesk map draws a whole winter of avalanche danger over Alpine terrain, and nothing in our code draws any of it. What we write is a description; something else decides what that looks like. Here is what that changes.
date: 2026-09-21
audience: [technical, product]
draft: true
sources:
  - snowdesk-data-pipeline static/js/map.js
  - snowdesk-data-pipeline static/js/choropleth_core.js
  - snowdesk-data-pipeline apps/public/api.py
  - snowdesk-data-pipeline apps/regions/models.py
  - snowdesk-data-pipeline docs/decisions/pure-python-point-in-polygon.md
  - snowdesk-data-pipeline docs/map-and-api.md
---

Open Snowdesk and you get a map: Alpine terrain, contours, place names, a wash
of colour over the avalanche warning regions, a few pins. Drag the slider along
the bottom and the colours change as you move back through the winter.

It looks like one picture. It is not a picture at all, and nothing in our code
draws any of it. That is the single most useful thing to know about how it
works, and almost everything else follows from it.

## What you are looking at

The image is a stack, and the layers belong to different people.

At the bottom is the **basemap** — terrain, contours, roads, place names. We
drew none of it. There are five to choose from: a global style from OpenFreeMap,
two from swisstopo, France's Plan IGN and basemap.at for Austria. The national
ones are better inside their own borders and blank outside them, so they are
offered as a comparison rather than a replacement.

Above that sits the **slope-angle shading**, swisstopo's *slope classes over 30°*,
served straight from their tiles and deliberately unaltered. It is the shading
already printed on the Swiss touring maps, so it is the one a reader has had
years to learn.

Then **our part**: the danger colour over each warning region, the region
outlines, the boundaries a forecaster drew around a group of regions when the
same judgement applied to all of them, and any routes you are looking at.

And on top, **the pins** — weather symbols, reports, saved places. They are
lifted back to the top after anything else is installed, because "on top" is
otherwise just a consequence of what happened to be added last. Inside that
group there is a smaller rule: weather symbols sit below the personal pins, so
if a saved place and a weather icon land on the same point, the weather icon
gives way. Your star is a thing you put there.

Two layers rented, the rest ours, and the rented ones are most of what you see.
For a small project that is a good trade — three national mapping agencies are
better at their own terrain than anything we would draw.

## The colour is the message

The danger colour used to be a translucent wash over whatever was underneath,
which is the obvious way to do it and was wrong.

Those five basemaps differ enormously: OpenFreeMap's warm near-white land,
swisstopo winter's blue-white hillshade, IGN's grey. Blend a rating colour with
each and you get five different results for the same rating. The same region
could read as yellow *moderate* on one basemap and a washed-out pink on another,
while the legend pill beside it never moved.

On a map whose job is to tell you how dangerous somewhere is, that is a
correctness problem rather than a cosmetic one. The colour **is** the message.
So the fill is blended against one fixed colour instead and painted fully
opaque: the default basemap looks as it always did, and the other four now agree
with it.

That is the shape of most decisions here. The rented half of the map is allowed
to vary. Our half is not allowed to vary with it.

## How it is actually drawn

Everything above is visible from the outside, and you can stop here with the
whole picture. The rest is the mechanism.

The library doing the drawing is MapLibre, and the reason nothing in our code
draws anything is that you never issue a draw call. You hand it two kinds of
thing. **Sources** are where data comes from — a URL and a format, "fetch this
GeoJSON", "fetch these image tiles". **Layers** say how to paint a source: which
source, what shape, what colour and width. The library turns that description
into WebGL itself, every frame.

So every piece of map code we write is one of four verbs: add a source, add a
layer, change a property on a layer, or attach some state to a feature. There is
no render loop of ours anywhere. If you go looking for the function that draws a
region you will not find it — only the function that *describes* the region
layer, and the ones that change a value on it later.

The second half of that idea is the one that surprises people: **paint rules are
data, not code**. A region's colour is a small expression the engine evaluates
per feature — first a check for regions nobody rates, which get a flat grey, and
otherwise a lookup keyed on the region's current danger rating. It is a table,
not a callback. Colouring every region at once does not run our code once per
region; it hands the GPU a table and lets it do the work.

### Why scrubbing a season is instant

Dragging the slider recolours every region for a different day. Done naively
that is a request per day, and a re-upload of every polygon each time.

It is neither, because the shape of a region and what is currently true about it
are kept apart. The geometry is fetched once and uploaded to the GPU once.
Alongside it, each region carries a small bag of values — its rating for the day
being shown — and the colour expression reads from that bag. Changing day writes
a new rating into each bag and nothing else happens: no request, no re-upload,
no re-parse. The whole season arrives in one small payload, because a day's
worth of danger is one integer per region.

That is why the slider feels native, and it pays for itself twice: the same
mechanism runs the timelapse, which steps through a winter several frames a
second.

It has one sharp edge, and the code has been cut by it. That bag of values lives
with the source — so destroying the source destroys the ratings with it, every
region falls back to "no rating", and the map goes grey. Switching basemap does
exactly that, because a basemap is not a background image; it is a whole style
document, and loading a new one replaces the entire scene, ours included.

So every style change has to re-add everything we added, re-colour everything we
coloured, and lift the pins back to the top. Two features that have nothing to
do with each other — picking a basemap, and which day you are looking at — are
permanently coupled, and that is most of the reason the basemap picker is a
larger piece of code than picking from a list of five has any right to be.

## The server is deliberately boring

Almost none of this is on the server. Every endpoint the map talks to is a
function that takes a request and returns JSON. Region boundaries are stored as
GeoJSON in ordinary JSON columns rather than in a spatial database, and the one
piece of real geometry on the request path — which warning region contains this
point, when you drop a pin or file a report — is ray-casting in plain Python.

That is a deliberate absence. The interesting problems on this page are all in
the browser: what to draw, in what order, and what has to be re-established when
the ground underneath it is replaced. The server's job is to hand over some
JSON and get out of the way.
