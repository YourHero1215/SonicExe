import { SongId } from '../types/game';

interface CachedPolishedStage {
  skyNormal: HTMLCanvasElement;
  skyEncore: HTMLCanvasElement;
  treesMidBack: HTMLCanvasElement;
  treesMid: HTMLCanvasElement;
  treesOuterMid: HTMLCanvasElement;
  treesLeftRight: HTMLCanvasElement;
  outerBushes: HTMLCanvasElement;
  mainGrassAndCorpses: HTMLCanvasElement;
  tailsPikeAndFG: HTMLCanvasElement;
  treesFGBlurred: HTMLCanvasElement;
}

interface CachedYcrStage {
  skyAndMountains: HTMLCanvasElement;
  backCrystalsAndTrees: HTMLCanvasElement;
  groundAndFrontCrystals: HTMLCanvasElement;
}

interface CachedMajinStage {
  skyAndMist: HTMLCanvasElement;
  backFunhouseTrees: HTMLCanvasElement;
  groundAndFrontTrees: HTMLCanvasElement;
}

interface CachedTripleTroubleStage {
  voidSky: HTMLCanvasElement;
  backXenophanesCrystals: HTMLCanvasElement;
  fracturedGround: HTMLCanvasElement;
}

let cachedStage: CachedPolishedStage | null = null;
let cachedYcr: CachedYcrStage | null = null;
let cachedMajin: CachedMajinStage | null = null;
let cachedTT: CachedTripleTroubleStage | null = null;

function createOffscreen(w = 1920, h = 1080): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Helper to draw a high-detail curved palm tree matching TreesMid.png / TreesOuterMid1.png / TreesOuterMid2.png
function drawCartoonPalmTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  topX: number,
  topY: number,
  ctrlX: number,
  ctrlY: number,
  scale = 1.0,
  silhouetteColor?: string
) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Trunk path
  ctx.beginPath();
  ctx.moveTo(baseX - 15 * scale, baseY);
  ctx.quadraticCurveTo(ctrlX - 11 * scale, ctrlY, topX - 7.5 * scale, topY);
  ctx.lineTo(topX + 7.5 * scale, topY);
  ctx.quadraticCurveTo(ctrlX + 11 * scale, ctrlY, baseX + 15 * scale, baseY);
  ctx.closePath();

  if (silhouetteColor) {
    ctx.fillStyle = silhouetteColor;
    ctx.fill();
  } else {
    const trunkGrad = ctx.createLinearGradient(
      baseX - 16 * scale,
      baseY,
      baseX + 16 * scale,
      baseY
    );
    trunkGrad.addColorStop(0, '#6E4708');
    trunkGrad.addColorStop(0.45, '#A87416');
    trunkGrad.addColorStop(0.8, '#C48B20');
    trunkGrad.addColorStop(1, '#593605');
    ctx.fillStyle = trunkGrad;
    ctx.fill();
    ctx.lineWidth = 3.5 * scale;
    ctx.strokeStyle = '#3B2205';
    ctx.stroke();

    // Trunk bark rings & vertical wood-grain shading
    for (let t = 0.12; t < 0.92; t += 0.11) {
      const sx =
        (1 - t) * (1 - t) * baseX +
        2 * (1 - t) * t * ctrlX +
        t * t * topX;
      const sy =
        (1 - t) * (1 - t) * baseY +
        2 * (1 - t) * t * ctrlY +
        t * t * topY;
      ctx.beginPath();
      ctx.moveTo(sx - 10 * scale, sy);
      ctx.quadraticCurveTo(sx, sy + 5 * scale, sx + 10 * scale, sy + 2 * scale);
      ctx.strokeStyle = '#4A2B06';
      ctx.lineWidth = 2.5 * scale;
      ctx.stroke();
    }

    // Red-crimson collar ring at crown base
    ctx.fillStyle = '#B83214';
    ctx.beginPath();
    ctx.ellipse(topX, topY + 6 * scale, 14 * scale, 7.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Palm Fronds radiating from (topX, topY) with serrated leaf notches & golden rim light
  const frondAngles = [-2.7, -2.2, -1.6, -1.0, -0.4, 0.2, 0.72, 1.35, 2.25];
  frondAngles.forEach((ang, idx) => {
    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate(ang);
    const len = (140 + (idx % 3) * 24) * scale;
    const arch = (idx < 4 ? -40 : 40) * scale;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, arch, len, arch * 0.35);
    ctx.quadraticCurveTo(len * 0.72, arch * 0.12, len * 0.45, 10 * scale);
    ctx.quadraticCurveTo(len * 0.22, 6 * scale, 0, 12 * scale);
    ctx.closePath();

    if (silhouetteColor) {
      ctx.fillStyle = silhouetteColor;
      ctx.fill();
    } else {
      const frondGrad = ctx.createLinearGradient(0, 0, len, arch * 0.35);
      frondGrad.addColorStop(0, idx % 2 === 0 ? '#785506' : '#966E0B');
      frondGrad.addColorStop(0.65, idx % 2 === 0 ? '#966E0B' : '#B88914');
      frondGrad.addColorStop(1, '#D4AC26');
      ctx.fillStyle = frondGrad;
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#3B2205';
      ctx.stroke();

      // Golden highlight streak along upper frond spine
      ctx.beginPath();
      ctx.moveTo(8 * scale, 0);
      ctx.quadraticCurveTo(len * 0.48, arch * 0.82, len * 0.88, arch * 0.3);
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 3.5 * scale;
      ctx.stroke();
    }
    ctx.restore();
  });

  ctx.restore();
}

// Helper to draw the high-detail striped pine/conifer trees in TreesLeft.png and TreesRight.png
function drawStripedConiferTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  topY: number,
  width: number,
  tiltX: number
) {
  ctx.save();
  ctx.lineJoin = 'round';

  // Trunk with bark shading
  const trunkGrad = ctx.createLinearGradient(
    cx - width * 0.2,
    baseY,
    cx + width * 0.2,
    baseY
  );
  trunkGrad.addColorStop(0, '#4A2F03');
  trunkGrad.addColorStop(0.5, '#8A5A08');
  trunkGrad.addColorStop(1, '#3B2302');
  ctx.fillStyle = trunkGrad;
  ctx.strokeStyle = '#2E1B01';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - width * 0.14, baseY - 120);
  ctx.lineTo(cx - width * 0.22 - tiltX * 0.3, baseY + 25);
  ctx.lineTo(cx + width * 0.18 - tiltX * 0.3, baseY + 30);
  ctx.lineTo(cx + width * 0.14, baseY - 120);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Layered conifer tiers
  const tiers = 6;
  const treeH = baseY - 90 - topY;
  ctx.beginPath();
  ctx.moveTo(cx + tiltX, topY);
  for (let i = 0; i < tiers; i++) {
    const t1 = (i + 1) / tiers;
    const yOut = topY + treeH * t1;
    const xSpread = width * 0.56 * (0.26 + t1 * 0.76);
    const curCenter = cx + tiltX * (1 - t1);
    ctx.lineTo(curCenter + xSpread, yOut);
    if (i < tiers - 1) {
      ctx.lineTo(curCenter + xSpread * 0.7, yOut - 12);
    }
  }
  ctx.quadraticCurveTo(cx, baseY - 72, cx - width * 0.56, baseY - 90);
  for (let i = tiers - 1; i >= 0; i--) {
    const t1 = (i + 1) / tiers;
    const yOut = topY + treeH * t1;
    const xSpread = width * 0.56 * (0.26 + t1 * 0.76);
    const curCenter = cx + tiltX * (1 - t1);
    if (i < tiers - 1) {
      ctx.lineTo(curCenter - xSpread * 0.7, yOut - 12);
    }
    ctx.lineTo(curCenter - xSpread, yOut);
  }
  ctx.closePath();

  // Striped amber/brown gradient matching TreesLeft.png & TreesRight.png
  const grad = ctx.createLinearGradient(cx, topY, cx, baseY - 80);
  grad.addColorStop(0, '#8C6009');
  grad.addColorStop(0.18, '#683A05');
  grad.addColorStop(0.36, '#875B08');
  grad.addColorStop(0.54, '#663805');
  grad.addColorStop(0.74, '#855908');
  grad.addColorStop(1, '#593004');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#3D2502';
  ctx.stroke();

  // Golden-ochre branch tip rim highlights
  ctx.strokeStyle = '#D4B43B';
  ctx.lineWidth = 3;
  for (let i = 0; i < tiers; i++) {
    const t1 = (i + 0.6) / tiers;
    const yOut = topY + treeH * t1;
    const curCenter = cx + tiltX * (1 - t1);
    ctx.beginPath();
    ctx.moveTo(curCenter - width * 0.16 * t1, yOut - 14);
    ctx.quadraticCurveTo(curCenter, yOut + 4, curCenter + width * 0.2 * t1, yOut - 10);
    ctx.stroke();
  }

  ctx.restore();
}

function ensurePolishedStageBuilt(): CachedPolishedStage {
  if (cachedStage) return cachedStage;

  // 1. Sky Normal (1000029768.png: Deep crimson top -> orange -> glowing golden-yellow center haze + jagged mountain horizon)
  const skyNormal = createOffscreen();
  {
    const ctx = skyNormal.getContext('2d')!;
    const lin = ctx.createLinearGradient(0, 0, 0, 1080);
    lin.addColorStop(0, '#780404');
    lin.addColorStop(0.22, '#991109');
    lin.addColorStop(0.48, '#CE641B');
    lin.addColorStop(1, '#D97B22');
    ctx.fillStyle = lin;
    ctx.fillRect(0, 0, 1920, 1080);

    const rad = ctx.createRadialGradient(890, 690, 30, 890, 690, 760);
    rad.addColorStop(0, '#FEF08A');
    rad.addColorStop(0.38, '#F7E052');
    rad.addColorStop(0.68, 'rgba(234, 138, 38, 0.68)');
    rad.addColorStop(1, 'rgba(206, 100, 27, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Distant jagged mountains in the crimson-gold haze
    ctx.fillStyle = 'rgba(104, 34, 8, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, 680);
    const mPts = [
      [180, 470], [340, 560], [520, 420], [740, 540], [960, 445],
      [1180, 545], [1390, 410], [1610, 530], [1790, 450], [1920, 560],
    ];
    for (const [mx, my] of mPts) ctx.lineTo(mx, my);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Sky Encore (1000029766.png: Deep magenta-crimson top -> blood red -> warm orange-peach center haze)
  const skyEncore = createOffscreen();
  {
    const ctx = skyEncore.getContext('2d')!;
    const lin = ctx.createLinearGradient(0, 0, 0, 1080);
    lin.addColorStop(0, '#68022E');
    lin.addColorStop(0.24, '#9E0A2F');
    lin.addColorStop(0.5, '#DC2326');
    lin.addColorStop(1, '#E02B24');
    ctx.fillStyle = lin;
    ctx.fillRect(0, 0, 1920, 1080);

    const rad = ctx.createRadialGradient(890, 690, 30, 890, 690, 760);
    rad.addColorStop(0, '#FDBA74');
    rad.addColorStop(0.42, '#FC9642');
    rad.addColorStop(0.75, 'rgba(224, 43, 36, 0.65)');
    rad.addColorStop(1, 'rgba(220, 35, 38, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Distant purple-crimson mountain peaks
    ctx.fillStyle = 'rgba(88, 12, 38, 0.48)';
    ctx.beginPath();
    ctx.moveTo(0, 680);
    const mPts = [
      [160, 460], [350, 550], [540, 410], [760, 535], [960, 430],
      [1160, 540], [1380, 405], [1600, 520], [1780, 440], [1920, 550],
    ];
    for (const [mx, my] of mPts) ctx.lineTo(mx, my);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
  }

  // 3. TreesMidBack.png (Silhouette palm cluster in background)
  const treesMidBack = createOffscreen();
  {
    const ctx = treesMidBack.getContext('2d')!;
    const backSpecs = [
      { bx: 295, by: 925, tx: 290, ty: 270, cx: 350, cy: 580, s: 1.05, c: '#703D08' },
      { bx: 555, by: 910, tx: 575, ty: 105, cx: 615, cy: 500, s: 1.25, c: '#743F09' },
      { bx: 615, by: 895, tx: 635, ty: 310, cx: 690, cy: 590, s: 1.0, c: '#6B4F05' },
      { bx: 870, by: 805, tx: 830, ty: 390, cx: 835, cy: 600, s: 0.9, c: '#923B0A' },
      { bx: 975, by: 795, tx: 920, ty: 245, cx: 910, cy: 520, s: 1.0, c: '#6B4F05' },
      { bx: 1180, by: 965, tx: 1125, ty: 345, cx: 1125, cy: 650, s: 1.1, c: '#8F3C0A' },
      { bx: 1245, by: 830, tx: 1205, ty: 185, cx: 1255, cy: 510, s: 1.2, c: '#733E08' },
      { bx: 1435, by: 905, tx: 1475, ty: 225, cx: 1390, cy: 560, s: 1.15, c: '#913D0B' },
    ];
    for (const sp of backSpecs) {
      drawCartoonPalmTree(ctx, sp.bx, sp.by, sp.tx, sp.ty, sp.cx, sp.cy, sp.s, sp.c);
    }
  }

  // 4. TreesMid.png (4 detailed center palm trees)
  const treesMid = createOffscreen();
  {
    const ctx = treesMid.getContext('2d')!;
    const midSpecs = [
      { bx: 775, by: 840, tx: 750, ty: 345, cx: 830, cy: 610, s: 0.95 },
      { bx: 955, by: 800, tx: 965, ty: 270, cx: 905, cy: 540, s: 0.95 },
      { bx: 1035, by: 810, tx: 1050, ty: 395, cx: 990, cy: 610, s: 0.85 },
      { bx: 1255, by: 840, tx: 1270, ty: 425, cx: 1210, cy: 640, s: 0.88 },
    ];
    for (const sp of midSpecs) {
      drawCartoonPalmTree(ctx, sp.bx, sp.by, sp.tx, sp.ty, sp.cx, sp.cy, sp.s);
    }
  }

  // 5. TreesOuterMid1.png + TreesOuterMid2.png (Tall flanking palm trees)
  const treesOuterMid = createOffscreen();
  {
    const ctx = treesOuterMid.getContext('2d')!;
    const outerSpecs = [
      { bx: 170, by: 925, tx: 185, ty: 175, cx: 95, cy: 550, s: 1.25 },
      { bx: 425, by: 795, tx: 425, ty: 265, cx: 365, cy: 530, s: 0.95 },
      { bx: 1545, by: 780, tx: 1535, ty: 255, cx: 1605, cy: 520, s: 0.95 },
      { bx: 1750, by: 925, tx: 1735, ty: 175, cx: 1825, cy: 550, s: 1.25 },
      { bx: 390, by: 785, tx: 375, ty: 190, cx: 455, cy: 480, s: 1.0 },
      { bx: 625, by: 765, tx: 615, ty: 245, cx: 685, cy: 500, s: 0.92 },
      { bx: 675, by: 755, tx: 655, ty: 45, cx: 755, cy: 400, s: 1.18 },
      { bx: 1210, by: 825, tx: 1215, ty: 115, cx: 1135, cy: 470, s: 1.15 },
      { bx: 1225, by: 815, tx: 1230, ty: 265, cx: 1175, cy: 540, s: 0.95 },
      { bx: 1455, by: 760, tx: 1465, ty: 175, cx: 1390, cy: 470, s: 1.05 },
    ];
    for (const sp of outerSpecs) {
      drawCartoonPalmTree(ctx, sp.bx, sp.by, sp.tx, sp.ty, sp.cx, sp.cy, sp.s);
    }
  }

  // 6. TreesLeft.png + TreesRight.png (Striped conifer trees on left & right)
  const treesLeftRight = createOffscreen();
  {
    const ctx = treesLeftRight.getContext('2d')!;
    drawStripedConiferTree(ctx, 310, 650, 155, 340, 45);
    drawStripedConiferTree(ctx, 105, 570, 75, 330, 35);
    drawStripedConiferTree(ctx, 470, 600, 68, 350, 45);
    drawStripedConiferTree(ctx, 1560, 600, 58, 340, -35);
    drawStripedConiferTree(ctx, 1435, 615, 68, 340, -35);
    drawStripedConiferTree(ctx, 1735, 625, 82, 350, -45);
  }

  // 7. OuterBush.png + OuterBushUp.png (kept empty per user request so side bushes never block characters)
  const outerBushes = createOffscreen();

  // 8. Grass.png + DeadEgg.png + DeadKnux.png + DeadTailz2.png + DeadTailz3.png (High-Detail Version)
  const mainGrassAndCorpses = createOffscreen();
  {
    const ctx = mainGrassAndCorpses.getContext('2d')!;

    // Base Grass.png floor (y = 580..1080) with rich multi-stop depth gradient
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 595);
    for (let x = 0; x <= 1920; x += 40) {
      const bladePeak = 575 + Math.sin(x * 0.05) * 14;
      ctx.quadraticCurveTo(x + 14, bladePeak - 20, x + 20, bladePeak);
      ctx.quadraticCurveTo(x + 30, bladePeak + 10, x + 40, 595);
    }
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    const grassGrad = ctx.createLinearGradient(0, 575, 0, 1080);
    grassGrad.addColorStop(0, '#A88426');
    grassGrad.addColorStop(0.35, '#96731E');
    grassGrad.addColorStop(1, '#5E440C');
    ctx.fillStyle = grassGrad;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3F4606';
    ctx.stroke();

    // Mid golden-ochre sunburst clearing patch (matching Grass.png)
    const midClearGrad = ctx.createRadialGradient(960, 830, 80, 960, 830, 760);
    midClearGrad.addColorStop(0, '#DEC04A');
    midClearGrad.addColorStop(0.65, '#BA962C');
    midClearGrad.addColorStop(1, 'rgba(150, 115, 30, 0)');
    ctx.fillStyle = midClearGrad;
    ctx.beginPath();
    ctx.ellipse(960, 840, 760, 255, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detailed grass blade clusters across the ground for crisp texture
    ctx.strokeStyle = '#785A12';
    ctx.lineWidth = 3;
    for (let gx = 120; gx < 1800; gx += 135) {
      for (let gy = 650; gy < 1020; gy += 110) {
        const ox = ((gx * 17 + gy * 31) % 60) - 30;
        const oy = ((gx * 23 + gy * 13) % 36) - 18;
        ctx.beginPath();
        ctx.moveTo(gx + ox - 12, gy + oy);
        ctx.lineTo(gx + ox - 6, gy + oy - 14);
        ctx.lineTo(gx + ox, gy + oy);
        ctx.lineTo(gx + ox + 7, gy + oy - 16);
        ctx.lineTo(gx + ox + 13, gy + oy);
        ctx.stroke();
      }
    }

    // DeadEgg.png (left grass at x=470, y=700) — High-detail shattered Eggman corpse
    ctx.save();
    ctx.translate(470, 700);
    // Coagulated blood pool & torn red coat cape trailing left
    ctx.fillStyle = '#5C0B0B';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.lineTo(-215, -28);
    ctx.lineTo(-165, -8);
    ctx.lineTo(-208, 8);
    ctx.lineTo(-18, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular blood sheen
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(-65, 6, 48, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Shattered Eggman dome head with shading
    const eggGrad = ctx.createRadialGradient(12, -8, 6, 20, 5, 44);
    eggGrad.addColorStop(0, '#F5CBA7');
    eggGrad.addColorStop(0.7, '#E5B583');
    eggGrad.addColorStop(1, '#A6784B');
    ctx.fillStyle = eggGrad;
    ctx.beginPath();
    ctx.arc(20, 5, 42, Math.PI * 0.95, Math.PI * 2.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eggman brown mustache tuft & crimson blood on face
    ctx.fillStyle = '#5C2D0C';
    ctx.beginPath();
    ctx.moveTo(28, 2);
    ctx.lineTo(68, -8);
    ctx.lineTo(58, 6);
    ctx.lineTo(72, 12);
    ctx.lineTo(28, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(16, 12, 24, 0, Math.PI);
    ctx.fill();

    // Cracked Blue Glasses with white glass reflection (matching DeadEgg.png)
    ctx.fillStyle = '#1E88E5';
    ctx.beginPath();
    ctx.arc(62, 12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#90CAF9';
    ctx.beginPath();
    ctx.ellipse(57, 7, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E88E5';
    ctx.beginPath();
    ctx.arc(98, 12, 15, 0, Math.PI * 1.3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // DeadKnux.png (right grass at x=1535, y=735) — High-detail Knuckles corpse
    ctx.save();
    ctx.translate(1535, 735);
    // Crimson blood pool trailing right
    ctx.fillStyle = '#991B1B';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(15, -10);
    ctx.lineTo(115, 16);
    ctx.lineTo(68, 26);
    ctx.lineTo(10, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pale pink-red Knuckles head & layered dreadlocks
    const knuxGrad = ctx.createRadialGradient(-18, -12, 6, -12, 0, 52);
    knuxGrad.addColorStop(0, '#FCE7F3');
    knuxGrad.addColorStop(0.65, '#F5D0E6');
    knuxGrad.addColorStop(1, '#BE185D');
    ctx.fillStyle = knuxGrad;
    ctx.beginPath();
    ctx.arc(-18, -6, 44, 0.2, Math.PI * 1.85);
    ctx.lineTo(38, -14);
    ctx.quadraticCurveTo(58, 8, 28, 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dreadlock Separation Lines & Spiked Knuckle Glove
    ctx.beginPath();
    ctx.moveTo(-10, -24);
    ctx.quadraticCurveTo(22, -16, 42, 4);
    ctx.moveTo(-18, -6);
    ctx.quadraticCurveTo(14, 4, 32, 22);
    ctx.stroke();
    ctx.restore();

    // Helper for DeadTailz2.png & DeadTailz3.png (torn orange/white-pink tails)
    const drawTornTail = (tx: number, ty: number, scale = 1.0) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      // Blood pool under severed tail
      ctx.fillStyle = '#7F1D1D';
      ctx.beginPath();
      ctx.ellipse(-68, 18, 28, 12, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Orange tail fur with gradient
      const tailGrad = ctx.createLinearGradient(-85, -20, 95, 20);
      tailGrad.addColorStop(0, '#C2410C');
      tailGrad.addColorStop(0.6, '#EA580C');
      tailGrad.addColorStop(1, '#FB923C');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(-85, 8);
      ctx.quadraticCurveTo(-25, -42, 45, -24);
      ctx.lineTo(95, -6);
      ctx.lineTo(60, 26);
      ctx.lineTo(-55, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White/pink-stained tail tip with jagged fur tufts
      ctx.fillStyle = '#F5D0FE';
      ctx.beginPath();
      ctx.moveTo(20, -20);
      ctx.lineTo(35, -6);
      ctx.lineTo(22, 4);
      ctx.lineTo(38, 12);
      ctx.lineTo(15, 16);
      ctx.lineTo(60, 26);
      ctx.lineTo(95, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawTornTail(225, 650, 0.95);
    drawTornTail(415, 945, 0.95);
  }

  // 9. TAIL.png (Tails Head on Wooden Pike) + DeadTailz1.png
  const tailsPikeAndFG = createOffscreen();
  {
    const ctx = tailsPikeAndFG.getContext('2d')!;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Wooden Pike Shaft (from bottom x=425, y=855 up to bloody tip x=350, y=135)
    const pikeGrad = ctx.createLinearGradient(340, 200, 440, 200);
    pikeGrad.addColorStop(0, '#5C3404');
    pikeGrad.addColorStop(0.5, '#A86508');
    pikeGrad.addColorStop(1, '#4A2903');
    ctx.fillStyle = pikeGrad;
    ctx.strokeStyle = '#2B1802';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(400, 855);
    ctx.lineTo(335, 225);
    ctx.lineTo(350, 135);
    ctx.lineTo(382, 225);
    ctx.lineTo(452, 855);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bloody top tip & blood streaks dripping down the wooden stake
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(335, 235);
    ctx.lineTo(350, 135);
    ctx.lineTo(382, 235);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.moveTo(355, 365);
    ctx.lineTo(378, 560);
    ctx.lineTo(395, 365);
    ctx.closePath();
    ctx.fill();

    // Impaled Tails Head at (368, 315) matching TAIL.png
    ctx.save();
    ctx.translate(368, 315);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.2;

    // Left & Right Fox Ears with inner ear shading
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(-58, -28);
    ctx.lineTo(-84, -78);
    ctx.lineTo(-18, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FCE7F3';
    ctx.beginPath();
    ctx.moveTo(-52, -32);
    ctx.lineTo(-72, -66);
    ctx.lineTo(-28, -46);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(22, -45);
    ctx.lineTo(94, -64);
    ctx.lineTo(68, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FCE7F3';
    ctx.beginPath();
    ctx.moveTo(34, -38);
    ctx.lineTo(80, -52);
    ctx.lineTo(60, -4);
    ctx.closePath();
    ctx.fill();

    // Orange Head Sphere with cel-shaded gradient
    const headGrad = ctx.createRadialGradient(-14, -18, 8, 0, 0, 62);
    headGrad.addColorStop(0, '#FB923C');
    headGrad.addColorStop(0.65, '#EA580C');
    headGrad.addColorStop(1, '#9A3412');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top 3 hair bangs on Tails' forehead
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(-16, -54);
    ctx.lineTo(-24, -76);
    ctx.lineTo(-4, -58);
    ctx.lineTo(4, -80);
    ctx.lineTo(14, -56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White/Pink-Stained Cheek Fur & Muzzle
    ctx.fillStyle = '#FCE7F3';
    ctx.beginPath();
    ctx.moveTo(-68, 18);
    ctx.quadraticCurveTo(-20, -4, 48, 12);
    ctx.lineTo(76, 28);
    ctx.lineTo(48, 46);
    ctx.lineTo(58, 62);
    ctx.lineTo(10, 58);
    ctx.quadraticCurveTo(-45, 58, -68, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heavy Black Glitch / Censorship Bar across Tails' eyes (exact match to TAIL.png!)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-78, -24, 156, 36);
    ctx.fillRect(-98, -6, 35, 10);
    ctx.fillRect(-88, -32, 42, 8);
    ctx.fillRect(52, -12, 46, 12);
    ctx.restore();

    // DeadTailz1.png in bottom-left corner (x=250, y=990)
    ctx.save();
    ctx.translate(250, 990);
    ctx.fillStyle = '#D97706';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-110, -45);
    ctx.quadraticCurveTo(-20, -58, 45, -36);
    ctx.lineTo(135, -8);
    ctx.lineTo(95, 42);
    ctx.lineTo(-110, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  const treesFGBlurred = createOffscreen();

  cachedStage = {
    skyNormal,
    skyEncore,
    treesMidBack,
    treesMid,
    treesOuterMid,
    treesLeftRight,
    outerBushes,
    mainGrassAndCorpses,
    tailsPikeAndFG,
    treesFGBlurred,
  };
  return cachedStage;
}

// Helper to draw a multi-faceted glowing crystal spire (used in YCR Crimson Labyrinth & Triple Trouble Void)
function drawFacetedCrystalCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale: number,
  primaryColor: string,
  highlightColor: string,
  darkColor: string,
  tilt = 0
) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';

  const shards = [
    { ox: -42, w: 34, h: 145, ang: -0.24 },
    { ox: 38, w: 32, h: 135, ang: 0.22 },
    { ox: 0, w: 46, h: 210, ang: 0.02 },
  ];

  for (const sh of shards) {
    ctx.save();
    ctx.translate(sh.ox, 0);
    ctx.rotate(sh.ang);

    // Left facet (bright)
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.moveTo(-sh.w, 0);
    ctx.lineTo(0, -sh.h);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Right facet (deep shade)
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -sh.h);
    ctx.lineTo(sh.w, 0);
    ctx.closePath();
    ctx.fill();

    // Center glowing core facet
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(-sh.w * 0.45, 0);
    ctx.lineTo(0, -sh.h * 0.92);
    ctx.lineTo(sh.w * 0.45, 0);
    ctx.closePath();
    ctx.fill();

    // Crisp dark outline & internal facet ridge
    ctx.strokeStyle = '#09050B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-sh.w, 0);
    ctx.lineTo(0, -sh.h);
    ctx.lineTo(sh.w, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -sh.h * 0.96);
    ctx.lineTo(0, -10);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function ensureYcrStageBuilt(): CachedYcrStage {
  if (cachedYcr) return cachedYcr;

  // 1. Sky & Jagged Crimson Labyrinth Mountains
  const skyAndMountains = createOffscreen();
  {
    const ctx = skyAndMountains.getContext('2d')!;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    skyGrad.addColorStop(0, '#1A0208');
    skyGrad.addColorStop(0.35, '#4A0615');
    skyGrad.addColorStop(0.7, '#8F0D22');
    skyGrad.addColorStop(1, '#2B030A');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Blood moon / crimson vortex glow in center-top sky
    const moonGlow = ctx.createRadialGradient(960, 320, 30, 960, 320, 580);
    moonGlow.addColorStop(0, 'rgba(254, 202, 202, 0.85)');
    moonGlow.addColorStop(0.25, 'rgba(239, 68, 68, 0.65)');
    moonGlow.addColorStop(0.65, 'rgba(153, 27, 27, 0.25)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, 1920, 1080);

    // Jagged Crimson Mountain Range
    ctx.fillStyle = '#2A040D';
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 720);
    const peaks = [
      [140, 420], [290, 560], [460, 340], [640, 520], [820, 390],
      [960, 490], [1120, 360], [1310, 530], [1490, 330], [1680, 510],
      [1820, 390], [1920, 490],
    ];
    for (const [px, py] of peaks) ctx.lineTo(px, py);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 2. Back Crystals & Dead Twisted Crimson Trees (scroll 0.5)
  const backCrystalsAndTrees = createOffscreen();
  {
    const ctx = backCrystalsAndTrees.getContext('2d')!;
    const crystalSpecs = [
      { x: 210, y: 690, s: 1.15, t: -0.15 },
      { x: 520, y: 670, s: 0.92, t: 0.08 },
      { x: 810, y: 660, s: 0.85, t: -0.06 },
      { x: 1140, y: 665, s: 0.88, t: 0.07 },
      { x: 1420, y: 675, s: 0.96, t: -0.1 },
      { x: 1710, y: 690, s: 1.18, t: 0.16 },
    ];
    for (const cs of crystalSpecs) {
      drawFacetedCrystalCluster(
        ctx,
        cs.x,
        cs.y,
        cs.s,
        '#DC2626',
        '#F87171',
        '#7F1D1D',
        cs.t
      );
    }

    // Gnarled dead crimson-lit trees flanking the stage
    drawCartoonPalmTree(ctx, 310, 760, 290, 190, 220, 460, 1.1, '#3B0610');
    drawCartoonPalmTree(ctx, 1610, 760, 1630, 190, 1700, 460, 1.1, '#3B0610');
  }

  // 3. Cracked Crimson Labyrinth Ground & Checkered Cliff Overhang
  const groundAndFrontCrystals = createOffscreen();
  {
    const ctx = groundAndFrontCrystals.getContext('2d')!;

    // Main ground platform (y = 635..1080)
    const floorGrad = ctx.createLinearGradient(0, 630, 0, 1080);
    floorGrad.addColorStop(0, '#450A14');
    floorGrad.addColorStop(0.35, '#2D060D');
    floorGrad.addColorStop(1, '#140205');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 645);
    for (let x = 0; x <= 1920; x += 60) {
      ctx.lineTo(x + 30, 632 + Math.sin(x * 0.03) * 10);
      ctx.lineTo(x + 60, 645);
    }
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();

    // Glowing crimson lava/energy fissures across the stage floor
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3.5;
    const fissures = [
      [[280, 720], [480, 765], [640, 740], [820, 790]],
      [[1640, 725], [1420, 770], [1220, 745], [1040, 795]],
      [[620, 880], [890, 845], [1150, 895], [1360, 860]],
    ];
    for (const path of fissures) {
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
    }

    // Center stage spotlight arena ring
    const spotGrad = ctx.createRadialGradient(960, 810, 60, 960, 810, 680);
    spotGrad.addColorStop(0, 'rgba(220, 38, 38, 0.28)');
    spotGrad.addColorStop(0.65, 'rgba(153, 27, 27, 0.12)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(960, 810, 680, 210, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top crimson grass overhang strip
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 645);
    for (let x = 0; x <= 1920; x += 60) {
      ctx.lineTo(x + 30, 632 + Math.sin(x * 0.03) * 10);
      ctx.lineTo(x + 60, 645);
    }
    ctx.stroke();
  }

  cachedYcr = {
    skyAndMountains,
    backCrystalsAndTrees,
    groundAndFrontCrystals,
  };
  return cachedYcr;
}

function ensureMajinStageBuilt(): CachedMajinStage {
  if (cachedMajin) return cachedMajin;

  // 1. Deep Sega CD Cobalt/Indigo Sky & Volumetric Mist
  const skyAndMist = createOffscreen();
  {
    const ctx = skyAndMist.getContext('2d')!;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    skyGrad.addColorStop(0, '#040824');
    skyGrad.addColorStop(0.4, '#0B175A');
    skyGrad.addColorStop(0.75, '#172B96');
    skyGrad.addColorStop(1, '#09103D');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    const mistGrad = ctx.createRadialGradient(960, 640, 50, 960, 640, 780);
    mistGrad.addColorStop(0, 'rgba(59, 130, 246, 0.48)');
    mistGrad.addColorStop(0.55, 'rgba(29, 78, 216, 0.24)');
    mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 0, 1920, 1080);
  }

  // 2. Twisted Cobalt Funhouse Forest Trees (scroll 0.5)
  const backFunhouseTrees = createOffscreen();
  {
    const ctx = backFunhouseTrees.getContext('2d')!;
    const treePositions = [140, 360, 590, 820, 1100, 1330, 1560, 1780];
    treePositions.forEach((tx, idx) => {
      ctx.save();
      const bend = (idx % 2 === 0 ? 1 : -1) * 55;
      const trGrad = ctx.createLinearGradient(tx - 35, 0, tx + 35, 0);
      trGrad.addColorStop(0, '#0A1547');
      trGrad.addColorStop(0.5, '#1D4ED8');
      trGrad.addColorStop(1, '#081038');
      ctx.fillStyle = trGrad;
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(tx - 34, 720);
      ctx.quadraticCurveTo(tx + bend, 380, tx - 22, 0);
      ctx.lineTo(tx + 22, 0);
      ctx.quadraticCurveTo(tx + bend + 38, 380, tx + 34, 720);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  // 3. Royal-Blue Checkered Majin Forest Clearing Floor
  const groundAndFrontTrees = createOffscreen();
  {
    const ctx = groundAndFrontTrees.getContext('2d')!;
    const floorGrad = ctx.createLinearGradient(0, 635, 0, 1080);
    floorGrad.addColorStop(0, '#1E3A8A');
    floorGrad.addColorStop(0.4, '#172554');
    floorGrad.addColorStop(1, '#090D26');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 645);
    ctx.quadraticCurveTo(960, 615, 1920, 645);
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();

    // Glowing cyan/cobalt Stage Horizon Rim
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 645);
    ctx.quadraticCurveTo(960, 615, 1920, 645);
    ctx.stroke();

    // Subtle Sega CD perspective grid lines on floor
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.22)';
    ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(960 + i * 95, 632);
      ctx.lineTo(960 + i * 240, 1080);
      ctx.stroke();
    }
    for (let y = 680; y < 1080; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }
  }

  cachedMajin = {
    skyAndMist,
    backFunhouseTrees,
    groundAndFrontTrees,
  };
  return cachedMajin;
}

function ensureTripleTroubleStageBuilt(): CachedTripleTroubleStage {
  if (cachedTT) return cachedTT;

  // 1. Dimensional Purple Void Sky
  const voidSky = createOffscreen();
  {
    const ctx = voidSky.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    grad.addColorStop(0, '#0D031A');
    grad.addColorStop(0.45, '#280947');
    grad.addColorStop(0.8, '#4C1D95');
    grad.addColorStop(1, '#18052B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    const vortex = ctx.createRadialGradient(960, 380, 40, 960, 380, 720);
    vortex.addColorStop(0, 'rgba(233, 213, 255, 0.65)');
    vortex.addColorStop(0.35, 'rgba(168, 85, 247, 0.45)');
    vortex.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = vortex;
    ctx.fillRect(0, 0, 1920, 1080);
  }

  // 2. Towering Xenophanes Crystal Monoliths
  const backXenophanesCrystals = createOffscreen();
  {
    const ctx = backXenophanesCrystals.getContext('2d')!;
    const specs = [
      { x: 180, y: 710, s: 1.35, t: -0.18 },
      { x: 470, y: 680, s: 1.05, t: -0.08 },
      { x: 760, y: 665, s: 0.9, t: 0.05 },
      { x: 1160, y: 665, s: 0.9, t: -0.05 },
      { x: 1450, y: 680, s: 1.05, t: 0.08 },
      { x: 1740, y: 710, s: 1.35, t: 0.18 },
    ];
    for (const sp of specs) {
      drawFacetedCrystalCluster(
        ctx,
        sp.x,
        sp.y,
        sp.s,
        '#9333EA',
        '#E9D5FF',
        '#4C1D95',
        sp.t
      );
    }
  }

  // 3. Fractured Void Stage Platform
  const fracturedGround = createOffscreen();
  {
    const ctx = fracturedGround.getContext('2d')!;
    const gGrad = ctx.createLinearGradient(0, 635, 0, 1080);
    gGrad.addColorStop(0, '#3B0764');
    gGrad.addColorStop(0.5, '#1E0538');
    gGrad.addColorStop(1, '#090214');
    ctx.fillStyle = gGrad;
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 645);
    ctx.quadraticCurveTo(960, 620, 1920, 645);
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#C084FC';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 645);
    ctx.quadraticCurveTo(960, 620, 1920, 645);
    ctx.stroke();
  }

  cachedTT = {
    voidSky,
    backXenophanesCrystals,
    fracturedGround,
  };
  return cachedTT;
}

/**
 * Draws the combined 18-layer PolishedP1 stage ("Hill of the Void") for Too Slow & Too Slow Encore.
 */
export function drawPolishedStageBackLayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  songId: SongId,
  cameraOffsetX = 0
) {
  if (typeof document === 'undefined') return;
  const st = ensurePolishedStageBuilt();

  // 1. 8.BGSky (1000029766.png for Too Slow Encore, 1000029768.png for Too Slow)
  const sky = songId === 'too-slow-encore' ? st.skyEncore : st.skyNormal;
  ctx.drawImage(sky, 0, 0, w, h);

  // 2. TreesMidBack (scroll 0.7)
  ctx.drawImage(st.treesMidBack, -cameraOffsetX * 0.35, 0, w, h);

  // 3. TreesMid (scroll 0.7)
  ctx.drawImage(st.treesMid, -cameraOffsetX * 0.4, 0, w, h);

  // 4. TreesOuterMid1 & TreesOuterMid2 (scroll 0.72)
  ctx.drawImage(st.treesOuterMid, -cameraOffsetX * 0.45, 0, w, h);

  // 5. TreesLeft & TreesRight (scroll 0.75)
  ctx.drawImage(st.treesLeftRight, -cameraOffsetX * 0.55, 0, w, h);

  // 6. Grass + DeadEgg + DeadKnux + DeadTailz2/3 (scroll 1.0)
  ctx.drawImage(st.mainGrassAndCorpses, -cameraOffsetX * 0.85, 0, w, h);

  // 7. TAIL.png (Tails Pike) + DeadTailz1 (scroll 1.0)
  ctx.drawImage(st.tailsPikeAndFG, -cameraOffsetX * 0.95, 0, w, h);
}

/**
 * High-Definition Multi-Layer Parallax Stage Renderer for You Can't Run & You Can't Run Encore ("Crimson Labyrinth")
 */
export function drawYcrCrimsonStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number,
  cameraOffsetX = 0,
  bgImg?: HTMLImageElement
) {
  if (typeof document === 'undefined') return;
  const st = ensureYcrStageBuilt();

  ctx.drawImage(st.skyAndMountains, -cameraOffsetX * 0.2, 0, w, h);

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.drawImage(bgImg, -cameraOffsetX * 0.3, 0, w, h);
    ctx.restore();
  }

  ctx.drawImage(st.backCrystalsAndTrees, -cameraOffsetX * 0.5, 0, w, h);
  ctx.drawImage(st.groundAndFrontCrystals, -cameraOffsetX * 0.85, 0, w, h);

  // Animated rising crimson embers
  ctx.save();
  ctx.fillStyle = '#FCA5A5';
  for (let i = 0; i < 18; i++) {
    const px = ((i * 97 + timeMs * 0.03) % w);
    const py = h - ((i * 67 + timeMs * 0.06) % (h * 0.75));
    const r = 1.8 + (i % 3) * 1.1;
    ctx.globalAlpha = 0.35 + (i % 4) * 0.15;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * High-Definition Multi-Layer Parallax Stage Renderer for Endless & Endless OG ("Majin Forest")
 */
export function drawEndlessMajinStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0,
  bgImg?: HTMLImageElement
) {
  if (typeof document === 'undefined') return;
  const st = ensureMajinStageBuilt();

  ctx.drawImage(st.skyAndMist, -cameraOffsetX * 0.2, 0, w, h);

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.drawImage(bgImg, -cameraOffsetX * 0.35, 0, w, h);
    ctx.restore();
  }

  ctx.drawImage(st.backFunhouseTrees, -cameraOffsetX * 0.5, 0, w, h);
  ctx.drawImage(st.groundAndFrontTrees, -cameraOffsetX * 0.85, 0, w, h);
}

/**
 * High-Definition Multi-Layer Parallax Stage Renderer for Triple Trouble ("Xenophanes & The Three Souls")
 */
export function drawTripleTroubleStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0,
  bgImg?: HTMLImageElement
) {
  if (typeof document === 'undefined') return;
  const st = ensureTripleTroubleStageBuilt();

  ctx.drawImage(st.voidSky, -cameraOffsetX * 0.2, 0, w, h);

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.drawImage(bgImg, -cameraOffsetX * 0.35, 0, w, h);
    ctx.restore();
  }

  ctx.drawImage(st.backXenophanesCrystals, -cameraOffsetX * 0.5, 0, w, h);
  ctx.drawImage(st.fracturedGround, -cameraOffsetX * 0.85, 0, w, h);
}

export function drawPolishedStageForegroundLayer(
  _ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  _cameraOffsetX = 0
) {
  // Side foreground bushes/trees removed so characters are never blocked
}
