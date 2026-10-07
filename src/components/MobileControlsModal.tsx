import React, { useState, useRef, useEffect } from 'react';
import { GameplaySettings, Direction } from '../types/game';

interface MobileControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameplaySettings;
  onChangeSettings: (settings: GameplaySettings) => void;
}

const DEFAULT_MOBILE_POSITIONS: [number, number, number, number] = [0.14, 0.38, 0.62, 0.86];
const MIN_LANE_GAP = 0.05;

function sanitizeOrderedPositions(
  arr?: [number, number, number, number]
): [number, number, number, number] {
  if (!arr || arr.length !== 4) return [...DEFAULT_MOBILE_POSITIONS];
  const p = [...arr] as [number, number, number, number];
  p[0] = Math.max(0.05, Math.min(0.80, p[0]));
  p[1] = Math.max(p[0] + MIN_LANE_GAP, Math.min(0.85, p[1]));
  p[2] = Math.max(p[1] + MIN_LANE_GAP, Math.min(0.90, p[2]));
  p[3] = Math.max(p[2] + MIN_LANE_GAP, Math.min(0.95, p[3]));
  return p;
}

const PRESETS = [
  {
    name: 'Phone',
    icon: '📱',
    desc: 'Compact phone screen spacing (23%, 39%, 61%, 77%)',
    positions: [0.23, 0.39, 0.61, 0.77] as [number, number, number, number],
  },
  {
    name: 'Default Balanced',
    icon: '↔️',
    desc: 'Evenly spread across the bottom (Left ◀ Down ▼ Up ▲ Right ▶)',
    positions: [0.14, 0.38, 0.62, 0.86] as [number, number, number, number],
  },
  {
    name: 'Split Thumbs',
    icon: '👐',
    desc: 'Left/Down on left side, Up/Right on right side',
    positions: [0.12, 0.28, 0.72, 0.88] as [number, number, number, number],
  },
  {
    name: 'Centered Compact',
    icon: '🎯',
    desc: 'Clustered together in order in the center',
    positions: [0.32, 0.44, 0.56, 0.68] as [number, number, number, number],
  },
  {
    name: 'Left-Handed Focus',
    icon: '👈',
    desc: 'Shifted toward the left side of the screen in order',
    positions: [0.08, 0.20, 0.32, 0.44] as [number, number, number, number],
  },
  {
    name: 'Right-Handed Focus',
    icon: '👉',
    desc: 'Shifted toward the right side of the screen in order',
    positions: [0.56, 0.68, 0.80, 0.92] as [number, number, number, number],
  },
];

const LANE_CONFIG = [
  {
    lane: 0 as Direction,
    name: 'Left Note (1st)',
    orderLabel: '1. Leftmost',
    color: '#C24B99',
    bgColor: 'bg-[#C24B99]',
    borderColor: 'border-[#C24B99]',
    textColor: 'text-[#F472B6]',
    path: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  },
  {
    lane: 1 as Direction,
    name: 'Down Note (2nd)',
    orderLabel: '2. Between Left & Up',
    color: '#00FFFF',
    bgColor: 'bg-[#00FFFF]',
    borderColor: 'border-[#00FFFF]',
    textColor: 'text-[#38BDF8]',
    path: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
  },
  {
    lane: 2 as Direction,
    name: 'Up Note (3rd)',
    orderLabel: '3. Between Down & Right',
    color: '#12FF00',
    bgColor: 'bg-[#12FF00]',
    borderColor: 'border-[#12FF00]',
    textColor: 'text-[#4ADE80]',
    path: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  },
  {
    lane: 3 as Direction,
    name: 'Right Note (4th)',
    orderLabel: '4. Rightmost',
    color: '#F9393F',
    bgColor: 'bg-[#F9393F]',
    borderColor: 'border-[#F9393F]',
    textColor: 'text-[#F87171]',
    path: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z',
  },
];

export const MobileControlsModal: React.FC<MobileControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  const currentPositions = sanitizeOrderedPositions(settings.mobileLanePositions);
  const [positions, setPositions] = useState<[number, number, number, number]>(currentPositions);
  const [draggingLane, setDraggingLane] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPositions(sanitizeOrderedPositions(settings.mobileLanePositions));
    }
  }, [isOpen, settings.mobileLanePositions]);

  if (!isOpen) return null;

  const updatePosition = (laneIdx: number, newNormalizedX: number) => {
    setPositions((prev) => {
      const next = [...prev] as [number, number, number, number];

      let minX = 0.05;
      let maxX = 0.95;

      // Enforce strict order: Left < Down < Up < Right (cannot cross over each other)
      if (laneIdx === 0) {
        minX = 0.05;
        maxX = next[1] - MIN_LANE_GAP;
      } else if (laneIdx === 1) {
        minX = next[0] + MIN_LANE_GAP;
        maxX = next[2] - MIN_LANE_GAP;
      } else if (laneIdx === 2) {
        minX = next[1] + MIN_LANE_GAP;
        maxX = next[3] - MIN_LANE_GAP;
      } else if (laneIdx === 3) {
        minX = next[2] + MIN_LANE_GAP;
        maxX = 0.95;
      }

      if (minX > maxX) return prev;

      const clamped = Math.max(minX, Math.min(maxX, Number(newNormalizedX.toFixed(3))));
      next[laneIdx] = clamped;
      return next;
    });
  };

  const handlePointerDown = (laneIdx: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingLane(laneIdx);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingLane === null || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relX = (clientX - rect.left) / rect.width;
    updatePosition(draggingLane, relX);
  };

  const handlePointerUp = () => {
    setDraggingLane(null);
  };

  const applyChanges = (newPositions: [number, number, number, number]) => {
    setPositions(newPositions);
    onChangeSettings({
      ...settings,
      mobileLanePositions: newPositions,
    });
  };

  const handleSaveAndClose = () => {
    onChangeSettings({
      ...settings,
      mobileLanePositions: positions,
    });
    onClose();
  };

  const handleReset = () => {
    applyChanges(DEFAULT_MOBILE_POSITIONS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141424] via-[#0E0E1A] to-[#0A0A12] border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📱</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                Mobile Note Placement (Horizontal Only)
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Adjust horizontal X positions. <span className="text-amber-400 font-semibold">Strict Left → Down → Up → Right order enforced (notes cannot cross over).</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveAndClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Interactive Screen Preview with Draggable Arrows */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <span>🎮</span> Live Horizontal Drag Preview:
              </span>
              <span className="text-[11px] text-cyan-400">Order Locked: Left ◀ | Down ▼ | Up ▲ | Right ▶</span>
            </div>

            <div
              ref={previewRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative w-full h-36 sm:h-44 rounded-xl bg-gradient-to-b from-[#18182E] to-[#0D0D18] border-2 border-slate-700/90 shadow-inner overflow-hidden touch-none"
            >
              {/* Simulated Screen Guides */}
              <div className="absolute inset-x-0 top-2 flex justify-between px-3 text-[10px] text-slate-500 font-mono">
                <span>0% (Left Edge)</span>
                <span className="text-amber-400/80">↕ Locked to Bottom Strumline</span>
                <span>100% (Right Edge)</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 h-20 border-t border-dashed border-white/10 bg-white/[0.015]" />

              {/* Draggable Note Arrows (Horizontal Only) */}
              {LANE_CONFIG.map((cfg) => {
                const pos = positions[cfg.lane];
                const pct = pos * 100;
                const isDragging = draggingLane === cfg.lane;

                return (
                  <div
                    key={cfg.lane}
                    onPointerDown={(e) => handlePointerDown(cfg.lane, e)}
                    style={{
                      left: `${pct}%`,
                      bottom: '12px',
                      transform: 'translateX(-50%)',
                    }}
                    className={`absolute flex flex-col items-center cursor-ew-resize group select-none transition-transform duration-75 ${
                      isDragging ? 'scale-110 z-30' : 'z-20 hover:scale-105'
                    }`}
                  >
                    {/* Position Label Tag */}
                    <div
                      className={`mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md whitespace-nowrap ${
                        isDragging ? 'bg-white text-black' : 'bg-black/80 text-white border border-white/20'
                      }`}
                    >
                      {Math.round(pct)}%
                    </div>

                    {/* FNF Vector Arrow Icon */}
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center bg-black/60 shadow-lg ${
                        cfg.borderColor
                      } ${isDragging ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-7 h-7 sm:w-9 sm:h-9 fill-current"
                        style={{ color: cfg.color }}
                      >
                        <path d={cfg.path} />
                      </svg>
                    </div>

                    {/* Drag Handle Indicator */}
                    <div className="mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {cfg.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> Quick Layout Presets:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyChanges(preset.positions)}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-cyan-400 text-left transition-all space-y-1 group"
                >
                  <div className="font-bold text-white group-hover:text-cyan-300 flex items-center gap-1">
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Sliders & Fine-Tune Controls */}
          <div className="space-y-2.5 pt-1">
            <div className="font-bold text-slate-300 flex items-center justify-between">
              <span>🎯 Fine-Tune Horizontal Positions (0% – 100%):</span>
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Reset to Default (14%, 38%, 62%, 86%)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LANE_CONFIG.map((cfg) => {
                const pos = positions[cfg.lane];
                const pct = Math.round(pos * 100);

                // Calculate allowed min/max boundaries so this note stays in order
                let minBound = 0.05;
                let maxBound = 0.95;
                if (cfg.lane === 0) {
                  maxBound = Math.max(0.05, positions[1] - MIN_LANE_GAP);
                } else if (cfg.lane === 1) {
                  minBound = Math.min(0.95, positions[0] + MIN_LANE_GAP);
                  maxBound = Math.max(minBound, positions[2] - MIN_LANE_GAP);
                } else if (cfg.lane === 2) {
                  minBound = Math.min(0.95, positions[1] + MIN_LANE_GAP);
                  maxBound = Math.max(minBound, positions[3] - MIN_LANE_GAP);
                } else if (cfg.lane === 3) {
                  minBound = Math.min(0.95, positions[2] + MIN_LANE_GAP);
                }

                return (
                  <div
                    key={cfg.lane}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <div>
                          <span className="font-bold text-white">{cfg.name}</span>
                          <span className="text-[10px] text-slate-400 block">{cfg.orderLabel}</span>
                        </div>
                      </div>
                      <span className={`font-bold px-2 py-0.5 rounded bg-black/60 border border-white/10 ${cfg.textColor}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePosition(cfg.lane, pos - 0.02)}
                        disabled={pos <= minBound + 0.005}
                        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center transition-colors"
                        title="Nudge Left"
                      >
                        ◀
                      </button>
                      <input
                        type="range"
                        min={minBound}
                        max={maxBound}
                        step="0.01"
                        value={pos}
                        onChange={(e) => updatePosition(cfg.lane, parseFloat(e.target.value))}
                        className="flex-1 accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <button
                        onClick={() => updatePosition(cfg.lane, pos + 0.02)}
                        disabled={pos >= maxBound - 0.005}
                        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center transition-colors"
                        title="Nudge Right"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-black/50 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold font-mono transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono shadow-lg transition-colors"
          >
            Save & Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
};
