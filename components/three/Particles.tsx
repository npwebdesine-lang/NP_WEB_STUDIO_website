// components/three/Particles.tsx
'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const particleVert = /* glsl */`
  uniform float uTime;
  uniform float uScatter;
  attribute float aSize;
  attribute vec3  aVelocity;
  varying float   vAlpha;

  void main() {
    vec3 pos    = position;
    float angle = uTime * 0.04;
    float ca    = cos(angle), sa = sin(angle);
    pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;
    pos.yz = mat2(ca, -sa, sa, ca) * pos.yz * 0.6;
    pos   += aVelocity * uScatter;
    vec4 mvPos    = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize  = aSize * (280.0 / -mvPos.z);
    gl_Position   = projectionMatrix * mvPos;
    vAlpha = 0.4 + 0.3 * sin(uTime * 0.5 + pos.x);
  }
`

const particleFrag = /* glsl */`
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = (1.0 - d * 2.0) * vAlpha;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

interface ParticlesProps {
  scatterRef: React.MutableRefObject<number>
}

export function Particles({ scatterRef }: ParticlesProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const geometry = useMemo(() => {
    const COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? 800
      : 2000

    const positions  = new Float32Array(COUNT * 3)
    const sizes      = new Float32Array(COUNT)
    const velocities = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const r     = 2.2 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i]             = 0.8 + Math.random() * 1.2
      velocities[i * 3]     = Math.random() - 0.5
      velocities[i * 3 + 1] = Math.random() - 0.5
      velocities[i * 3 + 2] = Math.random() - 0.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',  new THREE.BufferAttribute(positions,  3))
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes,      1))
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
    return geo
  }, [])

  useEffect(() => {
    const material = matRef.current
    return () => {
      geometry.dispose()
      if (material) material.dispose()
    }
  }, [geometry])

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value    = state.clock.getElapsedTime()
    matRef.current.uniforms.uScatter.value = scatterRef.current
  })

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVert}
        fragmentShader={particleFrag}
        uniforms={{ uTime: { value: 0 }, uScatter: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
