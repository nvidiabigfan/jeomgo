import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const kakaoMeta = user.user_metadata

      // users 테이블에 upsert (타입 캐스팅으로 처리)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('users') as any).upsert(
        {
          id: user.id,
          email: user.email ?? null,
          nickname: (kakaoMeta?.name ?? kakaoMeta?.full_name ?? null) as string | null,
          profile_image: (kakaoMeta?.avatar_url ?? kakaoMeta?.picture ?? null) as string | null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
