// components/ui/Modal.tsx
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { buildWaUrl } from '@/lib/whatsapp'
import { usePathname } from 'next/navigation'

interface ModalProps {
  isOpen:  boolean
  originX: string
  originY: string
  onClose: () => void
}

const SERVICES = [
  { value: 'דף נחיתה',    icon: '🚀' },
  { value: 'אתר תדמית',   icon: '💻' },
  { value: 'ייעוץ דיגיטלי', icon: '💡' },
]

export function Modal({ isOpen, originX, originY, onClose }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [biz,  setBiz]  = useState('')
  const [service, setService] = useState('')
  const [nameErr, setNameErr] = useState(false)
  const [progress, setProgress] = useState(33)
  const pathname = usePathname()

  const prevOpen = useRef(false)
  if (isOpen !== prevOpen.current) {
    prevOpen.current = isOpen
    if (overlayRef.current) {
      if (isOpen) {
        gsap.fromTo(
          overlayRef.current,
          { clipPath: `circle(0% at ${originX} ${originY})` },
          { clipPath: `circle(150% at ${originX} ${originY})`, duration: 0.7, ease: 'power3.inOut' }
        )
      } else {
        gsap.to(overlayRef.current, {
          clipPath: `circle(0% at ${originX} ${originY})`,
          duration: 0.55,
          ease: 'power3.inOut',
        })
        setTimeout(() => { setStep(1); setName(''); setBiz(''); setService(''); setProgress(33) }, 600)
      }
    }
  }

  function goStep2() {
    if (!name.trim()) { setNameErr(true); return }
    setNameErr(false)
    setStep(2)
    setProgress(66)
  }

  function goStep3() {
    setStep(3)
    setProgress(100)
    const url = buildWaUrl(name.trim(), biz.trim(), service, pathname)
    setTimeout(() => {
      window.open(url, '_blank')
      onClose()
    }, 2800)
  }

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay${isOpen ? ' is-open' : ''}`}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="יצירת קשר"
    >
      <div className="modal-content glass-card">
        <button className="modal-close-btn" onClick={onClose} aria-label="סגור">✕</button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className={`lead-step${step === 1 ? ' active' : ''}`}>
          <h3 className="modal-title chrome-text">בואו נכיר</h3>
          <p className="modal-sub">כדי שנוכל לתת לכם את השירות המדויק ביותר.</p>
          <div className="form-group">
            <label htmlFor="leadName">איך קוראים לך?</label>
            <input
              id="leadName"
              type="text"
              placeholder="הכנס/י שם מלא"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ borderColor: nameErr ? '#ff6b6b' : '' }}
            />
            {nameErr && <span className="field-error" style={{ display: 'block' }}>יש להזין שם כדי להמשיך</span>}
          </div>
          <div className="form-group">
            <label htmlFor="leadBiz">שם העסק (אופציונלי)</label>
            <input
              id="leadBiz"
              type="text"
              placeholder="לדוגמה: רונן פיטנס"
              value={biz}
              onChange={e => setBiz(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-full" onClick={goStep2}>
            <span className="btn-inner">המשך לשלב הבא ←</span>
          </button>
        </div>

        <div className={`lead-step${step === 2 ? ' active' : ''}`}>
          <h3 className="modal-title chrome-text">במה אפשר לעזור?</h3>
          <p className="modal-sub">בחרו את השירות הרלוונטי עבורכם.</p>
          <div className="options-grid">
            {SERVICES.map(s => (
              <div
                key={s.value}
                className={`service-option${service === s.value ? ' selected' : ''}`}
                onClick={() => setService(s.value)}
                role="button"
                tabIndex={0}
              >
                <span className="option-icon">{s.icon}</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => { setStep(1); setProgress(33) }}>חזור</button>
            <button className="btn btn-primary" disabled={!service} onClick={goStep3}>
              <span className="btn-inner">בואו נדבר!</span>
            </button>
          </div>
        </div>

        <div className={`lead-step${step === 3 ? ' active' : ''}`}>
          <div className="loader-ring" />
          <h3 className="modal-title chrome-text">מעולה!</h3>
          <p className="modal-sub">מעבירים אותך עכשיו לשיחה בוואטסאפ...</p>
        </div>
      </div>
    </div>
  )
}
