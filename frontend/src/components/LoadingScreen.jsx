import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const stages = [
  { label: 'Reading your profile...', labelHi: 'आपकी प्रोफ़ाइल पढ़ रहा है...', duration: 1200 },
  { label: 'Scanning 650+ government schemes...', labelHi: '650+ सरकारी योजनाएँ स्कैन कर रहा है...', duration: 1800 },
  { label: 'Matching eligibility criteria...', labelHi: 'पात्रता मानदंड मिला रहा है...', duration: 1500 },
  { label: 'Checking Central vs State conflicts...', labelHi: 'केंद्र vs राज्य विरोधाभास जाँच रहा है...', duration: 1000 },
  { label: 'Preparing your results...', labelHi: 'आपके परिणाम तैयार कर रहा है...', duration: 800 },
]

export default function LoadingScreen({ isHindi = false }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0
    
    const timer = setInterval(() => {
      elapsed += 50
      setProgress(Math.min((elapsed / totalDuration) * 100, 100))
      
      let cumulative = 0
      for (let i = 0; i < stages.length; i++) {
        cumulative += stages[i].duration
        if (elapsed < cumulative) {
          setCurrentStage(i)
          break
        }
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,30,64,0.95)' }}>
      <div className="text-center max-w-md px-8">
        {/* Animated rings */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#fcd400', borderRightColor: '#fcd400' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#0d9488', borderLeftColor: '#0d9488' }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-4 rounded-full border-2 border-transparent"
            style={{ borderBottomColor: '#fcd400', borderRightColor: '#fcd400' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-white text-sm mb-6"
          >
            {isHindi ? stages[currentStage].labelHi : stages[currentStage].label}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0d9488, #fcd400)', width: `${progress}%` }}
          />
        </div>

        {/* Stage dots */}
        <div className="flex justify-center gap-2 mt-4">
          {stages.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i <= currentStage ? '#0d9488' : 'rgba(255,255,255,0.15)',
                transform: i === currentStage ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
