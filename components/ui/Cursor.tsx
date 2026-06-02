// components/ui/Cursor.tsx
'use client'

import { useCursor } from '@/hooks/useCursor'

export function Cursor() {
  useCursor()
  return (
    <>
      <div id="cursor-dot"  aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
    </>
  )
}
