// components/three/BlobMesh.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uMorphStrength;
  uniform vec2  uMouse;
  varying vec3  vNormal;
  varying vec3  vViewPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    float t   = uTime * 0.55;
    float amp = 0.22 * uMorphStrength;

    float n  = sin(pos.x * 2.1 + t)       * cos(pos.y * 1.9 + t * 0.7) * sin(pos.z * 2.4 + t * 1.2);
          n += sin(pos.x * 3.8 + t * 1.1) * 0.45;
          n += cos(pos.y * 4.2 + t * 0.8) * 0.28;
          n += sin(pos.z * 3.1 + t * 1.4) * 0.18;

    pos += normalize(pos) * n * amp;

    vec3 toMouse = vec3(uMouse * 0.5, 0.0) - pos;
    float dist   = length(toMouse);
    pos += normalize(toMouse) * (1.0 / (1.0 + dist * dist)) * 0.18;

    vec4 mvPos  = modelViewMatrix * vec4(pos, 1.0);
    vViewPos    = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`

const fragmentShader = /* glsl */`
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform float uTime;
  varying vec3  vNormal;
  varying vec3  vViewPos;

  void main() {
    vec3 viewDir  = normalize(vViewPos);
    vec3 normal   = normalize(vNormal);
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.6);
    float band    = sin(vNormal.y * 2.8 + uTime * 0.28) * 0.5 + 0.5;
    vec3 color    = mix(uColor1, uColor2, fresnel);
    color         = mix(color, uColor1 * 1.4, band * 0.25);
    color        += vec3(pow(fresnel, 3.5) * 0.75);
    color        += uColor2 * pow(1.0 - fresnel, 4.0) * 0.15;
    float alpha   = 0.55 + fresnel * 0.35;
    gl_FragColor  = vec4(color, alpha);
  }
`

interface BlobMeshProps {
  mouseRef:      React.MutableRefObject<THREE.Vector2>
  morphStrength: React.MutableRefObject<number>
}

export function BlobMesh({ mouseRef, morphStrength }: BlobMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:          { value: 0 },
        uMorphStrength: { value: 1.0 },
        uMouse:         { value: new THREE.Vector2(0, 0) },
        uColor1:        { value: new THREE.Color('#00f0ff') },
        uColor2:        { value: new THREE.Color('#7000ff') },
      },
      transparent: true,
      depthWrite:  false,
      side:        THREE.FrontSide,
    })
  )

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()
    const u = mat.current.uniforms
    u.uTime.value          = elapsed
    u.uMorphStrength.value = morphStrength.current
    u.uMouse.value.copy(mouseRef.current)
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.08
      meshRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.12
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 6]} />
      <primitive object={mat.current} attach="material" />
    </mesh>
  )
}
