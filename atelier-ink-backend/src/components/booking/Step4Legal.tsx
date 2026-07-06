'use client'

import { Shield, AlertCircle } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const HEALTH_ITEMS = [
  'I have not consumed alcohol within the last 24 hours',
  'I am not currently taking blood thinners or aspirin',
  'I have eaten a full meal today and am well hydrated',
  'I do not have any open wounds or active skin conditions at the placement site',
  'I understand that I should not be pregnant or breastfeeding for certain placements',
]

export default function Step4Legal() {
  const {
    ageConfirmed, healthConfirmed, depositConfirmed,
    setAgeConfirmed, setHealthConfirmed, setDepositConfirmed,
    nextStep, prevStep,
  } = useWizardStore()

  const canProceed = ageConfirmed && healthConfirmed && depositConfirmed

  return (
    <div>
      <p className="section-label mb-3">Step 4</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Health & Legal</h2>
      <p className="font-body text-ink-silver mb-10">
        Please confirm the following before we proceed. All fields are required.
      </p>

      <div className="space-y-4">
        {/* Age verification */}
        <label className={cn(
          'flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200',
          ageConfirmed ? 'border-gold bg-gold/5' : 'border-ink-steel hover:border-ink-smoke'
        )}>
          <div className={cn(
            'w-5 h-5 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
            ageConfirmed ? 'bg-gold border-gold' : 'border-ink-smoke'
          )}>
            {ageConfirmed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input type="checkbox" className="sr-only" checked={ageConfirmed} onChange={e => setAgeConfirmed(e.target.checked)} />
          <div>
            <p className="font-body text-sm text-ink-white font-medium">Age Verification *</p>
            <p className="font-body text-sm text-ink-silver mt-1">
              I confirm that I am 18 years of age or older and will present a valid government-issued photo ID at my appointment.
            </p>
          </div>
        </label>

        {/* Health checklist */}
        <label className={cn(
          'flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200',
          healthConfirmed ? 'border-gold bg-gold/5' : 'border-ink-steel hover:border-ink-smoke'
        )}>
          <div className={cn(
            'w-5 h-5 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
            healthConfirmed ? 'bg-gold border-gold' : 'border-ink-smoke'
          )}>
            {healthConfirmed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input type="checkbox" className="sr-only" checked={healthConfirmed} onChange={e => setHealthConfirmed(e.target.checked)} />
          <div className="flex-1">
            <p className="font-body text-sm text-ink-white font-medium mb-3">Health Screening *</p>
            <ul className="space-y-2">
              {HEALTH_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gold rounded-full mt-2 flex-shrink-0" />
                  <p className="font-body text-sm text-ink-silver">{item}</p>
                </li>
              ))}
            </ul>
            <p className="font-body text-sm text-ink-silver mt-3 font-medium">
              I confirm all of the above are true.
            </p>
          </div>
        </label>

        {/* Deposit policy */}
        <label className={cn(
          'flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200',
          depositConfirmed ? 'border-gold bg-gold/5' : 'border-ink-steel hover:border-ink-smoke'
        )}>
          <div className={cn(
            'w-5 h-5 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
            depositConfirmed ? 'bg-gold border-gold' : 'border-ink-smoke'
          )}>
            {depositConfirmed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input type="checkbox" className="sr-only" checked={depositConfirmed} onChange={e => setDepositConfirmed(e.target.checked)} />
          <div>
            <p className="font-body text-sm text-ink-white font-medium">Deposit Policy *</p>
            <p className="font-body text-sm text-ink-silver mt-1">
              I understand that my deposit is non-refundable if I cancel within 48 hours of my appointment or do not show up. Deposits count toward the final cost of my piece.
            </p>
          </div>
        </label>
      </div>

      {/* Notice */}
      <div className="mt-6 flex items-start gap-3 p-4 border border-ink-steel bg-ink-charcoal">
        <AlertCircle size={16} className="text-gold mt-0.5 flex-shrink-0" />
        <p className="font-body text-xs text-ink-ash leading-relaxed">
          Atelier Ink reserves the right to refuse service at any appointment if health or safety concerns arise. Providing false information may result in forfeiture of your deposit.
        </p>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={prevStep} className="btn-ghost">Back</button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={cn('btn-primary', !canProceed && 'opacity-40 cursor-not-allowed hover:scale-100')}
        >
          Review & Pay
        </button>
      </div>
    </div>
  )
}
