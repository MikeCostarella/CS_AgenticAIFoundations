// The course registry types. The whole site is driven by one typed registry
// (src/data/modules.ts): navigation, the syllabus, the weekly schedule,
// module pages, and the home-page stats all derive from it.

export interface Link {
  label: string;
  url: string;
  note?: string;
}

export interface Lab {
  title: string;
  tasks: string[];
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
