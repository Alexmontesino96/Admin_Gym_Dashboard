import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import RankingsClient from './RankingsClient';

export const metadata: Metadata = {
  title: 'Rankings Anonimos | Activity Feed',
  description: 'Top 10 en diferentes categorias de rendimiento - 100% anonimo',
};

export default async function RankingsPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <RankingsClient />
    </MainLayout>
  );
}
