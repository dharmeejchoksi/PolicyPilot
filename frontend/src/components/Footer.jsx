import { Link, useNavigate } from 'react-router-dom'
import { Shield, Globe, Accessibility } from 'lucide-react'

export default function Footer({ isHindi = false }) {
  const navigate = useNavigate()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t" style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface-container-low)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#001e40' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fcd400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/>
                </svg>
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>
                PolicyPilot
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              {isHindi
                ? 'AI-संचालित सरकारी योजना खोज मंच। आधिकारिक PDF पर आधारित, विरोधाभास हमेशा पारदर्शी।'
                : 'AI-powered government scheme discovery platform. Grounded in official PDFs, conflicts always transparently surfaced.'}
            </p>
          </div>

          {/* Quick Links — working navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
              {isHindi ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--color-outline)' }}>
              <li><button onClick={() => { navigate('/'); scrollToTop() }} className="hover:underline text-left">{isHindi ? 'योजनाएँ खोजें' : 'Find Schemes'}</button></li>
              <li><button onClick={() => navigate('/conflicts')} className="hover:underline text-left">{isHindi ? 'विरोधाभास जाँचें' : 'Check Conflicts'}</button></li>
              <li><button onClick={() => navigate('/results')} className="hover:underline text-left">{isHindi ? 'परिणाम' : 'Results'}</button></li>
              <li><a href="mailto:support@policypilot.gov.in" className="hover:underline">{isHindi ? 'संपर्क' : 'Contact'}</a></li>
            </ul>
          </div>

          {/* Official — working links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
              {isHindi ? 'आधिकारिक' : 'Official'}
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--color-outline)' }}>
              <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">India.gov.in</a></li>
              <li><a href="https://www.digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">Digital India</a></li>
              <li><a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">Open Government Data</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.65rem]" style={{ borderTop: '1px solid var(--color-outline-variant)', color: 'var(--color-outline)' }}>
          <div className="flex items-center gap-4">
            <span>© 2026 PolicyPilot — Government of India</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><Shield size={10}/> CERT-In Audited</div>
            <div className="flex items-center gap-1"><Globe size={10}/> Available in 3 Languages</div>
            <div className="flex items-center gap-1"><Accessibility size={10}/> WCAG 2.1 AA</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
