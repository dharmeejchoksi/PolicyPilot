import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, FileText, Scale } from 'lucide-react'

export default function Conflicts() {
  const navigate = useNavigate()
  const { conflicts, language } = useApp()
  const isHindi = language === 'hi'

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-on-surface-variant)] mb-4">
            {isHindi ? 'कोई विरोधाभास नहीं मिला' : 'No conflicts detected'}
          </p>
          <button onClick={() => navigate('/results')} className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-semibold">
            {isHindi ? 'वापस जाएँ' : 'Back to Results'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-[var(--color-surface)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button onClick={() => navigate('/results')} className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-accent)] mb-6 transition-colors">
          <ArrowLeft size={16} />
          {isHindi ? 'वापस परिणामों पर' : 'Back to Results'}
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-conflict)] flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
                {isHindi ? 'विरोधाभास पाए गए' : 'Conflicts Detected'}
              </h1>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                {isHindi
                  ? 'केंद्र और राज्य योजनाओं के बीच विरोधाभासी पात्रता मानदंड'
                  : 'Contradicting eligibility criteria between Central and State scheme versions'}
              </p>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="bg-[var(--color-warning-container)] rounded-xl p-4 mt-4">
            <p className="text-sm text-[var(--color-warning)] font-medium">
              🔍 {isHindi
                ? 'PolicyPilot कभी विरोधाभास नहीं छुपाता। दोनों स्रोत यहाँ दिखाए गए हैं ताकि आप सही निर्णय ले सकें।'
                : 'PolicyPilot never hides contradictions. Both sources are shown here so you can make an informed decision.'}
            </p>
          </div>
        </motion.div>

        {/* Conflict Cards */}
        <div className="space-y-8">
          {conflicts.map((conflict, i) => (
            <motion.div
              key={conflict.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-[var(--color-surface-container-lowest)] rounded-2xl overflow-hidden shadow-[var(--shadow-md)]"
            >
              {/* Conflict Header */}
              <div className="bg-[var(--color-conflict)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <Scale size={20} className="text-white" />
                  <div>
                    <h2 className="text-white font-bold text-sm uppercase tracking-wide">
                      {isHindi ? 'विरोधाभास:' : 'Conflict:'} {conflict.field}
                    </h2>
                    <p className="text-white/80 text-xs">
                      {conflict.centralScheme} vs {conflict.stateScheme}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Central Version */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                      {isHindi ? 'केंद्रीय' : 'Central'}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">{conflict.centralScheme}</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-lg font-bold text-[var(--color-conflict)]">{conflict.centralValue}</p>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-container-low)] rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-on-surface-variant)] italic leading-relaxed">
                        "{conflict.centralCitation}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* State Version */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white">
                      {isHindi ? 'राज्य' : 'State'}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">{conflict.stateScheme}</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-lg font-bold text-[var(--color-conflict)]">{conflict.stateValue}</p>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-container-low)] rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-on-surface-variant)] italic leading-relaxed">
                        "{conflict.stateCitation}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="px-6 py-4 bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)]/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                  {isHindi ? 'इसका मतलब क्या है?' : 'What does this mean for you?'}
                </h3>
                <p className="text-sm text-[var(--color-on-surface)] leading-relaxed">
                  {isHindi ? conflict.explanationHi : conflict.explanation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
