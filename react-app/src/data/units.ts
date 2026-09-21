import type { UnitDef } from "./types";

// The five units and thirteen modules. Edit here; every page updates.

export const UNIT_DEFS: UnitDef[] = [
  // ------------------------------------------------------------------ Unit I
  {
    number: 1,
    title: "LLMs as Software Components",
    theme:
      "Treat the model as an unreliable but powerful dependency: understand how it behaves, what it costs, and how to get structured, validated output out of it from code.",
    modules: [
      {
        id: "m01",
        number: 1,
        unit: 1,
        weeks: "1",
        title: "LLM foundations for engineers",
        subtitle: "Tokens, context windows, sampling, cost, latency, and failure modes",
        overview: [
          "Agentic systems are built on large language models, so the course starts by treating a model the way an engineer treats any dependency: what goes in, what comes out, what it costs, how fast it is, and how it fails. The goal is not the mathematics of transformers but a working mental model accurate enough to make design decisions.",
          "Students set up their API access, development environment, and course repository, and make their first programmatic model calls. From day one, every call is logged with its token counts, latency, and cost so that the economics of agents are visible rather than abstract.",
        ],
        topics: [
          "What an LLM is (and is not) from a software engineer's point of view",
          "Tokens, context windows, and why long inputs cost more and degrade",
          "Sampling: temperature, top-p, determinism, and reproducibility",
          "Chat APIs: system prompts, message roles, multi-turn state",
          "Cost and latency budgets; model tiers and choosing the smallest model that works",
          "Failure modes: hallucination, instruction drift, refusals, truncation",
          "Course environment: API keys and secrets handling, repo template, AI-assistance log",
        ],
        resources: ["anthropic-api", "openai-api", "cot"],
        lab: {
          title: "Lab 1 — First calls, measured",
          tasks: [
            {
              text: "Configure API credentials safely (environment variables, never committed).",
              script: [
                {
                  do: "Create the lab folder and make it a git repository.",
                  where: "Terminal",
                  commands: "mkdir agentic-lab01\ncd agentic-lab01\ngit init",
                  expect: "Git replies with \"Initialized empty Git repository\" and a path.",
                  point: "Everything else in this lab lands inside this folder. Making it a repo first means the very next step can protect it before there is anything worth protecting.",
                },
                {
                  do: "In the lab folder, write .gitignore before you write any other file.",
                  where: "VS Code",
                  commands: ".env\n.venv/\n__pycache__/\n*.pyc\nresults/*.csv",
                  expect: "A .gitignore file with five lines. Nothing else exists yet.",
                  point: "A key committed once is compromised forever; rotating it is the only real fix. Writing the ignore rule before the secret exists is the whole discipline in one step.",
                },
                {
                  do: "Create and activate a virtual environment.",
                  where: "Terminal",
                  commands: "python -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\n\n# macOS or Linux:\n# source .venv/bin/activate",
                  expect: "Your prompt now starts with (.venv).",
                  point: "Per-project dependencies mean the version you install today is the version that still runs in week ten.",
                },
                {
                  do: "Install the SDK and pin what you installed.",
                  where: "Terminal",
                  commands: "pip install anthropic python-dotenv\npip freeze > requirements.txt",
                  expect: "requirements.txt lists anthropic, python-dotenv, and their transitive dependencies with exact versions.",
                  point: "The freeze file is what makes your repository reproducible by someone else, including the grader.",
                },
                {
                  do: "Create an API key under API keys.",
                  where: "console.anthropic.com",
                  expect: "The key is displayed exactly once. Copy it now; you cannot read it again, only replace it.",
                  point: "Console-issued keys bill to your account. Treat the clipboard contents as a password, because that is what it is.",
                },
                {
                  do: "Put the key in .env — a file git has already been told to ignore.",
                  where: "VS Code",
                  commands: "ANTHROPIC_API_KEY=sk-ant-your-key-here",
                  expect: "One line, no quotes, no spaces around the equals sign.",
                  point: "Your code will read this by name. A key that only ever exists as os.environ[\"ANTHROPIC_API_KEY\"] in source cannot be pasted into a screenshot or a commit by accident.",
                },
                {
                  do: "Prove the ignore rule is actually working before you go further.",
                  where: "Terminal",
                  commands: "git status --short\ngit check-ignore -v .env",
                  expect: ".env does not appear in git status, and check-ignore prints the .gitignore line number that excludes it.",
                  point: "Verify the protection instead of assuming it. This two-command check takes five seconds and is the difference between a safe repo and a revoked key.",
                },
              ],
            },
            {
              text: "Write a small CLI that sends a prompt to a model and prints the response, token usage, latency, and estimated cost.",
              script: [
                {
                  do: "Look up a current model identifier and write it down.",
                  where: "Anthropic docs",
                  expect: "A dated identifier — a model family name followed by a release date.",
                  point: "Model IDs are retired and replaced every few months, so this course does not hard-code one. If you are working against OpenAI instead, everything in this lab transfers — a client object, a create call, a usage object on the response, and a per-million-token price list; only the names differ, so check their SDK docs for the current ones.",
                },
                {
                  do: "Write ask.py.",
                  where: "VS Code",
                  commands: "import os\nimport sys\nimport time\n\nfrom dotenv import load_dotenv\nfrom anthropic import Anthropic\n\nload_dotenv()\nclient = Anthropic(api_key=os.environ[\"ANTHROPIC_API_KEY\"])\n\nMODEL = \"...the model id you looked up...\"\nPRICE_IN = 0.00   # USD per million input tokens\nPRICE_OUT = 0.00  # USD per million output tokens\n\nprompt = \" \".join(sys.argv[1:]) or \"Explain a context window in two sentences.\"\ntemperature = float(os.environ.get(\"TEMP\", \"1.0\"))\n\nstart = time.perf_counter()\nmessage = client.messages.create(\n    model=MODEL,\n    max_tokens=512,\n    temperature=temperature,\n    messages=[{\"role\": \"user\", \"content\": prompt}],\n)\nelapsed = time.perf_counter() - start\n\ntext = \"\".join(b.text for b in message.content if b.type == \"text\")\nu = message.usage\ncost = (u.input_tokens / 1e6) * PRICE_IN + (u.output_tokens / 1e6) * PRICE_OUT\n\nprint(text)\nprint(\n    f\"--- in={u.input_tokens} out={u.output_tokens} \"\n    f\"latency={elapsed:.2f}s cost_usd={cost:.6f} temp={temperature}\"\n)",
                  expect: "No output yet — this step only creates the file.",
                  point: "Four numbers, one line, every run. Latency is wall clock around the call; the token counts come back from the API rather than from anything you counted yourself.",
                },
                {
                  do: "Run it.",
                  where: "Terminal",
                  commands: "python ask.py \"Name three jobs a vector database does well.\"",
                  expect: "The model's answer, then a single summary line ending in temp=1.0. Cost reads 0.000000 for now.",
                  point: "If this raises a KeyError on ANTHROPIC_API_KEY, load_dotenv is not finding your .env — you are probably running from the wrong directory.",
                },
                {
                  do: "Look up the current prices for your model, then replace the two zero placeholders in ask.py.",
                  where: "Pricing page",
                  expect: "Two different numbers. Output tokens cost several times more than input tokens.",
                  point: "Until both numbers are real, the cost line is decoration. The input/output asymmetry is the single most useful fact for budgeting an agent that reads a lot and writes a little.",
                },
                {
                  do: "Sanity-check that you are reading real usage.",
                  where: "Terminal",
                  commands: "# temporarily set max_tokens=64 in ask.py, then:\npython ask.py \"Name three jobs a vector database does well.\"",
                  expect: "out= drops to roughly 64 and the answer is cut off mid-sentence. in= barely moves.",
                  point: "Proves the numbers come from the response, not from your own arithmetic. Set max_tokens back to 512 before the next task.",
                },
              ],
            },
            {
              text: "Run the same prompt 10 times at two temperatures and summarize how the outputs vary.",
              script: [
                {
                  do: "Write run_sweep.py, which calls your CLI twenty times and records what comes back.",
                  where: "VS Code",
                  commands: "import csv\nimport os\nimport pathlib\nimport subprocess\n\nPROMPT = \"Write a one-sentence tagline for a used bookstore.\"\npathlib.Path(\"results\").mkdir(exist_ok=True)\n\nwith open(\"results/sweep.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.writer(f)\n    w.writerow([\"temperature\", \"run\", \"output\"])\n    for temp in (\"0.0\", \"1.0\"):\n        env = {**os.environ, \"TEMP\": temp}\n        for i in range(1, 11):\n            proc = subprocess.run(\n                [\"python\", \"ask.py\", PROMPT],\n                capture_output=True, text=True, env=env,\n            )\n            answer = proc.stdout.splitlines()[0] if proc.stdout.strip() else \"\"\n            w.writerow([temp, i, answer])\n            print(temp, i, answer[:60])",
                  expect: "No output yet.",
                  point: "Your CLI already reads TEMP from the environment, so the sweep needs no changes to ask.py. Small composable programs beat one large one.",
                },
                {
                  do: "Run the sweep.",
                  where: "Terminal",
                  commands: "python run_sweep.py",
                  expect: "Twenty lines scroll past over roughly one to three minutes, and results/sweep.csv appears.",
                  point: "This is your first deliberate spend. Twenty short calls costs a fraction of a cent — check it against your cost line and get used to knowing the number.",
                },
                {
                  do: "Measure the variation instead of eyeballing it — write count_variation.py, then run it.",
                  where: "VS Code + terminal",
                  commands: "# count_variation.py\nimport csv\n\nrows = list(csv.DictReader(open(\"results/sweep.csv\", encoding=\"utf-8\")))\nfor temp in (\"0.0\", \"1.0\"):\n    outs = [r[\"output\"] for r in rows if r[\"temperature\"] == temp]\n    print(temp, \"distinct:\", len(set(outs)), \"of\", len(outs))",
                  expect: "python count_variation.py prints two lines. Temperature 0.0 usually shows 1-3 distinct outputs; 1.0 usually shows 8-10.",
                  point: "Temperature 0 is not deterministic, only much less varied. A distinct-count is a claim you can defend; \"it seemed consistent\" is not.",
                },
                {
                  do: "Write the results table into README.md.",
                  where: "VS Code",
                  commands: "## Lab 1 results\n\n| Temperature | Distinct outputs (of 10) | Mean latency | Cost per call |\n|---|---|---|---|\n| 0.0 |  |  |  |\n| 1.0 |  |  |  |\n\nTwo or three sentences: what changed between the two settings, what did\nnot change, and which setting you would pick for a tool that extracts a\ndate from an invoice — and why.",
                  expect: "A filled-in table and a short paragraph.",
                  point: "The table is the deliverable a reader can check. The paragraph is where you commit to a judgement, which is the part that gets graded.",
                },
              ],
            },
            {
              text: "Start your AI-assistance log in the course repository.",
              script: [
                {
                  do: "Create AI-LOG.md with its header row.",
                  where: "VS Code",
                  commands: "# AI-assistance log\n\n| Date | Task | Tool and model | What I asked for | What I accepted, changed, or rejected | How I verified it |\n|---|---|---|---|---|---|",
                  expect: "An empty six-column table.",
                  point: "The last column is the one that matters. \"It ran\" is a verification; \"it looked right\" is not.",
                },
                {
                  do: "Add the first entry — this lab.",
                  where: "AI-LOG.md",
                  expect: "One row. If an assistant helped you write ask.py or run_sweep.py, that is the row. If you wrote everything yourself, say so in a row; the log records the decision either way.",
                  point: "The log is only worth keeping if it starts honest. You will carry this file through every module, and Module 16 asks you to read it back.",
                },
                {
                  do: "Commit, and check one last time that the key is not in the commit.",
                  where: "Terminal",
                  commands: "git add .\ngit status --short\ngit commit -m \"Lab 1 - first calls, measured\"",
                  expect: "The staged list shows .gitignore, ask.py, run_sweep.py, requirements.txt, README.md, AI-LOG.md and results/sweep.csv — and no .env.",
                  point: "Read the staged list before every commit in this course. It is the last moment a secret can be stopped cheaply.",
                },
              ],
            },
          ],
          deliverable: "Repository link with the CLI, a short results table, and the first log entry.",
        },
      },
      {
        id: "m02",
        number: 2,
        unit: 1,
        weeks: "2",
        title: "Structured output and prompt contracts",
        subtitle: "JSON schemas, validation, and prompts treated as versioned code",
        overview: [
          "Agents only work when their output can be consumed by other code. This module makes structured output the default: define a schema, ask the model to satisfy it, validate the result, and handle the cases where it does not.",
          "Prompts are treated as code — versioned, reviewed, and tested — rather than as magic incantations. Students build a small extraction tool and a test set that catches regressions when the prompt or model changes.",
        ],
        topics: [
          "Structured output modes and JSON Schema",
          "Validation libraries (Pydantic, Zod) and repair/retry strategies",
          "Prompt design as an interface contract: role, task, constraints, examples, output format",
          "Few-shot examples and when they help",
          "Versioning prompts alongside code; prompt regression tests",
        ],
        resources: ["anthropic-api", "openai-api", "pydantic"],
        lab: {
          title: "Lab 2 — Schema-validated extraction",
          tasks: [
            {
              text: "Build a CLI that extracts structured records (e.g., events, contacts, or invoice fields) from unstructured text into a JSON schema.",
              script: [
                {
                  do: "Create the Lab 2 folder, protect it, and set up the environment in one pass — the same moves as Lab 1.",
                  where: "Terminal",
                  commands: "mkdir agentic-lab02\ncd agentic-lab02\ngit init\n\n# .gitignore first, before any secret exists\ncopy ..\\agentic-lab01\\.gitignore .\n\npython -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\npip install anthropic python-dotenv pydantic\npip freeze > requirements.txt\n\n# reuse your Lab 1 key\ncopy ..\\agentic-lab01\\.env .env\ngit check-ignore -v .env\nmkdir prompts, tests, samples, results",
                  expect: "(.venv) in your prompt, requirements.txt now includes pydantic, check-ignore names the .gitignore line that excludes .env, and four empty folders.",
                  point: "This lab's running example extracts events from community newsletters. You may pick contacts or invoice fields instead — every step transfers — but pick one domain now and stay with it; the test set in Task 3 depends on it.",
                },
                {
                  do: "Write schema.py — the contract, in code.",
                  where: "VS Code",
                  commands: "import datetime as dt\n\nfrom pydantic import BaseModel, ConfigDict, Field\n\n\nclass Event(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n\n    title: str = Field(min_length=3, description=\"Short name of the event\")\n    date: dt.date = Field(description=\"ISO date, YYYY-MM-DD\")\n    start_time: dt.time | None = Field(\n        default=None, description=\"24-hour HH:MM, or null when no time is stated\"\n    )\n    location: str | None = Field(default=None, description=\"Where it happens, if stated\")\n    cost_usd: float | None = Field(\n        default=None, ge=0, description=\"0 if free, null if cost is not mentioned\"\n    )\n\n\nclass Extraction(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n\n    events: list[Event]",
                  expect: "No output yet — this step only creates the file.",
                  point: "The schema is the single source of truth. The prompt will be generated from it, and every response will be checked against it. extra=\"forbid\" rejects fields you did not ask for; ge=0 is a business rule no JSON parser would catch on its own.",
                },
                {
                  do: "Test the contract before any model is involved: one valid record, one broken one. Save this as check_schema.py and run it.",
                  where: "VS Code + terminal",
                  commands: "from pydantic import ValidationError\n\nfrom schema import Extraction\n\ngood = '{\"events\": [{\"title\": \"Ghost walk\", \"date\": \"2026-10-23\", \"start_time\": \"20:00\", \"cost_usd\": 5}]}'\nbad = '{\"events\": [{\"title\": \"Ghost walk\", \"date\": \"Oct 23\", \"start_time\": \"8 PM\", \"cost_usd\": -5}]}'\n\nprint(Extraction.model_validate_json(good))\ntry:\n    Extraction.model_validate_json(bad)\nexcept ValidationError as e:\n    print(e)\n\n# then:\n# python check_schema.py",
                  expect: "First an Extraction with real date and time objects, then \"3 validation errors for Extraction\" naming each field: events.0.date, events.0.start_time, events.0.cost_usd.",
                  point: "Read that error message closely. It is precise, field-by-field, and plain English — which is exactly why, in Task 2, you will hand it back to the model verbatim. The Claude and OpenAI APIs also offer native structured-output modes that constrain the model to a schema; you would still validate, because matching the JSON shape is not the same as getting the date right.",
                },
                {
                  do: "Print the JSON Schema that Pydantic generates from your class.",
                  where: "Terminal",
                  commands: "python -c \"import json, schema; print(json.dumps(schema.Extraction.model_json_schema(), indent=2))\"",
                  expect: "A standard JSON Schema document with $defs.Event, a properties block for each field, the descriptions you wrote, and \"minimum\": 0 on cost_usd.",
                  point: "This text is what the model will see. The Field descriptions are not comments — they are instructions, and they ship with every call.",
                },
                {
                  do: "Write the first prompt as a versioned file. Keep it deliberately plain.",
                  where: "prompts/extract_v1.txt",
                  commands: "Extract the events from the user's text.\nToday's date is {today}.\nReturn JSON matching this JSON Schema:\n{schema}",
                  expect: "Four lines. {today} and {schema} are placeholders your code fills in.",
                  point: "A prompt in a file is code: it is diffed, reviewed, and committed. v1 is intentionally minimal so Task 3 has something to measure an improvement against — resist the urge to perfect it now.",
                },
                {
                  do: "Write extract.py: load the prompt, call the model, strip Markdown fences, validate.",
                  where: "VS Code",
                  commands: "import argparse\nimport datetime as dt\nimport json\nimport os\nimport pathlib\nimport sys\n\nfrom dotenv import load_dotenv\nfrom anthropic import Anthropic\nfrom pydantic import ValidationError\n\nfrom schema import Extraction\n\nload_dotenv()\nclient = Anthropic(api_key=os.environ[\"ANTHROPIC_API_KEY\"])\n\nMODEL = \"...the model id you used in Lab 1...\"\n\n\ndef load_prompt(version: str, today: dt.date) -> str:\n    template = pathlib.Path(f\"prompts/extract_{version}.txt\").read_text(encoding=\"utf-8\")\n    schema = json.dumps(Extraction.model_json_schema(), indent=2)\n    return (\n        template.replace(\"{schema}\", schema)\n        .replace(\"{today}\", f\"{today.isoformat()} ({today:%A})\")\n    )\n\n\ndef strip_fences(raw: str) -> str:\n    \"\"\"Remove a ```json ... ``` wrapper if the model added one.\"\"\"\n    s = raw.strip()\n    if s.startswith(\"```\"):\n        s = s.split(\"\\n\", 1)[1] if \"\\n\" in s else \"\"\n        s = s.rsplit(\"```\", 1)[0]\n    return s.strip()\n\n\ndef call_model(system: str, messages: list[dict]):\n    message = client.messages.create(\n        model=MODEL,\n        max_tokens=1024,\n        temperature=0,\n        system=system,\n        messages=messages,\n    )\n    text = \"\".join(b.text for b in message.content if b.type == \"text\")\n    return text, message.usage\n\n\ndef extract(text: str, today: dt.date, version: str = \"v1\"):\n    \"\"\"One call, one validation. Returns (Extraction, attempts used).\"\"\"\n    system = load_prompt(version, today)\n    raw, usage = call_model(system, [{\"role\": \"user\", \"content\": text}])\n    print(f\"attempt 1: in={usage.input_tokens} out={usage.output_tokens}\", file=sys.stderr)\n    return Extraction.model_validate_json(strip_fences(raw)), 1\n\n\ndef main():\n    p = argparse.ArgumentParser(description=\"Extract events from a text file as JSON.\")\n    p.add_argument(\"file\")\n    p.add_argument(\"--today\", default=dt.date.today().isoformat(), help=\"YYYY-MM-DD\")\n    p.add_argument(\"--prompt\", default=\"v1\", help=\"prompt version, e.g. v1 or v2\")\n    args = p.parse_args()\n\n    text = pathlib.Path(args.file).read_text(encoding=\"utf-8\")\n    today = dt.date.fromisoformat(args.today)\n    try:\n        result, _ = extract(text, today, args.prompt)\n    except ValidationError as e:\n        print(f\"INVALID OUTPUT\\n{e}\", file=sys.stderr)\n        sys.exit(2)\n    print(result.model_dump_json(indent=2))\n\n\nif __name__ == \"__main__\":\n    main()",
                  expect: "No output yet. Paste in the same model id you used in Lab 1.",
                  point: "temperature=0 because this is extraction, not creative writing — your Lab 1 sweep showed why. strip_fences is the cheapest repair there is: models often wrap JSON in ```json fences, and removing them costs nothing compared to a retry.",
                },
                {
                  do: "Create a sample input.",
                  where: "samples/newsletter.txt",
                  commands: "GIRARD COMMUNITY NEWS - October\n\nThe Girard Free Library hosts a genealogy workshop on October 14 at 6:30 PM\nin the community room. Admission is $10.\n\nTrunk-or-treat in the Liberty High School lot, Saturday Oct 31 from 5 to 7 pm.\nFree for all ages.\n\nCity Hall will be closed Monday, October 12 for Columbus Day.",
                  expect: "Three paragraphs: two events and one closure.",
                  point: "Real input is messy: all-caps headers, dates without years, a closure that looks like an event. That third paragraph is a trap on purpose.",
                },
                {
                  do: "Run it, pinning today's date so the result is repeatable.",
                  where: "Terminal",
                  commands: "python extract.py samples/newsletter.txt --today 2026-10-01\necho $LASTEXITCODE",
                  expect: "Either a pretty-printed JSON object with an events list and exit code 0, or INVALID OUTPUT with a Pydantic error and exit code 2. Both are legitimate results — note which one you got.",
                  point: "--today exists because \"this Saturday\" means a different date every week. Any test that depends on the real clock is a test that will fail next Tuesday for no reason. The non-zero exit code means a shell script or CI job can tell that extraction failed.",
                },
              ],
            },
            {
              text: "Validate every response; on failure, retry with the validation error included, up to a limit.",
              script: [
                {
                  do: "In extract.py, replace the whole extract() function with this retry version. Leave everything else as it is.",
                  where: "VS Code",
                  commands: "MAX_ATTEMPTS = int(os.environ.get(\"MAX_ATTEMPTS\", \"3\"))\n\n\ndef extract(text: str, today: dt.date, version: str = \"v1\"):\n    \"\"\"Call, validate, and on failure retry with the error. Returns (Extraction, attempts).\"\"\"\n    system = load_prompt(version, today)\n    messages = [{\"role\": \"user\", \"content\": text}]\n    last_error = None\n\n    for attempt in range(1, MAX_ATTEMPTS + 1):\n        raw, usage = call_model(system, messages)\n        tokens = f\"in={usage.input_tokens} out={usage.output_tokens}\"\n        try:\n            result = Extraction.model_validate_json(strip_fences(raw))\n        except ValidationError as e:\n            print(f\"attempt {attempt}: INVALID ({e.error_count()} errors) {tokens}\", file=sys.stderr)\n            last_error = e\n            messages += [\n                {\"role\": \"assistant\", \"content\": raw},\n                {\n                    \"role\": \"user\",\n                    \"content\": (\n                        \"Your output failed validation:\\n\"\n                        f\"{e}\\n\\n\"\n                        \"Return the corrected JSON object only.\"\n                    ),\n                },\n            ]\n            continue\n        print(f\"attempt {attempt}: valid {tokens}\", file=sys.stderr)\n        return result, attempt\n\n    raise last_error",
                  expect: "main() needs no changes: it already catches ValidationError, and the retry version re-raises the last one when every attempt has failed.",
                  point: "The failed output goes back as an assistant turn and the error as a user turn, so the model sees exactly what it said and exactly why it was rejected. Sending only \"try again\" throws away the most useful information you have.",
                },
                {
                  do: "Force a failure you can predict: temporarily tighten the title rule in schema.py.",
                  where: "schema.py",
                  commands: "# temporarily, in class Event:\ntitle: str = Field(min_length=3, max_length=12, description=\"Short name of the event\")",
                  expect: "A one-line change. Titles like \"Genealogy workshop\" (18 characters) will now be rejected.",
                  point: "You cannot test a retry loop by waiting for a failure to happen by chance. Make the failure happen on purpose, then check that the loop recovers.",
                },
                {
                  do: "Run the sample again and watch stderr.",
                  where: "Terminal",
                  commands: "python extract.py samples/newsletter.txt --today 2026-10-01",
                  expect: "attempt 1: INVALID (… errors), then usually attempt 2: valid — with titles shortened to 12 characters or fewer, such as \"Genealogy\". Input tokens on attempt 2 are roughly double attempt 1.",
                  point: "The retry costs more than the first call because the whole conversation is re-sent. Retries are a safety net, not a strategy — a prompt that needs one on most inputs is a prompt that needs fixing.",
                },
                {
                  do: "Check that the limit holds: allow only one attempt.",
                  where: "Terminal",
                  commands: "$env:MAX_ATTEMPTS = \"1\"\npython extract.py samples/newsletter.txt --today 2026-10-01\necho $LASTEXITCODE\nRemove-Item Env:MAX_ATTEMPTS\n\n# macOS or Linux:\n# MAX_ATTEMPTS=1 python extract.py samples/newsletter.txt --today 2026-10-01; echo $?",
                  expect: "One INVALID attempt, the Pydantic error, and exit code 2. No second call is made.",
                  point: "Every loop that calls a paid API needs a hard ceiling. Module 3's agent loop uses the same idea — a step limit — with more at stake.",
                },
                {
                  do: "Undo the temporary change: remove max_length=12 from schema.py.",
                  where: "schema.py",
                  commands: "title: str = Field(min_length=3, description=\"Short name of the event\")",
                  expect: "The original line is back. Run the sample once more; it should validate on the first attempt most of the time.",
                  point: "Leaving a test-only constraint in place is how a real bug gets shipped. The git diff before your next commit should not show schema.py at all.",
                },
              ],
            },
            {
              text: "Create a 20-example test set and report the pass rate before and after one prompt revision.",
              script: [
                {
                  do: "Start tests/cases.jsonl with these eight cases — one JSON object per line.",
                  where: "tests/cases.jsonl",
                  commands: "{\"id\": \"plain-01\", \"today\": \"2026-10-01\", \"text\": \"The Girard Free Library hosts a genealogy workshop on October 14, 2026 at 6:30 PM in the community room. Admission is $10.\", \"expected\": [{\"title_has\": \"genealogy\", \"date\": \"2026-10-14\", \"start_time\": \"18:30\", \"cost_usd\": 10}]}\n{\"id\": \"free-02\", \"today\": \"2026-10-01\", \"text\": \"Trunk-or-treat in the Liberty High School lot, Saturday Oct 31 from 5 to 7 pm. Free for all ages.\", \"expected\": [{\"title_has\": \"trunk\", \"date\": \"2026-10-31\", \"start_time\": \"17:00\", \"cost_usd\": 0}]}\n{\"id\": \"relative-03\", \"today\": \"2026-10-01\", \"text\": \"Reminder: the Friends of Mosquito Lake shoreline cleanup is this Saturday at 9 a.m. Bring gloves.\", \"expected\": [{\"title_has\": \"cleanup\", \"date\": \"2026-10-03\", \"start_time\": \"09:00\", \"cost_usd\": null}]}\n{\"id\": \"notime-04\", \"today\": \"2026-10-01\", \"text\": \"Trumbull County Fair board meeting on November 5 at the fairgrounds office.\", \"expected\": [{\"title_has\": \"meeting\", \"date\": \"2026-11-05\", \"start_time\": null, \"cost_usd\": null}]}\n{\"id\": \"repeat-05\", \"today\": \"2026-10-01\", \"text\": \"Free flu shot clinic at the senior center on Tuesday, October 13 and Tuesday, October 20, 10 a.m. to 2 p.m.\", \"expected\": [{\"title_has\": \"flu\", \"date\": \"2026-10-13\", \"start_time\": \"10:00\", \"cost_usd\": 0}, {\"title_has\": \"flu\", \"date\": \"2026-10-20\", \"start_time\": \"10:00\", \"cost_usd\": 0}]}\n{\"id\": \"nextyear-06\", \"today\": \"2026-10-01\", \"text\": \"Save the date: Polar Plunge at Lake Milton, January 1 at noon. $25 registration.\", \"expected\": [{\"title_has\": \"plunge\", \"date\": \"2027-01-01\", \"start_time\": \"12:00\", \"cost_usd\": 25}]}\n{\"id\": \"none-07\", \"today\": \"2026-10-01\", \"text\": \"City Hall will be closed Monday, October 12 for Columbus Day. Trash pickup shifts one day later all week.\", \"expected\": []}\n{\"id\": \"noise-08\", \"today\": \"2026-10-01\", \"text\": \"From the council newsletter: paving on State St. starts next week. The historical society's ghost walk is Friday, October 23 at 8 PM, $5 suggested donation, meet at the gazebo. Leaf pickup begins Nov 2.\", \"expected\": [{\"title_has\": \"ghost\", \"date\": \"2026-10-23\", \"start_time\": \"20:00\", \"cost_usd\": 5}]}",
                  expect: "Eight lines. Each case pins its own today date, and expected lists only the fields worth grading.",
                  point: "Each case targets one way extraction goes wrong: free vs. not mentioned, a relative date, a missing time, two occurrences, a date that rolls into next year, text with no events at all, and events buried in noise. A test set of 20 easy cases tells you nothing.",
                },
                {
                  do: "Write twelve more cases of your own, in the same format, until you have 20.",
                  where: "tests/cases.jsonl",
                  commands: "Aim for coverage, not volume. Include at least one of each:\n- a time written as \"noon\", \"7pm\", or \"19:00\"\n- \"next Tuesday\" (not \"this Tuesday\")\n- a multi-day festival (decide: one record or one per day, and be consistent)\n- a bulleted list of three or more events\n- tiered prices (\"$8 adults, $4 kids\") — decide which number counts\n- an email with a long signature block\n- typos or ALL-CAPS text\n- a deadline (\"applications due Oct 30\") that is not an event",
                  expect: "20 lines in total, and a scratch list of every ambiguous case with the rule you chose — it goes into NOTE.md at the end.",
                  point: "Writing the expected answer forces you to decide what correct means. When you cannot decide, the model cannot either — that ambiguity belongs in the prompt, not in the grader.",
                },
                {
                  do: "Write run_tests.py: run every case, grade it, and save the results.",
                  where: "VS Code",
                  commands: "import datetime as dt\nimport json\nimport pathlib\nimport sys\n\nfrom pydantic import ValidationError\n\nfrom extract import extract\n\nversion = sys.argv[1] if len(sys.argv) > 1 else \"v1\"\nlines = pathlib.Path(\"tests/cases.jsonl\").read_text(encoding=\"utf-8\").splitlines()\ncases = [json.loads(line) for line in lines if line.strip()]\n\n\ndef hhmm(t):\n    return t[:5] if t else None\n\n\ndef sort_key(e):\n    return (e[\"date\"], e[\"start_time\"] or \"\")\n\n\ndef check(expected, got):\n    \"\"\"Compare one case. Returns a list of problems; an empty list is a pass.\"\"\"\n    if len(got) != len(expected):\n        return [f\"expected {len(expected)} event(s), got {len(got)}\"]\n    problems = []\n    for exp, g in zip(sorted(expected, key=sort_key), sorted(got, key=sort_key)):\n        if exp[\"title_has\"].lower() not in g[\"title\"].lower():\n            problems.append(f\"title: expected to contain {exp['title_has']!r}, got {g['title']!r}\")\n        for field in (\"date\", \"start_time\", \"cost_usd\"):\n            if exp[field] != g[field]:\n                problems.append(f\"{field}: expected {exp[field]!r}, got {g[field]!r}\")\n    return problems\n\n\nreport = []\nfor case in cases:\n    try:\n        result, attempts = extract(case[\"text\"], dt.date.fromisoformat(case[\"today\"]), version)\n    except ValidationError as e:\n        report.append({\"id\": case[\"id\"], \"status\": \"invalid\", \"problems\": [str(e)]})\n        print(f\"INVALID {case['id']}\")\n        continue\n    got = [\n        {**e, \"start_time\": hhmm(e[\"start_time\"])}\n        for e in result.model_dump(mode=\"json\")[\"events\"]\n    ]\n    problems = check(case[\"expected\"], got)\n    status = \"pass\" if not problems else \"fail\"\n    report.append({\"id\": case[\"id\"], \"status\": status, \"attempts\": attempts,\n                   \"problems\": problems, \"got\": got})\n    print(f\"{status.upper():7} {case['id']}  (attempts: {attempts})\")\n    for p in problems:\n        print(f\"        - {p}\")\n\npassed = sum(r[\"status\"] == \"pass\" for r in report)\nretried = sum(r.get(\"attempts\", 0) > 1 for r in report)\ninvalid = sum(r[\"status\"] == \"invalid\" for r in report)\nprint(f\"\\nprompt {version}: {passed}/{len(report)} passed \"\n      f\"({passed / len(report):.0%}), {retried} needed a retry, {invalid} never valid\")\n\npathlib.Path(\"results\").mkdir(exist_ok=True)\npathlib.Path(f\"results/{version}.json\").write_text(json.dumps(report, indent=2), encoding=\"utf-8\")",
                  expect: "No output yet.",
                  point: "Titles are checked for a keyword because \"Ghost walk\" and \"Historical Society Ghost Walk\" are both correct. Dates, times and costs are checked exactly because a wrong date is simply wrong. Decide which fields deserve which kind of check.",
                },
                {
                  do: "Run the baseline with the v1 prompt.",
                  where: "Terminal",
                  commands: "python run_tests.py v1",
                  expect: "One line per case — PASS, FAIL, or INVALID — with the specific mismatches listed under each failure, then a summary such as \"prompt v1: 11/20 passed (55%), 3 needed a retry, 0 never valid\". Your numbers will differ.",
                  point: "This number is your baseline. Commit results/v1.json now, before you change anything, so the before-and-after comparison cannot be quietly rewritten later.",
                },
                {
                  do: "Sort the failures into causes before touching the prompt.",
                  where: "results/v1.json",
                  expect: "A short list in your notes, such as: \"free\" came back null (2 cases), leaf pickup counted as an event (1), two-date clinic merged into one record (1), a guessed start time (1).",
                  point: "Fix causes, not cases. One rule that addresses four failures is a better revision than four special cases, each written to satisfy a single test.",
                },
                {
                  do: "Write prompts/extract_v2.txt — one revision that addresses the causes you found.",
                  where: "prompts/extract_v2.txt",
                  commands: "You are a data-extraction component. Your output is parsed by a program, not read by a person.\n\nTask: find every event in the user's text and return them as JSON.\n\nToday's date is {today}.\n- Resolve relative dates (\"this Saturday\", \"next Tuesday\") against today's date.\n- If a date has no year, use the next occurrence on or after today.\n\nRules:\n- Output a single JSON object and nothing else: no prose, no Markdown code fences.\n- One record per occurrence. An event held on two dates is two records.\n- start_time is 24-hour HH:MM. If no start time is stated, use null. Never guess.\n- cost_usd is 0 when the text says free or no charge, and null when cost is not mentioned.\n  A \"suggested donation\" of $5 is 5.\n- Closures, deadlines, and service schedules (trash, leaf pickup, road paving) are not events.\n- If there are no events, return {\"events\": []}.\n\nJSON Schema:\n{schema}\n\nExample\nToday: 2026-10-01 (Thursday)\nText: Pancake breakfast at St. Rose hall this Sunday 8-11am, $6 adults. Leaf pickup starts Oct 19.\nOutput: {\"events\": [{\"title\": \"Pancake breakfast\", \"date\": \"2026-10-04\", \"start_time\": \"08:00\", \"location\": \"St. Rose hall\", \"cost_usd\": 6}]}",
                  expect: "The same contract as v1, now written as an interface: role, task, date rules, output rules, schema, and one worked example.",
                  point: "Every rule here traces back to a failure category from the previous step. The example deliberately includes a non-event (leaf pickup) and a relative date, because a few-shot example that only shows the easy case teaches nothing. Keep v1 — the comparison needs both files.",
                },
                {
                  do: "Run the same 20 cases against v2.",
                  where: "Terminal",
                  commands: "python run_tests.py v2",
                  expect: "A higher pass rate and fewer retries — but look for any case that passed under v1 and fails under v2.",
                  point: "A case that goes from pass to fail is a regression, and it is why the full set runs on every change rather than only the cases you were trying to fix.",
                },
                {
                  do: "Write NOTE.md — the one-page note — and commit.",
                  where: "VS Code + terminal",
                  commands: "# NOTE.md\n\n## Lab 2: what changed the pass rate\n\n| Prompt | Passed (of 20) | Needed a retry | Never valid |\n|---|---|---|---|\n| v1 |  |  |  |\n| v2 |  |  |  |\n\n**Failure causes under v1** (with counts):\n\n**What v2 changed, and which cause each change targeted:**\n\n**Regressions** (passed under v1, failed under v2):\n\n**Still failing, and why I stopped there:**\n\n**Ambiguous cases and the rule I chose:**\n\n\n# then, in the terminal:\ngit add .\ngit status --short\ngit commit -m \"Lab 2 - schema-validated extraction, v1 vs v2\"",
                  expect: "The staged list shows schema.py, check_schema.py, extract.py, run_tests.py, both prompt files, tests/cases.jsonl, results/v1.json, results/v2.json, samples/, NOTE.md and requirements.txt — and no .env. Add this lab's row to AI-LOG.md before committing.",
                  point: "The table is what a reader checks; the causes-and-changes section is what gets graded. \"v2 was better\" is an observation. \"Adding the free-means-0 rule fixed three cases\" is an engineering result.",
                },
              ],
            },
          ],
          deliverable: "Code, schema, test set, and a one-page note on what changed the pass rate.",
        },
      },
    ],
  },

  // ----------------------------------------------------------------- Unit II
  {
    number: 2,
    title: "Agents, Tools, and Knowledge",
    theme:
      "Give the model the ability to act: tool calling, the agent loop, robustness engineering, and grounding answers in real documents with retrieval and memory.",
    modules: [
      {
        id: "m03",
        number: 3,
        unit: 2,
        weeks: "3",
        title: "Tool calling and the agent loop",
        subtitle: "Function schemas, reason → act → observe, and when to stop",
        overview: [
          "An agent is a model in a loop that can call tools. The model decides which tool to call with which arguments, the program executes it, the result goes back to the model, and the loop continues until the task is done or a limit is reached.",
          "Students implement this loop by hand before touching any framework, so that later abstractions are understood rather than trusted blindly.",
        ],
        topics: [
          "Workflows vs. agents: when a fixed pipeline is better than autonomy",
          "Tool definitions: names, descriptions, and JSON parameter schemas",
          "The agent loop: reason, act, observe, repeat",
          "Parallel tool calls and tool results as context",
          "Stopping conditions: task completion, step limits, cost limits",
          "The ReAct pattern",
        ],
        resources: ["building-effective-agents", "anthropic-tools", "openai-functions", "react"],
        lab: {
          title: "Lab 3 — A hand-rolled agent",
          tasks: [
            {
              text: "Implement an agent loop without a framework.",
              script: [
                {
                  do: "Create the Lab 3 folder, protect it, and set up the environment — the same moves as Labs 1 and 2.",
                  where: "Terminal",
                  commands: "mkdir agentic-lab03\ncd agentic-lab03\ngit init\ncopy ..\\agentic-lab01\\.gitignore .\nAdd-Content .gitignore \"data/*.db\"\n\npython -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\npip install anthropic python-dotenv\npip freeze > requirements.txt\n\ncopy ..\\agentic-lab01\\.env .env\ngit check-ignore -v .env\nmkdir data, traces, workspace",
                  expect: "(.venv) in your prompt, check-ignore names the line that excludes .env, and three empty folders.",
                  point: "No agent framework is installed — only the vendor SDK. Everything that makes this an agent is code you are about to write, which is the whole point of the lab. The database is ignored because a script rebuilds it identically; the traces are not, because they are part of the deliverable.",
                },
                {
                  do: "Write tools.py with a single tool — a safe calculator — plus the registry and dispatcher every later tool will plug into.",
                  where: "VS Code",
                  commands: "import ast\nimport operator\n\n# ---------------------------------------------------------------- calculator\n_OPS = {\n    ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,\n    ast.Div: operator.truediv, ast.FloorDiv: operator.floordiv,\n    ast.Mod: operator.mod, ast.Pow: operator.pow,\n    ast.USub: operator.neg, ast.UAdd: operator.pos,\n}\n_FUNCS = {\"round\": round, \"abs\": abs, \"min\": min, \"max\": max}\n\n\ndef _eval(node):\n    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):\n        return node.value\n    if isinstance(node, ast.BinOp) and type(node.op) in _OPS:\n        return _OPS[type(node.op)](_eval(node.left), _eval(node.right))\n    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:\n        return _OPS[type(node.op)](_eval(node.operand))\n    if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)\n            and node.func.id in _FUNCS and not node.keywords):\n        return _FUNCS[node.func.id](*[_eval(a) for a in node.args])\n    raise ValueError(f\"unsupported expression element: {ast.dump(node)[:60]}\")\n\n\ndef calculator(expression: str) -> str:\n    return str(_eval(ast.parse(expression, mode=\"eval\").body))\n\n\n# ---------------------------------------------------------------- registry\nTOOLS = [\n    {\n        \"name\": \"calculator\",\n        \"description\": (\n            \"Evaluate an arithmetic expression exactly. Supports + - * / // % ** \"\n            \"and round(), abs(), min(), max(). Use this for any arithmetic \"\n            \"instead of calculating in your head.\"\n        ),\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"expression\": {\"type\": \"string\", \"description\": \"e.g. round(2340 * 0.175, 2)\"}\n            },\n            \"required\": [\"expression\"],\n        },\n    },\n]\n\nFUNCTIONS = {\"calculator\": calculator}\n\n\ndef dispatch(name: str, args: dict) -> tuple[str, bool]:\n    \"\"\"Run one tool. Returns (output, is_error). Never raises.\"\"\"\n    if name not in FUNCTIONS:\n        return f\"ERROR: unknown tool {name!r}\", True\n    try:\n        return FUNCTIONS[name](**args), False\n    except Exception as e:\n        return f\"ERROR: {type(e).__name__}: {e}\", True",
                  expect: "No output yet — this step only creates the file.",
                  point: "Three pieces: the function, the schema the model sees (TOOLS), and a dispatcher that maps a name to a function. The calculator walks the syntax tree instead of calling eval(), because the model's arguments are untrusted input — treat them the way you would treat a web form.",
                },
                {
                  do: "Test the tool without the model: one good expression, one it must refuse.",
                  where: "Terminal",
                  commands: "python -c \"from tools import dispatch; print(dispatch('calculator', {'expression': 'round(2340 * 0.175, 2)'}))\"\npython -c \"from tools import dispatch; print(dispatch('calculator', {'expression': 'len(dir())'}))\"",
                  expect: "('409.5', False), then ('ERROR: ValueError: unsupported expression element: …', True).",
                  point: "dispatch() never raises. A tool failure becomes a result the model can read and react to, instead of a stack trace that kills the run.",
                },
                {
                  do: "Write agent.py — the loop itself.",
                  where: "VS Code",
                  commands: "import argparse\nimport datetime as dt\nimport json\nimport os\nimport pathlib\nimport sys\nimport time\n\nfrom dotenv import load_dotenv\nfrom anthropic import Anthropic\n\nfrom tools import TOOLS, dispatch\n\nload_dotenv()\nclient = Anthropic(api_key=os.environ[\"ANTHROPIC_API_KEY\"])\n\nMODEL = \"...the model id you used in Lab 1...\"\nMAX_STEPS = int(os.environ.get(\"MAX_STEPS\", \"10\"))\nTOKEN_BUDGET = int(os.environ.get(\"TOKEN_BUDGET\", \"60000\"))  # input + output, whole run\n\nSYSTEM = (\n    \"You are a careful analyst for a small town's public works department. \"\n    \"Use the tools to look things up and to do arithmetic; never guess a number. \"\n    \"When you have the answer, reply with it in plain text and stop calling tools.\"\n)\n\n\nclass Trace:\n    \"\"\"Append one JSON object per line: every model turn and every tool call.\"\"\"\n\n    def __init__(self, path):\n        pathlib.Path(path).parent.mkdir(parents=True, exist_ok=True)\n        self.f = open(path, \"w\", encoding=\"utf-8\")\n\n    def log(self, **event):\n        event = {\"t\": dt.datetime.now().isoformat(timespec=\"seconds\"), **event}\n        self.f.write(json.dumps(event, default=str) + \"\\n\")\n        self.f.flush()\n\n\ndef run(task: str, trace: Trace) -> str:\n    messages = [{\"role\": \"user\", \"content\": task}]\n    trace.log(type=\"task\", task=task, model=MODEL, max_steps=MAX_STEPS)\n    used = 0\n\n    for step in range(1, MAX_STEPS + 1):\n        # ---- reason: ask the model what to do next\n        response = client.messages.create(\n            model=MODEL, max_tokens=1024, temperature=0,\n            system=SYSTEM, tools=TOOLS, messages=messages,\n        )\n        u = response.usage\n        used += u.input_tokens + u.output_tokens\n        messages.append({\"role\": \"assistant\", \"content\": response.content})\n\n        text = \"\".join(b.text for b in response.content if b.type == \"text\")\n        calls = [b for b in response.content if b.type == \"tool_use\"]\n        trace.log(type=\"model\", step=step, stop_reason=response.stop_reason,\n                  text=text, tool_calls=[{\"name\": c.name, \"input\": c.input} for c in calls],\n                  input_tokens=u.input_tokens, output_tokens=u.output_tokens)\n        print(f\"step {step}: {response.stop_reason} \"\n              f\"{[c.name for c in calls]} in={u.input_tokens} out={u.output_tokens}\",\n              file=sys.stderr)\n\n        # ---- stop: the model answered instead of asking for a tool\n        if response.stop_reason != \"tool_use\":\n            trace.log(type=\"end\", reason=\"answered\", steps=step, tokens=used)\n            return text\n\n        # ---- act + observe: run every requested tool, send all results back\n        results = []\n        for call in calls:\n            start = time.perf_counter()\n            output, is_error = dispatch(call.name, call.input)\n            ms = round((time.perf_counter() - start) * 1000)\n            trace.log(type=\"tool\", step=step, name=call.name, input=call.input,\n                      output=output[:2000], is_error=is_error, ms=ms)\n            results.append({\"type\": \"tool_result\", \"tool_use_id\": call.id,\n                            \"content\": output, \"is_error\": is_error})\n        messages.append({\"role\": \"user\", \"content\": results})\n\n        if used > TOKEN_BUDGET:\n            trace.log(type=\"end\", reason=\"token budget\", steps=step, tokens=used)\n            return f\"[stopped: token budget of {TOKEN_BUDGET} exceeded after {step} steps]\"\n\n    trace.log(type=\"end\", reason=\"step limit\", steps=MAX_STEPS, tokens=used)\n    return f\"[stopped: step limit of {MAX_STEPS} reached]\"\n\n\ndef main():\n    p = argparse.ArgumentParser(description=\"A hand-rolled tool-calling agent.\")\n    p.add_argument(\"task\")\n    p.add_argument(\"--trace\", default=\"traces/latest.jsonl\")\n    args = p.parse_args()\n    print(run(args.task, Trace(args.trace)))\n\n\nif __name__ == \"__main__\":\n    main()",
                  expect: "No output yet. Paste in the same model id you used in Lab 1.",
                  point: "Read run() top to bottom: ask the model; if it asked for tools, run them and send every result back tagged with its tool_use_id; repeat. It stops for exactly three reasons — the model answered, the step limit, or the token budget. Every agent framework you meet in Module 9 is this loop with more features on top.",
                },
                {
                  do: "Give it a task that needs the tool.",
                  where: "Terminal",
                  commands: "python agent.py \"What is 17.5% of 2,340, plus a $35 filing fee?\"",
                  expect: "On stderr, step 1: tool_use ['calculator'] then step 2: end_turn []. On stdout, an answer of $444.50.",
                  point: "You never told the program to use the calculator. The model read the tool description, decided to call it, chose the arguments, and decided when it had enough to answer. That decision-making is what separates an agent from a script.",
                },
                {
                  do: "Give it a task that needs no tool.",
                  where: "Terminal",
                  commands: "python agent.py \"In one sentence, what does a public works department do?\"",
                  expect: "step 1: end_turn [] and a one-sentence answer. No tool calls.",
                  point: "The same loop handles both cases because the model, not your code, decides whether a tool is needed. A workflow would have called the calculator anyway.",
                },
                {
                  do: "Prove the step limit works.",
                  where: "Terminal",
                  commands: "$env:MAX_STEPS = \"1\"\npython agent.py \"What is 17.5% of 2,340, plus a $35 filing fee?\"\nRemove-Item Env:MAX_STEPS\n\n# macOS or Linux:\n# MAX_STEPS=1 python agent.py \"What is 17.5% of 2,340, plus a $35 filing fee?\"",
                  expect: "step 1: tool_use ['calculator'], then [stopped: step limit of 1 reached]. The tool ran, but the model never got to use the result.",
                  point: "An agent with no ceiling is an open tab on your credit card. Test every stopping condition deliberately, the same way you tested the retry limit in Lab 2.",
                },
              ],
            },
            {
              text: "Give it three or four real tools, e.g. web search, a SQL query tool over a provided database, a calculator, and file read/write.",
              script: [
                {
                  do: "Write make_db.py, which builds the provided database: town facilities and their service requests.",
                  where: "VS Code",
                  commands: "import pathlib\nimport random\nimport sqlite3\nfrom datetime import date, timedelta\n\nrandom.seed(7)  # same data on every machine\npathlib.Path(\"data\").mkdir(exist_ok=True)\ndb = pathlib.Path(\"data/town.db\")\ndb.unlink(missing_ok=True)\n\ncon = sqlite3.connect(db)\ncon.executescript(\"\"\"\nCREATE TABLE facilities (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    type TEXT NOT NULL,      -- park, hydrant, building, streetlight\n    ward INTEGER NOT NULL    -- 1 to 4\n);\nCREATE TABLE service_requests (\n    id INTEGER PRIMARY KEY,\n    facility_id INTEGER NOT NULL REFERENCES facilities(id),\n    category TEXT NOT NULL,  -- repair, inspection, cleanup, vandalism\n    opened TEXT NOT NULL,    -- ISO date\n    closed TEXT,             -- ISO date, NULL while still open\n    cost_usd REAL            -- NULL while still open\n);\n\"\"\")\n\ntypes = [\"park\", \"hydrant\", \"building\", \"streetlight\"]\nfor i in range(1, 41):\n    t = random.choice(types)\n    con.execute(\"INSERT INTO facilities VALUES (?, ?, ?, ?)\",\n                (i, f\"{t.title()} {i:02d}\", t, random.randint(1, 4)))\n\ncategories = [\"repair\", \"inspection\", \"cleanup\", \"vandalism\"]\nstart = date(2024, 1, 1)\nfor i in range(1, 401):\n    opened = start + timedelta(days=random.randint(0, 900))\n    is_open = random.random() < 0.1\n    closed = None if is_open else opened + timedelta(days=random.randint(1, 60))\n    cost = None if is_open else round(random.uniform(40, 2500), 2)\n    con.execute(\"INSERT INTO service_requests VALUES (?, ?, ?, ?, ?, ?)\",\n                (i, random.randint(1, 40), random.choice(categories),\n                 opened.isoformat(), closed and closed.isoformat(), cost))\n\ncon.commit()\nprint(\"facilities:\", con.execute(\"SELECT COUNT(*) FROM facilities\").fetchone()[0])\nprint(\"service_requests:\", con.execute(\"SELECT COUNT(*) FROM service_requests\").fetchone()[0])\ncon.close()",
                  expect: "No output yet.",
                  point: "The seed makes the data identical on every student's machine, so everyone can check answers against the same ground truth. The comments inside CREATE TABLE are visible to the model when it inspects the schema — they are documentation for your agent.",
                },
                {
                  do: "Build it.",
                  where: "Terminal",
                  commands: "python make_db.py",
                  expect: "facilities: 40 and service_requests: 400, and a new file data/town.db.",
                  point: "Rerun this any time you want a clean copy. Nothing your agent does can change it anyway, as the next steps show.",
                },
                {
                  do: "Append the SQL and file tools to the end of tools.py.",
                  where: "tools.py",
                  commands: "# ---------------------------------------------------------------- SQL\nimport json\nimport pathlib\nimport sqlite3\n\nDB_PATH = pathlib.Path(\"data/town.db\")\nMAX_ROWS = 50\n\n\ndef run_sql(query: str) -> str:\n    # mode=ro: the database itself refuses writes, whatever the query says\n    con = sqlite3.connect(f\"file:{DB_PATH.as_posix()}?mode=ro\", uri=True)\n    try:\n        cur = con.execute(query)\n        cols = [d[0] for d in cur.description or []]\n        rows = cur.fetchmany(MAX_ROWS + 1)\n    finally:\n        con.close()\n    note = f\"\\n(truncated to {MAX_ROWS} rows)\" if len(rows) > MAX_ROWS else \"\"\n    return json.dumps({\"columns\": cols, \"rows\": rows[:MAX_ROWS]}) + note\n\n\n# ---------------------------------------------------------------- files\nWORKSPACE = pathlib.Path(\"workspace\").resolve()\n\n\ndef _safe_path(path: str) -> pathlib.Path:\n    target = (WORKSPACE / path).resolve()\n    if not target.is_relative_to(WORKSPACE):\n        raise PermissionError(f\"{path!r} is outside the workspace folder\")\n    return target\n\n\ndef read_file(path: str) -> str:\n    return _safe_path(path).read_text(encoding=\"utf-8\")\n\n\ndef write_file(path: str, content: str) -> str:\n    target = _safe_path(path)\n    target.parent.mkdir(parents=True, exist_ok=True)\n    target.write_text(content, encoding=\"utf-8\")\n    return f\"wrote {len(content)} characters to {path}\"\n\n\nTOOLS += [\n    {\n        \"name\": \"run_sql\",\n        \"description\": (\n            \"Run one read-only SQLite query against the town database and get \"\n            \"the result as JSON (max 50 rows). If you do not know the tables, \"\n            \"first run: SELECT name, sql FROM sqlite_master WHERE type='table'. \"\n            \"Dates are ISO text, so use strftime('%Y', col) or LIKE '2025-%'.\"\n        ),\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\"query\": {\"type\": \"string\", \"description\": \"A single SELECT statement\"}},\n            \"required\": [\"query\"],\n        },\n    },\n    {\n        \"name\": \"read_file\",\n        \"description\": \"Read a UTF-8 text file from the workspace folder.\",\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\"path\": {\"type\": \"string\", \"description\": \"Relative path, e.g. notes/todo.md\"}},\n            \"required\": [\"path\"],\n        },\n    },\n    {\n        \"name\": \"write_file\",\n        \"description\": (\n            \"Create or overwrite a UTF-8 text file in the workspace folder. \"\n            \"Parent folders are created as needed.\"\n        ),\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"path\": {\"type\": \"string\", \"description\": \"Relative path, e.g. reports/summary.md\"},\n                \"content\": {\"type\": \"string\"},\n            },\n            \"required\": [\"path\", \"content\"],\n        },\n    },\n]\n\nFUNCTIONS |= {\"run_sql\": run_sql, \"read_file\": read_file, \"write_file\": write_file}",
                  expect: "tools.py now registers four tools: calculator, run_sql, read_file, write_file. The imports sit with the block so it pastes in one piece — move them to the top of the file if you prefer.",
                  point: "The guard rails live in the tools, not in the prompt. mode=ro means the database refuses writes whatever SQL the model sends; _safe_path means no file outside workspace/ can be read or written. Web search works the same way — both Claude and OpenAI offer it as a provider-side tool — but this lab uses local tools so every run is free to repeat and every answer can be checked.",
                },
                {
                  do: "Attack your own tools before the model does: save check_tools.py and run it.",
                  where: "VS Code + terminal",
                  commands: "from tools import dispatch\n\nchecks = [\n    (\"calculator\", {\"expression\": \"round(2340 * 0.175, 2)\"}),\n    (\"calculator\", {\"expression\": \"__import__('os').getcwd()\"}),\n    (\"run_sql\", {\"query\": \"SELECT type, COUNT(*) FROM facilities GROUP BY type\"}),\n    (\"run_sql\", {\"query\": \"DELETE FROM facilities\"}),\n    (\"write_file\", {\"path\": \"notes/hello.md\", \"content\": \"hello\"}),\n    (\"read_file\", {\"path\": \"notes/hello.md\"}),\n    (\"read_file\", {\"path\": \"../.env\"}),\n    (\"send_email\", {\"to\": \"mayor@example.com\"}),\n]\nfor name, args in checks:\n    output, is_error = dispatch(name, args)\n    print(f\"{'ERR' if is_error else 'ok '}  {name:<11} {output[:90]}\")\n\n# then:\n# python check_tools.py",
                  expect: "Eight lines. The four ok lines are the good calls; the four ERR lines are the eval escape, the DELETE (\"attempt to write a readonly database\"), the ../.env read (\"outside the workspace folder\"), and a tool that does not exist.",
                  point: "Each ERR line is a promise you can now make about your agent: it cannot delete data, cannot read your API key, and cannot call tools you did not give it. Module 12 comes back to this list.",
                },
                {
                  do: "Run a task that needs the database and a file.",
                  where: "Terminal",
                  commands: "python agent.py \"How many facilities of each type are in ward 3? Save the answer as a Markdown table to reports/ward3.md.\"",
                  expect: "Several steps: usually a run_sql against sqlite_master to discover the tables, a run_sql with GROUP BY, then write_file. workspace/reports/ward3.md now exists.",
                  point: "Nobody told the agent what the tables were called. The run_sql description told it how to find out. Tool descriptions are the most important prompt in an agent: rewrite that one badly and watch the agent guess table names instead.",
                },
              ],
            },
            {
              text: "Log every step (tool chosen, arguments, result, tokens) to a trace file.",
              script: [
                {
                  do: "Look at the raw trace from the last run.",
                  where: "Terminal",
                  commands: "Get-Content traces\\latest.jsonl -First 3\n\n# macOS or Linux:\n# head -n 3 traces/latest.jsonl",
                  expect: "One JSON object per line: a task event, then a model event with stop_reason, tool_calls and token counts, then a tool event with input, output, is_error and ms.",
                  point: "The Trace class in agent.py has been writing this all along. JSON Lines is the right format because each line is written as it happens — if the run crashes at step 6, steps 1 to 5 are still on disk.",
                },
                {
                  do: "Write show_trace.py, a reader that turns a trace into something a person can scan.",
                  where: "VS Code",
                  commands: "import json\nimport sys\n\ntotal_in = total_out = 0\nfor line in open(sys.argv[1], encoding=\"utf-8\"):\n    e = json.loads(line)\n    if e[\"type\"] == \"task\":\n        print(f\"TASK  {e['task']}\\n\")\n    elif e[\"type\"] == \"model\":\n        total_in += e[\"input_tokens\"]\n        total_out += e[\"output_tokens\"]\n        print(f\"[{e['step']}] model  {e['stop_reason']:<9} in={e['input_tokens']:<6} out={e['output_tokens']}\")\n        if e[\"text\"]:\n            print(f\"      says: {e['text'][:200]}\")\n    elif e[\"type\"] == \"tool\":\n        flag = \"  ERROR\" if e[\"is_error\"] else \"\"\n        print(f\"[{e['step']}] tool   {e['name']}({json.dumps(e['input'])[:150]}){flag}  {e['ms']} ms\")\n        print(f\"      got:  {e['output'][:200]}\")\n    elif e[\"type\"] == \"end\":\n        print(f\"\\nEND   {e['reason']} after {e['steps']} steps; \"\n              f\"tokens in={total_in} out={total_out}\")",
                  expect: "No output yet.",
                  point: "Traces are for machines to write and people to read. A small viewer is worth ten minutes, because you will read dozens of traces in Modules 4 and 11.",
                },
                {
                  do: "Read the ward 3 run.",
                  where: "Terminal",
                  commands: "python show_trace.py traces/latest.jsonl",
                  expect: "Each step as a model line and its tool lines, what the model said, what each tool returned, and an END line with total tokens. Input tokens climb on every step.",
                  point: "Input tokens climb because the whole conversation — every tool result included — is re-sent on every step. A ten-step agent pays for step 1 ten times. That is why TOKEN_BUDGET exists, and why tools should return 50 rows rather than 5,000.",
                },
              ],
            },
            {
              text: "Demonstrate one task that requires at least three tool calls to answer.",
              script: [
                {
                  do: "Run the demonstration task, saving the trace under its own name.",
                  where: "Terminal",
                  commands: "python agent.py \"Which ward had the highest total cost for repair requests closed in 2025? Give the total and the average cost per request, then save a two-line summary to reports/ward_summary.md.\" --trace traces/task1_ward.jsonl",
                  expect: "Four or more steps: schema discovery, an aggregate query that joins service_requests to facilities, often a calculator call for the average, and write_file. Some steps may call two tools at once.",
                  point: "No single tool can answer this. The agent has to find the tables, join them, do arithmetic, and write a file — in that order, each step depending on the last. That dependency chain is what makes it a real agent task.",
                },
                {
                  do: "Count the tool calls in the trace.",
                  where: "Terminal",
                  commands: "python show_trace.py traces/task1_ward.jsonl",
                  expect: "At least three tool lines before END. If a step shows two tool lines, the model made parallel calls — both results went back in a single message.",
                  point: "The trace is your evidence for the \"at least three tool calls\" requirement. It is also how you catch an agent that got the right answer by luck.",
                },
                {
                  do: "Check the answer yourself, without the agent: save verify.py and run it.",
                  where: "VS Code + terminal",
                  commands: "import sqlite3\n\ncon = sqlite3.connect(\"data/town.db\")\nquery = \"\"\"\nSELECT f.ward, ROUND(SUM(r.cost_usd), 2) AS total, COUNT(*) AS n,\n       ROUND(AVG(r.cost_usd), 2) AS avg_cost\nFROM service_requests r JOIN facilities f ON f.id = r.facility_id\nWHERE r.category = 'repair' AND r.closed LIKE '2025-%'\nGROUP BY f.ward ORDER BY total DESC\n\"\"\"\nfor row in con.execute(query):\n    print(row)\n\n# then:\n# python verify.py",
                  expect: "One row per ward, highest total first. Ward 1 should lead at about $39,670 over 22 requests, averaging about $1,803. Compare with what the agent said and wrote to workspace/reports/ward_summary.md.",
                  point: "An agent's answer is a claim, not a fact. If the numbers differ, the trace tells you why — usually a filter on opened instead of closed, or a missing category = 'repair'. Finding that is more valuable than a correct run.",
                },
                {
                  do: "Run two more tasks so you have three traces.",
                  where: "Terminal",
                  commands: "python agent.py \"Which single facility had the most vandalism requests, and how many of its requests are still open?\" --trace traces/task2_vandalism.jsonl\n\npython agent.py \"Compare the average number of days to close repair requests versus inspection requests. Which is faster, and by how many days?\" --trace traces/task3_days.jsonl",
                  expect: "Two more trace files. The second task needs date arithmetic in SQL (julianday) or with the calculator — see which one the agent chooses.",
                  point: "Different tasks exercise different tools. Write your own if you prefer; the requirement is three traces that you have read, not three that exist.",
                },
                {
                  do: "Provoke a failure: ask something the data cannot answer.",
                  where: "Terminal",
                  commands: "python agent.py \"Which city department responded fastest to hydrant repairs in 2025?\" --trace traces/failure.jsonl\npython show_trace.py traces/failure.jsonl",
                  expect: "There is no department column. A good run says so after inspecting the schema. A bad run invents an answer, loops through queries until the step limit, or quietly redefines the question. Any of these is material for your write-up.",
                  point: "Failures are the most instructive traces. Also try MAX_STEPS=3 on the ward task, or delete one sentence from the run_sql description, and watch the behaviour change.",
                },
                {
                  do: "Write FAILURE.md, add your AI-LOG.md row, and commit.",
                  where: "VS Code + terminal",
                  commands: "# FAILURE.md\n\n## The failure\nTask, trace file, and what the agent did (quote the trace lines).\n\n## Why it happened\nPrompt, tool description, tool output, or model judgement — and your evidence.\n\n## What would fix it\nOne concrete change. If you tried it, the before-and-after trace names.\n\n\n# then, in the terminal:\ngit add .\ngit status --short\ngit commit -m \"Lab 3 - hand-rolled agent with SQL, calculator, and file tools\"",
                  expect: "The staged list shows agent.py, tools.py, make_db.py, check_tools.py, show_trace.py, verify.py, requirements.txt, the traces/ folder, workspace/reports/, FAILURE.md and AI-LOG.md — and neither .env nor data/town.db.",
                  point: "\"It made something up\" is an observation. \"The run_sql result had no department column, and the model mapped facility type to department at step 3\" is a diagnosis. The diagnosis is what gets graded — and it is the skill Module 4 builds on.",
                },
              ],
            },
          ],
          deliverable: "Code, trace files for three tasks, and a short write-up of one failure you observed.",
        },
      },
      {
        id: "m04",
        number: 4,
        unit: 2,
        weeks: "4",
        title: "Robust agents",
        subtitle: "Errors, retries, timeouts, budgets, and designing tools agents can use",
        overview: [
          "Real tools fail: APIs time out, queries return nothing, arguments are malformed. This module is about making agents that degrade gracefully — and about designing tools whose names, descriptions, and error messages help the model recover.",
        ],
        topics: [
          "Tool error handling: returning actionable errors to the model",
          "Retries, backoff, timeouts, and idempotency",
          "Step, token, and dollar budgets; graceful termination",
          "Tool design: narrow tools vs. general tools; argument validation",
          "Observability basics: structured logs and traces",
        ],
        resources: ["building-effective-agents", "anthropic-tools"],
        lab: {
          title: "Lab 4 — Break it, then harden it",
          tasks: [
            "Inject faults into your Lab 3 tools (timeouts, bad data, empty results).",
            "Add retries, budgets, and improved error messages.",
            "Compare task success rates before and after on a fixed task list.",
          ],
          deliverable: "Before/after success table and the hardened code.",
        },
      },
      {
        id: "m05",
        number: 5,
        unit: 2,
        weeks: "5",
        title: "Retrieval and memory",
        subtitle: "Embeddings, vector search, RAG, and what an agent should remember",
        overview: [
          "Models don't know your organization's documents. Retrieval-augmented generation (RAG) finds relevant passages and puts them in context, and agentic retrieval lets the model decide when and what to search.",
          "Memory extends the same idea across time: conversation summaries, stored facts, and user preferences, with deliberate choices about what to keep and what to forget.",
        ],
        topics: [
          "Embeddings and similarity search",
          "Chunking strategies and metadata",
          "Vector stores (pgvector, Chroma, and hosted options)",
          "Classic RAG vs. retrieval as a tool",
          "Citations and grounding; detecting unsupported claims",
          "Short-term vs. long-term memory; privacy implications of memory",
        ],
        resources: ["rag", "pgvector", "chroma"],
        lab: {
          title: "Lab 5 — Document Q&A agent",
          tasks: [
            "Index a provided document collection (e.g., a policy handbook or public-records set).",
            "Add a search tool to your agent and require citations in answers.",
            "Measure answer accuracy and citation correctness on a 15-question set.",
          ],
          deliverable: "Code, index build script, and the evaluation results.",
        },
      },
    ],
  },

  // ---------------------------------------------------------------- Unit III
  {
    number: 3,
    title: "Integration",
    theme:
      "Connect agents to the systems where work actually happens, using the Model Context Protocol and conventional APIs, databases, and enterprise services.",
    modules: [
      {
        id: "m06",
        number: 6,
        unit: 3,
        weeks: "6",
        title: "The Model Context Protocol (MCP)",
        subtitle: "Exposing tools, resources, and prompts to any agent",
        overview: [
          "MCP is an open protocol for connecting AI applications to tools and data. Instead of writing a custom integration for each agent, you build an MCP server once and any compatible client — desktop assistants, IDEs, coding agents, or your own agent — can use it.",
        ],
        topics: [
          "MCP architecture: hosts, clients, servers",
          "Tools, resources, and prompts",
          "Transports: local (stdio) and remote (HTTP)",
          "Authentication and authorization for remote servers",
          "Testing a server with an inspector and with real clients",
        ],
        resources: ["mcp", "mcp-servers"],
        lab: {
          title: "Lab 6 — Build an MCP server",
          tasks: [
            "Build an MCP server that exposes a dataset or service (e.g., a course database, a public data API) as tools and resources.",
            "Connect it to at least two different MCP clients, one of which is your own agent.",
          ],
          deliverable: "Server code, setup instructions, and screenshots or traces from both clients.",
        },
      },
      {
        id: "m07",
        number: 7,
        unit: 3,
        weeks: "7–8",
        title: "Agents in enterprise systems",
        subtitle: "APIs, databases, identity, and the midterm checkpoint",
        overview: [
          "Enterprise agents operate inside ticketing systems, databases, document stores, and identity systems. This module covers the practical concerns — authentication, permissions, rate limits, auditing — and closes with the midterm project checkpoint in week 8.",
        ],
        topics: [
          "REST and GraphQL APIs as agent tools; OpenAPI-to-tool generation",
          "Read-only vs. write tools; confirmation steps for consequential actions",
          "Service accounts, OAuth, and least privilege",
          "Audit logs and traceability",
          "Rate limits, pagination, and large results",
        ],
        resources: ["owasp-llm", "mcp"],
        lab: {
          title: "Lab 7 — Integrate a system of record",
          tasks: [
            "Connect your agent to a realistic system (a provided ticketing API, database, or document store) with separate read and write tools.",
            "Require human confirmation before any write.",
          ],
          deliverable: "Folded into the midterm project.",
        },
        checkpoint:
          "Midterm project (week 8): a single agent with tools, retrieval, and at least one MCP or enterprise integration, with a trace-backed demo and a short design document.",
      },
    ],
  },

  // ----------------------------------------------------------------- Unit IV
  {
    number: 4,
    title: "Orchestration and Engineering Practice",
    theme:
      "Scale from one agent to coordinated systems, compare frameworks, and use agentic coding tools the way professional engineering teams do.",
    modules: [
      {
        id: "m08",
        number: 8,
        unit: 4,
        weeks: "9",
        title: "Multi-agent orchestration patterns",
        subtitle: "Planner/worker, supervisor, handoffs, and parallel fan-out",
        overview: [
          "Some tasks are better split across specialized agents or parallel workers. Multiple agents also add cost, latency, and new failure modes, so this module is as much about when not to use them as how.",
        ],
        topics: [
          "Prompt chaining, routing, parallelization",
          "Orchestrator–workers and supervisor patterns",
          "Handoffs and shared state",
          "Evaluator–optimizer loops (generate, critique, revise)",
          "Autonomous workflows: scheduled and event-driven agents",
          "Cost/latency trade-offs of multi-agent designs",
        ],
        resources: ["building-effective-agents", "reflexion", "generative-agents"],
        lab: {
          title: "Lab 8 — Research → draft → review pipeline",
          tasks: [
            "Build a pipeline with at least three roles (e.g., researcher, writer, reviewer) and a clear handoff format.",
            "Run workers in parallel where possible.",
            "Compare quality, cost, and time against a single-agent baseline.",
          ],
          deliverable: "Code, traces, and the comparison table.",
        },
      },
      {
        id: "m09",
        number: 9,
        unit: 4,
        weeks: "10",
        title: "Agent frameworks and SDKs",
        subtitle: "What frameworks give you, what they hide, and how to choose",
        overview: [
          "Having built agents by hand, students now port one to a framework and judge the trade-offs: less boilerplate and built-in features versus abstraction, lock-in, and debugging difficulty.",
        ],
        topics: [
          "Graph-based orchestration (LangGraph)",
          "Vendor agent SDKs (OpenAI Agents SDK, Claude Agent SDK)",
          "State, checkpoints, and resumability",
          "Guardrails and tracing built into frameworks",
          "Selection criteria: team skills, hosting, observability, portability",
        ],
        resources: ["langgraph", "openai-agents-sdk", "claude-agent-sdk"],
        lab: {
          title: "Lab 9 — Port and compare",
          tasks: [
            "Re-implement your Lab 8 pipeline in one framework or SDK.",
            "Write a one-page comparison: lines of code, debuggability, features gained, and anything lost.",
          ],
          deliverable: "Framework version plus the comparison memo.",
        },
      },
      {
        id: "m10",
        number: 10,
        unit: 4,
        weeks: "11",
        title: "AI-assisted software engineering",
        subtitle: "Agentic coding tools with professional discipline",
        overview: [
          "Coding agents such as Claude Code, GitHub Copilot, and Cursor can read a codebase, plan changes, edit files, and run tests. Used carelessly they produce code no one understands; used well they speed up a disciplined engineering process.",
          "This module teaches the disciplined version: write the spec first, keep changes small, review everything, insist on tests, and be able to explain every line.",
        ],
        topics: [
          "Coding agents vs. autocomplete; agent modes in IDEs and terminals",
          "Spec-driven development: requirements, plans, and acceptance criteria before code",
          "Project instructions and context files for coding agents",
          "Reviewing AI-generated code: correctness, security, maintainability",
          "Tests as the contract; test-first prompting",
          "Pull requests, CI, and documenting AI assistance",
        ],
        resources: ["claude-code", "copilot", "swe-bench"],
        lab: {
          title: "Lab 10 — Spec to pull request",
          tasks: [
            "Given an existing open-source-style repository, write a spec for a small feature.",
            "Implement it with an agentic coding tool, keeping a log of prompts and decisions.",
            "Add tests, pass CI, and open a pull request with a review checklist.",
            "Write a reflection: what the tool did well, what you had to fix, and what you verified.",
          ],
          deliverable: "Pull request link, test results, prompt log, and reflection.",
        },
      },
    ],
  },

  // ------------------------------------------------------------------ Unit V
  {
    number: 5,
    title: "Trustworthy Agents",
    theme:
      "Prove the system works, attack it before someone else does, and ship it responsibly as a team.",
    modules: [
      {
        id: "m11",
        number: 11,
        unit: 5,
        weeks: "12",
        title: "Evaluating agents",
        subtitle: "Test sets, LLM-as-judge, regression suites, and tracing",
        overview: [
          "Anecdotes are not evidence. This module builds the habit of measuring agent quality: curated task sets, automated checks, model-graded rubrics with known limitations, and regression tests that run whenever a prompt, tool, or model changes.",
        ],
        topics: [
          "What to measure: task success, groundedness, tool-use correctness, cost, latency",
          "Building eval sets from real tasks and failures",
          "Code-based graders vs. LLM-as-judge; judge bias and calibration",
          "Trajectory evaluation: judging the path, not just the answer",
          "Regression testing in CI; tracing and observability tools",
          "Benchmarks and their limits",
        ],
        resources: ["llm-judge", "swe-bench", "building-effective-agents"],
        lab: {
          title: "Lab 11 — An eval harness for your agent",
          tasks: [
            "Build a 30+ case eval set for your project agent, including known past failures.",
            "Implement automated graders (at least one code-based, one model-based).",
            "Make one improvement and report before/after metrics.",
          ],
          deliverable: "Harness code, eval set, and results report.",
        },
        gradNote:
          "Graduate students validate their LLM judge against human labels on a sample and report agreement.",
      },
      {
        id: "m12",
        number: 12,
        unit: 5,
        weeks: "13",
        title: "Security, safety, and responsible use",
        subtitle: "Prompt injection, permissions, privacy, and human oversight",
        overview: [
          "An agent that can act can be manipulated into acting wrongly. This module covers the threat model for agentic systems and the controls that reduce risk, followed by a structured red-team exercise against another team's agent.",
          "Responsible use also covers people and institutions: privacy (including FERPA and PII), bias, transparency with users, accessibility, and knowing when a task should not be automated at all.",
        ],
        topics: [
          "Direct and indirect prompt injection; data exfiltration through tools",
          "Least privilege, sandboxing, allow-lists, and confirmation gates",
          "Secrets handling and supply-chain risk in tools and MCP servers",
          "Privacy: PII, FERPA, data retention, and memory",
          "Bias, fairness, transparency, and accountability",
          "Risk frameworks: OWASP Top 10 for LLM Applications, NIST AI RMF",
        ],
        resources: ["owasp-llm", "nist-rmf", "indirect-injection"],
        lab: {
          title: "Lab 12 — Red team",
          tasks: [
            "Receive another team's agent and threat-model it.",
            "Attempt at least five attack categories (e.g., indirect injection via documents, tool misuse, data leakage, budget exhaustion).",
            "Report findings responsibly with severity and suggested mitigations; fix the findings reported against your own agent.",
          ],
          deliverable: "Red-team report and your team's remediation notes.",
        },
      },
      {
        id: "m13",
        number: 13,
        unit: 5,
        weeks: "14–15",
        title: "Final projects",
        subtitle: "Build, evaluate, demo, and document a team agentic system",
        overview: [
          "Teams deliver a working agentic system that solves a realistic problem. Every project must include tool use, an evaluation harness with reported results, a security review, and a responsible-use statement. Weeks 14 and 15 are build sprints, demos, and peer review.",
        ],
        topics: [
          "Scoping a project to what can be evaluated",
          "Demo design: showing traces, metrics, and failure handling",
          "Technical reports and responsible-use statements",
          "Peer review of design and code",
        ],
        resources: [],
        lab: null,
        checkpoint:
          "Final team project: working system, repository, evaluation results, security review, 10-minute demo, and written report. See the Projects page for example project ideas.",
        gradNote:
          "Graduate teams add a research component: a benchmark comparison, a new evaluation method, or a reproducibility study, written up in paper format.",
      },
    ],
  },
];
