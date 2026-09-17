// Example final projects: the kinds of workflows a new CS or IT graduate
// should be able to build with agentic AI.

export interface ProjectIdea {
  title: string;
  track: "IT" | "CS" | "CS / IT";
  summary: string;
  requirements: string[];
}

export const PROJECTS: ProjectIdea[] = [
  {
    title: "IT operations help-desk agent",
    track: "IT",
    summary:
      "Triages incoming help-desk tickets, searches a knowledge base and past tickets, drafts a resolution, and escalates to a human when confidence is low or an action is risky.",
    requirements: [
      "Ticketing-system integration (read + draft replies; writes gated by confirmation)",
      "RAG over a knowledge base with citations",
      "Escalation rules and an audit log",
      "Eval set of historical tickets with known resolutions",
    ],
  },
  {
    title: "Data pipeline agent",
    track: "CS / IT",
    summary:
      "Takes messy public data (CSV, API, or PDF tables), profiles and cleans it, loads it into SQL, validates the result, and writes a summary report.",
    requirements: [
      "Tools for file inspection, SQL execution in a sandboxed database, and charting",
      "Schema inference with validation checks the agent must pass",
      "Reproducible run log that a human can replay",
      "Evaluation against hand-cleaned reference datasets",
    ],
  },
  {
    title: "Code maintenance agent",
    track: "CS",
    summary:
      "Reads a repository, finds untested or fragile code, writes tests, proposes small fixes, and opens pull requests for human review.",
    requirements: [
      "Runs in a sandbox with the test suite as the ground truth",
      "Pull requests with clear descriptions and linked evidence",
      "Metrics: tests added, coverage change, PRs accepted after review",
      "Security review of what the agent is allowed to execute",
    ],
  },
  {
    title: "Civic / public-sector information assistant",
    track: "CS / IT",
    summary:
      "Answers resident questions from municipal documents and public data — ordinances, meeting minutes, service schedules, maps — with citations and clear limits on what it can say.",
    requirements: [
      "RAG over public documents, plus at least one live public-data tool",
      "Every answer cites its source; unsupported questions are declined",
      "Accessibility and plain-language review",
      "Responsible-use statement covering accuracy, privacy, and escalation",
    ],
  },
  {
    title: "Research and reporting pipeline",
    track: "CS / IT",
    summary:
      "A multi-agent system that researches a question, drafts a report, and has a reviewer agent check claims against sources before a human signs off.",
    requirements: [
      "At least three agent roles with a defined handoff format",
      "Claim-level citation checking",
      "Cost and time comparison with a single-agent baseline",
    ],
  },
  {
    title: "Student-proposed project",
    track: "CS / IT",
    summary:
      "Teams may propose their own project, ideally with an external partner (an employer, campus office, or community organization), subject to instructor approval by week 9.",
    requirements: [
      "Meets the same core requirements: tools, evaluation, security review, responsible-use statement",
      "Written partner agreement on data access when real data is involved",
    ],
  },
];

export const PROJECT_REQUIREMENTS = [
  "A working agentic system with tool calling and at least one real integration (API, database, or MCP server)",
  "An evaluation harness with a documented eval set and reported metrics",
  "A security review, including prompt-injection testing and a permissions inventory",
  "A responsible-use statement: intended users, limits, privacy, and human oversight",
  "A public or instructor-visible repository with setup instructions and an AI-assistance log",
  "A 10-minute demo that shows traces and at least one handled failure",
];
