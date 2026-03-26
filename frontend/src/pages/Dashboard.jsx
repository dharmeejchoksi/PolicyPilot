import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, FileText, AlertTriangle, TrendingUp, LogOut, BarChart3, ListChecks, Settings2, Upload, Activity, Clock, MapPin, Eye, ChevronRight, RefreshCw, Zap, Database, Cpu, FileUp } from 'lucide-react'

// Mock analytics data with trends
const mockStats = {
  totalQueries: 1247,
  schemesMatched: 3891,
  conflictsDetected: 156,
  uniqueCitizens: 843,
  weeklyGrowth: { queries: 12, schemes: 8, conflicts: -5, citizens: 15 },
}

const recentQueries = [
  { id: 1, description: 'Farmer in Gujarat, 2 acres, income below 1.5 lakh', state: 'Gujarat', categories: ['Agriculture'], schemesFound: 4, conflicts: 2, time: '2 min ago', method: 'voice' },
  { id: 2, description: 'SC student pursuing B.Tech in Delhi', state: 'Delhi', categories: ['Education'], schemesFound: 3, conflicts: 0, time: '8 min ago', method: 'text' },
  { id: 3, description: 'Unemployed youth in UP, age 22, BPL family', state: 'Uttar Pradesh', categories: ['Employment', 'Health'], schemesFound: 5, conflicts: 1, time: '15 min ago', method: 'digilocker' },
  { id: 5, description: 'Tribal farmer in Jharkhand, organic farming', state: 'Jharkhand', categories: ['Agriculture'], schemesFound: 6, conflicts: 3, time: '31 min ago', method: 'voice' },
  { id: 6, description: 'College student in Kerala, family income 3L', state: 'Kerala', categories: ['Education'], schemesFound: 4, conflicts: 1, time: '45 min ago', method: 'text' },
  { id: 7, description: 'Pregnant woman in Bihar, BPL card holder', state: 'Bihar', categories: ['Health'], schemesFound: 3, conflicts: 0, time: '1 hr ago', method: 'text' },
]

const schemeCategories = [
  { name: 'Education', count: 10, color: '#6366f1', icon: '🎓' },
  { name: 'Employment', count: 10, color: '#f59e0b', icon: '💼' },
  { name: 'Health', count: 10, color: '#10b981', icon: '🏥' },
  { name: 'Agriculture', count: 10, color: '#0d9488', icon: '🌾' },
]

// Activity feed items
const activityFeed = [
  { type: 'query', text: 'New query from Gujarat — Agriculture, 4 schemes matched', time: '2m', color: '#0d9488' },
  { type: 'conflict', text: 'Conflict detected: PM-KISAN vs Gujarat Kisan Sahay', time: '3m', color: '#dc2626' },
  { type: 'query', text: 'New query from Delhi — Education, 3 schemes matched', time: '8m', color: '#6366f1' },
  { type: 'system', text: 'RAG pipeline re-indexed: 5 PDFs processed', time: '12m', color: '#0d9488' },
  { type: 'query', text: 'New query from Uttar Pradesh — Employment, Health', time: '15m', color: '#f59e0b' },
  { type: 'conflict', text: 'Conflict resolved: PMFBY income cap clarified', time: '20m', color: '#059669' },
  { type: 'system', text: 'Voice API usage: 127 queries today (↑23%)', time: '30m', color: '#001e40' },
]

// Indexed PDFs
const indexedPDFs = [
  { name: 'PM-KISAN Guidelines 2024.pdf', pages: 42, indexed: true, schemes: 3 },
  { name: 'PMFBY Operational Guidelines.pdf', pages: 68, indexed: true, schemes: 2 },
  { name: 'NSP Scholarship Framework.pdf', pages: 35, indexed: true, schemes: 4 },
  { name: 'Ayushman Bharat PM-JAY.pdf', pages: 55, indexed: true, schemes: 1 },
  { name: 'MGNREGA Act 2005.pdf', pages: 78, indexed: true, schemes: 2 },
]

// Sparkline mini-chart (CSS-only)
function Sparkline({ data, color }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[4px] rounded-t-sm transition-all duration-300"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : `${color}40`,
          }}
        />
      ))}
    </div>
  )
}

// Donut chart (CSS-only)
function DonutChart({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0)
  let cumulative = 0
  const gradientParts = segments.map(seg => {
    const start = (cumulative / total) * 360
    cumulative += seg.count
    const end = (cumulative / total) * 360
    return `${seg.color} ${start}deg ${end}deg`
  })

  return (
    <div className="relative w-36 h-36 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      />
      <div className="absolute inset-4 rounded-full flex items-center justify-center"
        style={{ background: 'white' }}>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>{total}</p>
          <p className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--color-outline)' }}>Schemes</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    navigate('/admin')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'queries', label: 'Queries', icon: ListChecks },
    { id: 'pdfs', label: 'PDF Manager', icon: FileUp },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ]

  const sparkData = [3, 5, 4, 7, 6, 8, 5, 9, 7, 11, 8, 12]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} min-h-screen flex flex-col shrink-0 transition-all duration-300`}
        style={{ background: 'linear-gradient(180deg, #001e40 0%, #002d5c 100%)' }}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: '#fcd400' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" />
            </svg>
          </button>
          {sidebarOpen && <span className="text-white font-bold tracking-wide" style={{ fontFamily: 'var(--font-headline)' }}>PolicyPilot</span>}
        </div>

        {sidebarOpen && <p className="px-4 text-[0.6rem] uppercase tracking-widest text-white/30 mb-4 mt-2">Admin Dashboard</p>}

        {/* Navigation */}
        <nav className="flex-1 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title={tab.label}
            >
              <tab.icon size={18} className="shrink-0" />
              {sidebarOpen && tab.label}
            </button>
          ))}
        </nav>

        {/* System status indicator */}
        {sidebarOpen && (
          <div className="px-4 py-3 mx-3 mb-3 rounded-lg" style={{ background: 'rgba(13,148,136,0.15)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-[0.65rem] text-white/60 uppercase tracking-wider">All Systems Online</span>
            </div>
            <p className="text-[0.6rem] text-white/30">Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        )}

        {/* Logout */}
        <div className="p-3">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors text-sm"
            title="Logout">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'queries' && 'Citizen Queries'}
                {activeTab === 'pdfs' && 'PDF Manager'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-[var(--color-surface-container-high)]"
                style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                <RefreshCw size={13}/> Refresh
              </button>
              <Link to="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'var(--color-accent)' }}>
                <Eye size={13}/> Public Portal
              </Link>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Queries', value: mockStats.totalQueries, icon: Search, color: 'var(--color-accent)', growth: mockStats.weeklyGrowth.queries },
                    { label: 'Schemes Matched', value: mockStats.schemesMatched, icon: FileText, color: 'var(--color-success)', growth: mockStats.weeklyGrowth.schemes },
                    { label: 'Conflicts Found', value: mockStats.conflictsDetected, icon: AlertTriangle, color: 'var(--color-conflict)', growth: mockStats.weeklyGrowth.conflicts },
                    { label: 'Citizens Served', value: mockStats.uniqueCitizens, icon: Users, color: 'var(--color-primary)', growth: mockStats.weeklyGrowth.citizens },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-white"
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>
                          {stat.label}
                        </span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                          <stat.icon size={16} style={{ color: stat.color }} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}>
                        {stat.value.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={11} style={{ color: stat.growth >= 0 ? 'var(--color-success)' : 'var(--color-error)' }} />
                          <span className="text-[0.65rem] font-semibold" style={{ color: stat.growth >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                          </span>
                          <span className="text-[0.6rem]" style={{ color: 'var(--color-outline)' }}>this week</span>
                        </div>
                        <Sparkline data={sparkData} color={stat.color} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Two Column: Donut + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Donut + Category Breakdown */}
                  <div className="p-6 rounded-xl bg-white" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Scheme Distribution
                    </h3>
                    <DonutChart segments={schemeCategories} />
                    <div className="mt-5 space-y-2">
                      {schemeCategories.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ background: cat.color }} />
                            <span style={{ color: 'var(--color-on-surface)' }}>{cat.icon} {cat.name}</span>
                          </div>
                          <span className="font-semibold text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Activity Feed */}
                  <div className="lg:col-span-2 p-6 rounded-xl bg-white" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                        Live Activity
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                        <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--color-success)' }}>Live</span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[320px] overflow-auto pr-2">
                      {activityFeed.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--color-surface-container-low)]"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}15` }}>
                            {item.type === 'query' && <Search size={14} style={{ color: item.color }} />}
                            {item.type === 'conflict' && <AlertTriangle size={14} style={{ color: item.color }} />}
                            {item.type === 'system' && <Zap size={14} style={{ color: item.color }} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: 'var(--color-on-surface)' }}>{item.text}</p>
                            <p className="text-[0.6rem] mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-outline)' }}>
                              <Clock size={9}/> {item.time} ago
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Health + State Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-white" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
                      System Health
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'RAG Pipeline', status: 'Operational', healthy: true, icon: Database, detail: '5 PDFs | 850 chunks' },
                        { label: 'Conflict Engine', status: 'Active', healthy: true, icon: AlertTriangle, detail: '3 conflict pairs' },
                        { label: 'LLM API', status: 'Connected', healthy: true, icon: Cpu, detail: 'Gemini Pro 1.5' },
                        { label: 'Vector Store', status: 'Indexed', healthy: true, icon: Database, detail: 'FAISS | 41 schemes' },
                        { label: 'Voice Engine', status: 'Browser API', healthy: true, icon: Activity, detail: 'WebSpeech | 3 langs' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-container-low)' }}>
                          <div className="flex items-center gap-3">
                            <item.icon size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{item.label}</p>
                              <p className="text-[0.6rem]" style={{ color: 'var(--color-outline)' }}>{item.detail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.healthy ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`} />
                            <span className="text-xs font-semibold" style={{ color: item.healthy ? 'var(--color-success)' : 'var(--color-error)' }}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top States */}
                  <div className="p-6 rounded-xl bg-white" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Top States by Queries
                    </h3>
                    <div className="space-y-3">
                      {[
                        { state: 'Gujarat', queries: 234, pct: 100 },
                        { state: 'Maharashtra', queries: 198, pct: 85 },
                        { state: 'Uttar Pradesh', queries: 176, pct: 75 },
                        { state: 'Rajasthan', queries: 142, pct: 61 },
                        { state: 'Bihar', queries: 119, pct: 51 },
                        { state: 'Tamil Nadu', queries: 98, pct: 42 },
                        { state: 'Delhi', queries: 87, pct: 37 },
                      ].map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1.5" style={{ color: 'var(--color-on-surface)' }}>
                              <MapPin size={12} style={{ color: 'var(--color-accent)' }}/> {s.state}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>{s.queries}</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: 'var(--color-surface-container-high)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.pct}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-light))` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== QUERIES TAB ===== */}
            {activeTab === 'queries' && (
              <motion.div key="queries" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="p-4 flex items-center justify-between" style={{ background: 'var(--color-surface-container-low)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>{recentQueries.length} recent queries</span>
                    <div className="flex gap-2">
                      <input placeholder="Search queries..." className="px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: 'var(--color-outline-variant)', width: '200px' }} />
                      <select className="px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: 'var(--color-outline-variant)' }}>
                        <option>All States</option>
                        <option>Gujarat</option>
                        <option>Delhi</option>
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--color-surface-container-low)' }}>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Citizen Query</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>State</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Method</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Schemes</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Conflicts</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentQueries.map((q) => (
                        <tr key={q.id} className="border-t hover:bg-[var(--color-surface-container-low)] transition-colors" style={{ borderColor: 'var(--color-outline-variant)' }}>
                          <td className="p-4 max-w-xs">
                            <p className="truncate text-sm" style={{ color: 'var(--color-on-surface)' }}>{q.description}</p>
                            <div className="flex gap-1 mt-1">
                              {q.categories.map(c => (
                                <span key={c} className="text-[0.6rem] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-accent-container)', color: 'var(--color-accent)' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{q.state}</td>
                          <td className="p-4">
                            <span className="text-[0.6rem] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: q.method === 'voice' ? '#fef3c7' : q.method === 'digilocker' ? '#dbeafe' : 'var(--color-surface-container-high)',
                                color: q.method === 'voice' ? '#d97706' : q.method === 'digilocker' ? '#1d4ed8' : 'var(--color-on-surface-variant)',
                              }}>
                              {q.method === 'voice' ? '🎤 Voice' : q.method === 'digilocker' ? '🔐 DigiLocker' : '⌨️ Text'}
                            </span>
                          </td>
                          <td className="p-4 font-semibold" style={{ color: 'var(--color-success)' }}>{q.schemesFound}</td>
                          <td className="p-4">
                            {q.conflicts > 0 ? (
                              <span className="text-[0.65rem] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-conflict-container)', color: 'var(--color-conflict)' }}>
                                ⚡ {q.conflicts}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--color-outline)' }}>None</span>
                            )}
                          </td>
                          <td className="p-4 text-xs" style={{ color: 'var(--color-outline)' }}>{q.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ===== PDF MANAGER TAB ===== */}
            {activeTab === 'pdfs' && (
              <motion.div key="pdfs" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                {/* Upload zone */}
                <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-accent)] transition-all"
                    style={{ borderColor: 'var(--color-outline-variant)' }}>
                    <Upload size={28} className="mx-auto mb-3" style={{ color: 'var(--color-outline)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Upload Policy PDFs for RAG Indexing</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-outline)' }}>
                      Drop official government scheme PDFs here. They'll be chunked, embedded, and indexed for AI matching.
                    </p>
                  </div>
                </div>

                {/* Indexed PDFs table */}
                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {indexedPDFs.length} PDFs Indexed in Vector Store
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--color-surface-container-low)' }}>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Document</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Pages</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Schemes Linked</th>
                        <th className="text-left p-4 text-[0.65rem] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indexedPDFs.map((pdf, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText size={16} style={{ color: 'var(--color-error)' }} />
                              <span style={{ color: 'var(--color-on-surface)' }}>{pdf.name}</span>
                            </div>
                          </td>
                          <td className="p-4" style={{ color: 'var(--color-on-surface-variant)' }}>{pdf.pages}</td>
                          <td className="p-4 font-semibold" style={{ color: 'var(--color-accent)' }}>{pdf.schemes}</td>
                          <td className="p-4">
                            <span className="text-[0.6rem] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-success-container)', color: 'var(--color-success)' }}>
                              ✓ Indexed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="space-y-6">
                <div className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--color-on-surface)' }}>AI Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold block mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>LLM Provider</label>
                      <select className="w-full p-2.5 border rounded-lg text-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
                        <option>Google Gemini 1.5 Pro (Recommended)</option>
                        <option>OpenAI GPT-4o</option>
                        <option>Anthropic Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold block mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Vector Store</label>
                      <select className="w-full p-2.5 border rounded-lg text-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
                        <option>FAISS (Local — Fast)</option>
                        <option>Pinecone (Cloud — Scalable)</option>
                        <option>Chroma (Local — Lightweight)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold block mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Chunk Size</label>
                      <input type="number" defaultValue={500} className="w-full p-2.5 border rounded-lg text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold block mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Max Match Results</label>
                      <input type="number" defaultValue={10} className="w-full p-2.5 border rounded-lg text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--color-on-surface)' }}>Conflict Detection</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-container-low)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>Auto-detect Central vs State conflicts</p>
                        <p className="text-xs" style={{ color: 'var(--color-outline)' }}>Automatically flag contradicting eligibility criteria</p>
                      </div>
                      <div className="w-10 h-6 rounded-full relative cursor-pointer" style={{ background: 'var(--color-accent)' }}>
                        <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-container-low)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>Include plain-language explanations</p>
                        <p className="text-xs" style={{ color: 'var(--color-outline)' }}>Generate citizen-friendly conflict explanations</p>
                      </div>
                      <div className="w-10 h-6 rounded-full relative cursor-pointer" style={{ background: 'var(--color-accent)' }}>
                        <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
