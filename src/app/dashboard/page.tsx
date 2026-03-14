import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', user.id)
    .single() as { data: { nickname?: string | null; email?: string | null } | null }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-gray-900">안녕하세요 👋</div>
          <p className="text-gray-600 text-lg">
            {profile?.nickname ?? user.email ?? '사용자'}님
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left space-y-3">
          <p className="text-sm text-gray-500 font-medium">로그인 정보</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">이메일</span>
              <span className="text-gray-700">{user.email ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">로그인 방식</span>
              <span className="text-gray-700">카카오</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400">🎉 카카오 로그인 성공!</p>
      </div>
    </main>
  )
}
