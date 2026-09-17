import { useEffect, useState } from "react";
import HomePage from "./components/HomePage";
import SyllabusPage from "./components/SyllabusPage";
import ModulePage from "./components/ModulePage";
import ProjectsPage from "./components/ProjectsPage";
import ToolsPage from "./components/ToolsPage";
import ResourcesPage from "./components/ResourcesPage";
import BuildStamp from "./components/BuildStamp";
import MainMenu from "./components/MainMenu";
import { MODULE_BY_ID, UNITS } from "./data/modules";
import { COURSE } from "./data/course";

// Hash-based routing — no router dependency, and it works on GitHub Pages
// project sites without any 404 rewriting.
type Route =
  | { page: "home" }
  | { page: "syllabus" }
  | { page: "projects" }
  | { page: "tools" }
  | { page: "resources" }
  | { page: "module"; id: string };

function parseHash(): Route {
  const h = window.location.hash;
  const m = /^#\/m\/([a-z0-9]+)$/.exec(h);
  if (m && MODULE_BY_ID[m[1]]) return { page: "module", id: m[1] };
  if (h === "#/syllabus") return { page: "syllabus" };
  if (h === "#/projects") return { page: "projects" };
  if (h === "#/tools") return { page: "tools" };
  if (h === "#/resources") return { page: "resources" };
  return { page: "home" };
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

const TOP_LINKS: { href: string; label: string; page: Route["page"] }[] = [
  { href: "#/", label: "Home", page: "home" },
  { href: "#/syllabus", label: "Syllabus", page: "syllabus" },
  { href: "#/projects", label: "Projects", page: "projects" },
  { href: "#/tools", label: "Tools & Access", page: "tools" },
  { href: "#/resources", label: "Resources", page: "resources" },
];

export default function App() {
  const route = useRoute();
  const activeModId = route.page === "module" ? route.id : null;

  return (
    <div className="app">
      <header className="masthead">
        <MainMenu />
        <a className="brand" href="#/">
          <h1>&#129302; {COURSE.siteTitle}</h1>
          <div className="sub">{COURSE.heading} · course design</div>
        </a>
        <nav className="top-links">
          {TOP_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={route.page === l.page ? "on" : ""}>
              {l.label}
            </a>
          ))}
        </nav>
        <BuildStamp />
      </header>

      <div className="body">
        <aside className="sidebar">
          {UNITS.map((u) => (
            <div className="nav-unit" key={u.number}>
              <div className="nav-unit-title">Unit {u.number} · {u.title}</div>
              {u.modules.map((m) => (
                <a
                  key={m.id}
                  href={`#/m/${m.id}`}
                  className={"nav-mod" + (m.id === activeModId ? " on" : "")}
                >
                  <span className="nm-no">{m.number}</span> {m.title}
                </a>
              ))}
            </div>
          ))}
        </aside>

        <main className="content">
          {route.page === "home" && <HomePage />}
          {route.page === "syllabus" && <SyllabusPage />}
          {route.page === "projects" && <ProjectsPage />}
          {route.page === "tools" && <ToolsPage />}
          {route.page === "resources" && <ResourcesPage />}
          {route.page === "module" && <ModulePage mod={MODULE_BY_ID[route.id]} />}
        </main>
      </div>

      <footer className="footer">
        <span>
          © Costarella Innovations, LLC · Course design by {COURSE.author} ·{" "}
          <a className="contact-link" href={`mailto:${COURSE.contactEmail}`}>
            {COURSE.contactEmail}
          </a>
        </span>
        <BuildStamp />
      </footer>
    </div>
  );
}
