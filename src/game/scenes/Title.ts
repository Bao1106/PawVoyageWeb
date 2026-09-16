import { Scene } from 'phaser'
import { FONT, LEVEL_COUNT, SCREEN } from '../constants'
import { COLOR, hex } from '../palette'
import { hitZone, roundedRect } from '../view/shapes'
import { availableLevels } from './Preload'

// ─────────────────────────────────────────────────────────────────────────────
// Menu.
//
// The row of level dots exists so OTHER PEOPLE can use the demo link: a recruiter
// can jump straight to L4 without playing L1-L3. Small, but it is what makes the
// link usable.
//
// THE PLAY BUTTON IS THE BROWSER'S AUDIO-UNLOCK GESTURE. Browsers block audio
// until the user touches the page — having this button from day 1 means adding
// sound on day 3 requires no restructuring.
// ─────────────────────────────────────────────────────────────────────────────

export class Title extends Scene {
  constructor() { super('Title') }

  create(): void {
    this.add.rectangle(SCREEN.W / 2, SCREEN.H / 2, SCREEN.W, SCREEN.H, COLOR.SEA)

    this.add.text(SCREEN.W / 2, 300, 'Paw Voyage', {
      fontFamily: FONT, fontSize: '76px', fontStyle: 'bold', color: hex(COLOR.TEXT)
    }).setOrigin(0.5)

    this.add.text(SCREEN.W / 2, 372, 'Phaser 4 · TypeScript', {
      fontFamily: FONT, fontSize: '26px', color: hex(COLOR.TEXT_DIM)
    }).setOrigin(0.5)

    const first = Math.min(...availableLevels)
    this.playButton(first)
    this.levelDots()
  }

  private playButton(level: number): void {
    const y = 620
    const w = 300, h = 96

    // Graphics receives no input on its own (it has no size) → visual + hit Zone.
    const bg = roundedRect(this, SCREEN.W / 2, y, w, h, 48, COLOR.SEA_LIGHT, 1,
      { color: COLOR.TEXT, width: 5, alpha: 0.9 })

    const label = this.add.text(SCREEN.W / 2, y - 2, 'PLAY', {
      fontFamily: FONT, fontSize: '42px', fontStyle: 'bold', color: hex(COLOR.TEXT)
    }).setOrigin(0.5)

    this.tweens.add({
      targets: [bg, label], scale: 1.04,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })

    // THIS IS THE AUDIOCONTEXT UNLOCK GESTURE — see the note at the top of the file.
    hitZone(this, SCREEN.W / 2, y, w, h, () => this.scene.start('Game', { level }))
  }

  private levelDots(): void {
    const y = 800
    const gap = 88
    const startX = (SCREEN.W - gap * (LEVEL_COUNT - 1)) / 2

    this.add.text(SCREEN.W / 2, y - 62, 'select level', {
      fontFamily: FONT, fontSize: '22px', color: hex(COLOR.TEXT_DIM)
    }).setOrigin(0.5)

    for (let i = 1; i <= LEVEL_COUNT; i++) {
      const x = startX + (i - 1) * gap
      const has = availableLevels.has(i)

      const dot = this.add.circle(x, y, 32, has ? COLOR.PANEL : COLOR.SEA_DEEP)
        .setStrokeStyle(3, COLOR.TEXT, has ? 0.8 : 0.2)

      this.add.text(x, y - 1, String(i), {
        fontFamily: FONT, fontSize: '28px', color: hex(has ? COLOR.TEXT : COLOR.TEXT_DIM)
      }).setOrigin(0.5).setAlpha(has ? 1 : 0.35)

      if (!has) continue
      dot.setInteractive({ useHandCursor: true })
      dot.on('pointerdown', () => this.scene.start('Game', { level: i }))
    }
  }
}
