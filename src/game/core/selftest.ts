import { Grid } from './grid'

// ─────────────────────────────────────────────────────────────────────────────
// Self-check for the core layer. No framework, no config — just console.assert.
// Runs automatically under `npm run dev`, stripped entirely from production.
//
// DAY 1: Grid only (row parsing + BFS).
// DAY 2: add Board coverage — one winning run, and one deadlock.
// ─────────────────────────────────────────────────────────────────────────────

let failed = 0

function check(ok: boolean, label: string): void {
  if (!ok) { failed++; console.error(`[core] FAIL — ${label}`) }
}

export function selfTest(): void {
  failed = 0
  testRowOrder()
  testBlockedPath()
  testHoleIsNotAnExit()

  if (failed === 0) console.log('%c[core] selftest OK', 'color:#4ade80;font-weight:bold')
  else console.error(`%c[core] selftest: ${failed} failure(s)`, 'color:#f87171;font-weight:bold')
}

/**
 * Row convention: rows are authored top-down but y = 0 is the SEA-FRONT row.
 * Getting this wrong flips the board with NO crash — so it needs a test.
 */
function testRowOrder(): void {
  //  rows[0] = 'XX..'  ← furthest from sea  → y = 1
  //  rows[1] = '..XX'  ← sea-front          → y = 0
  const g = new Grid(['XX..', '..XX'])

  check(g.width === 4 && g.height === 2, 'grid dimensions')
  check(g.isOpen(2, 0) && g.isOpen(3, 0), 'sea-front row (y=0) comes from rows[1]')
  check(g.isOpen(0, 1) && g.isOpen(1, 1), 'back row (y=1) comes from rows[0]')
  check(!g.isOpen(0, 0), 'water is not walkable')

  // Bounds check: x = -1 must NOT alias onto cell (width-1, y-1)
  check(!g.isOpen(-1, 1), 'negative x is out of bounds, not a wrap onto the previous row')
}

/** A walled-in pet gets null back — that is the "shake" feedback in game. */
function testBlockedPath(): void {
  const g = new Grid(['XXX', 'XXX'])
  const start = g.key(1, 1)     // middle of the back row

  check(g.findPathToExit(new Set(), start) !== null, 'empty board always has a way out')

  // Seal all three sea-front cells -> no route left
  const walled = new Set([g.key(0, 0), g.key(1, 0), g.key(2, 0)])
  check(g.findPathToExit(walled, start) === null, 'fully walled in means no path')

  // Leave one gap -> must find it, and the path must INCLUDE the start cell
  const gap = new Set([g.key(1, 0), g.key(2, 0)])
  const path = g.findPathToExit(gap, start)
  check(path !== null, 'one gap is still a way out')
  check(path?.[0].x === 1 && path?.[0].y === 1, 'path starts on the pet own cell')
  check(path?.[path.length - 1].y === 0, 'path ends on the sea-front row')
}

/**
 * An exit is `y === 0`, NOT "the cell to the south is not walkable".
 * Unity's old rule used the second test and it deleted the blocking mechanic:
 * on an I-shaped pier every back-row cell has a hole to its south, so all of
 * them passed as exits, and the puzzle collapsed into "tap in any order".
 */
function testHoleIsNotAnExit(): void {
  //  rows[0] = 'XXX'   ← y = 1, back row
  //  rows[1] = 'X.X'   ← y = 0, sea-front row with the MIDDLE cell missing
  const g = new Grid(['XXX', 'X.X'])

  // A pet in the middle of the back row has WATER to its south, but that is not
  // an exit. It has to detour via (0,1) or (2,1) before it can reach y = 0.
  const path = g.findPathToExit(new Set(), g.key(1, 1))
  check(path !== null, 'a pet above a hole must still find a way around')
  check((path?.length ?? 0) >= 3, 'that route must detour, not drop straight into the water')
}
