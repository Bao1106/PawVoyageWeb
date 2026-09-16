import { Scene } from 'phaser'
import { Grid } from '../core/grid'
import { parseLevel } from '../core/levelSchema'
import type { LevelData } from '../core/types'
import { FONT, LAYOUT, SCREEN } from '../constants'
import { COLOR, hex } from '../palette'
import { BoatView } from '../view/BoatView'
import { Hud } from '../view/Hud'
import { JettyView } from '../view/JettyView'
import { PetSprite } from '../view/PetSprite'
import { PierView } from '../view/PierView'
import { levelKey } from './Preload'

// ─────────────────────────────────────────────────────────────────────────────
// Main scene — the GLUE between core and view.
// ≈ LevelController.Start()'s scene-building half.
//
// DAY 1: static board. Read the JSON, build the Grid, draw everything, log the
//        tapped pet to the console. NO RULES YET.
// DAY 2: replace console.log with board.tap() and replay the returned Effects.
// ─────────────────────────────────────────────────────────────────────────────

export class Game extends Scene {
  // ⚠️ DO NOT name a field `data`, `events`, `add`, `load`, `input`, `time`,
  // `tweens`, `cameras`, `sound`, `cache`, `scene`, `registry`, `children`, `sys`...
  // Phaser.Scene already owns those names. Shadowing one produces a compile error
  // somewhere COMPLETELY ELSE (every function taking `this: Scene` suddenly refuses
  // `this`), which is very hard to trace back unless you know to look for it.
  private levelIndex = 1
  private level!: LevelData
  private grid!: Grid
  private pier!: PierView
  private jetty!: JettyView
  private hud!: Hud
  private readonly boats: BoatView[] = []
  private readonly petSprites = new Map<number, PetSprite>()

  constructor() { super('Game') }

  /** ≈ Awake(). Receives the argument from this.scene.start('Game', { level: 3 }). */
  init(data: { level?: number }): void {
    this.levelIndex = data.level ?? 1
  }

  /** ≈ Start(). */
  create(): void {
    // Clear last run's state: `create` runs again on every scene restart, but the
    // fields above do NOT reset (the scene instance is reused, not recreated).
    // Forget this and each run draws on top of the previous one while the heap
    // creeps up — exactly what day 4 goes looking for.
    this.boats.length = 0
    this.petSprites.clear()

    const raw = this.cache.json.get(levelKey(this.levelIndex))
    try {
      this.level = parseLevel(raw)
    } catch (e) {
      this.showFatal(String(e))
      return
    }

    this.grid = new Grid(this.level.rows)

    this.drawBackground()
    this.pier = new PierView(this, this.grid)
    this.jetty = new JettyView(this, this.level.bufferSlots)
    this.spawnBoats()
    this.spawnPets()

    this.hud = new Hud(
      this,
      this.levelIndex,
      () => this.scene.restart(),
      () => this.scene.start('Title')
    )
    this.hud.setMoves(0)
    this.jetty.markFull(0)   // day 2: call again after every move with the used count
  }

  /**
   * DAY 1: logging only. On day 2 this becomes:
   *   const effects = this.board.tap(petId)
   *   this.play(effects)
   */
  private onPetTapped(petId: number): void {
    const sprite = this.petSprites.get(petId)
    if (!sprite) return

    sprite.pop()

    // Temporarily driving Grid directly to confirm BFS behaves — on day 2 this
    // moves into Board, because "who blocks whom" is a RULE, not the scene's job.
    const blocked = new Set<number>()
    for (const [id, s] of this.petSprites)
      if (id !== petId && s.active) blocked.add(this.grid.key(s.getData('cx'), s.getData('cy')))

    const start = this.grid.key(sprite.getData('cx'), sprite.getData('cy'))
    const path = this.grid.findPathToExit(blocked, start)

    if (!path) {
      sprite.shake()
      console.log(`tap pet ${petId} (${sprite.petType}) — BLOCKED, no route out`)
      return
    }
    console.log(
      `tap pet ${petId} (${sprite.petType}) — route of ${path.length} cells:`,
      path.map(c => `(${c.x},${c.y})`).join(' -> ')
    )
  }

  private spawnPets(): void {
    this.level.pets.forEach((p, i) => {
      const pos = this.pier.cellToScreen(p.cell.x, p.cell.y)
      const sprite = new PetSprite(this, i, p.pet, pos.x, pos.y, id => this.onPetTapped(id))
      // Day 1 stashes the cell on the sprite for convenience. On day 2 Board owns
      // this, and the view stops knowing anything about grid coordinates.
      sprite.setData('cx', p.cell.x)
      sprite.setData('cy', p.cell.y)
      this.petSprites.set(i, sprite)
    })
  }

  private spawnBoats(): void {
    // PreviewDepth = 1 on Unity tiers 1-2: the player may see EXACTLY ONE upcoming
    // boat. That number is part of the baked difficulty — showing more would make
    // every difficulty band Unity measured a lie.
    const shown = this.level.boats.slice(0, 2)
    shown.forEach((b, i) => {
      this.boats.push(new BoatView(this, b.pet, b.seats, i === 0))
    })

    // "N more boats" — only shown when boats really are still hidden.
    const hidden = this.level.boats.length - shown.length
    if (hidden > 0)
      this.add.text(SCREEN.W - 28, LAYOUT.PREVIEW_Y, `+${hidden}`, {
        fontFamily: FONT, fontSize: '26px', color: hex(COLOR.TEXT_DIM)
      }).setOrigin(1, 0.5)
  }

  private drawBackground(): void {
    this.add.rectangle(SCREEN.W / 2, SCREEN.H / 2, SCREEN.W, SCREEN.H, COLOR.SEA)
    // Darker band at the top for depth — open sea is darker further out.
    this.add.rectangle(SCREEN.W / 2, 150, SCREEN.W, 300, COLOR.SEA_DEEP)
    this.add.rectangle(SCREEN.W / 2, SCREEN.H - 120, SCREEN.W, 240, COLOR.SEA_LIGHT)
  }

  private showFatal(msg: string): void {
    this.add.rectangle(SCREEN.W / 2, SCREEN.H / 2, SCREEN.W, SCREEN.H, COLOR.SEA_DEEP)
    this.add.text(SCREEN.W / 2, SCREEN.H / 2, msg, {
      fontFamily: FONT, fontSize: '24px', color: '#ff9c9c',
      align: 'center', wordWrap: { width: SCREEN.W - 80 }
    }).setOrigin(0.5)
  }
}
