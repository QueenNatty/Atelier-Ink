'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import Step1ArtistService from './Step1ArtistService'
import Step2Creative from './Step2Creative'
import Step3Schedule from './Step3Schedule'
import Step4Legal from './Step4Legal'
import Step5Checkout from './Step5Checkout'
import BookingConfirmation from './BookingConfirmation'

const STEPS = [
  { number: 1, label: 'Artist & Service' },
  { number: 2, label: 'Creative Brief' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Health & Legal' },
  { number: 5, label: 'Checkout' },
]

export default function BookingWizard() {
  const { step, bookingResult, setArtist, prevStep } = useWizardStore()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Pre-select artist from URL param e.g. /book?artist=1
    const artistId = searchParams.get('artist')
    if (artistId) {
      // Will be resolved in Step1 when artists load
    }
  }, [searchParams])

  if (bookingResult) return <BookingConfirmation />

  return (
    <div className="min-h-screen bg-ink-black">
      {/* Top bar */}
      <div className="border-b border-ink-steel px-6 md:px-16 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-body text-sm text-ink-silver hover:text-gold transition-colors"
        >
          <ArrowLeft size={16} />
          Atelier Ink
        </Link>
        <span className="font-display text-xl font-light text-ink-white">
          Book a <em className="text-gold not-italic">Session</em>
        </span>
        <div className="w-24" />
      </div>

      {/* Progress bar */}
      <div className="border-b border-ink-steel px-6 md:px-16 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Step dots - desktop */}
          <div className="hidden md:flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 font-body text-xs',
                    step > s.number
                      ? 'bg-gold border-gold text-ink-black'
                      : step === s.number
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-ink-steel text-ink-ash'
                  )}>
                    {step > s.number ? <Check size={14} /> : s.number}
                  </div>
                  <span className={cn(
                    'font-body text-2xs tracking-wider uppercase whitespace-nowrap',
                    step === s.number ? 'text-gold' : 'text-ink-ash'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px mx-2 mb-5 transition-colors duration-300',
                    step > s.number ? 'bg-gold' : 'bg-ink-steel'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body text-xs text-gold tracking-widest uppercase">
                Step {step} of {STEPS.length}
              </span>
              <span className="font-body text-xs text-ink-silver">
                {STEPS[step - 1].label}
              </span>
            </div>
            <div className="h-px bg-ink-steel">
              <div
                className="h-px bg-gold transition-all duration-500"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-12">
        <div className="animate-fade-in">
          {step === 1 && <Step1ArtistService />}
          {step === 2 && <Step2Creative />}
          {step === 3 && <Step3Schedule />}
          {step === 4 && <Step4Legal />}
          {step === 5 && <Step5Checkout />}
        </div>
      </div>
    </div>
  )
}
