import * as THREE from 'three';

function makeCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx, size };
}

export function createLeatherTexture() {
  const { canvas, ctx, size } = makeCanvas(512);
  const base = '#831F3F';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Fine grain
  for (let i = 0; i < 18000; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = 0.015 + Math.random() * 0.04;
    const shade = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${a})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  // Soft leather mottling
  for (let i = 0; i < 80; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120, 30, 55, ${0.08 + Math.random() * 0.1})`);
    g.addColorStop(1, 'rgba(120, 30, 55, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle horizontal tooling lines
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < size; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 2);
    ctx.lineTo(size, y + Math.random() * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLeatherBumpTexture() {
  const { canvas, ctx, size } = makeCanvas(256);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 12000; i += 1) {
    const v = 100 + Math.floor(Math.random() * 55);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createPageTexture() {
  const { canvas, ctx, size } = makeCanvas(256);
  ctx.fillStyle = '#F8E8D8';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 4000; i += 1) {
    const a = Math.random() * 0.03;
    ctx.fillStyle = `rgba(120, 90, 60, ${a})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  // Soft ruled suggestion near gutter
  ctx.strokeStyle = 'rgba(180, 140, 110, 0.05)';
  for (let y = 30; y < size - 20; y += 10) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(size - 20, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
