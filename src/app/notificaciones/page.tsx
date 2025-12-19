import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notificaciones Push | Dashboard',
  description: 'Envía notificaciones push a tus miembros usando OneSignal',
};

export default async function NotificationsPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <NotificationsClient />
    </MainLayout>
  );
}
