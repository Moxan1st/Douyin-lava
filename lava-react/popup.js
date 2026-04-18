// Lava React — Popup 控制面板

const DIMS = [
  { key: 'hungry',     label: '馋度',   color: '#fbbf24', max: 50 },
  { key: 'wanderlust', label: '出走欲', color: '#818cf8', max: 50 },
  { key: 'happy',      label: '开心',   color: '#34d399', max: 35 },
  { key: 'depressed',  label: '沮丧',   color: '#60a5fa', max: 50 },
  { key: 'melancholy', label: '压抑',   color: '#a78bfa', max: 50 },
  { key: 'boredom',    label: '无聊',   color: '#9ca3af', max: 10 },
]

const DEFAULT_THRESHOLDS = {
  hungry: 35, wanderlust: 40, happy: 25, depressed: 20, melancholy: 20,
}

// ── 生成 DOM ──────────────────────────────────────────────────────────────
const barsEl = document.getElementById('bars')
DIMS.forEach(d => {
  barsEl.innerHTML += `
    <div class="bar-row">
      <span class="bar-label">${d.label}</span>
      <div class="bar-track">
        <div class="bar-fill" id="bar-${d.key}" style="width:0%;background:${d.color};"></div>
      </div>
      <span class="bar-value" id="val-${d.key}">0</span>
    </div>`
})

const thEl = document.getElementById('thresholds')
Object.entries(DEFAULT_THRESHOLDS).forEach(([key, val]) => {
  const label = DIMS.find(d => d.key === key)?.label ?? key
  thEl.innerHTML += `
    <div class="threshold-row">
      <span class="threshold-label">${label}</span>
      <input type="range" min="5" max="60" value="${val}" id="th-${key}" />
      <span class="threshold-value" id="thv-${key}">${val}</span>
    </div>`
})

const mockBtnsEl = document.getElementById('mock-btns')
DIMS.filter(d => d.key !== 'boredom').forEach(d => {
  mockBtnsEl.innerHTML += `
    <button class="mock-btn" data-dim="${d.key}">触发 ${d.label}</button>`
})

// ── 事件绑定 ──────────────────────────────────────────────────────────────
let mockOn = false
const mockToggle = document.getElementById('mock-toggle')
mockToggle.addEventListener('click', () => {
  mockOn = !mockOn
  mockToggle.classList.toggle('on', mockOn)
  document.getElementById('mock-section').style.display = mockOn ? '' : 'none'
  chrome.runtime.sendMessage({ type: 'SET_MOCK_MODE', value: mockOn })
})

// 阈值滑块
Object.keys(DEFAULT_THRESHOLDS).forEach(key => {
  const slider = document.getElementById(`th-${key}`)
  const display = document.getElementById(`thv-${key}`)
  slider?.addEventListener('input', () => {
    display.textContent = slider.value
    chrome.runtime.sendMessage({ type: 'SET_THRESHOLD', dim: key, value: Number(slider.value) })
  })
})

// Mock 触发按钮
mockBtnsEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-dim]')
  if (!btn) return
  chrome.runtime.sendMessage({ type: 'MOCK_TRIGGER', dim: btn.dataset.dim })
})

// 重置按钮
document.getElementById('reset-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_STATE' }, () => refreshState())
})

// ── 状态轮询（每秒刷新一次进度条）───────────────────────────────────────
function refreshState() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, state => {
    if (!state) return
    DIMS.forEach(d => {
      const v = state[d.key] ?? 0
      const pct = Math.min((v / d.max) * 100, 100)
      const fill = document.getElementById(`bar-${d.key}`)
      const val  = document.getElementById(`val-${d.key}`)
      if (fill) fill.style.width = pct + '%'
      if (val)  val.textContent = Math.round(v)
    })
    const reasoningEl = document.getElementById('reasoning')
    if (reasoningEl && state.reasoning) {
      reasoningEl.textContent = state.reasoning
    }
  })
}

refreshState()
setInterval(refreshState, 1000)

// 监听 background 主动推送的状态更新
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'STATE_UPDATE') refreshState()
})
