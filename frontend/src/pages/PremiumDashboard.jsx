import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ParticlesBg from '../components/dashboard/ParticlesBg'
import StatCards from '../components/dashboard/StatCards'
import QuickActions from '../components/dashboard/QuickActions'
import RoomOverview from '../components/dashboard/RoomOverview'
import LiveDetection from '../components/dashboard/LiveDetection'
import CameraFeed from '../components/dashboard/CameraFeed'
import ActivityTimeline from '../components/dashboard/ActivityTimeline'
import NotificationsPanel from '../components/dashboard/NotificationsPanel'
import EnergyChart from '../components/dashboard/EnergyChart'
import DeviceUsageChart from '../components/dashboard/DeviceUsageChart'
import AIRecommendations from '../components/dashboard/AIRecommendations'
import AllDevices from '../components/dashboard/AllDevices'
import AIChatbot from '../components/dashboard/AIChatbot'
import Footer from '../components/dashboard/Footer'

export default function PremiumDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
    if (user.name) setUserName(user.name)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #070B18, #0B1023)' }}>
      <ParticlesBg />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className="relative z-10 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        {/* Top Bar */}
        <TopBar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Page Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-[28px] font-bold text-white tracking-tight">
              {getGreeting()}, {userName} <span className="inline-block animate-[float_3s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-[14px] text-white/40 mt-1">Everything looks good in your smart home.</p>
          </motion.div>

          {/* Statistics Cards */}
          <div className="mb-6">
            <StatCards />
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <QuickActions />
          </div>

          {/* Main Grid: Left Content + Right Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 mb-6">
            {/* Left: Rooms + Charts */}
            <div className="space-y-6">
              <RoomOverview />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EnergyChart />
                <DeviceUsageChart />
              </div>

              <AIRecommendations />
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              <LiveDetection />
              <CameraFeed />
              <NotificationsPanel />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mb-6">
            <ActivityTimeline />
          </div>

          {/* All Devices */}
          <div className="mb-6">
            <AllDevices />
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}
