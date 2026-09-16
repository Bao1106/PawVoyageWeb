import type { GameObjects, Scene } from 'phaser'
import { LAYOUT, SCREEN } from '../constants'
import { COLOR } from '../palette'

// ─────────────────────────────────────────────────────────────────────────────
// The waiting jetty — the row of parking slots between the pier and the boats.
// ≈ BufferZoneController's geometry (BuildPads).
//
// It is an "escape hatch, not a tool": a full jetty with no match for the docked
// boat is a LOSS. So it has to stay visible at a glance — see markFull().
// ─────────────────────────────────────────────────────────────────────────────

export class JettyView {
  private readonly slotW: number
  private readonly startX: number
  private readonly slotMarks: GameObjects.Graphics

  constructor(private readonly scene: Scene, readonly capacity: number) {
    // Shrink slots if the jetty is wider than the screen (Unity's chapter 2 uses 7).
    const wanted = LAYOUT.JETTY_SLOT + LAYOUT.JETTY_GAP
    const maxTotal = SCREEN.W - 48
    this.slotW = Math.min(wanted, maxTotal / capacity)
    this.startX = (SCREEN.W - this.slotW * capacity) / 2

    this.build()
    this.slotMarks = scene.add.graphics()
  }

  /** Centre of waiting slot i. */
  slotPosition(index: number): { x: number; y: number } {
    return {
      x: this.startX + index * this.slotW + this.slotW / 2,
      y: LAYOUT.JETTY_Y
    }
  }

  private build(): void {
    const g = this.scene.add.graphics()
    const h = LAYOUT.JETTY_SLOT + 16
    const deckW = this.slotW * this.capacity + 24

    // Jetty decking
    g.fillStyle(COLOR.DECK_EDGE, 1)
    g.fillRoundedRect(this.startX - 12, LAYOUT.JETTY_Y - h / 2 + 6, deckW, h, 18)
    g.fillStyle(COLOR.JETTY, 1)
    g.fillRoundedRect(this.startX - 12, LAYOUT.JETTY_Y - h / 2, deckW, h, 18)

    // Painted markings for each standing spot
    const mark = LAYOUT.JETTY_SLOT - 18
    for (let i = 0; i < this.capacity; i++) {
      const p = this.slotPosition(i)
      g.lineStyle(3, COLOR.JETTY_EMPTY, 0.9)
      g.strokeRoundedRect(p.x - mark / 2, p.y - mark / 2, mark, mark, 10)
    }
  }

  /**
   * Warning state when the jetty fills up. Day 2 calls this after every move.
   * Nothing calls it on day 1 — it lives here because it belongs to this class.
   */
  markFull(used: number): void {
    this.slotMarks.clear()
    if (used < this.capacity) return

    const mark = LAYOUT.JETTY_SLOT - 12
    for (let i = 0; i < this.capacity; i++) {
      const p = this.slotPosition(i)
      this.slotMarks.lineStyle(4, 0xff6b6b, 0.95)
      this.slotMarks.strokeRoundedRect(p.x - mark / 2, p.y - mark / 2, mark, mark, 12)
    }
  }
}
