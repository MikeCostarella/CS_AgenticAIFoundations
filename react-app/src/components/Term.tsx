import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TERM_BY_ID } from "../data/glossary";
import { RESOURCE_BY_ID } from "../data/resources";
import NoteText from "./NoteText";

// A glossary term inside prose: dotted underline; hover, keyboard focus, or a
// tap shows the definition. Escape or a click elsewhere closes it.

export default function Term({ id, children }: { id: string; children: ReactNode }) {
  const t = TERM_BY_ID[id];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  if (!t) return <>{children}</>;
  const more = t.more ? RESOURCE_BY_ID[t.more] : undefined;

  return (
    <span
      className={"term" + (open ? " open" : "")}
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button type="button" className="term-btn" aria-expanded={open} aria-describedby={tipId} onClick={() => setOpen((v) => !v)}>
        {children}
      </button>
      <span className="term-tip" id={tipId}>
        <span className="term-tip-name">{t.term}</span>
        <span className="term-tip-def">
          <NoteText text={t.def} terms={false} />
        </span>
        <span className="term-tip-links">
          <a href={`#/glossary?s=term-${t.id}`}>Glossary</a>
          {more && (
            <>
              {" · "}
              <a href={more.url} target="_blank" rel="noreferrer">
                Learn more: {more.label} ↗
              </a>
            </>
          )}
        </span>
      </span>
    </span>
  );
}
