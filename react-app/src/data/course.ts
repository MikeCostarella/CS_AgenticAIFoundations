// Course-level metadata: thesis, outcomes, format, grading.
// Rendered on the home page and the syllabus page.

export const COURSE = {
  repo: "CS_AgenticAIFoundations",
  heading: "Agentic AI and Intelligent Systems",
  siteTitle: "Agentic AI Foundations",
  tagline:
    "Upper-level undergraduate / graduate · 3 s.h. · Agents, tool calling, orchestration, AI-assisted coding, evaluation, responsible use",
  audience: "Course design · CS and IT juniors, seniors, and graduate students",
  status:
    "Draft course design for discussion. Not an official catalog listing — titles, numbering, schedule, and weights are proposals.",
  prerequisites:
    "Data Structures, plus a Python or web programming course. An introductory AI/ML course is recommended but not required.",
  levels: "Cross-listed at the 4xxx (undergraduate) and 6xxx (graduate) level",
  schedule: "15 weeks · roughly half lecture, half lab · team final project",
  author: "Mike Costarella",
  contactEmail: "Mike.Costarella@gmail.com",
  thesis:
    "Employers now expect new CS and IT graduates to build with AI, not just use a chatbot. This course goes beyond prompt engineering to the engineering of agentic systems: models that call tools, retrieve knowledge, coordinate with other agents, and act inside real software and enterprise systems. The stance is AI-assisted, not AI-dependent — students still have to explain, test, debug, evaluate, and secure everything they ship. The strong programming and problem-solving foundations of the CS and IT programs are the prerequisite, and the course is designed to reinforce them rather than route around them.",
  outcomes: [
    "Explain how large language models behave as software components — tokens, context windows, sampling, cost, latency, and failure modes — and design around those constraints.",
    "Call model APIs from code and enforce structured, schema-validated output.",
    "Implement the agent loop (reason → act → observe) with tool calling, including error handling, retries, and step and cost budgets.",
    "Build retrieval-augmented agents with embeddings and vector search, and choose appropriate short-term and long-term memory strategies.",
    "Expose data and services to agents through the Model Context Protocol (MCP) and integrate agents with APIs, databases, and enterprise systems.",
    "Design multi-agent workflows using orchestration patterns (planner/worker, supervisor, handoff, parallel fan-out) and compare frameworks against hand-rolled implementations.",
    "Use agentic coding tools professionally: spec-driven development, reviewing and testing AI-generated code, and documenting AI assistance honestly.",
    "Evaluate agents with test sets, LLM-as-judge rubrics, regression suites, and tracing — and report results with evidence rather than anecdotes.",
    "Identify and mitigate agent security and safety risks — prompt injection, over-broad permissions, data leakage, runaway cost — using human-in-the-loop and least-privilege design.",
    "Deliver a working, evaluated, documented agentic system as a team, and communicate its design, limits, and responsible-use considerations.",
  ],
  format:
    "Thirteen modules in five units across a 15-week semester. Each module pairs lecture content with a hands-on lab, and the labs build on one another: the single agent from Unit II gains retrieval, then an MCP integration, then collaborators, then an evaluation harness and a security review. Week 8 is a midterm project checkpoint; weeks 14–15 are final team projects with demos. Graduate students complete the same labs plus a paper review and a research component in the final project.",
  grading: [
    { component: "Labs and assignments", weight: "35%" },
    { component: "Midterm project (week 8)", weight: "15%" },
    { component: "Final team project, demo, and report", weight: "30%" },
    { component: "Evaluation and red-team exercises", weight: "10%" },
    { component: "Participation and reflections", weight: "10%" },
  ],
  gradGrading:
    "Graduate section: the paper review replaces half of the participation weight, and the final project must include a research component (a benchmark comparison, a new evaluation method, or a reproducibility study).",
  integrity:
    "AI tools are required in this course, so the integrity policy is about disclosure, not prohibition. Every lab submission includes an AI-assistance log: which tools were used, for what, and what the student verified or changed. Students must be able to explain any code they submit; oral walkthroughs may be requested at any time.",
} as const;
