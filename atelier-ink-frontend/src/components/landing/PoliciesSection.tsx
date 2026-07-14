import { AlertCircle, Shield, Clock, DollarSign, Users, Heart } from 'lucide-react'

const policies = [
  {
    icon: DollarSign,
    title: 'Shop Minimum',
    content: 'All tattoo work has a  ₦5000 shop minimum regardless of size. This covers setup, materials, and artist time. Piercings start at  ₦4000 including jewelry.',
  },
  {
    icon: Users,
    title: 'Age Requirements',
    content: 'You must be 18 or older with a valid government issued photo ID. We do not tattoo minors under any circumstances, no exceptions.',
  },
  {
    icon: DollarSign,
    title: 'Non-Refundable Deposits',
    content: 'A deposit is required to secure all bookings. Deposits go toward the total cost of your piece and are non-refundable if you cancel within 48 hours or a no show.',
  },
  {
    icon: Clock,
    title: 'Rescheduling Policy',
    content: 'We understand life happens. Reschedule with at least 48 hours notice and your deposit transfers. Late cancellations forfeit the deposit.',
  },
  {
    icon: Heart,
    title: 'Health Requirements',
    content: 'Do not consume alcohol or blood thinners within 24 hours of your appointment. Arrive rested, hydrated, and having eaten a meal. We reserve the right to refuse service.',
  },
  {
    icon: Shield,
    title: 'Touch-Up Policy',
    content: 'One complimentary touch-up is included within 3 months of your original session, provided proper aftercare was followed. Touch-ups after this period are billed at standard rates.',
  },
]

export default function PoliciesSection() {
  return (
    <div>
      <div className="mb-16">
        <p className="section-label mb-4">Studio Policies</p>
        <h2 className="display-heading text-4xl md:text-6xl text-ink-white mb-4">
          Before You Book
        </h2>
        <div className="divider-gold mt-6" />
        <p className="font-body text-ink-silver mt-8 max-w-2xl leading-relaxed">
          We run a clean, professional studio with clear expectations on both sides.
          Please read the following before scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-steel">
        {policies.map((policy) => {
          const Icon = policy.icon
          return (
            <div key={policy.title} className="bg-ink-black p-8 hover:bg-ink-charcoal transition-colors duration-300">
              <Icon size={20} className="text-gold mb-5" />
              <h3 className="font-display text-xl font-light text-ink-white mb-3">
                {policy.title}
              </h3>
              <p className="font-body text-sm text-ink-silver leading-relaxed">
                {policy.content}
              </p>
            </div>
          )
        })}
      </div>

      {/* Important notice */}
      <div className="mt-8 flex items-start gap-4 p-6 border border-gold/30 bg-gold/5">
        <AlertCircle size={18} className="text-gold mt-0.5 flex-shrink-0" />
        <p className="font-body text-sm text-ink-silver leading-relaxed">
          <strong className="text-gold font-medium">Important:</strong>{' '}
          By completing your booking, you agree to these policies in full.
          Deposits are processed securely and confirm your appointment slot.
          Questions? Email us at{' '}
          <a href="mailto:hello@atelierink.ng" className="text-gold hover:underline">
            hello@atelierink.ng
          </a>
        </p>
      </div>
    </div>
  )
}
