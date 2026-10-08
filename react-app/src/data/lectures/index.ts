// Lecture notes: one file per module, gathered here. Each file holds one
// section per lecture topic, joined to the topic by its permanent id.
//
// To add notes for a module: create mNN.ts exporting a LectureNotesDef, add it
// to ALL_NOTES below, and write sections in any order (the page renders them
// in the module's topic order). Topics without a section show "notes coming".

import { TERM_BY_ID, TERM_PATTERN } from "../glossary";
import { MODULE_BY_ID, MODULES } from "../modules";
import type { LectureNotesDef, ModuleDef, NoteBlock } from "../types";
import { M02_NOTES } from "./m02";

const ALL_NOTES: LectureNotesDef[] = [M02_NOTES];

export const NOTES_BY_MODULE: Record<string, LectureNotesDef> = Object.fromEntries(
  ALL_NOTES.map((n) => [n.moduleId, n]),
);

function hasSection(moduleId: string, topicId: string): boolean {
  return !!NOTES_BY_MODULE[moduleId]?.sections.some((s) => s.topic === topicId);
}

/** The notes page for a module. */
export function notesPageHref(moduleId: string): string {
  return `#/m/${moduleId}/notes`;
}

/** Link to one topic's notes, or null when that topic has no notes yet. */
export function notesHref(moduleId: string, topicId: string): string | null {
  return hasSection(moduleId, topicId) ? `${notesPageHref(moduleId)}?s=topic-${topicId}` : null;
}

/** How many of a module's topics have notes written. */
export function notesCoverage(mod: ModuleDef): { written: number; total: number } {
  return {
    written: mod.topics.filter((t) => hasSection(mod.id, t.id)).length,
    total: mod.topics.length,
  };
}

/** Course-wide totals, e.g. for a progress line. */
export function courseNotesCoverage(): { written: number; total: number } {
  return MODULES.reduce(
    (acc, m) => {
      const c = notesCoverage(m);
      return { written: acc.written + c.written, total: acc.total + c.total };
    },
    { written: 0, total: 0 },
  );
}

/** Strips the inline markup NoteText understands: {{term}}, `code`, **bold**, *italic*, [[resource-id]]. */
export function plainText(s: string): string {
  return s
    .replace(new RegExp(TERM_PATTERN.source, "g"), (_w, id: string, shown?: string) => shown ?? TERM_BY_ID[id]?.term ?? id).replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*\s][^*]*)\*/g, "$1").replace(/\[\[([a-z0-9-]+)\]\]/g, "");
}

/** A block's searchable text. Code is left out: it matches too many queries. */
export function noteBlockText(b: NoteBlock): string {
  if (typeof b === "string") return plainText(b);
  if ("list" in b) return b.list.map(plainText).join(" ");
  if ("table" in b) return [b.table.caption ?? "", ...b.table.head, ...b.table.rows.flat()].map(plainText).join(" ");
  if ("callout" in b) return plainText([b.title ?? "", b.callout].join(" "));
  return b.title ?? "";
}

/** Every raw string in a block (prose, list items, table cells, callouts), for scanning markup. */
function blockStrings(b: NoteBlock): string[] {
  if (typeof b === "string") return [b];
  if ("list" in b) return b.list;
  if ("table" in b) return [b.table.caption ?? "", ...b.table.head, ...b.table.rows.flat()];
  if ("callout" in b) return [b.title ?? "", b.callout];
  return [b.note ?? ""];
}

/** Where each glossary term is marked in the notes: term id → [{ moduleId, topicId }]. */
export function termUsage(): Record<string, { moduleId: string; topicId: string }[]> {
  const out: Record<string, { moduleId: string; topicId: string }[]> = {};
  const re = new RegExp(TERM_PATTERN.source, "g");
  for (const n of ALL_NOTES) {
    for (const s of n.sections) {
      const text = [...s.blocks.flatMap(blockStrings), s.takeaway ?? "", ...(s.check ?? []).flatMap((c) => [c.q, c.a])].join(" ");
      const ids = new Set([...text.matchAll(re)].map((m) => m[1]));
      for (const id of ids) (out[id] ??= []).push({ moduleId: n.moduleId, topicId: s.topic });
    }
  }
  return out;
}

/** Integrity checks the type system cannot express (shown on notes pages in dev builds). */
export function lectureProblems(): string[] {
  const problems: string[] = [];
  for (const m of MODULES) {
    const seen = new Set<string>();
    for (const t of m.topics) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) problems.push(`Module ${m.number}: topic id "${t.id}" is not lowercase-hyphenated`);
      if (seen.has(t.id)) problems.push(`Module ${m.number}: duplicate topic id "${t.id}"`);
      seen.add(t.id);
    }
  }
  const seenModules = new Set<string>();
  for (const n of ALL_NOTES) {
    const mod = MODULE_BY_ID[n.moduleId];
    if (!mod) {
      problems.push(`Lecture notes for unknown module "${n.moduleId}"`);
      continue;
    }
    if (seenModules.has(n.moduleId)) problems.push(`Two lecture-notes files for ${n.moduleId}`);
    seenModules.add(n.moduleId);
    const seenSections = new Set<string>();
    for (const s of n.sections) {
      if (!mod.topics.some((t) => t.id === s.topic)) problems.push(`${n.moduleId} notes: section for unknown topic "${s.topic}"`);
      if (seenSections.has(s.topic)) problems.push(`${n.moduleId} notes: two sections for topic "${s.topic}"`);
      seenSections.add(s.topic);
    }
  }
  for (const [id, uses] of Object.entries(termUsage())) {
    if (!TERM_BY_ID[id]) {
      const where = uses.map((u) => `${u.moduleId}/${u.topicId}`).join(", ");
      problems.push(`Unknown glossary term {{${id}}} in ${where}`);
    }
  }
  return problems;
}
