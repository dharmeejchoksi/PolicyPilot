import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useApp, AppProvider } from './context/AppContext'
import AuthPage from './pages/AuthPage'
import Landing from './pages/Landing'
import Results from './pages/Results'
import SchemeDetail from './pages/SchemeDetail'
import Conflicts from './pages/Conflicts'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function CitizenLayout({ children }) {
  const { language } = useApp()
  return (
    <>
      <Navbar />
      {children}
      <Footer isHindi={language === 'hi'} />
    </>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated } = useApp()

  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />

      {/* Citizen-facing routes — protected */}
      <Route path="/" element={
        <ProtectedRoute>
          <CitizenLayout><Landing /></CitizenLayout>
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute>
          <CitizenLayout><Results /></CitizenLayout>
        </ProtectedRoute>
      } />
      <Route path="/scheme/:id" element={
        <ProtectedRoute>
          <CitizenLayout><SchemeDetail /></CitizenLayout>
        </ProtectedRoute>
      } />
      <Route path="/conflicts" element={
        <ProtectedRoute>
          <CitizenLayout><Conflicts /></CitizenLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  )
}

export default App
