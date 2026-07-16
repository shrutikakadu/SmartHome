import { motion } from 'motion/react'
import { Thermometer, Lightbulb, Fan, Tv, Speaker, AirVent, Lamp, Snowflake, Microwave, Refrigerator, DoorOpen, Camera, Lock } from 'lucide-react'

const ROOMS = [
  {
    name: 'Living Room',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.03))',
    border: 'rgba(139,92,246,0.2)',
    temp: '24°C',
    devices: [
      { icon: Lightbulb, name: 'Light', status: true },
      { icon: Fan, name: 'Fan', status: true },
      { icon: Tv, name: 'TV', status: false },
      { icon: Speaker, name: 'Speaker', status: true },
    ],
  },
  {
    name: 'Bedroom',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.03))',
    border: 'rgba(59,130,246,0.2)',
    temp: '22°C',
    devices: [
      { icon: Snowflake, name: 'AC', status: true },
      { icon: Lamp, name: 'Lamp', status: true },
      { icon: Thermometer, name: 'Thermostat', status: false },
    ],
  },
  {
    name: 'Kitchen',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.03))',
    border: 'rgba(34,197,94,0.2)',
    temp: '26°C',
    devices: [
      { icon: Lightbulb, name: 'Lights', status: true },
      { icon: Refrigerator, name: 'Fridge', status: true },
      { icon: Microwave, name: 'Microwave', status: false },
    ],
  },
  {
    name: 'Garage',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.03))',
    border: 'rgba(245,158,11,0.2)',
    temp: '28°C',
    devices: [
      { icon: DoorOpen, name: 'Door', status: true },
      { icon: Camera, name: 'Camera', status: true },
      { icon: Lock, name: 'Lock', status: true },
    ],
  },
]

function DeviceToggle({ device, roomColor }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <device.icon size={13} style={{ color: device.status ? roomColor : '#64748B' }} />
        <span className={`text-[11px] font-medium ${device.status ? 'text-white/70' : 'text-white/30'}`}>
          {device.name}
        </span>
      </div>
      <div className={`w-7 h-4 rounded-full relative cursor-pointer transition-all duration-300 ${
        device.status ? '' : 'bg-white/10'
      }`}
        style={device.status ? { background: roomColor } : {}}>
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
          animate={{ left: device.status ? '14px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  )
}

export default function RoomOverview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
          <span className="text-[12px] font-semibold tracking-wider uppercase text-white/30">Room Overview</span>
        </div>
        <span className="text-[11px] text-white/30">4 Rooms</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROOMS.map((room, i) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl border cursor-pointer transition-all duration-300"
            style={{
              background: room.gradient,
              borderColor: room.border,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: room.color }} />
                <span className="text-[13px] font-semibold text-white">{room.name}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: `${room.color}15` }}>
                <Thermometer size={10} style={{ color: room.color }} />
                <span className="text-[10px] font-semibold" style={{ color: room.color }}>{room.temp}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              {room.devices.map((device) => (
                <DeviceToggle key={device.name} device={device} roomColor={room.color} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: `${room.color}15` }}>
              <span className="text-[10px] text-white/30">
                {room.devices.filter(d => d.status).length}/{room.devices.length} Active
              </span>
              <div className="flex -space-x-1">
                {room.devices.map((d, j) => (
                  <div key={j} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: d.status ? room.color : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
