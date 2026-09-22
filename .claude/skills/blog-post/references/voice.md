# House style

The blog is written as "we" — the people building Snowdesk. Explanatory, not
promotional. The app has a link in the footer of every post; a post does not
need to sell anything.

## Writing for the axis you declared

The `audience` in the front matter is not a label applied afterwards. It changes
the opening, the density, and what counts as evidence.

**Technical.** The reader writes software and has never thought about avalanche
forecasting, so the domain gets defined in passing and the mechanism gets the
room. Name real symbols and paths — `Bulletin.render_model`,
`apps/routes/services/gpx.py` — and show code where a four-line model definition
carries the argument. Constants, thresholds and complexity are the interesting
part; say why a number is that number. Assume the reader will go and look, and
make sure what they find matches what you wrote.

**Product.** The reader uses apps of this kind and is interested in how features
are designed. Argue from what someone gets and what they are protected from,
never from internal measures — nobody outside the project cares how many modules
an app has. Open on a screen, a tap, or a decision a person makes in a lift
queue. Code is evidence here, not subject: one short block to prove a claim is
fine, a walk through a module is not. What a feature deliberately does *not* do
is usually the strongest material, because that is where a real design choice
shows.

**Both.** Order it so the product half comes first and stands alone. Put the
mechanism after a heading that plainly signals the shift, so a reader can stop
there having read a whole piece rather than an abandoned one. Never split the
difference by being vague in both directions.

A one-line test before writing: name the reader you would most like to email
this to. If it is two very different people, the post is probably two posts.

## The shape of a post

**Open on the thing the reader can see, in the first two sentences.** No
scene-setting paragraph, no rhetorical question, no history of the industry.
Start at the surface — the line of text on the page, the tap, the pin that
appears — then go under it.

> Every bulletin page opens with a sentence telling you what kind of day it is.
> There are eighty of them, and a person wrote every one.

Not:

> In today's data-driven world, presenting complex information clearly is a
> common challenge that many developers face. Let's dive into how we tackled it.

**Then walk the machinery, in the order the data moves through it.** This is the
body of the post and most of its length. Name the real things —
`Bulletin.render_model`, `fetch_weather`,
`apps/bulletins/services/meteofrance_translator.py`. A reader who goes looking
should find what you named. Vague nouns ("the service layer", "our ingestion
system") read as though you did not look.

**Explain the choices where they come up, not in a section of their own.** When
the walk reaches a part that could plainly have been built another way, that is
where the reason goes, in a paragraph or two, along with what it cost. A
decision explained at the point the reader is already asking the question
carries; the same decision in a "Design decisions" heading at the end is a
different, worse post.

**Close on where it stands.** What this makes possible, what is still awkward,
what changes next. Not a summary — the reader has just read the post.

## Register

- **First person plural for the work, second person for the reader.** "We store
  the raw payload wrapped in a GeoJSON envelope" / "if you have ever tried to
  diff two CAAML documents".
- **Short paragraphs**, two to five sentences. This is read on a phone.
- **Headings that carry the argument.** "Why one table and not three" tells the
  reader something; "Implementation" does not.
- **Define a domain term the first time it appears**, in a clause, not a
  glossary box: "a massif — Météo-France's mountain-region unit, roughly a
  valley system".
- **British English**: colour, behaviour, organise, modelled, catalogue.

## Sentences

Cut hype adjectives — *powerful*, *seamless*, *robust*, *elegant*, *simple*.
Cut *simply*, *just*, *of course*, *obviously*: they tell a reader who did not
find it obvious that they should have. Prefer a specific number to an
intensifier — "0.01° of latitude, about 1.1 km" beats "a very small grid".

Long sentences are allowed where the thought is long. This is prose for readers,
not terminal output; the discipline is against filler, not against rhythm.

## Code and quotation

Code blocks earn their place by being read. A four-line model definition that
makes the argument is worth more than forty lines pasted from a service. Trim to
what the point needs, keep it accurate, and say where it came from.

Never paste a secret, a key, a credential, a database row or anything
identifying a user. See the main skill file.

## Things that make a post read as machine-written

- Three-item lists where two items would do, or where it is really one idea.
- A "Conclusion" heading.
- Every section the same length.
- Hedging every claim into mush. If the code says one row per location per day,
  write that, not "generally aims to store roughly one row".
- Stock transitions: "Let's dive in", "At the end of the day", "It's worth
  noting that".

## Worked opening

Topic: the day-character callout, from `docs/day-summary.md`.

> Every bulletin page opens with a sentence telling you what kind of day it is:
> whether the danger is steady or building, and whether the problem is one you
> can go and look at or one buried where you cannot.
>
> For most of the project's life there were five of those sentences, one per
> label, and they went out on four thousand pages. "Persistent or gliding-snow
> problems can mask the real risk" appeared whether the problem was persistent
> weak layers or gliding snow, whether the danger was 2 or 3, and whether it
> held all day or doubled by mid-afternoon. It described the rule that had
> fired, not the day.
>
> There are now eighty sentences, and a person wrote every one.

It starts at what the reader sees, says what was wrong with it in concrete
terms, and ends on the fact that makes them want the rest. The body then walks
the three axes that pick a sentence, and the reason the matrix is hand-authored
rather than generated arrives at the point the reader is already wondering.
