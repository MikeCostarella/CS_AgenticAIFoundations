// The curriculum map: for each course outcome (same order as COURSE.outcomes),
// where in the course it is taught, practiced, and assessed.
//
// References name the place by a short piece of its own text rather than by
// position, so reordering topics or lab tasks does not silently re-point a
// reference. resolveOutcomeRefs() turns them into links; any reference that no
// longer matches is reported by outcomeMapProblems() (shown in dev builds).

import { COURSE } from "./course";
import { MODULE_BY_ID } from "./modules";
import { PROJECT_REQUIREMENTS, PROJECTS, projectSlug } from "./projects";
import type { ModuleDef } from "./types";

export type OutcomeRef =
  /** A lecture topic on a module page, matched by a phrase it contains. */
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
    ...t("m01", "What an LLM is", "Tokens, context windows", "Sampling:", "Chat APIs", "Cost and latency budgets", "Failure modes"),
    lab("m01"),
    task("m01", "Run the same prompt 10 times"),
    ...t("m04", "Step, token, and dollar budgets"),
  ],
  // 2. The decision ladder: code, workflow, single call, or agent
  [
    ...t("m01", "Automation vs. AI vs. agentic AI"),
    ...t("m02", "The second rung of the ladder"),
    ...t("m03", "Workflows vs. agents", "Climbing the ladder on purpose"),
    task("m03", "Pick one of your three tasks"),
    ...t("m08", "Cost/latency trade-offs"),
    task("m08", "single-agent baseline"),
    ...t("m13", "Scoping a project"),
    req("justification that the problem needs an agent"),
  ],
  // 3. Model APIs and structured output
  [
    ...t("m01", "Chat APIs"),
    task("m01", "Write a small CLI"),
    ...t("m02", "Structured output modes", "Validation libraries", "Prompt design as an interface contract", "Few-shot examples", "Versioning prompts"),
    lab("m02"),
    ...t("m03", "Tool definitions"),
  ],
  // 4. The agent loop
  [
    ...t("m03", "Tool definitions", "The agent loop:", "Parallel tool calls", "Stopping conditions", "The ReAct pattern"),
    lab("m03"),
    ...t("m04", "Tool error handling", "Retries, backoff", "Step, token, and dollar budgets", "Tool design:"),
    lab("m04"),
  ],
  // 5. Retrieval and memory
  [
    ...t("m05", "Embeddings and similarity", "Chunking strategies", "Vector stores", "Classic RAG vs.", "Citations and grounding", "Short-term vs. long-term memory"),
    lab("m05"),
    checkpoint("m07"),
    ...t("m12", "Privacy: PII"),
  ],
  // 6. MCP and enterprise integration, reconciliation, escalation
  [
    ...t("m06", "MCP architecture", "Tools, resources, and prompts", "Transports:", "Authentication and authorization", "Testing a server"),
    lab("m06"),
    ...t("m07", "REST and GraphQL", "Read-only vs. write tools", "Service accounts", "Audit logs", "Rate limits", "Reconciling records", "Escalation rules"),
    lab("m07"),
    task("m07", "Optional midterm extension"),
    checkpoint("m07"),
    ...t("m11", "Testing escalation"),
    req("at least one real integration"),
    project("Cross-system reconciliation agent"),
  ],
  // 7. Multi-agent orchestration, frameworks, build / extend / buy
  [
    ...t("m08", "Prompt chaining", "Orchestrator–workers", "Handoffs and shared state", "Evaluator–optimizer", "Autonomous workflows", "Cost/latency trade-offs"),
    lab("m08"),
    ...t("m09", "Graph-based orchestration", "Vendor agent SDKs", "State, checkpoints", "Guardrails and tracing", "Vendor agent platforms", "Build vs. extend vs. buy", "Selection criteria"),
    lab("m09"),
    task("m09", "Platform map"),
    task("m09", "Extend the memo"),
    project("Research and reporting pipeline"),
  ],
  // 8. Agentic coding tools, used professionally
  [
    ...t("m01", "Course environment"),
    task("m01", "AI-assistance log"),
    ...t("m10", "Coding agents vs. autocomplete", "Spec-driven development", "Project instructions", "Reviewing AI-generated code", "Tests as the contract", "Pull requests, CI"),
    lab("m10"),
    ...t("m13", "Peer review"),
    req("AI-assistance log"),
    project("Code maintenance agent"),
  ],
  // 9. Evaluation with evidence
  [
    ...t("m02", "Versioning prompts"),
    task("m02", "20-example test set"),
    task("m03", "Log every step"),
    ...t("m04", "Observability basics"),
    task("m04", "Compare task success rates"),
    task("m05", "Measure answer accuracy"),
    task("m08", "single-agent baseline"),
    ...t("m09", "Guardrails and tracing"),
    ...t("m11", "What to measure", "Building eval sets", "Code-based graders", "Trajectory evaluation", "Testing escalation", "Regression testing in CI", "Benchmarks and their limits"),
    lab("m11"),
    ...t("m13", "Demo design"),
    req("An evaluation harness"),
  ],
  // 10. Security, safety, least privilege, human in the loop
  [
    ...t("m01", "Course environment"),
    task("m01", "Configure API credentials"),
    ...t("m04", "Step, token, and dollar budgets"),
    ...t("m05", "Short-term vs. long-term memory"),
    ...t("m06", "Authentication and authorization"),
    ...t("m07", "Read-only vs. write tools", "Service accounts", "Audit logs"),
    task("m07", "human confirmation"),
    ...t("m10", "Reviewing AI-generated code"),
    ...t("m12", "Direct and indirect prompt injection", "Least privilege", "Secrets handling", "Privacy: PII", "Bias, fairness", "Risk frameworks"),
    lab("m12"),
    req("A security review"),
    req("A responsible-use statement"),
  ],
  // 11. Deliver as a team
  [
    checkpoint("m07"),
    ...t("m13", "Scoping a project", "Demo design", "Technical reports", "Peer review"),
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
    const i = mod.topics.findIndex((x) => lc(x).includes(lc(r.topic)));
    if (i < 0) return null;
    return { ...g, kind: "Topic", text: mod.topics[i], href: `#/m/${mod.id}?s=topic-${i + 1}` };
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
