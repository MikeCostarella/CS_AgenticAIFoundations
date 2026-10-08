import type { LectureNotesDef } from "../types";

// Module 6 — The Model Context Protocol (MCP): lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M06_NOTES: LectureNotesDef = {
  "moduleId": "m06",
  "intro": "These notes go with the Module 6 lecture and Lab 6. The running example is the lab's `town-data` server: the same town database you queried in Lab 3 (40 facilities, 400 service requests), now packaged as an MCP server that the MCP Inspector, Claude Desktop, and your own `mcp_agent.py` can all use without knowing anything about each other. Lab 6's code uses the 1.x line of the MCP Python SDK; where the protocol or SDK has moved on since, the notes say so. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "mcp-architecture",
      "blocks": [
        "In Lab 3 your tools lived inside your agent. `tools.py` held the functions and their schemas, and `dispatch()` ran them. That works until a second program wants the same tools. Claude Desktop cannot import your `tools.py`, and neither can a coding assistant in VS Code. Without a shared standard, every pairing of an AI application with a data source needs its own integration code.",
        "The **{{mcp|Model Context Protocol}}** (MCP) is that shared standard. It is an open protocol, published with a specification and SDKs at [[mcp]], that defines how an AI application discovers and uses tools and data offered by a separate program. You write the integration once, as a server, and any application that speaks MCP can use it.",
        "MCP names three participants. Keep them straight, because \"client\" in MCP does not mean what it means in a web app.",
        {
          "table": {
            "head": [
              "Participant",
              "What it is",
              "In Lab 6"
            ],
            "rows": [
              [
                "{{mcp-host|Host}}",
                "The AI application the user works in. It owns the model, the conversation, and the permission prompts.",
                "Claude Desktop. Your `mcp_agent.py` is a very small host too."
              ],
              [
                "{{mcp-client|Client}}",
                "A connection object inside the host. The host creates one client per server, and each client talks to exactly one server.",
                "The `ClientSession` in `check_server.py` and `mcp_agent.py`, and the one Claude Desktop creates for `town-data`."
              ],
              [
                "{{mcp-server|Server}}",
                "A program that offers tools, data, and prompt templates. It never sees the model or the conversation.",
                "`server.py`, the `town-data` server."
              ]
            ],
            "caption": "The three MCP participants"
          }
        },
        "Two consequences follow. First, a host that uses five servers holds five clients, one connection each, and the servers know nothing about each other. Second, the server is not \"the AI\". It is ordinary code, closer to a REST API than to an agent. The model's decisions stay in the host. The server only answers requests.",
        "MCP has two layers. The **data layer** defines the messages. They are written in JSON-RPC 2.0, a small standard for calling a function in another program by sending a JSON object: each request names a `method`, carries `params`, and has an `id` that the response repeats. The **transport layer** defines how those messages travel: through a child process's standard input and output, or over HTTP (topic 3). The same messages flow over either transport.",
        {
          "code": "-> {\"jsonrpc\": \"2.0\", \"id\": 7, \"method\": \"tools/call\",\n    \"params\": {\"name\": \"request_stats\",\n               \"arguments\": {\"category\": \"repair\", \"ward\": 1, \"status\": \"closed\"}}}\n\n<- {\"jsonrpc\": \"2.0\", \"id\": 7,\n    \"result\": {\"content\": [{\"type\": \"text\",\n                            \"text\": \"{\\\"filters\\\": {...}, \\\"requests\\\": 38, ...}\"}],\n               \"isError\": false}}",
          "title": "One tool call on the wire, trimmed (client to server, then server to client)",
          "note": "This is what `session.call_tool(\"request_stats\", {...})` in `check_server.py` sends and receives. You never write these messages yourself; the SDK does."
        },
        "Every client you write follows the same three phases. First it finds out what the server is and what it supports. Then it lists what the server offers. Then it uses those things on request. In `check_server.py` those phases are `initialize()`, the four list calls, and `call_tool()` or `read_resource()`.",
        {
          "callout": "MCP is versioned by date and still moving. The 1.x Python SDK that Lab 6 uses opens each connection with an `initialize` handshake, in which client and server agree on a protocol version and exchange capabilities. The 2026-07-28 revision of the specification made the protocol stateless: every request now carries its own version and capabilities, and an optional `server/discover` request replaces the handshake. The roles, primitives, and transports in these notes are the same in both. Check [[mcp-architecture]] before you rely on a detail.",
          "title": "Protocol revisions",
          "tone": "aside"
        },
        "Now compare Lab 6 with Lab 3. The loop in `mcp_agent.py` is the same {{agent-loop|agent loop}}: call the model, run any tool calls, append the results, repeat. MCP does not replace the loop. It replaces the code that connects the loop to the outside world.",
        {
          "table": {
            "head": [
              "Concern",
              "Lab 3 (`agent.py` + `tools.py`)",
              "Lab 6 (`mcp_agent.py` + `server.py`)"
            ],
            "rows": [
              [
                "Tool definitions",
                "A Python list of dicts, written by hand",
                "Built by the server from type hints and docstrings, fetched with `list_tools()`"
              ],
              [
                "Running a tool",
                "`dispatch(name, args)` in the same process",
                "`session.call_tool(name, args)`, sent to another process"
              ],
              [
                "Who can use the tools",
                "Only this agent",
                "Any MCP host: Claude Desktop, an IDE, your agent"
              ],
              [
                "The model and the loop",
                "In `agent.py`",
                "Still in the host. The server never sees the model."
              ]
            ],
            "caption": "Where things live, before and after MCP"
          }
        },
        "That last row is the point of the whole module. Because the server never sees the model, it does not care which model or which host is on the other end. You will test that claim directly in Lab 6 by asking two different hosts the same question."
      ],
      "takeaway": "An MCP host runs the model and holds one client per server; the server is ordinary code that answers JSON-RPC requests, so one server can serve every host.",
      "check": [
        {
          "q": "Claude Desktop is connected to `town-data` and to a filesystem server. How many MCP clients exist, and can the filesystem server see `town-data`'s tools?",
          "a": "Two clients, one per server, both inside the Claude Desktop host. No: each server has its own connection and knows nothing about the others. Only the host sees both tool lists."
        },
        {
          "q": "A classmate says \"the MCP server decides which tool to call.\" What is wrong with that?",
          "a": "The model, running in the host, decides. The server only lists what it offers and runs what it is asked to run. That is why the same `server.py` works unchanged under Claude Desktop and under `mcp_agent.py`, where the decisions come from different code."
        },
        {
          "q": "Which parts of `mcp_agent.py` would change if you moved back to Lab 3-style local tools?",
          "a": "Where the tools come from (`list_tools()` becomes a Python list), how they run (`call_tool()` becomes `dispatch()`), and the connection setup. The loop, the step limit, and the trace stay the same."
        }
      ],
      "readings": [
        "mcp-architecture",
        "mcp",
        "mcp-servers"
      ]
    },
    {
      "topic": "mcp-primitives",
      "blocks": [
        "An {{mcp-server|MCP server}} can offer three kinds of things, called **primitives**. The difference between them is not the data format. It is **who decides when each one is used** ([[mcp-server-concepts]]).",
        {
          "table": {
            "head": [
              "Primitive",
              "Controlled by",
              "What it is",
              "In `server.py`"
            ],
            "rows": [
              [
                "Tools",
                "The model",
                "Functions the model can call, each with a JSON Schema for its arguments. They may read or change things.",
                "`list_facilities`, `request_stats`, `facility_history`, `run_query`"
              ],
              [
                "Resources",
                "The application (host)",
                "Read-only data identified by a URI. The host decides when to load it and how to use it.",
                "`town://schema`, and the template `town://facilities/{facility_id}`"
              ],
              [
                "Prompts",
                "The user",
                "Named message templates with arguments, which the user picks on purpose, often from a menu or a slash command.",
                "`ward_report(ward)`"
              ]
            ],
            "caption": "Server primitives and who controls them"
          }
        },
        "**Tools** are the primitive you know from Module 3. The model sees each tool's name, description, and input schema, and asks to call it. In Lab 6 you never wrote a schema by hand. The SDK's `FastMCP` class reads each function marked with `@mcp.tool()` and builds the definition for you. The function name becomes the tool name. The docstring becomes the description. The type hints become the {{json-schema|JSON Schema}}, so a `Literal[\"park\", \"hydrant\", \"building\", \"streetlight\"]` hint turns into an `enum` the model cannot step outside of.",
        {
          "code": "@mcp.tool()\ndef facility_history(facility_id: int, limit: int = 20) -> list[dict]:\n    \"\"\"The most recent service requests for one facility, newest first.\"\"\"\n    ...\n\n# What a client receives from tools/list for this function (trimmed):\n{\"name\": \"facility_history\",\n \"description\": \"The most recent service requests for one facility, newest first.\",\n \"inputSchema\": {\"type\": \"object\",\n                 \"properties\": {\"facility_id\": {\"type\": \"integer\"},\n                                \"limit\": {\"type\": \"integer\", \"default\": 20}},\n                 \"required\": [\"facility_id\"]}}",
          "title": "From a decorated function to a tool definition",
          "note": "`mcp_agent.py` copies `name`, `description` and `inputSchema` straight into the Messages API's `tools` list. The two formats line up field for field, which is why that conversion is one line."
        },
        "When a tool fails, the server does not crash. In the 1.x SDK an exception raised inside a tool comes back as a normal result with `isError` set to true and the exception's message as text. That is how `facility_history(999)` returns \"no facility with id 999; use list_facilities to find ids\". The specification calls these **tool execution errors** and says clients should pass them to the model so it can correct itself. They are different from **protocol errors**, such as a request for a tool that does not exist. Module 4's advice on {{tool-schema|tool design}} applies unchanged: an error message should tell the model what to do next.",
        "**Resources** are data the host reads, not actions the model takes. Each one has a URI. A fixed URI such as `town://schema` is a *direct resource*. A URI with a placeholder, such as `town://facilities/{facility_id}`, is a *resource template*: when a client reads `town://facilities/7`, the SDK pulls out `7` and passes it to your function as `facility_id`. Clients find the two kinds with separate calls, `list_resources()` and `list_resource_templates()`, which is why `check_server.py` prints them on separate lines.",
        "Because the application controls resources, *how* they reach the model is the host's decision. `mcp_agent.py` reads `town://schema` once at startup and puts it in the {{system-prompt|system prompt}}. The model can then write correct SQL for `run_query` without spending a tool call to discover column names. Claude Desktop instead shows resources in its interface for the user to attach. Neither is wrong; the protocol leaves the choice to the host.",
        "**Prompts** are templates the user invokes deliberately. `ward_report` turns \"ward 2\" into a full request for a status report that says which numbers to include and which tools to use. A prompt is not sent automatically and it does not replace the host's system prompt. Think of it as a well-written request that the server's author saved so users do not have to compose it each time.",
        {
          "callout": "Ask who should decide. If the model needs to choose, in the middle of a task, whether and when to fetch something, make it a tool. If the data is context the application should load up front, or that the user should pick, make it a resource. The database schema is the clearest resource in the lab: nearly every question needs it, and the model gains nothing by deciding whether to read it.",
          "title": "Tool or resource?",
          "tone": "tip"
        },
        "The protocol also defines features that run the other way, offered by the host to the server. The main one is **elicitation**: a server can ask the host to collect a piece of input from the user, such as a confirmation or a missing value. Lab 6 does not use it, but you will see it in larger servers. See [[mcp-architecture]] for the current list."
      ],
      "takeaway": "Tools are chosen by the model, resources by the application, prompts by the user; pick the primitive by asking who should decide when it is used.",
      "check": [
        {
          "q": "Why does `town://schema` work better as a resource than as a `get_schema` tool?",
          "a": "Almost every question needs it, so letting the model decide whether to fetch it only adds a step and a chance to skip it. As a resource, the host loads it once and puts it in context, as `mcp_agent.py` does."
        },
        {
          "q": "`request_stats` declares `status: Literal[\"open\", \"closed\", \"all\"] = \"all\"`. What does the model see, and what happens if it sends `\"pending\"`?",
          "a": "An `enum` of the three values with a default of `\"all\"` in the input schema. A call with `\"pending\"` fails argument validation and comes back as an error result instead of running a query with a filter that matches nothing."
        },
        {
          "q": "A teammate wants to turn `ward_report` into a tool so the model can call it. What changes about who is in control?",
          "a": "As a prompt, the user decides when a ward report is wanted and fills in the ward. As a tool, the model would decide, and the tool would just hand the model text instructions addressed to itself. Prompts exist so users can start workflows the server author designed."
        }
      ],
      "readings": [
        "mcp-server-concepts",
        "mcp-tools-spec",
        "mcp-python-sdk-v1"
      ]
    },
    {
      "topic": "transports",
      "blocks": [
        "A **{{transport|transport}}** is how MCP messages physically travel between client and server. The messages are identical on every transport; only the delivery changes. The specification defines two standard transports ([[mcp-transports]]).",
        {
          "table": {
            "head": [
              "",
              "stdio",
              "Streamable HTTP"
            ],
            "rows": [
              [
                "Who starts the server",
                "The client launches it as a child process",
                "The server runs on its own, like any web service"
              ],
              [
                "How messages travel",
                "One JSON message per line, on the child's standard input and output",
                "Each message is an HTTP POST to one URL, such as `/mcp`. Replies come back as JSON, or as a stream of events."
              ],
              [
                "How many clients",
                "One: the program that started it",
                "Many, over the network"
              ],
              [
                "Typical use",
                "Tools on the user's own machine: files, a local database, Lab 6's `town-data`",
                "Shared or hosted services: a company's ticketing system, a vendor's product"
              ],
              [
                "Credentials",
                "Read from environment variables the host passes in",
                "HTTP authorization, usually OAuth access tokens (topic 4)"
              ]
            ],
            "caption": "The two standard MCP transports"
          }
        },
        "**stdio** (standard input/output) is what Lab 6 uses. When `check_server.py` runs, `stdio_client` starts `python server.py` as a child process and holds both ends of its pipes. Each request is one line of JSON written to the server's input. Each response is one line read from its output. Nothing listens on a network port, so no other program on the machine can connect to it.",
        {
          "callout": "The specification says a stdio server must not write anything to its standard output that is not a valid MCP message. A single `print(\"debug\")` puts a line of plain text into the message stream. Some clients skip it; others drop the connection. That is why `server.py` has a `log()` helper that writes to stderr, and why the server is created with `log_level=\"WARNING\"`. Clients may show stderr, save it to a log, or ignore it, and should not treat it as an error.",
          "title": "Standard output belongs to the protocol",
          "tone": "warning"
        },
        "Two more lab details come from stdio. A host launches your server from *its own* working directory, so `server.py` builds `DB_PATH` from `__file__` instead of trusting the current folder. And the Claude Desktop config names the virtual environment's `python.exe` by absolute path, because the host's PATH may not include your `.venv` at all.",
        "**Streamable HTTP** is for servers that run independently and serve many clients. The server exposes a single URL, called the MCP endpoint. The client sends each message as an HTTP POST to it. The server answers with an ordinary JSON body, or, when it has progress updates to send before the final answer, with a Server-Sent Events stream: one long HTTP response that delivers several messages in order. With the 1.x Python SDK, switching the lab server to HTTP is a one-line change.",
        {
          "code": "if __name__ == \"__main__\":\n    log(f\"starting; database at {DB_PATH}\")\n    # Lab 6:  mcp.run()   -> stdio; the client starts this process\n    mcp.run(transport=\"streamable-http\")   # a web server with the MCP endpoint at /mcp",
          "title": "server.py served over HTTP instead of stdio (1.x SDK)",
          "note": "The v1 SDK documentation connects the Inspector to `http://localhost:8000/mcp` in this mode. The client changes too: `streamable_http_client(url)` from `mcp.client.streamable_http` replaces `stdio_client`. See [[mcp-python-sdk-v1]]."
        },
        "An HTTP server can be reached by anything that can reach its port, so the specification adds rules that stdio never needed:",
        {
          "list": [
            "**Check the `Origin` header.** Otherwise a malicious web page open in the user's browser can send requests to a server on `localhost`, an attack called DNS rebinding.",
            "**Listen only on 127.0.0.1 when running locally,** not on every network interface (0.0.0.0).",
            "**Authenticate every connection.** That is the next topic."
          ]
        },
        "You will meet an older design in tutorials and existing servers, \"HTTP with SSE\", which used two separate endpoints. Streamable HTTP replaced it in the 2025-03-26 revision, and it is deprecated. The 2026-07-28 revision also removed protocol-level sessions from Streamable HTTP, so each request now stands on its own. If a server's documentation mentions a session id header, it was written for an earlier revision.",
        {
          "callout": "Default to stdio for tools that work on one user's machine or files: it is simpler and has no network attack surface. Choose HTTP when several people or programs must share one running server, when the data lives on another machine, or when the server needs credentials that users should never hold. The Lab 7 help desk is the second kind: if your organization wrapped it in MCP, it would be an HTTP server with its own login.",
          "title": "Choosing a transport",
          "tone": "tip"
        }
      ],
      "takeaway": "stdio is a private pipe to a child process the client starts; Streamable HTTP is a network service many clients share. The messages are the same, but the security work is very different.",
      "check": [
        {
          "q": "Your server works when you run `check_server.py`, but after you add `print(\"Loaded 40 facilities\")` Claude Desktop shows it as failed, with a JSON parse error in the log. What happened?",
          "a": "The print went to standard output, which on stdio is the message stream. The client read a line that is not a JSON-RPC message. Send diagnostics to stderr, as the lab's `log()` helper does."
        },
        {
          "q": "Why can't two Claude Desktop users on different machines share one stdio `town-data` server?",
          "a": "A stdio server is a child process of the one client that launched it, connected only by that client's pipes. Sharing needs a server that runs on its own and accepts network connections: Streamable HTTP."
        },
        {
          "q": "For a demo you switch `town-data` to Streamable HTTP, bind it to 0.0.0.0, and add no authentication. Name two risks.",
          "a": "Anyone who can reach the machine's port can call `run_query` against the database. And without `Origin` checks, a web page open in your browser could reach the server through DNS rebinding. Bind to 127.0.0.1 for local use, check `Origin`, and add authentication before exposing it."
        }
      ],
      "readings": [
        "mcp-transports",
        "mcp-python-sdk-v1"
      ]
    },
    {
      "topic": "mcp-auth",
      "blocks": [
        "Lab 6's server has no login, and it does not need one. A stdio server runs as a child of the host, on the user's machine, with the user's own permissions. The specification says stdio servers should not use MCP's authorization flow at all, and should take any credentials they need from the environment. In practice the host's configuration passes an `env` block, and the server reads an {{environment-variable|environment variable}}, exactly as your labs read `ANTHROPIC_API_KEY`.",
        "A remote server is different. It is reachable over the network, it usually fronts data that belongs to an organization, and it must know *who is asking* and *what they may do*. Those are two separate questions. **Authentication** proves who the caller is. **Authorization** decides what that caller may do. MCP defines an optional authorization flow for HTTP transports, built on {{oauth|OAuth}} 2.1 ([[mcp-authorization]]).",
        "OAuth's central idea is that the program calling an API never sees the user's password. Instead, an **authorization server** (the organization's sign-in service) checks the user and issues an **access token**: a short-lived string meaning \"this client may do these things, at this server, for this user\". The client sends the token with each request in an `Authorization: Bearer <token>` header. The server that holds the data is the **resource server**. In MCP, that is the MCP server itself.",
        {
          "table": {
            "head": [
              "OAuth role",
              "In remote MCP",
              "Lab 7 analogy"
            ],
            "rows": [
              [
                "Resource server",
                "The MCP server: checks each token and the scopes it carries",
                "`helpdesk_api.py`, which checks `X-API-Key` and its scopes"
              ],
              [
                "Authorization server",
                "The organization's identity provider, which signs users in and issues tokens",
                "The `KEYS` table, standing in for an identity team that issues credentials"
              ],
              [
                "Client",
                "The MCP client inside the host",
                "The `Helpdesk` class in `helpdesk_client.py`"
              ],
              [
                "Scope",
                "A named permission carried by the token, such as read or write access",
                "The `\"read\"` and `\"write\"` scopes on each key"
              ]
            ],
            "caption": "OAuth roles, mapped onto systems you have already built"
          }
        },
        "Here is the flow in the order a client meets it:",
        {
          "list": [
            "The client calls the MCP server without a token and gets HTTP 401. The response's `WWW-Authenticate` header points to the server's *protected resource metadata*, a small JSON document that names its authorization server.",
            "The client reads that document, then the authorization server's own metadata, to learn where to send the user.",
            "The client identifies itself to the authorization server. It may be registered in advance, or it may use one of the self-registration methods the specification describes.",
            "The user signs in and approves in a browser. The client receives a one-time code and exchanges it for an access token. A technique called PKCE ensures that only the client that started the flow can make that exchange.",
            "The client sends the token on every request. The server checks that it is valid, unexpired, issued *for this server*, and carries the scopes the operation needs."
          ],
          "ordered": true
        },
        "Two rules in the specification are worth remembering, because they are about trust, not plumbing. The first is **audience**. A server must accept only tokens issued specifically for it, and the client names the server it wants a token for (the `resource` parameter). A token meant for the help desk then cannot be replayed against the payroll system. The second is **no token passthrough**. An MCP server that calls another API must not forward the user's token to it; it uses its own credential for that API. Forwarding tokens breaks audit trails and lets one compromised service reach others ([[mcp-security]]).",
        "Scopes are where {{least-privilege|least privilege}} meets MCP. Clients should request only the scopes they need. A server that receives a token without enough scope answers 403 with `error=\"insufficient_scope\"` and names the scope required, so the client can ask the user for more. A help desk MCP server could grant read access by default and challenge for write access only when a write tool is first called. That is Lab 7's two-key design, expressed in OAuth.",
        {
          "code": "from pydantic import AnyHttpUrl\nfrom mcp.server.auth.provider import AccessToken, TokenVerifier\nfrom mcp.server.auth.settings import AuthSettings\nfrom mcp.server.fastmcp import FastMCP\n\n\nclass HelpdeskTokenVerifier(TokenVerifier):\n    async def verify_token(self, token: str) -> AccessToken | None:\n        # Ask your identity provider whether the token is valid, unexpired, issued\n        # for this server, and which scopes it carries. Returning None rejects it.\n        ...\n\n\nmcp = FastMCP(\n    \"helpdesk\",\n    token_verifier=HelpdeskTokenVerifier(),\n    auth=AuthSettings(\n        issuer_url=AnyHttpUrl(\"https://login.example.edu\"),\n        resource_server_url=AnyHttpUrl(\"https://helpdesk.example.edu/mcp\"),\n        required_scopes=[\"tickets:read\"],\n        validate_token_resource=True,   # refuse tokens issued for a different server\n    ),\n)",
          "title": "A 1.x FastMCP server acting as an OAuth resource server (trimmed sketch; not a lab step)",
          "note": "Adapted from the Authorization page of [[mcp-python-sdk-v1]], which has the full example. Your work is the verify step, and it should call your identity provider's token-validation library, never hand-written string checks. The URLs and scope names here are placeholders."
        },
        {
          "callout": "A token decides what a client *may* call. It does not decide whether a particular call is wise. A token with write scope lets an agent change any ticket the scope covers. The host's permission prompts and the confirmation gates in Module 7 are separate controls, and you need them as well.",
          "title": "Authorization is not approval",
          "tone": "warning"
        }
      ],
      "takeaway": "Local stdio servers take credentials from the environment; remote servers are OAuth resource servers that accept only tokens issued for them, check scopes on every request, and never pass a user's token through.",
      "check": [
        {
          "q": "Why does the specification tell stdio servers not to use the OAuth flow?",
          "a": "The server runs as a child process of the host on the user's own machine, with no network endpoint anyone else can reach. Any credentials it needs for other systems come from environment variables set in the host's configuration."
        },
        {
          "q": "Your MCP server receives a valid token whose audience is the payroll API, not your server. Should it accept the token?",
          "a": "No. Servers must accept only tokens issued for themselves. Accepting it would let a token for any service be replayed against yours, and your logs would attribute calls to the wrong client."
        },
        {
          "q": "Map Lab 7's 403 for \"read key, write\" onto MCP authorization.",
          "a": "It is an insufficient-scope response: the caller is authenticated, but its credential lacks the write scope. Over MCP's HTTP transport the server would return 403 with `error=\"insufficient_scope\"` and the scope required, and the client could ask the user to approve a token with that scope."
        }
      ],
      "readings": [
        "mcp-authorization",
        "mcp-security",
        "mcp-python-sdk-v1"
      ]
    },
    {
      "topic": "mcp-testing",
      "blocks": [
        "An MCP server has three audiences, and each needs its own test. The protocol: does the server speak MCP at all? A person: can someone call each tool correctly from its name, description, and schema? A model: does a real host use the tools well? Lab 6 tests all three, in that order. The order matters. If a lower layer is broken, every failure above it is noise.",
        {
          "table": {
            "head": [
              "Layer",
              "Tool",
              "Answers",
              "Catches"
            ],
            "rows": [
              [
                "Protocol",
                "`check_server.py`, a scripted client",
                "Does it start, list its primitives, and answer?",
                "Import errors, prints to stdout, wrong resource URIs, unhandled exceptions"
              ],
              [
                "By hand",
                "The MCP Inspector",
                "Can a person call each tool correctly using only what a model would see?",
                "Vague descriptions, confusing parameters, unhelpful error text"
              ],
              [
                "With a model",
                "Claude Desktop and `mcp_agent.py`",
                "Does a model pick the right tools with the right arguments?",
                "Tools a model ignores or misuses; differences between hosts"
              ]
            ],
            "caption": "Three layers of testing an MCP server"
          }
        },
        "**Protocol tests.** `check_server.py` is a complete {{mcp-client|MCP client}} in about twenty lines. It starts the server, lists every primitive, calls `request_stats` with known arguments, calls `facility_history` with a bad id, and reads one resource. Because `make_db.py` builds the database from a fixed seed, the answers are known in advance: 38 closed repair requests in ward 1. That makes it easy to turn into a {{regression-test|regression test}} that `pytest` runs after every change.",
        {
          "code": "import asyncio\nimport json\nimport sys\n\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nSERVER = StdioServerParameters(command=sys.executable, args=[\"server.py\"])\n\n\nasync def _tool_names():\n    async with stdio_client(SERVER) as (read, write), ClientSession(read, write) as s:\n        await s.initialize()\n        return {t.name for t in (await s.list_tools()).tools}\n\n\nasync def _call(tool: str, args: dict):\n    async with stdio_client(SERVER) as (read, write), ClientSession(read, write) as s:\n        await s.initialize()\n        return await s.call_tool(tool, args)\n\n\ndef test_lists_four_tools():\n    assert asyncio.run(_tool_names()) == {\"list_facilities\", \"request_stats\",\n                                          \"facility_history\", \"run_query\"}\n\n\ndef test_ward1_closed_repairs():\n    r = asyncio.run(_call(\"request_stats\", {\"category\": \"repair\", \"ward\": 1, \"status\": \"closed\"}))\n    assert not r.isError\n    assert json.loads(r.content[0].text)[\"requests\"] == 38\n\n\ndef test_bad_id_is_an_error_result_not_a_crash():\n    r = asyncio.run(_call(\"facility_history\", {\"facility_id\": 999}))\n    assert r.isError and \"list_facilities\" in r.content[0].text\n\n\ndef test_run_query_refuses_writes():\n    r = asyncio.run(_call(\"run_query\", {\"sql\": \"DELETE FROM facilities\"}))\n    assert r.isError",
          "title": "test_server.py: check_server.py turned into tests",
          "note": "Run in PowerShell from the Lab 6 folder with the venv active: `pip install pytest`, then `python -m pytest -q`. Each test starts a fresh server, which is slow but simple. The 1.x SDK also offers an in-memory client session for faster tests; see the Testing page of [[mcp-python-sdk-v1]]."
        },
        "Notice the last test. `run_query` refuses anything that does not start with SELECT or WITH, and the database is also opened read-only (`mode=ro`), so even a query that slipped past the check could not change data. A test that proves a forbidden action is refused is worth more than one that proves an allowed action works.",
        "**By hand, in the Inspector.** The MCP Inspector is a generic MCP client with a web interface and no model in it. `mcp dev server.py` starts your server under it. You pick a tool, type its arguments, and see the raw result, including error results. In this test *you* play the model. If you hesitate over which tool answers \"how much did ward 3 spend on repairs last year?\", or have to read the source to learn that `year` filters on the date a request was opened, a model will hesitate too. Fix the name, description, or parameters, not the prompt.",
        "The Inspector also has a command-line mode, useful for quick checks from a script or a CI job ([[mcp-inspector]]):",
        {
          "code": "npx @modelcontextprotocol/inspector --cli python server.py --method tools/list\nnpx @modelcontextprotocol/inspector --cli python server.py --method tools/call --tool-name request_stats --tool-arg category=repair",
          "title": "Inspector CLI mode (PowerShell, from the Lab 6 folder, venv active)",
          "note": "The Inspector runs on Node.js, and its minimum Node version has risen over time. If `npx` complains, check [[mcp-inspector]] for the current requirement."
        },
        "**With real clients.** Only a model can show whether the tools work for a model. Lab 6 asks the same question of two hosts and compares the *tool calls*, not just the answers. Claude Desktop usually calls `request_stats` once per ward. Your agent might do the same, or write one `run_query` with a GROUP BY. If the answers differ, the server is not the reason, because both hosts called the same code. The difference is in the arguments each host's model chose. Your {{trace|trace}} (`traces/ward_question.jsonl`) and Claude Desktop's expanded tool calls are the evidence.",
        {
          "callout": "Work down the layers. Does `python check_server.py` work from the lab folder? Does it still work from a different folder, using the absolute paths from your config? Is anything printed to standard output? Is `claude_desktop_config.json` valid JSON, with doubled backslashes? Most connection failures are one of these, and none of them needs a model to diagnose.",
          "title": "When a host will not connect",
          "tone": "tip"
        },
        "Module 11 turns the model layer into an {{eval-set|eval set}}: many questions with known answers, run against the agent after every change. Module 12 adds security tests, such as what happens when a resource contains instructions instead of data."
      ],
      "takeaway": "Test an MCP server from the bottom up: a scripted client for the protocol, the Inspector for whether a person can use the tools, then real hosts with traces for how a model uses them.",
      "check": [
        {
          "q": "`check_server.py` lists all four tools, but Claude Desktop shows `town-data` as failed. Which layer is broken, and what do you check first?",
          "a": "Not the protocol code, because a client already works. It is how the host launches the server: the paths in `claude_desktop_config.json` (absolute, doubled backslashes, the venv's `python.exe`) and whether the server can find its database when started from another folder. The Developer settings page shows the server's log."
        },
        {
          "q": "People are not the intended callers of these tools. Why is \"a person can call it correctly in the Inspector\" still a useful test?",
          "a": "In the Inspector you have exactly what the model has: the name, the description, and the schema. If that is not enough for you, it is not enough for the model, and you found the problem without spending any tokens."
        },
        {
          "q": "Claude Desktop says ward 2 has the most open repair requests and your agent says ward 3. How do you find out why?",
          "a": "Compare the tool calls and results in both: the expanded calls in Claude Desktop and `traces/ward_question.jsonl`. The server is shared, so look for different arguments (a `status` of open versus all, a missing category filter) or an agent that stopped before checking all four wards."
        }
      ],
      "readings": [
        "mcp-inspector",
        "mcp-python-sdk-v1",
        "mcp"
      ]
    }
  ]
};
