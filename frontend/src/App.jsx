import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import SmartHome from './pages/SmartHome'
import './App.css'

/* ── Protected Route ── */
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('smarthome_user')
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SmartHome />
          </ProtectedRoute>
        } />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
