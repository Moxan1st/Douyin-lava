'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoCardData } from '@/types'
import { Heart, MessageCircle, Share2, Bookmark, Music2, Pause, Play } from 'lucide-react'

const SCENARIO_GRADIENTS: Record<string, string> = {
  food: 'from-red-950 via-orange-950 to-black',
  travel: 'from-blue-950 via-indigo-950 to-black',
}

interface Props {
  data: VideoCardData
  isActive: boolean
  muted: boolean
  onVideoReady?: () => void
}

export default function VideoCard({ data, isActive, muted, onVideoReady }: Props) {
  const [liked, setLiked] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [showPauseIcon, setShowPauseIcon] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pauseIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive && !userPaused) {
      const handlePlaying = () => onVideoReady?.()
      v.addEventListener('playing', handlePlaying, { once: true })
      v.play().catch(() => {})
      return () => v.removeEventListener('playing', handlePlaying)
    } else {
      v.pause()
    }
  }, [isActive, userPaused, onVideoReady])

  const handleVideoClick = () => {
    if (!isActive) return
    const next = !userPaused
    setUserPaused(next)
    setShowPauseIcon(true)
    if (pauseIconTimer.current) clearTimeout(pauseIconTimer.current)
    pauseIconTimer.current = setTimeout(() => setShowPauseIcon(false), 800)
  }

  // 同步全局静音状态
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" onClick={handleVideoClick}>
      {!videoError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={`/videos/${data.videoFile}`}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${SCENARIO_GRADIENTS[data.scenario] ?? 'from-gray-900 to-black'}`} />
      )}

      {/* 暂停/播放提示图标 */}
      {showPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            {userPaused
              ? <Pause size={28} className="text-white" />
              : <Play size={28} className="text-white ml-1" />
            }
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

      {/* 右侧操作栏 */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-red-500 border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {data.author.replace('@', '').slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs leading-none">+</span>
          </div>
        </div>
        <button onClick={() => setLiked(l => !l)} className="flex flex-col items-center gap-1">
          <Heart size={30} className={`transition-all duration-200 ${liked ? 'fill-red-500 text-red-500 scale-125' : 'text-white'}`} />
          <span className="text-white text-xs">{data.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle size={30} className="text-white" />
          <span className="text-white text-xs">{data.comments}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark size={28} className="text-white" />
          <span className="text-white text-xs">收藏</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 size={28} className="text-white" />
          <span className="text-white text-xs">分享</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center animate-spin-slow">
          <Music2 size={16} className="text-white" />
        </div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-14 p-4 z-10" onClick={e => e.stopPropagation()}>
        <p className="text-white text-sm font-semibold mb-1">{data.author}</p>
        <p className="text-white/90 text-sm leading-snug line-clamp-2">{data.title}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Music2 size={12} className="text-white/70" />
          <span className="text-white/70 text-xs">原声 · {data.author.replace('@', '')}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10">
        <div className="h-full bg-white/60 w-1/3 animate-progress" />
      </div>
    </div>
  )
}
