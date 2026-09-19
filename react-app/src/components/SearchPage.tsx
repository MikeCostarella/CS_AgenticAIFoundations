import { useEffect, useMemo, useRef, useState } from "react";
import { KIND_LABEL, KIND_ORDER } from "../data/searchIndex";
import type { SearchKind } from "../data/searchIndex";
import { indexSize, search } from "../lib/search";
import SearchResultLine from "./SearchResultLine";

// Full results page at #/search?q=… — every match, grouped by what it is,
// with a filter row across the top.

const SUGGESTIONS = [
  "prompt injection",
  "retrieval",
  "MCP",
  "evaluation",
  "midterm",
  "grading",
];

export default function SearchPage({ query }: { query: string }) {
  const [filter, setFilter] = useState<SearchKind | "all">("all");
  const [draft, setDraft] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(query);
    setFilter("all");
  }, [query]);

  const hits = useMemo(() => (query.trim() === "" ? [] : search(query, 200)), [query]);

  const counts = useMemo(() => {
    const c = new Map<SearchKind, number>();
    for (const h of hits) c.set(h.doc.kind, (c.get(h.doc.kind) ?? 0) + 1);
    return c;
  }, [hits]);

  const shown = filter === "all" ? hits : hits.filter((h) => h.doc.kind === filter);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = draft.trim();
    window.location.hash = term === "" ? "#/search" : `#/search?q=${encodeURIComponent(term)}`;
  };

  return (
    <article className="page search-page">
      <h1>Search</h1>

      <form className="sp-form" onSubmit={submit} role="search">
        <input
          ref={inputRef}
          type="search"
          className="sp-input"
          value={draft}
          placeholder="Search modules, labs, readings, projects…"
          aria-label="Search the course site"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="sp-go">
          Search
        </button>
      </form>

      {query.trim() === "" ? (
        <div className="sp-intro">
          <p className="lede">
            Searches the whole course design — {indexSize()} entries across modules, labs,
            checkpoints, readings, projects, and course policy.
          </p>
          <p className="sp-try">
            Try:{" "}
            {SUGGESTIONS.map((s, i) => (
              <span key={s}>
                {i > 0 && " · "}
                <a href={`#/search?q=${encodeURIComponent(s)}`}>{s}</a>
              </span>
            ))}
          </p>
        </div>
      ) : hits.length === 0 ? (
        <div className="sp-intro">
          <p className="lede">
            No matches for <b>{query}</b>.
          </p>
          <p className="sp-try">
            Every word has to appear somewhere in an entry, so try fewer or broader terms — or
            browse the <a href="#/syllabus">syllabus</a>.
          </p>
        </div>
      ) : (
        <>
          <div className="sp-filters">
            <button
              className={"sp-chip" + (filter === "all" ? " on" : "")}
              onClick={() => setFilter("all")}
            >
              All <span className="sp-n">{hits.length}</span>
            </button>
            {KIND_ORDER.filter((k) => counts.has(k)).map((k) => (
              <button
                key={k}
                className={"sp-chip" + (filter === k ? " on" : "")}
                onClick={() => setFilter(k)}
              >
                {KIND_LABEL[k]} <span className="sp-n">{counts.get(k)}</span>
              </button>
            ))}
          </div>

          {KIND_ORDER.filter((k) => shown.some((h) => h.doc.kind === k)).map((k) => (
            <section className="sp-group" key={k}>
              <h2>{KIND_LABEL[k]}</h2>
              <div className="sp-list">
                {shown
                  .filter((h) => h.doc.kind === k)
                  .map((h) => (
                    <SearchResultLine key={h.doc.id} hit={h} />
                  ))}
              </div>
            </section>
          ))}
        </>
      )}
    </article>
  );
}
