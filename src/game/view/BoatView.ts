import { GameObjects, type Scene } from 'phaser'
import type { PetId } from '../core/types'
import { LAYOUT, SCREEN, TIMING } from '../constants'
import { COLOR, PET_COLOR } from '../palette'
import { drawRounded } from './shapes'

// ─────────────────────────────────────────────────────────────────────────────
// One boat.  ≈ View/Boat.cs
//
// NO ARTWORK. Unity's boats are 3D models (kenney_watercraft-pack); baking them
// to 2D would be both heavier and harder to read the seat count from. Flat shapes
// plus a species badge plus seat pips read better and cost 0 bytes.
// Day 3 polish could bake the 5 real hulls to PNG with screenshot-isolated.
// ─────────────────────────────────────────────────────────────────────────────

export class BoatView extends GameObjects.Container {
  private readonly hullW: number
  private readonly pips: GameObjects.Arc[] = []

  constructor(
    scene: Scene,
    readonly accepts: PetId,
    readonly seats: number,
    docked: boolean
  ) {
    super(scene, SCREEN.W / 2, docked ? LAYOUT.DOCK_Y : LAYOUT.PREVIEW_Y)

    this.hullW = seats * LAYOUT.BOAT_SEAT + LAYOUT.BOAT_PAD * 2
    const h = LAYOUT.BOAT_H
    const tint = PET_COLOR[accepts]

    // Drawn with Graphics rather than add.rectangle().setRounded() — see shapes.ts,
    // a rounded + filled Rectangle crashes Phaser 4.0.0.
    const hull = scene.add.graphics()
    drawRounded(hull, 0, 8, this.hullW, h, 26, COLOR.HULL_DARK)
    drawRounded(hull, 0, 0, this.hullW, h, 26, COLOR.HULL, 1, { color: tint, width: 5 })
    this.add(hull)

    // Species badge: which pet this boat accepts. Sits FULLY INSIDE the hull
    // (BOAT_PAD is wide enough to give it its own zone) — overhanging the top
    // edge just gets it clipped by the hull.
    const badgeX = -this.hullW / 2 + LAYOUT.BOAT_PAD / 2
    const badge = scene.add.circle(badgeX, 0, 32, tint)
    const badgeIcon = scene.add.image(badgeX, 0, `pet-${accepts}`)
    badgeIcon.setDisplaySize(50, 50)
    this.add([badge, badgeIcon])

    // Seat pips: how many seats, and how many are taken
    for (let i = 0; i < seats; i++) {
      const p = this.seatLocal(i)
      const pip = scene.add.circle(p.x, p.y, 15, COLOR.HULL_DARK)
      pip.setStrokeStyle(3, tint, 0.55)
      this.pips.push(pip)
      this.add(pip)
    }

    if (!docked) this.setScale(LAYOUT.PREVIEW_SCALE).setAlpha(0.72)
    scene.add.existing(this)
  }

  /** Seat i in the BOAT's own coordinate space (before the boat's position). */
  private seatLocal(index: number): { x: number; y: number } {
    const first = -this.hullW / 2 + LAYOUT.BOAT_PAD + LAYOUT.BOAT_SEAT / 2
    return { x: first + index * LAYOUT.BOAT_SEAT, y: 16 }
  }

  /** Seat i in SCREEN space — where a pet flies to. */
  seatPosition(index: number): { x: number; y: number } {
    const p = this.seatLocal(index)
    return { x: this.x + p.x * this.scaleX, y: this.y + p.y * this.scaleY }
  }

  /** Light up the pip for a seat that now holds a pet. */
  fillSeat(index: number): void {
    this.pips[index]?.setFillStyle(PET_COLOR[this.accepts], 1)
  }

  /** Move up from the queue into the berth. Used from day 2. */
  dock(delay: number): void {
    this.scene.tweens.add({
      targets: this,
      y: LAYOUT.DOCK_Y,
      scale: 1,
      alpha: 1,
      duration: TIMING.DOCK_MS,
      ease: 'Quad.easeOut',
      delay
    })
  }

  /** Cast off and drift left out of frame. Used from day 2. */
  depart(delay: number): void {
    this.scene.tweens.add({
      targets: this,
      x: -this.hullW,
      duration: TIMING.DEPART_MS,
      ease: 'Back.easeIn',
      delay,
      onComplete: () => this.destroy()   // clean up now, so nothing accumulates across runs
    })
  }
}
