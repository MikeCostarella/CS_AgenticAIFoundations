import RichText from "./RichText";
import { PROJECT_NOTES, PROJECT_REQUIREMENTS, PROJECTS } from "../data/projects";

export default function ProjectsPage() {
  return (
    <article className="page">
      <h1>Projects</h1>
      <p className="lede">
        Example final projects, modeled on the workflows employers expect a new CS or IT graduate
        to build with agentic AI. Teams pick one, adapt one, or propose their own.
      </p>

      <section id="requirements">
        <h2>Every final project must include</h2>
        <ul className="topics">
          {PROJECT_REQUIREMENTS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section id="examples">
        <h2>Example projects</h2>
        <div className="card-grid">
          {PROJECTS.map((p) => (
            <div className="card" key={p.title}>
              <div className="meta">{p.track}</div>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <ul>
                {p.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {PROJECT_NOTES.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.heading}</h2>
          {s.paras?.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
          {s.items && (
            <ul className="topics">
              {s.items.map((it, i) => (
                <li key={i}>
                  <RichText text={it} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
