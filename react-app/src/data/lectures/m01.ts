import type { LectureNotesDef } from "../types";

// Module 1 — LLM foundations for engineers: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M01_NOTES: LectureNotesDef = {
  "moduleId": "m01",
  "intro": "These notes go with the Module 1 lecture and Lab 1. They build one idea: a language model is a dependency like any other, with inputs, outputs, a price, a speed, and known ways of failing, and an engineer's first job is to measure all five. Lab 1's `ask.py` is the running example. Read a topic before the lecture that covers it, and come back to the code panels during the lab.",
  "sections": [
    {
      "topic": "what-an-llm-is",
      "blocks": [
        "A {{llm|large language model}} is a program that has learned, from an enormous amount of text, to predict what text comes next. Given a sequence of {{token|tokens}}, it produces a probability for every possible next token. The API picks one, appends it, and asks again, one token at a time, until the answer is finished or a limit is reached. Everything else you will see in this course, from chat to tool calls to agents, is built on top of that one repeated step.",
        "After that first training, models are tuned to follow instructions and hold a conversation, which is why they answer questions instead of just continuing your sentence. The prediction machinery underneath does not change: the model produces text that is *likely* given what it has seen, which is usually, but not always, text that is *true*.",
        "For an engineer, the useful picture is a remote service with unusual properties:",
        {
          "table": {
            "head": [
              "It is",
              "It is not"
            ],
            "rows": [
              [
                "A function from text to text, reached over the network",
                "A database. It does not look facts up; it reproduces patterns it learned."
              ],
              [
                "**Stateless**: each call sees only what you send in that call",
                "A memory. It has no record of your last request unless you send it again."
              ],
              [
                "Probabilistic: the same input can give different outputs",
                "A calculator. It can do arithmetic, but it is not guaranteed to get it right."
              ],
              [
                "Frozen at a training cutoff",
                "Up to date. It does not know today's date or recent events unless you tell it."
              ],
              [
                "Metered by the token, in and out",
                "Free to call in a loop. Every repeat costs money and time."
              ],
              [
                "Very good at language: reading, rewriting, classifying, extracting",
                "Accountable. Your code is responsible for checking what it says."
              ]
            ],
            "caption": "A language model, seen as a dependency"
          }
        },
        "None of these are reasons to avoid models. They are the design constraints, the same way \"the network can fail\" is a design constraint for any web service. The rest of this module puts a number on each one: what goes in (tokens), how outputs vary (sampling), what it costs, how long it takes, and how it fails.",
        {
          "callout": "You pin library versions in `requirements.txt` so your code behaves the same next month. Models need the same treatment: a dated model id, a fixed set of parameters, and a log of what came back. Lab 1 starts all three on day one.",
          "tone": "tip",
          "title": "Treat the model like any other dependency"
        }
      ],
      "takeaway": "A language model predicts the next token, one at a time. It is stateless, probabilistic, frozen at a training date, and metered, so you design around those facts the way you design around a slow or unreliable network.",
      "check": [
        {
          "q": "Lab 1's `ask.py` sends one prompt per run. If you run it twice, does the second call know about the first? What would you have to do to make it know?",
          "a": "No. Each call is independent. To give the model the earlier exchange, your code must send it again as part of the messages list in the next call (topic 5)."
        },
        {
          "q": "A student asks the model \"what is today's date?\" and gets a confident, wrong answer. Which row of the table explains it, and how should code handle dates?",
          "a": "\"Frozen at a training cutoff\": the model has no clock. Code should pass the date in, as Lab 2 does with `--today`, rather than letting the model guess."
        },
        {
          "q": "Why does \"usually true\" matter more in a program than in a chat window?",
          "a": "In chat, a person reads the answer and can notice a mistake. In a program, the answer flows straight into the next step: a database row, a tool call, an email. A mistake travels unless code checks for it."
        }
      ]
    },
    {
      "topic": "decision-ladder",
      "blocks": [
        "Before choosing a model, ask whether the problem needs one. This course uses a {{decision-ladder|decision ladder}} with four rungs. Each rung up buys flexibility and costs predictability. The rule is to **climb only as high as the problem forces you**.",
        {
          "table": {
            "head": [
              "Rung",
              "Who decides each step",
              "Cost per run",
              "How you test it",
              "Example"
            ],
            "rows": [
              [
                "1. Plain code and rules",
                "Your code, completely",
                "Effectively zero",
                "Unit tests with exact answers",
                "Is this a valid ZIP code? Is the invoice total over $5,000?"
              ],
              [
                "2. {{workflow-automation|Workflow automation}}",
                "A fixed sequence you drew in advance",
                "Small and fixed",
                "Run the flow with known inputs",
                "When a form is submitted, create a ticket and email the requester."
              ],
              [
                "3. A single model call",
                "Your code; the model only interprets one piece",
                "One call, bounded",
                "A test set of inputs and expected outputs",
                "Pull the date, time, and price out of this email."
              ],
              [
                "4. An {{agent|agent}}",
                "The model chooses the next step, in a loop",
                "Variable; depends on the path",
                "Evaluation over many runs (Module 11)",
                "Find which system has the wrong address, then propose a fix."
              ]
            ],
            "caption": "The decision ladder"
          }
        },
        "Rungs 1 and 2 are deterministic: the same input always takes the same path. Rung 3 adds one fuzzy step that interprets messy language, wrapped in ordinary code (Module 2 is entirely about this rung). Rung 4 hands the *path* to the model, which is powerful when the path genuinely cannot be known in advance, and expensive in every other case.",
        "Three questions place most problems:",
        {
          "list": [
            "**Can the rule be written down?** If a person could follow a checklist with no judgment calls, it is rung 1 or 2.",
            "**Is the hard part understanding language?** Free-form text, varied phrasing, or a classification a person makes by reading: that is rung 3.",
            "**Does the next step depend on what the last step found?** Look something up, then decide what to look up next, an unknown number of times: only then rung 4."
          ],
          "ordered": true
        },
        {
          "callout": "Systems mix rungs. An agent's tools are usually rung 1 code: a SQL query, a calculator, an API call. A good agent design keeps as much as possible on the lower rungs and gives the model only the decisions that truly need it.",
          "tone": "aside",
          "title": "The ladder applies inside a system, too"
        },
        "Employers ask for this judgment directly. \"We used AI\" is not a design decision; \"we used one model call for classification because the categories were fixed, and kept routing in code so it is auditable\" is. Every final project in this course must include a one-paragraph justification that the problem needs an agent rather than something lower on the ladder."
      ],
      "takeaway": "Choose the lowest rung that solves the problem: code and rules, then workflow automation, then a single model call, then an agent. Each rung up trades predictability, cost, and testability for flexibility.",
      "check": [
        {
          "q": "Place each on the ladder: (a) reject any password shorter than 12 characters; (b) sort incoming support emails into billing, outage, or other; (c) when a purchase order is approved, notify finance and update the spreadsheet.",
          "a": "(a) Rung 1: a rule. (b) Rung 3: interpreting free-form text into a fixed set of categories. (c) Rung 2: a fixed sequence triggered by an event."
        },
        {
          "q": "A teammate says, \"Let's make it an agent so it's more flexible.\" What question do you ask?",
          "a": "Which step can't be written down in advance? If no step needs the model to choose what happens next, a single call or a workflow is cheaper, faster, and easier to test."
        },
        {
          "q": "Why does testing get harder at each rung?",
          "a": "Rung 1 has exact answers. Rung 2 has a fixed path. Rung 3 has one probabilistic step, testable with a set of examples. Rung 4 can take a different path every run, so you have to evaluate many runs and judge the path as well as the answer."
        }
      ],
      "readings": [
        "building-effective-agents"
      ]
    },
    {
      "topic": "tokens-context",
      "blocks": [
        "Models do not read characters or words. They read **tokens**: common words, pieces of longer words, punctuation, and spaces, each mapped to a number. In English, a token averages roughly three-quarters of a word. Code, numbers, unusual names, and many other languages break into more tokens per word.",
        "Tokens matter because **everything is counted in them**: how much fits, how much it costs, and how long it takes. You do not need to count them yourself. Every response includes a `usage` object with the exact numbers, which is what `ask.py` prints:",
        {
          "code": "u = message.usage\nprint(f\"in={u.input_tokens} out={u.output_tokens}\")",
          "title": "Reading real token counts from the response (from ask.py)"
        },
        "The {{context-window|context window}} is the most tokens a model can handle in one call: your system prompt, the whole conversation so far, any documents you included, and the answer it writes, added together. Current Claude models allow up to about a million tokens, several novels' worth. The models overview page lists each model's limits, and the Models API returns them too.",
        "A huge window does not mean you should fill it. Long inputs cost more in three ways:",
        {
          "list": [
            "**Money.** Input tokens are billed on every call. A 50,000-token document sent with each of 20 questions is a million input tokens.",
            "**Time.** The model has to process all of it before it starts answering.",
            "**Quality.** Models use long contexts unevenly. Research has repeatedly found that information buried in the middle of a long input is used less reliably than information at the start or end, and accuracy tends to slip as more unrelated text is added. More context can make an answer worse."
          ]
        },
        {
          "callout": "The API is stateless, so a conversation is re-sent in full on every turn. Turn 10 pays for turns 1 to 9 again. An agent that loops eight times re-reads its growing history eight times. This one fact explains most surprising agent bills (topic 6 does the arithmetic).",
          "tone": "warning",
          "title": "Why conversations get expensive"
        },
        "The engineering habit is to send **what the task needs, not everything you have**: the relevant section rather than the whole handbook, a summary of old turns rather than the full transcript. Module 5's retrieval is this habit turned into a technique."
      ],
      "takeaway": "Tokens are the unit of everything: capacity, cost, and time. The context window is a ceiling, not a target. Send what the task needs, because long inputs cost more and can make answers worse.",
      "check": [
        {
          "q": "Lab 1 asks you to set `max_tokens=64` temporarily. What happens to `in=` and `out=`, and what does that prove?",
          "a": "`out=` drops to about 64 and the answer is cut off; `in=` barely changes. It proves the counts come from the API's response, not from your own arithmetic, and shows that `max_tokens` limits only the output."
        },
        {
          "q": "A 200-page manual fits in the context window. Name two reasons not to send all of it with every question.",
          "a": "Cost and latency: you pay for and wait on every input token on every call. Quality: the relevant paragraph is easier for the model to use when it is not surrounded by 199 pages of unrelated text."
        },
        {
          "q": "Why might the same paragraph cost more tokens in Spanish than in English, or as Python code than as prose?",
          "a": "Tokenizers are built mostly from common English text, so English words often map to a single token. Other languages, code, and unusual strings break into more, smaller pieces."
        }
      ],
      "readings": [
        "lost-in-middle",
        "claude-models"
      ]
    },
    {
      "topic": "sampling",
      "blocks": [
        "At each step the model produces a probability for every possible next token. **Sampling** is how one gets picked. The settings you control decide how adventurous that pick is:",
        {
          "table": {
            "head": [
              "Setting",
              "What it does",
              "Typical use"
            ],
            "rows": [
              [
                "{{temperature|Temperature}}",
                "Reshapes the probabilities. Low values sharpen them toward the most likely token; high values flatten them so less likely tokens get picked more often.",
                "0 or near 0 for extraction, classification, and code; higher for brainstorming and varied wording."
              ],
              [
                "{{top-p|Top-p}}",
                "Keeps only the most likely tokens whose probabilities add up to p (for example 0.9), and picks among those.",
                "An alternative to temperature for trimming unlikely choices."
              ],
              [
                "`max_tokens`",
                "Stops generation after this many output tokens.",
                "A hard ceiling on length, cost, and time. Not a target length."
              ]
            ],
            "caption": "The sampling settings you control"
          }
        },
        "Change one of temperature or top-p, not both; Anthropic's documentation recommends exactly that. Most of the time, temperature is the only one you need.",
        "Lab 1's sweep makes this concrete. The same prompt, ten runs at each of two temperatures, and a count of how many distinct answers came back:",
        {
          "code": "for temp in (\"0.0\", \"1.0\"):\n    outs = [r[\"output\"] for r in rows if r[\"temperature\"] == temp]\n    print(temp, \"distinct:\", len(set(outs)), \"of\", len(outs))",
          "title": "count_variation.py: measure variation instead of eyeballing it",
          "note": "Typical result: 1 to 3 distinct outputs at 0.0, and 8 to 10 at 1.0. Your numbers are the ones that go in README.md."
        },
        {
          "callout": "Temperature 0 makes outputs much less varied, not identical. Small differences in how requests are batched and computed on the provider's hardware can still change a token, and once one token differs, everything after it can too. The model behind an id can also be updated. Never write a test that requires two calls to return byte-for-byte the same text.",
          "tone": "warning",
          "title": "Determinism is not on the menu"
        },
        "**Reproducibility** is therefore something you build, not a setting you switch on:",
        {
          "list": [
            "Pin a **dated model id**, not an alias that moves to a newer model.",
            "Log the parameters of every call: model, temperature, `max_tokens`, and prompt version.",
            "Save the outputs you base decisions on, as `results/sweep.csv` does, so a claim can be checked later without calling the model again.",
            "Judge quality with **rates over many runs** (\"9 of 10 correct\"), not one lucky or unlucky result."
          ]
        }
      ],
      "takeaway": "Temperature trades consistency for variety. Use low temperature where there is one right answer, but never rely on exact repeatability; build reproducibility from pinned model ids, logged parameters, and saved outputs.",
      "check": [
        {
          "q": "Your sweep shows 2 distinct outputs at temperature 0. A classmate says the API is broken. What do you tell them?",
          "a": "Temperature 0 reduces variation; it does not guarantee identical outputs. Small numerical differences on the provider's side can change a token, and the rest of the answer follows from it. That is expected behavior."
        },
        {
          "q": "Which temperature would you choose for a tool that extracts the due date from an invoice, and why?",
          "a": "0, or very close to it. There is one correct answer, and variety only adds chances to be wrong. Higher temperatures help when you want several different ideas or wordings."
        },
        {
          "q": "A test asserts `ask(\"capital of Ohio\") == \"Columbus.\"`. Why is this a fragile test, and what is a sturdier one?",
          "a": "The wording can change between runs (\"Columbus\", \"The capital is Columbus.\"). A sturdier test checks the fact: `\"columbus\" in answer.lower()`, ideally run several times and reported as a pass rate."
        }
      ],
      "readings": [
        "anthropic-api"
      ]
    },
    {
      "topic": "chat-apis",
      "blocks": [
        "Every major model API has the same basic shape: you send a list of **messages**, each with a **role**, and you get one new message back. On the Claude API the roles are `user` (your side) and `assistant` (the model's side), and the {{system-prompt|system prompt}} is a separate `system` parameter that sets the rules for the whole exchange.",
        {
          "code": "message = client.messages.create(\n    model=MODEL,\n    max_tokens=512,\n    system=\"You are a concise assistant for a university IT help desk.\",\n    messages=[\n        {\"role\": \"user\", \"content\": \"How do I reset my campus password?\"},\n    ],\n)\nprint(message.content[0].text)\nprint(message.stop_reason)   # why it stopped: end_turn, max_tokens, ...",
          "title": "One call: a system prompt and one user message"
        },
        "The API is **stateless**. It does not remember the previous call. A multi-turn conversation exists only because *your code* keeps the history and sends all of it every time:",
        {
          "code": "history = [{\"role\": \"user\", \"content\": \"How do I reset my campus password?\"}]\nreply = client.messages.create(model=MODEL, max_tokens=512, system=SYSTEM, messages=history)\nhistory.append({\"role\": \"assistant\", \"content\": reply.content[0].text})\n\nhistory.append({\"role\": \"user\", \"content\": \"And if I no longer have my old phone?\"})\nreply = client.messages.create(model=MODEL, max_tokens=512, system=SYSTEM, messages=history)\n# Turn 2 re-sends turn 1. Without it, \"my old phone\" would make no sense to the model.",
          "title": "Multi-turn state is your code's job"
        },
        "Some details worth knowing early:",
        {
          "list": [
            "**Roles alternate.** `user`, then `assistant`, then `user`. Module 2 uses this on purpose: the failed output goes back as an `assistant` turn and the validation error as a `user` turn.",
            "**The reply is a list of content blocks**, not a single string. Today you read the text blocks; in Module 3 a block can be a tool call instead. That is why `ask.py` joins only the blocks whose `type` is `\"text\"`.",
            "**Check why it stopped.** {{stop-reason|`stop_reason`}} is `end_turn` when the model finished, `max_tokens` when it was cut off, and `refusal` when it declined. Code that ignores it will treat a truncated answer as a complete one.",
            "**Other providers use the same idea with different names.** OpenAI's APIs, for example, put the system instructions in the message list with their own role names. The concepts transfer; check each SDK's docs for the details."
          ]
        },
        {
          "callout": "Because the history is just a list in your program, you decide what goes in it. You can drop old turns, replace them with a summary, or leave out a document once it has been used. Managing that list well is most of what \"memory\" means in Module 5.",
          "tone": "tip",
          "title": "History is data you control"
        }
      ],
      "takeaway": "A chat API takes a system prompt and a list of role-tagged messages and returns one message. It remembers nothing; your code holds the conversation and re-sends it, and should always check `stop_reason`.",
      "check": [
        {
          "q": "In the multi-turn example, what would the model see on the second call if you forgot to append the first exchange to `history`?",
          "a": "Only \"And if I no longer have my old phone?\" with no context. It would have to guess what the question is about, and would probably ask, or answer something unrelated."
        },
        {
          "q": "Why does `ask.py` join text blocks instead of just printing `message.content`?",
          "a": "`content` is a list of blocks, not a string, and not every block is text; later modules add tool-use blocks. Joining only the text blocks gives a clean answer and keeps working when other block types appear."
        },
        {
          "q": "A response comes back with `stop_reason` equal to `max_tokens`. What does that tell you, and what should code do?",
          "a": "The answer was cut off at the limit, so it may be incomplete or, for JSON, invalid. Code should treat it as a failure: raise the limit, ask for a shorter answer, or retry. It should not use it as if it were complete."
        }
      ],
      "readings": [
        "anthropic-api",
        "openai-api"
      ]
    },
    {
      "topic": "cost-latency",
      "blocks": [
        "Every call has a price and a duration, and both are predictable enough to budget. **Cost** is tokens times price, with input and output priced separately:",
        {
          "code": "cost = (input_tokens / 1_000_000) * PRICE_IN + (output_tokens / 1_000_000) * PRICE_OUT",
          "title": "The cost formula ask.py uses",
          "note": "Prices are quoted in US dollars per million tokens and change over time. Look up the current numbers on the pricing page; never hard-code a price you remember."
        },
        "Output tokens cost several times more than input tokens. To make the arithmetic concrete, the examples below use **illustrative** prices of $2 per million input tokens and $10 per million output tokens, roughly the range of a mid-tier model:",
        {
          "table": {
            "head": [
              "Workload",
              "Tokens",
              "Cost",
              "At scale"
            ],
            "rows": [
              [
                "One extraction: a 2,000-token email, a 300-token answer",
                "2,000 in · 300 out",
                "$0.004 + $0.003 = $0.007",
                "10,000 emails ≈ $70"
              ],
              [
                "The same task as an 8-step agent, each step re-reading a history that grows by 800 tokens",
                "38,400 in · 2,400 out",
                "$0.077 + $0.024 ≈ $0.10",
                "10,000 emails ≈ $1,000"
              ]
            ],
            "caption": "Illustrative arithmetic: the same job on two rungs of the ladder"
          }
        },
        "Same model, same task, about fourteen times the cost, almost all of it from re-reading history (topic 3). That is the decision ladder in dollars.",
        "**Latency** has two parts: the time before the first token appears, which grows with input length, and the time to write the rest, which grows with output length. Writing is the slower part, so **long answers are slow answers**. Two habits help:",
        {
          "list": [
            "**Ask for shorter output.** \"Answer in one sentence\" or a compact JSON shape cuts both time and cost.",
            "**Stream** when a person is waiting. The total time is the same, but text appears as it is written, so the wait feels shorter. Batch jobs with nobody watching do not need it."
          ]
        },
        "**Model tiers.** Providers offer families from small and fast to large and capable. Claude's are Haiku (fastest, cheapest, aimed at high-volume work such as extraction, classification, and routing), Sonnet, Opus, and Fable (most capable, slowest, most expensive). The price gap between the smallest and largest tier is more than tenfold.",
        "**Choose the smallest model that works**, and prove it works:",
        {
          "list": [
            "Build a small test set of real inputs with known answers (Module 2 does this properly).",
            "Run it on a capable model to see what good looks like.",
            "Run it on a smaller tier. If the pass rate holds, the smaller model wins on cost and speed.",
            "Re-check when models or prompts change. The answer is not permanent."
          ],
          "ordered": true
        },
        {
          "callout": "Two provider features lower costs without changing the model. {{prompt-caching|Prompt caching}} charges much less for a long prefix, such as a system prompt or a document, that is re-sent unchanged. Batch processing runs non-urgent jobs at a discount in exchange for slower turnaround. Both are on the pricing page; Module 4 uses them.",
          "tone": "aside",
          "title": "Cheaper without a smaller model"
        }
      ],
      "takeaway": "Cost is tokens times price, and output costs more than input. Latency grows with output length. Measure both on every call, budget them up front, and choose the smallest model tier that passes your test set.",
      "check": [
        {
          "q": "Using the illustrative prices, what does a call with 10,000 input tokens and 1,000 output tokens cost?",
          "a": "10,000 / 1,000,000 × $2 = $0.02, plus 1,000 / 1,000,000 × $10 = $0.01, for $0.03 in total."
        },
        {
          "q": "Your chatbot feels slow. Which helps more: a shorter system prompt, or asking for shorter answers? Why?",
          "a": "Usually shorter answers. Output tokens are generated one at a time and dominate the total time; input is processed much faster per token. Streaming also helps how the wait feels."
        },
        {
          "q": "Why can't you choose a model tier by reading the vendor's benchmark table?",
          "a": "Benchmarks measure someone else's tasks. Only your own test set shows whether the smaller model is good enough for your inputs, and only your own measurements show your cost and latency."
        }
      ],
      "readings": [
        "claude-pricing",
        "claude-models"
      ]
    },
    {
      "topic": "failure-modes",
      "blocks": [
        "Every dependency fails in characteristic ways. A database times out; a disk fills up. Language models have four failure modes you will meet in the first week, and each needs a different defense:",
        {
          "table": {
            "head": [
              "Failure",
              "What it looks like",
              "How code can notice",
              "Defenses"
            ],
            "rows": [
              [
                "{{hallucination|Hallucination}}",
                "A fluent, confident answer that is false: an invented citation, a wrong date, an API function that does not exist.",
                "Often it cannot, by looking at the text alone. Checks against a source, schema rules, and tests catch some of it.",
                "Supply the facts in the prompt; require answers to cite what you supplied; validate; prefer a lookup tool to the model's memory."
              ],
              [
                "Instruction drift",
                "The model follows your rules at first, then slips: the format loosens, a constraint is forgotten, especially in long conversations or long inputs.",
                "Validation fails more often later in a session; tests on long inputs fail more than on short ones.",
                "Keep prompts and histories short; repeat critical rules near the end; validate every response, not just the first."
              ],
              [
                "Refusal",
                "The model declines, either with a polite explanation in text or with a refusal stop reason.",
                "`stop_reason == \"refusal\"`, or a text answer where your code expected data.",
                "Handle it as a normal outcome: log it, return a clear error, and route it to a person if it matters. Check whether the request is one the model should decline."
              ],
              [
                "Truncation",
                "The answer stops mid-sentence, or JSON is cut off before its closing brace.",
                "`stop_reason == \"max_tokens\"` (or the context window filled up).",
                "Check the stop reason on every call; raise `max_tokens` or ask for less; never parse a truncated answer as complete."
              ]
            ],
            "caption": "Four failure modes and how to defend against each"
          }
        },
        "Two of these show up in the response itself, so the cheapest defense is a few lines that run on every call:",
        {
          "code": "def text_or_raise(message):\n    \"\"\"Return the answer text, or raise if the call did not finish normally.\"\"\"\n    if message.stop_reason == \"max_tokens\":\n        raise RuntimeError(\"truncated: raise max_tokens or ask for a shorter answer\")\n    if message.stop_reason == \"refusal\":\n        raise RuntimeError(\"model declined this request\")\n    return \"\".join(b.text for b in message.content if b.type == \"text\")",
          "title": "Turn silent failures into loud ones",
          "note": "The Claude API also reports `model_context_window_exceeded` when a response fills the whole context window. Treat it like truncation."
        },
        "Hallucination is the hard one because nothing in the response marks it. The defenses are structural: give the model the facts instead of relying on what it remembers, make claims checkable (citations into the text you supplied, Module 5), and test on cases where you already know the answer (Modules 2 and 11).",
        {
          "callout": "The most dangerous model output is not an error. It is a plausible, well-formatted answer that is wrong and that nothing checks. Design every feature by asking what happens when the answer is confidently wrong, and who or what will notice.",
          "tone": "warning",
          "title": "Plausible is not the same as correct"
        }
      ],
      "takeaway": "Expect hallucination, instruction drift, refusals, and truncation. Catch the last two with `stop_reason` on every call; defend against the first two by supplying facts, keeping context short, validating every response, and testing against known answers.",
      "check": [
        {
          "q": "Which two failure modes can code detect from the response's metadata alone, and how?",
          "a": "Truncation (`stop_reason` is `max_tokens`, or the context window filled) and refusal (`stop_reason` is `refusal`). Hallucination and drift do not announce themselves; they need validation and tests."
        },
        {
          "q": "A model cites a court case with a convincing name and docket number that does not exist. Which failure is this, and what design change prevents it?",
          "a": "Hallucination. Do not ask the model to recall sources from memory. Supply the documents and require it to cite only from them, then check each citation against what you supplied."
        },
        {
          "q": "Your extraction prompt works on short emails but starts ignoring the \"null if not stated\" rule on very long ones. Name the failure and two mitigations.",
          "a": "Instruction drift, made worse by long context. Send only the relevant part of the email, and restate the critical rule near the end of the prompt. Validate every response and add long emails to the test set."
        }
      ],
      "readings": [
        "anthropic-api"
      ]
    },
    {
      "topic": "course-environment",
      "blocks": [
        "Lab 1 sets up the working habits the whole course depends on. Each one prevents a specific, common, and expensive mistake.",
        "**One course folder.** Every lab lives side by side in a single folder (`$HOME\\agentic-ai`):",
        {
          "code": "agentic-ai\\\n  AI-LOG.md            <- one log for the whole course\n  agentic-lab01\\       <- each lab is its own git repository\n    .gitignore  .env  .venv\\  ask.py  run_sweep.py  requirements.txt  README.md  results\\\n  agentic-lab02\\\n  ...",
          "title": "The course folder after a few weeks",
          "note": "Later labs copy files with paths like `..\\agentic-lab01\\.gitignore`, which only work when the labs are siblings. That is why every lab starts with `cd $HOME\\agentic-ai`."
        },
        "**A virtual environment per lab.** A {{virtual-environment|virtual environment}} (`.venv`) gives each lab its own installed packages, and `pip freeze > requirements.txt` records the exact versions. The code you write in week 1 still runs in week 10, and the grader can rebuild your setup exactly.",
        "**API keys never touch your code or your repository.** An {{api-key|API key}} is a password that bills your account. Lab 1's order of operations is deliberate:",
        {
          "list": [
            "Write `.gitignore` with `.env` in it **before** the key exists.",
            "Put the key in `.env` as `ANTHROPIC_API_KEY=...`.",
            "Load it into an {{environment-variable|environment variable}} with `python-dotenv`, and read it by name: `os.environ[\"ANTHROPIC_API_KEY\"]`.",
            "**Prove** the rule works: `git check-ignore -v .env` must name the line that excludes it.",
            "Read the staged file list before every commit. It is the last cheap moment to stop a secret."
          ],
          "ordered": true
        },
        {
          "callout": "A key that reaches a public repository is compromised, even if you delete the commit a minute later; automated scanners find new keys within minutes. Deleting history does not help. The only fix is to revoke the key in the Console and create a new one, so do that immediately and then clean up.",
          "tone": "warning",
          "title": "If a key is ever committed"
        },
        "**The AI-assistance log.** AI tools are required in this course, so the integrity policy is about disclosure, not prohibition. `AI-LOG.md` gets one row per lab: the tool and model, what you asked for, what you accepted, changed, or rejected, and **how you verified it**. That last column is the one that matters. \"I ran the tests and they passed\" is a verification; \"it looked right\" is not. You must be able to explain any code you submit, and the log is the record that you can."
      ],
      "takeaway": "One course folder, one virtual environment per lab, keys only in an ignored `.env` file read through environment variables, and an honest AI-assistance log. Each habit prevents a specific failure: broken paths, broken installs, leaked keys, and work you cannot explain.",
      "check": [
        {
          "q": "Why write `.gitignore` before creating `.env`, rather than after?",
          "a": "If `.env` exists first, one careless `git add .` can stage it before the ignore rule exists. Writing the rule first means there is never a moment when the secret is unprotected."
        },
        {
          "q": "You notice your API key in a commit that was pushed to GitHub ten minutes ago. What do you do first?",
          "a": "Revoke the key in the Claude Console and create a new one. Then remove it from the repository and its history. Rewriting history alone is not enough, because the key may already have been copied."
        },
        {
          "q": "Write an AI-log verification entry that would count, and one that would not.",
          "a": "Counts: \"Ran ask.py with max_tokens=64 and confirmed out= dropped to 64; ran the sweep and checked the CSV has 20 rows.\" Does not count: \"Looked over the code and it seemed fine.\""
        }
      ]
    }
  ]
};
