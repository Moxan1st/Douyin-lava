'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import VideoCard from './VideoCard'
import MomentCard from './MomentCard'
import { VideoCardData, MomentCardData } from '@/types'
import { FOOD_VIDEOS, TRAVEL_VIDEOS } from '@/lib/mockData'

const ALL_VIDEOS: VideoCardData[] = [
  FOOD_VIDEOS[0],
  TRAVEL_VIDEOS[0],
  FOOD_VIDEOS[1],
  TRAVEL_VIDEOS[1],
  FOOD_VIDEOS[2],   // index 4 → 触发美食灵魂拷问
  TRAVEL_VIDEOS[2],
  TRAVEL_VIDEOS[3], // index 6 → 触发旅游灵魂拷问
]

const FOOD_TRIGGER = 4
const TRAVEL_TRIGGER = 6

const FALLBACK = {
  food: '酸汤鱼旁边就有',
  travel: '凯里等你多久了',
}

export default function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState(FALLBACK)
  const [foodDismissed, setFoodDismissed] = useState(false)
  const [travelDismissed, setTravelDismissed] = useState(false)
  const [muted, setMuted] = useState(true)
  // 等视频开始播放再弹卡片
  const [readyIndex, setReadyIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // index 到触发点时，等 playing 事件或最多 1.2s 后弹卡片
  useEffect(() => {
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
    const isTrigger =
      (currentIndex === FOOD_TRIGGER   && !foodDismissed) ||
      (currentIndex === TRAVEL_TRIGGER && !travelDismissed)
    if (isTrigger) {
      readyTimerRef.current = setTimeout(() => setReadyIndex(currentIndex), 1200)
    }
    return () => { if (readyTimerRef.current) clearTimeout(readyTimerRef.current) }
  }, [currentIndex, foodDismissed, travelDismissed])

  // 卡片可见性：滑走时隐藏，滑回来时恢复；只有 dismiss/confirm 才永久关闭
  const showFood   = currentIndex === FOOD_TRIGGER   && !foodDismissed   && readyIndex >= FOOD_TRIGGER
  const showTravel = currentIndex === TRAVEL_TRIGGER && !travelDismissed && readyIndex >= TRAVEL_TRIGGER

  const activeMoment: MomentCardData | null = showFood
    ? { id: 'food',   scenario: 'food',   question: questions.food,   confirmLabel: '爽撮一顿！', dismissLabel: '再刷刷' }
    : showTravel
    ? { id: 'travel', scenario: 'travel', question: questions.travel, confirmLabel: '说走就走！', dismissLabel: '以后再说' }
    : null

  // 预加载灵魂拷问文案
  useEffect(() => {
    Promise.all([
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'food', topic: '贵州酸汤鱼', phase: 'question' }),
      }).then(r => r.json()).catch(() => ({ question: FALLBACK.food })),
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'travel', topic: '贵州凯里', phase: 'question' }),
      }).then(r => r.json()).catch(() => ({ question: FALLBACK.travel })),
    ]).then(([f, t]) => {
      setQuestions({
        food:   f.question ?? FALLBACK.food,
        travel: t.question ?? FALLBACK.travel,
      })
    })
  }, [])

  // IntersectionObserver 检测当前可见视频
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-index') ?? '0')
            setCurrentIndex(idx)
          }
        })
      },
      { root: containerRef.current, threshold: 0.6 }
    )
    itemRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const setItemRef = useCallback((el: HTMLDivElement | null, index: number) => {
    itemRefs.current[index] = el
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* 视频滚动列表（不锁定，可以自由滑动） */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {ALL_VIDEOS.map((video, index) => (
          <div
            key={video.id}
            ref={el => setItemRef(el, index)}
            data-index={index}
            className="w-full flex-shrink-0"
            style={{ height: '100dvh', scrollSnapAlign: 'start' }}
          >
            <VideoCard
              data={video}
              isActive={index === currentIndex}
              muted={muted}
              onVideoReady={
                ((index === FOOD_TRIGGER && !foodDismissed) || (index === TRAVEL_TRIGGER && !travelDismissed))
                  ? () => {
                      if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
                      setReadyIndex(index)
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* Logo + 静音按钮 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Lava" className="w-8 h-8 object-contain drop-shadow-lg" />
          <span className="text-white font-bold text-base tracking-wide drop-shadow">LAVA</span>
        </div>
        <button
          onClick={() => setMuted(m => !m)}
          className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
        </button>
      </div>

      {/* MomentCard — 仅 dismiss 按钮或向上拖拽才永久关闭 */}
      <AnimatePresence>
        {activeMoment && (
          <motion.div
            key={activeMoment.id}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* 背景遮罩：仅视觉效果，不拦截滚动 */}
            <div className="fixed inset-0 bg-black/45 pointer-events-none" />

            {/* 卡片：pointer-events-auto，可拖拽向上 dismiss */}
            <motion.div
              className="relative z-10 pointer-events-auto"
              initial={{ y: 120, scale: 0.88, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -160, scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              drag="y"
              dragConstraints={{ bottom: 0 }}
              dragElastic={{ top: 0.6, bottom: 0.05 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y < -80 || info.velocity.y < -400) {
                  if (activeMoment.scenario === 'food') setFoodDismissed(true)
                  else setTravelDismissed(true)
                }
              }}
              style={{ cursor: 'grab' }}
              whileDrag={{ cursor: 'grabbing' }}
            >
              <MomentCard
                data={activeMoment}
                onDismiss={() => {
                  if (activeMoment.scenario === 'food') setFoodDismissed(true)
                  else setTravelDismissed(true)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
