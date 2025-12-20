import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import RealtimeStatsClient from './RealtimeStatsClient';

export const metadata: Metadata = {
  title: 'Estadisticas en Tiempo Real | Activity Feed',
  description: 'Visualiza la actividad actual de tu gimnasio en tiempo real',
};

export default async function RealtimeStatsPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <RealtimeStatsClient />
    </MainLayout>
  );
}
