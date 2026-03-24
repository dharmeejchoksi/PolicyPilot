import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Star, FileText, ExternalLink, ChevronRight } from 'lucide-react'

export default function Results() {
  const navigate = useNavigate()
  const { matchedSchemes, conflicts, citizenProfile, language } = useApp()
  const isHindi = language === 'hi'

  if (!citizenProfile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-on-surface-variant)] mb-4">
            {isHindi ? 'पहले अपनी जानकारी दें' : 'Please describe your situation first'}
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-semibold">
            {isHindi ? 'वापस जाएँ' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-[var(--color-surface)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2">
            {isHindi ? 'आपकी पात्र योजनाएँ' : 'Your Eligible Schemes'}
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            {isHindi
              ? `${matchedSchemes.length} योजनाएँ मिलीं • ${conflicts.length} विरोधाभास पाए गए`
              : `${matchedSchemes.length} schemes matched • ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} found`}
          </p>
        </motion.div>

        {/* Conflict Alert Banner */}
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="conflict-card rounded-xl p-5 mb-8 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/conflicts')}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-conflict)] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--color-conflict)] text-sm uppercase tracking-wide mb-1">
                  {isHindi ? `⚠️ ${conflicts.length} विरोधाभास पाए गए` : `⚠️ ${conflicts.length} Conflict${conflicts.length !== 1 ? 's' : ''} Detected`}
                </h3>
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-2">
                  {isHindi
                    ? 'केंद्र और राज्य योजनाओं में विरोधाभासी पात्रता मानदंड पाए गए हैं। विवरण देखने के लिए क्लिक करें।'
                    : 'Central and State scheme versions have contradicting eligibility criteria. Click to see details — nothing is hidden.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {conflicts.map(c => (
                    <span key={c.id} className="text-xs px-2 py-1 bg-white rounded-md text-[var(--color-conflict)] font-medium">
                      {c.centralScheme} vs {c.stateScheme}: {c.field}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={20} className="text-[var(--color-conflict)] shrink-0 mt-1" />
            </div>
          </motion.div>
        )}

        {/* Scheme Cards */}
        <div className="space-y-4">
          {matchedSchemes.map((scheme, i) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--color-surface-container-lowest)] rounded-xl p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all cursor-pointer group"
              onClick={() => navigate(`/scheme/${scheme.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Category + Match % */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent-container)] text-[var(--color-accent)]">
                      {scheme.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-[var(--color-secondary-container)]" fill="var(--color-secondary-container)" />
                      <span className="text-xs font-bold text-[var(--color-on-surface)]">{scheme.matchPercentage}% match</span>
                    </div>
                  </div>

                  {/* Scheme Name */}
                  <h2 className="text-lg font-bold text-[var(--color-on-surface)] mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {isHindi ? scheme.nameHi : scheme.name}
                  </h2>

                  {/* Benefits */}
                  <p className="text-sm text-[var(--color-accent)] font-medium mb-2">
                    {scheme.benefits}
                  </p>

                  {/* Reasoning */}
                  <p className="text-sm text-[var(--color-on-surface-variant)] mb-3 line-clamp-2">
                    {isHindi ? scheme.reasoningHi : scheme.reasoning}
                  </p>

                  {/* Citation Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="citation-badge">
                      <FileText size={10} />
                      PDF Citation
                    </span>
                    <span className="text-xs text-[var(--color-outline)] italic line-clamp-1 max-w-sm">
                      "{scheme.citation.substring(0, 80)}..."
                    </span>
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                  {scheme.link && (
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[var(--color-accent)] hover:underline text-xs flex items-center gap-1"
                    >
                      <ExternalLink size={10} />
                      Official
                    </a>
                  )}
                </div>
              </div>

              {/* Match Bar */}
              <div className="mt-4 h-1.5 bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scheme.matchPercentage}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: scheme.matchPercentage >= 90
                      ? 'var(--color-success)'
                      : scheme.matchPercentage >= 75
                        ? 'var(--color-accent)'
                        : 'var(--color-warning)',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-accent)] transition-colors"
          >
            ← {isHindi ? 'नया खोज करें' : 'Start a New Search'}
          </button>
        </div>
      </div>
    </div>
  )
}
