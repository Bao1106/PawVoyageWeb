import type { Scene } from 'phaser'
import type { Grid } from '../core/grid'
import { LAYOUT, SCREEN } from '../constants'
import { COLOR } from '../palette'

// ─────────────────────────────────────────────────────────────────────────────
// Draws the pier deck, and owns the most important function in the view layer:
// cellToScreen.  ≈ PierController's geometry + CellToWorld.
//
// Exactly ONE place in the whole project knows the cell -> pixel formula, so a
// layout change is a one-line change.
// ─────────────────────────────────────────────────────────────────────────────

export class PierView {
  private readonly originX: number
  private readonly originY: number

  constructor(private readonly scene: Scene, private readonly grid: Grid) {
    this.originX = (SCREEN.W - grid.width * LAYOUT.CELL) / 2

    // The pier is CENTRED in the remaining area rather than pinned to PIER_TOP:
    // the grid changes per tier (4x3 at L1, 5x4 at L3, 6x7 in Unity's chapter 2),
    // and pinning leaves a large dead gap on small grids while overflowing on big ones.
    const areaTop = LAYOUT.PIER_TOP
    const areaBottom = SCREEN.H - LAYOUT.PIER_BOTTOM_MARGIN
    const gridPx = grid.height * LAYOUT.CELL
    this.originY = areaTop + Math.max(0, (areaBottom - areaTop - gridPx) / 2)

    this.build()
  }

  /** Grid coordinate -> screen coordinate (cell centre). */
  cellToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: this.originX + x * LAYOUT.CELL + LAYOUT.CELL / 2,
      // y = 0 is the SEA-FRONT row, and in this layout the SEA IS AT THE TOP
      // → y = 0 draws at the TOP of the pier and y grows downward. Direct mapping, no flip.
      //
      // ⚠️ THIS WAS WRONG ONCE: the first version used (height - 1 - y), i.e. a
      // second flip. That flip belongs to Grid (rows are authored top-down, first
      // line furthest from the sea) and is already applied there; flipping again
      // here turned the whole board upside down — with NO crash and no warning,
      // just back rows rendered as front rows.
      y: this.originY + y * LAYOUT.CELL + LAYOUT.CELL / 2
    }
  }

  /** Bottom edge of the pier — useful for laying out whatever sits below it. */
  get bottom(): number { return this.originY + this.grid.height * LAYOUT.CELL }

  private build(): void {
    const g = this.scene.add.graphics()
    const inset = LAYOUT.CELL_INSET

    // Draw PER CELL rather than one big rectangle: a shape can be carved
    // ('.' = water) and that hole is part of the puzzle, so it has to be visible.
    for (const key of this.grid.openKeys) {
      const c = this.grid.cell(key)
      const p = this.cellToScreen(c.x, c.y)
      const x = p.x - LAYOUT.CELL / 2 + inset / 2
      const y = p.y - LAYOUT.CELL / 2 + inset / 2
      const size = LAYOUT.CELL - inset

      // A darker copy offset downward fakes plank thickness — cheaper than a real shadow.
      g.fillStyle(COLOR.DECK_EDGE, 1)
      g.fillRoundedRect(x, y + 5, size, size, 14)
      g.fillStyle(COLOR.DECK_TILE, 1)
      g.fillRoundedRect(x, y, size, size, 14)
    }
  }
}
