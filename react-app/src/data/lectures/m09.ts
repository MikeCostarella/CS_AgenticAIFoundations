import type { LectureNotesDef } from "../types";

// Module 9 — Frameworks, SDKs, and platforms: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M09_NOTES: LectureNotesDef = {
  "moduleId": "m09",
  "intro": "These notes go with the Module 9 lecture and Lab 9. Lab 9 ports your Lab 8 pipeline, the researcher, writer, and reviewer that produce the Maple Falls resident briefing, to one framework or SDK, compares the two versions, maps a vendor agent platform onto the course's components, and ends with a build / extend / buy memo. Framework code here was checked against each project's documentation in October 2026 and is labeled as a sketch. These libraries change quickly, so confirm exact names in the current docs before you copy anything. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "langgraph",
      "blocks": [
        "You have now written every part of an agent system by hand: the loop (Lab 3), retries and budgets (Lab 4), retrieval (Lab 5), and a multi-role pipeline (Lab 8). A **{{framework}}** is a library that supplies that structure for you, so that you write only the parts specific to your task. Lab 9 asks you to port the Lab 8 pipeline to one framework or SDK and judge honestly what you gained and what you lost. This section covers the first option: a graph framework.",
        "**{{langgraph|LangGraph}}** describes itself as a \"low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents\" ([[langgraph-overview]]). It comes from the company behind LangChain, but you do not need LangChain to use it. Your model calls can stay exactly as they are, using the `anthropic` SDK. LangGraph only takes over the part that `pipeline.py` does today: what runs next, what state is passed along, and what is saved.",
        "Start Lab 9 the same way earlier labs started, from a copy of Lab 8:",
        {
          "code": "cd $HOME\\agentic-ai\nmkdir agentic-lab09\ncd agentic-lab09\nrobocopy ..\\agentic-lab08 . /E /XD .git .venv traces runs outbox state __pycache__ /XF .env\ngit init\nAdd-Content .gitignore \"checkpoints.db\"\n\npython -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\npip install langgraph langgraph-checkpoint-sqlite\npip freeze > requirements.txt\n\ncopy ..\\agentic-lab01\\.env .env\ngit check-ignore -v .env",
          "title": "Set up the port (PowerShell)",
          "note": "If you port to a vendor SDK instead (topic 2), install `openai-agents` or `claude-agent-sdk` in place of the two LangGraph packages."
        },
        "LangGraph models a workflow as a graph. Its vocabulary maps directly onto code you already have:",
        {
          "table": {
            "head": [
              "LangGraph term",
              "What it is",
              "In your Lab 8 code"
            ],
            "rows": [
              [
                "State",
                "A typed dictionary that every step reads and updates",
                "The variables `build_briefing` passes around: question, subtopics, notes, draft, review"
              ],
              [
                "Node",
                "A plain Python function that takes the state and returns the keys it changed",
                "`plan`, `research`, `write`, `review_draft` in `roles.py`"
              ],
              [
                "Edge",
                "A fixed \"after this, run that\"",
                "The order of the lines in `build_briefing`"
              ],
              [
                "Conditional edge",
                "A function that looks at the state and names the next node",
                "The `if not problems: return` test in the review loop"
              ],
              [
                "`Send`",
                "Starts one copy of a node per item, in parallel",
                "`pool.map(...)` over the subtopics"
              ],
              [
                "Reducer",
                "A rule for merging updates to one key, such as \"append lists\"",
                "Collecting the researchers' results into one list"
              ],
              [
                "Checkpointer",
                "Saves the state after every step",
                "The `runs/<run_id>/` folder, done for you (topic 3)"
              ]
            ],
            "caption": "LangGraph's vocabulary, mapped onto Lab 8"
          }
        },
        {
          "code": "\"\"\"graph_pipeline.py: the Lab 8 pipeline as a LangGraph graph. The roles are unchanged.\"\"\"\nimport operator\nimport sqlite3\nfrom typing import Annotated, TypedDict\n\nfrom langgraph.checkpoint.sqlite import SqliteSaver\nfrom langgraph.graph import END, START, StateGraph\nfrom langgraph.types import Send\n\nfrom roles import citation_problems, plan, research, review_draft, write\n\nMAX_ROUNDS = 2\n\n\nclass State(TypedDict):\n    question: str\n    subtopics: list[str]\n    notes: Annotated[list, operator.add]   # reducer: each researcher's result is appended\n    draft: str\n    problems: list[str]\n    rounds: int\n\n\ndef plan_node(state: State):\n    return {\"subtopics\": plan(state[\"question\"]).subtopics, \"rounds\": 0}\n\n\ndef fan_out(state: State):\n    return [Send(\"research\", {\"question\": state[\"question\"], \"subtopic\": s})\n            for s in state[\"subtopics\"]]\n\n\ndef research_node(job: dict):\n    return {\"notes\": [research(job[\"question\"], job[\"subtopic\"])]}\n\n\ndef write_node(state: State):\n    draft = write(state[\"question\"], state[\"notes\"], feedback=state.get(\"problems\", []))\n    return {\"draft\": draft.markdown, \"rounds\": state[\"rounds\"] + 1}\n\n\ndef review_node(state: State):\n    problems = citation_problems(state[\"draft\"], state[\"notes\"])\n    if not problems:\n        review = review_draft(state[\"draft\"], state[\"notes\"])\n        problems = [f\"{p.issue}: {p.sentence}\" for p in review.problems]\n    return {\"problems\": problems}\n\n\ndef after_review(state: State):\n    if not state[\"problems\"] or state[\"rounds\"] >= MAX_ROUNDS:\n        return END\n    return \"write\"\n\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"plan\", plan_node)\nbuilder.add_node(\"research\", research_node)\nbuilder.add_node(\"write\", write_node)\nbuilder.add_node(\"review\", review_node)\nbuilder.add_edge(START, \"plan\")\nbuilder.add_conditional_edges(\"plan\", fan_out, [\"research\"])\nbuilder.add_edge(\"research\", \"write\")          # runs once, after every researcher finishes\nbuilder.add_edge(\"write\", \"review\")\nbuilder.add_conditional_edges(\"review\", after_review, [\"write\", END])\n\ngraph = builder.compile(\n    checkpointer=SqliteSaver(sqlite3.connect(\"checkpoints.db\", check_same_thread=False))\n)",
          "title": "graph_pipeline.py: a sketch of the port",
          "note": "Checked against the LangGraph Graph API and checkpointer docs in October 2026 ([[langgraph-graph-api]]). In Lab 8 the role functions also took `run_dir` and wrote trace files; adapt the calls to your own signatures. Pass the notes as plain dictionaries (`.model_dump()`) if the checkpointer complains about saving your Pydantic objects."
        },
        {
          "code": "config = {\"configurable\": {\"thread_id\": \"briefing-001\"}}\nresult = graph.invoke({\"question\": BRIEFING_TASK, \"notes\": []}, config)\nprint(result[\"draft\"])\nprint(\"unresolved\" if result[\"problems\"] else \"pass\", \"after\", result[\"rounds\"], \"rounds\")\n\nprint(graph.get_graph().draw_mermaid())   # the graph as a Mermaid diagram",
          "title": "Running the graph"
        },
        "Look at what moved and what did not. The prompts, the handoff classes, the role functions, and the gates are all still yours. What LangGraph replaced is the orchestration: the thread pool, the review loop, and the run folder. In return you get a diagram of the flow, a saved checkpoint after every step, and the ability to pause and resume (topic 3). You also take on a dependency that changes often, a new vocabulary, and stack traces that now pass through framework code.",
        {
          "callout": "LangGraph also ships prebuilt agents that hide the model loop entirely. They are convenient, and they are exactly what [[building-effective-agents]] warns about: abstraction that hides the prompts and responses. For Lab 9, port your own roles into nodes, so you can compare like with like.",
          "tone": "tip",
          "title": "Port the orchestration, keep the roles"
        }
      ],
      "takeaway": "LangGraph expresses a workflow as a graph of plain functions over a shared, typed state; porting Lab 8 to it replaces your orchestration code, not your prompts or roles, and buys checkpoints and pause-and-resume at the price of a fast-moving dependency.",
      "check": [
        {
          "q": "Why does the `notes` key use `Annotated[list, operator.add]` while `draft` is a plain `str`?",
          "a": "Several researcher nodes update `notes` in the same step, and the reducer tells LangGraph to combine their updates by appending. `draft` has one writer at a time, so a new value simply replaces the old one."
        },
        {
          "q": "In the graph, how many times does the `write` node run after four researchers finish, and why?",
          "a": "Once for the first draft. The edge from `research` to `write` fires after the whole parallel step completes, not once per researcher. It runs again only if `after_review` routes back to it."
        },
        {
          "q": "Name one thing you still have to write yourself after the port, and one thing you no longer write.",
          "a": "Still yours: the prompts, the Pydantic handoff classes, the role functions, and the citation checks. No longer yours: the thread pool, the review-loop control flow, and saving state to the run folder, which the checkpointer now does."
        }
      ],
      "readings": [
        "langgraph",
        "langgraph-overview",
        "langgraph-graph-api"
      ]
    },
    {
      "topic": "vendor-sdks",
      "blocks": [
        "Model providers now publish their own agent libraries. They sit one level above the client {{sdk|SDK}} you have used since Lab 1. The client SDK sends one request and returns one response; you wrote the loop. An agent SDK runs the loop for you, and adds tools, multi-agent features, and tracing around it. This section covers two of them: the **OpenAI Agents SDK** and the **Claude Agent SDK**. They solve the same problem in noticeably different ways.",
        {
          "table": {
            "head": [
              "",
              "Hand-rolled (Labs 3 to 8)",
              "OpenAI Agents SDK",
              "Claude Agent SDK"
            ],
            "rows": [
              [
                "Install",
                "`anthropic`",
                "`openai-agents`",
                "`claude-agent-sdk`"
              ],
              [
                "Who runs the loop",
                "Your `run()`",
                "`Runner.run()` in your Python process",
                "A Claude Code process the library starts and talks to"
              ],
              [
                "Tools",
                "Dicts plus `dispatch()`",
                "Python functions with `@function_tool`; schema from type hints and docstring",
                "Built-in file, shell, and web tools, plus your own through MCP"
              ],
              [
                "Multi-agent",
                "Your orchestration code",
                "Agents as tools, and handoffs",
                "Subagents, each with its own context"
              ],
              [
                "Limits",
                "`MAX_STEPS`, `TOKEN_BUDGET`, `MAX_COST_USD`",
                "`max_turns`",
                "`max_turns`, `max_budget_usd`"
              ],
              [
                "Tracing",
                "Your JSON Lines files",
                "On by default, sent to OpenAI's dashboard",
                "OpenTelemetry export when you configure it"
              ],
              [
                "Models",
                "Claude",
                "OpenAI by default; others through adapters",
                "Claude"
              ]
            ],
            "caption": "Two vendor agent SDKs next to the code you wrote. Checked against each project's docs in October 2026."
          }
        },
        "**The OpenAI Agents SDK** ([[openai-agents-sdk]]) is built from a few small pieces. An `Agent` is a name, instructions, tools, and optionally an `output_type`. `Runner.run()` runs the loop and returns a result whose `final_output` is your typed object. Its README calls it provider-agnostic, but its examples expect an OpenAI key, and other providers go through third-party adapters. For Lab 9 the natural port is *orchestrating via code*: keep Lab 8's stages and let each role become an `Agent`.",
        {
          "code": "import asyncio\n\nfrom agents import Agent, Runner, function_tool, trace\n\nimport tools                                       # your Lab 5 tools.py\nfrom handoff import Draft, ResearchNotes, Review\nfrom roles import RESEARCHER, REVIEWER, WRITER, render_review, render_write\n\n\n@function_tool\ndef search_handbook(query: str, k: int = 4) -> str:\n    \"\"\"Search the Town of Maple Falls policy handbook by meaning. Returns passages with ids to cite.\"\"\"\n    return tools.search_handbook(query, k)\n\n\nresearcher = Agent(name=\"Researcher\", instructions=RESEARCHER,\n                   tools=[search_handbook], output_type=ResearchNotes)\nwriter = Agent(name=\"Writer\", instructions=WRITER, output_type=Draft)\nreviewer = Agent(name=\"Reviewer\", instructions=REVIEWER, output_type=Review)\n\n\nasync def build_briefing(question: str, subtopics: list[str]) -> Draft:\n    with trace(\"Lab 9 briefing\"):                  # one trace for the whole pipeline\n        runs = await asyncio.gather(*(Runner.run(researcher, f\"{question}\\nSubtopic: {s}\", max_turns=6)\n                                      for s in subtopics))\n        notes = [r.final_output for r in runs]\n        draft = (await Runner.run(writer, render_write(question, notes, []))).final_output\n        for _ in range(2):\n            review = (await Runner.run(reviewer, render_review(draft, notes))).final_output\n            if not review.problems:\n                break\n            draft = (await Runner.run(writer, render_write(question, notes, review.problems))).final_output\n    return draft",
          "title": "sdk_pipeline.py: a sketch of the OpenAI Agents SDK port",
          "note": "`render_write` and `render_review` are small helpers that format the findings into the user message; write them in `roles.py`. Recent docs also show the decorator imported as `tool` from `agents.decorators`; `function_tool` is the same function. See [[openai-agents-multi-agent]]."
        },
        "**The Claude Agent SDK** ([[claude-agent-sdk-overview]]) takes a different approach. It is the harness behind Claude Code, offered as a library. When you call `query()`, the library starts a Claude Code process and streams back its messages. You get built-in tools for files, shell commands, and the web, plus permissions, hooks, sessions, and subagents. Your own tools join through an in-process MCP server, so Module 6 pays off here. In this SDK the *model* orchestrates. A main agent decides when to hand a subtopic to a `researcher` subagent.",
        {
          "code": "from typing import Any\n\nfrom claude_agent_sdk import (AgentDefinition, ClaudeAgentOptions, ResultMessage,\n                              create_sdk_mcp_server, query, tool)\n\nimport tools                                       # your Lab 5 tools.py\nfrom roles import ORCHESTRATOR, RESEARCHER, REVIEWER\n\n\n@tool(\"search_handbook\", \"Search the Maple Falls policy handbook by meaning. \"\n      \"Returns passages with ids to cite.\", {\"query\": str})\nasync def search_handbook(args: dict[str, Any]) -> dict[str, Any]:\n    return {\"content\": [{\"type\": \"text\", \"text\": tools.search_handbook(args[\"query\"])}]}\n\n\nSEARCH = \"mcp__handbook__search_handbook\"          # mcp__<server key>__<tool name>\n\noptions = ClaudeAgentOptions(\n    system_prompt=ORCHESTRATOR,                    # plan, delegate each subtopic, write, get a review\n    mcp_servers={\"handbook\": create_sdk_mcp_server(name=\"handbook\", tools=[search_handbook])},\n    allowed_tools=[SEARCH, \"Agent\"],                # auto-approve these two\n    disallowed_tools=[\"Bash\", \"Read\", \"Write\", \"Edit\", \"Glob\", \"Grep\", \"WebFetch\", \"WebSearch\"],\n    agents={\n        \"researcher\": AgentDefinition(\n            description=\"Researches ONE subtopic in the handbook and returns JSON findings.\",\n            prompt=RESEARCHER, tools=[SEARCH], model=\"haiku\", maxTurns=6),\n        \"reviewer\": AgentDefinition(\n            description=\"Checks every cited sentence of a draft against the handbook.\",\n            prompt=REVIEWER, tools=[SEARCH], model=\"sonnet\", maxTurns=6),\n    },\n    max_turns=30,\n    max_budget_usd=0.50,\n)\n\n\nasync def main(question: str):\n    async for message in query(prompt=question, options=options):\n        if isinstance(message, ResultMessage):\n            print(message.subtype, message.num_turns, message.total_cost_usd)\n            print(message.result)",
          "title": "agent_sdk_pipeline.py: a sketch of the Claude Agent SDK port",
          "note": "Run it with `asyncio.run(main(BRIEFING_TASK))`. `AgentDefinition` fields are camelCase (`maxTurns`), unlike the snake_case options. Subagents are started through the built-in `Agent` tool, which some versions report as `Task`. See [[claude-agent-sdk-subagents]]."
        },
        "Two details in that sketch are easy to get wrong. First, `allowed_tools` *auto-approves* the tools it lists. It does not restrict the agent to them. Removing tools is the job of `disallowed_tools`. Second, the subagents start with fresh context. They see only their own prompt and the task text the main agent writes for them, so the delegation brief from Module 8 topic 2 matters as much here as in your own code.",
        {
          "callout": "Neither port is \"the Lab 8 pipeline in fewer lines\" exactly. The OpenAI version keeps your control flow and drops your loop. The Claude version drops your control flow too: the main agent decides how many researchers to start and when to stop reviewing. Your Lab 9 comparison should say which of those trades you made, and what your traces show the model did with the freedom.",
          "tone": "aside",
          "title": "The two SDKs move different code out of your hands"
        }
      ],
      "takeaway": "Vendor agent SDKs run the agent loop for you. The OpenAI Agents SDK keeps orchestration in your Python if you want it there, while the Claude Agent SDK wraps the Claude Code harness and lets the model orchestrate subagents, so check which decisions each one takes away from your code.",
      "check": [
        {
          "q": "In the Claude Agent SDK sketch, what would happen if you deleted the `disallowed_tools` line but kept `allowed_tools` as it is?",
          "a": "The built-in tools would still be in the agent's tool set. `allowed_tools` only auto-approves the listed tools; it does not remove the others. The agent could then try to read files or run commands, and those calls would go through the normal permission checks instead of being impossible."
        },
        {
          "q": "In the OpenAI SDK sketch, where does the decision \"stop after two review rounds\" live? Where would it live in the Claude SDK version?",
          "a": "In your Python: the `for _ in range(2)` loop. In the Claude version it lives in the orchestrator's prompt, which the model may or may not follow, with `max_turns` and `max_budget_usd` as the hard limits enforced by the harness."
        },
        {
          "q": "Why does the Claude Agent SDK port reuse your Lab 5 search function through an MCP server, instead of you editing `tools.py`?",
          "a": "The Claude Agent SDK adds custom tools through MCP. `create_sdk_mcp_server` wraps your existing function as an in-process MCP server, the same protocol you used in Lab 6, so the search code itself does not change."
        }
      ],
      "readings": [
        "openai-agents-sdk",
        "openai-agents-multi-agent",
        "claude-agent-sdk",
        "claude-agent-sdk-overview",
        "claude-agent-sdk-subagents"
      ]
    },
    {
      "topic": "state-checkpoints",
      "blocks": [
        "Your Lab 3 agent kept its whole state in one Python list, `messages`. If the process died at step 6, that list was gone. The trace file survived, but a trace is a *log*: it records what happened, and you cannot restart from it. Lab 8 made the problem bigger. A briefing run makes about 17 model calls, and a crash during the second review would throw away all the research.",
        "A **{{checkpoint}}** is a saved snapshot of a workflow's state at a step boundary, written so that the run can continue from that point later. Saving checkpoints as you go is called **{{durable-execution|durable execution}}**. It enables four things:",
        {
          "list": [
            "**Resume after a crash.** Start again from the last checkpoint instead of from the beginning.",
            "**Pause for a person.** Stop before a consequential step, wait hours or days for approval, then continue. This is Lab 7's confirmation gate, but one that survives a restart.",
            "**Inspect and replay.** Look at the state as it was after any step, or re-run from an earlier step with a changed prompt.",
            "**Continue a conversation.** Pick up a multi-turn session where it left off."
          ]
        },
        "In LangGraph, checkpointing comes from the checkpointer you pass to `compile()` in topic 1. Each run belongs to a **thread**, named by the `thread_id` in the config. A checkpoint is saved at every *super-step*, LangGraph's name for one round of nodes that run together ([[langgraph-checkpointers]]). If one researcher fails while three succeed, the successful results are kept, and a resume does not re-run them.",
        {
          "code": "config = {\"configurable\": {\"thread_id\": \"briefing-001\"}}\n\n# The run crashed during review. Same thread_id, input None: continue from the last checkpoint.\nresult = graph.invoke(None, config)\n\n# What was the state after each step? Newest first.\nfor snap in graph.get_state_history(config):\n    print(snap.metadata[\"step\"], snap.next, len(snap.values.get(\"notes\", [])))",
          "title": "Resume and inspect a LangGraph thread (sketch)",
          "note": "`snap.next` lists the nodes due to run next; an empty tuple means the run finished. See [[langgraph-persistence]]."
        },
        "**Pausing for a person** uses `interrupt()`. Called inside a node, it saves the state and stops the graph. You resume later by invoking the graph with `Command(resume=...)`, and the value you pass becomes the return value of `interrupt()`. A briefing could wait for approval before it goes to the outbox:",
        {
          "code": "from langgraph.types import Command, interrupt\n\n\ndef approve_node(state: State):\n    decision = interrupt({\"draft\": state[\"draft\"], \"problems\": state[\"problems\"]})\n    return {\"approved\": decision == \"approve\"}\n\n\n# Later, perhaps from a different process, the same thread_id:\ngraph.invoke(Command(resume=\"approve\"), config)",
          "title": "Human approval that survives a restart (sketch)",
          "note": "Add `approved: bool` to `State`. On resume the paused node runs again from its first line, so anything before `interrupt()` runs twice. Put side effects after it, or in a separate node ([[langgraph-interrupts]])."
        },
        "That last note is the most important rule in this topic. **Resuming re-runs work**. LangGraph restarts the interrupted node from the top. Replaying from an old checkpoint re-runs every node after it, model calls and API requests included. Any step that writes, sends, or charges must be {{idempotency|idempotent}}, exactly as Lab 4 required before any retry. The Lab 7 idempotency key is the tool for the job.",
        {
          "table": {
            "head": [
              "Option",
              "Where state lives",
              "Survives a restart?",
              "Use it for"
            ],
            "rows": [
              [
                "Your Lab 8 run folder",
                "`runs/<run_id>/*.json`",
                "Yes",
                "Simple pipelines; you write the skip-what-is-done logic yourself"
              ],
              [
                "LangGraph `InMemorySaver`",
                "Process memory",
                "No",
                "Tests and notebooks only"
              ],
              [
                "LangGraph `SqliteSaver`",
                "A local SQLite file",
                "Yes",
                "Lab 9 and single-machine jobs"
              ],
              [
                "LangGraph `PostgresSaver`",
                "A Postgres database",
                "Yes",
                "Production, several workers"
              ],
              [
                "Claude Agent SDK sessions",
                "Transcript files on local disk; a `SessionStore` adapter for durable storage",
                "Locally, until the container goes",
                "Resuming or forking a conversation with `resume=session_id`"
              ],
              [
                "OpenAI Agents SDK sessions",
                "A session store such as SQLite",
                "Depends on the store",
                "Conversation history across runs"
              ]
            ],
            "caption": "Where frameworks keep state. Conversation sessions are not the same as workflow checkpoints."
          }
        },
        "Notice the difference in the last two rows. The vendor SDKs' sessions save a **conversation**, so the next prompt can continue it. They do not record \"research done, review pending\" for a pipeline your code runs. If your Lab 9 port uses an SDK and you want crash recovery, keep Lab 8's run folder, or checkpoint between stages yourself.",
        {
          "callout": "Checkpoints contain everything in the state: the question, the retrieved passages, the drafts. In a real deployment that may include personal data, so checkpoints need the same retention rules and access controls as the system's other records (Module 12). Old checkpoints also pile up. LangGraph's docs suggest pruning them with a scheduled job.",
          "tone": "warning",
          "title": "A checkpoint is a copy of your data"
        }
      ],
      "takeaway": "Checkpoints save a workflow's state at each step, so runs can resume after a crash, pause for approval, and be inspected or replayed; because resuming re-runs work, every side effect must be idempotent.",
      "check": [
        {
          "q": "Your Lab 3 trace file shows every step of a run that crashed at step 6. Why can you not simply resume the run from it?",
          "a": "The trace is a log of events, not a saved state. It truncates tool outputs and is not shaped like the `messages` list. Even if it were complete, `agent.py` has no code to rebuild state from it and continue. A checkpoint is written for exactly that purpose."
        },
        {
          "q": "An approval node calls `send_email()` and then `interrupt()`. The reviewer approves the next morning. What goes wrong?",
          "a": "On resume, LangGraph re-runs the node from its first line, so `send_email()` runs a second time. Move the email after `interrupt()` or into its own node, and give it an idempotency key."
        },
        {
          "q": "You port Lab 8 to the Claude Agent SDK and use `resume=session_id` after a crash. Does that give you the same recovery as a LangGraph checkpoint?",
          "a": "Not quite. Resuming a session restores the conversation, so the agent can continue with what it said and saw. It does not restart a fixed pipeline at a known stage, and the agent may redo or skip work. For stage-level recovery, keep a run folder or checkpoint between stages in your own code."
        }
      ],
      "readings": [
        "langgraph-persistence",
        "langgraph-checkpointers",
        "langgraph-interrupts",
        "claude-agent-sdk-hosting"
      ]
    },
    {
      "topic": "framework-guardrails",
      "blocks": [
        "A **{{guardrail}}** is a check that runs *around* an agent, on its input, its output, or its tool calls, and can block or change what happens. You have written several: Lab 3's read-only database and workspace-only file paths, Lab 4's budgets, Lab 5's citation checks, and Lab 7's confirmation gate. Frameworks package the same idea. Learn where each one runs, because a guardrail that never fires on the path that matters protects nothing.",
        {
          "table": {
            "head": [
              "Where the check runs",
              "What it can stop",
              "Your version",
              "OpenAI Agents SDK",
              "Claude Agent SDK",
              "LangGraph"
            ],
            "rows": [
              [
                "Before the agent starts",
                "Off-topic or hostile input",
                "The Module 8 router",
                "Input guardrail",
                "`UserPromptSubmit` hook",
                "A node or conditional edge you add"
              ],
              [
                "Before each tool call",
                "A dangerous or out-of-scope action",
                "`dispatch()`, `_safe_path`, the Lab 7 gate",
                "Tool input guardrail; `needs_approval`",
                "`PreToolUse` hook; permission rules; `can_use_tool`",
                "`interrupt()` before the tool node"
              ],
              [
                "After each tool call",
                "Bad or sensitive tool output",
                "Lab 4's `BadOutput` check",
                "Tool output guardrail",
                "`PostToolUse` hook",
                "A node after the tool"
              ],
              [
                "On the final answer",
                "Unsupported claims, leaked data",
                "Module 8's reviewer loop",
                "Output guardrail",
                "`Stop` hook, or check `ResultMessage` in code",
                "A review node"
              ],
              [
                "Whole run",
                "Runaway loops and spend",
                "`MAX_STEPS`, `MAX_COST_USD`",
                "`max_turns`",
                "`max_turns`, `max_budget_usd`, subagent depth and concurrency caps",
                "`recursion_limit`"
              ]
            ],
            "caption": "Guardrail placements, by framework. Checked against each project's docs in October 2026."
          }
        },
        "**OpenAI Agents SDK.** A guardrail is a function that returns a `GuardrailFunctionOutput`. If its `tripwire_triggered` is true, the run stops with an exception such as `OutputGuardrailTripwireTriggered`. The placement rules are strict ([[openai-agents-guardrails]]). Input guardrails run only for the *first* agent in a chain, and output guardrails only for the agent that produces the *final* output. In a multi-agent workflow, checks on every tool call need *tool* guardrails instead. Input guardrails also run in parallel with the agent by default, so a tripped guardrail may stop an agent that has already spent tokens or called tools. A blocking mode exists for when that matters.",
        {
          "code": "import re\n\nfrom agents import Agent, GuardrailFunctionOutput, RunContextWrapper, output_guardrail\n\nimport tools\nfrom handoff import Draft\n\nCITE = re.compile(r\"\\[([a-z0-9-]+#[a-z0-9-]+)\\]\")\n\n\n@output_guardrail\nasync def citations_were_retrieved(ctx: RunContextWrapper, agent: Agent,\n                                   output: Draft) -> GuardrailFunctionOutput:\n    unseen = sorted(set(CITE.findall(output.markdown)) - set(tools.RETRIEVED))\n    return GuardrailFunctionOutput(output_info={\"unseen\": unseen},\n                                   tripwire_triggered=bool(unseen))\n\n\nwriter = Agent(name=\"Writer\", instructions=WRITER, output_type=Draft,\n               output_guardrails=[citations_were_retrieved])",
          "title": "Lab 5's grounding check as an OpenAI SDK output guardrail (sketch)",
          "note": "In the topic 2 pipeline the writer is run on its own, so it produces the final output of its run and the guardrail fires. Catch `OutputGuardrailTripwireTriggered` around `Runner.run(writer, ...)` and treat it like a failed review."
        },
        "**Claude Agent SDK.** Here guardrails are built from *permissions* and *hooks* ([[claude-agent-sdk-hooks]]). Permission rules decide which tools exist and which need approval. Hooks are your functions, called at points such as `PreToolUse`. A `PreToolUse` hook can return a decision of `deny`, with a reason the model reads. A deny from any hook wins over every allow. One useful guardrail caps how many workers the orchestrator may start, because in this SDK the model chooses that number:",
        {
          "code": "from claude_agent_sdk import HookMatcher\n\nMAX_WORKERS = 5\nstarted = {\"n\": 0}\n\n\nasync def cap_workers(input_data, tool_use_id, context):\n    started[\"n\"] += 1\n    if started[\"n\"] > MAX_WORKERS:\n        return {\"hookSpecificOutput\": {\n            \"hookEventName\": input_data[\"hook_event_name\"],\n            \"permissionDecision\": \"deny\",\n            \"permissionDecisionReason\": f\"Limit of {MAX_WORKERS} subagents reached. \"\n                                        \"Write the briefing from the findings you have.\",\n        }}\n    return {}\n\n\noptions = ClaudeAgentOptions(..., hooks={\"PreToolUse\": [HookMatcher(matcher=\"Agent\", hooks=[cap_workers])]})",
          "title": "A PreToolUse hook that limits subagents (sketch)",
          "note": "The SDK also reads environment variables that cap subagent nesting depth and how many run at once. A cap on the total started is yours to write. See [[claude-agent-sdk-subagents]]."
        },
        "**LangGraph** has no feature called a guardrail. You build one from the parts in topics 1 and 3: a node that checks, a conditional edge that routes around a failure, an `interrupt()` for human approval, and `recursion_limit` as the ceiling on steps. LangChain's higher-level agent API offers guardrails as \"middleware\" built on top of these parts.",
        "**Tracing** comes built in too, and here the defaults differ in ways that matter for data handling:",
        {
          "list": [
            "**OpenAI Agents SDK:** tracing is **on by default** and sends traces to OpenAI's dashboard. It records model calls, tool calls, handoffs, and guardrails. You can turn it off, add your own trace processors, or send traces to third-party tools. The docs note that tracing is unavailable to organizations under a Zero Data Retention policy ([[openai-agents-tracing]]).",
            "**LangGraph:** traces go to LangSmith, a separate hosted service, once you set `LANGSMITH_TRACING=true` and an API key.",
            "**Claude Agent SDK:** exports OpenTelemetry traces, metrics, and logs to a collector you name in environment variables. By default, prompt text and tool inputs are left out of the export ([[claude-agent-sdk-hosting]])."
          ]
        },
        {
          "callout": "A guardrail configured in a framework is code, and code is enforced. A sentence in a prompt is a request. Keep Lab 3's rule: the hardest limits belong in the tool and the credential, such as a read-only connection or a write key the agent never holds. Framework guardrails are a second layer, not a substitute. And before you leave default tracing on, find out where the traces go and who can read them. They contain your prompts and your tool results.",
          "tone": "warning",
          "title": "Enforce in code, then check where the traces go"
        }
      ],
      "takeaway": "Framework guardrails are hooks placed before or after the agent, its tool calls, or its final answer; know exactly where each fires, keep the hardest limits in tools and credentials, and check where built-in tracing sends your data before you rely on it.",
      "check": [
        {
          "q": "You add an OpenAI SDK input guardrail to the Reviewer agent in a pipeline where the Researcher runs first in the same chain. Will it run?",
          "a": "No. Input guardrails run only for the first agent in a chain. To check what the Reviewer receives, run it as its own `Runner.run` call, as the topic 2 sketch does, or use tool guardrails on the calls that matter."
        },
        {
          "q": "Why does the subagent cap belong in a `PreToolUse` hook rather than in the orchestrator's system prompt?",
          "a": "The hook runs every time the model tries to start a subagent and can deny the call, so the limit holds even if the model ignores or misreads its instructions. A sentence in the prompt only asks the model to stop."
        },
        {
          "q": "Your university forbids sending student records to outside services without a contract. Which built-in tracing default should you check first?",
          "a": "The OpenAI Agents SDK's, because tracing is on by default and sends run data to OpenAI's dashboard. Either confirm the contract covers it, turn tracing off, or route traces to a processor the university controls. LangSmith tracing must be switched on, and the Claude SDK exports only to a collector you configure."
        }
      ],
      "readings": [
        "openai-agents-guardrails",
        "openai-agents-tracing",
        "claude-agent-sdk-hooks",
        "owasp-llm"
      ]
    },
    {
      "topic": "vendor-platforms",
      "blocks": [
        "Most organizations will not start by writing agents. They will start with the agent features their existing vendors are adding to products they already pay for: the service desk, the CRM, the office suite, the data warehouse, the cloud console. These products change every quarter, and their marketing names change faster. These notes deliberately name none of them. What does not change is how they are built.",
        "Every vendor agent platform is assembled from the same parts this course has built by hand. When you evaluate one, your job is to look behind the product, find each part, and ask two questions about it: **what can I see**, and **what can I control**?",
        {
          "table": {
            "head": [
              "Component",
              "Where you built it",
              "What to look for in the vendor's docs"
            ],
            "rows": [
              [
                "Model",
                "Lab 1",
                "Which model families it uses; whether you can choose one; whether the version is pinned, and whether you are told when it changes"
              ],
              [
                "Tools and connectors",
                "Labs 3, 6, 7",
                "Built-in connectors; whether you can add your own through an API, an OpenAPI file, or MCP; whose credentials each connector uses"
              ],
              [
                "Orchestration",
                "Labs 3, 8",
                "Single agent or several; whether you can see the plan and each step; step limits; what happens when a step fails"
              ],
              [
                "Data and context",
                "Lab 5",
                "What it indexes; where the index and conversations are stored, and in which region; retention; whether your data is used for training"
              ],
              [
                "Permissions",
                "Lab 7",
                "Whether it acts as the signed-in user or as a service account; whether it respects the product's existing roles; admin controls"
              ],
              [
                "Human approval",
                "Lab 7",
                "Which actions need confirmation; whether you can require it for more; whether approval is logged"
              ],
              [
                "Logging",
                "Labs 3, 4, 7",
                "Conversation logs and a tool-call audit trail; whether you can export them; how long they are kept"
              ],
              [
                "Evaluation",
                "Labs 2, 4, 5; Module 11",
                "A test console; an API to run your own eval set; any built-in quality metrics, and what they actually measure"
              ]
            ],
            "caption": "The eight parts behind any agent platform, and where to find them"
          }
        },
        "This table is the skeleton of Lab 9's **platform map**. Pick one platform and fill in a row for each component from its *public* documentation. For each row, write down what you can see, what you can control, and what is hidden. Graduate students cite the specific documentation page behind every row.",
        "Vendor documentation comes in layers, and the useful facts are rarely on the product page. Look in this order:",
        {
          "list": [
            "**The admin or configuration guide.** Permissions, connectors, approval settings, and limits are documented for the administrators who set them.",
            "**The security, trust, or compliance pages.** Data location, retention, encryption, training use, and certifications.",
            "**The developer or API reference.** Whether you can add tools, read logs, or run conversations from code. This decides whether you can run your own evaluation.",
            "**The audit log documentation.** Which events are recorded, at what detail, and how to export them.",
            "**The pricing or licensing page.** Per seat, per conversation, per action, or per unit of consumption. The unit shapes the bill more than the rate does (topic 6)."
          ],
          "ordered": true
        },
        {
          "code": "## Platform map: <product name>, as documented on <date>\n\n| Component | What we can see | What we can control | Hidden or unclear | Source |\n|---|---|---|---|---|\n| Model | | | | |\n| Tools and connectors | | | | |\n| Orchestration | | | | |\n| Data and context | | | | |\n| Permissions | | | | |\n| Human approval | | | | |\n| Logging | | | | |\n| Evaluation | | | | |\n\n## The three biggest unknowns, and who at the vendor could answer them",
          "title": "PLATFORM-MAP.md: a template for Lab 9",
          "note": "Date the map. A platform map is a snapshot of documentation that will change."
        },
        "Some parts are almost always hidden. You will rarely see the platform's system prompts, its orchestration logic, its retrieval ranking, or the exact model version on a given day. That is not automatically a reason to reject a product. It does mean you cannot debug those parts. It also means the evaluation row matters most: if you cannot see inside, you must be able to test from outside, with your own cases, repeatedly.",
        {
          "callout": "\"Enterprise-grade security\" and \"responsible AI built in\" are claims, not evidence. For each claim, ask which setting, log, or contract term implements it, and find that in the documentation. A row of your platform map that cites only marketing copy is an unknown, and you should label it as one.",
          "tone": "tip",
          "title": "Read like an auditor, not a buyer"
        }
      ],
      "takeaway": "Every vendor agent platform is built from the same eight parts as your own agents; map each part from the vendor's admin, security, API, audit, and pricing documentation, and record what you can see, what you can control, and what stays hidden.",
      "check": [
        {
          "q": "A platform's documentation says it \"uses the latest models.\" Which questions in the Model row does that leave unanswered, and why do they matter?",
          "a": "Which model, whether you can choose or pin it, and whether you are told when it changes. If the model changes silently, behavior can drift with no change on your side. That is the Module 2 regression-testing problem, and you need a way to detect it."
        },
        {
          "q": "Why does the Evaluation row matter more for a platform than for the agents you built yourself?",
          "a": "For your own agent you can read the prompts, the code, and the traces. For a platform those are mostly hidden, so the only evidence of quality comes from testing from the outside. If the platform offers no way to run your own eval set repeatedly, you cannot measure it."
        },
        {
          "q": "The platform's connector to the ticketing system acts as a shared administrator account. Which earlier lab does that conflict with, and what is the risk?",
          "a": "Lab 7, which gave the agent a read key and a separate write key under least privilege. A shared admin account means any user, or any injected instruction, can reach everything the admin can, and the audit log cannot tell who asked for what."
        }
      ],
      "readings": [
        "nist-rmf",
        "owasp-llm"
      ]
    },
    {
      "topic": "build-extend-buy",
      "blocks": [
        "Lab 9 ends with a memo: a **{{build-extend-buy|build, extend, or buy}}** recommendation for your Lab 8 pipeline in a named setting. These notes use a university IT department. Suppose the help desk wants briefings like Lab 8's, written from its own knowledge base for staff handling common requests. There are three ways to get them:",
        {
          "list": [
            "**Build.** Run your own code on a model API, hand-rolled or on a framework. You control everything and operate everything.",
            "**Extend.** Configure the agent features of a product the department already owns, such as its service-desk platform, and add what is missing: a connector, a custom action, an MCP server, a review step.",
            "**Buy.** License a new product that does the job. Fastest to start, least control, and one more vendor to manage."
          ]
        },
        "The decision turns on a handful of criteria. Each is a question you can answer with evidence, mostly from your platform map (topic 5) and your Lab 8 measurements:",
        {
          "table": {
            "head": [
              "Criterion",
              "Question for the memo",
              "Build",
              "Extend",
              "Buy"
            ],
            "rows": [
              [
                "Identity and permissions",
                "Does it sign in through the campus identity provider and respect existing roles?",
                "You integrate it",
                "Usually inherited from the product",
                "Varies; check the admin guide"
              ],
              [
                "Audit and logs",
                "Can security export every conversation and tool call to its own systems?",
                "Yes, you write them",
                "Depends on the product's audit features",
                "Often limited; check before signing"
              ],
              [
                "Your own evaluation",
                "Can you run the Module 11 eval set against it, repeatedly?",
                "Yes",
                "Only if it has an API or test console",
                "Only if it has an API"
              ],
              [
                "Where data lives",
                "Where are prompts, documents, and logs stored, for how long, and is any of it used for training?",
                "Where you put it",
                "In the product's tenant, under its terms",
                "In the new vendor's systems"
              ],
              [
                "{{vendor-lock-in|Lock-in}}",
                "What would leaving cost: code, data, logs, staff skills?",
                "Lowest, if you kept prompts, tools, and evals portable",
                "Tied to a product you already depend on",
                "Highest; a new dependency"
              ],
              [
                "Pricing model",
                "Per seat, per conversation, per action, or per token, and how does it grow with use?",
                "Tokens plus hosting plus staff time",
                "Add-on license or consumption units",
                "Subscription, often per seat"
              ],
              [
                "What you already own",
                "Licenses, integrations, and staff skills already paid for",
                "Your team's skills",
                "Often the strongest argument",
                "Usually nothing"
              ]
            ],
            "caption": "Build, extend, or buy: the criteria from the topic list, in one table"
          }
        },
        "The setting changes the weights. A university handles student records covered by {{ferpa|FERPA}}, so \"where data lives\" and \"audit and logs\" can veto an option on their own, however well it scores elsewhere. Module 12 covers the privacy rules. For this memo it is enough to say which option satisfies them, and to cite the document that shows it.",
        "**Cost over three years.** The graduate version of the lab adds a three-year estimate for each option. The structure matters more than the precision. Use your own measurements where you have them, and label every assumption:",
        {
          "code": "Build   = build hours x loaded hourly rate\n        + 36 x (maintenance hours per month x rate)\n        + 3 x (runs per year x measured cost per run)          <- from Lab 8's summary.json\n        + 36 x (hosting + monitoring per month)\n\nExtend  = 36 x (add-on license or consumption per month)\n        + configuration and connector hours x rate\n        + 36 x (admin hours per month x rate)\n\nBuy     = 36 x (subscription per month)\n        + implementation and integration hours x rate\n        + exit cost (exporting data and logs, retraining staff)",
          "title": "A three-year cost structure",
          "note": "Illustrative structure only. Take license and consumption prices from the vendor's pricing page, and model costs from [[claude-pricing]] together with your own measured cost per run. Do not use numbers you remember."
        },
        "Do the arithmetic once and something usually stands out. In an illustrative case, a briefing that measured $0.20 per run in Lab 8, run 2,000 times a year, is $400 a year in model usage. That is small next to the staff hours needed to build and maintain anything. Model tokens are rarely the deciding cost for internal tools at this scale. People's time and license terms usually are.",
        "A good memo is short and makes a decision. One structure that works:",
        {
          "list": [
            "**Recommendation**, in one sentence, with the option and the setting.",
            "**Requirements** the setting imposes, such as campus single sign-on, FERPA-compliant storage, exportable audit logs, and running the eval set.",
            "**Options considered**, with the criteria table filled in and a source for every cell.",
            "**Three-year cost** (graduate students), with assumptions labeled.",
            "**Risks and the exit plan**: what would make you switch, and what switching would cost.",
            "**What would change the recommendation**, such as a product adding an evaluation API or a price change."
          ],
          "ordered": true
        },
        {
          "callout": "\"Extend\" often wins in practice, and for good reasons: identity, permissions, and data agreements are already in place. But extend the product only after your platform map shows you can test it and read its logs. Otherwise you have bought a black box with a familiar logo.",
          "tone": "aside",
          "title": "Extend is the common answer, not the default"
        }
      ],
      "takeaway": "Decide build, extend, or buy with evidence on identity, audit logs, your own evaluation, data location, lock-in, the pricing model, and what the organization already owns; cost all three options over the same period, and expect staff time and license terms, not tokens, to dominate.",
      "check": [
        {
          "q": "The service-desk vendor's agent add-on scores well on cost and identity but offers no way to export tool-call logs. Can you still recommend it for the university help desk?",
          "a": "Only with that gap stated and accepted by whoever owns security and compliance. Without exportable logs, nobody can reconstruct what the agent did with student records, which may conflict with the university's FERPA and audit duties. A reasonable memo recommends against it, or makes the purchase conditional on the feature."
        },
        {
          "q": "Why does the per-run cost from Lab 8 matter more for the Build option than for Buy?",
          "a": "Under Build you pay for model usage directly, so measured runs times measured cost per run is a real line in the estimate. Under Buy the vendor's price unit, such as seats or conversations, sets the cost, and your per-run token cost is hidden inside it."
        },
        {
          "q": "Name two things you can do while building that lower vendor lock-in later.",
          "a": "Keep prompts, schemas, and eval sets in your own repository in plain formats. Expose tools through MCP servers rather than a framework-specific tool format, so another client can use them. Exporting traces in an open format such as OpenTelemetry also helps."
        }
      ],
      "readings": [
        "claude-pricing",
        "nist-rmf"
      ]
    },
    {
      "topic": "selection-criteria",
      "blocks": [
        "Topic 6 chose between building, extending, and buying. If the answer is build, a second choice remains: hand-rolled code, a graph framework, or a vendor SDK. Lab 9's one-page comparison is your evidence for that choice. Four criteria from the topic list carry most of the weight. A fifth, maturity, is easy to forget until it bites.",
        {
          "table": {
            "head": [
              "Criterion",
              "Ask",
              "Hand-rolled",
              "Graph framework",
              "Vendor agent SDK"
            ],
            "rows": [
              [
                "Team skills",
                "Who will maintain this in a year, and what do they already know?",
                "Plain Python; anyone who did Labs 3 to 8",
                "New concepts: state, reducers, super-steps",
                "New concepts, plus the vendor's harness and permission model"
              ],
              [
                "Hosting",
                "Where does it run, and what does it need?",
                "Any Python process",
                "Any Python process; a database if you checkpoint",
                "May need the vendor's runtime; the Claude Agent SDK runs a Claude Code process per session"
              ],
              [
                "Observability",
                "Can you see every model call, tool call, and cost, in your own systems?",
                "Your traces, your format",
                "Through the framework's tracing service, or your own code",
                "Built in, but check where the data goes (topic 4)"
              ],
              [
                "Portability",
                "How hard is it to change model provider or framework?",
                "Easy to change, since everything is yours",
                "The model can change; the orchestration is tied to the framework",
                "Often tied to one provider's models or tools"
              ],
              [
                "Maturity",
                "How often do releases break your code?",
                "Only when you change it",
                "Frequent releases; pin versions",
                "Frequent releases; pin versions"
              ]
            ],
            "caption": "Choosing how to build. General tendencies; your Lab 9 evidence outranks this table."
          }
        },
        "**Maturity is not hypothetical.** While these notes were being written, the Claude Agent SDK's subagent tool was reported as `Agent` in some places and `Task` in others, depending on the version. LangGraph's docs had started recommending a newer streaming method over the older one. Neither change is a problem if you pin versions with `pip freeze > requirements.txt`, as every lab has, and read the changelog before you upgrade. Both are a problem if you do not.",
        "Lab 9's comparison asks for four measurements. Make each one concrete:",
        {
          "list": [
            "**Lines of code.** Count the same files the same way for both versions, and say what you counted. The script below skips blank lines and comment lines. Prompts count as code; Module 2 established that.",
            "**Debuggability.** Do not just say \"easier.\" Plant one bug in both versions, such as a researcher prompt that drops the quote field, and time how long it takes to find it from the traces. Write down which tool showed you the cause.",
            "**Features gained.** Only count features you actually used and tested: checkpoints you resumed from, a trace view you read, a guardrail that fired.",
            "**Anything lost.** Control you gave up, behavior that changed, and costs that moved. For example, the Claude SDK version may start a different number of researchers on each run."
          ]
        },
        {
          "code": "import pathlib\nimport sys\n\n\ndef loc(path: str) -> int:\n    \"\"\"Non-blank lines that are not whole-line comments.\"\"\"\n    lines = pathlib.Path(path).read_text(encoding=\"utf-8\").splitlines()\n    return sum(1 for line in lines if line.strip() and not line.strip().startswith(\"#\"))\n\n\ntotal = 0\nfor p in sys.argv[1:]:\n    n = loc(p)\n    total += n\n    print(f\"{n:>5}  {p}\")\nprint(f\"{total:>5}  total\")\n\n# then, in PowerShell:\n# python loc.py ..\\agentic-lab08\\pipeline.py ..\\agentic-lab08\\roles.py handoff.py\n# python loc.py graph_pipeline.py roles.py handoff.py",
          "title": "loc.py: count lines the same way for both versions"
        },
        "Portability deserves its own strategy, because it is the criterion most often regretted later. The course's design already gives you most of it. Keep these in your own repository, in formats you own, whatever you build on:",
        {
          "list": [
            "**Tools as MCP servers** (Module 6), so any client or framework can call them.",
            "**Prompts and handoff schemas** as versioned files and Pydantic classes (Module 2 and Module 8).",
            "**Eval sets and graders** (Module 11), so you can measure a new framework against the old one on day one.",
            "**Traces in an open format.** OpenTelemetry has semantic conventions for generative AI that several tools already export ([[otel-genai]]). They are still evolving, so treat them as a direction to follow rather than a finished standard."
          ]
        },
        "A useful last test is the **exit question**: if this framework or vendor disappeared next month, what would you rewrite, what would you lose, and how long would it take? If the honest answer is \"the orchestration, in a week, losing nothing,\" the choice is low-risk. If it is \"everything, and the logs are gone,\" say so in your memo.",
        {
          "callout": "Nothing in Lab 9 requires the framework to win. A comparison that concludes \"the hand-rolled pipeline is 140 lines, I can debug it in minutes, and the only feature I would gain is checkpointing, which my run folder already gives me\" is a strong engineering result. So is the opposite conclusion, if your measurements support it.",
          "tone": "aside",
          "title": "Evidence over preference"
        }
      ],
      "takeaway": "Choose how to build by team skills, hosting, observability, portability, and maturity, measured on your own port rather than taken from feature lists, and keep tools, prompts, evals, and traces in formats you own so the choice stays reversible.",
      "check": [
        {
          "q": "Your LangGraph version is 30% fewer lines than your hand-rolled pipeline. Why is that alone not enough to recommend it?",
          "a": "Lines of code are one criterion. You also need to know whether the team can maintain the framework, how hard it is to debug, what you gained and lost, and how portable it is. Fewer lines that nobody on the team understands can cost more over the life of the system."
        },
        {
          "q": "How would you measure debuggability rather than just asserting it?",
          "a": "Plant the same bug in both versions, for example a researcher prompt that omits the `quote` field, then time how long it takes to locate the cause from each version's traces and errors, and note which tool or view revealed it."
        },
        {
          "q": "Which three things should you keep in your own repository, whatever framework you choose, to keep the choice reversible?",
          "a": "Any three of: tools exposed as MCP servers, versioned prompts and handoff schemas, eval sets with their graders, and traces in an open format. With those, a new framework can be tested against the old one immediately."
        }
      ],
      "readings": [
        "langgraph",
        "openai-agents-sdk",
        "claude-agent-sdk",
        "otel-genai"
      ]
    }
  ]
};
