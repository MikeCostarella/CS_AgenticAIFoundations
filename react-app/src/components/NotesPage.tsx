import { lectureProblems, notesCoverage, NOTES_BY_MODULE } from "../data/lectures";
import { prevNext, unitOf } from "../data/modules";
import { RESOURCE_BY_ID } from "../data/resources";
import type { ModuleDef, NoteBlock } from "../data/types";
import CopyCode from "./CopyCode";
import NoteText from "./NoteText";

function Block({ b }: { b: NoteBlock }) {
  if (typeof b === "string") {
    return (
      <p>
        <NoteText text={b} />
      </p>
    );
  }
  if ("list" in b) {
    const items = b.list.map((x, i) => (
      <li key={i}>
        <NoteText text={x} />
      </li>
    ));
    return b.ordered ? <ol className="note-list">{items}</ol> : <ul className="note-list">{items}</ul>;
  }
  if ("code" in b) {
    return (
      <figure className="note-code">
        {b.title && <figcaption>{b.title}</figcaption>}
        <CopyCode text={b.code} />
        {b.note && (
          <p className="note-code-note">
            <NoteText text={b.note} />
          </p>
        )}
      </figure>
    );
  }
  if ("table" in b) {
    return (
      <div className="note-table-wrap">
        <table className="note-table">
          {b.table.caption && <caption>{b.table.caption}</caption>}
          <thead>
            <tr>
              {b.table.head.map((h, i) => (
                <th key={i} scope="col">
                  <NoteText text={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      <NoteText text={c} />
                    </th>
                  ) : (
                    <td key={j}>
                      <NoteText text={c} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <aside className={`note-callout note-callout-${b.tone ?? "aside"}`}>
      {b.title && <div className="note-callout-title">{b.title}</div>}
      <p>
        <NoteText text={b.callout} />
      </p>
    </aside>
  );
}

export default function NotesPage({ mod }: { mod: ModuleDef }) {
  const unit = unitOf(mod);
  const { next } = prevNext(mod);
  const notes = NOTES_BY_MODULE[mod.id];
  const { written, total } = notesCoverage(mod);
  const problems = import.meta.env.DEV ? lectureProblems() : [];
  const sectionFor = (topicId: string) => notes?.sections.find((s) => s.topic === topicId);

  return (
    <article className="module-page notes-page">
      <div className="crumbs">
        <a href="#/syllabus">Syllabus</a> <span>›</span> Unit {unit.number} — {unit.title} <span>›</span>{" "}
        <a href={`#/m/${mod.id}`}>Module {mod.number}</a> <span>›</span> Lecture notes
      </div>
      <h1>
        <span className="mod-no">
          Module {mod.number} · Lecture notes
          <span className="week-pill">Week {mod.weeks}</span>
        </span>
        {mod.title}
      </h1>
      <p className="mod-subtitle">{mod.subtitle}</p>

      {problems.length > 0 && (
        <div className="oc-problems" role="alert">
          <b>Lecture notes (dev only):</b>
          <ul>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {notes?.intro && (
        <p className="notes-intro">
          <NoteText text={notes.intro} />
        </p>
      )}

      <nav className="notes-toc" id="notes-toc" aria-label="Topics in these notes">
        <div className="notes-toc-head">
          Topics · {written} of {total} written
        </div>
        <ol>
          {mod.topics.map((t) => (
            <li key={t.id}>
              {sectionFor(t.id) ? (
                <a href={`#/m/${mod.id}/notes?s=topic-${t.id}`}>{t.text}</a>
              ) : (
                <span className="notes-toc-missing">
                  {t.text} <span className="notes-coming">notes coming</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {mod.topics.map((t, i) => {
        const sec = sectionFor(t.id);
        if (!sec) return null;
        return (
          <section className="note-section" id={`topic-${t.id}`} key={t.id}>
            <div className="note-kicker">
              Topic {i + 1} of {total}
            </div>
            <h2>{t.text}</h2>
            {sec.blocks.map((b, j) => (
              <Block key={j} b={b} />
            ))}
            {sec.takeaway && (
              <p className="note-takeaway">
                <b>Takeaway.</b> <NoteText text={sec.takeaway} />
              </p>
            )}
            {sec.check && sec.check.length > 0 && (
              <div className="note-check">
                <h3>Check yourself</h3>
                {sec.check.map((c, j) => (
                  <details key={j}>
                    <summary>
                      <NoteText text={c.q} />
                    </summary>
                    <p>
                      <NoteText text={c.a} />
                    </p>
                  </details>
                ))}
              </div>
            )}
            {sec.readings && sec.readings.length > 0 && (
              <p className="note-readings">
                <b>Read more:</b>{" "}
                {sec.readings
                  .map((id) => RESOURCE_BY_ID[id])
                  .filter(Boolean)
                  .map((r, j) => (
                    <span key={r.id}>
                      {j > 0 && " · "}
                      <a href={r.url} target="_blank" rel="noreferrer">
                        {r.label}
                      </a>
                    </span>
                  ))}
              </p>
            )}
            <p className="note-nav">
              <a href={`#/m/${mod.id}/notes?s=notes-toc`}>↑ Topics</a>
              <span> · </span>
              <a href={`#/m/${mod.id}?s=topic-${t.id}`}>This topic on the module page</a>
            </p>
          </section>
        );
      })}

      <nav className="pager">
        <a href={`#/m/${mod.id}`}>← Module {mod.number} page</a>
        {mod.lab ? (
          <a href={`#/m/${mod.id}?s=lab`}>{mod.lab.title} →</a>
        ) : next ? (
          <a href={`#/m/${next.id}`}>Module {next.number}: {next.title} →</a>
        ) : (
          <a href="#/syllabus">Back to syllabus →</a>
        )}
      </nav>
    </article>
  );
}
