import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import LogrosClient from './LogrosClient';

export const metadata: Metadata = {
  title: 'Mis Logros | Gym Admin',
  description: 'Visualiza tus logros y achievements desbloqueados'
};

export default async function LogrosPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <LogrosClient />
    </MainLayout>
  );
}
