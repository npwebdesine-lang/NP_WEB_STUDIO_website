// app/layout.tsx
import type { Metadata } from 'next'
import { Heebo, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './providers'
import { Cursor } from '@/components/ui/Cursor'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-heebo',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NP Web Studio | פיתוח ועיצוב אתרי פרימיום',
  description: 'אני הופך רעיונות לאתרים יוקרתיים ודפי נחיתה שממירים. בלי תבניות מוכנות, בלי רעשי רקע, רק עיצוב מדויק וחווית משתמש שמוכרת.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" data-theme="dark-indigo" className={`${heebo.variable} ${spaceGrotesk.variable}`}>
      <body>
        <ThemeProvider>
          <Cursor />
          <ThemeSwitcher />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
