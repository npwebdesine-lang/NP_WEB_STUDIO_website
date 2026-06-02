// components/three/BlobSceneInner.tsx
'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BlobMesh }  from './BlobMesh'
import { Particles } from './Particles'

function SceneLogic({ targetMouse, mouse, morphRef, scatterRef }: {
  targetMouse: React.MutableRefObject<THREE.Vector2>
  mouse:       React.MutableRefObject<THREE.Vector2>
  morphRef:    React.MutableRefObject<number>
  scatterRef:  React.MutableRefObject<number>
}) {
  useFrame((_state, delta) => {
    const f = Math.min(delta * 60, 1) // frame-rate independence factor
    mouse.current.x  += (targetMouse.current.x - mouse.current.x)  * 0.06 * f
    mouse.current.y  += (targetMouse.current.y - mouse.current.y)  * 0.06 * f
    // Read current values (which may include scroll boosts), decay them, write back
    morphRef.current   += (1.0 - morphRef.current)    * 0.08  * f
    scatterRef.current += (0   - scatterRef.current)  * 0.035 * f
  }, -1)

  return null
}

export function BlobSceneInner() {
  const mouseRef       = useRef(new THREE.Vector2(0, 0))
  const targetMouseRef = useRef(new THREE.Vector2(0, 0))
  const morphRef       = useRef(1.0)
  const scatterRef     = useRef(0)
  const lastScrollY    = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      targetMouseRef.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      targetMouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    function onScroll() {
      const sy  = window.scrollY
      const vel = Math.abs(sy - lastScrollY.current)
      lastScrollY.current = sy
      if (vel > 12) {
        morphRef.current   = Math.min(2.8, 1.0 + vel * 0.06)
        scatterRef.current = Math.min(1.5, scatterRef.current + vel * 0.04)
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll',    onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll',    onScroll)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.3} />
      <SceneLogic
        targetMouse={targetMouseRef}
        mouse={mouseRef}
        morphRef={morphRef}
        scatterRef={scatterRef}
      />
      <BlobMesh  mouseRef={mouseRef} morphStrength={morphRef} />
      <Particles scatterRef={scatterRef} />
    </Canvas>
  )
}
