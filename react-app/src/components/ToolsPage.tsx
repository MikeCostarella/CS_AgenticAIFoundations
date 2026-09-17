import { RESOURCE_BY_ID } from "../data/resources";

const TOOLS = [
  {
    name: "Chat assistants (paid tier)",
    examples: "ChatGPT Plus, Claude Pro",
    why: "Research, design discussion, and agentic features that free tiers limit or omit.",
  },
  {
    name: "Model API access",
    examples: "Anthropic, OpenAI, or equivalent API credits",
    why: "Every lab from week 1 calls models from code. Agent loops make many calls per task, so a per-student credit budget is needed in addition to chat subscriptions.",
  },
  {
    name: "Agentic coding tools",
    examples: "GitHub Copilot, Claude Code, Cursor",
    why: "Module 10 and the final project. Copilot is available to verified students through GitHub Education.",
  },
  {
    name: "Development environment",
    examples: "Python 3.12+, Node.js LTS, Git/GitHub, VS Code, Docker (optional)",
    why: "Free; available on lab machines or student laptops.",
  },
  {
    name: "Data services",
    examples: "PostgreSQL + pgvector or Chroma; SQLite",
    why: "Retrieval and integration labs. All free and open source.",
  },
];

export default function ToolsPage() {
  const gh = RESOURCE_BY_ID["github-education"];
  return (
    <article className="page">
      <h1>Tools &amp; Access</h1>
      <p className="lede">
        What students and faculty need to build, test, debug, and evaluate agentic systems all
        semester — and why university-supported access matters.
      </p>

      <section>
        <h2>Why free tiers are not enough</h2>
        <p>
          Agentic development is iterative. A single debugging session can run an agent loop dozens
          of times, and each run makes many model calls. Free tiers hit rate and usage limits in the
          middle of exactly that work, which turns labs into waiting and makes fair grading hard.
          Reliable, institution-supported access puts every student on the same footing regardless
          of what they can personally afford.
        </p>
      </section>

      <section>
        <h2>What the course uses</h2>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Need</th>
              <th>Examples</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td>{t.examples}</td>
                <td>{t.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Options for providing access</h2>
        <ul className="topics">
          <li>Institutional or education licenses for chat and coding assistants</li>
          <li>Pooled API credits with per-student keys and spending caps, managed by the department</li>
          <li>
            Student programs such as{" "}
            <a href={gh.url} target="_blank" rel="noreferrer">
              {gh.label}
            </a>{" "}
            for coding assistance
          </li>
          <li>Vendor education and research credit programs</li>
          <li>Open-weight models on department hardware as a fallback for high-volume experiments</li>
        </ul>
      </section>

      <section>
        <h2>Cost controls built into the labs</h2>
        <ul className="topics">
          <li>Every lab logs tokens and cost per run from week 1</li>
          <li>Agents enforce step and dollar budgets (Module 4)</li>
          <li>Small, inexpensive models are the default; larger models are used only when measured to help</li>
          <li>Eval runs are sized and cached to avoid repeated spending</li>
        </ul>
      </section>
    </article>
  );
}
