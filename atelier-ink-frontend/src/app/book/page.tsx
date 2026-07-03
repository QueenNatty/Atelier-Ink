import { Suspense } from 'react'
import BookingWizard from '@/components/booking/BookingWizard'
import { Loader2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Session — Atelier Ink Lagos',
  description: 'Reserve your consultation or session at our Surulere, Lagos studio.',
}

export default function BookPage() {
  return (
    <main className="min-h-screen bg-ink-black">
      <Suspense fallback={
        <div className="min-h-screen bg-ink-black flex items-center justify-center">
          <Loader2 size={40} className="text-gold animate-spin" />
        </div>
      }>
        <BookingWizard />
      </Suspense>
    </main>
  )
}
