import { motion } from 'motion/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const DATA = [
  { day: 'Mon', usage: 7.2 },
  { day: 'Tue', usage: 8.1 },
  { day: 'Wed', usage: 6.8 },
  { day: 'Thu', usage: 9.3 },
  { day: 'Fri', usage: 8.5 },
  { day: 'Sat', usage: 10.2 },
  { day: 'Sun', usage: 8.4 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-[11px]"
      style={{ background: 'rgba(7,11,24,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-semibold">{payload[0].value} kWh</div>
    </div>
  )
}

export default function EnergyChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-warning" />
          <span className="text-[13px] font-semibold text-white">Energy Analytics</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/30">
          <span>This Week</span>
        </div>
      </div>

      <div className="h-[180px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#energyGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/[0.05]">
        <div>
          <div className="text-[10px] text-white/30">Weekly Avg</div>
          <div className="text-[13px] font-bold text-white">8.4 kWh</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30">Cost</div>
          <div className="text-[13px] font-bold text-white">₹840</div>
        </div>
      </div>
    </motion.div>
  )
}
