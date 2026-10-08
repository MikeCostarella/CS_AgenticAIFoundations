import { Fragment } from "react";
import { TERM_BY_ID, TERM_PATTERN } from "../data/glossary";
import RichText from "./RichText";
import Term from "./Term";

// Inline markup for lecture notes: {{term-id}} or {{term-id|words}} glossary
// terms, `code`, **bold**, *italic*, and [[resource-id]] links (the last
// handled by RichText). Deliberately tiny — not Markdown.

const INLINE = new RegExp(
  "(" + TERM_PATTERN.source + "|`[^`]+`|\\*\\*[^*]+\\*\\*|\\*[^*\\s][^*]*\\*)",
  "g",
);

/** terms={false} renders {{…}} as plain words (used inside a definition popup). */
export default function NoteText({ text, terms = true }: { text: string; terms?: boolean }) {
  const out: JSX.Element[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(<RichText key={key++} text={text.slice(last, i)} />);
    const p = m[0];
    const tm = TERM_PATTERN.exec(p);
    if (tm && tm.index === 0 && tm[0] === p) {
      const shown = tm[2] ?? TERM_BY_ID[tm[1]]?.term ?? tm[1];
      out.push(terms ? <Term key={key++} id={tm[1]}>{shown}</Term> : <Fragment key={key++}>{shown}</Fragment>);
    } else if (p.startsWith("`")) {
      out.push(<code key={key++}>{p.slice(1, -1)}</code>);
    } else if (p.startsWith("**")) {
      out.push(<strong key={key++}><NoteText text={p.slice(2, -2)} terms={terms} /></strong>);
    } else {
      out.push(<em key={key++}><NoteText text={p.slice(1, -1)} terms={terms} /></em>);
    }
    last = i + p.length;
  }
  if (last < text.length) out.push(<RichText key={key++} text={text.slice(last)} />);
  return <>{out}</>;
}
