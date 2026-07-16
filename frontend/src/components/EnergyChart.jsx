import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

const DEVICES = [
  { key: 'light',  label: 'Lights',   icon: '💡', color: '#a78bfa' },
  { key: 'fan',    label: 'Fans',     icon: '🌀', color: '#38bdf8' },
  { key: 'ac',     label: 'AC',       icon: '❄️', color: '#2dd4bf' },
  { key: 'tv',     label: 'TV',       icon: '📺', color: '#f472b6' },
  { key: 'lock',   label: 'Lock',     icon: '🔒', color: '#fb923c' },
  { key: 'curtain',label: 'Curtains', icon: '🪟', color: '#a3e635' },
]

function generateWeeklyData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => {
    const row = { day }
    DEVICES.forEach(d => {
      row[d.key] = Math.round(0.5 + Math.random() * 4.5)
    })
    row.total = DEVICES.reduce((s, d) => s + row[d.key], 0)
    return row
  })
}

function generateDeviceTotals(weekly) {
  return DEVICES.map(d => ({
    ...d,
    kwh: +weekly.reduce((s, r) => s + r[d.key], 0).toFixed(1),
  }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="energy-tooltip">
      <div className="energy-tooltip-day">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="energy-tooltip-row">
          <span className="energy-tooltip-dot" style={{ background: p.color }}></span>
          <span>{DEVICES.find(d => d.key === p.dataKey)?.label}</span>
          <span className="energy-tooltip-val">{p.value} kWh</span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyChart() {
  const [weekly, setWeekly] = useState([])
  const [totals, setTotals] = useState([])
  const [activeDevice, setActiveDevice] = useState(null)

  useEffect(() => {
    const w = generateWeeklyData()
    setWeekly(w)
    setTotals(generateDeviceTotals(w))
  }, [])

  const totalKwh = totals.reduce((s, d) => s + d.kwh, 0)

  return (
    <motion.div
      className="card energy-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
    >
      <div className="energy-header">
        <div>
          <div className="card-title">⚡ Energy Consumption</div>
          <div className="card-subtitle">Overall device usage this week</div>
        </div>
        <div className="energy-total">
          <span className="energy-total-val">{totalKwh.toFixed(1)}</span>
          <span className="energy-total-unit">kWh total</span>
        </div>
      </div>

      {/* Area Chart — Daily Trend */}
      <div className="energy-chart-area">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              {DEVICES.map(d => (
                <linearGradient key={d.key} id={`grad-${d.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={d.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={d.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} unit=" kWh" />
            <Tooltip content={<CustomTooltip />} />
            {DEVICES.map(d => (
              <Area
                key={d.key}
                type="monotone"
                dataKey={d.key}
                stackId="1"
                stroke={d.color}
                fill={`url(#grad-${d.key})`}
                strokeWidth={activeDevice === null || activeDevice === d.key ? 2 : 0.5}
                fillOpacity={activeDevice === null || activeDevice === d.key ? 1 : 0.15}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Device Breakdown */}
      <div className="energy-breakdown">
        <div className="energy-breakdown-title">Device Breakdown</div>
        <div className="energy-bars">
          {totals.map(d => {
            const pct = totalKwh > 0 ? (d.kwh / totalKwh) * 100 : 0
            return (
              <div
                key={d.key}
                className={`energy-bar-row${activeDevice === d.key ? ' active' : ''}`}
                onMouseEnter={() => setActiveDevice(d.key)}
                onMouseLeave={() => setActiveDevice(null)}
              >
                <div className="energy-bar-label">
                  <span className="energy-bar-icon">{d.icon}</span>
                  <span>{d.label}</span>
                </div>
                <div className="energy-bar-track">
                  <motion.div
                    className="energy-bar-fill"
                    style={{ background: d.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
                  />
                </div>
                <div className="energy-bar-val">{d.kwh} kWh</div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
