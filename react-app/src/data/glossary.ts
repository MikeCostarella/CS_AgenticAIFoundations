// The course glossary: one plain-English definition per term.
//
// Lecture notes mark a term with {{term-id}} (shows the term's name) or
// {{term-id|the words to show}}. The marked words get a dotted underline; hover,
// focus, or tap shows the definition, with links to the Glossary page and to
// the term's reading. Mark the first use of a term in each notes section, not
// every use.
//
// Definitions may use `code` and **bold**. Keep them to two or three sentences.

export interface GlossaryTerm {
  /** Stable id used in {{id}} markup and in #/glossary?s=term-<id>. */
  id: string;
  /** The term as it is listed and shown by default. */
  term: string;
  /** Other names people use for the same thing. */
  aka?: string[];
  def: string;
  /** A resource id (data/resources.ts) for "Learn more". */
  more?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "agent",
    term: "Agent",
    def: "A program in which a language model decides its own next step: which tool to call, with what arguments, in a loop, until the task is done or a limit is reached. The top rung of the decision ladder.",
    more: "building-effective-agents",
  },
  {
    id: "decision-ladder",
    term: "Decision ladder",
    def: "This course's rule for how much AI a problem needs. Plain code, rules, and workflow tools at the bottom; a single model call in the middle; an agent at the top. Climb only as high as the problem forces you.",
  },
  {
    id: "few-shot",
    term: "Few-shot example",
    aka: ["few-shot prompting", "shot"],
    def: "A worked input-and-output example placed in the prompt so the model can follow the pattern. A prompt with instructions and no examples is called zero-shot.",
  },
  {
    id: "json-mode",
    term: "JSON mode",
    def: "An older API setting that guarantees the model's reply parses as JSON, but not that it has the fields or types you need. Schema-constrained output replaces it.",
    more: "openai-api",
  },
  {
    id: "json-schema",
    term: "JSON Schema",
    def: "A standard way to describe what a piece of JSON must look like: which fields exist, their types, which are required, and what values are allowed. Model APIs use it to describe tool arguments and structured output.",
    more: "json-schema",
  },
  {
    id: "pydantic",
    term: "Pydantic",
    def: "A Python library for describing the shape of data as a class. It checks real data against the class, raising a clear field-by-field error when something does not fit, and can export the class as a JSON Schema.",
    more: "pydantic",
  },
  {
    id: "pydantic-class",
    term: "Pydantic class",
    aka: ["Pydantic model", "BaseModel"],
    def: "A Python class that inherits from Pydantic's `BaseModel`, with one typed attribute per field. In Lab 2, `Event` and `Extraction` in `schema.py` are Pydantic classes: the contract for what the model must return.",
    more: "pydantic",
  },
  {
    id: "regression-test",
    term: "Regression test",
    def: "A test that re-runs cases that used to pass, so a change that breaks one is caught. For prompts, a fixed set of inputs with expected outputs, such as Lab 2's `tests/cases.jsonl`, run after every prompt, schema, or model change.",
  },
  {
    id: "sdk",
    term: "SDK",
    aka: ["software development kit", "client library"],
    def: "Software development kit: a library a vendor publishes so your code can call its service without writing raw web requests. In this course, the `anthropic` Python package you install with `pip` is the Claude SDK.",
    more: "anthropic-api",
  },
  {
    id: "structured-output",
    term: "Schema-constrained output",
    aka: ["structured outputs", "constrained decoding"],
    def: "An API mode in which the provider forces the model's reply to match a JSON Schema you supply, so it always parses and has the right fields. It guarantees the shape of the answer, not that the values are correct.",
    more: "anthropic-api",
  },
  {
    id: "system-prompt",
    term: "System prompt",
    def: "Instructions sent separately from the user's message that set the model's role and rules for the whole conversation. In Lab 2 it holds the extraction contract; the newsletter itself goes in the user message.",
    more: "anthropic-api",
  },
  {
    id: "temperature",
    term: "Temperature",
    def: "A setting that controls how much randomness the model uses when choosing each next token. At 0 it nearly always picks the most likely token, which suits extraction; it does not guarantee identical output on every run.",
  },
  {
    id: "token",
    term: "Token",
    def: "The unit a model reads and writes in: a word or a piece of a word, roughly three-quarters of an English word on average. API usage, limits, and cost are all counted in input and output tokens.",
  },
  {
    id: "tool-call",
    term: "Tool call",
    aka: ["tool use", "function calling"],
    def: "The model's way of asking your code to run a function: instead of plain text, it returns a tool name and JSON arguments. Your code runs the function and sends the result back. Module 3 builds the agent loop on this.",
    more: "anthropic-tools",
  },
  {
    id: "zod",
    term: "Zod",
    def: "A TypeScript library that does what Pydantic does for Python: describe a data shape once, check real data against it, and export it as JSON Schema.",
    more: "zod",
  },
];

export const TERM_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((t) => [t.id, t]));

/** Matches {{term-id}} and {{term-id|shown words}}. */
export const TERM_PATTERN = /\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/;

/** Glossary order: alphabetical by term. */
export const GLOSSARY_SORTED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
