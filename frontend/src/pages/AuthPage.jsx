import { useState, useRef, useEffect } from 'react'
import { API_BASE } from '../config'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Shield, Fingerprint, UserCheck, ArrowRight, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'

const TABS = [
  { id: 'phone', label: 'Phone / Aadhaar', icon: Phone },
  { id: 'digilocker', label: 'DigiLocker', icon: Fingerprint },
  { id: 'guest', label: 'Guest Access', icon: UserCheck },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [activeTab, setActiveTab] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [digiStatus, setDigiStatus] = useState('idle')
  const [error, setError] = useState('')
  const [otpHint, setOtpHint] = useState('')  // Demo: show OTP to user
  const [resendTimer, setResendTimer] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const otpRefs = useRef([])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // Auto-focus first OTP field
  useEffect(() => {
    if (otpSent && otpRefs.current[0]) {
      otpRefs.current[0].focus()
    }
  }, [otpSent])

  const handleSendOTP = async () => {
    if (phone.length < 10) return
    setIsSending(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setOtpHint(data.otp_hint || '')
        setResendTimer(30) // 30 sec cooldown
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Server unavailable. Make sure backend is running.')
    }
    setIsSending(false)
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    await handleSendOTP()
  }

  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[idx] = value.slice(-1)
    setOtp(next)
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    setIsVerifying(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.join('') }),
      })
      const data = await res.json()
      if (data.success) {
        setVerified(true)
        setTimeout(() => {
          login(data.user)
          navigate('/')
        }, 800)
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
        setIsVerifying(false)
      }
    } catch {
      setError('Server unavailable.')
      setIsVerifying(false)
    }
  }

  const handleDigiLocker = async () => {
    setDigiStatus('connecting')
    try {
      const res = await fetch(`${API_BASE}/api/auth/digilocker`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setDigiStatus('success')
        setTimeout(() => {
          login(data.user)
          navigate('/')
        }, 1000)
      }
    } catch {
      setDigiStatus('idle')
      setError('Server unavailable.')
    }
  }

  const handleGuest = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/guest`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        login(data.user)
        navigate('/')
      }
    } catch {
      login({ phone: 'Guest', method: 'guest' })
      navigate('/')
    }
  }

  const otpFilled = otp.every(d => d !== '')

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Hero */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #001e40 0%, #003366 40%, #0d9488 100%)' }}>
        
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full border border-white/10" />
        <div className="absolute bottom-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-white/5 blur-2xl" />

        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fcd400' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-headline)' }}>PolicyPilot</span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em]">Government of India Initiative</p>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Every citizen<br/>deserves access<br/>to their <span style={{ color: '#fcd400' }}>rights.</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Discover government schemes you qualify for. AI-powered matching grounded in official PDFs — with conflicts transparently surfaced.
          </p>
          <div className="flex gap-8 mt-10">
            {[
              { n: '650+', l: 'Schemes' },
              { n: '41', l: 'Categories' },
              { n: '36', l: 'States & UTs' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-headline)' }}>{s.n}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/30 text-xs">
          <div className="flex items-center gap-1"><Shield size={12}/> End-to-End Encrypted</div>
          <span>•</span>
          <div>ISO 27001 Compliant</div>
          <span>•</span>
          <div>CERT-In Audited</div>
        </div>
      </div>

      {/* Right — Auth Forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16" style={{ background: 'var(--color-surface)' }}>
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#001e40' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fcd400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/>
            </svg>
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>PolicyPilot</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>
            Welcome, Citizen
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-on-surface-variant)' }}>
            Sign in to discover schemes you're eligible for
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: 'var(--color-surface-container-high)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setOtpSent(false); setVerified(false); setDigiStatus('idle'); setError(''); setOtpHint('') }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-[var(--color-on-surface)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                <tab.icon size={14}/>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              ⚠️ {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ===== Phone / Aadhaar Tab ===== */}
            {activeTab === 'phone' && (
              <motion.div key="phone" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
                {!otpSent ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{color:'var(--color-on-surface-variant)'}}>
                        Phone Number or Aadhaar-linked Mobile
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold px-3 py-3 rounded-lg" style={{background:'var(--color-surface-container-high)', color:'var(--color-on-surface-variant)'}}>+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                          placeholder="98XXXXXXXX"
                          maxLength={10}
                          className="quiet-input text-lg tracking-wider"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs mt-2" style={{color:'var(--color-outline)'}}>
                        We'll send a 6-digit OTP to verify your identity
                      </p>
                    </div>

                    <button
                      onClick={handleSendOTP}
                      disabled={phone.length < 10 || isSending}
                      className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{background:'var(--color-secondary-container)', color:'var(--color-on-secondary-container)'}}
                    >
                      {isSending ? <><Loader2 size={16} className="animate-spin"/> Sending...</> : <>Send OTP <ArrowRight size={16}/></>}
                    </button>
                  </div>
                ) : !verified ? (
                  <div className="space-y-6">
                    {/* OTP Hint (demo mode) */}
                    {otpHint && (
                      <div className="p-3 rounded-lg text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <p className="text-[0.6rem] uppercase tracking-wider font-semibold mb-1" style={{ color: '#16a34a' }}>
                          🎓 Demo Mode — Your OTP is:
                        </p>
                        <p className="text-2xl font-bold tracking-[0.5em]" style={{ color: '#15803d', fontFamily: 'var(--font-headline)' }}>
                          {otpHint}
                        </p>
                        <p className="text-[0.55rem] mt-1" style={{ color: '#86efac' }}>
                          In production, this would be sent via SMS
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{color:'var(--color-on-surface-variant)'}}>
                        Enter 6-digit OTP sent to +91 {phone}
                      </label>
                      <div className="flex gap-2 justify-center my-4">
                        {otp.map((d, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none"
                            style={{
                              borderColor: d ? 'var(--color-accent)' : 'var(--color-outline-variant)',
                              background: d ? 'var(--color-accent-container)' : 'var(--color-surface-container-lowest)',
                              color: 'var(--color-on-surface)',
                              fontFamily: 'var(--font-headline)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Actions row: Change number + Resend OTP */}
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setError(''); setOtpHint('') }}
                          className="text-xs underline" style={{color:'var(--color-accent)'}}>
                          Change number
                        </button>

                        <button
                          onClick={handleResendOTP}
                          disabled={resendTimer > 0}
                          className="flex items-center gap-1 text-xs font-semibold disabled:opacity-40 transition-all"
                          style={{color: resendTimer > 0 ? 'var(--color-outline)' : 'var(--color-accent)'}}
                        >
                          <RefreshCw size={12}/>
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={!otpFilled || isVerifying}
                      className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{background:'var(--color-secondary-container)', color:'var(--color-on-secondary-container)'}}
                    >
                      {isVerifying ? <><Loader2 size={16} className="animate-spin"/> Verifying...</> : <>Verify & Continue <ArrowRight size={16}/></>}
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="text-center py-8">
                    <CheckCircle2 size={56} className="mx-auto mb-4" style={{color:'var(--color-success)'}}/>
                    <p className="text-lg font-bold" style={{color:'var(--color-on-surface)'}}>Verified Successfully!</p>
                    <p className="text-sm" style={{color:'var(--color-on-surface-variant)'}}>Redirecting...</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ===== DigiLocker Tab ===== */}
            {activeTab === 'digilocker' && (
              <motion.div key="digi" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{background:'linear-gradient(135deg, #1a73e8, #0d47a1)'}}>
                    <Fingerprint size={36} className="text-white"/>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{color:'var(--color-on-surface)'}}>Connect with DigiLocker</h3>
                  <p className="text-sm mb-6 max-w-xs mx-auto" style={{color:'var(--color-on-surface-variant)'}}>
                    Pull your Aadhaar, PAN, Income Certificate, and Caste Certificate directly from the government vault.
                  </p>

                  <div className="bg-[var(--color-surface-container-low)] rounded-xl p-4 mb-6 text-left max-w-xs mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{color:'var(--color-on-surface-variant)'}}>Documents auto-fetched:</p>
                    {['Aadhaar Card', 'PAN Card', 'Income Certificate', 'Caste Certificate', 'Driving License'].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        <CheckCircle2 size={14} style={{color: digiStatus === 'success' ? 'var(--color-success)' : 'var(--color-outline-variant)'}}/>
                        <span className="text-sm" style={{color:'var(--color-on-surface)'}}>{doc}</span>
                      </div>
                    ))}
                  </div>

                  {digiStatus === 'idle' && (
                    <button onClick={handleDigiLocker}
                      className="w-full max-w-xs mx-auto py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-white"
                      style={{background:'linear-gradient(135deg, #1a73e8, #0d47a1)'}}>
                      <Fingerprint size={16}/> Connect DigiLocker
                    </button>
                  )}
                  {digiStatus === 'connecting' && (
                    <div className="flex items-center justify-center gap-2 py-3.5">
                      <Loader2 size={18} className="animate-spin" style={{color:'var(--color-primary)'}}/>
                      <span className="text-sm font-semibold" style={{color:'var(--color-primary)'}}>Connecting to DigiLocker...</span>
                    </div>
                  )}
                  {digiStatus === 'success' && (
                    <motion.div initial={{scale:0.9}} animate={{scale:1}} className="flex items-center justify-center gap-2 py-3.5">
                      <CheckCircle2 size={18} style={{color:'var(--color-success)'}}/>
                      <span className="text-sm font-bold" style={{color:'var(--color-success)'}}>Connected! Redirecting...</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== Guest Tab ===== */}
            {activeTab === 'guest' && (
              <motion.div key="guest" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{background:'var(--color-surface-container-high)'}}>
                    <UserCheck size={28} style={{color:'var(--color-accent)'}}/>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{color:'var(--color-on-surface)'}}>Continue as Guest</h3>
                  <p className="text-sm mb-6 max-w-xs mx-auto" style={{color:'var(--color-on-surface-variant)'}}>
                    No sign-in needed. You can still search schemes, view conflicts, and explore. Form auto-fill requires login.
                  </p>

                  <div className="rounded-xl p-4 mb-6 text-left max-w-xs mx-auto" style={{background:'var(--color-warning-container)'}}>
                    <p className="text-xs font-semibold mb-2" style={{color:'var(--color-warning)'}}>⚠️ Limited features in guest mode:</p>
                    <ul className="text-xs space-y-1" style={{color:'var(--color-on-surface-variant)'}}>
                      <li>• Form auto-fill disabled</li>
                      <li>• Document upload limited</li>
                      <li>• Saved searches unavailable</li>
                    </ul>
                  </div>

                  <button onClick={handleGuest}
                    className="w-full max-w-xs mx-auto py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    style={{background:'var(--color-secondary-container)', color:'var(--color-on-secondary-container)'}}>
                    Continue as Guest <ArrowRight size={16}/>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom */}
          <div className="mt-10 pt-6 text-center" style={{borderTop:'1px solid var(--color-outline-variant)'}}>
            <p className="text-xs" style={{color:'var(--color-outline)'}}>
              By continuing, you agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
            </p>
            <p className="text-[0.65rem] mt-2" style={{color:'var(--color-outline)'}}>
              🔒 Your data is encrypted and never shared. PolicyPilot is a Government of India initiative.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
