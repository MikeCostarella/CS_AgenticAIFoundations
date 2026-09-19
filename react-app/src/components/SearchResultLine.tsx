import { Fragment } from "react";
import { KIND_LABEL } from "../data/searchIndex";
import type { SearchHit } from "../lib/search";

// One result row, shared by the dropdown and the full results page.

export function Snippet({ parts }: { parts: SearchHit["snippet"] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? <mark key={i}>{p.text}</mark> : <Fragment key={i}>{p.text}</Fragment>,
      )}
    </>
  );
}

export default function SearchResultLine({
  hit,
  active = false,
  onNavigate,
}: {
  hit: SearchHit;
  active?: boolean;
  onNavigate?: () => void;
}) {
  const { doc } = hit;
  return (
    <a
      className={"sr-item" + (active ? " on" : "")}
      href={doc.href}
      target={doc.external ? "_blank" : undefined}
      rel={doc.external ? "noreferrer" : undefined}
      onClick={onNavigate}
    >
      <div className="sr-top">
        <span className={"sr-kind k-" + doc.kind}>{KIND_LABEL[doc.kind]}</span>
        <span className="sr-title">
          {doc.title}
          {doc.external && <span className="sr-ext"> ↗</span>}
        </span>
      </div>
      {doc.kicker && <div className="sr-kicker">{doc.kicker}</div>}
      {hit.snippet.length > 0 && (
        <div className="sr-snippet">
          <Snippet parts={hit.snippet} />
        </div>
      )}
    </a>
  );
}
