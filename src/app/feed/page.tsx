import type { Viewport } from 'next'
import Feed from '@/components/Feed'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function FeedPage() {
  return (
    <main className="w-full h-dvh overflow-hidden bg-black">
      <Feed />
    </main>
  )
}
