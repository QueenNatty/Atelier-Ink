import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atelier Ink — Fine Tattoo & Piercing Studio',
  description: 'Where skin becomes canvas. Book your consultation or session with our resident artists.',
  keywords: ['tattoo', 'piercing', 'studio', 'booking', 'fine line', 'custom tattoo'],
  openGraph: {
    title: 'Atelier Ink',
    description: 'Fine tattoo & piercing studio. Book online.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-ink-black text-ink-white antialiased">
        {children}
      </body>
    </html>
  )
}
