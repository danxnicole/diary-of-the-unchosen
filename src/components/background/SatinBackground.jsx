import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../constants/book';

const satinVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const satinFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorDeep;
  uniform vec3 uColorLight;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Project folds in world space so camera moves still show fabric, not a horizon seam
    vec2 uv = vWorldPos.xy * 0.07 + vWorldPos.xz * 0.045;

    float folds = fbm(uv * vec2(2.4, 1.8) + vec2(uTime * 0.01, -uTime * 0.007));
    float folds2 = fbm(uv * vec2(4.8, 3.6) - vec2(uTime * 0.015, uTime * 0.009));
    float longFold = sin(uv.x * 3.5 + folds * 2.0) * 0.5 + 0.5;
    float ridge = smoothstep(0.22, 0.82, folds * 0.5 + folds2 * 0.28 + longFold * 0.28);

    vec3 col = mix(uColorDeep, uColor, ridge);
    col = mix(col, uColorLight, pow(ridge, 1.7) * 0.58);

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vWorldNormal);
    float ndv = max(dot(n, viewDir), 0.0);
    float sheen = pow(1.0 - ndv, 2.4) * 0.28;
    float gloss = pow(ndv, 14.0) * 0.14 * ridge;

    col += vec3(0.9, 0.95, 1.0) * sheen;
    col += vec3(1.0, 0.98, 0.97) * gloss;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Inverted satin dome — always surrounds the scene so elevated camera
 * angles never reveal a flat backdrop horizon.
 */
export default function SatinBackground() {
  const matRef = useRef();

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(COLORS.satin) },
      uColorDeep: { value: new THREE.Color(COLORS.satinDeep) },
      uColorLight: { value: new THREE.Color(COLORS.satinLight) },
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[18, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={satinVertex}
        fragmentShader={satinFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
