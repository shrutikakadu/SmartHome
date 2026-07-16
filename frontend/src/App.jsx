import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import LandingPage            from './pages/LandingPage'
import AuthPage               from './pages/AuthPage'
import DashboardPage          from './pages/DashboardPage'
import PremiumDashboard       from './pages/PremiumDashboard'
import SmartHomePage          from './pages/SmartHomePage'
import DetectionPage          from './pages/DetectionPage'
import GestureHistoryPage     from './pages/GestureHistoryPage'
import AnalyticsPage          from './pages/AnalyticsPage'
import AIChatPage             from './pages/AIChatPage'
import VoiceSpeechPage        from './pages/VoiceSpeechPage'
import EmergencyPage          from './pages/EmergencyPage'
import DeviceManagementPage   from './pages/DeviceManagementPage'
import AITrainingPage         from './pages/AITrainingPage'

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('smarthome_user')
  if (!user) return <Navigate to="/auth" replace />
  const parsed = JSON.parse(user)
  if (!parsed.token) return <Navigate to="/auth" replace />
  return children
}

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"    element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected — all inner pages */}
        <Route path="/dashboard"      element={<Protected><DashboardPage /></Protected>} />
        <Route path="/smart-home"     element={<Protected><SmartHomePage /></Protected>} />
        <Route path="/detection"      element={<Protected><DetectionPage /></Protected>} />
        <Route path="/gesture-history" element={<Protected><GestureHistoryPage /></Protected>} />
        <Route path="/analytics"      element={<Protected><AnalyticsPage /></Protected>} />
        <Route path="/ai-assistant"   element={<Protected><AIChatPage /></Protected>} />
        <Route path="/voice-speech"   element={<Protected><VoiceSpeechPage /></Protected>} />
        <Route path="/emergency"      element={<Protected><EmergencyPage /></Protected>} />
        <Route path="/devices"        element={<Protected><DeviceManagementPage /></Protected>} />
        <Route path="/ai-training"    element={<Protected><AITrainingPage /></Protected>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
