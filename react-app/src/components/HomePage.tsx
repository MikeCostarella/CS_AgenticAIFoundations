import { useState } from "react";
import { COURSE } from "../data/course";
import {
  CHECKPOINT_COUNT,
  LAB_COUNT,
  MODULE_COUNT,
  MODULES,
  UNIT_COUNT,
  UNITS,
} from "../data/modules";
import { OUTCOME_MAP, outcomeMapProblems, outcomeModules } from "../data/outcomeMap";

type StatPanel = "labs" | "checkpoints" | null;

/** "Midterm project (week 8): a single agent…" → ["Midterm project (week 8)", "a single agent…"] */
function splitCheckpoint(text: string): [string, string] {
  const i = text.indexOf(": ");
  return i === -1 ? [text, ""] : [text.slice(0, i), text.slice(i + 2)];
}

/** [1, 3, 4] → "Modules 1, 3, 4"; [] → "the final project". */
function modulesLabel(nums: number[]): string {
  if (nums.length === 0) return "the final project";
  return `${nums.length === 1 ? "Module" : "Modules"} ${nums.join(", ")}`;
}

export default function HomePage() {
  const [panel, setPanel] = useState<StatPanel>(null);
  const toggle = (p: Exclude<StatPanel, null>) => setPanel((cur) => (cur === p ? null : p));

  // Which outcomes have their "where it's taught" list open.
  const [openOutcomes, setOpenOutcomes] = useState<Set<number>>(() => new Set());
  const allOpen = openOutcomes.size === COURSE.outcomes.length;
  const toggleOutcome = (i: number) =>
    setOpenOutcomes((cur) => {
      const next = new Set(cur);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const toggleAllOutcomes = () =>
    setOpenOutcomes(allOpen ? new Set() : new Set(COURSE.outcomes.map((_, i) => i)));
  const mapProblems = import.meta.env.DEV ? outcomeMapProblems() : [];

  return (
    <article className="home" id="top">
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
      <p className="contact">
        <b>Course path:</b>{" "}
        {COURSE.coursePath.map((c) => (
          <span key={c.url}>
            <a href={c.url} target="_blank" rel="noreferrer">
              {c.title}
            </a>{" "}
            →{" "}
          </span>
        ))}
        {COURSE.heading}
      </p>

      <div className="stat-row">
        <a className="stat" href="#/syllabus?s=weekly-schedule" title="Weekly schedule">
          <b>15</b> weeks
        </a>
        <a className="stat" href="#/?s=units" title="The five units">
          <b>{UNIT_COUNT}</b> units
        </a>
        <a className="stat" href="#/syllabus" title="All modules on the syllabus">
          <b>{MODULE_COUNT}</b> modules
        </a>
        <button
          type="button"
          className="stat stat-toggle"
          aria-expanded={panel === "labs"}
          aria-controls="stat-panel-labs"
          onClick={() => toggle("labs")}
        >
          <b>{LAB_COUNT}</b> hands-on labs <span className="stat-caret" aria-hidden="true">▾</span>
        </button>
        <button
          type="button"
          className="stat stat-toggle"
          aria-expanded={panel === "checkpoints"}
          aria-controls="stat-panel-checkpoints"
          onClick={() => toggle("checkpoints")}
        >
          <b>{CHECKPOINT_COUNT}</b> checkpoints: midterm &amp; final{" "}
          <span className="stat-caret" aria-hidden="true">▾</span>
        </button>
      </div>

      {panel === "labs" && (
        <div className="stat-panel" id="stat-panel-labs" aria-label="All hands-on labs">
          <ol className="stat-list">
            {MODULES.filter((m) => m.lab).map((m) => (
              <li key={m.id}>
                <a href={`#/m/${m.id}?s=lab`}>{m.lab!.title}</a>
                <span className="stat-meta">
                  Module {m.number} · {m.title} · Week {m.weeks}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {panel === "checkpoints" && (
        <div className="stat-panel" id="stat-panel-checkpoints" aria-label="Graded checkpoints">
          <ul className="stat-list">
            {MODULES.filter((m) => m.checkpoint).map((m) => {
              const [head, body] = splitCheckpoint(m.checkpoint!);
              return (
                <li key={m.id}>
                  <a href={`#/m/${m.id}?s=checkpoint`}>{head}</a>
                  <span className="stat-meta">
                    Module {m.number} · Week {m.weeks}
                  </span>
                  {body && <span className="stat-desc">{body}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <section id="thesis">
        <h2>Course thesis</h2>
        <p>{COURSE.thesis}</p>
        <div className="agent-loop" aria-label="The agent loop">
          <span className="step">Reason</span><span className="arrow">→</span>
          <span className="step">Act (call a tool)</span><span className="arrow">→</span>
          <span className="step">Observe</span><span className="arrow">→</span>
          <span className="step">Evaluate</span><span className="arrow">↺</span>
        </div>
      </section>

      <section id="outcomes">
        <div className="oc-heading">
          <h2>What you will be able to do</h2>
          <button type="button" className="oc-all" onClick={toggleAllOutcomes} aria-pressed={allOpen}>
            {allOpen ? "Hide where each is taught" : "Show where each is taught"}
          </button>
        </div>
        {mapProblems.length > 0 && (
          <div className="oc-problems" role="alert">
            <b>Outcome map (dev only):</b>
            <ul>
              {mapProblems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <ol className="outcomes">
          {COURSE.outcomes.map((o, i) => {
            const groups = OUTCOME_MAP[i] ?? [];
            const refCount = groups.reduce((n, g) => n + g.refs.length, 0);
            const open = openOutcomes.has(i);
            return (
              <li key={i} id={`outcome-${i + 1}`}>
                {o}
                {refCount > 0 && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="oc-toggle"
                      aria-expanded={open}
                      aria-controls={`outcome-refs-${i + 1}`}
                      onClick={() => toggleOutcome(i)}
                    >
                      Taught in {modulesLabel(outcomeModules(i))} · {refCount} references{" "}
                      <span className="stat-caret" aria-hidden="true">▾</span>
                    </button>
                  </>
                )}
                {open && (
                  <div className="oc-panel" id={`outcome-refs-${i + 1}`} aria-label={`Where outcome ${i + 1} is taught`}>
                    {groups.map((g) => (
                      <div className="oc-group" key={g.group}>
                        <div className="oc-group-head">
                          {g.group}
                          {g.when && <span className="oc-when"> · {g.when}</span>}
                        </div>
                        <ul>
                          {g.refs.map((r) => (
                            <li key={r.href}>
                              <span className="oc-kind">{r.kind}</span>
                              <a href={r.href}>{r.kind === "Checkpoint" ? splitCheckpoint(r.text)[0] : r.text}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section id="format">
        <h2>Format</h2>
        <p>{COURSE.format}</p>
        <p>{COURSE.levels}.</p>
      </section>

      <section id="units">
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

      <section id="grading">
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

      <section id="integrity">
        <h2>AI use and academic integrity</h2>
        <p>{COURSE.integrity}</p>
      </section>
    </article>
  );
}
