import type { PageSection } from "./types";

// Tools & Access page content. Kept here rather than inline in the component
// so the search index can read it from the same source the page renders.
//
// Inside prose, [[resource-id]] expands to a link to that entry in
// data/resources.ts — see components/RichText.tsx and resolveRefs().

export interface ToolNeed {
  name: string;
  examples: string;
  why: string;
}

export const TOOLS: ToolNeed[] = [
  {
    name: "Chat assistants (paid tier)",
    examples: "ChatGPT Plus, Claude Pro",
    why: "Research, design discussion, and agentic features that free tiers limit or omit.",
  },
  {
    name: "Model API access",
    examples: "Anthropic, OpenAI, or equivalent API credits",
    why: "Every lab from week 1 calls models from code. Agent loops make many calls per task, so a per-student credit budget is needed in addition to chat subscriptions.",
  },
  {
    name: "Agentic coding tools",
    examples: "GitHub Copilot, Claude Code, Cursor",
    why: "Module 10 and the final project. Copilot is available to verified students through GitHub Education.",
  },
  {
    name: "Development environment",
    examples: "Python 3.12+, Node.js LTS, Git/GitHub, VS Code, Docker (optional)",
    why: "Free; available on lab machines or student laptops.",
  },
  {
    name: "Data services",
    examples: "PostgreSQL + pgvector or Chroma; SQLite",
    why: "Retrieval and integration labs. All free and open source.",
  },
];

export const TOOLS_LEDE =
  "What students and faculty need to build, test, debug, and evaluate agentic systems all semester — and why university-supported access matters.";

/** Id of the section whose body is the TOOLS table rather than prose. */
export const TOOLS_TABLE_SECTION = "what-the-course-uses";

export const TOOLS_SECTIONS: PageSection[] = [
  {
    id: "free-tiers",
    heading: "Why free tiers are not enough",
    paras: [
      "Agentic development is iterative. A single debugging session can run an agent loop dozens of times, and each run makes many model calls. Free tiers hit rate and usage limits in the middle of exactly that work, which turns labs into waiting and makes fair grading hard. Reliable, institution-supported access puts every student on the same footing regardless of what they can personally afford.",
    ],
  },
  {
    id: TOOLS_TABLE_SECTION,
    heading: "What the course uses",
  },
  {
    id: "access-options",
    heading: "Options for providing access",
    items: [
      "Institutional or education licenses for chat and coding assistants",
      "Pooled API credits with per-student keys and spending caps, managed by the department",
      "Student programs such as [[github-education]] for coding assistance",
      "Vendor education and research credit programs",
      "Open-weight models on department hardware as a fallback for high-volume experiments",
    ],
  },
  {
    id: "cost-controls",
    heading: "Cost controls built into the labs",
    items: [
      "Every lab logs tokens and cost per run from week 1",
      "Agents enforce step and dollar budgets (Module 4)",
      "Small, inexpensive models are the default; larger models are used only when measured to help",
      "Eval runs are sized and cached to avoid repeated spending",
    ],
  },
];
