'use client'

import { useState } from 'react'
import { Lock, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { bookingApi } from '@/lib/api'
import { formatDate, formatTime, cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import axios from 'axios'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

export default function Step5Checkout() {
  const {
    selectedArtist, serviceType,
    piercingPlacement, tattooPath, flashDesignId, customPlacement,
    selectedSlot, selectedBlock, setBookingResult, prevStep,
  } = useWizardStore()

  const { user, isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSession = !!selectedBlock
  const depositAmount = isSession ? parseFloat(selectedBlock?.deposit_required || '0') : 0
  const artistName = selectedArtist?.full_name || 'First Available Artist'
  const date = selectedSlot?.date || selectedBlock?.date
  const startTime = selectedSlot?.start_time || selectedBlock?.start_time
  const endTime = selectedSlot?.end_time || selectedBlock?.end_time

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    // Get token fresh from localStorage
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const authHeader = { Authorization: `Bearer ${token}` }
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      // Step 1: Create the booking
      // Use selected artist, or fall back to the block/slot's own artist
      const artistId = selectedArtist?.id || selectedBlock?.artist || selectedSlot?.artist

      if (!artistId) {
        setError('Could not determine artist. Please go back to Step 1 and select an artist.')
        setLoading(false)
        return
      }

      const bookingPayload: Parameters<typeof bookingApi.createBooking>[0] = {
        artist: artistId,
        booking_type: isSession ? 'session' : 'consultation',
        ...(selectedSlot && { consultation_slot: selectedSlot.id }),
        ...(selectedBlock && {
          session_block: selectedBlock.id,
          session_hours: parseFloat(Number(selectedBlock.available_hours).toFixed(1)),
        }),
        description: customPlacement
          ? 'Custom ' + serviceType + ' — ' + customPlacement
          : tattooPath === 'flash' ? 'Flash design #' + flashDesignId : '',
        placement: customPlacement || piercingPlacement || '',
      }

      const bookingRes = await axios.post(
        `${API}/api/v1/bookings/`,
        bookingPayload,
        { headers: authHeader }
      )
      const booking = bookingRes.data

      // Step 2: If deposit required, initiate Paystack
      if (isSession && depositAmount > 0) {
        const payRes = await axios.post(
          `${API}/api/v1/payments/initiate/`,
          { booking_id: booking.id },
          { headers: authHeader }
        )
        // Redirect to Paystack checkout page
        window.location.href = payRes.data.authorization_url
        return
      }

      // Free consultation — go straight to confirmation
      setBookingResult(booking)
    } catch (err: any) {
      const data = err.response?.data
      let msg = 'Something went wrong. Please try again.'

      if (err.response?.status === 401) {
        msg = 'Session expired. Please sign out and sign in again.'
      } else if (data?.detail) {
        msg = data.detail
      } else if (data?.non_field_errors?.[0]) {
        msg = data.non_field_errors[0]
      } else if (data?.consultation_slot) {
        msg = 'That slot is no longer available. Please go back and pick another.'
      } else if (data?.session_block) {
        msg = data.session_block[0] || msg
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Must be logged in to book
  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <p className="section-label mb-3">Step 5</p>
        <h2 className="display-heading text-4xl text-ink-white mb-4">Almost There</h2>
        <p className="font-body text-ink-silver mb-8 max-w-sm mx-auto">
          You need an account to complete your booking and process your deposit securely via Paystack.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login?next=/book" className="btn-primary justify-center">
            Sign In
          </Link>
          <Link href="/register" className="btn-ghost justify-center">
            Create Account
          </Link>
        </div>
        <button
          onClick={prevStep}
          className="mt-6 font-body text-xs text-ink-ash hover:text-gold transition-colors tracking-widest uppercase block mx-auto"
        >
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-3">Step 5</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Review & Pay</h2>
      <p className="font-body text-ink-silver mb-10">
        Confirm your booking details and secure your slot.
      </p>

      {/* Summary card */}
      <div className="bg-ink-charcoal border border-ink-steel p-6 mb-6">
        <p className="section-label mb-5">Booking Summary</p>
        <div className="space-y-4">
          {[
            { label: 'Artist', value: artistName },
            { label: 'Service', value: serviceType ? serviceType.charAt(0).toUpperCase() + serviceType.slice(1) : '—' },
            ...(piercingPlacement ? [{ label: 'Placement', value: piercingPlacement.charAt(0).toUpperCase() + piercingPlacement.slice(1) }] : []),
            ...(tattooPath ? [{ label: 'Type', value: tattooPath === 'flash' ? `Flash design #${flashDesignId}` : 'Custom piece' }] : []),
            ...(customPlacement ? [{ label: 'Brief', value: customPlacement }] : []),
            { label: 'Date', value: date ? formatDate(date) : '—' },
            { label: 'Time', value: startTime ? `${formatTime(startTime)}${endTime ? ` – ${formatTime(endTime)}` : ''}` : '—' },
            { label: 'Type', value: isSession ? 'Session Block' : 'Free Consultation' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="font-body text-xs text-ink-ash tracking-widest uppercase flex-shrink-0">{label}</span>
              <span className="font-body text-sm text-ink-white text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-steel mt-6 pt-6 flex justify-between items-center">
          <span className="font-body text-sm text-ink-silver">Deposit Due Today</span>
          <span className="font-display text-3xl text-gold">
            {isSession ? formatNaira(depositAmount) : 'Free'}
          </span>
        </div>
        {isSession && (
          <p className="font-body text-xs text-ink-ash mt-2">
            Deposit deducted from your final session cost. Non-refundable within 48hrs of appointment.
          </p>
        )}
      </div>

      {/* Paystack notice */}
      {isSession && (
        <div className="border border-ink-steel p-5 mb-6 flex items-center gap-4 bg-ink-charcoal">
          <Lock size={18} className="text-gold flex-shrink-0" />
          <div className="flex-1">
            <p className="font-body text-sm text-ink-white font-medium">Secure Payment via Paystack</p>
            <p className="font-body text-xs text-ink-ash mt-0.5">
              You'll be redirected to Paystack to pay {formatNaira(depositAmount)}.
              Card, bank transfer, USSD & mobile money accepted.
            </p>
          </div>
          <ExternalLink size={14} className="text-ink-ash flex-shrink-0" />
        </div>
      )}

      {/* Logged in as */}
      <div className="border border-ink-steel p-4 mb-6 flex items-center justify-between bg-ink-charcoal">
        <div>
          <p className="font-body text-xs text-ink-ash tracking-widest uppercase">Booking as</p>
          <p className="font-body text-sm text-ink-white mt-1">{user?.full_name} — {user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 border border-red-900 bg-red-900/10 mb-6">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn-ghost" disabled={loading}>Back</button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={cn('btn-primary min-w-44 justify-center', loading && 'opacity-70 cursor-wait')}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : isSession ? (
            <>Pay {formatNaira(depositAmount)} <ExternalLink size={14} /></>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  )
}
