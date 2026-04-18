'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'

// 方案三：动效爆发 Kinetic Explosion
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 26 } },
  },
}

export default function MomentCardV3({ onDismiss }: { onDismiss: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const [ripple, setRipple] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    setRipple(true)
    setTimeout(() => setRipple(false), 600)
    setConfirmed(true)
    setTimeout(() => router.push('/detail/food?topic=贵州酸汤鱼&question=酸汤鱼旁边就有'), 700)
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30">
      <div className="absolute bottom-full inset-x-0 h-48 bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />

      <div className="relative bg-gradient-to-b from-zinc-900 to-black rounded-t-3xl overflow-hidden">
        {/* 顶部流动光条 */}
        <motion.div
          className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #f97316, #ef4444, #f97316, transparent)' }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* 背景装饰光晕（脉冲） */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <motion.div
          className="px-5 pt-3 pb-8"
          variants={stagger.container}
          initial="initial"
          animate="animate"
        >
          {/* 品牌 */}
          <motion.div variants={stagger.item} className="flex items-center gap-1.5 mb-5">
            <Flame size={14} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold">Lava · 照出你的欲望</span>
          </motion.div>

          {/* 主文案——逐词出现 */}
          <motion.div variants={stagger.item} className="mb-2">
            <p className="text-white/40 text-sm mb-1">刚刚发现——</p>
            <div className="flex flex-wrap gap-x-2 items-baseline">
              {['酸汤鱼', '旁边', '就有'].map((word, i) => (
                <motion.span
                  key={i}
                  className="text-white font-black leading-tight"
                  style={{ fontSize: i === 0 ? '2rem' : i === 1 ? '1.6rem' : '1.4rem' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={stagger.item} className="mb-6">
            <p className="text-white/35 text-xs">基于你刚刚的刷视频行为</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!confirmed ? (
              <motion.div key="btns" className="flex flex-col gap-2.5"
                variants={stagger.item}>
                {/* 脉冲按钮 */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                    animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.button
                    onClick={handleConfirm}
                    whileTap={{ scale: 0.96 }}
                    className="relative w-full py-4 rounded-2xl font-black text-base text-white overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                  >
                    {/* 涟漪 */}
                    <AnimatePresence>
                      {ripple && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-white/30"
                          initial={{ scale: 0, opacity: 0.8 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          exit={{}}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                    </AnimatePresence>
                    爽撮一顿！
                  </motion.button>
                </div>
                <motion.button onClick={onDismiss} whileHover={{ borderColor: 'rgba(255,255,255,0.4)' }}
                  className="w-full py-3 rounded-2xl border border-white/15 text-white/50 text-sm transition-colors">
                  再刷刷
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="ok" className="flex justify-center py-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
