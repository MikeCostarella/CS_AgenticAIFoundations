import type { ModuleDef } from "../data/types";
import { prevNext, unitOf } from "../data/modules";
import { RESOURCE_BY_ID } from "../data/resources";

export default function ModulePage({ mod }: { mod: ModuleDef }) {
  const unit = unitOf(mod);
  const { prev, next } = prevNext(mod);

  return (
    <article className="module-page">
      <div className="crumbs">
        <a href="#/syllabus">Syllabus</a> <span>›</span> Unit {unit.number} — {unit.title}
      </div>
      <h1>
        <span className="mod-no">
          Module {mod.number}
          <span className="week-pill">Week {mod.weeks}</span>
        </span>
        {mod.title}
      </h1>
      <p className="mod-subtitle">{mod.subtitle}</p>

      <section>
        {mod.overview.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section>
        <h2>Lecture topics</h2>
        <ul className="topics">
          {mod.topics.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      {mod.resources && mod.resources.length > 0 && (
        <section>
          <h2>Readings and references</h2>
          <ul className="readings">
            {mod.resources.map((id) => {
              const r = RESOURCE_BY_ID[id];
              if (!r) return null;
              return (
                <li key={id}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.label}
                  </a>
                  {r.note && <span> — {r.note}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {mod.lab && (
        <section className="lab" id="lab">
          <h2>{mod.lab.title}</h2>
          <ol>
            {mod.lab.tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <p className="lab-deliverable">
            <b>Deliverable:</b> {mod.lab.deliverable}
          </p>
        </section>
      )}

      {mod.checkpoint && (
        <section className="checkpoint">
          <h2>Graded checkpoint</h2>
          <p>{mod.checkpoint}</p>
          {mod.id === "m13" && (
            <p>
              <a href="#/projects">Example final projects →</a>
            </p>
          )}
        </section>
      )}

      {mod.gradNote && (
        <section className="grad-note">
          <h2>Graduate section</h2>
          <p>{mod.gradNote}</p>
        </section>
      )}

      <nav className="pager">
        {prev ? (
          <a href={`#/m/${prev.id}`}>← Module {prev.number}: {prev.title}</a>
        ) : (
          <a href="#/">← Course home</a>
        )}
        {next ? (
          <a href={`#/m/${next.id}`}>Module {next.number}: {next.title} →</a>
        ) : (
          <a href="#/syllabus">Back to syllabus →</a>
        )}
      </nav>
    </article>
  );
}
