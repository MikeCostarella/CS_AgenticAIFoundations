import type { LectureNotesDef } from "../types";

// Module 10 — AI-assisted software engineering: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]].

export const M10_NOTES: LectureNotesDef = {
  "moduleId": "m10",
  "intro": "These notes go with the Module 10 lecture and Lab 10. They take the agent you have been building since Module 3 and turn it on your own work: a coding agent is a model in a loop with file and shell tools. The discipline is what makes it safe to use: a spec first, a context file, small changes, tests as the contract, careful review, and a pull request that CI checks. Lab 10 uses a repository your instructor provides, so the running example here uses your Lab 2 extractor as a stand-in, with one small feature: recording when an event ends. Read a topic before the lecture that covers it, and keep the code panels open during the lab.",
  "sections": [
    {
      "topic": "coding-agents",
      "blocks": [
        "Since Module 3 you have been building agents: a model in a loop that chooses a tool, reads the result, and decides what to do next. A **{{coding-agent|coding agent}}** is that same loop pointed at a code repository. Its tools read and edit files, search the code, and run shell commands such as your test suite. Lab 3's `read_file` and `write_file`, with `_safe_path` keeping them inside `workspace/`, were a small version of exactly this.",
        "What changes is the cost of a mistake. A wrong step from the Lab 3 agent produced a wrong sentence. A wrong step from a coding agent produces a changed file, a deleted test, or a command run on your own machine. Everything in this module follows from that difference.",
        "AI coding help comes in four levels of autonomy. Each level down the table means you type less and review more.",
        {
          "table": {
            "head": [
              "Mode",
              "What it does",
              "Who chooses the next step",
              "Examples"
            ],
            "rows": [
              [
                "Autocomplete",
                "Suggests the next few lines while you type.",
                "You, one keystroke at a time.",
                "Copilot inline suggestions in VS Code"
              ],
              [
                "Chat",
                "Answers questions and drafts code that you copy into your files.",
                "You decide what to paste and run.",
                "Copilot Chat, a chat assistant"
              ],
              [
                "Agent in the IDE or terminal",
                "Reads files, plans, edits several files, runs commands, and keeps going until a check passes.",
                "The model, inside limits you set and approve.",
                "Copilot agent mode, Claude Code, Cursor"
              ],
              [
                "Cloud agent",
                "Works on its own copy of the repository on a server and hands back a branch or a pull request.",
                "The model. You review the result afterwards.",
                "Copilot cloud agent, Claude Code GitHub Actions"
              ]
            ],
            "caption": "Four levels of AI coding help, least to most autonomous"
          }
        },
        "GitHub describes Copilot's agent mode this way: Copilot decides which files to change, proposes code edits and terminal commands for your approval, and keeps iterating until the task is done. Claude Code works the same way from a terminal. That is the Module 3 loop, with your repository as its environment.",
        "Module 1's {{decision-ladder|decision ladder}} applies to your own tools too: use the least autonomy that gets the job done. Renaming a variable needs autocomplete, not an agent. A change that touches the schema, the prompt, the {{grader|grader}}, and the tests together is where an agent earns its keep, and also where it can do the most damage.",
        "Every serious coding agent gives you the same four controls. Find them in whichever tool you use before you start:",
        {
          "list": [
            "**Permissions.** What the agent may do without asking. Claude Code can be set to ask before every file write and shell command, or you can pre-approve specific commands you trust. Copilot agent mode asks before running terminal commands. Start strict and loosen it only for commands you have seen it use well.",
            "**Plan before acting.** Claude Code's *plan mode* reads files and answers questions but makes no edits. Press Shift+Tab until the status bar shows plan mode, or start a session with `claude --permission-mode plan`. Use it to get a plan you can check against your spec (the next topic).",
            "**A check it can run.** Tests, a build, a linter: anything that returns pass or fail. The Claude Code documentation is blunt about this. Without a check, \"looks done\" is the only signal the agent has, and you become the verification loop.",
            "**Undo.** Work on a branch and commit before each agent session. Claude Code can rewind its own file edits, but its documentation warns that this only covers edits made through its file tools, not changes made by shell commands, and is not a replacement for git."
          ]
        },
        "One limit drives most of the advice in the tool documentation: the {{context-window|context window}}. Every file the agent reads and every command output it sees stays in the conversation, and Module 1 showed that long inputs cost more and are used less reliably. Give each session one task. Name the files to read instead of saying \"look around\". Start a fresh session (in Claude Code, `/clear`) when you switch tasks.",
        {
          "callout": "A cloud agent is a {{least-privilege|least-privilege}} problem, and GitHub treats it as one. Copilot's cloud agent can push to only one branch, prefixed `copilot/` when it creates its own. It cannot approve or merge its own {{pull-request|pull request}}, and the person who asked for the pull request cannot approve it either. By default, CI workflows do not run on its commits until someone with write access approves them. These are Lab 7's ideas, a narrow credential and a human confirmation gate, applied to code.",
          "tone": "aside",
          "title": "The same safeguards as Lab 7"
        },
        {
          "callout": "Copilot is available to verified students through GitHub Education [[github-education]]. Whichever tool you use, every session gets a row in your course `AI-LOG.md`, and Lab 10 adds a more detailed prompt log for the feature you build.",
          "tone": "tip",
          "title": "Access, and the log"
        }
      ],
      "takeaway": "A coding agent is the Module 3 loop with file and shell tools; use the least autonomy that does the job, and never run one without permissions, a plan, a check it can run, and a way to undo.",
      "check": [
        {
          "q": "Your Lab 3 agent and a coding agent both have a tool that writes files. Name two safeguards from Lab 3 and the coding-agent equivalent of each.",
          "a": "The workspace boundary (`_safe_path`) corresponds to keeping the agent inside the repository and asking before writes or commands outside it. The step and token limits (`MAX_STEPS`, `TOKEN_BUDGET`) correspond to turn limits and cost limits on the session. The trace corresponds to the session transcript and the git diff, which is how you see what it actually did."
        },
        {
          "q": "When is autocomplete a better choice than an agent?",
          "a": "When the change is small, local, and you already know what you want: one function, a rename, a docstring. If you can describe the diff in one sentence, planning and agent overhead cost more than they save, and with autocomplete you review every line as it appears."
        },
        {
          "q": "Copilot's cloud agent opens a pull request from a `copilot/` branch at your request. Who can approve it, and why do the CI workflows wait?",
          "a": "Someone with write access other than you, because the requester cannot approve it and the agent cannot approve its own work. Workflows wait because the agent's commits could change a workflow file or run untrusted code with the repository's secrets, so a person looks first."
        }
      ],
      "readings": [
        "claude-code",
        "claude-code-best-practices",
        "copilot-features",
        "copilot-cloud-agent-risks",
        "github-education"
      ]
    },
    {
      "topic": "spec-driven",
      "blocks": [
        "The most common way a {{coding-agent|coding agent}} fails is not bad code. It is good code for the wrong problem. A one-line request such as \"add end times to events\" leaves dozens of decisions open, and the agent makes each one silently.",
        "**{{spec-driven-development|Spec-driven development}}** means writing down what you want, and how you will know it is done, before anyone writes code: you or the agent. It is Module 2's prompt contract at a larger scale. There, an unstated edge case meant the model answered it differently on different days. Here, an unstated edge case means the agent picks an answer and writes it into your codebase.",
        "Lab 10 uses a repository your instructor provides. So that these notes use code you already know line by line, the examples use your Lab 2 extractor (`agentic-lab02`) as a stand-in repository, and one small feature: recording when an event ends.",
        {
          "table": {
            "head": [
              "Artifact",
              "Answers",
              "Who writes it"
            ],
            "rows": [
              [
                "Spec",
                "What we are building and why; what is out of scope.",
                "You. The agent can interview you and draft it, but you own every decision in it."
              ],
              [
                "{{acceptance-criteria|Acceptance criteria}}",
                "How we will know it is done: statements a command or a person can check.",
                "You. Each one becomes a test or a review step."
              ],
              [
                "Plan",
                "How: which files and functions change, in what order, and the risks.",
                "The agent drafts it; you check it against the spec before any code is written."
              ],
              [
                "Tasks",
                "Small steps, each ending in something you can run.",
                "The agent, from the approved plan."
              ]
            ],
            "caption": "The artifacts of spec-driven development"
          }
        },
        "Here is a complete spec for the example feature. It fits on one screen, which is about the right size for one pull request.",
        {
          "code": "# Spec: record when an event ends\n\n## Why\nCalendar exports need an end time. Today \"from 5 to 7 pm\" loses its second half.\n\n## Requirements\n1. Event gains end_time: 24-hour HH:MM, or null when no end time is stated.\n2. end_time is valid only together with start_time, and must be later than it.\n3. An event that runs past midnight (\"9 PM to 1 AM\") gets end_time null.\n4. prompts/extract_v2.txt states rules 1-3, matching the schema description.\n5. Test cases that do not mention end_time are graded exactly as before.\n\n## Out of scope\nMulti-day events, time zones, durations, and any change to the date or cost rules.\n\n## Acceptance criteria\nAC1  python -m pytest passes, including new tests in tests/test_schema.py for\n     requirements 1 and 2. These tests make no API calls.\nAC2  Cases free-02 and repeat-05 in tests/cases.jsonl expect end_time\n     19:00 and 14:00.\nAC3  python run_tests.py v2 passes at least as many cases as the committed\n     results/v2.json, and no case goes from pass to fail.\nAC4  I have read every changed line and can explain it.\n\n## Files likely to change\nschema.py, prompts/extract_v2.txt, run_tests.py, tests/cases.jsonl,\ntests/test_schema.py (new)",
          "title": "SPEC.md for the example feature",
          "note": "Requirement 3 is a decision, not a fact. Someone has to choose what happens at midnight, and the spec is where that choice is recorded. Without it, the agent chooses."
        },
        "Each part has a job. **Why** lets the agent and the reviewer judge which details matter. Numbered **requirements** let the plan, the tests, and the review refer to them. **Out of scope** gives you grounds to reject the \"improvements\" agents like to add next to the requested change. **Acceptance criteria** are commands with expected results wherever possible; AC4 cannot be run, which is why it is written down. **Files likely to change** lets you spot a diff that wandered.",
        "With the spec written, ask for a plan, not code:",
        {
          "code": "Read SPEC.md, schema.py, run_tests.py and prompts/extract_v2.txt.\nDo not edit any file yet.\nWrite a numbered plan to PLAN.md: which functions change, in what order, and\nwhich command will show that each acceptance criterion is met.\nList anything in SPEC.md you find ambiguous as questions at the end.",
          "title": "The first prompt of the session",
          "note": "In Claude Code, plan mode enforces \"do not edit\". In tools without a plan mode, say it in the prompt."
        },
        "Read the plan against the spec, requirement by requirement. Questions the agent lists are spec bugs: answer them in SPEC.md, not in the chat, so the decision outlives the session. Then let the agent implement one task at a time.",
        "The Claude Code documentation recommends the same shape: have the agent interview you and write a spec, then implement it in a fresh session. It adds that the most useful specs name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step. GitHub's open-source Spec Kit [[spec-kit]] packages this workflow as commands for several coding agents: a set of project-wide principles written once, then specify, plan, tasks, and implement for each feature. Its command names have changed between releases, so follow its README. You do not need the tool to use the method. A SPEC.md and a PLAN.md in the repository are enough for Lab 10.",
        "Lab 10 also asks for a **log of prompts and decisions**. Keep it as you go: each prompt, what the agent did, what you decided, and the evidence. The decisions are the part your instructor reads.",
        {
          "callout": "Read your spec as if you were a new team member handed it with no chance to ask questions. Every question you would need to ask is a decision the agent will otherwise make for you. This is Module 2's new-hire test, applied to features instead of prompts.",
          "tone": "tip",
          "title": "The spec is the prompt"
        }
      ],
      "takeaway": "Write the spec and its acceptance criteria before any code, have the agent plan against it before it edits anything, and record every decision in the spec rather than in the chat.",
      "check": [
        {
          "q": "Rewrite \"support end times properly\" as two acceptance criteria someone could check.",
          "a": "For example: \"For case free-02 ('from 5 to 7 pm'), the extractor returns start_time 17:00 and end_time 19:00.\" and \"An Event whose end_time is earlier than its start_time fails validation (tests/test_schema.py::test_end_before_start_is_rejected).\" Each has one right answer and a command that checks it."
        },
        {
          "q": "Why does a spec for a coding agent need an \"out of scope\" section, when a spec for a human teammate often does not?",
          "a": "Agents readily make plausible adjacent changes (reformatting, refactoring, adjusting related rules) unless told not to. The section keeps the diff small, gives the reviewer grounds to reject unrequested changes, and prevents unrelated test cases from breaking."
        },
        {
          "q": "The agent's plan ends with the question: \"Should '9 PM to 1 AM' set end_time to 01:00?\" What do you do?",
          "a": "Treat it as a gap in the spec. Here requirement 3 already answers it (null). If it did not, you would decide, write the rule into SPEC.md, and add a test case for it, rather than letting the agent pick an answer silently in the code."
        }
      ],
      "readings": [
        "spec-kit",
        "claude-code-best-practices"
      ]
    },
    {
      "topic": "context-files",
      "blocks": [
        "Every coding-agent session starts with an empty context window. The agent does not remember that you run tests with `python -m pytest`, that `.env` must never be opened, or that the {{grader|grader}} compares times as HH:MM. You can retype all of that every session, or write it down once.",
        "A **{{context-file|context file}}** is a Markdown file in the repository that a {{coding-agent|coding agent}} loads at the start of every session. It holds the commands, conventions, and rules a new teammate would need. In Module 2 terms, it is a {{system-prompt|system prompt}} for your repository, and the same rules apply: specific, checkable, short, and kept in version control.",
        {
          "table": {
            "head": [
              "Tool",
              "File",
              "How it loads"
            ],
            "rows": [
              [
                "Claude Code",
                "`CLAUDE.md` (or `.claude/CLAUDE.md`) in the project; `~/.claude/CLAUDE.md` for your personal preferences; `CLAUDE.local.md` for personal notes about one project, kept out of git",
                "Files in the working directory and every directory above it load at launch; files in subdirectories load when Claude works with files there. The `/init` command drafts a first version. Current versions read `AGENTS.md` instead when there is no `CLAUDE.md`."
              ],
              [
                "GitHub Copilot",
                "`.github/copilot-instructions.md` for the whole repository; `.github/instructions/NAME.instructions.md` with an `applyTo` pattern for particular paths",
                "Also reads `AGENTS.md` files as agent instructions. Copilot code review reads the instructions from the {{pull-request|pull request}}'s branch."
              ],
              [
                "Many agents, including Codex, Cursor, Gemini CLI, and Copilot's cloud agent",
                "`AGENTS.md`",
                "An open format, now stewarded by the Agentic AI Foundation under the Linux Foundation. In a repository with several, the one closest to the file being edited wins."
              ]
            ],
            "caption": "Where each tool looks for project instructions (check the linked docs; these details change)"
          }
        },
        "Here is an `AGENTS.md` for the extractor repository:",
        {
          "code": "# Event extractor\n\nExtracts events from community newsletters into JSON validated by schema.py.\n\n## Commands (Windows PowerShell, from the repository root)\n- Activate the environment: .\\.venv\\Scripts\\Activate.ps1\n- Unit tests, no API calls, run after every change: python -m pytest -q\n- Prompt regression set, calls the API and costs money, run only when asked:\n  python run_tests.py v2\n\n## Rules\n- schema.py is the single source of truth. Never describe a field in a prompt\n  that schema.py does not define.\n- Do not edit anything under tests/ unless the task says so. If a test looks\n  wrong, stop and explain why.\n- Never open, print, or commit .env. Ask before adding a dependency.\n- Edit prompts/extract_v2.txt in place. Do not create a new prompt version\n  unless asked.\n- One spec per pull request. Do not refactor code the spec does not mention.\n\n## Gotchas\n- Pass --today YYYY-MM-DD on every run. No test may depend on the real date.\n- model_dump(mode=\"json\") returns times as HH:MM:SS. The grader compares HH:MM.",
          "title": "AGENTS.md for the Lab 2 extractor, used as the Lab 10 stand-in",
          "note": "Every line is either a command the agent cannot guess, a rule a reviewer can check, or a trap that has already caught someone. The last gotcha comes from the review example in the next topic."
        },
        "To use one file with several tools, keep the instructions in `AGENTS.md` and make `CLAUDE.md` a single line that imports it: `@AGENTS.md`. Claude Code expands `@path` imports when it loads the file. One source of truth cannot drift, which is the same reason Lab 2 generates the prompt's schema from `schema.py`.",
        "What belongs in a context file, following the Claude Code documentation's own include and exclude lists:",
        {
          "table": {
            "head": [
              "Include",
              "Leave out"
            ],
            "rows": [
              [
                "Commands the agent cannot guess (`python -m pytest -q`)",
                "Anything it can learn by reading the code"
              ],
              [
                "Rules that differ from common practice",
                "Standard conventions it already knows"
              ],
              [
                "How to test, and which tests cost money",
                "Long tutorials and API documentation (link instead)"
              ],
              [
                "Repository etiquette: branches, pull requests, prompt versions",
                "A description of every file and function"
              ],
              [
                "Traps that are not obvious from the code",
                "\"Write clean code\" and other rules nobody can check"
              ]
            ],
            "caption": "First column is what to include; second is what to leave out"
          }
        },
        "Keep it short. The Claude Code documentation suggests staying under about 200 lines and asking of each line whether removing it would cause mistakes. Long files bury the rules that matter. Add a line when the same correction comes up twice, or when a review finds something the agent should have known. That turns every review finding into a permanent fix.",
        {
          "callout": "The Claude Code documentation says it treats these files as context, not enforced configuration. A context file is a request. Anything that must never happen needs enforcement in code: a permission setting that blocks the command, a hook that refuses an edit, a CI check that fails the pull request. This is Lab 3's lesson again: `mode=ro` protected the database, not a sentence in the prompt.",
          "tone": "warning",
          "title": "Advisory, not enforced"
        },
        "Context files are also an attack surface. The agent follows them, so a pull request that edits `AGENTS.md` changes how every future session behaves, and it deserves the same review as a change to code. A cloned repository with a hostile context file is a form of {{prompt-injection|prompt injection}}, which Module 12 covers. Claude Code shows an approval dialog the first time a project's instruction file imports files from outside the project. And no context file should ever contain a secret."
      ],
      "takeaway": "A context file is a versioned system prompt for your repository: put in it only the commands, rules, and traps the agent cannot discover, keep it short, and enforce anything critical in code.",
      "check": [
        {
          "q": "The agent keeps running `python run_tests.py v2` after every small edit, spending money each time. What is the quick fix, and what is the stronger one?",
          "a": "Quick fix: a rule in the context file saying the regression set runs only when asked. Stronger fix: enforcement, so the command needs your approval every time (do not pre-approve it in the agent's permissions) or a hook blocks it. The context file asks; permissions and hooks enforce."
        },
        {
          "q": "Which of these belong in AGENTS.md: (a) \"Write clean, readable code\", (b) \"Unit tests: python -m pytest -q\", (c) a paragraph describing each function in extract.py, (d) \"Pass --today on every run\"?",
          "a": "(b) and (d). (a) cannot be checked and changes nothing. (c) the agent can read from the code itself, and the paragraph will go stale the next time someone edits extract.py."
        },
        {
          "q": "Why import AGENTS.md from CLAUDE.md instead of keeping two copies of the same instructions?",
          "a": "Two copies drift apart: someone updates one and the tools start following different rules. One file with an import keeps a single source of truth, like generating the prompt's schema from schema.py in Module 2."
        }
      ],
      "readings": [
        "claude-code-memory",
        "agents-md",
        "copilot-instructions",
        "claude-code-best-practices"
      ]
    },
    {
      "topic": "reviewing-ai-code",
      "blocks": [
        "The course integrity policy says you must be able to explain any code you submit. With a {{coding-agent|coding agent}} that becomes a review job: you are the reviewer of record for every line the agent wrote. AI-written code is fluent, consistent in style, and confident, which are the same properties that made {{hallucination|hallucinations}} hard to spot in Module 1. It looks reviewed when it is not.",
        "Review through three lenses:",
        {
          "table": {
            "head": [
              "Lens",
              "Questions to ask",
              "Typical AI failure"
            ],
            "rows": [
              [
                "Correctness",
                "Does it meet each {{acceptance-criteria|acceptance criterion}}? What happens with null, empty, the boundary value, a missing key?",
                "Handles the example in the prompt and nothing else; `<` where `<=` was needed; a broad `except` that hides the real error; logic that special-cases the test inputs."
              ],
              [
                "Security",
                "Is any input trusted that should not be? Are secrets safe? Did any permission get wider?",
                "SQL or shell commands built by string formatting; a secret printed in a log; a dependency that is not the one you meant; a safeguard such as Lab 3's `mode=ro` quietly removed to make an error go away."
              ],
              [
                "Maintainability",
                "Is this the smallest change that meets the spec? Does it fit the code around it?",
                "A new helper that duplicates an existing one; edits to files the spec never mentioned; leftover debug prints; comments describing what the code used to do."
              ]
            ],
            "caption": "Three review lenses"
          }
        },
        "A realistic example from the end-time feature. The agent updated the {{grader|grader}} in `run_tests.py` so it also checks the new field:",
        {
          "code": "# The agent's change to check() in run_tests.py (excerpt)\nfor field in (\"date\", \"start_time\", \"end_time\", \"cost_usd\"):\n    if exp.get(field) != g.get(field):\n        problems.append(f\"{field}: expected {exp.get(field)!r}, got {g.get(field)!r}\")",
          "title": "Plausible, and wrong twice"
        },
        "It reads well. It has two bugs, and neither one raises an error:",
        {
          "list": [
            "**A format mismatch.** Lab 2's grader runs `start_time` through `hhmm()` because `model_dump(mode=\"json\")` returns times as `\"19:00:00\"`. The agent did not do the same for `end_time`, so `\"19:00:00\"` never equals the expected `\"19:00\"`. Every case with an end time now fails.",
            "**A broken promise.** Requirement 5 says old cases are graded as before. With `exp.get(field)`, an old case that never mentions `end_time` expects `None`. If the model correctly extracts an end time for that case, the case now fails."
          ]
        },
        "In a realistic session, the agent then sees the failures and \"fixes\" them by changing the expected values in `tests/cases.jsonl` to `\"19:00:00\"`. Now the tests pass, the grader is still wrong, and the test set has been bent to match the code. The correct change is small:",
        {
          "code": "# where run_tests.py builds `got`: normalize end_time the same way as start_time\ngot = [\n    {**e, \"start_time\": hhmm(e[\"start_time\"]), \"end_time\": hhmm(e[\"end_time\"])}\n    for e in result.model_dump(mode=\"json\")[\"events\"]\n]\n\n# in check(): grade end_time only when the case states it (SPEC.md, requirement 5)\nfor field in (\"date\", \"start_time\", \"end_time\", \"cost_usd\"):\n    if field not in exp:\n        continue\n    if exp[field] != g[field]:\n        problems.append(f\"{field}: expected {exp[field]!r}, got {g[field]!r}\")",
          "title": "The reviewed version (excerpt)"
        },
        "A review routine that catches this kind of thing:",
        {
          "list": [
            "Re-read the spec, then read the **diff** (`git diff`, or the {{pull-request|pull request}}'s Files changed tab), not the agent's summary of it.",
            "Compare the list of changed files with the spec's \"files likely to change\". Every extra file needs a reason.",
            "Run the checks yourself and read the output. \"Tests pass\" in the agent's message is a claim, like an agent's answer in Lab 3.",
            "For each acceptance criterion, find the code that implements it and the test that proves it.",
            "Read the diff of `tests/` on its own. Look for deleted assertions, changed expected values, and new skips.",
            "Ask \"what happens with...\" for null, empty, and boundary inputs, such as an end time equal to the start time.",
            "For any line you cannot explain, have the agent explain it, then check the explanation yourself. If you still cannot explain it, rewrite it."
          ],
          "ordered": true
        },
        "A second reviewer helps, as long as it stays second. The Claude Code documentation suggests reviewing in a fresh context, such as a separate session or a reviewing subagent that sees only the diff and the criteria, because the session that wrote the code shares its own assumptions. Copilot can also leave review comments on a pull request. The same documentation warns that a reviewer asked to find problems will usually report some even when the work is sound, so tell it to report only gaps that affect correctness or the stated requirements. Neither replaces your approval.",
        "Two security checks deserve their own habit. When the diff adds a dependency, confirm the package exists, is the one you meant, and is maintained before installing it. Module 12 calls this {{supply-chain-risk|supply-chain risk}}. And watch for safeguards being simplified away. An agent fighting an error will sometimes remove the check that raised it.",
        {
          "callout": "When one commit changes both the code and the expected values in the tests, stop and find out why. Sometimes the old expectation really was wrong. Often the tests were bent to fit the code. It is the coding version of Lab 4's WRONG outcome: a confident pass that is false.",
          "tone": "warning",
          "title": "Code and expected values changed together"
        }
      ],
      "takeaway": "Review AI-written code as its reviewer of record: read the diff against the spec, run the checks yourself, inspect every change to the tests, and do not approve any line you cannot explain.",
      "check": [
        {
          "q": "The agent wraps the model call in `extract.py` in `try: ... except Exception: pass` \"to make runs more robust\". Approve?",
          "a": "No. It hides failures that Lab 2 deliberately surfaces: a `ValidationError` must reach `main()`, which exits with code 2 so a script or CI job can tell that extraction failed. Robustness means handling a specific failure on purpose, not silencing every failure."
        },
        {
          "q": "The pull request for the end-time feature also reformats all of `extract.py`. What do you do?",
          "a": "Ask for the reformatting to be reverted or moved to its own pull request. It is out of scope, and a few hundred changed lines of formatting hide the few lines that matter, which makes the real change much harder to review."
        },
        {
          "q": "Why does a reviewer in a fresh context catch things the writing session misses?",
          "a": "The writing session carries its own assumptions and its reasons for each choice, so its mistakes look intentional to it. A fresh reviewer sees only the diff and the criteria and judges the result on its own terms. It is still a second opinion; a person approves."
        }
      ],
      "readings": [
        "claude-code-best-practices",
        "owasp-llm",
        "copilot"
      ]
    },
    {
      "topic": "tests-as-contract",
      "blocks": [
        "In Module 2 the schema was the contract between your code and the model. In this module the tests are the contract between you and the coding agent. A test is an {{acceptance-criteria|acceptance criterion}} that a computer checks for you, every time, in seconds. It is also the check the agent can run on its own, which the first topic said every agent session needs.",
        "**Test-first prompting** turns that into a routine:",
        {
          "list": [
            "Write the tests from the acceptance criteria, before the implementation exists. Write them yourself, or have the agent draft them in a separate session that is told not to write any implementation.",
            "Run them and watch them fail, for the right reason.",
            "Commit the tests on their own, so the contract is on record before any code is written.",
            "Prompt: \"Make `python -m pytest` pass. Do not modify anything under `tests/`. If you believe a test is wrong, stop and explain why.\"",
            "Review the result, starting with a check that `tests/` did not change."
          ],
          "ordered": true
        },
        "For the end-time feature, AC1 becomes five unit tests. A **unit test** checks one small piece of code in isolation. These test only the schema, so they make no API calls:",
        {
          "code": "\"\"\"Unit tests for Event.end_time (SPEC.md, AC1). No API calls: free, fast, repeatable.\"\"\"\nimport datetime as dt\n\nimport pytest\nfrom pydantic import ValidationError\n\nfrom schema import Event\n\n\ndef make(**fields):\n    base = {\"title\": \"Ghost walk\", \"date\": \"2026-10-23\", \"start_time\": \"20:00\"}\n    return Event.model_validate({**base, **fields})\n\n\ndef test_end_time_defaults_to_none():\n    assert make().end_time is None\n\n\ndef test_end_after_start_is_valid():\n    assert make(end_time=\"22:00\").end_time == dt.time(22, 0)\n\n\ndef test_end_before_start_is_rejected():\n    with pytest.raises(ValidationError, match=\"later than start_time\"):\n        make(end_time=\"19:00\")\n\n\ndef test_end_equal_to_start_is_rejected():\n    with pytest.raises(ValidationError, match=\"later than start_time\"):\n        make(end_time=\"20:00\")\n\n\ndef test_end_without_start_is_rejected():\n    with pytest.raises(ValidationError, match=\"start_time is null\"):\n        make(start_time=None, end_time=\"22:00\")",
          "title": "tests/test_schema.py"
        },
        {
          "code": "cd $HOME\\agentic-ai\\agentic-lab02     # or your Lab 10 repository\npip install pytest\npython -m pytest -q\n#   5 failed\n\ngit add SPEC.md tests/test_schema.py\ngit commit -m \"Spec and failing tests for Event.end_time\"\n# only now hand the implementation to the agent",
          "title": "Red first, then commit the contract (PowerShell, in the repository folder)",
          "note": "Use `python -m pytest`, not plain `pytest`. Running pytest as a module puts the repository folder on Python's import path, so `from schema import Event` works from inside `tests/`. Plain `pytest` fails here with `ModuleNotFoundError: No module named 'schema'`."
        },
        "Why the `match=` arguments? Lab 2's `Event` uses `extra=\"forbid\"`, so before `end_time` exists, passing it raises a `ValidationError` anyway, for the wrong reason. Without `match=`, three of the five tests pass before the feature is written. A test that passes before the feature exists is not testing the feature. With `match=`, all five fail, and each failure message points at missing behaviour. That is what \"fail for the right reason\" means.",
        "The agent's implementation then needs only a few lines. Pydantic's `model_validator` runs after all the fields have been checked, so it can compare two fields with each other:",
        {
          "code": "# schema.py: add model_validator to the pydantic import line, then in class Event:\n    end_time: dt.time | None = Field(\n        default=None,\n        description=\"24-hour HH:MM when the event ends, or null when no end time is stated\",\n    )\n\n    @model_validator(mode=\"after\")\n    def end_after_start(self):\n        if self.end_time is not None:\n            if self.start_time is None:\n                raise ValueError(\"end_time is set but start_time is null\")\n            if self.end_time <= self.start_time:\n                raise ValueError(\"end_time must be later than start_time\")\n        return self",
          "title": "The implementation the tests ask for (excerpt)",
          "note": "`python -m pytest -q` now reports 5 passed. If the model ever returns an overnight end time, this validator rejects it, and Lab 2's retry loop sends the message back to the model."
        },
        "Then **check the checker**, the way Lab 2 forced a validation failure on purpose: change `<=` to `<` in the validator and run the tests again. `test_end_equal_to_start_is_rejected` should now fail. If no test fails when you break the code, the tests are not guarding that line. Put the `<=` back afterwards.",
        "Three kinds of test now protect the project, and they run at different times:",
        {
          "table": {
            "head": [
              "Kind",
              "Example",
              "Calls a model?",
              "Run it"
            ],
            "rows": [
              [
                "Unit tests",
                "`tests/test_schema.py`",
                "No. Deterministic and free.",
                "After every edit, by you and by the agent; on every {{pull-request|pull request}} in CI."
              ],
              [
                "Prompt {{regression-test|regression set}}",
                "Module 2's `tests/cases.jsonl` with `run_tests.py`",
                "Yes. Costs money and varies a little between runs.",
                "When the prompt, schema, or model changes; before merging."
              ],
              [
                "Agent evaluation",
                "Module 11's eval harness",
                "Yes, many calls per case.",
                "On a schedule and before releases."
              ]
            ],
            "caption": "Three kinds of test, by cost and timing"
          }
        },
        "Expect an agent to try to satisfy the tests rather than the requirement when the requirement is hard: special-casing a test input, loosening an assertion, adding a skip, or editing the expected values. Committing the tests first and reading their diff stops most of it. {{benchmark|Benchmarks}} guard against the same thing with tests the agent never sees: SWE-bench grades a fix with tests that must start passing and tests that must keep passing, and Module 11 returns to it.",
        {
          "callout": "The Claude Code documentation suggests two variants: ask the agent to write a failing test that reproduces a bug before it fixes the bug, or have one session write the tests and a separate session write the code that passes them. Both keep the author of the contract separate from the author of the code.",
          "tone": "tip",
          "title": "Split the roles"
        }
      ],
      "takeaway": "Write the tests from the acceptance criteria first, watch them fail for the right reason, commit them, and only then let the agent write code that makes them pass without touching them.",
      "check": [
        {
          "q": "Before the feature exists, `test_end_before_start_is_rejected` without `match=` passes. Why is that a problem, and what fixes it?",
          "a": "`extra=\"forbid\"` rejects the unknown `end_time` field, so the test passes for the wrong reason and would keep passing even if the ordering rule were never written. Matching the error message (`match=\"later than start_time\"`) ties the test to the behaviour the spec asks for."
        },
        {
          "q": "The agent's diff makes every test pass, and also adds `@pytest.mark.skip` to one of them. What do you do?",
          "a": "Reject it. Skipping a test removes an acceptance criterion without anyone agreeing to it. The agent was told not to modify `tests/`; if it believed the test was wrong, it should have stopped and explained why so you could decide."
        },
        {
          "q": "Why not have the agent run `run_tests.py v2` after every edit, alongside the unit tests?",
          "a": "It calls the API, so each run costs money and takes time, and model output varies slightly between runs, so a single failure may be noise that sends the agent chasing nothing. Deterministic unit tests suit the inner loop; the regression set belongs at milestones and in CI."
        }
      ],
      "readings": [
        "claude-code-best-practices",
        "swe-bench",
        "pydantic"
      ]
    },
    {
      "topic": "prs-ci",
      "blocks": [
        "A **{{pull-request|pull request}}** (PR) is a proposal to merge one branch into another. It bundles the diff, a description, a discussion thread, and the results of automated checks, and it is where a team decides whether a change is ready. **{{continuous-integration|Continuous integration}}** (CI) is the automation behind those checks: on every push to the PR, a fresh machine checks out the code, installs it from scratch, and runs your tests. \"It works on my machine\" stops being the evidence.",
        "The Lab 10 flow, which is also the normal professional one:",
        {
          "list": [
            "Create a branch for the feature, in PowerShell in the repository folder: `git switch -c feature/end-time`.",
            "Commit the spec and the failing tests first, then the implementation in small commits.",
            "Push the branch and open a pull request with the template below filled in.",
            "Let CI run. Fix the code, not the checks, until the checks are green.",
            "Review your own diff with the checklist, then ask for a review from a classmate or your instructor.",
            "Merge only when the required checks pass and a reviewer has approved."
          ],
          "ordered": true
        },
        "**GitHub Actions** is GitHub's CI service. A workflow is a YAML file in `.github/workflows/`. This one runs the unit tests from the previous topic on every pull request:",
        {
          "code": "name: tests\n\non:\n  pull_request:\n  push:\n    branches: [main]\n\njobs:\n  unit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-python@v6\n        with:\n          python-version: \"3.12\"\n          cache: \"pip\"\n      - run: pip install -r requirements.txt pytest\n      - run: python -m pytest -q",
          "title": ".github/workflows/tests.yml",
          "note": "The action versions shown are the major versions in GitHub's documentation as of this writing; check [[actions-python]] for current ones. `cache: \"pip\"` reuses downloaded packages between runs."
        },
        "Read it top to bottom. `on` says when it runs: on every pull request and on every push to `main`. `runs-on` asks for a fresh Linux virtual machine. Each `uses` line runs a published action; these two check out your code and install Python. Each `run` line is an ordinary shell command, the same command you run locally. If any command exits with a non-zero code, the job fails and the PR shows a red X.",
        "Notice what this job does not need: an API key. The unit tests make no model calls, so the job is free apart from Actions minutes, gives the same result every time, and is safe to run on PRs from forks. GitHub does not pass repository secrets to workflows triggered from forked repositories anyway. Module 11 adds a second workflow that runs the model-dependent regression set with the API key stored as a repository secret, on a schedule or when prompt files change.",
        "A red X only blocks anything if the repository says so. GitHub's branch protection settings, \"require status checks to pass before merging\" and \"require pull request reviews before merging\", turn the CI result and the review into rules that the merge button enforces. Turn both on for your Lab 10 repository.",
        "A **pull request template** at `.github/pull_request_template.md` pre-fills every new PR's description. Once it is merged into the default branch, every PR starts with your checklist:",
        {
          "code": "## What and why\nImplements SPEC.md: Event.end_time.\n\n## Acceptance criteria\n- [ ] AC1 python -m pytest passes (CI check: tests / unit)\n- [ ] AC2 free-02 and repeat-05 expect end times\n- [ ] AC3 run_tests.py v2: __/20 now vs __/20 in results/v2.json; regressions: none\n- [ ] AC4 I have read every changed line and can explain it\n\n## Review checklist\n- [ ] Only the files listed in the spec changed, or the reason is given below\n- [ ] No test deleted or skipped, and no expected value changed to fit the code\n- [ ] No secrets, no new dependencies, no leftover debug output\n- [ ] A ValidationError still reaches main() and exits with code 2\n\n## AI assistance\nTool and model:\nWhat the agent wrote:\nWhat I changed or rejected, and why:\nHow I verified it:\nPrompt log: (link)",
          "title": ".github/pull_request_template.md"
        },
        "This course records AI help in several places. Each has a different reader:",
        {
          "table": {
            "head": [
              "Record",
              "Reader",
              "What it holds"
            ],
            "rows": [
              [
                "`AI-LOG.md` (course folder)",
                "Your instructor, over the semester",
                "One row per lab: tool, request, what you kept or rejected, how you verified it."
              ],
              [
                "Lab 10 prompt log",
                "Whoever grades or audits this feature",
                "Every prompt, what the agent did, and your decision."
              ],
              [
                "PR description",
                "The reviewer, today",
                "Which parts the agent wrote, so they know where to look hardest."
              ],
              [
                "Commit trailers",
                "Anyone reading the history later",
                "A `Co-authored-by:` line, the format GitHub uses to credit more than one author. Copilot's cloud agent authors its own commits and lists the person who asked as co-author."
              ]
            ],
            "caption": "Where AI assistance is documented"
          }
        },
        "Agents can take part in the PR itself. The Claude Code GitHub Action responds to `@claude` mentions in PR and issue comments, and can run a review on every pull request. Copilot can review PRs too. Treat their comments as one more reviewer, and remember that each run spends Actions minutes and API tokens.",
        {
          "callout": "CI proves only what the tests check. A PR can be fully green while the prompt never mentions `end_time`, because no unit test reads the prompt. That is why AC2 and AC3 ask for evidence from the regression set in the PR description, and why AC4 asks for a person.",
          "tone": "warning",
          "title": "Green is necessary, not sufficient"
        }
      ],
      "takeaway": "Ship agent-written code through a branch, a pull request with a checklist and an honest AI-assistance section, and CI checks that branch protection actually enforces.",
      "check": [
        {
          "q": "Why does the unit-test job need no secret, and why is that a good property?",
          "a": "The unit tests make no model calls. So the job is free, deterministic, and fast, it can run on every push, and it also works for pull requests from forks, which never receive repository secrets."
        },
        {
          "q": "Your PR is green, but the reviewer notices that `prompts/extract_v2.txt` never mentions end times. How did CI miss it?",
          "a": "No automated test reads the prompt. The unit tests check only the schema, and the regression set, which would show end times coming back null, calls the API and is not part of this workflow. The AC3 evidence in the PR description, or the reviewer, has to catch it."
        },
        {
          "q": "Write an AI-assistance entry for this PR that would count as verification.",
          "a": "For example: \"Claude Code implemented the end_time validator and grader change from SPEC.md. I rejected its edit to the expected values in cases.jsonl and fixed the missing hhmm() on end_time myself. Verified: pytest 5 passed; the tests failed when I changed <= to <; run_tests.py v2 gave 18/20 against a 17/20 baseline with no regressions; I read the full diff.\""
        }
      ],
      "readings": [
        "actions-python",
        "protected-branches",
        "pr-templates",
        "actions-secrets",
        "claude-code-github-actions",
        "co-authored-commits"
      ]
    }
  ]
};
