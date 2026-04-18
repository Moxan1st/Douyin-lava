# Lava 🌋

**照出你像岩浆一样炽热的所感所想**

> Lava 在你刷视频时悄悄感知情绪，在感受的临界点说出你还没意识到的事实。

抖音黑客松 · 赛道三 · AI体验：刷到懂你的瞬间

🔗 **线上体验：** https://douyin-lava.vercel.app/

🧩 **Chrome 扩展下载：** https://douyin-lava.vercel.app/lava-react.zip

---

## 产品简介

Lava 由两个部分组成：**Lava Card** 是核心交互单元，**Lava React** 是让它运行在真实平台上的感知引擎。

---

### Lava Card · 灵魂拷问卡片

Lava Card 是一种全新的信息流内容单元。它不是推荐，不是广告——它是 AI 在你刷视频的过程中，用一句话命名你还没说出口的欲望，然后在那一刻帮你行动。

**交互流程：**

```
[第一步：灵魂拷问]
「你是不是很想吃贵州酸汤鱼了？」
        [对！就是这个感觉]   [再刷刷]
                ↓
[第二步：即刻行动]
  即时可满足 → 附近餐厅 + 一键导航 + 外卖入口
  即时不可满足 → 行程计划 + 高铁/机票入口 + 收藏
```

**两类即时需求：**

| 类型 | 场景 | 卡片后 |
|------|------|--------|
| **即时可满足** | 想吃贵州酸汤鱼 | 附近 Top 3 餐厅 + 美团/饿了么入口 |
| **即时不可满足** | 想去贵州凯里旅行 | AI 生成 2 天 1 夜行程 + 高铁/机票跳转 |
| **情绪关怀** | 检测到低落 / 惆怅 | 心理援助热线 / 附近公园推荐 |

现有 6 张场景卡覆盖：美食、旅行、开心记录、沮丧陪伴、心理援助、户外透气。

---

### Lava React · 情绪感知 Chrome 扩展

Lava React 是配套的 Chrome 扩展，让 Lava Card 能运行在**真实的抖音 / TikTok** 上，而不只是 Demo 环境。

它通过视觉 AI 实时感知用户正在看什么，在情绪积累到临界点时，自动将 Lava Card 注入页面。

**工作原理：**

```
用户在真实抖音刷视频
    ↓
content.js 监听视频切换，停留 > 4s 截图
    ↓
Qwen VL 分析画面 → 返回情绪分数
    { hungry: 0-10, wanderlust: 0-10, boredom: 0-10 }
    ↓
emotionEngine 时间加权积累（boredom 作放大系数）
    ↓
任一维度超过阈值 → Shadow DOM 注入 Lava Card
    ↓
用户点击确认 → 跳转二级详情页
```

**popup 面板**提供实时情绪进度条可视化 + 阈值调节 + Mock 一键触发（演示保底）。

---

## 项目结构

```
lava/                          # Next.js 主应用
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页（桌面分栏 Landing Page / 移动端全屏 Feed）
│   │   ├── feed/page.tsx      # 纯 Feed 路由（供 iframe 嵌入）
│   │   ├── detail/
│   │   │   ├── food/page.tsx  # 美食二级页
│   │   │   └── travel/page.tsx# 旅行二级页
│   │   └── api/
│   │       ├── generate/      # 灵魂拷问文案生成（Qwen API）
│   │       ├── chat/          # 对话接口
│   │       └── vision/        # 视觉分析接口（Qwen VL，供 Chrome 扩展调用）
│   ├── components/
│   │   ├── LandingPage.tsx    # 桌面端 Landing Page（左右分栏）
│   │   ├── Feed.tsx           # 信息流容器（snap 滚动 + IntersectionObserver）
│   │   ├── VideoCard.tsx      # 视频卡片（含抖音 UI 皮肤）
│   │   └── MomentCard.tsx     # 灵魂拷问卡片
│   ├── lib/
│   │   ├── qwen.ts            # Qwen API 封装（文字 + 视觉）
│   │   └── mockData.ts        # 餐厅 / 行程 Mock 数据
│   └── types/index.ts         # 全局类型定义
└── public/
    ├── videos/                # 本地视频素材（贵州美食 / 凯里旅行）
    └── lava-icon.png          # 品牌图标

lava-react/                    # Chrome 扩展（独立目录）
├── manifest.json              # Manifest V3
├── background.js              # Service Worker（截图 + Qwen VL 调用）
├── content.js                 # 注入脚本（监听抖音 / TikTok）
├── popup.html / popup.js      # 情绪仪表盘 + Mock 开关
└── utils/
    ├── emotionEngine.js       # 情绪积累算法（时间加权 + boredom 放大）
    └── cardRenderer.js        # Shadow DOM 卡片渲染
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16.2（App Router）+ React 19 |
| 样式 | Tailwind CSS + Framer Motion |
| 字体 | Syne + Noto Sans SC（Google Fonts） |
| AI | 阿里云百炼 Qwen API（`qwen-plus` 文字 / `qwen-vl-plus` 视觉） |
| 部署 | Vercel |
| Chrome 扩展 | Manifest V3，纯原生 JS，无打包工具 |

---

## 本地开发

**1. 克隆 & 安装**

```bash
git clone https://github.com/Moxan1st/Douyin-lava.git
cd Douyin-lava
npm install
```

**2. 配置环境变量**

```bash
# .env.local
QWEN_API_KEY=your_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> Key 申请：阿里云百炼平台 → 创建应用 → 获取 API Key

**3. 启动开发服务器**

```bash
npm run dev
# 访问 http://localhost:3000
```

**4. 安装 Chrome 扩展**

**方式一：直接下载 zip（推荐）**

1. 下载：https://douyin-lava.vercel.app/lava-react.zip
2. 解压到本地任意目录
3. 打开 `chrome://extensions`，开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择解压后的 `lava-react/` 目录
5. 看到 Lava 图标出现在 Chrome 工具栏，安装成功

**方式二：从源码加载**

```
chrome://extensions → 开启开发者模式 → 加载已解压的扩展 → 选择仓库内 lava-react/ 目录
```

> ⚠️ 扩展的视觉分析功能依赖本地服务器（`/api/vision`）。完整体验需先运行 `npm run dev`。线上版本（douyin-lava.vercel.app）的扩展功能需将 `LAVA_BASE` 指向 Vercel 地址。

---

## 核心路由

| 路由 | 说明 |
|------|------|
| `/` | 桌面：左右分栏 Landing Page；移动：全屏 Feed |
| `/feed` | 纯全屏 Feed（也是 iframe 嵌入的内容） |
| `/detail/food` | 美食二级页（餐厅推荐 + 外卖入口） |
| `/detail/travel` | 旅行二级页（行程 + 高铁 / 机票入口） |

---

---

## 开发者

**舒畅 / 长发流浪汉**

独立参赛 · AI 辅助开发（Claude Code）· 抖音黑客松 2026
