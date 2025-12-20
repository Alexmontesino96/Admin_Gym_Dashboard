import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import ActivityFeedClient from './ActivityFeedClient';

export const metadata: Metadata = {
  title: 'Feed de Actividad | Dashboard',
  description: 'Estadisticas anonimas en tiempo real de tu comunidad',
};

export default async function ActivityFeedPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <ActivityFeedClient />
    </MainLayout>
  );
}
