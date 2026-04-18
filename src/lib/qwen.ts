import OpenAI from 'openai'
import { Restaurant, TravelItinerary } from '@/types'

const client = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  timeout: 20000, // 20秒超时，够用且不卡Demo
  maxRetries: 0,
})

export async function generateSoulQuestion(topic: string, scenario: 'food' | 'travel'): Promise<string> {
  const prompt = scenario === 'food'
    ? `为「${topic}」写一句短文案，打在刷视频时突然弹出的卡片上，让人停下来。
感觉：不是劝你吃，是提醒你它就在旁边、唾手可得，近在咫尺的诱惑感。
字数：5-8字。不要问句，不要感叹号，不要"是不是""好不好"。
举例（体会感觉，不要照抄）：「酸汤鱼旁边就有」「那碗面离你三站路」「附近就有一家」
只输出这一句话，不加任何标点符号以外的内容。`
    : `从下面模板中随机选一句，把【地点】替换为「${topic}」中最短的核心词（如"凯里"），直接输出替换后的句子，不加任何其他文字：

模板A：【地点】等你很久了
模板B：还要让【地点】等你多久
模板C：要不要真的去一次【地点】
模板D：还欠【地点】一次
模板E：【地点】还记得你吗

只输出那一句话，不写模板名，不加引号，不加标点以外的任何内容。`

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
  })

  return response.choices[0].message.content?.trim() ?? `你是不是很想去${topic}？`
}

export async function generateRestaurants(topic: string): Promise<Restaurant[]> {
  const prompt = `用户很想吃「${topic}」。请生成3家附近的餐厅推荐，JSON格式：
[
  {
    "name": "餐厅名",
    "rating": 4.8,
    "distance": "1.2km",
    "specialty": "招牌菜1、招牌菜2",
    "address": "具体地址（深圳南山区风格）"
  }
]
只返回JSON数组，不要加任何解释或markdown代码块。`

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  })

  try {
    const text = response.choices[0].message.content?.trim() ?? '[]'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function generateFoodChat(
  topic: string,
  userMessage: string,
  current: Restaurant[]
): Promise<{ reply: string; restaurants: Restaurant[] }> {
  const prompt = `用户正在查看「${topic}」附近餐厅推荐，当前推荐：
${JSON.stringify(current, null, 2)}

用户说：「${userMessage}」

根据用户需求调整推荐，返回JSON（不加markdown代码块）：
{
  "reply": "一句话回应用户（不超过12字）",
  "restaurants": [/* 3家，格式与原数据相同 */]
}`

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  })

  try {
    const text = response.choices[0].message.content?.trim() ?? '{}'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)
    return { reply: data.reply ?? '已更新推荐', restaurants: data.restaurants ?? current }
  } catch {
    return { reply: '已更新推荐', restaurants: current }
  }
}

export async function generateTravelChat(
  destination: string,
  userMessage: string,
  current: TravelItinerary
): Promise<{ reply: string; itinerary: TravelItinerary }> {
  const prompt = `用户正在查看「${destination}」旅行行程，当前行程：
${JSON.stringify(current, null, 2)}

用户说：「${userMessage}」

根据用户需求调整行程，返回JSON（不加markdown代码块）：
{
  "reply": "一句话回应用户（不超过12字）",
  "itinerary": { /* 完整行程，格式与原数据相同，departures字段保留 */ }
}`

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900,
  })

  try {
    const text = response.choices[0].message.content?.trim() ?? '{}'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)
    return { reply: data.reply ?? '行程已调整', itinerary: data.itinerary ?? current }
  } catch {
    return { reply: '行程已调整', itinerary: current }
  }
}

export async function generateItinerary(destination: string): Promise<TravelItinerary> {
  const prompt = `用户想去「${destination}」旅游。请生成一份2天1夜行程，JSON格式：
{
  "destination": "${destination}",
  "transport": {
    "from": "深圳",
    "to": "${destination}",
    "duration": "交通方式和时长描述",
    "tip": "实用交通小贴士",
    "departures": [
      { "train": "车次号", "depart": "HH:mm", "arrive": "HH:mm", "duration": "Xh Xm" },
      { "train": "车次号", "depart": "HH:mm", "arrive": "HH:mm", "duration": "Xh Xm" },
      { "train": "车次号", "depart": "HH:mm", "arrive": "HH:mm", "duration": "Xh Xm" }
    ]
  },
  "days": [
    {
      "day": "D1",
      "schedule": [
        {"time": "午", "activity": "活动描述"}
      ]
    },
    {
      "day": "D2",
      "schedule": [
        {"time": "晨", "activity": "活动描述"}
      ]
    }
  ],
  "mustSee": ["景点1", "景点2", "景点3"],
  "mustEat": ["美食1", "美食2", "美食3", "美食4"]
}
只返回JSON对象，不要加任何解释或markdown代码块。`

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
  })

  try {
    const text = response.choices[0].message.content?.trim() ?? '{}'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      destination,
      transport: { from: '深圳', to: destination, duration: '高铁约5小时', tip: '提前购票' },
      days: [],
      mustSee: [],
      mustEat: [],
    }
  }
}
