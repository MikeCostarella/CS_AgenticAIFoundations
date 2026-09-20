// The search index: every piece of course content flattened into documents
// the engine (lib/search.ts) can rank.
//
// Nothing here is hand-typed content — it is derived from the same registry
// the pages render, so adding a module, lab, resource, or project idea makes
// it searchable with no extra step.

import { COURSE } from "./course";
import { MODULES, UNITS } from "./modules";
import { PROJECT_NOTES, PROJECT_REQUIREMENTS, PROJECTS } from "./projects";
import { RESOURCES, resolveRefs } from "./resources";
import { TOOLS, TOOLS_LEDE, TOOLS_SECTIONS } from "./tools";
import type { LabTask, PageSection } from "./types";

export type SearchKind =
  | "module"
  | "lab"
  | "checkpoint"
  | "unit"
  | "page"
  | "project"
  | "resource"
  | "tool";

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  /** Heading shown for the result. */
  title: string;
  /** One line under the title. */
  subtitle?: string;
  /** Small label above the title, e.g. "Module 5 · Unit 2 · Week 5". */
  kicker?: string;
  /** High-signal terms (lecture topics, requirement lines, tags). */
  keywords?: string[];
  /** Prose the snippet is drawn from. */
  body: string;
  /** Where the result goes. Internal hrefs are site routes. */
  href: string;
  /** True for reading-list entries that point off-site. */
  external?: boolean;
}

/** Human label for each kind, used for the result badge and page grouping. */
export const KIND_LABEL: Record<SearchKind, string> = {
  module: "Module",
  lab: "Lab",
  checkpoint: "Checkpoint",
  unit: "Unit",
  page: "Page",
  project: "Project",
  resource: "Reading",
  tool: "Tools & Access",
};

/** Order the full results page groups results in. */
export const KIND_ORDER: SearchKind[] = [
  "module",
  "lab",
  "checkpoint",
  "unit",
  "project",
  "page",
  "tool",
  "resource",
];

function taskText(t: string | LabTask): string {
  if (typeof t === "string") return t;
  const steps = (t.script ?? []).map((s) =>
    [s.do, s.where, s.commands, s.expect, s.point].filter(Boolean).join(" "),
  );
  return [t.text, ...steps].join(" ");
}

function sectionText(s: PageSection): string {
  return resolveRefs([...(s.paras ?? []), ...(s.items ?? [])].join(" "));
}

function build(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // ------------------------------------------------------------- modules
  for (const m of MODULES) {
    const unit = UNITS.find((u) => u.number === m.unit);
    const kicker = `Module ${m.number} · Unit ${m.unit}${unit ? " · " + unit.title : ""} · Week ${m.weeks}`;

    docs.push({
      id: `mod-${m.id}`,
      kind: "module",
      title: m.title,
      subtitle: m.subtitle,
      kicker,
      keywords: m.topics,
      body: [...m.overview, ...m.topics, m.gradNote ?? ""].filter(Boolean).join(" "),
      href: `#/m/${m.id}`,
    });

    if (m.lab) {
      docs.push({
        id: `lab-${m.id}`,
        kind: "lab",
        title: m.lab.title,
        subtitle: `Module ${m.number} — ${m.title}`,
        kicker: `Lab · Week ${m.weeks}`,
        keywords: m.lab.tasks.map(taskText),
        body: [...m.lab.tasks.map(taskText), `Deliverable: ${m.lab.deliverable}`].join(" "),
        href: `#/m/${m.id}?s=lab`,
      });
    }

    if (m.checkpoint) {
      docs.push({
        id: `cp-${m.id}`,
        kind: "checkpoint",
        title: m.number === 13 ? "Final team project" : "Midterm project checkpoint",
        subtitle: `Module ${m.number} — ${m.title}`,
        kicker: `Graded checkpoint · Week ${m.weeks}`,
        body: m.checkpoint,
        href: `#/m/${m.id}?s=checkpoint`,
      });
    }

    if (m.gradNote) {
      docs.push({
        id: `grad-${m.id}`,
        kind: "checkpoint",
        title: `Graduate section — Module ${m.number}`,
        subtitle: m.title,
        kicker: "Graduate requirement",
        body: m.gradNote,
        href: `#/m/${m.id}?s=grad-note`,
      });
    }
  }

  // --------------------------------------------------------------- units
  for (const u of UNITS) {
    docs.push({
      id: `unit-${u.number}`,
      kind: "unit",
      title: `Unit ${u.number} · ${u.title}`,
      subtitle: `${u.modules.length} modules · weeks ${u.modules[0].weeks}–${u.modules[u.modules.length - 1].weeks}`,
      kicker: "Unit",
      keywords: u.modules.map((m) => m.title),
      body: [u.theme, ...u.modules.map((m) => m.title)].join(" "),
      href: `#/syllabus?s=unit-${u.number}`,
    });
  }

  // ------------------------------------------------- course-level content
  docs.push(
    {
      id: "course-thesis",
      kind: "page",
      title: "Course thesis",
      subtitle: COURSE.tagline,
      kicker: "Home",
      body: COURSE.thesis,
      href: "#/?s=thesis",
    },
    {
      id: "course-outcomes",
      kind: "page",
      title: "What you will be able to do",
      subtitle: "Course learning outcomes",
      kicker: "Home",
      keywords: COURSE.outcomes as unknown as string[],
      body: COURSE.outcomes.join(" "),
      href: "#/?s=outcomes",
    },
    {
      id: "course-format",
      kind: "page",
      title: "Format",
      subtitle: COURSE.schedule,
      kicker: "Home",
      body: `${COURSE.format} ${COURSE.levels}`,
      href: "#/?s=format",
    },
    {
      id: "course-grading",
      kind: "page",
      title: "Grading",
      subtitle: "Weights by component",
      kicker: "Home",
      keywords: COURSE.grading.map((g) => g.component),
      body: [
        ...COURSE.grading.map((g) => `${g.component}: ${g.weight}.`),
        COURSE.gradGrading,
      ].join(" "),
      href: "#/?s=grading",
    },
    {
      id: "course-integrity",
      kind: "page",
      title: "AI use and academic integrity",
      subtitle: "Disclosure, AI-assistance logs, and oral walkthroughs",
      kicker: "Home",
      body: COURSE.integrity,
      href: "#/?s=integrity",
    },
    {
      id: "course-prereqs",
      kind: "page",
      title: "Prerequisites and audience",
      subtitle: COURSE.audience,
      kicker: "Home",
      body: `${COURSE.prerequisites} ${COURSE.levels} ${COURSE.schedule} ${COURSE.status}`,
      href: "#/?s=top",
    },
    {
      id: "syllabus-schedule",
      kind: "page",
      title: "Weekly schedule",
      subtitle: "All fifteen weeks, module by module",
      kicker: "Syllabus",
      keywords: MODULES.map((m) => m.title),
      body: MODULES.map((m) => `Week ${m.weeks}: ${m.number}. ${m.title}.`).join(" "),
      href: "#/syllabus?s=weekly-schedule",
    },
  );

  // ------------------------------------------------------------ projects
  docs.push({
    id: "project-requirements",
    kind: "project",
    title: "Every final project must include",
    subtitle: "Baseline requirements for all teams",
    kicker: "Projects",
    keywords: PROJECT_REQUIREMENTS as unknown as string[],
    body: PROJECT_REQUIREMENTS.join(" "),
    href: "#/projects?s=requirements",
  });

  for (const p of PROJECTS) {
    docs.push({
      id: `project-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      kind: "project",
      title: p.title,
      subtitle: `Example final project · ${p.track}`,
      kicker: "Projects",
      keywords: p.requirements,
      body: [p.summary, ...p.requirements].join(" "),
      href: "#/projects?s=examples",
    });
  }

  for (const s of PROJECT_NOTES) {
    docs.push({
      id: `project-note-${s.id}`,
      kind: "project",
      title: s.heading,
      kicker: "Projects",
      body: sectionText(s),
      href: `#/projects?s=${s.id}`,
    });
  }

  // ------------------------------------------------------ tools & access
  docs.push({
    id: "tools-overview",
    kind: "tool",
    title: "Tools & Access",
    subtitle: "What the course needs and why",
    kicker: "Tools & Access",
    keywords: TOOLS.map((t) => t.name),
    body: TOOLS_LEDE,
    href: "#/tools",
  });

  for (const t of TOOLS) {
    docs.push({
      id: `tool-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      kind: "tool",
      title: t.name,
      subtitle: t.examples,
      kicker: "Tools & Access",
      keywords: t.examples.split(/[,;]\s*/),
      body: t.why,
      href: "#/tools?s=what-the-course-uses",
    });
  }

  for (const s of TOOLS_SECTIONS) {
    const body = sectionText(s);
    if (body === "") continue;
    docs.push({
      id: `tools-${s.id}`,
      kind: "tool",
      title: s.heading,
      kicker: "Tools & Access",
      body,
      href: `#/tools?s=${s.id}`,
    });
  }

  // ------------------------------------------------------------ readings
  for (const r of RESOURCES) {
    const citedBy = MODULES.filter((m) => m.resources?.includes(r.id));
    docs.push({
      id: `res-${r.id}`,
      kind: "resource",
      title: r.label,
      subtitle: r.note,
      kicker: `${r.group}${citedBy.length > 0 ? " · cited in module " + citedBy.map((m) => m.number).join(", ") : ""}`,
      keywords: citedBy.map((m) => m.title),
      body: [r.note ?? "", ...citedBy.map((m) => m.title)].join(" "),
      href: r.url,
      external: true,
    });
  }

  return docs;
}

export const SEARCH_DOCS: SearchDoc[] = build();
