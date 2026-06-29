'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-ink-black/95 backdrop-blur-md border-b border-ink-steel py-4'
          : 'bg-transparent py-6'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-light text-ink-white tracking-wide hover:text-gold transition-colors">
          Atelier <em className="text-gold not-italic">Ink</em>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Portfolio', href: '/#portfolio' },
            { label: 'Artists', href: '/#artists' },
            { label: 'Policies', href: '/#policies' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-body text-sm tracking-widest uppercase text-ink-silver hover:text-gold transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/book" className="btn-primary py-3 px-6 text-xs">
            Book Now
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink-white hover:text-gold transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink-charcoal border-t border-ink-steel px-6 py-8 flex flex-col gap-6">
          {[
            { label: 'Portfolio', href: '/#portfolio' },
            { label: 'Artists', href: '/#artists' },
            { label: 'Policies', href: '/#policies' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-body text-sm tracking-widest uppercase text-ink-silver hover:text-gold transition-colors"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link href="/book" className="btn-primary justify-center mt-2" onClick={() => setOpen(false)}>
            Book Now
          </Link>
        </div>
      )}
    </header>
  )
}
