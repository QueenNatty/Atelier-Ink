'use client'

import { useState } from 'react'
import { Lock, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { bookingApi, initAuth } from '@/lib/api'
import { formatDate, formatTime, formatCurrency, cn } from '@/lib/utils'

export default function Step5Checkout() {
  const {
    selectedArtist, anyArtist, serviceType, selectedService,
    piercingPlacement, tattooPath, flashDesignId,
    customPlacement, selectedSlot, selectedBlock,
    setBookingResult, prevStep,
  } = useWizardStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSession = !!selectedBlock
  const depositAmount = isSession
    ? parseFloat(selectedBlock?.deposit_required || '50')
    : 0
  const artistName = selectedArtist?.full_name || 'First Available Artist'
  const date = selectedSlot?.date || selectedBlock?.date
  const startTime = selectedSlot?.start_time || selectedBlock?.start_time
  const endTime = selectedSlot?.end_time || selectedBlock?.end_time

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    initAuth()

    try {
      const payload: Parameters<typeof bookingApi.createBooking>[0] = {
        artist: selectedArtist?.id || 1,
        booking_type: isSession ? 'session' : 'consultation',
        ...(selectedSlot && { consultation_slot: selectedSlot.id }),
        ...(selectedBlock && {
          session_block: selectedBlock.id,
          session_hours: selectedBlock.available_hours,
        }),
        description: customPlacement
          ? `Custom ${serviceType} — ${customPlacement}`
          : tattooPath === 'flash' ? `Flash design #${flashDesignId}` : '',
        placement: customPlacement || piercingPlacement || '',
      }

      const res = await bookingApi.createBooking(payload)
      setBookingResult(res.data)
    } catch (err: any) {
      const msg = err.response?.data?.detail
        || err.response?.data?.non_field_errors?.[0]
        || 'Something went wrong. Please try again.'
      setError(msg.includes('Authentication') || msg.includes('credentials')
        ? 'Please log in to complete your booking.'
        : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="section-label mb-3">Step 5</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Review & Pay</h2>
      <p className="font-body text-ink-silver mb-10">
        Confirm your booking details and secure your slot with a deposit.
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
            ...(customPlacement ? [{ label: 'Placement', value: customPlacement }] : []),
            { label: 'Date', value: date ? formatDate(date) : '—' },
            { label: 'Time', value: startTime ? `${formatTime(startTime)}${endTime ? ` – ${formatTime(endTime)}` : ''}` : '—' },
            { label: 'Type', value: isSession ? 'Session Block' : 'Consultation' },
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
            {isSession ? formatCurrency(depositAmount) : 'Free'}
          </span>
        </div>
        {isSession && (
          <p className="font-body text-xs text-ink-ash mt-2">
            Deposit goes toward your final session cost.
          </p>
        )}
      </div>

      {/* Payment mockup */}
      {isSession && (
        <div className="border border-ink-steel p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={14} className="text-gold" />
            <p className="font-body text-xs text-ink-silver tracking-widest uppercase">
              Secure Payment
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-body text-xs text-ink-ash tracking-widest uppercase block mb-2">
                Card Number
              </label>
              <div className="input-ink flex items-center gap-3 cursor-not-allowed opacity-60">
                <CreditCard size={16} className="text-ink-ash flex-shrink-0" />
                <span className="text-ink-ash">•••• •••• •••• ••••</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-ink-ash tracking-widest uppercase block mb-2">Expiry</label>
                <div className="input-ink opacity-60 cursor-not-allowed text-ink-ash">MM / YY</div>
              </div>
              <div>
                <label className="font-body text-xs text-ink-ash tracking-widest uppercase block mb-2">CVC</label>
                <div className="input-ink opacity-60 cursor-not-allowed text-ink-ash">•••</div>
              </div>
            </div>
          </div>

          <p className="font-body text-xs text-ink-ash mt-4 flex items-center gap-2">
            <Lock size={10} />
            Payment processing via Stripe. Your card details are never stored by us.
          </p>
        </div>
      )}

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
          className={cn('btn-primary min-w-40 justify-center', loading && 'opacity-70 cursor-wait')}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : (
            isSession ? `Pay ${formatCurrency(depositAmount)}` : 'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  )
}
