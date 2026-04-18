'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MomentCardV1 from '@/components/variants/MomentCardV1'
import MomentCardV2 from '@/components/variants/MomentCardV2'
import MomentCardV3 from '@/components/variants/MomentCardV3'

const VARIANTS = [
  { id: 1, label: '极简炸裂', sub: 'Brutal' },
  { id: 2, label: '毛玻璃', sub: 'Frosted' },
  { id: 3, label: '动效爆发', sub: 'Kinetic' },
]

export default function PreviewPage() {
  const [active, setActive] = useState(1)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const isDismissed = dismissed.has(active)

  const handleDismiss = () => setDismissed(prev => new Set([...prev, active]))
  const handleSwitch = (id: number) => {
    setActive(id)
    // 切换方案时重置该方案的dismiss状态，让卡片重新出现
    setDismissed(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  return (
    <div className="w-full h-dvh bg-black relative overflow-hidden">
      {/* 视频背景 */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/food1.mp4"
        autoPlay loop muted playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* 顶部方案切换器 */}
      <div className="absolute top-0 inset-x-0 z-50 pt-12 px-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-xs">方案预览 — 点击切换</span>
          <a href="/" className="text-white/40 text-xs underline">← 返回</a>
        </div>
        <div className="flex gap-2">
          {VARIANTS.map(v => (
            <button
              key={v.id}
              onClick={() => handleSwitch(v.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                active === v.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white/60 border border-white/15'
              }`}
            >
              <div>{v.label}</div>
              <div className={`text-xs font-normal opacity-70`}>{v.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MomentCard 浮层 */}
      <AnimatePresence mode="wait">
        {!isDismissed && (
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {active === 1 && <MomentCardV1 onDismiss={handleDismiss} />}
            {active === 2 && <MomentCardV2 onDismiss={handleDismiss} />}
            {active === 3 && <MomentCardV3 onDismiss={handleDismiss} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 卡片被收起时的提示 */}
      {isDismissed && (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-40">
          <button
            onClick={() => handleDismiss && setDismissed(prev => { const s = new Set(prev); s.delete(active); return s })}
            className="px-6 py-3 rounded-full bg-white/15 border border-white/20 text-white text-sm backdrop-blur-sm"
          >
            重新显示卡片
          </button>
        </div>
      )}
    </div>
  )
}
