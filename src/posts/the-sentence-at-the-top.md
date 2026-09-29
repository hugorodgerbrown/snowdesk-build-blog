---
title: The sentence at the top of every bulletin
description: Every bulletin page in Snowdesk opens with a label and one sentence explaining it. There are eighty of those sentences, and the part that says what the day means for you was written by hand, because no rule could produce it.
date: 2026-09-22
audience: [product]
draft: true
sources:
  - snowdesk-data-pipeline docs/day-summary.md
  - snowdesk-data-pipeline apps/bulletins/services/day_summary.py
  - snowdesk-data-pipeline apps/bulletins/services/render_model.py
  - snowdesk-data-pipeline docs/day_character_rules_spec.md
---

Open a bulletin page in Snowdesk and the first thing on it is a short label —
what kind of day this is — and beneath it one sentence explaining why. The label
answers *what*. The sentence answers *why, and what does that mean for me*.

There are eighty of those sentences. The code fills in the names of the
avalanche problems and, on a day the level rises or falls, how it moved. The
rest of each sentence — the part that tells you what the day means — a person
wrote by hand, and the code cannot produce a new one. That sounds like an
oversight and it is the whole design.

## What came before

The label is picked by five rules, applied in order to the bulletin.

For most of the project's life the explainer was one fixed string per label — five sentences
covering the entire archive. One of them, "persistent or gliding-snow problems
can mask the real risk", went out on around 4,300 pages. It appeared whether the
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

**Where does it end up?** The European danger scale, one to five.

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
bulletin page loading at all, rather than show a generic sentence, because a
generic sentence is the failure the table was built to fix. A test checks that
all eighty are filled, so that cannot ship.

## Why a person wrote them

Part of each sentence is templated already. The problem names are spliced in,
and a rising or easing day opens with a generated clause saying how the level
moved — "Easing: considerable this morning, moderate by afternoon". SLF, the
Swiss avalanche service, adds a plus or a minus to its ratings, so a day can
move without its digit changing; those days open "Deteriorating within
moderate" or "Easing within moderate" rather than "moderate this morning,
moderate by afternoon", which would read as a fault on the page.

Going the rest of the way is easy to imagine: add a stock ending for each of
the four answers to *can you see the problem?*, and you have a sentence
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

A buried problem gets advice a readable one never can:

> Considerable, with persistent weak layers buried — no warning underfoot, so
> terrain choice is the only control left.

Everything after the dash is a judgement about avalanche safety. No rule turns
the three answers into it; someone had to decide what they mean together, eighty
times.

The tests hold the table to that. A quiet day's sentence may not name a problem,
and every other one must, so no day is described without saying what the danger
is. No two combinations may share a sentence, because a duplicate means one was
written twice and another was missed.

## What the archive says

We ran all 8,080 bulletins in the archive through the same rules.

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

Two findings from the split days changed what the sentences say.

**A split day is the sun getting to work.** On 254 of the 312, the arriving
problem is wet snow. Nothing else comes close, and a reader who understands that
one fact has understood most of what a changing day means in practice.

**No falling day is an all-clear.** All 22 days whose level falls do so by
replacing a dry problem with wet snow. The number drops while the hazard swaps
character. Not one bulletin in the archive has a falling level that means the
snowpack cleared — so no easing sentence offers the afternoon as the safer half,
and none of the twenty uses the word "improving". A day that swaps persistent
weak layers for wet snow by afternoon reads:

> Easing: considerable this morning, moderate by afternoon, with persistent weak
> layers and wet snow in play — the number eases, the problem swaps rather than
> clears.

A day whose danger receded would be a new case deserving new copy, not this one
stretched to cover it.

## What it does not catch

Of the 101 split days whose level holds, 78 gain a new problem type and are
classified as shifting. Six carry two identical windows, which is the provider
stamping one rating with two time periods, and are correctly treated as static.

The remaining 17 keep the same problem types on different aspects or elevations —
wet snow retreating from sunny slopes to below a line, say. They are treated as
static too, so the footprint moves and the sentence does not mention it. That is
a known under-report rather than a solved problem, and it is deliberate in this
direction: the sentence omits something true rather than asserting something
false. When the reader is deciding where to ski, those two failures are not
equivalent.

## Written before anyone needs them

Only 30 of the 80 sentences have ever appeared on a page. The other 50 are
written anyway, because provider behaviour is not a contract, and the sentence
nobody has seen is the one nobody will notice reading badly.

The 17 days above are the next gap to close. Fixing them properly means new copy
for a new case, not reclassifying those days into a sentence written about
something else.
