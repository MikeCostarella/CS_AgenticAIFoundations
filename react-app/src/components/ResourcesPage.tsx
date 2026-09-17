import { RESOURCE_GROUPS, RESOURCES } from "../data/resources";

export default function ResourcesPage() {
  return (
    <article className="page">
      <h1>Resources</h1>
      <p className="lede">Papers, guides, documentation, and tools referenced across the modules.</p>
      {RESOURCE_GROUPS.map((g) => (
        <section className="res-group" key={g}>
          <h2>{g}</h2>
          <ul className="readings">
            {RESOURCES.filter((r) => r.group === g).map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.label}
                </a>
                {r.note && <span> — {r.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
