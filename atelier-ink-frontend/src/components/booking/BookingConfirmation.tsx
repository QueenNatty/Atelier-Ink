'use client'

import Link from 'next/link'
import { CheckCircle, Calendar, Clock, User, ArrowRight, RotateCcw } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function BookingConfirmation() {
  const { bookingResult, selectedArtist, reset } = useWizardStore()

  if (!bookingResult) return null

  const date = bookingResult.session_date || bookingResult.consultation_slot
  const addToGoogleCal = () => {
    if (!bookingResult.session_date) return
    const d = bookingResult.session_date.replace(/-/g, '')
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Atelier+Ink+Appointment&dates=${d}/${d}&details=Your+booking+at+Atelier+Ink+Studio`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-ink-black flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 border border-gold flex items-center justify-center">
              <CheckCircle size={40} className="text-gold" />
            </div>
            <div className="absolute -inset-2 border border-gold/20" />
          </div>
        </div>

        <p className="section-label mb-3">Booking Confirmed</p>
        <h1 className="display-heading text-5xl text-ink-white mb-4">
          You're <em className="text-gold not-italic">booked.</em>
        </h1>
        <p className="font-body text-ink-silver mb-10">
          A confirmation email is on its way. Check your inbox for full details and a reminder 24 hours before your appointment.
        </p>

        {/* Booking details */}
        <div className="bg-ink-charcoal border border-ink-steel p-6 text-left mb-8">
          <p className="section-label mb-4">Appointment Details</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={14} className="text-gold flex-shrink-0" />
              <p className="font-body text-sm text-ink-silver">
                {bookingResult.artist_name}
              </p>
            </div>
            {bookingResult.session_date && (
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-gold flex-shrink-0" />
                <p className="font-body text-sm text-ink-silver">
                  {formatDate(bookingResult.session_date)}
                </p>
              </div>
            )}
            {bookingResult.session_start_time && (
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-gold flex-shrink-0" />
                <p className="font-body text-sm text-ink-silver">
                  {formatTime(bookingResult.session_start_time)}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-ink-steel mt-5 pt-5 flex justify-between">
            <span className="font-body text-xs text-ink-ash">Booking ID</span>
            <span className="font-body text-xs text-ink-mist font-medium">
              #{bookingResult.id.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between mt-2">
            <span className="font-body text-xs text-ink-ash">Status</span>
            <span className="font-body text-xs text-gold uppercase tracking-widest">
              {bookingResult.status}
            </span>
          </div>

          {parseFloat(bookingResult.deposit_amount) > 0 && (
            <div className="flex justify-between mt-2">
              <span className="font-body text-xs text-ink-ash">Deposit Paid</span>
              <span className="font-body text-xs text-ink-mist">
                {formatCurrency(bookingResult.deposit_amount)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-10">
          <button
            onClick={addToGoogleCal}
            className="btn-ghost w-full justify-center"
          >
            <Calendar size={16} />
            Add to Google Calendar
          </button>
        </div>

        {/* Reschedule note */}
        <div className="text-left p-4 border border-ink-steel bg-ink-charcoal mb-8">
          <p className="font-body text-xs text-ink-silver leading-relaxed">
            <strong className="text-ink-mist">Need to reschedule?</strong> You can reschedule up to 48 hours before your appointment using the link in your confirmation email. Cancellations within 48 hours forfeit the deposit.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-ghost flex-1 justify-center">
            Back to Studio
          </Link>
          <button
            onClick={reset}
            className="btn-primary flex-1 justify-center"
          >
            <RotateCcw size={14} />
            Book Another
          </button>
        </div>
      </div>
    </div>
  )
}
