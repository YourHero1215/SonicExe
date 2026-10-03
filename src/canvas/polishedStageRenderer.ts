import { SongId } from '../types/game';

interface CachedPolishedStage {
  skyNormal: HTMLCanvasElement;
  skyEncore: HTMLCanvasElement;
  midTreesCombined: HTMLCanvasElement;
  mainGrassAndProps: HTMLCanvasElement;
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

const ycrStageImageCache: Record<string, HTMLImageElement> = {};
function getYcrStageImage(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!ycrStageImageCache[src]) {
    const img = new Image();
    img.src = src;
    ycrStageImageCache[src] = img;
  }
  const cached = ycrStageImageCache[src];
  return cached.complete && cached.naturalWidth > 0 ? cached : null;
}

function createOffscreen(w = 1280, h = 720): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getStageCtx(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d')!;
  ctx.setTransform(c.width / 1920, 0, 0, c.height / 1080, 0, 0);
  return ctx;
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
    const ctx = getStageCtx(skyNormal);
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
    const ctx = getStageCtx(skyEncore);
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

  // 3–6. Combined Mid-Background Trees Layer (TreesMidBack + TreesMid + TreesOuterMid + TreesLeftRight)
  const midTreesCombined = createOffscreen();
  {
    const ctx = getStageCtx(midTreesCombined);
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

    const midSpecs = [
      { bx: 775, by: 840, tx: 750, ty: 345, cx: 830, cy: 610, s: 0.95 },
      { bx: 955, by: 800, tx: 965, ty: 270, cx: 905, cy: 540, s: 0.95 },
      { bx: 1035, by: 810, tx: 1050, ty: 395, cx: 990, cy: 610, s: 0.85 },
      { bx: 1255, by: 840, tx: 1270, ty: 425, cx: 1210, cy: 640, s: 0.88 },
    ];
    for (const sp of midSpecs) {
      drawCartoonPalmTree(ctx, sp.bx, sp.by, sp.tx, sp.ty, sp.cx, sp.cy, sp.s);
    }

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

    drawStripedConiferTree(ctx, 310, 650, 155, 340, 45);
    drawStripedConiferTree(ctx, 105, 570, 75, 330, 35);
    drawStripedConiferTree(ctx, 470, 600, 68, 350, 45);
    drawStripedConiferTree(ctx, 1560, 600, 58, 340, -35);
    drawStripedConiferTree(ctx, 1435, 615, 68, 340, -35);
    drawStripedConiferTree(ctx, 1735, 625, 82, 350, -45);
  }

  // 8–9. Combined Grass + Corpses + Tails Pike Layer
  const mainGrassAndProps = createOffscreen();
  {
    const ctx = getStageCtx(mainGrassAndProps);

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

  cachedStage = {
    skyNormal,
    skyEncore,
    midTreesCombined,
    mainGrassAndProps,
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

  // 1. Dark Twilight Sky & Back Bush Silhouette (matches stages/hillAct2/sky.png + BackBush.png)
  const skyAndMountains = createOffscreen();
  {
    const ctx = getStageCtx(skyAndMountains);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    skyGrad.addColorStop(0, '#121620');
    skyGrad.addColorStop(0.45, '#1B141D');
    skyGrad.addColorStop(0.8, '#231926');
    skyGrad.addColorStop(1, '#0F0F12');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Subtle twilight glow in center sky
    const moonGlow = ctx.createRadialGradient(960, 340, 30, 960, 340, 520);
    moonGlow.addColorStop(0, 'rgba(91, 75, 101, 0.48)');
    moonGlow.addColorStop(0.55, 'rgba(66, 52, 83, 0.24)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, 1920, 1080);

    // BackBush silhouette mound
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 560);
    ctx.quadraticCurveTo(960, 440, 1920, 560);
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Dark Silhouette Forest Trees (matches stages/hillAct2/trees.png, scroll 0.5)
  const backCrystalsAndTrees = createOffscreen();
  {
    const ctx = getStageCtx(backCrystalsAndTrees);
    drawCartoonPalmTree(ctx, 360, 760, 380, 140, 290, 430, 1.18, '#111111');
    drawCartoonPalmTree(ctx, 690, 720, 660, 160, 620, 410, 1.02, '#0A0A0A');
    drawCartoonPalmTree(ctx, 1230, 720, 1260, 160, 1300, 410, 1.02, '#0A0A0A');
    drawCartoonPalmTree(ctx, 1560, 760, 1540, 140, 1630, 430, 1.18, '#111111');
  }

  // 3. TopBushes Ground + Framing TreesFront + TopOverlay (matches stages/hillAct2/TopBushes.png + TreesFront.png + TopOverlay.png)
  const groundAndFrontCrystals = createOffscreen();
  {
    const ctx = getStageCtx(groundAndFrontCrystals);

    // Main dark charcoal grass stage floor
    const floorGrad = ctx.createLinearGradient(0, 580, 0, 1080);
    floorGrad.addColorStop(0, '#1E1E1E');
    floorGrad.addColorStop(0.55, '#171717');
    floorGrad.addColorStop(1, '#101010');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 610);
    ctx.quadraticCurveTo(960, 565, 1920, 610);
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();

    // Left & Right framing tree trunks (TreesFront)
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, 210, 1080);
    ctx.fillRect(1710, 0, 210, 1080);

    // Top foliage canopy border (TopOverlay)
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1920, 0);
    ctx.lineTo(1920, 150);
    ctx.quadraticCurveTo(960, 60, 0, 150);
    ctx.closePath();
    ctx.fill();
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
    const ctx = getStageCtx(skyAndMist);
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
    const ctx = getStageCtx(backFunhouseTrees);
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
    const ctx = getStageCtx(groundAndFrontTrees);
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
    const ctx = getStageCtx(voidSky);
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
    const ctx = getStageCtx(backXenophanesCrystals);
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
    const ctx = getStageCtx(fracturedGround);
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
 * Draws the authentic multi-layer Hill stage (stages/hill/) for Too Slow & Too Slow Encore.
 */
interface CachedCleanGreenHillStage {
  skyAndClouds: HTMLCanvasElement;
  backHillsAndOcean: HTMLCanvasElement;
  midTreesAndLoops: HTMLCanvasElement;
  cleanGrassAndFloor: HTMLCanvasElement;
}
let cachedCleanGreenHill: CachedCleanGreenHillStage | null = null;

function ensureCleanGreenHillStageBuilt(): CachedCleanGreenHillStage {
  if (cachedCleanGreenHill) return cachedCleanGreenHill;

  const skyAndClouds = createOffscreen();
  {
    const ctx = getStageCtx(skyAndClouds);
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    grad.addColorStop(0, '#1E6CE6');
    grad.addColorStop(0.4, '#3895F8');
    grad.addColorStop(0.85, '#68BFFC');
    grad.addColorStop(1, '#82C8FC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const clouds = [
      { x: 180, y: 160, r: 90 },
      { x: 270, y: 140, r: 110 },
      { x: 380, y: 170, r: 85 },
      { x: 780, y: 220, r: 120 },
      { x: 920, y: 200, r: 140 },
      { x: 1060, y: 230, r: 100 },
      { x: 1480, y: 150, r: 95 },
      { x: 1600, y: 130, r: 115 },
      { x: 1720, y: 160, r: 90 },
    ];
    for (const cl of clouds) {
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const backHillsAndOcean = createOffscreen();
  {
    const ctx = getStageCtx(backHillsAndOcean);
    ctx.fillStyle = '#1070D8';
    ctx.fillRect(0, 480, 1920, 160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let wy = 490; wy < 620; wy += 22) {
      ctx.fillRect(0, wy, 1920, 3);
    }

    ctx.fillStyle = '#22A24A';
    ctx.beginPath();
    ctx.moveTo(0, 680);
    const pts = [
      [220, 480],
      [420, 560],
      [680, 440],
      [920, 530],
      [1180, 420],
      [1420, 520],
      [1680, 430],
      [1920, 540],
    ];
    for (const [px, py] of pts) ctx.lineTo(px, py);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#167832';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  const midTreesAndLoops = createOffscreen();
  {
    const ctx = getStageCtx(midTreesAndLoops);
    const specs = [
      { bx: 220, by: 880, tx: 210, ty: 220, cx: 280, cy: 520, s: 1.15 },
      { bx: 480, by: 840, tx: 500, ty: 280, cx: 430, cy: 540, s: 0.95 },
      { bx: 1440, by: 850, tx: 1420, ty: 260, cx: 1500, cy: 530, s: 1.0 },
      { bx: 1720, by: 890, tx: 1700, ty: 210, cx: 1780, cy: 510, s: 1.2 },
    ];
    for (const sp of specs) {
      drawCartoonPalmTree(ctx, sp.bx, sp.by, sp.tx, sp.ty, sp.cx, sp.cy, sp.s);
    }
  }

  const cleanGrassAndFloor = createOffscreen();
  {
    const ctx = getStageCtx(cleanGrassAndFloor);

    ctx.fillStyle = '#B85C20';
    ctx.fillRect(0, 590, 1920, 490);

    const tileSize = 60;
    ctx.fillStyle = '#D87C38';
    for (let gy = 590; gy < 1080; gy += tileSize) {
      for (let gx = 0; gx < 1920; gx += tileSize) {
        if ((Math.floor(gx / tileSize) + Math.floor(gy / tileSize)) % 2 === 0) {
          ctx.fillRect(gx, gy, tileSize, tileSize);
        }
      }
    }

    ctx.fillStyle = '#34D024';
    ctx.beginPath();
    ctx.moveTo(0, 595);
    for (let x = 0; x <= 1920; x += 35) {
      const bH = 572 + Math.sin(x * 0.08) * 12;
      ctx.quadraticCurveTo(x + 12, bH - 18, x + 18, bH);
      ctx.quadraticCurveTo(x + 26, bH + 10, x + 35, 595);
    }
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1E8C12';
    ctx.lineWidth = 5;
    ctx.stroke();

    const flowers = [140, 380, 820, 1120, 1540, 1780];
    for (const fx of flowers) {
      const fy = 575;
      ctx.fillStyle = '#32D024';
      ctx.fillRect(fx - 3, fy, 6, 25);
      ctx.fillStyle = '#FACC15';
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(ang) * 14, fy + Math.sin(ang) * 14, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.arc(fx, fy, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  cachedCleanGreenHill = {
    skyAndClouds,
    backHillsAndOcean,
    midTreesAndLoops,
    cleanGrassAndFloor,
  };
  return cachedCleanGreenHill;
}

export function drawGreenHillCleanStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0
) {
  if (typeof document === 'undefined') return;
  const ghImg = getYcrStageImage('/sprites/GreenHill.png');
  if (ghImg) {
    const bleedX = 56;
    const bleedY = 24;
    ctx.drawImage(
      ghImg,
      -bleedX + cameraOffsetX * 0.18,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    return;
  }

  const st = ensureCleanGreenHillStageBuilt();
  ctx.drawImage(st.skyAndClouds, 0, 0, w, h);
  ctx.drawImage(st.backHillsAndOcean, cameraOffsetX * 0.35, 0, w, h);
  ctx.drawImage(st.midTreesAndLoops, cameraOffsetX * 0.18, 0, w, h);
  ctx.drawImage(st.cleanGrassAndFloor, 0, 0, w, h);
}

export function drawPolishedStageBackLayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  songId: SongId,
  cameraOffsetX = 0
) {
  if (typeof document === 'undefined') return;

  const hillSkyImg = getYcrStageImage('/sprites/hillSkyAndBack.png');
  const hillTreesImg = getYcrStageImage('/sprites/hillTreesMid.png');
  const hillGroundImg = getYcrStageImage('/sprites/hillGroundAndProps.png');

  if (hillSkyImg && hillTreesImg && hillGroundImg) {
    const bleedX = 56;
    const bleedY = 24;
    // Relative parallax offsets (since stage context already shifts by -cameraOffsetX * 0.55 with the characters)
    ctx.drawImage(
      hillSkyImg,
      -bleedX + cameraOffsetX * 0.38,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    ctx.drawImage(
      hillTreesImg,
      -bleedX + cameraOffsetX * 0.18,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    ctx.drawImage(
      hillGroundImg,
      -bleedX,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    return;
  }

  const st = ensurePolishedStageBuilt();

  // 1. 8.BGSky (1000029766.png for Too Slow Encore, 1000029768.png for Too Slow)
  const sky = songId === 'too-slow-encore' ? st.skyEncore : st.skyNormal;
  ctx.drawImage(sky, 0, 0, w, h);

  // 2. Combined Mid-Background Trees (scroll 0.45)
  ctx.drawImage(st.midTreesCombined, cameraOffsetX * 0.18, 0, w, h);

  // 3. Grass + Corpses + Tails Pike (scroll 1.0 locked to characters)
  ctx.drawImage(st.mainGrassAndProps, 0, 0, w, h);
}

/**
 * Authentic Hill (Act 2) Multi-Layer Parallax Stage Renderer for You Can't Run & You Can't Run Encore
 * Uses stages/hillAct2/ (sky.png + BackBush.png, trees.png, TopBushes.png + TreesFront.png + TopOverlay.png)
 */
export function drawYcrCrimsonStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  _timeMs: number,
  cameraOffsetX = 0,
  _bgImg?: HTMLImageElement
) {
  if (typeof document === 'undefined') return;

  const skyAndBackImg = getYcrStageImage('/sprites/ycrSkyAndBack.png');
  const treesMidImg = getYcrStageImage('/sprites/ycrTreesMid.png');
  const groundAndFrontImg = getYcrStageImage('/sprites/ycrGroundAndFront.png');

  if (skyAndBackImg && treesMidImg && groundAndFrontImg) {
    const bleedX = 56;
    const bleedY = 24;
    ctx.drawImage(
      skyAndBackImg,
      -bleedX + cameraOffsetX * 0.38,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    ctx.drawImage(
      treesMidImg,
      -bleedX + cameraOffsetX * 0.18,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    ctx.drawImage(
      groundAndFrontImg,
      -bleedX,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
    return;
  }

  const st = ensureYcrStageBuilt();
  ctx.drawImage(st.skyAndMountains, cameraOffsetX * 0.38, 0, w, h);
  ctx.drawImage(st.backCrystalsAndTrees, cameraOffsetX * 0.18, 0, w, h);
  ctx.drawImage(st.groundAndFrontCrystals, 0, 0, w, h);
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

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, w, h);
  } else {
    const st = ensureMajinStageBuilt();
    ctx.drawImage(st.skyAndMist, -cameraOffsetX * 0.2, 0, w, h);
    ctx.drawImage(st.backFunhouseTrees, -cameraOffsetX * 0.5, 0, w, h);
    ctx.drawImage(st.groundAndFrontTrees, -cameraOffsetX * 0.85, 0, w, h);
  }
}

/**
 * Authentic Multi-Layer Parallax Stage Renderer for Triple Trouble (hillAct3: glitchBG & xenoBG)
 */
export function drawTripleTroubleStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0,
  bgImg?: HTMLImageElement,
  isXenoPhase = false
) {
  if (typeof document === 'undefined') return;

  const p3Trees2 = getYcrStageImage('/sprites/p3_Trees2.png');
  const p3Trees = getYcrStageImage('/sprites/p3_Trees.png');
  const p3Grass = getYcrStageImage('/sprites/p3_Grass.png');
  const ttBackBush = getYcrStageImage('/sprites/ttBackBush.png');
  const ttTopBushes = getYcrStageImage('/sprites/ttTopBushes.png');
  const ttTrees = getYcrStageImage('/sprites/ttTrees.png');

  ctx.save();
  if (isXenoPhase) {
    // 1. xenoBG: Fiery crimson-red & orange horizontal scanline sky (matching 01:48, 03:59, 06:48 in the video!)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.78);
    skyGrad.addColorStop(0, '#B90504');
    skyGrad.addColorStop(0.28, '#EC1C0B');
    skyGrad.addColorStop(0.58, '#FF4D00');
    skyGrad.addColorStop(0.82, '#FF8800');
    skyGrad.addColorStop(1, '#1A2408');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-120, -60, w + 240, h + 120);

    // Subtle horizontal scanline bands in the crimson sky
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    for (let sy = 0; sy < h * 0.75; sy += 10) {
      ctx.fillRect(-120, sy, w + 240, 4);
    }

    const bleedX = 90;
    const bleedY = 36;
    if (p3Trees2) {
      ctx.drawImage(
        p3Trees2,
        -bleedX + cameraOffsetX * 0.25,
        -bleedY,
        w + bleedX * 2,
        h + bleedY * 2
      );
    }
    if (p3Trees) {
      ctx.drawImage(
        p3Trees,
        -bleedX + cameraOffsetX * 0.12,
        -bleedY,
        w + bleedX * 2,
        h + bleedY * 2
      );
    }
    if (p3Grass) {
      ctx.drawImage(
        p3Grass,
        -bleedX,
        -bleedY + 24,
        w + bleedX * 2,
        h + bleedY * 2
      );
    }
    ctx.restore();
    return;
  }

  // 2. glitchBG (Tails, Knuckles, Eggman): Dark VHS static brown/black void sky + silhouette forest + grey/brown ground
  const darkGrad = ctx.createLinearGradient(0, 0, 0, h);
  darkGrad.addColorStop(0, '#140E0C');
  darkGrad.addColorStop(0.45, '#1F1612');
  darkGrad.addColorStop(0.75, '#0F0B0A');
  darkGrad.addColorStop(1, '#050404');
  ctx.fillStyle = darkGrad;
  ctx.fillRect(-120, -60, w + 240, h + 120);

  // Subtle VHS scanline texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  for (let sy = 0; sy < h; sy += 8) {
    ctx.fillRect(-120, sy, w + 240, 3);
  }

  const bleedX = 90;
  const bleedY = 36;
  if (ttBackBush) {
    ctx.drawImage(
      ttBackBush,
      -bleedX + cameraOffsetX * 0.3,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
  }
  if (ttTrees || p3Trees) {
    ctx.drawImage(
      (ttTrees || p3Trees)!,
      -bleedX + cameraOffsetX * 0.16,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
  }
  if (ttTopBushes || p3Grass) {
    ctx.drawImage(
      (ttTopBushes || p3Grass)!,
      -bleedX,
      -bleedY + 18,
      w + bleedX * 2,
      h + bleedY * 2
    );
  } else {
    const st = ensureTripleTroubleStageBuilt();
    ctx.drawImage(st.voidSky, -cameraOffsetX * 0.2, 0, w, h);
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.globalAlpha = 0.42;
      ctx.drawImage(bgImg, -cameraOffsetX * 0.35, 0, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(st.backXenophanesCrystals, -cameraOffsetX * 0.5, 0, w, h);
    ctx.drawImage(st.fracturedGround, -cameraOffsetX * 0.85, 0, w, h);
  }
  ctx.restore();
}

export function drawTripleTroubleForegroundLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0
) {
  const fg1 = getYcrStageImage('/sprites/ttFGTree1.png');
  const fg2 = getYcrStageImage('/sprites/ttFGTree2.png');
  const bleedX = 70;
  const bleedY = 24;
  if (fg1) {
    ctx.drawImage(
      fg1,
      -bleedX - cameraOffsetX * 0.2,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
  }
  if (fg2) {
    ctx.drawImage(
      fg2,
      -bleedX - cameraOffsetX * 0.28,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
  }
}

export function drawPolishedStageForegroundLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cameraOffsetX = 0
) {
  const hillFgImg = getYcrStageImage('/sprites/hillTreesFG.png');
  if (hillFgImg) {
    const bleedX = 56;
    const bleedY = 24;
    ctx.drawImage(
      hillFgImg,
      -bleedX - cameraOffsetX * 0.22,
      -bleedY,
      w + bleedX * 2,
      h + bleedY * 2
    );
  }
}
