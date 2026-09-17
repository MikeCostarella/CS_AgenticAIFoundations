import type { Link } from "./types";

// Readings and references. Modules cite these by id.

export interface Resource extends Link {
  id: string;
  group: "Papers" | "Guides" | "Documentation" | "Frameworks and tools" | "Risk and responsible use";
}

export const RESOURCES: Resource[] = [
  // Papers
  { id: "react", group: "Papers", label: "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)", url: "https://arxiv.org/abs/2210.03629", note: "The reason → act → observe loop that underlies most agents." },
  { id: "toolformer", group: "Papers", label: "Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al., 2023)", url: "https://arxiv.org/abs/2302.04761", note: "Early evidence that models can learn when and how to call tools." },
  { id: "rag", group: "Papers", label: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)", url: "https://arxiv.org/abs/2005.11401", note: "The paper that named RAG." },
  { id: "cot", group: "Papers", label: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022)", url: "https://arxiv.org/abs/2201.11903", note: "Why intermediate reasoning steps change outcomes." },
  { id: "reflexion", group: "Papers", label: "Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)", url: "https://arxiv.org/abs/2303.11366", note: "Self-critique and revision loops." },
  { id: "generative-agents", group: "Papers", label: "Generative Agents: Interactive Simulacra of Human Behavior (Park et al., 2023)", url: "https://arxiv.org/abs/2304.03442", note: "Memory, reflection, and planning in multi-agent simulation." },
  { id: "llm-judge", group: "Papers", label: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., 2023)", url: "https://arxiv.org/abs/2306.05685", note: "Strengths and biases of model-graded evaluation." },
  { id: "swe-bench", group: "Papers", label: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues? (Jimenez et al., 2023)", url: "https://arxiv.org/abs/2310.06770", note: "The benchmark behind most coding-agent claims." },
  { id: "indirect-injection", group: "Papers", label: "Not What You've Signed Up For: Indirect Prompt Injection (Greshake et al., 2023)", url: "https://arxiv.org/abs/2302.12173", note: "How retrieved content can hijack an agent." },

  // Guides
  { id: "building-effective-agents", group: "Guides", label: "Building Effective Agents (Anthropic)", url: "https://www.anthropic.com/engineering/building-effective-agents", note: "Workflows vs. agents and the core orchestration patterns." },

  // Documentation
  { id: "anthropic-api", group: "Documentation", label: "Claude Developer Platform documentation", url: "https://docs.claude.com", note: "Messages API, structured output, prompt caching." },
  { id: "anthropic-tools", group: "Documentation", label: "Claude tool use overview", url: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview", note: "Tool definitions and the tool-use loop." },
  { id: "openai-api", group: "Documentation", label: "OpenAI API documentation", url: "https://platform.openai.com/docs", note: "Responses API, structured outputs." },
  { id: "openai-functions", group: "Documentation", label: "OpenAI function calling guide", url: "https://platform.openai.com/docs/guides/function-calling", note: "The same loop from a second vendor." },
  { id: "mcp", group: "Documentation", label: "Model Context Protocol", url: "https://modelcontextprotocol.io", note: "Specification, concepts, and SDKs." },
  { id: "mcp-servers", group: "Documentation", label: "MCP reference servers", url: "https://github.com/modelcontextprotocol/servers", note: "Example servers to read and extend." },
  { id: "pydantic", group: "Documentation", label: "Pydantic", url: "https://docs.pydantic.dev", note: "Schema validation for Python." },

  // Frameworks and tools
  { id: "langgraph", group: "Frameworks and tools", label: "LangGraph", url: "https://github.com/langchain-ai/langgraph", note: "Graph-based agent orchestration." },
  { id: "openai-agents-sdk", group: "Frameworks and tools", label: "OpenAI Agents SDK (Python)", url: "https://github.com/openai/openai-agents-python", note: "Agents, handoffs, guardrails, tracing." },
  { id: "claude-agent-sdk", group: "Frameworks and tools", label: "Claude Agent SDK (Python)", url: "https://github.com/anthropics/claude-agent-sdk-python", note: "The agent harness behind Claude Code, as a library." },
  { id: "claude-code", group: "Frameworks and tools", label: "Claude Code", url: "https://github.com/anthropics/claude-code", note: "Terminal-based agentic coding tool." },
  { id: "copilot", group: "Frameworks and tools", label: "GitHub Copilot documentation", url: "https://docs.github.com/en/copilot", note: "IDE and agent-mode coding assistance." },
  { id: "github-education", group: "Frameworks and tools", label: "GitHub Education (Student Developer Pack)", url: "https://education.github.com/pack", note: "Student benefits, including Copilot access for verified students." },
  { id: "pgvector", group: "Frameworks and tools", label: "pgvector", url: "https://github.com/pgvector/pgvector", note: "Vector search inside PostgreSQL." },
  { id: "chroma", group: "Frameworks and tools", label: "Chroma", url: "https://www.trychroma.com", note: "Lightweight open-source vector database." },

  // Risk
  { id: "owasp-llm", group: "Risk and responsible use", label: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/", note: "The standard checklist of LLM application risks." },
  { id: "nist-rmf", group: "Risk and responsible use", label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", note: "Govern, map, measure, manage." },
];

export const RESOURCE_BY_ID: Record<string, Resource> = Object.fromEntries(
  RESOURCES.map((r) => [r.id, r]),
);

export const RESOURCE_GROUPS = [
  "Papers",
  "Guides",
  "Documentation",
  "Frameworks and tools",
  "Risk and responsible use",
] as const;
