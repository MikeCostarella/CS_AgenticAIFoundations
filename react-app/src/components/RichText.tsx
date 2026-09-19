import { Fragment } from "react";
import { REF_PATTERN, RESOURCE_BY_ID } from "../data/resources";

// Renders page prose that may contain [[resource-id]] references, turning
// each one into a link to that reading. Plain text passes straight through.

export default function RichText({ text }: { text: string }) {
  const parts: JSX.Element[] = [];
  const re = new RegExp(REF_PATTERN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    }
    const r = RESOURCE_BY_ID[m[1]];
    parts.push(
      r ? (
        <a key={key++} href={r.url} target="_blank" rel="noreferrer">
          {r.label}
        </a>
      ) : (
        <Fragment key={key++}>{m[0]}</Fragment>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);

  return <>{parts}</>;
}
