import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import MembershipPlansClient from './MembershipPlansClient';

export default async function MembershipPlansPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <MembershipPlansClient />
    </MainLayout>
  );
} 