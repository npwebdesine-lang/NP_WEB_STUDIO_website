// components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/',       label: 'בית' },
  { href: '/about',  label: 'תהליך עבודה' },
  { href: '/works',  label: 'פרויקטים' },
  { href: '/prise',  label: 'חבילות' },
  { href: '/info',   label: 'מידע' },
  { href: '/addons', label: 'תוספים' },
]

interface NavbarProps {
  onOpenModal?: (e: React.MouseEvent) => void
}

export function Navbar({ onOpenModal }: NavbarProps) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header>
        <nav className={`navbar${scrolled ? ' nav--scrolled' : ''}`}>
          <div className="logo">
            <Link href="/" className="logo-link">NP Web Studio.</Link>
          </div>
          <ul className="nav-links">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="nav-link">{label}</Link>
              </li>
            ))}
          </ul>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-primary open-modal-btn" onClick={onOpenModal}>
              <span className="btn-inner">דבר איתי</span>
            </button>
            <button
              className="burger"
              aria-label="תפריט"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>
      </header>

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <button className="mobile-close" aria-label="סגור" onClick={() => setMenuOpen(false)}>✕</button>
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="mobile-link" onClick={() => setMenuOpen(false)}>
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}
