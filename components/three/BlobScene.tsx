// components/three/BlobScene.tsx
'use client'

import dynamic from 'next/dynamic'

const BlobSceneInner = dynamic(
  () => import('./BlobSceneInner').then(m => m.BlobSceneInner),
  { ssr: false, loading: () => null }
)

export function BlobScene() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <BlobSceneInner />
    </div>
  )
}
