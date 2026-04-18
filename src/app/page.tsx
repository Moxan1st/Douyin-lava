import Feed from '@/components/Feed'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  return (
    <>
      {/* Mobile: full-screen Feed */}
      <div className="lg:hidden w-full h-dvh overflow-hidden bg-black">
        <Feed />
      </div>
      {/* Desktop: landing page with iPhone frame */}
      <div className="hidden lg:block w-full h-dvh bg-[#0c0f1c]">
        <LandingPage />
      </div>
    </>
  )
}
