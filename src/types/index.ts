export type ScenarioType =
  | 'food'
  | 'travel'
  | 'happy'
  | 'depressed_1'   // 沮丧第一档：心理咨询师角度安慰
  | 'depressed_2'   // 沮丧第二档：心理援助热线
  | 'melancholy_1'  // 压抑第一档：出去走走
  | 'melancholy_2'  // 压抑第二档：完整旅行卡片

export interface VideoCardData {
  id: string
  scenario: ScenarioType
  title: string
  author: string
  videoFile: string // filename in /public/videos/
  likes: string
  comments: string
}

export interface FeedItem {
  type: 'video' | 'moment'
  data: VideoCardData | MomentCardData
}

export interface MomentCardData {
  id: string
  scenario: ScenarioType
  question: string // AI生成的灵魂拷问
  confirmLabel: string
  dismissLabel: string
}

export interface Restaurant {
  name: string
  rating: number
  distance: string
  specialty: string
  address: string
}

export interface TrainDeparture {
  train: string   // 车次，如 G2065
  depart: string  // 出发时间 HH:mm
  arrive: string  // 到达时间 HH:mm
  duration: string // 历时，如 4h24m
}

export interface TravelItinerary {
  destination: string
  transport: {
    from: string
    to: string
    duration: string
    tip: string
    departures?: TrainDeparture[]
  }
  days: Array<{
    day: string
    schedule: Array<{ time: string; activity: string }>
  }>
  mustSee: string[]
  mustEat: string[]
}

export interface GenerateRequest {
  scenario: ScenarioType
  topic: string
  phase: 'question' | 'detail'
}

export interface GenerateResponse {
  question?: string
  restaurants?: Restaurant[]
  itinerary?: TravelItinerary
}
