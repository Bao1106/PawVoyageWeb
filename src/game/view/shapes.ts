import { GameObjects, type Scene } from 'phaser'

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ DO NOT USE scene.add.rectangle(...).setRounded(r) — IT CRASHES PHASER 4.0.0.
//
// node_modules/phaser/src/gameobjects/shape/rectangle/RectangleWebGLRenderer.js
// still contains an un-migrated v3 branch:
//
//     if (src.isRounded && src.isFilled)
//         FillPathWebGL(pipeline, result.calc, src, alpha, dx, dy);   // ← v3
//     else if (src.isFilled)
//         if (src.isRounded)                                          // ← v4, correct
//             FillPathWebGL(drawingContext, submitter, calcMatrix, src, alpha, dx, dy);
//
// `pipeline` and `result` are v3 renderer locals that do not exist in v4, so any
// rectangle that is BOTH ROUNDED AND FILLED throws "ReferenceError: pipeline is
// not defined" on the first frame and the whole page goes blank. The correct call
// sits right below it but is unreachable — the branch above already caught it.
//
// Workaround: draw with Graphics.fillRoundedRect, which takes a different path.
// This is exactly what the project scope warned about ("Phaser 4 is new, verify
// the API") — except here it is PHASER mixing v3 into v4, not an LLM.
// ─────────────────────────────────────────────────────────────────────────────

export interface Stroke {
  color: number
  width: number
  alpha?: number
}

/**
 * Rounded rectangle centred on (x, y).
 *
 * The shape is drawn at LOCAL (0,0) and the Graphics object is then moved to
 * (x, y). This matters: drawing at absolute coordinates would make setScale()
 * scale around the screen origin rather than the shape's centre, so a button
 * would fly off somewhere else during a scale tween.
 */
export function roundedRect(
  scene: Scene,
  x: number, y: number,
  w: number, h: number,
  radius: number,
  fill: number,
  fillAlpha = 1,
  stroke?: Stroke
): GameObjects.Graphics {
  const g = scene.add.graphics()
  drawRounded(g, 0, 0, w, h, radius, fill, fillAlpha, stroke)
  g.setPosition(x, y)
  return g
}

/** Draw into an existing Graphics (does not clear — the caller decides). */
export function drawRounded(
  g: GameObjects.Graphics,
  x: number, y: number,
  w: number, h: number,
  radius: number,
  fill: number,
  fillAlpha = 1,
  stroke?: Stroke
): void {
  const left = x - w / 2
  const top = y - h / 2
  // radius must not exceed half the shorter side, or the shape comes out distorted
  const r = Math.min(radius, w / 2, h / 2)

  g.fillStyle(fill, fillAlpha)
  g.fillRoundedRect(left, top, w, h, r)

  if (stroke) {
    g.lineStyle(stroke.width, stroke.color, stroke.alpha ?? 1)
    g.strokeRoundedRect(left, top, w, h, r)
  }
}

/**
 * Invisible hit area laid over a drawn shape.
 * Graphics does NOT receive input on its own (it has no size), so a button is a
 * Graphics visual plus a transparent Zone on top.
 */
export function hitZone(
  scene: Scene,
  x: number, y: number,
  w: number, h: number,
  onClick: () => void
): GameObjects.Zone {
  const zone = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true })
  zone.on('pointerdown', () => onClick())
  return zone
}
