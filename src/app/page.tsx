import KakaoLoginButton from '@/components/KakaoLoginButton'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <div className="text-5xl font-bold text-gray-900">점고</div>
          <p className="text-gray-500 text-base">직장인 점심 메뉴 추천 서비스</p>
        </div>
        <div className="pt-4">
          <KakaoLoginButton />
        </div>
        <p className="text-xs text-gray-400">
          로그인하면 주변 맛집을 추천받을 수 있어요
        </p>
      </div>
    </main>
  )
}
