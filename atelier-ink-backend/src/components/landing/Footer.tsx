import Link from 'next/link'
import { Instagram, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink-charcoal border-t border-ink-steel px-6 md:px-16 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <Link href="/" className="font-display text-3xl font-light text-ink-white">
            Atelier <em className="text-gold not-italic">Ink</em>
          </Link>
          <p className="font-body text-sm text-ink-ash mt-4 leading-relaxed max-w-xs">
            Fine tattoo & piercing studio. Where skin becomes canvas.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com/atelierink.ng" target="_blank" rel="noopener noreferrer"
              className="text-ink-ash hover:text-gold transition-colors">
              <Instagram size={18} />
            </a>
            <a href="mailto:hello@atelierink.ng"
              className="text-ink-ash hover:text-gold transition-colors">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Visit */}
        <div>
          <p className="section-label mb-5">Visit</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
              <p className="font-body text-sm text-ink-silver">
                14 Bode Thomas Street<br />Surulere, Lagos State
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={14} className="text-gold mt-0.5 flex-shrink-0" />
              <p className="font-body text-sm text-ink-silver">
                Tuesday – Saturday<br />11:00am – 8:00pm
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="section-label mb-5">Navigate</p>
          <div className="space-y-3">
            {[
              { label: 'Portfolio', href: '/#portfolio' },
              { label: 'Artists', href: '/#artists' },
              { label: 'Policies', href: '/#policies' },
              { label: 'Book a Session', href: '/book' },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="block font-body text-sm text-ink-silver hover:text-gold transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-ink-steel flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-xs text-ink-ash">
          © {new Date().getFullYear()} Atelier Ink. All rights reserved.
        </p>
        <p className="font-body text-xs text-ink-ash">
          All deposits are non-refundable. Must be 18+ with valid ID.
        </p>
      </div>
    </footer>
  )
}
