import type { ModuleDef } from "../data/types";
import { prevNext, unitOf } from "../data/modules";
import { RESOURCE_BY_ID } from "../data/resources";
import CopyCode from "./CopyCode";
import CourseFolderBox from "./CourseFolderBox";
import type { LabScriptStep } from "../data/types";
import { joinFolder, labFolderName, useCourseFolder, vscodeUrl } from "../lib/courseFolder";

/** Step labels that name VS Code ("VS Code", "VS Code + PowerShell"). */
const isVsCode = (where?: string) => !!where && /VS Code/i.test(where);

/** The location chip on a lab step: a link into VS Code once the folder exists and is known. */
function StepWhere({ step, href, target }: { step: LabScriptStep; href: string | null; target: string | null }) {
  if (!step.where) return null;
  if (href && target) {
    return (
      <a className="step-where step-where-link" href={href} title={`Open ${target} in VS Code`}>
        {step.where} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  const psHint = /PowerShell/i.test(step.where) ? "Tip: in VS Code, Ctrl+` opens PowerShell in the open folder" : undefined;
  return <span className="step-where" title={psHint}>{step.where}</span>;
}

export default function ModulePage({ mod }: { mod: ModuleDef }) {
  const unit = unitOf(mod);
  const { prev, next } = prevNext(mod);
  const courseFolder = useCourseFolder();

  // Number every scripted step across the lab's tasks, and find the step that
  // creates this lab's folder: VS Code links only make sense after it exists.
  const labDir = labFolderName(mod.number);
  const scripts = (mod.lab?.tasks ?? []).map((t) => (typeof t === "string" ? undefined : t.script));
  const allSteps = scripts.flatMap((sc) => sc ?? []);
  const mkdirAt = allSteps.findIndex((st) => st.commands?.includes(`mkdir ${labDir}`));
  const showFolderBox = allSteps.some((st) => isVsCode(st.where));
  const firstIndex = scripts.map((_, i) => scripts.slice(0, i).reduce((n, sc) => n + (sc?.length ?? 0), 0));

  const stepLink = (st: LabScriptStep, globalIndex: number): { href: string | null; target: string | null } => {
    if (!courseFolder || !isVsCode(st.where) || mkdirAt === -1 || globalIndex <= mkdirAt) {
      return { href: null, target: null };
    }
    const inCourseFolder = /\bin the course folder\b/i.test(st.do);
    const target = inCourseFolder ? courseFolder : joinFolder(courseFolder, labDir);
    return { href: vscodeUrl(target), target };
  };

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

      <section id="overview">
        {mod.overview.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section id="topics">
        <h2>Lecture topics</h2>
        <ul className="topics">
          {mod.topics.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      {mod.resources && mod.resources.length > 0 && (
        <section id="readings">
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
          {showFolderBox && <CourseFolderBox isLab1={mod.number === 1} />}
          <ol>
            {mod.lab.tasks.map((t, i) => {
              const task = typeof t === "string" ? { text: t, script: undefined } : t;
              return (
                <li key={i}>
                  {task.text}
                  {task.script && (
                    <details className="lab-script">
                      <summary>Step by step — follow along ({task.script.length} steps)</summary>
                      <ol className="script-steps">
                        {task.script.map((s, j) => (
                          <li key={j}>
                            <p className="step-do">
                              {s.do}
                              <StepWhere step={s} {...stepLink(s, firstIndex[i] + j)} />
                            </p>
                            {s.commands && <CopyCode text={s.commands} />}
                            {s.expect && (
                              <p className="step-expect">
                                <b>You should see:</b> {s.expect}
                              </p>
                            )}
                            {s.point && (
                              <p className="step-point">
                                <b>The point:</b> {s.point}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="lab-deliverable">
            <b>Deliverable:</b> {mod.lab.deliverable}
          </p>
        </section>
      )}

      {mod.checkpoint && (
        <section className="checkpoint" id="checkpoint">
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
        <section className="grad-note" id="grad-note">
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
