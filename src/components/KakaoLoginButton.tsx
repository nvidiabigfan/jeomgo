'use client'

import { createClient } from '@/lib/supabase'

export default function KakaoLoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    // NEXT_PUBLIC_APP_URL 대신 window.location.origin 사용 → 배포 환경 자동 감지
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo },
    })
    if (error) {
      console.error('카카오 로그인 오류:', error.message)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full max-w-sm px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
      style={{ backgroundColor: '#FEE500', color: '#000000' }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 2C5.582 2 2 4.896 2 8.464c0 2.24 1.338 4.204 3.366 5.354L4.6 17.2a.25.25 0 0 0 .364.284L9.08 14.9c.3.03.607.046.92.046 4.418 0 8-2.896 8-6.482C18 4.896 14.418 2 10 2z"
          fill="#000000"
        />
      </svg>
      카카오로 시작하기
    </button>
  )
}
