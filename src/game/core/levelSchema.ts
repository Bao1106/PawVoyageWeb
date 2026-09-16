import { PET_IDS, type Cell, type LevelData, type PetId } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Level JSON validation at load time.
//
// JSON.parse returns `any`, and `as LevelData` is only a PROMISE to the compiler
// — it checks nothing at runtime. This file is the single place where outside
// data becomes trusted data. A malformed level fails loudly AT LOAD, instead of
// wedging halfway through a run.
// ─────────────────────────────────────────────────────────────────────────────

function fail(msg: string): never {
  throw new Error(`[level] ${msg}`)
}

const isPetId = (v: unknown): v is PetId => PET_IDS.includes(v as PetId)

export function parseLevel(raw: unknown): LevelData {
  if (raw === null || typeof raw !== 'object') fail('not an object — file missing or failed to load?')
  const o = raw as Record<string, unknown>

  if (typeof o.index !== 'number') fail('missing index')
  if (!Array.isArray(o.rows) || o.rows.length === 0) fail('missing rows')
  if (!o.rows.every(r => typeof r === 'string')) fail('rows must be an array of strings')
  if (typeof o.bufferSlots !== 'number' || o.bufferSlots < 1) fail('invalid bufferSlots')
  if (!Array.isArray(o.pets) || !Array.isArray(o.boats)) fail('missing pets or boats')
  if (o.pets.length === 0) fail('level has no pets')
  if (o.boats.length === 0) fail('level has no boats')

  const rows = o.rows as string[]
  const height = rows.length
  const width = Math.max(...rows.map(r => r.length))

  const pets = o.pets as { cell: Cell; pet: unknown }[]
  const seen = new Set<number>()

  for (const p of pets) {
    if (!isPetId(p.pet)) fail(`unknown species: ${String(p.pet)}`)
    const c = p.cell
    if (!c || typeof c.x !== 'number' || typeof c.y !== 'number') fail(`pet ${p.pet} has no cell`)
    if (c.x < 0 || c.x >= width || c.y < 0 || c.y >= height)
      fail(`pet ${p.pet} at (${c.x},${c.y}) is outside the ${width}x${height} grid`)
    // rows[height-1-y] — same convention as Grid, see the comment there
    if (rows[height - 1 - c.y][c.x] !== 'X')
      fail(`pet ${p.pet} stands on a non-walkable cell at (${c.x},${c.y})`)

    const key = c.y * width + c.x
    if (seen.has(key)) fail(`two pets share cell (${c.x},${c.y})`)
    seen.add(key)
  }

  const boats = o.boats as { pet: unknown; seats: unknown }[]
  for (const b of boats) {
    if (!isPetId(b.pet)) fail(`boat accepts unknown species: ${String(b.pet)}`)
    if (typeof b.seats !== 'number' || b.seats < 2 || b.seats % 2 !== 0)
      fail(`boat ${b.pet} has ${String(b.seats)} seats — must be an even number >= 2`)
  }

  // ── WHOLE-GAME INVARIANT: total seats must equal total pets, per species.
  // In Unity this is guaranteed by DecomposeIntoBoats (seats are always even, so
  // the remainder always lands exactly on 0). The web build does not generate
  // levels, so it has to VERIFY the invariant instead.
  //
  // This is the most valuable check in the file: it catches exporter bugs,
  // hand-edited JSON and half-copied files — three things that would otherwise
  // show up as "this level can't be won" much later.
  const seats = new Map<PetId, number>()
  const count = new Map<PetId, number>()
  for (const b of boats) seats.set(b.pet as PetId, (seats.get(b.pet as PetId) ?? 0) + (b.seats as number))
  for (const p of pets)  count.set(p.pet as PetId, (count.get(p.pet as PetId) ?? 0) + 1)

  for (const [pet, n] of count)
    if (seats.get(pet) !== n)
      fail(`${pet}: ${n} pets but ${seats.get(pet) ?? 0} seats — level is unsolvable`)

  for (const pet of seats.keys())
    if (!count.has(pet)) fail(`there is a boat for ${pet} but no ${pet} on the board`)

  return raw as LevelData
}
