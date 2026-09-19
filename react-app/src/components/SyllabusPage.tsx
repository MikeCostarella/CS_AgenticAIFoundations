import { MODULES, UNITS } from "../data/modules";

export default function SyllabusPage() {
  return (
    <article className="syllabus">
      <h1>Syllabus</h1>
      <p className="syll-sub">
        Thirteen modules in five units over fifteen weeks. Each module lists its lecture topics,
        readings, and lab; labs build on one another toward the midterm and final projects.
      </p>

      <section className="syll-unit" id="weekly-schedule">
        <h2>Weekly schedule</h2>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Module</th>
              <th>Build</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.id}>
                <td>{m.weeks}</td>
                <td>
                  <a href={`#/m/${m.id}`}>
                    {m.number}. {m.title}
                  </a>
                </td>
                <td>{m.lab ? m.lab.title.replace(/^Lab \d+ — /, "") : m.checkpoint ? "Final projects & demos" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {UNITS.map((u) => (
        <section key={u.number} className="syll-unit" id={`unit-${u.number}`}>
          <h2>
            <span className="unit-no">Unit {u.number}</span> {u.title}
          </h2>
          <p className="unit-theme">{u.theme}</p>
          <ul className="syll-mods">
            {u.modules.map((m) => (
              <li key={m.id}>
                <a href={`#/m/${m.id}`}>
                  <span className="sm-no">{m.number}</span>
                  <span className="sm-body">
                    <span className="sm-title">{m.title}</span>
                    <span className="sm-sub">Week {m.weeks} · {m.subtitle}</span>
                  </span>
                  <span className="sm-tags">
                    {m.lab && <span className="tag tag-lab">Lab</span>}
                    {m.checkpoint && <span className="tag tag-cp">Checkpoint</span>}
                    {m.gradNote && <span className="tag tag-grad">Grad</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
