'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Instagram, ArrowRight, ChevronDown } from 'lucide-react'
import Navbar from '@/components/landing/Navbar'
import PortfolioGrid from '@/components/landing/PortfolioGrid'
import ArtistsSection from '@/components/landing/ArtistsSection'
import PoliciesSection from '@/components/landing/PoliciesSection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up')
            entry.target.classList.remove('opacity-0-init')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-ink-black min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1618520042988-b8bb74e6d653?w=1600&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-black/60 via-ink-black/40 to-ink-black" />
          <div className="absolute inset-0 bg-noise opacity-30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 md:px-16 pb-24 md:pb-32 max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <p className="section-label mb-6 opacity-0-init animate-fade-up" data-animate>
              Est. 2019 — Fine Tattoo & Piercing
            </p>

            <h1 className="display-heading text-6xl md:text-8xl lg:text-[9rem] text-ink-white mb-8 opacity-0-init animate-delay-100"
              data-animate
              style={{ animationFillMode: 'forwards' }}
            >
              Atelier
              <br />
              <em className="text-gold not-italic">Ink.</em>
            </h1>

            <p className="font-body font-light text-lg md:text-xl text-ink-mist max-w-xl leading-relaxed mb-12 opacity-0-init animate-delay-200"
              data-animate
              style={{ animationFillMode: 'forwards' }}
            >
              Where skin becomes canvas. We create deliberate, lasting work
              for clients who understand that the best tattoos take time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 opacity-0-init animate-delay-300"
              data-animate
              style={{ animationFillMode: 'forwards' }}
            >
              <Link href="/book" className="btn-primary animate-pulse-gold">
                Book a Session
                <ArrowRight size={16} />
              </Link>
              <a href="#portfolio" className="btn-ghost">
                View Portfolio
              </a>
            </div>

            {/* Studio info strip */}
            <div className="flex flex-wrap gap-8 mt-16 opacity-0-init animate-delay-400"
              data-animate
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2 text-ink-silver">
                <MapPin size={14} className="text-gold" />
                <span className="font-body text-sm">14 Bode Thomas St, Surulere, Lagos</span>
              </div>
              <div className="flex items-center gap-2 text-ink-silver">
                <Clock size={14} className="text-gold" />
                <span className="font-body text-sm">Tue–Sat, 11am – 8pm</span>
              </div>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-ink-silver hover:text-gold transition-colors"
              >
                <Instagram size={14} className="text-gold" />
                <span className="font-body text-sm">@atelierink.ng</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#portfolio"
          className="absolute bottom-8 right-8 md:right-16 text-ink-ash hover:text-gold transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown size={24} />
        </a>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="mb-16" data-animate>
          <p className="section-label mb-4">The Work</p>
          <h2 className="display-heading text-4xl md:text-6xl text-ink-white">
            Healed & Documented
          </h2>
          <div className="divider-gold mt-6" />
        </div>
        <PortfolioGrid />
      </section>

      {/* ── ARTISTS ── */}
      <section id="artists" className="py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="mb-16" data-animate>
          <p className="section-label mb-4">The Artists</p>
          <h2 className="display-heading text-4xl md:text-6xl text-ink-white">
            Resident Talent
          </h2>
          <div className="divider-gold mt-6" />
        </div>
        <ArtistsSection />
      </section>

      {/* ── POLICIES ── */}
      <section id="policies" className="py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-ink-steel">
        <PoliciesSection />
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-32 px-6 md:px-16 text-center bg-ink-charcoal border-t border-ink-steel">
        <p className="section-label mb-6" data-animate>Ready to Begin?</p>
        <h2 className="display-heading text-5xl md:text-7xl text-ink-white mb-8" data-animate>
          Your skin,<br />
          <em className="text-gold not-italic">your story.</em>
        </h2>
        <p className="font-body text-ink-silver mb-12 max-w-md mx-auto" data-animate>
          All sessions begin with a consultation. Deposits are non-refundable
          and go toward the total cost of your piece.
        </p>
        <Link href="/book" className="btn-primary" data-animate>
          Start Booking
          <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </main>
  )
}
