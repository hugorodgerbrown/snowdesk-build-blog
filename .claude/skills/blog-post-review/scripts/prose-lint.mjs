#!/usr/bin/env node
/**
 * Mechanical checks for a build.snowdesk.info post.
 *
 * Usage: node .claude/skills/blog-post-review/scripts/prose-lint.mjs src/posts/<slug>.md
 *
 * Finds what a regex can find — house-style word list, American spellings,
 * paragraph and post length, generic headings, front matter, leaked paths —
 * so the review can spend its attention on argument, flow and voice. Every
 * hit is a candidate, not a verdict: the reviewer decides whether it stands.
 *
 * Prose is checked with fenced code, inline code, URLs, HTML tags and
 * Nunjucks tags stripped, so `normalize()` in a code span is not a spelling
 * error. Line numbers refer to the original file.
 *
 * Always exits 0 unless the file cannot be read; the output is advisory.
 */
import { readFileSync } from "node:fs";

const WORD_RANGE = [800, 1400];
const PARA_MAX_SENTENCES = 5;
const PARA_MAX_WORDS = 110;
const DESCRIPTION_MAX_CHARS = 250;
const AUDIENCES = ["technical", "product"];

// From references/voice.md in the blog-post skill: hype adjectives, words
// that tell the reader they should have found it obvious, stock transitions.
const HOUSE_STYLE = [
  [/\b(powerful|seamless(ly)?|robust|elegant(ly)?|cutting[- ]edge|game[- ]changing|best[- ]in[- ]class)\b/gi, "hype adjective"],
  [/\b(simple|simply|just|of course|obviously|clearly|easily)\b/gi, "tells the reader it should have been obvious"],
  [/\b(let'?s dive in|dive into|delve|at the end of the day|it'?s worth noting|it is worth noting|needless to say|in today'?s|in a nutshell|without further ado)\b/gi, "stock phrase"],
  [/\b(leverag(e|es|ed|ing)|utili[sz](e|es|ed|ing)|unlock(s|ed|ing)?|empower(s|ed|ing)?|supercharg(e|es|ed|ing))\b/gi, "marketing verb"],
];

// Hedges are not wrong, but a post that hedges every claim reads as unsure
// of its own code. Reported as a count with locations, not as errors.
const HEDGES = /\b(generally|typically|roughly|somewhat|arguably|fairly|relatively|in some cases|tends? to|aims? to|more or less)\b/gi;

// British English. -ize words with an -ise form, minus words that only
// take -ize (size, prize, seize, capsize).
const IZE = /\b(?!(?:size|sized|sizes|sizing|prize|prized|prizes|seize|seized|seizes|seizing|capsize|capsized|resize|resized|resizes|resizing|downsize|downsized)\b)[a-z]+(?:ize|izes|ized|izing|ization|izations|yze|yzes|yzed|yzing)\b/gi;
const AMERICAN = [
  [/\b(color|colors|colored|coloring|behavior|behaviors|behavioral|favor|favors|favorite|honor|flavor|neighbor|neighboring|labor|humor|rumor|harbor|vapor)\b/gi, "-our spelling"],
  [/\b(center|centers|centered|meter|meters|kilometer|kilometers|liter|fiber|theater)\b/gi, "-re spelling"],
  [/\b(modeled|modeling|labeled|labeling|traveled|traveling|traveler|canceled|canceling|signaled|signaling|leveled|leveling|totaled|fueled)\b/gi, "doubled l"],
  [/\b(catalog|catalogs|dialog|analog|gray|defense|offense|toward|afterward|program(?!m))\b/gi, "American form"],
];

const GENERIC_HEADINGS = /^(introduction|overview|background|implementation|conclusion|conclusions|summary|design decisions|final thoughts|wrapping up|next steps|the problem|the solution|how it works|details)$/i;

const PII = [
  [/\/(Users|home)\/[A-Za-z0-9._-]+/g, "home-directory path; write paths relative to a repository root"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "email address"],
  [/\b(sk-[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{12,})\b/g, "looks like a credential"],
];

const findings = [];
const add = (line, category, message, excerpt = "") =>
  findings.push({ line, category, message, excerpt });

const file = process.argv[2];
if (!file) {
  console.error("usage: prose-lint.mjs <post.md>");
  process.exit(2);
}
const lines = readFileSync(file, "utf8").split("\n");

// --- Front matter ---------------------------------------------------------
let bodyStart = 0;
const front = {};
if (lines[0] === "---") {
  const end = lines.indexOf("---", 1);
  bodyStart = end + 1;
  let key = null;
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) {
      key = m[1];
      front[key] = { value: m[2].trim(), line: i + 1 };
    } else if (key && /^\s+-\s/.test(lines[i])) {
      front[key].value += ` ${lines[i].trim()}`;
    }
  }
}
for (const field of ["title", "description", "date", "audience"]) {
  if (!front[field] || !front[field].value) add(1, "front matter", `missing ${field}`);
}
if (front.audience) {
  const named = front.audience.value.replace(/[[\]\-]/g, " ").split(/[\s,]+/).filter(Boolean);
  const unknown = named.filter((a) => !AUDIENCES.includes(a));
  if (unknown.length) add(front.audience.line, "front matter", `unknown audience: ${unknown.join(", ")}`);
}
if (!front.draft || front.draft.value !== "true") {
  add(front.draft?.line ?? 1, "front matter", "draft: true is absent; a Claude-written post stays a draft until the editor removes it");
}
if (!front.sources) add(1, "front matter", "no sources: list; the next post cannot check this topic was used");
if (front.description) {
  const d = front.description.value.replace(/^["']|["']$/g, "");
  if (d.length > DESCRIPTION_MAX_CHARS) {
    add(front.description.line, "front matter", `description is ${d.length} characters; it is also the lede and the feed summary, so it should read in one breath`);
  }
}

// --- Body -----------------------------------------------------------------
let inFence = false;
let paragraph = [];
const sections = [{ heading: "(opening)", line: bodyStart + 1, words: 0 }];
let bodyWords = 0;
const hedges = [];

/** Strip everything that is not prose, keeping the text's length roughly. */
function prose(text) {
  return text
    .replace(/`[^`]*`/g, " ")
    .replace(/\{%.*?%\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/https?:\/\/\S+/g, " ");
}

function flushParagraph() {
  if (paragraph.length === 0) return;
  const text = paragraph.map((p) => p.text).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = (text.match(/[.!?](\s|$)/g) || []).length;
  const first = paragraph[0];
  const isList = /^\s*([-*+]|\d+\.)\s/.test(first.raw);
  const isTable = first.raw.trim().startsWith("|");
  if (!isList && !isTable && (sentences > PARA_MAX_SENTENCES || words > PARA_MAX_WORDS)) {
    add(first.line, "paragraph", `${sentences} sentences, ${words} words; the post is read on a phone`, first.raw.slice(0, 60));
  }
  paragraph = [];
}

for (let i = bodyStart; i < lines.length; i++) {
  const raw = lines[i];
  const n = i + 1;
  if (/^\s*(```|~~~)/.test(raw)) {
    inFence = !inFence;
    flushParagraph();
    continue;
  }
  if (inFence) continue;

  if (/\{%\s*editor\s*%\}/.test(raw)) {
    add(n, "editor note", "an editor's note speaks in the site author's voice; the writer must not add one");
  }
  for (const [re, msg] of PII) {
    for (const m of raw.matchAll(re)) add(n, "privacy", msg, m[0]);
  }

  const heading = raw.match(/^(#{1,6})\s+(.*)$/);
  if (heading) {
    flushParagraph();
    const text = heading[2].trim();
    if (heading[1].length === 1) add(n, "heading", "H1 in the body; the layout renders the title as the H1", text);
    if (GENERIC_HEADINGS.test(text)) add(n, "heading", "heading names a section type, not the argument", text);
    sections.push({ heading: text, line: n, words: 0 });
    continue;
  }
  if (raw.trim() === "") {
    flushParagraph();
    continue;
  }

  const text = prose(raw);
  const words = text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  bodyWords += words;
  sections[sections.length - 1].words += words;
  paragraph.push({ raw, text, line: n });

  for (const [re, msg] of HOUSE_STYLE) {
    for (const m of text.matchAll(re)) add(n, "house style", msg, m[0]);
  }
  for (const m of text.matchAll(IZE)) add(n, "spelling", "British English uses -ise / -yse", m[0]);
  for (const [re, msg] of AMERICAN) {
    for (const m of text.matchAll(re)) add(n, "spelling", `British English: ${msg}`, m[0]);
  }
  for (const m of text.matchAll(HEDGES)) hedges.push({ line: n, word: m[0] });
}
flushParagraph();

// --- Whole-post measures --------------------------------------------------
const [lo, hi] = WORD_RANGE;
if (bodyWords < lo || bodyWords > hi) {
  add(bodyStart + 1, "length", `${bodyWords} words of prose; the house range is ${lo}–${hi}`);
}
const body = sections.filter((s) => s.words > 0);
if (body.length >= 4) {
  const mean = body.reduce((a, s) => a + s.words, 0) / body.length;
  const sd = Math.sqrt(body.reduce((a, s) => a + (s.words - mean) ** 2, 0) / body.length);
  if (sd / mean < 0.2) {
    add(sections[1]?.line ?? bodyStart + 1, "shape", `sections are near-identical in length (mean ${Math.round(mean)} words, sd ${Math.round(sd)}); reads as machine-made`);
  }
}

// --- Report ---------------------------------------------------------------
console.log(`${file}: ${bodyWords} words of prose, ${sections.length - 1} headings`);
console.log("sections:");
for (const s of sections) console.log(`  ${String(s.line).padStart(4)}  ${String(s.words).padStart(5)}w  ${s.heading}`);
console.log(`hedges (${hedges.length}): ${hedges.map((h) => `${h.word}@${h.line}`).join(", ") || "none"}`);
// Every category is printed, zero or not, so "checked, none found" is
// distinguishable from "not checked".
const CATEGORIES = ["front matter", "house style", "spelling", "paragraph", "heading", "length", "shape", "editor note", "privacy"];
const counts = CATEGORIES.map((c) => `${c} ${findings.filter((f) => f.category === c).length}`);
console.log(`counts: ${counts.join(", ")}`);
console.log(findings.length ? `findings (${findings.length}):` : "findings: none");
for (const f of findings.sort((a, b) => a.line - b.line)) {
  const excerpt = f.excerpt ? `  "${f.excerpt}"` : "";
  console.log(`  ${file}:${f.line}  [${f.category}] ${f.message}${excerpt}`);
}
