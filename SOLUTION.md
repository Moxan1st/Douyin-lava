# Lava 🌋 — 核心方案文档（所有Agent执行前必读）

**项目名：Lava**  
**Slogan：照出你心里真实的欲望，然后让它喷发**  
**关键词：镜子**  
**赛道：赛道三｜AI体验：刷到懂你的瞬间**

---

## 产品核心逻辑

Lava 是一面信息流里的镜子——用户刷视频时，镜子在悄悄记录种草行为。当种草积累到临界点，Lava 发出「灵魂拷问」，命名用户还没说出口的欲望。

**触发逻辑：行为信号，非时间信号**
- 用户连续刷到 N 条同主题视频 → 种草临界点 → 插入灵魂拷问卡
- 美食：3条同类视频触发
- 旅游：4条同类视频触发

**两类即时需求：**
1. **即时可满足**（美食）：灵魂拷问 → 确认 → 立刻给附近餐厅
2. **即时不可满足**（旅游）：灵魂拷问 → 确认 → 捕获欲望，存下计划

---

## 两大场景

### 场景一：美食（即时可满足）
- 触发：3条「贵州酸汤鱼」主题视频
- 灵魂拷问：「你刚刷了好几条贵州酸汤的视频……是不是馋了？」
- 确认后：附近Top 3贵州酸汤餐厅 + 评分 + 距离 + 导航
- 按钮：[对！找一家] / [再刷刷]

### 场景二：旅游（即时不可满足·欲望捕获）
- 触发：4条「贵州凯里」主题视频
- 灵魂拷问：「贵州凯里刷了这么多次了，真的不去一次吗？」
- 确认后：2天1夜行程 + 交通方案 + 查高铁/机票按钮 + 存计划
- 按钮：[我想去！] / [以后再说]

---

## 技术栈

- **前端**：Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **AI**：Qwen API（阿里云百炼）— `qwen-plus` 模型
  - Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - Key: `.env.local` 中的 `QWEN_API_KEY`（绝不提交到git）
- **视频**：真实抖音视频（手动下载放入 `public/videos/`）
- **部署**：Zeabur（首选）/ 本地+cloudflared（备选）

---

## 文件结构

```
/lava/
├── SOLUTION.md          ← 本文件（必读）
├── WORKLOG.md           ← 跨Agent工作日志
├── src/app/
│   ├── page.tsx              ← 主Feed页面
│   ├── layout.tsx
│   ├── api/generate/route.ts ← Qwen API
│   └── detail/[type]/page.tsx ← 二级详情页（food/travel）
├── src/components/
│   ├── Feed.tsx              ← 信息流容器
│   ├── VideoCard.tsx         ← 视频卡（含TikTok UI皮肤）
│   └── MomentCard.tsx        ← 灵魂拷问卡片
├── src/lib/
│   ├── qwen.ts               ← Qwen API 封装
│   ├── mockData.ts           ← Mock数据
│   └── triggerLogic.ts       ← 触发逻辑
└── src/types/index.ts
```

---

## Agent 分工

| Agent | 职责 | 读 | 写 |
|-------|------|----|----|
| 架构Agent | 系统设计、代码审查 | SOLUTION.md + WORKLOG.md | WORKLOG.md |
| 前端Agent | UI组件、Feed模拟 | SOLUTION.md | WORKLOG.md |
| 后端Agent | Qwen API、触发逻辑 | SOLUTION.md | WORKLOG.md |
| 测试Agent | 功能验收、Bug追踪 | SOLUTION.md | WORKLOG.md |
