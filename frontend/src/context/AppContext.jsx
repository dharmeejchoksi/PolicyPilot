import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [citizenProfile, setCitizenProfile] = useState(null)
  const [matchedSchemes, setMatchedSchemes] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [formData, setFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pp_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const isAuthenticated = !!user

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('pp_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pp_user')
    setCitizenProfile(null)
    setMatchedSchemes([])
    setConflicts([])
  }

  const value = {
    language, setLanguage,
    citizenProfile, setCitizenProfile,
    matchedSchemes, setMatchedSchemes,
    conflicts, setConflicts,
    uploadedDocs, setUploadedDocs,
    formData, setFormData,
    isLoading, setIsLoading,
    // Auth
    user, isAuthenticated, login, logout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
