import RichText from "./RichText";
import { TOOLS, TOOLS_LEDE, TOOLS_SECTIONS, TOOLS_TABLE_SECTION } from "../data/tools";

export default function ToolsPage() {
  return (
    <article className="page">
      <h1>Tools &amp; Access</h1>
      <p className="lede">{TOOLS_LEDE}</p>

      {TOOLS_SECTIONS.map((s) => (
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

          {s.id === TOOLS_TABLE_SECTION && (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Need</th>
                  <th>Examples</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t) => (
                  <tr key={t.name}>
                    <td>{t.name}</td>
                    <td>{t.examples}</td>
                    <td>{t.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </article>
  );
}
