'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { MOCK_RESTAURANTS, MOCK_ITINERARY } from '@/lib/mockData'

// ── Card scenario data ────────────────────────────────────────────────────────
const CARDS = [
  { scenario: 'food',        hero: 'linear-gradient(145deg,#c94b00,#f97316 45%,#fbbf24)', badge: 'NEAR YOU',  btn: '#f97316', question: '你是不是很想吃贵州酸汤鱼了？', confirm: '爽撮一顿！',  dismiss: '再刷刷',    hasDetail: true  },
  { scenario: 'travel',      hero: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', badge: 'TRAVEL',    btn: '#6366f1', question: '贵州凯里等你很久了。',        confirm: '说走就走！', dismiss: '以后再说',  hasDetail: true  },
  { scenario: 'happy',       hero: 'linear-gradient(145deg,#047857,#10b981 45%,#34d399)', badge: 'MOOD',      btn: '#10b981', question: '今天挺开心的嘛？',            confirm: '记下来',    dismiss: '继续刷',   hasDetail: false },
  { scenario: 'depressed_1', hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6', question: '最近有点累了吧？',            confirm: '谢谢',      dismiss: '没事继续刷', hasDetail: false },
  { scenario: 'depressed_2', hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6', question: '你不是一个人。',              confirm: '知道了',    dismiss: '我没事',   hasDetail: true  },
  { scenario: 'melancholy_1',hero: 'linear-gradient(145deg,#5b21b6,#7c3aed 45%,#a78bfa)', badge: 'OUTSIDE',  btn: '#7c3aed', question: '出去透透气吧。',              confirm: '去走走',    dismiss: '待会再说', hasDetail: true  },
]

// ── Card preview (1st level body) ────────────────────────────────────────────
function CardPreview({ s }: { s: string }) {
  const rowS: React.CSSProperties = { display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }
  const subS: React.CSSProperties = { color:'rgba(255,255,255,0.38)', marginTop:2, fontSize:11 }
  if (s === 'food') return (
    <div style={{ fontSize:12 }}>
      {MOCK_RESTAURANTS.slice(0,2).map(r => (
        <div key={r.name} style={rowS}>
          <div><div style={{ color:'rgba(255,255,255,0.85)', fontWeight:600 }}>{r.name}</div><div style={subS}>{r.specialty.split('、')[0]}</div></div>
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}><div style={{ color:'#fbbf24', fontWeight:600 }}>★ {r.rating}</div><div style={subS}>{r.distance}</div></div>
        </div>
      ))}
      <div style={{ color:'rgba(255,255,255,0.35)', paddingTop:7, fontSize:11 }}>查看完整餐厅 ›</div>
    </div>
  )
  if (s === 'travel') return (
    <div style={{ fontSize:12 }}>
      <div style={{ color:'rgba(255,255,255,0.4)', marginBottom:5, fontSize:11 }}>🚄 {MOCK_ITINERARY.transport.duration.split('）')[0]}）</div>
      {(MOCK_ITINERARY.transport.departures ?? []).slice(0,2).map(v => (
        <div key={v.train} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11 }}>
          <span style={{ color:'#818cf8', fontWeight:700, width:42 }}>{v.train}</span>
          <span style={{ color:'rgba(255,255,255,0.78)' }}>{v.depart} → {v.arrive}</span>
          <span style={{ color:'rgba(255,255,255,0.3)' }}>{v.duration}</span>
        </div>
      ))}
    </div>
  )
  if (s === 'happy') return <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.65, margin:0 }}>记录这一刻的心情，以后翻出来还是会笑。</p>
  if (s === 'depressed_1') return <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.65, margin:0 }}>情绪是有重量的，允许自己感受它。<br /><span style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>你不需要假装没事。</span></p>
  if (s === 'depressed_2') return (
    <div style={{ fontSize:11 }}>
      {[{ name:'全国心理援助热线', num:'400-161-9995' },{ name:'生命热线', num:'400-821-1215' }].map(h => (
        <div key={h.name} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color:'rgba(255,255,255,0.6)' }}>{h.name}</span>
          <span style={{ color:'#93c5fd', fontFamily:'monospace' }}>{h.num}</span>
        </div>
      ))}
    </div>
  )
  return <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.65, margin:0 }}>找个公园，走走，不用想任何事。<br /><span style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>附近公园 ›</span></p>
}

// ── Food detail popup content ─────────────────────────────────────────────────
function FoodDetailContent({ question, onClose }: { question: string; onClose: () => void }) {
  return (
    <div style={{ background:'#000', color:'#fff', borderRadius:24 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(to bottom, rgba(124,31,0,0.8), rgba(69,10,10,0.5), #000)', padding:'48px 20px 24px', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, left:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
          <span style={{ fontSize:14, color:'#fb923c' }}>🔥</span>
          <span style={{ color:'#fb923c', fontSize:14, fontWeight:500 }}>Lava</span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, marginBottom:8 }}>你刚才说——</p>
        <h2 style={{ color:'#fff', fontSize:22, fontWeight:700, lineHeight:1.3, margin:'0 0 10px' }}>"{question}"</h2>
        <p style={{ color:'#fb923c', fontSize:14, fontWeight:500, margin:0 }}>附近最好的贵州酸汤鱼 👇</p>
      </div>

      <div style={{ padding:'0 16px 24px' }}>
        {/* Delivery */}
        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <span style={{ color:'#fb923c', fontSize:14 }}>🛍</span>
            <span style={{ color:'#fff', fontSize:14, fontWeight:600 }}>懒得出门？叫外卖</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ flex:1, padding:'11px', borderRadius:12, background:'rgba(245,158,11,0.18)', border:'1px solid rgba(245,158,11,0.28)', color:'#fcd34d', fontSize:14, fontWeight:600, cursor:'pointer' }}>🛵 美团外卖</button>
            <button style={{ flex:1, padding:'11px', borderRadius:12, background:'rgba(14,165,233,0.18)', border:'1px solid rgba(14,165,233,0.28)', color:'#7dd3fc', fontSize:14, fontWeight:600, cursor:'pointer' }}>🛵 饿了么</button>
          </div>
        </div>

        {/* Restaurants */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {MOCK_RESTAURANTS.map((r, i) => (
            <div key={r.name} style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:16 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background: i===0 ? 'linear-gradient(135deg,#f97316,#ef4444)' : i===1 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color: i===0 ? '#fff' : 'rgba(255,255,255,0.7)', flexShrink:0 }}>{i+1}</div>
                  <div>
                    <div style={{ color:'#fff', fontWeight:600, fontSize:16 }}>{r.name}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
                      <span style={{ color:'#facc15', fontSize:13 }}>★</span>
                      <span style={{ color:'#facc15', fontWeight:500, fontSize:13 }}>{r.rating}</span>
                    </div>
                  </div>
                </div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>📍 {r.distance}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px', marginBottom:10 }}>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, margin:'0 0 4px' }}>招牌菜</p>
                <p style={{ color:'rgba(255,255,255,0.88)', fontSize:14, margin:0 }}>{r.specialty}</p>
              </div>
              <p style={{ color:'rgba(255,255,255,0.32)', fontSize:12, margin:'0 0 12px' }}>📍 {r.address}</p>
              <button style={{ width:'100%', padding:'12px', borderRadius:12, fontWeight:600, fontSize:14, border:'none', cursor:'pointer', background: i===0 ? 'linear-gradient(to right,#f97316,#ef4444)' : 'rgba(255,255,255,0.09)', color: i===0 ? '#fff' : 'rgba(255,255,255,0.75)', borderWidth: i===0 ? 0 : 1, borderColor:'rgba(255,255,255,0.13)', borderStyle:'solid' }}>
                {i === 0 ? '立刻出发！' : '前往导航'}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ width:'100%', marginTop:14, padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.13)', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:14, cursor:'pointer' }}>
          继续刷
        </button>
      </div>
    </div>
  )
}

// ── Travel detail popup content ───────────────────────────────────────────────
function TravelDetailContent({ question, onClose }: { question: string; onClose: () => void }) {
  const it = MOCK_ITINERARY
  return (
    <div style={{ background:'#000', color:'#fff', borderRadius:24 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(to bottom, rgba(30,27,75,0.85), rgba(30,27,75,0.45), #000)', padding:'48px 20px 32px', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, left:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
          <span style={{ color:'#fb923c' }}>🔥</span>
          <span style={{ color:'#fb923c', fontSize:14, fontWeight:500 }}>Lava</span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:8 }}>你说的——</p>
        <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, lineHeight:1.3, margin:'0 0 10px' }}>"{question}"</h2>
        <p style={{ color:'#818cf8', fontSize:14, fontWeight:500, margin:0 }}>好，行程帮你备好了。说走就走 👇</p>
      </div>

      <div style={{ padding:'0 16px 24px', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Transport */}
        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <span style={{ color:'#818cf8' }}>📍</span>
            <span style={{ color:'#fff', fontWeight:600, fontSize:14 }}>怎么去{it.destination}？</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.6, marginBottom:10 }}>{it.transport.duration}</p>
          <div style={{ background:'rgba(99,102,241,0.15)', borderRadius:10, padding:'10px 12px', border:'1px solid rgba(99,102,241,0.25)', marginBottom:10 }}>
            <p style={{ color:'#a5b4fc', fontSize:12, margin:0 }}>💡 {it.transport.tip}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ flex:1, padding:'10px', borderRadius:12, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(37,99,235,0.3)', color:'#93c5fd', fontSize:13, fontWeight:500, cursor:'pointer' }}>🚄 查高铁票</button>
            <button style={{ flex:1, padding:'10px', borderRadius:12, background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc', fontSize:13, fontWeight:500, cursor:'pointer' }}>✈️ 查机票</button>
          </div>
        </div>

        {/* Itinerary */}
        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px' }}>
          <h3 style={{ color:'#fff', fontWeight:600, fontSize:14, marginBottom:14 }}>2天1夜行程</h3>
          {it.days.map(day => (
            <div key={day.day} style={{ marginBottom:14 }}>
              <span style={{ background:'linear-gradient(to right,#f97316,#ef4444)', color:'#fff', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>{day.day}</span>
              <div style={{ marginTop:8, paddingLeft:4, display:'flex', flexDirection:'column', gap:6 }}>
                {day.schedule.map((item, si) => (
                  <div key={si} style={{ display:'flex', gap:10 }}>
                    <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12, width:32, flexShrink:0 }}>{item.time}</span>
                    <span style={{ color:'rgba(255,255,255,0.82)', fontSize:13, lineHeight:1.5 }}>{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Must see / Must eat */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'12px 14px' }}>
            <div style={{ color:'#34d399', fontSize:13, fontWeight:500, marginBottom:8 }}>👁 必去</div>
            {it.mustSee.map((s,i) => <p key={i} style={{ color:'rgba(255,255,255,0.78)', fontSize:13, margin:'0 0 3px' }}>· {s}</p>)}
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'12px 14px' }}>
            <div style={{ color:'#facc15', fontSize:13, fontWeight:500, marginBottom:8 }}>🍜 必吃</div>
            {it.mustEat.map((e,i) => <p key={i} style={{ color:'rgba(255,255,255,0.78)', fontSize:13, margin:'0 0 3px' }}>· {e}</p>)}
          </div>
        </div>

        {/* Save plan */}
        <button style={{ width:'100%', padding:'14px', borderRadius:16, background:'linear-gradient(to right,#f97316,#ef4444)', color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer' }}>
          🔖 存下这个计划
        </button>

        <button onClick={onClose} style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.13)', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:14, cursor:'pointer' }}>
          继续刷
        </button>
      </div>
    </div>
  )
}

// ── Hotline popup ─────────────────────────────────────────────────────────────
function HotlineContent({ onClose }: { onClose: () => void }) {
  const hotlines = [{ name:'全国心理援助热线', num:'400-161-9995' },{ name:'北京心理危机研究', num:'010-82951332' },{ name:'生命热线', num:'400-821-1215' }]
  return (
    <div style={{ background:'#000', color:'#fff', borderRadius:24 }}>
      <div style={{ background:'linear-gradient(to bottom, rgba(30,64,175,0.8), rgba(30,64,175,0.4), #000)', padding:'48px 20px 24px', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, left:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, marginBottom:8 }}>你不是一个人</p>
        <h2 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 6px' }}>有人在这里陪你</h2>
        <p style={{ color:'#93c5fd', fontSize:13, margin:0 }}>随时可以拨打，免费 · 7×24小时</p>
      </div>
      <div style={{ padding:'0 16px 24px' }}>
        {hotlines.map(h => (
          <div key={h.name} style={{ background:'rgba(255,255,255,0.06)', borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'rgba(255,255,255,0.72)', fontSize:14 }}>{h.name}</span>
            <a href={`tel:${h.num}`} style={{ color:'#93c5fd', fontFamily:'monospace', fontSize:15, fontWeight:600, textDecoration:'none' }}>{h.num}</a>
          </div>
        ))}
        <button onClick={onClose} style={{ width:'100%', marginTop:4, padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.13)', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:14, cursor:'pointer' }}>关闭</button>
      </div>
    </div>
  )
}

// ── Parks popup ───────────────────────────────────────────────────────────────
function ParksContent({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ background:'#000', color:'#fff', borderRadius:24 }}>
      <div style={{ background:'linear-gradient(to bottom, rgba(91,33,182,0.8), rgba(91,33,182,0.4), #000)', padding:'48px 20px 24px', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, left:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:8 }}>出去透透气吧</p>
        <h2 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 6px' }}>附近的公园 👇</h2>
        <p style={{ color:'#c4b5fd', fontSize:13, margin:0 }}>走走，不用想任何事。</p>
      </div>
      <div style={{ padding:'0 16px 24px' }}>
        {[{ name:'深圳湾公园', dist:'2.1km', tag:'海边步道，视野开阔' },{ name:'荔枝公园', dist:'3.4km', tag:'城中绿洲，适合散心' },{ name:'仙湖植物园', dist:'8km', tag:'山林步道，安静' }].map((p,i) => (
          <div key={p.name} style={{ background:'rgba(255,255,255,0.06)', borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><div style={{ color:'#fff', fontWeight:600, fontSize:15 }}>{p.name}</div><div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:3 }}>{p.tag}</div></div>
            <div style={{ textAlign:'right' }}><div style={{ color:'#a78bfa', fontSize:13 }}>{p.dist}</div><div style={{ color:'rgba(124,58,237,0.8)', fontSize:11, marginTop:2 }}>导航 ›</div></div>
          </div>
        ))}
        <button onClick={onClose} style={{ width:'100%', marginTop:4, padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.13)', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:14, cursor:'pointer' }}>关闭</button>
      </div>
    </div>
  )
}

// ── Fonts (Style A: Syne + Noto Sans SC) ─────────────────────────────────────
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@700;900&display=swap');`
const FA = "'Syne','Noto Sans SC',sans-serif"   // headings / brand
const FB = "'Noto Sans SC',sans-serif"           // body / card text

// ── Detail popup ─────────────────────────────────────────────────────────────
// Positioned relative to the clicked button's DOMRect (viewport coords).
// Appears above the button if space allows, otherwise below.
const CSS_FADE = `@keyframes lavaFadeIn{from{opacity:0}to{opacity:1}}
@keyframes lavaPopIn{from{transform:scale(0.88);opacity:0}to{transform:scale(1);opacity:1}}`

const POPUP_W = 390
const GAP = 8

function DetailPopup({ card, btnRect, onClose }: {
  card: typeof CARDS[0]
  btnRect: DOMRect
  onClose: () => void
}) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(POPUP_W, vw - 16)

  // Horizontal: left-align to button's left edge, clamped inside viewport
  let left = btnRect.left
  if (left + width > vw - GAP) left = vw - width - GAP
  if (left < GAP) left = GAP

  // Vertical: above button if space, else below
  const spaceAbove = btnRect.top - GAP
  const spaceBelow = vh - btnRect.bottom - GAP
  const above = spaceAbove >= Math.min(spaceBelow, 340)
  const maxH = Math.max(above ? spaceAbove : spaceBelow, 200)

  const posStyle: React.CSSProperties = above
    ? { bottom: vh - btnRect.top + GAP, top: 'auto' }
    : { top: btnRect.bottom + GAP,      bottom: 'auto' }

  return (
    <>
      <style>{CSS_FADE}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.55)', animation:'lavaFadeIn 0.2s ease' }} />
      <div style={{
        position:'fixed', left, width, maxHeight: maxH,
        ...posStyle,
        zIndex:9999, borderRadius:20, overflow:'hidden',
        boxShadow:'0 24px 80px rgba(0,0,0,0.8)',
        animation:'lavaPopIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ overflowY:'auto', maxHeight: maxH } as React.CSSProperties}>
          {card.scenario === 'food'         && <FoodDetailContent   question={card.question} onClose={onClose} />}
          {card.scenario === 'travel'       && <TravelDetailContent question={card.question} onClose={onClose} />}
          {card.scenario === 'depressed_2'  && <HotlineContent onClose={onClose} />}
          {card.scenario === 'melancholy_1' && <ParksContent   onClose={onClose} />}
        </div>
      </div>
    </>
  )
}

// ── Mini card ─────────────────────────────────────────────────────────────────
function MiniCard({ card }: { card: typeof CARDS[0] }) {
  const [btnRect, setBtnRect] = useState<DOMRect | null>(null)

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!card.hasDetail) return
    setBtnRect(e.currentTarget.getBoundingClientRect())
  }

  return (
    <>
      <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,0.13)', boxShadow:'0 12px 40px rgba(0,0,0,0.45)' }}>
        <div style={{ background:card.hero, padding:'12px 16px 16px' }}>
          <div style={{ display:'flex', justifyContent:'center', paddingBottom:8 }}><div style={{ width:32, height:3, borderRadius:2, background:'rgba(255,255,255,0.32)' }} /></div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.82)' }} />
            <span style={{ fontFamily:FA, fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.82)' }}>{card.badge}</span>
          </div>
          <p style={{ fontFamily:FB, color:'#fff', fontSize:15, fontWeight:900, lineHeight:1.25, letterSpacing:'-0.01em', margin:0, textShadow:'0 1px 6px rgba(0,0,0,0.2)' }}>{card.question}</p>
        </div>
        <div style={{ padding:'13px 15px 15px', background:'rgba(10,12,24,0.82)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)' }}>
          <CardPreview s={card.scenario} />
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={handleConfirm} style={{ flex:2, padding:'11px 8px', borderRadius:12, fontSize:13, fontWeight:900, fontFamily:FB, border:'none', cursor:card.hasDetail?'pointer':'default', color:'#fff', background:card.btn, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {card.confirm}
            </button>
            <button style={{ flex:1, padding:'11px 8px', borderRadius:12, fontSize:12, fontFamily:FB, border:'none', cursor:'default', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.32)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {card.dismiss}
            </button>
          </div>
        </div>
      </div>
      {btnRect && <DetailPopup card={card} btnRect={btnRect} onClose={() => setBtnRect(null)} />}
    </>
  )
}

// ── Emotion widget ────────────────────────────────────────────────────────────
const BARS = [
  { label:'馋度',   key:'hungry',     value:68, color:'#f97316', t:70 },
  { label:'出走欲', key:'wanderlust', value:42, color:'#6366f1', t:80 },
  { label:'开心',   key:'happy',      value:55, color:'#10b981', t:50 },
  { label:'沮丧',   key:'depressed',  value:28, color:'#3b82f6', t:40 },
  { label:'惆怅',   key:'melancholy', value:15, color:'#8b5cf6', t:44 },
]
function EmotionWidget() {
  return (
    <div style={{ borderRadius:20, background:'rgba(10,12,24,0.92)', border:'1px solid rgba(255,255,255,0.09)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', padding:'14px 16px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="/lava-icon.png" alt="" style={{ width:22, height:22, borderRadius:'50%', objectFit:'cover', filter:'drop-shadow(0 2px 6px rgba(249,115,22,0.5))' }} />
          <span style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:13 }}>Lava React</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ color:'rgba(255,255,255,0.42)', fontSize:11 }}>Lava card</span>
          <div style={{ width:36, height:20, borderRadius:10, background:'linear-gradient(135deg,#f97316,#ef4444)', position:'relative', flexShrink:0 }}>
            <div style={{ position:'absolute', top:2, right:2, width:16, height:16, borderRadius:'50%', background:'#fff' }} />
          </div>
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 10px', marginBottom:12 }}>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>AI 正在看</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontStyle:'italic', lineHeight:1.5 }}>画面有大量食物，馋度临近阈值，预计下一条食物视频触发卡片。</div>
      </div>
      {BARS.map(b => (
        <div key={b.key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, width:40, flexShrink:0 }}>{b.label}</span>
          <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.07)', borderRadius:3, position:'relative', overflow:'visible' }}>
            <div style={{ height:'100%', borderRadius:3, background:b.color, width:`${b.value}%` }} />
            <div style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:`${b.t}%`, width:1.5, height:10, borderRadius:1, background:'rgba(255,255,255,0.28)' }} />
          </div>
          <span style={{ color:'rgba(255,255,255,0.22)', fontSize:10, width:22, textAlign:'right', fontFamily:'monospace' }}>{b.value}</span>
        </div>
      ))}
      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'12px 0' }} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'rgba(255,255,255,0.65)', fontSize:13, fontWeight:500 }}>Mock</span>
        <div style={{ width:36, height:20, borderRadius:10, background:'rgba(255,255,255,0.12)', position:'relative' }}>
          <div style={{ position:'absolute', top:2, left:2, width:16, height:16, borderRadius:'50%', background:'rgba(255,255,255,0.3)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => setScale(window.innerHeight < 940 ? Math.max(0.68, window.innerHeight / 940) : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    // Both columns are h-screen; left scrolls independently
    <div className="flex flex-row w-full h-screen bg-[#0c0f1c]">
      <style>{FONT_IMPORT}</style>

      {/* ── Left column: independent scroll ───────────────────────────────── */}
      <div className="w-[48%] h-full overflow-y-auto scrollbar-hide flex flex-col gap-10 pl-[10%] pr-8 py-14">

        {/* Logo — enlarged, no subtitle */}
        <div className="flex items-center gap-4">
          <img src="/lava-icon.png" alt="Lava" style={{ width:68, height:68, borderRadius:'50%', objectFit:'cover', flexShrink:0, boxShadow:'0 4px 28px rgba(249,115,22,0.55), 0 0 0 1.5px rgba(249,115,22,0.25)' }} />
          <span className="text-white" style={{ fontFamily:FA, fontWeight:900, fontSize:'3rem', letterSpacing:'-0.04em' }}>Lava</span>
        </div>

        {/* Hero slogan + QR code side by side */}
        <div className="flex items-start gap-6">
          {/* Text block */}
          <div className="flex-1 min-w-0">
            <h1 style={{ fontFamily:FA, fontWeight:900, fontSize:'2.3rem', letterSpacing:'-0.03em', lineHeight:1.1, margin:0 }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-300">
                照出你像岩浆一样炽热的所感所想
              </span>
            </h1>
            <p className="text-white/45 mt-4" style={{ fontFamily:FB, fontWeight:700, fontSize:'1rem', letterSpacing:'0.01em', lineHeight:1.7 }}>
              Lava 在你刷视频时悄悄感知情绪，在感受的临界点说出你还没意识到的事实。
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a
                href="https://github.com/Moxan1st/Douyin-lava"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs border border-white/10 hover:border-white/25 rounded-full px-3 py-1.5"
                style={{ fontFamily:FA, fontWeight:800, letterSpacing:'0.04em' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <span className="text-white/20 text-xs" style={{ fontFamily:FB, fontWeight:700 }}>开发者：舒畅 / 长发流浪汉</span>
              <a
                href="http://8.218.184.116/lava-react.zip"
                download
                className="flex items-center gap-1 text-white/35 hover:text-white/60 transition-colors text-xs border border-white/10 hover:border-white/25 rounded-full px-2.5 py-1"
                style={{ fontFamily:FA, fontWeight:800, letterSpacing:'0.04em' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.6 }}><path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1 2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7S5 16.2 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7 1.5 0 2.7 1.2 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5A2.5 2.5 0 0 0 23 13.5 2.5 2.5 0 0 0 20.5 11z"/></svg>
                现可体验 Chrome 扩展 ↓
              </a>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div style={{ padding:8, background:'#fff', borderRadius:12, lineHeight:0 }}>
              <QRCodeSVG value="http://8.218.184.116" size={80} bgColor="#ffffff" fgColor="#0c0f1c" level="M" />
            </div>
            <div style={{ fontFamily:FB, fontWeight:700, fontSize:'0.65rem', color:'rgba(255,255,255,0.25)', textAlign:'center', lineHeight:1.5 }}>
              扫码体验<br />手机全屏 Feed
            </div>
          </div>
        </div>

        {/* Cards */}
        <div>
          <div className="text-white/30 text-[10px] uppercase mb-4" style={{ fontFamily:FA, fontWeight:800, letterSpacing:'0.12em' }}>Lava Card · 点击确认按钮展开二级界面</div>
          <div className="grid grid-cols-2 gap-4">
            {CARDS.map(c => <MiniCard key={c.scenario} card={c} />)}
          </div>
        </div>

        {/* Emotion widget */}
        <div>
          <div className="text-white/30 text-[10px] uppercase mb-4" style={{ fontFamily:FA, fontWeight:800, letterSpacing:'0.12em' }}>情绪感知台 · Lava React 浮窗</div>
          <EmotionWidget />
        </div>

        <div className="pb-2">
          <div className="text-white/20 text-xs">抖音黑客松 · 赛道三 · AI体验：刷到懂你的瞬间</div>
        </div>
      </div>

      {/* ── Right column: fixed height, no scroll ─────────────────────────── */}
      <div className="w-[52%] h-full flex flex-col items-center justify-center gap-4 pr-12">
        {/* Hint above phone */}
        <div style={{ display:'flex', alignItems:'center', gap:8, opacity:0.45 }}>
          <span style={{ fontFamily:"'Syne','Noto Sans SC',sans-serif", fontWeight:800, fontSize:'0.78rem', letterSpacing:'0.06em', color:'#fff' }}>试试向上滑动</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'hintBob 1.6s ease-in-out infinite' }}>
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </div>
        <style>{`@keyframes hintBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>

        <div ref={containerRef} style={{ position:'relative', transformOrigin:'center center', transform:`scale(${scale})`, transition:'transform 0.2s' }}>
          <div style={{ width:393, height:852, borderRadius:54, border:'1.5px solid rgba(255,255,255,0.13)', boxShadow:'0 60px 150px rgba(0,0,0,0.85), 0 0 0 8px #0e0e0e, 0 0 0 9.5px rgba(255,255,255,0.04)', background:'#000', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', width:124, height:35, borderRadius:20, background:'#000', zIndex:10 }} />
            <iframe src="/feed" width={393} height={852} style={{ border:'none', display:'block', borderRadius:54 }} allow="autoplay" title="Lava Feed" />
          </div>
          <div style={{ position:'absolute', right:-3, top:186, width:3, height:76, borderRadius:'0 2px 2px 0', background:'#1a1a1a' }} />
          <div style={{ position:'absolute', left:-3, top:152, width:3, height:34, borderRadius:'2px 0 0 2px', background:'#1a1a1a' }} />
          <div style={{ position:'absolute', left:-3, top:210, width:3, height:66, borderRadius:'2px 0 0 2px', background:'#1a1a1a' }} />
          <div style={{ position:'absolute', left:-3, top:292, width:3, height:66, borderRadius:'2px 0 0 2px', background:'#1a1a1a' }} />
        </div>
      </div>

    </div>
  )
}
