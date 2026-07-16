import { motion } from 'motion/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart3 } from 'lucide-react'

const DATA = [
  { name: 'Lights', value: 35, color: '#6366F1' },
  { name: 'AC', value: 28, color: '#22C55E' },
  { name: 'TV', value: 18, color: '#F59E0B' },
  { name: 'Others', value: 19, color: '#8B5CF6' },
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-[11px]"
      style={{ background: 'rgba(7,11,24,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
      <div className="text-white/50 mb-0.5">{payload[0].name}</div>
      <div className="text-white font-semibold">{payload[0].value}%</div>
    </div>
  )
}

export default function DeviceUsageChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={15} className="text-primary" />
          <span className="text-[13px] font-semibold text-white">Device Usage</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5">
          {DATA.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-[11px] text-white/50 flex-1">{item.name}</span>
              <span className="text-[12px] font-semibold text-white">{item.value}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
