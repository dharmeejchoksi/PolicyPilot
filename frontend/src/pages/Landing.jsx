import { useState, useRef, useEffect } from 'react'
import { API_BASE } from '../config'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Upload, FileText, X, Search, ArrowRight, Shield, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

const categories = [
  { id: 'education', label: '🎓 Education', labelHi: '🎓 शिक्षा' },
  { id: 'agriculture', label: '🌾 Agriculture', labelHi: '🌾 कृषि' },
  { id: 'health', label: '🏥 Health', labelHi: '🏥 स्वास्थ्य' },
  { id: 'employment', label: '💼 Employment', labelHi: '💼 रोज़गार' },
]

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

const steps = [
  { icon: '🗣️', label: 'Describe', desc: 'Tell us your situation' },
  { icon: '📄', label: 'Upload', desc: 'Add your documents' },
  { icon: '🔍', label: 'Match', desc: 'AI finds your schemes' },
  { icon: '⚠️', label: 'Check', desc: 'Conflicts flagged' },
  { icon: '✅', label: 'Apply', desc: 'Checklist + forms ready' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { language, setCitizenProfile, setMatchedSchemes, setConflicts, setIsLoading, setUploadedDocs } = useApp()
  
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [files, setFiles] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const recognitionRef = useRef(null)
  const fileInputRef = useRef(null)

  const isHindi = language === 'hi'

  // Animate pipeline steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Voice Recognition — optimized for low latency
  const finalTranscriptRef = useRef('')

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    // Store whatever text was already typed before starting voice
    finalTranscriptRef.current = description

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN'
    
    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcript
        } else {
          interimText += transcript
        }
      }
      
      // Accumulate finalized text
      if (finalText) {
        finalTranscriptRef.current += finalText
      }
      
      // Show finalized + interim instantly
      setDescription(finalTranscriptRef.current + interimText)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => {
      // Auto-restart if still meant to be listening (handles Chrome's auto-stop)
      if (isListening) {
        try { recognition.start() } catch (e) { setIsListening(false) }
      } else {
        setIsListening(false)
      }
    }
    
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    )
  }

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const [showLoading, setShowLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) return
    
    setShowLoading(true)
    setIsLoading(true)
    const profile = {
      description: description.trim(),
      categories: selectedCategories,
      state: selectedState,
      documents: files.map(f => f.name),
    }
    setCitizenProfile(profile)

    try {
      const res = await fetch(`${API_BASE}/api/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      setMatchedSchemes(data.schemes || [])
      setConflicts(data.conflicts || [])
      setUploadedDocs(files.map(f => f.name))
    } catch (err) {
      // Fallback to mock data for demo
      const mockSchemes = getMockSchemes(profile)
      setMatchedSchemes(mockSchemes.schemes)
      setConflicts(mockSchemes.conflicts)
    }
    
    setIsLoading(false)
    // Wait for loading animation to finish (min 6.3s)
    setTimeout(() => {
      setShowLoading(false)
      navigate('/results')
    }, 6300)
  }

  return (
    <>
    {showLoading && <LoadingScreen isHindi={isHindi} />}
    <div className="min-h-screen pt-16 bg-[var(--color-surface)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--color-accent)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[var(--color-secondary-container)]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-8">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-[var(--color-on-surface)]">
                {isHindi ? 'सरकारी योजनाएँ ' : 'Government Schemes '}
              </span>
              <span className="gradient-text">
                {isHindi ? 'आपके लिए' : 'Made Simple'}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
              {isHindi 
                ? 'अपनी स्थिति बताएं — हम आपकी पात्रता खोजेंगे, आवेदन भरेंगे, और विरोधाभास दिखाएंगे।'
                : 'Describe your situation — we\'ll find every scheme you qualify for, fill your forms, and flag any conflicts.'}
            </p>
          </motion.div>

          {/* Animated Pipeline */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 md:gap-4 mb-12 flex-wrap"
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className={`flex flex-col items-center transition-all duration-500 ${activeStep === i ? 'scale-110' : 'opacity-60'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 transition-all duration-500 ${
                    activeStep === i 
                      ? 'bg-[var(--color-accent)] shadow-lg pulse-glow' 
                      : 'bg-[var(--color-surface-container-high)]'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-on-surface)]">{step.label}</span>
                  <span className="text-[0.65rem] text-[var(--color-on-surface-variant)] hidden md:block">{step.desc}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-all duration-500 ${
                    activeStep > i ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-outline-variant)]'
                  }`} />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Input Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--color-surface-container-lowest)] rounded-2xl p-6 md:p-10 shadow-[var(--shadow-lg)]"
        >
          {/* Voice + Text Input */}
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold mb-3 font-[family-name:var(--font-body)]">
              {isHindi ? 'अपनी स्थिति बताएं' : 'Describe Your Situation'}
            </label>
            
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isHindi
                  ? 'उदाहरण: मैं गुजरात का 45 साल का किसान हूँ, मेरे पास 2 एकड़ जमीन है और वार्षिक आय 1.5 लाख से कम है...'
                  : "e.g. I am a 45-year-old farmer in Gujarat with 2 acres of land and annual income below ₹1.5 lakh..."}
                className="w-full min-h-[140px] p-4 pr-16 rounded-xl border-2 border-[var(--color-outline-variant)]/40 bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-all resize-none text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              
              {/* Voice Button */}
              <button
                onClick={toggleVoice}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-[var(--color-error)] text-white animate-pulse'
                    : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)]'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>

            {/* Waveform when listening */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-center justify-center gap-1 py-3 bg-[var(--color-accent-container)] rounded-lg"
                >
                  <span className="text-xs text-[var(--color-accent)] font-medium mr-3">
                    {isHindi ? '🎙️ सुन रहा है...' : '🎙️ Listening...'}
                  </span>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold mb-3">
              {isHindi ? 'श्रेणी चुनें' : 'Select Categories'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`category-chip ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                >
                  {isHindi ? cat.labelHi : cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* State Selector */}
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold mb-3">
              {isHindi ? 'राज्य चुनें' : 'Select Your State'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full md:w-1/2 p-3 rounded-xl border-2 border-[var(--color-outline-variant)]/40 bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 text-[var(--color-on-surface)] transition-all"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="">{isHindi ? '-- राज्य चुनें --' : '-- Select State --'}</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Document Upload */}
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold mb-3">
              {isHindi ? 'दस्तावेज़ अपलोड करें (वैकल्पिक)' : 'Upload Documents (Optional)'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-container)]/20 transition-all group"
            >
              <Upload size={32} className="mx-auto mb-3 text-[var(--color-outline)] group-hover:text-[var(--color-accent)] transition-colors" />
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                {isHindi 
                  ? 'आधार, आय प्रमाणपत्र, जाति प्रमाणपत्र अपलोड करें'
                  : 'Drop Aadhaar, Income Certificate, Caste Certificate here'}
              </p>
              <p className="text-xs text-[var(--color-outline)] mt-1">PDF, JPG, PNG</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-container-low)] rounded-lg"
                  >
                    <FileText size={14} className="text-[var(--color-accent)]" />
                    <span className="text-xs text-[var(--color-on-surface)]">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-[var(--color-outline)] hover:text-[var(--color-error)]">
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="w-full py-4 rounded-xl font-[family-name:var(--font-headline)] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] hover:brightness-105 active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            <Search size={18} />
            {isHindi ? 'मेरी योजनाएँ खोजें' : 'Find My Schemes'}
            <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-on-surface-variant)]"
        >
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-[var(--color-accent)]" />
            <span>{isHindi ? 'दस्तावेज़ सुरक्षित' : 'Documents Never Stored'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            <span>{isHindi ? 'वास्तविक PDF आधारित' : 'Grounded in Real PDFs'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-[var(--color-warning)]" />
            <span>{isHindi ? 'विरोधाभास हमेशा दिखाए जाते हैं' : 'Conflicts Always Surfaced'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[var(--color-success)]" />
            <span>{isHindi ? '650+ योजनाएँ' : '650+ Schemes Covered'}</span>
          </div>
        </motion.div>
      </section>
    </div>
    </>
  )
}

// Mock data for demo when backend is not available
function getMockSchemes(profile) {
  const desc = profile.description.toLowerCase()
  const schemes = []
  const conflicts = []

  // Agriculture matching
  if (desc.includes('farmer') || desc.includes('agriculture') || desc.includes('किसान') || desc.includes('land') || desc.includes('कृषि') || profile.categories.includes('agriculture')) {
    schemes.push({
      id: 'pm-kisan',
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      nameHi: 'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
      category: 'Agriculture',
      matchPercentage: 95,
      reasoning: 'You are a farmer with land ownership and income below ₹2 lakh. You meet all primary eligibility criteria.',
      reasoningHi: 'आप भूमि स्वामित्व वाले किसान हैं और आय ₹2 लाख से कम है। आप सभी प्राथमिक पात्रता मानदंडों को पूरा करते हैं।',
      citation: 'PM-KISAN Guidelines, Section 3.1: "All land-holding farmer families with cultivable land are eligible for the scheme. Family income should not exceed ₹2,00,000 per annum."',
      benefits: '₹6,000/year in three installments of ₹2,000 each',
      documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
      steps: [
        'Visit nearest Common Service Centre (CSC) or register online at pmkisan.gov.in',
        'Submit Aadhaar, land records, and bank details',
        'Verification by State/District agriculture officer',
        'Once approved, ₹2,000 credited every 4 months',
      ],
      deadline: 'Rolling enrollment — no fixed deadline',
      link: 'https://pmkisan.gov.in',
    })

    schemes.push({
      id: 'pmfby',
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      category: 'Agriculture',
      matchPercentage: 88,
      reasoning: 'As a farmer with cultivable land, you are eligible for crop insurance under PMFBY. Premium is only 2% for Kharif and 1.5% for Rabi crops.',
      reasoningHi: 'कृषि योग्य भूमि वाले किसान के रूप में, आप PMFBY के तहत फसल बीमा के लिए पात्र हैं।',
      citation: 'PMFBY Operational Guidelines 2023, Section 2.2: "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas are eligible."',
      benefits: 'Crop insurance coverage with premium subsidy up to 98%',
      documents: ['Aadhaar Card', 'Land Records/Lease Agreement', 'Sowing Certificate', 'Bank Account'],
      steps: [
        'Contact your bank branch or nearest CSC before sowing season',
        'Fill crop insurance application form',
        'Pay nominal premium (2% Kharif / 1.5% Rabi)',
        'In case of crop loss, file claim through app or nearest office',
      ],
      deadline: 'Before sowing season — Kharif: July 31, Rabi: Dec 31',
      link: 'https://pmfby.gov.in',
    })

    schemes.push({
      id: 'soil-health',
      name: 'Soil Health Card Scheme',
      nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
      category: 'Agriculture',
      matchPercentage: 82,
      reasoning: 'Every farmer with cultivable land is eligible for a Soil Health Card. This helps optimize fertilizer use.',
      reasoningHi: 'कृषि योग्य भूमि वाला प्रत्येक किसान मृदा स्वास्थ्य कार्ड के लिए पात्र है।',
      citation: 'Soil Health Card Scheme Guidelines, Section 1: "All farmers holding cultivable land are entitled to get their soil tested."',
      benefits: 'Free soil testing + customized fertilizer/nutrient recommendations',
      documents: ['Aadhaar Card', 'Land Records'],
      steps: [
        'Contact your Block/District Agriculture Officer',
        'Soil sample will be collected from your field',
        'Soil Health Card issued within 30 days with recommendations',
      ],
      deadline: 'Ongoing — apply anytime',
      link: 'https://soilhealth.dac.gov.in',
    })

    // Add State-level scheme for Gujarat if applicable
    if (desc.includes('gujarat') || profile.state === 'Gujarat') {
      schemes.push({
        id: 'gujarat-kisan',
        name: 'Gujarat Kisan Sahay Yojana',
        nameHi: 'गुजरात किसान सहाय योजना',
        category: 'Agriculture',
        matchPercentage: 90,
        reasoning: 'As a Gujarat farmer with less than 5 acres, you qualify for the state-level crop support scheme.',
        reasoningHi: 'गुजरात के किसान जिनके पास 5 एकड़ से कम जमीन है, राज्य स्तरीय फसल सहायता योजना के लिए पात्र हैं।',
        citation: 'Gujarat Kisan Sahay Yojana 2023, Section 4: "Farmers with land holding up to 5 hectares and annual income below ₹2,00,000 are eligible."',
        benefits: '₹20,000/hectare for crop loss, up to 4 hectares',
        documents: ['Aadhaar Card', 'Land Records (7/12 extract)', 'Income Certificate', 'Bank Account'],
        steps: [
          'Register on Digital Gujarat portal or visit Taluka Agriculture Office',
          'Submit land records and income certificate',
          'Verification by Taluka Development Officer',
          'Compensation credited within 15 days of approval',
        ],
        deadline: 'Within 48 hours of natural calamity notification',
        link: 'https://digitalgujarat.gov.in',
      })

      // Add Conflict
      conflicts.push({
        id: 'conflict-pmfby-gks',
        type: 'eligibility',
        centralScheme: 'PMFBY (Central)',
        stateScheme: 'Gujarat Kisan Sahay (State)',
        field: 'Income Limit',
        centralValue: '₹1,50,000 per annum',
        stateValue: '₹2,00,000 per annum',
        centralCitation: 'PMFBY Guidelines, Section 2.3(b): "Annual family income should not exceed ₹1,50,000 for premium subsidy benefit."',
        stateCitation: 'Gujarat Kisan Sahay Yojana, Section 4.1: "Annual household income must be below ₹2,00,000."',
        explanation: 'The Central PMFBY scheme caps income at ₹1.5 lakh while the Gujarat state scheme allows up to ₹2 lakh. A farmer earning ₹1.7 lakh would qualify for the state scheme but NOT for the full central premium subsidy. Both are valid — we surface both so you can decide.',
        explanationHi: 'केंद्रीय PMFBY योजना ₹1.5 लाख पर आय सीमित करती है जबकि गुजरात राज्य योजना ₹2 लाख तक अनुमति देती है। ₹1.7 लाख कमाने वाला किसान राज्य योजना के लिए पात्र होगा लेकिन पूर्ण केंद्रीय प्रीमियम सब्सिडी के लिए नहीं।',
      })

      conflicts.push({
        id: 'conflict-land-min',
        type: 'eligibility',
        centralScheme: 'PM-KISAN (Central)',
        stateScheme: 'Gujarat Kisan Sahay (State)',
        field: 'Minimum Land Holding',
        centralValue: 'No minimum — all land-holding farmers eligible',
        stateValue: 'Minimum 1 acre of cultivable land required',
        centralCitation: 'PM-KISAN Guidelines, Section 3.1: "All land-holding farmer families are eligible irrespective of size of land."',
        stateCitation: 'Gujarat Kisan Sahay Yojana, Section 4.2: "Minimum holding of 1 acre is required for eligibility."',
        explanation: 'PM-KISAN has no minimum land requirement, but Gujarat Kisan Sahay requires at least 1 acre. A marginal farmer with 0.5 acres qualifies for PM-KISAN but NOT Gujarat Kisan Sahay.',
        explanationHi: 'पीएम-किसान में कोई न्यूनतम भूमि आवश्यकता नहीं है, लेकिन गुजरात किसान सहाय में कम से कम 1 एकड़ आवश्यक है।',
      })
    }
  }

  // Education matching
  if (desc.includes('student') || desc.includes('education') || desc.includes('college') || desc.includes('scholarship') || desc.includes('छात्र') || profile.categories.includes('education')) {
    schemes.push({
      id: 'nsp',
      name: 'National Scholarship Portal (NSP)',
      nameHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)',
      category: 'Education',
      matchPercentage: 92,
      reasoning: 'As a student, you can access multiple scholarships through the centralized NSP portal based on your category and income.',
      reasoningHi: 'छात्र के रूप में, आप अपनी श्रेणी और आय के आधार पर केंद्रीकृत NSP पोर्टल के माध्यम से कई छात्रवृत्तियों का उपयोग कर सकते हैं।',
      citation: 'NSP Portal Guidelines: "All students pursuing education in recognized institutions with family income below specified thresholds are eligible."',
      benefits: 'Multiple scholarships ranging from ₹5,000 to ₹50,000 per year',
      documents: ['Aadhaar Card', 'Income Certificate', 'Previous Marksheet', 'Bank Account', 'Institution ID'],
      steps: [
        'Register on scholarships.gov.in with Aadhaar',
        'Fill scholarship application for relevant schemes',
        'Upload required documents',
        'Institute verification → District verification → Disbursement',
      ],
      deadline: 'Usually October–November each year',
      link: 'https://scholarships.gov.in',
    })

    schemes.push({
      id: 'css',
      name: 'Central Sector Scheme of Scholarship for College Students',
      nameHi: 'कॉलेज छात्रों के लिए केंद्रीय क्षेत्र छात्रवृत्ति योजना',
      category: 'Education',
      matchPercentage: 85,
      reasoning: 'Merit-based scholarship for students from families with income below ₹8 lakh.',
      reasoningHi: 'परिवार की आय ₹8 लाख से कम वाले छात्रों के लिए मेरिट-आधारित छात्रवृत्ति।',
      citation: 'Ministry of Education Notification 2023: "Students in top 20th percentile of their board exam, with family income below ₹8,00,000, are eligible."',
      benefits: '₹10,000/year (Graduation) to ₹20,000/year (Post-Graduation)',
      documents: ['Board Marksheet', 'Income Certificate', 'College Admission Letter', 'Aadhaar Card', 'Bank Account'],
      steps: [
        'Apply through NSP during the application window',
        'Submit board marks and family income proof',
        'College verification of enrollment',
        'Scholarship disbursed directly to student bank account',
      ],
      deadline: 'October 31 each year (check NSP for current year)',
      link: 'https://scholarships.gov.in',
    })
  }

  // Health matching
  if (desc.includes('health') || desc.includes('hospital') || desc.includes('medical') || desc.includes('treatment') || desc.includes('स्वास्थ्य') || profile.categories.includes('health')) {
    schemes.push({
      id: 'pmjay',
      name: 'Ayushman Bharat PM-JAY',
      nameHi: 'आयुष्मान भारत पीएम-जय',
      category: 'Health',
      matchPercentage: 90,
      reasoning: 'Provides ₹5 lakh/year health coverage for families below poverty line. Covers 1,350+ medical procedures.',
      reasoningHi: 'गरीबी रेखा से नीचे के परिवारों के लिए ₹5 लाख/वर्ष स्वास्थ्य कवरेज। 1,350+ चिकित्सा प्रक्रियाओं को कवर करता है।',
      citation: 'AB PM-JAY Operational Guidelines: "All families identified in SECC 2011 data or with annual income below ₹5,00,000 are eligible."',
      benefits: '₹5,00,000 per family per year for hospitalization',
      documents: ['Aadhaar Card', 'Ration Card', 'SECC Letter (if available)'],
      steps: [
        'Check eligibility at mera.pmjay.gov.in',
        'Visit any empaneled hospital',
        'Show Aadhaar at Ayushman Mitra counter',
        'Get treated cashlessly — no advance payment needed',
      ],
      deadline: 'No deadline — continuous enrollment',
      link: 'https://pmjay.gov.in',
    })
  }

  // Employment matching
  if (desc.includes('job') || desc.includes('employ') || desc.includes('unemploy') || desc.includes('work') || desc.includes('skill') || desc.includes('रोज़गार') || profile.categories.includes('employment')) {
    schemes.push({
      id: 'mgnrega',
      name: 'MGNREGA',
      nameHi: 'मनरेगा (MGNREGA)',
      category: 'Employment',
      matchPercentage: 88,
      reasoning: 'Guarantees 100 days of wage employment per year to every rural household.',
      reasoningHi: 'हर ग्रामीण परिवार को प्रति वर्ष 100 दिन का वेतन रोजगार की गारंटी।',
      citation: 'MGNREGA Act 2005, Section 3(1): "Every rural household whose adult members are willing to do unskilled manual work may apply."',
      benefits: '100 days guaranteed wage employment, ₹250-350/day based on state',
      documents: ['Aadhaar Card', 'Job Card (or apply for one)', 'Bank Account'],
      steps: [
        'Apply for Job Card at Gram Panchayat',
        'Submit written application for work',
        'Work must be provided within 15 days',
        'Wages deposited in bank account within 15 days of work',
      ],
      deadline: 'Anytime — demand-driven',
      link: 'https://mnregaweb2.nic.in',
    })

    schemes.push({
      id: 'pmkvy',
      name: 'PM Kaushal Vikas Yojana (PMKVY)',
      nameHi: 'प्रधानमंत्री कौशल विकास योजना (PMKVY)',
      category: 'Employment',
      matchPercentage: 80,
      reasoning: 'Free skill development training for youth with industry-recognized certification.',
      reasoningHi: 'उद्योग-मान्यता प्राप्त प्रमाणन के साथ युवाओं के लिए मुफ्त कौशल विकास प्रशिक्षण।',
      citation: 'PMKVY 4.0 Guidelines: "Indian nationals aged 15-45 years who are not in formal employment are eligible."',
      benefits: 'Free training + ₹8,000 reward on certification + placement support',
      documents: ['Aadhaar Card', 'Education Certificate', 'Bank Account'],
      steps: [
        'Find nearest training centre at pmkvyofficial.org',
        'Enroll for a skill course matching your interest',
        'Complete 3-6 month training',
        'Take assessment → Get certified → Get placement support',
      ],
      deadline: 'Rolling enrollment',
      link: 'https://www.pmkvyofficial.org',
    })
  }

  // If no specific match, return general schemes
  if (schemes.length === 0) {
    schemes.push({
      id: 'pmjay',
      name: 'Ayushman Bharat PM-JAY',
      nameHi: 'आयुष्मान भारत पीएम-जय',
      category: 'Health',
      matchPercentage: 75,
      reasoning: 'Based on your profile, you may qualify for health insurance coverage of up to ₹5 lakh per year.',
      reasoningHi: 'आपकी प्रोफ़ाइल के आधार पर, आप ₹5 लाख प्रति वर्ष तक के स्वास्थ्य बीमा कवरेज के लिए पात्र हो सकते हैं।',
      citation: 'AB PM-JAY Operational Guidelines: "All families with annual income below ₹5,00,000 are eligible."',
      benefits: '₹5,00,000 per family per year for hospitalization',
      documents: ['Aadhaar Card', 'Ration Card'],
      steps: ['Check eligibility at mera.pmjay.gov.in', 'Visit empaneled hospital', 'Get treated cashlessly'],
      deadline: 'No deadline',
      link: 'https://pmjay.gov.in',
    })
  }

  // ── Age-based filtering: if user is under 18, only show Health schemes ──
  const agePatterns = [
    /(\d{1,3})\s*[-–]?\s*(?:year|yr|yrs|years?)[\s-]*old/i,
    /(?:age|aged|umr|उम्र|आयु)\s*[:=]?\s*(\d{1,3})/i,
    /(\d{1,3})\s*(?:sal|साल|वर्ष)/i,
    /(?:i am|i'm|main|मैं)\s+(?:a\s+)?(\d{1,3})/i,
  ]
  let userAge = null
  for (const pattern of agePatterns) {
    const match = desc.match(pattern)
    if (match) {
      const age = parseInt(match[1] || match[2], 10)
      if (age >= 1 && age <= 120) { userAge = age; break }
    }
  }

  if (userAge !== null && userAge < 18) {
    return {
      schemes: schemes.filter(s => s.category === 'Health'),
      conflicts: [],
    }
  }

  return { schemes, conflicts }
}
