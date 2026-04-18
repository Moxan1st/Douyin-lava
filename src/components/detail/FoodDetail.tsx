'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Navigation, Flame, Sparkles, ShoppingBag, Send } from 'lucide-react'
import { Restaurant } from '@/types'
import { MOCK_RESTAURANTS } from '@/lib/mockData'

interface ChatMsg { role: 'user' | 'ai'; text: string }

interface Props {
  topic: string
  question: string
}

function openDelivery(platform: 'meituan' | 'eleme', keyword: string) {
  const q = encodeURIComponent(keyword)
  if (platform === 'meituan') {
    // 尝试唤起美团App，失败则跳转H5
    const appLink = `imeituan://waimai/search?q=${q}`
    const h5Link = `https://h5.waimai.meituan.com/waimai/mmc/search?q=${q}`
    const start = Date.now()
    window.location.href = appLink
    setTimeout(() => {
      if (Date.now() - start < 1500) window.open(h5Link, '_blank')
    }, 800)
  } else {
    const appLink = `eleme://search?keyword=${q}`
    const h5Link = `https://h5.ele.me/webapp/#/poi/search?keyword=${q}`
    const start = Date.now()
    window.location.href = appLink
    setTimeout(() => {
      if (Date.now() - start < 1500) window.open(h5Link, '_blank')
    }, 800)
  }
}

export default function FoodDetail({ topic, question }: Props) {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleChat = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'food', topic, userMessage: msg, currentData: restaurants }),
      })
      const data = await res.json()
      if (data.restaurants?.length) setRestaurants(data.restaurants)
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.reply ?? '已更新推荐' }])
    } catch {
      setChatMsgs(prev => [...prev, { role: 'ai', text: '网络问题，稍后再试' }])
    } finally {
      setChatLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  useEffect(() => {
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'food', topic, phase: 'detail' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.restaurants?.length > 0) {
          setRestaurants(data.restaurants)
          setAiGenerated(true)
        }
      })
      .catch(() => {})
  }, [topic])

  const handleNavigate = (restaurant: Restaurant) => {
    window.open(`https://uri.amap.com/search?keyword=${encodeURIComponent(restaurant.name)}&sourceApplication=lava`, '_blank')
  }

  return (
    <div className="w-full h-dvh bg-black text-white overflow-y-auto pb-24">
      {/* 顶部 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/80 via-red-950/50 to-black" />
        <div className="relative px-4 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Lava</span>
          </div>
          {aiGenerated && (
            <div className="ml-auto flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
              <Sparkles size={10} className="text-orange-300" />
              <span className="text-orange-300 text-xs">AI生成</span>
            </div>
          )}
        </div>
        <div className="relative px-5 pb-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-white/60 text-sm mb-2">你刚才说——</p>
            <h1 className="text-white text-2xl font-bold leading-tight">&ldquo;{question}&rdquo;</h1>
            <p className="text-orange-400 text-sm font-medium mt-3">附近最好的{topic} 👇</p>
          </motion.div>
        </div>
      </div>

      {/* 外卖入口 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-4 mb-4 p-4 bg-white/8 rounded-2xl border border-white/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={15} className="text-orange-400" />
          <span className="text-white text-sm font-semibold">懒得出门？叫外卖</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openDelivery('meituan', topic)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300"
          >
            🛵 美团外卖
          </button>
          <button
            onClick={() => openDelivery('eleme', topic)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-sky-500/20 border border-sky-500/30 text-sky-300"
          >
            🛵 饿了么
          </button>
        </div>
      </motion.div>

      {/* 餐厅列表 */}
      <div className="px-4 pb-8 space-y-3">
        {restaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            className="bg-white/8 rounded-2xl border border-white/10"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                    index === 1 ? 'bg-white/15 text-white/80' : 'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-sm">
                  <MapPin size={13} className="text-white/40" />
                  <span>{restaurant.distance}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-3">
                <p className="text-white/50 text-xs mb-1">招牌菜</p>
                <p className="text-white/90 text-sm">{restaurant.specialty}</p>
              </div>

              <p className="text-white/35 text-xs mb-3 flex items-center gap-1">
                <MapPin size={11} />{restaurant.address}
              </p>

              <button
                onClick={() => handleNavigate(restaurant)}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                  index === 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/30'
                    : 'bg-white/10 text-white/80 border border-white/15'
                }`}
              >
                <Navigation size={15} />
                {index === 0 ? '立刻出发！' : '前往导航'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <button onClick={() => router.push('/')}
          className="w-full py-3 rounded-xl border border-white/15 text-white/50 text-sm">
          继续刷
        </button>
      </div>

      {/* 对话记录 */}
      <AnimatePresence>
        {chatMsgs.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            {chatMsgs.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-snug ${
                  msg.role === 'user'
                    ? 'bg-white text-black font-medium'
                    : 'bg-white/10 text-white/80 border border-white/8'
                }`}>{msg.text}</div>
              </motion.div>
            ))}
            {chatLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/10 border border-white/8 px-4 py-2 rounded-2xl flex gap-1 items-center">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />

      {/* 固定底部输入栏 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/8 px-4 py-3">
        <div className="flex gap-2 items-center">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="不吃辣？换个口味？告诉我…"
            className="flex-1 bg-white/6 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 outline-none"
          />
          <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
            className="w-10 h-10 rounded-xl bg-orange-500/80 flex items-center justify-center disabled:opacity-30">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
