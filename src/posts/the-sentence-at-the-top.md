---
title: The sentence at the top of every bulletin
description: Every bulletin page in Snowdesk opens with a label and one sentence explaining it. There are eighty of those sentences, and the part that says what the day means for you is written out for each one rather than generated.
date: 2026-09-22
audience: [product]
draft: true
sources:
  - snowdesk-data-pipeline docs/day-summary.md
  - snowdesk-data-pipeline apps/bulletins/services/day_summary.py
  - snowdesk-data-pipeline apps/bulletins/services/render_model.py
  - snowdesk-data-pipeline docs/day_character_rules_spec.md
  - snowdesk-data-pipeline tests/bulletins/services/test_day_summary.py
---

Open a bulletin page in Snowdesk and the first thing on it is a short label —
what kind of day this is — and beneath it one sentence explaining why. On a day
of considerable danger with a buried weak layer, the page opens:

> **Hard-to-read day**<br>
> Considerable, with persistent weak layers buried — no warning underfoot, so
> terrain choice is the only control left.

The label answers *what*. The sentence answers *why, and what does that mean for
me*. The two are chosen separately, and this post is about the sentence.

There are eighty sentences. The code fills in the names of the avalanche
problems and, on a day the level rises or falls, how it moved. The rest of each
sentence — the part that tells you what the day means — is written out, one
sentence per combination, rather than generated. That sounds like an oversight
and it is the whole design.

## What came before

For most of the project's life the explainer was one fixed sentence per label —
five sentences covering the entire archive. The Hard-to-read day's, "persistent
or gliding-snow problems can mask the real risk", went out on around 4,300
pages. It appeared whether the
problem was persistent weak layers or gliding snow. Whether the danger was
moderate or considerable. Whether it held steady all day or doubled by
mid-afternoon.

It was true every time. It described the rule that had picked the label rather
than the day in front of you, which is a different thing, and a reader who
checks the page two days running and sees the same sentence under two different
bulletins learns to stop reading it.

## Three questions, eighty answers

The sentence is chosen by asking three things about the day.

**How does it move?** Most bulletins give one rating for the whole day; some
split it, with a separate rating for the morning and the afternoon. Four
possibilities: *static*, where the level and the kinds of problem named hold all
day; *rising*, where the level climbs into the afternoon; *easing*, where it
falls; and *shifting*, where the number holds but the problem underneath it
changes.

**Where does it end up?** The European danger scale, one to five: low,
moderate, considerable, high, very high.

**Can you see the problem?** This is the axis that does the work. Some avalanche
problems leave evidence on the surface that a competent party can go and read:
new snow, wind slab, wet snow, cornices. Others do not.

Persistent weak layers are buried by definition. Gliding snow belongs with them,
which is less obvious until you have watched a glide crack: the cracks show you
*where* a slope will go and never *when*, so there is nothing to observe that
tells you about today. Name only the first kind and the day is *readable*; only
the second and it is *hidden*; both and it is *mixed*; nothing at all and it is
*quiet*.

Four by five by four is eighty combinations, and there is a sentence for each,
written out as one table in `apps/bulletins/services/day_summary.py`. The page
looks its sentence up there.

There is no fallback. A combination missing from the table would stop the
bulletin page loading, rather than show a generic sentence, because a
generic sentence is the failure the table was built to fix. A test checks that
all eighty are filled. Others check what goes in them: a quiet day's sentence
may not name a problem, and every other one must, so a day with a named problem
is never described without naming it. No two combinations may share a sentence,
because a duplicate means one was written twice and another was missed.

## Why each one is written out

Going further than filling in names is easy to imagine: add a stock ending for
each of the four answers to *can you see the problem?*, and you have a sentence
generator that covers all eighty combinations and any future ones for free.

It fails on the first pair you compare. Here are two days with the same
readable problem, a wind slab you can see at the surface:

> Moderate, with wind slab at the surface — the evidence is there to read before
> you commit to a slope.

> High, with wind slab at the surface — visible everywhere, and past what route
> choice can offset.

The same visible problem means opposite things. At moderate, being able to see
it is the reason you can go and look. At high, being able to see it no longer
helps, because there is too much of it for any choice of line to avoid. A stock
ending for *readable* would have to say one of those on both days, and on one of
them it would be dangerous.

A buried problem turns the same way:

> Low, with persistent weak layers buried out of sight — few places, and nothing
> at the surface to mark them.

> High, with persistent weak layers buried — remote triggering is expected, and
> nothing at the surface will warn you.

Both say nothing at the surface will help. At low that is a reason for care in a
few places; at high it means a slope can release from a distance, before you
reach it. A stock ending for *hidden* could not carry both.

Everything after the dash is a judgement about avalanche safety. A stock
ending cannot turn the three answers into it; what they mean together had to be
decided, eighty times.

That has a cost. A new answer to how the day moves, or to whether you can see
the problem, means twenty more sentences to write. The table also exists
only in English, so a second language means translating eighty judgements, not
eighty strings.

## What the archive says

We ran all 8,080 bulletins in the archive through the same three questions.

| Movement | Bulletins | Share |
|---|---|---|
| Static | 7,791 | 96.4% |
| Rising | 189 | 2.3% |
| Shifting | 78 | 1.0% |
| Easing | 22 | 0.3% |

Ninety-six pages in a hundred show one of the twenty static sentences, so those
twenty are what most readers will ever see. The rest of the table matters on
the days a bulletin splits. There are 312 of those. On 211 the level rises or
eases; on the other 101 it holds.

**A split day is the sun getting to work.** On 254 of the 312, the arriving
problem is wet snow. A reader who understands that one fact has understood most
of what a changing day means — and what the sentence on a rising day
with wet snow tells them:

> Deteriorating: moderate this morning, considerable by afternoon, with wet snow
> at the surface — turn round before it gets there.

**No falling day is an all-clear.** All 22 days whose level falls do so by
replacing a dry problem with wet snow. The number drops while the hazard swaps
character. Not one bulletin in the archive has a falling level that means the
snowpack cleared — so no easing sentence offers the afternoon as the safer half,
and none of the twenty uses the word "improving". A day that swaps persistent
weak layers for wet snow by afternoon reads:

> Easing: considerable this morning, moderate by afternoon, with persistent weak
> layers and wet snow in play — the number eases, the problem swaps rather than
> clears.

## What it does not catch

Of the 101 split days whose level holds, 78 name different kinds of problem in
the morning and the afternoon and are classified as shifting. Six carry two
identical ratings — the forecasting service that issued the bulletin, which
Snowdesk does not control, stamping one rating with two time periods — and are
correctly treated as static.

The remaining 17 keep the same problem types on different aspects or elevations —
wet snow retreating from sunny slopes to below a line, say. They are treated as
static too, so the footprint moves and the sentence does not mention it. That is
a known under-report rather than a solved problem, and it is deliberate in this
direction: the sentence omits something true rather than asserting something
false. When the reader is deciding where to ski, those two failures are not
equivalent.

## Written before anyone needs them

Only 30 of the 80 sentences match any bulletin in the archive. The other 50 are
written anyway, because what the forecasting services publish can change without
notice, and the sentence nobody has seen is the one nobody will notice reading
badly.

The 17 days above are the gap we know about. Fixing them properly means new copy
for a new case, not reclassifying those days into a sentence written about
something else.
