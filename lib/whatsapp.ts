// lib/whatsapp.ts
const WA_NUMBER = '972547492977'

const PAGE_LABELS: Record<string, string> = {
  '/':        'בעמוד הבית',
  '/about':   'בעמוד תהליך העבודה',
  '/works':   'בתיק העבודות',
  '/prise':   'בעמוד המחירון',
  '/info':    'בעמוד המידע',
  '/addons':  'בעמוד התוספים',
}

export function buildWaUrl(
  name: string,
  business: string,
  service: string,
  pathname: string,
): string {
  const page = PAGE_LABELS[pathname] ?? 'בעמוד הבית'
  let msg = `היי נתיב, קוראים לי ${name}.\n`
  if (business) msg += `מבית העסק: ${business}.\n`
  msg += `\nהגעתי מ${page} באתר שלך, ואני מתעניין ב${service}. אשמח לשמוע פרטים.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}
