import type { PetId } from './core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette. Kept apart from constants.ts because they are different things:
// constants is LAYOUT, palette is LOOK. Changing a colour can never break layout,
// and vice versa.
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR = {
  SEA_DEEP: 0x12507a,
  SEA: 0x1d6ea3,
  SEA_LIGHT: 0x2a86bd,

  DECK: 0xb0763f,        // pier decking
  DECK_TILE: 0xd0955a,   // cell face
  DECK_EDGE: 0x8a5a2c,

  JETTY: 0xc9a06a,
  JETTY_EMPTY: 0x9c7b52,

  HULL: 0xf2ede3,
  HULL_DARK: 0xd6cdbd,

  TEXT: 0xffffff,
  TEXT_DIM: 0xbcd7e8,
  PANEL: 0x0d3a5c,
} as const

/**
 * Per-species colour — copied from PetTypeSO.ThemeColor in Unity (x255, rounded),
 * so the web and Unity builds read as the same game.
 *
 * Used for: boat badge, jetty slot outline, seat pips.
 * NOT tinted onto the pet icons — those already carry the 3D model's own colours.
 */
export const PET_COLOR: Record<PetId, number> = {
  cat:      0x4d576b,   // 0.30, 0.34, 0.42
  dog:      0x8c5c33,   // 0.55, 0.36, 0.20
  chick:    0xf7bf26,   // 0.97, 0.75, 0.15
  cow:      0x383333,   // 0.22, 0.20, 0.20
  pig:      0xed8ca6,   // 0.93, 0.55, 0.65
  monkey:   0xd19452,   // 0.82, 0.58, 0.32
  lion:     0xdea33d,   // 0.87, 0.64, 0.24
  tiger:    0xeb731f,   // 0.92, 0.45, 0.12
  elephant: 0x8c99ad,   // 0.55, 0.60, 0.68
}

/** 0xRRGGBB -> '#rrggbb', for APIs that take CSS colour strings (Text style). */
export const hex = (c: number): string => '#' + c.toString(16).padStart(6, '0')
