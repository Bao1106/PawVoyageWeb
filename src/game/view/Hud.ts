import { GameObjects, type Scene } from 'phaser'
import { FONT, LAYOUT, SCREEN } from '../constants'
import { COLOR, hex } from '../palette'

// ─────────────────────────────────────────────────────────────────────────────
// Top HUD bar: level, move count, restart.
// ≈ HUDGameplay under Assets/MyGame/Scripts/ (Unity's app-shell layer).
// ─────────────────────────────────────────────────────────────────────────────

export class Hud {
  private readonly movesText: GameObjects.Text

  constructor(scene: Scene, levelIndex: number, onRestart: () => void, onMenu: () => void) {
    const g = scene.add.graphics()
    g.fillStyle(COLOR.PANEL, 0.88)
    g.fillRoundedRect(-20, -30, SCREEN.W + 40, LAYOUT.HUD_H + 30, 24)

    const style = { fontFamily: FONT, fontSize: '34px', color: hex(COLOR.TEXT) }

    scene.add.text(28, 58, `Level ${levelIndex}`, { ...style, fontStyle: 'bold' })
      .setOrigin(0, 0.5)

    this.movesText = scene.add.text(SCREEN.W / 2 + 40, 58, 'Moves 0', {
      ...style, fontSize: '28px', color: hex(COLOR.TEXT_DIM)
    }).setOrigin(0.5)

    this.button(scene, SCREEN.W - 62, 58, '⟳', onRestart)
    this.button(scene, SCREEN.W - 140, 58, '≡', onMenu)
  }

  setMoves(n: number): void {
    this.movesText.setText(`Moves ${n}`)
  }

  private button(scene: Scene, x: number, y: number, label: string, onClick: () => void): void {
    const bg = scene.add.circle(x, y, 28, COLOR.SEA_LIGHT)
      .setInteractive({ useHandCursor: true })
    scene.add.text(x, y - 2, label, {
      fontFamily: FONT, fontSize: '30px', color: hex(COLOR.TEXT)
    }).setOrigin(0.5)

    // Arrow function: keeps `this` and closes over `onClick` from the enclosing scope.
    bg.on('pointerdown', () => {
      scene.tweens.add({ targets: bg, scale: 0.86, duration: 70, yoyo: true })
      onClick()
    })
  }
}
