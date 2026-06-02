import { buildWaUrl } from './whatsapp'

test('builds URL with name, business, service, page', () => {
  const url = buildWaUrl('דנה', 'דנה פיטנס', 'דף נחיתה', '/')
  expect(url).toContain('wa.me/972547492977')
  expect(url).toContain(encodeURIComponent('קוראים לי דנה'))
  expect(url).toContain(encodeURIComponent('בעמוד הבית'))
})

test('omits business line when empty', () => {
  const url = buildWaUrl('רון', '', 'אתר תדמית', '/works')
  expect(url).not.toContain('מבית העסק')
  expect(url).toContain(encodeURIComponent('בתיק העבודות'))
})
