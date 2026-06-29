import BookingWizard from '@/components/booking/BookingWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Session — Atelier Ink',
  description: 'Reserve your consultation or multi-hour session with our resident artists.',
}

export default function BookPage() {
  return (
    <main className="min-h-screen bg-ink-black">
      <BookingWizard />
    </main>
  )
}
