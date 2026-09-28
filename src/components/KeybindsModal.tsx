import React, { useEffect, useState } from 'react';
import { Keyboard, RotateCcw, Sliders, Volume2, X } from 'lucide-react';
import { GameplaySettings, KeybindConfig } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface KeybindsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keybinds: KeybindConfig;
  onChangeKeybinds: (next: KeybindConfig) => void;
  settings: GameplaySettings;
  onChangeSettings: (next: GameplaySettings) => void;
}

export const DEFAULT_KEYBINDS: KeybindConfig = {
  left: 'KeyD',
  down: 'KeyF',
  up: 'KeyJ',
  right: 'KeyK',
  ring: 'Space',
  pause: 'Enter',
  reset: 'KeyR',
};

export function formatKeyCode(code: string): string {
  if (!code) return 'NONE';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ArrowLeft') return '← LEFT';
  if (code === 'ArrowDown') return '↓ DOWN';
  if (code === 'ArrowUp') return '↑ UP';
  if (code === 'ArrowRight') return '→ RIGHT';
  if (code === 'Space') return 'SPACE';
  if (code === 'Period') return '.';
  if (code === 'Comma') return ',';
  if (code === 'Slash') return '/';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  return code.toUpperCase();
}

export const KeybindsModal: React.FC<KeybindsModalProps> = ({
  isOpen,
  onClose,
  keybinds,
  onChangeKeybinds,
  settings,
  onChangeSettings,
}) => {
  const [listeningField, setListeningField] = useState<keyof KeybindConfig | null>(null);

  useEffect(() => {
    if (!listeningField) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        setListeningField(null);
        return;
      }

      onChangeKeybinds({
        ...keybinds,
        [listeningField]: e.code,
      });
      soundEngine.playMenuTick(true);
      setListeningField(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [listeningField, keybinds, onChangeKeybinds]);

  if (!isOpen) return null;

  const applyPreset = (preset: Partial<KeybindConfig>) => {
    soundEngine.playMenuTick(true);
    onChangeKeybinds({
      ...keybinds,
      ...preset,
    });
  };

  const laneSlots: {
    field: keyof KeybindConfig;
    label: string;
    sublabel: string;
    accent: string;
  }[] = [
    {
      field: 'left',
      label: 'Left Note (←)',
      sublabel: 'Also accepts ← Arrow unless rebound',
      accent: '#C24B99',
    },
    {
      field: 'down',
      label: 'Down Note (↓)',
      sublabel: 'Also accepts ↓ Arrow unless rebound',
      accent: '#00FFFF',
    },
    {
      field: 'up',
      label: 'Up Note (↑)',
      sublabel: 'Also accepts ↑ Arrow unless rebound',
      accent: '#12FA05',
    },
    {
      field: 'right',
      label: 'Right Note (→)',
      sublabel: 'Also accepts → Arrow unless rebound',
      accent: '#F9393F',
    },
    {
      field: 'ring',
      label: 'Ring Shield / Space',
      sublabel: 'Used in Triple Trouble & Encore mode',
      accent: '#FACC15',
    },
    {
      field: 'pause',
      label: 'Pause Song',
      sublabel: 'Pause / Resume active chart',
      accent: '#94A3B8',
    },
    {
      field: 'reset',
      label: 'Quick Restart',
      sublabel: 'Instant restart from 0:00',
      accent: '#EF4444',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl bg-[#111018] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171522]">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              Controls & Engine Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close Controls Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Keybinds */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Custom Keybinds (Click any button & press a key)
              </h3>
              <button
                onClick={() => applyPreset(DEFAULT_KEYBINDS)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>

            {/* One-Click Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 mr-1">Quick Presets:</span>
              <button
                onClick={() =>
                  applyPreset({
                    left: 'KeyD',
                    down: 'KeyF',
                    up: 'KeyJ',
                    right: 'KeyK',
                  })
                }
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
              >
                DFJK
              </button>
              <button
                onClick={() =>
                  applyPreset({
                    left: 'KeyA',
                    down: 'KeyS',
                    up: 'KeyW',
                    right: 'KeyD',
                  })
                }
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
              >
                WASD
              </button>
              <button
                onClick={() =>
                  applyPreset({
                    left: 'ArrowLeft',
                    down: 'ArrowDown',
                    up: 'ArrowUp',
                    right: 'ArrowRight',
                  })
                }
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
              >
                Arrows
              </button>
              <button
                onClick={() =>
                  applyPreset({
                    left: 'KeyA',
                    down: 'KeyS',
                    up: 'KeyK',
                    right: 'KeyL',
                  })
                }
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
              >
                ASKL
              </button>
              <button
                onClick={() =>
                  applyPreset({
                    left: 'KeyZ',
                    down: 'KeyX',
                    up: 'Period',
                    right: 'Slash',
                  })
                }
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
              >
                ZX./
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {laneSlots.map((slot) => {
                const isListening = listeningField === slot.field;
                return (
                  <div
                    key={slot.field}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#171522] border border-white/5"
                  >
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: slot.accent }}
                      >
                        {slot.label}
                      </div>
                      <div className="text-xs text-slate-400">{slot.sublabel}</div>
                    </div>

                    <button
                      onClick={() =>
                        setListeningField(isListening ? null : slot.field)
                      }
                      className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all whitespace-nowrap min-w-[110px] text-center ${
                        isListening
                          ? 'bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
                          : 'bg-[#09080D] text-white border border-white/15 hover:border-white/40'
                      }`}
                    >
                      {isListening
                        ? 'PRESS KEY...'
                        : formatKeyCode(keybinds[slot.field])}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Gameplay & Visual Modifiers */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Psych Engine Modifiers
                </h3>
              </div>

              {/* Scroll Direction */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-sm font-medium text-white">Scroll Direction</div>
                  <div className="text-xs text-slate-400">
                    Receptor position on screen
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#09080D] rounded-lg border border-white/10">
                  <button
                    onClick={() =>
                      onChangeSettings({ ...settings, downscroll: false })
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      !settings.downscroll
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upscroll
                  </button>
                  <button
                    onClick={() =>
                      onChangeSettings({ ...settings, downscroll: true })
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      settings.downscroll
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Downscroll
                  </button>
                </div>
              </div>

              {/* Ghost Tapping */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-sm font-medium text-white">Ghost Tapping</div>
                  <div className="text-xs text-slate-400">
                    Prevent misses when pressing empty lanes
                  </div>
                </div>
                <button
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      ghostTapping: !settings.ghostTapping,
                    })
                  }
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors whitespace-nowrap ${
                    settings.ghostTapping
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {settings.ghostTapping ? 'ENABLED' : 'STRICT'}
                </button>
              </div>

              {/* Botplay / Showcase Mode */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-sm font-medium text-white">Botplay (CPU Auto)</div>
                  <div className="text-xs text-slate-400">
                    CPU hits 100% SICK!! to showcase stage swaps
                  </div>
                </div>
                <button
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      botplay: !settings.botplay,
                    })
                  }
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors whitespace-nowrap ${
                    settings.botplay
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {settings.botplay ? 'BOTPLAY ON' : 'MANUAL'}
                </button>
              </div>

              {/* CRT Scanlines */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-sm font-medium text-white">Genesis CRT Shader</div>
                  <div className="text-xs text-slate-400">
                    Authentic Sonic.exe scanlines & vignette
                  </div>
                </div>
                <button
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      crtFilter: !settings.crtFilter,
                    })
                  }
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors whitespace-nowrap ${
                    settings.crtFilter
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {settings.crtFilter ? 'CRT ON' : 'OFF'}
                </button>
              </div>

              {/* Scroll Speed Multiplier */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Note Scroll Speed Multiplier
                  </span>
                  <span className="font-mono font-bold text-red-400 tabular-nums">
                    {settings.scrollSpeedMultiplier.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.6}
                  step={0.05}
                  value={settings.scrollSpeedMultiplier}
                  onChange={(e) =>
                    onChangeSettings({
                      ...settings,
                      scrollSpeedMultiplier: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Master Music & Synth Volume */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-red-400" />
                    Master Synth & Drums Volume
                  </span>
                  <span className="font-mono font-bold text-slate-200 tabular-nums">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.musicVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    soundEngine.setVolume(val);
                    onChangeSettings({
                      ...settings,
                      musicVolume: val,
                    });
                  }}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 bg-[#171522] border-t border-white/10">
          <span className="text-xs text-slate-400">
            Tip: Arrow keys also work alongside your custom keybinds during gameplay.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wide transition-colors whitespace-nowrap"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
};
