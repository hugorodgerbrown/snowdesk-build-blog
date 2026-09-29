---
name: blog-post-review
description: Critique a draft post for build.snowdesk.info the way a newspaper editor would — argument, narrative flow, character of the voice, line-level style, and whether the facts hold against the app's code. Use whenever a post in src/posts/ needs reviewing, editing, critiquing or a second pair of eyes — "review this post", "edit the map post", "is this ready to publish?", "what's wrong with this draft", "check it for style" — and after the blog-post skill has written a draft. Reports findings; it does not rewrite the post unless asked.
---

# Reviewing a post for build.snowdesk.info

This is the desk a draft crosses before the site's editor reads it. The job is
to find what would make a reader stop, doubt or skim, and to say so with the
passage quoted, so the writer can fix it without re-reading the whole post to
find what you meant.

Two roles share the word "editor" here. **The editor** is the site author: the
byline names them, and the `{% editor %}` shortcode is their voice alone. This
skill is the review before theirs. It never writes an editor's note, never
removes `draft: true`, and never decides a post is published.

## What you are checking against

The house standard is the writing skill's own guide, not a second copy of it:

- [`../blog-post/SKILL.md`](../blog-post/SKILL.md) — *What a post is*, the
  three things a post owes the reader, and the audience weighting.
- [`../blog-post/references/voice.md`](../blog-post/references/voice.md) — the
  shape of a post, register, sentences, and the list of machine-written tells.

Read both before the post. Where this skill and those files disagree, those
files win; they are what the writer was told.

## Step 1 — read it as a reader

Read the post once, top to bottom, without taking notes. Then write down, for
yourself:

- **The argument in one line.** If you cannot state it, that is the first
  finding and the most important one.
- **Where you stopped paying attention.** The paragraph number and why. This is
  the flow finding a checklist will not produce.
- **The declared `audience`**, and whether the post you just read serves it.

## Step 2 — run the mechanical checks

```bash
node .claude/skills/blog-post-review/scripts/prose-lint.mjs src/posts/<slug>.md
```

It reports word count, section lengths, hedges, a count per category (zero
included, so a clean category is visibly checked), and candidate problems:
house-style words, American spellings, long paragraphs, generic headings, front
matter, and anything that looks like a home-directory path, email address or
credential. Every hit is a candidate. Drop the ones that are right in context —
"authorization server" is the RFC's term, "just" can mean "only" — and keep the
rest. Do not pad the report with lint that does not matter.

## Step 3 — review in passes

Work from the largest unit to the smallest. A structural problem makes
line-level notes on the affected paragraphs wasted effort, so do not give them.

### Argument

- Does the post deliver what this blog promises: **what the part does** for
  someone holding a phone on a mountain, **how it works** in named code in the
  order data moves, and **why it is built that way** where that is not obvious,
  including what the choice cost?
- Is the weighting right for the audience? A `technical` post spends most of its
  length on the mechanism. A `product` post spends it on what the screen shows
  and refuses to show, with code as evidence. A post marked both must let a
  product reader stop at a signposted heading having read something complete.
- Is it one post? If the one-line argument needs an "and", it may be two.
- Is it marketing (stops after *what it does*) or a decision record (starts at
  *why*)?

### Narrative flow

- **Opening.** The first two sentences are at the surface — a line on the page,
  a tap, a pin. No scene-setting, rhetorical question or industry history.
  Quote the first sentence in the report whatever its verdict.
- **Order.** The body follows the data, not the order the writer learned it in.
  Mark any point where the reader meets a term, model or number before the thing
  that explains it.
- **Decisions in place.** A reason arrives where the reader is already asking
  the question. A "Design decisions" section at the end is a finding.
- **Transitions.** Each section's first sentence should follow from the last
  section's final one. Note any seam where the post changes subject without
  saying why.
- **Proportion.** Use the lint's section lengths. A short section on the hard
  part and a long one on the easy part means the writer spent words where the
  material was, not where the reader needed them.
- **Close.** Where it stands — what this makes possible, what is still awkward,
  what changes next. A summary of the post is a finding.

### Character

This is whether the post sounds like people who built the thing and have a view
of it, or like a description assembled from the code.

- **A point of view.** Does the post commit to claims — "it is the whole
  design", "those two failures are not equivalent" — or report neutrally what
  exists? A post with no sentence anyone could disagree with has no character.
- **Honest limits.** The house model states what does not work rather than
  leaving it for the reader to find. Missing limits are a finding; so is a limit
  apologised for rather than explained.
- **Specifics over intensifiers.** "0.01° of latitude, about 1.1 km", not "a
  very small grid". Count the places a number or a named symbol could replace an
  adjective.
- **Rhythm.** Sentence lengths should vary with the thought. Three consecutive
  sentences of the same shape, or every paragraph opening the same way, is a
  finding; quote them.
- **Register.** "We" for the work, "you" for the reader. Explanatory, never
  promotional.
- **Machine tells**, from voice.md: three-item lists that are one idea,
  a "Conclusion" heading, sections of equal length, claims hedged into mush,
  stock transitions. Name which one and where.

### Line

Only for passages the structural findings leave standing, and only for what the
lint cannot see: a domain term used before it is defined (it needs a defining
clause the first time it appears), jargon from the wrong axis (git or code
vocabulary in a product post), an intensifier the lint's list misses, a
sentence whose subject is unclear. The lint's own hits are triaged in Step 2,
not re-found here. A heading that labels rather than argues is **Consider**
unless the lint flagged it as generic. Group repeated problems into one finding
with every location, rather than one finding each.

### Facts

The post is reporting on the app, so the review checks the reporting. Resolve
the app repo the same way the writing skill does:

```bash
APP_REPO="${SNOWDESK_APP_REPO:-$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/../.." && pwd)/snowdesk-data-pipeline}"
```

It is read-only. Do not open `.env`, `.vapid-private.pem`, key files or
`db.sqlite3`.

- Every symbol and path the post names — `summary_for`,
  `apps/bulletins/services/day_summary.py` — should exist. Grep for each one;
  list any that do not.
- Pick the claims the argument rests on — the headline number, the "every" and
  "never" statements, what a test asserts — and trace them to **code**. A doc in
  the post's `sources` is where the writer got the claim, so confirming against
  it is circular; read the code the doc describes. Say which you checked and
  which you did not.
- Check the post's absolute words against the code's actual behaviour. "A
  person wrote every one" and "a test asserts X cannot appear anywhere" are
  claims about scope, and scope is where drafts overreach.
- Code blocks should match the source they claim to come from, trimmed but not
  altered in meaning.
- A claim that cannot be traced is either cut or marked as opinion ("we think").
- If you find the app's own docs or docstrings disagreeing with its code, note
  it under **Facts checked** as a defect in the app repo, whether or not the
  post repeated it. The code is the authority; do not fix the app repo.

If the app repo is not present, say so in the report and skip this pass; do not
review the facts from memory.

### Front matter and hygiene

`title`, `description`, `date`, `audience` and `draft: true` present;
`sources` lists what the post drew on; the `description` stands alone as a meta
description and lede; no `{% editor %}` block written by anyone but the editor;
no video other than through the `youtube` shortcode with a real ID; nothing
identifying a person.

## Step 4 — report

Lead with the verdict, then the findings, most severe first. Keep it to what the
writer should act on; fifteen findings is a lot for 1,200 words.

```markdown
**Verdict:** <Ready for the editor | Needs another draft | Needs rethinking>
— <one sentence saying why>.

**Argument:** <the post's argument in one line, as you read it>
**Audience:** <declared> — <served / leans the other way / split between both>
**Stopped reading at:** <section heading, line n> — <why> (or "nowhere")

### Must fix
1. **<Short label>** (<section heading>, line <n>)
   > <quoted passage, under 30 words>
   <What is wrong and why it matters to the reader. The direction of a fix, not
   a rewrite — unless the fix is a phrase, in which case give the phrase.>

### Should fix
...

### Consider
...

### Facts checked
- <claim> — <file or doc it traces to> ✓
- <claim> — not found in <where you looked> ✗
- Not checked: <what, and why>

### Keep
<One to three things the draft does well, named specifically, so a revision
does not lose them.>
```

Severity:

- **Must fix** — the argument is unclear or wrong, a claim is false or a claim
  the argument rests on is overstated, the audience is not served, a privacy or
  front-matter rule is broken, or the opening fails.
- **Should fix** — a peripheral claim stated more broadly than the code
  supports, flow breaks, a machine tell, a missing limit, a run of lint that
  shows a habit.
- **Consider** — a matter of taste you can argue for. Say it is taste.

Quote exactly; the writer will search for the text. Refer to lines by the
numbers in the source file.

## When asked to apply the edits

Only when the request says so ("fix it", "apply your edits"). Then fix the
**Should fix** and line-level findings in place, and leave **Must fix**
findings about argument or structure for the writer, since those are rewrites
rather than edits. Do not touch `draft`, do not add an `{% editor %}` block, and
run `npm run check` afterwards. Report which findings you applied and which you
left.
