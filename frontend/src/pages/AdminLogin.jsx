import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Simple demo auth
    if (email && password) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Please enter credentials')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)' }}>
      {/* Header - Editorial Monolith Style */}
      <header className="h-20 flex justify-between items-center px-12"
        style={{ background: 'linear-gradient(135deg, #001e40 0%, #003366 100%)' }}>
        <div className="text-xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: 'var(--font-headline)' }}>
          PolicyPilot
        </div>
        <span className="text-white/60 text-sm">Admin Portal</span>
      </header>

      {/* Login Card */}
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-[460px] bg-white p-10 rounded-xl" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-5"
              style={{ background: 'var(--color-primary)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-container)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /><path d="M9 9h1" /><path d="M14 9h1" /><path d="M9 13h1" /><path d="M14 13h1" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
              Secure access for authorized personnel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1 font-semibold"
                style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body)' }}>
                Government ID / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@policypilot.gov.in"
                className="quiet-input"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--color-on-surface-variant)' }}>
                  Password
                </label>
                <a href="#" className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--color-primary)' }}>
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="quiet-input"
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
            )}

            {/* MFA Notice */}
            <div className="p-3 rounded-lg border-l-4" style={{ background: 'var(--color-surface-container-low)', borderColor: 'var(--color-primary)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
                <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                  MFA will be required after password verification.
                </p>
              </div>
            </div>

            <button type="submit" className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                background: 'var(--color-secondary-container)',
                color: 'var(--color-on-secondary-container)',
                fontFamily: 'var(--font-headline)',
              }}>
              Sign In
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
              This is a restricted government system. Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-12 flex justify-between items-center text-sm" style={{ borderTop: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
        <span style={{ fontFamily: 'var(--font-body)' }}>© 2026 PolicyPilot. Government of India.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
      </footer>
    </div>
  )
}
