// The course registry types. The whole site is driven by one typed registry
// (src/data/modules.ts): navigation, the syllabus, the weekly schedule,
// module pages, and the home-page stats all derive from it.

export interface Link {
  label: string;
  url: string;
  note?: string;
}

export interface LabScriptStep {
  /** What to do — one imperative action. */
  do: string;
  /** Where it happens, e.g. "PowerShell", "VS Code terminal", "console.anthropic.com". */
  where?: string;
  /** Exact commands or code to type, shown in a code block. May be multiline. */
  commands?: string;
  /** What success looks like on screen. */
  expect?: string;
  /** The point being made — why this step is in the lab at all. */
  point?: string;
}

export interface LabTask {
  /** The task as listed on the module page. */
  text: string;
  /** Optional live script: a step-by-step walkthrough rendered as an expander. */
  script?: LabScriptStep[];
}

export interface Lab {
  title: string;
  /** Plain strings, or objects when the task carries a step-by-step script. */
  tasks: (string | LabTask)[];
  deliverable: string;
}

export interface ModuleDef {
  /** Stable id used in the URL hash, e.g. "m01". */
  id: string;
  number: number;
  unit: number;
  /** Semester week(s) this module occupies, e.g. "1" or "14–15". */
  weeks: string;
  title: string;
  subtitle: string;
  overview: string[];
  topics: string[];
  /** Ids from data/resources.ts. */
  resources?: string[];
  lab?: Lab | null;
  /** Set when this module ends with a graded checkpoint. */
  checkpoint?: string;
  /** Additional expectation for students enrolled at the graduate level. */
  gradNote?: string;
}

export interface UnitDef {
  number: number;
  title: string;
  theme: string;
  modules: ModuleDef[];
}

/**
 * A prose section of a static page (Tools & Access, Projects). Held as data
 * so the page and the search index render from the same source.
 * Text may contain [[resource-id]] references — see resolveRefs().
 */
export interface PageSection {
  /** Stable id: also the scroll anchor, e.g. #/tools?s=cost-controls. */
  id: string;
  heading: string;
  paras?: string[];
  items?: string[];
}
