import React, { useEffect, useRef, useState } from 'react';
import {
  Disc,
  Keyboard,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  GameState,
  GameplaySettings,
  HighScoreRecord,
  KeybindConfig,
  PlayStats,
  SongId,
  SongMetadata,
} from './types/game';
import { SONGS } from './data/songs';
import {
  DEFAULT_KEYBINDS,
  formatKeyCode,
  KeybindsModal,
} from './components/KeybindsModal';
import { FnfStageCanvas } from './components/FnfStageCanvas';
import {
  calculateGrade,
  drawOpponentSprite,
  drawPlayerSprite,
} from './canvas/spriteRenderer';
import { soundEngine } from './audio/soundEngine';

type SongFilter = 'all' | 'main' | 'encore' | 'soundtest';

const STORAGE_KEY_BINDS = 'fnf_sonic_exe_keybinds_v4';
const STORAGE_KEY_SETTINGS = 'fnf_sonic_exe_settings_v4';
const STORAGE_KEY_SCORES = 'fnf_sonic_exe_highscores_v4';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedSongId, setSelectedSongId] = useState<SongId>('too-slow');
  const [songFilter, setSongFilter] = useState<SongFilter>('all');
  const [isKeybindsOpen, setIsKeybindsOpen] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(1);
  const [lastRunStats, setLastRunStats] = useState<PlayStats | null>(null);

  const [keybinds, setKeybinds] = useState<KeybindConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BINDS);
      if (saved) return { ...DEFAULT_KEYBINDS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_KEYBINDS;
  });

  const [settings, setSettings] = useState<GameplaySettings>(() => {
    const defaults: GameplaySettings = {
      downscroll: false,
      scrollSpeedMultiplier: 1.0,
      ghostTapping: true,
      botplay: false,
      crtFilter: true,
      hitSoundVolume: 0.7,
      musicVolume: 0.75,
      modVersion: 'v3.0',
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return defaults;
  });

  const [highScores, setHighScores] = useState<Record<string, HighScoreRecord>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SCORES);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
      return {};
    }
  );

  // Persist keybinds and settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BINDS, JSON.stringify(keybinds));
    } catch {
      // ignore
    }
  }, [keybinds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const selectedSong: SongMetadata =
    SONGS.find((s) => s.id === selectedSongId) || SONGS[0];

  const filteredSongs = SONGS.filter((song) => {
    if (songFilter === 'main') {
      return (
        song.id === 'too-slow' ||
        song.id === 'you-cant-run' ||
        song.id === 'triple-trouble'
      );
    }
    if (songFilter === 'encore') {
      return (
        song.id === 'too-slow-encore' || song.id === 'you-cant-run-encore'
      );
    }
    if (songFilter === 'soundtest') {
      return song.id === 'endless' || song.id === 'endless-og';
    }
    return true;
  });

  // Animated Character Showcase Preview Canvas on Title Menu
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (gameState !== 'TITLE_MENU') return;
    let rafId: number;
    const start = performance.now();

    const animatePreview = (now: number) => {
      const elapsed = now - start;
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Cycle directional poses every 2.2 seconds so user can inspect the stolen/recreated mod sprites
          const poseCycle = Math.floor(elapsed / 650) % 6;
          const poses = ['idle', 'left', 'down', 'up', 'right', 'idle'] as const;
          const activePose = poses[poseCycle];

          drawOpponentSprite(
            ctx,
            155,
            165,
            selectedSong.initialOpponent,
            activePose,
            elapsed,
            selectedSong.bpm
          );
          drawPlayerSprite(
            ctx,
            365,
            170,
            selectedSong.initialPlayer,
            activePose,
            elapsed,
            selectedSong.bpm,
            selectedSong.stageTheme
          );
        }
      }
      rafId = requestAnimationFrame(animatePreview);
    };

    rafId = requestAnimationFrame(animatePreview);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, selectedSong]);

  const startSong = (songId: SongId = selectedSongId) => {
    soundEngine.playMenuTick(true);
    setSelectedSongId(songId);
    setRunKey((prev) => prev + 1);
    setLastRunStats(null);
    setGameState('PLAYING');
  };

  const handleSongComplete = (finalStats: PlayStats) => {
    setLastRunStats(finalStats);
    const acc =
      finalStats.totalNotesEncountered > 0
        ? ((finalStats.sicks +
            finalStats.goods * 0.85 +
            finalStats.bads * 0.5 +
            finalStats.shits * 0.2) /
            finalStats.totalNotesEncountered) *
          100
        : 100;
    const grade = calculateGrade(acc, finalStats.misses);

    setHighScores((prev) => {
      const existing = prev[selectedSong.id];
      if (!existing || finalStats.score > existing.score) {
        const updated = {
          ...prev,
          [selectedSong.id]: {
            score: finalStats.score,
            accuracy: Number(acc.toFixed(1)),
            misses: finalStats.misses,
            maxCombo: finalStats.maxCombo,
            grade,
            clearedAt: new Date().toLocaleDateString(),
          },
        };
        try {
          localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });

    setGameState('ROUND_SUMMARY');
  };

  const handleGameOver = (finalStats: PlayStats) => {
    soundEngine.playStaticBurst();
    setLastRunStats(finalStats);
    setGameState('GAME_OVER');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09080D] text-[#F4F4F6]">
      {/* Top Bar Contract: Single-Row, 3 Zones */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D0B14]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setGameState('TITLE_MENU');
          }}
          className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap"
        >
          sonicexe
        </a>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setSongFilter('all');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'all' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            All Tracks (7)
          </button>
          <button
            onClick={() => {
              setSongFilter('main');
              setSelectedSongId('too-slow');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'main' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            Main Week
          </button>
          <button
            onClick={() => {
              setSongFilter('encore');
              setSelectedSongId('too-slow-encore');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'encore' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            Encore Mixes
          </button>
          <button
            onClick={() => {
              setSongFilter('soundtest');
              setSelectedSongId('endless');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'soundtest' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Sound Test
          </button>
          <button
            onClick={() => {
              soundEngine.playMenuTick(true);
              setSettings((s) => ({
                ...s,
                modVersion:
                  s.modVersion === 'v3.0' ? 'v4.00000000' : 'v3.0',
              }));
            }}
            className="hover:text-red-400 transition-colors font-mono text-xs text-slate-400 whitespace-nowrap"
          >
            Build: {settings.modVersion}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsKeybindsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap"
          >
            <Keyboard className="w-4 h-4 text-red-500" />
            Keybinds ({formatKeyCode(keybinds.left)}/{formatKeyCode(keybinds.down)}/
            {formatKeyCode(keybinds.up)}/{formatKeyCode(keybinds.right)})
          </button>
          <button
            onClick={() =>
              gameState === 'PLAYING'
                ? setGameState('PAUSED')
                : startSong(selectedSong.id)
            }
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap"
          >
            {gameState === 'PLAYING' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Song
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Track
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {gameState === 'TITLE_MENU' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Freeplay & Sound Test Tracklist */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-red-400 font-mono tracking-wide">
                    SEGA GENESIS ROM VAULT · {settings.modVersion} EDITION
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    Select Cartridge Track
                  </h1>
                </div>

                {/* Interactive Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#13111C] rounded-lg border border-white/10">
                  {(
                    [
                      { id: 'all', label: 'All (7)' },
                      { id: 'main', label: 'Main Week' },
                      { id: 'encore', label: 'Encore' },
                      { id: 'soundtest', label: 'Endless' },
                    ] as { id: SongFilter; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundEngine.playMenuTick(false);
                        setSongFilter(tab.id);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        songFilter === tab.id
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Song List Cards */}
              <div className="space-y-3">
                {filteredSongs.map((song, idx) => {
                  const isSelected = song.id === selectedSong.id;
                  const record = highScores[song.id];
                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        soundEngine.playMenuTick(false);
                        setSelectedSongId(song.id);
                      }}
                      onDoubleClick={() => startSong(song.id)}
                      className={`group cursor-pointer rounded-xl p-4 transition-all border ${
                        isSelected
                          ? 'bg-[#171424] border-red-500/70 shadow-lg'
                          : 'bg-[#110F19] border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-500 tabular-nums">
                              0{idx + 1}.
                            </span>
                            <h2 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                              {song.title}
                            </h2>
                          </div>

                          {/* Zero-Pill Unboxed Metadata with typographic separators */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pl-7">
                            <span
                              className="font-semibold"
                              style={{ color: song.accentColor }}
                            >
                              {song.difficultyLabel}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{song.modVersionOrigin}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {song.bpm} BPM
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{song.composer}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pl-7 sm:pl-0">
                          {record ? (
                            <div className="text-right font-mono text-xs tabular-nums">
                              <div className="text-emerald-400 font-bold">
                                {record.grade} · {record.accuracy}%
                              </div>
                              <div className="text-slate-400">
                                {record.score.toLocaleString()} pts
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">
                              UNPLAYED
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startSong(song.id);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: song.accentColor }}
                          >
                            Play Track
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (5 cols): Stage Preview, Animated Sprites & Controls Inspector */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-xl overflow-hidden bg-[#12101B] border border-white/10">
                {/* Stage Artwork Preview with Animated Character Sprites Overlay */}
                <div className="relative h-64 w-full overflow-hidden bg-[#09080D]">
                  <img
                    src={selectedSong.stageImage}
                    alt={selectedSong.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12101B] via-black/30 to-transparent" />

                  {/* Live Animated Opponent vs Boyfriend Sprite Preview */}
                  <canvas
                    ref={previewCanvasRef}
                    width={520}
                    height={230}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />

                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-200">
                    <span>STAGE: {selectedSong.subtitle.toUpperCase()}</span>
                    <span>
                      {Math.floor(selectedSong.durationSec / 60)}:
                      {String(selectedSong.durationSec % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Song Details & Mechanics */}
                <div className="p-6 space-y-5">
                  <div>
                    <div className="text-xs text-slate-400">
                      {selectedSong.subtitle} · {selectedSong.modVersionOrigin}
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mt-0.5">
                      {selectedSong.title}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {selectedSong.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Stage Mechanics:</span>
                      <span className="font-medium text-right">
                        {selectedSong.mechanicsSummary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Chart Speed:</span>
                      <span className="font-mono tabular-nums">
                        {(
                          selectedSong.scrollSpeed *
                          settings.scrollSpeedMultiplier
                        ).toFixed(2)}{' '}
                        ({settings.downscroll ? 'Downscroll' : 'Upscroll'})
                      </span>
                    </div>
                  </div>

                  {/* Quick Keybinds & Modifiers Bar */}
                  <div className="p-3.5 rounded-lg bg-[#09080D] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Active Note Keybinds
                      </span>
                      <button
                        onClick={() => setIsKeybindsOpen(true)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                      >
                        Customize Keybinds →
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="py-1.5 rounded bg-white/5 border border-[#C24B99]/50 text-white font-bold">
                        ← {formatKeyCode(keybinds.left)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#00FFFF]/50 text-white font-bold">
                        ↓ {formatKeyCode(keybinds.down)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#12FA05]/50 text-white font-bold">
                        ↑ {formatKeyCode(keybinds.up)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#F9393F]/50 text-white font-bold">
                        → {formatKeyCode(keybinds.right)}
                      </div>
                    </div>
                  </div>

                  {/* Primary Launch CTA + Botplay Showcase Toggle */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => startSong(selectedSong.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-98 whitespace-nowrap"
                      style={{ backgroundColor: selectedSong.accentColor }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start {selectedSong.title}
                    </button>

                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, botplay: !s.botplay }))
                      }
                      className={`px-4 py-3 rounded-lg text-xs font-mono font-bold border transition-colors whitespace-nowrap ${
                        settings.botplay
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                      }`}
                      title="Let CPU auto-hit 100% SICK!! to watch stage transitions"
                    >
                      {settings.botplay ? 'BOTPLAY: ON' : 'BOTPLAY: OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Gameplay / Paused State */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <div className="space-y-4">
            {/* Quick Stage Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1280px] mx-auto px-1">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium transition-colors whitespace-nowrap"
                >
                  ← Back to Freeplay
                </button>
                <button
                  onClick={() => setRunKey((k) => k + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart ({formatKeyCode(keybinds.reset)})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      downscroll: !s.downscroll,
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors whitespace-nowrap"
                >
                  {settings.downscroll ? 'Downscroll' : 'Upscroll'}
                </button>

                <button
                  onClick={() =>
                    setSettings((s) => ({ ...s, botplay: !s.botplay }))
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                    settings.botplay
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {settings.botplay ? 'Botplay: ON' : 'Botplay: OFF'}
                </button>

                <button
                  onClick={() => {
                    const nextVol = settings.musicVolume > 0 ? 0 : 0.75;
                    soundEngine.setVolume(nextVol);
                    setSettings((s) => ({ ...s, musicVolume: nextVol }));
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                  aria-label="Toggle Mute"
                >
                  {settings.musicVolume > 0 ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  )}
                </button>

                <button
                  onClick={() => setIsKeybindsOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
                >
                  Change Keybinds
                </button>
              </div>
            </div>

            <div className="relative">
              <FnfStageCanvas
                key={`${selectedSong.id}-${runKey}`}
                song={selectedSong}
                keybinds={keybinds}
                settings={settings}
                isPaused={gameState === 'PAUSED' || isKeybindsOpen}
                onPauseToggle={() =>
                  setGameState((st) =>
                    st === 'PAUSED' ? 'PLAYING' : 'PAUSED'
                  )
                }
                onSongComplete={handleSongComplete}
                onGameOver={handleGameOver}
                onRestart={() => {
                  setGameState('PLAYING');
                  setRunKey((k) => k + 1);
                }}
              />

              {/* Pause Overlay Modal */}
              {gameState === 'PAUSED' && !isKeybindsOpen && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                  <div className="w-full max-w-md p-6 rounded-xl bg-[#12101B] border border-white/15 text-center space-y-5 shadow-2xl">
                    <div>
                      <p className="text-xs font-mono text-red-400">
                        PAUSED · {selectedSong.modVersionOrigin}
                      </p>
                      <h2 className="text-2xl font-extrabold text-white mt-1">
                        {selectedSong.title}
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setGameState('PLAYING')}
                        className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
                      >
                        Resume Song
                      </button>
                      <button
                        onClick={() => {
                          setRunKey((k) => k + 1);
                          setGameState('PLAYING');
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                      >
                        Restart Track
                      </button>
                      <button
                        onClick={() => setIsKeybindsOpen(true)}
                        className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                      >
                        Change Keybinds & Scroll Settings
                      </button>
                      <button
                        onClick={() => setGameState('TITLE_MENU')}
                        className="w-full py-2.5 px-4 rounded-lg bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        Exit to Freeplay Vault
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Round Summary / Victory or Game Over Modal */}
        {(gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') &&
          lastRunStats && (
            <div className="max-w-2xl mx-auto my-8 p-8 rounded-xl bg-[#12101B] border border-white/15 shadow-2xl space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-mono text-slate-400">
                    {gameState === 'GAME_OVER'
                      ? selectedSong.id.includes('endless')
                        ? 'FUN IS INFINITE WITH SEGA ENTERPRISES'
                        : 'YOU WERE TOO SLOW · HEALTH DEPLETED'
                      : 'TRACK CLEARED · STAGE COMPLETE'}
                  </p>
                  <h2 className="text-3xl font-extrabold text-white mt-1">
                    {selectedSong.title}
                  </h2>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">RANK</div>
                  <div
                    className={`text-2xl font-extrabold ${
                      gameState === 'GAME_OVER'
                        ? 'text-red-500'
                        : 'text-emerald-400'
                    }`}
                  >
                    {gameState === 'GAME_OVER'
                      ? 'FAILED'
                      : calculateGrade(
                          lastRunStats.totalNotesEncountered > 0
                            ? ((lastRunStats.sicks +
                                lastRunStats.goods * 0.85 +
                                lastRunStats.bads * 0.5 +
                                lastRunStats.shits * 0.2) /
                                lastRunStats.totalNotesEncountered) *
                                100
                            : 100,
                          lastRunStats.misses
                        )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums">
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">FINAL SCORE</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {lastRunStats.score.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">MAX COMBO</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {lastRunStats.maxCombo}x
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">SICK!! HITS</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {lastRunStats.sicks}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">MISSES</div>
                  <div className="text-xl font-bold text-red-400 mt-1">
                    {lastRunStats.misses}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Back to Freeplay Vault
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsKeybindsOpen(true)}
                    className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Adjust Keybinds
                  </button>
                  <button
                    onClick={() => startSong(selectedSong.id)}
                    className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Keybinds & Psych Engine Settings Modal */}
      <KeybindsModal
        isOpen={isKeybindsOpen}
        onClose={() => setIsKeybindsOpen(false)}
        keybinds={keybinds}
        onChangeKeybinds={setKeybinds}
        settings={settings}
        onChangeSettings={setSettings}
      />
    </div>
  );
}
