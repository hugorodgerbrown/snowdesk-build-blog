---
title: The sentence at the top of every bulletin
description: Every bulletin page in Snowdesk opens with one line telling you what kind of day it is. There are eighty of those lines, a person wrote every one, and the reason they are not generated is the interesting part.
date: 2026-09-22
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

There are eighty of those sentences. A person wrote every one, by hand, and the
code that picks between them cannot generate a new one. That sounds like an
oversight and it is the whole design.

## What came before

For most of the project's life the explainer was one fixed string per label —
five sentences covering the entire archive. One of them, "persistent or
gliding-snow problems can mask the real risk", went out on around 4,300 pages.
It appeared whether the problem was persistent weak layers or gliding snow.
Whether the danger was moderate or considerable. Whether it held steady all day
or doubled by mid-afternoon.

It was true every time. It described the rule that had fired rather than the day
in front of you, which is a different thing, and a reader who checks the page two
days running and sees the same sentence under two different bulletins learns to
stop reading it.

## Three questions, eighty answers

The sentence is chosen by asking three things about the day.

**How does it move?** Four possibilities: `static`, where nothing changes;
`rising`, where the level climbs into the afternoon; `easing`, where it falls;
and `shifting`, where the number holds but the problem underneath it changes.

**Where does it end up?** The European danger scale, one to five.

**Can you see the problem?** This is the axis that does the work. Some avalanche
problems leave evidence on the surface that a competent party can go and read:
new snow, wind slab, wet snow, cornices. Others do not. Persistent weak layers
are buried by definition. Gliding snow belongs with them, which is less obvious
until you have watched a glide crack: the cracks show you *where* a slope will go
and never *when*, so there is nothing to observe that tells you about today. Name
only the first kind and the day is `readable`; only the second and it is
`hidden`; both and it is `mixed`; nothing at all and it is `quiet`.

Four by five by four is eighty combinations, and there is a sentence for each. In
`apps/bulletins/services/day_summary.py` they are laid out as a literal table
keyed on those three values, and `summary_for` is a lookup into it.

There is no fallback. A combination the table does not hold is not quietly served
a generic sentence, because a generic sentence is exactly the failure the table
was built to fix.

## Why a person wrote them

Templating this is easy to imagine. Take the level word, splice in the problem
names, add a clause about the direction of travel, and you have a sentence
generator that covers all eighty cells and any future ones for free.

It produces sentences that are accurate and useless. What a reader needs from
"considerable, with persistent weak layers buried" is not a restatement of the
inputs — those are already on the page, in a rating block and a row of problem
tags. What they need is the consequence: that nothing underfoot will warn them,
so terrain choice is the only control they have left. That clause is a judgement
about avalanche safety. It is not derivable from the three keys that select it.

So the eighty are written, reviewed, and constrained by tests. One sentence,
ending in a full stop. A `quiet` cell may not name a problem; every other cell
must. Only the rising and easing cells may take the transition clause, and every
one of them has to. No two cells may share a sentence, because a duplicate means
some combination was written twice and another was missed.

One rule is worth repeating for anyone writing interpolated copy anywhere: never
govern a verb from the problem list. It holds one name or four, so "wind slab
**is** named" breaks the moment a day names two. The cells use noun phrases
instead — "with *the problems* at the surface", "with *the problems* in play" —
which takes the agreement problem off the table rather than solving it.

## What the archive says

Replaying the whole committed archive — 8,080 bulletins — through the classifier
produces a distribution that shaped the copy more than any style guide could.

| Movement | Bulletins | Share |
|---|---|---|
| `static` | 7,791 | 96.4% |
| `rising` | 189 | 2.3% |
| `shifting` | 78 | 1.0% |
| `easing` | 22 | 0.3% |

Two findings changed what the sentences say.

**A split day is the sun getting to work.** On 254 of the 312 days that split,
the arriving problem is wet snow. Nothing else comes close, and a reader who
understands that one fact has understood most of what a changing day means in
practice.

**Nothing ever improves.** All 22 days whose level falls do so by replacing a
dry problem with wet snow. The number drops while the hazard swaps character. Not
one bulletin in the archive has a falling level that means the snowpack cleared
— so no easing sentence offers the afternoon as the safer half, and a test
asserts that the word "improving" cannot appear anywhere in the table. A day
whose danger genuinely receded would be a new case deserving new copy, not this
one stretched to cover it.

There is a second reason the transition clause exists. Swiss ratings carry a
subdivision — a plus, a minus — so a day can move without its digit changing, and
45 of the 211 changing days in the archive do exactly that. Naming both ends
inline on those days produces "moderate this morning, moderate by afternoon",
which reads as a rendering fault rather than a subdivision.

## What it does not catch

Of the 101 bulletins whose level holds across a split, 78 gain a genuinely new
problem type and are classified `shifting`. Six carry two identical windows,
which is the provider stamping one rating with two time periods, and are
correctly treated as static.

The remaining 17 keep the same problem types on different aspects or elevations —
wet snow retreating from sunny slopes to below a line, say. The footprint moves;
the sentence does not mention it. That is a known under-report rather than a
solved problem, and it is deliberate in this direction: the sentence omits
something true rather than asserting something false. When the reader is deciding
where to ski, those two failures are not equivalent. Fixing it properly means new
copy for a new case, not reclassifying those days into a cell written about
something else.

And only 30 of the 80 cells have ever fired. The other 50 are written anyway,
because provider behaviour is not a contract, and the cell nobody has seen is
precisely the one nobody will notice rendering badly.
