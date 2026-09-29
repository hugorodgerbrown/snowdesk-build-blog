---
title: The sentence at the top of every bulletin
description: Every bulletin page in Snowdesk opens with one line telling you what kind of day it is. There are eighty of those lines, and the part that says what the day means for you was written by hand, because a template cannot produce it.
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
avalanche problems and, on a day that changes, the level at each end. The rest
of each sentence — the part that tells you what the day means — a person wrote
by hand, and the code cannot produce a new one. That sounds like an oversight
and it is the whole design.

## What came before

For most of the project's life the explainer was one fixed string per label —
five sentences covering the entire archive. One of them, "persistent or
gliding-snow problems can mask the real risk", went out on around 4,300 pages.
It appeared whether the problem was persistent weak layers or gliding snow.
Whether the danger was moderate or considerable. Whether it held steady all day
or doubled by mid-afternoon.

It was true every time. It described the rule that had matched rather than the day
in front of you, which is a different thing, and a reader who checks the page two
days running and sees the same sentence under two different bulletins learns to
stop reading it.

## Three questions, eighty answers

The sentence is chosen by asking three things about the day.

**How does it move?** Four possibilities: `static`, where nothing changes;
`rising`, where the level climbs into the afternoon; `easing`, where it falls;
and `shifting`, where the number holds but the problem underneath it changes.

A rising or easing sentence opens with the level at each end of the day:
"Deteriorating: moderate this morning, considerable by afternoon". Swiss ratings
also carry a subdivision — a plus, a minus — so a day can move without its digit
changing, and 45 of the 211 rising and easing days in the archive do that.
Naming both ends on those days would print "moderate this morning, moderate by
afternoon", which reads as a fault on the page. They open "Deteriorating within
moderate" instead.

**Where does it end up?** The European danger scale, one to five.

**Can you see the problem?** This is the axis that does the work. Some avalanche
problems leave evidence on the surface that a competent party can go and read:
new snow, wind slab, wet snow, cornices. Others do not.

Persistent weak layers are buried by definition. Gliding snow belongs with them, which is less obvious
until you have watched a glide crack: the cracks show you *where* a slope will go
and never *when*, so there is nothing to observe that tells you about today. Name
only the first kind and the day is `readable`; only the second and it is
`hidden`; both and it is `mixed`; nothing at all and it is `quiet`.

Four by five by four is eighty combinations, and there is a sentence for each,
written out as one table in `apps/bulletins/services/day_summary.py`. The page
looks its sentence up there.

There is no fallback. A combination missing from the table would put an error
on the page rather than a generic sentence, because a generic sentence is the
failure the table was built to fix. A test checks that all eighty are filled,
so that error cannot ship.

## Why a person wrote them

Part of each sentence is templated already. The problem names are spliced in,
and a rising or easing day opens with a generated clause — "Easing: considerable
this morning, moderate by afternoon". Going the rest of the way is easy to
imagine: add a stock ending for each kind of problem, and you have a sentence
generator that covers all eighty combinations and any future ones for free.

It produces sentences that are accurate and useless. What a reader needs from
"considerable, with persistent weak layers buried" is not a restatement of the
inputs — those are already on the page, in a rating block and a row of problem
tags. What they need is the consequence. This is the sentence that day gets:

> Considerable, with persistent weak layers buried — no warning underfoot, so
> terrain choice is the only control left.

Everything after the dash is a judgement about avalanche safety. It is not
derivable from the three answers that select it, and it is the part a person
wrote.

So the eighty are written, reviewed, and constrained by tests. One sentence,
ending in a full stop. A quiet day's sentence may not name a problem; every
other one must. Only rising and easing days open with the level at each end, and
all of them do. No two combinations may share a sentence, because a duplicate
means one was written twice and another was missed.

The sentences also avoid a trap in any copy that slots in a list. A day may name
one problem or four, so "wind slab **is** named" breaks the moment it names two;
every sentence uses a phrase with no verb to agree — "with *the problems* at the
surface" — instead.

## What the archive says

We ran all 8,080 bulletins in the archive through the same rules.

| Movement | Bulletins | Share |
|---|---|---|
| `static` | 7,791 | 96.4% |
| `rising` | 189 | 2.3% |
| `shifting` | 78 | 1.0% |
| `easing` | 22 | 0.3% |

Ninety-six pages in a hundred show one of the twenty static sentences, so those
twenty carry most of the product. The rest of the table matters on the days a
bulletin splits: a separate rating for the morning and the afternoon. There are
312 of those. On 211 the level rises or eases; on the other 101 it holds.

Two findings from the split days changed what the sentences say.

**A split day is the sun getting to work.** On 254 of the 312, the arriving
problem is wet snow. Nothing else comes close, and a reader who
understands that one fact has understood most of what a changing day means in
practice.

**Nothing ever improves.** All 22 days whose level falls do so by replacing a
dry problem with wet snow. The number drops while the hazard swaps character. Not
one bulletin in the archive has a falling level that means the snowpack cleared
— so no easing sentence offers the afternoon as the safer half, and the tests
assert that an easing day's sentence never says it is improving. A day that
swaps persistent weak layers for wet snow by afternoon reads:

> Easing: considerable this morning, moderate by afternoon, with persistent weak
> layers and wet snow in play — the number eases, the problem swaps rather than
> clears.

A day whose danger receded would be a new case deserving new copy, not this one
stretched to cover it.

## What it does not catch

Of the 101 split days whose level holds, 78 gain a new problem type and are classified `shifting`. Six carry two identical windows,
which is the provider stamping one rating with two time periods, and are
correctly treated as static.

The remaining 17 keep the same problem types on different aspects or elevations —
wet snow retreating from sunny slopes to below a line, say. The footprint moves;
the sentence does not mention it. That is a known under-report rather than a
solved problem, and it is deliberate in this direction: the sentence omits
something true rather than asserting something false. When the reader is deciding
where to ski, those two failures are not equivalent. Fixing it properly means new
copy for a new case, not reclassifying those days into a sentence written about
something else.

And only 30 of the 80 sentences have ever appeared on a page. The other 50 are
written anyway, because provider behaviour is not a contract, and the sentence
nobody has seen is the one nobody will notice reading badly.
