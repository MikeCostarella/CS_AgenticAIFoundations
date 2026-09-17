import { COURSE } from "../data/course";
import { LAB_COUNT, MODULE_COUNT, UNIT_COUNT, UNITS } from "../data/modules";

export default function HomePage() {
  return (
    <article className="home">
      <p className="draft-banner">
        <b>Draft.</b> {COURSE.status}
      </p>
      <p className="kicker">{COURSE.audience}</p>
      <h1>{COURSE.heading}</h1>
      <p className="tagline">{COURSE.tagline}</p>
      <p className="schedule">{COURSE.schedule}</p>
      <p className="contact">
        <b>Prerequisites:</b> {COURSE.prerequisites}
      </p>

      <div className="stat-row">
        <span><b>15</b> weeks</span>
        <span><b>{UNIT_COUNT}</b> units</span>
        <span><b>{MODULE_COUNT}</b> modules</span>
        <span><b>{LAB_COUNT}</b> hands-on labs</span>
        <span><b>2</b> checkpoints: midterm &amp; final</span>
      </div>

      <section>
        <h2>Course thesis</h2>
        <p>{COURSE.thesis}</p>
        <div className="agent-loop" aria-label="The agent loop">
          <span className="step">Reason</span><span className="arrow">→</span>
          <span className="step">Act (call a tool)</span><span className="arrow">→</span>
          <span className="step">Observe</span><span className="arrow">→</span>
          <span className="step">Evaluate</span><span className="arrow">↺</span>
        </div>
      </section>

      <section>
        <h2>What you will be able to do</h2>
        <ol className="outcomes">
          {COURSE.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Format</h2>
        <p>{COURSE.format}</p>
        <p>{COURSE.levels}.</p>
      </section>

      <section>
        <h2>The five units</h2>
        <div className="unit-cards">
          {UNITS.map((u) => (
            <a className="unit-card" key={u.number} href={`#/m/${u.modules[0].id}`}>
              <div className="uc-no">Unit {u.number}</div>
              <div className="uc-title">{u.title}</div>
              <div className="uc-theme">{u.theme}</div>
              <div className="uc-mods">
                Modules {u.modules[0].number}–{u.modules[u.modules.length - 1].number} · Weeks{" "}
                {u.modules[0].weeks.split("–")[0]}–
                {u.modules[u.modules.length - 1].weeks.split("–").pop()}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2>Grading</h2>
        <table className="grading">
          <tbody>
            {COURSE.grading.map((g) => (
              <tr key={g.component}>
                <td>{g.component}</td>
                <td className="gw">{g.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{COURSE.gradGrading}</p>
      </section>

      <section>
        <h2>AI use and academic integrity</h2>
        <p>{COURSE.integrity}</p>
      </section>
    </article>
  );
}
