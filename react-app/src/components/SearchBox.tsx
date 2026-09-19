import { useEffect, useMemo, useRef, useState } from "react";
import { search } from "../lib/search";
import SearchResultLine from "./SearchResultLine";

// Masthead search: type for instant results, Enter for the full page.
// Keyboard: ↑/↓ to move, Enter to open, Esc to dismiss, "/" or Ctrl+K to focus.

const DROPDOWN_LIMIT = 8;

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(
    () => (q.trim().length >= 2 ? search(q, DROPDOWN_LIMIT) : []),
    [q],
  );

  useEffect(() => setActive(0), [q]);

  // Close on outside click and whenever a navigation happens. Landing on
  // #/search?q=… (a bookmark, a "see all results" click, the back button)
  // also mirrors that query back into the box so the two never disagree.
  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash;
      const qi = raw.indexOf("?");
      if (qi === -1 || !raw.startsWith("#/search")) return;
      const term = new URLSearchParams(raw.slice(qi + 1)).get("q");
      if (term !== null) setQ(term);
    };
    syncFromHash();

    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onHash = () => {
      setOpen(false);
      syncFromHash();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  // Global shortcuts: "/" and Ctrl/Cmd+K focus the box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el != null &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      const slash = e.key === "/" && !typing;
      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (slash || ctrlK) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    if (window.location.hash === href) {
      // Same route: force the listeners to re-run so the scroll still happens.
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = href;
    }
  };

  const submit = () => {
    const term = q.trim();
    if (term === "") return;
    go(`#/search?q=${encodeURIComponent(term)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (hits.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setActive((i) => {
        const n = hits.length + 1; // last slot is "see all results"
        return e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = hits[active];
      if (open && chosen) {
        if (chosen.doc.external) {
          window.open(chosen.doc.href, "_blank", "noreferrer");
          setOpen(false);
        } else {
          go(chosen.doc.href);
        }
      } else {
        submit();
      }
    }
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div className="search-box" ref={boxRef}>
      <span className="sb-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        ref={inputRef}
        type="search"
        className="sb-input"
        value={q}
        placeholder="Search the course…"
        aria-label="Search the course site"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {q === "" && <kbd className="sb-kbd">/</kbd>}

      {showPanel && (
        <div className="sb-panel" role="listbox">
          {hits.length === 0 ? (
            <div className="sb-empty">
              No matches for <b>{q.trim()}</b>. Try a topic, a lab, or a reading.
            </div>
          ) : (
            <>
              {hits.map((h, i) => (
                <SearchResultLine
                  key={h.doc.id}
                  hit={h}
                  active={i === active}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <button
                className={"sb-all" + (active === hits.length ? " on" : "")}
                onMouseDown={(e) => e.preventDefault()}
                onClick={submit}
              >
                See all results for “{q.trim()}” →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
