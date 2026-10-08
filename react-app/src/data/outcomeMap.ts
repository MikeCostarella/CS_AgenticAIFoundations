// The curriculum map: for each course outcome (same order as COURSE.outcomes),
// where in the course it is taught, practiced, and assessed.
//
// Lecture topics are named by their permanent id (ModuleDef.topics[].id). Lab
// tasks and project requirements are named by a short piece of their own text,
// so reordering them does not silently re-point a reference. resolveRef()
// turns references into links; any that no longer match are reported by
// outcomeMapProblems() (shown in dev builds).

import { COURSE } from "./course";
import { MODULE_BY_ID } from "./modules";
import { notesHref } from "./lectures";
import { PROJECT_REQUIREMENTS, PROJECTS, projectSlug } from "./projects";
import type { ModuleDef } from "./types";

export type OutcomeRef =
  /** A lecture topic, by its permanent id. */
  | { m: string; topic: string }
  /** A module's whole lab. */
  | { m: string; lab: true }
  /** One task within a module's lab, matched by a phrase it contains. */
  | { m: string; task: string }
  /** A module's graded checkpoint. */
  | { m: string; checkpoint: true }
  /** A final-project requirement on the Projects page. */
  | { requirement: string }
  /** An example project on the Projects page, by title. */
  | { project: string };

const t = (m: string, ...topics: string[]): OutcomeRef[] => topics.map((topic) => ({ m, topic }));
const lab = (m: string): OutcomeRef => ({ m, lab: true });
const task = (m: string, phrase: string): OutcomeRef => ({ m, task: phrase });
const checkpoint = (m: string): OutcomeRef => ({ m, checkpoint: true });
const req = (phrase: string): OutcomeRef => ({ requirement: phrase });
const project = (title: string): OutcomeRef => ({ project: title });

export const OUTCOME_REFS: OutcomeRef[][] = [
  // 1. LLMs as software components
  [
    ...t("m01", "what-an-llm-is", "tokens-context", "sampling", "chat-apis", "cost-latency", "failure-modes"),
    lab("m01"),
    task("m01", "Run the same prompt 10 times"),
    ...t("m04", "budgets"),
  ],
  // 2. The decision ladder: code, workflow, single call, or agent
  [
    ...t("m01", "decision-ladder"),
    ...t("m02", "second-rung"),
    ...t("m03", "workflows-vs-agents", "ladder-compared"),
    task("m03", "Pick one of your three tasks"),
    ...t("m08", "multi-agent-cost"),
    task("m08", "single-agent baseline"),
    ...t("m13", "scoping"),
    req("justification that the problem needs an agent"),
  ],
  // 3. Model APIs and structured output
  [
    ...t("m01", "chat-apis"),
    task("m01", "Write a small CLI"),
    ...t("m02", "json-schema", "validation-repair", "prompt-contracts", "few-shot", "prompt-versioning"),
    lab("m02"),
    ...t("m03", "tool-definitions"),
  ],
  // 4. The agent loop
  [
    ...t("m03", "tool-definitions", "agent-loop", "parallel-tools", "stopping", "react"),
    lab("m03"),
    ...t("m04", "tool-errors", "retries", "budgets", "tool-design"),
    lab("m04"),
  ],
  // 5. Retrieval and memory
  [
    ...t("m05", "embeddings", "chunking", "vector-stores", "rag-vs-tool", "citations", "memory"),
    lab("m05"),
    checkpoint("m07"),
    ...t("m12", "privacy"),
  ],
  // 6. MCP and enterprise integration, reconciliation, escalation
  [
    ...t("m06", "mcp-architecture", "mcp-primitives", "transports", "mcp-auth", "mcp-testing"),
    lab("m06"),
    ...t("m07", "apis-as-tools", "read-vs-write", "service-identity", "audit-logs", "rate-limits", "reconciliation", "escalation"),
    lab("m07"),
    task("m07", "Optional midterm extension"),
    checkpoint("m07"),
    ...t("m11", "escalation-testing"),
    req("at least one real integration"),
    project("Cross-system reconciliation agent"),
  ],
  // 7. Multi-agent orchestration, frameworks, build / extend / buy
  [
    ...t("m08", "chaining-routing", "orchestrator-workers", "handoffs", "evaluator-optimizer", "autonomous-workflows", "multi-agent-cost"),
    lab("m08"),
    ...t("m09", "langgraph", "vendor-sdks", "state-checkpoints", "framework-guardrails", "vendor-platforms", "build-extend-buy", "selection-criteria"),
    lab("m09"),
    task("m09", "Platform map"),
    task("m09", "Extend the memo"),
    project("Research and reporting pipeline"),
  ],
  // 8. Agentic coding tools, used professionally
  [
    ...t("m01", "course-environment"),
    task("m01", "AI-assistance log"),
    ...t("m10", "coding-agents", "spec-driven", "context-files", "reviewing-ai-code", "tests-as-contract", "prs-ci"),
    lab("m10"),
    ...t("m13", "peer-review"),
    req("AI-assistance log"),
    project("Code maintenance agent"),
  ],
  // 9. Evaluation with evidence
  [
    ...t("m02", "prompt-versioning"),
    task("m02", "20-example test set"),
    task("m03", "Log every step"),
    ...t("m04", "observability"),
    task("m04", "Compare task success rates"),
    task("m05", "Measure answer accuracy"),
    task("m08", "single-agent baseline"),
    ...t("m09", "framework-guardrails"),
    ...t("m11", "what-to-measure", "eval-sets", "graders", "trajectory-eval", "escalation-testing", "regression-ci", "benchmarks"),
    lab("m11"),
    ...t("m13", "demo-design"),
    req("An evaluation harness"),
  ],
  // 10. Security, safety, least privilege, human in the loop
  [
    ...t("m01", "course-environment"),
    task("m01", "Configure API credentials"),
    ...t("m04", "budgets"),
    ...t("m05", "memory"),
    ...t("m06", "mcp-auth"),
    ...t("m07", "read-vs-write", "service-identity", "audit-logs"),
    task("m07", "human confirmation"),
    ...t("m10", "reviewing-ai-code"),
    ...t("m12", "prompt-injection", "least-privilege", "supply-chain", "privacy", "fairness", "risk-frameworks"),
    lab("m12"),
    req("A security review"),
    req("A responsible-use statement"),
  ],
  // 11. Deliver as a team
  [
    checkpoint("m07"),
    ...t("m13", "scoping", "demo-design", "reports", "peer-review"),
    checkpoint("m13"),
    req("A responsible-use statement"),
    req("A 10-minute demo"),
    req("instructor-visible repository"),
  ],
];

/** A reference resolved into something the page can render and link to. */
export interface ResolvedRef {
  /** Grouping key and heading, e.g. "Module 3 · Tool calling and the agent loop". */
  group: string;
  /** Week label for module groups, e.g. "Week 3". */
  when?: string;
  kind: "Topic" | "Lab" | "Lab task" | "Checkpoint" | "Project requirement" | "Example project";
  text: string;
  href: string;
}

const lc = (s: string) => s.toLowerCase();
const taskText = (x: string | { text: string }) => (typeof x === "string" ? x : x.text);

function moduleGroup(mod: ModuleDef): Pick<ResolvedRef, "group" | "when"> {
  return { group: `Module ${mod.number} · ${mod.title}`, when: `Week ${mod.weeks}` };
}

/** Resolves one reference, or returns null when it no longer matches anything. */
export function resolveRef(r: OutcomeRef): ResolvedRef | null {
  if ("requirement" in r) {
    const i = PROJECT_REQUIREMENTS.findIndex((x) => lc(x).includes(lc(r.requirement)));
    if (i < 0) return null;
    return { group: "Final project", kind: "Project requirement", text: PROJECT_REQUIREMENTS[i], href: `#/projects?s=req-${i + 1}` };
  }
  if ("project" in r) {
    const p = PROJECTS.find((x) => x.title === r.project);
    if (!p) return null;
    return { group: "Final project", kind: "Example project", text: p.title, href: `#/projects?s=${projectSlug(p.title)}` };
  }
  const mod = MODULE_BY_ID[r.m];
  if (!mod) return null;
  const g = moduleGroup(mod);
  if ("topic" in r) {
    const topic = mod.topics.find((x) => x.id === r.topic);
    if (!topic) return null;
    // Straight to the lecture notes when they exist, otherwise to the bullet on the module page.
    const href = notesHref(mod.id, topic.id) ?? `#/m/${mod.id}?s=topic-${topic.id}`;
    return { ...g, kind: "Topic", text: topic.text, href };
  }
  if ("lab" in r) {
    if (!mod.lab) return null;
    return { ...g, kind: "Lab", text: mod.lab.title, href: `#/m/${mod.id}?s=lab` };
  }
  if ("task" in r) {
    const tasks = mod.lab?.tasks ?? [];
    const i = tasks.findIndex((x) => lc(taskText(x)).includes(lc(r.task)));
    if (i < 0) return null;
    return { ...g, kind: "Lab task", text: taskText(tasks[i]), href: `#/m/${mod.id}?s=lab-task-${i + 1}` };
  }
  if (!mod.checkpoint) return null;
  return { ...g, kind: "Checkpoint", text: mod.checkpoint, href: `#/m/${mod.id}?s=checkpoint` };
}

/** Every outcome's references, resolved and grouped in course order. */
export const OUTCOME_MAP: { group: string; when?: string; refs: ResolvedRef[] }[][] = OUTCOME_REFS.map((refs) => {
  const groups: { group: string; when?: string; refs: ResolvedRef[] }[] = [];
  for (const r of refs) {
    const x = resolveRef(r);
    if (!x) continue;
    let g = groups.find((y) => y.group === x.group);
    if (!g) groups.push((g = { group: x.group, when: x.when, refs: [] }));
    if (!g.refs.some((y) => y.href === x.href)) g.refs.push(x);
  }
  return groups;
});

/** Module numbers an outcome touches, for the collapsed summary. */
export function outcomeModules(i: number): number[] {
  const nums = new Set<number>();
  for (const r of OUTCOME_REFS[i] ?? []) if ("m" in r && MODULE_BY_ID[r.m]) nums.add(MODULE_BY_ID[r.m].number);
  return [...nums].sort((a, b) => a - b);
}

/** Map integrity: references that no longer match, and outcomes left unmapped. */
export function outcomeMapProblems(): string[] {
  const problems: string[] = [];
  if (OUTCOME_REFS.length !== COURSE.outcomes.length)
    problems.push(`Outcome map has ${OUTCOME_REFS.length} entries but the course has ${COURSE.outcomes.length} outcomes`);
  OUTCOME_REFS.forEach((refs, i) => {
    if (refs.length === 0) problems.push(`Outcome ${i + 1} has no references`);
    refs.forEach((r) => {
      if (!resolveRef(r)) problems.push(`Outcome ${i + 1}: reference does not match anything: ${JSON.stringify(r)}`);
    });
  });
  return problems;
}
