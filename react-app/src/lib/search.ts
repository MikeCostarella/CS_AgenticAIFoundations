// A small, dependency-free search engine for the course site.
//
// The whole site is a static typed registry, so the index is built once in
// memory at first use (see data/searchIndex.ts) and every query runs against
// it synchronously. There is no server, no network call, and no library.
//
// Ranking, in short: split the query into terms, require every term to match
// somewhere in a document, weight matches by which field they landed in
// (title beats topic beats body), scale rarer terms up, and add bonuses when
// the query appears verbatim.

import { SEARCH_DOCS } from "../data/searchIndex";
import type { SearchDoc } from "../data/searchIndex";

/** How much a match is worth, by the field it was found in. */
const FIELD_WEIGHT = {
  title: 12,
  subtitle: 6,
  keywords: 5,
  kicker: 3,
  body: 1,
} as const;

/** Very common words carry no signal; they are dropped from queries. */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how",
  "in", "is", "it", "of", "on", "or", "that", "the", "to", "what", "with",
]);

/** Kinds nudged up or down so the most useful result tends to lead. */
const KIND_BOOST: Record<SearchDoc["kind"], number> = {
  module: 1.18,
  lab: 1.06,
  checkpoint: 1.0,
  unit: 1.0,
  page: 1.0,
  project: 1.0,
  resource: 0.94,
  tool: 0.94,
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n === "" ? [] : n.split(" ");
}

/** Query terms: normalized, de-duplicated, stop words dropped. */
export function queryTerms(query: string): string[] {
  const all = tokenize(query);
  const kept = all.filter((t) => !STOP_WORDS.has(t));
  // If the query was nothing but stop words ("the how"), keep them rather
  // than silently searching for nothing.
  return Array.from(new Set(kept.length > 0 ? kept : all));
}

interface Prepared {
  doc: SearchDoc;
  /** term -> summed field weight across every occurrence in the document */
  terms: Map<string, number>;
  /** normalized full text, used for verbatim-phrase bonuses */
  haystack: string;
  normalizedTitle: string;
}

let prepared: Prepared[] | null = null;
let idf: Map<string, number> | null = null;

function buildIndex(): void {
  const docs = SEARCH_DOCS;
  const out: Prepared[] = [];

  for (const doc of docs) {
    const terms = new Map<string, number>();
    const add = (text: string | undefined, weight: number) => {
      if (!text) return;
      for (const t of tokenize(text)) {
        terms.set(t, (terms.get(t) ?? 0) + weight);
      }
    };

    const keywords = doc.keywords ? doc.keywords.join(" ") : "";
    add(doc.title, FIELD_WEIGHT.title);
    add(doc.subtitle, FIELD_WEIGHT.subtitle);
    add(keywords, FIELD_WEIGHT.keywords);
    add(doc.kicker, FIELD_WEIGHT.kicker);
    add(doc.body, FIELD_WEIGHT.body);

    out.push({
      doc,
      terms,
      haystack: normalize(
        [doc.title, doc.subtitle, doc.kicker, keywords, doc.body]
          .filter(Boolean)
          .join(" "),
      ),
      normalizedTitle: normalize(doc.title),
    });
  }

  // Inverse document frequency: a term in three documents says more about
  // those three than a term that appears in forty.
  const df = new Map<string, number>();
  for (const p of out) {
    for (const t of p.terms.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const n = out.length;
  const weights = new Map<string, number>();
  for (const [t, count] of df) {
    weights.set(t, 1 + Math.log(n / (1 + count)));
  }

  prepared = out;
  idf = weights;
}

function index(): Prepared[] {
  if (prepared === null) buildIndex();
  return prepared as Prepared[];
}

/**
 * Best weight for one query term in one document.
 *
 * An exact term match scores full weight. Otherwise the term is allowed to
 * match as a prefix in either direction, at a discount, so that "inject"
 * finds "injection" and "agents" still finds "agent".
 */
function termScore(p: Prepared, term: string): number {
  const exact = p.terms.get(term);
  if (exact !== undefined) return exact;

  let best = 0;
  for (const [t, w] of p.terms) {
    if (term.length >= 3 && t.startsWith(term)) {
      best = Math.max(best, w * 0.7);
    } else if (t.length >= 4 && term.startsWith(t)) {
      best = Math.max(best, w * 0.5);
    }
  }
  return best;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  snippet: SnippetPart[];
}

export interface SnippetPart {
  text: string;
  hit: boolean;
}

export function search(query: string, limit = 50): SearchHit[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const phrase = normalize(query);
  const docs = index();
  const weights = idf as Map<string, number>;
  const hits: SearchHit[] = [];

  for (const p of docs) {
    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      const raw = termScore(p, term);
      if (raw === 0) {
        matchedAll = false;
        break;
      }
      // sqrt keeps a term repeated twenty times from drowning out the rest.
      score += Math.sqrt(raw) * (weights.get(term) ?? 1);
    }
    if (!matchedAll) continue;

    // Verbatim query text is a strong signal, more so in the title.
    if (terms.length > 1 && p.haystack.includes(phrase)) score *= 1.6;
    if (p.normalizedTitle.includes(phrase)) score *= 1.5;
    if (p.normalizedTitle === phrase) score *= 1.3;
    score *= KIND_BOOST[p.doc.kind];

    hits.push({ doc: p.doc, score, snippet: buildSnippet(p.doc, terms) });
  }

  hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return hits.slice(0, limit);
}

/** Total number of indexed documents — used for the "searching N pages" hint. */
export function indexSize(): number {
  return index().length;
}

// ------------------------------------------------------------------ snippets

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface Range {
  start: number;
  end: number;
}

function matchRanges(text: string, terms: string[]): Range[] {
  const ranges: Range[] = [];
  for (const term of terms) {
    const re = new RegExp("\\b" + escapeRegExp(term) + "[a-z0-9]*", "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex += 1;
        continue;
      }
      ranges.push({ start: m.index, end: m.index + m[0].length });
      if (ranges.length > 400) break;
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  // Merge overlaps so two terms hitting the same word mark it once.
  const merged: Range[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

/**
 * A short excerpt of the document body centered on the densest cluster of
 * matches, returned as alternating plain / highlighted parts so the caller
 * can render it as React nodes rather than raw HTML.
 */
export function buildSnippet(doc: SearchDoc, terms: string[], max = 190): SnippetPart[] {
  const text = doc.body && doc.body.trim() !== "" ? doc.body : (doc.subtitle ?? "");
  if (text === "") return [];

  const ranges = matchRanges(text, terms);

  if (ranges.length === 0) {
    return [{ text: clip(text, max), hit: false }];
  }

  // Pick the window containing the most matches, preferring earlier windows.
  let bestStart = 0;
  let bestCount = -1;
  for (const r of ranges) {
    const start = Math.max(0, r.start - 55);
    const end = start + max;
    const count = ranges.filter((x) => x.start >= start && x.end <= end).length;
    if (count > bestCount) {
      bestCount = count;
      bestStart = start;
    }
  }

  let start = bestStart;
  let end = Math.min(text.length, start + max);
  // Snap to word boundaries so excerpts don't begin mid-word.
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space - start < 20) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > start) end = space;
  }

  const parts: SnippetPart[] = [];
  let cursor = start;
  for (const r of ranges) {
    if (r.end <= start) continue;
    if (r.start >= end) break;
    const from = Math.max(r.start, start);
    const to = Math.min(r.end, end);
    if (from > cursor) parts.push({ text: text.slice(cursor, from), hit: false });
    parts.push({ text: text.slice(from, to), hit: true });
    cursor = to;
  }
  if (cursor < end) parts.push({ text: text.slice(cursor, end), hit: false });

  if (start > 0 && parts.length > 0) parts[0] = { ...parts[0], text: "… " + parts[0].text };
  if (end < text.length && parts.length > 0) {
    const last = parts[parts.length - 1];
    parts[parts.length - 1] = { ...last, text: last.text + " …" };
  }
  return parts;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return text.slice(0, cut > 0 ? cut : max) + " …";
}
