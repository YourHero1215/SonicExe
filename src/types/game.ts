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

export type CharacterPose =
  | 'idle'
  | 'left'
  | 'down'
  | 'up'
  | 'right'
  | 'miss'
  | 'laugh'
  | 'gotcha'
  | 'scream'
  | 'revealed';

export type OpponentCharacterId =
  | 'sonic-exe'
  | 'sonicexefake'
  | 'ycr-exe'
  | 'ycr-mad'
  | 'pixel-exe'
  | 'xenophanes'
  | 'xenophanes-flipped'
  | 'tails-soul'
  | 'knuckles-soul'
  | 'eggman-soul'
  | 'majin'
  | 'majin-og';

export type PlayerCharacterId =
  | 'bf'
  | 'bf-encore'
  | 'bf-pixel'
  | 'bf-endless'
  | 'bf-perspective-right'
  | 'bf-perspective-left';

export type StageThemeId =
  | 'green-hill-clean'
  | 'cursed-green-hill'
  | 'ycr-crimson'
  | 'ycr-pixel-genesis'
  | 'triple-trouble-void'
  | 'triple-trouble-xeno'
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
  lastMissTickMs?: number;
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
    | 'red_flash'
    | 'strumline_spin'
    | 'focus_camera'
    | 'zoom_camera'
    | 'noteskin_swap'
    | 'camera_bop'
    | 'lyrics'
    | 'too_slow_flash'
    | 'play_anim'
    | 'sonicspook';
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
  noteDensityMultiplier: number;
  disableJumpscares: boolean;
  ghostTapping: boolean;
  practiceMode: boolean;
  botplay: boolean;
  crtFilter: boolean;
  antiLagMode: boolean;
  pixelRatioX: number;
  pixelRatioY: number;
  pixelRatioLock: number; // e.g. 16/9 (1.777778) or 1.5 (3:2 / 1.5:1)
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
  usedBotplay?: boolean;
  usedPracticeMode?: boolean;
}

export interface HighScoreRecord {
  score: number;
  accuracy: number;
  misses: number;
  maxCombo: number;
  grade: string;
  clearedAt: string;
}

export function getVideoQualityResolution(
  pixelRatioX: number,
  pixelRatioY: number
): { width: number; height: number; scale: number; label: string } {
  const x = Number.isFinite(pixelRatioX) && pixelRatioX > 0 ? pixelRatioX : 3;
  const y = Number.isFinite(pixelRatioY) && pixelRatioY > 0 ? pixelRatioY : 2;

  let width: number;
  let height: number;

  if (x >= 120 || y >= 80) {
    // Direct pixel count input (e.g. 640:360, 960:540, 1280:720, 1920:1080)
    width = Math.max(160, Math.min(1920, Math.round(x / 2) * 2));
    height = Math.max(90, Math.min(1080, Math.round(y / 2) * 2));
  } else {
    // Ratio quality scale (e.g. 0.75:0.5 => 180p, 1.5:1 => 360p, 2.25:1.5 => 540p, 3:2 => 720p HD, 4.5:3 => 1080p FHD)
    const rawScale = y > 4.5 ? y / 9 : y / 2;
    const clampedScale = Math.max(0.15, Math.min(1.5, rawScale));
    width = Math.max(160, Math.round((1280 * clampedScale) / 2) * 2);
    height = Math.max(90, Math.round((720 * clampedScale) / 2) * 2);
  }

  const scale = Math.round((height / 720) * 100) / 100;
  const tier =
    height >= 1080
      ? '1080p FHD'
      : height >= 720
        ? '720p HD'
        : height >= 540
          ? '540p qHD'
          : height >= 360
            ? '360p SD'
            : `${height}p Low`;

  return {
    width,
    height,
    scale,
    label: `${width}×${height} (${tier})`,
  };
}

