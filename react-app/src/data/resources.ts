import type { Link } from "./types";

// Readings and references. Modules cite these by id.

export interface Resource extends Link {
  id: string;
  group: "Papers" | "Guides" | "Documentation" | "Frameworks and tools" | "Risk and responsible use";
}

export const RESOURCES: Resource[] = [
  // Papers
  { id: "lost-in-middle", group: "Papers", label: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)", url: "https://arxiv.org/abs/2307.03172", note: "Why information buried in a long input is used less reliably than information at its start or end." },
  { id: "react", group: "Papers", label: "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)", url: "https://arxiv.org/abs/2210.03629", note: "The reason → act → observe loop that underlies most agents." },
  { id: "toolformer", group: "Papers", label: "Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al., 2023)", url: "https://arxiv.org/abs/2302.04761", note: "Early evidence that models can learn when and how to call tools." },
  { id: "rag", group: "Papers", label: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)", url: "https://arxiv.org/abs/2005.11401", note: "The paper that named RAG." },
  { id: "cot", group: "Papers", label: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022)", url: "https://arxiv.org/abs/2201.11903", note: "Why intermediate reasoning steps change outcomes." },
  { id: "reflexion", group: "Papers", label: "Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)", url: "https://arxiv.org/abs/2303.11366", note: "Self-critique and revision loops." },
  { id: "generative-agents", group: "Papers", label: "Generative Agents: Interactive Simulacra of Human Behavior (Park et al., 2023)", url: "https://arxiv.org/abs/2304.03442", note: "Memory, reflection, and planning in multi-agent simulation." },
  { id: "llm-judge", group: "Papers", label: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., 2023)", url: "https://arxiv.org/abs/2306.05685", note: "Strengths and biases of model-graded evaluation." },
  { id: "swe-bench", group: "Papers", label: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues? (Jimenez et al., 2023)", url: "https://arxiv.org/abs/2310.06770", note: "The benchmark behind most coding-agent claims." },
  { id: "indirect-injection", group: "Papers", label: "Not What You've Signed Up For: Indirect Prompt Injection (Greshake et al., 2023)", url: "https://arxiv.org/abs/2302.12173", note: "How retrieved content can hijack an agent." },
  { id: "agents-that-matter", group: "Papers", label: "AI Agents That Matter (Kapoor et al., 2024)", url: "https://arxiv.org/abs/2407.01502", note: "Why agent benchmarks should report cost with accuracy, keep proper held-out sets, and be reproducible." },
  { id: "llm-fair-evaluators", group: "Papers", label: "Large Language Models are not Fair Evaluators (Wang et al., 2023)", url: "https://arxiv.org/abs/2305.17926", note: "Position bias in LLM judges, and calibration strategies such as judging both answer orders." },
  { id: "memgpt", group: "Papers", label: "MemGPT: Towards LLMs as Operating Systems (Packer et al., 2023)", url: "https://arxiv.org/abs/2310.08560", note: "Tiered memory, paged in and out of the context window like an operating system's memory." },
  { id: "model-cards", group: "Papers", label: "Model Cards for Model Reporting (Mitchell et al., 2018)", url: "https://arxiv.org/abs/1810.03993", note: "Short documents that report a model's intended use and its performance across groups; a model for responsible-use statements." },
  { id: "swe-bench-verified", group: "Papers", label: "Introducing SWE-bench Verified (OpenAI, 2024)", url: "https://openai.com/index/introducing-swe-bench-verified/", note: "How human screening of SWE-bench found underspecified issues and unfair tests, and produced a 500-problem subset." },
  { id: "tau-bench", group: "Papers", label: "τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains (Yao et al., 2024)", url: "https://arxiv.org/abs/2406.12045", note: "Agents serving simulated users under domain policies, graded on final database state; introduces pass^k." },

  // Guides
  { id: "building-effective-agents", group: "Guides", label: "Building Effective Agents (Anthropic)", url: "https://www.anthropic.com/engineering/building-effective-agents", note: "Workflows vs. agents and the core orchestration patterns." },
  { id: "backoff-jitter", group: "Guides", label: "Exponential Backoff And Jitter (Marc Brooker, AWS Architecture Blog)", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/", note: "Why retries need growing, randomized waits, shown with simulations." },
  { id: "claude-code-best-practices", group: "Guides", label: "Best practices for Claude Code", url: "https://code.claude.com/docs/en/best-practices", note: "Give the agent a check it can run; explore, plan, then code; context files; fresh-context review; test-first workflows." },
  { id: "claude-eval-tests", group: "Guides", label: "Create strong empirical evaluations (Claude docs)", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests", note: "Code-based, human, and LLM-based grading, with rubric tips and an example grader using the anthropic SDK." },
  { id: "context-engineering", group: "Guides", label: "Effective context engineering for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", note: "Just-in-time retrieval, compaction, structured note-taking, and sub-agents for long-running work." },
  { id: "contextual-retrieval", group: "Guides", label: "Introducing Contextual Retrieval (Anthropic)", url: "https://www.anthropic.com/news/contextual-retrieval", note: "Why chunks lose context, how adding chunk-specific context plus keyword search and reranking cuts retrieval failures, and when to skip RAG entirely." },
  { id: "demystifying-evals", group: "Guides", label: "Demystifying evals for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents", note: "Tasks, trials, graders, transcripts, and outcomes; capability vs. regression evals; pass@k vs. pass^k; starting from real failures." },
  { id: "dont-build-multi-agents", group: "Guides", label: "Don't Build Multi-Agents (Cognition, 2025)", url: "https://cognition.com/blog/dont-build-multi-agents", note: "The counterargument: share full context, because parallel agents make conflicting implicit decisions." },
  { id: "google-code-review", group: "Guides", label: "How to do a code review (Google Engineering Practices)", url: "https://google.github.io/eng-practices/review/reviewer/", note: "The standard of code review, what to look for, and how to write review comments." },
  { id: "multi-agent-research", group: "Guides", label: "How we built our multi-agent research system (Anthropic)", url: "https://www.anthropic.com/engineering/multi-agent-research-system", note: "Orchestrator–worker design in production: delegation briefs, token costs, parallelism, and when multi-agent is a poor fit." },
  { id: "oauth-client-credentials", group: "Guides", label: "OAuth 2.0 Simplified: Client Credentials", url: "https://www.oauth.com/oauth2-servers/access-tokens/client-credentials/", note: "How a service account gets its own access token, with no user involved." },
  { id: "writing-tools-for-agents", group: "Guides", label: "Writing effective tools for agents — with agents (Anthropic)", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", note: "Choosing, naming, and describing tools; returning high-signal results; helpful errors; evaluating tools." },

  // Documentation
  { id: "anthropic-api", group: "Documentation", label: "Claude Developer Platform documentation", url: "https://platform.claude.com/docs", note: "Messages API, structured output, prompt caching." },
  { id: "anthropic-tools", group: "Documentation", label: "Claude tool use overview", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", note: "Tool definitions and the tool-use loop." },
  { id: "openai-api", group: "Documentation", label: "OpenAI API documentation", url: "https://platform.openai.com/docs", note: "Responses API, structured outputs." },
  { id: "openai-functions", group: "Documentation", label: "OpenAI function calling guide", url: "https://platform.openai.com/docs/guides/function-calling", note: "The same loop from a second vendor." },
  { id: "mcp", group: "Documentation", label: "Model Context Protocol", url: "https://modelcontextprotocol.io", note: "Specification, concepts, and SDKs." },
  { id: "mcp-servers", group: "Documentation", label: "MCP reference servers", url: "https://github.com/modelcontextprotocol/servers", note: "Example servers to read and extend." },
  { id: "claude-models", group: "Documentation", label: "Claude models overview", url: "https://platform.claude.com/docs/en/about-claude/models/overview", note: "Current model ids, tiers, context windows, and output limits." },
  { id: "claude-pricing", group: "Documentation", label: "Claude API pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", note: "Per-million-token prices by model, plus prompt caching and batch discounts." },
  { id: "pydantic", group: "Documentation", label: "Pydantic", url: "https://docs.pydantic.dev", note: "Schema validation for Python." },
  { id: "zod", group: "Documentation", label: "Zod", url: "https://zod.dev", note: "Schema validation for TypeScript; Zod 4 emits JSON Schema with z.toJSONSchema()." },
  { id: "json-schema", group: "Documentation", label: "JSON Schema reference", url: "https://json-schema.org/understanding-json-schema", note: "The schema language every structured-output mode speaks: types, required, additionalProperties, formats." },
  { id: "actions-python", group: "Documentation", label: "GitHub Actions: building and testing Python", url: "https://docs.github.com/en/actions/tutorials/build-and-test-code/python", note: "A workflow that sets up Python, installs dependencies, and runs pytest on every push." },
  { id: "actions-secrets", group: "Documentation", label: "Using secrets in GitHub Actions", url: "https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets", note: "Storing an API key as a repository secret, referencing it in a workflow, and why forks do not receive secrets." },
  { id: "agents-md", group: "Documentation", label: "AGENTS.md: a README for agents", url: "https://agents.md", note: "The open project-instructions format read by many coding agents, with recommended sections and the closest-file-wins rule." },
  { id: "anthropic-embeddings", group: "Documentation", label: "Embeddings (Claude documentation)", url: "https://platform.claude.com/docs/en/build-with-claude/embeddings", note: "Anthropic does not offer its own embedding model; this page shows how to use one provider, Voyage AI, including query vs. document input types." },
  { id: "anthropic-python-sdk", group: "Documentation", label: "Claude Python SDK", url: "https://platform.claude.com/docs/en/api/sdks/python", note: "The anthropic package: automatic retries, max_retries, timeouts, and error classes." },
  { id: "chroma-configure", group: "Documentation", label: "Chroma: configuring collections", url: "https://docs.trychroma.com/docs/collections/configure", note: "Distance spaces (l2, cosine, ip), their formulas, and HNSW index settings." },
  { id: "chroma-cookbook-config", group: "Documentation", label: "Chroma Cookbook: collection configuration", url: "https://cookbook.chromadb.dev/core/configuration/", note: "The configuration parameter in Chroma 1.x, and why the older hnsw:space metadata form is deprecated but still supported." },
  { id: "chroma-embedding-functions", group: "Documentation", label: "Chroma: embedding functions", url: "https://docs.trychroma.com/docs/embeddings/embedding-functions", note: "Chroma's default local embedding model and how to plug in a hosted one instead." },
  { id: "chroma-metadata-filtering", group: "Documentation", label: "Chroma: metadata filtering", url: "https://docs.trychroma.com/docs/querying-collections/metadata-filtering", note: "The where filter: equality, $in, $and, $or, and comparison operators." },
  { id: "chroma-query", group: "Documentation", label: "Chroma: query and get", url: "https://docs.trychroma.com/docs/querying-collections/query-and-get", note: "collection.query() and collection.get(): parameters and the shape of the results." },
  { id: "claude-agent-sdk-hooks", group: "Documentation", label: "Claude Agent SDK: hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks", note: "PreToolUse and other hooks that block, modify, or log what the agent does." },
  { id: "claude-agent-sdk-hosting", group: "Documentation", label: "Hosting the Claude Agent SDK", url: "https://code.claude.com/docs/en/agent-sdk/hosting", note: "The subprocess model, session persistence, OpenTelemetry export, and multi-tenant isolation." },
  { id: "claude-agent-sdk-overview", group: "Documentation", label: "Claude Agent SDK overview", url: "https://code.claude.com/docs/en/agent-sdk/overview", note: "The Claude Code harness as a library: built-in tools, hooks, subagents, permissions, sessions." },
  { id: "claude-agent-sdk-subagents", group: "Documentation", label: "Claude Agent SDK: subagents", url: "https://code.claude.com/docs/en/agent-sdk/subagents", note: "Defining subagents, what context they get, and capping depth, concurrency, and spend." },
  { id: "claude-api-errors", group: "Documentation", label: "Claude API errors", url: "https://platform.claude.com/docs/en/api/errors", note: "HTTP error types, which are worth retrying, and the request id to log with every call." },
  { id: "claude-citations", group: "Documentation", label: "Claude citations", url: "https://platform.claude.com/docs/en/build-with-claude/citations", note: "Asking Claude to cite exact passages of documents you send, with cited_text and locations in the response." },
  { id: "claude-code-github-actions", group: "Documentation", label: "Claude Code GitHub Actions", url: "https://code.claude.com/docs/en/github-actions", note: "Running Claude Code in workflows: @claude mentions in pull requests and issues, automated reviews, secrets, and cost controls." },
  { id: "claude-code-memory", group: "Documentation", label: "Claude Code: how Claude remembers your project (CLAUDE.md and AGENTS.md)", url: "https://code.claude.com/docs/en/memory", note: "Where CLAUDE.md files live, how they load, @imports, path-scoped rules, and when AGENTS.md is read instead." },
  { id: "claude-define-tools", group: "Documentation", label: "Claude docs: Define tools", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools", note: "Tool definition fields, how to write descriptions, tool_choice options, and strict tool use." },
  { id: "claude-handle-tool-calls", group: "Documentation", label: "Claude docs: Handle tool calls", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls", note: "The tool_result block, ordering rules, is_error, and writing instructive error messages." },
  { id: "claude-how-tool-use-works", group: "Documentation", label: "Claude docs: How tool use works", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works", note: "Client tools vs. server tools, and the agentic loop keyed on stop_reason." },
  { id: "claude-memory-tool", group: "Documentation", label: "Claude memory tool", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool", note: "A client-side tool for file-based memory across sessions; your code stores the files and must block path traversal." },
  { id: "claude-parallel-tools", group: "Documentation", label: "Claude docs: Parallel tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use", note: "Returning several tool results in one message, disable_parallel_tool_use, and common mistakes." },
  { id: "claude-search-results", group: "Documentation", label: "Claude search result content blocks", url: "https://platform.claude.com/docs/en/build-with-claude/search-results", note: "Returning your own retrieved passages from a tool as search_result blocks, so answers cite them by source and title." },
  { id: "claude-stop-reasons", group: "Documentation", label: "Claude docs: Handling stop reasons", url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons", note: "Every stop_reason value, what to do with each, and the empty-response case after tool results." },
  { id: "co-authored-commits", group: "Documentation", label: "Creating a commit with multiple authors (GitHub)", url: "https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors", note: "The Co-authored-by: trailer format for crediting more than one author on a commit." },
  { id: "copilot-features", group: "Documentation", label: "GitHub Copilot features", url: "https://docs.github.com/en/copilot/get-started/features", note: "Inline suggestions, chat, agent mode in the IDE, the cloud agent, and code review, each defined in one line." },
  { id: "copilot-instructions", group: "Documentation", label: "Adding repository custom instructions for GitHub Copilot", url: "https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions", note: "copilot-instructions.md, path-specific .instructions.md files, and how Copilot uses AGENTS.md." },
  { id: "graphql", group: "Documentation", label: "Learn GraphQL", url: "https://graphql.org/learn/", note: "Schemas, queries, and mutations: the main alternative to REST." },
  { id: "http-429", group: "Documentation", label: "MDN: 429 Too Many Requests", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429", note: "The rate-limit status code and the Retry-After header." },
  { id: "langgraph-checkpointers", group: "Documentation", label: "LangGraph checkpointers", url: "https://docs.langchain.com/oss/python/langgraph/checkpointers", note: "SQLite and Postgres checkpointers, state history, replay, super-steps, and durability modes." },
  { id: "langgraph-graph-api", group: "Documentation", label: "LangGraph Graph API", url: "https://docs.langchain.com/oss/python/langgraph/graph-api", note: "State, reducers, nodes, edges, conditional edges, Send, and Command." },
  { id: "langgraph-interrupts", group: "Documentation", label: "LangGraph interrupts", url: "https://docs.langchain.com/oss/python/langgraph/interrupts", note: "Pausing a graph for human input and resuming it; why the paused node re-runs." },
  { id: "langgraph-overview", group: "Documentation", label: "LangGraph overview", url: "https://docs.langchain.com/oss/python/langgraph/overview", note: "What LangGraph is, what it adds, and how to install it." },
  { id: "langgraph-persistence", group: "Documentation", label: "LangGraph persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", note: "Checkpointers, threads, and why in-memory checkpoints are for development only." },
  { id: "mcp-architecture", group: "Documentation", label: "MCP architecture overview", url: "https://modelcontextprotocol.io/docs/learn/architecture", note: "Hosts, clients, and servers; the data and transport layers; a worked JSON-RPC example." },
  { id: "mcp-authorization", group: "Documentation", label: "MCP specification: Authorization", url: "https://modelcontextprotocol.io/specification/latest/basic/authorization", note: "OAuth 2.1 for remote MCP servers: discovery, token audience, scopes, and error handling." },
  { id: "mcp-security", group: "Documentation", label: "MCP security best practices", url: "https://modelcontextprotocol.io/specification/latest/basic/security_best_practices", note: "Attacks on MCP implementations and their mitigations: confused deputy, token passthrough, local server compromise, scope minimization." },
  { id: "mcp-server-concepts", group: "Documentation", label: "Understanding MCP servers", url: "https://modelcontextprotocol.io/docs/learn/server-concepts", note: "Tools, resources, and prompts, and who controls each one." },
  { id: "mcp-tools-spec", group: "Documentation", label: "MCP specification: Tools", url: "https://modelcontextprotocol.io/specification/latest/server/tools", note: "Tool definitions, tool execution errors vs. protocol errors, human-in-the-loop and security requirements." },
  { id: "mcp-transports", group: "Documentation", label: "MCP specification: Transports", url: "https://modelcontextprotocol.io/specification/latest/basic/transports", note: "The stdio and Streamable HTTP transports, with links to each binding's rules." },
  { id: "openai-agents-guardrails", group: "Documentation", label: "OpenAI Agents SDK: guardrails", url: "https://openai.github.io/openai-agents-python/guardrails/", note: "Input, output, and tool guardrails; tripwires; where each one runs in a multi-agent workflow." },
  { id: "openai-agents-handoffs", group: "Documentation", label: "OpenAI Agents SDK: handoffs", url: "https://openai.github.io/openai-agents-python/handoffs/", note: "Control handoffs as tools, what history the next agent sees, and input filters." },
  { id: "openai-agents-multi-agent", group: "Documentation", label: "OpenAI Agents SDK: orchestrating multiple agents", url: "https://openai.github.io/openai-agents-python/multi_agent/", note: "Orchestrating via the model vs. via code; agents as tools vs. handoffs." },
  { id: "openai-agents-tracing", group: "Documentation", label: "OpenAI Agents SDK: tracing", url: "https://openai.github.io/openai-agents-python/tracing/", note: "Built-in tracing, on by default; how to disable it or send traces elsewhere." },
  { id: "openai-embeddings", group: "Documentation", label: "OpenAI embeddings guide", url: "https://developers.openai.com/api/docs/guides/embeddings", note: "A second vendor's embedding API, with vector sizes and a cosine-similarity search example." },
  { id: "openapi-spec", group: "Documentation", label: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html", note: "The standard machine-readable description of REST APIs: paths, operations, parameters, schemas, security." },
  { id: "otel-traces", group: "Documentation", label: "OpenTelemetry: Traces", url: "https://opentelemetry.io/docs/concepts/signals/traces/", note: "Traces and spans: the open standard behind most production tracing tools." },
  { id: "pip-secure-installs", group: "Documentation", label: "pip: secure installs (hash-checking mode)", url: "https://pip.pypa.io/en/stable/topics/secure-installs/", note: "Pinning packages with hashes so pip refuses any download that does not match." },
  { id: "pr-templates", group: "Documentation", label: "Creating a pull request template (GitHub)", url: "https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository", note: "Where pull_request_template.md goes so every new pull request starts with your checklist." },
  { id: "protected-branches", group: "Documentation", label: "About protected branches (GitHub)", url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches", note: "Requiring status checks and approving reviews before a pull request can merge." },
  { id: "schtasks", group: "Documentation", label: "schtasks create (Windows Task Scheduler)", url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks-create", note: "Scheduling a script to run unattended on Windows." },
  { id: "stripe-idempotency", group: "Documentation", label: "Stripe API: Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests", note: "A real idempotency-key design: how a payment API makes retried writes safe." },

  // Frameworks and tools
  { id: "langgraph", group: "Frameworks and tools", label: "LangGraph", url: "https://github.com/langchain-ai/langgraph", note: "Graph-based agent orchestration." },
  { id: "openai-agents-sdk", group: "Frameworks and tools", label: "OpenAI Agents SDK (Python)", url: "https://github.com/openai/openai-agents-python", note: "Agents, handoffs, guardrails, tracing." },
  { id: "claude-agent-sdk", group: "Frameworks and tools", label: "Claude Agent SDK (Python)", url: "https://github.com/anthropics/claude-agent-sdk-python", note: "The agent harness behind Claude Code, as a library." },
  { id: "claude-code", group: "Frameworks and tools", label: "Claude Code", url: "https://github.com/anthropics/claude-code", note: "Terminal-based agentic coding tool." },
  { id: "copilot", group: "Frameworks and tools", label: "GitHub Copilot documentation", url: "https://docs.github.com/en/copilot", note: "IDE and agent-mode coding assistance." },
  { id: "github-education", group: "Frameworks and tools", label: "GitHub Education (Student Developer Pack)", url: "https://education.github.com/pack", note: "Student benefits, including Copilot access for verified students." },
  { id: "pgvector", group: "Frameworks and tools", label: "pgvector", url: "https://github.com/pgvector/pgvector", note: "Vector search inside PostgreSQL." },
  { id: "chroma", group: "Frameworks and tools", label: "Chroma", url: "https://www.trychroma.com", note: "Lightweight open-source vector database." },
  { id: "fastapi", group: "Frameworks and tools", label: "FastAPI: First Steps", url: "https://fastapi.tiangolo.com/tutorial/first-steps/", note: "The framework behind the Lab 7 help desk; shows the generated /docs page and /openapi.json." },
  { id: "langfuse", group: "Frameworks and tools", label: "Langfuse", url: "https://langfuse.com/docs", note: "Open-source, self-hostable platform for tracing agents, running evaluations (including LLM-as-judge), and managing datasets." },
  { id: "mcp-inspector", group: "Frameworks and tools", label: "MCP Inspector", url: "https://modelcontextprotocol.io/docs/tools/inspector", note: "The reference tool for testing MCP servers by hand: web, CLI, and terminal modes." },
  { id: "mcp-python-sdk-v1", group: "Frameworks and tools", label: "MCP Python SDK v1.x documentation", url: "https://py.sdk.modelcontextprotocol.io/v1/", note: "FastMCP servers, ClientSession clients, transports, authorization, and testing, for the 1.x SDK that Lab 6 uses. The current v2 SDK renames FastMCP to MCPServer." },
  { id: "minilm", group: "Frameworks and tools", label: "all-MiniLM-L6-v2 (Sentence Transformers model card)", url: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2", note: "The small open model behind Chroma's default embedding function: 384-number vectors, input truncated at 256 word pieces." },
  { id: "otel-genai", group: "Frameworks and tools", label: "OpenTelemetry semantic conventions for generative AI", url: "https://github.com/open-telemetry/semantic-conventions-genai", note: "Shared names for spans, metrics, and events from model calls and agents." },
  { id: "pgvector-python", group: "Frameworks and tools", label: "pgvector-python", url: "https://github.com/pgvector/pgvector-python", note: "Using pgvector from Python with psycopg, SQLAlchemy, Django, and others." },
  { id: "pip-audit", group: "Frameworks and tools", label: "pip-audit", url: "https://pypi.org/project/pip-audit/", note: "Scans a Python environment or requirements file for packages with known vulnerabilities." },
  { id: "spec-kit", group: "Frameworks and tools", label: "Spec Kit (GitHub)", url: "https://github.com/github/spec-kit", note: "Open-source toolkit for spec-driven development with coding agents: principles, specify, plan, tasks, implement." },

  // Risk
  { id: "owasp-llm", group: "Risk and responsible use", label: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/", note: "The standard checklist of LLM application risks." },
  { id: "nist-rmf", group: "Risk and responsible use", label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", note: "Govern, map, measure, manage." },
  { id: "cisa-cvd", group: "Risk and responsible use", label: "CISA Coordinated Vulnerability Disclosure process", url: "https://www.cisa.gov/coordinated-vulnerability-disclosure-process", note: "How a vulnerability report moves from discovery to a fix to public disclosure." },
  { id: "copilot-cloud-agent-risks", group: "Risk and responsible use", label: "Risks and mitigations for Copilot cloud agent", url: "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations", note: "Single-branch pushes, no self-approval, workflows that wait for human approval, and restricted internet access." },
  { id: "ferpa-faq", group: "Risk and responsible use", label: "What is FERPA? (U.S. Department of Education, Student Privacy)", url: "https://studentprivacy.ed.gov/faq/what-ferpa", note: "The official short answer: who holds FERPA rights and when they transfer to the student." },
  { id: "ferpa-regs", group: "Risk and responsible use", label: "34 CFR Part 99: Family Educational Rights and Privacy (eCFR)", url: "https://www.ecfr.gov/current/title-34/subtitle-A/part-99", note: "The regulations: definitions of education records, directory information, and PII, and the school-official exception." },
  { id: "lethal-trifecta", group: "Risk and responsible use", label: "The lethal trifecta for AI agents (Simon Willison, 2025)", url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/", note: "Private data, untrusted content, and external communication: why the combination leads to exfiltration." },
  { id: "nist-bias", group: "Risk and responsible use", label: "Towards a Standard for Identifying and Managing Bias in AI (NIST SP 1270, 2022)", url: "https://www.nist.gov/publications/towards-standard-identifying-and-managing-bias-artificial-intelligence", note: "Systemic, statistical and computational, and human bias, and why bias needs a socio-technical approach." },
  { id: "nist-genai-profile", group: "Risk and responsible use", label: "NIST AI 600-1: Generative AI Profile (2024)", url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence", note: "The AI RMF companion for generative AI, with twelve risks it creates or makes worse, such as confabulation and data privacy." },
  { id: "nist-rmf-core", group: "Risk and responsible use", label: "NIST AI RMF Core: Govern, Map, Measure, Manage", url: "https://airc.nist.gov/airmf-resources/airmf/5-sec-core/", note: "What each of the four functions covers and how they fit together." },
  { id: "owasp-agentic", group: "Risk and responsible use", label: "OWASP Top 10 for Agentic Applications for 2026", url: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/", note: "A separate OWASP list focused on autonomous, tool-using agents. Useful when planning Lab 12 attacks." },
  { id: "owasp-llm01", group: "Risk and responsible use", label: "OWASP LLM01:2025 Prompt Injection", url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/", note: "Direct and indirect injection, and seven mitigation strategies; notes that no fool-proof prevention is known." },
  { id: "owasp-llm06", group: "Risk and responsible use", label: "OWASP LLM06:2025 Excessive Agency", url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/", note: "Excessive functionality, permissions, and autonomy, and how to minimize each." },
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

/** Matches a [[resource-id]] reference inside page prose. */
export const REF_PATTERN = /\[\[([a-z0-9-]+)\]\]/g;

/**
 * Replace [[resource-id]] references with the resource's plain label.
 * Used by the search index; the UI uses components/RichText.tsx instead so
 * the reference renders as a real link.
 */
export function resolveRefs(text: string): string {
  return text.replace(REF_PATTERN, (whole, id: string) => RESOURCE_BY_ID[id]?.label ?? whole);
}
