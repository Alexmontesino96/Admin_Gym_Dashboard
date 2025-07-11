import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import MembershipDashboardClient from './MembershipDashboardClient';

export default async function MembershipDashboard() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <MembershipDashboardClient />
    </MainLayout>
  );
} 