'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')
  const [amountNaira, setAmountNaira] = useState<number | null>(null)

  useEffect(() => {
    // Paystack sends either ?reference= or ?trxref=
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference found. Please contact us if you were charged.')
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      setStatus('failed')
      setMessage('Session expired. Please log in and check your bookings.')
      return
    }

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    axios.post(
      `${API}/api/v1/payments/verify/`,
      { reference },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setStatus('success')
        setAmountNaira(res.data.amount_naira)
        setMessage('Your deposit has been confirmed and your booking is secured.')
        // Redirect home after 4 seconds
        setTimeout(() => router.push('/'), 4000)
      })
      .catch(err => {
        const msg = err.response?.data?.detail || 'Payment could not be verified.'
        setStatus('failed')
        setMessage(msg)
      })
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-ink-black flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">

        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-gold animate-spin mx-auto mb-6" />
            <h2 className="display-heading text-3xl text-ink-white mb-2">Verifying Payment</h2>
            <p className="font-body text-ink-silver">Confirming your deposit with Paystack...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 border border-gold flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={44} className="text-gold" />
            </div>
            <p className="section-label mb-3">Payment Confirmed</p>
            <h2 className="display-heading text-5xl text-ink-white mb-4">
              You're <em className="text-gold not-italic">booked.</em>
            </h2>
            {amountNaira && (
              <p className="font-body text-gold text-xl mb-4">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amountNaira)} deposit received
              </p>
            )}
            <p className="font-body text-ink-silver mb-6">{message}</p>
            <div className="border border-ink-steel bg-ink-charcoal p-4 text-left">
              <p className="font-body text-xs text-ink-ash leading-relaxed">
                A confirmation email will be sent to you shortly. Visit us at{' '}
                <strong className="text-ink-mist">14 Bode Thomas Street, Surulere, Lagos.</strong>
              </p>
            </div>
            <p className="font-body text-xs text-ink-ash mt-6">Redirecting you home in a moment...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-24 h-24 border border-red-900 flex items-center justify-center mx-auto mb-8">
              <XCircle size={44} className="text-red-400" />
            </div>
            <h2 className="display-heading text-3xl text-ink-white mb-4">Payment Issue</h2>
            <p className="font-body text-red-400 mb-8">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => router.push('/book')} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => router.push('/')} className="btn-ghost">
                Go Home
              </button>
            </div>
            <p className="font-body text-xs text-ink-ash mt-6">
              Questions? Email us at{' '}
              <a href="mailto:hello@atelierink.ng" className="text-gold">hello@atelierink.ng</a>
            </p>
          </>
        )}

      </div>
    </main>
  )
}

// Wrap in Suspense because useSearchParams needs it in Next.js 14
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-ink-black flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </main>
    }>
      <CallbackContent />
    </Suspense>
  )
}
