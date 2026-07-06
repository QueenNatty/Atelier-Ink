import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Atelier Ink — Fine Tattoo & Piercing Studio, Lagos',
  description: 'Lagos finest tattoo and piercing studio. Book your consultation or session online.',
  keywords: ['tattoo', 'piercing', 'Lagos', 'Nigeria', 'studio', 'booking'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink-black text-ink-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
