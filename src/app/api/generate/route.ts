import { NextRequest, NextResponse } from 'next/server'
import { generateSoulQuestion, generateRestaurants, generateItinerary } from '@/lib/qwen'
import { MOCK_RESTAURANTS, MOCK_ITINERARY } from '@/lib/mockData'

export async function POST(req: NextRequest) {
  const { scenario, topic, phase } = await req.json()

  try {
    if (phase === 'question') {
      const question = await generateSoulQuestion(topic, scenario)
      return NextResponse.json({ question })
    }

    if (phase === 'detail') {
      if (scenario === 'food') {
        const restaurants = await generateRestaurants(topic)
        return NextResponse.json({ restaurants: restaurants.length > 0 ? restaurants : MOCK_RESTAURANTS })
      }
      if (scenario === 'travel') {
        const itinerary = await generateItinerary(topic)
        return NextResponse.json({ itinerary })
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (err) {
    console.error('Qwen API error:', err)
    // 降级到Mock数据，保证Demo不崩
    if (phase === 'question') {
      const fallback = scenario === 'food'
        ? `你刚刷了好几条${topic}的视频……是不是馋了？`
        : `还要让${topic}等你多久`
      return NextResponse.json({ question: fallback })
    }
    if (scenario === 'food') return NextResponse.json({ restaurants: MOCK_RESTAURANTS })
    return NextResponse.json({ itinerary: MOCK_ITINERARY })
  }
}
