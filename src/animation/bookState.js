import { BOOK } from '../constants/book';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function stageLocal(progress, start, end) {
  return clamp01((progress - start) / (end - start));
}

/**
 * Maps normalized scroll progress (0–1) to a continuous, reversible book + camera state.
 */
export function getBookState(progress, isMobile = false) {
  const p = clamp01(progress);
  const camScale = isMobile ? 1.35 : 1;

  // --- Cover open (0 closed → ~0.92 ≈ 166° so exterior still reads from above) ---
  // Closing waits until pages have largely settled to avoid cover clipping the page block.
  let coverOpen = 0;
  if (p < 0.25) coverOpen = 0;
  else if (p < 0.37) coverOpen = smoothstep(0.25, 0.37, p) * 0.38;
  else if (p < 0.5) coverOpen = lerp(0.38, 0.92, smoothstep(0.37, 0.5, p));
  else if (p < 0.78) coverOpen = 0.92;
  else if (p < 0.9) coverOpen = lerp(0.92, 0, smoothstep(0.78, 0.9, p));
  else coverOpen = 0;

  // --- Book root rotation ---
  let rotX = 0;
  let rotY = 0;
  let rotZ = 0;

  if (p < 0.12) {
    const t = stageLocal(p, 0, 0.12);
    rotY = lerp(0, 0.06, t);
  } else if (p < 0.25) {
    const t = smoothstep(0.12, 0.25, p);
    rotY = lerp(0.06, 0.52, t);
    rotX = lerp(0, -0.06, t);
  } else if (p < 0.37) {
    const t = smoothstep(0.25, 0.37, p);
    rotY = lerp(0.52, 0.28, t);
    rotX = lerp(-0.06, -0.7, t);
  } else if (p < 0.5) {
    const t = smoothstep(0.37, 0.5, p);
    rotY = lerp(0.28, 0.0, t);
    rotX = lerp(-0.7, -Math.PI / 2 + 0.02, t);
    rotZ = 0;
  } else if (p < 0.78) {
    rotX = -Math.PI / 2 + 0.02;
    rotY = 0;
    rotZ = 0;
  } else if (p < 0.9) {
    const t = smoothstep(0.78, 0.9, p);
    rotX = lerp(-Math.PI / 2 + 0.02, -0.08, t);
    rotY = lerp(0, Math.PI * 0.78, t);
    rotZ = 0;
  } else {
    const t = smoothstep(0.9, 1, p);
    rotX = lerp(-0.08, 0, t);
    rotY = lerp(Math.PI * 0.78, Math.PI, t);
    rotZ = 0;
  }

  // --- Page turns ---
  const pageTurns = Array.from({ length: BOOK.pageCount }, () => 0);
  if (p >= 0.5 && p < 0.62) {
    const t = stageLocal(p, 0.5, 0.62);
    pageTurns[0] = smoothstep(0, 0.4, t);
    pageTurns[1] = smoothstep(0.18, 0.65, t);
    pageTurns[2] = smoothstep(0.4, 0.95, t);
  } else if (p >= 0.62 && p < 0.75) {
    pageTurns[0] = 1;
    pageTurns[1] = 1;
    pageTurns[2] = 1;
    const t = stageLocal(p, 0.62, 0.75);
    pageTurns[3] = smoothstep(0, 0.5, t);
    pageTurns[4] = smoothstep(0.22, 0.75, t);
    pageTurns[5] = smoothstep(0.45, 1, t);
  } else if (p >= 0.75 && p < 0.9) {
    // Pages settle first (0.75–0.82), then cover finishes closing
    const t = smoothstep(0.75, 0.82, p);
    for (let i = 0; i < BOOK.pageCount; i += 1) {
      pageTurns[i] = lerp(1, 0, t);
    }
  }

  // --- Book position ---
  let position = [0, 0.04, 0];
  if (p < 0.37) {
    position = [0, lerp(0.04, 0, smoothstep(0, 0.37, p)), 0];
  } else if (p < 0.5) {
    position = [0, lerp(0, -0.05, smoothstep(0.37, 0.5, p)), 0];
  } else if (p < 0.78) {
    position = [0, -0.05, 0];
  } else if (p < 0.9) {
    position = [0, lerp(-0.05, 0.02, smoothstep(0.78, 0.9, p)), 0];
  } else {
    position = [0, lerp(0.02, 0.04, smoothstep(0.9, 1, p)), 0];
  }

  // --- Camera: pulled back on flat/page stages so the full open book reads ---
  const camStart = [0, 0.12, 4.85 * camScale];
  const camThreeQ = [1.05 * camScale, 0.32, 4.45 * camScale];
  const camOpen = [0.55 * camScale, 1.55 * camScale, 4.2 * camScale];
  const camFlat = [0, 5.2 * camScale, 2.15 * camScale];
  const camPages = [0.15 * camScale, 5.0 * camScale, 2.35 * camScale];
  const camClose = [0.35 * camScale, 1.1 * camScale, 4.4 * camScale];
  const camBack = [0, 0.1, 4.75 * camScale];

  const lookStart = [0, 0.04, 0];
  const lookFlat = [0, -0.02, 0];
  const lookBack = [0, 0.02, 0];

  let cameraPosition = camStart;
  let cameraTarget = lookStart;

  if (p < 0.12) {
    cameraPosition = camStart;
    cameraTarget = lookStart;
  } else if (p < 0.25) {
    const t = smoothstep(0.12, 0.25, p);
    cameraPosition = lerpVec3(camStart, camThreeQ, t);
    cameraTarget = lerpVec3(lookStart, [0.08, 0.04, 0], t);
  } else if (p < 0.37) {
    const t = smoothstep(0.25, 0.37, p);
    cameraPosition = lerpVec3(camThreeQ, camOpen, t);
    cameraTarget = lerpVec3([0.08, 0.04, 0], [0, 0, 0], t);
  } else if (p < 0.5) {
    const t = smoothstep(0.37, 0.5, p);
    cameraPosition = lerpVec3(camOpen, camFlat, t);
    cameraTarget = lerpVec3([0, 0, 0], lookFlat, t);
  } else if (p < 0.78) {
    const t = smoothstep(0.5, 0.78, p);
    cameraPosition = lerpVec3(camFlat, camPages, t);
    cameraTarget = lookFlat;
  } else if (p < 0.9) {
    const t = smoothstep(0.78, 0.9, p);
    cameraPosition = lerpVec3(camPages, camClose, t);
    cameraTarget = lerpVec3(lookFlat, lookBack, t);
  } else {
    const t = smoothstep(0.9, 1, p);
    cameraPosition = lerpVec3(camClose, camBack, t);
    cameraTarget = lookBack;
  }

  return {
    progress: p,
    coverOpen,
    coverAngle: coverOpen * Math.PI,
    pageTurns,
    rotation: [rotX, rotY, rotZ],
    position,
    cameraPosition,
    cameraTarget,
    stage:
      p < 0.12 ? 1 : p < 0.25 ? 2 : p < 0.37 ? 3 : p < 0.5 ? 4 : p < 0.62 ? 5 : p < 0.78 ? 6 : p < 0.9 ? 7 : 8,
  };
}

export function createInitialBookState(isMobile = false) {
  return getBookState(0, isMobile);
}
