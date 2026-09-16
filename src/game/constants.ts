// ─────────────────────────────────────────────────────────────────────────────
// THIS FILE IS THE INSPECTOR.
//
// In Unity you drag a slider to tune; on the web there is no Inspector, so every
// tuning number lives here. Vite hot-reloads, so editing a number shows instantly.
//
// RULE: a number appearing in any other file (other than 0, 1, 0.5) belongs here.
// Day 3 means adjusting these a lot; scattered magic numbers make that painful.
// ≈ Constant/PVConstants.cs
// ─────────────────────────────────────────────────────────────────────────────

/** Fixed portrait frame. Scale.FIT letterboxes it to whatever screen it lands on. */
export const SCREEN = { W: 720, H: 1280 } as const

export const LAYOUT = {
  HUD_H: 130,

  // Sea on TOP, pier at the BOTTOM — INVERTED from the Unity build (Unity's camera
  // looks from the sea side, so boats sit at the bottom of the screen). Changed
  // because the pier is what the player TOUCHES, and on a phone the lower half is
  // thumb reach. Boats are only there to be looked at.
  PREVIEW_Y: 205,        // next boat (PreviewDepth = 1, matching Unity tiers 1-2)
  DOCK_Y: 350,           // boat currently at the berth
  JETTY_Y: 540,
  PIER_TOP: 650,         // TOP edge of the area reserved for the pier
  PIER_BOTTOM_MARGIN: 60, // clearance from screen bottom; pier is CENTRED in that area

  CELL: 104,             // pier cell size, px
  CELL_INSET: 6,         // gap between cells so each reads as its own tile
  PET_SIZE: 84,          // rendered size of a pet icon

  JETTY_SLOT: 96,
  JETTY_GAP: 6,

  BOAT_SEAT: 84,         // width of one seat on a boat
  BOAT_PAD: 78,          // bow + stern; wide enough that the species badge gets its own zone
  BOAT_H: 128,
  PREVIEW_SCALE: 0.58,
} as const

export const TIMING = {
  STEP_MS: 90,            // pet crossing one cell
  BOARD_MS: 260,          // hop onto a boat / onto the jetty
  DEPART_MS: 700,
  DOCK_MS: 600,
  DRAIN_STAGGER_MS: 110,  // delay between pets drained from the jetty onto one boat
  REJECT_MS: 220,         // shake on a blocked tap
  POP_MS: 110,            // bounce on a valid tap
} as const

/** How many levels exist in public/assets/levels. Keep in sync with EXPORT_COUNT in Unity. */
export const LEVEL_COUNT = 5

/**
 * Font. System stack rather than a webfont: the Unity build uses Fredoka, but
 * embedding a webfont costs ~40KB and adds a failure mode (FOUT — text jumps
 * once the font arrives). Day 3 polish can switch to Fredoka to match the original.
 */
export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
