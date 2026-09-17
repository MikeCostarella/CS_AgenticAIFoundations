import type { UnitDef } from "./types";

// The five units and thirteen modules. Edit here; every page updates.

export const UNIT_DEFS: UnitDef[] = [
  // ------------------------------------------------------------------ Unit I
  {
    number: 1,
    title: "LLMs as Software Components",
    theme:
      "Treat the model as an unreliable but powerful dependency: understand how it behaves, what it costs, and how to get structured, validated output out of it from code.",
    modules: [
      {
        id: "m01",
        number: 1,
        unit: 1,
        weeks: "1",
        title: "LLM foundations for engineers",
        subtitle: "Tokens, context windows, sampling, cost, latency, and failure modes",
        overview: [
          "Agentic systems are built on large language models, so the course starts by treating a model the way an engineer treats any dependency: what goes in, what comes out, what it costs, how fast it is, and how it fails. The goal is not the mathematics of transformers but a working mental model accurate enough to make design decisions.",
          "Students set up their API access, development environment, and course repository, and make their first programmatic model calls. From day one, every call is logged with its token counts, latency, and cost so that the economics of agents are visible rather than abstract.",
        ],
        topics: [
          "What an LLM is (and is not) from a software engineer's point of view",
          "Tokens, context windows, and why long inputs cost more and degrade",
          "Sampling: temperature, top-p, determinism, and reproducibility",
          "Chat APIs: system prompts, message roles, multi-turn state",
          "Cost and latency budgets; model tiers and choosing the smallest model that works",
          "Failure modes: hallucination, instruction drift, refusals, truncation",
          "Course environment: API keys and secrets handling, repo template, AI-assistance log",
        ],
        resources: ["anthropic-api", "openai-api", "cot"],
        lab: {
          title: "Lab 1 — First calls, measured",
          tasks: [
            "Configure API credentials safely (environment variables, never committed).",
            "Write a small CLI that sends a prompt to a model and prints the response, token usage, latency, and estimated cost.",
            "Run the same prompt 10 times at two temperatures and summarize how the outputs vary.",
            "Start your AI-assistance log in the course repository.",
          ],
          deliverable: "Repository link with the CLI, a short results table, and the first log entry.",
        },
      },
      {
        id: "m02",
        number: 2,
        unit: 1,
        weeks: "2",
        title: "Structured output and prompt contracts",
        subtitle: "JSON schemas, validation, and prompts treated as versioned code",
        overview: [
          "Agents only work when their output can be consumed by other code. This module makes structured output the default: define a schema, ask the model to satisfy it, validate the result, and handle the cases where it does not.",
          "Prompts are treated as code — versioned, reviewed, and tested — rather than as magic incantations. Students build a small extraction tool and a test set that catches regressions when the prompt or model changes.",
        ],
        topics: [
          "Structured output modes and JSON Schema",
          "Validation libraries (Pydantic, Zod) and repair/retry strategies",
          "Prompt design as an interface contract: role, task, constraints, examples, output format",
          "Few-shot examples and when they help",
          "Versioning prompts alongside code; prompt regression tests",
        ],
        resources: ["anthropic-api", "openai-api", "pydantic"],
        lab: {
          title: "Lab 2 — Schema-validated extraction",
          tasks: [
            "Build a CLI that extracts structured records (e.g., events, contacts, or invoice fields) from unstructured text into a JSON schema.",
            "Validate every response; on failure, retry with the validation error included, up to a limit.",
            "Create a 20-example test set and report the pass rate before and after one prompt revision.",
          ],
          deliverable: "Code, schema, test set, and a one-page note on what changed the pass rate.",
        },
      },
    ],
  },

  // ----------------------------------------------------------------- Unit II
  {
    number: 2,
    title: "Agents, Tools, and Knowledge",
    theme:
      "Give the model the ability to act: tool calling, the agent loop, robustness engineering, and grounding answers in real documents with retrieval and memory.",
    modules: [
      {
        id: "m03",
        number: 3,
        unit: 2,
        weeks: "3",
        title: "Tool calling and the agent loop",
        subtitle: "Function schemas, reason → act → observe, and when to stop",
        overview: [
          "An agent is a model in a loop that can call tools. The model decides which tool to call with which arguments, the program executes it, the result goes back to the model, and the loop continues until the task is done or a limit is reached.",
          "Students implement this loop by hand before touching any framework, so that later abstractions are understood rather than trusted blindly.",
        ],
        topics: [
          "Workflows vs. agents: when a fixed pipeline is better than autonomy",
          "Tool definitions: names, descriptions, and JSON parameter schemas",
          "The agent loop: reason, act, observe, repeat",
          "Parallel tool calls and tool results as context",
          "Stopping conditions: task completion, step limits, cost limits",
          "The ReAct pattern",
        ],
        resources: ["building-effective-agents", "anthropic-tools", "openai-functions", "react"],
        lab: {
          title: "Lab 3 — A hand-rolled agent",
          tasks: [
            "Implement an agent loop without a framework.",
            "Give it three or four real tools, e.g. web search, a SQL query tool over a provided database, a calculator, and file read/write.",
            "Log every step (tool chosen, arguments, result, tokens) to a trace file.",
            "Demonstrate one task that requires at least three tool calls to answer.",
          ],
          deliverable: "Code, trace files for three tasks, and a short write-up of one failure you observed.",
        },
      },
      {
        id: "m04",
        number: 4,
        unit: 2,
        weeks: "4",
        title: "Robust agents",
        subtitle: "Errors, retries, timeouts, budgets, and designing tools agents can use",
        overview: [
          "Real tools fail: APIs time out, queries return nothing, arguments are malformed. This module is about making agents that degrade gracefully — and about designing tools whose names, descriptions, and error messages help the model recover.",
        ],
        topics: [
          "Tool error handling: returning actionable errors to the model",
          "Retries, backoff, timeouts, and idempotency",
          "Step, token, and dollar budgets; graceful termination",
          "Tool design: narrow tools vs. general tools; argument validation",
          "Observability basics: structured logs and traces",
        ],
        resources: ["building-effective-agents", "anthropic-tools"],
        lab: {
          title: "Lab 4 — Break it, then harden it",
          tasks: [
            "Inject faults into your Lab 3 tools (timeouts, bad data, empty results).",
            "Add retries, budgets, and improved error messages.",
            "Compare task success rates before and after on a fixed task list.",
          ],
          deliverable: "Before/after success table and the hardened code.",
        },
      },
      {
        id: "m05",
        number: 5,
        unit: 2,
        weeks: "5",
        title: "Retrieval and memory",
        subtitle: "Embeddings, vector search, RAG, and what an agent should remember",
        overview: [
          "Models don't know your organization's documents. Retrieval-augmented generation (RAG) finds relevant passages and puts them in context, and agentic retrieval lets the model decide when and what to search.",
          "Memory extends the same idea across time: conversation summaries, stored facts, and user preferences, with deliberate choices about what to keep and what to forget.",
        ],
        topics: [
          "Embeddings and similarity search",
          "Chunking strategies and metadata",
          "Vector stores (pgvector, Chroma, and hosted options)",
          "Classic RAG vs. retrieval as a tool",
          "Citations and grounding; detecting unsupported claims",
          "Short-term vs. long-term memory; privacy implications of memory",
        ],
        resources: ["rag", "pgvector", "chroma"],
        lab: {
          title: "Lab 5 — Document Q&A agent",
          tasks: [
            "Index a provided document collection (e.g., a policy handbook or public-records set).",
            "Add a search tool to your agent and require citations in answers.",
            "Measure answer accuracy and citation correctness on a 15-question set.",
          ],
          deliverable: "Code, index build script, and the evaluation results.",
        },
      },
    ],
  },

  // ---------------------------------------------------------------- Unit III
  {
    number: 3,
    title: "Integration",
    theme:
      "Connect agents to the systems where work actually happens, using the Model Context Protocol and conventional APIs, databases, and enterprise services.",
    modules: [
      {
        id: "m06",
        number: 6,
        unit: 3,
        weeks: "6",
        title: "The Model Context Protocol (MCP)",
        subtitle: "Exposing tools, resources, and prompts to any agent",
        overview: [
          "MCP is an open protocol for connecting AI applications to tools and data. Instead of writing a custom integration for each agent, you build an MCP server once and any compatible client — desktop assistants, IDEs, coding agents, or your own agent — can use it.",
        ],
        topics: [
          "MCP architecture: hosts, clients, servers",
          "Tools, resources, and prompts",
          "Transports: local (stdio) and remote (HTTP)",
          "Authentication and authorization for remote servers",
          "Testing a server with an inspector and with real clients",
        ],
        resources: ["mcp", "mcp-servers"],
        lab: {
          title: "Lab 6 — Build an MCP server",
          tasks: [
            "Build an MCP server that exposes a dataset or service (e.g., a course database, a public data API) as tools and resources.",
            "Connect it to at least two different MCP clients, one of which is your own agent.",
          ],
          deliverable: "Server code, setup instructions, and screenshots or traces from both clients.",
        },
      },
      {
        id: "m07",
        number: 7,
        unit: 3,
        weeks: "7–8",
        title: "Agents in enterprise systems",
        subtitle: "APIs, databases, identity, and the midterm checkpoint",
        overview: [
          "Enterprise agents operate inside ticketing systems, databases, document stores, and identity systems. This module covers the practical concerns — authentication, permissions, rate limits, auditing — and closes with the midterm project checkpoint in week 8.",
        ],
        topics: [
          "REST and GraphQL APIs as agent tools; OpenAPI-to-tool generation",
          "Read-only vs. write tools; confirmation steps for consequential actions",
          "Service accounts, OAuth, and least privilege",
          "Audit logs and traceability",
          "Rate limits, pagination, and large results",
        ],
        resources: ["owasp-llm", "mcp"],
        lab: {
          title: "Lab 7 — Integrate a system of record",
          tasks: [
            "Connect your agent to a realistic system (a provided ticketing API, database, or document store) with separate read and write tools.",
            "Require human confirmation before any write.",
          ],
          deliverable: "Folded into the midterm project.",
        },
        checkpoint:
          "Midterm project (week 8): a single agent with tools, retrieval, and at least one MCP or enterprise integration, with a trace-backed demo and a short design document.",
      },
    ],
  },

  // ----------------------------------------------------------------- Unit IV
  {
    number: 4,
    title: "Orchestration and Engineering Practice",
    theme:
      "Scale from one agent to coordinated systems, compare frameworks, and use agentic coding tools the way professional engineering teams do.",
    modules: [
      {
        id: "m08",
        number: 8,
        unit: 4,
        weeks: "9",
        title: "Multi-agent orchestration patterns",
        subtitle: "Planner/worker, supervisor, handoffs, and parallel fan-out",
        overview: [
          "Some tasks are better split across specialized agents or parallel workers. Multiple agents also add cost, latency, and new failure modes, so this module is as much about when not to use them as how.",
        ],
        topics: [
          "Prompt chaining, routing, parallelization",
          "Orchestrator–workers and supervisor patterns",
          "Handoffs and shared state",
          "Evaluator–optimizer loops (generate, critique, revise)",
          "Autonomous workflows: scheduled and event-driven agents",
          "Cost/latency trade-offs of multi-agent designs",
        ],
        resources: ["building-effective-agents", "reflexion", "generative-agents"],
        lab: {
          title: "Lab 8 — Research → draft → review pipeline",
          tasks: [
            "Build a pipeline with at least three roles (e.g., researcher, writer, reviewer) and a clear handoff format.",
            "Run workers in parallel where possible.",
            "Compare quality, cost, and time against a single-agent baseline.",
          ],
          deliverable: "Code, traces, and the comparison table.",
        },
      },
      {
        id: "m09",
        number: 9,
        unit: 4,
        weeks: "10",
        title: "Agent frameworks and SDKs",
        subtitle: "What frameworks give you, what they hide, and how to choose",
        overview: [
          "Having built agents by hand, students now port one to a framework and judge the trade-offs: less boilerplate and built-in features versus abstraction, lock-in, and debugging difficulty.",
        ],
        topics: [
          "Graph-based orchestration (LangGraph)",
          "Vendor agent SDKs (OpenAI Agents SDK, Claude Agent SDK)",
          "State, checkpoints, and resumability",
          "Guardrails and tracing built into frameworks",
          "Selection criteria: team skills, hosting, observability, portability",
        ],
        resources: ["langgraph", "openai-agents-sdk", "claude-agent-sdk"],
        lab: {
          title: "Lab 9 — Port and compare",
          tasks: [
            "Re-implement your Lab 8 pipeline in one framework or SDK.",
            "Write a one-page comparison: lines of code, debuggability, features gained, and anything lost.",
          ],
          deliverable: "Framework version plus the comparison memo.",
        },
      },
      {
        id: "m10",
        number: 10,
        unit: 4,
        weeks: "11",
        title: "AI-assisted software engineering",
        subtitle: "Agentic coding tools with professional discipline",
        overview: [
          "Coding agents such as Claude Code, GitHub Copilot, and Cursor can read a codebase, plan changes, edit files, and run tests. Used carelessly they produce code no one understands; used well they speed up a disciplined engineering process.",
          "This module teaches the disciplined version: write the spec first, keep changes small, review everything, insist on tests, and be able to explain every line.",
        ],
        topics: [
          "Coding agents vs. autocomplete; agent modes in IDEs and terminals",
          "Spec-driven development: requirements, plans, and acceptance criteria before code",
          "Project instructions and context files for coding agents",
          "Reviewing AI-generated code: correctness, security, maintainability",
          "Tests as the contract; test-first prompting",
          "Pull requests, CI, and documenting AI assistance",
        ],
        resources: ["claude-code", "copilot", "swe-bench"],
        lab: {
          title: "Lab 10 — Spec to pull request",
          tasks: [
            "Given an existing open-source-style repository, write a spec for a small feature.",
            "Implement it with an agentic coding tool, keeping a log of prompts and decisions.",
            "Add tests, pass CI, and open a pull request with a review checklist.",
            "Write a reflection: what the tool did well, what you had to fix, and what you verified.",
          ],
          deliverable: "Pull request link, test results, prompt log, and reflection.",
        },
      },
    ],
  },

  // ------------------------------------------------------------------ Unit V
  {
    number: 5,
    title: "Trustworthy Agents",
    theme:
      "Prove the system works, attack it before someone else does, and ship it responsibly as a team.",
    modules: [
      {
        id: "m11",
        number: 11,
        unit: 5,
        weeks: "12",
        title: "Evaluating agents",
        subtitle: "Test sets, LLM-as-judge, regression suites, and tracing",
        overview: [
          "Anecdotes are not evidence. This module builds the habit of measuring agent quality: curated task sets, automated checks, model-graded rubrics with known limitations, and regression tests that run whenever a prompt, tool, or model changes.",
        ],
        topics: [
          "What to measure: task success, groundedness, tool-use correctness, cost, latency",
          "Building eval sets from real tasks and failures",
          "Code-based graders vs. LLM-as-judge; judge bias and calibration",
          "Trajectory evaluation: judging the path, not just the answer",
          "Regression testing in CI; tracing and observability tools",
          "Benchmarks and their limits",
        ],
        resources: ["llm-judge", "swe-bench", "building-effective-agents"],
        lab: {
          title: "Lab 11 — An eval harness for your agent",
          tasks: [
            "Build a 30+ case eval set for your project agent, including known past failures.",
            "Implement automated graders (at least one code-based, one model-based).",
            "Make one improvement and report before/after metrics.",
          ],
          deliverable: "Harness code, eval set, and results report.",
        },
        gradNote:
          "Graduate students validate their LLM judge against human labels on a sample and report agreement.",
      },
      {
        id: "m12",
        number: 12,
        unit: 5,
        weeks: "13",
        title: "Security, safety, and responsible use",
        subtitle: "Prompt injection, permissions, privacy, and human oversight",
        overview: [
          "An agent that can act can be manipulated into acting wrongly. This module covers the threat model for agentic systems and the controls that reduce risk, followed by a structured red-team exercise against another team's agent.",
          "Responsible use also covers people and institutions: privacy (including FERPA and PII), bias, transparency with users, accessibility, and knowing when a task should not be automated at all.",
        ],
        topics: [
          "Direct and indirect prompt injection; data exfiltration through tools",
          "Least privilege, sandboxing, allow-lists, and confirmation gates",
          "Secrets handling and supply-chain risk in tools and MCP servers",
          "Privacy: PII, FERPA, data retention, and memory",
          "Bias, fairness, transparency, and accountability",
          "Risk frameworks: OWASP Top 10 for LLM Applications, NIST AI RMF",
        ],
        resources: ["owasp-llm", "nist-rmf", "indirect-injection"],
        lab: {
          title: "Lab 12 — Red team",
          tasks: [
            "Receive another team's agent and threat-model it.",
            "Attempt at least five attack categories (e.g., indirect injection via documents, tool misuse, data leakage, budget exhaustion).",
            "Report findings responsibly with severity and suggested mitigations; fix the findings reported against your own agent.",
          ],
          deliverable: "Red-team report and your team's remediation notes.",
        },
      },
      {
        id: "m13",
        number: 13,
        unit: 5,
        weeks: "14–15",
        title: "Final projects",
        subtitle: "Build, evaluate, demo, and document a team agentic system",
        overview: [
          "Teams deliver a working agentic system that solves a realistic problem. Every project must include tool use, an evaluation harness with reported results, a security review, and a responsible-use statement. Weeks 14 and 15 are build sprints, demos, and peer review.",
        ],
        topics: [
          "Scoping a project to what can be evaluated",
          "Demo design: showing traces, metrics, and failure handling",
          "Technical reports and responsible-use statements",
          "Peer review of design and code",
        ],
        resources: [],
        lab: null,
        checkpoint:
          "Final team project: working system, repository, evaluation results, security review, 10-minute demo, and written report. See the Projects page for example project ideas.",
        gradNote:
          "Graduate teams add a research component: a benchmark comparison, a new evaluation method, or a reproducibility study, written up in paper format.",
      },
    ],
  },
];
