import { Fragment } from "react";
import RichText from "./RichText";

// Inline markup for lecture notes: `code`, **bold**, *italic*, and [[resource-id]] links
// (the last handled by RichText). Deliberately tiny — not Markdown.

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;

export default function NoteText({ text }: { text: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={i}>{p.slice(1, -1)}</code>;
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return p ? <RichText key={i} text={p} /> : <Fragment key={i} />;
      })}
    </>
  );
}
