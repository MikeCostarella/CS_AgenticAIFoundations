import type { LectureNotesDef } from "../types";

// Module 7 — Agents in enterprise systems: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M07_NOTES: LectureNotesDef = {
  "moduleId": "m07",
  "intro": "These notes go with the Module 7 lecture, Lab 7, and the week 8 midterm checkpoint. The running example is the lab's Maple Falls IT Help Desk: a small ticketing API with two API keys, a rate limit, cursor pagination, status rules, idempotency keys, and its own audit table. Your agent reaches it through `helpdesk_client.py` and `desk_tools.py`. The last two topics follow the optional reconciliation extension, which adds an asset inventory that disagrees with the help desk. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "apis-as-tools",
      "blocks": [
        "Most enterprise systems already have an API. A ticketing system, an asset database, a staff directory: each exposes endpoints that programs call over HTTP. Turning one into agent tools looks mechanical: one tool per endpoint, one parameter per argument. This topic is about why the mechanical version is a starting point, not the answer.",
        "Two API styles cover most of what you will meet. A **REST** API has many URLs, one per kind of thing, and uses the HTTP method to say what to do: `GET /tickets` lists tickets, `GET /tickets/7` reads one, `PATCH /tickets/7` changes one, and `POST /tickets/7/comments` adds a comment. A **GraphQL** API has a single URL. The caller sends a query naming exactly the fields it wants, and changes go through separately declared operations called *mutations* ([[graphql]]).",
        {
          "table": {
            "head": [
              "",
              "REST (the Lab 7 help desk)",
              "GraphQL"
            ],
            "rows": [
              [
                "Endpoints",
                "Many: `/tickets`, `/tickets/{ticket_id}`, `/audit`",
                "One, usually `/graphql`"
              ],
              [
                "Reading vs. writing",
                "Told apart by HTTP method: GET reads; POST, PATCH and DELETE write",
                "Told apart by operation type: queries read, mutations write"
              ],
              [
                "Shape of a response",
                "Fixed by the server for each endpoint",
                "Chosen by the caller, field by field"
              ],
              [
                "As agent tools",
                "One narrow tool per useful operation",
                "A few fixed queries wrapped as named tools. Letting the model write any GraphQL is like giving it raw SQL."
              ]
            ],
            "caption": "REST and GraphQL, seen from an agent"
          }
        },
        "Many REST APIs publish an **{{openapi|OpenAPI}}** description: a machine-readable file listing every path, its parameters, its request and response schemas, and the authentication it requires ([[openapi-spec]]). The Lab 7 help desk is built with FastAPI, a Python web framework that generates this file automatically at `/openapi.json` and renders it as the page you opened at `/docs` ([[fastapi]]). OpenAPI describes parameters with JSON Schema, the same language tool definitions use, so converting an operation into a tool definition is almost a copy:",
        {
          "code": "import httpx\n\nspec = httpx.get(\"http://localhost:8000/openapi.json\").json()\n\ntools = []\nfor path, operations in spec[\"paths\"].items():\n    for method, op in operations.items():\n        props = {p[\"name\"]: p.get(\"schema\", {}) for p in op.get(\"parameters\", [])\n                 if p[\"in\"] in (\"query\", \"path\")}\n        tools.append({\n            \"name\": op[\"operationId\"],          # FastAPI's default, e.g. list_tickets_tickets_get\n            \"description\": op.get(\"description\") or op.get(\"summary\") or f\"{method.upper()} {path}\",\n            \"input_schema\": {\"type\": \"object\", \"properties\": props},\n        })\n\nprint(len(tools), [t[\"name\"] for t in tools])",
          "title": "OpenAPI to tool definitions, the mechanical way (an illustration, not a lab step)",
          "note": "Request bodies, required parameters and `$ref` links are left out to keep it short. Real generators handle those, and still produce the problems listed below."
        },
        "Run that against the help desk while uvicorn is running and compare the result with `desk_tools.py`. The generated tools are worse in ways that matter to a model:",
        {
          "list": [
            "**Names written for a router, not a reader.** `list_tickets_tickets_get` versus `search_tickets`.",
            "**Descriptions about HTTP, not intent.** Nothing says that a non-null `next_cursor` means there are more results. The hand-written `search_tickets` description says it in capital letters, because Lab 7's first run checks whether the agent counts 27 open tickets or stops at 20.",
            "**Every endpoint, including ones the agent should not have.** The generated list includes the audit endpoint and both write endpoints. {{least-privilege|Least privilege}} starts with not offering a tool at all.",
            "**Parameters the model should not control.** `limit` lets the model ask for 50 rows when 20 is plenty, so `search_tickets` fixes it at 20. Credentials such as the `X-API-Key` header must never be model arguments.",
            "**No business rules.** The hand-written `update_ticket` description lists the allowed status moves, so the model can avoid an HTTP 409 instead of discovering it."
          ]
        },
        "The useful middle path is to generate from OpenAPI to get an inventory and correct schemas, then *curate*. Pick the few operations the task needs. Rename them. Rewrite descriptions for a model. Remove or pin parameters. Split reads from writes (next topic). This is Module 4's {{tool-schema|tool design}} advice applied to someone else's API.",
        "Lab 7 also shows how to layer the code. `helpdesk_client.py` knows HTTP: the base URL, headers, timeouts, status codes, and the retry on 429. `desk_tools.py` knows the model: names, descriptions, schemas, and turning errors into text the model can act on. `desk_agent.py` knows neither; it only runs the loop. Keeping those three jobs apart is what lets Task 2 add write tools without touching the loop.",
        {
          "callout": "An MCP server is one way to package curated tools once for every host (Module 6). If your organization wraps the help desk in an MCP server, the curation work moves into that server; it does not go away. Many vendors now ship MCP servers for their products. Read their tool lists with the same questions you asked of the generated list above.",
          "title": "Where MCP fits",
          "tone": "aside"
        }
      ],
      "takeaway": "Generate tool definitions from OpenAPI if it saves typing, then curate them: few tools, names and descriptions written for a model, no parameters the model should not control, and reads separated from writes.",
      "check": [
        {
          "q": "The generated tool list for the help desk includes `read_audit_audit_get`. Should the agent get it?",
          "a": "No. The task never needs it, the read key cannot call it anyway (the server returns 403), and offering it only adds a tool the model might misuse. Leave it out."
        },
        {
          "q": "Why does `search_tickets` hard-code `limit=20` instead of letting the model choose?",
          "a": "The model gains nothing by choosing page sizes, and a fixed size keeps every result small and predictable. A model allowed to choose tends to ask for the maximum, which costs tokens and still does not remove the need to follow `next_cursor`."
        },
        {
          "q": "A GraphQL API accepts any query. Why is a single `run_graphql(query)` tool risky?",
          "a": "It hands the model the whole API surface, including mutations if the credential allows them, and results can be very large. It is the GraphQL version of raw SQL. Wrap the few queries the task needs as named tools, and use a read-only credential."
        }
      ],
      "readings": [
        "openapi-spec",
        "fastapi",
        "graphql",
        "anthropic-tools"
      ]
    },
    {
      "topic": "read-vs-write",
      "blocks": [
        "Every tool either looks at the world or changes it, and that one distinction decides how much checking the tool needs. A wrong read wastes a step: the model sees a bad result and can try again. A wrong write changes a record that people depend on, sometimes in a way that cannot be undone.",
        {
          "table": {
            "head": [
              "Kind of tool",
              "Help desk examples",
              "If the model gets it wrong",
              "Safe to retry?",
              "Gate"
            ],
            "rows": [
              [
                "Read",
                "`search_tickets`, `get_ticket`",
                "A wasted call, or a wrong answer you can catch in the trace",
                "Yes",
                "None"
              ],
              [
                "Reversible write",
                "`update_ticket` changing priority or assignee",
                "A wrong value that someone must notice and put back",
                "Yes, if the new value is the same",
                "Confirm"
              ],
              [
                "Hard-to-reverse write",
                "`add_comment` (the requester may see it); closing a ticket",
                "Something a person has already read or acted on",
                "Only with an idempotency key",
                "Confirm, with an exact preview"
              ],
              [
                "Irreversible or external",
                "An email to a resident; deleting a record; a payment",
                "Cannot be taken back",
                "No",
                "Confirm, often by a second person, or keep it out of the agent"
              ]
            ],
            "caption": "Matching the safeguard to the tool"
          }
        },
        "Lab 7 builds this split in two places. In the **credentials**, reads use the read key and writes use the write key (next topic). In the **code path**, every tool named in `WRITES` goes through `approve()` before it runs. The model can *propose* a change by calling a write tool. Only a person can *make* it. This is a {{human-in-the-loop|human-in-the-loop}} design, and the MCP specification asks the same of hosts: a person should always be able to deny a tool call, which is why Claude Desktop asked your permission in Lab 6.",
        {
          "code": "def dispatch(name: str, args: dict, call_id: str | None = None) -> tuple[str, bool]:\n    ...\n        if name in WRITES:\n            approved, shown = approve(name, args)\n            if not approved:\n                record(tool=name, args=args, preview=shown, decision=\"declined\")\n                return (\"DECLINED: the human reviewer did not approve this change, so nothing \"\n                        \"was written. Do not retry it. ...\"), True\n            if name == \"add_comment\":\n                args = {**args, \"_idempotency_key\": call_id}  # a retried call cannot post twice\n            output = FUNCTIONS[name](**args)\n            record(tool=name, args=args, preview=shown, decision=\"approved\", result=output[:500])\n            return output, False",
          "title": "The confirmation gate in desk_tools.dispatch() (excerpt)",
          "note": "The gate sits in code between the model and the API. The model never holds anything that writes; it can only ask `dispatch()` to."
        },
        "Four details make the gate real rather than decorative:",
        {
          "list": [
            "**It fails closed.** If standard input is not a terminal, `approve()` returns False without asking. Piping `yes` into the program declines every write. A confirmation that a script can satisfy is not a confirmation.",
            "**It shows a diff, not JSON.** `preview()` reads the ticket's current state and prints `CHANGE status: open -> waiting`. Reviewers shown raw arguments approve things they did not read.",
            "**It needs a deliberate answer:** the whole word `yes`, not Enter and not `y`.",
            "**A decline is a result the model must handle.** The DECLINED text goes back as an error result telling the model not to retry and to report what it proposed. The system prompt adds: never say a change was made unless the tool result confirms it."
          ]
        },
        "Approval sits on top of the system's own rules; it does not replace them. In the illegal run you approve `closed -> open`, and the API still answers 409, because a closed ticket cannot reopen. The agent must report the rule, not claim success. That is defense in depth: the credential limits what *can* be done, the gate limits what is done *without a person*, and the system of record limits what is ever *valid*.",
        "Writes also change how you retry. Module 4's {{idempotency|idempotency}} rule says a read can safely run twice but a write may not. If the network drops after the server posted a comment but before the reply arrived, a naive retry posts it twice. Lab 7 sends the model's tool-call id as an `Idempotency-Key` header. The server remembers keys it has seen and returns the original comment instead of creating a second one. `update_ticket` needs no key, because setting a field to the same value twice leaves the same result.",
        {
          "callout": "A gate on every trivial action trains reviewers to type yes without reading, which is worse than no gate because it looks like control. Gate the writes that matter, keep each preview short and specific, and batch low-risk changes into one list a person reviews at once. OWASP's entry on excessive agency recommends both halves of this design: fewer, narrower tools and permissions, and human approval for high-impact actions ([[owasp-llm06]]).",
          "title": "Confirmation fatigue",
          "tone": "warning"
        }
      ],
      "takeaway": "Let the model propose writes and a person approve them, through a gate in code that fails closed, shows a readable diff, and never replaces the system's own rules.",
      "check": [
        {
          "q": "Why does `approve()` check `sys.stdin.isatty()` instead of just reading a line of input?",
          "a": "So that only a person at a terminal can approve. Without the check, `\"yes\" | python desk_agent.py ...` or a scheduled job would approve every write automatically. With it, every unattended write is declined: the gate fails closed."
        },
        {
          "q": "You decline the status change in the confirm run, but the final answer says \"Done: comment added and status set to waiting.\" What went wrong, and where is the evidence?",
          "a": "The model reported an action that did not happen. `traces/confirm.jsonl` shows the DECLINED tool result, `audit.jsonl` has a declined entry, and the server's audit shows only the comment. Tighten the system prompt or the decline message, and record the failure in your midterm notes."
        },
        {
          "q": "Why does `add_comment` get an idempotency key but `update_ticket` does not?",
          "a": "Posting the same comment twice creates two comments, so the server must recognize a retry as the same request. Setting a status to waiting twice leaves the ticket in the same state, so the update is already idempotent."
        }
      ],
      "readings": [
        "owasp-llm06",
        "building-effective-agents",
        "anthropic-tools"
      ]
    },
    {
      "topic": "service-identity",
      "blocks": [
        "When your agent calls the help desk, *who* is calling? Not you: you never signed in. Not the model: it holds no credentials. The caller is a **{{service-account|service account}}**, an identity that belongs to a program rather than a person. Lab 7 has two of them, `agent-readonly` and `agent-writer`, and the server's audit log records which one made each change.",
        "**{{least-privilege|Least privilege}}** means each identity gets exactly the permissions its job needs and nothing more. It matters more for agents than for ordinary programs, because an agent's behavior is decided at run time by a model that can be confused, mistaken, or manipulated by text it reads ({{prompt-injection|prompt injection}}, Module 12). You cannot fully predict what an agent will try. You can fully decide what its credentials allow.",
        {
          "table": {
            "head": [
              "Identity",
              "Scopes",
              "Used by",
              "Can it change a ticket?"
            ],
            "rows": [
              [
                "`agent-readonly` (`HELPDESK_READ_KEY`)",
                "read",
                "`reader` in `desk_tools.py`: every search and lookup, and `preview()`",
                "No. The server returns 403."
              ],
              [
                "`agent-writer` (`HELPDESK_WRITE_KEY`)",
                "read, write",
                "`writer`, called only after `approve()` returns True",
                "Yes, within the status rules"
              ],
              [
                "No key",
                "none",
                "Anything that forgot to authenticate",
                "No. The server returns 401."
              ]
            ],
            "caption": "The Lab 7 credentials"
          }
        },
        "`check_api.py` proves these boundaries before any agent exists: 401 with no key, and 403 when the read key tries to write or to read the audit log. That 403 is the most important line in the lab. An agent holding only the read key cannot change a ticket however it was confused or tricked. Least privilege is a property of the credential, not a promise in the prompt.",
        {
          "callout": "Both keys live in the same `.env` file and the same Python process as the agent. The gate keeps the `writer` object out of the model's reach, but a bug in `dispatch()` could still call it. In production you would close that gap: put the write credential in a separate small service, or behind an approval queue, that performs only changes a person has approved, so the agent's own process never holds it. This belongs in MIDTERM-NOTES.md under \"What I would change\".",
          "title": "The lab still has a gap",
          "tone": "warning"
        },
        "Real organizations do not hand out keys from a table in the code. An identity team issues credentials, and the usual standard for programs is the {{oauth|OAuth}} 2.0 **client credentials grant**. The service presents its own client id and secret to the organization's authorization server and receives a short-lived access token for itself, with no user involved ([[oauth-client-credentials]]). It then sends that token as a bearer token, the same way Module 6's remote MCP clients do.",
        {
          "code": "import os\n\nimport httpx\n\n# Illustrative: TOKEN_URL, the scope name and the API URL come from your identity team.\nresp = httpx.post(\n    os.environ[\"TOKEN_URL\"],\n    data={\"grant_type\": \"client_credentials\", \"scope\": \"tickets.read\"},\n    auth=(os.environ[\"AGENT_CLIENT_ID\"], os.environ[\"AGENT_CLIENT_SECRET\"]),\n    timeout=10,\n)\nresp.raise_for_status()\ntoken = resp.json()[\"access_token\"]      # short-lived; ask for a new one when it expires\n\ntickets = httpx.get(\"https://helpdesk.example.edu/api/tickets\",\n                    headers={\"Authorization\": f\"Bearer {token}\"}, timeout=10)",
          "title": "A service account getting its own token (client credentials grant, illustrative)",
          "note": "The client id and secret are the service account's long-lived credentials. They belong in a secrets manager or `.env`, never in code. The short-lived token is what travels with each request."
        },
        "The other model is **acting on behalf of a user**. The user signs in and approves, and the agent receives a token carrying *that user's* permissions, as in the MCP flow from Module 6. Which one to use is a design decision:",
        {
          "list": [
            "**A service account** when the agent does the same job for everyone and no single user is the actor: nightly reconciliation, triage of new tickets. The system's audit log will show the agent's identity, so pair it with your own record of which person asked for or approved each action.",
            "**A delegated user token** when the agent acts for one person and should see only what that person may see. A student-facing assistant must not read every student's records just because its service account could."
          ]
        },
        "Whichever you choose, the same rules of thumb apply. Use separate identities for reading and writing. Give each agent its own identity; never share an admin key across programs. Prefer short-lived tokens. Ask for the narrowest scopes the API offers. Make every credential revocable without breaking anything else, so that revoking a misbehaving agent's access is a routine step rather than an outage."
      ],
      "takeaway": "Give each agent its own identity with the narrowest scopes it needs, separate read from write credentials, and let the server enforce the boundary so that a confused agent simply cannot cross it.",
      "check": [
        {
          "q": "A teammate suggests one admin key for the agent \"to keep things simple\", since the prompt already says not to write without approval. What is the flaw?",
          "a": "The prompt is a request to the model, not an enforced boundary. A confused or manipulated model, or a bug, could write with that key. With a read-only key the server refuses (403) whatever the model does. An admin key in the audit log also cannot tell you which program did what."
        },
        {
          "q": "When should the agent use a service account rather than the signed-in user's token?",
          "a": "When it does the same job for everyone and no single user is the actor, such as a scheduled reconciliation. Use the user's token when the agent acts for one person and must be limited to what that person may see or do."
        },
        {
          "q": "In the server's audit, the approved comment appears under `agent-writer`. What does that entry not tell you, and where is it recorded?",
          "a": "Who approved the comment and what they were shown. That is in your `audit.jsonl` (reviewer, preview, decision). Together the two logs answer what was done, with which credential, and on whose authority."
        }
      ],
      "readings": [
        "oauth-client-credentials",
        "owasp-llm06",
        "mcp-security"
      ]
    },
    {
      "topic": "audit-logs",
      "blocks": [
        "An **{{audit-log|audit log}}** is an append-only record of who did what, when, to which record, and with what result. It exists so that someone can answer questions later. Why was ticket 7 set to waiting? Did the agent ever change a ticket without approval? Which credential posted this comment? The MCP specification asks hosts to log tool use for exactly this purpose ([[mcp-tools-spec]]). An audit log overlaps with a debug log and with a {{trace|trace}}, but it answers a different question.",
        {
          "table": {
            "head": [
              "Record",
              "Written by",
              "Answers",
              "Lab 7 file"
            ],
            "rows": [
              [
                "Trace",
                "The agent",
                "What did the model see, decide, and call, step by step?",
                "`traces/*.jsonl`, from `desk_agent.py`"
              ],
              [
                "Approval log",
                "The confirmation gate",
                "Who approved or declined each proposed change, and what were they shown?",
                "`audit.jsonl`, from `record()`"
              ],
              [
                "System audit",
                "The system of record",
                "What changed, when, and under which credential?",
                "The server's `audit` table, read with `writer.audit()`"
              ]
            ],
            "caption": "Three records, three questions"
          }
        },
        "The three overlap on purpose, and comparing them is how you catch problems. After the confirm run, `audit.jsonl` has one approved and one declined entry, and the server's audit shows only the comment. If the server ever shows a change with no matching approved entry, something bypassed the gate. If an approved entry has no matching server change, the write failed, and the trace shows whether the agent reported that honestly.",
        {
          "code": "{\"ts\": \"2026-10-14T10:32:05\", \"reviewer\": \"jstudent\", \"tool\": \"update_ticket\",\n \"args\": {\"ticket_id\": 7, \"status\": \"waiting\"},\n \"preview\": \"Ticket #7: ...\\n  now: status=open  priority=normal  assignee=none\\n  CHANGE status: open -> waiting\",\n \"decision\": \"declined\"}",
          "title": "One line of audit.jsonl, wrapped for reading (values illustrative)"
        },
        "What makes an audit entry trustworthy:",
        {
          "list": [
            "**Who**, meaning both the person and the service identity. `record()` takes the reviewer's name from the operating-system login (`getpass.getuser()`), not from anything the model wrote.",
            "**What they saw**: the preview text, word for word. \"Approved\" means nothing without what was approved.",
            "**What was asked and what happened**: the arguments, the decision, and the result or the error. Lab 7 records an approved write that the server then rejected, with the 409 text.",
            "**When**: a timestamp on every entry, in one format (ISO 8601, with a time zone in production).",
            "**Correlation**: a shared id linking the trace step, the approval, and the server's change. Lab 7's comment already carries the tool-call id as its idempotency key; writing that id into every log line would let you join all three records.",
            "**Out of the agent's reach**: append-only, with no tool that can edit or delete it. In Lab 7 the agent has no tool for `audit.jsonl`; in production the log goes to a separate store with its own permissions."
          ]
        },
        {
          "callout": "A trace is written by the program being audited. If the agent misbehaves, its own account is the one you should trust least. The server's audit table is written by the server, from the credential it verified, and the agent cannot touch it. That independence is the reason to keep it.",
          "title": "Why traces are not enough",
          "tone": "aside"
        },
        "Be deliberate about what you leave out. Audit entries are kept for a long time and read by many people. Ticket text can contain personal information, and secrets must never appear: the `Helpdesk` client sends its key in a header, and nothing in the lab writes headers to a log. Log identifiers and short summaries, and point to the full record in the system that owns it. Module 12 covers privacy rules such as FERPA that apply to student data.",
        "Traceability is also the midterm's evidence requirement. MIDTERM-NOTES.md lists the four traces and `audit.jsonl` because together they show, without anyone having to take your word for it, a read that paginates, an approved write, a declined write, and a rule the system enforced on its own. Module 11 reuses the same traces as {{observability|observability}} data when it evaluates the path an agent took, not just its final answer."
      ],
      "takeaway": "Keep three records that check each other (the agent's trace, the gate's approval log, and the system's own audit), linked by ids, append-only, and free of secrets.",
      "check": [
        {
          "q": "The server's audit shows a status change on ticket 25 under `agent-writer`, and `audit.jsonl` has no approved entry for it. What does that tell you?",
          "a": "A write reached the API without passing the gate: a bug in `dispatch()`, another program using the write key, or someone using it by hand. Treat it as an incident: revoke the key, then find the path."
        },
        {
          "q": "Why does `record()` take the reviewer from `getpass.getuser()` rather than from the conversation?",
          "a": "Anything in the conversation can be written by the model or by injected text. The operating-system login is outside the model's control, so it is evidence rather than a claim."
        },
        {
          "q": "Name two things that should not go into an audit log, and what to log instead.",
          "a": "API keys or tokens: log the identity name, such as `agent-writer`. Full personal details from ticket text: log the ticket id and a short summary, and leave the details in the system of record."
        }
      ],
      "readings": [
        "mcp-tools-spec",
        "owasp-llm",
        "nist-rmf"
      ]
    },
    {
      "topic": "rate-limits",
      "blocks": [
        "Enterprise APIs protect themselves. A **{{rate-limit|rate limit}}** caps how many requests one caller may make in a period: the help desk allows 30 per key per minute. **{{pagination|Pagination}}** caps how much one response returns: the help desk sends at most 50 tickets per call, and 20 by default. Both exist for the same reason. One careless client must not slow the system down for everyone else, and an agent in a loop is exactly that kind of client.",
        "When a caller goes over a rate limit, the server answers HTTP 429 Too Many Requests, often with a `Retry-After` header saying how many seconds to wait ([[http-429]]). Lab 7's client handles this in one place, so no tool has to think about it:",
        {
          "code": "def _call(self, method: str, path: str, **kwargs):\n    for _ in range(3):\n        r = self.http.request(method, path, **kwargs)\n        if r.status_code == 429:  # rate limited: wait as long as the server asks\n            time.sleep(min(int(r.headers.get(\"Retry-After\", \"5\")), 30))\n            continue\n        ...\n    raise HelpdeskError(\"rate limited three times in a row; try again in a minute\")",
          "title": "Helpdesk._call in helpdesk_client.py (excerpt)"
        },
        "Three choices in those lines matter. The client waits as long as the *server* says, which beats guessing; {{exponential-backoff|exponential backoff}} from Module 4 is the fallback when there is no header. It caps the wait at 30 seconds, so a strange header cannot stall the agent for an hour. And it gives up after three tries with a clear error, which `dispatch()` turns into a tool result, so the model can tell the user instead of looping.",
        "Only one of the help desk's error codes is worth retrying. The others mean the request itself is wrong, and sending it again will fail again:",
        {
          "table": {
            "head": [
              "Status",
              "Meaning",
              "Retry?",
              "What the model should learn from the tool result"
            ],
            "rows": [
              [
                "401",
                "No key, or an unknown key",
                "No",
                "Nothing it can fix. This is a configuration problem for a person."
              ],
              [
                "403",
                "The key lacks the scope (the read key tried to write)",
                "No",
                "This action is not allowed with this credential."
              ],
              [
                "404",
                "No such ticket",
                "No",
                "Check the id, for example with `search_tickets`."
              ],
              [
                "409",
                "A business rule refused the change, such as closed to open",
                "No",
                "The rule itself, so it can report it or propose a legal move."
              ],
              [
                "429",
                "Too many requests this minute",
                "Yes, after `Retry-After`",
                "Usually nothing; the client waits. After three tries, that the service is busy."
              ]
            ],
            "caption": "Help desk status codes and what each one means for the agent"
          }
        },
        "Rate limits also shape tool design. A model that inspects 40 tickets one `get_ticket` call at a time needs 40 requests, more than a minute's allowance. Better tools need fewer calls: a search that returns the fields the task needs, and filters that run on the server. `search_tickets(status=\"open\", priority=\"urgent\", unassigned=True)` is one request, where fetching every ticket and filtering in the model is many. Count requests per task in your traces, the way you already count tokens.",
        "The help desk paginates with a **cursor**. Each page returns `items` and a `next_cursor`. If `next_cursor` is not null, there are more results, and you pass it back as `cursor` to get the next page. Here the cursor is the id of the last ticket returned, so the next page starts right after it. That is sturdier than page numbers: if a ticket on page 1 is closed while you read an open-ticket list, every later page number shifts by one and you would skip a ticket, but \"after id 31\" still means the same place.",
        {
          "code": "def all_tickets(**filters) -> list[dict]:\n    \"\"\"Every matching ticket, following next_cursor until it is None.\"\"\"\n    items, cursor = [], 0\n    while True:\n        page = reader.list_tickets(**filters, limit=50, cursor=cursor)\n        items += page[\"items\"]\n        if page[\"next_cursor\"] is None:\n            return items\n        cursor = page[\"next_cursor\"]\n\n\nprint(len(all_tickets(status=\"open\")))   # 27 with the lab's seeded data",
          "title": "Following the cursor in code (a helper you could add to desk_tools.py)"
        },
        "Lab 7 deliberately leaves pagination to the model, so you can watch it fail: given 20 results, a model will happily report \"there are 20 open tickets\". The lab's fix is a description that says plainly what a non-null `next_cursor` means. Sturdier fixes change the tool so the model cannot get it wrong:",
        {
          "list": [
            "**Paginate inside the tool** when the full set is small, and return all 27 open tickets in one result.",
            "**Return a total with each page**, such as \"27 matching, showing 1 to 20\", so the model never has to infer the count. If the API offers a count, use it.",
            "**Summarize instead of listing** when the set is large: counts by status and priority, the first few ids, and a hint about which filter would narrow the list.",
            "**Never truncate silently.** If a tool cuts a result to fit, say so in the result or the tool description, as Lab 6's `run_query` docstring does for its 50-row cap."
          ]
        },
        {
          "callout": "Every tool result goes into the {{context-window|context window}} and is sent again with every later model call in the run. A 500-row result read at step 2 of a 10-step run is paid for again on each of the remaining steps. Keep results small, structured, and only as detailed as the next decision needs.",
          "title": "Large results cost more than once",
          "tone": "warning"
        }
      ],
      "takeaway": "Treat rate limits and pages as part of the tool contract: honor Retry-After with a cap, make it impossible to mistake one page for the whole set, and keep results small.",
      "check": [
        {
          "q": "The agent answers \"there are 20 open tickets.\" Which file shows the mistake, and what are two fixes?",
          "a": "`traces/read_only.jsonl` shows one `search_tickets` call whose result had a non-null `next_cursor`, and no second call. Fix the description, as Lab 7 does, or change the tool so it returns a total count or follows the cursor itself."
        },
        {
          "q": "Why cap the `Retry-After` wait at 30 seconds instead of always honoring it?",
          "a": "A misconfigured or hostile server could send a huge value and stall the agent indefinitely. Capping the wait and then failing with a clear error keeps the run's time bounded and lets the model report the problem."
        },
        {
          "q": "Why is \"tickets after id 31\" safer than \"page 2\" when tickets change status during the run?",
          "a": "With page numbers, a ticket on page 1 that leaves the filtered set (for example, an open ticket that gets closed) shifts every later page, so you skip or repeat a ticket. A cursor continues after a fixed position, so the next page starts where the last one ended."
        }
      ],
      "readings": [
        "http-429",
        "anthropic-tools"
      ]
    },
    {
      "topic": "reconciliation",
      "blocks": [
        "Much enterprise work is not a conversation at all. The same facts live in several systems, and the systems disagree. The help desk says j.rivera reported a broken laptop last week. The asset inventory says that laptop was retired in June. A staff directory says j.rivera moved to Finance. **{{reconciliation|Reconciliation}}** is the job of gathering the records, matching them, reporting what agrees, and dealing with what does not. Lab 7's optional extension and the cross-system reconciliation example project are both this job.",
        "Is it an agent's job? Mostly not, and that is the first design lesson. Joining two tables on a shared key is the bottom rung of the {{decision-ladder|decision ladder}}: plain code, exact and testable. The model earns its place only where code cannot decide: matching records that share no key, reading a ticket's free text to work out which device it is about, and writing a clear explanation of each conflict for the person who will resolve it. A sensible division of labor:",
        {
          "list": [
            "**Code** pulls records from each source through read tools with read-only credentials, handling pagination and rate limits once.",
            "**Code** matches records on a shared key, such as an asset tag or a username.",
            "**The model** proposes matches for records with no key, each with a confidence and a reason, validated against a schema as in Module 2.",
            "**Code** compares matched records field by field, using the source-of-truth table below.",
            "**The model** writes a plain-language summary of each conflict for the reviewer.",
            "**A person** resolves each conflict from a review queue (next topic). The agent fixes nothing on its own."
          ],
          "ordered": true
        },
        "Before any matching, write down which system is the **{{source-of-truth|source of truth}}** for each field. \"Which system is right?\" has no single answer; it has one answer per field. This table is the heart of the extension's section in MIDTERM-NOTES.md:",
        {
          "table": {
            "head": [
              "Field",
              "Source of truth",
              "Why",
              "When the other system disagrees"
            ],
            "rows": [
              [
                "Device owner",
                "Asset inventory",
                "IT assigns devices there",
                "Flag it. The requester may be borrowing a device, or the inventory may be stale."
              ],
              [
                "Device status (in use or retired)",
                "Asset inventory",
                "Retirements are recorded there",
                "A recent ticket about a retired device is evidence the inventory is wrong. Escalate."
              ],
              [
                "Ticket status, priority, assignee",
                "Help desk",
                "The support workflow lives there",
                "Never changed by reconciliation"
              ],
              [
                "A person's department",
                "Staff directory, if you add one",
                "HR owns it",
                "Report only"
              ]
            ],
            "caption": "Source of truth, decided one field at a time"
          }
        },
        "The extension suggests building `assets.csv` with 15 to 20 devices from the ticket data, then planting a few disagreements on purpose: a wrong owner, a retired device with open tickets, a requester with tickets but no device record. Because you planted them, you know the right answers. That makes the extension its own small {{eval-set|eval set}}: count how many planted conflicts were found, how many were missed, and how many non-problems were escalated needlessly (Module 11).",
        {
          "code": "import csv\nimport json\n\nfrom desk_tools import reader          # the read-only help desk client\n\nwith open(\"assets.csv\", encoding=\"utf-8\", newline=\"\") as f:\n    assets = {row[\"owner\"]: row for row in csv.DictReader(f)}\n\nfindings = []\nfor t in all_tickets(status=\"open\"):   # the cursor helper from the rate-limits topic\n    ticket = reader.get_ticket(t[\"id\"])            # search results do not include the requester\n    asset = assets.get(ticket[\"requester\"])\n    if asset is None:\n        findings.append({\"kind\": \"missing_asset\", \"ticket\": t[\"id\"],\n                         \"requester\": ticket[\"requester\"]})\n    elif asset[\"status\"] == \"retired\":\n        findings.append({\"kind\": \"retired_in_use\", \"ticket\": t[\"id\"],\n                         \"asset_tag\": asset[\"asset_tag\"]})\n\nprint(json.dumps(findings, indent=2))",
          "title": "The deterministic half of reconciliation (illustrative; the CSV columns are your choice)",
          "note": "Matching requester to owner assumes one device per person. Tickets that mention a device but not its owner are where a model helps. Note the request count, too: 27 `get_ticket` calls plus the search pages come close to the 30-per-minute limit, so the client's 429 handling matters here."
        },
        "Conflicts come in a few kinds, and naming them is what makes rules writable: a record missing from one side; a record present on both sides with a field that differs; a match the model is unsure about; and duplicates, such as two inventory rows for one device. Each kind gets its own escalation rule in the next topic.",
        {
          "callout": "A report that lists only conflicts cannot be checked. Report counts as well: records in each source, matched by key, matched by the model, unmatched, agreeing, and conflicting. If the numbers do not add up, something was dropped, and you want to find that before a reviewer does.",
          "title": "Report agreement too",
          "tone": "tip"
        }
      ],
      "takeaway": "Reconcile in code wherever a key or a rule exists, use the model only to match and explain what code cannot, and decide the source of truth one field at a time before comparing anything.",
      "check": [
        {
          "q": "The inventory says laptop ML-0142 is retired; the help desk has an open ticket from its owner about it yesterday. Which system is right, and what should the agent do?",
          "a": "Neither can be assumed right. The inventory owns device status, but the ticket is evidence that the inventory is stale. The agent records the conflict with both records and its reasoning, and sends it to the review queue. It changes nothing in either system."
        },
        {
          "q": "Why match on the username in code instead of asking the model to \"find mismatches between these two lists\"?",
          "a": "Exact matching in code is deterministic, free, and testable. A model given two long lists may skip rows, especially in the middle of a long input, and its results vary between runs. Use the model only for records that have no shared key."
        },
        {
          "q": "You planted five conflicts. The agent reports four of them plus two that are not real. How do you report this?",
          "a": "As eval results: 4 of 5 planted conflicts found (one missed) and 2 false positives escalated needlessly. Then use the traces to find out why the missed one was missed and why the two false ones were flagged."
        }
      ],
      "readings": [
        "building-effective-agents",
        "lost-in-middle"
      ]
    },
    {
      "topic": "escalation",
      "blocks": [
        "**{{escalation|Escalation}}** is handing a case to a person because the agent should not decide it. It is not a failure; for many cases it is the correct output. A reconciliation agent that escalates every planted conflict and nothing else has done its job perfectly. The hard parts are deciding which cases those are, and making sure the agent cannot quietly decide otherwise.",
        "Write the rules down before you build, first in plain language and then in code. Good escalation rules are specific enough that two people would apply them the same way:",
        {
          "table": {
            "head": [
              "Rule",
              "Trigger",
              "The agent may",
              "Goes to"
            ],
            "rows": [
              [
                "E1 Conflicting owner",
                "The inventory owner differs from the ticket's requester",
                "Report both records",
                "Review queue"
              ],
              [
                "E2 Retired but in use",
                "Asset status is retired, and there is an open ticket about it",
                "Report",
                "Review queue, high priority"
              ],
              [
                "E3 Missing record",
                "A requester with tickets has no asset record",
                "Report",
                "Review queue"
              ],
              [
                "E4 Unsure match",
                "The model's match confidence is below the threshold you set",
                "Report the candidates and its reasons",
                "Review queue"
              ],
              [
                "E5 Any change",
                "Fixing the conflict would change either system",
                "Propose only",
                "A person, through a gated write"
              ],
              [
                "E6 No rule applies",
                "A case none of the rules above covers",
                "Stop and report",
                "Review queue"
              ]
            ],
            "caption": "Example escalation rules for the reconciliation extension (yours go in MIDTERM-NOTES.md)"
          }
        },
        "Rule E6 matters most. When nothing matches, the default is a person, not the agent's best guess. That is the same fail-closed stance as Lab 7's confirmation gate, which declines every write when nobody is at the keyboard.",
        "The rules must be **enforced in code**, not just stated in the prompt. The model's job is to gather and explain. Whether a case escalates should be decided by functions you can test. The review queue must be something the agent can add to but cannot get around: no tool to resolve, edit, or delete queue items, and no write tools or write credential for either system during a reconciliation run.",
        {
          "code": "import datetime as dt\nimport json\nimport pathlib\n\nQUEUE = pathlib.Path(\"review_queue.jsonl\")\nRULES = {\"conflicting_owner\": \"E1\", \"retired_in_use\": \"E2\",\n         \"missing_asset\": \"E3\", \"unsure_match\": \"E4\"}\n\n\ndef escalate(kind: str, records: dict, explanation: str) -> str:\n    \"\"\"The reconciliation agent's only output tool. It appends; it never resolves.\"\"\"\n    rule = RULES.get(kind, \"E6\")        # anything unrecognized still goes to a person\n    item = {\"ts\": dt.datetime.now().isoformat(timespec=\"seconds\"), \"rule\": rule,\n            \"kind\": kind, \"records\": records, \"explanation\": explanation,\n            \"status\": \"open\"}\n    with QUEUE.open(\"a\", encoding=\"utf-8\") as f:\n        f.write(json.dumps(item) + \"\\n\")\n    return f\"queued under {rule}; a person will review it\"",
          "title": "An escalation tool the agent can call but cannot undo (illustrative)",
          "note": "Findings that code detects on its own (E1 to E3) can go straight into the queue without asking the model. The model's own `escalate` calls add what only it can see, such as an unsure match (E4), along with its explanations."
        },
        "Make each queue item self-sufficient. Include the records from each system as they were when read, the rule that fired, the agent's explanation, and the source-of-truth row that applies. A reviewer who has to re-run the agent to understand a case will soon stop reading the queue.",
        "Escalation is one form of {{human-in-the-loop|human in the loop}}, and Lab 7 already contains the conversational version: a declined write goes back to the model, which must stop and ask the user how to proceed. A review queue is the same idea for work that runs without anyone watching, such as a scheduled reconciliation.",
        "Escalation must be tested in both directions. Did the agent escalate every case it should have? And *only* those? An agent that sends everything to a person is safe and useless. An agent that resolves borderline cases itself is useful and unsafe. Module 11's escalation-testing topic measures both, using planted conflicts like yours.",
        {
          "callout": "Name the queue's owner, the expected response time, and what happens to a case nobody picks up. An escalation path that ends in an unread file is worse than none, because everyone assumes someone is looking.",
          "title": "Design the other end of the queue",
          "tone": "tip"
        }
      ],
      "takeaway": "Write escalation rules a person could apply, enforce them in code with \"ask a person\" as the default, and give the agent a queue it can add to but never resolve or bypass.",
      "check": [
        {
          "q": "Why is \"if no rule applies, escalate\" a default in code (E6) rather than a sentence in the system prompt?",
          "a": "The model may be confidently wrong, and a prompt instruction can be ignored or overridden by injected text. A default in code applies whatever the model believes, and you can write a test that proves it."
        },
        {
          "q": "The agent finds a wrong owner and is \"99% sure\" of the right one. Should it update the inventory?",
          "a": "No. Any change is rule E5: propose only. During reconciliation it has no write tool or write credential, so it records the proposed fix and its evidence in the queue item, and a person makes the change through a gated write."
        },
        {
          "q": "Your agent escalated 14 cases: the 5 planted conflicts and 9 that were not real problems. Is that a success?",
          "a": "It is safe but not good. Most of the queue is noise, and reviewers will learn to ignore it. Look at the 9 to see which rule fired, tighten that rule (for example, the E4 confidence threshold, or a matching bug), and re-run against the same planted set."
        }
      ],
      "readings": [
        "building-effective-agents",
        "owasp-llm06",
        "nist-rmf"
      ]
    }
  ]
};
