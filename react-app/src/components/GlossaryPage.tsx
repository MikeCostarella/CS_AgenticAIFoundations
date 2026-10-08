import { GLOSSARY_SORTED } from "../data/glossary";
import { termUsage } from "../data/lectures";
import { MODULE_BY_ID } from "../data/modules";
import { RESOURCE_BY_ID } from "../data/resources";
import NoteText from "./NoteText";

export default function GlossaryPage() {
  const usage = termUsage();
  const letters = [...new Set(GLOSSARY_SORTED.map((t) => t.term[0].toUpperCase()))];

  return (
    <article className="page glossary-page">
      <h1>Glossary</h1>
      <p className="lede">
        Plain-English definitions of the terms used across the course. In the lecture notes, a term with a dotted
        underline shows its definition when you hover over it, tab to it, or tap it.
      </p>
      <nav className="gl-letters" aria-label="Jump to letter">
        {letters.map((l) => (
          <a key={l} href={`#/glossary?s=letter-${l}`}>
            {l}
          </a>
        ))}
      </nav>
      <dl className="gl-list">
        {GLOSSARY_SORTED.map((t, i) => {
          const letter = t.term[0].toUpperCase();
          const firstOfLetter = i === 0 || GLOSSARY_SORTED[i - 1].term[0].toUpperCase() !== letter;
          const more = t.more ? RESOURCE_BY_ID[t.more] : undefined;
          const uses = usage[t.id] ?? [];
          return (
            <div className="gl-entry" id={`term-${t.id}`} key={t.id}>
              {firstOfLetter && <span id={`letter-${letter}`} className="gl-anchor" />}
              <dt>
                {t.term}
                {t.aka && t.aka.length > 0 && <span className="gl-aka"> · also: {t.aka.join(", ")}</span>}
              </dt>
              <dd>
                <p>
                  <NoteText text={t.def} terms={false} />
                </p>
                {(more || uses.length > 0) && (
                  <p className="gl-meta">
                    {uses.length > 0 && (
                      <>
                        Used in:{" "}
                        {uses.map((u, j) => {
                          const mod = MODULE_BY_ID[u.moduleId];
                          const topic = mod?.topics.find((x) => x.id === u.topicId);
                          return (
                            <span key={`${u.moduleId}-${u.topicId}`}>
                              {j > 0 && " · "}
                              <a href={`#/m/${u.moduleId}/notes?s=topic-${u.topicId}`} title={topic?.text}>
                                Module {mod?.number}: {topic?.text.split(/[:;(]/)[0].trim()}
                              </a>
                            </span>
                          );
                        })}
                      </>
                    )}
                    {more && (
                      <>
                        {uses.length > 0 && <br />}
                        Learn more:{" "}
                        <a href={more.url} target="_blank" rel="noreferrer">
                          {more.label} ↗
                        </a>
                      </>
                    )}
                  </p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
