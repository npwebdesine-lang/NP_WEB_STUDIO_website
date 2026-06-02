// app/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Process } from '@/components/sections/Process'
import { Modal } from '@/components/ui/Modal'
import { FloatWA } from '@/components/ui/FloatWA'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [originX,   setOriginX]   = useState('50%')
  const [originY,   setOriginY]   = useState('50%')

  const openModal = useCallback((e: React.MouseEvent) => {
    const x = ((e.clientX / window.innerWidth)  * 100).toFixed(1) + '%'
    const y = ((e.clientY / window.innerHeight) * 100).toFixed(1) + '%'
    setOriginX(x)
    setOriginY(y)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => setModalOpen(false), [])

  return (
    <>
      <Navbar onOpenModal={openModal} />

      <main id="main-content" data-page="index">
        <Hero onOpenModal={openModal} />
        <div className="divider-line container">
          <svg><line x1="0" y1="0" x2="100%" y2="0" /></svg>
        </div>
        <Process />
      </main>

      <Footer />

      <FloatWA onClick={openModal} />

      <Modal
        isOpen={modalOpen}
        originX={originX}
        originY={originY}
        onClose={closeModal}
      />
    </>
  )
}
