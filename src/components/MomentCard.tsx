'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MOCK_RESTAURANTS, MOCK_ITINERARY } from '@/lib/mockData'
import { MomentCardData, ScenarioType } from '@/types'
import { ChevronRight, Train, Phone } from 'lucide-react'

interface Props {
  data: MomentCardData
  onDismiss: () => void
}

const ACCENT: Record<ScenarioType, { hero: string; badge: string; btn: string }> = {
  food:         { hero: 'linear-gradient(145deg,#c94b00,#f97316 45%,#fbbf24)', badge: 'NEAR YOU',  btn: '#f97316' },
  travel:       { hero: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', badge: 'TRAVEL',    btn: '#6366f1' },
  happy:        { hero: 'linear-gradient(145deg,#047857,#10b981 45%,#34d399)', badge: 'MOOD',      btn: '#10b981' },
  depressed_1:  { hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6' },
  depressed_2:  { hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6' },
  melancholy_1: { hero: 'linear-gradient(145deg,#5b21b6,#7c3aed 45%,#a78bfa)', badge: 'OUTSIDE',  btn: '#7c3aed' },
  melancholy_2: { hero: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', badge: 'TRAVEL',   btn: '#6366f1' },
}

const HOTLINES = [
  { name: '全国心理援助热线', number: '400-161-9995' },
  { name: '北京心理危机研究', number: '010-82951332' },
  { name: '生命热线',         number: '400-821-1215' },
]

function Preview({ scenario }: { scenario: ScenarioType }) {
  const rowCls = 'flex items-start justify-between py-2.5 border-b border-white/8 last:border-0'

  if (scenario === 'food') return (
    <div>
      {MOCK_RESTAURANTS.slice(0, 2).map((r, i) => (
        <div key={i} className={rowCls}>
          <div>
            <p className="text-white/88 text-sm font-semibold">{r.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{r.specialty.split('、')[0]}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 ml-3 flex-shrink-0">
            <span className="text-amber-400 text-xs font-semibold">★ {r.rating}</span>
            <span className="text-white/35 text-xs">{r.distance}</span>
          </div>
        </div>
      ))}
      <button className="flex items-center gap-1 pt-2.5 text-white/50 text-sm font-medium">
        查看完整餐厅 <ChevronRight size={14} />
      </button>
    </div>
  )

  if (scenario === 'travel' || scenario === 'melancholy_2') return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Train size={12} className="text-white/40 flex-shrink-0" />
        <span className="text-white/50 text-xs font-medium">深圳北 → 贵阳北</span>
      </div>
      <div className="space-y-1.5 mb-3">
        {(MOCK_ITINERARY.transport.departures ?? []).map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-indigo-300 font-bold w-14 flex-shrink-0">{d.train}</span>
            <span className="text-white/82 font-medium">{d.depart} → {d.arrive}</span>
            <span className="text-white/35 ml-auto text-xs">{d.duration}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8 pt-2.5 space-y-1.5 mb-2">
        {MOCK_ITINERARY.days[0].schedule.slice(0, 2).map((s, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-white/35 text-xs w-8 flex-shrink-0">{s.time}</span>
            <span className="text-white/60 text-xs leading-snug">{s.activity}</span>
          </div>
        ))}
      </div>
      <button className="flex items-center gap-1 text-white/50 text-sm font-medium">
        查看完整行程 <ChevronRight size={14} />
      </button>
    </div>
  )

  if (scenario === 'happy') return (
    <p className="text-white/70 text-sm leading-relaxed">
      记录这一刻的心情，以后翻出来还是会笑。
    </p>
  )

  if (scenario === 'depressed_1') return (
    <p className="text-white/70 text-sm leading-relaxed">
      情绪是有重量的，允许自己感受它。<br />
      <span className="text-white/40 text-xs">你不需要假装没事，也不需要马上好起来。</span>
    </p>
  )

  if (scenario === 'depressed_2') return (
    <div>
      {HOTLINES.map((h, i) => (
        <div key={i} className={rowCls}>
          <span className="text-white/70 text-sm">{h.name}</span>
          <a href={`tel:${h.number}`} className="text-blue-300 text-sm font-mono flex items-center gap-1 ml-3 flex-shrink-0">
            <Phone size={11} />{h.number}
          </a>
        </div>
      ))}
      <p className="text-white/25 text-xs pt-2">免费拨打 · 7×24小时</p>
    </div>
  )

  if (scenario === 'melancholy_1') return (
    <p className="text-white/70 text-sm leading-relaxed">
      找个公园，走走，不用想任何事。<br />
      <span className="text-white/40 text-xs">附近公园 ›</span>
    </p>
  )

  return null
}

function useConfirmAction(scenario: ScenarioType, question: string, onDismiss: () => void) {
  const router = useRouter()
  return () => {
    switch (scenario) {
      case 'food':
        router.push(`/detail/food?topic=${encodeURIComponent('贵州酸汤鱼')}&question=${encodeURIComponent(question)}`)
        break
      case 'travel':
      case 'melancholy_2':
        router.push(`/detail/travel?topic=${encodeURIComponent('贵州凯里')}&question=${encodeURIComponent(question)}`)
        break
      case 'happy':
        localStorage.setItem(`lava-mood-${Date.now()}`, JSON.stringify({ mood: 'happy', ts: Date.now() }))
        onDismiss()
        break
      case 'melancholy_1':
        window.open('https://uri.amap.com/search?keyword=公园&city=深圳', '_blank')
        onDismiss()
        break
      default:
        onDismiss()
    }
  }
}

export default function MomentCard({ data, onDismiss }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const ac = ACCENT[data.scenario]
  const confirmAction = useConfirmAction(data.scenario, data.question, onDismiss)

  const handleConfirm = () => {
    const needsNav = ['food', 'travel', 'melancholy_1', 'melancholy_2'].includes(data.scenario)
    if (needsNav) setConfirmed(true)
    setTimeout(confirmAction, needsNav ? 480 : 0)
  }

  return (
    <div className="w-[92vw] max-w-[420px] rounded-[24px] overflow-hidden select-none border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      {/* Hero */}
      <div className="px-5 pt-5 pb-5" style={{ background: ac.hero }}>
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/85" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-white/85">
            {ac.badge}
          </span>
        </div>
        <p className="text-white text-[26px] font-extrabold leading-[1.2] tracking-tight"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
          {data.question}
        </p>
      </div>

      {/* Body — 毛玻璃暗底 */}
      <div className="px-5 pt-4 pb-4" style={{ background: 'rgba(10,12,24,0.78)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
        <Preview scenario={data.scenario} />

        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div key="btns" className="flex gap-2.5 mt-4"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <motion.button
                onClick={handleConfirm}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] py-3.5 rounded-2xl text-[15px] font-bold text-white"
                style={{ background: ac.btn }}
              >
                {data.confirmLabel}
              </motion.button>
              <button onClick={onDismiss}
                className="flex-1 py-3.5 rounded-2xl text-sm text-white/35 bg-white/8">
                {data.dismissLabel}
              </button>
            </motion.div>
          ) : (
            <motion.div key="loading" className="flex items-center justify-center gap-1.5 py-3.5 mt-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ac.btn }}
                  animate={{ scale: [1, 1.6, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center pt-4 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  )
}
