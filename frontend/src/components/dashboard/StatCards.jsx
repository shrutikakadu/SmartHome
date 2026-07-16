import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { Smartphone, Wifi, Zap, Hand } from 'lucide-react'

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0
    if (num === 0) { setDisplay(0); return }
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / 1200, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(num % 1 !== 0 ? (eased * num).toFixed(1) : Math.round(eased * num))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <>{display}{suffix}</>
}

const CARDS = [
  {
    icon: Smartphone,
    label: 'Connected Devices',
    value: 18,
    suffix: '',
    delta: '+2 Today',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
    iconBg: 'rgba(59,130,246,0.15)',
    trend: [3, 5, 4, 7, 6, 8, 10, 9, 12, 14, 15, 18],
  },
  {
    icon: Wifi,
    label: 'Online Devices',
    value: 15,
    suffix: '',
    delta: '98%',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    iconBg: 'rgba(34,197,94,0.15)',
    trend: [10, 12, 11, 13, 14, 13, 15, 14, 15, 15, 15, 15],
  },
  {
    icon: Zap,
    label: 'Energy Usage',
    value: 8.4,
    suffix: ' kWh',
    delta: '₹120 Today',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    iconBg: 'rgba(245,158,11,0.15)',
    trend: [6, 7, 8, 7.5, 9, 8.2, 8.5, 8.1, 8.4, 8.3, 8.4, 8.4],
  },
  {
    icon: Hand,
    label: 'Gesture Accuracy',
    value: 98.2,
    suffix: '%',
    delta: 'Excellent',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
    iconBg: 'rgba(139,92,246,0.15)',
    trend: [90, 92, 93, 94, 95, 96, 95.5, 97, 97.5, 98, 98.1, 98.2],
  },
]

function MiniSparkline({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#grad-${color})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  )
}

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass p-5 relative overflow-hidden cursor-pointer group"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 50% 50%, ${card.color}10, transparent 70%)` }} />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="text-[12px] font-medium text-white/40 mb-2">{card.label}</div>
                <div className="text-[28px] font-bold text-white tracking-tight leading-none">
                  <AnimatedNumber value={card.value} />{card.suffix}
                </div>
                <div className="text-[11px] font-medium mt-2" style={{ color: card.color }}>
                  {card.delta}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.iconBg }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <MiniSparkline data={card.trend} color={card.color} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
