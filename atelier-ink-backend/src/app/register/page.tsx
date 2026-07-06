'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'
import { authApi, setAuthToken } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', password_confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await authApi.register(form)
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      setAuthToken(res.data.access)
      setSuccess(true)
      setTimeout(() => router.push('/book'), 1500)
    } catch (err: any) {
      const data = err.response?.data || {}
      const flat: Record<string, string> = {}
      Object.entries(data).forEach(([k, v]) => {
        flat[k] = Array.isArray(v) ? v[0] : String(v)
      })
      setErrors(flat)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-ink-black flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gold/10 border border-gold flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-gold" />
          </div>
          <h2 className="display-heading text-3xl text-ink-white mb-2">Account Created</h2>
          <p className="font-body text-ink-silver">Redirecting to booking...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ink-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="font-display text-4xl font-light text-ink-white hover:text-gold transition-colors">
            Atelier <em className="text-gold not-italic">Ink</em>
          </Link>
          <p className="font-body text-sm text-ink-ash mt-2 tracking-widest uppercase">Lagos Studio</p>
        </div>

        <div className="bg-ink-charcoal border border-ink-steel p-8">
          <p className="section-label mb-2">New Client</p>
          <h1 className="display-heading text-3xl text-ink-white mb-8">Create Account</h1>

          {errors.non_field_errors && (
            <div className="flex items-center gap-3 p-4 border border-red-900 bg-red-900/10 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="font-body text-sm text-red-400">{errors.non_field_errors}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">First Name</label>
                <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
                  placeholder="Adaeze" required className="input-ink" />
                {errors.first_name && <p className="font-body text-xs text-red-400 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">Last Name</label>
                <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
                  placeholder="Okafor" required className="input-ink" />
                {errors.last_name && <p className="font-body text-xs text-red-400 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="your@email.com" required className="input-ink" />
              {errors.email && <p className="font-body text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
                Phone Number <span className="text-ink-ash normal-case">(optional)</span>
              </label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+234 800 000 0000" className="input-ink" />
            </div>

            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 8 characters" required className="input-ink pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-ash hover:text-gold transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="font-body text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">Confirm Password</label>
              <input type={showPw ? 'text' : 'password'} value={form.password_confirm}
                onChange={e => set('password_confirm', e.target.value)}
                placeholder="Repeat password" required className="input-ink" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-steel text-center">
            <p className="font-body text-sm text-ink-silver">
              Already have an account?{' '}
              <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
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
