// components/three/BlobSceneInner.tsx
'use client'

import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { BlobMesh }   from './BlobMesh'
import { Particles }  from './Particles'

export function BlobSceneInner() {
  const mouseRef       = useRef(new THREE.Vector2(0, 0))
  const targetMouseRef = useRef(new THREE.Vector2(0, 0))
  const morphStrength  = useRef(1.0)
  const scatterRef     = useRef(0)
  const lastScrollY    = useRef(0)
  const rafId          = useRef(0)

  useEffect(() => {
    function tick() {
      rafId.current = requestAnimationFrame(tick)
      mouseRef.current.x  += (targetMouseRef.current.x - mouseRef.current.x)  * 0.06
      mouseRef.current.y  += (targetMouseRef.current.y - mouseRef.current.y)  * 0.06
      morphStrength.current += (1.0 - morphStrength.current) * 0.08
      scatterRef.current    += (0   - scatterRef.current)    * 0.035
    }

    function onMouseMove(e: MouseEvent) {
      targetMouseRef.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      targetMouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }

    function onScroll() {
      const sy  = window.scrollY
      const vel = Math.abs(sy - lastScrollY.current)
      lastScrollY.current = sy
      if (vel > 12) {
        morphStrength.current = Math.min(2.8, 1.0 + vel * 0.06)
        scatterRef.current    = Math.min(1.5, scatterRef.current + vel * 0.04)
      }
    }

    tick()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll',    onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId.current)
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
      <BlobMesh  mouseRef={mouseRef}  morphStrength={morphStrength} />
      <Particles scatterRef={scatterRef} />
    </Canvas>
  )
}
