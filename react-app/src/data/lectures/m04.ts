import type { LectureNotesDef } from "../types";

// Module 4 — Robust agents: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M04_NOTES: LectureNotesDef = {
  "moduleId": "m04",
  "intro": "These notes go with the Module 4 lecture and Lab 4. Lab 3's agent works on a good day. This module asks what it does on a bad one: when a query times out, the database is locked, or a tool hands back an empty or half-finished result. The running example is the lab's: the same public works agent, with `chaos.py` injecting faults under the dispatcher, a fixed task list in `tasks.py`, and `eval_run.py` sorting every run into a pass, an honest failure, or a confidently wrong answer. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "tool-errors",
      "blocks": [
        "Tools fail. In an agent, the question is not *whether* a tool fails but *what the model learns* when it does. Lab 3's `dispatch()` already made one good decision: it never raises. A failure comes back as a `tool_result` with `is_error` set to true, and the model reads it. This topic is about what that result should say.",
        "Lab 4's `chaos.py` makes four kinds of failure happen on purpose. This is **{{fault-injection|fault injection}}**: breaking a dependency deliberately, so you see how your system behaves before a real outage shows you. The four faults fall into two groups that need different handling:",
        {
          "table": {
            "head": [
              "Fault",
              "What chaos.py does",
              "Loud or quiet",
              "Typical effect on the Lab 3 agent"
            ],
            "rows": [
              [
                "Timeout",
                "Raises `TimeoutError`: the tool \"did not respond within 5 s\"",
                "Loud: `is_error` is true",
                "Gives up, or guesses a number"
              ],
              [
                "Transient",
                "Raises `ConnectionError: database is locked`",
                "Loud",
                "Gives up, or guesses a number"
              ],
              [
                "Empty",
                "Returns `{\"columns\": [], \"rows\": []}` as a success",
                "Quiet: `is_error` is false",
                "Reports \"there are 0\""
              ],
              [
                "Garbled",
                "Returns the first third of the real output as a success",
                "Quiet",
                "Reads a cut-off number as the answer"
              ]
            ],
            "caption": "The four faults in chaos.py, which wraps every tool except write_file"
          }
        },
        "Loud faults are the easier half: the model at least knows something went wrong. **Quiet faults are the dangerous half.** The tool reports success and hands back something false, and the Lab 3 agent believes it. That is how `eval_run.py` produces `WRONG` outcomes: confident answers that are false. So hardening has two jobs. Turn quiet faults into loud ones, and make loud ones useful.",
        "**Turning quiet faults loud.** Lab 4's hardened `dispatch()` checks what `run_sql` returns before passing it on. Its helper `_check_output()` parses the JSON and raises `BadOutput` if it cannot, so a cut-off result becomes an error instead of a number. An empty row list is treated as surprising: the call is tried once more, and if it is still empty, the result goes through with a note saying it was re-checked.",
        "**Making loud faults useful.** The Claude docs ([[claude-handle-tool-calls]]) ask for instructive error messages: say what went wrong and what to try next, not just \"failed.\" Lab 4 rewrites each error with the model as the reader:",
        {
          "table": {
            "head": [
              "Situation",
              "Lab 3 message",
              "Lab 4 message"
            ],
            "rows": [
              [
                "Wrong column",
                "`ERROR: OperationalError: no such column: department`",
                "`ERROR: ValueError: no such column: department. The database has: facilities(id, name, type, ward); service_requests(id, facility_id, category, opened, closed, cost_usd)`"
              ],
              [
                "Wrong argument name",
                "`ERROR: TypeError: run_sql() got an unexpected keyword argument 'sql'`",
                "`ERROR: bad arguments for run_sql: ...` followed by `Check the tool's input schema and call it again.`"
              ],
              [
                "Unknown tool",
                "`ERROR: unknown tool 'send_email'`",
                "The same, plus `Available tools: calculator, run_sql, read_file, write_file.`"
              ],
              [
                "Three transient failures in a row",
                "The raw exception text",
                "`ERROR: run_sql failed 3 times in a row (...). This is a temporary fault in the tool, not a problem with your query. Do not estimate or invent the missing data; if you cannot finish without it, say so.`"
              ]
            ],
            "caption": "Error messages written for the model that has to recover"
          }
        },
        "The schema in the first row comes from a few lines in the hardened `run_sql()`:",
        {
          "code": "except sqlite3.OperationalError as e:\n    msg = str(e)\n    if msg == \"interrupted\":\n        raise ValueError(f\"query ran longer than {QUERY_TIMEOUT_S:.0f} s; \"\n                         f\"add a WHERE clause, aggregate, or LIMIT\") from None\n    if msg.startswith(\"no such\"):\n        raise ValueError(f\"{msg}. The database has: {_schema_summary(con)}\") from None\n    raise",
          "title": "From Lab 4's run_sql(): errors that say how to fix the call"
        },
        "The {{system-prompt|system prompt}} does the other half. Lab 4 adds instructions for errors in general: read the error; fix your arguments if it says they are wrong; try once more if it says the fault is temporary; and if you still cannot get the data, say exactly what is missing, because \"a clearly stated gap is a good answer; an estimate presented as a fact is a bad one.\" The message says *what* happened. The prompt says *how to behave* when things go wrong.",
        {
          "callout": "An error message is tool output, so it lands in the conversation and in the {{trace|trace}}. Include what helps the model recover: the schema, the allowed values, the limit that was hit. Leave out stack traces with file paths, connection strings, and anything secret. Module 12 treats tool output as an attack surface in both directions.",
          "title": "Helpful, not leaky",
          "tone": "warning"
        }
      ],
      "takeaway": "Return every tool failure to the model as a result, write the message for the model that must recover (what went wrong and what to try next), and turn quiet failures such as empty or cut-off results into loud ones.",
      "check": [
        {
          "q": "Why is an empty result more dangerous than a timeout?",
          "a": "A timeout comes back with `is_error` true, so the model knows data is missing. An empty result comes back as a success, so the model concludes the real answer is zero and says so confidently. That is a WRONG outcome, not an honest failure."
        },
        {
          "q": "Rewrite `ERROR: bad input` for a `read_file` call with the path `../.env`, so it helps the model without helping an attacker.",
          "a": "For example: \"ERROR: '../.env' is outside the workspace folder. Paths must be relative to workspace/, such as reports/ward3.md.\" It states the rule and gives a valid example, and reveals nothing about the file system that the tool does not already allow."
        },
        {
          "q": "The hardened `dispatch()` tries an empty `run_sql` result once more before passing it on. Why once, and what does its note tell the model?",
          "a": "One extra try is enough to tell a one-off fault from a real empty answer, at little cost. If the second try is also empty, the note says the result was re-checked and is probably real, so the model can report zero with good reason instead of doubting it."
        }
      ],
      "readings": [
        "claude-handle-tool-calls",
        "writing-tools-for-agents",
        "building-effective-agents"
      ]
    },
    {
      "topic": "retries",
      "blocks": [
        "A retry runs a failed operation again in the hope that it works this time. It is the right response to some failures and the wrong response to others. Lab 4's hardened `dispatch()` follows three rules for telling them apart:",
        {
          "list": [
            "**Retry only transient failures.** A {{transient-error|transient error}} is one that may not happen if you try again shortly: a timeout, a locked database, a dropped connection. Lab 4 lists them as `TRANSIENT = (TimeoutError, ConnectionError)`, and also retries `BadOutput`, its own error for a garbled result. A wrong column name is not transient. The same query fails the same way every time, so that error goes straight back to the model.",
            "**Retry only idempotent operations.** An operation has the property of **{{idempotency|idempotency}}** when running it twice has the same effect as running it once. Reads qualify: `calculator`, `run_sql` on a read-only database, and `read_file`. Lab 4 lists exactly those in `IDEMPOTENT`, and every other tool gets one try.",
            "**Stop after a limit.** `MAX_TRIES = 3`. After that, the error goes back to the model with a message saying the fault is temporary and the missing data must not be invented."
          ],
          "ordered": true
        },
        "Why does idempotency matter? Imagine a `send_email` tool that times out. A timeout means *you did not hear back*, not that nothing happened. Retry it, and the mayor may get the email twice. Now imagine `charge_card`. That is why `write_file` gets one try in Lab 4, even though overwriting a file is fairly harmless, and why `chaos.py` never injects faults into it: a half-written file is a mess nobody should have to clean up.",
        "When a write really must be retried, the standard fix is an **idempotency key**. The caller makes up a unique id for the operation and sends it with every attempt. The server remembers the result for that key, and a repeat request gets the saved result instead of doing the work again. Stripe's payment API works this way ([[stripe-idempotency]]).",
        "**Backoff** is the wait between attempts. **{{exponential-backoff|Exponential backoff}}** doubles the wait each time, so a struggling service gets more breathing room the longer it struggles. **{{jitter|Jitter}}** adds a random amount to each wait. Without it, many clients that failed at the same moment retry at the same moment, and hit the service again in waves. Marc Brooker's article [[backoff-jitter]] shows the effect in simulation and concludes that jittered backoff should be the standard approach for remote clients.",
        {
          "code": "for attempt in range(1, tries + 1):\n    try:\n        output = FUNCTIONS[name](**args)\n        ...                                   # output checks, then return output, False\n    except TRANSIENT + (BadOutput,) as e:\n        last = f\"{type(e).__name__}: {e}\"\n        if attempt < tries:\n            time.sleep(BACKOFF_S * 2 ** (attempt - 1) + random.uniform(0, BACKOFF_S))",
          "title": "The retry loop in Lab 4's dispatch() (trimmed)",
          "note": "With `BACKOFF_S = 0.5`, the waits are about 0.5 s and then 1 s, each plus up to 0.5 s of random jitter. There is no wait after the last attempt."
        },
        "A **timeout** is the other half of a retry policy: how long to wait before calling an attempt failed. Without one, a hung call hangs the agent forever, and no retry ever happens. Lab 4's `run_sql` has a real one. SQLite's progress handler interrupts any query that runs longer than `QUERY_TIMEOUT_S` (5 seconds), and `check_hardening.py` proves it with a query that would otherwise never end.",
        {
          "table": {
            "head": [
              "Layer",
              "Who retries",
              "What",
              "Limit"
            ],
            "rows": [
              [
                "Model API call",
                "The `anthropic` {{sdk|SDK}}",
                "Connection errors, timeouts, rate limits (429), and server errors (500 and up)",
                "2 retries by default, with short exponential backoff; set `max_retries` on the client"
              ],
              [
                "Tool call",
                "Your `dispatch()`",
                "Transient faults in idempotent tools",
                "`MAX_TRIES = 3`"
              ],
              [
                "Task",
                "The model",
                "Calling a tool again after reading its error",
                "Only the step, token, and cost budgets"
              ]
            ],
            "caption": "Three layers of retry in the Lab 4 agent"
          }
        },
        "Retries multiply across layers. If the model re-issues a failing call twice, and each call is tried three times, one bad query runs six times, and every model attempt re-sends the whole history. Keep each layer's limit small, and know which layer you are relying on. [[anthropic-python-sdk]] documents the SDK's own retry and timeout settings.",
        {
          "callout": "Lab 4's `compare.py` reports mean tokens and the number of tool errors the model saw, before and after. If hardening raised the pass rate but also doubled the tokens, that is a real trade-off. It belongs in RESULTS.md, under \"What hardening cost.\"",
          "title": "Count what retries cost",
          "tone": "tip"
        }
      ],
      "takeaway": "Retry only failures that are transient and operations that are idempotent, with a timeout on every attempt, exponential backoff with jitter between attempts, and a small limit at each layer.",
      "check": [
        {
          "q": "Why does Lab 4 give `write_file` only one try, even though writing the same file twice is mostly harmless?",
          "a": "The rule is about the kind of tool, not this one file. A write has side effects, so a blind retry could duplicate or corrupt them, and the habit has to be the same for `send_email` or `charge_card`. One try and an honest error is the safe default for any tool not listed as idempotent."
        },
        {
          "q": "Fifty copies of an agent hit a locked database at the same instant. Compare retrying after a fixed 1 second with retrying after exponential backoff plus jitter.",
          "a": "With a fixed wait, all fifty retry together after 1 second and collide again, wave after wave. With backoff the waits grow, and jitter spreads the fifty retries over time, so fewer collide and the database recovers sooner."
        },
        {
          "q": "A query fails with `no such column: department`. Should `dispatch()` retry it?",
          "a": "No. The error is not transient: the same query fails the same way every time. Lab 4 returns it at once with the table and column names, so the model can fix the query. Retrying would only waste time on backoff sleeps."
        }
      ],
      "readings": [
        "backoff-jitter",
        "stripe-idempotency",
        "anthropic-python-sdk",
        "claude-api-errors"
      ]
    },
    {
      "topic": "budgets",
      "blocks": [
        "Module 3 gave the agent hard limits. This topic is about choosing them, and about what happens when one is reached. Lab 4's `agent.py` keeps Lab 3's step limit and token budget, adds a dollar budget, and changes how every limit ends.",
        {
          "table": {
            "head": [
              "Budget",
              "Setting (default)",
              "Protects",
              "Measured from"
            ],
            "rows": [
              [
                "Steps",
                "`MAX_STEPS` (10)",
                "Waiting time, and runaway loops",
                "The number of model calls"
              ],
              [
                "Tokens",
                "`TOKEN_BUDGET` (60,000)",
                "Work done, and context growth",
                "`response.usage`, added up across the run"
              ],
              [
                "Dollars",
                "`MAX_COST_USD` (0.05)",
                "Money",
                "Tokens times `PRICE_IN` and `PRICE_OUT`"
              ]
            ],
            "caption": "Lab 4's three budgets, each read from an environment variable"
          }
        },
        "Each one is a {{stopping-condition|stopping condition}} enforced by code. The dollar budget uses the same arithmetic `ask.py` used in Lab 1:",
        {
          "code": "def cost(tokens_in: int, tokens_out: int) -> float:\n    return tokens_in / 1e6 * PRICE_IN + tokens_out / 1e6 * PRICE_OUT",
          "title": "agent.py: cost from token counts",
          "note": "`PRICE_IN` and `PRICE_OUT` are dollars per million tokens, copied from Lab 1 and [[claude-pricing]]. Left at 0.00, the cost budget can never trigger, so a forgotten price silently switches it off."
        },
        "**Choosing the numbers.** Run the clean control (`CHAOS_RATE=0`) and read the END lines in the traces. Suppose a normal ward task finishes in 4 steps and about 15,000 tokens; those numbers are illustrative, so use your own. Then a budget of 10 steps and 60,000 tokens leaves room for a few recoveries without allowing a runaway. Set limits from measured runs, and check them again whenever the model, the tools, or the prompt change.",
        "**Graceful termination** is the bigger change. In Lab 3, hitting a limit returned a bare `[stopped: step limit of 10 reached]`, throwing away everything the agent had found. In Lab 4, every limit ends through `finish()`:",
        {
          "code": "def finish(messages, reason, trace, step, used, spent) -> str:\n    \"\"\"Out of budget: one last call with tools switched off, for an honest partial answer.\"\"\"\n    note = {\"type\": \"text\", \"text\": (\n        f\"[{reason}] Stop using tools now. In two or three sentences, give the best answer \"\n        \"you can from what you have already found, and say plainly what is missing or unverified.\"\n    )}\n    if messages[-1][\"role\"] == \"user\" and isinstance(messages[-1][\"content\"], list):\n        messages[-1][\"content\"].append(note)  # after the tool results, same turn\n    else:\n        messages.append({\"role\": \"user\", \"content\": [note]})\n    response = client.messages.create(\n        model=MODEL, max_tokens=400, temperature=0, system=SYSTEM,\n        tools=TOOLS, tool_choice={\"type\": \"none\"}, messages=messages,\n    )\n    ...",
          "title": "Lab 4's finish(): one last call, with tools switched off (trimmed)"
        },
        "Three details make it work:",
        {
          "list": [
            "**The note goes after the tool results, in the same user message.** That keeps the API's rule that `tool_result` blocks come first.",
            "**`tool_choice` is set to `{\"type\": \"none\"}`.** The tools list is still passed, but the API forbids calling any of them on this one request, so the model must answer in text. Asking politely in the note would not be a guarantee.",
            "**`max_tokens=400`** keeps the last call short, so the finish itself cannot blow the budget."
          ]
        },
        "The result is an answer a person can use: `[step limit]` followed by two or three sentences about what was found and what is missing. The bracketed reason stays at the front, and the trace's `end` event records the same reason, so both a reader and `eval_run.py` can tell a complete answer from a budget stop.",
        {
          "callout": "The Claude docs on stop reasons ([[claude-stop-reasons]]) note that a text block placed right after tool results can occasionally produce an empty reply. If you ever see `[step limit]` with nothing after it, that is the likely cause, and the page describes the fix. Treat an empty finish as an honest failure, never as an answer.",
          "title": "If finish() returns nothing",
          "tone": "aside"
        },
        {
          "callout": "`MAX_COST_USD` stops one run. Lab 4's evaluation is 6 tasks times 3 trials times 3 conditions: 54 runs. Estimate the total before you start, use `TRIALS=1` for a dry run, and set a spend limit on your API account in the Claude Console as the last line of defense.",
          "title": "A per-run budget is not a monthly budget",
          "tone": "warning"
        }
      ],
      "takeaway": "Set step, token, and dollar budgets from measured runs, and end every limit gracefully: one last tool-free call that reports what was found and what is missing.",
      "check": [
        {
          "q": "Why does `finish()` set `tool_choice` to none, instead of just asking the model in the note to stop using tools?",
          "a": "The note is a request the model might not follow. If it called one more tool, the loop has already ended and nobody would run it. `tool_choice` none is enforced by the API, so the reply is guaranteed to be text."
        },
        {
          "q": "You forgot to copy the prices into `PRICE_IN` and `PRICE_OUT`. What happens, and how would you catch it?",
          "a": "`cost()` always returns 0, so the dollar budget never fires and nothing tells you. Catch it with a startup check that refuses to run when either price is zero, or by testing the budget on purpose with a tiny `MAX_COST_USD`, the way Lab 3 tested the step limit."
        },
        {
          "q": "With `MAX_STEPS` set to 1, compare what the user sees from Lab 3 and from Lab 4 on the ward question.",
          "a": "Lab 3 returns `[stopped: step limit of 1 reached]` and nothing else. Lab 4 returns `[step limit]` followed by two or three sentences: what the agent found in its one step, often only the schema, and that it could not compute the answer. Same budget, same work, but the second is something a person can act on."
        }
      ],
      "readings": [
        "claude-pricing",
        "claude-define-tools",
        "claude-stop-reasons"
      ]
    },
    {
      "topic": "tool-design",
      "blocks": [
        "Every tool is an interface, and the model is its only user. Anthropic's guide [[building-effective-agents]] calls this the agent-computer interface, and says it deserves as much design effort as an interface for people. This topic covers the two biggest decisions: how much each tool should do, and how it checks what it is given.",
        "A **narrow tool** does one specific thing, such as `count_open_requests(ward)`. A **general tool** accepts a whole language, such as `run_sql(query)`. Lab 3 chose a general tool on purpose, so the agent could answer questions nobody anticipated. That choice has costs:",
        {
          "table": {
            "head": [
              "Aspect",
              "Narrow tool",
              "General tool"
            ],
            "rows": [
              [
                "Example",
                "`ward_repair_total(year)`",
                "`run_sql(query)`"
              ],
              [
                "What the model must know",
                "Which tool fits the question",
                "The schema, SQL, and the data's quirks, such as dates stored as text"
              ],
              [
                "Room for error",
                "Small: few arguments, each easy to check",
                "Large: a valid query can answer the wrong question"
              ],
              [
                "Safety",
                "Simple: the tool can only do one thing",
                "Needs guards: read-only connection, SELECT only, a row cap, a timeout"
              ],
              [
                "Questions it can answer",
                "Only the ones you built it for",
                "Almost any, including ones you never imagined"
              ],
              [
                "Token cost",
                "Many tools mean many definitions, sent on every call",
                "One definition"
              ]
            ],
            "caption": "Narrow and general tools compared"
          }
        },
        "The guide [[writing-tools-for-agents]] lands between the extremes. Do not wrap every API endpoint as its own tool, and do not hand the model unlimited power either. Build a few tools that match how the work is actually done. A common pattern is a general tool for looking things up plus a narrow tool for each risky action: `run_sql` for questions, and a separate `close_request(id, note)` for the one write that matters. Once you have more than a handful, give related tools a shared prefix, such as `town_run_sql` and `town_read_file`, so the model can tell groups apart.",
        "**Argument validation** is the second decision. Validate inside the tool, because that is the one place it cannot be skipped. The {{tool-schema|tool schema}} tells the model what to send; the function decides what it accepts. Lab 4's `run_sql` checks the query and sets its limits before it reads any data:",
        {
          "code": "def run_sql(query: str) -> str:\n    q = query.strip().rstrip(\";\")\n    if not q.lower().startswith((\"select\", \"with\")):\n        raise ValueError(\"only one read-only SELECT (or WITH ... SELECT) query is allowed\")\n\n    con = sqlite3.connect(f\"file:{DB_PATH.as_posix()}?mode=ro\", uri=True)\n    deadline = time.monotonic() + QUERY_TIMEOUT_S\n    con.set_progress_handler(lambda: time.monotonic() > deadline, 10_000)  # real timeout\n    ...",
          "title": "The opening of Lab 4's run_sql(): check the argument, then enforce limits",
          "note": "The prefix check gives the model a clear, early error. The read-only connection is the real guarantee: even a query that slips past the check cannot write. Each layer would hold on its own."
        },
        "Some design habits from the readings, each tied to the labs:",
        {
          "list": [
            "**Make mistakes hard to make.** The guide calls this poka-yoke, a manufacturing term for mistake-proofing. `_safe_path` resolves every path inside `workspace/`, so reading `../.env` is impossible, not merely discouraged.",
            "**Name arguments plainly.** `query`, `path`, `expression`; not `input` or `data`. `check_hardening.py` sends `sql` instead of `query` to show what happens when the model gets a name wrong.",
            "**Return a small, labeled answer.** `run_sql` returns column names with the rows and says when it truncated. Five thousand unlabeled rows make the model's job harder and the run more expensive.",
            "**Consider `strict`.** Setting `strict` to true on a definition makes the API keep arguments inside the schema (Module 3, topic 3). It removes the wrong-argument-name case, but not the need for checks like the ones above.",
            "**Test tools without the model.** `check_tools.py` and `check_hardening.py` call `dispatch()` directly. A tool bug found that way costs nothing. Found through the agent, it costs a run and a confusing trace."
          ]
        },
        {
          "callout": "A system prompt that says \"never write to the database\" is a request. `mode=ro` is a guarantee. Put every rule that must hold into the tool, or below it, and use the prompt only for preferences. Module 12 builds a permissions inventory on exactly this distinction, under the name {{least-privilege|least privilege}}.",
          "title": "The model is not your security boundary",
          "tone": "warning"
        }
      ],
      "takeaway": "Design tools with the model as their user: as few as the task needs, general where flexibility pays and narrow where risk is high, with arguments validated and limits enforced inside the function.",
      "check": [
        {
          "q": "Staff want the agent to close service requests. Would you add a general `run_write_sql(query)` or a narrow `close_request(id, note)`? Why?",
          "a": "The narrow tool. It can do exactly one thing, its arguments are easy to check (the id exists, the request is still open), and it can record who closed what. A general write tool would let one bad query change or delete any row in the database."
        },
        {
          "q": "Lab 4's `run_sql` checks that the query starts with SELECT or WITH, and also opens the database read-only. Isn't one of those redundant?",
          "a": "They do different jobs. The prefix check gives the model a clear, early error message. The read-only connection is the guarantee: a cleverly built statement that passes the prefix check still cannot write. Each layer holds even if the other fails."
        },
        {
          "q": "Name two costs of replacing `run_sql` with ten narrow query tools.",
          "a": "Ten definitions are sent with every model call, costing input tokens on every step. The model must choose among similar tools, which adds selection mistakes. And any question none of the ten covers can no longer be answered at all."
        }
      ],
      "readings": [
        "writing-tools-for-agents",
        "building-effective-agents",
        "claude-define-tools"
      ]
    },
    {
      "topic": "observability",
      "blocks": [
        "**{{observability|Observability}}** means being able to answer questions about what your system did from what it recorded, without running it again. For an ordinary program, logs and a few counts are often enough. An agent needs more, because its interesting failures are in the *path*: which tool it chose, with what arguments, what came back, and what it did next.",
        "Lab 3's `Trace` class has recorded that path since the first run. Each event is one JSON object on its own line, a format called JSON Lines, written and flushed the moment it happens:",
        {
          "table": {
            "head": [
              "Event",
              "Written when",
              "Fields"
            ],
            "rows": [
              [
                "`task`",
                "A run starts",
                "`task`, `model`, `max_steps`"
              ],
              [
                "`model`",
                "After each model call",
                "`step`, `stop_reason`, `text`, `tool_calls` (name and input), `input_tokens`, `output_tokens`"
              ],
              [
                "`tool`",
                "After each tool call",
                "`step`, `name`, `input`, `output` (first 2,000 characters), `is_error`, `ms`"
              ],
              [
                "`end`",
                "The run stops",
                "`reason`, `steps`, `tokens`, and in Lab 4 `cost_usd`"
              ]
            ],
            "caption": "The events agent.py writes; every event also carries a timestamp, t"
          }
        },
        "That file is a **{{trace|trace}}**: the complete, ordered record of one run. Three properties make it useful:",
        {
          "list": [
            "**Structured.** Each event is JSON with named fields, not a sentence. `eval_run.py` reads the last line to get the end reason, and counts `tool` events whose `is_error` is true. You could not do that reliably with `print` output.",
            "**Written as it happens.** If a run crashes at step 6, steps 1 to 5 are already on disk. A log written only at the end is lost exactly when you need it.",
            "**Complete enough to diagnose, small enough to keep.** It records every decision and every result, but cuts long outputs short. Lab 3's FAILURE.md and Lab 4's change-to-cause table are both written from traces."
          ]
        },
        "Reading traces is a skill. Lab 4 asks you to read three WRONG runs, and to sort every failure by cause before fixing anything. A diagnosis looks like this:",
        {
          "code": "python show_trace.py traces/eval/before/open_count_1.jsonl\n\n[2] tool   run_sql({\"query\": \"SELECT COUNT(*) FROM service_requests WHERE closed IS NULL\"})  1 ms\n      got:  {\"columns\": [], \"rows\": []}\n[3] model  end_turn  in=2210   out=41\n      says: There are 0 open service requests.",
          "title": "A quiet fault becoming a confident wrong answer (illustrative excerpt)",
          "note": "The empty result was reported as a success, and the model believed it. Cause: trusted an empty result. Lab 4's fix: try a surprising empty result once more before passing it on."
        },
        "Counting across many traces gives you **metrics**: pass rate, the confidently-wrong rate, mean steps, mean tokens, tool errors the model saw, and how runs ended. That is what `compare.py` prints. Metrics tell you *that* something changed. Traces tell you *why*.",
        "One addition is worth making to `Trace`: log `response._request_id` on each model event. Every API response carries a request id, and it is what Anthropic support asks for when a particular call misbehaves ([[claude-api-errors]]).",
        "Production systems use the same ideas with shared tooling. **OpenTelemetry** is an open standard for traces ([[otel-traces]]). In it, a trace is a tree of **{{span|spans}}**. Each span is one unit of work, with a start and end time, attributes such as a tool name, a status, and the id of its parent span. An agent run maps onto this naturally: one span for the run, with a child span for each model call and each tool call. OpenTelemetry also publishes conventions for generative AI ([[otel-genai]]), so traces from different frameworks can use the same attribute names. Module 9's frameworks and Module 11's evaluation harness both build on traces like yours.",
        {
          "callout": "A trace holds the task, every query, and every result, which may include personal or sensitive records. Lab 3 commits its traces because `town.db` is synthetic. With real data, decide what to redact, who may read traces, and how long they are kept. Modules 12 and 13 return to this.",
          "title": "Traces contain data",
          "tone": "warning"
        }
      ],
      "takeaway": "Record every run as a structured trace written as it happens, with each model decision, tool call, result, and token count; count across traces for metrics, and read individual traces to find causes.",
      "check": [
        {
          "q": "Why does `Trace.log()` call `flush()` after every event?",
          "a": "So each event reaches the disk at once. If the process crashes or is stopped partway through, the trace still holds every step up to the failure, which is exactly the part you need to diagnose it."
        },
        {
          "q": "`compare.py` shows confidently wrong answers fell from 4 runs to 0 after hardening. How would you confirm that the hardening caused it?",
          "a": "Open the before and after traces for the same task and trial, which faced the same fault sequence because of `chaos.reseed()`. Find the step where the fault hit, and check that the new check, retry, or error message is what changed the model's behavior."
        },
        {
          "q": "Name two things a trace records that a log of final answers would not.",
          "a": "The arguments of every tool call, and the raw result the model saw, including whether it was an error. Also the `stop_reason` and token counts at each step. Without them you can see that an answer was wrong, but not which step made it wrong."
        }
      ],
      "readings": [
        "otel-traces",
        "otel-genai",
        "claude-api-errors",
        "building-effective-agents"
      ]
    }
  ]
};
