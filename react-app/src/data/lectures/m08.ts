import type { LectureNotesDef } from "../types";

// Module 8 — Multi-agent orchestration patterns: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M08_NOTES: LectureNotesDef = {
  "moduleId": "m08",
  "intro": "These notes go with the Module 8 lecture and Lab 8. The running example is the Lab 8 pipeline: a researcher, a writer, and a reviewer that together produce a one-page resident briefing from the Maple Falls handbook you indexed in Lab 5. Each section shows one pattern in that pipeline and asks the same question: does it earn its extra cost compared with the single agent you already have? Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "chaining-routing",
      "blocks": [
        "Module 3 drew a line between workflows and agents. In a workflow, your code decides the order of the steps. In an {{agent}}, the model decides. Multi-agent systems sound like they belong entirely on the agent side, but most of the ones that work well in practice are mostly workflow, with agents only where the path really cannot be known in advance. Three workflow patterns from [[building-effective-agents]] cover a large share of real designs: chaining, routing, and parallelization.",
        "Lab 8 asks for a pipeline with at least three roles. The running example in these notes is a **resident briefing**: a one-page guide, written from the Maple Falls handbook you indexed in Lab 5, for a resident planning a Saturday evening party with a DJ at the Riverside Park pavilion. A good briefing pulls facts from three documents: pavilion reservations, the noise ordinance, and trash rules. It must also notice what the handbook does *not* say. For example, the handbook says alcohol needs a special event permit from the Clerk's Office, but it never says what that permit costs.",
        {
          "code": "agentic-lab08\\              <- a copy of agentic-lab05: docs\\, build_index.py, tools.py, agent.py\n  handoff.py                <- the Pydantic classes passed between roles (topic 3)\n  roles.py                  <- one function per role: plan, research, write, review\n  pipeline.py               <- build_briefing(): runs the roles, in parallel where it can\n  baseline.py               <- the Lab 5 agent, asked for the same briefing in one loop\n  compare.py                <- quality, cost, and time for both versions (topic 6)\n  tests\\briefing_facts.json  <- the facts a correct briefing must contain\n  runs\\<run_id>\\             <- every handoff, saved as a file (topic 3)\n  traces\\                    <- one JSON Lines trace per role call, as in Lab 3",
          "title": "One reasonable Lab 8 layout",
          "note": "Lab 8 has no step-by-step script, so you choose the names. These notes use the ones above. Start the folder the same way Lab 5 started: `robocopy ..\\agentic-lab05 . /E /XD .git .venv traces results __pycache__ /XF .env`, then a new virtual environment and `pip install -r requirements.txt`."
        },
        "Each role is still the Lab 3 loop. The only change to `agent.py` is that `run()` now takes the system prompt and the tool list as arguments, so one loop can play several roles:",
        {
          "code": "def run(task: str, trace: Trace, system: str = SYSTEM, tools: list = TOOLS) -> str:\n    ...\n        response = client.messages.create(\n            model=MODEL, max_tokens=1024, temperature=0,\n            system=system, tools=tools, messages=messages,\n        )\n    ...\n# pass system and tools on to finish() as well, so the graceful finish uses the same role",
          "title": "agent.py: the one change Lab 8 needs (excerpt)",
          "note": "The defaults keep `python agent.py \"...\"` working exactly as it did in Lab 5."
        },
        "**{{prompt-chaining|Prompt chaining}}** splits a task into fixed steps, where each step works on the output of the one before. Lab 8's chain is plan, then research, then write, then review. Chaining trades a little latency for accuracy: each call has one narrow job, and a narrow job is easier to prompt and easier to test.",
        "The real strength of a chain is the **gate**: ordinary code that runs between two steps and refuses to continue if the output is not good enough. After research, Lab 8 can check every finding before the writer ever sees it:",
        {
          "code": "def check_notes(notes: ResearchNotes, retrieved: set[str], chunks: dict[str, str]) -> list[str]:\n    \"\"\"Gate between research and writing. Returns problems; an empty list means pass.\"\"\"\n    problems = []\n    for f in notes.findings:\n        if f.source_id not in retrieved:\n            problems.append(f\"{f.source_id}: cited but never returned by a search\")\n        elif \" \".join(f.quote.split()) not in \" \".join(chunks[f.source_id].split()):\n            problems.append(f\"{f.source_id}: quote does not appear in that passage\")\n    return problems",
          "title": "roles.py: a gate is plain code between two model steps",
          "note": "`retrieved` is the set of ids from `tools.RETRIEVED` (Lab 5). `chunks` maps each id to its text; build it once from `collection.get()`."
        },
        "**{{routing|Routing}}** classifies an input first, then sends it to the handler built for that kind of input. Not every resident question deserves a four-role pipeline. A one-fact question (\"What day is trash pickup in ward 3?\") is better answered by the Lab 5 agent alone, and a question the handbook cannot answer should be declined at once. A router is a Module 2 single call with a closed set of answers, so it can run on the smallest model tier:",
        {
          "code": "from typing import Literal\nfrom pydantic import BaseModel\n\n\nclass Route(BaseModel):\n    kind: Literal[\"fact\", \"briefing\", \"out_of_scope\"]\n\n\ndef route(question: str) -> str:\n    response = client.messages.parse(\n        model=ROUTER_MODEL,          # a Haiku-tier model id\n        max_tokens=50,\n        system=ROUTER_PROMPT,        # defines the three kinds, with one example of each\n        messages=[{\"role\": \"user\", \"content\": question}],\n        output_format=Route,\n    )\n    return response.parsed_output.kind\n\n\nkind = route(question)\nif kind == \"fact\":\n    answer = run(question, Trace(\"traces/fact.jsonl\"))      # the Lab 5 agent\nelif kind == \"briefing\":\n    answer = build_briefing(question).markdown              # the Lab 8 pipeline\nelse:\n    answer = \"The handbook does not cover this.\"",
          "title": "A router: one cheap classification, then ordinary branching"
        },
        "**Parallelization** runs independent model calls at the same time and combines the results in code. It comes in two forms. **Sectioning** splits the work into different pieces, like one researcher per subtopic. **Voting** runs the *same* task several times and compares the answers, like asking three reviewers and flagging a sentence if any of them objects. In Lab 8 the researchers do not depend on each other, so they can run side by side. This is a {{fan-out|fan-out}}:",
        {
          "code": "from concurrent.futures import ThreadPoolExecutor\n\nMAX_WORKERS = 5\n\nwith ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:\n    notes = list(pool.map(lambda s: research(question, s, run_dir), plan.subtopics))",
          "title": "pipeline.py: run the researchers side by side",
          "note": "Threads are enough here: each worker spends almost all of its time waiting on the network. Each worker writes its own trace file, so traces never interleave."
        },
        {
          "table": {
            "head": [
              "Pattern",
              "In Lab 8",
              "Use it when",
              "Watch out for"
            ],
            "rows": [
              [
                "Chaining",
                "plan, research, write, review",
                "The task splits cleanly into fixed steps",
                "Errors carry forward. Gate each step in code."
              ],
              [
                "Routing",
                "fact, briefing, or out of scope",
                "Inputs fall into distinct kinds that need different handling",
                "A wrong route sends the input down the wrong path silently. Log every route and test the router."
              ],
              [
                "Parallelization",
                "one researcher per subtopic",
                "Subtasks do not depend on each other",
                "It saves time, not tokens. Every worker is billed."
              ]
            ],
            "caption": "Three workflow patterns, and where each appears in the pipeline"
          }
        },
        {
          "callout": "Everything in this section is still on the workflow side of the {{decision-ladder|decision ladder}}: your code fixes the order of steps. The researchers are small agents inside that structure, because how many searches a subtopic needs depends on what each search returns. That mix, a workflow outside with agents only where needed, is the default to aim for.",
          "tone": "tip",
          "title": "Workflow on the outside, agents on the inside"
        }
      ],
      "takeaway": "Chaining, routing, and parallelization are workflow patterns your code controls: chain narrow steps with code gates between them, route each input to the cheapest handler that fits, and run independent work in parallel to save time, though not tokens.",
      "check": [
        {
          "q": "A router misclassifies \"What does a mattress pickup cost?\" as a briefing. What does that cost you, and how would you notice?",
          "a": "The question runs through four roles instead of one agent, so it costs several times more and takes longer, though the answer is probably still right. You notice only if every route is logged and you review the routes, or if the router is tested on a small labeled set of questions like any Module 2 classifier."
        },
        {
          "q": "Why is `check_notes` written in Python rather than given to the writer as an instruction such as \"only use findings with valid quotes\"?",
          "a": "An instruction is a request the model may not follow. Code always runs and gives the same answer for the same input. The gate also stops the chain before the writer's tokens are spent on bad notes."
        },
        {
          "q": "You run four researchers in parallel instead of one after another. What happens to total tokens, cost, and wall-clock time?",
          "a": "Total tokens and cost stay about the same, because each researcher does the same work either way. Wall-clock time for the research stage drops from the sum of the four to roughly the time of the slowest one."
        }
      ],
      "readings": [
        "building-effective-agents",
        "anthropic-api"
      ]
    },
    {
      "topic": "orchestrator-workers",
      "blocks": [
        "In topic 1 the subtopics were a fixed list. Real questions do not come with one. \"Can I put up a 7-foot fence?\" needs one subtopic. \"I'm hosting a party with a DJ and drinks at the pavilion\" needs four. The **{{orchestrator-workers|orchestrator–workers}}** pattern handles this. One component, the orchestrator, reads the input and decides at run time how to split the work. It hands each piece to a worker, then combines what comes back.",
        "The difference from plain parallelization is who writes the task list. With sectioning, you wrote it in advance. With an orchestrator, the model writes it for each input. In Lab 8 the orchestrator is the `plan` role, and the combining step is the `write` role.",
        {
          "code": "from pydantic import BaseModel, Field\n\n\nclass Plan(BaseModel):\n    subtopics: list[str] = Field(\n        min_length=1, max_length=5,\n        description=\"Independent questions a researcher can answer from the handbook alone\",\n    )\n\n\ndef plan(question: str, trace: Trace) -> Plan:\n    response = client.messages.parse(\n        model=MODEL, max_tokens=400, system=PLANNER,\n        messages=[{\"role\": \"user\", \"content\": question}],\n        output_format=Plan,\n    )\n    log_usage(trace, \"plan\", response.usage)       # same fields as Lab 3's model events\n    p = response.parsed_output\n    p.subtopics = p.subtopics[:MAX_WORKERS]         # a ceiling in code, not only in the prompt\n    return p",
          "title": "roles.py: the orchestrator is one structured call",
          "note": "As Module 2 explained, rules such as `max_length` are checked after the call rather than enforced while the model writes. The slice is the guarantee."
        },
        "**Delegation is the hard part.** Anthropic's write-up of its multi-agent research system ([[multi-agent-research]]) reports that vague worker instructions led to duplicated work and gaps, and that early versions spawned 50 subagents for simple queries. Their fix was to give every worker four things. The Lab 8 researcher's task message carries all four:",
        {
          "list": [
            "**An objective.** One subtopic, plus the resident's original question so the worker knows why it matters.",
            "**An output format.** The `ResearchNotes` class from `handoff.py` (topic 3), with a verbatim quote and a passage id for every finding.",
            "**Tool guidance.** Use `search_handbook`, search again with other words if the passages do not answer, and do not do arithmetic in your head.",
            "**Boundaries.** Stay on your subtopic. Do not write the briefing. If the handbook is silent, put that in `gaps` instead of guessing."
          ]
        },
        "A related design is the **supervisor**. Here the orchestrator is itself an agent in a loop. It calls each specialist as if it were a tool, reads the result, and decides who to call next, possibly the same specialist again. The OpenAI Agents SDK calls this *agents as tools*. In the Claude Agent SDK the specialists are *{{subagent|subagents}}* (Module 9). A supervisor is more flexible than Lab 8's fixed chain, and it is also harder to predict and to test.",
        {
          "table": {
            "head": [
              "",
              "Code orchestrates (Lab 8)",
              "Model orchestrates (supervisor)"
            ],
            "rows": [
              [
                "Who picks the next step",
                "Your Python, in a fixed order",
                "The supervisor model, each turn"
              ],
              [
                "Number of model calls",
                "Known up to the number of subtopics and review rounds",
                "Unknown until the run ends"
              ],
              [
                "Cost and latency",
                "Predictable; easy to budget",
                "Variable; needs budgets enforced in code"
              ],
              [
                "Debugging",
                "Read the code, then the trace of one role",
                "Read the supervisor's trace to learn why it chose each step"
              ],
              [
                "Good for",
                "Tasks whose stages are known",
                "Tasks where the stages themselves depend on what is found"
              ]
            ],
            "caption": "Two places to put orchestration"
          }
        },
        "The OpenAI Agents SDK documentation makes the same point. Orchestrating through code, it says, makes tasks \"more deterministic and predictable, in terms of speed, cost and performance,\" and the two styles can be mixed ([[openai-agents-multi-agent]]). Lab 8 mixes them: code orchestrates the stages, and each researcher is a small agent that decides its own searches.",
        {
          "callout": "An orchestrator that decides how many workers to start is deciding how much to spend. Put three ceilings in code: the most workers per run (`MAX_WORKERS`), the most steps and dollars per worker (Lab 4's `MAX_STEPS` and `MAX_COST_USD`, which each `run()` call still enforces), and a total for the whole pipeline. The prompt can describe effort levels. Only code can enforce them.",
          "tone": "warning",
          "title": "The orchestrator controls the bill"
        }
      ],
      "takeaway": "Use an orchestrator when the list of subtasks depends on the input; give every worker an objective, an output format, tool guidance, and boundaries; and enforce the number of workers and their budgets in code.",
      "check": [
        {
          "q": "What is the difference between Lab 8's planner and the sectioning example in topic 1, if both end up running researchers in parallel?",
          "a": "Who decides the subtopics. With sectioning you wrote the list in advance. With the planner the model writes the list for each question at run time, so a one-fact question gets one researcher and a party question gets four."
        },
        {
          "q": "A researcher's brief says only \"Research noise rules.\" Name two things likely to go wrong.",
          "a": "It may research all noise rules, including construction hours, and duplicate or miss what the other workers cover, because it has no boundaries. It may return prose in some shape the writer cannot use, because it has no output format. It also does not know the resident's real question, so it cannot judge what matters."
        },
        {
          "q": "Why does a supervisor design need budgets enforced in code even more than Lab 8 does?",
          "a": "Lab 8's number of calls is bounded by its fixed stages and `MAX_WORKERS`. A supervisor decides each turn whether to call another specialist, so the number of calls has no natural limit. Without a step and dollar ceiling in code, a confused supervisor can loop until the account runs dry."
        }
      ],
      "readings": [
        "building-effective-agents",
        "multi-agent-research",
        "openai-agents-multi-agent"
      ]
    },
    {
      "topic": "handoffs",
      "blocks": [
        "A **{{handoff}}** is the point where one role passes work to the next. Most multi-agent failures happen at these boundaries, not inside a role. A researcher finds the right fact and the writer never sees it. Or the writer sees a paraphrase that has drifted from the source. Or two workers make different assumptions and nobody reconciles them.",
        "The word has two meanings, and it helps to keep them apart:",
        {
          "list": [
            "**A data handoff** passes a result from one stage to the next. Lab 8 is built from these: research notes go to the writer, and the draft goes to the reviewer.",
            "**A control handoff** passes the *conversation* to another agent, which then talks to the user directly. The OpenAI Agents SDK uses the word this way. A triage agent hands a customer to a billing agent, and the model sees each possible handoff as a tool named like `transfer_to_billing_agent` ([[openai-agents-handoffs]])."
          ]
        },
        "Lab 8 asks for \"a clear handoff format.\" Treat it exactly like the Module 2 extraction contract: a {{pydantic-class|Pydantic class}} that the sender must produce and the receiver validates. Then a malformed handoff fails loudly at the boundary, instead of quietly confusing the next role.",
        {
          "code": "\"\"\"handoff.py: the contracts between Lab 8 roles. Changing this file changes the pipeline.\"\"\"\nfrom typing import Literal\n\nfrom pydantic import BaseModel, ConfigDict\n\n\nclass Finding(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    claim: str          # one fact, in plain words\n    source_id: str      # the passage id from search_handbook, e.g. noise-ordinance#amplified-sound-permits\n    quote: str          # the exact words from that passage that support the claim\n\n\nclass ResearchNotes(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    subtopic: str\n    findings: list[Finding]\n    gaps: list[str]     # what the handbook does not say; never filled with a guess\n\n\nclass Draft(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    markdown: str       # every factual sentence ends with [doc#section]\n\n\nclass Problem(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    sentence: str\n    issue: Literal[\"unsupported\", \"contradicts_source\", \"missing_citation\", \"wrong_citation\"]\n    source_id: str | None\n\n\nclass Review(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    problems: list[Problem]   # empty means the draft passes",
          "title": "handoff.py: the handoff format, as code",
          "note": "No field has a default value, so every field is required. That also keeps the classes usable with the strict schema modes some SDKs apply to structured output, which matters when you port the pipeline in Module 9."
        },
        "Four rules make a handoff format hold up:",
        {
          "list": [
            "**Pass evidence, not paraphrase.** A `Finding` carries the passage id and a verbatim quote. The writer and the reviewer can both check the claim against the source. Anthropic's research system calls the alternative a \"game of telephone\": each retelling drifts a little further from what the source said ([[multi-agent-research]]).",
            "**Make gaps a field.** If `gaps` exists, \"the handbook does not give a fee for the special event permit\" has a place to go. Without it, a helpful model fills the silence with a plausible number.",
            "**Send what the receiver needs, and no more.** The writer needs the findings and the original question. It does not need the researcher's 14 searches. Smaller handoffs cost fewer tokens and are easier to check.",
            "**Validate at every boundary.** `ResearchNotes.model_validate_json(raw)` on the way in. A failed validation is a researcher bug, and it should be caught there, not by the reviewer three steps later."
          ]
        },
        "There is a real tension in the third rule. Cognition's engineering post \"Don't Build Multi-Agents\" ([[dont-build-multi-agents]]) argues the opposite: share context, and share full agent traces, not just individual messages. Its example is a game split between two subagents, where one builds a background in one visual style and the other builds a character in a different one. Each worker made reasonable choices, and the choices conflicted. The lesson for Lab 8 is that every worker gets the resident's **original question**, not only its subtopic, so all of them aim at the same party.",
        "**Shared state** is the other half of this topic. Roles can pass messages directly, or they can read and write a common store. Lab 8 does both: the handoff classes are the messages, and the run folder is the store.",
        {
          "table": {
            "head": [
              "",
              "Message passing",
              "Shared state (the run folder)"
            ],
            "rows": [
              [
                "How it works",
                "Each role returns an object; the orchestrator passes it on",
                "Each role writes `runs/<run_id>/notes_noise.json`, `draft_1.md`, `review_1.json`; the next role reads them"
              ],
              [
                "Good at",
                "Simple, typed, easy to follow in code",
                "Inspection after the fact, re-running one stage, and resuming a crashed run (Module 9)"
              ],
              [
                "Risk",
                "Lost when the process dies",
                "Two workers writing the same file. Give each worker its own file."
              ]
            ],
            "caption": "Two ways for roles to share work"
          }
        },
        {
          "callout": "In a control handoff, the receiving agent usually sees the whole conversation so far, including tool results it was never meant to handle. The OpenAI SDK, for example, passes the full history by default and offers input filters to trim it. Before you add a control handoff, ask two questions. What will the receiving agent see? And which tools can it call with what it sees? Module 12 treats this as an attack surface.",
          "tone": "warning",
          "title": "A handoff moves data and permissions together"
        }
      ],
      "takeaway": "Design each handoff as a validated contract that carries evidence (ids and quotes), states its gaps, and holds what the next role needs, and give every worker the original question so their choices do not conflict.",
      "check": [
        {
          "q": "Why does a `Finding` carry a verbatim `quote` when it already has a `source_id`?",
          "a": "The quote lets code check, without any model, that the claim's wording really appears in the cited passage (the `check_notes` gate in topic 1). A source id alone shows only where the researcher looked, not what it read there."
        },
        {
          "q": "The researcher returns notes with a finding about a special event permit fee of $50, quoting text that is not in the handbook. Where should this be caught, and by what?",
          "a": "At the research-to-writing boundary, by code: the quote does not appear in the cited passage, so `check_notes` fails. Catching it there is cheaper than letting the writer use it and hoping the reviewer notices."
        },
        {
          "q": "Give one advantage and one risk of writing every handoff to `runs/<run_id>/` instead of only passing Python objects.",
          "a": "Advantage: you can open any stage's input and output after the run, re-run one stage alone, or resume a run that crashed. Risk: concurrent writers can overwrite each other, which is why each researcher writes its own file."
        }
      ],
      "readings": [
        "multi-agent-research",
        "dont-build-multi-agents",
        "openai-agents-handoffs"
      ]
    },
    {
      "topic": "evaluator-optimizer",
      "blocks": [
        "In an **{{evaluator-optimizer}}** loop, one model call produces a result, another checks it against stated criteria and returns specific feedback, and the first revises. Lab 8's writer and reviewer form this loop. [[building-effective-agents]] gives two conditions for it to pay off. There must be **clear evaluation criteria**, and the feedback must **measurably improve** the result. Without both, the loop costs more and does not get better.",
        "The idea has research behind it. Reflexion ([[reflexion]]) had agents write a short reflection on each failed attempt, keep it in memory, and try again. No model weights changed. On a coding benchmark where the feedback came from running tests, that loop reached a 91% pass rate. Notice where the signal came from: real tests. A loop is only as good as the evaluator in it.",
        "For the resident briefing, the criteria can be written so that each one is checkable:",
        {
          "list": [
            "Every sentence that states a fact ends with a passage id in square brackets, such as `[parks-reservations#cancellations-and-refunds]`.",
            "Every cited id exists in the index and was returned by a search in this run (Lab 5's \"valid\" and \"grounded\" checks).",
            "The cited passage actually supports the sentence: the amount, the time, and the condition all match.",
            "No two sentences contradict each other or the handbook. A classic trap: quiet hours begin at 11 PM on Saturday, but parks close at 10 PM, so the music has to stop by 10.",
            "Gaps are stated as gaps. \"The handbook does not list a fee for the special event permit\" passes. A dollar figure fails."
          ],
          "ordered": true
        },
        "Split those criteria by who can check them. The first two are exact, so code checks them, for free and every time. The third and fourth need judgment, so a reviewer model checks them, using the `Review` class from topic 3. The fifth is partly both. Running code first means the reviewer's tokens go only to drafts that passed the cheap checks.",
        {
          "code": "MAX_ROUNDS = 2\n\n\ndef write_and_review(question, notes, run_dir):\n    draft = write(question, notes, feedback=[], run_dir=run_dir, round_no=1)\n    for round_no in range(1, MAX_ROUNDS + 1):\n        problems = citation_problems(draft, notes)              # code: ids exist and were retrieved\n        if not problems:\n            review = review_draft(draft, notes, run_dir, round_no)  # model: support and contradictions\n            problems = [f\"{p.issue}: {p.sentence}\" for p in review.problems]\n        if not problems:\n            return draft, \"pass\"\n        if round_no == MAX_ROUNDS:\n            return draft, f\"unresolved: {len(problems)} problems\"   # report it; do not hide it\n        draft = write(question, notes, feedback=problems, run_dir=run_dir, round_no=round_no + 1)",
          "title": "pipeline.py: the review loop, with a hard limit",
          "note": "The status travels with the draft. A briefing marked \"unresolved\" goes to a person, as Module 7's {{escalation|escalation}} rules would require. It does not go out as if it had passed."
        },
        "The reviewer's prompt matters as much as the writer's. It should receive the **draft and the same findings the writer had**, not the writer's reasoning, and it should be told to report problems, not to rewrite. A reviewer that rewrites has become a second writer, and nobody checks it.",
        {
          "table": {
            "head": [
              "Pitfall",
              "What you see",
              "Defense"
            ],
            "rows": [
              [
                "Shared blind spots",
                "Writer and reviewer make the same mistake, so the reviewer approves it",
                "Give the reviewer evidence, not the writer's reasoning. A different prompt, and sometimes a different model tier, helps."
              ],
              [
                "Vague feedback",
                "\"Improve accuracy\" comes back; the next draft is no better",
                "Require the `Problem` shape: the sentence, the issue type, the source."
              ],
              [
                "Fix one, break another",
                "Round 2 fixes the fee and drops the cancellation policy",
                "Re-run every check on every round, not only the failed ones."
              ],
              [
                "Never satisfied, or always satisfied",
                "Every draft fails, or every draft passes",
                "Calibrate the reviewer on a few known-good and known-bad drafts first. Module 11 does this properly with {{llm-as-judge|LLM-as-judge}} graders."
              ],
              [
                "Cost creep",
                "Each round re-sends the notes and the draft",
                "Cap rounds. Most of the gain is usually in the first revision."
              ]
            ],
            "caption": "How evaluator–optimizer loops go wrong"
          }
        },
        {
          "callout": "Sometimes the best evaluator is not a model at all. If a check can be written in code, such as \"every cited id was retrieved\" or \"the total matches the calculator\", write it in code. The loop then has a signal that never drifts, the way Reflexion's coding results rested on real tests.",
          "tone": "tip",
          "title": "Prefer a checkable signal"
        }
      ],
      "takeaway": "An evaluator–optimizer loop helps only when the criteria are explicit and the feedback is specific. Check what code can check first, have the reviewer report problems against evidence, cap the rounds, and send unresolved drafts to a person.",
      "check": [
        {
          "q": "Why does the loop run `citation_problems` before calling the reviewer model, and not the other way round?",
          "a": "The code checks are exact and free. If a draft cites an id that was never retrieved, there is no point paying a model to judge it. Running code first spends reviewer tokens only on drafts that already pass the mechanical checks."
        },
        {
          "q": "After two rounds the draft still has one unsupported sentence. What should `build_briefing` do, and why not loop until it passes?",
          "a": "Return the draft with an \"unresolved\" status so a person reviews it. Looping until it passes has no cost ceiling, and a loop that is not converging after two rounds usually has a problem that more rounds will not fix, such as a gap in the handbook or a reviewer that disagrees with the evidence."
        },
        {
          "q": "The writer and reviewer use the same model and the same system prompt. What failure does this invite?",
          "a": "Shared blind spots. A reviewer that reasons like the writer tends to accept the writer's mistakes. Give the reviewer its own prompt, show it the evidence rather than the writer's reasoning, and calibrate it on drafts with known errors."
        }
      ],
      "readings": [
        "building-effective-agents",
        "reflexion"
      ]
    },
    {
      "topic": "autonomous-workflows",
      "blocks": [
        "Every agent so far has started because you typed a command. An **autonomous workflow** starts without anyone at the keyboard. There are two kinds of starting signal, called triggers:",
        {
          "list": [
            "**Scheduled.** A clock starts the job: every night at 6:30, every Monday morning. On Windows the clock is Task Scheduler; on macOS and Linux it is usually cron.",
            "**Event-driven.** Something happening starts the job. A new ticket arrives in the Lab 7 help desk. A file lands in a folder. A form posts to a web address (a webhook). A message appears on a queue."
          ]
        },
        "\"Autonomous\" here means *unattended*. It does not have to mean the model decides everything. [[building-effective-agents]] uses \"autonomous agents\" for systems where the model plans and acts on its own, and it advises extensive testing in sandboxed environments with guardrails. Most scheduled jobs should be workflows (topic 1) that happen to run unattended. That keeps the part nobody is watching as predictable as possible.",
        "A Lab 8 example: the handbook changes from time to time, and the resident briefing should keep up. A nightly job can check whether any file in `docs\\` changed and, only if one did, rebuild the index and regenerate the briefing. It writes the result to an `outbox\\` folder for a person to approve. It does not publish anything itself.",
        {
          "code": "\"\"\"run_nightly.py: regenerate the briefing when the handbook changes. Never publishes.\"\"\"\nimport datetime as dt\nimport hashlib\nimport json\nimport pathlib\nimport subprocess\nimport sys\n\nfrom pipeline import BRIEFING_TASK, build_briefing\n\nSTATE = pathlib.Path(\"state/last_run.json\")\nOUTBOX = pathlib.Path(\"outbox\")\n\n\ndef handbook_fingerprint() -> str:\n    h = hashlib.sha256()\n    for p in sorted(pathlib.Path(\"docs\").glob(\"*.md\")):\n        h.update(p.name.encode())\n        h.update(p.read_bytes())\n    return h.hexdigest()[:16]\n\n\nfp = handbook_fingerprint()\nlast = json.loads(STATE.read_text(encoding=\"utf-8\")) if STATE.exists() else {}\nif last.get(\"fingerprint\") == fp:\n    print(\"handbook unchanged; nothing to do\")\n    sys.exit(0)\n\nsubprocess.run([sys.executable, \"build_index.py\"], check=True)\nresult = build_briefing(BRIEFING_TASK, run_id=f\"nightly-{fp}\")   # same input, same run id\n\nOUTBOX.mkdir(exist_ok=True)\n(OUTBOX / f\"briefing-{fp}-{result.status.split(':')[0]}.md\").write_text(result.markdown, encoding=\"utf-8\")\nSTATE.parent.mkdir(exist_ok=True)\nSTATE.write_text(json.dumps({\"fingerprint\": fp, \"status\": result.status,\n                             \"cost_usd\": result.cost_usd,\n                             \"at\": dt.datetime.now().isoformat(timespec=\"seconds\")}),\n                 encoding=\"utf-8\")",
          "title": "run_nightly.py: a scheduled job that does nothing when nothing changed",
          "note": "The fingerprint makes the job **{{idempotency|idempotent}}**: running it twice on the same handbook does the work once. The file name carries the status, so an \"unresolved\" briefing is visible at a glance."
        },
        {
          "code": "# nightly.cmd, saved in the agentic-lab08 folder:\n#   cd /d %~dp0\n#   .venv\\Scripts\\python.exe run_nightly.py >> logs\\nightly.log 2>&1\n\ncd $HOME\\agentic-ai\\agentic-lab08\nmkdir logs\nschtasks /create /tn \"Lab8 nightly briefing\" /tr \"$HOME\\agentic-ai\\agentic-lab08\\nightly.cmd\" /sc daily /st 06:30\nschtasks /run /tn \"Lab8 nightly briefing\"        # test it now instead of waiting\nGet-Content logs\\nightly.log -Tail 20\nschtasks /delete /tn \"Lab8 nightly briefing\" /f  # remove it when the lab is done\n\n# macOS or Linux (crontab -e):\n# 30 6 * * * cd ~/agentic-ai/agentic-lab08 && .venv/bin/python run_nightly.py >> logs/nightly.log 2>&1",
          "title": "Schedule it (PowerShell)",
          "note": "Task Scheduler runs the job with no console, so everything the job prints goes to `logs\\nightly.log` or is lost. In `nightly.cmd`, `cd /d %~dp0` moves into the folder that holds the file, so relative paths such as `docs` work. See [[schtasks]] for the full option list."
        },
        "Removing the person changes what can go wrong. Each safeguard you relied on implicitly now has to be built:",
        {
          "table": {
            "head": [
              "Concern",
              "When you run it by hand",
              "When nobody is watching"
            ],
            "rows": [
              [
                "Approval",
                "You read the output before using it",
                "Lab 7's confirmation gate fails closed with no terminal. Unattended jobs write drafts to a review queue or outbox; a person approves."
              ],
              [
                "Errors",
                "You see the stack trace",
                "Nobody does. Log to a file, and alert someone on failure or on an \"unresolved\" status."
              ],
              [
                "Duplicates",
                "You run it once",
                "Schedulers retry and events arrive twice. Use an idempotency key, such as the fingerprint above or the event's id."
              ],
              [
                "Cost",
                "You notice a slow, expensive run",
                "Cap each run and each day in code. Record `cost_usd` per run, as `last_run.json` does."
              ],
              [
                "Drift",
                "You notice odd answers",
                "The model behind an alias can change. Run the Module 2 regression set on a schedule too."
              ],
              [
                "Stopping it",
                "Ctrl+C",
                "Keep a kill switch: delete the task, or have the job exit at once if a `STOP` file exists."
              ]
            ],
            "caption": "What an unattended agent must do for itself"
          }
        },
        "Event-driven jobs add one more rule: **treat the event as untrusted input**. A help desk ticket or a submitted form is text a stranger wrote, and an agent that reads it on a trigger may act on any instructions hidden inside it. Module 12 calls this {{indirect-prompt-injection|indirect prompt injection}}. Read-only tools and an approval queue limit the damage.",
        "Long-running agents also raise the question of memory over time. The Generative Agents study ([[generative-agents]]) ran twenty-five simulated characters for days in a small sandbox town. Each kept a full record of its experiences, condensed it into higher-level reflections, and retrieved those to plan. From one character's wish to throw a Valentine's Day party, the others spread invitations and showed up together. Your nightly job needs far less, but the same principle applies. What a job remembers between runs, here `last_run.json`, is designed state: written down, small, and inspectable.",
        {
          "callout": "An unattended agent should never publish, send, or write to a system of record on its own authority. Let it draft, queue, and alert. A person, or a rule enforced in code, does the rest. If you cannot say who reviews the outbox, the job is not ready to schedule.",
          "tone": "warning",
          "title": "Unattended means drafts, not decisions"
        }
      ],
      "takeaway": "Scheduled and event-driven agents run with no one watching, so build in what a person used to provide: idempotent runs, logs and alerts, per-run and per-day budgets, a kill switch, and an approval queue between the agent and anything that matters.",
      "check": [
        {
          "q": "Task Scheduler runs `run_nightly.py` twice in one night because the first attempt timed out halfway. What prevents a second briefing and a second bill?",
          "a": "The fingerprint. If the first run finished, `last_run.json` already holds the same fingerprint and the second run exits at once. If the first run died before writing state, the second run does the work, under the same `run_id`, so it overwrites the same files rather than creating a duplicate."
        },
        {
          "q": "Why does Lab 7's confirmation gate refuse to approve anything when the agent runs from a scheduler, and why is that the right behavior?",
          "a": "The gate checks that stdin is an interactive terminal, and a scheduled job has none. Failing closed means no consequential action happens without a person. The alternative, auto-approving when nobody is there, removes the safeguard exactly when it is most needed."
        },
        {
          "q": "A webhook triggers your agent whenever a resident submits a feedback form. Name two risks that a scheduled job reading only `docs\\` does not have.",
          "a": "The input is written by strangers, so it can carry injected instructions (Module 12). And the trigger rate is set by outsiders, so a flood of submissions can run up cost unless runs per hour and per day are capped in code."
        }
      ],
      "readings": [
        "building-effective-agents",
        "generative-agents",
        "schtasks"
      ]
    },
    {
      "topic": "multi-agent-cost",
      "blocks": [
        "Every role in a pipeline is one or more model calls, and every call is billed. A multi-agent design therefore costs more {{token|tokens}} than a single agent doing the same job, almost by construction. The question Lab 8 asks is whether the extra tokens buy enough quality to be worth it, and the only honest way to answer is to measure both versions on the same task.",
        "Anthropic's write-up of its research system ([[multi-agent-research]]) gives the scale. In its data, agents used about 4 times the tokens of a chat interaction, and multi-agent systems about 15 times. On its internal research evaluation, the multi-agent version beat a single agent by 90.2%. In its analysis of a browsing benchmark, token usage alone explained 80% of the variance in performance. Read that last finding carefully. Much of the multi-agent advantage came from spending more. Part of what you are buying is simply more tokens of work.",
        "The same write-up says where multi-agent designs fit badly: tasks where every agent needs the same context, tasks with many dependencies between agents, and most coding tasks. Cognition's post ([[dont-build-multi-agents]]) goes further and recommends a single-threaded agent by default. Research questions that split into independent parts are the good case. The resident briefing is a mild version of it.",
        "**Time is different from cost.** Running workers in parallel cuts wall-clock time but not tokens. The wall-clock time of a pipeline is set by its **critical path**: the sum of the stages that must run one after another, plus the slowest worker in each parallel stage. Lab 8's chain of write, review, revise, review is sequential, so a pipeline can easily be *slower* than the single agent even with parallel research.",
        {
          "table": {
            "head": [
              "Run",
              "Model calls",
              "Input tokens",
              "Output tokens",
              "Cost",
              "Wall time"
            ],
            "rows": [
              [
                "Baseline: Lab 5 agent, one loop",
                "7",
                "52,000",
                "2,800",
                "$0.104 + $0.028 = $0.13",
                "45 s"
              ],
              [
                "Pipeline: plan, 4 researchers (3 calls each), write, review, revise, review",
                "17",
                "67,200",
                "7,550",
                "$0.134 + $0.076 = $0.21",
                "65 s"
              ],
              [
                "Same pipeline, researchers one at a time",
                "17",
                "67,200",
                "7,550",
                "$0.21",
                "about 110 s"
              ]
            ],
            "caption": "Illustrative arithmetic only, at Module 1's illustrative prices of $2 per million input tokens and $10 per million output tokens. Your numbers come from your traces."
          }
        },
        "In this illustration the pipeline costs about 1.6 times the baseline and is slower, not faster. Whether it is worth it depends entirely on the quality columns, which is why Lab 8's comparison table must have them. Measure quality the way Labs 4 and 5 did, with automatic checks rather than impressions:",
        {
          "list": [
            "**Fact coverage.** The share of required facts the briefing contains, from `tests/briefing_facts.json`: the $40 and $75 fees, the 4-hour block, the 14-day and 48-hour refund rules, the $20 amplified sound permit, the 10-day lead time, the 10 PM park closing, the special event permit for alcohol, and removing all trash.",
            "**Unsupported claims.** Sentences the reviewer flagged, or that cite nothing. One invented fee is worse than one missing fact.",
            "**Citation validity and grounding.** The same checks as Lab 5's `eval_rag.py`.",
            "**Cost, tokens, calls, and wall time.** From the `end` events in each trace, plus a timer around the whole run."
          ]
        },
        {
          "code": "import json\nimport pathlib\nimport sys\n\nFACTS = json.loads(pathlib.Path(\"tests/briefing_facts.json\").read_text(encoding=\"utf-8\"))\n\n\ndef norm(s: str) -> str:\n    return \" \".join(s.lower().split())\n\n\nprint(\"| Run | Facts | Calls | Tokens | Cost | Seconds | Status |\")\nprint(\"|---|---|---|---|---|---|---|\")\nfor run_dir in sys.argv[1:]:                       # e.g. runs/baseline-1 runs/pipeline-1\n    summary = json.loads((pathlib.Path(run_dir) / \"summary.json\").read_text(encoding=\"utf-8\"))\n    text = norm((pathlib.Path(run_dir) / \"briefing.md\").read_text(encoding=\"utf-8\"))\n    found = sum(any(norm(alt) in text for alt in fact[\"any_of\"]) for fact in FACTS)\n    print(f\"| {run_dir} | {found}/{len(FACTS)} | {summary['calls']} | {summary['tokens']:,} \"\n          f\"| ${summary['cost_usd']:.3f} | {summary['seconds']:.0f} | {summary['status']} |\")",
          "title": "compare.py: one table row per run",
          "note": "`build_briefing` and `baseline.py` each write `summary.json` by adding up the `end` events of their traces. Each fact in `briefing_facts.json` lists acceptable wordings, such as `{\"id\": \"closing\", \"any_of\": [\"10 PM\", \"10 p.m.\", \"10:00 PM\"]}`. Audit the checker the way Lab 5 taught: read the briefings it marks wrong."
        },
        "Run each version several times, not once. Multi-agent runs vary more than single calls, because every role adds its own randomness. Report the spread as well as the average.",
        "If the pipeline wins on quality but costs too much, there are levers before you give up on it:",
        {
          "list": [
            "**Tier the roles.** Researchers do narrow retrieval and can often run on a Haiku-tier model; keep the larger model for writing and reviewing. Prove it with the fact-coverage numbers, as Module 1 taught.",
            "**Cut rounds.** Measure how often round 2 changes anything. If rarely, set `MAX_ROUNDS = 1`.",
            "**Route first.** The topic 1 router keeps one-fact questions out of the pipeline entirely.",
            "**Cache the shared prefix.** The writer and reviewer both receive the same findings. {{prompt-caching|Prompt caching}} makes a repeated prefix cheaper ([[claude-pricing]])."
          ]
        },
        {
          "callout": "Lab 8 is graded on the comparison, not on the pipeline winning. \"The single agent scored 8 of 9 facts at 60% of the cost, so I would ship it\" is a strong conclusion if your table supports it. Many real teams reach exactly that result.",
          "tone": "aside",
          "title": "A pipeline that loses is a valid result"
        }
      ],
      "takeaway": "Multi-agent designs spend more tokens by construction and are not automatically faster, because sequential stages set the wall-clock time. Measure quality, cost, and time against a single-agent baseline over several runs, and keep the extra roles only if the quality gain is worth the price.",
      "check": [
        {
          "q": "Using the illustrative prices, what does a run with 60,000 input tokens and 5,000 output tokens cost?",
          "a": "60,000 / 1,000,000 × $2 = $0.12, plus 5,000 / 1,000,000 × $10 = $0.05, for $0.17 in total."
        },
        {
          "q": "Your pipeline runs four researchers in parallel, yet it is slower than the baseline. How can that be?",
          "a": "Parallelism shortens only the research stage. Planning, writing, reviewing, and revising still run one after another, and each is a full model call. That sequential chain, the critical path, can take longer than the single agent's whole loop."
        },
        {
          "q": "Anthropic found that token usage explained most of the performance variance in its multi-agent research system. Why should that make you cautious about crediting the architecture for a quality gain in Lab 8?",
          "a": "Part of the gain may come simply from spending more tokens of work, not from splitting the work into roles. A fair comparison asks whether a single agent given a similar budget, such as more steps or a revision pass, closes the gap."
        }
      ],
      "readings": [
        "multi-agent-research",
        "dont-build-multi-agents",
        "claude-pricing"
      ]
    }
  ]
};
