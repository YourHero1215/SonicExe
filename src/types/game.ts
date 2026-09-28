export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'GAME_OVER';

export type ModVersion = 'v3.0' | 'v4.00000000';

export type SongId =
  | 'too-slow'
  | 'too-slow-encore'
  | 'you-cant-run'
  | 'you-cant-run-encore'
  | 'triple-trouble'
  | 'endless'
  | 'endless-og';

export type Direction = 0 | 1 | 2 | 3; // 0 = Left, 1 = Down, 2 = Up, 3 = Right

export type CharacterPose = 'idle' | 'left' | 'down' | 'up' | 'right' | 'miss' | 'laugh';

export type OpponentCharacterId =
  | 'sonic-exe'
  | 'ycr-exe'
  | 'pixel-exe'
  | 'xenophanes'
  | 'tails-soul'
  | 'knuckles-soul'
  | 'eggman-soul'
  | 'majin'
  | 'majin-og';

export type PlayerCharacterId = 'bf' | 'bf-encore' | 'bf-pixel';

export type StageThemeId =
  | 'cursed-green-hill'
  | 'ycr-crimson'
  | 'ycr-pixel-genesis'
  | 'triple-trouble-void'
  | 'endless-majin';

export type NoteSpecialType = 'normal' | 'static' | 'phantom' | 'ring';

export interface ChartNote {
  id: string;
  timeMs: number;
  lane: Direction; // 0..3
  isPlayer: boolean;
  sustainMs: number;
  special: NoteSpecialType;
  pitchMidi: number;
  hit?: boolean;
  missed?: boolean;
  holding?: boolean;
}

export interface SongEvent {
  timeMs: number;
  type:
    | 'stage_swap'
    | 'character_swap'
    | 'bpm_change'
    | 'screamer_text'
    | 'majin_countdown'
    | 'flip_lanes'
    | 'red_flash';
  value: string;
  triggered?: boolean;
}

export interface SongMetadata {
  id: SongId;
  title: string;
  subtitle: string;
  modVersionOrigin: 'v3.0' | 'v4.00000000';
  composer: string;
  bpm: number;
  scrollSpeed: number;
  durationSec: number;
  difficultyLabel: 'HARD' | 'ENCORE' | 'NIGHTMARE' | 'INFINITE';
  difficultyStars: number;
  stageImage: string;
  stageTheme: StageThemeId;
  initialOpponent: OpponentCharacterId;
  initialPlayer: PlayerCharacterId;
  accentColor: string;
  opponentHealthColor: string;
  playerHealthColor: string;
  description: string;
  mechanicsSummary: string;
}

export interface KeybindConfig {
  left: string;
  down: string;
  up: string;
  right: string;
  ring: string;
  pause: string;
  reset: string;
}

export interface GameplaySettings {
  downscroll: boolean;
  scrollSpeedMultiplier: number;
  ghostTapping: boolean;
  botplay: boolean;
  crtFilter: boolean;
  hitSoundVolume: number;
  musicVolume: number;
  modVersion: ModVersion;
}

export type JudgementTier = 'SICK!!' | 'GOOD!' | 'BAD' | 'SHIT' | 'MISS';

export interface PlayStats {
  score: number;
  misses: number;
  combo: number;
  maxCombo: number;
  sicks: number;
  goods: number;
  bads: number;
  shits: number;
  totalNotesHit: number;
  totalNotesEncountered: number;
  rings: number;
  health: number; // 0 to 100 (starts at 50)
}

export interface HighScoreRecord {
  score: number;
  accuracy: number;
  misses: number;
  maxCombo: number;
  grade: string;
  clearedAt: string;
}
