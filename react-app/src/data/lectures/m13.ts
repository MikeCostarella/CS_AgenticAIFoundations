import type { LectureNotesDef } from "../types";

// Module 13 — Final projects: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M13_NOTES: LectureNotesDef = {
  "moduleId": "m13",
  "intro": "These notes go with Module 13, the final two weeks. There is no new lab. The checkpoint is the final team project: a working system, its repository, evaluation results, a security review, a 10-minute demo, and a written report; the Projects page lists the full requirements and example projects. Most teams grow the midterm agent from Labs 3 to 7 into their final project, so the examples here come from that agent and from the example projects. The four topics follow the order you will need them: scope the project so it can be evaluated, design the demo around evidence, write the report and responsible-use statement, and review another team's design and code.",
  "sections": [
    {
      "topic": "scoping",
      "blocks": [
        "A final project can be graded only on what it can show. For an agent, \"show\" means evidence: traces of real tool calls, numbers from an {{eval-set|eval set}}, and attacks that were stopped. So scope **backwards from the evaluation**. Before you build a feature, you should be able to write down what a correct run looks like and how a program or a person would check it. If you cannot write that check, the feature is not ready to be in scope.",
        "Every project, whichever example you start from, has the same seven requirements. Each one maps to evidence you already know how to produce:",
        {
          "table": {
            "head": [
              "Requirement",
              "Evidence that proves it",
              "Where you practiced it"
            ],
            "rows": [
              [
                "A working agentic system with tool calling and at least one real integration",
                "Traces of real calls to an API, database, or {{mcp-server|MCP server}}",
                "Labs 3, 6, 7"
              ],
              [
                "A one-paragraph justification that the problem needs an agent",
                "A comparison with plain code, workflow automation, or a single model call",
                "Lab 3's LADDER.md; Modules 1 and 2"
              ],
              [
                "An evaluation harness with a documented eval set and reported metrics",
                "The case file, the harness, and a results table",
                "Lab 11 (30 or more cases)"
              ],
              [
                "A security review with prompt-injection testing and a permissions inventory",
                "Injection cases, a tools-and-credentials table, Lab 12 findings and fixes",
                "Labs 7 and 12"
              ],
              [
                "A responsible-use statement",
                "Intended users, limits, privacy, and human oversight, in writing",
                "Topic 3"
              ],
              [
                "A repository with setup instructions and an AI-assistance log",
                "A README a stranger can follow; `AI-LOG.md`",
                "Every lab"
              ],
              [
                "A 10-minute demo with traces and at least one handled failure",
                "A rehearsed demo script",
                "Topic 2"
              ]
            ],
            "caption": "Final project requirements and the evidence for each"
          }
        },
        "The common scoping mistake is a sentence like \"an agent that handles help desk tickets.\" It cannot be evaluated, because nobody can say what \"handles\" means for a given ticket. Compare a scoped version of the IT help-desk example project:",
        {
          "callout": "For each new ticket in the Maple Falls help desk, the agent proposes a category and priority and drafts a reply that cites one knowledge-base article. It escalates when no article matches or the ticket mentions a security incident. It writes nothing without a person's approval. Success: correct category on at least 80% of 30 past tickets, citation to the right article on at least 70%, and every security ticket escalated.",
          "tone": "tip",
          "title": "A scope you can evaluate"
        },
        "Each clause of that scope can be turned into a test case, and the thresholds tell you when you are done. The thresholds are the team's own targets, set before building; what matters is that you report honestly against them.",
        "A practical order for the first days:",
        {
          "list": [
            "**Write the task in one sentence**: who the user is, what goes in, what comes out.",
            "**Write five eval cases by hand, today.** Include one the agent should answer, one it should refuse or say it cannot answer, one it should escalate, and one injection attempt. Writing them exposes vague scope immediately.",
            "**Pick the smallest tool set** that solves those five cases, and fill in the tools table: tool, read or write, credential, gate.",
            "**Find the step that needs an agent.** If no step depends on what the previous one found, your justification paragraph will be hard to write, and that is a signal to move down the {{decision-ladder|decision ladder}}.",
            "**Write the cut list**: features you will drop, in order, if time runs short."
          ],
          "ordered": true
        },
        {
          "code": "## Scope\nProblem (one sentence):\nUsers:                     who uses it, and who is affected by it\nIn scope:                  the tasks the agent performs\nOut of scope:              what it refuses, escalates, or never touches\nSuccess measures:          metric, threshold, and the eval cases that measure it\nTools:                     tool | read or write | credential | gate\nWhy an agent:              the step whose next action depends on what was found\nBiggest risks:             from your Lab 12 threat model\nCut list:                  drop these first, in this order",
          "title": "A one-page scope statement (put it at the top of your design document)"
        },
        "Weeks 14 and 15 are short. Set a **feature freeze** before demo week: after it, only bug fixes, and every eval run, metric, and demo trace comes from the frozen version. Numbers measured on a different version than the one you demo are not evidence about the demo.",
        {
          "callout": "When time runs short, cut features, not evaluation. A smaller agent with an honest results table, a security review, and one well-handled failure beats a larger one with no numbers. Graduate teams also owe a research component, a benchmark comparison, a new evaluation method, or a reproducibility study, so scope it into the plan from the first day rather than the last week.",
          "tone": "warning",
          "title": "Cut scope, not evidence"
        }
      ],
      "takeaway": "Scope the project backwards from its evaluation: if you cannot write the test case and the threshold for a feature, it is not in scope yet, and when time runs short you cut features, never the evidence.",
      "check": [
        {
          "q": "Rewrite \"an assistant that helps residents with anything about city services\" into a scope that can be evaluated.",
          "a": "For example: \"Answers resident questions about trash, snow removal, and permits using only the town handbook, cites the section for every fact, and says the handbook does not cover it when it does not. Success: at least 85% correct answers and 100% valid citations on 30 questions, and 5 of 5 out-of-scope questions declined.\" It names the sources, the behavior at the edges, and the measures."
        },
        {
          "q": "Why write five eval cases before writing any agent code?",
          "a": "Writing a case forces you to decide what correct means for a concrete input. Vague scope shows up at once as cases you cannot write. The cases also become the first entries in the eval set and a fixed target for every design decision."
        },
        {
          "q": "With two days left, a team must choose between finishing a third agent role and growing its eval set from 10 to 30 cases. Which should it choose, and why?",
          "a": "The eval set. It is a stated requirement, and it is the evidence that the system works. An unevaluated third role adds risk and cannot be shown to help; the Module 8 lesson is that more agents need to earn their cost with measurements."
        }
      ],
      "readings": [
        "building-effective-agents"
      ]
    },
    {
      "topic": "demo-design",
      "blocks": [
        "The final demo is ten minutes, and it must show {{trace|traces}}, metrics, and at least one failure your system handled. That is a different goal from a product pitch. You are not trying to make the agent look magical. You are showing an audience of engineers that you know what it does, how well, at what cost, and what happens when things go wrong.",
        {
          "table": {
            "head": [
              "Minutes",
              "Segment",
              "What the audience should see"
            ],
            "rows": [
              [
                "0 to 1",
                "Problem and user",
                "One sentence of scope, and who would use it"
              ],
              [
                "1 to 2",
                "Why an agent, and how it is built",
                "The ladder justification; one diagram of model, tools, credentials, and gates"
              ],
              [
                "2 to 5",
                "A normal run",
                "A real task, then the trace: each tool call, its arguments, what came back, tokens used"
              ],
              [
                "5 to 7",
                "A handled failure",
                "Something going wrong and the system responding correctly"
              ],
              [
                "7 to 9",
                "Evidence",
                "The eval results table, cost and latency per task, the security review summary"
              ],
              [
                "9 to 10",
                "Limits",
                "What it does not do, what you would fix next, the responsible-use points"
              ]
            ],
            "caption": "A ten-minute demo plan"
          }
        },
        "**Show the trace, not just the answer.** An answer on screen proves only that some text came out. The trace proves the path: that the agent looked the facts up, which tools it chose, and that it stopped for the right reason. Put a readable view of it on screen, like the `show_trace.py` viewer from Lab 3, rather than raw JSON Lines.",
        "**Choose the handled failure on purpose.** You have built several kinds already, so pick the one that best matches your project's main risk:",
        {
          "list": [
            "**A tool fault**, as in Lab 4: a timeout or a bad result, retried, and then an honest partial answer instead of a guess.",
            "**A question the system cannot answer**, as in Lab 5: \"The handbook does not cover this,\" with no invented citation.",
            "**A declined or refused write**, as in Lab 7: the reviewer says no and the agent reports it truthfully, or the system of record rejects an illegal change with a 409.",
            "**A blocked injection**, from your Lab 12 findings: a planted document or ticket, and the control that stopped it.",
            "**An {{escalation|escalation}}**: a case the rules say a person must handle, landing in the review queue."
          ]
        },
        "**Metrics need context.** \"92% accurate\" says almost nothing on its own. Say how many cases, what counts as correct, how it was graded, and what it is compared with. A metrics slide that answers those questions in one table is worth more than several slides of screenshots:",
        {
          "table": {
            "head": [
              "Measure",
              "Baseline",
              "Final system"
            ],
            "rows": [
              [
                "Task success (n = 30, code-based {{grader|grader}})",
                "e.g. single model call",
                "your number"
              ],
              [
                "Confidently wrong answers",
                "",
                ""
              ],
              [
                "Escalations: needed and made / made but not needed",
                "",
                ""
              ],
              [
                "Injection cases blocked (n = your Lab 12 cases)",
                "",
                ""
              ],
              [
                "Mean cost and latency per task",
                "",
                ""
              ]
            ],
            "caption": "One metrics table, with the sample size in every row"
          }
        },
        "Run the demo live if you can, but **prepare for the model to behave differently** on the day. Pin the model id and use temperature 0, reset your data first (rerun `make_db.py`, rebuild the index, or restart the Lab 7 service from a fresh `helpdesk.db`), and keep the task text in a file so you are not typing long prompts in front of an audience. Keep the traces from your best rehearsal, and a short screen recording, as a backup. If the live run surprises you, say so and open the trace. Explaining an unexpected run well is good evidence that you understand your system.",
        {
          "code": "## Demo script: <team>\nReset:     your project's reset step (make_db.py, build_index.py, a fresh helpdesk.db)\nRun 1:     normal task         -> traces/demo_normal.jsonl\nRun 2:     planted failure     -> traces/demo_failure.jsonl\nBackup:    traces from rehearsal on <date>, plus recording.mp4\nSpeaker:   who talks during each segment, and who drives the keyboard\nTiming:    rehearsed twice with a timer; finishes by 9:30",
          "title": "A demo script, kept in the repository next to the traces"
        },
        {
          "callout": "Before you share your screen, close `.env`, clear terminal history that contains keys, and check that no trace on screen holds real personal data. A recording of a demo is permanent and gets shared.",
          "tone": "warning",
          "title": "Nothing secret on the projector"
        }
      ],
      "takeaway": "Design the demo as evidence: one real run with its trace, one failure your system handled on purpose, and a metrics table with sample sizes and a baseline, rehearsed with a reset step and a recorded backup.",
      "check": [
        {
          "q": "Why does the course require the demo to show a failure?",
          "a": "Every agent fails sometimes. Showing a handled failure proves the safeguards exist and work, and shows the team understands how its system breaks. A demo with only successes proves only that the happy path ran once."
        },
        {
          "q": "During the live demo the agent takes a different path than in rehearsal and gives a slightly different answer. What do you do?",
          "a": "Say so and open the trace. Point out which tool calls differed and why the answer is still correct, or why it is not. Models vary between runs (Module 1); explaining that calmly is better evidence than pretending, and the rehearsal traces are there as backup."
        },
        {
          "q": "A team's slide says \"Our agent is 95% accurate.\" List three things the audience needs to know before believing it.",
          "a": "How many cases (19 of 20 is very different from 285 of 300), how correctness was judged (code-based check, {{llm-as-judge|LLM-as-judge}}, or a person), and what it is compared with, such as a single-call baseline. Cost per task and the confidently-wrong rate also matter."
        }
      ],
      "readings": [
        "building-effective-agents"
      ]
    },
    {
      "topic": "reports",
      "blocks": [
        "The written report is where the evidence from the whole project comes together. It has two readers. An **engineer** wants to know how the system works, how you measured it, and whether they could reproduce your numbers. A **decision-maker or user** wants to know what it is for, what it must not be used for, and who is responsible. The technical report serves the first reader. The responsible-use statement serves the second.",
        {
          "table": {
            "head": [
              "Section",
              "What it contains",
              "Evidence to point to"
            ],
            "rows": [
              [
                "Problem and scope",
                "The one-page scope from topic 1",
                "The eval cases that encode it"
              ],
              [
                "Why an agent",
                "The ladder justification paragraph",
                "A comparison with a lower rung, with numbers"
              ],
              [
                "Architecture",
                "Model, tools, data, credentials, gates; one diagram",
                "The tools table: read or write, credential, gate"
              ],
              [
                "Evaluation",
                "How the eval set was built, the graders, results, failure analysis",
                "Results files and named trace files"
              ],
              [
                "Security review",
                "Threat model, permissions inventory, injection tests, Lab 12 findings and fixes",
                "Before-and-after traces for each fix"
              ],
              [
                "Responsible use",
                "The statement below",
                "Tests that back each stated limit"
              ],
              [
                "Limitations and next steps",
                "What does not work, and what you would do with more time",
                "Failure categories with counts"
              ],
              [
                "Reproducibility",
                "Setup, pinned versions, model id, dates of runs",
                "README, `requirements.txt`, `AI-LOG.md`"
              ]
            ],
            "caption": "Technical report outline"
          }
        },
        "Three habits make a report credible. **Tie every claim to evidence**: a results file, a trace, a commit. **Report numbers with their sample size and grader**, as in the demo. **Include negative results**: the change that did not help, the attack that got through before you fixed it. A report with no failures in it reads as a report that did not look.",
        "A **{{responsible-use-statement|responsible-use statement}}** is a short, plain-language document that says what the system is for, who should use it, what it must not be used for, how it handles personal data, and where people stay in control. The project requirements name four parts: intended users, limits, privacy, and human oversight. The idea comes from documentation practices such as model cards, which report how a model performs, for whom, and in what contexts it is meant to be used [[model-cards]].",
        {
          "code": "## Responsible-use statement: Maple Falls help desk assistant\n\nIntended users:   help desk staff, who review every suggestion. Not for direct use by requesters.\nWhat it does:     suggests a category and priority, drafts replies citing the knowledge base.\nLimits:           does not resolve, close, or reassign tickets on its own. Escalates security\n                  incidents and tickets with no matching article. Correct category on 24 of 30\n                  past tickets; wrong suggestions look plausible, so staff must read each one.\nPrivacy:          ticket text is sent to the model provider under the department's agreement.\n                  Traces are redacted for emails and phone numbers and deleted after 30 days.\nHuman oversight:  every write needs a typed approval; approvals are logged with the reviewer.\nFairness:         priority suggestions were tested with the department changed; results in\n                  the evaluation section.\nContact:          the help desk lead owns the system and handles complaints.",
          "title": "An example statement for a project grown from Lab 7 (numbers are illustrative)"
        },
        "Notice that each line is **checkable**. \"Escalates security incidents\" can be tested with eval cases. \"Deleted after 30 days\" can be audited. Compare \"The system is safe and respects privacy,\" which nobody can verify. For the civic information assistant example project, the statement must also cover accuracy and escalation: when residents should call the office instead of trusting the answer.",
        {
          "callout": "Write each limit together with the test that shows it holds: \"Declines questions the handbook does not cover (15 of 15 test cases).\" A limit with a test is an engineering claim. A limit without one is a hope.",
          "tone": "tip",
          "title": "Limits as testable statements"
        },
        "The report also carries the course's integrity rule into the final project. Disclose AI assistance in `AI-LOG.md` as you have all semester, and be ready to explain any part of the code. Graduate teams add their research component in paper format: a question, a method, results with uncertainty, and related work."
      ],
      "takeaway": "Write the technical report for an engineer who wants to reproduce your numbers and the responsible-use statement for a person deciding whether and how to use the system, and make every claim in both checkable against evidence in the repository.",
      "check": [
        {
          "q": "How does the limitations section of the technical report differ from the limits in the responsible-use statement?",
          "a": "The limitations section is for engineers: what does not work technically, failure categories, and what you would do next. The responsible-use limits are for users and decision-makers: what the system must not be used for and what people must still do themselves. They overlap in facts but differ in audience and purpose."
        },
        {
          "q": "Rewrite \"The agent is safe and respects user privacy\" as two statements a reader could check.",
          "a": "For example: \"Every write requires a typed human approval; 0 of 12 injection cases produced an unapproved write.\" and \"Traces are redacted for email addresses and phone numbers and deleted after 30 days.\""
        },
        {
          "q": "Why include a change that made things worse in your final report?",
          "a": "It shows the evaluation was real and could detect regressions, it saves the next team from repeating it, and it makes the improvements you do report more believable."
        }
      ],
      "readings": [
        "model-cards",
        "nist-rmf"
      ]
    },
    {
      "topic": "peer-review",
      "blocks": [
        "Peer review in the final weeks has two forms. A **design review** happens early: another team reads your scope, tools table, and threat model and asks hard questions while changes are still cheap. A **code review** happens on each {{pull-request|pull request}}, as in Module 10. Both have the same purpose: find problems before a user, a grader, or an attacker does.",
        "A widely used standard comes from Google's engineering practices: approve a change once it definitely improves the overall health of the code, even if it is not perfect, because there is no perfect code, only better code [[google-code-review]]. Reviewers who demand perfection stall teams; reviewers who wave everything through let problems in. The guide's list of what to look for (design, functionality, complexity, tests, naming, comments, style, documentation) applies to agent code too. Agent code adds questions of its own:",
        {
          "table": {
            "head": [
              "Area",
              "Question to ask",
              "How to check it"
            ],
            "rows": [
              [
                "Tool descriptions",
                "Would a model call this tool correctly from the description alone?",
                "Call it by hand in the MCP Inspector, or read it as a prompt"
              ],
              [
                "Credentials",
                "Does each tool use the narrowest key, and could the model ever see it?",
                "Read where keys are loaded; search the traces for them"
              ],
              [
                "Gates",
                "Is every write gated in code, and does the gate fail closed?",
                "Rerun Lab 7's unattended test against the change"
              ],
              [
                "Error handling",
                "Can any tool raise past `dispatch()` and crash the loop?",
                "Call each tool with bad arguments, as `check_tools.py` did"
              ],
              [
                "Stopping",
                "Are step, token, and cost budgets still enforced?",
                "Run with a step limit of 1"
              ],
              [
                "Untrusted input",
                "Is new external text labeled and kept away from outbound tools?",
                "Add an injection case to the eval set"
              ],
              [
                "Evidence",
                "Does the change come with eval results or a trace?",
                "Look for the results file in the pull request"
              ]
            ],
            "caption": "Review questions specific to agents"
          }
        },
        "**Run it, do not just read it.** Many agent problems show up only at run time: a tool description the model misreads, a budget that never triggers. Check out the branch, run the eval set, and read one trace before approving. For code written with a {{coding-agent|coding agent}}, the Module 10 rule still holds: the author must be able to explain every line, and you may ask them to.",
        "How you write comments decides whether review helps or hurts. Be specific, explain why, separate what blocks the merge from what is optional, and say what is good:",
        {
          "table": {
            "head": [
              "Instead of",
              "Write"
            ],
            "rows": [
              [
                "\"This is bad, use a framework.\"",
                "\"Blocking: `update_ticket` raises `ValueError` for an unknown assignee, but `dispatch()` only catches `HelpdeskError`, so one bad call crashes the run. Could the check return an error result instead?\""
              ],
              [
                "\"Security issue here.\"",
                "\"Blocking: `get_ticket` returns the description unlabeled and the new `send_email` tool is ungated. That combination lets a ticket's text send data out. See the injection case in tests.\""
              ],
              [
                "\"Rename this.\"",
                "\"Suggestion: `do_it` could be `post_reply`. Tool and function names are part of what the model reads.\""
              ],
              [
                "(nothing)",
                "\"Nice: the preview shows the current status next to the new one. That makes approval much easier.\""
              ]
            ],
            "caption": "Review comments that help"
          }
        },
        "A pull request template keeps reviews consistent. GitHub fills a new pull request's description from a file named `pull_request_template.md` in the repository's `.github` folder:",
        {
          "code": "## What changed and why\n\n## Evidence\n- [ ] Eval set run: results file and pass rate before -> after\n- [ ] One trace showing the new behavior: traces/...\n- [ ] Injection and unattended-gate cases still pass\n\n## Security\n- [ ] New tools are listed in the tools table (read or write, credential, gate)\n- [ ] No secrets in code, prompts, traces, or screenshots\n\n## AI assistance\n- [ ] AI-LOG.md updated: tool, what was accepted or changed, how it was verified",
          "title": ".github/pull_request_template.md"
        },
        "**Receiving review** is a skill too. Answer every comment, either with a fix or with a reason. Move long disagreements to a short conversation instead of a long thread. When a reviewer finds a real problem, add a test or eval case so it cannot come back. Security findings from peer review follow the Lab 12 rules: raise them privately with the team, not in a public channel.",
        {
          "callout": "A short review that finds one real, well-explained problem helps a team more than a long list of style notes. Give the review you write the same care as the code you ship; reading other people's systems critically is also how you get better at building your own.",
          "tone": "aside",
          "title": "Reviewing is part of the work"
        }
      ],
      "takeaway": "Review agent designs early and agent code on every pull request: run the change, check its tools, credentials, gates, and evidence, write specific comments that say why and whether they block, and approve when the change makes the system better, not when it is perfect.",
      "check": [
        {
          "q": "Rewrite the review comment \"This agent code is messy\" into a useful one.",
          "a": "Name a location, the problem, why it matters, and whether it blocks. For example: \"Suggestion: `run()` builds the tools list in three places. If they drift apart the model sees tools `dispatch()` cannot run. Could they come from one `TOOLS` list?\""
        },
        {
          "q": "A pull request adds a tool that raises `ValueError` on bad input, and `dispatch()` catches only `HelpdeskError`, `TypeError`, and `KeyError`. Why is this blocking?",
          "a": "The exception escapes `dispatch()`, which must never raise, so one bad call crashes the agent loop instead of becoming an error result the model can recover from. In Lab 7's gated path it can also skip the audit record."
        },
        {
          "q": "Why does Google's standard say to approve when a change improves code health rather than when it is perfect?",
          "a": "No code is perfect, so a perfection standard blocks progress and slows the team, while the system keeps the problems the change would have fixed. The standard keeps quality rising steadily; small improvements can come in later changes."
        }
      ],
      "readings": [
        "google-code-review"
      ]
    }
  ]
};
