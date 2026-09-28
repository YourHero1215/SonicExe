import {
  CharacterPose,
  ChartNote,
  Direction,
  OpponentCharacterId,
  PlayerCharacterId,
  StageThemeId,
} from '../types/game';

export const LANE_COLORS: Record<Direction, string> = {
  0: '#C24B99', // FNF Left Purple
  1: '#00FFFF', // FNF Down Cyan
  2: '#12FA05', // FNF Up Green
  3: '#F9393F', // FNF Right Red
};

// Helper to draw directional arrow inside receptor or note
export function drawFnfArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  dir: Direction,
  fillColor: string,
  isReceptor = false,
  isPressed = false,
  special: 'normal' | 'static' | 'phantom' | 'ring' = 'normal'
) {
  ctx.save();
  ctx.translate(x, y);

  if (special === 'ring') {
    // Draw Sonic Golden Ring Note
    const r = size * 0.42;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = '#FACC15';
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.05;
    ctx.strokeStyle = '#FEF08A';
    ctx.stroke();
    ctx.restore();
    return;
  }

  const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
  ctx.rotate(rotations[dir]);

  const scale = isPressed ? 0.92 : 1.0;
  ctx.scale(scale, scale);

  const half = size * 0.45;

  ctx.beginPath();
  // Pointing right (0 rad), rotated per direction
  ctx.moveTo(half, 0);
  ctx.lineTo(0, -half);
  ctx.lineTo(0, -half * 0.42);
  ctx.lineTo(-half, -half * 0.42);
  ctx.lineTo(-half, half * 0.42);
  ctx.lineTo(0, half * 0.42);
  ctx.lineTo(0, half);
  ctx.closePath();

  if (special === 'static') {
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = '#09080D';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 14;
  } else if (special === 'phantom') {
    ctx.fillStyle = '#581C87';
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 3;
  } else if (isReceptor) {
    ctx.fillStyle = isPressed ? fillColor : 'rgba(24, 24, 34, 0.78)';
    ctx.strokeStyle = isPressed ? '#FFFFFF' : '#94A3B8';
    ctx.lineWidth = isPressed ? 3.5 : 2.5;
    if (isPressed) {
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 16;
    }
  } else {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#09080D';
    ctx.lineWidth = 3;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = 8;
  }

  ctx.fill();
  ctx.stroke();

  // Inner highlight
  if (!isReceptor && special === 'normal') {
    ctx.beginPath();
    ctx.moveTo(half * 0.65, 0);
    ctx.lineTo(half * 0.08, -half * 0.55);
    ctx.lineTo(half * 0.08, half * 0.55);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fill();
  }

  ctx.restore();
}

// Draw 16-bit Sega Genesis Green Hill Zone pixel stage for You Can't Run's iconic mid-song switch
export function drawPixelGenesisStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number
) {
  ctx.save();
  // Deep crimson-indigo 16-bit sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.68);
  skyGrad.addColorStop(0, '#1A051D');
  skyGrad.addColorStop(0.55, '#4A081E');
  skyGrad.addColorStop(1, '#8C1127');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Pixelated scrolling clouds/mountains
  const scroll = (timeMs * 0.04) % 160;
  ctx.fillStyle = '#2B0918';
  for (let x = -160; x < w + 160; x += 160) {
    const drawX = Math.floor((x - scroll) / 8) * 8;
    ctx.fillRect(drawX, h * 0.45, 96, h * 0.25);
    ctx.fillRect(drawX + 24, h * 0.38, 48, h * 0.08);
  }

  // Animated shimmering blood waterfall in background
  ctx.fillStyle = '#B91C1C';
  for (let x = 80; x < w; x += 280) {
    const wave = Math.floor(((timeMs * 0.02 + x) % 24) / 6) * 6;
    ctx.fillRect(x, h * 0.52, 40, h * 0.22);
    ctx.fillStyle = '#F87171';
    ctx.fillRect(x + 8, h * 0.52 + wave, 8, 24);
    ctx.fillRect(x + 24, h * 0.56 + wave, 8, 24);
    ctx.fillStyle = '#B91C1C';
  }

  // Classic Sega Genesis Brown Checkerboard Ground
  const groundY = Math.floor(h * 0.72);
  const tileSize = 28;
  for (let y = groundY; y < h; y += tileSize) {
    for (let x = 0; x < w; x += tileSize) {
      const col = Math.floor(x / tileSize);
      const row = Math.floor((y - groundY) / tileSize);
      ctx.fillStyle = (col + row) % 2 === 0 ? '#5C2C16' : '#38180B';
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  // Corrupted Crimson Grass Top Strip
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(0, groundY - 14, w, 14);
  ctx.fillStyle = '#7F1D1D';
  for (let x = 0; x < w; x += 24) {
    ctx.fillRect(x, groundY, 12, 10);
  }

  ctx.restore();
}

// Draw Girlfriend on the FNF Speaker Box in the background bopping to the BPM
export function drawSpeakerGirlfriend(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bpm: number,
  timeMs: number,
  stageTheme: StageThemeId
) {
  ctx.save();
  const beatPeriod = 60000 / bpm;
  const beatPhase = (timeMs % beatPeriod) / beatPeriod;
  const bop = Math.sin(beatPhase * Math.PI * 2) * 5;
  const headTilt = Math.cos(beatPhase * Math.PI) * 0.08;

  ctx.translate(cx, cy);

  // Giant Boombox Speakers
  const isBlue = stageTheme === 'endless-majin';
  ctx.fillStyle = isBlue ? '#0F172A' : '#18181B';
  ctx.strokeStyle = isBlue ? '#3B82F6' : '#3F3F46';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-110, -45, 220, 85, 8);
  ctx.fill();
  ctx.stroke();

  // Speaker Cones pulsing with the beat
  const conePulse = 1 + Math.max(0, 1 - beatPhase * 3) * 0.14;
  [-65, 65].forEach((sx) => {
    ctx.save();
    ctx.translate(sx, -2);
    ctx.scale(conePulse, conePulse);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#09090B';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = isBlue ? '#60A5FA' : '#71717A';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = isBlue ? '#2563EB' : '#27272A';
    ctx.fill();
    ctx.restore();
  });

  // Girlfriend sitting on top of the speakers
  ctx.translate(0, -52 + Math.abs(bop) * 0.5);
  // Auburn hair back
  ctx.fillStyle = isBlue ? '#1D4ED8' : '#7F1D1D';
  ctx.beginPath();
  ctx.arc(0, -28, 34, 0, Math.PI * 2);
  ctx.fill();

  // Red Dress
  ctx.fillStyle = isBlue ? '#2563EB' : '#DC2626';
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.lineTo(22, 10);
  ctx.lineTo(14, -20);
  ctx.lineTo(-14, -20);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.save();
  ctx.translate(0, -32);
  ctx.rotate(headTilt);
  ctx.fillStyle = isBlue ? '#93C5FD' : '#FDE68A';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#09080D';
  ctx.beginPath();
  ctx.arc(-6, 2, 2.5, 0, Math.PI * 2);
  ctx.arc(6, 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// Draw Opponent Character Sprite (Sonic.exe, YCR, Pixel, Xenophanes, Souls, Majin Sonic)
export function drawOpponentSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  character: OpponentCharacterId,
  pose: CharacterPose,
  timeMs: number,
  bpm: number
) {
  ctx.save();
  const beatPeriod = 60000 / bpm;
  const idleBop =
    pose === 'idle'
      ? Math.abs(Math.sin((timeMs / beatPeriod) * Math.PI)) * 10
      : 0;

  // Directional pose offsets & squash/stretch
  let dx = 0;
  let dy = idleBop;
  let sx = 1;
  let sy = 1;

  if (pose === 'left') {
    dx = -24;
    sx = 1.08;
    sy = 0.96;
  } else if (pose === 'right') {
    dx = 26;
    sx = 1.1;
    sy = 0.95;
  } else if (pose === 'up') {
    dy = -26;
    sx = 0.92;
    sy = 1.14;
  } else if (pose === 'down') {
    dy = 18;
    sx = 1.14;
    sy = 0.86;
  }

  ctx.translate(x + dx, y + dy);
  ctx.scale(sx, sy);

  // Character-specific palettes & silhouettes
  const isXenophanes = character === 'xenophanes';
  const isMajin = character === 'majin' || character === 'majin-og';
  const isPixel = character === 'pixel-exe';
  const isTails = character === 'tails-soul';
  const isKnuckles = character === 'knuckles-soul';
  const isEggman = character === 'eggman-soul';

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 82, isXenophanes ? 72 : 54, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isXenophanes) {
    // Towering Xenophanes scale & glowing purple crystals
    ctx.scale(1.18, 1.22);
    // Purple crystal spikes behind head & shoulders
    ctx.fillStyle = '#A855F7';
    ctx.strokeStyle = '#F3E8FF';
    ctx.lineWidth = 2;
    const spikes = [
      [-65, -90, -25, -45, -45, -15],
      [-78, -45, -30, -25, -40, 5],
      [62, -85, 25, -45, 42, -15],
      [-15, -135, -5, -80, 18, -82],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of spikes) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  const primaryFur = isMajin
    ? character === 'majin-og'
      ? '#1E3A8A'
      : '#2563EB'
    : isXenophanes
      ? '#311042'
      : isTails
        ? '#52525B'
        : isKnuckles
          ? '#451A1A'
          : isEggman
            ? '#3F3F46'
            : '#172554';

  const muzzleColor = isMajin
    ? '#60A5FA'
    : isTails || isKnuckles || isEggman
      ? '#A1A1AA'
      : '#D6B485';

  // Legs & Iconic Shoes
  ctx.strokeStyle = primaryFur;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-18, 22);
  ctx.lineTo(-22, 68);
  ctx.moveTo(18, 22);
  ctx.lineTo(24, 68);
  ctx.stroke();

  // Shoes (Red with white stripe, or Blue for Majin)
  ctx.fillStyle = isMajin ? '#1D4ED8' : '#DC2626';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3;
  [-24, 24].forEach((shoeX) => {
    ctx.beginPath();
    ctx.ellipse(shoeX + 6, 74, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // White strap
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(shoeX, 66, 8, 15);
    ctx.fillStyle = isMajin ? '#1D4ED8' : '#DC2626';
  });

  // Torso
  ctx.fillStyle = primaryFur;
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 2, isEggman ? 44 : 28, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly patch (blood-stained X on Xenophanes/Sonic.exe)
  ctx.fillStyle = muzzleColor;
  ctx.beginPath();
  ctx.ellipse(4, 4, 17, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head & Quills
  ctx.save();
  ctx.translate(0, -48);

  // Back Quills sweeping left
  ctx.fillStyle = primaryFur;
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-10, -34);
  ctx.lineTo(-78, -26);
  ctx.lineTo(-32, -4);
  ctx.lineTo(-82, 8);
  ctx.lineTo(-28, 18);
  ctx.lineTo(-64, 34);
  ctx.lineTo(0, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main Head Sphere
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = primaryFur;
  ctx.fill();
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.moveTo(-20, -28);
  ctx.lineTo(-30, -56);
  ctx.lineTo(-4, -34);
  ctx.moveTo(12, -30);
  ctx.lineTo(24, -56);
  ctx.lineTo(28, -24);
  ctx.fillStyle = primaryFur;
  ctx.fill();
  ctx.stroke();

  // Muzzle
  ctx.beginPath();
  ctx.ellipse(8, 12, 28, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle = muzzleColor;
  ctx.fill();
  ctx.stroke();

  // Eyes: Majin has human-shaded blue eyes; Sonic.exe/Xenophanes have pitch-black sockets with glowing crimson pupils & blood tears!
  if (isMajin) {
    ctx.fillStyle = '#DBEAFE';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 9, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -6, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09080D';
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.arc(18, -5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Black eye sockets
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 10, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -6, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bleeding dark crimson streaks under eyes
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(-6, 8, 6, 16);
    ctx.fillRect(14, 8, 6, 16);

    // Glowing Red Pupils (or X-shaped on Xenophanes)
    ctx.fillStyle = isPixel ? '#FACC15' : '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(1, -5, 4.2, 0, Math.PI * 2);
    ctx.arc(19, -5, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Sinister Grin / Singing Mouth depending on Pose
  ctx.fillStyle = '#09080D';
  ctx.beginPath();
  if (pose === 'idle') {
    // Wide toothed grin
    ctx.arc(10, 12, 16, 0.1, Math.PI - 0.1);
  } else if (pose === 'up' || pose === 'right') {
    // Wide screaming mouth
    ctx.ellipse(12, 15, 16, 12, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(10, 14, 13, 8, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Sharp Fangs
  ctx.fillStyle = isMajin ? '#EFF6FF' : '#FEF08A';
  for (let tx = -2; tx <= 20; tx += 6) {
    ctx.beginPath();
    ctx.moveTo(tx, 10);
    ctx.lineTo(tx + 3, 16);
    ctx.lineTo(tx + 6, 10);
    ctx.fill();
  }

  ctx.restore(); // End Head

  // Expressive Arms & Clawed/Pointing Gloves
  ctx.strokeStyle = primaryFur;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(16, -6);
  const handX = pose === 'right' ? 68 : pose === 'left' ? -45 : 48;
  const handY = pose === 'up' ? -68 : pose === 'down' ? 32 : -8;
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Glove (with red blood tips for Sonic.exe, or blue glove for Majin)
  ctx.fillStyle = isMajin ? '#93C5FD' : '#F8FAFC';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(handX, handY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!isMajin) {
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(handX + 8, handY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Boyfriend Sprite (Standard, Encore, or 16-bit Pixel BF)
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  character: PlayerCharacterId,
  pose: CharacterPose,
  timeMs: number,
  bpm: number,
  stageTheme: StageThemeId
) {
  ctx.save();
  const beatPeriod = 60000 / bpm;
  const idleBop =
    pose === 'idle'
      ? Math.abs(Math.sin((timeMs / beatPeriod) * Math.PI)) * 8
      : 0;

  let dx = 0;
  let dy = idleBop;
  let sx = 1;
  let sy = 1;

  if (pose === 'left') {
    dx = -20;
    sx = 1.06;
  } else if (pose === 'right') {
    dx = 20;
    sx = 1.06;
  } else if (pose === 'up') {
    dy = -20;
    sx = 0.94;
    sy = 1.1;
  } else if (pose === 'down') {
    dy = 15;
    sx = 1.1;
    sy = 0.9;
  }

  ctx.translate(x + dx, y + dy);
  ctx.scale(sx, sy);

  const isBlueMajinStage = stageTheme === 'endless-majin';

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 76, 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Baggy Blue Jeans & Red Sneakers
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3.5;
  ctx.fillRect(-24, 28, 20, 38);
  ctx.fillRect(4, 28, 20, 38);

  // Sneakers
  ctx.fillStyle = isBlueMajinStage ? '#2563EB' : '#DC2626';
  [-16, 16].forEach((sxPos) => {
    ctx.beginPath();
    ctx.ellipse(sxPos - 4, 68, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Iconic White Tee with Red Prohibition Circle
  ctx.fillStyle = isBlueMajinStage ? '#BFDBFE' : '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(-28, -14, 56, 46, 12);
  ctx.fill();
  ctx.stroke();

  // Red Prohibition Sign on Shirt
  ctx.strokeStyle = isBlueMajinStage ? '#1D4ED8' : '#EF4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-2, 10, 12, 0, Math.PI * 2);
  ctx.moveTo(-10, 2);
  ctx.lineTo(6, 18);
  ctx.stroke();

  // Head
  ctx.save();
  ctx.translate(0, -42);
  ctx.fillStyle = isBlueMajinStage ? '#93C5FD' : '#FDE68A';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cyan Spiky Hair
  ctx.fillStyle =
    character === 'bf-encore'
      ? '#22D3EE'
      : isBlueMajinStage
        ? '#3B82F6'
        : '#06B6D4';
  ctx.beginPath();
  ctx.moveTo(-30, -8);
  ctx.lineTo(-46, -18);
  ctx.lineTo(-26, -26);
  ctx.lineTo(-34, -40);
  ctx.lineTo(-8, -30);
  ctx.lineTo(24, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red Backwards Cap (with blue brim)
  ctx.fillStyle = isBlueMajinStage ? '#1D4ED8' : '#EF4444';
  ctx.beginPath();
  ctx.arc(2, -12, 29, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  // Cap Brim pointing right
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.roundRect(18, -18, 28, 10, 5);
  ctx.fill();
  ctx.stroke();

  // Eyes & Mouth
  ctx.fillStyle = pose === 'miss' ? '#EF4444' : '#09080D';
  ctx.beginPath();
  ctx.arc(-12, 0, pose === 'miss' ? 5 : 3.5, 0, Math.PI * 2);
  ctx.arc(4, 0, pose === 'miss' ? 5 : 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  if (pose === 'idle') {
    ctx.moveTo(-10, 12);
    ctx.lineTo(4, 10);
    ctx.stroke();
  } else {
    ctx.ellipse(-4, 13, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Microphone in Left Hand
  const micX = pose === 'left' ? -52 : -38;
  const micY = pose === 'up' ? -36 : 4;
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3;
  ctx.fillRect(micX - 4, micY, 8, 20);
  ctx.beginPath();
  ctx.arc(micX, micY - 4, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#94A3B8';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Draw FNF Health Bar Icon for Opponent & Boyfriend
export function drawHealthIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isPlayer: boolean,
  character: OpponentCharacterId | PlayerCharacterId,
  isLosing: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  const r = 20;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = isPlayer
    ? '#06B6D4'
    : character.includes('majin')
      ? '#2563EB'
      : character === 'xenophanes'
        ? '#9333EA'
        : '#1E1B4B';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // Eyes inside health icon
  ctx.fillStyle = isPlayer ? '#09080D' : '#EF4444';
  if (isLosing) {
    // X eyes when losing
    ctx.strokeStyle = isPlayer ? '#09080D' : '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(-3, 0);
    ctx.moveTo(-3, -6);
    ctx.lineTo(-9, 0);
    ctx.moveTo(3, -6);
    ctx.lineTo(9, 0);
    ctx.moveTo(9, -6);
    ctx.lineTo(3, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-6, -3, 3.5, 0, Math.PI * 2);
    ctx.arc(6, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function calculateGrade(accuracy: number, misses: number): string {
  if (misses === 0 && accuracy >= 99) return 'S+ (SICK FC)';
  if (misses === 0 && accuracy >= 95) return 'S (GFC)';
  if (misses === 0) return 'A+ (FC)';
  if (accuracy >= 92) return 'A';
  if (accuracy >= 82) return 'B';
  if (accuracy >= 70) return 'C';
  return 'D';
}
