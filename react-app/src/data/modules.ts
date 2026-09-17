// The course registry — the single source of truth that drives the whole site.

import type { ModuleDef, UnitDef } from "./types";
import { UNIT_DEFS } from "./units";

export const UNITS: UnitDef[] = UNIT_DEFS;

export const MODULES: ModuleDef[] = UNITS.flatMap((u) => u.modules);

export const MODULE_BY_ID: Record<string, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
);

export const MODULE_COUNT = MODULES.length;
export const UNIT_COUNT = UNITS.length;
export const LAB_COUNT = MODULES.filter((m) => m.lab).length;

export function unitOf(m: ModuleDef): UnitDef {
  return UNITS.find((u) => u.number === m.unit)!;
}

export function prevNext(m: ModuleDef): { prev: ModuleDef | null; next: ModuleDef | null } {
  const i = MODULES.findIndex((x) => x.id === m.id);
  return {
    prev: i > 0 ? MODULES[i - 1] : null,
    next: i < MODULES.length - 1 ? MODULES[i + 1] : null,
  };
}
