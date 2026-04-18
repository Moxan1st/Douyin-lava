import TravelDetail from '@/components/detail/TravelDetail'

interface Props {
  searchParams: Promise<{ topic?: string; question?: string }>
}

export default async function TravelDetailPage({ searchParams }: Props) {
  const { topic = '贵州凯里', question = '贵州凯里刷了这么多次了，真的不去一次吗？' } = await searchParams
  return <TravelDetail destination={topic} question={question} />
}
