// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the core layer. No runtime code here — only data shapes, so
// this file costs 0 bytes in the bundle (`import type` is erased at build time).
// ≈ the enums/structs under Constant/ in the Unity project.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Union type instead of an enum. `as const` gives us BOTH the runtime list (for
 * validation and icon preloading) AND the compile-time type — one declaration,
 * two uses.
 *
 * Order does NOT matter here, unlike DifficultyCurve.SpeciesPool in Unity where
 * order IS data and touching it rebakes every level in the game. The web build
 * only reads exported JSON, so this pool is purely "species that may appear".
 */
export const PET_IDS = [
  'cat', 'dog', 'chick', 'cow', 'pig', 'monkey', 'lion', 'tiger', 'elephant'
] as const

export type PetId = typeof PET_IDS[number]

/** Pier grid coordinate. x = column, y = 0 is the SEA-FRONT row, growing away from the sea. */
export interface Cell {
  x: number
  y: number
}

/** Exactly what WebLevelExportTool.cs writes out on the Unity side. No unused fields. */
export interface LevelData {
  index: number
  /** Authored top-down: rows[0] is the row FURTHEST from the sea. 'X' walkable, '.' water, '#' obstacle. */
  rows: string[]
  bufferSlots: number
  pets: { cell: Cell; pet: PetId }[]
  boats: { pet: PetId; seats: number }[]
}

/**
 * One thing that has to happen on screen. Board returns an ordered array of
 * Effects; the scene replays them with tweens. This is the boundary between
 * RULES and PIXELS.
 *
 * This is a discriminated union — C# has no direct equivalent. The `t` field is
 * the discriminant: inside `case 'walk':` the compiler knows `fx.path` exists
 * and `fx.boat` does not, with no casting.
 */
export type Effect =
  | { t: 'walk';   pet: number; path: Cell[] }
  | { t: 'board';  pet: number; boat: number; seat: number }
  | { t: 'park';   pet: number; slot: number }
  | { t: 'reject'; pet: number; reason: 'blocked' | 'full' }
  | { t: 'depart'; boat: number }
  | { t: 'dock';   boat: number }
  | { t: 'win' }
  | { t: 'lose' }
