// The student's course folder (e.g. C:\Users\Mike\agentic-ai), remembered in
// this browser so "VS Code" step labels can open the right lab folder.
//
// Stored in localStorage: it survives closing the browser, stays on this
// computer, and is per browser and per site address. Every access is wrapped,
// because storage can be blocked (private windows, strict privacy settings).

import { useEffect, useState } from "react";

const KEY = "agentic-ai.courseFolder";
const EVENT = "agentic-ai:course-folder";

export function readCourseFolder(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveCourseFolder(path: string | null): boolean {
  try {
    if (path) window.localStorage.setItem(KEY, path);
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

/**
 * Turns whatever the student pasted into a clean absolute path, or null.
 * Accepts the bare path, a quoted path, or the whole PowerShell prompt
 * ("PS C:\Users\Mike\agentic-ai>").
 */
export function normalizeFolder(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^PS\s+/i, "").replace(/>\s*$/, "").trim();
  s = s.replace(/^["']|["']$/g, "").trim();
  s = s.replace(/[\\/]+$/, "");
  if (/^[A-Za-z]:[\\/]/.test(s)) return s.replace(/\//g, "\\"); // Windows
  if (s.startsWith("/")) return s; // macOS / Linux
  return null;
}

/** Joins a child folder onto the course folder using that path's separator. */
export function joinFolder(base: string, child?: string): string {
  if (!child) return base;
  const sep = base.includes("\\") ? "\\" : "/";
  return `${base}${sep}${child}`;
}

/** vscode://file/C:/Users/Mike/agentic-ai/agentic-lab01 — opens the folder in VS Code. */
export function vscodeUrl(path: string): string {
  const forward = path.replace(/\\/g, "/");
  const withLead = forward.startsWith("/") ? forward : `/${forward}`;
  return `vscode://file${encodeURI(withLead)}`;
}

/** Lab folder name for a module number: 3 → "agentic-lab03". */
export function labFolderName(moduleNumber: number): string {
  return `agentic-lab${String(moduleNumber).padStart(2, "0")}`;
}

/** The saved course folder, kept in sync across components and browser tabs. */
export function useCourseFolder(): string | null {
  const [folder, setFolder] = useState<string | null>(() => readCourseFolder());
  useEffect(() => {
    const sync = () => setFolder(readCourseFolder());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return folder;
}
