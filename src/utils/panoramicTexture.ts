import { RoomModeId, LightingSetting } from '../types';

/**
 * Procedural Equirectangular 360 Panorama Synthesizer
 * Generates high-fidelity 2048x1024 equirectangular projection canvases for 360° spherical viewing.
 */
export function generateEquirectangularPanorama(
  mode: RoomModeId,
  lighting?: LightingSetting
): HTMLCanvasElement {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Overall Lighting Palette & Mood
  const isEvening = mode === 'reading_evening' || (lighting && lighting.preset === 'warm_evening') || (lighting && lighting.colorTempK < 3200);
  const isWork = mode === 'work_mode';
  const isCreative = mode === 'creative_adaptive';

  // Base room colors
  const ceilingColor = isEvening ? '#18181b' : '#27272a';
  const wallBaseColor = isEvening ? '#232220' : '#2e2d2a';
  const wallWarmth = isEvening ? '#362f27' : '#3d3b36';
  const floorWoodBase = isEvening ? '#2b1b11' : '#3f2a1d';
  const floorWoodLight = isEvening ? '#452b1b' : '#5a3d2b';
  const windowDaylight = isEvening ? 'rgba(70, 90, 140, 0.4)' : 'rgba(235, 245, 255, 0.95)';
  const windowGlow = isEvening ? 'rgba(234, 179, 8, 0.25)' : 'rgba(255, 250, 230, 0.8)';

  // Fill Background (Walls & Horizons)
  ctx.fillStyle = wallBaseColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Ceiling (Top ~35% of equirectangular height)
  const ceilingGradient = ctx.createLinearGradient(0, 0, 0, height * 0.38);
  ceilingGradient.addColorStop(0, ceilingColor);
  ceilingGradient.addColorStop(1, wallBaseColor);
  ctx.fillStyle = ceilingGradient;
  ctx.fillRect(0, 0, width, height * 0.38);

  // Ceiling soft ambient light source
  const ceilLightGrad = ctx.createRadialGradient(width * 0.5, height * 0.18, 5, width * 0.5, height * 0.18, 260);
  ceilLightGrad.addColorStop(0, isEvening ? 'rgba(251, 191, 36, 0.35)' : 'rgba(255, 255, 255, 0.4)');
  ceilLightGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = ceilLightGrad;
  ctx.fillRect(0, 0, width, height * 0.38);

  // 3. Floor (Bottom ~38% of equirectangular height)
  const floorY = height * 0.62;
  const floorH = height - floorY;

  const floorGradient = ctx.createLinearGradient(0, floorY, 0, height);
  floorGradient.addColorStop(0, wallBaseColor);
  floorGradient.addColorStop(0.1, floorWoodBase);
  floorGradient.addColorStop(1, isEvening ? '#1a110a' : '#2a1a12');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, floorY, width, floorH);

  // Render perspective floor planks
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    const xRatio = i / 40;
    const x = xRatio * width;
    ctx.beginPath();
    ctx.moveTo(x, floorY + 15);
    // Radiate outwards to simulate floor perspective
    const spreadX = ((x - width * 0.5) * 1.6) + width * 0.5;
    ctx.lineTo(spreadX, height);
    ctx.stroke();
  }
  // Subtle horizontal wood plank seams
  for (let y = floorY + 40; y < height; y += 45) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Architectural Wall Division Seams & Depth Shading
  // In 360 equirectangular, 0° = North, 90° = East (Window wall), 180° = South, 270° = West (Bed wall)
  // width: 0 to 2048.
  // Window wall at x = 0.45 * width to 0.65 * width (around East)
  // Bed wall at x = 0.08 * width to 0.32 * width (around West/North-West)
  // Desk wall at x = 0.62 * width to 0.88 * width
  // Entry corridor / door at x = 0.90 * width to 0.05 * width

  // Soft wall ambient gradient
  const wallGrad = ctx.createLinearGradient(0, height * 0.35, 0, floorY);
  wallGrad.addColorStop(0, wallBaseColor);
  wallGrad.addColorStop(0.5, wallWarmth);
  wallGrad.addColorStop(1, wallBaseColor);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, height * 0.36, width, floorY - height * 0.36);

  // Corner shadows (Room corners at x = 0.25*width, 0.5*width, 0.75*width, 1.0*width)
  [0.25, 0.5, 0.75].forEach((cornerXRatio) => {
    const cx = cornerXRatio * width;
    const cornerGrad = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
    cornerGrad.addColorStop(0, 'transparent');
    cornerGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    cornerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(cx - 50, height * 0.25, 100, floorY - height * 0.2);
  });

  // Baseboard trim along the bottom of the wall
  ctx.fillStyle = isEvening ? '#1c1917' : '#332f2b';
  ctx.fillRect(0, floorY - 6, width, 8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, floorY - 7, width, 1.5);

  // 5. Large Architectural Window with City View & Light Spill (at x = 1100 to 1420)
  const winX = width * 0.54;
  const winW = width * 0.16;
  const winY = height * 0.32;
  const winH = height * 0.30;

  // Window frame shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(winX - 6, winY - 6, winW + 12, winH + 12);

  // Window glass / Outside view
  const winSky = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  if (isEvening) {
    winSky.addColorStop(0, '#0f172a');
    winSky.addColorStop(0.6, '#311042');
    winSky.addColorStop(0.85, '#9a3412');
    winSky.addColorStop(1, '#ea580c');
  } else {
    winSky.addColorStop(0, '#60a5fa');
    winSky.addColorStop(0.7, '#bae6fd');
    winSky.addColorStop(1, '#fef08a');
  }
  ctx.fillStyle = winSky;
  ctx.fillRect(winX, winY, winW, winH);

  // Distant city silhouette in window
  ctx.fillStyle = isEvening ? '#090d16' : 'rgba(100, 116, 139, 0.35)';
  const bldgWidths = [18, 26, 14, 32, 20, 24, 18, 28];
  let curBx = winX + 8;
  bldgWidths.forEach((bw, idx) => {
    const bh = 30 + ((idx * 17) % 55);
    ctx.fillRect(curBx, winY + winH - bh, bw, bh);
    // Tiny building window lights if evening
    if (isEvening) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      for (let ly = winY + winH - bh + 6; ly < winY + winH - 6; ly += 8) {
        ctx.fillRect(curBx + 3, ly, 3, 3);
        if (bw > 20) ctx.fillRect(curBx + 12, ly, 3, 3);
      }
      ctx.fillStyle = '#090d16';
    }
    curBx += bw + 5;
  });

  // Window mullions (Clean architectural black grid)
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 5;
  ctx.strokeRect(winX, winY, winW, winH);
  // vertical center divider
  ctx.beginPath();
  ctx.moveTo(winX + winW * 0.5, winY);
  ctx.lineTo(winX + winW * 0.5, winY + winH);
  // horizontal dividers
  ctx.moveTo(winX, winY + winH * 0.4);
  ctx.lineTo(winX + winW, winY + winH * 0.4);
  ctx.stroke();

  // Natural Daylight Wash on Floor & Wall beside window
  const lightSpill = ctx.createRadialGradient(winX + winW * 0.4, winY + winH, 20, winX + winW * 0.4, floorY + 80, winW * 1.4);
  lightSpill.addColorStop(0, windowGlow);
  lightSpill.addColorStop(0.5, isEvening ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255, 255, 255, 0.25)');
  lightSpill.addColorStop(1, 'transparent');
  ctx.fillStyle = lightSpill;
  ctx.fillRect(winX - 80, floorY - 10, winW + 200, 180);

  // 6. Platform Bed & Linen Area (at x = width * 0.12 to 0.28)
  const bedX = width * 0.11;
  const bedW = width * 0.17;
  const bedY = floorY - 45;
  const bedH = 85;

  // Bed platform base (Warm solid oak)
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(bedX, floorY - 14, bedW, 20);

  // Wooden Headboard against wall
  ctx.fillStyle = '#292524';
  ctx.fillRect(bedX, bedY - 40, bedW, 42);
  ctx.fillStyle = '#3a3430';
  ctx.fillRect(bedX + 8, bedY - 34, bedW - 16, 30);

  // Mattress & Linen Duvet
  const duvetColor = isEvening ? '#3f3f46' : '#52525b';
  const sheetColor = isEvening ? '#52525b' : '#a1a1aa';
  ctx.fillStyle = duvetColor;
  ctx.beginPath();
  ctx.roundRect(bedX + 10, bedY, bedW - 20, bedH * 0.65, 8);
  ctx.fill();

  // Folded accent throw blanket
  ctx.fillStyle = isEvening ? '#78350f' : '#475569';
  ctx.beginPath();
  ctx.roundRect(bedX + bedW * 0.45, bedY + 10, bedW * 0.45, bedH * 0.45, 6);
  ctx.fill();

  // Dual Pillows
  ctx.fillStyle = sheetColor;
  ctx.beginPath();
  ctx.roundRect(bedX + 20, bedY - 15, bedW * 0.35, 25, 5);
  ctx.roundRect(bedX + bedW * 0.42, bedY - 15, bedW * 0.35, 25, 5);
  ctx.fill();

  // Bedside nightstand
  const nStandX = bedX + bedW + 10;
  ctx.fillStyle = '#262626';
  ctx.fillRect(nStandX, floorY - 35, 45, 40);
  ctx.fillStyle = '#383838';
  ctx.fillRect(nStandX + 3, floorY - 32, 39, 14);
  // Bedside mini lamp
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(nStandX + 18, floorY - 55, 6, 20);
  ctx.fillStyle = isEvening ? '#fef08a' : '#f5f5f4';
  ctx.beginPath();
  ctx.arc(nStandX + 21, floorY - 58, 12, 0, Math.PI * 2);
  ctx.fill();

  // 7. Work Desk & Workstation (at x = width * 0.70 to 0.86)
  const deskX = width * 0.69;
  const deskW = width * 0.16;
  const deskY = floorY - 60;

  // Desk Surface & Legs
  ctx.fillStyle = '#262626';
  // Metal hairpin/straight legs
  ctx.fillRect(deskX + 10, deskY + 12, 5, 54);
  ctx.fillRect(deskX + deskW - 15, deskY + 12, 5, 54);
  // Solid Oak desktop
  ctx.fillStyle = '#443425';
  ctx.fillRect(deskX, deskY, deskW, 14);
  ctx.fillStyle = '#574230';
  ctx.fillRect(deskX, deskY, deskW, 4);

  // Desk Chair
  const chairX = deskX + deskW * 0.38;
  const chairY = floorY - 45;
  ctx.fillStyle = '#171717';
  // Chair base & casters
  ctx.fillRect(chairX + 16, chairY + 28, 6, 20);
  ctx.fillRect(chairX + 5, chairY + 44, 28, 4);
  // Seat cushion
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.roundRect(chairX, chairY + 10, 42, 14, 4);
  ctx.fill();
  // Ergonomic mesh backrest
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 4;
  ctx.strokeRect(chairX + 4, chairY - 32, 34, 40);

  // Monitor & Equipment on Desk
  if (isWork) {
    // Mode: Dual ultra-wide display & vertical Pegboard
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deskX + 25, deskY - 65, 85, 55);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(deskX + 28, deskY - 62, 79, 49);

    ctx.fillRect(deskX + 115, deskY - 60, 65, 50);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(deskX + 117, deskY - 58, 61, 46);

    // Vertical Pegboard behind desk on wall
    ctx.fillStyle = '#2d2b27';
    ctx.fillRect(deskX + 10, deskY - 140, deskW - 20, 65);
    // Pegboard dot matrix
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for (let px = deskX + 20; px < deskX + deskW - 25; px += 16) {
      for (let py = deskY - 130; py < deskY - 80; py += 14) {
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // High-focus task lamp (Angled LED bar)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(deskX + deskW - 30, deskY);
    ctx.lineTo(deskX + deskW - 30, deskY - 75);
    ctx.lineTo(deskX + deskW - 65, deskY - 75);
    ctx.stroke();
  } else {
    // Standard Single Monitor & Laptop
    ctx.fillStyle = '#171717';
    ctx.fillRect(deskX + 50, deskY - 50, 65, 42);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(deskX + 53, deskY - 47, 59, 36);
    ctx.fillStyle = '#52525b';
    ctx.fillRect(deskX + 78, deskY - 8, 10, 8);

    // Laptop beside monitor
    ctx.fillStyle = '#71717a';
    ctx.fillRect(deskX + 125, deskY - 18, 32, 18);
  }

  // 8. Wall Shelves & Display (at x = width * 0.35 to 0.48)
  const shelfX = width * 0.35;
  const shelfW = width * 0.12;
  const shelfY1 = height * 0.42;
  const shelfY2 = height * 0.49;

  ctx.fillStyle = '#3e2e20';
  ctx.fillRect(shelfX, shelfY1, shelfW, 7);
  ctx.fillRect(shelfX, shelfY2, shelfW, 7);

  // Books and items on shelf 1
  const bookColors = ['#b91c1c', '#1d4ed8', '#15803d', '#d97706', '#4338ca'];
  bookColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(shelfX + 15 + i * 11, shelfY1 - 24, 9, 24);
  });
  // Small potted pothos plant
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(shelfX + shelfW - 35, shelfY1 - 8, 10, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(shelfX + shelfW - 35, shelfY1 - 18, 14, 0, Math.PI * 2);
  ctx.fill();

  // Shelf 2 items
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(shelfX + 25, shelfY2 - 16, 28, 16);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(shelfX + shelfW - 40, shelfY2 - 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // 9. Specific Scenario Injections
  if (isEvening) {
    // Mode: Evening Reading Sanctuary
    // Luxurious Brass Arc Floor Lamp in corner (x = width * 0.49)
    const lampX = width * 0.485;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(lampX, floorY);
    ctx.bezierCurveTo(lampX - 10, floorY - 120, lampX - 30, floorY - 180, lampX - 60, floorY - 170);
    ctx.stroke();

    // Lamp shade & Glowing warm aura
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(lampX - 60, floorY - 165, 14, Math.PI, 0);
    ctx.fill();

    // Radial warm cone of light (2700K amber glow)
    const lampGlow = ctx.createRadialGradient(lampX - 60, floorY - 150, 10, lampX - 60, floorY - 50, 240);
    lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    lampGlow.addColorStop(0.3, 'rgba(245, 158, 11, 0.35)');
    lampGlow.addColorStop(0.7, 'rgba(217, 119, 6, 0.12)');
    lampGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(lampX - 220, floorY - 180, 360, 220);

    // Comfy Upholstered Reading Armchair
    const armX = lampX - 95;
    const armY = floorY - 60;
    // Cushion
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.roundRect(armX, armY, 65, 45, 12);
    ctx.fill();
    // Armrests
    ctx.fillStyle = '#1e3a0b';
    ctx.beginPath();
    ctx.roundRect(armX - 8, armY + 5, 12, 38, 5);
    ctx.roundRect(armX + 61, armY + 5, 12, 38, 5);
    ctx.fill();

    // Small Round Oak Side Table with Ceramic Mug
    const tblX = armX + 78;
    ctx.fillStyle = '#292524';
    ctx.fillRect(tblX + 16, floorY - 30, 4, 30);
    ctx.fillStyle = '#574230';
    ctx.beginPath();
    ctx.ellipse(tblX + 18, floorY - 32, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Steaming mug
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(tblX + 12, floorY - 42, 10, 10);

    // Textured Wool Floor Runner Rug
    ctx.fillStyle = 'rgba(180, 150, 120, 0.35)';
    ctx.beginPath();
    ctx.ellipse(armX + 40, floorY + 40, 110, 35, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Botanical Wall Art Print
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(armX + 10, height * 0.32, 45, 60);
    ctx.fillStyle = '#f5f5f4';
    ctx.fillRect(armX + 14, height * 0.32 + 4, 37, 52);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(armX + 32, height * 0.32 + 30, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (isCreative) {
    // Mode: Creative Studio & Adaptable Setup
    // Mobile Wooden Art / Storage Trolley with supplies (at x = width * 0.46)
    const cartX = width * 0.45;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cartX, floorY - 60, 48, 55);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cartX + 3, floorY - 56, 42, 14);
    ctx.fillRect(cartX + 3, floorY - 38, 42, 14);
    ctx.fillRect(cartX + 3, floorY - 20, 42, 14);
    // Swivel casters
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.arc(cartX + 8, floorY - 2, 4, 0, Math.PI * 2);
    ctx.arc(cartX + 40, floorY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wall Hanging Art Grid (Pinned prints and sketches)
    const gridX = width * 0.34;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let gx = gridX; gx < gridX + 90; gx += 15) {
      ctx.beginPath();
      ctx.moveTo(gx, height * 0.30);
      ctx.lineTo(gx, height * 0.44);
      ctx.stroke();
    }
    // Color sketch cards pinned
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(gridX + 12, height * 0.32, 24, 30);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(gridX + 45, height * 0.34, 28, 32);

    // Foldable guest stool tucked neatly
    ctx.fillStyle = '#44403c';
    ctx.fillRect(cartX + 65, floorY - 35, 32, 35);
  }

  // 10. Room Entrance Doorway & Hallway (at x = width * 0.93 to 1.0)
  const doorX = width * 0.92;
  const doorW = width * 0.07;
  const doorY = height * 0.28;
  const doorH = floorY - doorY;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(doorX - 4, doorY - 4, doorW + 8, doorH + 4);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Door handle
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(doorX + 10, doorY + doorH * 0.5, 12, 4);

  // 11. Custom Lighting Temperature Color Filter Overlay
  if (lighting) {
    const temp = lighting.colorTempK;
    const intensity = lighting.intensity || 1.0;
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';

    if (temp < 3000) {
      // Very warm / Amber (2200K - 3000K)
      ctx.fillStyle = `rgba(251, 146, 60, ${0.25 * intensity})`;
    } else if (temp < 4000) {
      // Soft warm (3000K - 4000K)
      ctx.fillStyle = `rgba(253, 230, 138, ${0.18 * intensity})`;
    } else if (temp < 5200) {
      // Neutral daylight (4000K - 5200K)
      ctx.fillStyle = `rgba(241, 245, 249, ${0.12 * intensity})`;
    } else {
      // Cool focus (5200K - 6500K)
      ctx.fillStyle = `rgba(186, 230, 253, ${0.22 * intensity})`;
    }
    ctx.fillRect(0, 0, width, height);

    if (lighting.accentHue) {
      ctx.fillStyle = lighting.accentHue;
      ctx.globalAlpha = 0.15 * intensity;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  // Return the synthesized canvas
  return canvas;
}
