// hooks/useCursor.ts
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useCursor() {
  const dotRef  = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const mouseX  = useRef(0)
  const mouseY  = useRef(0)
  const ringX   = useRef(0)
  const ringY   = useRef(0)
  const rafId   = useRef<number>(0)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const dot  = document.getElementById('cursor-dot')  as HTMLDivElement | null
    const ring = document.getElementById('cursor-ring') as HTMLDivElement | null
    dotRef.current  = dot
    ringRef.current = ring

    document.body.classList.add('has-custom-cursor')

    function moveDot(x: number, y: number) {
      if (!dot) return
      dot.style.left = x + 'px'
      dot.style.top  = y + 'px'
    }

    function loop() {
      rafId.current = requestAnimationFrame(loop)
      ringX.current += (mouseX.current - ringX.current) * 0.14
      ringY.current += (mouseY.current - ringY.current) * 0.14
      if (ring) {
        ring.style.left = ringX.current + 'px'
        ring.style.top  = ringY.current + 'px'
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouseX.current = e.clientX
      mouseY.current = e.clientY
      moveDot(e.clientX, e.clientY)
    }

    function onMouseDown() { document.body.classList.add('cursor-click') }
    function onMouseUp()   { document.body.classList.remove('cursor-click') }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup',   onMouseUp)

    loop()

    const targets = document.querySelectorAll('a, button, .glass-card')
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'))
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'))
    })

    return () => {
      cancelAnimationFrame(rafId.current)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup',   onMouseUp)
      document.body.classList.remove('has-custom-cursor', 'cursor-hover', 'cursor-click')
    }
  }, [])

  return { dotRef, ringRef }
}

/** Standalone: attach magnetic pull to one element. Use inside useEffect; returns cleanup fn. */
export function attachMagnetic(btn: HTMLElement): () => void {
  if (typeof window === 'undefined') return () => {}
  if (window.matchMedia('(pointer: coarse)').matches) return () => {}

  const FIELD = 80
  let inField  = false

  function onMove(e: MouseEvent) {
    const rect = btn.getBoundingClientRect()
    const bx   = rect.left + rect.width  / 2
    const by   = rect.top  + rect.height / 2
    const dx   = e.clientX - bx
    const dy   = e.clientY - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < FIELD) {
      inField = true
      gsap.to(btn, { x: dx * 0.35, y: dy * 0.35, duration: 0.35, ease: 'power2.out' })
      const inner = btn.querySelector('.btn-inner') as HTMLElement | null
      if (inner) gsap.to(inner, { x: dx * 0.12, y: dy * 0.12, duration: 0.35, ease: 'power2.out' })
    } else if (inField) {
      inField = false
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' })
      const inner = btn.querySelector('.btn-inner') as HTMLElement | null
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' })
    }
  }

  document.addEventListener('mousemove', onMove)
  return () => document.removeEventListener('mousemove', onMove)
}
