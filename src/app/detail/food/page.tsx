import FoodDetail from '@/components/detail/FoodDetail'

interface Props {
  searchParams: Promise<{ topic?: string; question?: string }>
}

export default async function FoodDetailPage({ searchParams }: Props) {
  const { topic = '贵州酸汤鱼', question = '你是不是很想吃贵州酸汤了？' } = await searchParams
  return <FoodDetail topic={topic} question={question} />
}
