import { useEffect, useRef, useState } from "react";
import { UNITS } from "../data/modules";
import { COURSE } from "../data/course";
import BuildStamp from "./BuildStamp";

// Fleet hamburger accordion menu: one section open at a time, internal
// navigation plus external links, build stamp at the foot.

const EXTERNAL = [
  { label: "Mike Costarella — Courses", href: "https://mikecostarella.github.io/MikeCostarellaCourses/" },
  { label: "My Web Site", href: "https://mikecostarella.github.io/MyWebSite/" },
  { label: "GitHub repository", href: `https://github.com/MikeCostarella/${COURSE.repo}` },
  { label: "GitHub Actions (deploys)", href: `https://github.com/MikeCostarella/${COURSE.repo}/actions` },
];

export default function MainMenu() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>("view");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => setOpen(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = (id: string) => setSection((s) => (s === id ? null : id));

  const head = (id: string, label: string) => (
    <button
      className={"acc-head" + (section === id ? " open" : "")}
      aria-expanded={section === id}
      onClick={() => toggle(id)}
    >
      <span>{label}</span>
      <span className="chev">▾</span>
    </button>
  );

  return (
    <div className="main-menu" ref={ref}>
      <button
        className="menu-btn"
        aria-expanded={open}
        aria-label="Main menu"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
      {open && (
        <div className="menu-panel">
          <div className="acc-section">
            {head("view", "View")}
            {section === "view" && (
              <div className="acc-body">
                <a href="#/">Home</a>
                <a href="#/syllabus">Syllabus &amp; weekly schedule</a>
                <a href="#/projects">Projects</a>
                <a href="#/tools">Tools &amp; Access</a>
                <a href="#/resources">Resources</a>
              </div>
            )}
          </div>

          {UNITS.map((u) => {
            const id = `unit${u.number}`;
            return (
              <div className="acc-section" key={id}>
                {head(id, `Unit ${u.number} · ${u.title}`)}
                {section === id && (
                  <div className="acc-body">
                    {u.modules.map((m) => (
                      <a key={m.id} href={`#/m/${m.id}`}>
                        {m.number}. {m.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="acc-section">
            {head("links", "Links")}
            {section === "links" && (
              <div className="acc-body">
                {EXTERNAL.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
                <a href={`mailto:${COURSE.contactEmail}`}>Contact ✉</a>
              </div>
            )}
          </div>

          <div className="menu-foot">
            <BuildStamp />
          </div>
        </div>
      )}
    </div>
  );
}
