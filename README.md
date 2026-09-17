# CS_AgenticAIFoundations — Agentic AI and Intelligent Systems

Course site for a proposed upper-level undergraduate / graduate course,
**Agentic AI and Intelligent Systems**: LLM foundations for engineers, tool
calling and the agent loop, retrieval and memory, the Model Context Protocol,
multi-agent orchestration, AI-assisted software engineering, evaluation, and
security and responsible use — ending in evaluated team projects.

Status: **draft course design for discussion**, not an official catalog listing.

Created by Mike Costarella, Costarella Innovations, LLC.

## Course structure

- **Unit I — LLMs as Software Components** (Modules 1–2, weeks 1–2)
- **Unit II — Agents, Tools, and Knowledge** (Modules 3–5, weeks 3–5)
- **Unit III — Integration** (Modules 6–7, weeks 6–8; midterm checkpoint week 8)
- **Unit IV — Orchestration and Engineering Practice** (Modules 8–10, weeks 9–11)
- **Unit V — Trustworthy Agents** (Modules 11–13, weeks 12–15; final projects)

## Editing content

The site is driven by one typed registry:

| File | Drives |
|---|---|
| `react-app/src/data/course.ts` | Thesis, outcomes, format, grading, integrity policy |
| `react-app/src/data/units.ts` | Units and modules: topics, labs, checkpoints, graduate notes |
| `react-app/src/data/projects.ts` | Example final projects and project requirements |
| `react-app/src/data/resources.ts` | Papers, docs, and tools (modules cite them by id) |
| `react-app/src/components/ToolsPage.tsx` | Tools & Access page |

## Develop & build

```
cd C:\projects\CS_AgenticAIFoundations\react-app
npm install
npm run dev
npm run build      # tsc -b && vite build
```

Pushing to `main` triggers the GitHub Pages deploy workflow (set Settings →
Pages → Source to "GitHub Actions" once). Served at
https://mikecostarella.github.io/CS_AgenticAIFoundations/

## Fleet conventions

Hamburger accordion main menu (View / Units / Links), build timestamp in the
masthead, menu foot, and footer, and the "© Costarella Innovations, LLC"
footer. Base path in `vite.config.ts` must equal `/CS_AgenticAIFoundations/`.
