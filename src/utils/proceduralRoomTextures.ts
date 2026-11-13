import * as THREE from 'three';
import { LightingSetting } from '../types';

/**
 * Procedural texture generators for the Reconstructed Base Room.
 * Crafted to match the exact equirectangular reference photo:
 * - Polished cream ceramic floor tiles with glossy specular sheen and grout seams
 * - Off-white matte plaster walls & ceiling
 * - Dark mahogany/walnut wood door with carved oval moulding
 * - Dual curtains: inner floral pattern + rich burgundy velvet drape
 * - Ultra-clean electrical switchboards & 3-pin plug sockets
 * - Split AC unit front panel with horizontal louvers & LED indicator
 * - Exterior daylight garden backdrop through the window safety grills
 * - Rich wood grain for tables, bed, wardrobe, and vanity
 * - Woven rattan wicker for laundry hamper
 * - Brushed metal for fans and legs
 * - Natural linen for fabrics and liner
 */

// 1. Polished Ceramic Floor Tiles (matching the large square beige glossy tiles in photo)
export function createPolishedCeramicFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#f0ebe1';
  ctx.fillRect(0, 0, 1024, 1024);

  const tileSize = 256;
  const tilesPerSide = 4;

  for (let r = 0; r < tilesPerSide; r++) {
    for (let c = 0; c < tilesPerSide; c++) {
      const x = c * tileSize;
      const y = r * tileSize;

      const tileSeed = Math.sin(r * 7.1 + c * 13.3);
      const toneDiff = Math.floor(tileSeed * 6);
      const baseR = 242 + toneDiff;
      const baseG = 237 + toneDiff;
      const baseB = 227 + toneDiff;

      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, `rgb(${Math.min(255, baseR + 3)}, ${Math.min(255, baseG + 3)}, ${Math.min(255, baseB + 2)})`);
      grad.addColorStop(1, `rgb(${Math.max(0, baseR - 4)}, ${Math.max(0, baseG - 4)}, ${Math.max(0, baseB - 5)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      ctx.fillStyle = 'rgba(215, 205, 190, 0.08)';
      for (let m = 0; m < 5; m++) {
        const mx = x + 30 + (Math.sin(m * 2.5 + tileSeed) * 0.5 + 0.5) * (tileSize - 60);
        const my = y + 30 + (Math.cos(m * 3.1 + tileSeed) * 0.5 + 0.5) * (tileSize - 60);
        ctx.beginPath();
        ctx.arc(mx, my, 28 + m * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#d6cebf';
      ctx.fillRect(x + tileSize - 2, y, 2, tileSize);
      ctx.fillRect(x, y + tileSize - 2, tileSize, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 2. Off-white Plaster Wall Texture
export function createOffWhitePlasterWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#f4f3ef';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. Dark Walnut Wood Door Texture with Carved Oval Design
export function createDarkWalnutDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#342013';
  ctx.fillRect(0, 0, 512, 1024);

  for (let x = 0; x < 512; x += 3) {
    const grainAlpha = 0.04 + Math.sin(x * 0.15) * 0.03;
    ctx.fillStyle = `rgba(80, 50, 30, ${grainAlpha})`;
    ctx.fillRect(x, 0, 2, 1024);
  }

  ctx.strokeStyle = '#22140a';
  ctx.lineWidth = 14;
  ctx.strokeRect(32, 32, 512 - 64, 1024 - 64);

  ctx.strokeStyle = '#4e3321';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 512 - 80, 1024 - 80);

  const ovalCenterX = 256;
  const ovalCenterY = 320;
  const ovalRadiusX = 140;
  const ovalRadiusY = 200;

  ctx.strokeStyle = '#1e1108';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#5a3d28';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX - 10, ovalRadiusY - 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  const ovalGrad = ctx.createRadialGradient(ovalCenterX - 20, ovalCenterY - 30, 20, ovalCenterX, ovalCenterY, ovalRadiusX);
  ovalGrad.addColorStop(0, '#422a1b');
  ovalGrad.addColorStop(1, '#2c1a0e');
  ctx.fillStyle = ovalGrad;
  ctx.beginPath();
  ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX - 16, ovalRadiusY - 16, 0, 0, Math.PI * 2);
  ctx.fill();

  const lowerY = 600;
  const lowerH = 340;
  ctx.strokeStyle = '#1e1108';
  ctx.lineWidth = 12;
  ctx.strokeRect(70, lowerY, 512 - 140, lowerH);

  ctx.strokeStyle = '#523723';
  ctx.lineWidth = 4;
  ctx.strokeRect(78, lowerY + 8, 512 - 156, lowerH - 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 4. Inner Window Curtain Floral Pattern Texture
export function createFloralCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#f3eee6';
  ctx.fillRect(0, 0, 512, 1024);

  ctx.fillStyle = 'rgba(210, 200, 185, 0.2)';
  for (let y = 0; y < 1024; y += 4) {
    ctx.fillRect(0, y, 512, 1);
  }

  ctx.strokeStyle = '#5d4842';
  ctx.fillStyle = '#7a6058';

  for (let branchY = 80; branchY < 1000; branchY += 160) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(80, branchY);
    ctx.bezierCurveTo(200, branchY - 40, 320, branchY + 60, 460, branchY - 20);
    ctx.stroke();

    for (let p = 0; p < 5; p++) {
      const lx = 120 + p * 70;
      const ly = branchY + Math.sin(p * 1.8) * 35;

      ctx.fillStyle = p % 2 === 0 ? '#782333' : '#695147';
      ctx.beginPath();
      ctx.arc(lx, ly, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#847367';
      ctx.beginPath();
      ctx.ellipse(lx + 12, ly - 8, 12, 5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let x = 0; x < 512; x += 64) {
    const foldGrad = ctx.createLinearGradient(x, 0, x + 64, 0);
    foldGrad.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
    foldGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    foldGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = foldGrad;
    ctx.fillRect(x, 0, 64, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5. Deep Burgundy / Maroon Velvet Outer Drape Texture
export function createBurgundyCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#670f20';
  ctx.fillRect(0, 0, 256, 1024);

  const numFolds = 5;
  const foldW = 256 / numFolds;

  for (let i = 0; i < numFolds; i++) {
    const x = i * foldW;
    const grad = ctx.createLinearGradient(x, 0, x + foldW, 0);
    grad.addColorStop(0, '#380610');
    grad.addColorStop(0.4, '#8c1a30');
    grad.addColorStop(0.8, '#5d0e1c');
    grad.addColorStop(1, '#2e040c');

    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, foldW, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5b. Warm Earthy Terracotta Curtain Texture (Warm Studio Palette)
export function createTerracottaCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#b85d43';
  ctx.fillRect(0, 0, 256, 1024);

  const numFolds = 5;
  const foldW = 256 / numFolds;

  for (let i = 0; i < numFolds; i++) {
    const x = i * foldW;
    const grad = ctx.createLinearGradient(x, 0, x + foldW, 0);
    grad.addColorStop(0, '#7c3824');
    grad.addColorStop(0.35, '#d47355');
    grad.addColorStop(0.7, '#b85d43');
    grad.addColorStop(1, '#662d1c');

    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, foldW, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5c. Soft Powder Blue / Nordic Sage Curtain Texture (Cool Pastel Palette)
export function createCoolPastelCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#94b8c7';
  ctx.fillRect(0, 0, 256, 1024);

  const numFolds = 5;
  const foldW = 256 / numFolds;

  for (let i = 0; i < numFolds; i++) {
    const x = i * foldW;
    const grad = ctx.createLinearGradient(x, 0, x + foldW, 0);
    grad.addColorStop(0, '#5f8494');
    grad.addColorStop(0.4, '#b4d6e4');
    grad.addColorStop(0.75, '#8daec0');
    grad.addColorStop(1, '#4e6f7e');

    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, foldW, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. Split Air Conditioner Front Panel Texture
export function createACFrontPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#f8f8fa';
  ctx.fillRect(0, 0, 512, 180);

  const topGrad = ctx.createLinearGradient(0, 0, 0, 30);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, 512, 30);

  ctx.fillStyle = '#222226';
  ctx.fillRect(16, 145, 480, 4);

  ctx.fillStyle = '#e5e5ea';
  ctx.fillRect(16, 150, 480, 22);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(40, 36, 42, 54);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(44, 40, 34, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('BEE', 49, 52);
  ctx.fillText('5 STAR', 42, 70);

  ctx.fillStyle = '#52525b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('INVERTER', 110, 68);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(410, 46, 58, 28, 4);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('24°C', 418, 66);

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(480, 56, 3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 7. Modular Electrical Switchboard Faceplate (Multi-gang switches + 3-pin socket)
export function createModularSwitchboardTexture(hasSocket = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#fbfbfb';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 500, 244);

  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, 484, 228);

  if (hasSocket) {
    const socketCenterX = 130;
    const socketCenterY = 128;

    ctx.fillStyle = '#f0f0f2';
    ctx.strokeStyle = '#d1d1d6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(socketCenterX - 70, socketCenterY - 70, 140, 140, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(socketCenterX, socketCenterY - 32, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(socketCenterX - 30, socketCenterY + 25, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(socketCenterX + 30, socketCenterY + 25, 10, 0, Math.PI * 2);
    ctx.fill();

    const startX = 240;
    const switchW = 55;
    const switchH = 95;
    const gap = 14;

    for (let s = 0; s < 4; s++) {
      const sx = startX + s * (switchW + gap);
      const sy = 80;

      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(sx - 2, sy - 2, switchW + 4, switchH + 4);

      const rockerGrad = ctx.createLinearGradient(sx, sy, sx, sy + switchH);
      rockerGrad.addColorStop(0, '#ffffff');
      rockerGrad.addColorStop(0.48, '#f4f4f5');
      rockerGrad.addColorStop(0.52, '#e4e4e7');
      rockerGrad.addColorStop(1, '#d4d4d8');
      ctx.fillStyle = rockerGrad;
      ctx.fillRect(sx, sy, switchW, switchH);

      ctx.fillStyle = s === 0 ? '#ef4444' : '#a1a1aa';
      ctx.fillRect(sx + switchW / 2 - 4, sy + switchH - 16, 8, 4);
    }
  } else {
    const numSwitches = 4;
    const switchW = 75;
    const switchH = 110;
    const gap = 24;
    const startX = (512 - (numSwitches * switchW + (numSwitches - 1) * gap)) / 2;

    for (let s = 0; s < numSwitches; s++) {
      const sx = startX + s * (switchW + gap);
      const sy = 73;

      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(sx - 2, sy - 2, switchW + 4, switchH + 4);

      const rockerGrad = ctx.createLinearGradient(sx, sy, sx, sy + switchH);
      rockerGrad.addColorStop(0, '#ffffff');
      rockerGrad.addColorStop(0.48, '#f4f4f5');
      rockerGrad.addColorStop(0.52, '#e4e4e7');
      rockerGrad.addColorStop(1, '#d4d4d8');
      ctx.fillStyle = rockerGrad;
      ctx.fillRect(sx, sy, switchW, switchH);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx + switchW / 2 - 6, sy + switchH - 18, 12, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 8. Outside Garden Sky Texture through Window Safety Grill
export function createOutdoorGardenWindowTexture(lighting: LightingSetting): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const isEvening = lighting.preset === 'warm_evening';

  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  if (isEvening) {
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.6, '#312e81');
    skyGrad.addColorStop(1, '#f59e0b');
  } else {
    skyGrad.addColorStop(0, '#dbeafe');
    skyGrad.addColorStop(0.6, '#eff6ff');
    skyGrad.addColorStop(1, '#ffffff');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = isEvening ? '#142518' : '#64805c';
  for (let t = 0; t < 6; t++) {
    const tx = 40 + t * 90;
    const ty = 340 + Math.sin(t * 2.3) * 30;
    const tr = 65 + (t % 3) * 15;
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  }

  const sunGrad = ctx.createRadialGradient(420, 80, 10, 420, 80, 200);
  sunGrad.addColorStop(0, isEvening ? 'rgba(251, 146, 60, 0.6)' : 'rgba(255, 255, 255, 0.8)');
  sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 9. Paisley Boho Warm Terracotta Bedsheet
export function createPaisleyBedsheetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#78283a';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#f5c97a';
  ctx.fillRect(0, 0, 512, 28);
  ctx.fillRect(0, 484, 512, 28);
  ctx.fillStyle = '#26544b';
  ctx.fillRect(0, 28, 512, 14);
  ctx.fillRect(0, 470, 512, 14);

  const rows = 4;
  const cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 50 + c * 100 + ((r % 2) * 50);
      const cy = 80 + r * 100;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.3);

      ctx.fillStyle = '#f2d6a2';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI);
      ctx.bezierCurveTo(-24, -20, 0, -45, 12, -40);
      ctx.bezierCurveTo(4, -25, 24, -10, 24, 0);
      ctx.fill();

      ctx.fillStyle = '#1c4d44';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d94b56';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 10. Cool Pastel Geometric Bedsheet (Option Palette 2)
export function createCoolPastelBedsheetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#fbfbf8';
  ctx.fillRect(0, 0, 512, 512);

  const colors = ['#bae6fd', '#fef08a', '#c7d2fe', '#e0e7ff'];
  const size = 64;
  for (let y = 0; y < 512; y += size) {
    for (let x = 0; x < 512; x += size) {
      const idx = ((x / size) + (y / size)) % colors.length;
      ctx.fillStyle = colors[idx];
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 11. Boho Woven Area Rug Texture
export function createBohoRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#eae2d3';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#38332d';
  ctx.lineWidth = 4;

  const diamondSize = 80;
  for (let x = 0; x <= 512 + diamondSize; x += diamondSize) {
    for (let y = 0; y <= 512 + diamondSize; y += diamondSize) {
      ctx.beginPath();
      ctx.moveTo(x, y - diamondSize / 2);
      ctx.lineTo(x + diamondSize / 2, y);
      ctx.lineTo(x, y + diamondSize / 2);
      ctx.lineTo(x - diamondSize / 2, y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#c98a4b';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, 512, 12);
  ctx.fillRect(0, 500, 512, 12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 12. Slatted Wood Screen Separator Texture
export function createWoodSlatsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#3a2318';
  ctx.fillRect(0, 0, 256, 256);

  const slatW = 16;
  const gap = 12;
  for (let x = 0; x < 256; x += (slatW + gap)) {
    const woodGrad = ctx.createLinearGradient(x, 0, x + slatW, 0);
    woodGrad.addColorStop(0, '#8c5938');
    woodGrad.addColorStop(0.5, '#b0794e');
    woodGrad.addColorStop(1, '#694126');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(x, 0, slatW, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 13. Natural Wood Grain Texture (for Tables, Bed Frame, Dressing Table, Wardrobe, Side Table)
export function createNaturalWoodGrainTexture(preset: 'walnut' | 'teak' | 'oak' = 'walnut'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const baseCol = preset === 'teak' ? '#5a381f' : preset === 'oak' ? '#8a5c38' : '#382214';
  ctx.fillStyle = baseCol;
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.lineWidth = 1.6;
  for (let x = 0; x < 512; x += 4) {
    const freq = 0.008 + (x % 7) * 0.002;
    const waveAmp = 12 + Math.sin(x * 0.05) * 8;
    ctx.strokeStyle = (x % 8 === 0) ? 'rgba(15, 8, 3, 0.38)' : 'rgba(125, 85, 50, 0.2)';

    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 16) {
      const xOffset = Math.sin(y * freq) * waveAmp + Math.cos(y * 0.02) * 4;
      ctx.lineTo(x + xOffset, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(15, 8, 4, 0.28)';
  for (let i = 0; i < 350; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillRect(px, py, 1.2, 4 + Math.random() * 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 14. Woven Rattan / Wicker Basket Texture (for Laundry Bucket / Hamper)
export function createWovenRattanHamperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#c8a87b';
  ctx.fillRect(0, 0, 512, 512);

  const rowH = 16;
  const colW = 20;

  for (let y = 0; y < 512; y += rowH) {
    const rowGrad = ctx.createLinearGradient(0, y, 0, y + rowH);
    rowGrad.addColorStop(0, '#7c5832');
    rowGrad.addColorStop(0.3, '#d8b98d');
    rowGrad.addColorStop(0.7, '#c29f70');
    rowGrad.addColorStop(1, '#694724');
    ctx.fillStyle = rowGrad;
    ctx.fillRect(0, y, 512, rowH - 2);

    ctx.fillStyle = '#422a13';
    ctx.fillRect(0, y + rowH - 2, 512, 2);
  }

  for (let y = 0; y < 512; y += rowH) {
    const shift = (Math.floor(y / rowH) % 2) * (colW / 2);
    for (let x = shift; x < 512; x += colW) {
      ctx.fillStyle = 'rgba(60, 35, 15, 0.45)';
      ctx.fillRect(x, y, 2.5, rowH);
      ctx.fillStyle = 'rgba(255, 235, 200, 0.35)';
      ctx.fillRect(x + 2.5, y, 1.5, rowH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 15. Fine Brushed Metal Texture (for Pedestal Fan, Legs, Window Grills)
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#26282b';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y++) {
    const alpha = 0.06 + Math.random() * 0.14;
    const tone = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
    ctx.fillRect(0, y, 256, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 16. Fabric Linen Texture (for Cushions, Upholstery, Laundry Basket Liner)
export function createFabricLinenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#ebe6de';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(120, 110, 95, 0.12)';
  for (let i = 0; i < 256; i += 2) {
    ctx.fillRect(i, 0, 1, 256);
    ctx.fillRect(0, i, 256, 1);
  }

  ctx.fillStyle = 'rgba(80, 70, 60, 0.15)';
  for (let n = 0; n < 150; n++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 4, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
