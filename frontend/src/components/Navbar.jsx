import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Globe, HelpCircle, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const { language, setLanguage, user, isAuthenticated, logout } = useApp()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16"
      style={{ background: 'linear-gradient(135deg, #001e40 0%, #003366 100%)' }}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: '#fcd400' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/>
            </svg>
          </div>
          <span className="text-white font-bold tracking-wide text-lg" style={{ fontFamily: 'var(--font-headline)' }}>
            PolicyPilot
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <Globe size={14}/>
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Help */}
          <button className="text-white/50 hover:text-white transition-colors">
            <HelpCircle size={16}/>
          </button>

          {/* User / Auth */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pl-3 border-l border-white/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#0d9488', color: 'white' }}>
                  {user?.method === 'guest' ? 'G' : user?.phone?.[0] || 'U'}
                </div>
                <span className="text-white/60 text-xs hidden sm:block">
                  {user?.method === 'guest' ? 'Guest' : user?.method === 'digilocker' ? 'DigiLocker' : `+91 ${user?.phone?.slice(0,4)}...`}
                </span>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors" title="Logout">
                <LogOut size={14}/>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
