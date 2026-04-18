'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'

// 方案二：毛玻璃诱惑 Frosted Glass
export default function MomentCardV2({ onDismiss }: { onDismiss: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => router.push('/detail/food?topic=贵州酸汤鱼&question=酸汤鱼旁边就有'), 500)
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30">
      {/* 更轻的顶部遮罩，视频依然清晰 */}
      <div className="absolute bottom-full inset-x-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* 毛玻璃卡片主体 */}
      <div
        className="relative rounded-t-3xl overflow-hidden border-t border-x border-white/15"
        style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(0,0,0,0.45)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-5 pt-3 pb-8">
          <div className="flex items-center gap-1.5 mb-4">
            <Flame size={13} className="text-orange-400" />
            <span className="text-orange-400/80 text-xs font-medium">Lava · 照出你的欲望</span>
          </div>

          {/* 文案区：背景加淡淡玻璃感 */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-white text-2xl font-bold leading-snug"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              酸汤鱼旁边就有
            </p>
            <p className="text-white/40 text-xs mt-1.5">基于你刚刚的浏览行为</p>
          </div>

          <AnimatePresence mode="wait">
            {!confirmed ? (
              <motion.div key="btns" className="flex flex-col gap-2.5"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <motion.button
                  onClick={handleConfirm}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.9), rgba(239,68,68,0.9))',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 8px 32px rgba(249,115,22,0.25)'
                  }}>
                  爽撮一顿！
                </motion.button>
                <button onClick={onDismiss}
                  className="w-full py-3 rounded-2xl text-white/50 text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  再刷刷
                </button>
              </motion.div>
            ) : (
              <motion.div key="ok" className="flex justify-center gap-2 py-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} className="w-2 h-2 bg-orange-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: d }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
