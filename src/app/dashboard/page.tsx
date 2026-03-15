import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RestaurantDashboard from '@/components/RestaurantDashboard';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const user = session.user;
  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';

  return (
    <RestaurantDashboard
      userId={user.id}
      displayName={displayName}
      email={user.email || ''}
    />
  );
}
