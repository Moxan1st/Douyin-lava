'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Flame, MapPin, Train, Plane, Bookmark, CheckCircle2, Utensils, Eye, Sparkles, Send } from 'lucide-react'
import { TravelItinerary } from '@/types'
import { MOCK_ITINERARY } from '@/lib/mockData'

interface ChatMsg { role: 'user' | 'ai'; text: string }

interface Props {
  destination: string
  question: string
}

export default function TravelDetail({ destination, question }: Props) {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<TravelItinerary>(MOCK_ITINERARY)
  const [saved, setSaved] = useState(false)
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
        body: JSON.stringify({ scenario: 'travel', topic: destination, userMessage: msg, currentData: itinerary }),
      })
      const data = await res.json()
      if (data.itinerary?.days?.length) setItinerary(data.itinerary)
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.reply ?? '行程已调整' }])
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
      body: JSON.stringify({ scenario: 'travel', topic: destination, phase: 'detail' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.itinerary?.days?.length > 0) {
          setItinerary(data.itinerary)
          setAiGenerated(true)
        }
      })
      .catch(() => {})
  }, [destination])

  const handleSave = () => {
    localStorage.setItem(`lava-plan-${destination}`, JSON.stringify(itinerary))
    setSaved(true)
  }

  return (
    <div className="w-full h-dvh bg-black text-white overflow-y-auto pb-24">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-indigo-950/50 to-black" />

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
            <div className="ml-auto flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-full">
              <Sparkles size={10} className="text-blue-300" />
              <span className="text-blue-300 text-xs">AI定制行程</span>
            </div>
          )}
        </div>

        <div className="relative px-5 pb-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-white/50 text-sm mb-2">你说的——</p>
            <h1 className="text-white text-xl font-bold leading-tight">&ldquo;{question}&rdquo;</h1>
            <p className="text-blue-400 text-sm font-medium mt-3">好，行程帮你备好了。说走就走 👇</p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* 交通 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/8 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-blue-400" />
            <h2 className="text-white font-semibold">怎么去{itinerary.destination}？</h2>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-2">{itinerary.transport.duration}</p>
          <div className="bg-blue-900/30 rounded-xl p-3 border border-blue-800/30 mb-3">
            <p className="text-blue-300 text-xs">💡 {itinerary.transport.tip}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(
              `https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&ts=${encodeURIComponent(itinerary.destination)}`,
              '_blank'
            )}
              className="flex-1 py-2.5 rounded-xl bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium flex items-center justify-center gap-1.5">
              <Train size={15} />查高铁票
            </button>
            <button onClick={() => window.open(
              `https://flights.ctrip.com/online/list/oneway?keyword=${encodeURIComponent(itinerary.destination)}`,
              '_blank'
            )}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium flex items-center justify-center gap-1.5">
              <Plane size={15} />查机票
            </button>
          </div>
        </motion.div>

        {/* 行程 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/8 rounded-2xl p-4 border border-white/10">
          <h2 className="text-white font-semibold mb-4">2天1夜行程</h2>
          <div className="space-y-5">
            {itinerary.days.map((day) => (
              <div key={day.day}>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {day.day}
                </span>
                <div className="space-y-2 pl-1 mt-2">
                  {day.schedule.map((item, si) => (
                    <div key={si} className="flex gap-3">
                      <span className="text-white/40 text-xs mt-0.5 w-8 flex-shrink-0">{item.time}</span>
                      <span className="text-white/85 text-sm leading-snug">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 必去 & 必吃 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3">
          <div className="bg-white/8 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">必去</span>
            </div>
            {itinerary.mustSee.map((s, i) => (
              <p key={i} className="text-white/80 text-sm py-0.5">· {s}</p>
            ))}
          </div>
          <div className="bg-white/8 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Utensils size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">必吃</span>
            </div>
            {itinerary.mustEat.map((e, i) => (
              <p key={i} className="text-white/80 text-sm py-0.5">· {e}</p>
            ))}
          </div>
        </motion.div>

        {/* 存计划 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button onClick={handleSave} disabled={saved}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-400'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/40'
            }`}>
            {saved ? <><CheckCircle2 size={20} />已存好！说走就走时直接用</> : <><Bookmark size={20} />存下这个计划</>}
          </button>
        </motion.div>

        <button onClick={() => router.push('/')}
          className="w-full py-3 rounded-2xl border border-white/15 text-white/50 text-sm">
          继续刷
        </button>

        {/* 对话记录 */}
        <AnimatePresence>
          {chatMsgs.length > 0 && (
            <div className="space-y-2 mt-2">
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
      </div>

      {/* 固定底部输入栏 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/8 px-4 py-3">
        <div className="flex gap-2 items-center">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="改出发日期、天数？告诉我…"
            className="flex-1 bg-white/6 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 outline-none"
          />
          <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
            className="w-10 h-10 rounded-xl bg-indigo-500/80 flex items-center justify-center disabled:opacity-30">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
