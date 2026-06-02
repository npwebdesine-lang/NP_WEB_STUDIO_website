// components/sections/Hero.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { BlobScene } from '@/components/three/BlobScene'

gsap.registerPlugin(ScrollTrigger)

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return
  el.dataset.split = '1'

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) textNodes.push(node)

  textNodes.forEach(textNode => {
    const words = (textNode.textContent ?? '').split(/(\s+)/)
    const frag  = document.createDocumentFragment()
    words.forEach(word => {
      if (/^\s+$/.test(word) || !word) {
        frag.appendChild(document.createTextNode(word))
      } else {
        const wrap  = document.createElement('span')
        wrap.className = 'word-wrap'
        wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom'
        const inner = document.createElement('span')
        inner.className   = 'word'
        inner.style.cssText = 'display:inline-block;transform:translateY(110%)'
        inner.textContent = word
        wrap.appendChild(inner)
        frag.appendChild(wrap)
      }
    })
    textNode.replaceWith(frag)
  })
}

interface HeroProps {
  onOpenModal: (e: React.MouseEvent) => void
}

export function Hero({ onOpenModal }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 })

    tl.fromTo('#blob-canvas-wrapper', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    tl.fromTo('.navbar', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.3)
    tl.fromTo('.chip', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, 0.55)

    const title = containerRef.current?.querySelector('.hero-title') as HTMLElement | null
    if (title) {
      splitWords(title)
      tl.to('.hero-title .word', { y: '0%', stagger: 0.07, duration: 0.75, ease: 'power3.out' }, 0.7)
    }

    tl.fromTo('.hero-sub', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.15)
    tl.fromTo('.hero-ctas .btn', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.55, ease: 'back.out(1.7)' }, 1.3)

    gsap.to('.hero-content', {
      y: -70,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', scrub: true, start: 'top top', end: 'bottom top' },
    })
  }, { scope: containerRef })

  return (
    <section className="hero container" ref={containerRef}>
      <div id="blob-canvas-wrapper" style={{ opacity: 0 }}>
        <BlobScene />
      </div>

      <div className="hero-content">
        <div className="chip-container">
          <span className="chip">UI/UX Design</span>
          <span className="chip">Web Development</span>
          <span className="chip">Conversion</span>
        </div>

        <h1 className="hero-title">
          NP Web Studio<br />
          <span className="chrome-text">לבנות אתר שבונה אמון</span>
        </h1>

        <p className="hero-sub">
          אני הופך רעיונות לאתרים יוקרתיים ודפי נחיתה שממירים. בלי תבניות
          מוכנות, בלי רעשי רקע, רק עיצוב מדויק וחווית משתמש שמוכרת.
        </p>

        <div className="hero-ctas">
          <Link href="/works" className="btn btn-primary">
            <span className="btn-inner">תיק עבודות</span>
          </Link>
          <Link href="/prise" className="btn btn-ghost">
            <span className="btn-inner">חבילות ומחירים</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
