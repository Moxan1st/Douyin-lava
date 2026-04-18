import { NextResponse } from 'next/server'
import { generateFoodChat, generateTravelChat } from '@/lib/qwen'
import { MOCK_RESTAURANTS, MOCK_ITINERARY } from '@/lib/mockData'

export async function POST(req: Request) {
  try {
    const { scenario, topic, userMessage, currentData } = await req.json()

    if (scenario === 'food') {
      const restaurants = currentData ?? MOCK_RESTAURANTS
      const result = await generateFoodChat(topic, userMessage, restaurants)
      return NextResponse.json(result)
    }

    if (scenario === 'travel') {
      const itinerary = currentData ?? MOCK_ITINERARY
      const result = await generateTravelChat(topic, userMessage, itinerary)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'unknown scenario' }, { status: 400 })
  } catch (e) {
    console.error('/api/chat error', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
