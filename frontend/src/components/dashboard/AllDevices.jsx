import { motion } from 'motion/react'
import { Lightbulb, Fan, Tv, Snowflake, Speaker, Power, SlidersHorizontal } from 'lucide-react'

const DEVICES = [
  {
    name: 'Living Room Light',
    room: 'Living Room',
    icon: Lightbulb,
    color: '#F59E0B',
    status: true,
    control: { type: 'slider', label: 'Brightness', value: 75 },
  },
  {
    name: 'Ceiling Fan',
    room: 'Bedroom',
    icon: Fan,
    color: '#3B82F6',
    status: true,
    control: { type: 'slider', label: 'Speed', value: 60 },
  },
  {
    name: 'Smart TV',
    room: 'Living Room',
    icon: Tv,
    color: '#8B5CF6',
    status: false,
    control: { type: 'toggle' },
  },
  {
    name: 'Air Conditioner',
    room: 'Bedroom',
    icon: Snowflake,
    color: '#06B6D4',
    status: true,
    control: { type: 'temp', label: 'Temperature', value: 22 },
  },
  {
    name: 'Smart Speaker',
    room: 'Living Room',
    icon: Speaker,
    color: '#22C55E',
    status: true,
    control: { type: 'slider', label: 'Volume', value: 45 },
  },
  {
    name: 'Table Lamp',
    room: 'Bedroom',
    icon: Lightbulb,
    color: '#EC4899',
    status: false,
    control: { type: 'slider', label: 'Brightness', value: 0 },
  },
]

export default function AllDevices() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B82F6' }} />
          <span className="text-[12px] font-semibold tracking-wider uppercase text-white/30">All Devices</span>
        </div>
        <span className="text-[11px] text-white/30">{DEVICES.length} Devices</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEVICES.map((device, i) => {
          const Icon = device.icon
          return (
            <motion.div
              key={device.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass p-4 relative overflow-hidden cursor-pointer group"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${device.color}15, transparent 60%)` }} />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${device.color}15` }}>
                      <Icon size={16} style={{ color: device.color }} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-white">{device.name}</div>
                      <div className="text-[10px] text-white/30">{device.room}</div>
                    </div>
                  </div>
                  {/* Power toggle */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      device.status ? 'bg-white/[0.08]' : 'bg-white/[0.03]'
                    }`}
                  >
                    <Power size={14} style={{ color: device.status ? device.color : '#64748B' }} />
                  </motion.button>
                </div>

                {/* Control */}
                {device.control.type === 'slider' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-white/30">{device.control.label}</span>
                      <span className="text-[11px] font-semibold text-white/60">{device.control.value}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${device.status ? device.control.value : 0}%`,
                          background: device.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {device.control.type === 'temp' && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
                    <span className="text-[10px] text-white/30">{device.control.label}</span>
                    <div className="flex items-center gap-2">
                      <button className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.06] text-white/40 text-[10px]">−</button>
                      <span className="text-[14px] font-bold text-white">{device.control.value}°C</span>
                      <button className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.06] text-white/40 text-[10px]">+</button>
                    </div>
                  </div>
                )}

                {device.control.type === 'toggle' && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
                    <span className="text-[10px] text-white/30">Power</span>
                    <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${
                      device.status ? '' : 'bg-white/10'
                    }`}
                      style={device.status ? { background: device.color } : {}}>
                      <motion.div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                        animate={{ left: device.status ? '18px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: device.status ? '#22C55E' : '#EF4444' }} />
                  <span className="text-[10px] font-medium"
                    style={{ color: device.status ? '#22C55E' : '#EF4444' }}>
                    {device.status ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
