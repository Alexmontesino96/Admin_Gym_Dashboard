import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import AdminTestingClient from './AdminTestingClient';

export const metadata: Metadata = {
  title: 'Testing Admin | Activity Feed',
  description: 'Genera actividades de prueba para el Activity Feed',
};

export default async function AdminTestingPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <AdminTestingClient />
    </MainLayout>
  );
}
