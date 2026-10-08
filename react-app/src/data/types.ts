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
  /** Where it happens, e.g. "PowerShell", "VS Code", "Claude Console". */
  where?: string;
  /** When the place is a web page, its address: the location chip becomes a link that opens it in a new tab. */
  whereUrl?: string;
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
  /** Lecture topics. The id is permanent: lecture notes, the outcome map, and
   *  links all point at it, so reword the text freely but never change the id. */
  topics: TopicDef[];
  /** Ids from data/resources.ts. */
  resources?: string[];
  lab?: Lab | null;
  /** Set when this module ends with a graded checkpoint. */
  checkpoint?: string;
  /** Additional expectation for students enrolled at the graduate level. */
  gradNote?: string;
}

/** One lecture topic, e.g. { id: "json-schema", text: "Structured output modes and JSON Schema" }. */
export interface TopicDef {
  /** Stable, unique within its module: lowercase words joined by hyphens. */
  id: string;
  text: string;
}

// ---------------------------------------------------------------- lecture notes
// One file per module under src/data/lectures/, one section per lecture topic,
// joined to the topic by its id. Rendered at #/m/<id>/notes.
//
// Text in paragraphs, list items, callouts, and table cells may use `code`,
// **bold**, and [[resource-id]] links (see components/NoteText.tsx).

export type NoteBlock =
  /** A paragraph. */
  | string
  /** A bulleted (or numbered) list. */
  | { list: string[]; ordered?: boolean }
  /** A code panel with a Copy button. */
  | { code: string; title?: string; note?: string }
  /** A small table; the first column is usually the thing being compared. */
  | { table: { head: string[]; rows: string[][]; caption?: string } }
  /** A boxed aside: a tip, a warning, or a "why this matters". */
  | { callout: string; title?: string; tone?: "tip" | "warning" | "aside" };

export interface LectureSection {
  /** The topic this section teaches: ModuleDef.topics[].id. */
  topic: string;
  blocks: NoteBlock[];
  /** The one sentence to carry out of the room. */
  takeaway?: string;
  /** Check-yourself questions; the answer is revealed on click. */
  check?: { q: string; a: string }[];
  /** Resource ids (data/resources.ts) most relevant to this topic. */
  readings?: string[];
}

export interface LectureNotesDef {
  /** Module id these notes belong to, e.g. "m02". */
  moduleId: string;
  /** Optional opening paragraph for the notes page. */
  intro?: string;
  sections: LectureSection[];
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
