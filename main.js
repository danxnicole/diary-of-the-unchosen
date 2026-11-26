import * as THREE from "three";
import gsap from "gsap";

const canvas = document.getElementById("scene");
const replayBtn = document.getElementById("replay");

const C = {
  figure: 0x4a5160,
  wood: 0x8f755c,
  woodDark: 0x5e4b3c,
  string: 0xf8f3eb,
  shaft: 0xe0c9ab,
  tip: 0x2c3139,
  fletch: 0xaba49b,
  face: 0xfcf9f4,
  ringA: 0xcba880,
  ringB: 0xe8e3da,
  bull: 0x933f3a,
  bullCore: 0x521f1c,
  stand: 0x635c53,
};

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);

/* Gradient sky */
(() => {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#f2eee6");
  g.addColorStop(0.5, "#ddd5ca");
  g.addColorStop(0.78, "#c9bfb2");
  g.addColorStop(1, "#b4aa9c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(55, 40, 28),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false })
  );
  scene.add(sky);
  scene.userData.sky = sky;
})();
scene.fog = new THREE.FogExp2(0xc9bfb2, 0.034);

scene.add(new THREE.HemisphereLight(0xfff8f0, 0x8f877c, 0.85));
const key = new THREE.DirectionalLight(0xfff1e4, 0.95);
key.position.set(-6, 10, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 35;
key.shadow.camera.left = -10;
key.shadow.camera.right = 14;
key.shadow.camera.top = 10;
key.shadow.camera.bottom = -2;
key.shadow.radius = 8;
key.shadow.bias = -0.00015;
key.shadow.normalBias = 0.04;
scene.add(key);
const rimL = new THREE.DirectionalLight(0xd8e4f0, 0.7);
rimL.position.set(2, 5, -8);
scene.add(rimL);
const fillL = new THREE.DirectionalLight(0xe9e2d7, 0.4);
fillL.position.set(7, 3, 3);
scene.add(fillL);

function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.72, metalness: o.metalness ?? 0.02 });
}
function M(geo, material, cast = true, receive = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

/* Soft ground */
(() => {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  g.addColorStop(0, "#b8afa2");
  g.addColorStop(0.65, "#b0a698");
  g.addColorStop(1, "#c9bfb2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const img = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const ground = M(new THREE.CircleGeometry(30, 80), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.98 }), false, true);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
})();

/* Slim fashion-mannequin archer */
const fig = mat(C.figure, { roughness: 0.8 });
const archer = new THREE.Group();
scene.add(archer);

const torsoPts = [
  new THREE.Vector2(0.01, 0),
  new THREE.Vector2(0.145, 0.03),
  new THREE.Vector2(0.155, 0.14),
  new THREE.Vector2(0.11, 0.34),
  new THREE.Vector2(0.16, 0.58),
  new THREE.Vector2(0.145, 0.72),
  new THREE.Vector2(0.07, 0.8),
  new THREE.Vector2(0.052, 0.92),
  new THREE.Vector2(0.05, 0.98),
];
const torso = M(new THREE.LatheGeometry(torsoPts, 32), fig);
torso.position.set(0.03, 0.98, 0);
torso.rotation.z = 0.06;
archer.add(torso);

const head = M(new THREE.SphereGeometry(0.112, 24, 18), fig);
head.position.set(0.1, 1.92, 0);
head.scale.set(0.92, 1.08, 0.9);
archer.add(head);

function limb(rt, rb, len) { return M(new THREE.CylinderGeometry(rt, rb, len, 12), fig); }
function ball(r) { return M(new THREE.SphereGeometry(r, 14, 12), fig); }

function addLeg(z, lean) {
  const g = new THREE.Group();
  g.position.set(0.02, 0.98, z);
  const hip = ball(0.06); g.add(hip);
  const thigh = limb(0.058, 0.048, 0.42);
  thigh.position.set(-0.015, -0.23, 0); thigh.rotation.z = lean; g.add(thigh);
  const knee = ball(0.045);
  knee.position.set(-0.015 + lean * 0.18, -0.46, 0); g.add(knee);
  const shin = limb(0.045, 0.036, 0.4);
  shin.position.set(-0.01 + lean * 0.2, -0.68, 0); g.add(shin);
  const foot = M(new THREE.CapsuleGeometry(0.032, 0.13, 4, 8), fig);
  foot.rotation.z = Math.PI / 2;
  foot.position.set(0.08 + lean * 0.2, -0.9, 0); g.add(foot);
  archer.add(g);
}
addLeg(-0.085, -0.05);
addLeg(0.095, 0.1);

const bowArm = new THREE.Group();
bowArm.position.set(0.08, 1.6, 0.03);
archer.add(bowArm);
bowArm.add(ball(0.05));
const bu = limb(0.038, 0.034, 0.28); bu.position.set(0.16, 0.01, 0.02); bu.rotation.z = -Math.PI / 2; bowArm.add(bu);
const be = ball(0.036); be.position.set(0.32, 0.01, 0.02); bowArm.add(be);
const bf = limb(0.032, 0.028, 0.3); bf.position.set(0.49, 0, 0.02); bf.rotation.z = -Math.PI / 2; bowArm.add(bf);
const bh = ball(0.034); bh.position.set(0.66, 0, 0.02); bowArm.add(bh);

const drawArm = new THREE.Group();
drawArm.position.set(0.05, 1.56, -0.02);
archer.add(drawArm);
drawArm.add(ball(0.048));
const du = limb(0.036, 0.032, 0.24); du.position.set(-0.04, 0.02, -0.13); du.rotation.set(0.35, 0.1, 0.7); drawArm.add(du);
const de = ball(0.034); de.position.set(-0.1, 0.02, -0.26); drawArm.add(de);
const df = limb(0.03, 0.026, 0.24); df.position.set(-0.18, 0, -0.38); df.rotation.set(0.25, 0.15, 1.05); drawArm.add(df);
const dh = ball(0.032); dh.position.set(-0.25, 0, -0.5); drawArm.add(dh);

/* Bow */
const bow = new THREE.Group();
bow.position.set(0.7, 0, 0.02);
bowArm.add(bow);
const woodMat = mat(C.wood, { roughness: 0.48 });
const bowCurve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(0.04, 1.02, 0),
  new THREE.Vector3(-0.42, 0.38, 0),
  new THREE.Vector3(-0.42, -0.38, 0),
  new THREE.Vector3(0.04, -1.02, 0)
);
function makeBow(flex = 0) {
  const pts = bowCurve.getPoints(56).map((p, i, a) => {
    const t = i / (a.length - 1);
    return new THREE.Vector3(p.x - flex * Math.sin(t * Math.PI) * 0.13, p.y, p.z);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.014, 10, false);
}
const bowMesh = M(makeBow(0), woodMat);
bow.add(bowMesh);
[-1.02, 1.02].forEach((y) => {
  const cap = M(new THREE.SphereGeometry(0.017, 10, 8), mat(C.woodDark, { roughness: 0.45 }));
  cap.position.set(0.04, y, 0); bow.add(cap);
});
const sTop = new THREE.Vector3(0.06, 0.99, 0);
const sMid = new THREE.Vector3(0.06, 0, 0);
const sBot = new THREE.Vector3(0.06, -0.99, 0);
const stringMesh = M(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3([sTop, sMid, sBot]), 20, 0.0038, 5, false),
  mat(C.string, { roughness: 0.3 }), false, false
);
bow.add(stringMesh);
function updateBowString(draw) {
  sMid.set(0.06 - draw * 0.5, 0, 0);
  stringMesh.geometry.dispose();
  stringMesh.geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([sTop.clone(), sMid.clone(), sBot.clone()]), 20, 0.0038, 5, false
  );
  bowMesh.geometry.dispose();
  bowMesh.geometry = makeBow(draw);
  drawArm.position.x = 0.05 - draw * 0.28;
  drawArm.position.z = -0.02 - draw * 0.08;
  drawArm.rotation.y = -draw * 0.45;
  torso.rotation.z = 0.06 + draw * 0.05;
}

/* Arrow */
const arrow = new THREE.Group();
scene.add(arrow);
const shaft = M(new THREE.CylinderGeometry(0.01, 0.01, 1.22, 12), mat(C.shaft, { roughness: 0.4 }));
shaft.rotation.z = Math.PI / 2; arrow.add(shaft);
const tip = M(new THREE.ConeGeometry(0.022, 0.09, 10), mat(C.tip, { roughness: 0.28, metalness: 0.35 }));
tip.rotation.z = -Math.PI / 2; tip.position.x = 0.655; arrow.add(tip);
[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((a) => {
  const f = M(new THREE.BoxGeometry(0.12, 0.002, 0.035), mat(C.fletch, { roughness: 0.65 }));
  f.position.set(-0.52, 0, 0); f.rotation.x = a; arrow.add(f);
});
const nock = M(new THREE.SphereGeometry(0.013, 8, 6), mat(C.tip));
nock.position.x = -0.61; arrow.add(nock);

const NOCK_ORIGIN = new THREE.Vector3(1.38, 1.6, 0.05);
const FULL_DRAW = 0.5;
function placeNocked(draw) {
  arrow.position.set(NOCK_ORIGIN.x - draw * FULL_DRAW, NOCK_ORIGIN.y, NOCK_ORIGIN.z);
  arrow.rotation.set(0, 0, 0);
}
placeNocked(0); updateBowString(0);

/* Target — closer so it shares the opening frame */
const TARGET_X = 6.4;
const targetRoot = new THREE.Group();
targetRoot.position.set(TARGET_X, 1.4, 0);
targetRoot.rotation.y = 0.9;
scene.add(targetRoot);
const standPost = M(new THREE.CylinderGeometry(0.034, 0.045, 1.35, 16), mat(C.stand, { roughness: 0.85 }));
standPost.position.set(0.1, -0.6, 0); targetRoot.add(standPost);
const standBase = M(new THREE.CylinderGeometry(0.22, 0.28, 0.038, 28), mat(C.stand, { roughness: 0.9 }));
standBase.position.set(0.1, -1.25, 0); targetRoot.add(standBase);
const faceGroup = new THREE.Group();
faceGroup.position.y = 0.1; targetRoot.add(faceGroup);
const disc = M(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 72), mat(C.face, { roughness: 0.88 }));
disc.rotation.z = Math.PI / 2; faceGroup.add(disc);
function paintRing(inner, outer, color) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const ring = M(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false, curveSegments: 64 }), mat(color, { roughness: 0.75 }));
  ring.rotation.y = Math.PI / 2; ring.position.x = -0.032; faceGroup.add(ring);
}
paintRing(0.54, 0.66, C.ringA);
paintRing(0.32, 0.42, C.ringB);
paintRing(0.15, 0.25, C.ringA);
const bull = M(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 32), mat(C.bull, { roughness: 0.6 }));
bull.rotation.z = Math.PI / 2; bull.position.x = -0.035; faceGroup.add(bull);
const bullDot = M(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 20), mat(C.bullCore, { roughness: 0.55 }));
bullDot.rotation.z = Math.PI / 2; bullDot.position.x = -0.04; faceGroup.add(bullDot);

const impactLocal = new THREE.Vector3(-0.08, 0.1, 0);
const IMPACT = impactLocal.clone();
targetRoot.localToWorld(IMPACT);

function baseCam() {
  const narrow = window.innerWidth / window.innerHeight < 0.85;
  return {
    x: 2.9, y: 1.28, z: narrow ? 8.8 : 7.6,
    lx: 2.9, ly: 1.12, lz: 0,
    fov: narrow ? 46 : 40,
  };
}
const camRig = { ...baseCam() };
function applyCamera() {
  camera.position.set(camRig.x, camRig.y, camRig.z);
  camera.lookAt(camRig.lx, camRig.ly, camRig.lz);
  if (Math.abs(camera.fov - camRig.fov) > 0.01) {
    camera.fov = camRig.fov; camera.updateProjectionMatrix();
  }
}
applyCamera();

let timeline = null;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATE = { arrowFree: false, draw: 0 };

function hideReplay() { replayBtn.classList.remove("is-visible"); replayBtn.hidden = true; }
function showReplay() { replayBtn.hidden = false; requestAnimationFrame(() => replayBtn.classList.add("is-visible")); }

function resetScene() {
  STATE.arrowFree = false;
  STATE.draw = 0;
  updateBowString(0); placeNocked(0);
  drawArm.position.set(0.05, 1.56, -0.02); drawArm.rotation.set(0, 0, 0);
  torso.rotation.z = 0.06;
  faceGroup.rotation.set(0, 0, 0); faceGroup.position.set(0, 0.1, 0);
  targetRoot.position.set(TARGET_X, 1.4, 0);
  targetRoot.rotation.y = 0.9;
  Object.assign(camRig, baseCam()); applyCamera(); hideReplay();
  IMPACT.copy(impactLocal); targetRoot.localToWorld(IMPACT);
}

function buildTimeline() {
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: showReplay });
  const drawProxy = { v: 0 };
  const start = { x: NOCK_ORIGIN.x - FULL_DRAW, y: NOCK_ORIGIN.y, z: NOCK_ORIGIN.z };
  IMPACT.copy(impactLocal); targetRoot.localToWorld(IMPACT);

  tl.call(() => { STATE.arrowFree = false; STATE.draw = 0; placeNocked(0); });
  tl.to(camRig, { x: 3.05, y: 1.3, z: baseCam().z - 0.5, lx: 3.05, ly: 1.15, duration: 2, ease: "sine.inOut", onUpdate: applyCamera }, 0);

  tl.to(drawProxy, {
    v: 1, duration: 2, ease: "power1.inOut",
    onUpdate: () => { STATE.draw = drawProxy.v; updateBowString(drawProxy.v); if (!STATE.arrowFree) placeNocked(drawProxy.v); },
  }, 2);
  tl.to(camRig, { x: 0.85, y: 1.55, z: 3.0, lx: 0.9, ly: 1.55, lz: 0.02, fov: 33, duration: 1.7, ease: "power2.inOut", onUpdate: applyCamera }, 2);

  tl.to(drawProxy, {
    v: 0, duration: 0.14, ease: "power4.out",
    onStart: () => { STATE.arrowFree = true; },
    onUpdate: () => { updateBowString(drawProxy.v); },
  }, 4);

  const flight = { t: 0 };
  tl.to(flight, {
    t: 1, duration: 4, ease: "power1.in",
    onUpdate: () => {
      const t = flight.t;
      const arc = Math.sin(t * Math.PI) * 0.14 * (1 - t * 0.3);
      const x = THREE.MathUtils.lerp(start.x, IMPACT.x, t);
      const y = THREE.MathUtils.lerp(start.y, IMPACT.y, t) + arc;
      const z = THREE.MathUtils.lerp(start.z, IMPACT.z, t);
      arrow.position.set(x, y, z);
      const t2 = Math.min(1, t + 0.012);
      const x2 = THREE.MathUtils.lerp(start.x, IMPACT.x, t2);
      const y2 = THREE.MathUtils.lerp(start.y, IMPACT.y, t2) + Math.sin(t2 * Math.PI) * 0.14 * (1 - t2 * 0.3);
      arrow.rotation.z = Math.atan2(y2 - y, x2 - x);
    },
  }, 4);

  const handoff = { x: 0.85, y: 1.55, z: 3.0, lx: 0.9, ly: 1.55, lz: 0.02 };
  const chase = { blend: 0 };
  tl.add(() => { handoff.x = camRig.x; handoff.y = camRig.y; handoff.z = camRig.z; handoff.lx = camRig.lx; handoff.ly = camRig.ly; handoff.lz = camRig.lz; }, 3.7);
  tl.to(chase, { blend: 1, duration: 1.35, ease: "power2.inOut" }, 3.7);
  tl.to(camRig, {
    duration: 4.3, ease: "none",
    onUpdate: function () {
      const p = Math.max(0, (this.progress() * 4.3 - 0.3) / 4);
      const blend = chase.blend;
      const lag = THREE.MathUtils.lerp(1.9, 1.7, p);
      const side = THREE.MathUtils.lerp(2.0, 0.5, Math.min(1, p * 1.05));
      camRig.x = THREE.MathUtils.lerp(handoff.x, arrow.position.x - lag, blend);
      camRig.y = THREE.MathUtils.lerp(handoff.y, arrow.position.y + 0.14 - p * 0.03, blend);
      camRig.z = THREE.MathUtils.lerp(handoff.z, side, blend);
      camRig.lx = THREE.MathUtils.lerp(handoff.lx, arrow.position.x + THREE.MathUtils.lerp(1.3, 2.2, p), blend);
      camRig.ly = THREE.MathUtils.lerp(handoff.ly, arrow.position.y + 0.02, blend);
      camRig.lz = THREE.MathUtils.lerp(handoff.lz, arrow.position.z, blend);
      camRig.fov = THREE.MathUtils.lerp(33, 28, p);
      applyCamera();
    },
  }, 3.7);

  tl.add(() => { arrow.position.copy(IMPACT); arrow.rotation.set(0, targetRoot.rotation.y, 0); }, 8);
  // Seat tip into face (don't poke out the back)
  tl.fromTo(arrow.position, { x: IMPACT.x - 0.1 }, { x: IMPACT.x - 0.05, duration: 0.16, ease: "power3.out" }, 8);
  tl.fromTo(faceGroup.position, { x: 0 }, { x: 0.025, duration: 0.05, yoyo: true, repeat: 6, ease: "power1.inOut" }, 8);
  tl.fromTo(faceGroup.rotation, { z: 0 }, { z: 0.03, duration: 0.05, yoyo: true, repeat: 6, ease: "power1.inOut" }, 8);
  tl.fromTo(arrow.rotation, { z: 0 }, { z: 0.028, duration: 0.05, yoyo: true, repeat: 6, ease: "power1.inOut" }, 8.02);
  tl.fromTo(targetRoot.position, { y: 1.4 }, { y: 1.418, duration: 0.05, yoyo: true, repeat: 6, ease: "power1.inOut" }, 8);
  tl.to(camRig, {
    x: IMPACT.x - 2.0, y: IMPACT.y + 0.25, z: 1.3,
    lx: IMPACT.x, ly: IMPACT.y, lz: IMPACT.z, fov: 28,
    duration: 1, ease: "power2.out", onUpdate: applyCamera,
  }, 8);

  const endZ = window.innerWidth / window.innerHeight < 0.85 ? 2.6 : 2.1;
  tl.to(camRig, {
    x: IMPACT.x - 3.2, y: IMPACT.y + 0.45, z: endZ,
    lx: IMPACT.x - 0.05, ly: IMPACT.y, lz: IMPACT.z, fov: 32,
    duration: 1, ease: "sine.out", onUpdate: applyCamera,
  }, 9);

  if (prefersReduced) tl.timeScale(1.3);
  return tl;
}

function play() { if (timeline) timeline.kill(); resetScene(); timeline = buildTimeline(); }
replayBtn.addEventListener("click", play);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});

let raf = 0;
function tick() {
  raf = requestAnimationFrame(tick);
  if (!STATE.arrowFree) placeNocked(STATE.draw);
  if (scene.userData.sky) scene.userData.sky.position.copy(camera.position);
  renderer.render(scene, camera);
}
play(); tick();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) { if (timeline) timeline.pause(); cancelAnimationFrame(raf); }
  else { if (timeline && timeline.paused()) timeline.resume(); tick(); }
});
