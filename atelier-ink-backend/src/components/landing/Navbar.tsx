'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setOpen(false)
  }

  const isStaff = user?.role === 'admin' || user?.role === 'artist'
  const STAFF_URL = 'http://localhost:8000/staff/'

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled ? 'bg-ink-black/95 backdrop-blur-md border-b border-ink-steel py-4' : 'bg-transparent py-6'
    )}>
      <nav className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-light text-ink-white hover:text-gold transition-colors">
          Atelier <em className="text-gold not-italic">Ink</em>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Portfolio', href: '/#portfolio' },
            { label: 'Artists', href: '/#artists' },
            { label: 'Policies', href: '/#policies' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="font-body text-sm tracking-widest uppercase text-ink-silver hover:text-gold transition-colors">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="font-body text-xs text-ink-ash">{user?.first_name}</span>
              {isStaff && (
                <a href={STAFF_URL}
                  className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors">
                  <LayoutDashboard size={13} /> Staff Portal
                </a>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-ink-silver hover:text-gold transition-colors">
                <LogOut size={13} /> Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-ghost py-3 px-5 text-xs flex items-center gap-2">
              <User size={14} /> Sign In
            </Link>
          )}
          <Link href="/book" className="btn-primary py-3 px-6 text-xs">
            Book Now <ArrowRight size={14} />
          </Link>
        </div>

        <button className="md:hidden text-ink-white hover:text-gold transition-colors"
          onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-ink-charcoal border-t border-ink-steel px-6 py-8 flex flex-col gap-6">
          {[
            { label: 'Portfolio', href: '/#portfolio' },
            { label: 'Artists', href: '/#artists' },
            { label: 'Policies', href: '/#policies' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="font-body text-sm tracking-widest uppercase text-ink-silver hover:text-gold transition-colors"
              onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          {isLoggedIn ? (
            <>
              {isStaff && (
                <a href={STAFF_URL}
                  className="font-body text-sm tracking-widest uppercase text-gold" onClick={() => setOpen(false)}>
                  Staff Portal
                </a>
              )}
              <button onClick={handleLogout}
                className="font-body text-sm tracking-widest uppercase text-ink-silver hover:text-gold transition-colors text-left">
                Sign Out ({user?.first_name})
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-ghost justify-center" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          )}
          <Link href="/book" className="btn-primary justify-center" onClick={() => setOpen(false)}>
            Book Now
          </Link>
        </div>
      )}
    </header>
  )
}
