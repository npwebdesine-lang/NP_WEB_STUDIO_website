import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // No darkMode: 'class' — theme is driven by data-theme attr + CSS vars
  theme: { extend: {} },
  plugins: [],
}
export default config
