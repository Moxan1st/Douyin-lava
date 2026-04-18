// Lava React — 情绪积累引擎
// 纯计算，无 DOM 依赖，可在 background.js 直接 import

const THRESHOLDS = {
  hungry:      { t1: 35 },
  wanderlust:  { t1: 40 },
  happy:       { t1: 25 },
  depressed:   { t1: 20, t2: 42 },   // 两档阈值
  melancholy:  { t1: 20, t2: 44 },
}

function createEngine() {
  let state = {
    hungry:     0,
    wanderlust: 0,
    happy:      0,
    depressed:  0,
    melancholy: 0,
    boredom:    0,   // EMA平滑，作放大系数
  }

  // 记录每个维度已触发的档位 (0=未触发, 1=触发过T1, 2=触发过T2)
  let triggered = {
    hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0,
  }

  function accumulate(scores, watchedSeconds) {
    // 时间权重：≥8秒满权重(2x)，线性插值
    const tw = Math.min(watchedSeconds / 8, 2.0)

    // boredom 用 EMA 平滑（代表当前无聊状态，不做累积）
    state.boredom = state.boredom * 0.9 + (scores.boredom ?? 0) * 0.1

    // boredom 放大系数：最多 +40%
    const boost = 1 + (state.boredom / 10) * 0.4

    state.hungry     += (scores.hungry     ?? 0) * tw * boost
    state.wanderlust += (scores.wanderlust ?? 0) * tw * boost
    state.happy      += (scores.happy      ?? 0) * tw
    state.depressed  += (scores.depressed  ?? 0) * tw
    state.melancholy += (scores.melancholy ?? 0) * tw

    return checkTriggers()
  }

  function checkTriggers() {
    const events = []

    // 单档维度
    for (const dim of ['hungry', 'wanderlust', 'happy']) {
      const th = THRESHOLDS[dim].t1
      if (state[dim] >= th && triggered[dim] === 0) {
        triggered[dim] = 1
        state[dim] = 0
        events.push({ scenario: dimToScenario(dim, 1) })
      }
    }

    // 两档维度
    for (const dim of ['depressed', 'melancholy']) {
      const { t1, t2 } = THRESHOLDS[dim]
      if (state[dim] >= t2 && triggered[dim] < 2) {
        triggered[dim] = 2
        state[dim] = 0
        events.push({ scenario: dimToScenario(dim, 2) })
      } else if (state[dim] >= t1 && triggered[dim] === 0) {
        triggered[dim] = 1
        events.push({ scenario: dimToScenario(dim, 1) })
        // 注意：第一档触发后不归零，继续积累到第二档
      }
    }

    return events  // 空数组 = 无触发
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

  function getState() {
    return { ...state, triggered: { ...triggered } }
  }

  // 重置某个维度的触发记录（用户关闭卡片后可重新积累）
  function resetTrigger(dim) {
    if (dim in triggered) triggered[dim] = 0
  }

  // Mock 模式：直接把某个维度推到阈值
  function mockTrigger(dim) {
    const th = THRESHOLDS[dim]
    state[dim] = th.t2 ?? th.t1
    return checkTriggers()
  }

  // 降低阈值（demo 调试用）
  function setThreshold(dim, value) {
    if (THRESHOLDS[dim]) {
      THRESHOLDS[dim].t1 = value
      if (THRESHOLDS[dim].t2) THRESHOLDS[dim].t2 = value * 2
    }
  }

  return { accumulate, getState, resetTrigger, mockTrigger, setThreshold }
}

// 单例，background.js 复用同一个实例
const engine = createEngine()
export default engine
