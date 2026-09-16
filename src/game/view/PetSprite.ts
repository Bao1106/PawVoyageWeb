import { GameObjects, type Scene } from 'phaser'
import type { PetId } from '../core/types'
import { LAYOUT, TIMING } from '../constants'

// ─────────────────────────────────────────────────────────────────────────────
// One pet on screen.  ≈ View/Pet.cs
//
// IT KNOWS NO RULES. It does not know whether it may board, or whether a route
// is legal. It only knows "here is a position, go there" and "call this when
// tapped". All the rules live in core/board.ts.
// ─────────────────────────────────────────────────────────────────────────────

export class PetSprite extends GameObjects.Container {
  private readonly icon: GameObjects.Image

  constructor(
    scene: Scene,
    readonly petId: number,
    readonly petType: PetId,
    x: number,
    y: number,
    onTap: (petId: number) => void
  ) {
    super(scene, x, y)

    this.icon = scene.add.image(0, 0, `pet-${petType}`)
    this.icon.setDisplaySize(LAYOUT.PET_SIZE, LAYOUT.PET_SIZE)
    this.add(this.icon)

    this.setSize(LAYOUT.CELL - LAYOUT.CELL_INSET, LAYOUT.CELL - LAYOUT.CELL_INSET)
    this.setInteractive({ useHandCursor: true })

    // ARROW FUNCTION, not `this.handleTap`.
    // Passing a method by name hands over ONLY THE FUNCTION, without the object;
    // when Phaser calls it back, `this` is undefined and it throws. An arrow
    // function has no `this` of its own — it borrows the enclosing scope's.
    // Survival rule for the week: EVERY callback is an arrow function.
    this.on('pointerdown', () => onTap(this.petId))

    scene.add.existing(this)
  }

  /** Small bounce — feedback for a valid tap. */
  pop(): void {
    this.scene.tweens.add({
      targets: this.icon,
      scale: this.icon.scale * 1.14,
      duration: TIMING.POP_MS,
      yoyo: true,
      ease: 'Quad.easeOut'
    })
  }

  /** Horizontal shake — the pet is walled in with no route out. ≈ Pet.PlayRejectShake */
  shake(): void {
    const x0 = this.x
    this.scene.tweens.add({
      targets: this,
      x: x0 - 7,
      duration: TIMING.REJECT_MS / 6,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.x = x0 }
    })
  }

  /** Stop accepting taps once the pet has left the pier (walking / aboard). */
  freeze(): void {
    this.disableInteractive()
  }
}
