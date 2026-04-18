import { NextResponse } from 'next/server'

export const maxDuration = 90

const NEUTRAL = { reasoning: '', hungry: 0, wanderlust: 0, happy: 0, depressed: 0, melancholy: 0, boredom: 3 }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function buildPrompt(watchedSeconds: number) {
  return `你是情绪分析引擎。分析这张短视频截图，用户已观看 ${watchedSeconds} 秒。

请按以下格式输出，先写一句思考，再写 JSON：
思考：[用一句话描述你看到了什么，以及为什么打这些分]
{"hungry":0-10,"wanderlust":0-10,"happy":0-10,"depressed":0-10,"melancholy":0-10,"boredom":0-10}

评分标准：
- hungry: 画面有令人垂涎的食物 → 7-10；无 → 0-2
- wanderlust: 令人向往的风景/旅行 → 7-10；无 → 0-2
- happy: 画面情绪活跃欢快 → 7-10；低沉 → 0-2
- depressed: 画面透露悲伤/失落 → 6-10；正向 → 0-2
- melancholy: 画面氛围压抑/沉闷 → 6-10；明亮 → 0-2
- boredom: 内容单调无趣 → 6-10；有趣 → 0-3`
}

export async function POST(req: Request) {
  try {
    const { imageBase64, watchedSeconds } = await req.json()
    const imgSize = imageBase64?.length ?? 0
    console.log('[vision] imageBase64 size=', imgSize, 'watchedSeconds=', watchedSeconds)
    if (!imageBase64) return NextResponse.json({ ...NEUTRAL, _debug: 'no_image' }, { headers: CORS })

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90000)

    let apiRes: Response
    try {
      console.log('[vision] calling Dashscope fetch...')
      apiRes = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen2.5-vl-7b-instruct',
          max_tokens: 160,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
              { type: 'text', text: buildPrompt(watchedSeconds ?? 0) },
            ],
          }],
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    console.log('[vision] Dashscope status=', apiRes.status)
    if (!apiRes.ok) {
      const errText = await apiRes.text()
      console.error('[vision] Dashscope error body:', errText)
      return NextResponse.json({ ...NEUTRAL, _debug: { status: apiRes.status, errText: errText.slice(0, 200) } }, { headers: CORS })
    }

    const json = await apiRes.json()
    const text: string = json.choices?.[0]?.message?.content?.trim() ?? '{}'
    console.log('[vision] raw LLM output:', text)

    const reasoningMatch = text.match(/思考[：:]\s*(.+?)(?=\n|$)/)
    const reasoning = reasoningMatch?.[1]?.trim() ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const scores = JSON.parse(jsonMatch?.[0] ?? '{}')

    return NextResponse.json({
      reasoning,
      _debug: { imgSize, rawText: text.slice(0, 120) },
      hungry:     clamp(scores.hungry     ?? 0),
      wanderlust: clamp(scores.wanderlust ?? 0),
      happy:      clamp(scores.happy      ?? 0),
      depressed:  clamp(scores.depressed  ?? 0),
      melancholy: clamp(scores.melancholy ?? 0),
      boredom:    clamp(scores.boredom    ?? 3),
    }, { headers: CORS })

  } catch (e: any) {
    console.error('/api/vision error', e)
    return NextResponse.json({ ...NEUTRAL, _debug: { error: e?.message ?? String(e) } }, { headers: CORS })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

function clamp(v: number) { return Math.max(0, Math.min(10, Number(v) || 0)) }
