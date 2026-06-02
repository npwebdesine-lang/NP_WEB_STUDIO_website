// components/ui/MagneticButton.tsx
'use client'

import { useEffect, useRef } from 'react'
import { attachMagnetic } from '@/hooks/useCursor'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function MagneticButton({ children, className = '', onClick, type = 'button', disabled }: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!btnRef.current) return
    return attachMagnetic(btnRef.current)
  }, [])

  return (
    <button ref={btnRef} type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
