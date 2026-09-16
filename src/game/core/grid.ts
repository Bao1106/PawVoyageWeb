import type { Cell } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Pier grid + pathfinding.  ≈ PierShapeSO + PierPathfinder from Unity, merged.
// MUST NOT import phaser. Check with: npm run check-core
// ─────────────────────────────────────────────────────────────────────────────

/** South, West, East, North — same order as PierPathfinder.k_Directions in Unity. */
const DIRS: readonly Cell[] = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 }
]

export class Grid {
  readonly width: number
  readonly height: number

  /** Walkable cells ('X'). Water '.' and obstacles '#' are simply absent from this set. */
  private readonly open = new Set<number>()

  constructor(rows: string[]) {
    this.height = rows.length
    this.width = Math.max(...rows.map(r => r.length))

    for (let y = 0; y < this.height; y++) {
      // CONVENTION THAT MUST BE PRESERVED: rows are authored top-down (first line
      // in the file = furthest from the sea) but y = 0 is the SEA-FRONT row. So
      // cell (x, y) lives at rows[height-1-y][x]. Ported from PierShapeSO.GetChar.
      // Flip it wrong and the whole board is upside down — with NO crash.
      const row = rows[this.height - 1 - y]
      for (let x = 0; x < this.width; x++)
        if (row[x] === 'X') this.open.add(this.key(x, y))
    }
  }

  key(x: number, y: number): number { return y * this.width + x }

  cell(k: number): Cell { return { x: k % this.width, y: (k / this.width) | 0 } }

  isOpen(x: number, y: number): boolean {
    // The bounds check is MANDATORY, not tidiness: without it x = -1 maps onto the
    // key of cell (width-1, y-1) — a REAL cell — and BFS quietly walks through walls.
    return x >= 0 && x < this.width
        && y >= 0 && y < this.height
        && this.open.has(this.key(x, y))
  }

  /** Every walkable cell, as keys. Used to draw the deck. */
  get openKeys(): number[] { return [...this.open] }

  /**
   * Shortest path (start cell included) to the sea edge through unoccupied cells.
   * null = walled in.
   *
   * An exit cell is `cell.y === 0`, full stop — NOT "the cell to the south is not
   * walkable". Unity's old rule used the second test and it deleted the blocking
   * mechanic entirely: on a carved shape every cell beside a hole counted as an
   * exit, pets walked straight across open water to the jetty, and the puzzle
   * collapsed into "tap in any order".
   * Read the long comment in PierPathfinder.cs before touching this.
   */
  findPathToExit(blocked: ReadonlySet<number>, startKey: number): Cell[] | null {
    if (!this.open.has(startKey)) return null

    const cameFrom = new Map<number, number>([[startKey, startKey]])
    const queue: number[] = [startKey]
    let head = 0   // index instead of shift(): shift() is O(n) and this runs on every tap

    while (head < queue.length) {
      const cur = queue[head++]
      const c = this.cell(cur)
      if (c.y === 0) return this.reconstruct(cameFrom, startKey, cur)

      for (const d of DIRS) {
        const nx = c.x + d.x
        const ny = c.y + d.y
        if (!this.isOpen(nx, ny)) continue
        const nk = this.key(nx, ny)
        if (cameFrom.has(nk) || blocked.has(nk)) continue
        cameFrom.set(nk, cur)
        queue.push(nk)
      }
    }
    return null
  }

  private reconstruct(cameFrom: Map<number, number>, startKey: number, endKey: number): Cell[] {
    const path: Cell[] = [this.cell(endKey)]
    let cur = endKey
    while (cur !== startKey) {
      cur = cameFrom.get(cur)!
      path.push(this.cell(cur))
    }
    return path.reverse()
  }
}
