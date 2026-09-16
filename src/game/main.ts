import { AUTO, Game as PhaserGame, Scale, type Types } from 'phaser'
import { SCREEN } from './constants'
import { COLOR } from './palette'
import { Game } from './scenes/Game'
import { Preload } from './scenes/Preload'
import { Title } from './scenes/Title'

// ─────────────────────────────────────────────────────────────────────────────
// Game configuration.
// ≈ Build Settings (Scenes In Build) + Player Settings (Resolution) in Unity.
//
// Import note: Phaser 4's ESM build has ONLY named exports, no default export.
// `import Phaser from 'phaser'` does not work — take the names as below.
// ─────────────────────────────────────────────────────────────────────────────

const config: Types.Core.GameConfig = {
  type: AUTO,                 // WebGL where supported, Canvas otherwise
  parent: 'game-container',
  backgroundColor: COLOR.SEA_DEEP,

  scale: {
    mode: Scale.FIT,          // scale the whole frame to fit, preserving aspect
    autoCenter: Scale.CENTER_BOTH,
    width: SCREEN.W,
    height: SCREEN.H
  },

  render: {
    // Phaser 4 changed the default to false (v3 was true). Turned back on so pet
    // icons on fractional coordinates stay crisp. See MIGRATION-GUIDE §16 "Round Pixels".
    roundPixels: true,
    antialias: true
  },

  // ORDER MATTERS: the first scene starts automatically when the game boots.
  scene: [Preload, Title, Game]
}

const StartGame = (parent: string) => new PhaserGame({ ...config, parent })

export default StartGame
