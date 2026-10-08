import type { LectureNotesDef } from "../types";

// Module 3 — Tool calling and the agent loop: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M03_NOTES: LectureNotesDef = {
  "moduleId": "m03",
  "intro": "These notes go with the Module 3 lecture and Lab 3. Module 2 kept the model on the middle rung: one call, surrounded by code. This module hands the model the next step. The running example is the lab's: an analyst agent for a small town's public works department that answers questions about facilities and service requests in `data/town.db`, using four tools you write yourself (`calculator`, `run_sql`, `read_file`, and `write_file`). You build the loop by hand in `agent.py`, with no framework. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "workflows-vs-agents",
      "blocks": [
        "Module 1's {{decision-ladder|decision ladder}} put an {{agent|agent}} on the top rung. This module builds one, so it is worth being precise about what changes when you climb. Anthropic's guide [[building-effective-agents]] draws the line in one place: **who decides the path**.",
        {
          "list": [
            "**A workflow** runs the model and the tools through code paths you wrote in advance. The model may do several jobs along the way, but your code decides which job comes next.",
            "**An agent** lets the model decide the next step itself: which tool to call, with what arguments, and when it is finished. Your code runs whatever the model asks for, inside limits you set."
          ]
        },
        "Both use the same API features. A workflow can call tools, and an agent can be very short. The difference is control flow. For a workflow, you could draw the flowchart before the program runs. For an agent, the flowchart only exists afterwards, in the record of what it did.",
        {
          "table": {
            "head": [
              "Aspect",
              "Workflow",
              "Agent"
            ],
            "rows": [
              [
                "Who picks the next step",
                "Your code",
                "The model, each time round the loop"
              ],
              [
                "Number of model calls",
                "Known in advance",
                "Depends on what each step finds"
              ],
              [
                "Cost per run",
                "Fixed, and quotable before you run it",
                "A range. You set a ceiling (topic 6)."
              ],
              [
                "How you test it",
                "Check each step against an expected output",
                "Many runs, judging the answer and the path (Module 11)"
              ],
              [
                "Typical failure",
                "One step gets bad input and passes it along",
                "Errors compound: one wrong lookup steers every later step"
              ],
              [
                "Example in this course",
                "Lab 2: extract, validate, retry with the error",
                "Lab 3: \"Which ward had the highest total cost for repair requests closed in 2025?\""
              ]
            ],
            "caption": "Workflows and agents compared"
          }
        },
        "Why is the ward question an agent task? Nobody has told the program the table names. It has to look at the database schema, write a join, do some arithmetic, and save a file. Each step depends on what the one before returned. You *could* write that as a fixed script, and topic 2 asks you to. But the agent can also answer the next question, about vandalism or days-to-close, without any new code.",
        "The guide's advice is blunt: find the simplest solution that works, and add complexity only when it is needed. Often that means not building an agent at all. Workflows give you predictability and consistency on well-defined tasks. Agents trade those away for flexibility, and the guide names the price: higher cost, and the risk that errors compound.",
        "A useful test: if you replaced the model's choice with an `if` statement, would anything be lost? Lab 3's second task (\"In one sentence, what does a public works department do?\") shows the smallest version of the difference. The agent decided that no tool was needed and answered in one step. A workflow would have called the calculator anyway, because the flowchart said so. Multiply that one decision over ten steps and you have an agent.",
        {
          "callout": "Module 8 names the common workflow patterns: {{prompt-chaining|prompt chaining}}, {{routing|routing}}, parallelization, {{orchestrator-workers|orchestrator-workers}}, and {{evaluator-optimizer|evaluator-optimizer}}. Every one keeps the control flow in your code. Learn to recognize them, because many systems sold as agents are really one of these patterns, and are better for it.",
          "title": "Workflows can still use models",
          "tone": "aside"
        },
        {
          "callout": "Every decision you hand to the model is a decision you can no longer guarantee. Hand over only the decisions that genuinely depend on what the program discovers while it runs. Keep the rest in code: permissions, limits, and what counts as finished.",
          "title": "Autonomy is a cost, not a feature",
          "tone": "warning"
        }
      ],
      "takeaway": "A workflow follows a path your code wrote in advance; an agent lets the model choose the path while it runs, so use an agent only when the next step genuinely depends on what the last one found.",
      "check": [
        {
          "q": "Lab 2's extractor retries a failed validation up to `MAX_ATTEMPTS` times. Does that loop make it an agent?",
          "a": "No. Your code decides when to retry and what to send back; the model only interprets text each time. The path is fixed in advance: call, validate, maybe retry, stop. An agent would let the model choose what to do next."
        },
        {
          "q": "Name one thing you can know before deployment about a workflow that you cannot know about the Lab 3 agent.",
          "a": "The exact number and order of model and tool calls for an input, and so the worst-case cost. For the agent you know only the ceilings you imposed (`MAX_STEPS`, `TOKEN_BUDGET`), not the path it will take."
        },
        {
          "q": "A teammate proposes an agent that, every morning, queries yesterday's closed requests and emails a summary to the public works director. Which rung would you choose?",
          "a": "A workflow, perhaps with one model call to write the summary paragraph. The query is the same every day and the steps never change, so nothing needs the model to choose. The schedule, the query, and the email are code."
        }
      ],
      "readings": [
        "building-effective-agents",
        "anthropic-tools"
      ]
    },
    {
      "topic": "ladder-compared",
      "blocks": [
        "Lab 3's last task turns the {{decision-ladder|decision ladder}} from an argument into a measurement. Pick one of your three tasks and solve it twice more: once as plain code with no model, and once as a single model call with no tools. Then compare all three in LADDER.md. This section shows what each version looks like for the ward question, and how to compare them fairly.",
        "**Rung 1, plain code**, is the query you already wrote in `verify.py`, plus one line of output:",
        {
          "code": "import sqlite3\n\ncon = sqlite3.connect(\"data/town.db\")\nward, total, n = con.execute(\"\"\"\n    SELECT f.ward, ROUND(SUM(r.cost_usd), 2), COUNT(*)\n    FROM service_requests r JOIN facilities f ON f.id = r.facility_id\n    WHERE r.category = 'repair' AND r.closed LIKE '2025-%'\n    GROUP BY f.ward ORDER BY 2 DESC LIMIT 1\n\"\"\").fetchone()\nprint(f\"Ward {ward}: ${total:,.2f} over {n} requests, average ${total / n:,.2f}\")",
          "title": "Rung 1: the ward question as plain code",
          "note": "About ten lines, no model, no cost per run, and the same answer every time. It answers exactly one question."
        },
        "**Rung 3, a single call with no tools**, runs into a problem that is itself the lesson. A model with no tools cannot see `town.db`. To give it a fair chance, your code must fetch the data and paste it into the prompt:",
        {
          "code": "rows = con.execute(\"\"\"\n    SELECT f.ward, r.cost_usd\n    FROM service_requests r JOIN facilities f ON f.id = r.facility_id\n    WHERE r.category = 'repair' AND r.closed LIKE '2025-%'\n\"\"\").fetchall()\n\nresponse = client.messages.create(\n    model=MODEL, max_tokens=300, temperature=0,\n    messages=[{\"role\": \"user\", \"content\":\n        \"Each line is ward,cost_usd for one repair request closed in 2025.\\n\"\n        + \"\\n\".join(f\"{w},{c}\" for w, c in rows)\n        + \"\\n\\nWhich ward has the highest total cost? Give the total and the average.\"}],\n)",
          "title": "Rung 3: one model call, no tools (excerpt; client and MODEL as in Lab 1)",
          "note": "Your code had to know the right query to build this prompt, so it has already done the hard part. The model is left to add up dozens of numbers in its head, which is exactly what the calculator tool exists to prevent."
        },
        "**Rung 4, the agent**, is `python agent.py` with the question, unchanged from the lab. It finds the tables, writes the query, and does the arithmetic itself.",
        {
          "table": {
            "head": [
              "Measure",
              "Plain code",
              "Single call",
              "Agent"
            ],
            "rows": [
              [
                "Code written for this task",
                "About 10 lines",
                "About 20 lines",
                "None new, but `agent.py` and `tools.py` are shared infrastructure"
              ],
              [
                "Cost per run",
                "Nothing",
                "One call; input grows with the rows you paste",
                "Several calls; input grows on every step"
              ],
              [
                "Latency",
                "Milliseconds",
                "One model call",
                "Several model calls plus tool time"
              ],
              [
                "Success over 5 runs",
                "5 of 5, by construction",
                "Watch for arithmetic slips over many numbers",
                "Usually right; watch for a wrong filter, such as `opened` instead of `closed`"
              ],
              [
                "How you test it",
                "One assertion against `verify.py`",
                "Compare numbers with `verify.py`, several runs",
                "Compare the answer *and* read the trace, several runs"
              ],
              [
                "A new question tomorrow",
                "New code",
                "New query and new prompt",
                "Usually no new code"
              ]
            ],
            "caption": "What LADDER.md compares. The middle rows describe what to look for; your measured numbers go in your file."
          }
        },
        "Measuring fairly takes a little care:",
        {
          "list": [
            "**Same question, same ground truth.** Use `verify.py` as the referee for all three. A number that is close is not correct.",
            "**Five runs each.** Plain code gives the same result every time. The model-based versions may not, even at {{temperature|temperature}} 0 (Module 1). Report a rate, such as 4 of 5.",
            "**Cost from the responses, not from guesses.** Add up `usage.input_tokens` and `usage.output_tokens` across every call in the run. For the agent, the END line of `show_trace.py` already has the totals. Multiply by current prices from [[claude-pricing]], as `ask.py` did.",
            "**Latency end to end.** Time the whole command, not one call. The agent's time includes every tool call (the `ms` field in the trace)."
          ]
        },
        "Then say which one you would ship, and why. There is no single right answer, but there is a right kind of answer. If the director asks the ward question every month, plain code wins: it is free, instant, and testable with one assertion. If analysts ask a different question every day, the agent earns its cost, because each new question would otherwise be new code. The single-call version usually loses on this task. Either the model does the arithmetic badly, or your code does all the work and the model adds little.",
        {
          "callout": "The same question can belong on different rungs depending on how often it is asked and how much it varies. LADDER.md should state the workload you assumed. Your final project's one-paragraph justification is this same argument at a larger scale.",
          "title": "The ship decision depends on the workload",
          "tone": "tip"
        }
      ],
      "takeaway": "Measure the rungs against the same ground truth on cost, latency, success rate, and testability, and choose by the workload: fixed questions belong in code, open-ended ones may earn an agent.",
      "check": [
        {
          "q": "Why can't the single-call version just be sent the question and nothing else?",
          "a": "The model has no access to `town.db`. Without tools it can only guess, and a fluent guess is a hallucination. Your code must fetch the data and put it in the prompt, which means your code has already chosen the query."
        },
        {
          "q": "Your agent got the ward answer right 5 of 5 times, and so did plain code. Give two reasons you might still ship plain code.",
          "a": "It costs nothing per run and answers in milliseconds, while the agent spends several model calls every time. It is also testable with one exact assertion and can never take a different path, so there is nothing to budget or monitor."
        },
        {
          "q": "The single-call version reports ward 1 at $39,512, but `verify.py` says about $39,670. What most likely happened, and which Lab 3 tool exists to prevent it?",
          "a": "The model added a long column of numbers in its head and slipped. Language models are not reliable calculators. The `calculator` tool, or doing the SUM in SQL, moves arithmetic into code, which is why the system prompt says \"never guess a number.\""
        }
      ],
      "readings": [
        "building-effective-agents",
        "claude-pricing"
      ]
    },
    {
      "topic": "tool-definitions",
      "blocks": [
        "A {{tool-call|tool call}} lets the model ask your program to run a function. The model never runs anything itself. It reads descriptions of the tools you offer. When it wants one, it replies with the tool's name and the arguments it chose. Your code runs the function and sends back the result.",
        "You offer tools through the `tools` parameter of `client.messages.create()`, the same method you have called since Lab 1. Each entry in that list is a tool definition with three required parts:",
        {
          "table": {
            "head": [
              "Field",
              "What it is",
              "In Lab 3's calculator"
            ],
            "rows": [
              [
                "`name`",
                "The identifier the model uses to call the tool. Letters, digits, underscores, and hyphens only, up to 128 characters.",
                "`calculator`"
              ],
              [
                "`description`",
                "Plain text telling the model what the tool does, when to use it, and what to watch out for.",
                "\"Evaluate an arithmetic expression exactly. ... Use this for any arithmetic instead of calculating in your head.\""
              ],
              [
                "`input_schema`",
                "A {{json-schema|JSON Schema}} object describing the arguments.",
                "One required string property, `expression`."
              ]
            ],
            "caption": "The three required fields of a tool definition"
          }
        },
        "Together these fields are the tool's **{{tool-schema|tool schema}}**: everything the model knows about the tool. The model never sees your Python function. It sees only these three fields, so they have to say everything it needs. Here is the definition that does the most work in Lab 3:",
        {
          "code": "{\n    \"name\": \"run_sql\",\n    \"description\": (\n        \"Run one read-only SQLite query against the town database and get \"\n        \"the result as JSON (max 50 rows). If you do not know the tables, \"\n        \"first run: SELECT name, sql FROM sqlite_master WHERE type='table'. \"\n        \"Dates are ISO text, so use strftime('%Y', col) or LIKE '2025-%'.\"\n    ),\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\"query\": {\"type\": \"string\", \"description\": \"A single SELECT statement\"}},\n        \"required\": [\"query\"],\n    },\n}",
          "title": "The run_sql definition from Lab 3's tools.py",
          "note": "Each sentence of the description has a job: what the tool does and its limits (read-only, 50 rows), how to recover when the agent does not know the tables, and a known trap (dates stored as text)."
        },
        "The Claude docs on defining tools ([[claude-define-tools]]) call the description by far the most important factor in how well a tool is used, and recommend at least three or four sentences. A good description answers four questions:",
        {
          "list": [
            "**What does it do?** Include what it returns and in what format.",
            "**When should it be used, and when not?** \"Use this for any arithmetic instead of calculating in your head\" is a *when*.",
            "**What does each argument mean?** Put an example in the argument's own `description`, as Lab 3 does with `Relative path, e.g. notes/todo.md`.",
            "**What are the limits and traps?** Read-only, 50 rows, dates as text, paths relative to `workspace/`."
          ]
        },
        "Lab 3 shows why this matters. The ward 3 task works even though nobody told the agent the table names, because the `run_sql` description told it how to find them. Delete that sentence and run the task again. The agent starts guessing names such as `requests` or `wards`, and spends steps reading errors.",
        "Three API details are worth knowing now:",
        {
          "list": [
            "**Tool definitions are part of the prompt.** The API builds a special {{system-prompt|system prompt}} from your tool definitions plus the system prompt you wrote. Every definition costs input {{token|tokens}} on every call, and an agent makes many calls.",
            "**The schema is guidance unless you ask for enforcement.** By default the model usually, but not always, sends arguments that fit. Adding `\"strict\": true` next to `name` makes the API constrain the arguments to the schema, the same idea as Module 2's schema-constrained output. Lab 3 leaves it off, which is one reason `dispatch()` must handle bad arguments.",
            "**`tool_choice` controls whether a tool must be called.** The default, `{\"type\": \"auto\"}`, lets the model decide. `{\"type\": \"none\"}` forbids tools for that one call; Lab 4 uses it to force a final plain-text answer. The settings `any` and `tool` force a call, as in Module 2's forced extraction, but some of the newest models reject those two, so check [[claude-define-tools]] for the model you use."
          ]
        },
        {
          "callout": "The model chooses the arguments, and its choices can be wrong. They can also be steered by text it read in an earlier tool result, which Module 12 calls {{indirect-prompt-injection|indirect prompt injection}}. Treat arguments like input from a web form. That is why Lab 3's calculator walks the syntax tree instead of calling `eval()`, why `run_sql` opens the database read-only, and why `_safe_path` refuses any file outside `workspace/`. The guard rails live in the tool, not in the prompt.",
          "title": "Arguments are untrusted input",
          "tone": "warning"
        }
      ],
      "takeaway": "A tool is a name, a description, and a JSON Schema for its arguments; the model sees only those, so write the description like documentation for a new colleague and enforce safety inside the function.",
      "check": [
        {
          "q": "The model never sees the body of `run_sql()`. What follows for how you write its definition?",
          "a": "Anything the model needs to know must be in the name, the description, or the argument descriptions: that the tool is read-only, the 50-row limit, how to discover the tables, and that dates are stored as ISO text. If it is only in the code, the model cannot know it."
        },
        {
          "q": "A classmate's SQL tool is described only as \"Runs SQL.\" Name three things the agent will probably get wrong.",
          "a": "It will guess table and column names instead of looking them up; it may try a write such as `DELETE` and waste a step on the error; and it may compare dates the wrong way because nothing says they are ISO text. Each mistake costs a step and tokens."
        },
        {
          "q": "When would you set `strict` to true on a tool, and does it remove the need for checks inside the tool?",
          "a": "When malformed arguments are a real problem, such as a tool with several required fields or an `enum`. It guarantees the arguments match the schema's shape. It does not make them safe: a perfectly shaped query can still be a `DELETE`, and a valid string can still be a path outside the workspace, so the function's own guards stay."
        }
      ],
      "readings": [
        "anthropic-tools",
        "claude-define-tools",
        "writing-tools-for-agents",
        "json-schema"
      ]
    },
    {
      "topic": "agent-loop",
      "blocks": [
        "The **{{agent-loop|agent loop}}** is a short piece of code that keeps calling the model until the model stops asking for tools. Lab 3's `run()` function in `agent.py` is the whole thing, in about forty lines. Every agent framework you meet in Module 9 is this loop with features added on top.",
        "One pass of the loop has three parts:",
        {
          "list": [
            "**Reason.** Send the conversation so far, with the `tools` list, to `client.messages.create()`. The model reads everything and decides what to do next.",
            "**Act.** If the response's {{stop-reason|`stop_reason`}} is `tool_use`, its content holds one or more `tool_use` blocks. Each block has a tool `name`, an `input` dictionary, and an `id`. Your code runs each one through `dispatch()`.",
            "**Observe.** Your code sends every result back as a `tool_result` block in a new user message. Then the loop goes round again, and the model reads what its tools found."
          ],
          "ordered": true
        },
        "Here is the core of `run()` with the logging and the token budget removed:",
        {
          "code": "messages = [{\"role\": \"user\", \"content\": task}]\nfor step in range(1, MAX_STEPS + 1):\n    response = client.messages.create(                       # reason\n        model=MODEL, max_tokens=1024, temperature=0,\n        system=SYSTEM, tools=TOOLS, messages=messages,\n    )\n    messages.append({\"role\": \"assistant\", \"content\": response.content})\n\n    if response.stop_reason != \"tool_use\":                   # the model answered\n        return \"\".join(b.text for b in response.content if b.type == \"text\")\n\n    results = []\n    for call in [b for b in response.content if b.type == \"tool_use\"]:\n        output, is_error = dispatch(call.name, call.input)   # act\n        results.append({\"type\": \"tool_result\", \"tool_use_id\": call.id,\n                        \"content\": output, \"is_error\": is_error})\n    messages.append({\"role\": \"user\", \"content\": results})    # observe",
          "title": "The loop from Lab 3's agent.py (trimmed)"
        },
        "Three details in that code carry a lot of weight:",
        {
          "list": [
            "**The assistant turn goes back exactly as it came.** `response.content` is appended whole, `tool_use` blocks included. The API needs to see each call in order to make sense of the result that follows it.",
            "**Each result carries a `tool_use_id`.** It must equal the `id` of the call it answers. That is how the model knows which result belongs to which call.",
            "**Errors are results too.** `dispatch()` never raises. A failed tool returns its error text with `is_error` set to true, and the model reads it like any other result. It can fix its arguments and try again. Module 4 is built on this."
          ]
        },
        "After the first pass of Lab 3's calculator task, the conversation looks like this:",
        {
          "code": "[\n  {\"role\": \"user\", \"content\": \"What is 17.5% of 2,340, plus a $35 filing fee?\"},\n  {\"role\": \"assistant\", \"content\": [\n      {\"type\": \"text\", \"text\": \"I'll calculate that exactly.\"},\n      {\"type\": \"tool_use\", \"id\": \"toolu_01...\", \"name\": \"calculator\",\n       \"input\": {\"expression\": \"round(2340 * 0.175 + 35, 2)\"}}]},\n  {\"role\": \"user\", \"content\": [\n      {\"type\": \"tool_result\", \"tool_use_id\": \"toolu_01...\",\n       \"content\": \"444.5\", \"is_error\": false}]}\n]",
          "title": "messages after step 1 (illustrative: the wording and the expression will vary)",
          "note": "Tool results travel in a `user` message, because roles still alternate. On step 2 the model reads `444.5`, answers $444.50, and the `stop_reason` is `end_turn`."
        },
        "The Claude docs ([[claude-handle-tool-calls]]) add two formatting rules. The message holding the results must come immediately after the assistant message that made the calls, with nothing in between. And inside it, every `tool_result` block must come before any text. Break either rule and the API returns an error instead of a response.",
        {
          "callout": "The API is stateless (Module 1), so every pass re-sends the task, every assistant turn, and every tool result. That is why input tokens climb on every line of `show_trace.py`, and why a tool that returned 5,000 rows would be ruinous. Lab 3 caps `run_sql` at 50 rows for exactly this reason.",
          "title": "History grows on every step",
          "tone": "aside"
        },
        {
          "callout": "The `anthropic` SDK includes a helper, which the docs call the tool runner, that drives this loop for you. Use it later if you like. Write the loop by hand first, so you know exactly what the helper is doing on your behalf when something goes wrong.",
          "title": "Why not use a helper?",
          "tone": "tip"
        }
      ],
      "takeaway": "The agent loop is reason, act, observe, repeat: call the model, run every tool it asks for, send each result back tagged with its `tool_use_id`, and stop when the model answers instead of calling a tool.",
      "check": [
        {
          "q": "What would go wrong if `run()` appended only the text of the assistant's reply to `messages`, dropping its `tool_use` blocks?",
          "a": "The next request would contain `tool_result` blocks answering calls that do not appear in the previous assistant turn. The API rejects that, because each result must immediately follow the turn holding its matching `tool_use` block."
        },
        {
          "q": "In the calculator task, how many model calls and tool calls happen? Why is the model called again after the tool returns?",
          "a": "Two model calls and one tool call. The first model call asks for the calculator; the second reads the result and writes the answer. The model cannot see a tool's output until your code sends it back, so turning a result into an answer always costs one more call."
        },
        {
          "q": "Why does `dispatch()` return `(output, is_error)` instead of raising an exception when a tool fails?",
          "a": "An exception would end the run with a stack trace. Returning the error as a `tool_result` with `is_error` true lets the model read what went wrong and recover, for example by fixing a column name. The loop stays in control."
        }
      ],
      "readings": [
        "anthropic-tools",
        "claude-how-tool-use-works",
        "claude-handle-tool-calls"
      ]
    },
    {
      "topic": "parallel-tools",
      "blocks": [
        "One model response can hold more than one `tool_use` block. These are **{{parallel-tool-calls|parallel tool calls}}**: the model asks for several tools at once because it already knows it needs all of them, and none depends on another's result.",
        "Lab 3's third demonstration task invites this. To compare days-to-close for repair and inspection requests, the model may send two `run_sql` calls in a single response, one per category. `show_trace.py` shows them as two tool lines under one model line, with the same step number:",
        {
          "code": "[3] model  tool_use  in=2911   out=164\n[3] tool   run_sql({\"query\": \"SELECT AVG(julianday(closed) - julianday(opened)) FROM service_requests WHERE category = 'repair' AND closed IS NOT NULL\"})  4 ms\n      got:  {\"columns\": [\"AVG(julianday(closed) - julianday(opened))\"], \"rows\": [[...]]}\n[3] tool   run_sql({\"query\": \"SELECT AVG(julianday(closed) - julianday(opened)) FROM service_requests WHERE category = 'inspection' AND closed IS NOT NULL\"})  3 ms\n      got:  {\"columns\": [\"AVG(julianday(closed) - julianday(opened))\"], \"rows\": [[...]]}\n[4] model  end_turn  in=3240   out=95",
          "title": "A step with two parallel calls in show_trace.py (illustrative numbers)"
        },
        "Your loop already handles this. Look again at the act-and-observe part of `run()`. It loops over *every* `tool_use` block, collects *all* the results in one list, and sends that list back in one user message. The rules for returning parallel results, from [[claude-parallel-tools]]:",
        {
          "list": [
            "**One `tool_result` for every `tool_use`.** Every call gets an answer, matched by `tool_use_id`. If you decide not to run a call, perhaps because an earlier one failed, still return a result for it with `is_error` true and a short reason, such as \"Not executed: the preceding call failed.\"",
            "**All results in one user message.** Not one message per result. The docs call this the most common mistake, and note that it teaches the model to stop making parallel calls.",
            "**Results first.** In that message, every `tool_result` block comes before any text.",
            "**Execution order is yours.** The API does not say whether you run the calls one after another or at the same time. Lab 3 runs them one after another, which is simplest and fine for fast local tools."
          ]
        },
        "To switch the behavior off, set `disable_parallel_tool_use` to true *inside* the `tool_choice` object, for example `tool_choice={\"type\": \"auto\", \"disable_parallel_tool_use\": True}`. With `auto`, the model then calls at most one tool per response. It is not a top-level parameter of `messages.create()`.",
        "The second idea in this topic's title is that **tool results are context**. Whatever a tool returns becomes part of the conversation, and is re-sent on every later step. That has three consequences:",
        {
          "table": {
            "head": [
              "Consequence",
              "Why",
              "What Lab 3 does about it"
            ],
            "rows": [
              [
                "Cost",
                "Every result is re-sent with every later model call.",
                "`run_sql` returns at most 50 rows, so the agent aggregates in SQL instead of reading raw data."
              ],
              [
                "Accuracy",
                "The model believes what tools tell it. A wrong or cut-off result becomes a wrong answer.",
                "Results are JSON with column names, so the model can tell what each number means. Module 4 adds checks for empty and garbled results."
              ],
              [
                "Safety",
                "A result is text from outside your program. Text inside it that looks like an instruction may be followed.",
                "Results stay inside `tool_result` blocks, where the docs recommend keeping untrusted content, never in the system prompt. Module 12 tests this."
              ]
            ],
            "caption": "Tool results are context: cost, accuracy, and safety"
          }
        },
        {
          "callout": "Return what the model needs for its next decision and nothing else. Labeled columns beat bare arrays. Names beat internal ids. A note such as \"(truncated to 50 rows)\" beats a silent cut. The guide [[writing-tools-for-agents]] calls this returning high-signal information.",
          "title": "Make results easy to read",
          "tone": "tip"
        },
        "Batching only helps when the calls are truly independent. If the model batches a `write_file` together with the `run_sql` whose answer the file should contain, the write runs before the number exists. The docs suggest two fixes. Return an error for the dependent call, so the model reissues it on the next turn. And add a line to the system prompt: \"Only batch tool calls that are independent of each other.\""
      ],
      "takeaway": "When the model asks for several independent tools at once, run them all and return every result, matched by `tool_use_id`, in one user message; and remember that every result becomes context the model pays for and believes.",
      "check": [
        {
          "q": "A student's loop sends each `tool_result` in a separate user message. What is wrong, and what is the fix?",
          "a": "The docs list it as the most common parallel-tool mistake: results for one assistant turn belong together in one user message, and splitting them teaches the model to stop making parallel calls. Collect all results in a list and send one message."
        },
        {
          "q": "Why does Lab 3 cap `run_sql` at 50 rows, even though 5,000 rows would fit in the context window?",
          "a": "The result is re-sent on every later step, so its cost multiplies. Long, noisy input also makes answers less reliable (Module 1). The agent should aggregate in SQL and read a small answer, not scan raw rows."
        },
        {
          "q": "The model sends three calls in one response, and you decide to skip the third because the second failed. What must you still send back?",
          "a": "A `tool_result` for all three, each with its own `tool_use_id`. The skipped one gets `is_error` true and a short reason such as \"Not executed: the preceding call failed.\" Every `tool_use` must get an answer."
        }
      ],
      "readings": [
        "claude-parallel-tools",
        "claude-handle-tool-calls",
        "writing-tools-for-agents"
      ]
    },
    {
      "topic": "stopping",
      "blocks": [
        "An agent loop needs a way to end. A **{{stopping-condition|stopping condition}}** is any rule that ends it. There are two kinds: the task is done, or a limit is reached. Lab 3's `run()` has three conditions, and each writes a different `reason` into the `end` event of the {{trace|trace}}.",
        {
          "table": {
            "head": [
              "Condition",
              "How it is checked",
              "Trace reason",
              "What the user sees"
            ],
            "rows": [
              [
                "The model answered",
                "`response.stop_reason != \"tool_use\"`",
                "`answered`",
                "The model's text"
              ],
              [
                "Token budget",
                "Input plus output tokens for the whole run exceed `TOKEN_BUDGET` (default 60,000), checked after each step's tools run",
                "`token budget`",
                "`[stopped: token budget of 60000 exceeded after N steps]`"
              ],
              [
                "Step limit",
                "The `for` loop runs out after `MAX_STEPS` model calls (default 10)",
                "`step limit`",
                "`[stopped: step limit of 10 reached]`"
              ]
            ],
            "caption": "Lab 3's three stopping conditions"
          }
        },
        "**Task completion** is decided by the model. When it answers in text instead of calling a tool, the {{stop-reason|stop reason}} is `end_turn`, and the loop returns. That is the normal exit. Lab 3's system prompt asks for it directly: \"When you have the answer, reply with it in plain text and stop calling tools.\"",
        "**Limits** are decided by your code. They exist because the model's sense of \"done\" can fail. It can loop: re-running a query that keeps failing, or checking the same number again \"to be sure.\" Lab 3's failure task (\"Which city department responded fastest...?\") is built to provoke this, because there is no department column to find. Anthropic's guide [[building-effective-agents]] says it plainly: include stopping conditions, such as a maximum number of iterations, to keep control.",
        "Each limit protects something different:",
        {
          "list": [
            "**A step limit** bounds the number of model calls, and so the worst-case wait. It is easy to reason about, but one step can be cheap or expensive.",
            "**A token budget** bounds the work actually done. Because history is re-sent every step, tokens grow faster than steps: a 10-step run can cost several times a 5-step one.",
            "**A cost limit** bounds money, which is what a manager will ask about. Lab 4 adds `MAX_COST_USD`, computed from tokens and the prices you looked up in Lab 1.",
            "**A time limit** suits interactive use: stop after so many seconds, whatever else is true."
          ]
        },
        {
          "code": "cd $HOME\\agentic-ai\\agentic-lab03\n$env:MAX_STEPS = \"1\"\npython agent.py \"What is 17.5% of 2,340, plus a $35 filing fee?\"\nRemove-Item Env:MAX_STEPS",
          "title": "Lab 3: prove the step limit fires (PowerShell)",
          "note": "Expected: step 1 calls the calculator, then `[stopped: step limit of 1 reached]`. The tool ran, but the model never got to read its result. A limit you have never seen fire is a limit you do not know works."
        },
        "Two details in Lab 3's code are worth noticing. First, the token budget is checked *after* a step's tools run, so a run can overshoot it by one step. It is a soft ceiling, not an exact one. Second, `stop_reason != \"tool_use\"` treats every other stop reason as an answer, including `max_tokens` (the reply was cut off) and `refusal`. The trace still records the real `stop_reason` on each model event, so you can find those runs, but a stricter loop would end them with their own reason.",
        {
          "callout": "When Lab 3 hits a limit, the user gets a bracketed message and nothing else, even if the agent had already found most of the answer. Module 4 replaces this with a graceful finish: one last call with tools switched off, asking for the best answer so far and what is still missing.",
          "title": "A bare stop message is a poor ending",
          "tone": "warning"
        }
      ],
      "takeaway": "Every agent loop needs two kinds of exit: the model deciding the task is done, and hard limits in code on steps, tokens, or dollars that end the run when the model's judgment fails.",
      "check": [
        {
          "q": "With `MAX_STEPS` set to 1, the calculator ran but the user got no answer. Why?",
          "a": "The step limit counts model calls. The first call asked for the tool, and the tool ran, but the loop ended before a second model call could read the result and write the answer."
        },
        {
          "q": "Why does a token budget catch runaway cost better than a step limit alone?",
          "a": "Each step re-sends the growing history, so each step costs more than the one before. Ten late steps in a long run can cost far more than ten early ones. A token budget measures the work actually done, not the number of turns."
        },
        {
          "q": "A run ends with reason `answered`, but the answer stops mid-sentence. What happened, and how would you change the loop?",
          "a": "The model hit `max_tokens`, and Lab 3 treats any stop reason other than `tool_use` as an answer. Check for `max_tokens` (and `refusal`) explicitly and end with its own reason, or raise `max_tokens`, so a truncated answer is never reported as complete."
        }
      ],
      "readings": [
        "building-effective-agents",
        "claude-stop-reasons"
      ]
    },
    {
      "topic": "react",
      "blocks": [
        "**ReAct**, short for *reasoning and acting*, is the 2022 paper [[react]] that gave the agent loop its standard shape. The authors had a model alternate between three kinds of step. A **thought** is reasoning in plain language about what to do next. An **action** is a call to an outside tool; in the paper, a simple Wikipedia API. An **observation** is the tool's result, fed back in. The model repeats this until it takes a finishing action with its answer.",
        "The {{react-pattern|ReAct pattern}} mattered because it combined two things that earlier work kept apart. Chain-of-thought prompting ([[cot]]) let models reason step by step, but only from what they already knew, so a wrong fact early on led the whole chain astray. Acting alone let a model use tools, but without a plan. Interleaving the two let the reasoning choose the next lookup, and let each lookup correct the reasoning. On question answering and fact checking, the paper reports fewer {{hallucination|hallucinations}} and less error propagation than reasoning alone. On two interactive tasks it beat the imitation-learning and reinforcement-learning methods it was compared with.",
        {
          "table": {
            "head": [
              "Element",
              "ReAct (2022)",
              "Lab 3 today"
            ],
            "rows": [
              [
                "Thought",
                "Free text the model wrote, kept in the prompt",
                "The optional text block before the `tool_use` blocks; logged as `text` on each model event"
              ],
              [
                "Action",
                "A short text command, such as a search, that the harness parsed out of the model's output",
                "A `tool_use` block with a `name` and JSON `input`. Nothing to parse."
              ],
              [
                "Observation",
                "The result, appended to the prompt as text",
                "A `tool_result` block, matched by `tool_use_id`"
              ],
              [
                "Finish",
                "A special finishing action holding the answer",
                "A reply whose `stop_reason` is `end_turn`"
              ],
              [
                "Teaching the format",
                "One or two worked examples in the prompt",
                "None needed: tool use is trained in, and the tool definitions describe the actions"
              ]
            ],
            "caption": "The ReAct loop, then and now"
          }
        },
        "That table is the main point. **Native tool calling is ReAct built into the API.** You no longer parse actions out of free text, because the model emits structured `tool_use` blocks. You no longer need worked examples to teach the format, because the model is trained for it.",
        "The *thought* part is still visible, and still useful. Before a tool call the model often writes a sentence such as \"First I'll check which tables exist.\" Lab 3 logs it on each model event, and `show_trace.py` prints it as `says:`:",
        {
          "code": "TASK  How many facilities of each type are in ward 3? Save the answer as a Markdown table to reports/ward3.md.\n\n[1] model  tool_use  in=1342   out=88\n      says: I'll start by looking at the database schema.\n[1] tool   run_sql({\"query\": \"SELECT name, sql FROM sqlite_master WHERE type='table'\"})  2 ms\n      got:  {\"columns\": [\"name\", \"sql\"], \"rows\": [[\"facilities\", \"CREATE TABLE facilities (...\n[2] model  tool_use  in=1702   out=96\n      says: Now I'll count the facilities in ward 3 by type.\n[2] tool   run_sql({\"query\": \"SELECT type, COUNT(*) FROM facilities WHERE ward = 3 GROUP BY type\"})  1 ms\n      got:  {\"columns\": [\"type\", \"COUNT(*)\"], \"rows\": [...]}",
          "title": "Thought, action, observation in a Lab 3 trace (illustrative)",
          "note": "Each `says:` line is a thought, each tool line is an action, and each `got:` line is an observation. Wording and numbers on your machine will differ."
        },
        "Reading those `says:` lines is how you find where an agent's reasoning went wrong. In the failure task, the moment the model announces it will treat facility type as a department is the line to quote in FAILURE.md.",
        "Some limits of the pattern carry over to everything built on it:",
        {
          "list": [
            "**A written thought is the model's account, not a guaranteed record.** Check what the tools actually returned, not only what the model says it is doing.",
            "**An observation can only correct the next thought if it is informative.** A bare \"ERROR\" teaches the model nothing. Module 4 spends a whole topic on error messages for this reason.",
            "**Errors still compound.** Each step builds on the last, so an early wrong turn shapes everything after it. The trace is how you find the step where it started."
          ]
        },
        {
          "callout": "Frameworks, papers, and job interviews still use its vocabulary. You will also meet harnesses that parse actions out of plain text, especially with open-weight models. And later ideas build directly on it: the self-critique loop in [[reflexion]], and Module 8's {{evaluator-optimizer|evaluator-optimizer}} pattern.",
          "title": "Why learn the paper if the API does it for you?",
          "tone": "aside"
        }
      ],
      "takeaway": "ReAct interleaves reasoning, tool actions, and observations in a loop; native tool calling builds that loop into the API, and the model's short reasoning notes at each step are what you read to debug it.",
      "check": [
        {
          "q": "Map each ReAct element onto the output of `show_trace.py`.",
          "a": "Thought: the `says:` text on a model line. Action: a tool line with the tool name and its input. Observation: the `got:` line under it. Finish: the last model line, with `end_turn`, followed by the END line."
        },
        {
          "q": "What weakness of reasoning alone did ReAct address, and how?",
          "a": "Chain-of-thought reasons only from what the model already knows, so a wrong fact early on spreads through every later step. ReAct lets the model look things up between reasoning steps, so observations from a real source can correct the chain."
        },
        {
          "q": "The ReAct paper put worked examples in its prompts. Why don't Lab 3's prompts need them?",
          "a": "The paper's harness parsed actions out of free text, so the model had to be shown the exact format. Current models are trained for tool use, the API defines the format (`tool_use` and `tool_result` blocks), and the tool definitions describe the available actions."
        }
      ],
      "readings": [
        "react",
        "cot",
        "reflexion",
        "building-effective-agents"
      ]
    }
  ]
};
