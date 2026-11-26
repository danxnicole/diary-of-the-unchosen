import * as THREE from "three";
import gsap from "gsap";

const canvas = document.getElementById("scene");
const replayBtn = document.getElementById("replay");

const COLORS = {
  fog: 0xc9ced6,
  ground: 0xb0b7c2,
  silhouette: 0x2c323a,
  bow: 0x6a5443,
  string: 0xe4e7ec,
  shaft: 0xc4ab8c,
  tip: 0x343a42,
  fletch: 0x7f8793,
  targetFace: 0xf3f1eb,
  ringWarm: 0xb88962,
  ringCool: 0xc5ccd6,
  bullseye: 0x8a3a37,
  bullInner: 0x5a221f,
  stand: 0x564e46,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.fog);
scene.fog = new THREE.Fog(COLORS.fog, 22, 62);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.05,
  120
);

const hemi = new THREE.HemisphereLight(0xf3f5f8, 0x8a929e, 0.9);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff1e2, 1.2);
key.position.set(-10, 16, 9);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 2;
key.shadow.camera.far = 55;
key.shadow.camera.left = -18;
key.shadow.camera.right = 18;
key.shadow.camera.top = 18;
key.shadow.camera.bottom = -18;
key.shadow.bias = -0.00025;
key.shadow.normalBias = 0.03;
scene.add(key);

const fill = new THREE.DirectionalLight(0xd5dee8, 0.4);
fill.position.set(12, 5, -10);
scene.add(fill);

function std(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extras.roughness ?? 0.7,
    metalness: extras.metalness ?? 0.04,
  });
}

function mesh(geo, material, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

// ——— Ground ———
const ground = mesh(
  new THREE.CircleGeometry(48, 72),
  std(COLORS.ground, { roughness: 0.96 }),
  { cast: false }
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Soft distant wall for depth
const haze = new THREE.Mesh(
  new THREE.PlaneGeometry(70, 30),
  new THREE.MeshBasicMaterial({
    color: 0xb6bec8,
    transparent: true,
    opacity: 0.45,
  })
);
haze.position.set(22, 9, -10);
haze.rotation.y = -0.4;
scene.add(haze);

const bodyMat = std(COLORS.silhouette, { roughness: 0.88 });

// ——— Archer ———
// Local space: faces +X (toward target). Built as a side-readable silhouette.
const archer = new THREE.Group();
archer.position.set(0, 0, 0);
scene.add(archer);

const pelvis = mesh(new THREE.SphereGeometry(0.2, 16, 12), bodyMat);
pelvis.position.set(0, 0.98, 0);
pelvis.scale.set(1.05, 0.65, 0.8);
archer.add(pelvis);

const torso = mesh(new THREE.CapsuleGeometry(0.26, 0.52, 6, 14), bodyMat);
torso.position.set(0.04, 1.48, 0);
torso.rotation.z = 0.06;
archer.add(torso);

const head = mesh(new THREE.SphereGeometry(0.19, 18, 14), bodyMat);
head.position.set(0.1, 2.08, 0);
head.scale.set(0.95, 1.05, 0.88);
archer.add(head);

// Legs
const legData = [
  { z: 0.11, thighZ: 0.1, shinX: -0.02 },
  { z: -0.12, thighZ: -0.04, shinX: 0.04 },
];
legData.forEach(({ z, thighZ, shinX }) => {
  const thigh = mesh(new THREE.CapsuleGeometry(0.1, 0.36, 4, 10), bodyMat);
  thigh.position.set(-0.04, 0.64, z);
  thigh.rotation.z = thighZ;
  archer.add(thigh);

  const shin = mesh(new THREE.CapsuleGeometry(0.085, 0.34, 4, 10), bodyMat);
  shin.position.set(shinX, 0.26, z);
  archer.add(shin);

  const foot = mesh(new THREE.BoxGeometry(0.3, 0.06, 0.11), bodyMat);
  foot.position.set(0.1, 0.04, z);
  archer.add(foot);
});

// Bow arm (extended toward +X)
const bowArm = new THREE.Group();
bowArm.position.set(0.1, 1.55, 0.06);
archer.add(bowArm);

const bowUpper = mesh(new THREE.CapsuleGeometry(0.065, 0.22, 4, 10), bodyMat);
bowUpper.position.set(0.18, 0, 0.02);
bowUpper.rotation.z = -Math.PI / 2;
bowArm.add(bowUpper);

const bowFore = mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 10), bodyMat);
bowFore.position.set(0.42, 0, 0.02);
bowFore.rotation.z = -Math.PI / 2;
bowArm.add(bowFore);

const bowHand = mesh(new THREE.SphereGeometry(0.05, 10, 8), bodyMat);
bowHand.position.set(0.58, 0, 0.02);
bowArm.add(bowHand);

// Draw arm (pulls toward -X)
const drawArm = new THREE.Group();
drawArm.position.set(0.02, 1.52, -0.04);
archer.add(drawArm);

const drawUpper = mesh(new THREE.CapsuleGeometry(0.065, 0.2, 4, 10), bodyMat);
drawUpper.position.set(-0.08, 0.02, -0.12);
drawUpper.rotation.set(0.25, 0.15, 0.55);
drawArm.add(drawUpper);

const drawFore = mesh(new THREE.CapsuleGeometry(0.05, 0.2, 4, 10), bodyMat);
drawFore.position.set(-0.2, 0.02, -0.3);
drawFore.rotation.set(0.2, 0.2, 1.0);
drawArm.add(drawFore);

const drawHand = mesh(new THREE.SphereGeometry(0.048, 10, 8), bodyMat);
drawHand.position.set(-0.28, 0.02, -0.42);
drawArm.add(drawHand);

// ——— Bow (held at bow hand) ———
const bow = new THREE.Group();
bow.position.set(0.62, 0, 0.02);
bowArm.add(bow);

const bowMat = std(COLORS.bow, { roughness: 0.52 });
const bowCurve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0.02, 0.92, 0),
  new THREE.Vector3(-0.32, 0, 0),
  new THREE.Vector3(0.02, -0.92, 0)
);
const bowMesh = mesh(new THREE.TubeGeometry(bowCurve, 40, 0.026, 8, false), bowMat);
bow.add(bowMesh);

const stringPts = {
  top: new THREE.Vector3(0.04, 0.9, 0),
  mid: new THREE.Vector3(0.04, 0, 0),
  bot: new THREE.Vector3(0.04, -0.9, 0),
};
const stringMesh = mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([stringPts.top, stringPts.mid, stringPts.bot]),
    20,
    0.007,
    5,
    false
  ),
  std(COLORS.string, { roughness: 0.35, metalness: 0.08 }),
  { cast: false, receive: false }
);
bow.add(stringMesh);

function updateBowString(draw) {
  const pull = 0.04 - draw * 0.48;
  stringPts.mid.set(pull, 0, 0);
  stringMesh.geometry.dispose();
  stringMesh.geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      stringPts.top.clone(),
      stringPts.mid.clone(),
      stringPts.bot.clone(),
    ]),
    20,
    0.007,
    5,
    false
  );
  bowMesh.scale.set(1 + draw * 0.1, 1 - draw * 0.025, 1);
}

// ——— Arrow ———
const arrow = new THREE.Group();
scene.add(arrow);

const shaft = mesh(
  new THREE.CylinderGeometry(0.016, 0.016, 1.2, 10),
  std(COLORS.shaft, { roughness: 0.48 })
);
shaft.rotation.z = Math.PI / 2;
arrow.add(shaft);

const tip = mesh(
  new THREE.ConeGeometry(0.032, 0.13, 8),
  std(COLORS.tip, { roughness: 0.32, metalness: 0.28 })
);
tip.rotation.z = -Math.PI / 2;
tip.position.x = 0.65;
arrow.add(tip);

const fletchMat = std(COLORS.fletch, { roughness: 0.68 });
[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((a) => {
  const f = mesh(new THREE.BoxGeometry(0.15, 0.004, 0.05), fletchMat);
  f.position.set(-0.52, 0, 0);
  f.rotation.x = a;
  arrow.add(f);
});

const nock = mesh(new THREE.SphereGeometry(0.02, 8, 6), std(COLORS.tip));
nock.position.x = -0.6;
arrow.add(nock);

// World-space helpers for nocked placement
// Bow hand world ≈ archer (0) + bowArm (0.1,1.55,0.06) + bow (0.62,0,0.02) ≈ (0.72, 1.55, 0.08)
const NOCK_ORIGIN = new THREE.Vector3(0.28, 1.55, 0.08);
const FULL_DRAW = 0.48;

function placeNocked(draw) {
  arrow.position.set(NOCK_ORIGIN.x - draw * FULL_DRAW, NOCK_ORIGIN.y, NOCK_ORIGIN.z);
  arrow.rotation.set(0, 0, 0);
}

placeNocked(0);
updateBowString(0);

// ——— Target ———
// Face normal points toward archer (-X). Rings live on that facing side.
const TARGET_X = 15.8;
const targetRoot = new THREE.Group();
targetRoot.position.set(TARGET_X, 1.45, 0);
// Slight yaw so rings read clearly from the side camera
targetRoot.rotation.y = -0.42;
scene.add(targetRoot);

// Stand sits behind the face (+X local = away from archer) so it never occludes rings
const stand = mesh(
  new THREE.CylinderGeometry(0.055, 0.08, 1.4, 12),
  std(COLORS.stand, { roughness: 0.82 })
);
stand.position.set(0.14, -0.6, 0);
targetRoot.add(stand);

const standBase = mesh(
  new THREE.CylinderGeometry(0.32, 0.38, 0.07, 18),
  std(COLORS.stand, { roughness: 0.88 })
);
standBase.position.set(0.14, -1.28, 0);
targetRoot.add(standBase);

const faceGroup = new THREE.Group();
faceGroup.position.y = 0.12;
targetRoot.add(faceGroup);

// Disc: axis along X after Z-rotation; archer-facing side is -X locally
const disc = mesh(
  new THREE.CylinderGeometry(1.0, 1.0, 0.1, 56),
  std(COLORS.targetFace, { roughness: 0.92 })
);
disc.rotation.z = Math.PI / 2;
faceGroup.add(disc);

function addRing(radius, tube, color) {
  const r = mesh(
    new THREE.TorusGeometry(radius, tube, 12, 56),
    std(color, { roughness: 0.7 })
  );
  // Sit on the archer-facing surface (-X)
  r.rotation.y = Math.PI / 2;
  r.position.x = -0.06;
  faceGroup.add(r);
}

addRing(0.78, 0.05, COLORS.ringWarm);
addRing(0.52, 0.045, COLORS.ringCool);
addRing(0.3, 0.042, COLORS.ringWarm);

const bull = mesh(
  new THREE.CylinderGeometry(0.16, 0.16, 0.06, 28),
  std(COLORS.bullseye, { roughness: 0.62 })
);
bull.rotation.z = Math.PI / 2;
bull.position.x = -0.06;
faceGroup.add(bull);

const bullDot = mesh(
  new THREE.CylinderGeometry(0.055, 0.055, 0.05, 18),
  std(COLORS.bullInner, { roughness: 0.58 })
);
bullDot.rotation.z = Math.PI / 2;
bullDot.position.x = -0.08;
faceGroup.add(bullDot);

// Impact in world space (center of face, slightly into disc along -localX which after yaw is toward archer)
const impactLocal = new THREE.Vector3(-0.05, 0.12, 0);
const IMPACT = impactLocal.clone();
targetRoot.localToWorld(IMPACT);

// ——— Camera rig ———
function baseCam() {
  const narrow = window.innerWidth / window.innerHeight < 0.85;
  return {
    x: -3.2,
    y: 1.75,
    z: narrow ? 6.4 : 5.4,
    lx: 5.8,
    ly: 1.35,
    lz: 0,
    fov: narrow ? 48 : 42,
  };
}

const camRig = { ...baseCam() };

function applyCamera() {
  camera.position.set(camRig.x, camRig.y, camRig.z);
  camera.lookAt(camRig.lx, camRig.ly, camRig.lz);
  if (Math.abs(camera.fov - camRig.fov) > 0.01) {
    camera.fov = camRig.fov;
    camera.updateProjectionMatrix();
  }
}
applyCamera();

// ——— Timeline ———
let timeline = null;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATE = { arrowFree: false };

function hideReplay() {
  replayBtn.classList.remove("is-visible");
  replayBtn.hidden = true;
}

function showReplay() {
  replayBtn.hidden = false;
  requestAnimationFrame(() => replayBtn.classList.add("is-visible"));
}

function resetScene() {
  STATE.arrowFree = false;
  updateBowString(0);
  placeNocked(0);
  drawArm.position.set(0.02, 1.52, -0.04);
  drawArm.rotation.set(0, 0, 0);
  torso.rotation.z = 0.06;
  faceGroup.rotation.set(0, 0, 0);
  faceGroup.position.set(0, 0.12, 0);
  targetRoot.position.set(TARGET_X, 1.45, 0);
  Object.assign(camRig, baseCam());
  applyCamera();
  hideReplay();
  // Refresh impact after any layout change
  IMPACT.copy(impactLocal);
  targetRoot.localToWorld(IMPACT);
}

function buildTimeline() {
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: showReplay,
  });

  const drawProxy = { v: 0 };
  const start = {
    x: NOCK_ORIGIN.x - FULL_DRAW,
    y: NOCK_ORIGIN.y,
    z: NOCK_ORIGIN.z,
  };

  // Recompute impact at play time
  IMPACT.copy(impactLocal);
  targetRoot.localToWorld(IMPACT);

  // 0–2s Preparation — hold wide side profile, gentle drift in
  tl.to(
    camRig,
    {
      x: -2.6,
      y: 1.72,
      z: baseCam().z - 0.45,
      lx: 6.2,
      ly: 1.38,
      duration: 2,
      ease: "sine.inOut",
      onUpdate: applyCamera,
    },
    0
  );
  tl.to(torso.rotation, { z: 0.09, duration: 2, ease: "sine.inOut" }, 0);

  // 2–4s Tension
  tl.to(
    drawProxy,
    {
      v: 1,
      duration: 2,
      ease: "power1.inOut",
      onUpdate: () => {
        updateBowString(drawProxy.v);
        if (!STATE.arrowFree) placeNocked(drawProxy.v);
        drawArm.position.x = 0.02 - drawProxy.v * 0.28;
        drawArm.position.z = -0.04 - drawProxy.v * 0.08;
        drawArm.rotation.y = -drawProxy.v * 0.4;
        torso.rotation.z = 0.06 + drawProxy.v * 0.08;
      },
    },
    2
  );
  tl.to(
    camRig,
    {
      x: -0.35,
      y: 1.7,
      z: 2.55,
      lx: 1.1,
      ly: 1.55,
      lz: 0.05,
      fov: 36,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: applyCamera,
    },
    2
  );

  // 4–5s Release
  tl.to(
    drawProxy,
    {
      v: 0,
      duration: 0.16,
      ease: "power4.out",
      onStart: () => {
        STATE.arrowFree = true;
      },
      onUpdate: () => {
        updateBowString(drawProxy.v);
        drawArm.position.x = 0.02 - drawProxy.v * 0.28;
        drawArm.position.z = -0.04 - drawProxy.v * 0.08;
        drawArm.rotation.y = -drawProxy.v * 0.4;
      },
    },
    4
  );

  const flight = { t: 0 };
  tl.to(
    flight,
    {
      t: 1,
      duration: 4,
      ease: "power1.in",
      onUpdate: () => {
        const t = flight.t;
        const arc = Math.sin(t * Math.PI) * 0.28 * (1 - t * 0.25);
        const x = THREE.MathUtils.lerp(start.x, IMPACT.x, t);
        const y = THREE.MathUtils.lerp(start.y, IMPACT.y, t) + arc;
        const z = THREE.MathUtils.lerp(start.z, IMPACT.z, t);
        arrow.position.set(x, y, z);

        const t2 = Math.min(1, t + 0.015);
        const arc2 = Math.sin(t2 * Math.PI) * 0.28 * (1 - t2 * 0.25);
        const x2 = THREE.MathUtils.lerp(start.x, IMPACT.x, t2);
        const y2 = THREE.MathUtils.lerp(start.y, IMPACT.y, t2) + arc2;
        arrow.rotation.z = Math.atan2(y2 - y, x2 - x);
        arrow.rotation.y = 0;
      },
    },
    4
  );

  // Continuous chase: blend from archer framing onto arrow path (no hard cut)
  const chase = { blend: 0 };
  tl.to(
    chase,
    {
      blend: 1,
      duration: 1.15,
      ease: "power2.inOut",
    },
    4
  );
  tl.to(
    camRig,
    {
      duration: 4,
      ease: "none",
      onUpdate: function () {
        const p = this.progress(); // 0 at t=4 → 1 at t=8
        const blend = chase.blend;
        const lag = THREE.MathUtils.lerp(2.2, 2.15, p);
        const side = THREE.MathUtils.lerp(2.2, 0.4, Math.min(1, p * 1.15));
        const followX = arrow.position.x - lag;
        const followY = arrow.position.y + 0.22 - p * 0.06;
        const followZ = side;
        const lookX = arrow.position.x + THREE.MathUtils.lerp(2.0, 3.0, p);
        const lookY = arrow.position.y + 0.02;
        const lookZ = arrow.position.z;

        // Early frames still inherit archer framing via blend
        const fromX = -0.35;
        const fromY = 1.7;
        const fromZ = 2.55;
        const fromLx = 1.1;
        const fromLy = 1.55;
        const fromLz = 0.05;

        camRig.x = THREE.MathUtils.lerp(fromX, followX, blend);
        camRig.y = THREE.MathUtils.lerp(fromY, followY, blend);
        camRig.z = THREE.MathUtils.lerp(fromZ, followZ, blend);
        camRig.lx = THREE.MathUtils.lerp(fromLx, lookX, blend);
        camRig.ly = THREE.MathUtils.lerp(fromLy, lookY, blend);
        camRig.lz = THREE.MathUtils.lerp(fromLz, lookZ, blend);
        camRig.fov = THREE.MathUtils.lerp(36, 30, p);
        applyCamera();
      },
    },
    4
  );

  // 8–9s Impact — clearer vibration
  tl.add(() => {
    arrow.position.copy(IMPACT);
    arrow.rotation.set(0, targetRoot.rotation.y, 0);
  }, 8);

  tl.fromTo(
    arrow.position,
    { x: IMPACT.x - 0.05 },
    { x: IMPACT.x + 0.09, duration: 0.18, ease: "power3.out" },
    8
  );
  tl.fromTo(
    faceGroup.position,
    { x: 0 },
    {
      x: 0.045,
      duration: 0.06,
      yoyo: true,
      repeat: 6,
      ease: "power1.inOut",
    },
    8
  );
  tl.fromTo(
    faceGroup.rotation,
    { z: 0 },
    { z: 0.06, duration: 0.06, yoyo: true, repeat: 6, ease: "power1.inOut" },
    8
  );
  tl.fromTo(
    arrow.rotation,
    { z: 0 },
    { z: 0.05, duration: 0.05, yoyo: true, repeat: 6, ease: "power1.inOut" },
    8.02
  );
  tl.fromTo(
    targetRoot.position,
    { y: 1.45 },
    {
      y: 1.48,
      duration: 0.05,
      yoyo: true,
      repeat: 6,
      ease: "power1.inOut",
    },
    8
  );
  tl.to(
    camRig,
    {
      x: IMPACT.x - 2.6,
      y: IMPACT.y + 0.4,
      z: 1.5,
      lx: IMPACT.x + 0.15,
      ly: IMPACT.y,
      lz: IMPACT.z,
      fov: 32,
      duration: 1,
      ease: "power2.out",
      onUpdate: applyCamera,
    },
    8
  );

  // 9–10s Resolution
  const endZ = window.innerWidth / window.innerHeight < 0.85 ? 3.2 : 2.6;
  tl.to(
    camRig,
    {
      x: IMPACT.x - 4.2,
      y: IMPACT.y + 0.7,
      z: endZ,
      lx: IMPACT.x - 0.15,
      ly: IMPACT.y - 0.05,
      lz: IMPACT.z,
      fov: 36,
      duration: 1,
      ease: "sine.out",
      onUpdate: applyCamera,
    },
    9
  );

  if (prefersReduced) tl.timeScale(1.3);
  return tl;
}

function play() {
  if (timeline) timeline.kill();
  resetScene();
  timeline = buildTimeline();
}

replayBtn.addEventListener("click", play);

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", onResize);

let raf = 0;
function tick() {
  raf = requestAnimationFrame(tick);
  renderer.render(scene, camera);
}

play();
tick();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (timeline) timeline.pause();
    cancelAnimationFrame(raf);
  } else {
    if (timeline && timeline.paused()) timeline.resume();
    tick();
  }
});
