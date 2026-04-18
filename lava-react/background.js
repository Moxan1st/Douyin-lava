// Lava React — Service Worker (self-contained, no ES imports)
// 所有 emotionEngine 逻辑内联，状态持久化到 chrome.storage.session

// 所有 AI 调用通过 Next.js 服务端中转，extension 本身不持有任何 API key
const LAVA_SERVER = 'http://8.218.184.116'
const SCREENSHOT_COOLDOWN_MS = 10000
const MIN_WATCH_SECONDS = 2

// ── 内联 emotionEngine 数据 ────────────────────────────────────────────────
let THRESHOLDS = {
  hungry:     { t1: 35 },
  wanderlust: { t1: 40 },
  happy:      { t1: 25 },
  depressed:  { t1: 20, t2: 42 },
  melancholy: { t1: 20, t2: 44 },
}
let state = { hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0, boredom: 0, reasoning: '' }
let triggered = { hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0 }
let mockMode = false
let pushEnabled = false  // 卡片推送开关，默认关闭；感知始终运行
let lastScreenshotAt = 0
let lastImageHash = ''

// ── chrome.storage.session 读写 ───────────────────────────────────────────
async function loadState() {
  const d = await chrome.storage.session.get([
    'state', 'triggered', 'thresholds', 'mockMode', 'pushEnabled', 'lastScreenshotAt', 'lastImageHash',
  ])
  if (d.state)                       state         = d.state
  if (d.triggered)                   triggered     = d.triggered
  if (d.thresholds)                  THRESHOLDS    = d.thresholds
  if (d.mockMode !== undefined)      mockMode      = d.mockMode
  if (d.pushEnabled !== undefined)   pushEnabled   = d.pushEnabled
  if (d.lastScreenshotAt)            lastScreenshotAt = d.lastScreenshotAt
  if (d.lastImageHash)               lastImageHash = d.lastImageHash
}

async function saveState() {
  await chrome.storage.session.set({
    state, triggered, thresholds: THRESHOLDS, mockMode, pushEnabled, lastScreenshotAt, lastImageHash,
  })
}

// ── 消息入口 ──────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg).then(r => sendResponse(r ?? null)).catch(e => {
    console.error('[LavaReact] handleMessage error', e)
    sendResponse(null)
  })
  return true
})

async function handleMessage(msg) {
  await loadState()
  let result

  if (msg.type === 'VIDEO_WATCHED') {
    result = await handleVideoWatched(msg)
  } else if (msg.type === 'GET_STATE') {
    return { ...state, triggered: { ...triggered }, pushEnabled }
  } else if (msg.type === 'SET_PUSH_ENABLED') {
    pushEnabled = msg.value
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE' }).catch(() => {})
    result = { ok: true, pushEnabled }
  } else if (msg.type === 'MOCK_TRIGGER') {
    const events = doMockTrigger(msg.dim)
    if (events.length) await notifyContentScript(events[0])
    result = { ok: true }
  } else if (msg.type === 'SET_MOCK_MODE') {
    mockMode = msg.value
    result = { ok: true }
  } else if (msg.type === 'SET_THRESHOLD') {
    doSetThreshold(msg.dim, msg.value)
    result = { ok: true }
  } else if (msg.type === 'RESET_STATE') {
    state = { hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0, boredom: 0, reasoning: '' }
    triggered = { hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0 }
    lastImageHash = ''
    result = { ok: true }
  }

  await saveState()
  return result
}

// ── 视频停留事件处理 ──────────────────────────────────────────────────────
async function handleVideoWatched({ watchedSeconds }) {
  console.log('[BG🌋] VIDEO_WATCHED received watchedSeconds=', watchedSeconds)

  if (watchedSeconds < MIN_WATCH_SECONDS) {
    console.log('[BG🌋] SKIP: too_short (need >=', MIN_WATCH_SECONDS, ')')
    return { skipped: 'too_short' }
  }

  const now = Date.now()
  const sinceLastShot = now - lastScreenshotAt
  if (sinceLastShot < SCREENSHOT_COOLDOWN_MS) {
    console.log('[BG🌋] SKIP: cooldown (', sinceLastShot, 'ms < ', SCREENSHOT_COOLDOWN_MS, 'ms)')
    return { skipped: 'cooldown' }
  }
  lastScreenshotAt = now

  let scores
  if (mockMode) {
    scores = { hungry: 6, wanderlust: 2, happy: 1, depressed: 0, melancholy: 0, boredom: 2 }
    console.log('[BG🌋] MOCK MODE scores=', JSON.stringify(scores))
  } else {
    try {
      console.log('[BG🌋] capturing screenshot...')
      const imageBase64 = await captureTab()
      console.log('[BG🌋] screenshot OK size=', imageBase64.length, 'chars')

      const newHash = await hashBase64(imageBase64)
      if (newHash === lastImageHash) {
        console.log('[BG🌋] SKIP: duplicate frame, video paused/static')
        await saveState()
        return { skipped: 'duplicate_frame' }
      }
      lastImageHash = newHash

      console.log('[BG🌋] calling vision API watchedSeconds=', watchedSeconds)
      scores = await callVisionAPI(imageBase64, watchedSeconds)
      console.log('[BG🌋] vision API response =>', JSON.stringify(scores))
      if (scores.reasoning) state.reasoning = scores.reasoning
    } catch (e) {
      console.warn('[BG🌋] vision FAILED, neutral fallback', e.message)
      scores = { hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0, boredom: 3 }
    }
  }

  const stateBefore = JSON.stringify(state)
  const events = accumulate(scores, watchedSeconds)
  console.log('[BG🌋] state before=', stateBefore)
  console.log('[BG🌋] state after =', JSON.stringify(state))
  console.log('[BG🌋] triggers=', JSON.stringify(events))

  chrome.runtime.sendMessage({ type: 'STATE_UPDATE' }).catch(() => {})

  if (pushEnabled) {
    for (const event of events) {
      await notifyContentScript(event)
    }
  }

  return { scores, state: { ...state } }
}

// ── 图片指纹（前2000字符足以区分不同帧）────────────────────────────────────
async function hashBase64(b64) {
  const buf = new TextEncoder().encode(b64.slice(0, 2000))
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── 截图 ──────────────────────────────────────────────────────────────────
async function captureTab() {
  // 主动找 douyin/tiktok/localhost tab，避免抓到 DevTools 窗口
  const allTabs = await chrome.tabs.query({ active: true })
  const tab = allTabs.find(t =>
    t.url && (
      t.url.includes('douyin.com') ||
      t.url.includes('tiktok.com') ||
      t.url.includes('localhost:3000') ||
      t.url.includes('8.218.184.116')
    )
  )
  if (!tab?.windowId) throw new Error('no target tab found')
  console.log('[BG🌋] capturing tab url=', tab.url, 'windowId=', tab.windowId)

  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 40 }, dataUrl => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
      resolve(dataUrl.split(',')[1])
    })
  })
}

// ── 调 Vision API（通过 Next.js 服务端中转，key 在服务器端）─────────────
async function callVisionAPI(imageBase64, watchedSeconds) {
  console.log('[BG🌋] POST /api/vision imageSize=', imageBase64.length, 'watchedSeconds=', watchedSeconds)

  const res = await fetch(`${LAVA_SERVER}/api/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, watchedSeconds }),
  })

  console.log('[BG🌋] /api/vision status=', res.status)
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`/api/vision ${res.status}: ${errText.slice(0, 100)}`)
  }

  const scores = await res.json()
  console.log('[BG🌋] vision response =>', JSON.stringify(scores))
  return scores
}

// ── 通知 content.js ───────────────────────────────────────────────────────
async function notifyContentScript(event) {
  const question = QUESTIONS[event.scenario] ?? '你想要什么？'
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    chrome.tabs.sendMessage(tab.id, {
      type: 'INJECT_CARD',
      scenario: event.scenario,
      question,
    })
  } catch (e) {
    console.warn('[LavaReact] notifyContentScript failed', e)
  }
}

const QUESTIONS = {
  food:         '酸汤鱼旁边就有',
  travel:       '凯里等你多久了',
  happy:        '今天挺开心的嘛',
  depressed_1:  '最近有点累了吧',
  depressed_2:  '你不是一个人',
  melancholy_1: '出去透透气吧',
  melancholy_2: '换个地方发呆吧',
}

// ── 内联 emotionEngine 逻辑 ───────────────────────────────────────────────
function accumulate(scores, watchedSeconds) {
  const tw = Math.min(watchedSeconds / 8, 2.0)
  state.boredom = state.boredom * 0.9 + (scores.boredom ?? 0) * 0.1
  const boost = 1 + (state.boredom / 10) * 0.4
  console.log('[BG🌋] accumulate tw=', tw.toFixed(2), 'boost=', boost.toFixed(2))

  const hungry     = scores.hungry     ?? 0
  const wanderlust = scores.wanderlust ?? 0

  // 当前视频是食物/旅行主题时，压制非主线维度的积累速度
  const foodStrength   = Math.max(0, hungry     - 4) / 6  // hungry 5-10 → 0.17-1.0
  const travelStrength = Math.max(0, wanderlust - 4) / 6  // wanderlust 5-10 → 0.17-1.0
  const sidelineScale  = v => Math.max(0.2, 1 - v * 0.8)  // 最低压到 0.2 倍

  const happyScale     = sidelineScale(Math.max(foodStrength, travelStrength))
  const wanderlustSuppression = sidelineScale(foodStrength)   // 食物视频压制出走欲
  const hungrySuppression     = sidelineScale(travelStrength) // 旅行视频压制馋度

  const happyDelta = (scores.happy      ?? 0) * tw * happyScale
  const depDelta   = (scores.depressed  ?? 0) * tw
  const melDelta   = (scores.melancholy ?? 0) * tw

  state.hungry     += hungry     * tw * boost * hungrySuppression
  state.wanderlust += wanderlust * tw * boost * wanderlustSuppression
  state.happy      += happyDelta
  state.depressed  += depDelta
  state.melancholy += melDelta

  // 开心 ↔ 沮丧/压抑 部分互斥：积累其一时另一方衰减（系数 0.5）
  const DECAY = 0.5
  if (happyDelta > 0) {
    state.depressed  = Math.max(0, state.depressed  - happyDelta * DECAY)
    state.melancholy = Math.max(0, state.melancholy - happyDelta * DECAY)
  }
  if (depDelta + melDelta > 0) {
    state.happy = Math.max(0, state.happy - (depDelta + melDelta) * DECAY)
  }

  console.log('[BG🌋] accumulated state =', JSON.stringify(state))
  return checkTriggers(scores)
}

// currentScores：本次帧的原始分，food/travel 触发需当前帧内容匹配
function checkTriggers(currentScores) {
  const events = []

  // hungry：必须当前帧也是食物内容（hungry >= 5）才弹卡
  if (state.hungry >= THRESHOLDS.hungry.t1 && triggered.hungry === 0) {
    if ((currentScores.hungry ?? 0) >= 5) {
      triggered.hungry = 1
      state.hungry = 0
      events.push({ scenario: 'food' })
    }
  }

  // wanderlust：必须当前帧也是旅行内容（wanderlust >= 5）才弹卡
  if (state.wanderlust >= THRESHOLDS.wanderlust.t1 && triggered.wanderlust === 0) {
    if ((currentScores.wanderlust ?? 0) >= 5) {
      triggered.wanderlust = 1
      state.wanderlust = 0
      events.push({ scenario: 'travel' })
    }
  }

  // happy：无内容限制
  if (state.happy >= THRESHOLDS.happy.t1 && triggered.happy === 0) {
    triggered.happy = 1
    state.happy = 0
    events.push({ scenario: 'happy' })
  }

  // depressed/melancholy：两档系统，第一档不归零，继续积累到第二档
  for (const dim of ['depressed', 'melancholy']) {
    const { t1, t2 } = THRESHOLDS[dim]
    if (state[dim] >= t2 && triggered[dim] < 2) {
      triggered[dim] = 2
      state[dim] = 0
      events.push({ scenario: dimToScenario(dim, 2) })
    } else if (state[dim] >= t1 && triggered[dim] === 0) {
      triggered[dim] = 1
      events.push({ scenario: dimToScenario(dim, 1) })
    }
  }

  return events
}

function dimToScenario(dim, tier) {
  const map = {
    hungry:     'food',
    wanderlust: 'travel',
    happy:      'happy',
    depressed:  tier === 1 ? 'depressed_1' : 'depressed_2',
    melancholy: tier === 1 ? 'melancholy_1' : 'melancholy_2',
  }
  return map[dim]
}

function doMockTrigger(dim) {
  const th = THRESHOLDS[dim]
  if (!th) return []
  state[dim] = th.t2 ?? th.t1
  return checkTriggers()
}

function doSetThreshold(dim, value) {
  if (THRESHOLDS[dim]) {
    THRESHOLDS[dim].t1 = value
    if (THRESHOLDS[dim].t2) THRESHOLDS[dim].t2 = value * 2
  }
}
