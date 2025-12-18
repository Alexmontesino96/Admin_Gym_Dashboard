import { auth0 } from "@/lib/auth0";
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import DashboardClient from './DashboardClient';

export default async function Home() {
  const session = await auth0.getSession();

  // Si no hay sesión, redirigir a login
  if (!session) {
    redirect('/login');
  }

  return (
    <MainLayout user={session.user}>
      <DashboardClient />
    </MainLayout>
  );
}
