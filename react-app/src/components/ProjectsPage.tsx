import { PROJECT_REQUIREMENTS, PROJECTS } from "../data/projects";

export default function ProjectsPage() {
  return (
    <article className="page">
      <h1>Projects</h1>
      <p className="lede">
        Example final projects, modeled on the workflows employers expect a new CS or IT graduate
        to build with agentic AI. Teams pick one, adapt one, or propose their own.
      </p>

      <section>
        <h2>Every final project must include</h2>
        <ul className="topics">
          {PROJECT_REQUIREMENTS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section>
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

      <section>
        <h2>Midterm project (week 8)</h2>
        <p>
          A single agent with tool calling, retrieval, and at least one MCP or enterprise
          integration, demonstrated with traces and described in a short design document. Most
          teams grow their midterm agent into their final project.
        </p>
      </section>

      <section>
        <h2>Industry partners</h2>
        <p>
          Employer and community partners are welcome to suggest project problems, provide
          realistic (non-sensitive) data, give guest lectures, or join final demos as reviewers.
        </p>
      </section>
    </article>
  );
}
