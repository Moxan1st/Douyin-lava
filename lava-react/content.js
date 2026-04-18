// Lava React — Content Script（self-contained，无任何 import）
// 职责：检测视频切换 + 统计停留时长 + 注入 Lava Card（Shadow DOM）

// 页面加载/刷新时重置积累状态
chrome.runtime.sendMessage({ type: 'RESET_STATE' }).catch(() => {})

// ── 内联 cardRenderer 全量代码 ────────────────────────────────────────────
const LAVA_BASE = 'http://8.218.184.116'

const ACCENT = {
  food:         { hero: 'linear-gradient(145deg,#c94b00,#f97316 45%,#fbbf24)', badge: 'NEAR YOU',  btn: '#f97316' },
  travel:       { hero: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', badge: 'TRAVEL',    btn: '#6366f1' },
  happy:        { hero: 'linear-gradient(145deg,#047857,#10b981 45%,#34d399)', badge: 'MOOD',      btn: '#10b981' },
  depressed_1:  { hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6' },
  depressed_2:  { hero: 'linear-gradient(145deg,#1e40af,#3b82f6 45%,#60a5fa)', badge: 'HI THERE', btn: '#3b82f6' },
  melancholy_1: { hero: 'linear-gradient(145deg,#5b21b6,#7c3aed 45%,#a78bfa)', badge: 'OUTSIDE',  btn: '#7c3aed' },
  melancholy_2: { hero: 'linear-gradient(145deg,#3730a3,#6366f1 45%,#818cf8)', badge: 'TRAVEL',   btn: '#6366f1' },
}

const LABELS = {
  food:         { confirm: '爽撮一顿！',   dismiss: '再刷刷' },
  travel:       { confirm: '说走就走！',   dismiss: '以后再说' },
  happy:        { confirm: '记下来',       dismiss: '继续刷' },
  depressed_1:  { confirm: '谢谢',         dismiss: '没事，继续刷' },
  depressed_2:  { confirm: '知道了',       dismiss: '我没事' },
  melancholy_1: { confirm: '去走走',       dismiss: '待会再说' },
  melancholy_2: { confirm: '说走就走！',   dismiss: '待会再说' },
}

const HOTLINES = [
  { name: '全国心理援助热线', number: '400-161-9995' },
  { name: '北京心理危机研究', number: '010-82951332' },
  { name: '生命热线',         number: '400-821-1215' },
]

function buildPreview(scenario) {
  const row = `display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);`
  const sub = `font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px;`
  const link = `font-size:13px;color:rgba(255,255,255,0.5);font-weight:500;padding:10px 0 0;display:block;cursor:pointer;`

  if (scenario === 'food') return `
    ${[{name:'苗家酸汤鱼（南山路店）',desc:'招牌酸汤鱼',rating:'4.8',dist:'1.2km'},
       {name:'黔味道贵州私房菜',desc:'酸汤牛肉',rating:'4.6',dist:'2.1km'}].map(r => `
      <div style="${row}">
        <div>
          <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.88);">${r.name}</div>
          <div style="${sub}">${r.desc}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px;">
          <div style="font-size:13px;color:#fbbf24;font-weight:600;">★ ${r.rating}</div>
          <div style="${sub}">${r.dist}</div>
        </div>
      </div>`).join('')}
    <span style="${link}">查看完整餐厅 ›</span>`

  if (scenario === 'travel' || scenario === 'melancholy_2') return `
    <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:8px;font-weight:500;">🚄 深圳北 → 贵阳北</div>
    ${[{t:'G2065',d:'08:06',a:'12:30',dur:'4h24m'},{t:'G2075',d:'10:35',a:'15:08',dur:'4h33m'}].map(v => `
      <div style="${row}font-size:13px;">
        <span style="color:#818cf8;font-weight:700;width:52px;">${v.t}</span>
        <span style="color:rgba(255,255,255,0.82);">${v.d} → ${v.a}</span>
        <span style="color:rgba(255,255,255,0.35);">${v.dur}</span>
      </div>`).join('')}
    <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:2px;">
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:3px;">午　西江千户苗寨（凯里周边90min）</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);">傍晚　苗寨夜景 + 风雨桥打卡</div>
    </div>
    <span style="${link}">查看完整行程 ›</span>`

  if (scenario === 'happy') return `
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0;">
      记录这一刻的心情，以后翻出来还是会笑。
    </p>`

  if (scenario === 'depressed_1') return `
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0;">
      情绪是有重量的，允许自己感受它。<br>
      <span style="color:rgba(255,255,255,0.4);font-size:13px;">你不需要假装没事，也不需要马上好起来。</span>
    </p>`

  if (scenario === 'depressed_2') return `
    ${HOTLINES.map(h => `
      <div style="${row}">
        <span style="color:rgba(255,255,255,0.7);font-size:13px;">${h.name}</span>
        <a href="tel:${h.number}" style="color:#93c5fd;font-size:13px;font-family:monospace;text-decoration:none;flex-shrink:0;margin-left:8px;">${h.number}</a>
      </div>`).join('')}
    <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:8px 0 0;">免费拨打 · 7×24小时</p>`

  if (scenario === 'melancholy_1') return `
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0;">
      找个公园，走走，不用想任何事。<br>
      <span style="color:rgba(255,255,255,0.4);font-size:13px;">附近公园 ›</span>
    </p>`

  return `<p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">点击查看完整推荐 ›</p>`
}

function getDetailUrl(scenario, question) {
  const q = encodeURIComponent(question)
  if (scenario === 'food')
    return `${LAVA_BASE}/detail/food?topic=${encodeURIComponent('贵州酸汤鱼')}&question=${q}`
  if (scenario === 'travel' || scenario === 'melancholy_2')
    return `${LAVA_BASE}/detail/travel?topic=${encodeURIComponent('贵州凯里')}&question=${q}`
  return null
}

function handleConfirm(scenario) {
  if (scenario === 'melancholy_1') window.open('https://uri.amap.com/search?keyword=公园', '_blank')
}

function injectDetailOverlay(url) {
  if (document.getElementById('lava-detail-host')) return
  const host = document.createElement('div')
  host.id = 'lava-detail-host'
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;'
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      * { box-sizing:border-box;margin:0;padding:0; }
      .overlay { position:fixed;inset:0;display:flex;flex-direction:column;background:#000;animation:slideUp 0.32s cubic-bezier(0.32,0.72,0,1); }
      .bar { display:flex;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.95);border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0; }
      .back { background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.7);font-size:15px;font-family:-apple-system,sans-serif;display:flex;align-items:center;gap:6px;padding:4px 0; }
      iframe { flex:1;border:none;width:100%;background:#000; }
      @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
    </style>
    <div class="overlay">
      <div class="bar"><button class="back" id="back">← 返回</button></div>
      <iframe src="${url}"></iframe>
    </div>
  `
  shadow.getElementById('back').addEventListener('click', () => host.remove())
}

function injectCard(scenario, question) {
  if (document.getElementById('lava-react-host')) return

  const ac = ACCENT[scenario] ?? ACCENT.food
  const lb = LABELS[scenario] ?? LABELS.food

  const host = document.createElement('div')
  host.id = 'lava-react-host'
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;pointer-events:none;'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      * { box-sizing:border-box;margin:0;padding:0; }
      .backdrop {
        position:fixed;inset:0;background:rgba(0,0,0,0.5);
        pointer-events:auto;animation:fadeIn 0.25s ease;
      }
      .card {
        position:relative;z-index:1;pointer-events:auto;
        width:min(92vw,420px);
        border-radius:24px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,0.15);
        box-shadow:0 24px 80px rgba(0,0,0,0.5);
        animation:popIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
        user-select:none;
        cursor:grab;
      }
      .hero {
        background:${ac.hero};
        padding:16px 20px 22px;
      }
      .handle { display:flex;justify-content:center;padding-bottom:10px; }
      .handle-bar { width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.35); }
      .badge { display:flex;align-items:center;gap:6px;margin-bottom:10px; }
      .badge-dot { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.85); }
      .badge-text {
        font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
        color:rgba(255,255,255,0.85);font-family:-apple-system,sans-serif;
      }
      .question {
        color:#fff;font-size:26px;font-weight:800;line-height:1.25;
        letter-spacing:-0.02em;font-family:-apple-system,sans-serif;
        text-shadow:0 1px 8px rgba(0,0,0,0.2);
      }
      .body {
        padding:16px 20px 24px;
        background:rgba(10,12,24,0.78);
        backdrop-filter:blur(40px);
        -webkit-backdrop-filter:blur(40px);
      }
      .btn-row { display:flex;gap:10px;margin-top:16px; }
      .btn-confirm {
        flex:2;padding:14px;border-radius:14px;font-size:15px;font-weight:700;
        border:none;cursor:pointer;color:#fff;
        background:${ac.btn};
        font-family:-apple-system,sans-serif;transition:transform 0.1s,opacity 0.1s;
      }
      .btn-confirm:active { transform:scale(0.97);opacity:0.9; }
      .btn-dismiss {
        flex:1;padding:14px;border-radius:14px;font-size:13px;
        border:none;cursor:pointer;
        background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);
        font-family:-apple-system,sans-serif;
      }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes popIn {
        from{transform:translateY(120px) scale(0.88);opacity:0}
        to{transform:translateY(0) scale(1);opacity:1}
      }
    </style>

    <div class="backdrop" id="backdrop"></div>
    <div class="card" id="card">
      <div class="hero">
        <div class="handle"><div class="handle-bar"></div></div>
        <div class="badge"><div class="badge-dot"></div><span class="badge-text">${ac.badge}</span></div>
        <p class="question">${question}</p>
      </div>
      <div class="body">
        ${buildPreview(scenario)}
        <div class="btn-row">
          <button class="btn-confirm" id="btn-confirm">${lb.confirm}</button>
          <button class="btn-dismiss" id="btn-dismiss">${lb.dismiss}</button>
        </div>
      </div>
    </div>
  `

  const remove = (animate = false) => {
    if (animate) {
      const card = shadow.getElementById('card')
      card.style.transition = 'transform 0.28s ease, opacity 0.28s ease'
      card.style.transform = `translate(${dragX}px, -180px)`
      card.style.opacity = '0'
      setTimeout(() => host.remove(), 280)
    } else {
      host.remove()
    }
  }
  shadow.getElementById('btn-confirm').onclick = () => {
    const url = getDetailUrl(scenario, question)
    if (url) {
      injectDetailOverlay(url)
    } else {
      handleConfirm(scenario)
      remove()
    }
  }
  shadow.getElementById('btn-dismiss').onclick = () => remove()
  shadow.getElementById('backdrop').onclick = () => remove()

  // ── 拖拽逻辑 ──────────────────────────────────────────────────────────────
  let dragging = false
  let dragX = 0, dragY = 0
  let startPX = 0, startPY = 0

  const card = shadow.getElementById('card')

  card.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return
    dragging = true
    startPX = e.clientX - dragX
    startPY = e.clientY - dragY
    card.style.transition = 'none'
    card.style.cursor = 'grabbing'
    card.setPointerCapture(e.pointerId)
  })

  card.addEventListener('pointermove', e => {
    if (!dragging) return
    dragX = e.clientX - startPX
    dragY = e.clientY - startPY
    card.style.transform = `translate(${dragX}px, ${dragY}px)`
  })

  card.addEventListener('pointerup', () => {
    if (!dragging) return
    dragging = false
    card.style.cursor = ''
    // 向上甩出超过 100px → 消除卡片
    if (dragY < -100) {
      remove(true)
    }
  })
}

// ── 视频切换检测 ──────────────────────────────────────────────────────────
console.log('[CS🌋] content.js loaded, url=', location.href)

let videoEnteredAt = Date.now()
let lastUrl = location.href

function onUrlChange() {
  const now = Date.now()
  const watchedSeconds = (now - videoEnteredAt) / 1000
  console.log('[CS🌋] onUrlChange watchedSeconds=', watchedSeconds.toFixed(1), 'url=', location.href)

  if (watchedSeconds >= 1) {
    console.log('[CS🌋] sending VIDEO_WATCHED watchedSeconds=', Math.round(watchedSeconds))
    chrome.runtime.sendMessage({
      type: 'VIDEO_WATCHED',
      watchedSeconds: Math.round(watchedSeconds),
    }).then(r => console.log('[CS🌋] VIDEO_WATCHED ack=', r))
      .catch(e => console.error('[CS🌋] sendMessage failed', e))
  } else {
    console.log('[CS🌋] skip: watchedSeconds < 1')
  }

  videoEnteredAt = now
  lastUrl = location.href
}

const _pushState = history.pushState.bind(history)
history.pushState = (...args) => {
  _pushState(...args)
  console.log('[CS🌋] pushState detected')
  onUrlChange()
}
window.addEventListener('popstate', () => {
  console.log('[CS🌋] popstate detected')
  onUrlChange()
})

// 兜底：每秒检查 URL（抖音部分页面用 replaceState）
setInterval(() => {
  if (location.href !== lastUrl) {
    console.log('[CS🌋] URL changed via interval, old=', lastUrl, 'new=', location.href)
    onUrlChange()
  }
}, 1000)

// 心跳发送函数
function sendHeartbeat() {
  const watchedSeconds = Math.round((Date.now() - videoEnteredAt) / 1000)
  console.log('[CS🌋] heartbeat watchedSeconds=', watchedSeconds, 'url=', location.href)
  chrome.runtime.sendMessage({
    type: 'VIDEO_WATCHED',
    watchedSeconds,
  }).then(r => console.log('[CS🌋] heartbeat ack=', r))
    .catch(e => console.error('[CS🌋] heartbeat sendMessage failed', e))
  videoEnteredAt = Date.now()
}

// 页面加载 3 秒后立即触发一次，让 popup 马上有反应
setTimeout(sendHeartbeat, 3000)

// 之后每 5 秒一次
setInterval(sendHeartbeat, 5000)

// ── 接收 background 的注入指令 ───────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'INJECT_CARD') injectCard(msg.scenario, msg.question)
  if (msg.type === 'STATE_UPDATE') refreshWidget()
})

// ── 悬浮窗 ────────────────────────────────────────────────────────────────
const DIMS_WIDGET = [
  { key: 'hungry',     label: '馋度',   color: '#fbbf24', max: 35 },
  { key: 'wanderlust', label: '出走欲', color: '#818cf8', max: 40 },
  { key: 'happy',      label: '开心',   color: '#34d399', max: 25 },
  { key: 'depressed',  label: '沮丧',   color: '#60a5fa', max: 42 },
  { key: 'melancholy', label: '压抑',   color: '#a78bfa', max: 44 },
]

let widgetShadow = null
let widgetExpanded = false

function injectWidget() {
  const host = document.createElement('div')
  host.id = 'lava-widget-host'
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483646;'
  document.body.appendChild(host)
  widgetShadow = host.attachShadow({ mode: 'open' })

  widgetShadow.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .fab {
        width: 52px; height: 52px; border-radius: 50%;
        background: rgba(10,12,24,0.85);
        border: none; cursor: grab; padding: 0;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 24px rgba(249,115,22,0.5), 0 0 0 1px rgba(249,115,22,0.2);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .fab:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(249,115,22,0.7), 0 0 0 1px rgba(249,115,22,0.35); }
      .panel {
        position: absolute; bottom: 60px; right: 0;
        width: 272px;
        background: rgba(10,12,24,0.92);
        backdrop-filter: blur(32px);
        -webkit-backdrop-filter: blur(32px);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 20px;
        box-shadow: 0 16px 64px rgba(0,0,0,0.6);
        padding: 16px;
        display: none;
        animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
      }
      .panel.open { display: block; }
      .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .logo-icon {
        width: 22px; height: 22px; flex-shrink: 0;
        object-fit: contain;
        filter: drop-shadow(0 2px 6px rgba(249,115,22,0.5));
      }
      .title {
        font-size: 13px; font-weight: 700;
        color: rgba(255,255,255,0.9);
        font-family: -apple-system, sans-serif;
      }
      .close-btn {
        background: none; border: none; cursor: pointer;
        color: rgba(255,255,255,0.3); font-size: 16px; line-height: 1;
        padding: 2px 4px;
      }
      .reasoning {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px; padding: 8px 10px;
        margin-bottom: 12px; min-height: 36px;
      }
      .reasoning-label {
        font-size: 9px; color: rgba(255,255,255,0.2);
        text-transform: uppercase; letter-spacing: 0.1em;
        margin-bottom: 3px; font-family: -apple-system, sans-serif;
      }
      .reasoning-text {
        font-size: 11px; color: rgba(255,255,255,0.5);
        line-height: 1.5; font-style: italic;
        font-family: -apple-system, sans-serif;
      }
      .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
      .bar-label { font-size: 11px; color: rgba(255,255,255,0.4); width: 44px; flex-shrink: 0; font-family: -apple-system, sans-serif; }
      .bar-track { flex: 1; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
      .bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; width: 0%; }
      .bar-val { font-size: 10px; color: rgba(255,255,255,0.25); width: 22px; text-align: right; flex-shrink: 0; font-family: monospace; }
      .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 12px 0; }
      .toggle-row { display:flex; align-items:center; justify-content:space-between; }
      .toggle-label { font-size:13px; color:rgba(255,255,255,0.7); font-family:-apple-system,sans-serif; font-weight:500; }
      .toggle-sw {
        width:36px; height:20px; border-radius:10px; border:none; cursor:pointer;
        position:relative; transition:background 0.2s; flex-shrink:0;
        background:rgba(255,255,255,0.12);
      }
      .toggle-sw.on { background:linear-gradient(135deg,#f97316,#ef4444); }
      .toggle-sw::after {
        content:''; position:absolute; width:16px; height:16px;
        border-radius:50%; background:#fff; top:2px; left:2px; transition:transform 0.2s;
      }
      .toggle-sw.on::after { transform:translateX(16px); }
      .mock-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }
      .mock-btn {
        padding:7px 4px; border-radius:8px; border:none; cursor:pointer;
        font-size:11px; font-weight:600; font-family:-apple-system,sans-serif;
        background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.6);
        transition:background 0.15s;
      }
      .mock-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }
      @keyframes popIn {
        from { transform: scale(0.85) translateY(12px); opacity: 0; }
        to   { transform: scale(1) translateY(0);       opacity: 1; }
      }
    </style>

    <div class="panel" id="panel">
      <div class="header">
        <div style="display:flex;align-items:center;gap:7px;">
          <img class="logo-icon" src="${chrome.runtime.getURL('icons/logo.png')}" alt="" />
          <span class="title">Lava React</span>
        </div>
        <button class="close-btn" id="close-btn">✕</button>
      </div>

      <div class="reasoning">
        <div class="reasoning-label">AI 正在看</div>
        <div class="reasoning-text" id="reasoning-text">等待分析</div>
      </div>

      ${DIMS_WIDGET.map(d => `
        <div class="bar-row">
          <span class="bar-label">${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill" id="wbar-${d.key}" style="background:${d.color};"></div>
          </div>
          <span class="bar-val" id="wval-${d.key}">0</span>
        </div>`).join('')}

      <div class="divider"></div>

      <div class="toggle-row">
        <span class="toggle-label">Lava card</span>
        <button class="toggle-sw" id="start-btn"></button>
      </div>

      <div class="toggle-row" style="margin-top:10px;">
        <span class="toggle-label">Mock</span>
        <button class="toggle-sw" id="mock-sw"></button>
      </div>

      <div id="mock-grid" style="display:none;">
        <div class="mock-grid">
          <button class="mock-btn" data-scenario="food"        data-q="你是不是很想吃贵州酸汤鱼了？">🍜 美食</button>
          <button class="mock-btn" data-scenario="travel"      data-q="贵州凯里等你很久了">✈️ 旅行</button>
          <button class="mock-btn" data-scenario="happy"       data-q="今天的心情值得记一下">😄 开心</button>
          <button class="mock-btn" data-scenario="depressed_1" data-q="最近是不是有点累了">💙 沮丧1</button>
          <button class="mock-btn" data-scenario="depressed_2" data-q="有时候说出来会好一点">💙 沮丧2</button>
          <button class="mock-btn" data-scenario="melancholy_1" data-q="出去走走吧，不用想太多">🌧 压抑1</button>
          <button class="mock-btn" data-scenario="melancholy_2" data-q="还要让贵州等你多久">🌧 压抑2</button>
        </div>
      </div>
    </div>

    <button class="fab" id="fab">
      <img src="${chrome.runtime.getURL('icons/logo.png')}" style="width:52px;height:52px;object-fit:cover;border-radius:50%;" alt="" />
    </button>
  `

  const panel   = widgetShadow.getElementById('panel')
  const fab     = widgetShadow.getElementById('fab')
  const closeBtn = widgetShadow.getElementById('close-btn')
  const startBtn = widgetShadow.getElementById('start-btn')
  const mockSw   = widgetShadow.getElementById('mock-sw')
  const mockGrid = widgetShadow.getElementById('mock-grid')

  let mockOn = false
  mockSw.addEventListener('click', () => {
    mockOn = !mockOn
    mockSw.classList.toggle('on', mockOn)
    mockGrid.style.display = mockOn ? '' : 'none'
  })

  mockGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-scenario]')
    if (!btn) return
    injectCard(btn.dataset.scenario, btn.dataset.q)
  })

  // ── 悬浮窗拖拽 ───────────────────────────────────────────────────────────
  let wDragX = 0, wDragY = 0, wOriginX = 0, wOriginY = 0, wPointerDown = false, wMoved = false

  fab.addEventListener('pointerdown', e => {
    wPointerDown = true
    wMoved = false
    wOriginX = e.clientX - wDragX
    wOriginY = e.clientY - wDragY
  })

  document.addEventListener('pointermove', e => {
    if (!wPointerDown) return
    const nx = e.clientX - wOriginX
    const ny = e.clientY - wOriginY
    if (!wMoved && (Math.abs(nx - wDragX) > 6 || Math.abs(ny - wDragY) > 6)) wMoved = true
    if (wMoved) {
      wDragX = nx; wDragY = ny
      host.style.transform = `translate(${wDragX}px, ${wDragY}px)`
    }
  })

  document.addEventListener('pointerup', () => {
    if (!wPointerDown) return
    wPointerDown = false
    if (!wMoved) {
      widgetExpanded = !widgetExpanded
      panel.classList.toggle('open', widgetExpanded)
      if (widgetExpanded) refreshWidget()
    }
  })

  closeBtn.onclick = () => { widgetExpanded = false; panel.classList.remove('open') }

  startBtn.onclick = () => {
    const nextPush = !startBtn.classList.contains('on')
    chrome.runtime.sendMessage({ type: 'SET_PUSH_ENABLED', value: nextPush })
      .then(() => refreshWidget())
      .catch(() => {})
  }

  refreshWidget()
}

function refreshWidget() {
  if (!widgetShadow) return
  chrome.runtime.sendMessage({ type: 'GET_STATE' }).then(state => {
    if (!state) return

    const reasoningEl = widgetShadow.getElementById('reasoning-text')
    if (reasoningEl) {
      reasoningEl.textContent = state.reasoning || '等待分析'
    }

    DIMS_WIDGET.forEach(d => {
      const v   = state[d.key] ?? 0
      const pct = Math.min((v / d.max) * 100, 100)
      const fill = widgetShadow.getElementById(`wbar-${d.key}`)
      const val  = widgetShadow.getElementById(`wval-${d.key}`)
      if (fill) fill.style.width = pct + '%'
      if (val)  val.textContent  = Math.round(v)
    })

    const startBtn = widgetShadow.getElementById('start-btn')
    if (startBtn) {
      startBtn.className = state.pushEnabled ? 'toggle-sw on' : 'toggle-sw'
    }
  }).catch(() => {})
}

// 页面加载后注入浮窗
if (document.body) {
  injectWidget()
} else {
  document.addEventListener('DOMContentLoaded', injectWidget)
}

// 浮窗展开时每 3s 刷新一次进度条
setInterval(() => { if (widgetExpanded) refreshWidget() }, 3000)
