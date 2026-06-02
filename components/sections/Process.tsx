// components/sections/Process.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  { num: '01', title: 'אסטרטגיה ואפיון',  body: 'מבינים מי קהל היעד שלך, מה המטרה העסקית, ויוצרים מסלול ברור שיגרום להם לפעול ולהשאיר פרטים.' },
  { num: '02', title: 'עיצוב Premium',     body: 'בניית שפה ויזואלית ייחודית שמשדרת אמינות ויוקרה, עם דגש חזק על חווית משתמש מושלמת בטלפונים הניידים.' },
  { num: '03', title: 'פיתוח מתקדם',      body: 'כתיבת קוד נקי ומהיר במיוחד. בלי תוספים כבדים שתוקעים את האתר, וחיבור מלא למערכות מדידה ולידים.' },
]

function addCardTilt(card: HTMLElement) {
  function onMove(e: MouseEvent) {
    const r  = card.getBoundingClientRect()
    const dx = e.clientX - r.left - r.width  / 2
    const dy = e.clientY - r.top  - r.height / 2
    const rx = (dy / (r.height / 2)) * -7
    const ry = (dx / (r.width  / 2)) *  7
    const sx = ((e.clientX - r.left) / r.width)  * 100
    const sy = ((e.clientY - r.top)  / r.height) * 100
    card.style.setProperty('--spotlight-x', sx + '%')
    card.style.setProperty('--spotlight-y', sy + '%')
    card.style.transition = 'none'
    card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
  }
  function onLeave() {
    card.style.transition = 'transform 0.5s cubic-bezier(0.25,0.8,0.25,1)'
    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)'
  }
  card.addEventListener('mousemove',  onMove)
  card.addEventListener('mouseleave', onLeave)
  return () => {
    card.removeEventListener('mousemove',  onMove)
    card.removeEventListener('mouseleave', onLeave)
  }
}

export function Process() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.process-section-title',
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-process', start: 'top 80%', once: true } }
    )

    gsap.fromTo('.process-card',
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.14, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-process', start: 'top 75%', once: true } }
    )

    const cleanups: (() => void)[] = []
    sectionRef.current?.querySelectorAll<HTMLElement>('.process-card').forEach(card => {
      cleanups.push(addCardTilt(card))
    })
    return () => cleanups.forEach(fn => fn())
  }, { scope: sectionRef })

  return (
    <section className="section-process container" ref={sectionRef}>
      <div className="section-label">תהליך העבודה</div>
      <h2 className="section-title process-section-title">איך אנחנו מתקדמים?</h2>
      <div className="process-track">
        {CARDS.map(card => (
          <article key={card.num} className="glass-card process-card">
            <span className="card-num">{card.num}</span>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-body">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
