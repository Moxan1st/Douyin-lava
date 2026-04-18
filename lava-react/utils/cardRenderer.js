// Lava React — Shadow DOM 卡片渲染器
// 完全复制 MomentCard 的设计语言，纯 vanilla JS + 内联 CSS

const LAVA_BASE = 'http://localhost:3000'

const ACCENT = {
  food:        { line: 'rgba(251,191,36,0.7)',  badge: '#fbbf24', btn: 'linear-gradient(135deg,#fbbf24,#f59e0b)', btnText: '#111', label: 'Near You' },
  travel:      { line: 'rgba(129,140,248,0.7)', badge: '#818cf8', btn: 'linear-gradient(135deg,#818cf8,#6366f1)', btnText: '#fff', label: 'Travel' },
  happy:       { line: 'rgba(52,211,153,0.7)',  badge: '#34d399', btn: 'linear-gradient(135deg,#34d399,#10b981)', btnText: '#fff', label: 'Mood' },
  depressed_1: { line: 'rgba(96,165,250,0.6)',  badge: '#60a5fa', btn: 'linear-gradient(135deg,#60a5fa,#3b82f6)', btnText: '#fff', label: 'Hi there' },
  depressed_2: { line: 'rgba(96,165,250,0.6)',  badge: '#60a5fa', btn: 'linear-gradient(135deg,#60a5fa,#3b82f6)', btnText: '#fff', label: 'Hi there' },
  melancholy_1:{ line: 'rgba(167,139,250,0.6)', badge: '#a78bfa', btn: 'linear-gradient(135deg,#a78bfa,#7c3aed)', btnText: '#fff', label: 'Outside' },
  melancholy_2:{ line: 'rgba(167,139,250,0.6)', badge: '#a78bfa', btn: 'linear-gradient(135deg,#a78bfa,#7c3aed)', btnText: '#fff', label: 'Travel' },
}

const LABELS = {
  food:        { confirm: '爽撮一顿！',   dismiss: '再刷刷' },
  travel:      { confirm: '说走就走！',   dismiss: '以后再说' },
  happy:       { confirm: '记下来',       dismiss: '继续刷' },
  depressed_1: { confirm: '谢谢',         dismiss: '没事，继续刷' },
  depressed_2: { confirm: '知道了',       dismiss: '我没事' },
  melancholy_1:{ confirm: '去走走',       dismiss: '待会再说' },
  melancholy_2:{ confirm: '说走就走！',   dismiss: '待会再说' },
}

const HOTLINES = [
  { name: '全国心理援助热线', number: '400-161-9995' },
  { name: '北京心理危机研究', number: '010-82951332' },
  { name: '生命热线',         number: '400-821-1215' },
]

function buildPreview(scenario) {
  const box = `background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:16px;`

  if (scenario === 'happy') return `
    <div style="${box}padding:16px;">
      <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;margin:0;">
        记录这一刻的心情，以后翻出来还是会笑。
      </p>
    </div>`

  if (scenario === 'depressed_1') return `
    <div style="${box}padding:16px;">
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0;">
        情绪是有重量的，允许自己感受它。<br>
        你不需要假装没事，也不需要马上好起来。
      </p>
    </div>`

  if (scenario === 'depressed_2') return `
    <div style="${box}padding:12px 14px;">
      ${HOTLINES.map(h => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:rgba(255,255,255,0.5);font-size:12px;">${h.name}</span>
          <a href="tel:${h.number}" style="color:#93c5fd;font-size:12px;font-family:monospace;text-decoration:none;">${h.number}</a>
        </div>`).join('')}
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:8px 0 0;">免费拨打 · 7×24小时</p>
    </div>`

  if (scenario === 'melancholy_1') return `
    <div style="${box}padding:16px;">
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0;">
        找个公园，走走，不用想任何事。<br>
        <span style="color:rgba(255,255,255,0.3);font-size:12px;">深圳·附近公园</span>
      </p>
    </div>`

  // food / travel / melancholy_2：留给点击后跳转，预览简洁
  return `
    <div style="${box}padding:14px;color:rgba(255,255,255,0.45);font-size:13px;">
      点击查看完整推荐 →
    </div>`
}

function handleConfirm(scenario, question) {
  const q = encodeURIComponent(question)
  switch (scenario) {
    case 'food':
      window.open(`${LAVA_BASE}/detail/food?topic=${encodeURIComponent('贵州酸汤鱼')}&question=${q}`, '_blank')
      break
    case 'travel':
    case 'melancholy_2':
      window.open(`${LAVA_BASE}/detail/travel?topic=${encodeURIComponent('贵州凯里')}&question=${q}`, '_blank')
      break
    case 'happy':
      localStorage.setItem(`lava-mood-${Date.now()}`, JSON.stringify({ mood: 'happy', ts: Date.now() }))
      break
    case 'melancholy_1':
      window.open('https://uri.amap.com/search?keyword=公园&city=深圳', '_blank')
      break
    // depressed_1/2: 热线可直接点 <a href="tel:...">，confirm 只关闭
  }
}

export function injectCard(scenario, question) {
  if (document.getElementById('lava-react-host')) return

  const ac = ACCENT[scenario] ?? ACCENT.food
  const lb = LABELS[scenario] ?? LABELS.food

  const host = document.createElement('div')
  host.id = 'lava-react-host'
  host.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;
    display:flex;align-items:center;justify-content:center;
    pointer-events:none;
  `
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      .backdrop {
        position:fixed;inset:0;background:rgba(0,0,0,0.45);
        pointer-events:auto;animation:fadeIn 0.25s ease;
      }
      .card {
        position:relative;z-index:1;pointer-events:auto;
        width:min(92vw,400px);
        background:rgba(12,15,28,0.68);
        backdrop-filter:blur(48px) saturate(180%);
        -webkit-backdrop-filter:blur(48px) saturate(180%);
        border:1px solid rgba(255,255,255,0.10);
        border-radius:24px;
        box-shadow:0 24px 80px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06);
        overflow:hidden;
        animation:slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1);
        user-select:none;
      }
      .accent-line {
        height:1px;margin:16px 24px 0;
        background:linear-gradient(90deg,transparent,${ac.line},transparent);
      }
      .body { padding:16px 20px 20px; }
      .badge {
        display:flex;align-items:center;gap:6px;margin-bottom:12px;
      }
      .badge-dot {
        width:6px;height:6px;border-radius:50%;background:${ac.badge};
      }
      .badge-text {
        font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;
        color:${ac.badge}bb;
        font-family:-apple-system,sans-serif;
      }
      .question {
        color:#fff;font-size:30px;font-weight:700;line-height:1.2;
        margin:0 0 16px;letter-spacing:-0.02em;
        font-family:-apple-system,sans-serif;
      }
      .btn-row { display:flex;gap:10px; }
      .btn-confirm {
        flex:2;padding:14px;border-radius:12px;font-size:14px;font-weight:700;
        border:none;cursor:pointer;
        background:${ac.btn};color:${ac.btnText};
        font-family:-apple-system,sans-serif;
        transition:transform 0.1s;
      }
      .btn-confirm:active { transform:scale(0.97); }
      .btn-dismiss {
        flex:1;padding:14px;border-radius:12px;font-size:12px;
        border:none;cursor:pointer;
        background:transparent;color:rgba(255,255,255,0.25);
        font-family:-apple-system,sans-serif;
      }
      .handle {
        display:flex;justify-content:center;padding:12px 0 4px;
      }
      .handle-bar {
        width:32px;height:3px;border-radius:2px;background:rgba(255,255,255,0.15);
      }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideUp {
        from{transform:translateY(160px) scale(0.88);opacity:0}
        to{transform:translateY(0) scale(1);opacity:1}
      }
    </style>

    <div class="backdrop" id="backdrop"></div>

    <div class="card">
      <div class="accent-line"></div>
      <div class="body">
        <div class="badge">
          <div class="badge-dot"></div>
          <span class="badge-text">${ac.label}</span>
        </div>
        <p class="question">${question}</p>
        ${buildPreview(scenario)}
        <div class="btn-row">
          <button class="btn-confirm" id="btn-confirm">${lb.confirm}</button>
          <button class="btn-dismiss" id="btn-dismiss">${lb.dismiss}</button>
        </div>
        <div class="handle"><div class="handle-bar"></div></div>
      </div>
    </div>
  `

  const remove = () => host.remove()

  shadow.getElementById('btn-confirm').onclick = () => {
    handleConfirm(scenario, question)
    remove()
  }
  shadow.getElementById('btn-dismiss').onclick = remove
  shadow.getElementById('backdrop').onclick = remove

  // 向上拖拽关闭
  let startY = 0
  const card = shadow.querySelector('.card')
  card.addEventListener('pointerdown', e => { startY = e.clientY })
  card.addEventListener('pointerup', e => {
    if (startY - e.clientY > 80) remove()
  })
}
