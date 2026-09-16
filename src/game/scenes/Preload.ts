import { Scene } from 'phaser'
import { PET_IDS } from '../core/types'
import { FONT, LEVEL_COUNT, SCREEN } from '../constants'
import { COLOR, hex } from '../palette'
import { drawRounded, roundedRect } from '../view/shapes'

// ─────────────────────────────────────────────────────────────────────────────
// Loading screen.
//
// Why a SEPARATE scene just to load? Because assets must be present BEFORE
// Game.create() runs. Loading inside Game means the textures are not there yet
// when the board is built.
// ≈ a Loading scene + Addressables preload in Unity.
// ─────────────────────────────────────────────────────────────────────────────

/** Which levels actually loaded — Title only unlocks the ones in here. */
export const availableLevels = new Set<number>()

export class Preload extends Scene {
  constructor() { super('Preload') }

  preload(): void {
    this.drawProgressBar()

    this.load.setPath('assets')

    for (const pet of PET_IDS)
      this.load.image(`pet-${pet}`, `pets/${pet}.png`)

    for (let i = 1; i <= LEVEL_COUNT; i++) {
      const key = levelKey(i)
      this.load.json(key, `levels/${key}.json`)
    }

    // A level file that has not been exported yet 404s — that is a VALID
    // work-in-progress state, not an error. Note it and move on; Title will only
    // offer the levels that really exist.
    this.load.on('loaderror', (file: { key: string }) => {
      console.warn(`[preload] missing ${file.key} — run PawVoyage/Setup/Export Web Levels in Unity`)
    })
  }

  async create(): Promise<void> {
    for (let i = 1; i <= LEVEL_COUNT; i++)
      if (this.cache.json.has(levelKey(i))) availableLevels.add(i)

    if (availableLevels.size === 0) {
      this.showFatal('No levels loaded.\nRun PawVoyage/Setup/Export Web Levels in Unity.')
      return
    }

    // Core self-check. Dynamic import() + Vite's DEV flag means this block is
    // REMOVED ENTIRELY from the production build — it costs players nothing.
    if (import.meta.env.DEV) {
      const { selfTest } = await import('../core/selftest')
      selfTest()
    }

    this.scene.start('Title')
  }

  private drawProgressBar(): void {
    const w = 420, h = 26
    const x = (SCREEN.W - w) / 2, y = SCREEN.H / 2

    this.add.rectangle(SCREEN.W / 2, SCREEN.H / 2 - 70, SCREEN.W, SCREEN.H, COLOR.SEA_DEEP)
    this.add.text(SCREEN.W / 2, y - 70, 'Paw Voyage', {
      fontFamily: FONT, fontSize: '54px', fontStyle: 'bold', color: hex(COLOR.TEXT)
    }).setOrigin(0.5)

    roundedRect(this, SCREEN.W / 2, y, w, h, 13, COLOR.PANEL)

    const fill = this.add.graphics()
    this.load.on('progress', (p: number) => {
      const fw = Math.max(h, w * p)
      fill.clear()   // Graphics keeps every past draw command — without clear they stack
      drawRounded(fill, x + fw / 2, y, fw, h, 13, COLOR.SEA_LIGHT)
    })
  }

  private showFatal(msg: string): void {
    this.add.text(SCREEN.W / 2, SCREEN.H / 2, msg, {
      fontFamily: FONT, fontSize: '26px', color: '#ff9c9c', align: 'center'
    }).setOrigin(0.5)
  }
}

/** 1 -> 'level-01'. Shared by Preload / Title / Game, so it lives here. */
export const levelKey = (index: number): string => `level-${String(index).padStart(2, '0')}`
