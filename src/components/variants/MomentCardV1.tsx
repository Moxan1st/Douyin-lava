'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// 方案一：极简炸裂 Brutal Minimal
export default function MomentCardV1({ onDismiss }: { onDismiss: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => router.push('/detail/food?topic=贵州酸汤鱼&question=酸汤鱼旁边就有'), 500)
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30">
      <div className="absolute bottom-full inset-x-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
      <div className="relative bg-neutral-950 rounded-t-3xl overflow-hidden">
        {/* 顶部1px光带代替光晕 */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-white/40" />
        </div>

        <div className="px-6 pt-4 pb-8">
          {/* 品牌标识：细线+文字 */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-0.5 h-5 bg-orange-500" />
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">Lava</span>
          </div>

          {/* 超大主文案 */}
          <p className="text-white text-4xl font-black leading-none tracking-tight mb-8">
            酸汤鱼<br />旁边就有
          </p>

          <AnimatePresence mode="wait">
            {!confirmed ? (
              <motion.div key="btns" className="flex flex-col gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl border border-white text-white font-black text-base tracking-wide bg-transparent hover:bg-white hover:text-black transition-colors">
                  爽撮一顿！
                </button>
                <button onClick={onDismiss}
                  className="w-full py-3 rounded-2xl border border-white/25 text-white/50 text-sm">
                  再刷刷
                </button>
              </motion.div>
            ) : (
              <motion.div key="ok" className="py-4 flex justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
