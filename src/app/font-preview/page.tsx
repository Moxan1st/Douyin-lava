'use client'

const GOOGLE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@700;900&family=Bebas+Neue&family=ZCOOL+QingKe+HuangYou&family=Noto+Serif+SC:wght@600;700;900&family=Cormorant+Garamond:wght@600;700&display=swap');
`

const STYLES = [
  {
    id: 'A',
    name: '极简科技',
    desc: 'Syne + Noto Sans SC · 几何无衬线，锋利现代，科技感',
    brand: { fontFamily: "'Syne', 'Noto Sans SC', sans-serif", fontWeight: 900, letterSpacing: '-0.04em', fontSize: '3.2rem' },
    h1:    { fontFamily: "'Syne', 'Noto Sans SC', sans-serif", fontWeight: 900, letterSpacing: '-0.03em', fontSize: '2.4rem', lineHeight: 1.1 },
    body:  { fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em', lineHeight: 1.7 },
    badge: { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '0.12em', fontSize: '0.6rem' },
    card:  { fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: '1rem', lineHeight: 1.25, letterSpacing: '-0.01em' },
    accent: '#f97316',
  },
  {
    id: 'B',
    name: '熔岩手感',
    desc: 'Bebas Neue + ZCOOL QingKe HuangYou · 有机笔触，热烈奔放，年轻潮流',
    brand: { fontFamily: "'Bebas Neue', 'ZCOOL QingKe HuangYou', cursive", fontWeight: 400, letterSpacing: '0.06em', fontSize: '3.6rem' },
    h1:    { fontFamily: "'ZCOOL QingKe HuangYou', cursive", fontWeight: 400, letterSpacing: '0.02em', fontSize: '2.2rem', lineHeight: 1.25 },
    body:  { fontFamily: "'ZCOOL QingKe HuangYou', cursive", fontWeight: 400, fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.8 },
    badge: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.18em', fontSize: '0.65rem' },
    card:  { fontFamily: "'ZCOOL QingKe HuangYou', cursive", fontWeight: 400, fontSize: '1.05rem', lineHeight: 1.3, letterSpacing: '0.02em' },
    accent: '#ef4444',
  },
  {
    id: 'C',
    name: '高定杂志',
    desc: 'Cormorant Garamond + Noto Serif SC · 高对比衬线，优雅克制，高端媒体感',
    brand: { fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif", fontWeight: 700, letterSpacing: '0.08em', fontSize: '3rem' },
    h1:    { fontFamily: "'Noto Serif SC', serif", fontWeight: 900, letterSpacing: '-0.01em', fontSize: '2.1rem', lineHeight: 1.2 },
    body:  { fontFamily: "'Noto Serif SC', serif", fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.02em', lineHeight: 1.85 },
    badge: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: '0.2em', fontSize: '0.62rem' },
    card:  { fontFamily: "'Noto Serif SC', serif", fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, letterSpacing: '0.01em' },
    accent: '#f59e0b',
  },
]

export default function FontPreview() {
  return (
    <div style={{ background: '#0c0f1c', minHeight: '100vh', padding: '48px 40px' }}>
      <style>{GOOGLE_FONTS}</style>

      {/* Page header */}
      <div style={{ marginBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontSize: 13, marginBottom: 6 }}>字体风格预览 · 选一种后告诉我</p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: 11 }}>
          A = 极简科技 &nbsp;|&nbsp; B = 熔岩手感 &nbsp;|&nbsp; C = 高定杂志
        </p>
      </div>

      {/* Three columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        {STYLES.map(s => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Label */}
            <div>
              <div style={{ display: 'inline-block', background: s.accent, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 11, padding: '3px 10px', borderRadius: 4, marginBottom: 8 }}>
                风格 {s.id}
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{s.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src="/lava-icon.png" alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', boxShadow: `0 4px 20px ${s.accent}88` }} />
              <span style={{ ...s.brand, color: '#fff' }}>Lava</span>
            </div>

            {/* H1 slogan */}
            <div>
              <h1 style={{ ...s.h1, background: `linear-gradient(135deg, ${s.accent}, #ef4444, ${s.accent}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                照出你像岩浆一样炽热的所感所想
              </h1>
            </div>

            {/* Body text */}
            <div>
              <p style={{ ...s.body, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Lava 在你刷视频时悄悄感知情绪，在感受的临界点说出你还没意识到的事实。
              </p>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Card mockup */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              {/* Hero */}
              <div style={{ background: 'linear-gradient(145deg,#c94b00,#f97316 45%,#fbbf24)', padding: '14px 16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.82)' }} />
                  <span style={{ ...s.badge, color: 'rgba(255,255,255,0.82)', textTransform: 'uppercase' }}>NEAR YOU</span>
                </div>
                <p style={{ ...s.card, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.2)', margin: 0 }}>
                  你是不是很想吃贵州酸汤鱼了？
                </p>
              </div>
              {/* Body */}
              <div style={{ padding: '12px 15px 14px', background: 'rgba(10,12,24,0.88)' }}>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, margin: '0 0 10px', fontFamily: s.body.fontFamily }}>附近最近的贵州酸汤鱼 ›</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 2, padding: '10px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', color: '#fff', background: '#f97316', fontFamily: s.card.fontFamily, cursor: 'default' }}>爽撮一顿！</button>
                  <button style={{ flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 12, border: 'none', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.32)', fontFamily: s.body.fontFamily, cursor: 'default' }}>再刷刷</button>
                </div>
              </div>
            </div>

            {/* Travel card */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ background: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', padding: '14px 16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.82)' }} />
                  <span style={{ ...s.badge, color: 'rgba(255,255,255,0.82)', textTransform: 'uppercase' }}>TRAVEL</span>
                </div>
                <p style={{ ...s.card, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.2)', margin: 0 }}>
                  贵州凯里等你很久了。
                </p>
              </div>
              <div style={{ padding: '12px 15px 14px', background: 'rgba(10,12,24,0.88)' }}>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, margin: '0 0 10px', fontFamily: s.body.fontFamily }}>深圳 → 凯里南 · 高铁 4.5h ›</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 2, padding: '10px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', color: '#fff', background: '#6366f1', fontFamily: s.card.fontFamily, cursor: 'default' }}>说走就走！</button>
                  <button style={{ flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 12, border: 'none', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.32)', fontFamily: s.body.fontFamily, cursor: 'default' }}>以后再说</button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
