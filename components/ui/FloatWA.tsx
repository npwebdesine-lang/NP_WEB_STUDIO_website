// components/ui/FloatWA.tsx
'use client'

interface FloatWAProps {
  onClick: (e: React.MouseEvent) => void
}

export function FloatWA({ onClick }: FloatWAProps) {
  return (
    <button className="float-wa" aria-label="WhatsApp" onClick={onClick}>
      <svg viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c1.005.572 1.943.874 3.105.874 3.185 0 5.77-2.585 5.771-5.766.001-3.18-2.587-5.767-5.77-5.767zm0 13c-1.396 0-2.618-.521-3.567-1.42l-2.071.545.556-2.019c-1.099-1.258-1.554-2.697-1.553-4.341 0-4.008 3.256-7.265 7.265-7.265 4.009 0 7.269 3.261 7.269 7.268 0 4.006-3.261 7.266-7.268 7.266h-.632z" />
      </svg>
    </button>
  )
}
