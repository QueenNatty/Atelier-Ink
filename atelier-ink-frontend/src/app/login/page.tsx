'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // Redirect back to wherever they came from, or booking wizard
      const next = new URLSearchParams(window.location.search).get('next') || '/book'
      router.push(next)
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="font-display text-4xl font-light text-ink-white hover:text-gold transition-colors">
            Atelier <em className="text-gold not-italic">Ink</em>
          </Link>
          <p className="font-body text-sm text-ink-ash mt-2 tracking-widest uppercase">
            Lagos Studio
          </p>
        </div>

        <div className="bg-ink-charcoal border border-ink-steel p-8">
          <p className="section-label mb-2">Welcome Back</p>
          <h1 className="display-heading text-3xl text-ink-white mb-8">Sign In</h1>

          {error && (
            <div className="flex items-center gap-3 p-4 border border-red-900 bg-red-900/10 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="font-body text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-ink"
              />
            </div>

            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-ink pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-ash hover:text-gold transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-steel text-center">
            <p className="font-body text-sm text-ink-silver">
              Don't have an account?{' '}
              <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="font-body text-xs text-ink-ash hover:text-gold transition-colors tracking-widest uppercase">
            ← Back to Studio
          </Link>
        </p>
      </div>
    </main>
  )
}
